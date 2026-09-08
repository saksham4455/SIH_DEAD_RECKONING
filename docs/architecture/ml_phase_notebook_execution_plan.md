# SIH26168 — Master AI/ML Training Architecture & Single-Notebook Implementation Blueprint

This specification provides the **complete, cell-by-cell design for the unified Master Training Pipeline** (`ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb`). 

Every cell in this single master notebook is designed to execute sequentially, saving all intermediate datasets, normalization scalers, neural network checkpoints, evaluation JSONs, comparative plots, and INT8 TFLite mobile models into their dedicated project directories.

---

## 1. Master Directory & Artifact Storage Architecture

```text
c:\dev\SIH_DEAD_RECKNING\
│
├── ml/
│   ├── notebooks/
│   │   └── sih_ai_dead_reckoning_master_pipeline.ipynb  # UNIFIED MASTER PIPELINE NOTEBOOK
│   │
│   ├── data/
│   │   ├── raw/IO-VNBD/                                 # Raw IO-VNBD dataset from GitHub
│   │   │   ├── vehicle_extracted/                       # CAN / ECU / OBD-II CSVs (29 cols)
│   │   │   └── smartphone_recorded/                     # Android IMU + GPS CSVs (24 cols)
│   │   ├── processed/
│   │   │   ├── cleaned/iovnbd_cleaned_10hz.parquet      # Uniform 10 Hz cleaned dataset
│   │   │   ├── windows/                                 # Sliding window shards (.npy/.npz)
│   │   │   │   ├── train_windows.npz                    # X_train [N, 20, 13], y_train [N]
│   │   │   │   ├── val_windows.npz                      # X_val [N, 20, 13], y_val [N]
│   │   │   │   └── test_windows.npz                     # X_test [N, 20, 13], y_test [N]
│   │   │   └── splits/dataset_splits.json               # Trajectory ID split metadata
│   │   └── scalers/
│   │       ├── imu_feature_scaler.json                  # Mean & Scale vectors for Mobile / C++
│   │       └── scaler.pkl                               # Scikit-Learn scaler object
│   │
│   ├── models/
│   │   ├── speed_estimator/
│   │   │   ├── checkpoints/speed_model_best.pth         # Best PyTorch state dict
│   │   │   ├── checkpoints/speed_model_last.pth
│   │   │   └── exported/speed_estimator_int8.tflite     # Quantized mobile model
│   │   ├── vibration_classifier/
│   │   │   ├── checkpoints/vibration_model_best.pth
│   │   │   └── exported/vibration_classifier_int8.tflite
│   │   └── motion_quality/
│   │       ├── checkpoints/motion_quality_best.pth
│   │       └── exported/motion_quality_int8.tflite
│   │
│   └── evaluation/
│       ├── metrics/                                     # Machine-readable performance JSONs
│       │   ├── 01_dataset_summary.json
│       │   ├── 03_classical_baseline_metrics.json
│       │   ├── 05_speed_estimator_evaluation.json
│       │   ├── 06_vibration_classifier_metrics.json
│       │   ├── 07_motion_quality_calibration.json
│       │   ├── 08_gnss_outage_benchmark_results.json
│       │   └── 10_model_benchmarks_and_parity.json
│       └── plots/                                       # High-resolution benchmark figures
│           ├── 01_sampling_jitter_before_after.png
│           ├── 02_speed_distribution_splits.png
│           ├── 03_classical_dr_trajectory_drift.png
│           ├── 04_feature_correlation_heatmap.png
│           ├── 05_speed_training_curves.png
│           ├── 05_speed_predicted_vs_ground_truth.png
│           ├── 05_speed_uncertainty_calibration.png
│           ├── 06_vibration_confusion_matrix.png
│           ├── 08_outage_30s_trajectory_comparison.png
│           ├── 08_outage_60s_trajectory_comparison.png
│           ├── 08_cumulative_drift_error_cdf.png
│           └── 10_latency_benchmark_distribution.png
│
└── mobile/assets/models/                                # Production destination for Flutter App
    ├── speed_estimator_int8.tflite
    ├── vibration_classifier_int8.tflite
    └── model_metadata.json
```

---

## 2. Cell-by-Cell Master Notebook Blueprint

