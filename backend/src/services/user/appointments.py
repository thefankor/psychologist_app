from uuid import UUID

from fastapi import Depends

from src.config import settings
from src.core.dependencies import get_store
from src.crud import Store
from src.models.enums.appointments import AppointmentRole
from src.schemas.appointments import AppointmentAttendeeSchema, AppointmentSchema
from src.services.availability.booking import BookingService


class AppointmentService:
    """Сервис для управления встречами клиента.

    Бронирование и отмена делегируются в BookingService.
    Чтение списков использует AppointmentDAO.find_appointments
    с JOIN на слоты для получения времени приёма.
    """

    def __init__(
        self,
        store: Store = Depends(get_store),
    ):
        self._store = store

    async def book_slot(self, client_id: int, slot_id: UUID) -> AppointmentSchema:
        """Клиент бронирует слот. Возвращает созданную запись."""
        booking = BookingService(store=self._store)
        appt = await booking.book_slot(client_id=client_id, slot_id=slot_id)
        # Загружаем слот явно, чтобы избежать lazy-load на relationship
        # (async-сессия не делает синхронный IO для отложенных связей).
        slot = await self._store.availability_slot.find_by_id(model_id=appt.slot_id)
        return AppointmentSchema(
            id=appt.id,
            slot_id=appt.slot_id,
            start_at=slot.starts_at,
            ends_at=slot.ends_at,
            is_group=appt.is_group,
            cancelled_at=appt.cancelled_at,
            cancelled_by=appt.cancelled_by,
            cancellation_reason=appt.cancellation_reason,
            attendees=[
                AppointmentAttendeeSchema(
                    user_id=client_id, role=AppointmentRole.CLIENT
                ),
                AppointmentAttendeeSchema(
                    user_id=slot.psychologist_id,
                    role=AppointmentRole.PSYCHOLOGIST,
                ),
            ],
        )

    async def cancel_appointment(self, client_id: int, appointment_id: UUID) -> None:
        """Клиент отменяет свою запись."""
        booking = BookingService(store=self._store)
        await booking.cancel_by_client(
            client_id=client_id, appointment_id=appointment_id
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
                slot_id=appointment.appointment_id,  # placeholder
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
