abstract class HardwareSensorInterface {
  Stream<List<double>> get imuStream;
  void start();
  void stop();
}
