from fastapi import APIRouter

from src.api.auth import router as auth_router
from src.api.calls import router as call_router
from src.api.users import router as user_router

router = APIRouter(prefix="")
router.include_router(auth_router, prefix="/auth")
router.include_router(user_router, prefix="/user")
router.include_router(call_router, prefix="/calls")
