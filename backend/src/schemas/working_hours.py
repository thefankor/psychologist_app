from datetime import time

from pydantic import BaseModel, field_validator, model_validator
from src.models.enums.schedules import DayOfWeek


class WorkingHoursSchema(BaseModel):
    day_of_week: DayOfWeek
    start_time: time | None = None
    end_time: time | None = None
    is_active: bool = False


class WorkingHoursUpdate(BaseModel):
    day_of_week: DayOfWeek
    start_time: time | None = None
    end_time: time | None = None
    is_active: bool = False

    @field_validator("start_time", "end_time")
    @classmethod
    def must_be_full_hour(cls, v: time | None) -> time | None:
        if v is not None and (v.minute != 0 or v.second != 0):
            raise ValueError("Время должно быть ровным часом, например 08:00")
        return v

    @model_validator(mode="after")
    def check_min_duration(self):
        if self.start_time is not None and self.end_time is not None:
            if self.end_time.hour - self.start_time.hour < 1:
                raise ValueError("Минимальная продолжительность рабочего дня — 1 час")
        return self
