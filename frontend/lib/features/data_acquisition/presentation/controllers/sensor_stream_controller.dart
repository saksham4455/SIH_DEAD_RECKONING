import 'dart:async';
import '../../data/models/sensor_frame_model.dart';
import '../../data/repositories/sensor_repository_impl.dart';

class SensorStreamController {
  final SensorRepository repository;
  StreamSubscription<SensorFrameModel>? _subscription;

  SensorStreamController({SensorRepository? repository})
      : repository = repository ?? SensorRepositoryImpl();

  Stream<SensorFrameModel> get frames => repository.watchFrames();

  void start(void Function(SensorFrameModel frame) onFrame) {
    _subscription ??= frames.listen(onFrame);
  }

  Future<void> stop() async {
    await _subscription?.cancel();
    _subscription = null;
  }
}
