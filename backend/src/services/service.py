from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db.database import get_async_db
from src.crud import Store
from src.services.auth import AuthService
from src.services.user import UserService


class ServiceImpl:
    """Центральный сервисный слой приложения.

    Предоставляет единую точку доступа ко всем сервисам приложения
    через свойства. Использует ленивую инициализацию для создания
    сервисов только при первом обращении. Интегрируется с CRUD слоем
    для выполнения бизнес-логики и операций с данными.

    Используется в:
    - Эндпоинтах через dependency injection
    - Middleware для управления транзакциями
    - Других сервисах для доступа к функциональности
    """

    def __init__(
        self,
        session: AsyncSession = Depends(get_async_db),
    ):
        """Инициализирует сервис.

        Args:
            session (AsyncSession, optional): Асинхронная сессия базы данных. По умолчанию Depends(get_async_db).
        """
        self._user_service: UserService | None = None
        self._auth_service: AuthService | None = None
        self._store: Store | None = None
        self._session = session

    @property
    def store(self) -> Store:
        """Возвращает Store с ленивой инициализацией."""
        if self._store is None:
            self._store = Store(session=self._session)
        return self._store

    @property
    def user(self):
        """Возвращает сервис пользователей.

        Returns:
            IUserService: Интерфейс сервиса пользователей.
        """
        if self._user_service is None:
            self._user_service = UserService(store=self.store)
        return self._user_service

    @property
    def auth(self):
        """Возвращает сервис авторизации

        Returns:
            IUserService: Интерфейс сервиса пользователей.
        """
        if self._auth_service is None:
            self._auth_service = AuthService(store=self.store)
        return self._auth_service

    @property
    def session(self):
        """Возвращает асинхронную сессию базы данных.

        Returns:
            AsyncSession: Асинхронная сессия SQLAlchemy.
        """
        return self._session
