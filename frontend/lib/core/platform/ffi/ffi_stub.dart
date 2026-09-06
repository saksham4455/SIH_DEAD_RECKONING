import 'ffi_bridge.dart';

class FfiStub implements IDRCoreBridge {
  @override
  void initEngine() => throw UnsupportedError(
      'Native navigation engine is unavailable on this platform.');

  @override
  void pushIMU(
          {required double ax,
          required double ay,
          required double az,
          required double gx,
          required double gy,
          required double gz,
          required double timestamp}) =>
      throw UnsupportedError(
          'Native navigation engine is unavailable on this platform.');

  @override
  void pushGNSS(
          {required double latitude,
          required double longitude,
          required double altitude,
          required double speed,
          required double hdop,
          required double timestamp}) =>
      throw UnsupportedError(
          'Native navigation engine is unavailable on this platform.');

  @override
  void pushMLSpeed({required double speed, required double confidence}) =>
      throw UnsupportedError(
          'Native navigation engine is unavailable on this platform.');

  @override
  Map<String, dynamic> pollNavState() => throw UnsupportedError(
      'Native navigation engine is unavailable on this platform.');
}