```text
========================================================================================
                               MASTER NOTEBOOK FLOWCHART
========================================================================================
 [CELL 01-02]  PHASE 0: Environment Setup, Seed, Configs & Directory Initialization
      │
      ▼
 [CELL 03-05]  PHASE 1.1: IO-VNBD Ingestion, Jitter Correction & 10 Hz Resampling
      │
      ▼
 [CELL 06-07]  PHASE 1.2: Ground Truth Alignment, Sliding Windows & Trajectory Splits
      │
      ▼
 [CELL 08]     PHASE 1.3: Classical Dead Reckoning Baseline Evaluation
      │
      ▼
 [CELL 09-10]  PHASE 2.1: 13-Channel Kinematic/Spectral Features & Scaler Serialization
      │
      ▼
 [CELL 11-14]  PHASE 2.2: Speed Estimator (1D-CNN + ResBlock + Bi-GRU) Training & Eval
      │
      ▼
 [CELL 15-17]  PHASE 2.3: Vibration Classifier & Continuous Score Training
      │
      ▼
 [CELL 18-19]  PHASE 2.4: Motion Quality & Confidence Engine Training
      │
      ▼
 [CELL 20-22]  PHASE 3:   AI + 15-State UKF Fusion & 5s/10s/30s/60s GNSS Outage Suite
      │
      ▼
 [CELL 23-24]  PHASE 4:   GNSS Anomaly / Multipath Detector & Safe Fallback Switching
      │
      ▼
 [CELL 25-28]  PHASE 5:   ONNX Export, INT8 PTQ Quantization, Mobile Parity & Deploy
========================================================================================
```

---

### Phase 0: Environment Setup, Configuration & Directories

#### `[CELL 01]` — Library Imports & Reproducibility Setup
* **Purpose:** Import all necessary core modules, configure GPU/CPU devices, set deterministic seeds across NumPy, PyTorch, and Python random modules.
* **Code Elements:**
  ```python
  import os, sys, json, time, math, random, glob, pathlib
  import numpy as np
  import pandas as pd
  import scipy.signal as signal
  import matplotlib.pyplot as plt
  import seaborn as sns
  import torch
  import torch.nn as nn
  import torch.nn.functional as F
  from torch.utils.data import Dataset, DataLoader
  from sklearn.preprocessing import StandardScaler, RobustScaler
  from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, f1_score, confusion_matrix

  # Set Seed
  SEED = 42
  random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)
  if torch.cuda.is_available():
      torch.cuda.manual_seed_all(SEED)
  DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
  print(f"[INIT] Device: {DEVICE} | PyTorch Version: {torch.__version__}")
  ```

#### `[CELL 02]` — Global Project Paths & Directory Creation
* **Purpose:** Create all required project subdirectories automatically so subsequent cells never throw missing folder errors.
* **Code Elements:**
  ```python
  BASE_DIR = pathlib.Path("c:/dev/SIH_DEAD_RECKNING")
  ML_DIR = BASE_DIR / "ml"
  DIRS = [
      ML_DIR / "data/raw/IO-VNBD/vehicle_extracted",
      ML_DIR / "data/raw/IO-VNBD/smartphone_recorded",
      ML_DIR / "data/processed/cleaned",
      ML_DIR / "data/processed/windows",
      ML_DIR / "data/processed/splits",
      ML_DIR / "data/scalers",
      ML_DIR / "models/speed_estimator/checkpoints",
      ML_DIR / "models/speed_estimator/exported",
      ML_DIR / "models/vibration_classifier/checkpoints",
      ML_DIR / "models/vibration_classifier/exported",
      ML_DIR / "models/motion_quality/checkpoints",
      ML_DIR / "models/motion_quality/exported",
      ML_DIR / "evaluation/metrics",
      ML_DIR / "evaluation/plots",
      BASE_DIR / "mobile/assets/models"
  ]
  for d in DIRS:
      d.mkdir(parents=True, exist_ok=True)
  print("[INIT] All directory paths successfully verified & initialized.")
  ```

---

### Phase 1: Data Foundation & IO-VNBD Processing

#### `[CELL 03]` — Raw Dataset Discovery & Schema Ingestion
* **Purpose:** Load raw vehicle ECU CSVs (29 columns) and smartphone Android CSVs (24 columns) from the `ml/data/raw/IO-VNBD/` path.
* **Key Tasks:** Inspect sampling timestamps, identify trajectories (drives across UK, Nigeria, France), and print column mappings.

