from src.crud.impl.base import BaseDAO
from src.models import PsychologistProfile


class PsychologistDAO(BaseDAO):
    """
    DAO для работы с психологами.

    Предоставляет методы для управления психологами, проверки
    их статуса, создания новых психологов и получения информации.
    """

    model = PsychologistProfile
