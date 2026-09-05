enum FusionMode {
  gnssLocked,
  gnssDegraded,
  deadReckoning,
  reacquiring,
}

extension FusionModeExtension on FusionMode {
  String get nameString {
    switch (this) {
      case FusionMode.gnssLocked:
        return 'GNSS_LOCKED';
      case FusionMode.gnssDegraded:
        return 'GNSS_DEGRADED';
      case FusionMode.deadReckoning:
        return 'DEAD_RECKONING';
      case FusionMode.reacquiring:
        return 'REACQUIRING';
    }
  }
}

class NavigationStateModel {
  final double latitude;
  final double longitude;
  final double heading;
  final double speed;
  final double confidence;
  final FusionMode fusionMode;

  const NavigationStateModel({
    required this.latitude,
    required this.longitude,
    required this.heading,
    required this.speed,
    required this.confidence,
    required this.fusionMode,
  });
}

class SensorHealthModel {
  final bool accelerometer;
  final bool gyroscope;
  final bool magnetometer;
  final bool gnss;

  const SensorHealthModel({
    required this.accelerometer,
    required this.gyroscope,
    required this.magnetometer,
    required this.gnss,
  });
}

class SatelliteInfoModel {
  final int count;
  final double signalStrength;

  const SatelliteInfoModel({
    required this.count,
    required this.signalStrength,
  });
}

class SatelliteBreakdownModel {
  final SatelliteInfoModel navIC;
  final SatelliteInfoModel gps;
  final SatelliteInfoModel galileo;
  final SatelliteInfoModel glonass;

  const SatelliteBreakdownModel({
    required this.navIC,
    required this.gps,
    required this.galileo,
    required this.glonass,
  });
}

class InferenceStatsModel {
  final int latencyMs;
  final String modelVersion;
  final double confidence;
  final double estimatedSpeed;

  const InferenceStatsModel({
    required this.latencyMs,
    required this.modelVersion,
    required this.confidence,
    required this.estimatedSpeed,
  });
}

class AnomalyEventModel {
  final String type;
  final int timestamp;
  final double confidence;

  const AnomalyEventModel({
    required this.type,
    required this.timestamp,
    required this.confidence,
  });
}

class ThermalStateModel {
  final double temperature;
  final double biasCorrection;

  const ThermalStateModel({
    required this.temperature,
    required this.biasCorrection,
  });
}

class DashboardDataModel {
  final NavigationStateModel navigationState;
  final SensorHealthModel sensorHealth;
  final SatelliteBreakdownModel satelliteBreakdown;
  final InferenceStatsModel inferenceStats;
  final List<AnomalyEventModel> anomalyEvents;
  final ThermalStateModel thermalState;
  final double navicWeight;
  final double mapMatchConfidence;

  const DashboardDataModel({
    required this.navigationState,
    required this.sensorHealth,
    required this.satelliteBreakdown,
    required this.inferenceStats,
    required this.anomalyEvents,
    required this.thermalState,
    required this.navicWeight,
    required this.mapMatchConfidence,
  });
}
