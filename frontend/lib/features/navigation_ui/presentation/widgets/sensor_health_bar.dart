import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../navigation_engine/domain/entities/navigation_state.dart';

class SensorHealthBar extends StatelessWidget {
  final SensorHealthModel sensorHealth;

  const SensorHealthBar({Key? key, required this.sensorHealth})
      : super(key: key);

  Widget _buildSensorPill(String name, bool isHealthy, {bool isUnsupported = false}) {
    final color = isUnsupported
        ? AppColors.textMuted
        : (isHealthy ? AppColors.healthy : AppColors.error);
    final statusText = isUnsupported ? 'N/A' : (isHealthy ? 'OK' : 'OFF');

    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 2),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text(
              name.toUpperCase(),
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              statusText,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'PHYSICAL HARDWARE SENSORS',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
              Text(
                sensorHealth.barometer ? 'BARO DETECTED' : 'BARO: NO SENSOR (GPS ALT)',
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildSensorPill('ACCEL', sensorHealth.accelerometer),
              const SizedBox(width: 4),
              _buildSensorPill('GYRO', sensorHealth.gyroscope),
              const SizedBox(width: 4),
              _buildSensorPill('MAG', sensorHealth.magnetometer),
              const SizedBox(width: 4),
              _buildSensorPill('GNSS', sensorHealth.gnss),
              const SizedBox(width: 4),
              _buildSensorPill('BARO', sensorHealth.barometer, isUnsupported: !sensorHealth.barometer),
            ],
          ),
        ],
      ),
    );
  }
}
