from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_user_id
from src.schemas.appointments import AppointmentSchema, CreateAppointment
from src.services.user.appointments import AppointmentService

router = APIRouter(tags=["Appointments"])


@router.post(
    "/",
    summary="Create appointment",
    description="Записаться к психологу",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def create_appointment(
    data: CreateAppointment,
    current_client: int = Depends(get_current_user_id),
    service: AppointmentService = Depends(),
) -> AppointmentSchema:
    return await service.create_appointment(
        client_id=current_client,
        psychologist_id=data.psychologist_id,
        start_at=data.start_at,
    )


@router.get(
    "/",
    summary="Get appointments",
    description="Получить список всех записей",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
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
