import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../models/mock_data.dart';
import '../widgets/sensor_health_bar.dart';
import '../widgets/satellite_breakdown.dart';
import '../widgets/ai_inference_panel.dart';

class DiagnosticsScreen extends StatelessWidget {
  const DiagnosticsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final data = mockDashboardData;
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        title: const Text(
          'ADVANCED DIAGNOSTICS',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
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
