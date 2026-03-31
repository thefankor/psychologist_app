from typing import Literal

from fastapi import APIRouter, Depends
from src.schemas import AuthResponse, EmptyModel, LoginRequest, VerifyCodeRequest
from src.services.auth import AuthService

router = APIRouter(tags=["Auth"])


@router.post(
    "/login/",
    summary="Login",
    description="Авторизация и регистрация в приложении соединена в один запрос.",
    response_model=EmptyModel,
    responses={
        400: {
            "description": "Неверное заполнение полей",
            "content": {
                "application/json": {"example": {"detail": "Неверное заполнение полей"}}
            },
        },
        # 401: {
        #     "description": "Аккаунт авторизован на другом устройстве",
        #     "content": {
        #         "application/json": {"example": {"detail": "Аккаунт авторизован на другом устройстве"}}
        #     },
        # },
    },
)
async def auth_login(
    login_data: LoginRequest,
    auth_service: AuthService = Depends(),
):
    await auth_service.send_confirm_code(email=login_data.email)
    return {}


@router.post(
    "/verify/",
    summary="Verify",
    description="Отправка кода и получение токена",
    responses={
        401: {
            "description": "Неверный код",
            "content": {"application/json": {"example": {"detail": "Неверный код"}}},
        },
    },
)
async def auth_verify(
    login_data: VerifyCodeRequest,
    user_type: Literal["client", "psychologist"] = "client",
    auth_service: AuthService = Depends(),
) -> AuthResponse:
    response = await auth_service.verify_code(
        email=login_data.email,
        code=login_data.code,
        user_type=user_type,
    )
    return response
