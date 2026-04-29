from datetime import datetime, timezone

from fastapi import Depends, File, HTTPException
from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.models.enums import ChatType
from src.schemas import GroupRequest
from src.schemas.groups import ChatSchema, MessageSchema
from src.utils import FileManager

file_manager = FileManager(
    upload_path="static/chats",
)


class ChatsService:
    """
    Сервис для управления пользователями системы.
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        self._store = store

    async def create_group(self, image: File, data: GroupRequest):
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail={
                    "detail": "Invalid image upload.",
                    "message": "Only image files are allowed",
                },
            )

        image_url = await file_manager.save_image(image)

        await self._store.chat.add(
            image=image_url, type=ChatType.GROUP, **data.model_dump()
        )
        return {}

    async def get_or_create_direct_chat(
        self, caller_id: int, other_user_id: int
    ) -> ChatSchema:
        if caller_id == other_user_id:
            raise HTTPException(
                status_code=400, detail="Нельзя создать чат с самим собой"
            )

        other_info = await self._store.client.get_name_and_avatar(user_id=other_user_id)
        if other_info is not None:
            display_name = other_info["name"] or f"Клиент {other_user_id}"
            avatar = other_info["avatar"]
        else:
            other_info = await self._store.psychologist.get_name_and_avatar(
                user_id=other_user_id
            )
            if other_info is None:
                raise HTTPException(status_code=404, detail="User not found")
            display_name = f"{other_info['first_name']} {other_info['last_name']}"
            avatar = other_info["avatar"]

        has_appointment = await self._store.appointment_attendee.has_shared_appointment(
            user_id_a=caller_id, user_id_b=other_user_id
        )
        if not has_appointment:
            raise HTTPException(status_code=403, detail="Нет совместной записи")

        chat = await self._store.chat.get_or_create_direct_chat(
            user_id_a=caller_id, user_id_b=other_user_id
        )
        msgs_by_chat = await self._store.chat.get_last_messages_by_chat_ids(
            chat_ids=[chat.id]
        )
        orm_msgs = msgs_by_chat.get(chat.id, [])
        last_messages = [MessageSchema.custom_validate(**m) for m in orm_msgs]

        return ChatSchema(
            id=chat.id,
            type=chat.type,
            name=display_name,
            image=settings.STATIC_BASE_URL + avatar if avatar else None,
            description=None,
            rules=None,
            last_messages=last_messages,
        )

    async def get_all_chats(self, user_id: int) -> list[ChatSchema]:
        groups = await self._store.chat.get_all_groups()
        directs = await self._store.chat.get_direct_chats_for_user(user_id=user_id)

        all_chat_ids = [c["id"] for c in groups] + [c["id"] for c in directs]
        msgs_by_chat = await self._store.chat.get_last_messages_by_chat_ids(
            chat_ids=all_chat_ids
        )

        result: list[ChatSchema] = []

        for c in groups:
            orm_msgs = msgs_by_chat.get(c["id"], [])
            last_messages = [MessageSchema.custom_validate(**m) for m in orm_msgs]

            result.append(
                ChatSchema(
                    id=c["id"],
                    type=c["type"],
                    name=c["name"],
                    description=c["description"],
                    image=settings.STATIC_BASE_URL + c["image"] if c["image"] else None,
                    rules=c["rules"],
                    last_messages=last_messages,
                )
            )

        for c in directs:
            other_user_id = c["other_user_id"]
            other_info = await self._store.client.get_name_and_avatar(
                user_id=other_user_id
            )
            if other_info is not None:
                display_name = other_info["name"] or f"Клиент {str(other_user_id)}"
                avatar = other_info["avatar"]
            else:
                other_info = await self._store.psychologist.get_name_and_avatar(
                    user_id=other_user_id
                )
                if other_info is not None:
                    display_name = (
                        f"{other_info['first_name']} {other_info['last_name']}"
                    )
                    avatar = other_info["avatar"]
                else:
                    display_name = "Пользователь"
                    avatar = None

            orm_msgs = msgs_by_chat.get(c["id"], [])
            last_messages = [MessageSchema.custom_validate(**m) for m in orm_msgs]

            result.append(
                ChatSchema(
                    id=c["id"],
                    type=c["type"],
                    name=display_name,
                    image=settings.STATIC_BASE_URL + avatar if avatar else None,
                    description=None,
                    rules=None,
                    last_messages=last_messages,
                )
            )

        result.sort(
            key=lambda c: c.last_messages[0].created_at
            if c.last_messages
            else datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )
        return result
