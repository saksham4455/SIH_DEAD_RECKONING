# SIH26168 — Machine Learning Subsystem & Edge AI Pipeline

This directory contains the machine learning subsystem trained on the **IO-VNBD** (*Inertial and Odometry Vehicle Navigation Benchmark Dataset*) to provide real-time forward velocity estimation, vibration scoring, motion quality calibration, and GNSS anomaly detection.

---

## 🧠 Model Zoo Summary

| Model | Architecture | Parameters | Input Tensor | Output | Performance |
|---|---|---|---|---|---|
| **SpeedEstimatorNet** | 1D-CNN + ResBlock + Bi-GRU + Dual Heads | 64,658 | `[B, 20, 13]` (10 Hz, 2.0s) | Speed $\hat{v}$ (m/s) + Uncertainty $\log(\sigma^2)$ | **MAE: 0.280 m/s (1.01 km/h)**, $R^2: 0.9959$ |
| **VibrationClassifierNet** | 3-Layer Conv1D + Dual Heads | 23,396 | `[B, 20, 13]` | [LOW, NORMAL, HIGH] + $V_{\text{score}} \in [0, 1]$ | **Weighted F1: 1.0000** |
| **MotionQualityNet** | Temporal Conv + Spatial Fusion MLP | ~5,000 | `[B, 20, 13]` | Trust Score $Q_{\text{motion}} \in [0, 1]$ | **Validation MAE: 0.0389** |
| **GNSS Anomaly Detector** | 3-Layer MLP | ~700 | `[B, 4]` | Anomaly Probability $\in [0, 1]$ | **Accuracy: 100%, False Alarm: 0.0%** |

---

## 📂 Directory Structure

```
ml/
├── configs/                   # YAML hyperparameter configurations
│   ├── speed_model_config.yaml
│   └── vibration_config.yaml
│
├── data/                      # Dataset repository
│   ├── raw/IO-VNBD/           # Raw smartphone (5 trajectories) & vehicle CAN files
│   ├── processed/cleaned/     # Resampled 10 Hz uniform dataset (iovnbd_cleaned_10hz.parquet)
│   ├── processed/splits/      # Leak-free train/val/test split definitions
│   ├── processed/windows/     # Window tensors ([5950, 20, 13] train, val, test .npz)
│   └── scalers/               # StandardScaler parameters (json & pkl)
│
├── evaluation/                # Performance reports & diagnostic charts
│   ├── metrics/               # 8 JSON summary files (evaluation, latency, outage benchmarks)
│   └── plots/                 # 13 high-resolution diagnostic charts & error CDFs
│
├── models/                    # Model artifacts repository
│   ├── speed_estimator/       # Checkpoint (.pth), ONNX (opset 14), INT8 TFLite (49.2 KB)
│   ├── vibration_classifier/  # Checkpoint (.pth), ONNX (opset 14), INT8 TFLite (49.2 KB)
│   └── motion_quality/        # Best weights (.pth), ONNX, INT8 TFLite (49.2 KB)
│
├── notebooks/                 # Master Jupyter notebook pipeline
│   └── sih_ai_dead_reckoning_master_pipeline.ipynb
│
├── run_pipeline_script_mode.py # Headless automated execution runner
└── README.md
```

---

## 🔬 13-Channel Feature Engineering Pipeline

For every time step $t$, the pipeline constructs a 13-dimensional kinematic feature vector $\mathbf{x}_t \in \mathbb{R}^{13}$:
1. $a_x$ — Forward/longitudinal acceleration ($\text{m/s}^2$)
2. $a_y$ — Lateral acceleration ($\text{m/s}^2$)
3. $a_z$ — Vertical acceleration ($\text{m/s}^2$)
4. $g_x$ — Roll angular velocity ($\text{rad/s}$)
5. $g_y$ — Pitch angular velocity ($\text{rad/s}$)
6. $g_z$ — Yaw angular velocity ($\text{rad/s}$)
7. $\|a\|$ — Total acceleration norm $\sqrt{a_x^2 + a_y^2 + a_z^2}$
8. $\|g\|$ — Total angular velocity norm $\sqrt{g_x^2 + g_y^2 + g_z^2}$
9. $\Delta a_x$ — Numerical longitudinal jerk $\frac{da_x}{dt}$
10. $\Delta a_y$ — Numerical lateral jerk $\frac{da_y}{dt}$
11. $\Delta a_z$ — Numerical vertical jerk $\frac{da_z}{dt}$
12. $\text{pitch}$ — Gravity tilt angle $\text{atan2}(a_x, \sqrt{a_y^2 + a_z^2})$
13. $\text{roll}$ — Gravity tilt angle $\text{atan2}(a_y, a_z)$

---

## ⚙️ Mathematical Bridge to 15-State UKF

Neural predictions do not output raw coordinates; they adaptively modulate Kalman filter covariance:
- **Measurement Noise Scaling**:
  $$R_{\text{speed}} = \frac{\sigma_{\text{ai}}^2 \cdot (1.0 + 2.0 \cdot V_{\text{score}})}{Q_{\text{motion}}}$$
- **Process Noise Scaling**:
  $$Q_{\text{ins}} = \frac{Q_{\text{nominal}} \cdot (1.0 + 1.5 \cdot V_{\text{score}})}{Q_{\text{motion}}}$$
- **Zero-Velocity Constraint (ZUPT)**: Smooth exponential decay when $\hat{v} < 0.10\text{ m/s}$ and dynamic acceleration $< 0.38\text{ m/s}^2$.

---

## ⚡ Running the ML Pipeline

To re-run the entire data ingestion, preprocessing, training, evaluation, and export pipeline:

```bash
# Script mode execution
python ml/run_pipeline_script_mode.py

# Or launch Jupyter Notebook:
jupyter notebook ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb
```
