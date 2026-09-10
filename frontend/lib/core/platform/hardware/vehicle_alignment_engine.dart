import 'dart:math';

/// In-Vehicle Alignment & Kinematic Constraints Engine (NHC)
/// Converts raw smartphone accelerometer & gyroscope readings into vehicle coordinates
/// (Longitudinal, Lateral, Vertical) regardless of phone mounting orientation.
///
/// Gravity is estimated via a continuous low-pass filter and subtracted so that a
/// phone lying perfectly still produces ~0 on every axis. The gravity estimate
/// updates continuously to track slow orientation changes (e.g., phone tilting in
/// a mount), while rejecting fast transients (actual movement).
class VehicleAlignmentEngine {
  double pitch = 0.0; // Rotation around X-axis (in radians)
  double roll = 0.0;  // Rotation around Y-axis (in radians)
  bool isCalibrated = false;

  // Continuous low-pass filter for gravity estimation (alpha = 0.98 for stability)
  double _gravityX = 0.0;
  double _gravityY = 0.0;
  double _gravityZ = 9.81;
  int _sampleCount = 0;

  /// Continuously update gravity estimate and alignment angles from raw accelerometer.
  /// Called on EVERY sample, not just during initial calibration.
  void _updateGravityEstimate(double ax, double ay, double az) {
    // High-alpha low-pass: tracks slow gravity changes, rejects fast motion
    _gravityX = (_gravityX * 0.98) + (ax * 0.02);
    _gravityY = (_gravityY * 0.98) + (ay * 0.02);
    _gravityZ = (_gravityZ * 0.98) + (az * 0.02);
    _sampleCount++;

    if (_sampleCount > 10) {
      // Continuously recalculate Pitch & Roll from gravity vector
      pitch = atan2(-_gravityX, sqrt(_gravityY * _gravityY + _gravityZ * _gravityZ));
      roll = atan2(_gravityY, _gravityZ);
      isCalibrated = true;
    }
  }

  /// Transforms raw phone acceleration [ax, ay, az] into vehicle reference frame
  /// **with gravity removed**:
  /// Output: [longitudinalAccel, lateralAccel, verticalAccel]
  ///
  /// All three axes should read ~0 when the device is stationary regardless of
  /// phone orientation.
  List<double> transformToVehicleFrame(double ax, double ay, double az) {
    // Always update gravity estimate on every sample
    _updateGravityEstimate(ax, ay, az);

    // Subtract estimated gravity from raw readings
    final linX = ax - _gravityX;
    final linY = ay - _gravityY;
    final linZ = az - _gravityZ;

    // Apply 3D Euler Pitch & Roll rotation matrix on gravity-free linear accel
    final cosP = cos(pitch);
    final sinP = sin(pitch);
    final cosR = cos(roll);
    final sinR = sin(roll);

    // Vehicle Longitudinal (Forward acceleration)
    final double aLongitudinal = (linX * cosP) + (linZ * sinP);

    // Vehicle Lateral (Side acceleration)
    final double aLateral = (linY * cosR) - (linZ * sinR);

    // Vehicle Vertical (Up/Down acceleration)
    final double aVertical = (-linX * sinP) + (linY * sinR) + (linZ * cosP * cosR);

    return [aLongitudinal, aLateral, aVertical];
  }

  /// Non-Holonomic Constraint (NHC) filter
  /// Vehicles cannot slide sideways or fly upwards: enforces 1D forward motion kinematics
  List<double> applyNonHolonomicConstraints(List<double> vehicleAccel) {
    final aLong = vehicleAccel[0];

    // Suppress lateral & vertical noise (NHC)
    const aLatClamped = 0.0; // Sideways speed constrained to 0
    const aVertClamped = 0.0; // Vertical speed constrained to 0

    return [aLong, aLatClamped, aVertClamped];
  }
}
