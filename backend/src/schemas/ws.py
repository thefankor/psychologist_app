from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field, TypeAdapter
from src.config import settings


class WSUser(BaseModel):
    id: int
    name: str
    role: str
    avatar: str | None = None


class BaseEvent(BaseModel):
    event: str
    chat_id: UUID


class MessageSendEvent(BaseEvent):
    event: Literal["message_send"]
    chat_id: UUID
    local_message_id: UUID
    text: str
    media_id: int | None = None
    reply_to: UUID | None = None


class TypingEvent(BaseEvent):
    event: Literal["typing"]
    chat_id: UUID


class ReadEvent(BaseEvent):
    event: Literal["read"]
    chat_id: UUID
    before_message_id: UUID


class MessagesFetchEvent(BaseEvent):
    event: Literal["messages_fetch"]
    chat_id: UUID
    before_message_id: UUID | None = None
    limit: int = Field(default=50, ge=1, le=100)


# alias для union-типа с дискриминатором
EventInType = Annotated[
    MessageSendEvent | TypingEvent | ReadEvent | MessagesFetchEvent,
    Field(discriminator="event"),
]

# TypeAdapter для валидации
event_adapter = TypeAdapter(EventInType)


class AuthorSchema(BaseModel):
    id: int
    name: str
    role: str
    avatar: str | None = None

    @classmethod
    def custom_validate(cls, id: int, name: str, role: str, avatar: str):
        return AuthorSchema(
            id=id,
            name=name,
            role=role,
            avatar=settings.STATIC_BASE_URL + avatar if avatar else None,
        )


class MessageGetEvent(BaseEvent):
    event: Literal["message_new"]
    message_id: UUID
    chat_id: UUID
    author: AuthorSchema
    text: str | None
    media_url: str | None
    reply_to: UUID | None = None
    created_at: datetime
    read_at: datetime | None = None


class MessageDeliveredEvent(MessageGetEvent):
    event: Literal["message_delivered"]
    local_message_id: UUID


class TypingIndicatorEvent(BaseEvent):
    event: Literal["typing_indicator"] = "typing_indicator"
    chat_id: UUID
    author: AuthorSchema


class MessageReadEvent(BaseEvent):
    event: Literal["message_read"] = "message_read"
    chat_id: UUID
    before_message_id: UUID


class MessagesHistoryEvent(BaseEvent):
    event: Literal["messages_history"] = "messages_history"
    chat_id: UUID
    messages: list[MessageGetEvent]
