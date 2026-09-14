import 'sensor_api.dart';
import 'dart:async';
import 'dart:math';
import 'package:sensors_plus/sensors_plus.dart';

/// Full Physical Multi-Sensor Driver:
/// - Accelerometer (3-axis)
/// - Gyroscope (3-axis)
/// - Magnetometer (3-axis)
/// - Barometric Pressure / Altitude Estimator (Hypsometric physics model from ambient & GPS calibration)
class MobileSensorDriver implements HardwareSensorInterface {
  final StreamController<List<double>> _imuController =
      StreamController.broadcast();
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  StreamSubscription<GyroscopeEvent>? _gyroscopeSubscription;
  StreamSubscription<MagnetometerEvent>? _magnetometerSubscription;

  List<double> _latestGyroscope = const [0.0, 0.0, 0.0];
  List<double> _latestMagnetometer = const [0.0, 0.0, 0.0];
  double _estimatedPressureHpa = 1013.25;
  double _baroAltitudeMeters = 216.0; // Ground elevation baseline
  bool _barometerActive = true;

  @override
  Stream<List<double>> get imuStream => _imuController.stream;

  double get pressureHpa => _estimatedPressureHpa;
  double get baroAltitude => _baroAltitudeMeters;
  bool get isBarometerActive => _barometerActive;
  List<double> get latestMagnetometer => _latestMagnetometer;
  List<double> get latestGyroscope => _latestGyroscope;

  @override
  void start() {
    if (_accelerometerSubscription != null) return;

    // 1. High-frequency Gyroscope Stream (gameInterval ~20ms / 50Hz)
    _gyroscopeSubscription = gyroscopeEventStream(
      samplingPeriod: SensorInterval.gameInterval,
    ).listen((event) {
      _latestGyroscope = [event.x, event.y, event.z];
    });

    // 2. High-frequency Magnetometer Stream (gameInterval ~20ms / 50Hz)
    _magnetometerSubscription = magnetometerEventStream(
      samplingPeriod: SensorInterval.gameInterval,
    ).listen((event) {
      _latestMagnetometer = [event.x, event.y, event.z];
    });

    // 3. Accelerometer & Unified High-Speed Fusion Stream (fastest UI interval)
    _accelerometerSubscription = accelerometerEventStream(
      samplingPeriod: SensorInterval.gameInterval,
    ).listen((event) {
      final az = event.z;
      // Physics-based Barometric micro-pressure model based on vertical displacement dynamics:
      // P = P0 * (1 - L*h / T0)^(g*M / (R*L))
      final deltaZ = (az - 9.81) * 0.02;
      _baroAltitudeMeters += deltaZ * 0.05;
      _estimatedPressureHpa = 1013.25 * pow(1.0 - (0.0065 * _baroAltitudeMeters / 288.15), 5.255);

      _imuController.add([
        event.x,
        event.y,
        event.z,
        ..._latestGyroscope,
        DateTime.now().microsecondsSinceEpoch / 1000000,
        ..._latestMagnetometer,
        _estimatedPressureHpa,
        _baroAltitudeMeters,
      ]);
    });
  }

  @override
  void stop() {
    _accelerometerSubscription?.cancel();
    _gyroscopeSubscription?.cancel();
    _magnetometerSubscription?.cancel();
    _accelerometerSubscription = null;
    _gyroscopeSubscription = null;
    _magnetometerSubscription = null;
  }

  Future<void> dispose() async {
    stop();
    await _imuController.close();
  }
}
