import uuid
from datetime import date, datetime, time, timezone

import pytest
import pytest_asyncio

from src.core.exceptions import SlotRangeTooWideError
from src.models.enums import DayOfWeek, UserRole
from src.services.availability.slot_generation import SlotGenerationService

pytestmark = pytest.mark.asyncio


def _naive(dt: datetime) -> datetime:
    return dt.replace(tzinfo=None) if dt.tzinfo else dt


@pytest_asyncio.fixture
async def psy(store):
    """Psy with default profile (Europe/Moscow, 60-min sessions)."""
    user = await store.user.add(
        return_model=True,
        email=f"psy-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    await store.psychologist.add(
        return_model=False,
        id=user.id,
        first_name="T",
        last_name="P",
        timezone="Europe/Moscow",
        session_duration_minutes=60,
    )
    return user.id


async def test_generate_with_empty_template_creates_nothing(store, psy):
    service = SlotGenerationService(store=store)
    created, skipped = await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 7),
    )
    assert created == 0
    assert skipped == 0


async def test_generate_single_range_mon_9_to_12_makes_3_slots(store, psy):
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(12, 0),
        is_active=True,
    )
    service = SlotGenerationService(store=store)
    # 2026-06-01 is a Monday
    created, skipped = await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    assert created == 3
    assert skipped == 0

    slots = await store.availability_slot.list_in_range(
        psychologist_id=psy,
        from_dt=datetime(2026, 6, 1, tzinfo=timezone.utc),
        to_dt=datetime(2026, 6, 2, tzinfo=timezone.utc),
    )
    # Moscow is UTC+3 (no DST), so 9:00 MSK = 06:00 UTC
    starts = sorted(_naive(s.starts_at) for s in slots)
    assert starts == [
        datetime(2026, 6, 1, 6, 0),
        datetime(2026, 6, 1, 7, 0),
        datetime(2026, 6, 1, 8, 0),
    ]


async def test_generate_two_ranges_same_day_split_shift(store, psy):
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(11, 0),
        is_active=True,
    )
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(14, 0),
        end_time=time(16, 0),
        is_active=True,
    )
    service = SlotGenerationService(store=store)
    created, _ = await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    assert created == 4  # 9, 10, 14, 15


async def test_generate_idempotent_second_call_returns_zero(store, psy):
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(12, 0),
        is_active=True,
    )
    service = SlotGenerationService(store=store)
    await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    created2, skipped2 = await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    assert created2 == 0
    assert skipped2 == 3


async def test_generate_inactive_range_skipped(store, psy):
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(12, 0),
        is_active=False,
    )
    service = SlotGenerationService(store=store)
    created, _ = await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    assert created == 0


async def test_generate_range_too_wide_raises(store, psy):
    service = SlotGenerationService(store=store)
    with pytest.raises(SlotRangeTooWideError):
        await service.generate_for_range(
            psychologist_id=psy,
            from_date=date(2026, 1, 1),
            to_date=date(2026, 12, 31),
        )


async def test_range_shorter_than_duration_makes_zero_slots(store, psy):
    # 90-min duration but only 60-min window
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(9, 30),  # only 30 minutes
        is_active=True,
    )
    service = SlotGenerationService(store=store)
    created, _ = await service.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    assert created == 0
