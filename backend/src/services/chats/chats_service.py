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

    async def get_all_chats(self, user_id: int) -> list[ChatSchema]:
        chats = await self._store.chat.get_all_groups()
        chat_ids = [c.id for c in chats]
        msgs_by_chat = await self._store.chat.get_last_messages_by_chat_ids(
            chat_ids=chat_ids
        )
        result: list[ChatSchema] = []

        for c in chats:
            orm_msgs = msgs_by_chat.get(c.id, [])
            last_messages = [MessageSchema.custom_validate(**m) for m in orm_msgs]

            result.append(
                ChatSchema(
                    id=c.id,
                    type=c.type,
                    name=c.name,
                    description=c.description,
                    image=settings.STATIC_BASE_URL + c.image if c.image else None,
                    rules=c.rules,
                    last_messages=last_messages,
                )
            )
        return result
