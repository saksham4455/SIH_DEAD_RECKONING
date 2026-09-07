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

## Current Architecture & State (Phase 1)

1. **In-Memory Store**: Telemetry points and session metadata currently run against an in-memory `TelemetryStore` for rapid development and testing. Data does not persist across application restarts.
2. **Database Engine**: An async SQLite engine is initialized by default on startup (`sih_dead_reckoning.db`). PostgreSQL/PostGIS persistence, foreign key relationships, and Alembic migrations are scheduled for Phase 2.
3. **Redis**: Redis client configuration is available in `core/redis_client.py`, but pub/sub telemetry broadcasting is deferred to Phase 4.
4. **Authentication & Object Storage**: S3/MinIO cloud storage and JWT authentication are intentionally deferred to subsequent phases.

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
