"""Road graph construction and binary serialization boundaries."""


def constructTopologicalGraph(roads):
    return {"nodes": [], "edges": list(roads)}


def computeEdgeBearings(graph):
    return graph


def serializeToBinary(graph, output_path):
    raise NotImplementedError("Binary graph serialization is pending graph-format integration")