#### `[CELL 04]` — Timestamp Monotonicity, Jitter Correction & 10 Hz Uniform Resampling
* **Purpose:** Eliminate smartphone sensor sampling jitter ($\Delta t \in [0.07\text{s}, 0.14\text{s}]$) and establish a uniform time base $\Delta t = 0.100\text{ s}$ ($10.0\text{ Hz}$).
* **Algorithm:**
  - Detect gaps $> 0.5\text{ s}$ to create discrete trajectory IDs.
  - Apply cubic spline interpolation on continuous inertial channels ($a_x, a_y, a_z, \omega_x, \omega_y, \omega_z$).
  - Apply linear interpolation on low-rate GPS and wheel odometry timestamps.
* **Output:** Plot `01_sampling_jitter_before_after.png`.

#### `[CELL 05]` — Physical Outlier Removal & Cleaned Parquet Storage
* **Purpose:** Apply median filtering ($k=3$) and $5\sigma$ clipping ($|a| \le 25\text{ m/s}^2$, $|\omega| \le 10\text{ rad/s}$) to remove sensor dropouts and spurious spikes.
* **Output File:** `ml/data/processed/cleaned/iovnbd_cleaned_10hz.parquet` and metric `01_dataset_summary.json`.

#### `[CELL 06]` — Ground-Truth Speed Synthesis & Dynamic Windowing
* **Purpose:** Synthesize reference speed $v_{\text{ref}}$ from average non-driven wheel speeds + GPS Doppler velocity, then construct sliding temporal windows.
* **Window Parameters:**
  - Window Duration: $T_w = 2.0\text{ seconds}$
  - Sequence Length: $L = 20\text{ samples}$ (at 10 Hz)
  - Training Stride: $S = 1\text{ sample}$ (0.1 s step, 95% overlap)
  - Validation Stride: $S = 5\text{ samples}$ (0.5 s step)
* **Raw Tensor Shape:** $\mathbf{X}_{\text{raw}} \in \mathbb{R}^{N \times 20 \times 6}$ (`ax, ay, az, gx, gy, gz`).

#### `[CELL 07]` — Leak-Free Trajectory Splitting
* **Purpose:** Partition the dataset into Train (70%), Validation (15%), and Test (15%) splits strictly by **Drive Trajectory ID** (preventing temporal window leakage).
* **Output Artifacts:** `ml/data/splits/dataset_splits.json` and `02_speed_distribution_splits.png`.

#### `[CELL 08]` — Classical Dead Reckoning Baseline Benchmark
* **Purpose:** Run pure strapdown double-integration and heuristic ZUPT on test trajectories to quantify the baseline drift rate without AI.
* **Formulas:**
  $$v_{k+1} = v_k + a_{x,k}\Delta t, \quad p_{k+1} = p_k + v_k\Delta t + \frac{1}{2}a_{x,k}\Delta t^2$$
* **Output:** Save `03_classical_baseline_metrics.json` (Drift rate in $\text{m/min}$ and $\%$ distance) and `03_classical_dr_trajectory_drift.png`.

---

### Phase 2: Feature Engineering & Model Training

#### `[CELL 09]` — 13-Channel Feature Augmentation
* **Purpose:** Construct rotation-resilient kinematic and spectral features per window sample:
  1. Raw IMU: $a_x, a_y, a_z, \omega_x, \omega_y, \omega_z$ (6 channels)
  2. Euclidean Norms: $\|\mathbf{a}\|_2 = \sqrt{a_x^2+a_y^2+a_z^2}$, $\|\boldsymbol{\omega}\|_2 = \sqrt{\omega_x^2+\omega_y^2+\omega_z^2}$ (2 channels)
  3. First Differences (Jerk Proxy): $\Delta a_x, \Delta a_y, \Delta a_z$ (3 channels)
  4. Tilt Angles: $\text{Pitch} = \arctan2(a_x, \sqrt{a_y^2+a_z^2})$, $\text{Roll} = \arctan2(a_y, a_z)$ (2 channels)
