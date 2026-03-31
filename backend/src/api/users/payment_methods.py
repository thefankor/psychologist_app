from fastapi import APIRouter, Depends
from src.core.dependencies import get_current_user_id
from src.schemas import EmptyModel
from src.schemas.payment_methods import (
    ProfilePaymentMethod,
    SBPRequest,
    SBPRequestVerify,
)
from src.services.user.payment_methods_service import PaymentMethodService

router = APIRouter(tags=["Payment Methods"])


@router.get(
    "/",
    summary="Get profile payment methods",
    description="Получить способы оплаты",
    response_model=ProfilePaymentMethod,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def get_payment_methods(
    user_id: int = Depends(get_current_user_id),
    service: PaymentMethodService = Depends(),
):
    return await service.get_client_payment_methods(user_id=user_id)


@router.post(
    "/sbp/",
    summary="Set SPB payment method",
    description="Привязать номер для СБП",
    response_model=EmptyModel,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def set_sbp_payment_method(
    data: SBPRequest,
    _: int = Depends(get_current_user_id),
    service: PaymentMethodService = Depends(),
):
    await service.send_confirm_code(data=data)
    return {}


@router.delete(
    "/{payment_method_id}/",
    summary="Delete payment method",
    description="Удалить платежный метод",
    status_code=204,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        404: {
            "description": "Ресурс не найден",
            "content": {
                "application/json": {"example": {"detail": "Ресурс не найден"}}
            },
        },
    },
)
async def delete_payment_method(
    payment_method_id: int,
    _: int = Depends(get_current_user_id),
    service: PaymentMethodService = Depends(),
):
    return await service.delete_payment_method(method_id=payment_method_id)


@router.post(
    "/sbp/verify/",
    summary="Verify SBP phone number",
    description="Подтвердить номер для СБП",
    response_model=EmptyModel,
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
    },
)
async def verify_sbp_payment_method(
    data: SBPRequestVerify,
    user_id: int = Depends(get_current_user_id),
    service: PaymentMethodService = Depends(),
):
    await service.verify_code(user_id=user_id, phone=data.phone, code=data.code)
    return {}
