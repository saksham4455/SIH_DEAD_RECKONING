import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../models/navigation_state.dart';

class NavigationMap extends StatelessWidget {
  final NavigationStateModel navigationState;
  final double mapMatchConfidence;

  const NavigationMap({
    Key? key,
    required this.navigationState,
    required this.mapMatchConfidence,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.dark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceBorder, width: 1.5),
      ),
      child: Stack(
        children: [
          // Grid lines simulation
          Positioned.fill(
            child: CustomPaint(
              painter: GridPainter(),
            ),
          ),
          // Vehicle indicator in center
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Transform.rotate(
                  angle: (navigationState.heading * 3.14159 / 180),
                  child: const Icon(
                    Icons.navigation,
                    color: AppColors.cyan,
                    size: 44,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.surface.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.cyan.withOpacity(0.4)),
                  ),
                  child: Text(
                    '${navigationState.latitude.toStringAsFixed(4)}° N, ${navigationState.longitude.toStringAsFixed(4)}° E',
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Top Left Overlay: Tactical Surface Badge
          Positioned(
            top: 12,
            left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.surface.withOpacity(0.9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Row(
                children: [
                  Icon(Icons.map, size: 12, color: AppColors.cyan),
                  SizedBox(width: 4),
                  Text('TACTICAL VECTOR', style: TextStyle(color: AppColors.cyan, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.surfaceBorder.withOpacity(0.3)
      ..strokeWidth = 1;

    for (double i = 0; i < size.width; i += 20) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += 20) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
