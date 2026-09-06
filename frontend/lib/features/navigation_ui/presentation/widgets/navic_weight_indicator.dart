import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class NavicWeightIndicator extends StatelessWidget {
  final double navicWeight;

  const NavicWeightIndicator({Key? key, required this.navicWeight})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final weightPercent = (navicWeight * 100).round();
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
                'NavIC FUSION WEIGHT',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8),
              ),
              Text(
                '$weightPercent%',
                style: const TextStyle(
                    color: AppColors.navIC,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    fontFamily: 'monospace'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: navicWeight,
              minHeight: 8,
              backgroundColor: AppColors.surfaceBorder,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.navIC),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Primary position fix priority assigned to NavIC S-band & L5 signals.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
