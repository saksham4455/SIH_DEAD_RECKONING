#!/usr/bin/env bash
set -euo pipefail

uvicorn app.main:app --app-dir backend --reload &
backend_pid=$!
trap 'kill "$backend_pid"' EXIT
python -m simulation.replay.replay_runner
