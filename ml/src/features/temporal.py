"""Time-domain feature function boundaries."""


def computeMean(values):
    return sum(values) / len(values) if values else 0.0


def computeVariance(values):
    if not values:
        return 0.0
    mean = computeMean(values)
    return sum((value - mean) ** 2 for value in values) / len(values)


def computeKurtosis(values):
    return 0.0


def calculateJerk(values, sampling_interval: float = 0.01):
    return [(current - previous) / sampling_interval for previous, current in zip(values, values[1:])]
