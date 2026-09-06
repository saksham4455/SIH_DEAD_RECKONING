import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../navigation_engine/domain/entities/navigation_state.dart';

class FusionModeBadge extends StatelessWidget {
  final FusionMode fusionMode;

  const FusionModeBadge({Key? key, required this.fusionMode}) : super(key: key);

  Color _getModeColor() {
    switch (fusionMode) {
      case FusionMode.gnssLocked:
        return AppColors.gnssLocked;
      case FusionMode.gnssDegraded:
        return AppColors.gnssDegraded;
      case FusionMode.deadReckoning:
        return AppColors.deadReckoning;
      case FusionMode.reacquiring:
        return AppColors.reacquiring;
    }
  }

  String _getModeText() {
    switch (fusionMode) {
      case FusionMode.gnssLocked:
        return 'GNSS LOCKED • NAVIC+GPS FIX';
      case FusionMode.gnssDegraded:
        return 'GNSS DEGRADED • EKF FUSION';
      case FusionMode.deadReckoning:
        return 'DEAD RECKONING • INS PROPAGATION';
      case FusionMode.reacquiring:
        return 'REACQUIRING GNSS SIGNAL';
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getModeColor();
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.4), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.6),
                  blurRadius: 6,
                  spreadRadius: 1,
                )
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _getModeText(),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}
