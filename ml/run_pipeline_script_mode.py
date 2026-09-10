#!/usr/bin/env python3
"""
SIH26168 — Master AI/ML Dead Reckoning Pipeline (Script Mode Runner)

Executes the complete unified master pipeline notebook (ml/notebooks/sih_ai_dead_reckoning_master_pipeline.ipynb)
in headless/non-interactive script mode with structured logging, progress tracking, and error handling.

Execution Workflow:
  1. [PHASE 0] Environment, seeds & automated directory verification
  2. [PHASE 1] Raw data inspection ("See Data") -> 10 Hz cubic spline preprocessing -> Outlier cleaning -> Integrity verification gate
  3. [PHASE 2] Normalization, SpeedEstimatorNet, VibrationClassifierNet & MotionQualityNet training
  4. [PHASE 3] 15-State Adaptive UKF navigation fusion & GNSS outage benchmarking suite (5s, 10s, 30s, 60s)
  5. [PHASE 4] GNSS anomaly & multipath jump detector, autonomous fallback switching
  6. [PHASE 5] ONNX opset 14 export, INT8 PTQ packaging, numerical parity check & Flutter/Web asset deployment

Usage:
  python ml/run_pipeline_script_mode.py
"""

import os
import sys
import json
import time
import pathlib
import argparse
import traceback

def main():
    parser = argparse.ArgumentParser(description="Run SIH26168 Master AI/ML Dead Reckoning Pipeline in Script Mode.")
    parser.add_argument(
        "--notebook",
        type=str,
        default=str(pathlib.Path(__file__).resolve().parent / "notebooks" / "sih_ai_dead_reckoning_master_pipeline.ipynb"),
        help="Path to the master notebook .ipynb file."
    )
    parser.add_argument(
        "--force-reprocess",
        action="store_true",
        help="Force re-processing of raw CSV files even if cleaned parquet already exists."
    )
    parser.add_argument(
        "--stop-on-error",
        action="store_true",
        default=True,
        help="Halt script execution immediately if any cell encounters an unhandled exception."
    )
    args = parser.parse_args()

    nb_path = pathlib.Path(args.notebook).resolve()
    if not nb_path.exists():
        print(f"[ERROR] Notebook not found at: {nb_path}")
        sys.exit(1)

    with open(nb_path, "r", encoding="utf-8") as f:
        nb_data = json.load(f)

    code_cells = [cell for cell in nb_data.get("cells", []) if cell.get("cell_type") == "code"]

    print("=" * 88)
    print("      SIH26168 — MASTER AI/ML DEAD RECKONING PIPELINE (SCRIPT MODE RUNNER)")
    print("=" * 88)
    print(f"  Target Notebook : {nb_path.name}")
    print(f"  Total Cells     : {len(nb_data.get('cells', []))} total ({len(code_cells)} executable code cells)")
    print(f"  Execution Mode  : Headless Non-Interactive Script Mode")
    print(f"  Start Timestamp : {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 88)
    print()

    global_env = {
        "__name__": "__main__",
        "FORCE_RAW_REPROCESSING": args.force_reprocess
    }

    total_start = time.time()
    successful_cells = 0

    for idx, cell in enumerate(code_cells, start=1):
        source_lines = cell.get("source", [])
        code_str = "".join(source_lines).strip()
        if not code_str:
            continue

        # Extract title or description from cell comment/header
        first_line = source_lines[0].strip() if source_lines else ""
        summary = first_line[:70] if first_line.startswith("#") else f"Code Block #{idx}"

        print("-" * 88)
        print(f"[SCRIPT MODE] Executing Cell [{idx:02d}/{len(code_cells):02d}] :: {summary}")
        print("-" * 88)

        cell_start = time.time()
        try:
            exec(code_str, global_env)
            elapsed = time.time() - cell_start
            successful_cells += 1
            print(f"[OK] Cell [{idx:02d}/{len(code_cells):02d}] finished successfully in {elapsed:.2f}s\n")
        except Exception as err:
            elapsed = time.time() - cell_start
            print(f"\n[FAIL] Cell [{idx:02d}/{len(code_cells):02d}] failed after {elapsed:.2f}s with error: {err}")
            traceback.print_exc()
            if args.stop_on_error:
                print(f"\n[HALT] Pipeline execution aborted at cell {idx}.")
                sys.exit(1)

    total_duration = time.time() - total_start
    print("=" * 88)
    print(f"[PIPELINE RUN COMPLETE] All {successful_cells}/{len(code_cells)} code cells executed successfully!")
    print(f"  Total Duration: {total_duration / 60.0:.2f} minutes ({total_duration:.1f} seconds)")
    print("=" * 88)

if __name__ == "__main__":
    main()
