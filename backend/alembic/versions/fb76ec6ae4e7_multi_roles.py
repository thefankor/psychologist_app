from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fb76ec6ae4e7"
down_revision: Union[str, Sequence[str], None] = "1108c89d7d9c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # 1) Создаём ENUM-тип заранее
    adminrole = postgresql.ENUM("ADMIN", "MODERATOR", "SUPPORT", name="adminrole")
    adminrole.create(bind, checkfirst=True)

    op.add_column(
        "users",
        sa.Column(
            "roles",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[\"CLIENT\"]'::jsonb"),
        ),
    )

    # 2) Колонки добавляем "мягко": сначала nullable / с server_default
    #    (чтобы не упасть на существующих строках)
    op.add_column(
        "admin_profiles", sa.Column("hashed_password", sa.String(), nullable=True)
    )
    op.add_column("admin_profiles", sa.Column("role", adminrole, nullable=True))

    # 4) Перенос/заполнение данных (если было старое users.role)
    #    Пример: если была колонка 'role' Enum(UserRole), маппим в массив из одного элемента.
    #    Если старой колонки нет/пусто — останется ["client"] из server_default.
    try:
        op.execute("""
            UPDATE users
            SET roles = to_jsonb(ARRAY[LOWER(role::text)])
            WHERE roles IS NULL
        """)
    except Exception:
        # Если старой колонки 'role' уже нет, просто пропустим
        pass

    # 5) Заполним admin_profiles.role (выберите что вам подходит)
    #    Здесь всем администраторам поставим ADMIN, при необходимости скорректируйте UPDATE.
    op.execute("UPDATE admin_profiles SET role = 'ADMIN' WHERE role IS NULL")

    # 6) Теперь ужесточаем ограничения: делаем NOT NULL и убираем server_default
    op.alter_column("admin_profiles", "role", nullable=False)
    # hashed_password: решите, должен ли быть NOT NULL. Если да — либо подставьте значения, либо оставьте server_default.
    # Временный безопасный вариант — оставить nullable=True. Если нужно NOT NULL:
    # op.execute("UPDATE admin_profiles SET hashed_password = '' WHERE hashed_password IS NULL")
    # op.alter_column('admin_profiles', 'hashed_password', nullable=False)

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_users_roles_gin ON users USING gin (roles);"
    )

    # 7) Старую колонку role из users удаляем в самом конце
    with op.batch_alter_table("users") as batch:
        # если её ещё не удалили — удалим; если нет, Alembic упадёт — завернём в try/except
        try:
            batch.drop_column("role")
        except Exception:
            pass


def downgrade() -> None:
    bind = op.get_bind()

    # Вернём старую колонку users.role (нужен тип userrole; создадим на всякий случай)
    op.execute("DROP INDEX IF EXISTS ix_users_roles_gin;")
    userrole = postgresql.ENUM("CLIENT", "PSYCHOLOGIST", "ADMIN", name="userrole")
    userrole.create(bind, checkfirst=True)

    op.add_column("users", sa.Column("role", userrole, nullable=True))

    # Попробуем восстановить одно значение из массива roles (берём первый элемент)
    op.execute("""
        UPDATE users
        SET role = UPPER((roles->>0))::userrole
        WHERE jsonb_typeof(roles) = 'array' AND jsonb_array_length(roles) > 0
    """)

    # Затем можно ужесточить до NOT NULL, если уверены что все строки заполнены:
    # op.alter_column('users', 'role', nullable=False)

    op.drop_column("users", "roles")

    # admin_profiles: снимем NOT NULL, потом удалим колонки
    op.alter_column("admin_profiles", "role", nullable=True)
    op.drop_column("admin_profiles", "role")
    op.drop_column("admin_profiles", "hashed_password")

    # ENUM adminrole убираем (после удаления колонки)
    adminrole = postgresql.ENUM(name="adminrole")
    adminrole.drop(bind, checkfirst=True)
