from fastapi import APIRouter
from src.api.admin.auth import router as auth_router
from src.api.admin.groups import router as groups_router
from src.api.admin.users import router as users_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(users_router)
router.include_router(groups_router)
