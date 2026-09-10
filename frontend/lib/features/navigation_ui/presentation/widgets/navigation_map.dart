import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/platform/maps/offline_tile_provider.dart';
import '../../../navigation_engine/domain/entities/navigation_state.dart';

class NavigationMap extends StatefulWidget {
  final NavigationStateModel navigationState;
  final double mapMatchConfidence;

  const NavigationMap({
    Key? key,
    required this.navigationState,
    required this.mapMatchConfidence,
  }) : super(key: key);

  @override
  State<NavigationMap> createState() => _NavigationMapState();
}

class _NavigationMapState extends State<NavigationMap> {
  final MapController _mapController = MapController();

  @override
  void didUpdateWidget(covariant NavigationMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.navigationState.latitude != widget.navigationState.latitude ||
        oldWidget.navigationState.longitude != widget.navigationState.longitude) {
      _mapController.move(
        LatLng(widget.navigationState.latitude, widget.navigationState.longitude),
        _mapController.camera.zoom,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentPos = LatLng(
      widget.navigationState.latitude,
      widget.navigationState.longitude,
    );

    return Container(
      height: 240,
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cyan.withValues(alpha: 0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.cyan.withValues(alpha: 0.1),
            blurRadius: 10,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(15),
        child: Stack(
          children: [
            // 0. Tactical Offline Vector Grid & Map Canvas (Renders 100% offline without internet)
            Positioned.fill(
              child: CustomPaint(
                painter: TacticalOfflineGridPainter(
                  heading: widget.navigationState.heading,
                ),
              ),
            ),

            // 1. Real Offline & Online Map Surface (FlutterMap)
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: currentPos,
                initialZoom: 15.0,
                maxZoom: 18.0,
                minZoom: 10.0,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}.png?api_key=9ca55c4e-7cb5-45b9-9da3-10421c141cbe',
                  userAgentPackageName: 'SIH2026-DeadReckoning',
                  tileProvider: BundledOfflineTileProvider(),
                  minNativeZoom: 11,
                  maxNativeZoom: 16,
                  minZoom: 10.0,
                  maxZoom: 18.0,
                  errorTileCallback: (tile, error, stackTrace) {
                    // Suppress network tile errors when device has no internet access
                  },
                  tileBuilder: (context, tileWidget, tile) {
                    return Container(
                      color: Colors.transparent,
                      child: tileWidget,
                    );
                  },
                ),
                // Position Confidence Halo Ring
                CircleLayer(
                  circles: [
                    CircleMarker(
                      point: currentPos,
                      radius: 35,
                      useRadiusInMeter: false,
                      color: AppColors.cyan.withValues(alpha: 0.15),
                      borderColor: AppColors.cyan.withValues(alpha: 0.5),
                      borderStrokeWidth: 1.5,
                    ),
                  ],
                ),
                // Live Vehicle Heading Arrow Layer
                MarkerLayer(
                  markers: [
                    Marker(
                      point: currentPos,
                      width: 54,
                      height: 54,
                      child: Transform.rotate(
                        angle: widget.navigationState.heading * pi / 180,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.cyan.withValues(alpha: 0.2),
                                border: Border.all(color: AppColors.cyan, width: 1.5),
                              ),
                            ),
                            const Icon(
                              Icons.navigation,
                              color: AppColors.cyan,
                              size: 32,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),

            // Top Left Tactical Surface Badge
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.surface.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.cyan.withValues(alpha: 0.4)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, size: 13, color: AppColors.cyan),
                    SizedBox(width: 5),
                    const Text(
                      'STADIA MAPS // PURE INS',
                      style: TextStyle(
                        color: AppColors.cyan,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Coordinate Banner
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.dark.withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.surfaceBorder),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${widget.navigationState.latitude.toStringAsFixed(4)}° N, ${widget.navigationState.longitude.toStringAsFixed(4)}° E',
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'MAP MATCH: ${(widget.mapMatchConfidence * 100).round()}%',
                      style: const TextStyle(
                        color: AppColors.healthy,
                        fontSize: 10,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom painter rendering high-tech tactical grid lines & road vector corridors
/// so the map canvas remains fully functional and visual even with 0 internet connection.
class TacticalOfflineGridPainter extends CustomPainter {
  final double heading;

  TacticalOfflineGridPainter({required this.heading});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paintGrid = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 1.0;

    final paintCorridor = Paint()
      ..color = AppColors.cyan.withValues(alpha: 0.25)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    final paintRing = Paint()
      ..color = AppColors.cyan.withValues(alpha: 0.12)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    // Draw background grid lines
    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paintGrid);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paintGrid);
    }

    // Concentric range rings
    canvas.drawCircle(center, 50, paintRing);
    canvas.drawCircle(center, 100, paintRing);

    // Draw vector road corridor path (tactical grid representation)
    final path = Path();
    path.moveTo(center.dx - 120, center.dy + 80);
    path.lineTo(center.dx - 40, center.dy + 20);
    path.lineTo(center.dx, center.dy);
    path.lineTo(center.dx + 50, center.dy - 60);
    path.lineTo(center.dx + 130, center.dy - 100);
    canvas.drawPath(path, paintCorridor);
  }

  @override
  bool shouldRepaint(covariant TacticalOfflineGridPainter oldDelegate) {
    return oldDelegate.heading != heading;
  }
}

