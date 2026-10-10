import asyncio
from datetime import datetime, timedelta, timezone

from src.core.db.database import async_session_maker
from src.crud import Store
from src.tasks.celery_app import celery_app


async def cleanup_stale_free(store: Store) -> int:
    """Удаляет FREE-слоты в прошлом старше 7 дней.

    7-дневный буфер — административное "окно дыхания" для отладки.
    BOOKED/CANCELLED-слоты в прошлом сохраняются как аудит-история.

    Returns:
        Количество удалённых строк.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    return await store.availability_slot.delete_stale_free(cutoff=cutoff)


async def _run() -> None:
    async with async_session_maker() as session:
        store = Store(session=session)
        await cleanup_stale_free(store=store)
        await session.commit()


@celery_app.task(name="tasks.cleanup_stale_slots")
def cleanup_stale_slots_task() -> None:
    """Celery-обёртка для запуска cleanup из синхронного worker."""
    asyncio.run(_run())
