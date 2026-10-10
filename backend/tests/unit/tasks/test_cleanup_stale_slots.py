import uuid
from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio

from src.models import SlotSource, SlotStatus
from src.models.enums import UserRole
from src.tasks.cleanup_stale_slots import cleanup_stale_free

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def psy(store):
    user = await store.user.add(
        return_model=True,
        email=f"psy-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    return user.id


async def test_cleanup_deletes_only_old_free_slots(store, psy):
    now = datetime.now(timezone.utc)
    # Old FREE — should be deleted
    await store.availability_slot.add(
        psychologist_id=psy,
        starts_at=now - timedelta(days=30),
        ends_at=now - timedelta(days=30) + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    # Old BOOKED — must be kept
    await store.availability_slot.add(
        psychologist_id=psy,
        starts_at=now - timedelta(days=20),
        ends_at=now - timedelta(days=20) + timedelta(hours=1),
        status=SlotStatus.BOOKED,
        source=SlotSource.MANUAL,
    )
    # Future FREE — must be kept
    await store.availability_slot.add(
        psychologist_id=psy,
        starts_at=now + timedelta(days=10),
        ends_at=now + timedelta(days=10, hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    # Recent FREE inside the 7-day buffer — must be kept
    await store.availability_slot.add(
        psychologist_id=psy,
        starts_at=now - timedelta(days=3),
        ends_at=now - timedelta(days=3) + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )

    deleted = await cleanup_stale_free(store=store)
    assert deleted == 1


async def test_cleanup_no_slots_returns_zero(store):
    deleted = await cleanup_stale_free(store=store)
    assert deleted == 0
