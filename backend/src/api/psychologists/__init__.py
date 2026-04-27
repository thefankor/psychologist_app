from fastapi import APIRouter
from src.api.psychologists.appointments import router as appointments_router
from src.api.psychologists.client_notes import router as client_notes_router
from src.api.psychologists.clients import router as clients_router
from src.api.psychologists.profile import router as profile_router
from src.api.psychologists.working_hours import router as working_hours_router

router = APIRouter()

router.include_router(profile_router, prefix="/profile")
router.include_router(appointments_router, prefix="/appointments")
router.include_router(clients_router, prefix="/clients")
router.include_router(client_notes_router, prefix="/clients")
router.include_router(working_hours_router, prefix="/working-hours")
