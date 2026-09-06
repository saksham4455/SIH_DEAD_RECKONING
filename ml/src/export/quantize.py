"""Post-training quantization boundaries."""


def representativeDataset(data):
    return iter(data)


def applyINT8PostTrainingQuantization(model, representative_data, output_path):
    raise NotImplementedError("INT8 quantization is not implemented yet")
