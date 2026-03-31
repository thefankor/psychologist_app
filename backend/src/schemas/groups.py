from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from src.models.enums import ChatType


class GroupRequest(BaseModel):
    name: str
    description: str
    rules: str


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
        reply_to: UUID | None = None,
        **kwargs,
    ):
        return MessageSchema(
            id=id,
            chat_id=chat_id,
            author=AuthorSchema(
                id=author_id,
                name="Mock Test Name",
                role="CLIENT",
                avatar=None,
            ),
            text=text,
            media_url=media_url,
            created_at=created_at,
            read_at=read_at,
            reply_to=reply_to,
            updated_at=updated_at,
        )


class ChatSchema(BaseModel):
    id: UUID
    type: ChatType
    image: str
    name: str
    description: str
    rules: str
    last_messages: list[MessageSchema]
