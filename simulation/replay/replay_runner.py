"""Replay execution and simulated-run export boundaries."""

import json
from pathlib import Path


def runReplaySession(records, scenario=None):
    return iter(records)


def exportSimulatedRunLog(records, output_path):
    path = Path(output_path)
    path.write_text(json.dumps(list(records), indent=2), encoding="utf-8")
    return path
