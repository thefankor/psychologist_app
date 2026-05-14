from typing import AsyncGenerator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from src.core.db.database import get_async_db
from src.crud import Store
from src.models import Base
from src.services.auth import AuthService
from src.services.user import UserService
from tests.utils import TEST_DB_BACKEND

# Default: SQLite in-memory (fast, no DB setup). To run PG-only tests
# (EXCLUDE-constraint behaviour, JSONB, native enums), set
# TEST_DB_BACKEND=postgres and configure POSTGRES_* env vars; CI does this.
if TEST_DB_BACKEND == "postgres":
    from sqlalchemy.pool import NullPool

    from src.config import settings

    TEST_DATABASE_URL = settings.DATABASE_URL
    # NullPool: every operation opens a fresh connection. Avoids the
    # "Future attached to different loop" / "another operation in progress"
    # errors that come from sharing pooled asyncpg connections across the
    # per-test event loops pytest-asyncio creates.
    test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
else:
    TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    test_engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


def _truncate_pg_tables_sync():
    """Wipe data from all tables. Used once at session start in PG mode.

    Runs in its own asyncio.run() to avoid sharing the loop with pytest-asyncio.
    Schema must already exist (CI applies migrations before pytest).
    """
    import asyncio

    from sqlalchemy import text

    async def _impl():
        async with test_engine.begin() as conn:
            tables = ", ".join(t.name for t in Base.metadata.sorted_tables)
            await conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))

    asyncio.run(_impl())


@pytest.fixture(scope="session", autouse=True)
def _reset_pg_data():
    """Sync session-scope fixture so PG truncate doesn't leak event loops."""
    if TEST_DB_BACKEND == "postgres":
        _truncate_pg_tables_sync()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    if TEST_DB_BACKEND == "postgres":
        # Schema set up externally via `alembic upgrade head`; data cleaned
        # in _reset_pg_data above.
        pass
    else:
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


def pytest_collection_modifyitems(config, items):
    """Auto-skip tests marked `@requires_postgres` when not on a PG backend."""
    if TEST_DB_BACKEND == "postgres":
        return
    skip_pg = pytest.mark.skip(
        reason="requires PostgreSQL backend (set TEST_DB_BACKEND=postgres)"
    )
    for item in items:
        if "requires_postgres" in item.keywords:
            item.add_marker(skip_pg)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def override_get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest.fixture
def client():
    app.dependency_overrides[get_async_db] = override_get_async_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def store(db_session):
    return Store(session=db_session)


@pytest_asyncio.fixture
async def auth_service(db_session):
    return AuthService(store=Store(session=db_session))


@pytest_asyncio.fixture
async def user_service(db_session):
    return UserService(store=Store(session=db_session))


@pytest.fixture
def test_user_data():
    """Тестовые данные пользователя"""
    return {
        "username": "testuser",
        "phone": "+79001234567",
        "balance": 100.0,
        "avatar": "test_avatar.jpg",
        "about": "Test user description",
        "wallet": "test_wallet_address",
    }


@pytest.fixture
def test_user_data_for_service():
    """Тестовые данные пользователя"""
    return {
        "username": "testuserservice",
        "phone": "+79001234007",
        "balance": 100.0,
        "avatar": "test_avatar.jpg",
        "about": "Test user description",
        "wallet": "test_wallet_address",
    }


@pytest.fixture
def test_creator_data():
    """Тестовые данные создателя"""
    return {"email": "creator@test.com", "password": "testpassword123"}


@pytest.fixture
def test_news_data():
    """Тестовые данные новости"""
    return {
        "title": "Test News",
        "description": "Test news description",
        "image": "test_image.jpg",
    }
