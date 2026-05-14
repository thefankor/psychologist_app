"""Shared fixtures for integration API tests.

Provides authed_psy/authed_client TestClient fixtures that bypass the full
OTP auth flow via FastAPI dependency overrides. Tests focus on slot/booking
logic, not auth.
"""
import uuid

import pytest
import pytest_asyncio
from main import app
from src.core.dependencies import (
    get_any_user_id,
    get_current_psychologist_id,
    get_current_user_id,
)
from src.models.enums import UserRole


@pytest_asyncio.fixture
async def psy_id(store):
    user = await store.user.add(
        return_model=True,
        email=f"psy-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    await store.psychologist.add(
        return_model=False,
        id=user.id,
        first_name="T",
        last_name="P",
        timezone="Europe/Moscow",
        session_duration_minutes=60,
    )
    # Commit so the route handler (in a separate session) can see this user.
    # On SQLite (StaticPool) this is a no-op for visibility; on PG (NullPool)
    # it's required because every session opens an independent connection
    # with its own transaction.
    await store.session.commit()
    return user.id


@pytest_asyncio.fixture
async def client_id(store):
    user = await store.user.add(
        return_model=True,
        email=f"c-{uuid.uuid4()}@example.com",
        roles=[UserRole.CLIENT.value],
    )
    await store.session.commit()
    return user.id


@pytest.fixture
def authed_psy(client, psy_id):
    """TestClient pre-authed as a psy (FastAPI dependency override)."""
    app.dependency_overrides[get_current_psychologist_id] = lambda: psy_id
    app.dependency_overrides[get_any_user_id] = lambda: psy_id
    yield client
    app.dependency_overrides.pop(get_current_psychologist_id, None)
    app.dependency_overrides.pop(get_any_user_id, None)


@pytest.fixture
def authed_client(client, client_id):
    """TestClient pre-authed as a client (FastAPI dependency override)."""
    app.dependency_overrides[get_current_user_id] = lambda: client_id
    app.dependency_overrides[get_any_user_id] = lambda: client_id
    yield client
    app.dependency_overrides.pop(get_current_user_id, None)
    app.dependency_overrides.pop(get_any_user_id, None)
