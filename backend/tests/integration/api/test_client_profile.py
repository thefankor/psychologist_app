import pytest
from src.crud import Store
from src.services.auth import AuthService

from tests.utils import get_random_user_email


class TestClientProfileEndpoints:
    """API тесты для эндпоинтов профиля клиентов"""

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "mail, json, code",
        [
            (
                "test12@gmail.com",
                {"name": "John", "birth_date": "2005-10-22", "gender": "MALE"},
                200,
            ),
            (
                "test13@gmail.com",
                {
                    "name": "string",
                    "birth_date": "2025-10-22",
                    "gender": "MALE",
                    "emotions": ["string"],
                    "relations": ["string"],
                    "work": ["string"],
                    "life": ["string"],
                    "personal": ["string"],
                    "format": ["PERSONAL"],
                    "timezone": "UTC_12_M",
                    "long": "FIRST",
                    "pricing": "SMALL",
                    "time": "MORNING",
                    "method": "GESTALT",
                },
                200,
            ),
            ("test14@gmail.com", {"name": "Alex"}, 422),
        ],
    )
    async def test_send_survey(self, client, db_session, mail, json, code):
        """Тест прохождения анкеты"""

        async with db_session as session:
            user_id = await Store(session).user.get_or_create_client(email=mail)
            await session.commit()

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})

        response1 = client.get(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
        )

        assert response1.status_code == 200
        data = response1.json()

        assert data["new"]

        response2 = client.post(
            "/user/survey/",
            headers={"Authorization": f"Bearer {tokens.token}"},
            json=json,
        )

        assert response2.status_code == code

    @pytest.mark.asyncio
    async def test_delete_profile(self, client, db_session):
        """Тест удаления аккаунта"""
        async with db_session as session:
            user_id = await Store(session).user.get_or_create_client(
                email="test15@gmail.com"
            )
            await session.commit()

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})

        response1 = client.delete(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
        )
        assert response1.status_code == 204

        response1 = client.get(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
        )
        assert response1.status_code == 401

    @pytest.mark.parametrize(
        "email, json, code",
        [
            (get_random_user_email(), {}, 200),
            (
                get_random_user_email(),
                {
                    "name": "string",
                    "phone": "+79993334567",
                    "email": get_random_user_email(),
                    "avatar": "string",
                    "birth_date": "2025-10-23T07:40:30.482Z",
                    "gender": "NOT_STATED",
                    "timezone": "UTC_12_M",
                },
                200,
            ),
            (
                get_random_user_email(),
                {
                    "phone": "+79993334560",
                },
                200,
            ),
            (get_random_user_email(), {"phone": "string"}, 422),
            (get_random_user_email(), {"email": "meow"}, 422),
        ],
    )
    @pytest.mark.asyncio
    async def test_update_profile_success(self, client, db_session, email, json, code):
        """Тест обновления профиля"""
        async with db_session as session:
            user_id = await Store(session).user.get_or_create_client(email=email)
            await session.commit()

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})

        response = client.patch(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
            json=json,
        )
        assert response.status_code == code

    @pytest.mark.asyncio
    async def test_update_profile_email_conflict(self, client, db_session):
        """Тест обновления профиля c конфликтом почты"""
        existing_email = get_random_user_email()
        async with db_session as session:
            await Store(session).user.get_or_create_client(email=existing_email)
            user_id = await Store(session).user.get_or_create_client(
                email=get_random_user_email()
            )
            await session.commit()

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})

        response = client.patch(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
            json={"email": existing_email},
        )
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_update_profile_phone_conflict(self, client, db_session):
        """Тест обновления профиля c конфликтом номера"""
        async with db_session as session:
            first_user_id = await Store(session).user.get_or_create_client(
                email=get_random_user_email()
            )
            await Store(session).client.update(
                model_id=first_user_id, return_model=False, phone="+79433334560"
            )
            user_id = await Store(session).user.get_or_create_client(
                email=get_random_user_email()
            )
            await session.commit()

        auth_service = AuthService()
        tokens = auth_service.create_tokens({"sub": str(user_id), "type": "CLIENT"})

        response = client.patch(
            "/user/",
            headers={"Authorization": f"Bearer {tokens.token}"},
            json={"phone": "+79433334560"},
        )
        assert response.status_code == 409