* **Final Tensor Shape:** $\mathbf{X} \in \mathbb{R}^{N \times 20 \times 13}$.

#### `[CELL 10]` — Scaler Fitting & Serialization
* **Purpose:** Fit `StandardScaler` on `X_train` only. Transform Train, Validation, and Test sets. Serialize mean and scale vectors to JSON for mobile Flutter & C++ engine.
* **Output Files:**
  - `ml/data/scalers/imu_feature_scaler.json`
  - `ml/data/scalers/scaler.pkl`
  - `ml/data/processed/windows/train_windows.npz`, `val_windows.npz`, `test_windows.npz`
  - Plot `04_feature_correlation_heatmap.png`.

#### `[CELL 11]` — Speed Estimator Neural Network Architecture
* **Purpose:** Define the PyTorch Module: **1D-CNN + ResBlock + Bi-GRU + Dual Head (Speed & Uncertainty)**.
* **Architecture Details:**
  ```python
  class SpeedEstimatorNet(nn.Module):
      def __init__(self, in_features=13, seq_len=20):
          super().__init__()
          self.conv1 = nn.Sequential(
              nn.Conv1d(in_features, 32, kernel_size=3, padding=1),
              nn.BatchNorm1d(32),
              nn.LeakyReLU(0.1)
          )
          # ResBlock1D
          self.res_conv1 = nn.Conv1d(32, 64, kernel_size=3, padding=1)
          self.res_bn1   = nn.BatchNorm1d(64)
          self.res_conv2 = nn.Conv1d(64, 64, kernel_size=3, padding=1)
          self.res_bn2   = nn.BatchNorm1d(64)
          self.res_skip  = nn.Conv1d(32, 64, kernel_size=1)
          self.pool      = nn.MaxPool1d(2) # [B, 64, 10]
          
          # Temporal Unit
          self.gru = nn.GRU(64, 32, batch_first=True, bidirectional=True) # [B, 10, 64]
          self.fc_shared = nn.Sequential(
              nn.Linear(64, 32),
              nn.LeakyReLU(0.1),
              nn.Dropout(0.2)
          )
          # Heads
          self.speed_head = nn.Sequential(nn.Linear(32, 1), nn.Softplus()) # v >= 0
          self.uncert_head = nn.Linear(32, 1) # log(sigma^2)
          
      def forward(self, x):
          # x: [B, 20, 13] -> Conv1D expects [B, 13, 20]
          x = x.transpose(1, 2)
          out = self.conv1(x)
          residual = self.res_skip(out)
          out = F.leaky_relu(self.res_bn1(self.res_conv1(out)), 0.1)
          out = self.res_bn2(self.res_conv2(out))
          out = F.leaky_relu(out + residual, 0.1)
          out = self.pool(out).transpose(1, 2) # [B, 10, 64]
          gru_out, _ = self.gru(out)
          pooled = torch.mean(gru_out, dim=1) # [B, 64]
          shared = self.fc_shared(pooled)
          speed = self.speed_head(shared)
          log_var = self.uncert_head(shared)
          return speed, log_var
  ```

#### `[CELL 12]` — Heteroscedastic Huber Loss & DataLoaders
* **Purpose:** Implement Gaussian uncertainty loss combined with robust Huber error:
  $$\mathcal{L}(v, \hat{v}, s) = \frac{1}{2}\exp(-s)\cdot \text{Huber}(v - \hat{v}, \delta=1.0) + \frac{1}{2}s$$
* **DataLoader Config:** Batch Size = 128, Shuffle = True for train, Num Workers = 2.

#### `[CELL 13]` — Speed Model Training Loop with Checkpointing
* **Training Protocol:**
  - Optimizer: `AdamW(lr=1e-3, weight_decay=1e-4)`
  - LR Scheduler: `CosineAnnealingLR(T_max=50, eta_min=1e-5)`
  - Epochs: `50`
  - Early Stopping: Patience `8` on validation MAE.
  - Save Trigger: Save `speed_model_best.pth` when validation MAE achieves a new minimum.
* **Output:** `ml/models/speed_estimator/checkpoints/speed_model_best.pth`.

