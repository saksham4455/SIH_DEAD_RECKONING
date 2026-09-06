import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/repositories/demo_navigation_repository.dart';
import '../../../navigation_ui/presentation/widgets/sensor_health_bar.dart';
import '../../../navigation_ui/presentation/widgets/satellite_breakdown.dart';
import '../../../navigation_ui/presentation/widgets/ai_inference_panel.dart';

class DiagnosticsScreen extends StatelessWidget {
  const DiagnosticsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final data = const DemoNavigationRepository().current;
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        title: const Text(
          'ADVANCED DIAGNOSTICS',
          style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          SensorHealthBar(sensorHealth: data.sensorHealth),
          SatelliteBreakdown(satelliteBreakdown: data.satelliteBreakdown),
          AiInferencePanel(inferenceStats: data.inferenceStats),
        ],
      ),
    );
  }
}
