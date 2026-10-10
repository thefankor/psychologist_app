import os
import uuid

import pytest

TEST_DB_BACKEND = os.getenv("TEST_DB_BACKEND", "sqlite").lower()

# Custom pytest marker for tests that require PostgreSQL-only features
# (GIST/EXCLUDE constraints, native enum types, JSONB-specific ops).
#
# Conftest hooks (`pytest_collection_modifyitems`) auto-skip tagged tests
# when TEST_DB_BACKEND != "postgres". The CI workflow's postgres job sets it.
#
# Filter usage:  pytest -m requires_postgres
requires_postgres = pytest.mark.requires_postgres


def get_random_user_email():
    return f"u_{uuid.uuid4().hex}@test.com"
