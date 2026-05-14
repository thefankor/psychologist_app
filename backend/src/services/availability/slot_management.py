from datetime import datetime, timedelta
from uuid import UUID

from fastapi import Depends
from src.core.dependencies import get_store
from src.core.exceptions import (
    NotSlotOwnerError,
    SlotCollisionError,
    SlotNotFoundError,
    SlotNotFreeError,
)
from src.crud import Store
from src.models import AvailabilitySlot, SlotSource, SlotStatus


class SlotManagementService:
    """Управление одноразовыми слотами психологом (CRUD).

    Создание выполняет pre-check на коллизию (одинаковый starts_at у того же psy),
    чтобы превратить ошибку уникальности БД в семантическое
    SlotCollisionError на уровне приложения.
    """

    def __init__(self, store: Store = Depends(get_store)):
        self._store = store

    async def create_one_off(
        self, psychologist_id: int, starts_at: datetime
    ) -> AvailabilitySlot:
        """Создаёт одноразовый MANUAL-слот длительностью из профиля психолога.

        Защита от пересечений интервалов — на уровне БД через EXCLUDE-индекс
        no_slot_overlap; DAO ловит ошибку и поднимает SlotCollisionError.
        """
        profile = await self._store.psychologist.find_by_id(
            model_id=psychologist_id
        )
        duration = timedelta(minutes=profile.session_duration_minutes)
        slot = await self._store.availability_slot.add(
            return_model=True,
            psychologist_id=psychologist_id,
            starts_at=starts_at,
            ends_at=starts_at + duration,
            status=SlotStatus.FREE,
            source=SlotSource.MANUAL,
        )
        return slot

    async def update_starts_at(
        self,
        psychologist_id: int,
        slot_id: UUID,
        new_starts_at: datetime,
    ) -> AvailabilitySlot:
        """Изменяет время начала FREE-слота. Сохраняет исходную длительность.

        Защита от пересечений — на уровне БД (EXCLUDE no_slot_overlap).
        DAO конвертирует IntegrityError в SlotCollisionError.
        """
        slot = await self._fetch_owned(psychologist_id, slot_id)
        if slot.status != SlotStatus.FREE:
            raise SlotNotFreeError()

        duration = slot.ends_at - slot.starts_at
        slot.starts_at = new_starts_at
        slot.ends_at = new_starts_at + duration
        await self._store.availability_slot.flush_with_collision_check()
        return slot

    async def delete(
        self, psychologist_id: int, slot_id: UUID
    ) -> None:
        """Удаляет FREE-слот.

        Для BOOKED-слотов используйте `BookingService.cancel_by_psy`.
        """
        slot = await self._fetch_owned(psychologist_id, slot_id)
        if slot.status != SlotStatus.FREE:
            raise SlotNotFreeError()
        await self._store.session.delete(slot)
        await self._store.session.flush()

    async def _fetch_owned(
        self, psychologist_id: int, slot_id: UUID
    ) -> AvailabilitySlot:
        slot = await self._store.session.get(AvailabilitySlot, slot_id)
        if slot is None:
            raise SlotNotFoundError()
        if slot.psychologist_id != psychologist_id:
            raise NotSlotOwnerError()
        return slot
