from sqlalchemy import JSON as SA_JSON
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import BaseWithTimestamps
from src.models.enums import MethodFormat

JSON_AUTO = SA_JSON().with_variant(JSONB(), "postgresql")


class PsychologistProfile(BaseWithTimestamps):
    __tablename__ = "psychologist_profiles"
    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="psychologist_profile")
    first_name: Mapped[str]
    last_name: Mapped[str]
    avatar: Mapped[str | None]
    methods: Mapped[list[MethodFormat]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO), default=list
    )
