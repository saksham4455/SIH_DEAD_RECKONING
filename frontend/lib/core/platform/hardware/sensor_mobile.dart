import 'sensor_api.dart';
import 'dart:async';
import 'package:sensors_plus/sensors_plus.dart';

class MobileSensorDriver implements HardwareSensorInterface {
  final StreamController<List<double>> _imuController =
      StreamController.broadcast();
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  StreamSubscription<GyroscopeEvent>? _gyroscopeSubscription;
  List<double> _latestGyroscope = const [0, 0, 0];

  @override
  Stream<List<double>> get imuStream => _imuController.stream;

  @override
  void start() {
    if (_accelerometerSubscription != null) return;

    _gyroscopeSubscription = gyroscopeEventStream().listen((event) {
      _latestGyroscope = [event.x, event.y, event.z];
    });
    _accelerometerSubscription = accelerometerEventStream().listen((event) {
      _imuController.add([
        event.x,
        event.y,
        event.z,
        ..._latestGyroscope,
        DateTime.now().microsecondsSinceEpoch / 1000000,
      ]);
    });
  }

  @override
  void stop() {
    _accelerometerSubscription?.cancel();
    _gyroscopeSubscription?.cancel();
    _accelerometerSubscription = null;
    _gyroscopeSubscription = null;
  }

  Future<void> dispose() async {
    stop();
    await _imuController.close();
  }
}
