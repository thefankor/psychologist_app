"""slot_exclude_overlap_constraint

Revision ID: 3aea906fe27a
Revises: 1e151e2cfe29
Create Date: 2026-05-14 14:09:58.826492

Adds a Postgres EXCLUDE constraint that prevents any two availability slots
of the same psychologist from having overlapping [starts_at, ends_at)
intervals. Requires the btree_gist extension so the integer psychologist_id
can participate in a GIST index alongside the tstzrange.

This is the canonical correctness layer for slot overlap; application-level
checks (the pre-filter in SlotGenerationService) are performance optimisations
on top of it.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "3aea906fe27a"
down_revision: Union[str, Sequence[str], None] = "1e151e2cfe29"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")
    # Remove overlapping duplicates (keeping smallest id), cascade through FK chain
    op.execute(
        """
        DELETE FROM appointments_attendees
        WHERE appointment_id IN (
            SELECT a.id FROM appointments a
            JOIN psychologist_availability_slots s1 ON a.slot_id = s1.id
            JOIN psychologist_availability_slots s2
              ON s1.psychologist_id = s2.psychologist_id
             AND s1.id > s2.id
             AND tstzrange(s1.starts_at, s1.ends_at, '[)') && tstzrange(s2.starts_at, s2.ends_at, '[)')
        )
        """
    )
    op.execute(
        """
        DELETE FROM appointments
        WHERE slot_id IN (
            SELECT a.id
            FROM psychologist_availability_slots a
            JOIN psychologist_availability_slots b
              ON a.psychologist_id = b.psychologist_id
             AND a.id > b.id
             AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(b.starts_at, b.ends_at, '[)')
        )
        """
    )
    op.execute(
        """
        DELETE FROM psychologist_availability_slots a
        USING psychologist_availability_slots b
        WHERE a.id > b.id
          AND a.psychologist_id = b.psychologist_id
          AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(b.starts_at, b.ends_at, '[)')
        """
    )
    op.execute(
        """
        ALTER TABLE psychologist_availability_slots
        ADD CONSTRAINT no_slot_overlap
        EXCLUDE USING gist (
            psychologist_id WITH =,
            tstzrange(starts_at, ends_at, '[)') WITH &&
        )
        """
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE psychologist_availability_slots "
        "DROP CONSTRAINT IF EXISTS no_slot_overlap"
    )
    # btree_gist extension is left in place; other tables may use it.
