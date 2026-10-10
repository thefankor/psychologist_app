from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.config import settings
from src.models.enums import ChatType


class GroupRequest(BaseModel):
    name: str
    description: str
    rules: str


class DirectChatRequest(BaseModel):
    other_user_id: int


class AuthorSchema(BaseModel):
    id: int
    name: str
    role: str
    avatar: str | None = None


class MessageSchema(BaseModel):
    id: UUID
    chat_id: UUID
    author: AuthorSchema
    text: str | None
    media_url: str | None
    created_at: datetime
    read_at: datetime | None
    reply_to: UUID | None = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def custom_validate(
        cls,
        id: UUID,
        chat_id: UUID,
        author_id: int,
        text: str | None,
        media_url: str | None,
        created_at: datetime,
        updated_at: datetime,
        read_at: datetime | None,
        author_name: str | None = None,
        author_avatar: str | None = None,
        author_role: str = "CLIENT",
        reply_to: UUID | None = None,
        **kwargs,
    ):
        return MessageSchema(
            id=id,
            chat_id=chat_id,
            author=AuthorSchema(
                id=author_id,
                name=author_name or "",
                role=author_role,
                avatar=settings.STATIC_BASE_URL + author_avatar
                if author_avatar
                else None,
            ),
            text=text,
            media_url=media_url,
            created_at=created_at,
            read_at=read_at,
            reply_to=reply_to,
            updated_at=updated_at,
        )


class DirectChatCreatedSchema(BaseModel):
    id: UUID
    type: ChatType
    image: str | None
    name: str
    description: str | None
    rules: str | None


class ChatSchema(BaseModel):
    id: UUID
    type: ChatType
    image: str | None
    name: str
    description: str | None
    rules: str | None
    last_message: MessageSchema | None = None
