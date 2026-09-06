"""Compatibility entry point for the model export pipeline."""

from onnx_to_tflite import convertToTFLite


def main():
    print("Use src/export/torch_to_onnx.py, onnx_to_tflite.py, and quantize.py for model export.")


if __name__ == "__main__":
    main()
