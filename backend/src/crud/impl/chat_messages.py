from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from src.crud.impl.base import BaseDAO
from src.models import ChatMessage


class ChatMessagesDAO(BaseDAO):
    """
    DAO для работы с сообщениями чатами
    """

    model = ChatMessage

    async def mark_as_read(self, chat_id: UUID, before_message_id: UUID) -> None:
        last_dt_subq = (
            select(ChatMessage.created_at)
            .where(
                ChatMessage.id == before_message_id,
                ChatMessage.chat_id == chat_id,
            )
            .scalar_subquery()
        )

        query = (
            update(ChatMessage)
            .where(ChatMessage.chat_id == chat_id)
            .where(ChatMessage.created_at <= last_dt_subq)
            .values(read_at=datetime.now(timezone.utc))
        )

        await self.session.execute(query)
