import '../models/sensor_frame_model.dart';
import '../../../../core/platform/hardware/sensor_mobile.dart';

abstract class SensorRepository {
  Stream<SensorFrameModel> watchFrames();
}

class SensorRepositoryImpl implements SensorRepository {
  final MobileSensorDriver driver;

  SensorRepositoryImpl({MobileSensorDriver? driver})
      : driver = driver ?? MobileSensorDriver();

  @override
  Stream<SensorFrameModel> watchFrames() {
    driver.start();
    return driver.imuStream.map(
      (values) => SensorFrameModel(
        timestamp: values.last,
        values: values.sublist(0, values.length - 1),
      ),
    );
  }
}
