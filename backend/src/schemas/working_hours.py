from datetime import time

from pydantic import BaseModel, ConfigDict, model_validator
from src.models.enums import DayOfWeek


class TemplateRangeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    is_active: bool = True


class TemplateRangeInput(BaseModel):
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    is_active: bool = True

    @model_validator(mode="after")
    def end_after_start(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time должен быть позже start_time")
        return self


class ReplaceTemplateRequest(BaseModel):
    ranges: list[TemplateRangeInput]
