# SIH Dead Reckoning — Reference Backend (`backend/backend/`)

> [!NOTE]
> **SECONDARY / REFERENCE IMPLEMENTATION NOTICE**
> This TypeScript/Node.js implementation is preserved as an algorithmic reference (EKF, sensor-fusion mathematics, anomaly detection) and test bed.
> The **authoritative project backend** is the Python FastAPI service located at `backend/app/` (configured in root `docker-compose.yml` and `Makefile`).

Real-time GNSS/IMU sensor-fusion backend reference for the [SIH_DEAD_RECKONING](https://github.com/saksham4455/SIH_DEAD_RECKONING)
frontend. Ingests raw device sensor data over WebSocket, runs it through an
Extended Kalman Filter (dead reckoning + GNSS fusion), and streams back
diagnostics matching the `types/navigation.ts` shapes.

## 📁 Backend Architecture

```
backend/
│
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
│
├── public/
│   └── device-client.html      # browser page: streams a real phone's sensors/GPS to /ws
│
├── data/
│   └── sessions.json           # file-backed session store (created on first run)
│
└── src/
    │
    ├── server.ts                # HTTP + WebSocket bootstrap
    ├── app.ts                   # Express app factory
    │
    ├── api/
    │   ├── routes/
    │   │   ├── sessionRoutes.ts     # GET/DELETE /api/sessions, GET /:id/live
    │   │   └── dashboardRoutes.ts   # GET /api/dashboard/summary
    │   └── middleware/
    │       └── errorHandler.ts
    │
    ├── websocket/
    │   └── socketServer.ts      # real-time device ingest — see protocol below
    │
    ├── core/                    # the fusion engine (pure, no I/O)
    │   ├── sessionManager.ts        # owns live NavigationEngine instances + broadcast loop
    │   ├── navigationEngine.ts      # per-session state machine (IMU + GNSS -> snapshot)
    │   ├── kalmanFilter.ts          # 4-state CTRV Extended Kalman Filter
    │   ├── deadReckoning.ts         # raw IMU sample -> scalar KF inputs
    │   ├── satelliteFusion.ts       # per-constellation weighting, fix-quality assessment
    │   ├── thermalCompensation.ts   # temperature-based IMU bias correction
    │   ├── anomalyDetection.ts      # pothole/bump detection from vertical accel
    │   └── aiInference.ts           # confidence-score heuristic for the diagnostics panel
    │
    ├── services/
    │   └── sessionStore.ts      # persistence (file-backed; swap for a DB later)
    │
    ├── types/
    │   └── navigation.ts        # mirrors the frontend's types/navigation.ts 1:1
    │
    ├── utils/
    │   ├── matrix.ts             # tiny linear-algebra helpers for the EKF
    │   └── geo.ts                # ENU projection, heading conversions, haversine
    │
    ├── config/
    │   └── constants.ts          # every tunable threshold/noise value in one place
    │
    └── __tests__/                 # jest unit tests for the engine, matrix, AI heuristic
```

## 🚦 Data flow (real device → UI)

```
Phone sensors (accel, gyro, GPS)
        │  raw JSON frames over WebSocket
        ▼
  socketServer.ts  ──────────────► SessionManager
        │                                │
        │                     one NavigationEngine per session
        │                                │
        │                 IMU  → deadReckoning → KalmanFilter.predict()
        │                 GNSS → satelliteFusion → KalmanFilter.updateGeneric()
        │                                │
        │                     DiagnosticsSnapshot (every 200ms)
        ▼                                │
  WebSocket push ◄────────────────────────┘
        │
        ▼
  Frontend useNavigationData() hook → Screens → UI components
```

On `stop_session` (or an unexpected disconnect), the session's track and
anomalies are persisted via `sessionStore.ts` and become visible through the
REST API (`/api/sessions`, `/api/dashboard/summary`) for `DashboardScreen`.

## 🔌 WebSocket ingest protocol

Endpoint: `ws://<host>:8080/ws`. One connection = one session.

**Client → server** (JSON text frames):

| Type | Payload | Notes |
|---|---|---|
| `start_session` | `{ sessionId? }` | Omit `sessionId` to let the server generate one |
| `imu` | `{ data: ImuSample }` | Send at whatever rate the device produces samples (20–100Hz typical) |
| `gnss` | `{ data: GnssFix }` | Send on every OS location update |
| `simulate_outage` | `{ enabled: boolean }` | Wires up `SimulateOutageButton` |
| `stop_session` | — | Ends and persists the session |

**Server → client:**

| Type | Payload |
|---|---|
| `session_started` | `{ sessionId }` |
| `diagnostics` | `{ data: DiagnosticsSnapshot }` — pushed every `DIAGNOSTICS_BROADCAST_INTERVAL_MS` |
| `anomaly` | `{ data: RoadAnomalyEvent }` — pushed as detected |
| `session_stopped` | `{ data: SessionSummary }` |
| `error` | `{ message }` |

`ImuSample` and `GnssFix` shapes are defined in `src/types/navigation.ts` —
mirror these exactly on the frontend/mobile side:

```ts
interface ImuSample {
  timestamp: number;           // ms epoch
  gyro: { x, y, z };           // rad/s
  accel: { x, y, z };          // m/s^2, gravity INCLUDED (raw off the sensor)
  temperatureC?: number | null;
}

interface GnssFix {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  speedMps?: number;           // Doppler-derived ground speed, if available
  bearingDeg?: number;         // Doppler-derived course-over-ground
  hdop?: number;
  satellites: { constellation: 'GPS'|'NAVIC'|'OTHER'; snrDbHz: number; usedInFix: boolean }[];
}
```

## 🌐 REST API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/sessions` | List past sessions (for `DashboardScreen`) |
| GET | `/api/sessions/:id` | Full track + anomalies for a past session |
| GET | `/api/sessions/:id/live` | On-demand snapshot of a *live* session (polling fallback) |
| DELETE | `/api/sessions/:id` | Discard a recorded session |
| GET | `/api/dashboard/summary` | Aggregate stats for the dashboard StatCards |

## ▶️ Running it

```bash
npm install
cp .env.example .env
npm run dev        # ts-node-dev, auto-reload
# or
npm run build && npm start
```

Server logs the REST, WebSocket, and test-client URLs on boot.

### Testing with a real phone (no native app needed yet)

Open **`http://<your-machine-ip>:8080/device-client.html`** on a phone on the
same network. It requests motion-sensor + location permission, then streams
the phone's real accelerometer, gyroscope, and GPS to `/ws` exactly as a
native build would, and renders the live diagnostics coming back. Useful for
validating the fusion pipeline against genuine sensor noise before the
React Native app's sensor plumbing (`react-native-sensors` /
`react-native-geolocation-service` or similar) is wired up to send the same
message shapes.

