from typing import Literal

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.auth import TokenService
from src.core.db.database import get_async_db
from src.crud import Store

bearer_scheme = HTTPBearer(auto_error=False)


def get_store(session: AsyncSession = Depends(get_async_db)) -> Store:
    return Store(session=session)


async def check_token_dependency(
    token_type: Literal["CLIENT"] = Query(...),
    credentials=Depends(bearer_scheme),
    store: Store = Depends(get_store),
):
    await check_token(token_type=token_type, credentials=credentials, store=store)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    store: Store = Depends(get_store),
) -> int:
    return await _get_current_entity(
        credentials=credentials,
        expected_type="CLIENT",
        store=store,
    )


async def check_token(
    token_type: Literal["CLIENT"],
    credentials: HTTPAuthorizationCredentials,
    store: Store,
) -> int:
    return await _get_current_entity(
        credentials=credentials,
        expected_type=token_type,
        store=store,
    )


async def _get_current_entity(
    *,
    credentials: HTTPAuthorizationCredentials,
    expected_type: Literal["CLIENT"],
    store: Store,
) -> int:
    """Проверка токена и извлечение пользователя или креатора."""

    if credentials is None or not credentials.scheme.lower() == "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "detail": "Authentication failed.",
                "message": "Not authenticated.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials

    token = token.replace("Bearer ", "")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "detail": "Authentication failed.",
            "message": "Could not validate credentials",
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = TokenService.get_token_payload(token)

        if payload.get("type") != expected_type:
            raise credentials_exception

        identity_value = payload.get("sub")
        if not identity_value:
            raise credentials_exception

        exist_user = await store.user.check_exist(
            user_id=int(identity_value), role=payload.get("type")
        )

        if not exist_user:
            raise credentials_exception

        return int(identity_value)

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected error during token validation: {str(e)}")
        print(f"Token that caused error: {token}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during token validation",
        )
