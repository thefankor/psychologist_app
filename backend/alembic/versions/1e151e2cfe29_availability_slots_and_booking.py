"""availability_slots_and_booking

Revision ID: 1e151e2cfe29
Revises: 640586435caf
Create Date: 2026-05-14 12:38:10.627528

"""
import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "1e151e2cfe29"
down_revision: Union[str, Sequence[str], None] = "640586435caf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # --- A: extend psychologist_profiles -----------------------------------
    op.add_column(
        "psychologist_profiles",
        sa.Column(
            "timezone",
            sa.String(length=64),
            server_default="Europe/Moscow",
            nullable=False,
        ),
    )
    op.add_column(
        "psychologist_profiles",
        sa.Column(
            "session_duration_minutes",
            sa.Integer(),
            server_default="60",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        "ck_session_duration_range",
        "psychologist_profiles",
        "session_duration_minutes > 0 AND session_duration_minutes <= 480",
    )

    # --- B: drop UNIQUE on working hours -----------------------------------
    op.drop_constraint(
        op.f("uq_psychologist_day"),
        "psychologist_working_hours",
        type_="unique",
    )

    # --- C: create the availability_slots table ----------------------------
    op.create_table(
        "psychologist_availability_slots",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("psychologist_id", sa.Integer(), nullable=False),
        sa.Column("starts_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("ends_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column(
            "status",
            sa.Enum("FREE", "BOOKED", "CANCELLED", name="slot_status"),
            server_default="FREE",
            nullable=False,
        ),
        sa.Column(
            "source",
            sa.Enum("TEMPLATE", "MANUAL", name="slot_source"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("ends_at > starts_at", name="ck_slot_time_order"),
        sa.ForeignKeyConstraint(
            ["psychologist_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "psychologist_id", "starts_at", name="uq_slot_psy_starts"
        ),
    )
    op.create_index(
        "ix_slots_psy_status_starts",
        "psychologist_availability_slots",
        ["psychologist_id", "status", "starts_at"],
        unique=False,
    )
    op.create_index(
        "ix_slots_starts",
        "psychologist_availability_slots",
        ["starts_at"],
        unique=False,
    )

    # --- D: prepare appointments (slot_id NULLABLE first) ------------------
    op.add_column(
        "appointments",
        sa.Column("slot_id", sa.UUID(), nullable=True),
    )
    op.add_column(
        "appointments",
        sa.Column("cancelled_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.add_column(
        "appointments",
        sa.Column(
            "cancelled_by",
            sa.Enum("CLIENT", "PSYCHOLOGIST", name="appointmentrole"),
            nullable=True,
        ),
    )
    op.add_column(
        "appointments",
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
    )

    # --- E: backfill synthetic slots for existing appointments -------------
    conn = op.get_bind()
    rows = conn.execute(
        sa.text(
            """
            SELECT a.id AS appointment_id,
                   a.start_at,
                   a.ends_at,
                   att.user_id AS psychologist_id
              FROM appointments a
              JOIN appointments_attendees att
                ON att.appointment_id = a.id
               AND att.role = 'PSYCHOLOGIST'
            """
        )
    ).fetchall()

    for row in rows:
        new_slot_id = uuid.uuid4()
        conn.execute(
            sa.text(
                """
                INSERT INTO psychologist_availability_slots
                       (id, psychologist_id, starts_at, ends_at, status, source,
                        created_at, updated_at)
                VALUES (:id, :psy, :start_at, :end_at, 'BOOKED', 'MANUAL',
                        now(), now())
                """
            ),
            {
                "id": new_slot_id,
                "psy": row.psychologist_id,
                "start_at": row.start_at,
                "end_at": row.ends_at,
            },
        )
        conn.execute(
            sa.text(
                "UPDATE appointments SET slot_id = :sid WHERE id = :aid"
            ),
            {"sid": new_slot_id, "aid": row.appointment_id},
        )

    # --- F: finalize appointments schema -----------------------------------
    op.alter_column("appointments", "slot_id", nullable=False)
    op.create_foreign_key(
        "fk_appointment_slot",
        "appointments",
        "psychologist_availability_slots",
        ["slot_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.drop_column("appointments", "ends_at")
    op.drop_column("appointments", "start_at")

    # --- G: fix appointments_attendees cascade -----------------------------
    op.drop_constraint(
        op.f("appointments_attendees_appointment_id_fkey"),
        "appointments_attendees",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "appointments_attendees_appointment_id_fkey",
        "appointments_attendees",
        "appointments",
        ["appointment_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Revert appointment_attendees cascade
    op.drop_constraint(
        "appointments_attendees_appointment_id_fkey",
        "appointments_attendees",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("appointments_attendees_appointment_id_fkey"),
        "appointments_attendees",
        "appointments",
        ["appointment_id"],
        ["id"],
    )

    # Restore start_at/ends_at on appointments from slot data
    op.add_column(
        "appointments",
        sa.Column(
            "start_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
    )
    op.add_column(
        "appointments",
        sa.Column(
            "ends_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
    )
    op.execute(
        """
        UPDATE appointments a
           SET start_at = s.starts_at,
               ends_at  = s.ends_at
          FROM psychologist_availability_slots s
         WHERE a.slot_id = s.id
        """
    )
    op.alter_column("appointments", "start_at", nullable=False)
    op.alter_column("appointments", "ends_at", nullable=False)

    op.drop_constraint(
        "fk_appointment_slot", "appointments", type_="foreignkey"
    )
    op.drop_column("appointments", "cancellation_reason")
    op.drop_column("appointments", "cancelled_by")
    op.drop_column("appointments", "cancelled_at")
    op.drop_column("appointments", "slot_id")

    op.drop_index(
        "ix_slots_starts", table_name="psychologist_availability_slots"
    )
    op.drop_index(
        "ix_slots_psy_status_starts",
        table_name="psychologist_availability_slots",
    )
    op.drop_table("psychologist_availability_slots")
    sa.Enum(name="slot_source").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="slot_status").drop(op.get_bind(), checkfirst=True)

    op.create_unique_constraint(
        op.f("uq_psychologist_day"),
        "psychologist_working_hours",
        ["psychologist_id", "day_of_week"],
    )

    op.drop_constraint(
        "ck_session_duration_range",
        "psychologist_profiles",
        type_="check",
    )
    op.drop_column("psychologist_profiles", "session_duration_minutes")
    op.drop_column("psychologist_profiles", "timezone")
