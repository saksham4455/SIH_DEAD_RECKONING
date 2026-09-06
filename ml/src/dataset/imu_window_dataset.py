"""Rolling-window dataset boundary for synchronized IMU streams."""


class IMUWindowDataset:
    """Dataset contract for converting IMU streams into time windows."""

    def __init__(self, samples, window_size: int, stride: int = 1):
        self.samples = samples
        self.window_size = window_size
        self.stride = stride

    def __len__(self) -> int:
        return max(0, (len(self.samples) - self.window_size) // self.stride + 1)

    def __getitem__(self, index: int):
        start = index * self.stride
        return self.samples[start : start + self.window_size]
