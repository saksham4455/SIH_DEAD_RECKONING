# SIH26168 — Backend Infrastructure & Sensor Fusion Engines

The `backend/` directory provides the dual backend architecture powering the SIH Dead Reckoning navigation system:
1. **Python FastAPI Hub (Port 8000)**: Asynchronous REST telematics, PostGIS/SQLite persistence, JWT authentication, Device management, and Model Hub (OTA deployment).
2. **TypeScript EKF Engine (Port 8080)**: High-frequency real-time sensor fusion, 4-state CTRV Extended Kalman Filter, NavIC/GPS satellite weighting, and WebSocket streaming.

---

## 📁 Architecture Overview

```
backend/
├── app/                        # Python FastAPI Backend
│   ├── main.py                 # Application lifecycle, CORS, routing
│   ├── config.py               # Pydantic Settings (SIH_ prefix)
│   ├── api/v1/                 # REST endpoints
│   │   ├── auth.py             # User login, refresh token, /me
│   │   ├── devices.py          # Device registration & version pinning
│   │   ├── session.py          # Drive session lifecycle (start, stop, summary)
│   │   ├── telemetry.py        # Single & batch telemetry ingestion
│   │   ├── maps.py             # PostGIS corridor queries & OSM upload
│   │   └── models_hub.py       # TFLite OTA upload, latest version, download
│   ├── api/websockets/         # Live judge dashboard & replay stream
│   ├── core/                   # Security, DB sessionmaker, Redis pub/sub
│   ├── models/                 # SQLAlchemy 2.0 async declarative models
│   ├── schemas/                # Pydantic v2 validation schemas
│   ├── services/               # Drift analyzer, map query, road seeder, model registry
│   └── storage/                # S3/MinIO & local filesystem object storage
│
├── src/                        # TypeScript Real-Time Fusion Engine
│   ├── server.ts               # Express + ws bootstrap
│   ├── app.ts                  # Express application factory
│   ├── api/routes/             # REST fallback routes (/api/dashboard, /api/sessions)
│   ├── core/                   # Fusion mathematics (pure, no I/O)
│   │   ├── kalmanFilter.ts     # 4-state CTRV Extended Kalman Filter
│   │   ├── deadReckoning.ts    # IMU preprocessing & gravity removal
│   │   ├── navigationEngine.ts # Per-session state machine
│   │   ├── satelliteFusion.ts  # NavIC/GPS SNR-weighted blending
│   │   ├── anomalyDetection.ts # Pothole & speed-breaker classifier
│   │   ├── thermalCompensation.ts # IMU temperature bias correction
│   │   └── aiInference.ts      # Confidence heuristic scorer
│   ├── websocket/socketServer.ts # High-frequency WebSocket ingest (/ws)
│   └── services/sessionStore.ts # Thread-safe promise-queued session store
│
├── tests/                      # Python PyTest test suite (58 tests)
├── src/__tests__/              # TypeScript Jest test suite (11 tests)
├── public/device-client.html   # Browser phone sensor streaming test client
├── sih_dead_reckoning.db       # Populated 86 KB SQLite database
├── tsconfig.json               # TypeScript configuration
├── package.json                # Node.js dependencies & scripts
└── requirements.txt            # Python dependencies
```

---

## ⚡ Running the Backend

### Python FastAPI Backend (Port 8000)
```powershell
# From project root:
cd backend
& "..\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Health Probe**: `http://localhost:8000/health`
- **Ready Probe**: `http://localhost:8000/ready`

### TypeScript EKF & WebSocket Engine (Port 8080)
```powershell
cd backend
npm install
npm run build
npm run dev
# Or direct production start:
node dist/server.js
```
- **REST Endpoints**: `http://localhost:8080/api`
- **WebSocket Ingest**: `ws://localhost:8080/ws`
- **Browser Sensor Client**: `http://localhost:8080/device-client.html`

---

## 🔌 API Endpoint Summary

### FastAPI REST Endpoints (Port 8000)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/v1/auth/login` | `POST` | Public | Bcrypt user authentication, returns JWT access & refresh tokens |
| `/api/v1/auth/refresh` | `POST` | Public | Issues new access token from valid refresh token |
| `/api/v1/devices/register` | `POST` | Public | Registers hardware device with keyed SHA-256 hash |
| `/api/v1/devices` | `GET` | Admin | Lists registered devices and active pinned models |
| `/api/v1/session/start` | `POST` | Device | Initiates driving session |
| `/api/v1/session/{id}/stop` | `POST` | Device | Closes session and sets completion timestamp |
| `/api/v1/session/{id}/summary` | `GET` | Public | Drift analytics (RMSE, MAE, dead-reckoning drift %) |
| `/api/v1/telemetry` | `POST` | Device | Ingests telemetry with PostGIS Point geometry |
| `/api/v1/telemetry/batch` | `POST` | Device | Atomically inserts 1–1000 telemetry records |
| `/api/v1/maps/corridor` | `GET` | Public | PostGIS `ST_Intersects` bounding box road query |
| `/api/v1/models/latest` | `GET` | Public | Retrieves active TFLite model metadata |
| `/api/v1/models/download/{id}` | `GET` | Public | Streams raw TFLite model binary chunks |
| `/ws/judge-dashboard` | `WS` | Public | Live telemetry stream + interactive session replay |

### TypeScript WebSocket Protocol (Port 8080)
| Message Type | Direction | Payload Description |
|---|---|---|
| `start_session` | Client → Server | Client UUID or auto-generated session start |
| `imu` | Client → Server | 20–100 Hz 6-axis accel/gyro + temperature |
| `gnss` | Client → Server | 1–10 Hz lat/lon, Doppler speed, bearing, HDOP, satellites |
| `simulate_outage` | Client → Server | Drops GNSS fixes for live dead reckoning demos |
| `diagnostics` | Server → Client | 5 Hz broadcast: vehicle state, fusion mode, NavIC weight, confidence |
| `anomaly` | Server → Client | Instant push: detected potholes and speed-breakers |

---

## 🧪 Automated Test Suites

```bash
# Python FastAPI Tests (58 tests)
pytest tests/

# TypeScript Jest Tests (11 tests across 3 suites)
npm test
```
