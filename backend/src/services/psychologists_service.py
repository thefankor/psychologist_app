from fastapi import Depends

from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.schemas.psychologists import (
    PsychologistProfileSchema,
    PsychologistProfileUpdate,
)


class PsychologistService:
    """
    Сервис для управления пользователями системы.
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        self._store = store

    async def get_profile(self, psychologist_id: int) -> PsychologistProfileSchema:
        user, profile = await self._store.user.get_psychologist_full(
            user_id=psychologist_id
        )

        return PsychologistProfileSchema(
            id=user.id,
            email=user.email,
            first_name=profile.first_name,
            last_name=profile.last_name,
            methods=profile.methods,
            avatar=settings.STATIC_BASE_URL + profile.avatar
            if profile.avatar
            else None,
            experience=profile.experience,
            price=profile.price,
            age=profile.age,
            gender=profile.gender,
            rating=profile.rating,
            timezone=profile.timezone,
            session_duration_minutes=profile.session_duration_minutes,
        )

    async def update_profile(self, user_id: int, data: PsychologistProfileUpdate):
        if data.email:
            await self._store.user.update(
                model_id=user_id,
                return_model=False,
                email=data.email,
            )

            del data.email

        await self._store.psychologist.update(
            model_id=user_id, return_model=False, **data.model_dump(exclude_unset=True)
        )
        return {}
