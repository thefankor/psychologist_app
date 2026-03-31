from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from src.models.enums import (
    ClientSessionFormat,
    DateFormat,
    MethodFormat,
    PricingFormat,
    TimeFormat,
    UserGender,
    UserTimezone,
)
from src.utils.validators import normalize_and_validate_phone


class UserProfileResponse(BaseModel):
    id: int
    name: str | None = None
    email: EmailStr
    phone: str | None = Field("+79994445678")
    notifications: bool
    subscription: int | None = None  # UNIX-TIME дата,
    timezone: UserTimezone | None = None
    avatar: str | None = None
    birth_date: date | None = None
    gender: UserGender = UserGender.NOT_STATED
    new: bool = True


class UserSurvey(BaseModel):
    name: str
    birth_date: datetime
    gender: UserGender
    emotions: list[str] | None = None
    relations: list[str] | None = None
    work: list[str] | None = None
    life: list[str] | None = None
    personal: list[str] | None = None
    format: list[ClientSessionFormat] | None = None
    timezone: UserTimezone | None = None
    long: TimeFormat | None = None
    pricing: PricingFormat | None = None
    time: DateFormat | None = None
    method: MethodFormat | None = None

    model_config = ConfigDict(use_enum_values=True)


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    phone: str | None = Field("+79994445678")
    email: EmailStr | None = None
    birth_date: datetime | None = None
    gender: UserGender | None = None
    timezone: UserTimezone | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return normalize_and_validate_phone(v)
