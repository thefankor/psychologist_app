import random

from fastapi import Depends

from src.core.dependencies import get_store
from src.core.exceptions import InvalidCodeException
from src.crud import Store
from src.models.enums import PaymentMethodType
from src.schemas.payment_methods import SBP, ProfilePaymentMethod, SBPRequest
from src.tasks import send_sms_code_task
from src.utils.sms_confirm_service import SMSCodeService


class PaymentMethodService:
    """
    Сервис для управления способами оплаты клиентов системы.
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
        sms_service: SMSCodeService = Depends(),
    ):
        """Инициализация сервиса пользователей.

        Args:
            store: Хранилище данных, используемое для операций с пользователями.
        """
        self._store = store
        self._sms_service = sms_service

    async def get_client_payment_methods(self, user_id):
        methods = await self._store.payment_method.find_all(user_id=user_id)
        return ProfilePaymentMethod(
            sbp=[
                SBP(
                    id=method.id,
                    phone=method.phone,
                    bank=method.bank,
                )
                for method in methods
            ]
        )

    async def send_confirm_code(self, data: SBPRequest):
        code = self.generate_code()
        await self._sms_service.save(
            phone=data.phone, data={"bank": data.bank, "type": "SBP"}, code=code
        )
        send_sms_code_task.delay(phone=data.phone, code=str(code))

    async def verify_code(self, user_id: int, phone: str, code: str):
        method_data = await self._sms_service.get(phone=phone)

        if not method_data or method_data.code != code:
            raise InvalidCodeException

        await self._store.payment_method.add(
            return_model=False,
            user_id=user_id,
            phone=phone,
            type=PaymentMethodType.SBP,
            bank=method_data.data["bank"],
        )

        await self._sms_service.delete(phone=phone)

    @staticmethod
    def generate_code(length: int = 5) -> int:
        """Генерирует случайный цифровой код нужной длины (по умолчанию 5 цифр)."""
        min_val = 10 ** (length - 1)
        max_val = 10**length - 1
        return random.randint(min_val, max_val)
