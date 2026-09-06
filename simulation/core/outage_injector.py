"""GNSS outage and multipath injection boundaries."""


def triggerHardOutage(record, duration_seconds: float):
    return {**record, "gnss_available": False, "outage_duration_seconds": duration_seconds}


def injectMultipathDrift(record, drift_meters: float):
    return {**record, "multipath_drift_meters": drift_meters}


def mask_gnss_data(record):
    result = dict(record)
    result["gnss"] = None
    result["gnss_available"] = False
    return result
