#!/usr/bin/env bash
set -euo pipefail

emcmake cmake -S cpp-core -B build/wasm -DCMAKE_BUILD_TYPE=Release
cmake --build build/wasm --config Release
