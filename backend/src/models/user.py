from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models.base import BaseWithTimestamps
from src.models.enums import UserRole


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


class AdminProfile(BaseWithTimestamps):
    __tablename__ = "admin_profiles"
    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="admin_profile")
