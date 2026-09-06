# SIH26168: AI-ML Based Intelligent Dead Reckoning System

Cross-platform vehicle-navigation research software combining Flutter, a C++ navigation core, AI/ML pipelines, map processing, backend telemetry, and GNSS-outage simulation.

The repository currently contains the project architecture, working scaffolds, a Flutter demo UI, baseline native interfaces, and development tooling. Field datasets, trained models, generated map binaries, and production native packaging are not included yet.

## Repository Structure

```text
SIH_DEAD_RECKONING/
├── frontend/                 # Flutter Android, iOS, and Web application
├── backend/                  # FastAPI telemetry and judge-dashboard API
├── cpp-core/                 # C++17 navigation engine and C FFI API
├── ml/                       # Dataset, training, evaluation, and export pipeline
├── simulation/               # GNSS outage, replay, and trajectory evaluation
├── maps/                     # OSM processing tools and graph artifacts
├── datasets/                 # Field-test logs and benchmark data locations
├── config/                   # Repository configuration
├── docs/                     # Integration documentation
├── scripts/                  # Build and workflow scripts
├── docker-compose.yml        # Backend, PostGIS, and Redis services
├── Makefile                  # Common development commands
├── .gitignore                # Generated-file exclusions
└── .gitattributes            # Git LFS rules for large artifacts
```

## Current Status

| Area | Current state |
| --- | --- |
| Flutter frontend | Runs as a demo telemetry/navigation UI; mobile IMU adapter uses `sensors_plus`. |
| C++ core | C++17 shared-library scaffold with module headers, baseline implementations, and exported FFI API. |
| Backend | FastAPI routes, WebSocket manager, schemas, SQLAlchemy models, and local in-memory telemetry runtime. |
| ML | Architecture-level Python modules and model/export boundaries; training and conversion are pending. |
| Simulation | Scenario files and outage/replay/evaluation boundaries; field-log integration is pending. |
| Maps | Demo road data and processing boundaries; raw PBF and binary spatial index are pending. |

## Architecture

```text
Flutter sensors and GNSS
        |
        v
frontend/lib/features/data_acquisition
        |
        +--> frontend/lib/features/ai_motion
        |
        v
frontend/lib/core/platform/ffi <--> cpp-core/include/ffi
                                      |
                                      v
                         INS, UKF, outage handling,
                         kinematics, and map matching
                                      |
                                      v
frontend/lib/features/navigation_engine
        |
        +--> frontend/lib/features/navigation_ui
        |
        +--> backend/app/api/v1/telemetry
        |
        +--> backend/app/api/websockets/live_dashboard
```

## Frontend

The Flutter project is limited to the requested Android, iOS, and Web targets:

```text
frontend/
├── android/                         # Gradle and Android permissions
├── ios/                             # Info.plist and iOS configuration
├── web/                             # Flutter Web target
├── assets/
│   ├── config/                      # Navigation configuration
│   ├── maps/                        # Demo map assets
│   ├── icons/                       # Navigation icon assets
│   └── models/                      # TFLite model location
├── pubspec.yaml
└── lib/
    ├── main.dart
    ├── app_widget.dart
    ├── core/
    │   ├── constants/
    │   ├── router/
    │   ├── theme/
    │   ├── errors/
    │   ├── utils/
    │   ├── di/
    │   ├── storage/
    │   └── platform/
    │       ├── ffi/
    │       └── hardware/
    └── features/
        ├── data_acquisition/
        ├── ai_motion/
        ├── navigation_engine/
        └── navigation_ui/
```

The UI currently reads from `DemoNavigationRepository`. The FFI and TFLite layers expose integration boundaries, but native library loading and real model inference are not fully connected. The model and vehicle-marker directories currently contain placeholders rather than trained binaries.

## C++ Core

```text
cpp-core/
├── CMakeLists.txt                 # C++17, shared library, Eigen3, Threads, PIC
├── include/
│   ├── common/                    # Types, math, timestamps
│   ├── sensor/                    # IMU/GNSS packets and ring buffer
│   ├── alignment/                 # Device-to-vehicle alignment
│   ├── ins/                       # Strapdown INS and earth model
│   ├── fusion/                    # UKF interfaces
│   ├── deficit/                   # GNSS outage state machine and DR
│   ├── map_matching/              # Road graph and HMM matcher
│   └── ffi/                       # IDR C ABI
└── src/                           # Matching C++ implementation files
```

The exported API is `IDR_Init`, `IDR_PushIMU`, `IDR_PushGNSS`, `IDR_PushMLSpeed`, and `IDR_GetState`. Lowercase compatibility wrappers are also declared. The current implementations are safe baseline interfaces, not a production-grade INS/UKF/HMM implementation.

## Backend

