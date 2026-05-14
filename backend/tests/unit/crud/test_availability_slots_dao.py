import uuid
from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from fastapi import HTTPException

from src.models import SlotSource, SlotStatus
from src.models.enums import UserRole

pytestmark = pytest.mark.asyncio


def _naive(dt: datetime) -> datetime:
    """Strip tzinfo so SQLite (test backend) and PG (prod) comparisons work uniformly.

    SQLite returns naive datetimes from TIMESTAMP columns; PG returns tz-aware.
    Tests assert on the underlying instant, not the tz attribute.
    """
    return dt.replace(tzinfo=None) if dt.tzinfo else dt


@pytest_asyncio.fixture
async def psy_user(store):
    """Создаёт тестового пользователя-психолога и возвращает его id."""
    user = await store.user.add(
        return_model=True,
        email=f"psy-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    return user.id


async def test_add_slot_returns_row(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    ends = starts + timedelta(hours=1)

    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=ends,
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )

    assert slot.id is not None
    assert slot.status == SlotStatus.FREE
    assert _naive(slot.starts_at) == _naive(starts)


async def test_bulk_insert_ignore_conflicts_skips_duplicates(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    rows = [
        {
            "psychologist_id": psy_user,
            "starts_at": starts,
            "ends_at": starts + timedelta(hours=1),
            "status": SlotStatus.FREE,
            "source": SlotSource.TEMPLATE,
        },
        {
            "psychologist_id": psy_user,
            "starts_at": starts,
            "ends_at": starts + timedelta(hours=1),
            "status": SlotStatus.FREE,
            "source": SlotSource.TEMPLATE,
        },
    ]
    created = await store.availability_slot.bulk_insert_ignore_conflicts(rows)
    assert created == 1


async def test_list_in_range_filters_status_and_window(store, psy_user):
    base = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    # Free in range
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=base,
        ends_at=base + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    # Booked in range (must be excluded by status filter)
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=base + timedelta(hours=2),
        ends_at=base + timedelta(hours=3),
        status=SlotStatus.BOOKED,
        source=SlotSource.MANUAL,
    )
    # Free outside range (must be excluded by window)
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=base + timedelta(days=30),
        ends_at=base + timedelta(days=30, hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )

    found = await store.availability_slot.list_in_range(
        psychologist_id=psy_user,
        from_dt=base - timedelta(hours=1),
        to_dt=base + timedelta(hours=4),
        status=SlotStatus.FREE,
    )
    assert len(found) == 1
    assert _naive(found[0].starts_at) == _naive(base)


async def test_unique_constraint_on_psy_starts(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    # @handle_db_errors wraps IntegrityError into HTTPException(409)
    with pytest.raises(HTTPException) as exc_info:
        await store.availability_slot.add(
            psychologist_id=psy_user,
            starts_at=starts,
            ends_at=starts + timedelta(hours=2),
            status=SlotStatus.FREE,
            source=SlotSource.MANUAL,
        )
    assert exc_info.value.status_code == 409


async def test_try_book_returns_psy_id_on_success(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    psy_id = await store.availability_slot.try_book(slot.id)
    assert psy_id == psy_user


async def test_try_book_returns_none_when_not_free(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.BOOKED,
        source=SlotSource.MANUAL,
    )
    assert await store.availability_slot.try_book(slot.id) is None


async def test_try_book_returns_none_for_missing(store):
    assert await store.availability_slot.try_book(uuid.uuid4()) is None


async def test_try_release_returns_true_when_booked(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.BOOKED,
        source=SlotSource.MANUAL,
    )
    assert await store.availability_slot.try_release(slot.id) is True


async def test_try_release_returns_false_when_not_booked(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    assert await store.availability_slot.try_release(slot.id) is False


async def test_try_psy_cancel_checks_ownership_and_status(store, psy_user):
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.BOOKED,
        source=SlotSource.MANUAL,
    )
    # Wrong psy
    assert await store.availability_slot.try_psy_cancel(slot.id, 999999) is False
    # Right psy
    assert await store.availability_slot.try_psy_cancel(slot.id, psy_user) is True
    # Already CANCELLED — second attempt fails
    assert await store.availability_slot.try_psy_cancel(slot.id, psy_user) is False


async def test_delete_stale_free_removes_only_old_free(store, psy_user):
    now = datetime.now(timezone.utc)
    # Old FREE — should be deleted
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=now - timedelta(days=30),
        ends_at=now - timedelta(days=30) + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    # Old BOOKED — must be kept
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=now - timedelta(days=20),
        ends_at=now - timedelta(days=20) + timedelta(hours=1),
        status=SlotStatus.BOOKED,
        source=SlotSource.MANUAL,
    )
    # Future FREE — must be kept
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=now + timedelta(days=10),
        ends_at=now + timedelta(days=10, hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )

    cutoff = now - timedelta(days=7)
    deleted = await store.availability_slot.delete_stale_free(cutoff=cutoff)
    assert deleted == 1


async def test_last_slot_date_returns_latest(store, psy_user):
    base = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=base,
        ends_at=base + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    await store.availability_slot.add(
        psychologist_id=psy_user,
        starts_at=base + timedelta(days=5),
        ends_at=base + timedelta(days=5, hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    last = await store.availability_slot.last_slot_date(psychologist_id=psy_user)
    assert _naive(last) == _naive(base + timedelta(days=5))


async def test_last_slot_date_returns_none_for_empty(store, psy_user):
    last = await store.availability_slot.last_slot_date(psychologist_id=psy_user)
    assert last is None


async def test_set_status_updates_slot(store, psy_user):
    base = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_user,
        starts_at=base,
        ends_at=base + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    await store.availability_slot.set_status(slot.id, SlotStatus.BOOKED)
    refreshed = await store.availability_slot.find_by_id(model_id=slot.id)
    assert refreshed.status == SlotStatus.BOOKED
