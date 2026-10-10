import pytest

from src.schemas.auth import AuthResponse
from src.services.auth import AuthService


class TestAuthService:
    """Unit тесты для AuthService"""

    @pytest.mark.asyncio
    async def test_create_tokens(self):
        """Тест создания токенов"""
        data = {"sub": "testuser", "type": "user"}

        result = AuthService.create_tokens(data)

        assert isinstance(result, AuthResponse)
        assert result.token is not None
        assert len(result.token) > 0
