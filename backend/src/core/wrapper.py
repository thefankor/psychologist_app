from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar

from asyncpg.exceptions import DataError as AsyncPGDataError
from asyncpg.exceptions import UniqueViolationError
from fastapi import HTTPException
from sqlalchemy.exc import DataError as SQLAlchemyDataError
from sqlalchemy.exc import (
    DBAPIError,
    IntegrityError,
    OperationalError,
    ProgrammingError,
)

P = ParamSpec("P")
T = TypeVar("T")


def handle_db_errors(func: Callable[P, T]) -> Callable[P, T]:
    """Декоратор для обработки ошибок, связанных с базой данных, в асинхронных функциях.

    Этот декоратор оборачивает асинхронные функции для обработки распространенных ошибок базы данных
    и предоставления соответствующих HTTP-ответов. Обрабатывает специфические ошибки SQLAlchemy и AsyncPG,
    выполняет откат сессии, если она доступна, и преобразует ошибки базы данных в HTTP-исключения.

    Аргументы:
        func (Callable[P, T]): Асинхронная функция для декорирования.

    Возвращает:
        Callable[P, T]: Обернутая функция с обработкой ошибок.

    Вызывает:
        HTTPException:
            400 - Если значение выходит за пределы диапазона int32 или некорректные данные
            409 - Для ошибок уникальности и конфликтов
            500 - Для внутренних ошибок базы данных
    """

    @wraps(func)
    async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
        try:
            return await func(*args, **kwargs)
        except HTTPException:
            raise
        except (SQLAlchemyDataError, AsyncPGDataError) as e:
            if hasattr(args[0], "session"):
                await args[0].session.rollback()
            if "value out of int32 range" in str(e):
                raise HTTPException(
                    status_code=400,
                    detail="Некорректные данные: значение выходит за пределы допустимого диапазона",
                ) from e
            raise HTTPException(
                status_code=400,
                detail=f"Некорректные данные: {str(e)}",
            ) from e
        except (IntegrityError, UniqueViolationError) as e:
            if hasattr(args[0], "session"):
                await args[0].session.rollback()
            raise HTTPException(
                status_code=409,
                detail="Конфликт данных: нарушение ограничений целостности",
            ) from e
        except (OperationalError, ProgrammingError) as e:
            if hasattr(args[0], "session"):
                await args[0].session.rollback()
            raise HTTPException(
                status_code=500,
                detail="Внутренняя ошибка базы данных",
            ) from e
        except DBAPIError as e:
            if hasattr(args[0], "session"):
                await args[0].session.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка базы данных: {str(e)}",
            ) from e
        except Exception as e:
            if hasattr(args[0], "session"):
                await args[0].session.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Неожиданная ошибка: {str(e)}",
            ) from e

    return wrapper
