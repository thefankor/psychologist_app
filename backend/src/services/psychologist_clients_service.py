from fastapi import Depends, HTTPException
from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.schemas.clients import ClientProfileForPsychologist, PsychologistClientSchema


class PsychologistClientsService:
    def __init__(self, store: Store = Depends(get_store)):
        self._store = store

    async def get_clients(
        self,
        psychologist_id: int,
        limit: int = 25,
        offset: int = 0,
        name: str | None = None,
    ) -> list[PsychologistClientSchema]:
        rows = await self._store.appointment_attendee.get_psychologist_clients(
            psychologist_id=psychologist_id,
            limit=limit,
            offset=offset,
            name=name,
        )
        return [
            PsychologistClientSchema(
                client_id=row["client_id"],
                name=row["name"] if row["name"] else "Anonymous",
                avatar=(settings.STATIC_BASE_URL + row["avatar"])
                if row["avatar"]
                else None,
                first_session=row["first_session"].date(),
                total_sessions=row["total_sessions"],
            )
            for row in rows
        ]

    async def get_client_profile(
        self, psychologist_id: int, user_id: int
    ) -> ClientProfileForPsychologist:
        has_appointment = await self._store.appointment_attendee.has_shared_appointment(
            psychologist_id=psychologist_id, client_id=user_id
        )
        if not has_appointment:
            raise HTTPException(status_code=403, detail="Нет записей с этим клиентом")

        client = await self._store.client.find_one_or_none(id=user_id)
        if not client:
            raise HTTPException(status_code=404, detail="Клиент не найден")

        avatar = None
        if client.avatar:
            avatar = settings.STATIC_BASE_URL + client.avatar

        return ClientProfileForPsychologist(
            id=client.id,
            name=client.name,
            age=client.age,
            gender=client.gender,
            birth_date=client.birth_date,
            avatar=avatar,
            emotions=client.emotions or [],
            relations=client.relations or [],
            work=client.work or [],
            life=client.life or [],
            personal=client.personal or [],
            format=client.format or [],
        )
