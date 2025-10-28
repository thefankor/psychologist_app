from fastapi import Depends

from src.core.dependencies import get_store
from src.crud import Store
from src.schemas.payment_methods import SBP, ProfilePaymentMethod
from src.schemas.user import ProfileUpdateRequest, UserProfileResponse, UserSurvey


class UserService:
    """Сервис для управления пользователями системы.

    Предоставляет бизнес-логику для работы с пользователями: создание,
    обновление, проверка статуса и управление языковыми настройками.
    Интегрируется с DAO слоем для выполнения операций с базой данных.

    Используется в:
    - Эндпоинтах пользователей для CRUD операций
    - AuthenticationService для проверки пользователей
    - ReferralService для создания реферальных связей
    """

    def __init__(self, store: Store = Depends(get_store)):
        """Инициализация сервиса пользователей.

        Args:
            store: Хранилище данных, используемое для операций с пользователями.
        """
        self._store = store

    async def get_client_profile(self, user_id: int) -> UserProfileResponse:
        user, profile = await self._store.user.get_client_full(user_id)

        # noinspection PyTypeChecker
        return UserProfileResponse(
            id=user.id,
            name=profile.name,
            email=user.email,
            phone=profile.phone,
            notifications=profile.notifications,
            subscription=None,
            timezone=profile.timezone,
            avatar=profile.avatar,
            birth_date=profile.birth_date,  # TODO: добавить поле в модели
            gender=profile.gender,
            new=profile.is_new,
        )

    async def fill_survey(self, user_id: int, data: UserSurvey):
        await self._store.client.update(
            model_id=user_id,
            is_new=False,
            return_model=False,
            name=data.name,
            birth_date=data.birth_date,
            gender=data.gender,
            emotions=data.emotions,
            relations=data.relations,
            work=data.work,
            life=data.life,
            personal=data.personal,
            format=data.format,
            timezone=data.timezone,
            time_format=data.long,
            pricing_format=data.pricing,
            date_format=data.time,
            method_format=data.method,
        )

    async def mark_account_as_deleted(self, user_id: int):
        await self._store.client.update(
            model_id=user_id,
            return_model=False,
            is_active=False,
        )

    async def update_profile(self, user_id: int, data: ProfileUpdateRequest):
        if data.email:
            await self._store.user.update(
                model_id=user_id,
                return_model=False,
                email=data.email,
            )

            del data.email

        await self._store.client.update(
            model_id=user_id, return_model=False, **data.model_dump(exclude_unset=True)
        )
        return {}

    async def get_payment_methods(self, user_id: int):
        return ProfilePaymentMethod(sbp=SBP(id=1, phone="+79990998767", bank="Сбер"))
