from datetime import date

from pydantic import BaseModel
from src.models.enums import (
    ClientSessionFormat,
    UserGender,
)


class PsychologistClientSchema(BaseModel):
    client_id: int
    name: str
    avatar: str | None = None
    first_session: date
    total_sessions: int


class ClientProfileForPsychologist(BaseModel):
    id: int
    name: str | None = None
    age: int | None = None
    gender: UserGender = UserGender.NOT_STATED
    birth_date: date | None = None
    avatar: str | None = None
    emotions: list[str] = []
    relations: list[str] = []
    work: list[str] = []
    life: list[str] = []
    personal: list[str] = []
    format: list[ClientSessionFormat] | None = []
