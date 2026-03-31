from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from src.models.enums.appointments import AppointmentRole


class CreateAppointment(BaseModel):
    psychologist_id: int
    start_at: datetime


class AppointmentAttendeeSchema(BaseModel):
    user_id: int
    role: AppointmentRole
    name: str | None = None
    avatar: str | None = None


class AppointmentSchema(BaseModel):
    id: UUID
    start_at: datetime
    ends_at: datetime
    is_group: bool = False
    attendees: list[AppointmentAttendeeSchema]
