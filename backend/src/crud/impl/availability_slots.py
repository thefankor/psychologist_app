from datetime import datetime
from typing import Sequence
from uuid import UUID

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError
from src.core.exceptions import SlotCollisionError
from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models import AvailabilitySlot, SlotStatus

# Маркеры в тексте ошибки целостности, по которым мы распознаём
# «слот накладывается на другой» и поднимаем доменное SlotCollisionError.
# Покрываем оба бекенда: PG (имя constraint'а) и SQLite (формат UNIQUE-сообщения).
_OVERLAP_CONSTRAINTS = ("no_slot_overlap", "uq_slot_psy_starts")


def _is_overlap_violation(exc: IntegrityError) -> bool:
    msg = str(exc.orig) if exc.orig else str(exc)
    if any(name in msg for name in _OVERLAP_CONSTRAINTS):
        return True
    # SQLite не упоминает имя constraint'а в тексте — матчим по таблице/колонке.
    return (
        "UNIQUE" in msg
        and "psychologist_availability_slots" in msg
        and "starts_at" in msg
    )


class AvailabilitySlotsDAO(BaseDAO):
    """DAO для работы со слотами доступности психолога."""

    model = AvailabilitySlot

    async def add(self, return_model: bool = True, **data):
        """Override BaseDAO.add to map overlap-constraint violations
        to SlotCollisionError. Other integrity errors fall back to the
        generic 409 from @handle_db_errors via the parent class.
        """
        try:
            stmt = insert(self.model).values(**data).returning(self.model)
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none() if return_model else None
        except IntegrityError as exc:
            await self.session.rollback()
            if _is_overlap_violation(exc):
                raise SlotCollisionError() from exc
            raise

    async def flush_with_collision_check(self) -> None:
        """Flush pending changes, mapping overlap violations to SlotCollisionError.

        Used by slot-edit paths (`update_starts_at`) where the row is mutated
        in-place via the ORM and the EXCLUDE constraint check happens at flush.
        """
        try:
            await self.session.flush()
        except IntegrityError as exc:
            await self.session.rollback()
            if _is_overlap_violation(exc):
                raise SlotCollisionError() from exc
            raise

    @handle_db_errors
    async def list_in_range(
        self,
        psychologist_id: int,
        from_dt: datetime,
        to_dt: datetime,
        status: SlotStatus | None = None,
    ) -> Sequence[AvailabilitySlot]:
        """Возвращает слоты психолога в окне [from_dt, to_dt), отсортированные по starts_at."""
        query = (
            select(self.model)
            .where(self.model.psychologist_id == psychologist_id)
            .where(self.model.starts_at >= from_dt)
            .where(self.model.starts_at < to_dt)
            .order_by(self.model.starts_at)
        )
        if status is not None:
            query = query.where(self.model.status == status)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def bulk_insert_ignore_conflicts(self, rows: list[dict]) -> int:
        """Bulk INSERT с ON CONFLICT (psy_id, starts_at) DO NOTHING.

        Используется генератором слотов для идемпотентной материализации.
        Маппит IntegrityError из EXCLUDE-индекса (no_slot_overlap) в
        SlotCollisionError — ON CONFLICT покрывает только UNIQUE, не EXCLUDE,
        так что пересекающаяся строка валит всю пачку.
        """
        if not rows:
            return 0
        stmt = (
            pg_insert(self.model)
            .values(rows)
            .on_conflict_do_nothing(
                index_elements=["psychologist_id", "starts_at"]
            )
            .returning(self.model.id)
        )
        try:
            result = await self.session.execute(stmt)
        except IntegrityError as exc:
            await self.session.rollback()
            if _is_overlap_violation(exc):
                raise SlotCollisionError() from exc
            raise
        return len(list(result.scalars().all()))

    @handle_db_errors
    async def try_book(self, slot_id: UUID) -> int | None:
        """Atomic FREE→BOOKED transition (optimistic locking).

        Single UPDATE ... WHERE status='FREE'. Returns psy_id on success,
        None if the slot wasn't FREE (or doesn't exist).
        """
        stmt = (
            update(self.model)
            .where(self.model.id == slot_id, self.model.status == SlotStatus.FREE)
            .values(status=SlotStatus.BOOKED)
            .returning(self.model.psychologist_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    @handle_db_errors
    async def try_release(self, slot_id: UUID) -> bool:
        """Atomic BOOKED→FREE transition (client cancellation).

        Returns True iff a row matched (slot was BOOKED). False indicates a
        race — typically the psy just cancelled the slot.
        """
        stmt = (
            update(self.model)
            .where(self.model.id == slot_id, self.model.status == SlotStatus.BOOKED)
            .values(status=SlotStatus.FREE)
        )
        result = await self.session.execute(stmt)
        return (result.rowcount or 0) > 0

    @handle_db_errors
    async def try_psy_cancel(self, slot_id: UUID, psychologist_id: int) -> bool:
        """Atomic BOOKED→CANCELLED transition for the slot's owner.

        Returns True iff a row matched (slot was BOOKED and owned by psy).
        False is ambiguous; caller resolves via a follow-up SELECT.
        """
        stmt = (
            update(self.model)
            .where(
                self.model.id == slot_id,
                self.model.psychologist_id == psychologist_id,
                self.model.status == SlotStatus.BOOKED,
            )
            .values(status=SlotStatus.CANCELLED)
        )
        result = await self.session.execute(stmt)
        return (result.rowcount or 0) > 0

    @handle_db_errors
    async def set_status(self, slot_id: UUID, status: SlotStatus) -> None:
        """Утилитарный метод для тестов и админ-операций. Безмолвно игнорирует
        отсутствующий ID. Не использовать в основном потоке — там try_book/
        try_release/try_psy_cancel дают атомарность.
        """
        slot = await self.session.get(self.model, slot_id)
        if slot is None:
            return
        slot.status = status

    @handle_db_errors
    async def delete_stale_free(self, cutoff: datetime) -> int:
        """Удаляет FREE-слоты со starts_at < cutoff. Используется cleanup-задачей."""
        stmt = delete(self.model).where(
            self.model.status == SlotStatus.FREE,
            self.model.starts_at < cutoff,
        )
        result = await self.session.execute(stmt)
        return result.rowcount or 0

    @handle_db_errors
    async def last_slot_date(self, psychologist_id: int) -> datetime | None:
        """Возвращает starts_at последнего по времени слота или None."""
        query = select(func.max(self.model.starts_at)).where(
            self.model.psychologist_id == psychologist_id
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    @handle_db_errors
    async def find_overlapping(
        self,
        psychologist_id: int,
        starts_at: datetime,
        ends_at: datetime,
        exclude_id: UUID | None = None,
    ) -> list[AvailabilitySlot]:
        """Слоты, чьи интервалы пересекаются с [starts_at, ends_at).

        Используется только генератором для pre-filter оптимизации.
        Корректность гарантирована EXCLUDE-индексом no_slot_overlap на БД.
        """
        query = (
            select(self.model)
            .where(self.model.psychologist_id == psychologist_id)
            .where(self.model.starts_at < ends_at)
            .where(self.model.ends_at > starts_at)
        )
        if exclude_id is not None:
            query = query.where(self.model.id != exclude_id)
        result = await self.session.execute(query)
        return list(result.scalars().all())
