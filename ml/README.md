# SIH26168 — ML Subsystem & Pipeline

This directory contains the machine learning subsystem for the **SIH26168 Smartphone Inertial Dead Reckoning System**.

For the exhaustive architecture specification and dataset documentation, refer to:
👉 **[Full AI/ML Architecture & IO-VNBD Specification](../docs/architecture/ai_ml_architecture.md)**

---

## Quick Directory Reference

```text
ml/
├── configs/          # Hyperparameter and dataset configuration YAMLs
├── data/             # Raw IO-VNBD datasets, processed shards, and split definitions
├── preprocessing/    # Cleaning, timestamp synchronization, windowing, and normalization
├── features/         # IMU kinematics, temporal stats, spectral vibration features
├── models/           # Speed Estimator, Vibration Classifier, and Motion Quality architectures
├── training/         # Training runners, loss functions, and Optuna tuning
├── evaluation/       # Metrics (MAE, RMSE, ATE/RTE), outage replay, report generation
├── visualization/    # Timeseries, error CDF, and trajectory plotting utilities
└── export/           # PyTorch -> ONNX -> TFLite INT8 quantization & validation pipeline
```

---

## Core Operational Flow

1. **Preprocessing:** Ingest IO-VNBD dataset (10 Hz IMU resampled), filter noise, synchronize with ground-truth wheel speed / GNSS velocity, and generate sliding window tensors (`[B, 20, 13]`).
2. **Speed Estimation:** Train 1D-CNN + GRU model with heteroscedastic loss to predict forward velocity $\hat{v}$ and uncertainty $\sigma_v$.
3. **Vibration Classification:** Compute spectral energy features to predict road roughness score ($0 \to 1$).
4. **Model Export:** Convert best checkpoints to TFLite (INT8 Post-Training Quantization with representative dataset calibration).
5. **Mobile Runtime:** Flutter AI module loads `.tflite` model, computes inference per sensor window, and streams outputs to the C++ Core SINS/UKF engine via `dart:ffi`.
