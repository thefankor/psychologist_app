import random
from datetime import timedelta

from fastapi import Depends
from src.config import settings
from src.core.auth import TokenService
from src.core.dependencies import get_store
from src.core.exceptions import InvalidCodeException
from src.crud import Store
from src.schemas import AuthResponse
from src.tasks import send_email_code_task
from src.utils.confirm_code_service import ConfirmCodeService


class AuthService:
    """
    Сервис для управления пользователями системы.

    Предоставляет бизнес-логику для работы с пользователями: создание,
    обновление, проверка статуса и управление языковыми настройками.
    Интегрируется с DAO слоем для выполнения операций с базой данных.

    Используется в:
    - Эндпоинтах пользователей для CRUD операций
    - AuthenticationService для проверки пользователей
    - ReferralService для создания реферальных связей
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
        sms_service: ConfirmCodeService = Depends(),
    ):
        """Инициализация сервиса пользователей.

        Args:
            store: Хранилище данных, используемое для операций с пользователями.
        """
        self._store = store
        self._sms_service = sms_service

    async def send_confirm_code(self, email: str):
        code = self.generate_code()
        await self._sms_service.save(email=email, code=code)
        send_email_code_task.delay(to_email=email, code=str(code))

    async def verify_code(self, email: str, code: str) -> AuthResponse:
        is_success_code = await self._sms_service.verify(
            email=email, submitted_code=code
        )

        if not is_success_code:
            raise InvalidCodeException

        await self._sms_service.delete(email=email)

        user_id = await self._store.user.get_or_create_client(email=email)

        return self.create_tokens({"sub": str(user_id), "type": "CLIENT"})

    @staticmethod
    def generate_code(length: int = 5) -> int:
        """Генерирует случайный цифровой код нужной длины (по умолчанию 5 цифр)."""
        min_val = 10 ** (length - 1)
        max_val = 10**length - 1
        return random.randint(min_val, max_val)

    @staticmethod
    def create_tokens(data: dict) -> AuthResponse:
        """Создание access и refresh токенов"""
        access_token_expires = timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)

        access_token = TokenService.create_token(
            data=data,
            expires_delta=access_token_expires,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        return AuthResponse(token=access_token)
