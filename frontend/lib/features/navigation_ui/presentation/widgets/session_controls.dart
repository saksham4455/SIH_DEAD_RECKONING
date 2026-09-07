import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../navigation_engine/domain/entities/navigation_state.dart';

class SessionControls extends StatelessWidget {
  final VoidCallback? onTunnelTest;
  final VoidCallback? onUrbanCanyon;
  final VoidCallback? onReplay;

  const SessionControls({
    Key? key,
    this.onTunnelTest,
    this.onUrbanCanyon,
    this.onReplay,
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
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildControlButton(
            context,
            'TUNNEL TEST',
            Icons.gps_off,
            AppColors.error,
            () {
              if (onTunnelTest != null) onTunnelTest!();
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🚨 GNSS Blackout Mode Activated (Pure INS Propagation)'),
                  backgroundColor: AppColors.error,
                  duration: Duration(seconds: 2),
                ),
              );
              Navigator.pushNamed(context, '/session', arguments: FusionMode.deadReckoning);
            },
          ),
          _buildControlButton(
            context,
            'URBAN CANYON',
            Icons.location_city,
            AppColors.warning,
            () {
              if (onUrbanCanyon != null) onUrbanCanyon!();
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🌆 Urban Canyon Mode Activated (High DOP / EKF Fusion)'),
                  backgroundColor: AppColors.warning,
                  duration: Duration(seconds: 2),
                ),
              );
              Navigator.pushNamed(context, '/session', arguments: FusionMode.gnssDegraded);
            },
          ),
          _buildControlButton(
            context,
            'REPLAY / DIAGS',
            Icons.replay,
            AppColors.cyan,
            () {
              if (onReplay != null) onReplay!();
              Navigator.pushNamed(context, '/diagnostics');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton(
    BuildContext context,
    String label,
    IconData icon,
    Color accentColor,
    VoidCallback onTap,
  ) {
    return Column(
      children: [
        IconButton(
          onPressed: onTap,
          icon: Icon(icon, color: accentColor),
          style: IconButton.styleFrom(
            backgroundColor: accentColor.withValues(alpha: 0.12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

