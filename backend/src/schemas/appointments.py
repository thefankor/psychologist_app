from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.models.enums.appointments import AppointmentRole


class CreateAppointment(BaseModel):
    slot_id: UUID


class AppointmentAttendeeSchema(BaseModel):
    user_id: int
    role: AppointmentRole
    name: str | None = None
    avatar: str | None = None


class AppointmentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slot_id: UUID
    start_at: datetime
    ends_at: datetime
    is_group: bool = False
    cancelled_at: datetime | None = None
    cancelled_by: AppointmentRole | None = None
    cancellation_reason: str | None = None
    attendees: list[AppointmentAttendeeSchema] = []
