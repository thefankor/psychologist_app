from fastapi import APIRouter

from src.api.users.favorites import router as favorites_router
from src.api.users.payment_methods import router as payment_methods_router
from src.api.users.user import router as user_router

router = APIRouter()

router.include_router(user_router, prefix="")
router.include_router(payment_methods_router, prefix="/methods")
router.include_router(favorites_router, prefix="/psychologists/favorites")
