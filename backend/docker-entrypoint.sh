#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    echo "[entrypoint] Running alembic upgrade head..."
    alembic upgrade head
else
    echo "[entrypoint] RUN_MIGRATIONS=0, skipping migrations"
fi

exec "$@"
