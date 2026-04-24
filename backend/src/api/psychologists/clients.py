from fastapi import APIRouter, Depends, HTTPException
from src.config import settings
from src.core.dependencies import get_current_psychologist_id, get_store
from src.crud import Store
from src.schemas.clients import ClientProfileForPsychologist

router = APIRouter(tags=["Psychologists Clients"])


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
    store: Store = Depends(get_store),
) -> ClientProfileForPsychologist:
    has_appointment = await store.appointment_attendee.has_shared_appointment(
        psychologist_id=current_psychologist, client_id=user_id
    )
    if not has_appointment:
        raise HTTPException(status_code=403, detail="Нет записей с этим клиентом")

    client = await store.client.find_one_or_none(id=user_id)

    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    avatar = None
    if client.avatar:
        avatar = settings.STATIC_BASE_URL + client.avatar

    return ClientProfileForPsychologist(
        id=client.id,
        name=client.name,
        age=client.age,
        gender=client.gender,
        birth_date=client.birth_date,
        avatar=avatar,
        emotions=client.emotions or [],
        relations=client.relations or [],
        work=client.work or [],
        life=client.life or [],
        personal=client.personal or [],
        format=client.format or [],
    )
