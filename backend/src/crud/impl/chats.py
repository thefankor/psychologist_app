from uuid import UUID

from sqlalchemy import and_, func, select
from src.crud.impl.base import BaseDAO
from src.models import Chat, ChatMember, ChatMessage
from src.models.enums import ChatType


class ChatsDAO(BaseDAO):
    """
    DAO для работы с чатами
    """

    model = Chat

    async def get_all_groups(self):
        last_msg = (
            select(
                ChatMessage.chat_id,
                func.max(ChatMessage.created_at).label("last_msg_at"),
            )
            .group_by(ChatMessage.chat_id)
            .subquery()
        )

        query = (
            select(
                self.model.id,
                self.model.type,
                self.model.name,
                self.model.description,
                self.model.image,
                self.model.rules,
                last_msg.c.last_msg_at.label("last_message_at"),
            )
            .outerjoin(last_msg, last_msg.c.chat_id == Chat.id)
            .where(self.model.type == ChatType.GROUP)
            .order_by(last_msg.c.last_msg_at.desc().nulls_last())
        )

        resp = await self.session.execute(query)
        return resp.mappings().all()

    async def get_last_messages_by_chat_ids(
        self,
        chat_ids: list[UUID],
        limit_per_chat: int = 20,
    ):
        if not chat_ids:
            return {}

        messages_sub = (
            select(
                ChatMessage.id,
                ChatMessage.chat_id,
                ChatMessage.author_id,
                ChatMessage.text,
                ChatMessage.media_url,
                ChatMessage.created_at,
                ChatMessage.read_at,
                ChatMessage.reply_to,
                ChatMessage.updated_at,
                func.row_number()
                .over(
                    partition_by=ChatMessage.chat_id,
                    order_by=ChatMessage.created_at.desc(),
                )
                .label("rn"),
            )
            .where(ChatMessage.chat_id.in_(chat_ids))
            .subquery()
        )

        stmt = select(messages_sub).where(messages_sub.c.rn <= limit_per_chat)

        result = await self.session.execute(stmt)
        rows = result.mappings().all()

        msgs_by_chat: dict[UUID, list[ChatMessage]] = {}

        for row in rows:
            chat_id: UUID = row["chat_id"]

            msgs_by_chat.setdefault(chat_id, []).append(row)

        for chat_id, msgs in msgs_by_chat.items():
            msgs.sort(key=lambda m: m.created_at, reverse=True)

        return msgs_by_chat

    async def check_chat_access(self, user_id: int, chat_id: UUID):
        """
        Возвращает ORM-объект чата, если у пользователя есть доступ.
        Если чата нет или доступа нет — возвращает None.
        """
        query = (
            select(
                Chat.id.label("chat_id"),
                Chat.type.label("chat_type"),
                ChatMember.user_id.label("member_user_id"),
            )
            .select_from(Chat)
            .outerjoin(
                ChatMember,
                and_(
                    ChatMember.chat_id == Chat.id,
                    ChatMember.user_id == user_id,
                ),
            )
            .where(Chat.id == chat_id)
        )

        resp = await self.session.execute(query)
        data = resp.mappings().first()

        if data is None:
            return None

        chat_type = data["chat_type"]
        member_user_id = data["member_user_id"]

        if chat_type == ChatType.GROUP:
            return Chat(id=chat_id, type=chat_type)

        if member_user_id is None:
            return None

        return Chat(id=chat_id, type=chat_type)
