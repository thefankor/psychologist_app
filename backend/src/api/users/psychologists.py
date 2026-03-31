from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_user_id
from src.schemas.psychologists import PsychologistResponse
from src.services.user.psychologists import PsychologistsService

router = APIRouter(tags=["Psychologists"])


@router.get(
    "/",
    summary="Get all psychologists",
    description="Получить список всех психологов",
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def get_all_psychologists(
    _: int = Depends(get_current_user_id),
    service: PsychologistsService = Depends(),
) -> list[PsychologistResponse]:
    return await service.get_all_psychologists()
