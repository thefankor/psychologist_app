import uuid
from datetime import datetime

from sqlalchemy import TIMESTAMP, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.models import BaseWithTimestamps
from src.models.enums import ChatType


class Chat(BaseWithTimestamps):
    __tablename__ = "chats"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    type: Mapped[ChatType] = mapped_column(Enum(ChatType))
    name: Mapped[str]
    description: Mapped[str | None]
    image: Mapped[str | None]
    rules: Mapped[str | None]


class ChatMember(BaseWithTimestamps):
    __tablename__ = "chat_members"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    chat_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chats.id", ondelete="CASCADE")
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    __table_args__ = (
        UniqueConstraint("chat_id", "user_id", name="uq_user_chat_members"),
    )


class ChatMessage(BaseWithTimestamps):
    __tablename__ = "chat_messages"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    chat_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chats.id", ondelete="CASCADE")
    )
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String)
    media_url: Mapped[str | None]
    reply_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("chat_messages.id", ondelete="SET NULL")
    )
    read_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
