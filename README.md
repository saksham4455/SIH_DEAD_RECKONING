# SIH_DEAD_RECKONING 
## 📁 Frontend Architecture

The frontend is organized into a modular React Native + TypeScript architecture. Each layer has a specific responsibility, making the application easier to develop, test, maintain, and scale.

```text
project-root/
│
├── README.md
│
├── mobile/
│   │
│   ├── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   │
│   └── src/
│       │
│       ├── components/
│       │   │
│       │   ├── common/
│       │   │   ├── Card.tsx
│       │   │   ├── StatCard.tsx
│       │   │   └── StatusBadge.tsx
│       │   │
│       │   ├── navigation/
│       │   │   ├── NavigationMap.tsx
│       │   │   └── VehicleMarker.tsx
│       │   │
│       │   └── diagnostics/
│       │       ├── FusionModeBadge.tsx
│       │       ├── SatelliteBreakdown.tsx
│       │       ├── NavicWeightIndicator.tsx
│       │       ├── AiInferencePanel.tsx
│       │       ├── RoadAnomalyTicker.tsx
│       │       ├── ThermalCompensationCard.tsx
│       │       ├── SimulateOutageButton.tsx
│       │       ├── RecordingControls.tsx
│       │       └── DebugOverlayToggle.tsx
│       │
│       ├── screens/
│       │   ├── DashboardScreen.tsx
│       │   └── SessionScreen.tsx
│       │
│       ├── navigation/
│       │   └── AppNavigator.tsx
│       │
│       ├── data/
│       │   └── mockData.ts
│       │
│       ├── types/
│       │   └── navigation.ts
│       │
│       ├── hooks/
│       │   └── useNavigationData.ts
│       │
│       ├── theme/
│       │   ├── colors.ts
│       │   ├── spacing.ts
│       │   └── typography.ts
│       │
│       └── utils/
│           └── formatters.ts
│
└── docs/
    └── frontend-architecture.md
```

### 🧩 Directory Responsibilities

| Directory                 | Responsibility                                                              |
| ------------------------- | --------------------------------------------------------------------------- |
| `components/common/`      | Reusable UI components such as cards, statistics, and status indicators     |
| `components/navigation/`  | Map, vehicle position, and navigation-related UI                            |
| `components/diagnostics/` | Sensor-fusion, AI, satellite, thermal, anomaly, recording, and debugging UI |
| `screens/`                | Complete application screens composed from reusable components              |
| `navigation/`             | Application-level screen navigation and routing                             |
| `data/`                   | Mock/static data used during frontend development and testing               |
| `types/`                  | TypeScript interfaces and types shared across the application               |
| `hooks/`                  | Reusable React hooks for navigation and application data                    |
| `theme/`                  | Centralized colors, spacing, typography, and visual design tokens           |
| `utils/`                  | Helper functions such as formatting and data transformation                 |
| `docs/`                   | Detailed technical documentation for the frontend architecture              |

### 🚦 Application Structure

The main frontend flow is:

```text
App.tsx
   │
   ▼
AppNavigator
   │
   ├── DashboardScreen
   │
   └── SessionScreen
          │
          ├── NavigationMap
          │     └── VehicleMarker
          │
          └── Diagnostics
                ├── FusionModeBadge
                ├── SatelliteBreakdown
                ├── NavicWeightIndicator
                ├── AiInferencePanel
                ├── RoadAnomalyTicker
                ├── ThermalCompensationCard
                ├── SimulateOutageButton
                ├── RecordingControls
                └── DebugOverlayToggle
```

### 🔄 Data Flow

```text
Mock / Backend Data
        │
        ▼
useNavigationData()
        │
        ▼
    TypeScript Types
        │
        ▼
      Screens
        │
        ▼
   UI Components
        │
        ├── Navigation
        └── Diagnostics
```

### 📌 Design Principles

* **Component-based:** UI is divided into small, reusable React Native components.
* **Separation of concerns:** Screens, components, data, types, hooks, and utilities have separate responsibilities.
* **Type-safe:** TypeScript types are centralized under `src/types/`.
* **Reusable UI:** Common UI elements are shared instead of duplicated.
* **Scalable:** The structure allows backend/API integration without restructuring the entire frontend.
* **Mock-friendly:** `mockData.ts` allows the UI to be developed and tested before the actual navigation engine is connected.
* **Engine-independent:** The frontend consumes navigation/fusion data through hooks and typed interfaces rather than implementing the navigation engine itself.

### 📚 Detailed Documentation

For a deeper explanation of the frontend architecture, component hierarchy, data flow, and integration points, see:

`docs/frontend-architecture.md`
