from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.models.enums.appointments import AppointmentRole
from src.schemas.appointments import AppointmentAttendeeSchema, AppointmentSchema


class AppointmentService:
    """
    Сервис для управления встречами
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        """Инициализация избранных психологами клиента

        Args:
            store: Хранилище данных, используемое для операций с избранными.
        """
        self._store = store

    async def create_appointment(
        self, client_id: int, psychologist_id: int, start_at: datetime
    ) -> AppointmentSchema:
        is_exist = await self._store.psychologist.check_exist(model_id=psychologist_id)

        if not is_exist:
            raise HTTPException(status_code=404, detail="Psychologist not found")

        new_appointment = await self._store.appointment.add(
            start_at=start_at,
            ends_at=start_at + timedelta(hours=1),
        )

        await self._store.appointment_attendee.add(
            user_id=psychologist_id,
            appointment_id=new_appointment.id,
            role=AppointmentRole.PSYCHOLOGIST,
        )
        await self._store.appointment_attendee.add(
            user_id=client_id,
            appointment_id=new_appointment.id,
            role=AppointmentRole.CLIENT,
        )

        return AppointmentSchema(
            id=new_appointment.id,
            start_at=new_appointment.start_at,
            ends_at=new_appointment.ends_at,
            is_group=new_appointment.is_group,
            attendees=[
                AppointmentAttendeeSchema(
                    user_id=client_id,
                    role=AppointmentRole.CLIENT,
                ),
                AppointmentAttendeeSchema(
                    user_id=psychologist_id,
                    role=AppointmentRole.PSYCHOLOGIST,
                ),
            ],
        )

    async def _get_user_appointments(
        self,
        client_id: int,
        limit: int,
        offset: int,
        user_type: AppointmentRole,
        is_upcoming: bool = True,
        filter_client_id: int | None = None,
    ) -> list[AppointmentSchema]:
        data = await self._store.appointment.find_appointments(
            user_id=client_id,
            limit=limit,
            offset=offset,
            role=user_type,
            is_upcoming=is_upcoming,
            client_id=filter_client_id,
        )
        return [
            AppointmentSchema(
                id=appointment.appointment_id,
                start_at=appointment.start_at,
                ends_at=appointment.ends_at,
                is_group=appointment.is_group,
                attendees=[
                    AppointmentAttendeeSchema(
                        user_id=user["user_id"],
                        role=user["role"],
                        name=user["name"] or "Клиент",
                        avatar=settings.STATIC_BASE_URL + user["avatar"]
                        if user["avatar"]
                        else None,
                    )
                    for user in appointment.attendees
                ],
            )
            for appointment in data
        ]

    async def get_client_appointments(
        self, client_id: int, limit: int, offset: int
    ) -> list[AppointmentSchema]:
        return await self._get_user_appointments(
            client_id=client_id,
            limit=limit,
            offset=offset,
            user_type=AppointmentRole.CLIENT,
        )

    async def get_psychologist_appointments(
        self,
        psychologist_id: int,
        limit: int,
        offset: int,
        is_upcoming: bool = True,
        client_id: int | None = None,
    ) -> list[AppointmentSchema]:
        return await self._get_user_appointments(
            client_id=psychologist_id,
            limit=limit,
            offset=offset,
            user_type=AppointmentRole.PSYCHOLOGIST,
            is_upcoming=is_upcoming,
            filter_client_id=client_id,
        )
