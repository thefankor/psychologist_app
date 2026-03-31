import uuid
from datetime import datetime

from sqlalchemy import TIMESTAMP, Boolean, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseWithTimestamps
from src.models.enums.appointments import AppointmentRole


class Appointment(BaseWithTimestamps):
    __tablename__ = "appointments"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    start_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    ends_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    is_group: Mapped[bool] = mapped_column(Boolean, default=False)


class AppointmentAttendee(BaseWithTimestamps):
    __tablename__ = "appointments_attendees"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    appointment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("appointments.id"))
    role: Mapped[AppointmentRole] = mapped_column(Enum(AppointmentRole))
