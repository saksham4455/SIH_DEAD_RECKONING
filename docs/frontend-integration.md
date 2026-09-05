# Frontend Integration Contract

This document defines the architectural boundary, data flow, and contract between the React Native frontend (`mobile/`) and the underlying navigation engine, native bridges, and services for the Intelligent Dead Reckoning System.

---

## A. Frontend Responsibilities

The React Native application layer has a strictly defined scope:

### In Scope for Frontend
- **UI Rendering**: Constructing and rendering tactical telemetry displays, map visualizations, status indicators, and diagnostic panels.
- **Screen Navigation**: Managing transitions between application screens (e.g., `DashboardScreen` ↔ `SessionScreen`) via React Navigation.
- **User Interaction**: Handling touch events, button presses, and UI layout toggles.
- **Displaying Engine Outputs**: Receiving and formatting output data from the navigation core for user presentation.
- **Local Presentation State**: Managing component-level visual states (e.g., collapsed diagnostic panels, visual mock outage cues, timer displays).

### Out of Scope for Frontend (Strict Architectural Boundary)
The React Native frontend explicitly does **NOT**:
- Perform sensor fusion mathematics (e.g., EKF/UKF matrix operations).
- Compute dead reckoning trajectories or kinematic integrations.
- Parse or process raw GNSS NMEA/RTCM ephemeris or multi-constellation signals.
- Execute edge AI inference, neural network runtimes, or visual odometry models.
- Directly acquire native sensor hardware streams (accelerometer, gyroscope, magnetometer).
- Execute file I/O or persist binary telemetry logs directly in JavaScript.

All complex sensor mathematics, high-frequency estimation loops, and native sensor polling belong exclusively in the C++ navigation core and native platform layers (Android/iOS).

---

## B. Data Flow Architecture

The data access architecture guarantees that screens and components remain completely decoupled from the underlying data source:

```text
┌─────────────────────────────────────────────────────────┐
│     Future Engine / Native Layer / Navigation Store     │
│   (UKF Core, Native Bridges, High-Rate Sensor Loops)    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Live Navigation Data Stream                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 useNavigationData()                     │
│          (Frontend Data Access Hook Boundary)           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   DashboardScreen                       │
│             (Top-Level Screen Container)                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Presentational Components                  │
│  - NavigationMap / VehicleMarker                        │
│  - StatCard (Speed, Heading, Fix, Map Match)            │
│  - FusionModeBadge                                      │
│  - SensorHealthBar                                      │
│  - SatelliteBreakdown                                   │
│  - NavicWeightIndicator                                 │
│  - AiInferencePanel                                     │
│  - ThermalCompensationCard                              │
│  - RoadAnomalyTicker                                    │
└─────────────────────────────────────────────────────────┘
```

---

## C. Current Implementation (Phase 9 & 10)

Currently, the data access boundary is isolated to a single hook:

```text
mockDashboardData (from mobile/src/data/mockData.ts)
                    ↓
           useNavigationData()
                    ↓
             DashboardScreen
```

`mobile/src/hooks/useNavigationData.ts` ingests static baseline mock telemetry from `mobile/src/data/mockData.ts` and returns a strongly typed `DashboardData` structure. `DashboardScreen` and its child components have no direct dependency on `mockData.ts`.

---

## D. Future Implementation

When live navigation telemetry is integrated, the integration point is **exclusively** inside `mobile/src/hooks/useNavigationData.ts`:

- The hook can subscribe to:
  - An event-driven telemetry stream from the TypeScript engine orchestration layer (`mobile/src/engine/`).
  - Native module bridges (`mobile/src/native/`).
  - A centralized navigation store (`mobile/src/store/`).
- **No changes** will be required in `DashboardScreen.tsx` or any of the child diagnostic/navigation components. They will continue to consume `DashboardData` via `useNavigationData()` and render incoming values reactively.

---

## E. `DashboardData` Integration Contract

