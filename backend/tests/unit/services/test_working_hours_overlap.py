import uuid
from datetime import time

import pytest
import pytest_asyncio

from src.core.exceptions import TemplateRangeOverlapError
from src.models.enums import DayOfWeek, UserRole
from src.schemas.working_hours import TemplateRangeInput
from src.services.working_hours_service import WorkingHoursService

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def psy(store):
    user = await store.user.add(
        return_model=True,
        email=f"psy-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    return user.id


async def test_replace_with_two_non_overlapping_ranges_same_day_ok(store, psy):
    service = WorkingHoursService(store=store)
    await service.replace_template(
        psychologist_id=psy,
        ranges=[
            TemplateRangeInput(
                day_of_week=DayOfWeek.MONDAY,
                start_time=time(9, 0),
                end_time=time(12, 0),
            ),
            TemplateRangeInput(
                day_of_week=DayOfWeek.MONDAY,
                start_time=time(14, 0),
                end_time=time(18, 0),
            ),
        ],
    )
    rows = await store.working_hours.get_by_psychologist(psychologist_id=psy)
    assert len(rows) == 2


async def test_replace_with_overlapping_same_day_raises(store, psy):
    service = WorkingHoursService(store=store)
    with pytest.raises(TemplateRangeOverlapError):
        await service.replace_template(
            psychologist_id=psy,
            ranges=[
                TemplateRangeInput(
                    day_of_week=DayOfWeek.MONDAY,
                    start_time=time(9, 0),
                    end_time=time(13, 0),
                ),
                TemplateRangeInput(
                    day_of_week=DayOfWeek.MONDAY,
                    start_time=time(12, 0),
                    end_time=time(14, 0),
                ),
            ],
        )


async def test_replace_is_atomic_replacement(store, psy):
    service = WorkingHoursService(store=store)
    await service.replace_template(
        psychologist_id=psy,
        ranges=[
            TemplateRangeInput(
                day_of_week=DayOfWeek.MONDAY,
                start_time=time(9, 0),
                end_time=time(12, 0),
            ),
        ],
    )
    # Replace with a single Tuesday range
    await service.replace_template(
        psychologist_id=psy,
        ranges=[
            TemplateRangeInput(
                day_of_week=DayOfWeek.TUESDAY,
                start_time=time(10, 0),
                end_time=time(11, 0),
            ),
        ],
    )
    rows = await store.working_hours.get_by_psychologist(psychologist_id=psy)
    assert len(rows) == 1
    assert rows[0].day_of_week == DayOfWeek.TUESDAY


async def test_replace_different_days_allowed(store, psy):
    service = WorkingHoursService(store=store)
    await service.replace_template(
        psychologist_id=psy,
        ranges=[
            TemplateRangeInput(
                day_of_week=DayOfWeek.MONDAY,
                start_time=time(9, 0),
                end_time=time(12, 0),
            ),
            TemplateRangeInput(
                day_of_week=DayOfWeek.TUESDAY,
                start_time=time(9, 0),
                end_time=time(12, 0),
            ),
        ],
    )
    rows = await store.working_hours.get_by_psychologist(psychologist_id=psy)
    assert len(rows) == 2
