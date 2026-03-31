from fastapi import Depends
from src.core.db.redis_cache import RedisCache, get_cache


class ConfirmCodeService:
    PREFIX = "confirm_code"

    def __init__(self, cache: RedisCache = Depends(get_cache)):
        self.cache = cache

    def _key(self, email: str) -> str:
        return f"{self.PREFIX}:{email}"

    async def save(self, email: str, code: int, ttl: int = 600) -> None:
        print(f"Saved: {email}: {code}")
        """Сохранить код в Redis с TTL (по умолчанию 10 минут)"""
        await self.cache.set(self._key(email), str(code), ex=ttl)

    async def verify(self, email: str, submitted_code: str) -> bool:
        """Проверить код"""
        stored_code = await self.cache.get(self._key(email))
        if stored_code is None:
            return False
        return stored_code == submitted_code

    async def delete(self, email: str) -> None:
        """Удалить код"""
        await self.cache.redis.delete(self._key(email))