The integration contract between the data source and the frontend is codified in [`mobile/src/types/navigation.ts`](file:///c:/Users/pc/.gemini/antigravity-ide/scratch/SIH_DEAD_RECKONING/mobile/src/types/navigation.ts):

### Primary Structure: `DashboardData`

```typescript
export interface DashboardData {
  navigationState: NavigationState;
  sensorHealth: SensorHealth;
  satelliteBreakdown: SatelliteBreakdown;
  inferenceStats: InferenceStats;
  anomalyEvents: AnomalyEvent[];
  thermalState: ThermalState;
  navicWeight: number;
  mapMatchConfidence: number;
}
```

### Sub-Contracts

#### 1. Navigation & Fusion State (`NavigationState`)
```typescript
export type FusionMode =
  | 'GNSS_LOCKED'
  | 'GNSS_DEGRADED'
  | 'DEAD_RECKONING'
  | 'REACQUIRING';

export interface NavigationState {
  latitude: number;           // WGS-84 Latitude in degrees
  longitude: number;          // WGS-84 Longitude in degrees
  heading: number;            // 0.0 to 360.0 degrees clockwise from True North
  speed: number;              // Speed over ground in m/s
  confidence: number;         // 0.0 to 1.0 confidence score
  fusionMode: FusionMode;     // Current operational filter state
}
```

#### 2. Sensor Health (`SensorHealth`)
```typescript
export interface SensorHealth {
  accelerometer: boolean;     // IMU linear acceleration nominal
  gyroscope: boolean;         // IMU angular velocity nominal
  magnetometer: boolean;      // Heading magnetic flux nominal
  gnss: boolean;              // GNSS receiver tracking valid fix
}
```

#### 3. Satellite Constellations (`SatelliteBreakdown`)
```typescript
export interface SatelliteInfo {
  count: number;              // Number of visible/tracked satellites
  signalStrength: number;     // Average Carrier-to-Noise Ratio (CNR) in dB-Hz
}

export interface SatelliteBreakdown {
  NavIC: SatelliteInfo;       // Indian Regional Navigation Satellite System
  GPS: SatelliteInfo;         // US Global Positioning System
  Galileo: SatelliteInfo;     // European Union Constellation
  GLONASS: SatelliteInfo;     // Russian Constellation
}
```

#### 4. AI & Visual Odometry Inference (`InferenceStats`)
```typescript
export interface InferenceStats {
  latencyMs: number;          // Model execution latency in milliseconds
  modelVersion: string;       // Model version identifier string (e.g., "v2.4.1-lite")
  confidence: number;         // 0.0 to 1.0 model output certainty
  estimatedSpeed: number;     // AI estimated vehicle speed in m/s
}
```

#### 5. Road Anomaly Events (`AnomalyEvent`)
```typescript
export interface AnomalyEvent {
  type: string;               // Event identifier (e.g., 'pothole', 'speed_breaker')
  timestamp: number;          // Epoch timestamp in milliseconds
  confidence?: number;        // Optional certainty score (0.0 to 1.0)
}
```

#### 6. Thermal Bias Compensation (`ThermalState`)
```typescript
export interface ThermalState {
  temperature: number;        // IMU sensor temperature in degrees Celsius
  biasCorrection: number;     // Online gyro bias drift offset in rad/s
}
```

#### 7. Scalar Confidence Weights
- `navicWeight: number` (0.0 to 1.0): Current weighting allocated to NavIC in multi-GNSS fusion.
- `mapMatchConfidence: number` (0.0 to 1.0): Likelihood that estimated vector aligns with road topology.

---

## F. UI Action Boundaries

The frontend provides interactive triggers that represent session lifecycle and debug workflows:

| UI Action | Current Phase Implementation | Future Engine Integration Target |
| :--- | :--- | :--- |
| **Start Session** | Transitions local session state to `RECORDING` and runs UI timer. | Dispatches session start to `SessionController` / initial filter alignment. |
| **Stop Session** | Transitions local session state to `STOPPED` and stops UI timer. | Flushes binary recorder stream, finalizes UKF session via `SessionController`. |
| **Simulate Outage** | Toggles local state, altering UI mode to `DEAD_RECKONING` with warning banner. | Signals `OutageController` / `GnssDeficitBridge` to cut GNSS input to UKF core. |
| **Record Logs Toggle**| Toggles visual mock logging badge (`LOGGING ACTIVE`). | Triggers telemetry capture in `SessionRecorderService`. |
| **Debug Overlay Toggle** | Toggles visibility of diagnostic telemetry widgets. | Pure frontend presentational toggle (no engine dependency needed). |

All actions currently remain strictly **local mock UI behaviors** with zero engine coupling. When native and engine controllers are introduced, these actions can be wired to the corresponding controller methods without disrupting presentational components.
