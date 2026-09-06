import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../models/navigation_state.dart';

class SatelliteBreakdown extends StatelessWidget {
  final SatelliteBreakdownModel satelliteBreakdown;

  const SatelliteBreakdown({Key? key, required this.satelliteBreakdown}) : super(key: key);

  Widget _buildConstellationRow(String name, SatelliteInfoModel info, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text(name, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          Text(
            '${info.count} Sats • ${info.signalStrength} dBHz',
            style: const TextStyle(color: AppColors.textSecondary, fontFamily: 'monospace', fontSize: 12),
          ),
        ],
      ),
    );
  }

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
          const Text(
            'MULTI-GNSS CONSTELLATION RECEPTION',
            style: TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
          ),
          const SizedBox(height: 8),
          _buildConstellationRow('NavIC (IRNSS)', satelliteBreakdown.navIC, AppColors.navIC),
          _buildConstellationRow('GPS (USA)', satelliteBreakdown.gps, AppColors.gps),
          _buildConstellationRow('Galileo (EU)', satelliteBreakdown.galileo, AppColors.galileo),
          _buildConstellationRow('GLONASS (RU)', satelliteBreakdown.glonass, AppColors.glonass),
        ],
      ),
    );
  }
}
