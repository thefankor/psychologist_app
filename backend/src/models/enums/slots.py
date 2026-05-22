import enum


class SlotStatus(enum.Enum):
    FREE = "FREE"
    BOOKED = "BOOKED"
    CANCELLED = "CANCELLED"


class SlotSource(enum.Enum):
    TEMPLATE = "TEMPLATE"
    MANUAL = "MANUAL"
