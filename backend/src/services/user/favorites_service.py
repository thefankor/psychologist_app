from fastapi import Depends

from src.core.dependencies import get_store
from src.crud import Store
from src.schemas import FavoritesPsychologistsResponse


class FavoriteService:
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

    async def get_user_favorites(self, user_id) -> list[FavoritesPsychologistsResponse]:
        psychologists = await self._store.favorite.find_user_favorites(user_id=user_id)

        return [
            FavoritesPsychologistsResponse(
                id=psychologist.id,
                full_name=f"{psychologist.first_name} {psychologist.last_name}",
                avatar=psychologist.avatar,
                methods=psychologist.methods,
            )
            for psychologist in psychologists
        ]

    async def add_psychologist_to_favorites(self, user_id: int, psychologist_id: int):
        await self._store.psychologist.check_exist_or_404(model_id=psychologist_id)
        await self._store.favorite.add(user_id=user_id, psychologist_id=psychologist_id)

    async def delete_from_favorites(self, user_id: int, psychologist_id: int):
        await self._store.favorite.delete_from_favorites(
            user_id=user_id, psychologist_id=psychologist_id
        )
