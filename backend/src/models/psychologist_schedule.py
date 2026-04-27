from datetime import time

from sqlalchemy import Boolean, Enum, ForeignKey, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models.base import BaseWithTimestamps
from src.models.enums.schedules import DayOfWeek


class PsychologistWorkingHours(BaseWithTimestamps):
    __tablename__ = "psychologist_working_hours"
    __table_args__ = (
        UniqueConstraint("psychologist_id", "day_of_week", name="uq_psychologist_day"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    psychologist_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    day_of_week: Mapped[DayOfWeek] = mapped_column(Enum(DayOfWeek))
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
