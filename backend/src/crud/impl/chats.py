from uuid import UUID

from sqlalchemy import and_, case, func, insert, select

from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models import Chat, ChatMember, ChatMessage, ClientProfile, PsychologistProfile
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

    async def get_direct_chats_for_user(self, user_id: int):
        my_member = ChatMember.__table__.alias("my_member")
        other_member = ChatMember.__table__.alias("other_member")

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
                other_member.c.user_id.label("other_user_id"),
            )
            .join(my_member, my_member.c.chat_id == Chat.id)
            .join(
                other_member,
                and_(
                    other_member.c.chat_id == Chat.id,
                    other_member.c.user_id != user_id,
                ),
            )
            .join(last_msg, last_msg.c.chat_id == Chat.id)
            .where(
                self.model.type == ChatType.DIRECT,
                my_member.c.user_id == user_id,
            )
            .order_by(last_msg.c.last_msg_at.desc().nulls_last())
        )

        resp = await self.session.execute(query)
        return resp.mappings().all()

    async def get_last_messages_by_chat_ids(
        self,
        chat_ids: list[UUID],
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

        cp = ClientProfile.__table__.alias("cp")
        pp = PsychologistProfile.__table__.alias("pp")

        stmt = (
            select(
                messages_sub,
                case(
                    (cp.c.id.is_not(None), cp.c.name),
                    else_=func.concat(pp.c.first_name, " ", pp.c.last_name),
                ).label("author_name"),
                func.coalesce(cp.c.avatar, pp.c.avatar).label("author_avatar"),
                case(
                    (cp.c.id.is_not(None), "CLIENT"),
                    else_="PSYCHOLOGIST",
                ).label("author_role"),
            )
            .outerjoin(cp, cp.c.id == messages_sub.c.author_id)
            .outerjoin(pp, pp.c.id == messages_sub.c.author_id)
            .where(messages_sub.c.rn == 1)
        )

        result = await self.session.execute(stmt)
        rows = result.mappings().all()

        return {row["chat_id"]: row for row in rows}

    @handle_db_errors
    async def get_or_create_direct_chat(self, user_id_a: int, user_id_b: int) -> Chat:
        members_a = (
            select(ChatMember.chat_id).where(ChatMember.user_id == user_id_a).subquery()
        )
        members_b = (
            select(ChatMember.chat_id).where(ChatMember.user_id == user_id_b).subquery()
        )

        query = (
            select(Chat)
            .join(members_a, members_a.c.chat_id == Chat.id)
            .join(members_b, members_b.c.chat_id == Chat.id)
            .where(Chat.type == ChatType.DIRECT)
        )

        result = await self.session.execute(query)
        chat = result.scalar_one_or_none()

        if chat is not None:
            return chat

        chat = await self.add(
            type=ChatType.DIRECT,
            name=f"direct_{min(user_id_a, user_id_b)}_{max(user_id_a, user_id_b)}",
        )
        await self.session.execute(
            insert(ChatMember).values(chat_id=chat.id, user_id=user_id_a)
        )
        await self.session.execute(
            insert(ChatMember).values(chat_id=chat.id, user_id=user_id_b)
        )
        return chat

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
