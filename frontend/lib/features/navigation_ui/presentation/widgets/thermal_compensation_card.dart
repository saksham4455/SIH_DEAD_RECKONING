import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../models/navigation_state.dart';

class ThermalCompensationCard extends StatelessWidget {
  final ThermalStateModel thermalState;
  final double mapMatchConfidence;

  const ThermalCompensationCard({
    Key? key,
    required this.thermalState,
    required this.mapMatchConfidence,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.surfaceBorder),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('IMU TEMP / BIAS CORRECTION', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  '${thermalState.temperature}°C  (Bias: ${thermalState.biasCorrection})',
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text('ROAD ALIGNMENT', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  '${(mapMatchConfidence * 100).round()}% Match',
                  style: const TextStyle(color: AppColors.healthy, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
