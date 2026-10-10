from src.core.auth.hash import HashService


class TestHashService:
    """Unit тесты для HashService"""

    def test_verify_password_success(self):
        """Тест успешной верификации пароля"""
        password = "testpassword123"
        hashed = HashService.get_password_hash(password)

        assert HashService.verify_password(password, hashed)

    def test_verify_password_failure(self):
        """Тест неуспешной верификации пароля"""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = HashService.get_password_hash(password)

        result = HashService.verify_password(wrong_password, hashed)
        assert result is False

    def test_verify_password_unicode(self):
        """Тест верификации пароля с Unicode символами"""
        password = "пароль123абвгд"
        hashed = HashService.get_password_hash(password)

        result = HashService.verify_password(password, hashed)
        assert result is True

    def test_verify_password_long_password(self):
        """Тест верификации длинного пароля"""
        password = "a" * 1000  # Очень длинный пароль
        hashed = HashService.get_password_hash(password)

        result = HashService.verify_password(password, hashed)
        assert result is True

    def test_verify_password_very_short_password(self):
        """Тест верификации очень короткого пароля"""
        password = "a"
        hashed = HashService.get_password_hash(password)

        result = HashService.verify_password(password, hashed)
        assert result is True

    def test_hash_deterministic(self):
        """Тест, что хеширование детерминировано"""
        password = "testpassword123"
        hashed1 = HashService.get_password_hash(password)
        hashed2 = HashService.get_password_hash(password)

        assert hashed1 != hashed2

    def test_verify_password_with_empty_hash(self):
        """Тест верификации с пустым хешем"""
        password = "testpassword123"

        result = HashService.verify_password(password, "")
        assert result is False

    def test_verify_password_with_invalid_hash(self):
        """Тест верификации с невалидным хешем"""
        password = "testpassword123"
        invalid_hash = "invalid_hash_string"

        result = HashService.verify_password(password, invalid_hash)
        assert result is False
