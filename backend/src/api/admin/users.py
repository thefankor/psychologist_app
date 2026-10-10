from fastapi import APIRouter, Depends

from src.core.dependencies import get_current_admin_id
from src.schemas import (
    EmptyModel,
    UserDetailForAdmin,
    UserForAdmin,
    UserUpdateRequestForAdmin,
)
from src.services.user import UserService

router = APIRouter(tags=["Admin Users"])


@router.get(
    "/users/",
    summary="Get all users",
    description="Получение всех пользователей.",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def get_all_users(
    limit: int = 100,
    offset: int = 0,
    _: int = Depends(get_current_admin_id),
    user_service: UserService = Depends(),
) -> list[UserForAdmin]:
    response = await user_service.get_all_users(limit=limit, offset=offset)
    return response


@router.get(
    "/users/{id}/",
    summary="Get user by id",
    description="Получение конкретного пользователя",
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
async def get_user_by_id(
    id: int,
    _: int = Depends(get_current_admin_id),
    user_service: UserService = Depends(),
) -> UserDetailForAdmin:
    response = await user_service.get_user_by_id(user_id=id)
    return response


@router.patch(
    "/users/{id}/",
    summary="Update user",
    description="Редактирование конкретного пользователя",
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
            "description": "Конфликт данных: нарушение ограничений целостности",
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
async def update_user(
    data: UserUpdateRequestForAdmin,
    id: int,
    _: int = Depends(get_current_admin_id),
    user_service: UserService = Depends(),
):
    return await user_service.update_user_admin(user_id=id, data=data)
