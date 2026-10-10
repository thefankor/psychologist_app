from sqlalchemy import JSON as SA_JSON
from sqlalchemy import CheckConstraint, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import BaseWithTimestamps, UserGender
from src.models.enums import MethodFormat

JSON_AUTO = SA_JSON().with_variant(JSONB(), "postgresql")


class PsychologistProfile(BaseWithTimestamps):
    __tablename__ = "psychologist_profiles"
    __table_args__ = (
        CheckConstraint(
            "session_duration_minutes > 0 AND session_duration_minutes <= 480",
            name="ck_session_duration_range",
        ),
    )

    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="psychologist_profile")
    first_name: Mapped[str | None]
    last_name: Mapped[str | None]
    avatar: Mapped[str | None]
    methods: Mapped[list[MethodFormat]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
    rating: Mapped[float] = mapped_column(default=0, server_default="0")
    experience: Mapped[int | None]
    price: Mapped[int | None]
    age: Mapped[int | None]
    gender: Mapped[UserGender] = mapped_column(
        Enum(UserGender), default=UserGender.NOT_STATED, server_default="NOT_STATED"
    )
    timezone: Mapped[str] = mapped_column(
        String(64), nullable=False, server_default="Europe/Moscow"
    )
    session_duration_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="60"
    )
