"""Frequency-domain feature function boundaries."""


def computeFFT(values):
    return values


def computeSpectralEnergy(values):
    return sum(abs(value) ** 2 for value in values)


def extractDominantFrequency(values, sampling_rate: float):
    return 0.0
