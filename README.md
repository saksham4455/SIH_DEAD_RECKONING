# SIH_DEAD_RECKONING 
Architecture:
│
├── README.md
│
├── mobile
│   │
│   ├── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   │
│   └── src
│       │
│       ├── components
│       │   │
│       │   ├── common
│       │   │   ├── Card.tsx
│       │   │   ├── StatCard.tsx
│       │   │   └── StatusBadge.tsx
│       │   │
│       │   ├── navigation
│       │   │   ├── NavigationMap.tsx
│       │   │   └── VehicleMarker.tsx
│       │   │
│       │   └── diagnostics
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
│       ├── screens
│       │   ├── DashboardScreen.tsx
│       │   └── SessionScreen.tsx
│       │
│       ├── navigation
│       │   └── AppNavigator.tsx
│       │
│       ├── data
│       │   └── mockData.ts
│       │
│       ├── types
│       │   └── navigation.ts
│       │
│       ├── hooks
│       │   └── useNavigationData.ts
│       │
│       ├── theme
│       │   ├── colors.ts
│       │   ├── spacing.ts
│       │   └── typography.ts
│       │
│       └── utils
│           └── formatters.ts
│
└── docs
    └── frontend-architecture.md
