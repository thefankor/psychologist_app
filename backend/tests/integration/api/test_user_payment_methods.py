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

    @pytest.mark.asyncio
    async def test_save_get_delete_methods(self, authorized_client):
        """Тест запросов добавления, получения и удаление метода"""

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

        response3 = authorized_client.delete(
            f"/user/methods/{data['sbp'][0]['id']}/",
        )
        assert response3.status_code == 204

        response4 = authorized_client.get(
            "/user/methods/",
        )

        assert response4.status_code == 200

        data = response4.json()

        assert len(data["sbp"]) == 0

    @pytest.mark.asyncio
    async def test_delete_non_exist_methods(self, authorized_client):
        """Тест запросов добавления, получения и удаление метода"""

        response = authorized_client.delete(
            "/user/methods/40034330/",
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_methods_unauthorized_user(self, client):
        """Тест запросов добавления, получения и удаление метода"""

        response = client.delete(
            "/user/methods/100/",
        )
        assert response.status_code == 401
