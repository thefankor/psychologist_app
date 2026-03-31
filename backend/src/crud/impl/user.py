from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import selectinload
from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models import ClientProfile, User, UserRole


class UserDAO(BaseDAO):
    """DAO для работы с пользователями.

    Предоставляет методы для управления пользователями, проверки
    их статуса, создания новых пользователей и получения информации.

    Используется в:
    - UserService для бизнес-логики пользователей
    - AuthenticationService для проверки пользователей
    """

    model = User

    @handle_db_errors
    async def check_exist(self, user_id: int, role: UserRole):
        """
        Проверяет существование записи по ID и роли
        Используется для в dependencies при проверке токена
        """
        if role == UserRole.CLIENT.value:
            stmt = (
                select(self.model.id)
                .join(ClientProfile, ClientProfile.id == self.model.id)
                .where(self.model.id == user_id)
                .where(self.model.role == role)
                .where(ClientProfile.is_active.is_(True))
            )
        else:
            print(role)
            stmt = select(self.model.id).filter_by(id=user_id, role=role)
        result = await self.session.execute(stmt)
        instance = result.scalar_one_or_none()
        return True if instance else False

    @handle_db_errors
    async def get_or_create_client(self, email: str) -> int:
        """Возвращает ID пользователя, создаёт при отсутствии."""
        # norm_email = email.strip().lower()

        stmt = (
            insert(User)
            .values(email=email, role=UserRole.CLIENT)
            .on_conflict_do_nothing(index_elements=[User.email])
            .returning(User.id)
        )
        result = await self.session.execute(stmt)
        uid = result.scalar_one_or_none()

        # 2) Если пользователь уже был — достаём id без изменения роли
        if uid is None:
            result = await self.session.execute(
                select(User.id).where(User.email == email)
            )
            uid = result.scalar_one()

        # 3) Гарантируем профиль клиента (идемпотентно)
        stmt_profile = (
            insert(ClientProfile)
            .values(id=uid)
            .on_conflict_do_nothing(index_elements=[ClientProfile.id])
        )
        await self.session.execute(stmt_profile)

        return uid

    async def get_client_full(self, user_id: int) -> tuple[User, ClientProfile]:
        """
        Возвращает пару (user, client_profile) для клиента.
        Если профиля нет — вернёт (user, None).
        Бросит 404, если пользователя нет.
        """
        stmt = (
            select(User)
            .options(selectinload(User.client_profile))
            .where(User.id == user_id)
        )

        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None or user.client_profile is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user, user.client_profile
