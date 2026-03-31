from sqlalchemy import delete, select
from src.crud.impl.base import BaseDAO
from src.models import PsychologistProfile, UserFavorite


class FavoritesDAO(BaseDAO):
    """
    DAO для работы с избранными психологами клиента
    """

    model = UserFavorite

    async def find_user_favorites(self, user_id):
        query = (
            select(PsychologistProfile)
            .join(UserFavorite)
            .where(UserFavorite.user_id == user_id)
            .order_by(UserFavorite.created_at.desc())
        )
        result = await self.session.execute(query)
        return [
            psychologist_dict["PsychologistProfile"]
            for psychologist_dict in result.mappings().all()
        ]

    async def delete_from_favorites(self, user_id: int, psychologist_id: int):
        model_id = await self.find_one_id_or_404(
            user_id=user_id, psychologist_id=psychologist_id
        )
        stmt = delete(self.model).where(self.model.id == model_id)
        await self.session.execute(stmt)
