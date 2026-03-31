from pydantic import BaseModel, ConfigDict
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


class PsychologistProfileUpdate(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    methods: list[str] | None = None
    experience: int | None = None
    price: int | None = None
    age: int | None = None
    gender: UserGender | None = None
