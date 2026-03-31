import pytest
from src.crud import Store
from src.models import User
from src.services.auth import AuthService


class TestUserEndpoints:
    """API тесты для эндпоинтов пользователей"""

    @pytest.mark.asyncio
    async def test_get_me_success(self, client, db_session):
        """Тест успешного получения профиля пользователя"""

        async with db_session as session:
            user_id = await Store(session).user.get_or_create_client(
                email="test11@gmail.com"
            )
            await session.commit()

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})

        response = client.get(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["phone"] is None
        assert data["avatar"] is None
        assert data["email"] == "test11@gmail.com"

    def test_get_me_unauthorized(self, client):
        """Тест получения профиля без авторизации"""
        response = client.get("/user/")

        assert response.status_code == 401
        data = response.json()
        assert "Authentication failed" in str(data["detail"])

    def test_get_me_invalid_token(self, client):
        """Тест получения профиля с невалидным токеном"""
        response = client.get(
            "/user/", headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "Authentication failed" in str(data["detail"])

    @pytest.mark.asyncio
    async def test_get_me_wrong_token_type(self, client, db_session):
        """Тест получения профиля с токеном неправильного типа"""
        user = User(email="test00012@gmail.com")

        async with db_session as session:
            session.add(user)
            await session.commit()
            user_id = user.id

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "XXX"})

        response = client.get(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
        )

        assert response.status_code == 401
        data = response.json()
        assert "Authentication failed" in str(data["detail"])
