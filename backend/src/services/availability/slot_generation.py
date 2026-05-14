from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import Depends
from src.core.dependencies import get_store
from src.core.exceptions import SlotRangeTooWideError
from src.crud import Store
from src.models import SlotSource, SlotStatus
from src.models.enums import DayOfWeek

_DAY_OF_WEEK_BY_INDEX = {
    0: DayOfWeek.MONDAY,
    1: DayOfWeek.TUESDAY,
    2: DayOfWeek.WEDNESDAY,
    3: DayOfWeek.THURSDAY,
    4: DayOfWeek.FRIDAY,
    5: DayOfWeek.SATURDAY,
    6: DayOfWeek.SUNDAY,
}

MAX_GENERATION_RANGE_DAYS = 180


class SlotGenerationService:
    """Сервис материализации слотов из недельного шаблона психолога.

    Берёт активные диапазоны шаблона, перебирает дни в указанном окне,
    режет каждый диапазон на слоты длиной session_duration_minutes
    из профиля психолога, конвертирует локальное время в UTC
    через psy.timezone и вставляет с ON CONFLICT DO NOTHING
    """

    def __init__(self, store: Store = Depends(get_store)):
        self._store = store

    async def generate_for_range(
        self,
        psychologist_id: int,
        from_date: date,
        to_date: date,
    ) -> tuple[int, int]:
        """Создаёт FREE-слоты в диапазоне [from_date, to_date] (включительно).

        Returns:
            (created, skipped): сколько вставлено и сколько пропущено
            из-за конфликта на (psychologist_id, starts_at).

        Raises:
            SlotRangeTooWideError: если to_date - from_date > MAX_GENERATION_RANGE_DAYS.
        """
        if (to_date - from_date).days > MAX_GENERATION_RANGE_DAYS:
            raise SlotRangeTooWideError()

        profile = await self._store.psychologist.find_by_id(
            model_id=psychologist_id
        )
        if profile is None:
            return 0, 0

        tz = ZoneInfo(profile.timezone)
        duration = timedelta(minutes=profile.session_duration_minutes)

        template_rows = await self._store.working_hours.get_active(
            psychologist_id=psychologist_id
        )
        if not template_rows:
            return 0, 0

        # group by day_of_week
        ranges_by_day: dict[DayOfWeek, list] = {}
        for r in template_rows:
            ranges_by_day.setdefault(r.day_of_week, []).append(r)

        rows_to_insert: list[dict] = []
        for offset in range((to_date - from_date).days + 1):
            d = from_date + timedelta(days=offset)
            dow = _DAY_OF_WEEK_BY_INDEX[d.weekday()]
            for r in ranges_by_day.get(dow, []):
                start_local = datetime.combine(d, r.start_time, tzinfo=tz)
                window_end_local = datetime.combine(d, r.end_time, tzinfo=tz)
                t = start_local
                while t + duration <= window_end_local:
                    rows_to_insert.append(
                        {
                            "psychologist_id": psychologist_id,
                            "starts_at": t.astimezone(timezone.utc),
                            "ends_at": (t + duration).astimezone(timezone.utc),
                            "status": SlotStatus.FREE,
                            "source": SlotSource.TEMPLATE,
                        }
                    )
                    t += duration

        if not rows_to_insert:
            return 0, 0

        total_candidates = len(rows_to_insert)

        # Отфильтровываем кандидатов, пересекающихся с уже существующими слотами.
        # Это покрывает случай, когда у психолога меняется session_duration_minutes
        # или есть одноразовые слоты с другой длительностью: ON CONFLICT по
        # (psy, starts_at) ловит только точное совпадение времени начала.
        min_start = min(r["starts_at"] for r in rows_to_insert)
        max_end = max(r["ends_at"] for r in rows_to_insert)
        existing = await self._store.availability_slot.find_overlapping(
            psychologist_id=psychologist_id,
            starts_at=min_start,
            ends_at=max_end,
        )
        if existing:
            # SQLite в тестах возвращает naive datetime; PG — aware. Нормализуем
            # к одному виду для безопасного сравнения.
            def _strip_tz(dt: datetime) -> datetime:
                return dt.replace(tzinfo=None) if dt.tzinfo else dt

            existing_intervals = [
                (_strip_tz(ex.starts_at), _strip_tz(ex.ends_at))
                for ex in existing
            ]
            rows_to_insert = [
                r
                for r in rows_to_insert
                if not any(
                    ex_s < _strip_tz(r["ends_at"])
                    and ex_e > _strip_tz(r["starts_at"])
                    for ex_s, ex_e in existing_intervals
                )
            ]

        if not rows_to_insert:
            return 0, total_candidates
        created = await self._store.availability_slot.bulk_insert_ignore_conflicts(
            rows_to_insert
        )
        # skipped = отброшено как пересекающее + отброшено ON CONFLICT по starts_at
        return created, total_candidates - created
