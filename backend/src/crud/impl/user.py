from fastapi import HTTPException
from sqlalchemy import func, select, text, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import selectinload
from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models import AdminProfile, ClientProfile, PsychologistProfile, User, UserRole


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
        Проверяет существование записи по ID и роли (roles — JSON список строк)
        Используется в dependencies при проверке токена.
        """
        role_value = role.value if isinstance(role, UserRole) else role
        role_value = role_value.upper()

        stmt = select(self.model.id).where(self.model.id == user_id)

        if role_value == UserRole.CLIENT.value:
            stmt = stmt.join(ClientProfile, ClientProfile.id == self.model.id).where(
                ClientProfile.is_active.is_(True)
            )

        dialect_name = self.session.bind.dialect.name

        if dialect_name == "postgresql":
            stmt = stmt.where(self.model.roles.op("?")(role_value))
        else:
            stmt = stmt.where(
                text("EXISTS (SELECT 1 FROM json_each(users.roles) WHERE value = :rv)")
            ).params(rv=role_value)

        result = await self.session.execute(stmt)
        instance = result.scalar_one_or_none()
        return instance is not None

    @handle_db_errors
    async def get_or_create_client(self, email: str) -> int:
        """Возвращает ID пользователя, создаёт при отсутствии."""

        stmt = (
            insert(User)
            .values(email=email, roles=[UserRole.CLIENT.value])
            .on_conflict_do_nothing(index_elements=[User.email])
            .returning(User.id)
        )
        result = await self.session.execute(stmt)
        uid = result.scalar_one_or_none()

        if uid is None:
            result = await self.session.execute(
                select(User.id).where(User.email == email)
            )
            uid = result.scalar_one()

            await self.session.execute(
                update(User)
                .where(User.id == uid)
                .where(~User.roles.op("?")("CLIENT"))
                .values(roles=User.roles + func.jsonb_build_array("CLIENT"))
            )

        stmt_profile = (
            insert(ClientProfile)
            .values(id=uid)
            .on_conflict_do_nothing(index_elements=[ClientProfile.id])
        )
        await self.session.execute(stmt_profile)

        return uid

    @handle_db_errors
    async def get_or_create_psychologist(self, email: str) -> int:
        """Возвращает ID пользователя, создаёт при отсутствии."""

        stmt = (
            insert(User)
            .values(email=email, roles=[UserRole.PSYCHOLOGIST.value])
            .on_conflict_do_nothing(index_elements=[User.email])
            .returning(User.id)
        )
        result = await self.session.execute(stmt)
        uid = result.scalar_one_or_none()

        if uid is None:
            result = await self.session.execute(
                select(User.id).where(User.email == email)
            )
            uid = result.scalar_one()

            await self.session.execute(
                update(User)
                .where(User.id == uid)
                .where(~User.roles.op("?")("PSYCHOLOGIST"))
                .values(roles=User.roles + func.jsonb_build_array("PSYCHOLOGIST"))
            )

        stmt_profile = (
            insert(PsychologistProfile)
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

    async def get_psychologist_full(
        self, user_id: int
    ) -> tuple[User, PsychologistProfile]:
        """
        Возвращает пару (user, psychologist_profile) для психолога.
        Если профиля нет — вернёт (user, None).
        Бросит 404, если пользователя нет.
        """
        stmt = (
            select(User)
            .options(selectinload(User.psychologist_profile))
            .where(User.id == user_id)
        )

        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None or user.psychologist_profile is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user, user.psychologist_profile

    async def get_by_email(self, email: str):
        stmt = (
            select(User.id, AdminProfile.hashed_password)
            .join(AdminProfile, AdminProfile.id == User.id)
            .where(User.email == email)
        )
        result = await self.session.execute(stmt)
        return result.mappings().first()

    async def get_all_users(self, limit: int = 100, offset: int = 0):
        query = (
            select(
                self.model.id,
                self.model.email,
                self.model.roles,
                ClientProfile.name,
                ClientProfile.phone,
            )
            .join(ClientProfile, ClientProfile.id == self.model.id, isouter=True)
            .order_by(self.model.id)
            .limit(limit)
            .offset(offset)
        )

        if offset is not None:
            query = query.offset(offset)

        if limit is not None:
            query = query.limit(limit)

        result = await self.session.execute(query)
        return result.mappings().all()

    async def get_user_by_id(self, user_id: int):
        query = (
            select(
                self.model.id,
                self.model.email,
                self.model.roles,
                ClientProfile.name,
                ClientProfile.phone,
                ClientProfile.age,
            )
            .join(ClientProfile, ClientProfile.id == self.model.id, isouter=True)
            .where(self.model.id == user_id)
        )

        result = await self.session.execute(query)
        user = result.mappings().one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Record not found")
        return user
