#!/usr/bin/env bash
set -euo pipefail

python -m maps.tools.osm_parser
python -m maps.tools.graph_builder
python -m maps.tools.geojson_converter
