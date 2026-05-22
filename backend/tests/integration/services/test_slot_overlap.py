"""Тесты на детекцию пересечений интервалов слотов.

Корректность гарантируется Postgres-ограничением `no_slot_overlap`
(EXCLUDE USING gist на tstzrange). На SQLite это ограничение не существует,
поэтому большинство тестов в этом модуле помечены `requires_postgres`.

Тест на pre-filter генератора (`test_generator_skips_overlapping_with_existing`)
проверяет приложенческую оптимизацию и работает на обоих бекендах.
"""

import uuid
from datetime import date, datetime, time, timezone

import pytest
import pytest_asyncio

from src.core.exceptions import SlotCollisionError
from src.models import SlotStatus
from src.models.enums import DayOfWeek, UserRole
from src.services.availability.slot_generation import SlotGenerationService
from src.services.availability.slot_management import SlotManagementService
from tests.utils import requires_postgres

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def psy(store):
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


async def _change_duration(store, psy_id, minutes: int):
    await store.psychologist.update(
        model_id=psy_id,
        return_model=False,
        session_duration_minutes=minutes,
    )


@requires_postgres
async def test_create_one_off_rejects_overlap_after_duration_change(store, psy):
    """09:00-10:00 (60min) exists, then duration→90, new at 09:30 (90min) overlaps."""
    service = SlotManagementService(store=store)
    await service.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc),
    )
    await _change_duration(store, psy, 90)
    with pytest.raises(SlotCollisionError):
        await service.create_one_off(
            psychologist_id=psy,
            starts_at=datetime(2026, 6, 1, 9, 30, tzinfo=timezone.utc),
        )


async def test_create_one_off_allows_back_to_back(store, psy):
    """09:00-10:00 and 10:00-11:00 must not be flagged as overlap."""
    service = SlotManagementService(store=store)
    await service.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc),
    )
    # 10:00 starts exactly when 09:00-slot ends — half-open intervals: not overlap.
    await service.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 10, 0, tzinfo=timezone.utc),
    )


@requires_postgres
async def test_patch_rejects_overlap_with_other_slot(store, psy):
    """Two slots; patching one onto the other's interval is rejected."""
    service = SlotManagementService(store=store)
    s1 = await service.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc),
    )
    await service.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 11, 0, tzinfo=timezone.utc),
    )
    # Try to move s1 to 10:30 — would be 10:30-11:30, overlaps 11:00-12:00 slot.
    with pytest.raises(SlotCollisionError):
        await service.update_starts_at(
            psychologist_id=psy,
            slot_id=s1.id,
            new_starts_at=datetime(2026, 6, 1, 10, 30, tzinfo=timezone.utc),
        )


@requires_postgres
async def test_cancelled_slot_still_blocks_overlap(store, psy):
    """CANCELLED slots intentionally retain their time; psy can't book over them."""
    service = SlotManagementService(store=store)
    slot = await service.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc),
    )
    await store.availability_slot.set_status(slot.id, SlotStatus.CANCELLED)
    with pytest.raises(SlotCollisionError):
        await service.create_one_off(
            psychologist_id=psy,
            starts_at=datetime(2026, 6, 1, 9, 30, tzinfo=timezone.utc),
        )


async def test_generator_skips_overlapping_with_existing(store, psy):
    """If a 90-min one-off exists at 09:30, generator (60-min slots from template)
    must skip 09:00 (would overlap) and 10:00 (would overlap) — but keep 11:00.
    """
    # Pre-existing 90-min slot at 09:30 → 11:00 (set duration=90 first)
    await _change_duration(store, psy, 90)
    mgmt = SlotManagementService(store=store)
    await mgmt.create_one_off(
        psychologist_id=psy,
        starts_at=datetime(2026, 6, 1, 6, 30, tzinfo=timezone.utc),
        # UTC 06:30 = MSK 09:30
    )
    # Now back to 60min and a template covering 09:00–12:00 local
    await _change_duration(store, psy, 60)
    await store.working_hours.add(
        return_model=False,
        psychologist_id=psy,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(12, 0),
        is_active=True,
    )
    gen = SlotGenerationService(store=store)
    created, skipped = await gen.generate_for_range(
        psychologist_id=psy,
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 1),
    )
    # Candidates: 09:00, 10:00, 11:00 (MSK) = 06:00, 07:00, 08:00 (UTC).
    # Existing slot is 06:30-08:00 UTC. Overlaps with 06:00-07:00 and 07:00-08:00
    # but not 08:00-09:00. So 1 should be created, 2 skipped.
    assert created == 1
    assert skipped == 2
