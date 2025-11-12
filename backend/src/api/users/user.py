from fastapi import APIRouter, Depends, UploadFile

from src.core.dependencies import get_current_user_id
from src.schemas import EmptyModel
from src.schemas.user import ProfileUpdateRequest, UserProfileResponse, UserSurvey
from src.services.user import UserService

router = APIRouter(tags=["Profile"])


@router.get(
    "/",
    summary="Get profile",
    description="",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def get_profile(
    user_id: int = Depends(get_current_user_id), user_service: UserService = Depends()
) -> UserProfileResponse:
    return await user_service.get_client_profile(user_id=user_id)


@router.post(
    "/survey/",
    summary="Заполнить анкету",
    description="",
    response_model=EmptyModel,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def fill_survey(
    data: UserSurvey,
    user_id: int = Depends(get_current_user_id),
    user_service: UserService = Depends(),
):
    await user_service.fill_survey(user_id=user_id, data=data)
    return {}


@router.delete(
    "/",
    summary="Delete profile",
    description="Удалить свой аккаунт",
    status_code=204,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def delete_profile(
    user_id: int = Depends(get_current_user_id), user_service: UserService = Depends()
):
    await user_service.delete_client_profile(user_id=user_id)


@router.patch(
    "/",
    summary="Update profile",
    description="Изменить профиль",
    response_model=EmptyModel,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
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
async def update_profile(
    data: ProfileUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    user_service: UserService = Depends(),
):
    return await user_service.update_profile(user_id=user_id, data=data)


@router.post(
    "/upload_photo/",
    summary="Загрузить аватарку пользователя",
    status_code=200,
    responses={
        400: {
            "description": "Only image files are allowed",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid image upload.", "message": ""}
                },
            },
        },
        401: {
            "description": "Invalid token",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def update_avatar(
    image: UploadFile,
    user_id: int = Depends(get_current_user_id),
    user_service: UserService = Depends(),
) -> EmptyModel:
    return await user_service.upload_photo(user_id=user_id, image=image)
