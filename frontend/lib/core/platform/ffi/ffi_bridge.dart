abstract class IDRCoreBridge {
  void initEngine();

  void pushIMU({
    required double ax,
    required double ay,
    required double az,
    required double gx,
    required double gy,
    required double gz,
    required double timestamp,
  });

  void pushGNSS({
    required double latitude,
    required double longitude,
    required double altitude,
    required double speed,
    required double hdop,
    required double timestamp,
  });

  void pushMLSpeed({required double speed, required double confidence});

  Map<String, dynamic> pollNavState();
}
