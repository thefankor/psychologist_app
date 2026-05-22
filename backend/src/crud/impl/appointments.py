from datetime import datetime, timezone

from sqlalchemy import case, func, literal, select
from sqlalchemy.dialects.postgresql import JSONB, aggregate_order_by
from sqlalchemy.orm import aliased

from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models import (
    Appointment,
    AppointmentAttendee,
    AvailabilitySlot,
    ClientProfile,
    PsychologistProfile,
)
from src.models.enums.appointments import AppointmentRole


class AppointmentDAO(BaseDAO):
    """
    DAO для работы со встречами
    """

    model = Appointment

    @handle_db_errors
    async def find_appointments(
        self,
        user_id: int,
        role: AppointmentRole,
        limit: int = 50,
        offset: int = 0,
        is_upcoming: bool = True,
        client_id: int | None = None,
    ):
        # 1) Фильтр: вернуть только те встречи, где этот user_id участвует с нужной ролью
        attendee_filter = (
            select(literal(1))
            .select_from(AppointmentAttendee)
            .where(
                AppointmentAttendee.appointment_id == Appointment.id,
                AppointmentAttendee.user_id == user_id,
                AppointmentAttendee.role == role,
            )
            .exists()
        )

        # Дополнительный фильтр: только записи с конкретным клиентом
        if client_id is not None:
            client_filter = (
                select(literal(1))
                .select_from(AppointmentAttendee)
                .where(
                    AppointmentAttendee.appointment_id == Appointment.id,
                    AppointmentAttendee.user_id == client_id,
                    AppointmentAttendee.role == AppointmentRole.CLIENT,
                )
                .exists()
            )

        # 2) Алиас для "всех участников" встречи (чтобы агрегировать)
        a = aliased(AppointmentAttendee)
        cp = aliased(ClientProfile)
        pp = aliased(PsychologistProfile)

        display_name_expr = case(
            (a.role == AppointmentRole.CLIENT, cp.name),
            (
                a.role == AppointmentRole.PSYCHOLOGIST,
                func.concat_ws(" ", pp.first_name, pp.last_name),
            ),
            else_=None,
        )

        avatar_expr = case(
            (a.role == AppointmentRole.CLIENT, cp.avatar),
            (a.role == AppointmentRole.PSYCHOLOGIST, pp.avatar),
            else_=None,
        )

        attendees_json = func.coalesce(
            func.jsonb_agg(
                aggregate_order_by(
                    func.jsonb_build_object(
                        "user_id",
                        a.user_id,
                        "role",
                        a.role,
                        "name",
                        display_name_expr,
                        "avatar",
                        avatar_expr,
                    ),
                    a.created_at.asc(),  # порядок участников внутри массива
                )
            ).filter(a.id.isnot(None)),
            func.cast(literal("[]"), JSONB),
        ).label("attendees")

        query = (
            select(
                Appointment.id.label("appointment_id"),
                AvailabilitySlot.starts_at.label("start_at"),
                AvailabilitySlot.ends_at,
                Appointment.is_group,
                attendees_json,
            )
            .select_from(Appointment)
            # Slot хранит время приёма
            .join(AvailabilitySlot, AvailabilitySlot.id == Appointment.slot_id)
            # Подтягиваем всех участников + их профили
            .outerjoin(a, a.appointment_id == Appointment.id)
            .outerjoin(cp, cp.id == a.user_id)  # если участник клиент — попадём в cp
            .outerjoin(pp, pp.id == a.user_id)  # если участник психолог — попадём в pp
            .where(attendee_filter)
        )

        if client_id is not None:
            query = query.where(client_filter)

        now = datetime.now(timezone.utc)
        if is_upcoming:
            query = query.where(AvailabilitySlot.ends_at > now)
            order = AvailabilitySlot.starts_at.asc()
        else:
            query = query.where(AvailabilitySlot.ends_at <= now)
            order = AvailabilitySlot.starts_at.desc()

        query = (
            query.group_by(
                Appointment.id, AvailabilitySlot.starts_at, AvailabilitySlot.ends_at
            )
            .order_by(order)
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(query)
        return result.mappings().all()


class AppointmentAttendeeDAO(BaseDAO):
    """
    DAO для работы с участниками встречи
    """

    model = AppointmentAttendee

    @handle_db_errors
    async def get_psychologist_clients(
        self,
        psychologist_id: int,
        limit: int = 25,
        offset: int = 0,
        name: str | None = None,
    ):
        """
        Возвращает всех клиентов психолога с первой сессией и количеством сессий.
        """
        psychologist_attendee = aliased(AppointmentAttendee)
        client_attendee = aliased(AppointmentAttendee)
        cp = aliased(ClientProfile)

        query = (
            select(
                client_attendee.user_id.label("client_id"),
                cp.name,
                cp.avatar,
                func.min(AvailabilitySlot.starts_at).label("first_session"),
                func.count(Appointment.id).label("total_sessions"),
            )
            .select_from(psychologist_attendee)
            .join(
                client_attendee,
                psychologist_attendee.appointment_id == client_attendee.appointment_id,
            )
            .join(
                Appointment,
                Appointment.id == psychologist_attendee.appointment_id,
            )
            .join(AvailabilitySlot, AvailabilitySlot.id == Appointment.slot_id)
            .outerjoin(cp, cp.id == client_attendee.user_id)
            .where(
                psychologist_attendee.user_id == psychologist_id,
                psychologist_attendee.role == AppointmentRole.PSYCHOLOGIST,
                client_attendee.role == AppointmentRole.CLIENT,
            )
        )

        if name is not None:
            query = query.where(cp.name.ilike(f"%{name}%"))

        query = (
            query.group_by(client_attendee.user_id, cp.name, cp.avatar)
            .order_by(func.min(AvailabilitySlot.starts_at).desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(query)
        return result.mappings().all()

    @handle_db_errors
    async def has_shared_appointment(self, user_id_a: int, user_id_b: int) -> bool:
        attendee_a = aliased(AppointmentAttendee)
        attendee_b = aliased(AppointmentAttendee)

        query = (
            select(literal(1))
            .select_from(attendee_a)
            .join(
                attendee_b,
                attendee_a.appointment_id == attendee_b.appointment_id,
            )
            .where(
                attendee_a.user_id == user_id_a,
                attendee_b.user_id == user_id_b,
            )
            .exists()
        )

        result = await self.session.execute(select(query))
        return result.scalar()
