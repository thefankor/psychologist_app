import uuid

import pytest_asyncio

from src.crud import Store
from src.services.auth import AuthService


@pytest_asyncio.fixture(scope="function")
async def authorized_client(client, db_session):
    async with db_session as session:
        user_id = await Store(session).user.get_or_create_client(
            email=f"u_{uuid.uuid4().hex}@test.com"
        )
        await session.commit()

    auth_service = AuthService()
    tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})
    client.headers.update({"Authorization": f"Bearer {tokens.token}"})
    return client
