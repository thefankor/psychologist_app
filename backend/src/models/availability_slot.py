import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    TIMESTAMP,
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models.base import BaseWithTimestamps
from src.models.enums.slots import SlotSource, SlotStatus

if TYPE_CHECKING:
    from src.models.appointment import Appointment


class AvailabilitySlot(BaseWithTimestamps):
    """Слот доступности психолога.

    Конкретный отрезок времени, который психолог сделал доступным для записи.
    Создаётся вручную (MANUAL) или генерируется из недельного шаблона (TEMPLATE).
    Жизненный цикл: FREE → (клиент бронирует) → BOOKED → (психолог отменяет) → CANCELLED.
    При отмене клиентом возвращается в FREE и снова доступен.
    """

    __tablename__ = "psychologist_availability_slots"
    __table_args__ = (
        CheckConstraint("ends_at > starts_at", name="ck_slot_time_order"),
        UniqueConstraint(
            "psychologist_id", "starts_at", name="uq_slot_psy_starts"
        ),
        Index(
            "ix_slots_psy_status_starts",
            "psychologist_id",
            "status",
            "starts_at",
        ),
        Index("ix_slots_starts", "starts_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    psychologist_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    starts_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False
    )
    ends_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False
    )
    status: Mapped[SlotStatus] = mapped_column(
        Enum(SlotStatus, name="slot_status"),
        nullable=False,
        default=SlotStatus.FREE,
        server_default=SlotStatus.FREE.value,
    )
    source: Mapped[SlotSource] = mapped_column(
        Enum(SlotSource, name="slot_source"), nullable=False
    )

    appointment: Mapped[Optional["Appointment"]] = relationship(
        "Appointment", back_populates="slot", uselist=False
    )
