import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../models/mock_data.dart';
import '../widgets/navigation_map.dart';
import '../widgets/telemetry_card.dart';
import '../widgets/fusion_mode_badge.dart';

class NavigationScreen extends StatelessWidget {
  const NavigationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final data = mockDashboardData;
    final navState = data.navigationState;

    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'LIVE NAVIGATION SESSION',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            children: [
              FusionModeBadge(fusionMode: navState.fusionMode),
              const SizedBox(height: 16),
              Expanded(
                child: NavigationMap(
                  navigationState: navState,
                  mapMatchConfidence: data.mapMatchConfidence,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  TelemetryCard(
                    label: 'LIVE SPEED',
                    value: '${(navState.speed * 3.6).toStringAsFixed(1)}',
                    unit: 'km/h',
                    accentColor: AppColors.cyan,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  TelemetryCard(
                    label: 'HEADING',
                    value: '${navState.heading.round()}°',
                    unit: 'TRUE N',
                    accentColor: AppColors.blue,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error.withOpacity(0.15),
                    side: const BorderSide(color: AppColors.error, width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text(
                    'STOP NAVIGATION SESSION',
                    style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
