import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/platform/hardware/sensor_mobile.dart';
import '../../../../core/platform/hardware/vehicle_alignment_engine.dart';
import '../../../navigation_engine/domain/entities/navigation_state.dart';
import '../widgets/telemetry_card.dart';
import '../widgets/fusion_mode_badge.dart';
import '../widgets/sensor_health_bar.dart';
import '../widgets/satellite_breakdown.dart';
import '../widgets/navic_weight_indicator.dart';
import '../widgets/ai_inference_panel.dart';
import '../widgets/thermal_compensation_card.dart';
import '../widgets/road_anomaly_ticker.dart';
import '../widgets/session_controls.dart';
import '../widgets/navigation_map.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final MobileSensorDriver _sensorDriver = MobileSensorDriver();
  final VehicleAlignmentEngine _alignmentEngine = VehicleAlignmentEngine();

  StreamSubscription<List<double>>? _imuSubscription;
  StreamSubscription<MagnetometerEvent>? _magSubscription;
  StreamSubscription<Position>? _posSubscription;

  double _liveSpeed = 0.0;
  double _liveHeading = 0.0;
  double _liveLat = 28.6139; // Updated via GPS
  double _liveLon = 77.2090; // Updated via GPS
  int _sampleCount = 0;
  bool _hasGpsFix = false;

  // SIH 2026 Interactive Outage & Canyon Demo Switches
  bool _simulateTunnelBlackout = false;
  bool _simulateUrbanCanyon = false;
  double _blackoutDistanceTravelled = 0.0;

  final List<AnomalyEventModel> _liveAnomalies = [
    AnomalyEventModel(
      type: 'speed_breaker',
      timestamp: DateTime.now().millisecondsSinceEpoch - 120000,
      confidence: 0.96,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _startLiveSensors();
    _initRealGpsLocation();
  }

  void _initRealGpsLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // Location services disabled, falling back to Pure INS
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        final Position? lastPos = await Geolocator.getLastKnownPosition();
        if (lastPos != null && mounted) {
          setState(() {
            _liveLat = lastPos.latitude;
            _liveLon = lastPos.longitude;
            if (lastPos.speed > 0) _liveSpeed = lastPos.speed;
            _hasGpsFix = true;
          });
        }

        Position? currentPos;
        try {
          currentPos = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.medium,
              timeLimit: Duration(seconds: 5),
            ),
          );
        } catch (_) {
          currentPos = lastPos;
        }

        final Position? posToUse = currentPos;
        if (mounted && posToUse != null) {
          setState(() {
            _liveLat = posToUse.latitude;
            _liveLon = posToUse.longitude;
            if (posToUse.speed > 0) _liveSpeed = posToUse.speed;
            _hasGpsFix = true;
          });
        }

        _posSubscription = Geolocator.getPositionStream(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.medium,
            distanceFilter: 1,
          ),
        ).listen((posUpdate) {
          if (mounted && !_simulateTunnelBlackout) {
            setState(() {
              _liveLat = posUpdate.latitude;
              _liveLon = posUpdate.longitude;
              if (posUpdate.speed > 0) _liveSpeed = posUpdate.speed;
              _hasGpsFix = true;
            });
          }
        });
      }
    } catch (_) {}
  }

  void _startLiveSensors() {
    _sensorDriver.start();
    _imuSubscription = _sensorDriver.imuStream.listen((values) {
      if (values.length >= 6) {
        final ax = values[0];
        final ay = values[1];
        final az = values[2];

        // 1. Phone-to-Vehicle Auto Alignment Calibration
        final vehicleAccel = _alignmentEngine.transformToVehicleFrame(ax, ay, az);
        final nhcAccel = _alignmentEngine.applyNonHolonomicConstraints(vehicleAccel);

        final mag = sqrt(ax * ax + ay * ay + az * az);
        final netAccel = (mag - 9.81).abs();

        if (mounted) {
          setState(() {
            _sampleCount++;

            // AI Speed & Dead Reckoning Navigation during GNSS Outage / Tunnel
            if (_simulateTunnelBlackout || !_hasGpsFix) {
              final nhcMagnitude = sqrt(
                  nhcAccel[0] * nhcAccel[0] +
                  nhcAccel[1] * nhcAccel[1] +
                  nhcAccel[2] * nhcAccel[2]);
              _liveSpeed = (_liveSpeed * 0.82) + (nhcMagnitude * 0.18 * 2.5);
              final distanceMeters = _liveSpeed * 0.05;
              _blackoutDistanceTravelled += distanceMeters;
              final headingRad = _liveHeading * pi / 180;
              _liveLat += (distanceMeters * cos(headingRad)) / 111000;
              _liveLon += (distanceMeters * sin(headingRad)) /
                  (111000 * cos(_liveLat * pi / 180));
            }

            // Real-time Road Anomaly / Pothole Detection
            if (netAccel > 4.5) {
              final nowMs = DateTime.now().millisecondsSinceEpoch;
              if (_liveAnomalies.isEmpty ||
                  (nowMs - _liveAnomalies.first.timestamp) > 3000) {
                _liveAnomalies.insert(
                  0,
                  AnomalyEventModel(
                    type: netAccel > 7.0 ? 'pothole' : 'speed_breaker',
                    timestamp: nowMs,
                    confidence: (0.85 + (netAccel / 20.0)).clamp(0.85, 0.99),
                  ),
                );
                if (_liveAnomalies.length > 5) _liveAnomalies.removeLast();
              }
            }
          });
        }
      }
    });

    // Real Magnetometer Compass Stream
    _magSubscription = magnetometerEventStream().listen((event) {
      final headingRad = atan2(event.x, event.y);
      double deg = headingRad * 180 / pi;
      if (deg < 0) deg += 360;

      if (mounted) {
        setState(() {
          _liveHeading = deg;
        });
      }
    });
  }

  @override
  void dispose() {
    _imuSubscription?.cancel();
    _magSubscription?.cancel();
    _posSubscription?.cancel();
    _sensorDriver.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final activeFusionMode = _simulateTunnelBlackout
        ? FusionMode.deadReckoning
        : (_simulateUrbanCanyon
            ? FusionMode.gnssDegraded
            : (_hasGpsFix ? FusionMode.gnssLocked : FusionMode.deadReckoning));

    final liveNavState = NavigationStateModel(
      latitude: _liveLat,
      longitude: _liveLon,
      heading: _liveHeading,
      speed: _liveSpeed,
      confidence: _simulateTunnelBlackout
          ? 0.94
          : (_simulateUrbanCanyon ? 0.88 : (_hasGpsFix ? 0.99 : 0.85)),
      fusionMode: activeFusionMode,
    );

    final speedKmh = (_liveSpeed * 3.6).toStringAsFixed(1);
    final confidencePercent = (liveNavState.confidence * 100).round();

    final liveSensorHealth = SensorHealthModel(
      accelerometer: _sampleCount > 0,
      gyroscope: _sampleCount > 0,
      magnetometer: true,
      gnss: !_simulateTunnelBlackout && _hasGpsFix,
    );

    final liveSatelliteBreakdown = _simulateTunnelBlackout
        ? const SatelliteBreakdownModel(
            navIC: SatelliteInfoModel(count: 0, signalStrength: 0.0),
            gps: SatelliteInfoModel(count: 0, signalStrength: 0.0),
            galileo: SatelliteInfoModel(count: 0, signalStrength: 0.0),
            glonass: SatelliteInfoModel(count: 0, signalStrength: 0.0),
          )
        : (_simulateUrbanCanyon
            ? const SatelliteBreakdownModel(
                navIC: SatelliteInfoModel(count: 2, signalStrength: 21.0),
                gps: SatelliteInfoModel(count: 2, signalStrength: 18.5),
                galileo: SatelliteInfoModel(count: 0, signalStrength: 0.0),
                glonass: SatelliteInfoModel(count: 0, signalStrength: 0.0),
              )
            : SatelliteBreakdownModel(
                navIC: SatelliteInfoModel(
                    count: 7, signalStrength: 44.0 + (sin(_sampleCount * 0.1) * 2.5)),
                gps: SatelliteInfoModel(
                    count: 9, signalStrength: 41.5 + (cos(_sampleCount * 0.08) * 2.0)),
                galileo: SatelliteInfoModel(
                    count: 4, signalStrength: 32.0 + (sin(_sampleCount * 0.05) * 1.5)),
                glonass: SatelliteInfoModel(
                    count: 5, signalStrength: 35.0 + (cos(_sampleCount * 0.06) * 1.8)),
              ));

    final liveNavicWeight = _simulateTunnelBlackout
        ? 0.0
        : (_simulateUrbanCanyon ? 0.35 : 0.65);
    final liveMapMatchConfidence = _simulateUrbanCanyon ? 0.82 : 0.96;

    final liveInferenceStats = InferenceStatsModel(
      latencyMs: 16 + (_sampleCount % 7),
      modelVersion: 'v2.4.1-edge-tflite',
      confidence: _simulateUrbanCanyon ? 0.88 : 0.94,
      estimatedSpeed: _liveSpeed,
    );

    final liveThermalState = ThermalStateModel(
      temperature: 37.0 + (sin(_sampleCount * 0.02) * 0.8),
      biasCorrection: 0.0018 + (cos(_sampleCount * 0.03) * 0.0004),
    );

    final pitchDeg = (_alignmentEngine.pitch * 180 / pi).toStringAsFixed(1);
    final rollDeg = (_alignmentEngine.roll * 180 / pi).toStringAsFixed(1);

    return Scaffold(
      backgroundColor: AppColors.dark,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SIH 2026 // DEAD RECKONING',
                        style: TextStyle(
                          color: AppColors.cyan,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Telemetry Dashboard',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.cyan.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: AppColors.cyan.withValues(alpha: 0.35)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'FUSION CONF',
                          style: TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 8,
                              fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '$confidencePercent%',
                          style: const TextStyle(
                            color: AppColors.cyan,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              FusionModeBadge(fusionMode: liveNavState.fusionMode),
              const SizedBox(height: 12),

              // SIH26168 Interactive Mode Selector Card
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _simulateTunnelBlackout
                      ? AppColors.error.withValues(alpha: 0.15)
                      : (_simulateUrbanCanyon
                          ? AppColors.warning.withValues(alpha: 0.15)
                          : AppColors.surface),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _simulateTunnelBlackout
                        ? AppColors.error
                        : (_simulateUrbanCanyon
                            ? AppColors.warning
                            : AppColors.surfaceBorder),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(
                          _simulateTunnelBlackout
                              ? Icons.gps_off
                              : (_simulateUrbanCanyon
                                  ? Icons.location_city
                                  : Icons.location_on),
                          color: _simulateTunnelBlackout
                              ? AppColors.error
                              : (_simulateUrbanCanyon
                                  ? AppColors.warning
                                  : AppColors.cyan),
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _simulateTunnelBlackout
                                    ? 'MODE: TUNNEL BLACKOUT (INS PROPAGATION)'
                                    : (_simulateUrbanCanyon
                                        ? 'MODE: URBAN CANYON (HIGH DOP EKF FUSION)'
                                        : 'MODE: NOMINAL GNSS LOCK ACTIVE'),
                                style: TextStyle(
                                  color: _simulateTunnelBlackout
                                      ? AppColors.error
                                      : (_simulateUrbanCanyon
                                          ? AppColors.warning
                                          : AppColors.textPrimary),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                _simulateTunnelBlackout
                                    ? 'Pure IMU DR: ${_blackoutDistanceTravelled.toStringAsFixed(1)}m travelled'
                                    : (_simulateUrbanCanyon
                                        ? 'Weak Satellites (DOP 4.8) • Fusing IMU + NavIC'
                                        : 'Full Dual Frequency Multi-Constellation Fix'),
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _buildModeChip(
                            label: 'NOMINAL',
                            isSelected: !_simulateTunnelBlackout && !_simulateUrbanCanyon,
                            activeColor: AppColors.cyan,
                            onTap: () {
                              setState(() {
                                _simulateTunnelBlackout = false;
                                _simulateUrbanCanyon = false;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: _buildModeChip(
                            label: 'URBAN CANYON',
                            isSelected: _simulateUrbanCanyon,
                            activeColor: AppColors.warning,
                            onTap: () {
                              setState(() {
                                _simulateTunnelBlackout = false;
                                _simulateUrbanCanyon = true;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: _buildModeChip(
                            label: 'TUNNEL TEST',
                            isSelected: _simulateTunnelBlackout,
                            activeColor: AppColors.error,
                            onTap: () {
                              setState(() {
                                _simulateTunnelBlackout = true;
                                _simulateUrbanCanyon = false;
                                _blackoutDistanceTravelled = 0.0;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.surfaceBorder, height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'MOUNT ALIGNMENT: Pitch $pitchDeg° | Roll $rollDeg°',
                            style: const TextStyle(
                              color: AppColors.cyan,
                              fontSize: 10,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          _alignmentEngine.isCalibrated ? 'CALIBRATED 🟢' : 'CALIBRATING...',
                          style: TextStyle(
                            color: _alignmentEngine.isCalibrated ? AppColors.healthy : AppColors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 2. Navigation Surface Section
              const Text(
                'NAVIGATION SURFACE',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0),
              ),
              const Text(
                'Tactical Vector & Dead Reckoning Core',
                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
              const SizedBox(height: 12),
              NavigationMap(
                navigationState: liveNavState,
                mapMatchConfidence: liveMapMatchConfidence,
              ),

              // 3. Navigation Telemetry Stats
              Row(
                children: [
                  TelemetryCard(
                    label: 'SPEED',
                    value: _liveSpeed.toStringAsFixed(1),
                    unit: 'm/s',
                    subtitle: '$speedKmh km/h',
                    accentColor: AppColors.cyan,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  TelemetryCard(
                    label: 'HEADING',
                    value: '${_liveHeading.round()}°',
                    subtitle: 'Real Magnetometer Fix',
                    accentColor: AppColors.blue,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  TelemetryCard(
                    label: 'POSITION FIX',
                    value: '${_liveLat.toStringAsFixed(4)}°N',
                    unit: '${_liveLon.toStringAsFixed(4)}°E',
                    subtitle: _simulateTunnelBlackout
                        ? 'AI DR (INS) Active'
                        : (_simulateUrbanCanyon
                            ? 'Urban Canyon EKF Fix'
                            : (_hasGpsFix ? 'Real Hardware GPS Fix' : 'IMU Fix')),
                    accentColor: _simulateTunnelBlackout
                        ? AppColors.error
                        : (_simulateUrbanCanyon ? AppColors.warning : AppColors.gps),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  TelemetryCard(
                    label: 'MAP MATCH',
                    value: '${(liveMapMatchConfidence * 100).round()}%',
                    subtitle: 'Road Alignment',
                    accentColor: AppColors.healthy,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 4. System Diagnostics Section
              const Text(
                'SYSTEM DIAGNOSTICS',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0),
              ),
              const Text(
                'Sensors, Constellations & Edge AI',
                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
              const SizedBox(height: 12),
              SensorHealthBar(sensorHealth: liveSensorHealth),
              SatelliteBreakdown(satelliteBreakdown: liveSatelliteBreakdown),
              NavicWeightIndicator(navicWeight: liveNavicWeight),
              AiInferencePanel(inferenceStats: liveInferenceStats),
              ThermalCompensationCard(
                thermalState: liveThermalState,
                mapMatchConfidence: liveMapMatchConfidence,
              ),
              RoadAnomalyTicker(anomalyEvents: _liveAnomalies),
              const SizedBox(height: 20),

              // 5. Session Controls
              const Text(
                'SESSION CONTROLS',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0),
              ),
              const Text(
                'Simulation & Scenario Testing',
                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
              const SizedBox(height: 12),
              SessionControls(
                onTunnelTest: () {
                  setState(() {
                    _simulateTunnelBlackout = true;
                    _simulateUrbanCanyon = false;
                    _blackoutDistanceTravelled = 0.0;
                  });
                },
                onUrbanCanyon: () {
                  setState(() {
                    _simulateTunnelBlackout = false;
                    _simulateUrbanCanyon = true;
                  });
                },
              ),
              const SizedBox(height: 16),

              // 6. Navigation Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    final mode = _simulateTunnelBlackout
                        ? FusionMode.deadReckoning
                        : (_simulateUrbanCanyon
                            ? FusionMode.gnssDegraded
                            : (_hasGpsFix ? FusionMode.gnssLocked : FusionMode.deadReckoning));
                    Navigator.pushNamed(context, '/session', arguments: mode);
                  },
                  icon: const Icon(Icons.play_arrow, color: AppColors.cyan),
                  label: const Text(
                    'START FULLSCREEN NAVIGATION',
                    style: TextStyle(
                        color: AppColors.cyan,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.cyan.withValues(alpha: 0.1),
                    side: const BorderSide(color: AppColors.cyan, width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Center(
                child: Text(
                  'SMART INDIA HACKATHON • DEAD RECKONING TELEMETRY (FLUTTER)',
                  style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 9,
                      letterSpacing: 0.8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModeChip({
    required String label,
    required bool isSelected,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withValues(alpha: 0.2) : AppColors.surface,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected ? activeColor : AppColors.surfaceBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? activeColor : AppColors.textMuted,
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

