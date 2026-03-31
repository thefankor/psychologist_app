from fastapi import APIRouter, Depends, File, Form, UploadFile
from src.core.dependencies import get_current_admin_id
from src.schemas import EmptyModel, GroupRequest
from src.services.chats import ChatsService

router = APIRouter(tags=["Admin Groups"])


@router.post(
    "/groups/",
    summary="Create group",
    description="Создание групп (для чатов)",
    responses={
        400: {
            "description": "Only image files are allowed",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid image upload.", "message": ""}
                },
            },
        },
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def create_group(
    image: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(None),
    rules: str = Form(None),
    _: int = Depends(get_current_admin_id),
    group_service: ChatsService = Depends(),
) -> EmptyModel:
    response = await group_service.create_group(
        image=image,
        data=GroupRequest(
            name=name,
            description=description,
            rules=rules,
        ),
    )
    return response
