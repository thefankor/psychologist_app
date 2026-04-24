from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseWithTimestamps


class ClientNote(BaseWithTimestamps):
    __tablename__ = "client_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    psychologist_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    client_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    text: Mapped[str] = mapped_column(Text)
