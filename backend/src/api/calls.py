from fastapi import APIRouter, Depends

from src.core.dependencies import get_current_user_id
from src.schemas import CallTokenResponse, CallTokenRequest
from src.services.call import CallService

router = APIRouter(tags=["Calls"])


@router.post(
    "/",
    summary="Start call",
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
async def get_profile(
    data: CallTokenRequest,
    user_id: int = Depends(get_current_user_id),
    call_service: CallService = Depends()
) -> CallTokenResponse:
    return await call_service.get_token(user_id=user_id, appointment_id=data.appointment_id)
