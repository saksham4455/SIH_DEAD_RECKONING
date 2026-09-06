#!/usr/bin/env bash
set -euo pipefail

python -m ml.src.training.train_speed
python -m ml.src.export.torch_to_onnx
python -m ml.src.export.onnx_to_tflite
python -m ml.src.export.quantize
