import json

from fastapi import Depends
from pydantic import BaseModel
from src.core.db.redis_cache import RedisCache, get_cache


class SMSGetCode(BaseModel):
    code: str
    data: dict


class SMSCodeService:
    PREFIX = "sms_code"

    def __init__(self, cache: RedisCache = Depends(get_cache)):
        self.cache = cache

    def _key(self, phone: str) -> str:
        return f"{self.PREFIX}:{phone}"

    async def save(self, phone: str, code: int, data: dict, ttl: int = 600) -> None:
        phone_data = {
            "code": str(code),
            "data": data,
        }
        print(f"Saved: {phone}: {phone_data}")
        """Сохранить код в Redis с TTL (по умолчанию 10 минут)"""
        await self.cache.set(self._key(phone), json.dumps(phone_data), ex=ttl)

    async def get(self, phone: str) -> SMSGetCode | None:
        """Получить по ключу"""
        value = await self.cache.get(self._key(phone))
        if value is None:
            return None

        phone_data = json.loads(value)

        return SMSGetCode(
            code=phone_data.get("code"),
            data=phone_data.get("data"),
        )

    async def delete(self, phone: str) -> None:
        """Удалить код"""
        await self.cache.redis.delete(self._key(phone))
