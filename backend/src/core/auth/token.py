from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from src.config import settings


class TokenService:
    @staticmethod
    def create_token(data: dict, expires_delta: timedelta, secret_key: str) -> str:
        """Создание JWT токена"""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def get_token_payload(token: str) -> dict:
        """Получение payload из токена"""
        try:
            secret_key = settings.ACCESS_SECRET_KEY
            return jwt.decode(token, secret_key, algorithms=[settings.ALGORITHM])

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "detail": "Authentication failed.",
                    "message": "Token has expired",
                },
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "detail": "Authentication failed.",
                    "message": "Could not validate credentials",
                },
                headers={"WWW-Authenticate": "Bearer"},
            )
