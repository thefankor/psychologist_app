from fastapi import APIRouter, Depends
from src.core.dependencies import get_any_user_id
from src.schemas.groups import ChatSchema, DirectChatRequest
from src.services.chats import ChatsService

router = APIRouter(tags=["Chats"])


@router.get(
    "/",
    summary="Get all chats",
    description="",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def get_chats(
    user_id: int = Depends(get_any_user_id),
    service: ChatsService = Depends(),
) -> list[ChatSchema]:
    return await service.get_all_chats(user_id=user_id)


@router.post(
    "/direct/",
    summary="Get or create direct chat",
)
async def get_or_create_direct_chat(
    data: DirectChatRequest,
    user_id: int = Depends(get_any_user_id),
    service: ChatsService = Depends(),
) -> ChatSchema:
    return await service.get_or_create_direct_chat(
        caller_id=user_id, other_user_id=data.other_user_id
    )
