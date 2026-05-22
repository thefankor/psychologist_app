from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.models.enums.slots import SlotSource, SlotStatus


class AvailabilitySlotSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    psychologist_id: int
    starts_at: datetime
    ends_at: datetime
    status: SlotStatus
    source: SlotSource


class CreateSlot(BaseModel):
    starts_at: datetime


class UpdateSlot(BaseModel):
    starts_at: datetime


class CancelSlot(BaseModel):
    reason: str | None = None


class GenerateSlotsResponse(BaseModel):
    created: int
    skipped: int
