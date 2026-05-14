from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, field_validator

from src.models import UserGender


class PsychologistResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    methods: list[str]
    avatar: str | None
    rating: float | None
    experience: int | None
    price: int | None

    matches_count: int

    model_config = ConfigDict(from_attributes=True)


class PsychologistProfileSchema(BaseModel):
    id: int
    email: str
    first_name: str | None
    last_name: str | None
    methods: list[str]
    avatar: str | None
    experience: int | None
    price: int | None
    age: int | None
    gender: UserGender | None
    rating: float | None
    timezone: str | None = None
    session_duration_minutes: int | None = None


class PsychologistProfileUpdate(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    methods: list[str] | None = None
    experience: int | None = None
    price: int | None = None
    age: int | None = None
    gender: UserGender | None = None
    timezone: str | None = None
    session_duration_minutes: int | None = None

    @field_validator("session_duration_minutes")
    @classmethod
    def duration_in_range(cls, v: int | None) -> int | None:
        if v is not None and (v <= 0 or v > 480):
            raise ValueError("session_duration_minutes должен быть в (0, 480]")
        return v

    @field_validator("timezone")
    @classmethod
    def timezone_is_valid_iana(cls, v: str | None) -> str | None:
        if v is None:
            return v
        try:
            ZoneInfo(v)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(
                f"Неизвестная таймзона '{v}'. Используйте IANA-имя, "
                "например 'Europe/Moscow' или 'Asia/Yekaterinburg'."
            ) from exc
        return v
