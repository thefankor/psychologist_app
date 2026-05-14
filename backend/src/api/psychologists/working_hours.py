from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_psychologist_id
from src.schemas.working_hours import (
    ReplaceTemplateRequest,
    TemplateRangeSchema,
)
from src.services.working_hours_service import WorkingHoursService

router = APIRouter(tags=["Psychologists Template"])


@router.get(
    "/",
    summary="Получить шаблон недели",
    description="Возвращает все диапазоны недельного шаблона психолога.",
)
async def get_template(
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: WorkingHoursService = Depends(),
) -> list[TemplateRangeSchema]:
    rows = await service.get_template(psychologist_id=current_psychologist)
    return [TemplateRangeSchema.model_validate(r) for r in rows]


@router.put(
    "/",
    summary="Заменить шаблон недели",
    description=(
        "Атомарно заменяет шаблон. Не затрагивает уже сгенерированные слоты — "
        "для применения изменений вызовите /slots/generate."
    ),
)
async def replace_template(
    body: ReplaceTemplateRequest,
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: WorkingHoursService = Depends(),
) -> list[TemplateRangeSchema]:
    rows = await service.replace_template(
        psychologist_id=current_psychologist,
        ranges=body.ranges,
    )
    return [TemplateRangeSchema.model_validate(r) for r in rows]