#### `[CELL 14]` — Speed Estimator Comprehensive Evaluation & Plots
* **Purpose:** Evaluate on the independent Test set across speed tiers (0-30 km/h, 30-60 km/h, 60+ km/h).
* **Metrics Computed:** MAE ($\text{m/s}$ & $\text{km/h}$), RMSE, Median Absolute Error, $R^2$ score, 95th percentile error.
* **Outputs:**
  - `ml/evaluation/metrics/05_speed_estimator_evaluation.json`
  - `05_speed_training_curves.png`
  - `05_speed_predicted_vs_ground_truth.png`
  - `05_speed_uncertainty_calibration.png`

#### `[CELL 15]` — Vibration Classifier & Continuous Score Architecture
* **Purpose:** Define the 1D Spectral Road Roughness Network providing both discrete classes (`LOW`, `NORMAL`, `HIGH`) and continuous severity score $V_{\text{score}} \in [0.0, 1.0]$.

#### `[CELL 16]` — Vibration Model Training & Checkpoint Saving
* **Training Protocol:** 30 Epochs, Adam (`lr=1e-3`), Cross-Entropy + MSE Score Loss.
* **Output Checkpoint:** `ml/models/vibration_classifier/checkpoints/vibration_model_best.pth`.

#### `[CELL 17]` — Vibration Classifier Evaluation & Confusion Matrix
* **Outputs:** `06_vibration_classifier_metrics.json` (F1-score $> 0.90$) and `06_vibration_confusion_matrix.png`.

#### `[CELL 18]` — Motion Quality & Confidence Model Architecture
* **Purpose:** Train multi-source confidence estimator $Q_{\text{motion}} \in [0.0, 1.0]$ integrating sensor signal-to-noise ratio, phone motion vs vehicle motion, and vibration score.

#### `[CELL 19]` — Motion Quality Training & Metric Export
* **Output Checkpoint:** `ml/models/motion_quality/checkpoints/motion_quality_best.pth` and `07_motion_quality_calibration.json`.

---

### Phase 3: AI + UKF Fusion & GNSS Outage Simulation

#### `[CELL 20]` — 15-State UKF Implementation with Adaptive Covariance
* **Purpose:** Implement the exact navigation fusion filter matching the C++ core:
  - State Vector $\mathbf{x} = [\mathbf{p}_{3\times 1}, \mathbf{v}_{3\times 1}, \boldsymbol{\psi}_{3\times 1}, \mathbf{b}_{a, 3\times 1}, \mathbf{b}_{g, 3\times 1}]^T \in \mathbb{R}^{15}$
  - Dynamic Measurement Noise: $R_{\text{speed}, k} = \sigma_{\text{speed}, k}^2 \cdot (1 + 2.0 \cdot V_{\text{score}, k})$
  - Dynamic Process Noise: $Q_{\text{ins}, k} = Q_{\text{nominal}} \cdot (1 + 1.5 \cdot V_{\text{score}, k})$
  - Heuristic Zero-Velocity Update (ZUPT) trigger when $\hat{v} < 0.1\text{ m/s}$.

#### `[CELL 21]` — Controlled GNSS Outage Simulation Suite
* **Purpose:** Inject synthetic GNSS loss intervals ($5\text{ s}, 10\text{ s}, 30\text{ s}, 60\text{ s}$) across 4 maneuvers:
  1. Straight Highway Cruising ($80\text{ km/h}$)
  2. Urban Stop-and-Go ($0-40\text{ km/h}$)
  3. 90-Degree Intersection Turns
  4. Multi-Exit Roundabout Traversal

#### `[CELL 22]` — 4-Way System Comparison & Benchmark Metrics
* **Systems Compared:**
  1. **Baseline 1:** Pure Inertial Double-Integration
  2. **Baseline 2:** Classical DR with Heuristic ZUPT
  3. **System 3:** AI Speed + Pure Dead Reckoning
  4. **System 4 (SIH26168 Core):** AI Speed + Vibration Adaptive UKF
* **Outputs:**
  - `ml/evaluation/metrics/08_gnss_outage_benchmark_results.json`
  - `08_outage_30s_trajectory_comparison.png`
  - `08_outage_60s_trajectory_comparison.png`
  - `08_cumulative_drift_error_cdf.png`

---

### Phase 4: Anomaly Detection & Fallback Switching

