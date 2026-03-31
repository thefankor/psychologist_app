from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException
from src.config import settings
from src.core.auth.token import TokenService


class TestTokenService:
    """Unit тесты для TokenService"""

    def test_create_token_success(self):
        """Тест успешного создания токена"""
        data = {"sub": "testuser", "type": "user"}
        expires_delta = timedelta(days=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        assert isinstance(token, str)
        assert len(token) > 0

        payload = jwt.decode(
            token, settings.ACCESS_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        assert payload["sub"] == "testuser"
        assert payload["type"] == "user"
        assert "exp" in payload

    def test_create_token_with_expiration(self):
        """Тест создания токена с истечением срока"""
        data = {"sub": "testuser", "type": "user"}
        expires_delta = timedelta(seconds=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        import time

        time.sleep(2)

        with pytest.raises(HTTPException) as exc_info:
            TokenService.get_token_payload(token)

        assert exc_info.value.status_code == 401
        assert "Token has expired" in str(exc_info.value.detail)

    def test_get_token_payload_success(self):
        """Тест успешного получения payload из токена"""
        data = {"sub": "testuser", "type": "creator"}
        expires_delta = timedelta(days=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        payload = TokenService.get_token_payload(token)

        assert payload["sub"] == "testuser"
        assert payload["type"] == "creator"
        assert "exp" in payload

    def test_get_token_payload_invalid_token(self):
        """Тест получения payload из невалидного токена"""
        with pytest.raises(HTTPException) as exc_info:
            TokenService.get_token_payload("invalid_token")

        assert exc_info.value.status_code == 401
        assert "Authentication failed." == str(exc_info.value.detail["detail"])

    def test_get_token_payload_expired_token(self):
        """Тест получения payload из истекшего токена"""
        data = {"sub": "testuser", "type": "user"}
        expires_delta = timedelta(seconds=-1)  # Истекший токен

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        with pytest.raises(HTTPException) as exc_info:
            TokenService.get_token_payload(token)

        assert exc_info.value.status_code == 401
        assert "Token has expired" in str(exc_info.value.detail)

    def test_get_token_payload_wrong_secret_key(self):
        """Тест получения payload с неправильным секретным ключом"""
        data = {"sub": "testuser", "type": "user"}
        expires_delta = timedelta(days=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key="xxx",
        )

        with pytest.raises(HTTPException) as exc_info:
            TokenService.get_token_payload(token)

        assert exc_info.value.status_code == 401
        assert "Authentication failed." in str(exc_info.value.detail["detail"])

    def test_create_token_with_complex_data(self):
        """Тест создания токена со сложными данными"""
        data = {
            "sub": "testuser",
            "type": "user",
            "permissions": ["read", "write"],
            "metadata": {"role": "admin", "department": "IT"},
        }
        expires_delta = timedelta(days=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        payload = TokenService.get_token_payload(token)

        assert payload["sub"] == "testuser"
        assert payload["type"] == "user"
        assert payload["permissions"] == ["read", "write"]
        assert payload["metadata"]["role"] == "admin"
        assert payload["metadata"]["department"] == "IT"

    def test_token_expiration_time(self):
        """Тест времени истечения токена"""
        data = {"sub": "testuser", "type": "user"}
        expires_delta = timedelta(hours=2)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        payload = TokenService.get_token_payload(token)

        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)

        # Разница должна быть примерно 2 часа (с небольшим допуском)
        time_diff = exp_time - now
        assert (
            timedelta(hours=1, minutes=59) <= time_diff <= timedelta(hours=2, minutes=1)
        )

    def test_token_with_empty_data(self):
        """Тест создания токена с пустыми данными"""
        data = {}
        expires_delta = timedelta(days=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        payload = TokenService.get_token_payload(token)

        assert "exp" in payload
        assert len(payload) == 1

    def test_token_with_special_characters(self):
        """Тест создания токена со специальными символами"""
        data = {
            "sub": "user@domain.com",
            "type": "user",
            "name": "Иван Иванов",
            "special": "!@#$%^&*()",
        }
        expires_delta = timedelta(days=1)

        token = TokenService.create_token(
            data=data,
            expires_delta=expires_delta,
            secret_key=settings.ACCESS_SECRET_KEY,
        )

        payload = TokenService.get_token_payload(token)

        assert payload["sub"] == "user@domain.com"
        assert payload["name"] == "Иван Иванов"
        assert payload["special"] == "!@#$%^&*()"
