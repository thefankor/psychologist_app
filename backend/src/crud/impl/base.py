from uuid import UUID

from sqlalchemy import delete, insert, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.core.exceptions import NotFoundException  # TODO
from src.core.wrapper import handle_db_errors


class BaseDAO:
    """Базовый класс для объектов доступа к данным (DAO) с CRUD операциями.

    Предоставляет стандартные методы для работы с базой данных:
    создание, чтение, обновление и удаление записей. Используется
    как основа для всех специализированных DAO классов.

    Используется в:
    - Всех DAO классах для наследования базовой функциональности
    - Сервисном слое через Store для доступа к данным
    - Middleware для обработки ошибок базы данных

    Атрибуты:
        model (DeclarativeBase): SQLAlchemy модель для операций
    """

    model = None

    def __init__(self, session: AsyncSession):
        """Инициализирует DAO с сессией базы данных.

        Аргументы:
            session (AsyncSession): Асинхронная сессия SQLAlchemy,
                внедряемая через FastAPI Depends
        """
        self.session = session

    @handle_db_errors
    async def check_exist(self, model_id: int | UUID):
        """Проверяет существование записи по ID и возвращает True или False

        Используется для валидации существования записей перед
        выполнением операций обновления или удаления.

        Args:
            model_id (int | UUID): Идентификатор записи для проверки.

        Returns:
            bool: True, если запись существует, иначе False
        """
        stmt = select(self.model.id).where(self.model.id == model_id)
        result = await self.session.execute(stmt)
        instance = result.scalar_one_or_none()
        return True if instance else False

    @handle_db_errors
    async def find_one_id_or_none(self, **filter_by):
        """
        Находит одну запись по указанным фильтрам и возвращает ее идентификатор.

        Используется для поиска конкретной записи с возможностью
        указания нескольких условий фильтрации.

        Args:
            **filter_by: Параметры фильтрации (поле=значение).

        Returns:
            int | UUID | None: Найденная запись или None, если не найдена.

        """
        query = select(self.model.id).filter_by(**filter_by)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    @handle_db_errors
    async def find_one_id_or_404(self, **filter_by):
        """
        Находит одну запись по указанным фильтрам и возвращает ее идентификатор или выбрасывает исключение..

        Используется для поиска конкретной записи с возможностью
        указания нескольких условий фильтрации.

        Args:
            **filter_by: Параметры фильтрации (поле=значение).

        Returns:
            int | UUID | None: Найденная запись или None, если не найдена.

        Raises:
            NotFoundException: Если запись с указанным ID не найдена.
        """
        query = select(self.model.id).filter_by(**filter_by)
        result = await self.session.execute(query)
        instance = result.scalar_one_or_none()

        if not instance:
            raise NotFoundException
        return instance

    @handle_db_errors
    async def check_exist_or_404(self, model_id: int | UUID):
        """Проверяет существование записи по ID или выбрасывает исключение.

        Используется для валидации существования записей перед
        выполнением операций обновления или удаления.

        Args:
            model_id (int | UUID): Идентификатор записи для проверки.

        Returns:
            bool: True, если запись существует.

        Raises:
            NotFoundException: Если запись с указанным ID не найдена.
        """
        stmt = select(self.model.id).where(self.model.id == model_id)
        result = await self.session.execute(stmt)
        instance = result.scalar_one_or_none()
        if not instance:
            raise NotFoundException
        return True

    @handle_db_errors
    async def find_one_or_none(self, **filter_by):
        """Находит одну запись по указанным фильтрам.

        Используется для поиска конкретной записи с возможностью
        указания нескольких условий фильтрации.

        Args:
            **filter_by: Параметры фильтрации (поле=значение).

        Returns:
            Модель | None: Найденная запись или None, если не найдена.
        """
        query = select(self.model).filter_by(**filter_by)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    @handle_db_errors
    async def find_by_id(self, model_id: int | UUID):
        """Находит запись по её идентификатору.

        Используется для получения конкретной записи по ID.

        Args:
            model_id (int | UUID): Идентификатор записи.

        Returns:
            Модель | None: Найденная запись или None, если не найдена.
        """
        query = select(self.model).filter_by(id=model_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    @handle_db_errors
    async def find_all(self, **filter_by):
        """Находит все записи, соответствующие фильтрам.

        Используется для получения списка записей с возможностью
        фильтрации по различным полям.

        Args:
            **filter_by: Параметры фильтрации (поле=значение).

        Returns:
            List[Модель]: Список найденных записей.
        """
        query = select(self.model).filter_by(**filter_by)
        result = await self.session.execute(query)
        return result.scalars().all()

    @handle_db_errors
    async def add(self, return_model: bool = True, **data):
        """Добавляет новую запись в базу данных.

        Используется для создания новых записей с указанными данными.

        Args:
            return_model (bool, optional): Возвращать ли созданную модель.
                По умолчанию True.
            **data: Данные для создания записи.

        Returns:
            Модель | None: Созданная запись или None, если return_model=False.
        """
        query = insert(self.model).values(**data).returning(self.model)
        result = await self.session.execute(query)
        return result.scalar_one_or_none() if return_model else None

    @handle_db_errors
    async def delete(self, model_id: int | UUID):
        """Удаляет запись по её идентификатору.

        Используется для удаления записей из базы данных.
        Сначала проверяет существование записи.

        Args:
            model_id (int | UUID): Идентификатор записи для удаления.

        Raises:
            NotFoundException: Если запись с указанным ID не найдена.
        """
        await self.check_exist_or_404(model_id=model_id)
        stmt = delete(self.model).where(self.model.id == model_id)
        await self.session.execute(stmt)

    @handle_db_errors
    async def update(
        self, model_id: int | UUID, return_model: bool = True, **update_data
    ):
        """Обновляет запись по её идентификатору.

        Используется для изменения существующих записей.
        Сначала проверяет существование записи.

        Args:
            model_id (int | UUID): Идентификатор записи для обновления.
            return_model (bool, optional): Возвращать ли обновленную модель.
                По умолчанию True.
            **update_data: Данные для обновления.

        Returns:
            Модель | None: Обновленная запись или None, если return_model=False.

        Raises:
            NotFoundException: Если запись с указанным ID не найдена.
        """
        await self.check_exist_or_404(model_id=model_id)
        stmt = (
            update(self.model)
            .where(self.model.id == model_id)
            .values(**update_data)
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() if return_model else None
