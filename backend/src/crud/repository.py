from sqlalchemy.ext.asyncio import AsyncSession
from src.crud.impl import (
    ClientDAO,
    FavoritesDAO,
    PaymentMethodDAO,
    PsychologistDAO,
    UserDAO,
)


class Store:
    """Центральное хранилище данных для доступа к DAO объектам.

    Предоставляет единую точку доступа к различным DAO объектам через
    свойства. Использует ленивую инициализацию для создания DAO только
    при первом обращении. Интегрируется с сервисным слоем для выполнения
    бизнес-логики и операций с базой данных.

    Используется в:
    - Сервисном слое (ServiceImpl) для доступа к данным
    - Middleware для управления транзакциями
    - Эндпоинтах через dependency injection
    """

    def __init__(
        self,
        session: AsyncSession,
    ):
        """Инициализирует хранилище данных с асинхронной сессией.

        Args:
            session (AsyncSession): Асинхронная сессия SQLAlchemy для
                выполнения операций с базой данных.
        """
        self._session = session
        self._user_dao: UserDAO | None = None
        self._client_dao: ClientDAO | None = None
        self._payment_method_dao: PaymentMethodDAO | None = None
        self._favorite_dao: FavoritesDAO | None = None
        self._psychologist_dao: PsychologistDAO | None = None

    @property
    def user(self) -> UserDAO:
        """Возвращает интерфейс для работы с пользователями.

        Returns:
            UserDAO: Интерфейс для работы с пользователями.
        """
        if self._user_dao is None:
            self._user_dao = UserDAO(session=self._session)
        return self._user_dao

    @property
    def client(self) -> ClientDAO:
        """Возвращает интерфейс для работы с клиентами.

        Returns:
            ClientDAO: Интерфейс для работы с клиентами.
        """
        if self._client_dao is None:
            self._client_dao = ClientDAO(session=self._session)
        return self._client_dao

    @property
    def payment_method(self) -> PaymentMethodDAO:
        """Возвращает интерфейс для работы с методами оплаты клиентов.

        Returns:
            ClientDAO: Интерфейс для работы с методами оплаты клиентов.
        """
        if self._payment_method_dao is None:
            self._payment_method_dao = PaymentMethodDAO(session=self._session)
        return self._payment_method_dao

    @property
    def favorite(self) -> FavoritesDAO:
        """Возвращает интерфейс для работы с избранными психологами клиента.

        Returns:
            FavoritesDAO: Интерфейс для работы с избранными психологами клиента.
        """
        if self._favorite_dao is None:
            self._favorite_dao = FavoritesDAO(session=self._session)
        return self._favorite_dao

    @property
    def psychologist(self) -> PsychologistDAO:
        """Возвращает интерфейс для работы с психологами

        Returns:
            PsychologistDAO: Интерфейс для работы с психологами
        """
        if self._psychologist_dao is None:
            self._psychologist_dao = PsychologistDAO(session=self._session)
        return self._psychologist_dao
