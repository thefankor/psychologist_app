from datetime import date

from pydantic import BaseModel
from src.models.enums import (
    ClientSessionFormat,
    UserGender,
)


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