> Browser Geolocation doesn't expose real per-satellite constellation/SNR
> data, so the client synthesizes a plausible 5-satellite `OTHER`
> breakdown sized off reported GPS accuracy. A native app reading Android's
> `GnssStatus` or iOS CoreLocation's satellite info can send genuine
> per-constellation data, which is what actually drives the NAVIC weighting.

### Tests

```bash
npm test
```

Covers the matrix inversion helper, the AI confidence heuristic, and an
end-to-end `NavigationEngine` scenario (anchor on first fix, GNSS timeout →
dead reckoning fallback, outage simulation, distance accumulation).

## ⚙️ Tuning

Every threshold — process noise, UERE per constellation, anomaly
sensitivity, thermal coefficients, confidence penalties, broadcast rate — is
centralized in `src/config/constants.ts` with comments on units and where
the number came from. Nothing else in the codebase hardcodes a magic number.

## 📌 Known simplifications (flagged, not hidden)

- **Device orientation**: `deadReckoning.ts` assumes a roughly flat, fixed
  mount (x-axis forward, z-axis up). A phone loose in a pocket needs an
  attitude estimator (Madgwick/complementary filter) upstream — not
  implemented here to keep the EKF math tractable for the demo.
- **Thermal coefficients** in `constants.ts` are illustrative MEMS figures,
  not calibrated against the actual target device.
- **Session store** is a JSON file for simplicity; swap `sessionStore.ts`
  for Postgres/Mongo without touching `SessionManager` or the routes.
