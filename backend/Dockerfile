# syntax=docker/dockerfile:1.7

# ---------- builder ----------
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1

# Build deps for any source-built wheels (asyncpg/bcrypt/pillow ship wheels for
# manylinux x86_64, but keep these as insurance for arm64 / version bumps).
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libjpeg-dev \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /build
COPY requirements.txt requirements-test.txt ./
RUN pip install -r requirements.txt -r requirements-test.txt

# ---------- runtime ----------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Runtime libs for pillow (cheap insurance even if wheels bundle them).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg62-turbo \
        zlib1g \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1000 app \
    && useradd  --system --uid 1000 --gid app --home /app --shell /sbin/nologin app \
    && mkdir -p /app/static \
    && chown -R app:app /app

COPY --from=builder /opt/venv /opt/venv

WORKDIR /app

# Copy entrypoint first so a change to it doesn't bust the larger COPY cache below.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Application source — in compose, this is overlaid by a bind-mount for hot-reload.
COPY --chown=app:app . /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["python", "-c", "import urllib.request,sys; r=urllib.request.urlopen('http://127.0.0.1:8000/docs', timeout=2); sys.exit(0 if r.status==200 else 1)"]

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
