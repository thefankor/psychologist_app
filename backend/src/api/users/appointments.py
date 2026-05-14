from uuid import UUID

from fastapi import APIRouter, Depends, status
from src.core.dependencies import get_current_user_id
from src.schemas.appointments import AppointmentSchema, CreateAppointment
from src.services.user.appointments import AppointmentService

router = APIRouter(tags=["Appointments"])


@router.post(
    "/",
    summary="Забронировать слот",
    description="Клиент бронирует существующий FREE-слот по его slot_id.",
)
async def book_slot(
    data: CreateAppointment,
    current_client: int = Depends(get_current_user_id),
    service: AppointmentService = Depends(),
) -> AppointmentSchema:
    return await service.book_slot(
        client_id=current_client, slot_id=data.slot_id
    )


@router.delete(
    "/{appointment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Отменить запись",
    description="Клиент отменяет свою запись. Слот возвращается в FREE.",
)
async def cancel_appointment(
    appointment_id: UUID,
    current_client: int = Depends(get_current_user_id),
    service: AppointmentService = Depends(),
) -> None:
    await service.cancel_appointment(
        client_id=current_client, appointment_id=appointment_id
    )


@router.get(
    "/",
    summary="Список моих записей",
    description="Возвращает записи клиента.",
)
async def get_all_appointments(
    limit: int = 25,
    offset: int = 0,
    current_client: int = Depends(get_current_user_id),
    service: AppointmentService = Depends(),
) -> list[AppointmentSchema]:
    return await service.get_client_appointments(
        limit=limit,
        offset=offset,
        client_id=current_client,
    )
