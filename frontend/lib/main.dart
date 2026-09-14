import 'package:flutter/material.dart';
import 'app_widget.dart';
import 'core/platform/maps/offline_tile_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SihApp());

  // Warm the optional tile cache after the first frame so web startup is not
  // blocked by platform storage initialization.
  BundledOfflineTileProvider.initCache();
}
