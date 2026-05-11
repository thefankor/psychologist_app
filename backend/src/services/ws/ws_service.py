from fastapi import Depends
from src.core.dependencies import get_store
from src.crud import Store
from src.models.enums import ChatType
from src.schemas.ws import (
    AuthorSchema,
    MessageDeliveredEvent,
    MessageGetEvent,
    MessageReadEvent,
    MessageSendEvent,
    MessagesFetchEvent,
    MessagesHistoryEvent,
    TypingEvent,
    TypingIndicatorEvent,
    WSUser,
)
from src.services.ws.ws_manager import manager


class WSService:
    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        self._store = store

    async def handle_message_send(self, event: MessageSendEvent, user: WSUser):
        chat = await self._store.chat.check_chat_access(
            user_id=user.id, chat_id=event.chat_id
        )
        if not chat:
            await self._send_access_error_msg(user_id=user.id, chat_id=event.chat_id)
            return

        reply_to_id = await self._store.chat_message.find_one_id_or_none(
            id=event.reply_to, chat_id=event.chat_id
        )

        msg = await self._store.chat_message.add(
            return_model=True,
            author_id=user.id,
            chat_id=event.chat_id,
            text=event.text,
            media_url=str(event.media_id) if event.media_id else None,
            reply_to=reply_to_id,
        )
        await self._store._session.commit()

        author = AuthorSchema.custom_validate(**user.model_dump(mode="json"))

        msg_event = MessageGetEvent(
            event="message_new",
            message_id=msg.id,
            chat_id=msg.chat_id,
            author=author,
            text=msg.text,
            media_url=msg.media_url,
            created_at=msg.created_at,
            read_at=msg.read_at,
            reply_to=msg.reply_to,
        )

        if chat.type == ChatType.GROUP:
            await manager.broadcast_to_all_users(
                data=msg_event.model_dump(mode="json"),
                exclude_id=user.id,
            )
        else:
            recipients = await self._store.chat_member.find_all_members(
                chat_id=event.chat_id, sender_id=user.id
            )
            unique_receipts = set(map(lambda r: r["user_id"], recipients))

            await manager.broadcast_to_users(
                user_ids=unique_receipts,
                data=msg_event.model_dump(mode="json"),
            )

        delivery_event = MessageDeliveredEvent(
            event="message_delivered",
            local_message_id=event.local_message_id,
            message_id=msg.id,
            chat_id=msg.chat_id,
            author=author,
            text=msg.text,
            media_url=msg.media_url,
            created_at=msg.created_at,
            reply_to=msg.reply_to,
        )

        await manager.send_to_user(
            user_id=user.id,
            data=delivery_event.model_dump(mode="json"),
        )

    async def handle_typing(self, event: TypingEvent, user: WSUser):
        chat = await self._store.chat.check_chat_access(
            user_id=user.id, chat_id=event.chat_id
        )
        if not chat:
            await self._send_access_error_msg(user_id=user.id, chat_id=event.chat_id)
            return

        author = AuthorSchema.custom_validate(**user.model_dump(mode="json"))

        event = TypingIndicatorEvent(
            chat_id=event.chat_id,
            author=author,
        )

        if chat.type == ChatType.GROUP:
            await manager.broadcast_to_all_users(
                data=event.model_dump(mode="json"),
                exclude_id=user.id,
            )
        else:
            recipients = await self._store.chat_member.find_all_members(
                chat_id=event.chat_id, sender_id=user.id
            )
            await manager.broadcast_to_users(
                user_ids=recipients,
                data=event.model_dump(mode="json"),
            )

    async def _send_access_error_msg(self, user_id: int, chat_id: int):
        await manager.send_to_user(
            user_id,
            {
                "event": "error",
                "code": "unknown_chat",
                "message": f"Чат '{chat_id}' не найден или у вас отсутствует к нему доступ",
            },
        )

    async def handle_messages_fetch(self, event: MessagesFetchEvent, user: WSUser):
        chat = await self._store.chat.check_chat_access(
            user_id=user.id, chat_id=event.chat_id
        )
        if not chat:
            await self._send_access_error_msg(user_id=user.id, chat_id=event.chat_id)
            return

        rows = await self._store.chat_message.get_history(
            chat_id=event.chat_id,
            before_message_id=event.before_message_id,
            limit=event.limit,
        )

        messages = [
            MessageGetEvent(
                event="message_new",
                message_id=row["id"],
                chat_id=row["chat_id"],
                author=AuthorSchema.custom_validate(
                    id=row["author_id"],
                    name=row["author_name"] or "",
                    role=row["author_role"],
                    avatar=row["author_avatar"],
                ),
                text=row["text"],
                media_url=row["media_url"],
                created_at=row["created_at"],
                read_at=row["read_at"],
                reply_to=row["reply_to"],
            )
            for row in rows
        ]

        history_event = MessagesHistoryEvent(
            chat_id=event.chat_id,
            messages=messages,
        )
        await manager.send_to_user(
            user_id=user.id,
            data=history_event.model_dump(mode="json"),
        )

    async def handle_reading(self, event: TypingEvent, user: WSUser):
        chat = await self._store.chat.check_chat_access(
            user_id=user.id, chat_id=event.chat_id
        )
        if not chat:
            await self._send_access_error_msg(user_id=user.id, chat_id=event.chat_id)
            return

        await self._store.chat_message.mark_as_read(
            chat_id=event.chat_id, before_message_id=event.before_message_id
        )
        await self._store._session.commit()

        event = MessageReadEvent(
            chat_id=event.chat_id,
            before_message_id=event.before_message_id,
        )

        if chat.type == ChatType.GROUP:
            await manager.broadcast_to_all_users(
                data=event.model_dump(mode="json"),
                exclude_id=user.id,
            )
        else:
            recipients = await self._store.chat_member.find_all_members(
                chat_id=event.chat_id, sender_id=user.id
            )
            await manager.broadcast_to_users(
                user_ids=recipients,
                data=event.model_dump(mode="json"),
            )
