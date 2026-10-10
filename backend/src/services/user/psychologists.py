from fastapi import Depends

from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.schemas.psychologists import PsychologistResponse


class PsychologistsService:
    """
    Сервис для управления избранными психологами клиента
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        """Инициализация избранных психологами клиента

        Args:
            store: Хранилище данных, используемое для операций с избранными.
        """
        self._store = store

    async def get_all_psychologists(self):
        data = await self._store.psychologist.find_all()
        return [
            PsychologistResponse(
                id=psychologist.id,
                matches_count=3,
                first_name=psychologist.first_name,
                last_name=psychologist.last_name,
                methods=psychologist.methods,
                avatar=settings.STATIC_BASE_URL + psychologist.avatar
                if psychologist.avatar
                else None,
                experience=psychologist.experience,
                price=psychologist.price,
                rating=psychologist.rating,
            )
            for psychologist in data
            if psychologist.first_name and psychologist.last_name
        ]
