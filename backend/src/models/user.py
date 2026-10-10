from sqlalchemy import JSON as SA_JSON
from sqlalchemy import Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import AdminRole
from src.models.base import BaseWithTimestamps
from src.models.enums import UserRole

JSON_AUTO = SA_JSON().with_variant(JSONB(), "postgresql")


class User(BaseWithTimestamps):
    __tablename__ = "users"
    __table_args__ = (Index("ix_users_roles_gin", "roles", postgresql_using="gin"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)

    roles: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(JSON_AUTO),
        default=lambda: [UserRole.CLIENT.value],
        nullable=False,
    )

    client_profile = relationship("ClientProfile", uselist=False, back_populates="user")
    psychologist_profile = relationship(
        "PsychologistProfile", uselist=False, back_populates="user"
    )
    admin_profile = relationship("AdminProfile", uselist=False, back_populates="user")


class AdminProfile(BaseWithTimestamps):
    __tablename__ = "admin_profiles"
    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    hashed_password: Mapped[str]
    role: Mapped[AdminRole] = mapped_column(Enum(AdminRole))

    user = relationship("User", back_populates="admin_profile")
