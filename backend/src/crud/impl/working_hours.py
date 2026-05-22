from sqlalchemy import delete, select

from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models.psychologist_schedule import PsychologistWorkingHours


class WorkingHoursDAO(BaseDAO):
    """DAO для работы с шаблоном рабочих часов психолога.

    Несколько диапазонов в одном дне недели разрешены (например, утро + вечер).
    Используется как источник для генератора слотов.
    """

    model = PsychologistWorkingHours

    @handle_db_errors
    async def get_by_psychologist(self, psychologist_id: int):
        """Возвращает все диапазоны шаблона, отсортированные по дню и времени."""
        query = (
            select(self.model)
            .where(self.model.psychologist_id == psychologist_id)
            .order_by(self.model.day_of_week, self.model.start_time)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    @handle_db_errors
    async def get_active(self, psychologist_id: int):
        """Возвращает только активные диапазоны шаблона."""
        query = (
            select(self.model)
            .where(self.model.psychologist_id == psychologist_id)
            .where(self.model.is_active.is_(True))
            .order_by(self.model.day_of_week, self.model.start_time)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    @handle_db_errors
    async def delete_all_for_psy(self, psychologist_id: int) -> None:
        """Удаляет все диапазоны шаблона психолога (для атомарной замены)."""
        await self.session.execute(
            delete(self.model).where(self.model.psychologist_id == psychologist_id)
        )
