# Map Matching Data

`maps/` stores raw OpenStreetMap inputs, processed road graphs, and conversion tools for the C++ map matcher and Flutter renderer.

```text
maps/
├── raw_osm/                         # Source .osm.pbf files
├── processed_graphs/                # Nodes, edges, and packed spatial index
├── demo-region/                     # Existing demo road data
└── tools/
    ├── osm_parser.py
    ├── graph_builder.py
    └── geojson_converter.py
```
