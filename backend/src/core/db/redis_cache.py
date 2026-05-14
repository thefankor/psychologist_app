from typing import Optional

import redis.asyncio as redis

from src.core.db.base import CacheWorker


class RedisCache(CacheWorker):
    def __init__(self, client: redis.Redis):
        super().__init__(client)
        self.redis = client

    async def get(self, key: str, *args, **kwargs) -> Optional[str]:
        return await self.redis.get(key)

    async def set(self, key: str, value: str, ex: int = None, *args, **kwargs):
        await self.redis.set(key, value, ex=ex)

    async def close(self):
        await self.redis.aclose()


redis_cache: Optional[RedisCache] = None


def set_cache(cache: RedisCache):
    global redis_cache
    redis_cache = cache


async def get_cache() -> RedisCache:
    return redis_cache
