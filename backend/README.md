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
  - `security.py`: JWT token lifecycle (`create_access_token`, `create_refresh_token`, `create_device_token`), password hashing with `bcrypt`, deterministic keyed device hashing (`SHA-256(raw_device_id + jwt_secret)`), and FastAPI dependencies (`get_current_user`, `get_current_device`, `require_admin`).
- **`app/api/v1/`**: Versioned REST endpoints:
  - `/api/v1/auth`: User authentication, refresh token exchange, profile inspection (`/login`, `/refresh`, `/me`).
  - `/api/v1/devices`: Public hardware device registration (`/register`), administrative device listing and model pinning (`GET /devices`, `PATCH /devices/{id}`).
  - `/api/v1/telemetry`: Ingest single or batch telemetry (device-authenticated), query session telemetry.
  - `/api/v1/session`: Start and stop sessions (device-authenticated), compute summary metrics.
  - `/api/v1/maps`: Bounding-box road queries and OSM corridor lookups.
  - `/api/v1/models`: Model registry latest active metadata query, binary download streaming, administrative model upload, rollback, and deletion.
- **`app/api/websockets/`**: Real-time live dashboard broadcast (`/ws/judge-dashboard`) and connection tracking.
- **`app/schemas/`**: Pydantic v2 schemas validating request and response payloads.
- **`app/models/`**: Declarative SQLAlchemy 2.x models (`User`, `Device`, `DriveSession`, `TelemetryRecord`, `RoadNetwork`, `ModelVersion`).
- **`app/services/`**: Pure computation and query services (`drift_analyzer`, `model_registry_service`, `map_query_service`).

---

## Authoritative vs. Reference Backend Notice

- **Authoritative Backend (`backend/app/`)**: This Python FastAPI application is the official runtime used by Docker (`docker-compose.yml`), root `Makefile` (`make run-backend`), and all integration workflows.
- **Reference / Secondary Backend (`backend/backend/`)**: The TypeScript/Express implementation located in `backend/backend/` is a secondary/reference implementation preserved strictly for its navigation algorithms (UKF, EKF, matrix inversion, anomaly detection) and test suites. It is not invoked by default system workflows.

---

## Phase 7 — Authentication & Device Registration Architecture

1. **User Identity & Admin Bootstrap**:
   - Public self-service user registration is omitted. Accounts are provisioned exclusively via administrative bootstrap.
   - CLI Bootstrap Command:
     ```bash
     python -m backend.scripts.create_admin
     ```
     Prompts securely for username and password, verifies non-duplication, hashes password using `bcrypt` with unique salts, and creates an administrative `User`. Passwords and credentials are never hardcoded or logged.

2. **Environment-Backed Secrets**:
   - Required environment variable:
     ```bash
     SIH_JWT_SECRET="your-secure-32byte-jwt-secret"
     ```
   - No default fallback secret is committed in code. If unconfigured in environments where authentication is invoked, the application fails safely with HTTP 500.

3. **Deterministic Keyed Device Hashing**:
   - Hardware device registration uses:
     $$\text{device\_id\_hash} = \text{SHA-256}(\text{raw\_device\_id} + \text{SIH\_JWT\_SECRET})$$
   - Only the 64-character hexadecimal SHA-256 digest is persisted (`devices` table). Raw device IDs are never stored in PostgreSQL, never logged, and never returned in API responses.

4. **Endpoint Authorization Matrix**:
   | Category | Endpoint | Access Level |
   | :--- | :--- | :--- |
   | System | `GET /health`, `GET /ready`, `GET /` | Public |
   | Authentication | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` | Public |
   | User Profile | `GET /api/v1/auth/me` | User Bearer Token (`get_current_user`) |
   | Device Edge | `POST /api/v1/devices/register` | Public |
   | Telemetry Ingestion | `POST /api/v1/telemetry`, `POST /api/v1/telemetry/batch` | Device Bearer Token (`get_current_device`) |
   | Session Control | `POST /api/v1/session/start`, `POST /api/v1/session/{id}/stop` | Device Bearer Token (`get_current_device`) |
   | Telemetry & Maps Read | `GET /api/v1/telemetry/session/*`, `GET /api/v1/session/*/summary`, `GET /api/v1/maps/corridor` | Public |
   | Models Read | `GET /api/v1/models/`, `GET /api/v1/models/latest`, `GET /api/v1/models/download/*` | Public |
   | Models Management | `POST /api/v1/models`, `POST /api/v1/models/{id}/rollback`, `DELETE /api/v1/models/{id}` | Admin Only (`require_admin`) |
   | Device Management | `GET /api/v1/devices`, `PATCH /api/v1/devices/{id}` | Admin Only (`require_admin`) |

5. **WebSocket Security Policy**:
   - The `/ws/judge-dashboard` WebSocket lifecycle is preserved without URL query parameter token passing (`?token=...`), avoiding token leaks in logs, proxy histories, or tracing layers.

---

## Running & Verification

### Running Server
```bash
SIH_JWT_SECRET="your-secure-jwt-secret-key-32chars" uvicorn app.main:app --reload --port 8000
```

### Admin Account Creation
```bash
python -m backend.scripts.create_admin
```

### Running Comprehensive Backend Tests
```bash
python -m pytest backend/tests/ -v
```
