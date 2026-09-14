# SIH26168 — C++17 Navigation Engine & Sensor Fusion Core

The `cpp-core/` directory contains the high-performance C++17 shared library (`cpp_core`) implementing Strapdown Inertial Navigation (SINS), a 15-state Unscented Kalman Filter (UKF), lock-free ring buffering, and HMM map matching.

---

## ⚙️ Core Modules

1. **Strapdown INS Mechanization (`ins/`)**:
   - Quaternions and Direction Cosine Matrix (DCM) attitude propagation
   - WGS-84 Somigliana normal gravity model: $g(\phi, h) \approx 9.80665 - 3.086 \times 10^{-6} h$
   - Coriolis acceleration compensation: $\mathbf{a}_{\text{coriolis}} = 2\boldsymbol{\omega}_e \times \mathbf{v}$
2. **15-State Unscented Kalman Filter (`fusion/`)**:
   - State Vector: $\mathbf{x} = [\mathbf{p}_3, \mathbf{v}_3, \boldsymbol{\psi}_3, \mathbf{b}_a{_3}, \mathbf{b}_g{_3}]^T$
   - Merwe scaled unscented transform ($\alpha=10^{-3}, \beta=2, \kappa=0$)
   - Adaptive measurement noise scaling from neural motion quality and vibration scores
3. **Lock-Free SPSC Ring Buffer (`sensor/`)**:
   - Wait-free circular queue utilizing atomic acquire/release memory barriers for zero-copy IMU packet ingestion
4. **HMM Map Matcher (`map_matching/`)**:
   - Viterbi path search with Gaussian emission probabilities on topological road graphs
5. **C ABI Export (`ffi/`)**:
   - Canonical C functions for cross-language invocation from Dart (`dart:ffi`):
     - `IDR_Init()`
     - `IDR_PushIMU(ax, ay, az, gx, gy, gz, t)`
     - `IDR_PushGNSS(lat, lon, alt, speed, track, hdop, svs, t)`
     - `IDR_PushMLSpeed(speed, confidence, t)`
     - `IDR_GetState(out_state)`

---

## 🔨 Compilation

```bash
# Build desktop shared library
mkdir -p cpp-core/build && cd cpp-core/build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
```
