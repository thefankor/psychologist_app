from dataclasses import dataclass

import pytest
from fastapi import HTTPException

from src.core.dependencies import get_current_user_id
from src.services.auth import AuthService


@dataclass
class FakeCreds:
    scheme: str
    credentials: str


def make_fake_creds(token: str, scheme: str = "Bearer") -> FakeCreds:
    return FakeCreds(scheme=scheme, credentials=token)


class TestAuthDependencies:
    """Integration тесты для зависимостей аутентификации"""

    @pytest.mark.asyncio
    async def test_get_current_user_no_credentials(self):
        """Тест извлечения пользователя без учетных данных"""
        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(credentials=None, store=store)

                assert exc_info.value.status_code == 401
        finally:
            await test_engine.dispose()

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self):
        """Тест извлечения пользователя с невалидным токеном"""
        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(
                        credentials=make_fake_creds("invalid_token"), store=store
                    )

                assert exc_info.value.status_code == 401
        finally:
            await test_engine.dispose()

    @pytest.mark.asyncio
    async def test_get_current_user_wrong_token_type(self):
        """Тест извлечения пользователя с токеном неправильного типа"""
        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)
                auth_service = AuthService()
                tokens = auth_service.create_tokens({"sub": "100", "type": "ADMIN"})

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(
                        credentials=make_fake_creds(tokens.token), store=store
                    )

                assert exc_info.value.status_code == 401
        finally:
            await test_engine.dispose()

    @pytest.mark.asyncio
    async def test_get_current_user_not_found(self):
        """Тест извлечения несуществующего пользователя"""
        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)
                auth_service = AuthService()
                tokens = auth_service.create_tokens({"sub": "999", "type": "CLIENT"})

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(
                        credentials=make_fake_creds(tokens.token), store=store
                    )

                assert exc_info.value.status_code == 401
                assert "Authentication failed." == str(exc_info.value.detail["detail"])
                assert "Could not validate credentials" == str(
                    exc_info.value.detail["message"]
                )
        finally:
            await test_engine.dispose()

    @pytest.mark.asyncio
    async def test_get_current_user_expired_token(self):
        """Тест извлечения пользователя с истекшим токеном"""
        from datetime import timedelta

        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.core.auth.token import TokenService
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)
                data = {"sub": "testuser", "type": "CLIENT"}
                expired_token = TokenService.create_token(
                    data=data,
                    expires_delta=timedelta(seconds=-1),
                    secret_key=settings.ACCESS_SECRET_KEY,
                )

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(
                        credentials=make_fake_creds(expired_token), store=store
                    )

                assert exc_info.value.status_code == 401
                assert "Authentication failed." == str(exc_info.value.detail["detail"])
                assert "Token has expired" == str(exc_info.value.detail["message"])
        finally:
            await test_engine.dispose()

    @pytest.mark.asyncio
    async def test_get_current_user_missing_sub(self):
        """Тест извлечения пользователя с токеном без sub"""
        from datetime import timedelta

        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.core.auth.token import TokenService
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)
                data = {"type": "CLIENT"}  # Отсутствует sub
                token = TokenService.create_token(
                    data=data,
                    expires_delta=timedelta(days=1),
                    secret_key=settings.ACCESS_SECRET_KEY,
                )

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(
                        credentials=make_fake_creds(token), store=store
                    )

                assert exc_info.value.status_code == 401
                assert "Authentication failed." == str(exc_info.value.detail["detail"])
                assert "Could not validate credentials" == str(
                    exc_info.value.detail["message"]
                )
        finally:
            await test_engine.dispose()

    @pytest.mark.asyncio
    async def test_get_current_user_missing_type(self):
        """Тест извлечения пользователя с токеном без type"""
        from datetime import timedelta

        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        from src.config import settings
        from src.core.auth.token import TokenService
        from src.crud import Store

        test_engine = create_async_engine(settings.DATABASE_URL)
        async_session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

        try:
            async with async_session_maker() as session:
                store = Store(session=session)
                data = {"sub": "1"}
                token = TokenService.create_token(
                    data=data,
                    expires_delta=timedelta(days=1),
                    secret_key=settings.ACCESS_SECRET_KEY,
                )

                with pytest.raises(HTTPException) as exc_info:
                    await get_current_user_id(
                        credentials=make_fake_creds(token), store=store
                    )

                assert exc_info.value.status_code == 401
                assert "Authentication failed." == str(exc_info.value.detail["detail"])
                assert "Could not validate credentials" == str(
                    exc_info.value.detail["message"]
                )
        finally:
            await test_engine.dispose()
