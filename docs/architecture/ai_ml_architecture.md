# SIH26168 — AI/ML Architecture & IO-VNBD Dataset Engineering Specification

---

## 1. Executive Summary & Core Philosophy

In the **SIH26168 Dead Reckoning & Navigation System**, Artificial Intelligence (AI) and Machine Learning (ML) **do not directly predict geographic coordinates or positions**. 

Instead, the AI/ML subsystem functions as a **high-precision motion state and noise estimator**. It extracts vehicle dynamics, speed, road vibration characteristics, and measurement confidence from noisy, low-cost smartphone inertial sensors (IMU). These AI outputs are subsequently fed into a deterministic, physics-based **C++ Strapdown Inertial Navigation System (INS)** and **Unscented Kalman Filter (UKF)**.

```
                     ┌────────────────────────┐
                     │    SMARTPHONE IMU      │
                     │  (Acc, Gyro, Mag)      │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │  DATA PREPROCESSING    │
                     │ (Clean, Sync, Window)  │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │   VEHICLE ALIGNMENT    │
                     │ (Coordinate Transform) │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │      AI / ML CORE      │
                     └───────────┬────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              ▼                                     ▼
   ┌──────────────────────┐              ┌──────────────────────┐
   │ 1. SPEED ESTIMATOR   │              │ 2. VIBRATION SCORE / │
   │ (Forward Velocity)   │              │    MOTION QUALITY    │
   └──────────┬───────────┘              └──────────┬───────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │  AI MOTION STATE /     │
                     │  ADAPTIVE COVARIANCE   │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │   C++ CORE INS (SINS)  │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │  UNSCENTED KALMAN      │
                     │  FILTER (UKF FUSION)   │
                     └───────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
       ┌─────────────────┐               ┌─────────────────┐
       │     GNSS OK     │               │    GNSS LOST    │
       ├─────────────────┤               ├─────────────────┤
       │ GNSS Position / │               │ Dead Reckoning  │
       │ Velocity Update │               │ using AI Speed  │
       │ + Bias Estimate │               │ + Kinematic SINS│
       └────────┬────────┘               └────────┬────────┘
                │                                 │
                └────────────────┬────────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │     FINAL POSITION     │
                     │  (Lat, Lon, Heading)   │
                     └────────────────────────┘
```

---

## 2. In-Depth Analysis: IO-VNBD Benchmark Dataset

