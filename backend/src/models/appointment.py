import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import TIMESTAMP, Boolean, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseWithTimestamps
from src.models.enums.appointments import AppointmentRole

if TYPE_CHECKING:
    from src.models.availability_slot import AvailabilitySlot


class Appointment(BaseWithTimestamps):
    """Запись клиента к психологу — результат бронирования слота.

    Время начала/окончания приёма берётся из связанного AvailabilitySlot.
    Колонки start_at/ends_at на этой таблице больше не хранятся;
    свойства start_at/ends_at делегируются в slot.
    """

    __tablename__ = "appointments"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("psychologist_availability_slots.id", ondelete="RESTRICT"),
        nullable=False,
    )
    is_group: Mapped[bool] = mapped_column(Boolean, default=False)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    cancelled_by: Mapped[Optional[AppointmentRole]] = mapped_column(
        Enum(AppointmentRole), nullable=True
    )
    cancellation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    slot: Mapped["AvailabilitySlot"] = relationship(
        "AvailabilitySlot", back_populates="appointment"
    )

    @hybrid_property
    def start_at(self) -> datetime:
        return self.slot.starts_at

    @hybrid_property
    def ends_at(self) -> datetime:
        return self.slot.ends_at


class AppointmentAttendee(BaseWithTimestamps):
    __tablename__ = "appointments_attendees"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    appointment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("appointments.id", ondelete="CASCADE")
    )
    role: Mapped[AppointmentRole] = mapped_column(Enum(AppointmentRole))
