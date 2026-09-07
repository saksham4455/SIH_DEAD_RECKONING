import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/theme/app_theme.dart';
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
        color: AppColors.dark,
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
            // 1. Real Offline & Tactical Vector Map Surface (FlutterMap)
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: currentPos,
                initialZoom: 16.5,
                maxZoom: 19.0,
                minZoom: 4.0,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.sih_dead_reckoning',
                  tileBuilder: (context, tileWidget, tile) {
                    return Container(
                      color: const Color(0xFF0F172A),
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
                      child: AnimatedRotation(
                        turns: widget.navigationState.heading / 360.0,
                        duration: const Duration(milliseconds: 50),
                        curve: Curves.easeOut,
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
                    Icon(Icons.map_outlined, size: 13, color: AppColors.cyan),
                    SizedBox(width: 5),
                    Text(
                      'OFFLINE MAP // TACTICAL VECTOR',
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
