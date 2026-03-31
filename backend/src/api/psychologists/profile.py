from fastapi import APIRouter, Depends, UploadFile
from src.core.dependencies import get_current_psychologist_id
from src.models import UserRole
from src.schemas import EmptyModel
from src.schemas.psychologists import (
    PsychologistProfileSchema,
    PsychologistProfileUpdate,
)
from src.services.psychologists_service import PsychologistService
from src.services.user import UserService

router = APIRouter(tags=["Psychologists Profile"])


@router.get(
    "/",
    summary="Get psychologist profile",
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
    current_psychologist: int = Depends(get_current_psychologist_id),
    service: PsychologistService = Depends(),
) -> PsychologistProfileSchema:
    return await service.get_profile(
        psychologist_id=current_psychologist,
    )


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
    data: PsychologistProfileUpdate,
    user_id: int = Depends(get_current_psychologist_id),
    user_service: PsychologistService = Depends(),
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
    user_id: int = Depends(get_current_psychologist_id),
    user_service: UserService = Depends(),
) -> EmptyModel:
    return await user_service.upload_photo(
        user_id=user_id, image=image, user_role=UserRole.PSYCHOLOGIST
    )