### 2.1 Overview & Provenance
* **Dataset Name:** IO-VNBD (*Inertial and Odometry Vehicle Navigation Benchmark Dataset*)
* **Primary Authors:** Uche Onyekpe, Vasile Palade, Stratis Kanarachos, Alicja Szkolnik (Coventry University, UK)
* **Official Repository:** [https://github.com/onyekpeu/IO-VNBD](https://github.com/onyekpeu/IO-VNBD)
* **Scope & Scale:**
  - **Vehicle Extracted Data (ECU/OBD-II):** ~40 driving hours, ~1,300 km traversed (~1.4M data rows, 29 columns).
  - **Smartphone Recorded Data (Android IMU + GPS):** ~58 driving hours, ~4,400 km traversed (~2.2M data rows, 24 columns).
  - **Total Dataset:** ~98 hours, ~5,700 km spanning diverse driving environments across the **United Kingdom, Nigeria, and France**.
* **Environmental Variety:** Urban congestion, motorways, country roads, roundabouts, stop-and-go traffic, severe braking, rough road surfaces, and varied smartphone placements.

### 2.2 Sensor Specifications & Sampling Rates
* **Nominal IMU & Odometry Sampling Rate:** **10 Hz** ($\Delta t = 0.1\text{ s}$).
* **Nominal GNSS / GPS Update Rate:** **1 Hz** (interleaved within the 10 Hz stream).
* **Sensor Modalities:**
  - **3-Axis Accelerometer:** $a_x, a_y, a_z$ ($\text{m/s}^2$)
  - **3-Axis Gyroscope:** $\omega_x, \omega_y, \omega_z$ ($\text{rad/s}$ or $\text{deg/s}$)
  - **3-Axis Magnetometer:** $m_x, m_y, m_z$ ($\mu\text{T}$)
  - **Vehicle CAN/ECU Reference:** 4 individual wheel-speed sensors ($v_{FL}, v_{FR}, v_{RL}, v_{RR}$), transmission speed, steering angle, vehicle yaw rate.
  - **GNSS Receiver:** Latitude, Longitude, Altitude, GNSS Speed over Ground, GNSS Bearing/Track Angle, Horizontal Dilution of Precision (HDOP).

### 2.3 Key Dataset Nuances for Model Engineering
1. **True Sampling Frequency ($\Delta t$):** While nominal rate is 10 Hz, smartphone logging often exhibits jitter ($\Delta t \in [0.08\text{s}, 0.12\text{s}]$). A strict timestamp interpolation and resampling step (e.g., cubic spline or linear interpolation to uniform 10.0 Hz) is required.
2. **Coordinate Frames:** Smartphone accelerometer and gyroscope operate in the **Phone Body Frame ($B$)**, whereas vehicle kinematics operate in the **Vehicle Forward-Right-Down ($FRD$) or Forward-Left-Up ($FLU$) Frame ($V$)**. Coordinate alignment or rotation invariant features are critical.
3. **Reference Speed Generation:** Ground-truth longitudinal velocity is derived from vehicle wheel odometry and dual-frequency GNSS velocity.

---

## 3. Comprehensive ML Directory Structure

```text
ml/
├── README.md
├── requirements.txt
│
├── configs/
│   ├── dataset_config.yaml          # IO-VNBD paths, sensor channels, split ratios
│   ├── preprocessing_config.yaml    # Filter cutoffs, resample frequency, window size
│   ├── speed_model_config.yaml      # 1D-CNN / GRU hyperparameters, loss, scheduler
│   ├── vibration_model_config.yaml  # Frequency bands, classification / score thresholds
│   └── experiment_config.yaml       # Benchmarks, outage scenarios, ablation runs
│
├── data/
│   ├── raw/
│   │   └── README.md                # Download & checksum instructions for IO-VNBD
│   ├── processed/
│   │   ├── train/                   # Preprocessed .npy / .parquet shards
│   │   ├── validation/
│   │   └── test/
│   ├── labeled/
│   │   ├── speed/                   # Aligned (IMU_window, ground_truth_speed)
│   │   ├── vibration/               # Road roughness & vibration labels
│   │   └── motion/                  # Kinematic state labels (Stationary, Turning, Cruising)
│   └── splits/
│       ├── train.csv                # File IDs and metadata per partition
│       ├── validation.csv
│       └── test.csv
│
├── preprocessing/
│   ├── clean_sensor_data.py         # Null imputation, spike removal, monotonic time verification
│   ├── synchronize_data.py          # Synchronize 10 Hz IMU with 1 Hz GPS & wheel odometry
│   ├── normalize.py                 # Z-score, MinMax, and robust scaling
│   ├── outlier_detection.py         # Mahalanobis distance & acceleration clipping
│   ├── windowing.py                 # Sliding window generator (Window size N=10..50, stride S)
│   ├── feature_scaling.py           # Per-channel scaler serialization (scaler.json)
│   └── dataset_builder.py           # End-to-end dataset creation pipeline
│
├── features/
│   ├── imu_features.py              # Magnitude, norm, tilt, pitch/roll indicators
│   ├── acceleration_features.py     # Jerk (da/dt), lateral/longitudinal decomposition
│   ├── gyroscope_features.py        # Angular acceleration, turn rate indicators
│   ├── vibration_features.py        # FFT power spectral density, energy in 1-5Hz / 5-15Hz bands
│   ├── motion_features.py           # Zero-velocity (ZUPT) detection features
│   └── temporal_features.py         # Rolling stats: mean, std, peak-to-peak, kurtosis
│
├── models/
│   ├── speed_estimator/
│   │   ├── architecture.py          # 1D-CNN, Conv-GRU, Lightweight Temporal Models
│   │   ├── model.py                 # PyTorch Module definition with uncertainty head
│   │   ├── train.py                 # Training loop with Huber Loss & Cosine Annealing
│   │   ├── evaluate.py              # MAE, RMSE, Median Error, 95th percentile error
│   │   ├── inference.py             # Single-window and batch Python inference
│   │   └── checkpoint/              # Saved model weights (.pt, .onnx)
│   │
│   ├── vibration_classifier/
│   │   ├── architecture.py          # Spectral 1D-CNN / Random Forest / MLP classifier
│   │   ├── model.py                 # Classification & Continuous Score Module [0, 1]
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   ├── inference.py
│   │   └── checkpoint/
│   │
│   └── motion_quality/
│       ├── architecture.py          # Multi-head confidence scoring network
│       ├── model.py                 # Trust factor estimator [0.0 = Degraded, 1.0 = Clean]
│       ├── train.py
│       ├── evaluate.py
│       └── inference.py
│
├── training/
│   ├── train_speed_model.py         # High-level entrypoint for speed model training
│   ├── train_vibration_model.py     # High-level entrypoint for vibration model training
│   ├── train_motion_quality.py      # Entrypoint for confidence model
│   ├── hyperparameters.py           # Optuna search spaces and tuning routines
│   ├── training_config.py           # Typed dataclass configs (Pydantic / Dataclasses)
│   └── experiment_runner.py         # Multi-trial automated training pipeline
│
├── evaluation/
│   ├── metrics.py                   # Core regression and classification metrics
│   ├── speed_metrics.py             # Speed estimation errors across speed buckets (0-30, 30-60, 60+ km/h)
│   ├── vibration_metrics.py         # Confusion matrix, F1-score, score calibration curve
│   ├── trajectory_error.py          # Cumulative DR position error (ATE, RTE)
│   ├── drift_evaluation.py          # Drift rate (meters drifted per km traveled / per minute)
│   ├── outage_evaluation.py         # Synthetic GNSS outage evaluation (5s, 10s, 30s, 60s)
│   ├── replay_evaluation.py         # Deterministic offline replay over real driving tracks
│   └── generate_report.py           # Markdown/HTML summary report generator with plots
│
├── visualization/
│   ├── plot_sensor_data.py          # Raw vs filtered IMU timeseries
│   ├── plot_predictions.py          # Ground truth vs predicted speed
│   ├── plot_speed.py                # Speed regression residual plots & histograms
│   ├── plot_vibration.py            # Power spectral density and vibration heatmaps
│   ├── plot_trajectory.py           # 2D Bird's-eye-view trajectory comparisons
│   └── plot_error.py                # CDF of position errors during outages
│
└── export/
    ├── export_tflite.py             # PyTorch -> ONNX -> TFLite conversion pipeline
    ├── quantize.py                  # Post-Training Quantization (Float32, Float16, INT8 with calibration)
    ├── benchmark_model.py           # Latency, throughput, memory footprint measurement
    └── validate_mobile_model.py     # Parity test (PyTorch output vs TFLite output tolerance <= 1e-3)
```

---

## 4. Phase-Wise Execution Roadmap

| Phase | Milestone | Deliverables | Key Validation Metric |
|---|---|---|---|
| **Phase 1** | **Data Foundation & IO-VNBD Integration** | Cleaned datasets, resampling to 10 Hz, synchronized ground-truth, sliding windows, classical baseline (pure IMU DR). | Sensor timestamp monotonicity, zero missing values, baseline drift quantified. |
| **Phase 2** | **Primary AI Models** | Speed Estimator (1D CNN), Vibration Classifier (Continuous score $0 \to 1$), Motion Quality model. | Speed MAE $< 0.8\text{ m/s}$ ($< 2.88\text{ km/h}$), Vibration classification F1 $> 0.90$. |
| **Phase 3** | **AI + C++ INS / UKF Fusion** | Tight integration of AI Speed into UKF measurement updates and Vibration Score into $Q, R$ covariance adaptation. | Outage drift reduced by $> 65\%$ vs classical DR. |
| **Phase 4** | **Anomaly Detection & GNSS Deficit Handling** | Multi-satellite GNSS deficit detector, multipath/jump classifier, confidence-weighted DR transition. | Zero catastrophic divergence during sudden multipath jumps. |
| **Phase 5** | **Mobile Optimization & On-Device Deployment** | INT8 TFLite models, Flutter AI inference bridge (`dart:ffi`), real-device profiling on Android. | Inference latency $< 15\text{ ms}$, Model size $< 2.5\text{ MB}$, zero frame drops. |

---

## 5. Input Data Formulation & Windowing

### 5.1 Raw Input Features
Given a smartphone sampling at $f_s = 10\text{ Hz}$ ($\Delta t = 0.1\text{ s}$):
* **3-Axis Acceleration:** $\mathbf{a}_t = [a_{x,t}, a_{y,t}, a_{z,t}]^T$
* **3-Axis Angular Velocity:** $\boldsymbol{\omega}_t = [\omega_{x,t}, \omega_{y,t}, \omega_{z,t}]^T$

### 5.2 Engineered Input Features per Sample
To enhance model generalization across device orientations and phone models, the feature vector is augmented:
$$\mathbf{x}_t = \begin{bmatrix}
a_{x,t}, a_{y,t}, a_{z,t}, \|\mathbf{a}_t\|_2, \\
\omega_{x,t}, \omega_{y,t}, \omega_{z,t}, \|\boldsymbol{\omega}_t\|_2, \\
\Delta a_{x,t}, \Delta a_{y,t}, \Delta a_{z,t}, \\
\text{pitch}_t, \text{roll}_t
\end{bmatrix}^T \in \mathbb{R}^{D} \quad (D = 13)$$

### 5.3 Sliding Window Construction
For a temporal window duration $T_w = 2.0\text{ seconds}$ at $10\text{ Hz}$ with stride $S = 1\text{ sample}$ ($0.1\text{ s}$ update rate):
* Window Length: $L = T_w \times f_s = 20\text{ samples}$
* Window Tensor Shape: $\mathbf{X}_k \in \mathbb{R}^{B \times L \times D} = [B, 20, 13]$
* Target Output:
  - Estimated Speed: $\hat{v}_k \in \mathbb{R}_{\ge 0}$
  - Speed Uncertainty / Confidence: $\sigma_{v, k} \in \mathbb{R}_{> 0}$

---

## 6. Speed Estimator Model Architecture

The Speed Estimator uses a lightweight **1D-CNN + Residual Block + Temporal Gated Unit** designed specifically for low-latency mobile inference.

```
Input Tensor: [Batch, 20 samples, 13 features]
       │
       ▼
Conv1D (Filters: 32, Kernel: 3, Stride: 1, Padding: Same) + BatchNorm + LeakyReLU
       │
       ▼
Residual Block 1D:
  ├─ Conv1D (Filters: 64, Kernel: 3, Padding: Same) + BatchNorm + LeakyReLU
  ├─ Conv1D (Filters: 64, Kernel: 3, Padding: Same) + BatchNorm
  └─ (+) Residual Addition + LeakyReLU
       │
       ▼
Max-Pooling 1D (Pool size: 2, Stride: 2) -> Output: [Batch, 10, 64]
       │
       ▼
Bidirectional GRU (Hidden Units: 32 per direction, Layers: 1) -> Output: [Batch, 10, 64]
       │
       ▼
Global Average Pooling 1D -> Output: [Batch, 64]
       │
       ▼
Dense Linear (64 -> 32) + LeakyReLU + Dropout(0.2)
       │
       ├────────────────────────────────┐
       ▼                                ▼
Head 1: Speed Regression         Head 2: Uncertainty (Log-Variance)
Dense (32 -> 1) + Softplus       Dense (32 -> 1)
Output: $\hat{v}$ (m/s)          Output: $s = \log(\sigma^2)$
```

### 6.1 Heteroscedastic Regression Loss
To train both speed prediction and intrinsic uncertainty simultaneously:
$$\mathcal{L}_{\text{speed}}(\theta) = \frac{1}{2} \exp(-s_k) \cdot \mathcal{H}_\delta(v_k - \hat{v}_k) + \frac{1}{2} s_k$$
where $\mathcal{H}_\delta(r)$ is the **Huber Loss** with threshold $\delta = 1.0$:
$$\mathcal{H}_\delta(r) = \begin{cases}
\frac{1}{2} r^2 & \text{for } |r| \le \delta \\
\delta (|r| - \frac{1}{2}\delta) & \text{otherwise}
\end{cases}$$

---

## 7. Vibration Classifier & Motion Quality

### 7.1 Road Vibration & Sensor Noise
Road roughness induces high-frequency accelerations that corrupt pure double-integration in INS.

```text
Smooth Highway  ──► Low Vibration  (Score 0.05 - 0.20) ──► High Confidence in IMU ──► Low UKF Noise Q
Potholes / Dirt ──► High Vibration (Score 0.70 - 0.95) ──► High IMU Noise        ──► Increase UKF Noise Q
```

### 7.2 Vibration Model Output
* Discrete Classes: `LOW_VIBRATION` (0), `NORMAL_VIBRATION` (1), `HIGH_VIBRATION` (2)
* Continuous Vibration Index: $V_{\text{score}} \in [0.0, 1.0]$
* Motion Quality Score: $Q_{\text{motion}} = 1.0 - V_{\text{score}} \in [0.0, 1.0]$

---

## 8. AI + C++ INS / UKF Integration (The Mathematical Bridge)

```
                            ┌─────────────────────┐
                            │    AI ESTIMATES     │
                            │  Speed:  v_ai       │
                            │  Uncert: sigma_ai   │
                            │  Vib:    V_score    │
                            └──────────┬──────────┘
                                       │
                                       ▼
                   ┌──────────────────────────────────────┐
                   │    ADAPTIVE COVARIANCE ENGINE        │
                   │                                      │
                   │ R_speed = (sigma_ai)^2 * (1 + V_vib) │
                   │ Q_ins   = Q_nominal * (1 + 2*V_vib)  │
                   └──────────────────┬───────────────────┘
                                       │
                                       ▼
                   ┌──────────────────────────────────────┐
                   │        C++ UKF MEASUREMENT UPDATE    │
                   │                                      │
                   │ Measurement Residual:                │
                   │   y = v_ai - ||v_ukf||               │
                   │                                      │
                   │ Innovation Covariance:               │
                   │   S = H * P * H^T + R_speed          │
                   │                                      │
                   │ Kalman Gain:                         │
                   │   K = P * H^T * S^(-1)               │
                   │                                      │
                   │ State Update:                        │
                   │   x = x + K * y                      │
                   └──────────────────────────────────────┘
```

### 8.1 Zero Velocity Update (ZUPT) Constraint
When AI Speed $\hat{v} < 0.1\text{ m/s}$ and $\|\mathbf{a}_t - \mathbf{g}\| < \epsilon$, the system injects a pseudo-measurement:
$$\mathbf{v}_{\text{vehicle}} = [0, 0, 0]^T$$
This immediately eliminates velocity drift during red lights and vehicle stops.

---

## 9. Mobile AI Execution Architecture (Flutter & C++ FFI)

```
             FLUTTER DART LAYER
         ┌────────────────────────┐
         │ Sensor Stream (10 Hz)  │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  AI Input Builder      │
         │  - Windowing (N=20)    │
         │  - Normalization       │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │ TFLite Interpreter     │
         │ (speed_estimator.tflite│
         │  INT8 Quantized)       │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │ AIOutput Struct        │
         │ - speed                │
         │ - confidence           │
         │ - vibration_score      │
         └───────────┬────────────┘
                     │
             (dart:ffi Direct Call)
                     │
                     ▼
         ┌────────────────────────┐
         │ C++ CORE LIBRARY       │
         │ sih_dr_engine.dll/.so  │
         ├────────────────────────┤
         │ UKF Filter Engine      │
         │ SINS Strapdown Engine  │
         │ GNSS Outage Manager    │
         └────────────────────────┘
```

---

## 10. Quantitative Evaluation Matrix

For SIH validation, the system will be evaluated across 5 controlled experiment suites:

```text
EXP-001: Pure IMU Dead Reckoning (No AI, No ZUPT)               -> Baseline Drift: High (> 50m/min)
EXP-002: IMU + Classical Heuristics (ZUPT + Static integration)  -> Baseline Drift: Moderate (~ 20m/min)
EXP-003: IMU + AI Speed Estimation (Direct velocity forward)     -> Error: Reduced (< 8m/min)
EXP-004: IMU + AI Speed + Adaptive UKF (Full System GNSS OK)    -> Seamless Tracking (< 1.5m RMSE)
EXP-005: 60-Second Complete GNSS Outage with AI + UKF Fusion    -> Position Drift < 1.0% of Distance Traveled
```

### Key Performance Targets:
* **Speed Estimation MAE:** $< 0.8\text{ m/s}$ ($2.88\text{ km/h}$) across test splits.
* **30-Second GNSS Outage Position Error:** $< 15\text{ meters}$ (compared to $> 150\text{ m}$ in pure double integration).
* **On-Device Inference Latency:** $< 12\text{ ms}$ on standard Android ARM64 CPU.
* **TFLite Model Size:** $< 2.0\text{ MB}$ (INT8 quantized).
