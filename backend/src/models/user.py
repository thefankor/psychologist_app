from datetime import date

from sqlalchemy import JSON as SA_JSON
from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseWithTimestamps
from src.models.enums import (
    ClientSessionFormat,
    DateFormat,
    MethodFormat,
    PricingFormat,
    TimeFormat,
    UserGender,
    UserRole,
    UserTimezone,
)

JSON_AUTO = SA_JSON().with_variant(JSONB(), "postgresql")


class User(BaseWithTimestamps):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CLIENT)

    client_profile = relationship("ClientProfile", uselist=False, back_populates="user")
    psychologist_profile = relationship(
        "PsychologistProfile", uselist=False, back_populates="user"
    )
    admin_profile = relationship("AdminProfile", uselist=False, back_populates="user")


class ClientProfile(BaseWithTimestamps):
    __tablename__ = "client_profiles"
    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    is_new: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    phone: Mapped[str | None] = mapped_column(String, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String)
    age: Mapped[int | None] = mapped_column(Integer)
    gender: Mapped[UserGender] = mapped_column(
        Enum(UserGender), default=UserGender.NOT_STATED
    )
    birth_date: Mapped[date | None] = mapped_column(Date)

    notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    timezone: Mapped[UserTimezone | None]
    avatar: Mapped[str | None]

    time_format: Mapped[TimeFormat | None] = mapped_column(Enum(TimeFormat))
    date_format: Mapped[DateFormat | None] = mapped_column(Enum(DateFormat))
    method_format: Mapped[MethodFormat | None] = mapped_column(Enum(MethodFormat))
    pricing_format: Mapped[PricingFormat | None] = mapped_column(Enum(PricingFormat))

    emotions: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
    relations: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
    work: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
    life: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
    personal: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
    format: Mapped[list[ClientSessionFormat] | None] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )

    user = relationship("User", back_populates="client_profile")


class PsychologistProfile(BaseWithTimestamps):
    __tablename__ = "psychologist_profiles"
    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="psychologist_profile")


class AdminProfile(BaseWithTimestamps):
    __tablename__ = "admin_profiles"
    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="admin_profile")
