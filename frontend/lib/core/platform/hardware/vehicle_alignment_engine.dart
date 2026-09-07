import 'dart:math';

/// In-Vehicle Alignment & Kinematic Constraints Engine (NHC)
/// Converts raw smartphone accelerometer & gyroscope readings into vehicle coordinates
/// (Longitudinal, Lateral, Vertical) regardless of phone mounting orientation.
class VehicleAlignmentEngine {
  double pitch = 0.0; // Rotation around X-axis (in radians)
  double roll = 0.0;  // Rotation around Y-axis (in radians)
  bool isCalibrated = false;

  // Exponential moving average for gravity estimation
  double _gravityX = 0.0;
  double _gravityY = 0.0;
  double _gravityZ = 9.81;
  int _calibrationSamples = 0;

  /// Calibrate alignment angles from accelerometer gravity vector
  void updateCalibration(double ax, double ay, double az) {
    _gravityX = (_gravityX * 0.95) + (ax * 0.05);
    _gravityY = (_gravityY * 0.95) + (ay * 0.05);
    _gravityZ = (_gravityZ * 0.95) + (az * 0.05);
    _calibrationSamples++;

    if (_calibrationSamples > 10) {
      // Calculate Pitch & Roll from gravity vector
      pitch = atan2(-_gravityX, sqrt(_gravityY * _gravityY + _gravityZ * _gravityZ));
      roll = atan2(_gravityY, _gravityZ);
      isCalibrated = true;
    }
  }

  /// Transforms raw phone acceleration [ax, ay, az] into vehicle reference frame:
  /// Output: [longitudinalAccel, lateralAccel, verticalAccel]
  List<double> transformToVehicleFrame(double ax, double ay, double az) {
    if (!isCalibrated) updateCalibration(ax, ay, az);

    // Apply 3D Euler Pitch & Roll rotation matrix
    final cosP = cos(pitch);
    final sinP = sin(pitch);
    final cosR = cos(roll);
    final sinR = sin(roll);

    // Vehicle Longitudinal (Forward acceleration)
    final double aLongitudinal = (ax * cosP) + (az * sinP);

    // Vehicle Lateral (Side acceleration)
    final double aLateral = (ay * cosR) - (az * sinR);

    // Vehicle Vertical (Up/Down acceleration minus 1G gravity)
    final double aVertical = (-ax * sinP) + (ay * sinR) + (az * cosP * cosR) - 9.81;

    return [aLongitudinal, aLateral, aVertical];
  }

  /// Non-Holonomic Constraint (NHC) filter
  /// Vehicles cannot slide sideways or fly upwards: enforces 1D forward motion kinematics
  List<double> applyNonHolonomicConstraints(List<double> vehicleAccel) {
    final aLong = vehicleAccel[0];
    
    // Suppress lateral & vertical noise (NHC)
    final aLatClamped = 0.0; // Sideways speed constrained to 0
    final aVertClamped = 0.0; // Vertical speed constrained to 0

    return [aLong, aLatClamped, aVertClamped];
  }
}
