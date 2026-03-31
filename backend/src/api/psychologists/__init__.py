from fastapi import APIRouter
from src.api.psychologists.appointments import router as appointments_router
from src.api.psychologists.profile import router as profile_router

router = APIRouter()

router.include_router(profile_router, prefix="/profile")
router.include_router(appointments_router, prefix="/appointments")
