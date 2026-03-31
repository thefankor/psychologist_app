from typing import Annotated, Literal

from fastapi import Depends, HTTPException, Query, WebSocket, WebSocketException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.auth import TokenService
from src.core.db.database import get_async_db
from src.crud import Store
from src.schemas.ws import WSUser

bearer_scheme = HTTPBearer(auto_error=False)


def get_store(session: AsyncSession = Depends(get_async_db)) -> Store:
    return Store(session=session)


async def check_token_dependency(
    token_type: Literal["CLIENT", "ADMIN", "PSYCHOLOGIST"] = Query(...),
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


async def get_current_psychologist_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    store: Store = Depends(get_store),
) -> int:
    return await _get_current_entity(
        credentials=credentials,
        expected_type="PSYCHOLOGIST",
        store=store,
    )


async def get_any_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    store: Store = Depends(get_store),
) -> int:
    return await _get_current_entity(
        credentials=credentials,
        expected_type=None,
        store=store,
    )


async def get_ws_user(
    websocket: WebSocket,
    store: Store = Depends(get_store),
    token: Annotated[str | None, Query()] = None,
) -> WSUser:
    if token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    try:
        user_id = await check_token_info(token=token, expected_type=None, store=store)
        user_type = TokenService.get_token_payload(token).get("type")
        if user_type == "ADMIN":
            return WSUser(
                id=user_id,
                name="ADMIN",
                role="ADMIN",
            )
        elif user_type == "CLIENT":
            ws_user = await store.client.get_name_and_avatar(user_id=user_id)
            return WSUser(
                id=user_id,
                name=ws_user.name or "Анонимный клиент",
                role="CLIENT",
                avatar=ws_user.avatar,
            )
        elif user_type == "PSYCHOLOGIST":
            ws_user = await store.psychologist.get_name_and_avatar(user_id=user_id)
            return WSUser(
                id=user_id,
                name=f"{ws_user.first_name} {ws_user.last_name}",
                role="PSYCHOLOGIST",
                avatar=ws_user.avatar,
            )
        return None

    except HTTPException:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)


async def get_current_admin_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    store: Store = Depends(get_store),
) -> int:
    return await _get_current_entity(
        credentials=credentials,
        expected_type="ADMIN",
        store=store,
    )


async def check_token(
    token_type: Literal["CLIENT", "ADMIN"],
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
    expected_type: Literal["CLIENT", "ADMIN", "PSYCHOLOGIST"] | None = None,
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

    return await check_token_info(token=token, expected_type=expected_type, store=store)


async def check_token_info(
    token: str,
    expected_type: Literal["CLIENT", "ADMIN", "PSYCHOLOGIST"] | None,
    store: Store,
):
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

        if expected_type and payload.get("type") != expected_type:
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
