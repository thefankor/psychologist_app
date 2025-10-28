from datetime import datetime

from sqlalchemy import TIMESTAMP, func
from sqlalchemy.orm import Mapped, declarative_base, mapped_column

Base = declarative_base()


class BaseWithTimestamps(Base):
    """
    Базовая модель для всех таблиц базы данных.

    Предоставляет общие поля и функциональность для всех моделей:
    - created_at: время создания записи
    - updated_at: время последнего обновления записи
    """

    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )
