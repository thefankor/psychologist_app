import uuid
from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio

from src.core.exceptions import (
    AppointmentAlreadyCancelledError,
    NotAppointmentAttendeeError,
    NotSlotOwnerError,
    SlotNotAvailableError,
    SlotNotBookedError,
    SlotNotFoundError,
)
from src.models import Appointment, AvailabilitySlot, SlotSource, SlotStatus
from src.models.enums import UserRole
from src.models.enums.appointments import AppointmentRole
from src.services.availability.booking import BookingService

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def psy_and_client(store):
    psy_user = await store.user.add(
        return_model=True,
        email=f"psy-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    await store.psychologist.add(
        return_model=False,
        id=psy_user.id,
        first_name="T",
        last_name="P",
        timezone="Europe/Moscow",
        session_duration_minutes=60,
    )
    client = await store.user.add(
        return_model=True,
        email=f"c-{uuid.uuid4()}@example.com",
        roles=[UserRole.CLIENT.value],
    )
    return psy_user.id, client.id


@pytest_asyncio.fixture
async def free_slot(store, psy_and_client):
    psy_id, _ = psy_and_client
    starts = datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
    slot = await store.availability_slot.add(
        return_model=True,
        psychologist_id=psy_id,
        starts_at=starts,
        ends_at=starts + timedelta(hours=1),
        status=SlotStatus.FREE,
        source=SlotSource.MANUAL,
    )
    return slot


async def test_book_free_slot_creates_appointment_and_marks_booked(
    store, psy_and_client, free_slot
):
    _, client_id = psy_and_client
    service = BookingService(store=store)
    appt = await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    refreshed = await store.session.get(AvailabilitySlot, free_slot.id)
    assert refreshed.status == SlotStatus.BOOKED
    assert appt.slot_id == free_slot.id

    attendees = await store.appointment_attendee.find_all(appointment_id=appt.id)
    roles = {a.role for a in attendees}
    assert roles == {AppointmentRole.CLIENT, AppointmentRole.PSYCHOLOGIST}


async def test_book_non_free_slot_raises(store, psy_and_client, free_slot):
    _, client_id = psy_and_client
    await store.availability_slot.set_status(free_slot.id, SlotStatus.CANCELLED)
    service = BookingService(store=store)
    with pytest.raises(SlotNotAvailableError):
        await service.book_slot(client_id=client_id, slot_id=free_slot.id)


async def test_book_missing_slot_raises(store, psy_and_client):
    _, client_id = psy_and_client
    service = BookingService(store=store)
    with pytest.raises(SlotNotFoundError):
        await service.book_slot(client_id=client_id, slot_id=uuid.uuid4())


async def test_client_cancel_returns_slot_to_free(store, psy_and_client, free_slot):
    _, client_id = psy_and_client
    service = BookingService(store=store)
    appt = await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    await service.cancel_by_client(client_id=client_id, appointment_id=appt.id)
    refreshed = await store.session.get(AvailabilitySlot, free_slot.id)
    assert refreshed.status == SlotStatus.FREE
    refreshed_appt = await store.session.get(Appointment, appt.id)
    assert refreshed_appt.cancelled_by == AppointmentRole.CLIENT
    assert refreshed_appt.cancelled_at is not None


async def test_psy_cancel_marks_slot_cancelled(store, psy_and_client, free_slot):
    psy_id, client_id = psy_and_client
    service = BookingService(store=store)
    await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    await service.cancel_by_psy(
        psychologist_id=psy_id, slot_id=free_slot.id, reason="отпуск"
    )
    refreshed = await store.session.get(AvailabilitySlot, free_slot.id)
    assert refreshed.status == SlotStatus.CANCELLED


async def test_psy_cancel_not_booked_raises(store, psy_and_client, free_slot):
    psy_id, _ = psy_and_client
    service = BookingService(store=store)
    with pytest.raises(SlotNotBookedError):
        await service.cancel_by_psy(psychologist_id=psy_id, slot_id=free_slot.id)


async def test_psy_cancel_not_owner_raises(store, psy_and_client, free_slot):
    _, client_id = psy_and_client
    other_psy = await store.user.add(
        return_model=True,
        email=f"psy2-{uuid.uuid4()}@example.com",
        roles=[UserRole.PSYCHOLOGIST.value],
    )
    service = BookingService(store=store)
    await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    with pytest.raises(NotSlotOwnerError):
        await service.cancel_by_psy(psychologist_id=other_psy.id, slot_id=free_slot.id)


async def test_cancel_already_cancelled_raises(store, psy_and_client, free_slot):
    _, client_id = psy_and_client
    service = BookingService(store=store)
    appt = await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    await service.cancel_by_client(client_id=client_id, appointment_id=appt.id)
    with pytest.raises(AppointmentAlreadyCancelledError):
        await service.cancel_by_client(client_id=client_id, appointment_id=appt.id)


async def test_cancel_by_non_attendee_raises(store, psy_and_client, free_slot):
    _, client_id = psy_and_client
    other = await store.user.add(
        return_model=True,
        email=f"other-{uuid.uuid4()}@example.com",
        roles=[UserRole.CLIENT.value],
    )
    service = BookingService(store=store)
    appt = await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    with pytest.raises(NotAppointmentAttendeeError):
        await service.cancel_by_client(client_id=other.id, appointment_id=appt.id)


async def test_second_book_same_slot_raises(store, psy_and_client, free_slot):
    _, client_id = psy_and_client
    second_client = await store.user.add(
        return_model=True,
        email=f"c2-{uuid.uuid4()}@example.com",
        roles=[UserRole.CLIENT.value],
    )
    service = BookingService(store=store)
    await service.book_slot(client_id=client_id, slot_id=free_slot.id)
    with pytest.raises(SlotNotAvailableError):
        await service.book_slot(client_id=second_client.id, slot_id=free_slot.id)
