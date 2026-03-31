from sqlalchemy.ext.asyncio import AsyncSession
from src.crud.impl import (
    AppointmentAttendeeDAO,
    AppointmentDAO,
    ChatMembersDAO,
    ChatMessagesDAO,
    ChatsDAO,
    ClientDAO,
    FavoritesDAO,
    PaymentMethodDAO,
    PsychologistDAO,
    UserDAO,
)
from src.crud.impl.admin import AdminDAO


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
        self._admin_dao: AdminDAO | None = None
        self._payment_method_dao: PaymentMethodDAO | None = None
        self._favorite_dao: FavoritesDAO | None = None
        self._psychologist_dao: PsychologistDAO | None = None
        self._chats_dao: ChatsDAO | None = None
        self._chat_members_dao: ChatMembersDAO | None = None
        self._chat_messages_dao: ChatMessagesDAO | None = None
        self._appointment_dao: AppointmentDAO | None = None
        self._appointment_attendee_dao: AppointmentAttendeeDAO | None = None

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
    def admin(self) -> AdminDAO:
        """Возвращает интерфейс для работы с админами.

        Returns:
            AdminDAO: Интерфейс для работы с админами.
        """
        if self._admin_dao is None:
            self._admin_dao = AdminDAO(session=self._session)
        return self._admin_dao

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

    @property
    def chat(self) -> ChatsDAO:
        """Возвращает интерфейс для работы с чатами

        Returns:
            GroupsDAO: Интерфейс для работы с чатами
        """
        if self._chats_dao is None:
            self._chats_dao = ChatsDAO(session=self._session)
        return self._chats_dao

    @property
    def chat_member(self) -> ChatMembersDAO:
        """Возвращает интерфейс для работы с участниками чатами

        Returns:
            ChatMembersDAO: Интерфейс для работы с участниками чатами
        """
        if self._chat_members_dao is None:
            self._chat_members_dao = ChatMembersDAO(session=self._session)
        return self._chat_members_dao

    @property
    def chat_message(self) -> ChatMessagesDAO:
        """Возвращает интерфейс для работы с сообщениями чатами

        Returns:
            ChatMessagesDAO: Интерфейс для работы с сообщениями чатами
        """
        if self._chat_messages_dao is None:
            self._chat_messages_dao = ChatMessagesDAO(session=self._session)
        return self._chat_messages_dao

    @property
    def appointment(self) -> AppointmentDAO:
        """Возвращает интерфейс для работы со встречами

        Returns:
            AppointmentDAO: Интерфейс для работы с участниками встречи
        """
        if self._appointment_dao is None:
            self._appointment_dao = AppointmentDAO(session=self._session)
        return self._appointment_dao

    @property
    def appointment_attendee(self) -> AppointmentAttendeeDAO:
        """Возвращает интерфейс для работы с сообщениями чатами

        Returns:
            AppointmentAttendeeDAO: Интерфейс для работы с сообщениями чатами
        """
        if self._appointment_attendee_dao is None:
            self._appointment_attendee_dao = AppointmentAttendeeDAO(
                session=self._session
            )
        return self._appointment_attendee_dao
