from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models.psychologist_schedule import PsychologistWorkingHours


class WorkingHoursDAO(BaseDAO):
    model = PsychologistWorkingHours

    @handle_db_errors
    async def get_by_psychologist(self, psychologist_id: int):
        query = (
            select(self.model)
            .where(self.model.psychologist_id == psychologist_id)
            .order_by(self.model.day_of_week)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    @handle_db_errors
    async def upsert_many(self, psychologist_id: int, items: list[dict]):
        for item in items:
            stmt = (
                pg_insert(self.model)
                .values(psychologist_id=psychologist_id, **item)
                .on_conflict_do_update(
                    constraint="uq_psychologist_day",
                    set_={
                        "start_time": item.get("start_time"),
                        "end_time": item.get("end_time"),
                        "is_active": item.get("is_active", False),
                    },
                )
            )
            await self.session.execute(stmt)