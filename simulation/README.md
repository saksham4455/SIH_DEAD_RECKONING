# SIH26168 — Outage Injection & Simulation Engine

The `simulation/` package enables rigorous algorithm benchmarking and demonstration without requiring a physical subterranean road tunnel.

---

## 🎮 Benchmark Scenarios (`simulation/scenarios/`)

1. **`tunnel_60s_outage.json`**: 60-second total GNSS blackout. Tests dead-reckoning drift retention ($< 1.0\%$ target).
2. **`urban_canyon_multipath.json`**: 25-meter multipath pseudo-range drift starting at $t=10\text{s}$ for 45 seconds. Tests innovation gating and multipath rejection.
3. **`flyover_level_split.json`**: 40-meter elevation and track split anomaly. Evaluates multi-level road matching.

---

## ⚡ Running Replays

```bash
# Run automated simulation scenario
python simulation/replay/replay_runner.py --scenario simulation/scenarios/tunnel_60s_outage.json
```
