# SIH26168 — Master AI/ML Training Pipeline Notebook

This directory contains the unified Master Training Pipeline for the **SIH26168 Smartphone Inertial Dead Reckoning System** using the **IO-VNBD** dataset.

👉 **[Complete Master Notebook Architecture & Cell-by-Cell Blueprint](../../docs/architecture/ml_phase_notebook_execution_plan.md)**

---

## Unified Master Notebook

* **File:** `ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb`

### Sequential Cell Structure

| Cell # | Phase | Operation | Output Artifacts |
|---|---|---|---|
| **01–02** | **Phase 0** | Imports, device detection, seeds & automated directory initialization | Directory tree created |
| **03–05** | **Phase 1.1** | IO-VNBD raw data ingestion, jitter correction & 10 Hz uniform resampling | `ml/data/processed/cleaned/iovnbd_cleaned_10hz.parquet` |
| **06–07** | **Phase 1.2** | Ground truth speed alignment, sliding windows ($T=2\text{s}, L=20$) & leak-free splits | `ml/data/processed/windows/*.npz`, `dataset_splits.json` |
| **08** | **Phase 1.3** | Classical Dead Reckoning baseline benchmark (Double-integration + Heuristic ZUPT) | `03_classical_baseline_metrics.json` |
| **09–10** | **Phase 2.1** | 13-channel kinematic & spectral features, fit & serialize `StandardScaler` | `ml/data/scalers/imu_feature_scaler.json`, `scaler.pkl` |
| **11–14** | **Phase 2.2** | Speed Estimator (1D-CNN + ResBlock + Bi-GRU) PyTorch training & evaluation | `speed_model_best.pth`, `05_speed_estimator_evaluation.json` |
| **15–17** | **Phase 2.3** | Road Vibration Classifier & continuous score training ($V_{\text{score}} \in [0, 1]$) | `vibration_model_best.pth`, `06_vibration_classifier_metrics.json` |
| **18–19** | **Phase 2.4** | Motion Quality & Confidence model training and calibration | `motion_quality_best.pth`, `07_motion_quality_calibration.json` |
| **20–22** | **Phase 3** | AI + 15-State UKF fusion, adaptive $Q, R$ noise, 5s/10s/30s/60s GNSS outage suite | `08_gnss_outage_benchmark_results.json`, trajectory plots |
| **23–24** | **Phase 4** | GNSS anomaly & multipath jump detector, autonomous fallback switching | `gnss_anomaly_detector.pth` |
| **25–28** | **Phase 5** | ONNX export, INT8 TFLite PTQ quantization, parity check & Flutter app deployment | `mobile/assets/models/speed_estimator_int8.tflite` |

---

## Quick Start in Jupyter

1. Open Jupyter Lab / Notebook from the repository root:
   ```bash
   jupyter notebook ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb
   ```
2. Run cells sequentially (**Run All** or Step-by-Step).
3. Every cell automatically reads from and saves to its dedicated project folder.
