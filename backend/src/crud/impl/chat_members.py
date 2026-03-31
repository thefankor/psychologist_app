from uuid import UUID

from sqlalchemy import select
from src.crud.impl.base import BaseDAO
from src.models import ChatMember


class ChatMembersDAO(BaseDAO):
    """
    DAO для работы с участниками чатами
    """

    model = ChatMember

    async def find_all_members(self, chat_id: UUID, sender_id: int):
        query = (
            select(self.model.user_id)
            .where(self.model.chat_id == chat_id)
            .where(self.model.user_id != sender_id)
        )
        resp = await self.session.execute(query)
        return resp.mappings().all()
