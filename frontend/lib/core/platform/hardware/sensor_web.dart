import 'sensor_api.dart';

class WebSensorDriver implements HardwareSensorInterface {
  @override
  Stream<List<double>> get imuStream => const Stream.empty();

  @override
  void start() {}

  @override
  void stop() {}
}