The FastAPI service is in `backend/`:

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/v1/                  # telemetry, session, maps, models_hub
│   ├── api/websockets/          # live dashboard and connection manager
│   ├── core/                    # database, Redis, security, exceptions
│   ├── models/                  # SQLAlchemy model definitions
│   ├── schemas/                 # Pydantic request/response schemas
│   └── services/                # drift, map query, replay services
├── Dockerfile
└── requirements.txt
```

Available route groups include `/health`, `/api/v1/telemetry`, `/api/v1/session`, `/api/v1/maps`, `/api/v1/models`, and `/ws/judge-dashboard`. Local development uses an in-memory telemetry store and initializes a SQLite database by default. Docker Compose supplies PostgreSQL/PostGIS and Redis configuration, but Redis is currently an integration boundary rather than the active telemetry transport.

## Machine Learning

```text
ml/
├── data/                           # raw, processed, and train/val/test locations
├── notebooks/                      # Notebook location
├── src/
│   ├── dataset/                    # IMU windows and augmentations
│   ├── features/                   # Temporal and frequency features
│   ├── models/                     # Speed and vibration model boundaries
│   ├── training/                   # Training loops, losses, callbacks
│   ├── evaluation/                 # Metrics and trajectory comparison
│   └── export/                     # ONNX, TFLite, and INT8 export boundaries
└── configs/                        # Speed and vibration YAML settings
```

The correct export path is `ml/src/export/export_tflite.py`. The training and conversion functions currently raise `NotImplementedError` until datasets and ML dependencies are added.

## Simulation

```text
simulation/
├── scenarios/
│   ├── tunnel_60s_outage.json
│   ├── urban_canyon_multipath.json
│   └── flyover_level_split.json
├── core/                           # Mock device and corruption boundaries
├── replay/                         # Replay runner and log export
└── evaluate/                       # Trajectory scoring and report boundary
```

The simulation layer is prepared for drive logs but does not yet provide a complete physical-sensor replay or PDF reporting implementation.

## Maps

```text
maps/
├── raw_osm/                        # Location for .osm.pbf inputs
├── processed_graphs/
│   ├── road_nodes.json
│   └── road_edges.json
├── demo-region/roads.json          # Existing demo road network
└── tools/
    ├── osm_parser.py
    ├── graph_builder.py
    └── geojson_converter.py
```

The OSM parser and binary graph serializer are architecture-level boundaries. No raw PBF or `spatial_index.bin` is currently committed.

## Datasets

```text
datasets/
├── raw_field_tests/                # Git LFS location for drive-session CSV files
└── benchmarks/                     # SIH evaluation benchmark location
```

Both directories currently contain placeholders only. Large `.csv`, `.pbf`, `.bin`, and `.tflite` files are configured for Git LFS in `.gitattributes`.

## Configuration

- `config/development.json`: repository-level development configuration.
- `frontend/assets/config/navigation_config.json`: frontend navigation configuration.
- `frontend/assets/config/tuning_parameters.json`: navigation tuning parameters.
- Backend environment variables use the `SIH_` prefix, including `SIH_DATABASE_URL` and `SIH_REDIS_URL`.

## Setup and Commands

### Flutter

```bash
cd frontend
flutter pub get
flutter analyze
flutter run
```

### Backend

```bash
python -m venv .venv
# Activate the environment using your platform's command.
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

The API documentation is available at `http://127.0.0.1:8000/docs`.

### C++

```bash
cmake -S cpp-core -B build/cpp-core
cmake --build build/cpp-core --config Release
```

This requires CMake, a C++17 compiler, Eigen3, and Threads. Platform scripts are available in `scripts/`, but require the Android NDK, Xcode, or Emscripten as appropriate.

### Docker services

```bash
docker compose up --build
```

This starts the backend, PostGIS database, and Redis services from `docker-compose.yml`.

### Workflow scripts

```text
scripts/setup_all.sh              # Environment and dependency setup
scripts/build_cpp_android.sh      # Android native builds
scripts/build_cpp_ios.sh          # iOS build scaffold
scripts/build_cpp_wasm.sh         # WebAssembly build scaffold
scripts/train_and_export_all.sh   # ML workflow scaffold
scripts/run_simulation.sh         # Backend/replay workflow scaffold
scripts/generate_maps.sh           # OSM graph workflow scaffold
```

These shell scripts target Unix-like shells. Bash is not included with the repository and must be installed separately on Windows, or the underlying commands can be run directly in PowerShell.

## Validation

Available checks in the current repository:

```bash
cd frontend && flutter analyze
python -m compileall ml/src maps/tools simulation
git diff --check
```

Dedicated automated tests for the frontend, backend, C++ core, ML pipeline, maps, and simulation are not currently committed.

## Contributing

Keep changes within the owning component, add tests when implementing behavior, and update this README whenever a directory or build command changes. Do not commit generated build outputs, local databases, model binaries, or datasets outside their configured Git LFS paths.

## License

No license file is currently included. Add a project license before distributing the software.
