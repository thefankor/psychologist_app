from datetime import date, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from src.core.dependencies import get_current_psychologist_id, get_store
from src.crud import Store
from src.models.enums.slots import SlotStatus
from src.schemas.availability import (
    AvailabilitySlotSchema,
    CancelSlot,
    CreateSlot,
    GenerateSlotsResponse,
    UpdateSlot,
)
from src.services.availability.booking import BookingService
from src.services.availability.slot_generation import (
    SlotGenerationService,
)
from src.services.availability.slot_management import (
    SlotManagementService,
)

router = APIRouter(tags=["Psychologists Slots"])


@router.get(
    "/",
    summary="Список моих слотов",
    description="Возвращает слоты психолога в указанном окне с опц. фильтром по статусу.",
)
async def list_my_slots(
    from_dt: datetime = Query(..., description="Нижняя граница окна (вкл.)"),
    to_dt: datetime = Query(..., description="Верхняя граница окна (искл.)"),
    status_filter: SlotStatus | None = Query(None, alias="status"),
    psy_id: int = Depends(get_current_psychologist_id),
    store: Store = Depends(get_store),
) -> list[AvailabilitySlotSchema]:
    slots = await store.availability_slot.list_in_range(
        psychologist_id=psy_id,
        from_dt=from_dt,
        to_dt=to_dt,
        status=status_filter,
    )
    return [AvailabilitySlotSchema.model_validate(s) for s in slots]


@router.post(
    "/",
    summary="Создать одноразовый слот",
    description="Создаёт MANUAL-слот с длительностью из профиля психолога.",
)
async def create_slot(
    body: CreateSlot,
    psy_id: int = Depends(get_current_psychologist_id),
    service: SlotManagementService = Depends(),
) -> AvailabilitySlotSchema:
    slot = await service.create_one_off(
        psychologist_id=psy_id, starts_at=body.starts_at
    )
    return AvailabilitySlotSchema.model_validate(slot)


@router.post(
    "/generate",
    summary="Сгенерировать слоты из шаблона",
    description=(
        "Материализует активный шаблон в FREE-слоты для указанного диапазона дат. "
        "Идемпотентно (повторный вызов не создаёт дубликатов)."
    ),
)
async def generate_slots(
    from_date: date = Query(..., description="Дата начала, включительно"),
    to_date: date = Query(..., description="Дата окончания, включительно"),
    psy_id: int = Depends(get_current_psychologist_id),
    service: SlotGenerationService = Depends(),
) -> GenerateSlotsResponse:
    created, skipped = await service.generate_for_range(
        psychologist_id=psy_id,
        from_date=from_date,
        to_date=to_date,
    )
    return GenerateSlotsResponse(created=created, skipped=skipped)


@router.patch(
    "/{slot_id}",
    summary="Изменить время FREE-слота",
    description=(
        "Меняет starts_at у FREE-слота, сохраняя его исходную длительность."
    ),
)
async def patch_slot(
    slot_id: UUID,
    body: UpdateSlot,
    psy_id: int = Depends(get_current_psychologist_id),
    service: SlotManagementService = Depends(),
) -> AvailabilitySlotSchema:
    slot = await service.update_starts_at(
        psychologist_id=psy_id,
        slot_id=slot_id,
        new_starts_at=body.starts_at,
    )
    return AvailabilitySlotSchema.model_validate(slot)


@router.delete(
    "/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить FREE-слот",
)
async def delete_slot(
    slot_id: UUID,
    psy_id: int = Depends(get_current_psychologist_id),
    service: SlotManagementService = Depends(),
) -> None:
    await service.delete(psychologist_id=psy_id, slot_id=slot_id)


@router.post(
    "/{slot_id}/cancel",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Отменить BOOKED-слот",
    description="Психолог отменяет забронированный слот. Запись помечается как отменённая психологом.",
)
async def cancel_booked_slot(
    slot_id: UUID,
    body: CancelSlot,
    psy_id: int = Depends(get_current_psychologist_id),
    service: BookingService = Depends(),
) -> None:
    await service.cancel_by_psy(
        psychologist_id=psy_id,
        slot_id=slot_id,
        reason=body.reason,
    )
