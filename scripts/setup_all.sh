#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
( cd frontend && flutter pub get )
command -v cmake >/dev/null || { echo 'CMake is required'; exit 1; }
cmake --version
