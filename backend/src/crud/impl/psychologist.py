from sqlalchemy import select
from src.crud.impl.base import BaseDAO
from src.models import PsychologistProfile


class PsychologistDAO(BaseDAO):
    """
    DAO для работы с психологами.

    Предоставляет методы для управления психологами, проверки
    их статуса, создания новых психологов и получения информации.
    """

    model = PsychologistProfile

    async def get_name_and_avatar(self, user_id: int):
        query = select(
            self.model.first_name, self.model.last_name, self.model.avatar
        ).filter_by(id=user_id)
        result = await self.session.execute(query)
        return result.mappings().one_or_none()
