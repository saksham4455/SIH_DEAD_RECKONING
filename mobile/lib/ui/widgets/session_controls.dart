import 'package:flutter/material.dart';
import '../../app/theme.dart';

class SessionControls extends StatelessWidget {
  const SessionControls({Key? key}) : super(key: key);

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
          _buildControlButton(context, 'TUNNEL TEST', Icons.nature_people),
          _buildControlButton(context, 'URBAN CANYON', Icons.location_city),
          _buildControlButton(context, 'REPLAY', Icons.replay),
        ],
      ),
    );
  }

  Widget _buildControlButton(BuildContext context, String label, IconData icon) {
    return Column(
      children: [
        IconButton(
          onPressed: () {},
          icon: Icon(icon, color: AppColors.cyan),
          style: IconButton.styleFrom(
            backgroundColor: AppColors.cyan.withOpacity(0.1),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
