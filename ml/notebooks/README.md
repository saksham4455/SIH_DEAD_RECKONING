# SIH26168 — Master AI/ML Training Pipeline Notebook (v2.0)

This directory contains the unified Master Training Pipeline for the **SIH26168 Smartphone Inertial Dead Reckoning System** using the **IO-VNBD** dataset.

👉 **[Complete Master Notebook Architecture & Cell-by-Cell Blueprint](../../docs/architecture/ml_phase_notebook_execution_plan.md)**

---

## Unified Master Notebook

* **File:** [`ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb`](file:///c:/dev/SIH_DEAD_RECKNING/ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb)
* **Version:** 2.0 (Maximum Accuracy & Production Deployment Upgrade)

### Key v2.0 Enhancements:
1. **Full Dataset Utilization**: Processes all sessions across the dataset without artificial slicing limits.
2. **Data Augmentation**: Gaussian noise ($\sigma=0.02$) and temporal jitter applied to training windows for enhanced generalization.
3. **Optimized Sampling**: Train window stride reduced from 4 to 2, generating ~2× more training examples.
4. **Enhanced SpeedEstimatorNet**:
   - 2-layer Bi-GRU with dropout (0.15) and Kaiming/Xavier initialization
   - 30 epochs with 3-epoch linear warmup followed by Cosine Annealing LR
   - Gradient clipping (`max_norm=1.0`) and Early Stopping (`patience=5`)
5. **Enhanced VibrationClassifierNet**:
   - Deeper multi-scale 1D-CNN backbone with batch normalization
   - `OneCycleLR` scheduling with validation checkpointing and Early Stopping (`patience=5`)
6. **Supervised MotionQualityNet**:
   - Trained end-to-end with composite proxy labels derived from speed estimation error and vibration severity
7. **Adaptive UKF v2.0**:
   - Exponential velocity decay ZUPT (`vel *= 0.85`) to avoid unphysical hard zero discontinuities
   - Dynamic measurement covariance scaled by both vibration roughness and motion quality score
   - Velocity clamping ($[0, 60\text{ m/s}]$)
8. **Deployment & Validation**:
   - Automated ONNX export with opset 14
   - ONNX Runtime numerical parity verification (`diff < 0.001 m/s`)
   - CPU latency benchmarking (< 12 ms target)
   - Synchronized export to both Flutter mobile (`mobile/assets/models`) and web frontend (`frontend/assets/models`)

---

### Sequential Cell Structure

| Cell # | Phase | Operation | Output Artifacts |
|---|---|---|---|
| **01–02** | **Phase 0** | Full reproducibility setup (PyTorch/CUDA seeds, deterministic cuDNN), directory tree initialization | Directory tree verified |
| **03–05** | **Phase 1.1** | IO-VNBD dataset discovery, jitter correction, cubic spline interpolation to uniform 10 Hz | `ml/data/processed/cleaned/iovnbd_cleaned_10hz.parquet`, jitter before/after plot |
| **06–07** | **Phase 1.2** | 13-channel kinematic feature extraction, windowing ($T=2\text{s}, L=20, \text{stride}=2$), Gaussian noise augmentation, leak-free splits | `ml/data/processed/windows/*.npz`, `dataset_splits.json`, split distribution plot |
| **08** | **Phase 1.3** | Classical Dead Reckoning baseline benchmark (Double-integration + Heuristic ZUPT) | `03_classical_baseline_metrics.json`, trajectory comparison plot |
| **09–10** | **Phase 2.1** | StandardScaler fitting with RobustScaler sanity stats, serialization to JSON & PKL | `ml/data/scalers/imu_feature_scaler.json`, correlation heatmap |
| **11–14** | **Phase 2.2** | Speed Estimator (1D-CNN + ResBlock + 2-layer Bi-GRU + Heteroscedastic Head) training with warmup, grad clip, early stop | `speed_model_best.pth`, `05_speed_estimator_evaluation.json`, 3 diagnostic plots |
| **15–17** | **Phase 2.3** | Road Vibration Classifier (Deeper CNN + OneCycleLR + Val Checkpoint) | `vibration_model_best.pth`, `06_vibration_classifier_metrics.json`, confusion matrix plot |
| **18–19** | **Phase 2.4** | Motion Quality Network trained end-to-end with multi-task proxy labels | `motion_quality_best.pth`, `07_motion_quality_calibration.json` |
| **20–22** | **Phase 3** | AI + 15-State UKF fusion, exponential ZUPT, 5s/10s/30s/60s GNSS blackout benchmark suite | `08_gnss_outage_benchmark_results.json`, 30s/60s trajectory plots, CDF plot |
| **23–24** | **Phase 4** | GNSS Anomaly & Multipath Detector, innovation gating, autonomous failover switching | `gnss_anomaly_detector.pth`, `09_gnss_anomaly_detection_metrics.json`, failover plot |
| **25–28** | **Phase 5** | ONNX export (3 models), INT8 TFLite PTQ containers, numerical parity check, CPU latency benchmark, deployment to mobile & web assets | `speed_estimator.onnx`, `vibration_classifier.onnx`, `motion_quality.onnx`, `*.tflite`, `model_metadata.json` |

---

## Execution Modes

### 1. Interactive Mode (Jupyter Notebook / JupyterLab)
Open the notebook from the repository root:
```bash
jupyter notebook ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb
```
Select **Kernel $\to$ Restart & Run All**.

### 2. Automated Script Mode (Headless CLI)
To execute the pipeline non-interactively from the terminal with live phase tracking:
```bash
python ml/run_pipeline_script_mode.py
```
Optional flags:
- `--force-reprocess`: Forces re-reading and re-interpolating all 169 raw CSVs even if cleaned parquet exists.
- `--stop-on-error`: Aborts immediately if an unhandled error occurs (default: enabled).

---

## Data Pipeline Flow: "See $\to$ Preprocess $\to$ Clean $\to$ Work"

Every run strictly follows this 4-step quality assurance protocol:
1. **[Step 1: See the Data] (Cell 03)**:
   - Discovers all raw driving files (`vehicle_extracted` and `smartphone_recorded`).
   - Audits schemas, column mappings, datatypes, and missing values.
   - Computes raw sampling rate statistics ($\Delta t$) and verifies baseline physics (Earth gravity $\|\mathbf{a}\| \approx 9.81\text{ m/s}^2$).
2. **[Step 2: Preprocess] (Cell 04)**:
   - Enforces timestamp monotonicity (rejects backwards or non-advancing packets).
   - Resamples signals to a strictly uniform 10 Hz time grid ($\Delta t = 0.100\text{ s}$) using `CubicSpline` interpolation.
   - Synchronizes ground truth vehicle speed.
3. **[Step 3: Clean & Verify Gate] (Cell 05)**:
   - Applies 3-tap median filtering to eliminate sensor spikes.
   - Applies physical bounding box clipping (accel $\pm 25\text{ m/s}^2$, gyro $\pm 10\text{ rad/s}$, speed $0 - 55\text{ m/s}$).
   - **Quality Verification Gate**: Strictly asserts $\ge 1,000$ rows, zero NaNs, and valid ranges before saving `iovnbd_cleaned_10hz.parquet`.
4. **[Step 4: Start Working] (Cells 06–28)**:
   - Extracts sliding windows, fits feature scalers, trains the 3 deep learning models, runs adaptive UKF fusion, detects GNSS anomalies, and exports production ONNX & INT8 mobile assets.


