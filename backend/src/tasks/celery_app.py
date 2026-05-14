from celery import Celery
from celery.schedules import crontab

from src.config import settings

celery_app = Celery(
    "tasks",
    broker=f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
)

celery_app.autodiscover_tasks(["src.tasks"])

celery_app.conf.timezone = "UTC"
celery_app.conf.beat_schedule = {
    "extend-slot-horizon-daily": {
        "task": "tasks.extend_slot_horizon",
        "schedule": crontab(hour=2, minute=0),
    },
    "cleanup-stale-slots-daily": {
        "task": "tasks.cleanup_stale_slots",
        "schedule": crontab(hour=2, minute=15),
    },
}
