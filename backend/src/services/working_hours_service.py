from fastapi import Depends
from src.core.dependencies import get_store
from src.crud import Store
from src.models.enums.schedules import DayOfWeek
from src.schemas.working_hours import WorkingHoursSchema, WorkingHoursUpdate


class WorkingHoursService:
    def __init__(self, store: Store = Depends(get_store)):
        self._store = store

    async def get_working_hours(self, psychologist_id: int) -> list[WorkingHoursSchema]:
        rows = await self._store.working_hours.get_by_psychologist(
            psychologist_id=psychologist_id
        )

        saved = {row.day_of_week: row for row in rows}

        result = []
        for day in DayOfWeek:
            if day in saved:
                row = saved[day]
                result.append(
                    WorkingHoursSchema(
                        day_of_week=day,
                        start_time=row.start_time,
                        end_time=row.end_time,
                        is_active=row.is_active,
                    )
                )
            else:
                result.append(
                    WorkingHoursSchema(
                        day_of_week=day,
                        start_time=None,
                        end_time=None,
                        is_active=False,
                    )
                )

        return result

    async def update_working_hours(
        self,
        psychologist_id: int,
        items: list[WorkingHoursUpdate],
    ) -> list[WorkingHoursSchema]:
        await self._store.working_hours.upsert_many(
            psychologist_id=psychologist_id,
            items=[item.model_dump() for item in items],
        )
        return await self.get_working_hours(psychologist_id)
