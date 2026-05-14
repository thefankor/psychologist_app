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
