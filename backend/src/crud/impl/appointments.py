from sqlalchemy import case, func, literal, select
from sqlalchemy.dialects.postgresql import JSONB, aggregate_order_by
from sqlalchemy.orm import aliased
from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models import (
    Appointment,
    AppointmentAttendee,
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
                Appointment.start_at,
                Appointment.ends_at,
                Appointment.is_group,
                attendees_json,
            )
            .select_from(Appointment)
            # Подтягиваем всех участников + их профили
            .outerjoin(a, a.appointment_id == Appointment.id)
            .outerjoin(cp, cp.id == a.user_id)  # если участник клиент — попадём в cp
            .outerjoin(pp, pp.id == a.user_id)  # если участник психолог — попадём в pp
            .where(attendee_filter)
            .group_by(Appointment.id)
            .order_by(Appointment.start_at.desc())  # новые -> старые
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
