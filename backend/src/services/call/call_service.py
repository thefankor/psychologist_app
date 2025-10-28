from uuid import UUID

from fastapi import Depends

from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.schemas import CallTokenResponse
from src.utils import CallsUtils


class CallService:
    """
    Сервис для управления звонками.
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        """Инициализация сервиса звонков.

        Args:
            store: Хранилище данных, используемое для операций с пользователями.
        """
        self._store = store

    async def get_token(self, user_id: int, appointment_id: UUID) -> CallTokenResponse:
        room_name = await self._get_room_name_by_appointment_id(appointment_id=appointment_id)

        client_name = await self._store.client.get_client_name(user_id=user_id)

        token = await CallsUtils.get_token(
            room_name=room_name,
            user_id=user_id,
            username=client_name or "Guest",
        )

        return CallTokenResponse(ws_url=settings.LIVEKIT_WS_URL, token=token)

    async def _get_room_name_by_appointment_id(self, appointment_id: UUID) -> str:
        return str(appointment_id)
