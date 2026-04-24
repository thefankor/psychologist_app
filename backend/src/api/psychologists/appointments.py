from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_psychologist_id
from src.schemas.appointments import AppointmentSchema
from src.services.user.appointments import AppointmentService

router = APIRouter(tags=["Psychologists Appointments"])


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
    is_upcoming: bool = True,
    client_id: int | None = None,
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: AppointmentService = Depends(),
) -> list[AppointmentSchema]:
    return await service.get_psychologist_appointments(
        limit=limit,
        offset=offset,
        psychologist_id=current_psychologist,
        is_upcoming=is_upcoming,
        client_id=client_id,
    )
