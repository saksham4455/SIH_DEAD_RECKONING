# SIH26168 — Flutter Frontend & Tactical Navigation HUD

The `frontend/` directory contains the production cross-platform Flutter application (Android, iOS, Web) providing a tactical HUD for vehicle navigation, on-device Edge AI neural inference, physical sensor auto-calibration, and 4-tier offline map caching.

---

## 📱 Features

1. **Tactical Driver HUD**: Real-time Heads-Up Display featuring digital speedometer, heading compass, satellite constellation breakdown, and confidence halo.
2. **Physical Hardware Driver (`sensors_plus`)**: Direct 50 Hz (`SensorInterval.gameInterval`) streaming of Accelerometer, Gyroscope, Magnetometer, and a synthetic Hypsometric Barometer altitude estimator.
3. **Vehicle Alignment Engine**: Continuous low-pass gravity estimation (Euler pitch/roll extraction) and Non-Holonomic Constraint (NHC) enforcement ($v_{\text{lat}} = 0, v_{\text{vert}} = 0$).
4. **4-Tier Offline Tile Engine**:
   - **Tier 1**: 114 pre-bundled OpenStreetMap PNG asset tiles (Zooms 11–16).
   - **Tier 2**: Persistent on-device disk cache (`<appSupportDir>/osm_tile_cache`).
   - **Tier 3**: Live Stadia Maps vector tile fetch with automatic disk persistence.
   - **Tier 4**: Valid 70-byte 1×1 transparent PNG fallback preventing broken tile icons.
5. **Interactive Outage Simulation**: On-screen switches for "Tunnel Blackout Test" (pure dead reckoning fallback) and "Urban Canyon Test" (NavIC prioritization).
6. **Backend Telemetry Client**: 1 Hz asynchronous telemetry sync with the FastAPI backend over HTTP REST with automatic offline resilience.

---

## 📁 Directory Structure

```
frontend/
├── lib/
│   ├── main.dart                      # Eager tile cache init & app boot
│   ├── app_widget.dart                # MaterialApp & dark tactical theme
│   ├── core/
│   │   ├── platform/hardware/
│   │   │   ├── sensor_api.dart        # HardwareSensorInterface contract
│   │   │   ├── sensor_mobile.dart     # Physical 50 Hz Accel/Gyro/Mag driver + Baro
│   │   │   └── vehicle_alignment_engine.dart # Euler angle alignment + NHC
│   │   ├── platform/maps/
│   │   │   └── offline_tile_provider.dart    # 4-tier caching TileProvider
│   │   ├── platform/network/
│   │   │   └── backend_telemetry_client.dart # REST client with token auth
│   │   ├── platform/ffi/              # C++ native bindings (dart:ffi)
│   │   └── theme/app_theme.dart       # High-contrast dark HUD theme
│   └── features/
│       ├── ai_motion/                 # Edge AI TFLite runners & use cases
│       ├── data_acquisition/          # Sensor stream controllers & entities
│       ├── navigation_engine/         # Domain state machine & fusion modes
│       └── navigation_ui/
│           ├── screens/
│           │   ├── dashboard_screen.dart   # Main tactical command center
│           │   ├── active_nav_screen.dart  # Fullscreen driver view
│           │   └── diagnostics_screen.dart # Detailed sensor breakdown
│           └── widgets/               # HUD widgets (map, speedometer, compass, health bar)
│
├── assets/
│   ├── maps/tiles/                    # 114 pre-bundled OSM PNG tiles (Zooms 11-16)
│   ├── models/                        # INT8 TFLite models & model_metadata.json
│   └── config/                        # Navigation runtime configs
│
├── test/
│   └── unit_test.dart                 # Alignment, NHC, tile provider unit tests
└── pubspec.yaml                       # Dependencies & asset registration
```

---

## ⚡ Running the App

### Run on Physical Android Phone (Recommended)
Connect your Android phone with USB Debugging enabled:
```powershell
cd frontend
flutter pub get
flutter run
```

### Run in Google Chrome / Web
```powershell
cd frontend
flutter run -d chrome
```

---

## 🧪 Running Frontend Unit Tests

```powershell
cd frontend
flutter test test/unit_test.dart
```

**Coverage**:
- Phone-to-vehicle pitch/roll gravity auto-calibration
- Non-Holonomic Constraint (NHC) enforcement
- Multi-tier tile provider asset resolution
- Barometer health detection and fusion mode serialization
