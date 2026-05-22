from sqlalchemy import select

from src.crud.impl.base import BaseDAO
from src.models import AdminProfile


class AdminDAO(BaseDAO):
    """
    DAO для работы с клиентами.

    Предоставляет методы для управления админами
    """

    model = AdminProfile

    async def get_admin_role(self, user_id: int) -> str:
        query = select(self.model.role).filter_by(id=user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
