from datetime import time

from sqlalchemy import Boolean, Enum, ForeignKey, Time
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseWithTimestamps
from src.models.enums.schedules import DayOfWeek


class PsychologistWorkingHours(BaseWithTimestamps):
    """Диапазон рабочих часов психолога в шаблоне недели.

    Может быть несколько диапазонов в одном дне недели (например, утро + вечер).
    Используется как источник для генерации слотов доступности (SlotSource=TEMPLATE).
    """

    __tablename__ = "psychologist_working_hours"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    psychologist_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    day_of_week: Mapped[DayOfWeek] = mapped_column(Enum(DayOfWeek))
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
