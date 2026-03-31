from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_user_id
from src.schemas import EmptyModel, FavoritesPsychologistsResponse, PsychologistID
from src.services.user.favorites_service import FavoriteService

router = APIRouter(tags=["Favorites"])


@router.get(
    "/",
    summary="Get profile favorites psychologists",
    description="Получить избранных психологов пользователя",
    response_model=list[FavoritesPsychologistsResponse],
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def get_user_favorites(
    user_id: int = Depends(get_current_user_id),
    service: FavoriteService = Depends(),
):
    return await service.get_user_favorites(user_id=user_id)


@router.post(
    "/",
    summary="Add psychologist to favorites",
    description="Добавить психолого в избранное",
    response_model=EmptyModel,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        404: {
            "description": "Ресурс не найден",
            "content": {
                "application/json": {"example": {"detail": "Ресурс не найден"}}
            },
        },
        409: {
            "description": "Психолог уже добавлен в избранное",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Конфликт данных: нарушение ограничений целостности"
                    }
                }
            },
        },
    },
)
async def add_psychologist_to_favorites(
    data: PsychologistID,
    user_id: int = Depends(get_current_user_id),
    service: FavoriteService = Depends(),
):
    await service.add_psychologist_to_favorites(
        user_id=user_id, psychologist_id=data.id
    )
    return {}


@router.delete(
    "/{psychologist_id}/",
    summary="Delete psychologist from favorites",
    description="Удалить психолога из избранных",
    status_code=204,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        404: {
            "description": "Ресурс не найден",
            "content": {
                "application/json": {"example": {"detail": "Ресурс не найден"}}
            },
        },
    },
)
async def delete_from_favorites(
    psychologist_id: int,
    user_id: int = Depends(get_current_user_id),
    service: FavoriteService = Depends(),
):
    return await service.delete_from_favorites(
        user_id=user_id, psychologist_id=psychologist_id
    )
