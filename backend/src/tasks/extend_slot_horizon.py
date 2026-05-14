import asyncio
from datetime import date, timedelta

from sqlalchemy import select
from src.config import settings
from src.core.db.database import async_session_maker
from src.crud import Store
from src.models import PsychologistWorkingHours
from src.services.availability.slot_generation import (
    SlotGenerationService,
)
from src.tasks.celery_app import celery_app


async def extend_horizon_for_psy(
    store: Store, psychologist_id: int, target: date
) -> int:
    """Расширяет горизонт сгенерированных слотов до target для одного психолога.

    Если у психолога ещё нет слотов — генерирует от today.
    Иначе — от дня после последнего существующего слота.

    Returns:
        Количество созданных слотов.
    """
    last = await store.availability_slot.last_slot_date(
        psychologist_id=psychologist_id
    )
    if last is None:
        from_date = date.today()
    else:
        from_date = last.date() + timedelta(days=1)
    if from_date > target:
        return 0
    service = SlotGenerationService(store=store)
    created, _ = await service.generate_for_range(
        psychologist_id=psychologist_id,
        from_date=from_date,
        to_date=target,
    )
    return created


async def _list_psy_ids_with_template(store: Store) -> list[int]:
    """Возвращает уникальные ID психологов с хотя бы одним активным диапазоном."""
    query = (
        select(PsychologistWorkingHours.psychologist_id)
        .where(PsychologistWorkingHours.is_active.is_(True))
        .distinct()
    )
    result = await store.session.execute(query)
    return [row[0] for row in result.all()]


async def _run() -> None:
    target = date.today() + timedelta(days=settings.SLOT_HORIZON_DAYS)
    async with async_session_maker() as session:
        store = Store(session=session)
        psy_ids = await _list_psy_ids_with_template(store)
        for psy_id in psy_ids:
            try:
                await extend_horizon_for_psy(
                    store=store, psychologist_id=psy_id, target=target
                )
            except Exception:
                # одна ошибка не должна останавливать обработку остальных психологов
                continue
        await session.commit()


@celery_app.task(name="tasks.extend_slot_horizon")
def extend_slot_horizon_task() -> None:
    """Celery-обёртка: ежедневное расширение горизонта слотов."""
    asyncio.run(_run())
