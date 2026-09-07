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

## Persistence Architecture & State (Phase 3 Complete)

1. **Authoritative Persistence**: PostgreSQL with PostGIS extension (`postgis/postgis:16-3.4`) is the authoritative production database. Operational session management (`/api/v1/session/*`) and telemetry ingestion/retrieval (`/api/v1/telemetry/*`) are fully persisted using SQLAlchemy 2.0 and `AsyncSession`.
2. **Session Persistence**: Sessions (`DriveSession`) are created via `POST /api/v1/session/start` with a stable UUID primary key, `started_at` timestamp, and `active` status. Sessions are stopped via `POST /api/v1/session/{id}/stop`, updating `stopped_at` and `status='stopped'`.
3. **Telemetry Persistence & Geometry**: `TelemetryRecord` rows are inserted with relational foreign keys (`session_id` -> `drive_sessions.id` on delete cascade). PostGIS geometry (`POINT(longitude latitude)` with SRID 4326) is constructed and persisted for every record.
4. **Batch Transactions**: `POST /api/v1/telemetry/batch` verifies all referenced session IDs upfront and commits all telemetry records within a single database transaction.
5. **Ordered Retrieval & Summaries**: `GET /api/v1/telemetry/session/{id}` returns telemetry records strictly ordered by `timestamp ASC`. `GET /api/v1/session/{id}/summary` computes drift statistics (RMSE, MAE, drift %) directly from persisted records using `drift_analyzer`.
6. **TelemetryStore Status**: The in-memory `TelemetryStore` is removed from all operational REST routes and services. It is retained only as an internal fallback/mock fixture in `core/database.py` and is no longer part of active request execution.
7. **WebSocket Integration**: Live dashboard broadcasts via `ConnectionManager` are preserved during ingestion.
8. **Running with PostgreSQL**:
   ```bash
   # Start the PostGIS database service
   docker compose up -d db

   # Run migrations
   alembic upgrade head

   # Run backend with PostgreSQL connection
   SIH_DATABASE_URL=postgresql+asyncpg://sih:sih@localhost:5432/sih uvicorn app.main:app --reload
   ```
9. **Verification**: Persistence behavior can be verified using the test suite:
   ```bash
   python -m pytest backend/tests/test_persistence.py -v
   ```
10. **Phase 4 Horizon**: Telemetry ingestion and storage is fully operational. Redis pub/sub broadcasting, caching, and real-time streaming are deferred to Phase 4.


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
