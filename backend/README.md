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

## Persistence & Spatial Architecture (Phases 3, 4 & 5 Complete)

1. **Authoritative Persistence**: PostgreSQL with PostGIS extension (`postgis/postgis:16-3.4`) is the authoritative production database. Operational session management (`/api/v1/session/*`) and telemetry ingestion/retrieval (`/api/v1/telemetry/*`) are fully persisted using SQLAlchemy 2.0 and `AsyncSession`.
2. **Session Persistence**: Sessions (`DriveSession`) are created via `POST /api/v1/session/start` with a stable UUID primary key, `started_at` timestamp, and `active` status. Sessions are stopped via `POST /api/v1/session/{id}/stop`, updating `stopped_at` and `status='stopped'`.
3. **Telemetry Persistence & Geometry**: `TelemetryRecord` rows are inserted with relational foreign keys (`session_id` -> `drive_sessions.id` on delete cascade). PostGIS geometry (`POINT(longitude latitude)` with SRID 4326) is constructed and persisted for every record.
4. **Batch Transactions**: `POST /api/v1/telemetry/batch` verifies all referenced session IDs upfront and commits all telemetry records within a single database transaction.
5. **Ordered Retrieval & Summaries**: `GET /api/v1/telemetry/session/{id}` returns telemetry records strictly ordered by `timestamp ASC`. `GET /api/v1/session/{id}/summary` computes drift statistics (RMSE, MAE, drift %) directly from persisted records using `drift_analyzer`.
6. **Phase 4 — Redis Real-Time Telemetry**:
   - Redis Pub/Sub (`telemetry:live`) serves as the auxiliary real-time event transport.
   - Flow: Ingest Telemetry -> PostgreSQL Commit -> Redis Publish -> Background Subscriber -> WebSocket (`/ws/judge-dashboard`).
   - Single-broadcast guarantee: Direct broadcast from route is disabled when Redis is active to prevent duplicates.
   - Redis failure isolation: Failures during publish never roll back or fail PostgreSQL telemetry persistence.
7. **Phase 5 — PostGIS Map & Spatial Queries**:
   - Runtime road querying via `GET /api/v1/maps/corridor` is fully migrated to PostGIS.
   - Bounding-box queries use `ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)` and `ST_Intersects(road_networks.geom, envelope)` using the existing GIST spatial index (`idx_road_networks_geom`).
   - Road geometry uses `MULTILINESTRING` with SRID 4326 and strict `(X=longitude, Y=latitude)` coordinate order.
   - Static JSON (`maps/demo-region/roads.json`) is strictly decoupled from request execution and is no longer read during runtime API requests.
   - Seeding demo roads into PostGIS:
     ```bash
     python backend/scripts/seed_roads.py
     ```
   - Future Map-Matching Scope: Advanced spatial features such as nearest-road geometry lookup (`ST_Distance`/`ST_DWithin`), Hidden Markov Model (HMM) trajectory map matching, and turn-by-turn route planning will be built in subsequent phases.
8. **Phase 6 — Model Hub & S3/MinIO Object Storage**:
   - Model hub with PostgreSQL metadata persistence (`model_versions` table) and S3-compatible object storage (MinIO for local development).
   - Only valid `.tflite` models (verified via FlatBuffers `TFL3` magic header) are accepted.
   - Enforces at most one active model per `model_type` at the database level via a partial unique index (`UNIQUE(model_type) WHERE is_active = true`).
   - Atomic rollback: `POST /api/v1/models/{version_id}/rollback` deactivates the current version and activates the target version in a single database transaction.
   - Delete protection: Active models cannot be deleted (`DELETE /api/v1/models/{version_id}` returns 400 Bad Request).
   - Storage client (`backend/app/storage/object_storage_client.py`) uses `boto3` for MinIO/S3 and provides a configuration-controlled local filesystem fallback (`model_artifacts/`).
   - Required environment variables:
     ```bash
     SIH_S3_ENDPOINT_URL=http://localhost:9000
     SIH_S3_BUCKET=idr-models
     SIH_S3_ACCESS_KEY=minioadmin
     SIH_S3_SECRET_KEY=minioadmin
     SIH_S3_REGION=us-east-1
     ```
9. **Running with PostgreSQL, Redis & MinIO**:
   ```bash
   # Start PostGIS, Redis, and MinIO services
   docker compose up -d db cache minio

   # Run migrations
   alembic upgrade head

   # Seed demo road network
   python backend/scripts/seed_roads.py

   # Run backend with PostgreSQL, Redis, and MinIO connections
   SIH_DATABASE_URL=postgresql+asyncpg://sih:sih@localhost:5432/sih \
   SIH_REDIS_URL=redis://localhost:6379/0 \
   SIH_S3_ENDPOINT_URL=http://localhost:9000 \
   SIH_S3_BUCKET=idr-models \
   SIH_S3_ACCESS_KEY=minioadmin \
   SIH_S3_SECRET_KEY=minioadmin \
   uvicorn app.main:app --reload
   ```
10. **Verification**: Full test suite can be verified with:
   ```bash
   python -m pytest backend/tests/ -v
   ```


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
