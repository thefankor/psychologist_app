from unittest.mock import patch


class TestAuthEndpoints:
    """Integration тесты для API endpoints аутентификации"""

    def test_send_code_response(self, client):
        """Тест успешной верификации SMS кода через API"""

        with patch(
            "src.utils.confirm_code_service.ConfirmCodeService.save",
            return_value=None,
        ):
            response = client.post(
                "/auth/login/",
                json={"email": "test1@gmail.com"},
            )

        assert response.status_code == 200
        data = response.json()

        assert data == {}

    def test_verify_code_invalid_email(self, client):
        """Тест верификации с несуществующим номером"""
        response = client.post(
            "/auth/verify/", json={"email": "njndjnjsd", "code": "123456"}
        )

        assert response.status_code == 422

    def test_verify_code_invalid_code(self, client):
        """Тест верификации с неправильным кодом"""

        with patch(
            "src.utils.confirm_code_service.ConfirmCodeService.verify",
            return_value=False,
        ):
            response = client.post(
                "/auth/verify/",
                json={"email": "test2@gmail.com", "code": "999999"},
            )

        assert response.status_code == 400

    def test_verify_code_missing_parameters(self, client):
        """Тест верификации с отсутствующими параметрами"""
        response = client.post("/auth/verify/", json={"email": "test3@gmail.com"})

        assert response.status_code == 422

    def test_verify_code_invalid_code_type(self, client):
        """Тест верификации с неправильным типом кода"""
        response = client.post(
            "/auth/verify/",
            json={"email": "test4@gmail.com", "code": 939393},
        )

        assert response.status_code == 422
