import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../models/navigation_state.dart';

class AiInferencePanel extends StatelessWidget {
  final InferenceStatsModel inferenceStats;

  const AiInferencePanel({Key? key, required this.inferenceStats}) : super(key: key);

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'EDGE AI SPEED ESTIMATOR & ODOMETRY',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: AppColors.cyan.withOpacity(0.15), borderRadius: BorderRadius.circular(4)),
                child: Text(
                  inferenceStats.modelVersion,
                  style: const TextStyle(color: AppColors.cyan, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('LATENCY', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Text('${inferenceStats.latencyMs} ms', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('EST. SPEED', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Text('${inferenceStats.estimatedSpeed} m/s', style: const TextStyle(color: AppColors.cyan, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('AI CONF', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Text('${(inferenceStats.confidence * 100).round()}%', style: const TextStyle(color: AppColors.healthy, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
