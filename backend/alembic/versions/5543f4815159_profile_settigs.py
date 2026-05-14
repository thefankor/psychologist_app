"""profile_settings

Revision ID: 5543f4815159
Revises: c674b9a1b942
Create Date: 2025-10-22 22:54:59.837701
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5543f4815159"
down_revision: Union[str, Sequence[str], None] = "c674b9a1b942"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    # Define ENUMs
    timeformat = sa.Enum("FIRST", "SOME", "LONG", name="timeformat")
    dateformat = sa.Enum(
        "MORNING",
        "DAY",
        "EVENING",
        "WEEKEND_MORNING",
        "WEEKEND_DAY",
        "WEEKEND_EVENING",
        name="dateformat",
    )
    methodformat = sa.Enum(
        "GESTALT",
        "PSYHODRAM",
        "PSYHOANALISE",
        "EXISTENAL",
        "SYSTEM",
        name="methodformat",
    )
    pricingformat = sa.Enum("SMALL", "MEDIUM", "LARGE", name="pricingformat")

    # 1) Create the ENUM types in Postgres (idempotent)
    timeformat.create(bind, checkfirst=True)
    dateformat.create(bind, checkfirst=True)
    methodformat.create(bind, checkfirst=True)
    pricingformat.create(bind, checkfirst=True)

    # 2) Add columns using the created ENUMs
    op.add_column(
        "client_profiles",
        sa.Column("time_format", timeformat, nullable=True),
    )
    op.add_column(
        "client_profiles",
        sa.Column("date_format", dateformat, nullable=True),
    )
    op.add_column(
        "client_profiles",
        sa.Column("method_format", methodformat, nullable=True),
    )
    op.add_column(
        "client_profiles",
        sa.Column("pricing_format", pricingformat, nullable=True),
    )
    (
        op.add_column(
            "client_profiles",
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()

    # Define ENUMs again so we can drop them
    timeformat = sa.Enum(name="timeformat")
    dateformat = sa.Enum(name="dateformat")
    methodformat = sa.Enum(name="methodformat")
    pricingformat = sa.Enum(name="pricingformat")

    # 1) Drop columns that depend on the ENUMs
    op.drop_column("client_profiles", "pricing_format")
    op.drop_column("client_profiles", "method_format")
    op.drop_column("client_profiles", "date_format")
    op.drop_column("client_profiles", "time_format")
    op.drop_column("client_profiles", "time_format")

    # 2) Drop ENUM types (idempotent)
    pricingformat.drop(bind, checkfirst=True)
    methodformat.drop(bind, checkfirst=True)
    dateformat.drop(bind, checkfirst=True)
    timeformat.drop(bind, checkfirst=True)
