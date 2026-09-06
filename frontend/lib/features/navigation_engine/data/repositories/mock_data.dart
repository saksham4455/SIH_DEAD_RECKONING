import '../../domain/entities/navigation_state.dart';

final mockDashboardData = DashboardDataModel(
  navigationState: const NavigationStateModel(
    latitude: 28.6139,
    longitude: 77.2090,
    heading: 145.5,
    speed: 12.5,
    confidence: 0.95,
    fusionMode: FusionMode.gnssLocked,
  ),
  sensorHealth: const SensorHealthModel(
    accelerometer: true,
    gyroscope: true,
    magnetometer: true,
    gnss: true,
  ),
  satelliteBreakdown: const SatelliteBreakdownModel(
    navIC: SatelliteInfoModel(count: 6, signalStrength: 45.2),
    gps: SatelliteInfoModel(count: 8, signalStrength: 42.1),
    galileo: SatelliteInfoModel(count: 3, signalStrength: 30.5),
    glonass: SatelliteInfoModel(count: 4, signalStrength: 32.8),
  ),
  inferenceStats: const InferenceStatsModel(
    latencyMs: 32,
    modelVersion: 'v2.4.1-lite',
    confidence: 0.88,
    estimatedSpeed: 12.3,
  ),
  anomalyEvents: const [
    AnomalyEventModel(
        type: 'pothole', timestamp: 1693902000000, confidence: 0.92),
    AnomalyEventModel(
        type: 'speed_breaker', timestamp: 1693902150000, confidence: 0.98),
  ],
  thermalState: const ThermalStateModel(
    temperature: 38.5,
    biasCorrection: 0.002,
  ),
  navicWeight: 0.65,
  mapMatchConfidence: 0.94,
);
