from sqlalchemy import select

from src.crud.impl.base import BaseDAO
from src.models.user import ClientProfile


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
