from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    STATIC_BASE_URL: str
    POSTGRES_HOST: str
    POSTGRES_DB: str
    POSTGRES_PORT: str = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str

    RESEND_API_KEY: str
    RESEND_EMAIL: str

    ACCESS_SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_DAYS: int

    SMS_AERO_LOGIN: str
    SMS_AERO_KEY: str
    SMS_AERO_SIGN: str

    LIVEKIT_WS_URL: str
    LIVEKIT_API_KEY: str
    LIVEKIT_API_SECRET: str

    class Config:
        env_file = ".env"
        extra = "allow"

    @property
    def DATABASE_URL(self):
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
