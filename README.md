# SIH26168 — AI-ML Based Intelligent Dead Reckoning & Navigation System

> **High-Precision Vehicle Dead Reckoning in GNSS-Denied Environments using 15-State UKF, Edge Neural Odometry, Multi-Constellation NavIC Fusion, and Offline Vector Mapping.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![Flutter 3.x](https://img.shields.io/badge/Flutter-3.x-02569B.svg)](https://flutter.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![C++17](https://img.shields.io/badge/C%2B%2B-17-00599C.svg)](https://isocpp.org/)
[![ONNX Opset 14](https://img.shields.io/badge/ONNX-Opset%2014-005CED.svg)](https://onnx.ai/)
[![TFLite INT8](https://img.shields.io/badge/TFLite-INT8%20PTQ-FF6F00.svg)](https://www.tensorflow.org/lite)

---

## 📌 Problem Statement Overview

During GNSS blackouts (tunnels, subterranean parking, dense urban canyons, flyovers, or electronic jamming), standard GPS navigation fails catastrophically — accumulating hundreds of meters of drift within seconds when relying on naive double integration.

**SIH26168** solves this challenge through an edge-to-cloud multi-sensor fusion architecture:
- **Neural Speed & Vibration Estimation**: Predicts forward vehicle velocity $\hat{v}$ and heteroscedastic uncertainty $\sigma_v^2$ directly from 13-channel 50 Hz IMU kinematic features.
- **15-State Unscented Kalman Filter (UKF)**: Fuses Strapdown Inertial Navigation (SINS), AI odometry, Zero-Velocity Updates (ZUPT), and Non-Holonomic Constraints (NHC) via dynamic covariance scaling.
- **NavIC / Multi-GNSS Blending**: SNR-weighted constellation fusion prioritizing India's NavIC (L5/S band) and GPS.
- **4-Tier Offline Tile Engine**: High-resolution OpenStreetMap rendering without active network connectivity.
- **Sub-10ms Hardware Latency**: 4.39 ms edge neural inference with 227.9 Hz CPU throughput.

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Physical Vehicle"
        SENSORS["📱 Smartphone Sensors<br/>Accel · Gyro · Mag · Baro · Multi-GNSS"]
    end

    subgraph "Flutter Mobile Frontend (frontend/)"
        DRIVER["MobileSensorDriver<br/>50 Hz gameInterval"]
        ALIGN["VehicleAlignmentEngine<br/>Gravity Estimation + NHC"]
        TFLITE["Edge AI Inference<br/>TFLite INT8 · 4.39ms"]
        TILES["Offline Tile Provider<br/>4-Tier Cache"]
        HUD["Tactical HUD<br/>Dashboard + Active Nav"]
        TELCLIENT["Backend Telemetry Client<br/>HTTP REST · 1 Hz"]
    end

    subgraph "C++ Navigation Engine (cpp-core/)"
        SINS["Strapdown INS<br/>Mechanization"]
        UKF["15-State UKF<br/>Adaptive Covariance"]
        MATCHER["HMM Map Matcher<br/>Viterbi Path Search"]
    end

    subgraph "TypeScript Real-Time Engine (backend/)"
        WS["WebSocket Server<br/>ws://localhost:8080/ws"]
        EKF["4-State CTRV EKF<br/>Kalman Filter"]
        DR["Dead Reckoning<br/>IMU Integration"]
        SATFUSE["Satellite Fusion<br/>NavIC/GPS Weighting"]
        ANOMALY["Road Anomaly Detector<br/>Vertical Accel Classifier"]
    end

    subgraph "Python FastAPI Hub (backend/app/)"
        API["REST API Hub<br/>FastAPI Async"]
        DB["PostGIS / SQLite DB<br/>1.42M Road Segments"]
        REDIS["Redis Pub/Sub<br/>Live Telemetry Stream"]
        MODELHUB["Model Hub<br/>OTA TFLite Deployment"]
        S3["MinIO S3 Storage<br/>Model Weights"]
    end

    subgraph "ML Pipeline (ml/)"
        TRAIN["PyTorch Training<br/>IO-VNBD Dataset"]
        ONNX["ONNX Export<br/>Opset 14"]
        QUANT["INT8 PTQ<br/>TFLite Quantization"]
    end

    SENSORS --> DRIVER
    DRIVER --> ALIGN
    ALIGN --> HUD
    ALIGN --> TFLITE
    TFLITE --> UKF
    DRIVER -->|"dart:ffi"| SINS
    SINS --> UKF
    UKF --> MATCHER
    UKF --> HUD
    TILES --> HUD
    HUD --> TELCLIENT
    TELCLIENT --> API
    TELCLIENT --> WS
    WS --> EKF
    WS --> DR
    WS --> SATFUSE
    WS --> ANOMALY
    API --> DB
    API --> REDIS
    API --> MODELHUB
    MODELHUB --> S3
    TRAIN --> ONNX
    ONNX --> QUANT
    QUANT -->|"Deploy"| TFLITE
    QUANT -->|"OTA Upload"| MODELHUB
```

---

## 📂 Repository Structure

```
SIH_DEAD_RECKONING/
│
├── frontend/                  # Flutter mobile & web application (Tactical HUD)
│   ├── lib/                   # Clean-architecture Dart source (core, features, UI)
│   ├── assets/                # Pre-bundled OSM map tiles, INT8 TFLite models, configs
│   ├── test/                  # Unit test suite (alignment, NHC, tile provider)
│   └── pubspec.yaml           # Flutter SDK & package dependencies
│
├── backend/                   # Dual backend infrastructure
│   ├── app/                   # Python FastAPI service (REST, PostGIS, Auth, Model Hub)
│   ├── src/                   # TypeScript EKF sensor-fusion engine & WebSocket server
│   ├── tests/                 # Comprehensive PyTest test suite (58 tests)
│   ├── public/                # Standalone web test client (device-client.html)
│   └── package.json           # Node.js TypeScript configuration & Jest tests (11 tests)
│
├── ml/                        # PyTorch machine learning pipeline
│   ├── configs/               # Model and training YAML configurations
│   ├── data/                  # IO-VNBD datasets, processed splits, and scalers
│   ├── evaluation/            # JSON metric summaries (8 files) and plots (13 charts)
│   ├── models/                # Trained checkpoints (.pth), ONNX (opset 14), INT8 TFLite
│   └── notebooks/             # Master 28-cell execution pipeline (.ipynb)
│
├── cpp-core/                  # C++17 sensor fusion engine
│   ├── include/               # SINS, 15-state UKF, SPSC ring buffer, HMM matcher, C ABI
│   ├── src/                   # Implementation files & math utilities
│   └── CMakeLists.txt         # CMake build configuration
│
├── maps/                      # OpenStreetMap GIS & map matching pipeline
│   ├── demo-region/           # Delhi NCR pre-seeded road network
│   ├── processed_graphs/      # Graph representations (nodes, edges, R-tree index)
│   └── tools/                 # OSM PBF parser, graph builder, GeoJSON converter
│
├── simulation/                # Outage injection & scenario replay engine
│   ├── core/                  # Mock device, outage injector, sensor corruptor
│   ├── scenarios/             # 60s tunnel blackout, urban canyon, flyover level split
│   └── replay/                # Real-time replay runner and trajectory scorer
│
├── config/                    # Global environment configurations
├── datasets/                  # Benchmark reference trajectories & field logs (Git LFS)
├── docs/                      # Architectural specifications & execution plans
├── scripts/                   # Automated build, test, and training shell scripts
├── docker-compose.yml         # Containerized production deployment (FastAPI, PostGIS, Redis, MinIO)
└── sih_dead_reckoning.db      # Populated 2.07 GB database (1.42M road network nodes)
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python**: 3.11+ (with virtual environment)
- **Node.js**: 18+ & npm
- **Flutter**: 3.x SDK
- **CMake & C++17 Compiler** (for `cpp-core`)

### 2. Environment Setup
```bash
# Clone repository
git clone https://github.com/saksham4455/SIH_DEAD_RECKONING.git
cd SIH_DEAD_RECKONING

# Setup Python virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows PowerShell
pip install -r backend/requirements.txt

# Setup Node.js backend
cd backend
npm install
npm run build
cd ..

# Setup Flutter frontend
cd frontend
flutter pub get
cd ..
```

### 3. Running All Services

#### A. Python FastAPI Backend (Port 8000)
```powershell
cd backend
& "..\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **REST API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

#### B. TypeScript WebSocket / EKF Engine (Port 8080)
```powershell
cd backend
npm run dev
# Or for production:
node dist/server.js
```
- **REST Endpoints**: `http://localhost:8080/api`
- **WebSocket Ingest**: `ws://localhost:8080/ws`
- **Browser Diagnostic Client**: `http://localhost:8080/device-client.html`

#### C. Flutter Mobile Application
```powershell
cd frontend
# Run on connected physical phone (e.g. Android via USB):
flutter run

# Or run in Google Chrome / Web:
flutter run -d chrome
```

---

## 🧪 Automated Test Verification

All subsystems include full automated test coverage:

```bash
# 1. Python FastAPI Backend (58 tests)
pytest backend/tests/

# 2. TypeScript EKF & Navigation Engine (11 tests across 3 suites)
cd backend && npm test && cd ..

# 3. Flutter Frontend Unit Tests (8 tests)
cd frontend && flutter test test/unit_test.dart && cd ..
```

**Results**: **77 tests passed, 0 failures** across all test suites.

---

## 📊 ML Model Performance & Benchmarks

| Metric | Target Specification | SIH26168 Result | Status |
|---|---|---|---|
| **Speed Estimator MAE** | $< 0.80\text{ m/s}$ ($< 2.88\text{ km/h}$) | **0.280 m/s (1.01 km/h)** | ✅ **Exceeded (2.9× better)** |
| **Speed Estimator $R^2$** | $> 0.95$ | **0.9959** | ✅ **Exceeded** |
| **Vibration Classifier F1** | $> 0.90$ | **1.0000** | ✅ **Perfect** |
| **Motion Quality MAE** | $< 0.08$ | **0.0389** | ✅ **Exceeded** |
| **60s Outage Cumulative Error** | $< 10.0\text{ meters}$ | **6.46 meters (<1.1% drift)** | ✅ **Exceeded** |
| **CPU Inference Latency** | $< 12.0\text{ ms}$ | **4.39 ms (227.9 Hz)** | ✅ **2.7× headroom** |
| **Model Binary Size** | $< 1.0\text{ MB}$ | **49.2 KB (INT8 PTQ)** | ✅ **Ultra-compact** |

---

## 👥 Subsystem Documentation Links

- 🧠 **[ML Subsystem Documentation](ml/README.md)** — Model architectures, loss functions, training pipeline, and export.
- 🐍 **[Backend Infrastructure Documentation](backend/README.md)** — FastAPI REST hub, PostGIS schema, Redis pub/sub, and TypeScript EKF engine.
- 📱 **[Flutter Frontend Documentation](frontend/README.md)** — Tactical HUD, physical sensor integration, auto-calibration, and offline tile caching.
- ⚙️ **[C++ Core Documentation](cpp-core/README.md)** — SINS mechanization, 15-state UKF, SPSC ring buffer, and `dart:ffi` C ABI.
- 🗺️ **[Maps & GIS Documentation](maps/README.md)** — OSM PBF ingestion, topological graph builder, and spatial R-tree indexing.
- 🎮 **[Simulation Engine Documentation](simulation/README.md)** — Outage injection, sensor corruption, and trajectory scoring.

---

## 📄 License

This project is licensed under the **MIT License**.
