from datetime import datetime, timezone
from uuid import UUID

from fastapi import Depends

from src.core.dependencies import get_store
from src.core.exceptions import (
    AppointmentAlreadyCancelledError,
    NotAppointmentAttendeeError,
    NotSlotOwnerError,
    SlotNotAvailableError,
    SlotNotBookedError,
    SlotNotFoundError,
)
from src.crud import Store
from src.models import Appointment
from src.models.enums.appointments import AppointmentRole


class BookingService:
    """Бронирование слота клиентом и двусторонняя отмена.

    Использует оптимистичное блокирование: переход состояния слота
    выполняется единственным `UPDATE … WHERE status=…`, без удержания
    строки SELECT FOR UPDATE на всё время запроса. Это уменьшает
    длительность взаимных блокировок и не зависит от того, когда
    request-scoped транзакция получит commit.

    Асимметрия отмены:
    - Клиент отменяет → слот возвращается в FREE.
    - Психолог отменяет → слот становится CANCELLED.
    """

    def __init__(self, store: Store = Depends(get_store)):
        self._store = store

    async def book_slot(self, client_id: int, slot_id: UUID) -> Appointment:
        """Бронирует FREE-слот для клиента.

        Атомарно переводит слот FREE→BOOKED через UPDATE и получает
        psychologist_id в RETURNING; затем создаёт запись и двух attendees.

        Raises:
            SlotNotFoundError: слот с таким id не существует.
            SlotNotAvailableError: слот не находится в статусе FREE.
        """
        psychologist_id = await self._store.availability_slot.try_book(slot_id=slot_id)
        if psychologist_id is None:
            exists = await self._store.availability_slot.find_by_id(model_id=slot_id)
            if exists is None:
                raise SlotNotFoundError()
            raise SlotNotAvailableError()

        appointment = await self._store.appointment.add(
            return_model=True, slot_id=slot_id, is_group=False
        )
        await self._store.appointment_attendee.add(
            return_model=False,
            appointment_id=appointment.id,
            user_id=client_id,
            role=AppointmentRole.CLIENT,
        )
        await self._store.appointment_attendee.add(
            return_model=False,
            appointment_id=appointment.id,
            user_id=psychologist_id,
            role=AppointmentRole.PSYCHOLOGIST,
        )
        await self._store.session.flush()
        return appointment

    async def cancel_by_client(self, client_id: int, appointment_id: UUID) -> None:
        """Клиент отменяет свою запись. Слот возвращается в FREE.

        Slot-переход атомарен через try_release. Запись помечается как
        отменённая клиентом в той же request-транзакции.

        Raises:
            SlotNotFoundError, AppointmentAlreadyCancelledError,
            NotAppointmentAttendeeError.
        """
        appt = await self._store.session.get(Appointment, appointment_id)
        if appt is None:
            raise SlotNotFoundError(detail="Запись не найдена")
        if appt.cancelled_at is not None:
            raise AppointmentAlreadyCancelledError()

        attendees = await self._store.appointment_attendee.find_all(
            appointment_id=appointment_id, user_id=client_id
        )
        if not attendees:
            raise NotAppointmentAttendeeError()

        released = await self._store.availability_slot.try_release(slot_id=appt.slot_id)
        if not released:
            # Гонка: психолог только что отменил этот же слот.
            raise AppointmentAlreadyCancelledError()

        appt.cancelled_at = datetime.now(timezone.utc)
        appt.cancelled_by = AppointmentRole.CLIENT
        await self._store.session.flush()

    async def cancel_by_psy(
        self,
        psychologist_id: int,
        slot_id: UUID,
        reason: str | None = None,
    ) -> None:
        """Психолог отменяет BOOKED-слот. Слот становится CANCELLED.

        Slot-переход + проверка владельца атомарны через try_psy_cancel.
        При неуспехе disambig-SELECT определяет точную причину 4xx-ответа.

        Raises:
            SlotNotFoundError, NotSlotOwnerError, SlotNotBookedError.
        """
        ok = await self._store.availability_slot.try_psy_cancel(
            slot_id=slot_id, psychologist_id=psychologist_id
        )
        if not ok:
            slot = await self._store.availability_slot.find_by_id(model_id=slot_id)
            if slot is None:
                raise SlotNotFoundError()
            if slot.psychologist_id != psychologist_id:
                raise NotSlotOwnerError()
            raise SlotNotBookedError()

        appt_rows = await self._store.appointment.find_all(slot_id=slot_id)
        appt = appt_rows[0] if appt_rows else None
        if appt is None:
            raise SlotNotFoundError(detail="Запись по слоту не найдена")

        appt.cancelled_at = datetime.now(timezone.utc)
        appt.cancelled_by = AppointmentRole.PSYCHOLOGIST
        appt.cancellation_reason = reason
        await self._store.session.flush()
