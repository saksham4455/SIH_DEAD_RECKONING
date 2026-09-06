import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../navigation_engine/data/repositories/demo_navigation_repository.dart';
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

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final data = const DemoNavigationRepository().current;
    final navState = data.navigationState;
    final speedKmh = (navState.speed * 3.6).toStringAsFixed(1);
    final confidencePercent = (navState.confidence * 100).round();

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
              FusionModeBadge(fusionMode: navState.fusionMode),
              const SizedBox(height: 20),

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
                navigationState: navState,
                mapMatchConfidence: data.mapMatchConfidence,
              ),

              // 3. Navigation Telemetry Stats
              Row(
                children: [
                  TelemetryCard(
                    label: 'SPEED',
                    value: navState.speed.toStringAsFixed(1),
                    unit: 'm/s',
                    subtitle: '$speedKmh km/h',
                    accentColor: AppColors.cyan,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  TelemetryCard(
                    label: 'HEADING',
                    value: '${navState.heading.round()}°',
                    subtitle: 'True North Track',
                    accentColor: AppColors.blue,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  TelemetryCard(
                    label: 'POSITION FIX',
                    value: '${navState.latitude.toStringAsFixed(3)}°N',
                    unit: '${navState.longitude.toStringAsFixed(3)}°E',
                    subtitle: 'GNSS + EKF Fix',
                    accentColor: AppColors.gps,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  TelemetryCard(
                    label: 'MAP MATCH',
                    value: '${(data.mapMatchConfidence * 100).round()}%',
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
              SensorHealthBar(sensorHealth: data.sensorHealth),
              SatelliteBreakdown(satelliteBreakdown: data.satelliteBreakdown),
              NavicWeightIndicator(navicWeight: data.navicWeight),
              AiInferencePanel(inferenceStats: data.inferenceStats),
              ThermalCompensationCard(
                thermalState: data.thermalState,
                mapMatchConfidence: data.mapMatchConfidence,
              ),
              RoadAnomalyTicker(anomalyEvents: data.anomalyEvents),
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
              const SessionControls(),
              const SizedBox(height: 16),

              // 6. Navigation Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pushNamed(context, '/session');
                  },
                  icon: const Icon(Icons.play_arrow, color: AppColors.cyan),
                  label: const Text(
                    'START NAVIGATION SESSION',
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
}
