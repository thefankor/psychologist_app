import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.models import BaseWithTimestamps


class UserFavorite(BaseWithTimestamps):
    __tablename__ = "user_favorites"

    __table_args__ = (
        UniqueConstraint(
            "user_id", "psychologist_id", name="uq_favorites_user_psychologist"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("client_profiles.id", ondelete="CASCADE")
    )
    psychologist_id: Mapped[int] = mapped_column(ForeignKey("psychologist_profiles.id"))
