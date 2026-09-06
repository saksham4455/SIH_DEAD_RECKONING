"""Vibration classifier model boundary."""


class VibrationClassifier:
    """Four-class vibration classification contract."""

    def forward(self, inputs):
        raise NotImplementedError("Implement the PyTorch model in the training environment")
