from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_psychologist_id
from src.schemas.clients import ClientProfileForPsychologist, PsychologistClientSchema
from src.services.psychologist_clients_service import PsychologistClientsService

router = APIRouter(tags=["Psychologists Clients"])


@router.get(
    "/",
    summary="Get all clients",
    description="Получить список всех клиентов психолога с информацией о сессиях",
)
async def get_clients(
    limit: int = 25,
    offset: int = 0,
    name: str | None = None,
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: PsychologistClientsService = Depends(),
) -> list[PsychologistClientSchema]:
    return await service.get_clients(
        psychologist_id=current_psychologist,
        limit=limit,
        offset=offset,
        name=name,
    )


@router.get(
    "/{user_id}",
    summary="Get client profile",
    description="Получить профиль клиента по user_id",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        403: {
            "description": "Нет записей с этим клиентом",
            "content": {
                "application/json": {
                    "example": {"detail": "Нет записей с этим клиентом"}
                }
            },
        },
        404: {
            "description": "Клиент не найден",
            "content": {
                "application/json": {"example": {"detail": "Клиент не найден"}}
            },
        },
    },
)
async def get_client_profile(
    user_id: int,
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: PsychologistClientsService = Depends(),
) -> ClientProfileForPsychologist:
    return await service.get_client_profile(
        psychologist_id=current_psychologist, user_id=user_id
    )
