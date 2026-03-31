from pydantic import BaseModel
from src.models.enums import MethodFormat


class FavoritesPsychologistsResponse(BaseModel):
    """Схема ответа получения избранных психологов пользователя"""

    id: int
    avatar: str | None
    full_name: str
    methods: list[MethodFormat]


class PsychologistID(BaseModel):
    """Схема для запроса добавления/удаления психолога из избранных"""

    id: int