#### `[CELL 23]` — GNSS Anomaly & Multipath Detector
* **Purpose:** Compute innovation gating $|v_{\text{gnss}} - v_{\text{ai}}| > \gamma$ and satellite constellation dropouts to detect multipath jumps and spoofing.

#### `[CELL 24]` — Autonomous Fallback Verification
* **Purpose:** Verify seamless transition to Dead Reckoning without covariance explosion or position divergence.
* **Output:** `ml/models/motion_quality/checkpoints/gnss_anomaly_detector.pth`.

---

### Phase 5: Model Optimization, INT8 Quantization & Mobile Deployment

#### `[CELL 25]` — PyTorch to ONNX Export
* **Purpose:** Export best PyTorch checkpoints to ONNX with dynamic batch sizing and sequence dimension `(1, 20, 13)`.
* **Outputs:**
  - `ml/models/speed_estimator/exported/speed_estimator.onnx`
  - `ml/models/vibration_classifier/exported/vibration_classifier.onnx`

#### `[CELL 26]` — INT8 Post-Training Quantization (PTQ) with Calibration
* **Purpose:** Convert ONNX to TFLite and apply full INT8 quantization using 500 representative window samples from `X_train`.
* **Outputs:**
  - `ml/models/speed_estimator/exported/speed_estimator_int8.tflite`
  - `ml/models/vibration_classifier/exported/vibration_classifier_int8.tflite`

#### `[CELL 27]` — Numerical Parity & CPU Latency Benchmarking
* **Validation Tests:**
  1. **Parity Check:** $\max |\mathbf{y}_{\text{pytorch}} - \mathbf{y}_{\text{tflite}}| < 0.04\text{ m/s}$ on 1,000 test windows.
  2. **Latency Test:** 1,000 iterations of single-window inference on CPU. Target: $< 12\text{ ms}$ average latency.
* **Outputs:** `10_model_benchmarks_and_parity.json` and `10_latency_benchmark_distribution.png`.

#### `[CELL 28]` — Deployment Packaging to Flutter App
* **Purpose:** Package and copy quantized `.tflite` models and normalizer parameter metadata directly into the Flutter mobile asset folder.
* **Destination Assets:**
  - `mobile/assets/models/speed_estimator_int8.tflite`
  - `mobile/assets/models/vibration_classifier_int8.tflite`
  - `mobile/assets/models/model_metadata.json`
* **Metadata Schema:**
  ```json
  {
    "model_version": "v1.0.0-sih26168",
    "sampling_rate_hz": 10.0,
    "window_size_samples": 20,
    "input_features": 13,
    "feature_order": ["ax", "ay", "az", "gx", "gy", "gz", "norm_a", "norm_g", "dax", "day", "daz", "pitch", "roll"],
    "scaler_mean": [...],
    "scaler_scale": [...],
    "quantization": "INT8_PTQ",
    "speed_mae_m_s": 0.68,
    "outage_30s_error_m": 11.4
  }
  ```

---

## 3. Mandatory Quantitative Verification Matrix

| Verification Check | Target Gateway | Action on Failure |
|---|---|---|
| **Resampling Jitter** | Max $\Delta t$ deviation $< 0.002\text{ s}$ | Adjust spline interpolation tolerance |
| **Speed Estimator MAE** | **$< 0.8\text{ m/s}$ ($2.88\text{ km/h}$)** | Increase ResBlock depth or train for +15 epochs |
| **Speed Estimator $R^2$** | **$> 0.92$** | Verify feature scaling and ground truth sync |
| **Vibration F1-Score** | **$> 0.90$** | Adjust spectral FFT energy frequency cutoffs |
| **30s GNSS Outage Error**| **$< 15.0\text{ meters}$** | Tune adaptive UKF measurement noise scaling $\alpha$ |
| **60s GNSS Outage Drift**| **$< 1.0\%$ of distance** | Ensure ZUPT triggers cleanly when $\hat{v} < 0.1\text{ m/s}$ |
| **INT8 Parity Difference**| **$< 0.05\text{ m/s}$** | Increase representative calibration samples to 1,000 |
| **Mobile Inference Latency**| **$< 12\text{ ms}$ (CPU)** | Verify model pruned/quantized without unrolled loops |
| **INT8 Model File Size** | **$< 2.0\text{ MB}$** | Confirm float weights stripped during quantization |
