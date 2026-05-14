from datetime import datetime

from fastapi import APIRouter, Depends, Query
from src.core.dependencies import get_any_user_id, get_store
from src.crud import Store
from src.models.enums.slots import SlotStatus
from src.schemas.availability import AvailabilitySlotSchema

router = APIRouter(tags=["Psychologists Public Slots"])


@router.get(
    "/{psychologist_id}/free-slots/",
    summary="Свободные слоты психолога",
    description=(
        "Возвращает список FREE-слотов указанного психолога в окне [from_dt, to_dt). "
        "Доступно любому аутентифицированному пользователю."
    ),
)
async def list_free_slots(
    psychologist_id: int,
    from_dt: datetime = Query(...),
    to_dt: datetime = Query(...),
    _user: int = Depends(get_any_user_id),
    store: Store = Depends(get_store),
) -> list[AvailabilitySlotSchema]:
    slots = await store.availability_slot.list_in_range(
        psychologist_id=psychologist_id,
        from_dt=from_dt,
        to_dt=to_dt,
        status=SlotStatus.FREE,
    )
    return [AvailabilitySlotSchema.model_validate(s) for s in slots]
