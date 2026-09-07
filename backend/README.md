# SIH Dead Reckoning — Authoritative Backend (`backend/app/`)

This directory contains the authoritative backend application for the Intelligent Dead Reckoning System.

## Architecture Overview

The authoritative backend runtime is implemented in Python using FastAPI, structured under `backend/app/`:

- **`app/main.py`**: Application factory (`create_app`), async lifespan management, modular middleware, exception handlers, and router registration.
- **`app/config.py`**: Centralized environment-driven settings via `pydantic-settings` (prefixed with `SIH_`).
- **`app/core/`**:
  - `exceptions.py`: Centralized domain exception hierarchy (`AppException`, `NotFoundError`, `SessionNotFoundError`, `ValidationError`, etc.) and standardized JSON error formatting.
  - `middleware.py`: Request logging middleware tracking duration, HTTP status, and propagating `X-Request-ID`.
  - `database.py`: Async SQLAlchemy 2.0 engine lifecycle and the in-memory `TelemetryStore` interface boundary.
  - `redis_client.py`: Redis connection client initialization.
  - `security.py`: API key security dependency.
- **`app/api/v1/`**: Versioned REST endpoints:
  - `/api/v1/telemetry`: Ingest single or batch telemetry, query telemetry by session.
  - `/api/v1/session`: Start, stop, and compute summary metrics (RMSE, MAE, drift %) for navigation sessions.
  - `/api/v1/maps`: Bounding-box road queries and OSM file uploads.
  - `/api/v1/models`: Model registry latest metadata query and artifact downloads.
- **`app/api/websockets/`**: Real-time live dashboard broadcast (`/ws/judge-dashboard`) and connection tracking.
- **`app/schemas/`**: Pydantic v2 schemas validating request and response payloads.
- **`app/models/`**: Declarative SQLAlchemy models (`DriveSession`, `TelemetryRecord`, `RoadNetwork`).
- **`app/services/`**: Pure computation and query services (`drift_analyzer`, `map_query_service`, `replay_service`).

---

## Authoritative vs. Reference Backend Notice

- **Authoritative Backend (`backend/app/`)**: This Python FastAPI application is the official runtime used by Docker (`docker-compose.yml`), root `Makefile` (`make run-backend`), and all integration workflows.
- **Reference / Secondary Backend (`backend/backend/`)**: The TypeScript/Express implementation located in `backend/backend/` is a secondary/reference implementation preserved strictly for its navigation algorithms (UKF, EKF, matrix inversion, anomaly detection) and test suites. It is not invoked by default system workflows.

---

## Database Architecture & State (Phase 2 Foundation)

1. **Target Relational Database**: PostgreSQL with PostGIS extension (`postgis/postgis:16-3.4`) is the authoritative relational database target.
2. **Environment Configuration**: Database connection string is environment-driven via `SIH_DATABASE_URL` (defaulting to `postgresql+asyncpg://sih:sih@localhost:5432/sih` in `alembic.ini` and `postgresql+asyncpg://sih:sih@db:5432/sih` in `docker-compose.yml`). SQLite remains available for lightweight local mock runs, but the core schema and Alembic migrations target PostgreSQL/PostGIS.
3. **Alembic Migrations**: Schema migrations are managed versioned via Alembic located in `backend/alembic/`. Automatic `Base.metadata.create_all()` has been removed from application startup and is no longer the schema management strategy.
4. **Running Migrations**:
   ```bash
   # From backend/ directory:
   alembic upgrade head
   ```
5. **Docker Compose Database**:
   ```bash
   # Start the PostGIS database container
   docker compose up -d db
   ```
6. **Persistence Boundary**: Telemetry and session REST endpoints continue to use the in-memory `TelemetryStore` throughout Phase 2. Relational persistence for API endpoints will be connected in Phase 3.

---

## Running Locally

### Prerequisites
- Python 3.11+
- Virtual environment (`.venv`)

### Start Server (from `backend/` directory)
```bash
# Windows
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Unix / macOS
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Start Server (from repository root)
```bash
# Using Makefile
make run-backend

# Or directly with uvicorn
uvicorn app.main:app --app-dir backend --reload --port 8000
```

### Docker Compose
```bash
docker compose up --build backend
```

Open `http://127.0.0.1:8000/docs` for interactive Swagger OpenAPI documentation or `http://127.0.0.1:8000/health` for service health.
