# SIH26168 — GIS & Map Matching Pipeline

The `maps/` directory provides OpenStreetMap (OSM) ingestion, topological road graph generation, and spatial indexing for C++ HMM map matching and Flutter rendering.

---

## 📂 Directory Structure

```
maps/
├── raw_osm/              # Ingestion directory for OpenStreetMap .osm.pbf extracts (Git LFS)
├── demo-region/          # Bundled Delhi NCR demo road network (roads.json)
├── processed_graphs/     # Topological nodes, edges, and spatial_index.bin
└── tools/
    ├── osm_parser.py     # Filters drivable motorways, primary, secondary roads
    ├── graph_builder.py  # Builds topological nodes, edges, and segment bearings
    └── geojson_converter.py # Converts graphs to GeoJSON FeatureCollections
```

---

## ⚡ Pipeline Execution

```bash
# Process raw OSM extract into graph representation
python maps/tools/osm_parser.py
python maps/tools/graph_builder.py
python maps/tools/geojson_converter.py
```
