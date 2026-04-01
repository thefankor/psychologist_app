# Psychologist App

Mental health platform connecting clients with psychologists. Supports personal and group sessions, real-time messaging, video calls, meditation content, and onboarding surveys.

## Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native + Expo (v54) + Expo Router + TypeScript |
| Web | Vite + React + TypeScript |
| Backend | FastAPI (Python) + PostgreSQL + Redis + Celery |
| Real-time | WebSocket |
| Video | Яндекс Телемост |

## Project Structure

```
.
├── backend/          # FastAPI backend
├── frontend/         # React Native mobile app
├── frontend-web/     # Web client (Vite)
└── compose.yml       # Docker Compose for full stack
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 1. Configure environment

```bash
cp .env.example .env
# Fill in your values (see Environment Variables section below)
```

### 2. Run with Docker (recommended)

```bash
make start_dev      # Start all services in background
make stop_dev       # Stop all services
make build_dev      # Rebuild images
```

Or directly:

```bash
docker compose up
```

Services started:
- `backend` — FastAPI at http://localhost:8000
- `db` — PostgreSQL at port 5432
- `redis-prod` — Redis at port 6379
- `celery-worker` — Background task worker
- `frontend-web` — Web client at http://localhost:5173

### 3. Apply database migrations

```bash
cd backend
alembic upgrade head
```

## Development

### Mobile (`frontend/`)

```bash
cd frontend
npx expo start           # Start dev server
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npx expo lint            # Lint
```

### Web (`frontend-web/`)

```bash
cd frontend-web
npm install
npm run dev              # Start at http://localhost:5173
```

### Backend (`backend/`)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Migrations
alembic upgrade head
alembic revision --autogenerate -m "description"
```

### Linting (backend)

```bash
make ruff_fix    # Auto-fix lint + format
make ruff_check  # Check without fixing
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST` | PostgreSQL host |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | DB credentials |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Redis connection |
| `RESEND_API_KEY` / `RESEND_EMAIL` | Resend email service |
| `SMS_AERO_LOGIN` / `SMS_AERO_KEY` / `SMS_AERO_SIGN` | SMS Aero for SMS notifications |
| `ACCESS_SECRET_KEY` / `ALGORITHM` / `ACCESS_TOKEN_EXPIRE_DAYS` | JWT auth |
| `LIVEKIT_WS_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | LiveKit video |
| `STATIC_DIR` | Path to static files volume |

## Auth Flow

1. `POST /auth/login/` — send email, receive a one-time code
2. `POST /auth/verify/?user_type=client|psychologist` — verify code, receive JWT token

## API

Auto-generated docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc