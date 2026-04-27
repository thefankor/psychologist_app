from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_psychologist_id
from src.schemas.working_hours import WorkingHoursSchema, WorkingHoursUpdate
from src.services.working_hours_service import WorkingHoursService

router = APIRouter(tags=["Psychologists Working Hours"])


@router.get(
    "/",
    summary="Get working hours",
    description="Получить расписание рабочих часов психолога (всегда 7 дней)",
)
async def get_working_hours(
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: WorkingHoursService = Depends(),
) -> list[WorkingHoursSchema]:
    return await service.get_working_hours(psychologist_id=current_psychologist)


@router.put(
    "/",
    summary="Update working hours",
    description="Обновить расписание рабочих часов психолога",
)
async def update_working_hours(
    items: list[WorkingHoursUpdate],
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: WorkingHoursService = Depends(),
) -> list[WorkingHoursSchema]:
    return await service.update_working_hours(
        psychologist_id=current_psychologist, items=items
    )
