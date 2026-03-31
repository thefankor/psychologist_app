from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_admin_id
from src.schemas import AdminLoginRequest, AdminProfile, AuthResponse
from src.services.auth import AuthService
from src.services.user import UserService

router = APIRouter(tags=["Admin Auth"])


@router.post(
    "/login/",
    summary="Verify",
    description="Отправка кода и получение токена",
    responses={
        401: {
            "description": "Неверный логин или пароль",
            "content": {
                "application/json": {"example": {"detail": "Неверный логин или пароль"}}
            },
        },
    },
)
async def admin_login(
    data: AdminLoginRequest,
    auth_service: AuthService = Depends(),
) -> AuthResponse:
    response = await auth_service.admin_login(email=data.email, password=data.password)
    return response


@router.get(
    "/info/",
    summary="Admin Info",
    description="Получение информации об администраторе",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def admin_info(
    user_id: int = Depends(get_current_admin_id),
    user_service: UserService = Depends(),
) -> AdminProfile:
    response = await user_service.get_admin_info(user_id=user_id)
    return response
