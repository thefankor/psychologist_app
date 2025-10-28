from unittest.mock import patch

import pytest

from src.utils.sms_confirm_service import SMSGetCode


class TestUserMethodsEndpoints:
    """API тесты для эндпоинтов пользователей"""

    @pytest.mark.parametrize(
        "json, code",
        [
            (
                {
                    "phone": "+79958894556",
                    "bank": "TBANK",
                },
                200,
            ),
            ({"phone": "+79958894556"}, 422),
            (
                {
                    "phone": "string",
                    "bank": "TBANK",
                },
                422,
            ),
            ({}, 422),
        ],
    )
    @pytest.mark.asyncio
    async def test_send_code_response(self, authorized_client, json, code):
        """Тест успешных запросов на добавление метода от аутентифицированного клиента"""

        with patch(
            "src.utils.sms_confirm_service.SMSCodeService.save",
            return_value=None,
        ):
            response = authorized_client.post("/user/methods/sbp/", json=json)

        assert response.status_code == code

    @pytest.mark.asyncio
    async def test_send_code_response_unauthorized(self, client):
        """Тест успешных запросов на добавление метода от неаутентифицированного клиента"""

        with patch(
            "src.utils.sms_confirm_service.SMSCodeService.save",
            return_value=None,
        ):
            response = client.post(
                "/user/methods/sbp/",
                json={
                    "phone": "+79958894556",
                    "bank": "TBANK",
                },
            )

        assert response.status_code == 401

    @pytest.mark.parametrize(
        "json, code",
        [
            ({"phone": "+79958894556", "code": "33333"}, 400),
            ({"phone": "string", "bank": "TBANK"}, 422),
            ({}, 422),
        ],
    )
    @pytest.mark.asyncio
    async def test_verify_sms_code(self, authorized_client, json, code):
        """Тест запросов с неверным кодом"""

        with patch(
            "src.utils.sms_confirm_service.SMSCodeService.get",
            return_value=None,
        ):
            response = authorized_client.post("/user/methods/sbp/verify/", json=json)

        assert response.status_code == code

    @pytest.mark.parametrize(
        "json, code",
        [
            ({"phone": "+79958895555", "code": "33333"}, 200),
            ({"phone": "+79958895555", "code": "00000"}, 400),
            ({"phone": "string", "bank": "TBANK"}, 422),
            ({}, 422),
        ],
    )
    @pytest.mark.asyncio
    async def test_verify_sms_code_success(self, authorized_client, json, code):
        """Тест запросов с верным кодом"""

        with patch(
            "src.utils.sms_confirm_service.SMSCodeService.get",
            return_value=SMSGetCode(
                code="33333", data={"bank": "TBANK", "type": "SBP"}
            ),
        ):
            response = authorized_client.post("/user/methods/sbp/verify/", json=json)

        assert response.status_code == code

    @pytest.mark.asyncio
    async def test_get_methods(self, authorized_client):
        """Тест запросов с верным кодом"""

        with patch(
            "src.utils.sms_confirm_service.SMSCodeService.get",
            return_value=SMSGetCode(
                code="88888", data={"bank": "T-bank", "type": "SBP"}
            ),
        ):
            response1 = authorized_client.post(
                "/user/methods/sbp/verify/",
                json={"phone": "+79958890055", "code": "88888"},
            )

        assert response1.status_code == 200

        response2 = authorized_client.get(
            "/user/methods/",
        )

        assert response2.status_code == 200

        data = response2.json()

        assert len(data["sbp"]) == 1
        assert data["sbp"][0]["phone"] == "+79958890055"
        assert data["sbp"][0]["bank"] == "T-bank"

    # @pytest.mark.asyncio
    # async def test_get_me_success(self, client, db_session, new_user_token):
    #     """Тест успешного получения профиля пользователя"""
    #
    #     response = client.get(
    #         "/user/",
    #         headers={"Authorization": f"Bearer {new_user_token}"},
    #     )
    #
    #     assert response.status_code == 200
    #     data = response.json()
    #
    #     assert data["phone"] is None
    #     assert data["avatar"] is None
    #     assert data["email"] == "test11@gmail.com"
    #
    # def test_get_me_unauthorized(self, client):
    #     """Тест получения профиля без авторизации"""
    #     response = client.get("/user/")
    #
    #     assert response.status_code == 401
    #     data = response.json()
    #     assert "Authentication failed" in str(data["detail"])
    #
    # def test_get_me_invalid_token(self, client):
    #     """Тест получения профиля с невалидным токеном"""
    #     response = client.get(
    #         "/user/", headers={"Authorization": "Bearer invalid_token"}
    #     )
    #
    #     assert response.status_code == 401
    #     data = response.json()
    #     assert "Authentication failed" in str(data["detail"])
    #
    # @pytest.mark.asyncio
    # async def test_get_me_wrong_token_type(self, client, db_session):
    #     """Тест получения профиля с токеном неправильного типа"""
    #     user = User(email="test00012@gmail.com")
    #
    #     async with db_session as session:
    #         session.add(user)
    #         await session.commit()
    #         user_id = user.id
    #
    #     auth_service = AuthService()
    #     tokens = auth_service.create_tokens({"sub": str(user_id), "type": "XXX"})
    #
    #     response = client.get(
    #         "/user/",
    #         headers={"Authorization": f"Bearer {tokens.token}"},
    #     )
    #
    #     assert response.status_code == 401
    #     data = response.json()
    #     assert "Authentication failed" in str(data["detail"])
