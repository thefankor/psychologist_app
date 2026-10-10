from datetime import datetime, timezone

from fastapi import Depends, HTTPException, UploadFile

from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.models import TransactionStatus, UserRole
from src.schemas.user import (
    AdminProfile,
    ProfileUpdateRequest,
    SessionSchema,
    TransactionSchema,
    UserDetailForAdmin,
    UserForAdmin,
    UserProfileResponse,
    UserSurvey,
    UserUpdateRequestForAdmin,
)
from src.utils import FileManager

file_manager = FileManager(
    upload_path="static/users",
)


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
            avatar=settings.STATIC_BASE_URL + profile.avatar
            if profile.avatar
            else None,
            birth_date=profile.birth_date,
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

    async def delete_client_profile(self, user_id: int):
        await self._store.client.delete(model_id=user_id)

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

    async def upload_photo(
        self, user_id: int, image: UploadFile, user_role: UserRole = UserRole.CLIENT
    ):
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail={
                    "detail": "Invalid image upload.",
                    "message": "Only image files are allowed",
                },
            )

        image_url = await file_manager.save_image(image)

        if user_role == UserRole.CLIENT:
            await self._store.client.update(
                model_id=user_id,
                return_model=False,
                avatar=image_url,
            )
        elif user_role == UserRole.PSYCHOLOGIST:
            await self._store.psychologist.update(
                model_id=user_id,
                return_model=False,
                avatar=image_url,
            )
        return {}

    async def get_admin_info(self, user_id: int) -> AdminProfile:
        role = await self._store.admin.get_admin_role(user_id=user_id)
        return AdminProfile(role=role)

    async def get_all_users(
        self, limit: int = 100, offset: int = 0
    ) -> list[UserForAdmin]:
        users = await self._store.user.get_all_users(limit=limit, offset=offset)
        return users

    async def get_user_by_id(self, user_id: int) -> UserDetailForAdmin:
        user = await self._store.user.get_user_by_id(user_id=user_id)
        return UserDetailForAdmin(
            id=user.id,
            email=user.email,
            name=user.name,
            phone=user.phone,
            roles=user.roles,
            age=user.age,
            transactions=[
                TransactionSchema(
                    id=1,
                    date=datetime.now(timezone.utc),
                    method="Mock method",
                    status=TransactionStatus.succeeded,
                ),
            ]
            if "CLIENT" in user.roles
            else [],
            sessions=[
                SessionSchema(
                    id=1,
                    date=datetime.now(timezone.utc),
                    psychologist_id=9,
                    how_long=59,
                ),
            ]
            if "CLIENT" in user.roles
            else [],
        )

    async def update_user_admin(self, user_id: int, data: UserUpdateRequestForAdmin):
        user_model_data = {}
        print(user_id)
        if data.email:
            user_model_data["email"] = data.email
        if data.roles:
            user_model_data["roles"] = [role.value for role in data.roles]

        if user_model_data:
            await self._store.user.update(
                model_id=user_id,
                return_model=False,
                **user_model_data,
            )

            del data.email
            del data.roles

        await self._store.client.upsert(
            user_id=user_id, **data.model_dump(exclude_unset=True)
        )
        return {}
