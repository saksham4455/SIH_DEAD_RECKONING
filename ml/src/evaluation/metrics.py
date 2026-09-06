"""Evaluation metric boundaries."""


def evaluateRMSE(predictions, targets) -> float:
    if not predictions:
        return 0.0
    return (sum((prediction - target) ** 2 for prediction, target in zip(predictions, targets)) / len(predictions)) ** 0.5


def evaluateR2Score(predictions, targets) -> float:
    return 0.0
