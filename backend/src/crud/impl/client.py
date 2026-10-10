from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from src.crud.impl.base import BaseDAO
from src.models import ClientProfile


class ClientDAO(BaseDAO):
    """
    DAO для работы с клиентами.

    Предоставляет методы для управления пользователями, проверки
    их статуса, создания новых пользователей и получения информации.
    """

    model = ClientProfile

    async def get_client_name(self, user_id: int) -> str:
        query = select(self.model.name).filter_by(id=user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_name_and_avatar(self, user_id: int):
        query = select(self.model.name, self.model.avatar).filter_by(id=user_id)
        result = await self.session.execute(query)
        return result.mappings().one_or_none()

    async def upsert(self, user_id: int, **kwargs):
        if not kwargs:
            return
        stmt = (
            insert(ClientProfile)
            .values(id=user_id, **kwargs)
            .on_conflict_do_update(
                index_elements=[ClientProfile.id],  # по какому полю конфликт
                set_=kwargs,  # что обновляем
            )
        )

        await self.session.execute(stmt)
