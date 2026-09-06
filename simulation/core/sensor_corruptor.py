"""Sensor corruption boundaries for controlled simulation runs."""


def addAccelerometerBiasDrift(record, bias):
    result = dict(record)
    result["accelerometer_bias"] = bias
    return result


def addThermalGyroDrift(record, temperature_celsius: float, drift_rate):
    result = dict(record)
    result["temperature_celsius"] = temperature_celsius
    result["gyro_drift_rate"] = drift_rate
    return result
