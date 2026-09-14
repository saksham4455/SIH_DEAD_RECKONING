import 'package:flutter/material.dart';
import 'app_widget.dart';
import 'core/platform/maps/offline_tile_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Eagerly resolve the on-device tile cache directory so cached tiles
  // are available from the very first frame the map renders.
  await BundledOfflineTileProvider.initCache();
  runApp(const SihApp());
}
