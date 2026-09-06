from math import hypot


def compute_rmse(records: list[dict]) -> float:
    if not records:
        return 0.0
    errors = [1.0 - float(record.get("confidence", 0.0)) for record in records]
    return (sum(error * error for error in errors) / len(errors)) ** 0.5


def compute_max_absolute_error(records: list[dict]) -> float:
    return max((abs(1.0 - float(record.get("confidence", 0.0))) for record in records), default=0.0)


def calculate_drift_percentage(records: list[dict]) -> float:
    if not records:
        return 0.0
    return sum(1 for record in records if record.get("mode") == "DEAD_RECKONING") / len(records) * 100
