import 'dart:async';
import 'dart:io';

import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:path_provider/path_provider.dart';

/// Offline-First TileProvider with automatic network tile caching.
///
/// Tile resolution priority chain:
///   1. **Pre-bundled asset tiles** — shipped inside the APK, zero latency, zero network.
///   2. **Disk-cached tiles** — previously fetched from OSM and persisted on device.
///   3. **Live network fetch** — downloads from OpenStreetMap, auto-saves to disk cache.
///   4. **Transparent fallback** — when fully offline and tile was never cached before.
///
/// This ensures that any map region your teammate views while online will
/// work perfectly offline afterwards, regardless of their physical location.
class BundledOfflineTileProvider extends TileProvider {
  // ---------------------------------------------------------------------------
  // Cache directory management (lazy, one-time init)
  // ---------------------------------------------------------------------------
  static String? _cacheDirPath;
  static bool _cacheInitAttempted = false;

  /// Resolves the on-device cache directory. Safe to call multiple times;
  /// only does real I/O once. Called from `main()` for fastest readiness,
  /// but also triggered lazily from the constructor as a safety net.
  static Future<void> initCache() async {
    if (_cacheDirPath != null || _cacheInitAttempted) return;
    _cacheInitAttempted = true;
    try {
      final dir = await getApplicationSupportDirectory();
      final cacheDir = Directory('${dir.path}/osm_tile_cache');
      await cacheDir.create(recursive: true);
      _cacheDirPath = cacheDir.path;
      debugPrint('[TileCache] Initialized at: ${cacheDir.path}');
    } catch (e) {
      debugPrint('[TileCache] Init failed (non-fatal): $e');
    }
  }

  BundledOfflineTileProvider() {
    // Safety net: kick off async init if main() didn't call it yet.
    if (_cacheDirPath == null && !_cacheInitAttempted) {
      initCache();
    }
  }

  // ---------------------------------------------------------------------------
  // Pre-bundled tile keys (shipped inside the APK as PNG assets)
  // ---------------------------------------------------------------------------
  static const Set<String> _bundledTiles = {
    '11/1462/853',
    '11/1462/854',
    '11/1463/853',
    '11/1463/854',
    '12/2924/1707',
    '12/2924/1708',
    '12/2925/1707',
    '12/2925/1708',
    '12/2926/1707',
    '12/2926/1708',
    '13/5848/3414',
    '13/5848/3415',
    '13/5848/3416',
    '13/5849/3414',
    '13/5849/3415',
    '13/5849/3416',
    '13/5850/3414',
    '13/5850/3415',
    '13/5850/3416',
    '13/5851/3414',
    '13/5851/3415',
    '13/5851/3416',
    '13/5852/3414',
    '13/5852/3415',
    '13/5852/3416',
    '13/5853/3414',
    '13/5853/3415',
    '13/5853/3416',
    '14/11697/6828',
    '14/11697/6829',
    '14/11697/6830',
    '14/11697/6831',
    '14/11697/6832',
    '14/11697/6833',
    '14/11698/6828',
    '14/11698/6829',
    '14/11698/6830',
    '14/11698/6831',
    '14/11698/6832',
    '14/11698/6833',
    '14/11699/6828',
    '14/11699/6829',
    '14/11699/6830',
    '14/11699/6831',
    '14/11699/6832',
    '14/11699/6833',
    '14/11700/6828',
    '14/11700/6829',
    '14/11700/6830',
    '14/11700/6831',
    '14/11700/6832',
    '14/11700/6833',
    '14/11701/6828',
    '14/11701/6829',
    '14/11701/6830',
    '14/11701/6831',
    '14/11701/6832',
    '14/11701/6833',
    '14/11702/6828',
    '14/11702/6829',
    '14/11702/6830',
    '14/11702/6831',
    '14/11702/6832',
    '14/11702/6833',
    '14/11703/6828',
    '14/11703/6829',
    '14/11703/6830',
    '14/11703/6831',
    '14/11703/6832',
    '14/11703/6833',
    '14/11704/6828',
    '14/11704/6829',
    '14/11704/6830',
    '14/11704/6831',
    '14/11704/6832',
    '14/11704/6833',
    '14/11705/6828',
    '14/11705/6829',
    '14/11705/6830',
    '14/11705/6831',
    '14/11705/6832',
    '14/11705/6833',
    '14/11706/6828',
    '14/11706/6829',
    '14/11706/6830',
    '14/11706/6831',
    '14/11706/6832',
    '14/11706/6833',
    '14/11707/6828',
    '14/11707/6829',
    '14/11707/6830',
    '14/11707/6831',
    '14/11707/6832',
    '14/11707/6833',
    '15/23396/13659',
    '15/23396/13660',
    '15/23396/13661',
    '15/23396/13662',
    '15/23396/13663',
    '15/23397/13659',
    '15/23397/13660',
    '15/23397/13661',
    '15/23397/13662',
    '15/23397/13663',
    '15/23398/13659',
    '15/23398/13660',
    '15/23398/13661',
    '15/23398/13662',
    '15/23398/13663',
    '15/23399/13659',
    '15/23399/13660',
    '15/23399/13661',
    '15/23399/13662',
    '15/23399/13663',
    '15/23400/13659',
    '15/23400/13660',
    '15/23400/13661',
    '15/23400/13662',
    '15/23400/13663',
    '15/23410/13662',
    '15/23410/13663',
    '15/23410/13664',
    '15/23411/13662',
    '15/23411/13663',
    '15/23411/13664',
    '15/23412/13662',
    '15/23412/13663',
    '15/23412/13664',
    '16/46795/27320',
    '16/46795/27321',
    '16/46795/27322',
    '16/46795/27323',
    '16/46795/27324',
    '16/46796/27320',
    '16/46796/27321',
    '16/46796/27322',
    '16/46796/27323',
    '16/46796/27324',
    '16/46797/27320',
    '16/46797/27321',
    '16/46797/27322',
    '16/46797/27323',
    '16/46797/27324',
    '16/46798/27320',
    '16/46798/27321',
    '16/46798/27322',
    '16/46798/27323',
    '16/46798/27324',
    '16/46799/27320',
    '16/46799/27321',
    '16/46799/27322',
    '16/46799/27323',
    '16/46799/27324',
    '16/46822/27326',
    '16/46822/27327',
    '16/46822/27328',
    '16/46823/27326',
    '16/46823/27327',
    '16/46823/27328',
    '16/46824/27326',
    '16/46824/27327',
    '16/46824/27328',
  };

  // ---------------------------------------------------------------------------
  // Core tile resolution — called by FlutterMap for every visible tile
  // ---------------------------------------------------------------------------
  @override
  ImageProvider getImage(TileCoordinates coordinates, TileLayer options) {
    final key =
        '${coordinates.z.toInt()}/${coordinates.x.toInt()}/${coordinates.y.toInt()}';

    // ── Tier 1: Pre-bundled APK asset (zero latency, zero network) ──
    if (_bundledTiles.contains(key)) {
      return AssetImage('assets/maps/tiles/$key.png');
    }

    // ── Tier 2: Disk cache hit (synchronous file check) ──
    if (_cacheDirPath != null) {
      final cacheFile = File('$_cacheDirPath/$key.png');
      if (cacheFile.existsSync()) {
        return FileImage(cacheFile);
      }
    }

    // ── Tier 3: Network fetch with auto-caching → Tier 4: transparent fallback ──
    if (_cacheDirPath != null) {
      return _CachingNetworkTileImage(
        tileKey: key,
        cacheDirPath: _cacheDirPath!,
      );
    }

    // Cache dir not ready yet — plain network (no disk persistence)
    return NetworkImage(
      'https://tiles.stadiamaps.com/tiles/osm_bright/$key.png?api_key=9ca55c4e-7cb5-45b9-9da3-10421c141cbe',
      headers: {'User-Agent': 'SIH2026-DeadReckoning/1.0'},
    );
  }
}

// =============================================================================
// Custom ImageProvider: tries multiple free tile servers in sequence, persists
// the first successful response to disk, and returns a transparent tile on
// complete failure. No API keys required.
// =============================================================================
class _CachingNetworkTileImage
    extends ImageProvider<_CachingNetworkTileImage> {
  final String tileKey;
  final String cacheDirPath;

  /// Stadia Maps tile server (free tier, API key authenticated).
  static const String _stadiaTileBase =
      'https://tiles.stadiamaps.com/tiles/osm_bright';
  static const String _stadiaApiKey = '9ca55c4e-7cb5-45b9-9da3-10421c141cbe';

  static const String _userAgent =
      'SIH2026-DeadReckoning/1.0 (student navigation project)';

  const _CachingNetworkTileImage({
    required this.tileKey,
    required this.cacheDirPath,
  });

  @override
  Future<_CachingNetworkTileImage> obtainKey(
      ImageConfiguration configuration) {
    return SynchronousFuture<_CachingNetworkTileImage>(this);
  }

  @override
  ImageStreamCompleter loadImage(
    _CachingNetworkTileImage key,
    ImageDecoderCallback decode,
  ) {
    return MultiFrameImageStreamCompleter(
      codec: _loadAsync(decode),
      scale: 1.0,
      informationCollector: () => <DiagnosticsNode>[
        DiagnosticsProperty<String>('Tile key', tileKey),
      ],
    );
  }

  Future<ui.Codec> _loadAsync(ImageDecoderCallback decode) async {
    // ── Double-check disk cache (another getImage call may have cached it) ──
    final cacheFile = File('$cacheDirPath/$tileKey.png');
    try {
      if (await cacheFile.exists()) {
        final bytes = await cacheFile.readAsBytes();
        if (bytes.isNotEmpty) {
          final buffer = await ui.ImmutableBuffer.fromUint8List(bytes);
          return await decode(buffer);
        }
      }
    } catch (_) {
      // Non-fatal — try network next
    }

    // ── Fetch from Stadia Maps ──
    try {
      final url = '$_stadiaTileBase/$tileKey.png?api_key=$_stadiaApiKey';
      final httpClient = HttpClient()
        ..userAgent = _userAgent
        ..connectionTimeout = const Duration(seconds: 8);

      final request = await httpClient.getUrl(Uri.parse(url));
      final response = await request.close();

      if (response.statusCode == HttpStatus.ok) {
        final bytes = await consolidateHttpClientResponseBytes(response);

        // Validate it's actually a PNG (starts with 0x89 0x50)
        if (bytes.length > 8 && bytes[0] == 0x89 && bytes[1] == 0x50) {
          // Persist to disk cache (fire-and-forget)
          _saveToCacheAsync(cacheFile, bytes);

          final buffer = await ui.ImmutableBuffer.fromUint8List(
              Uint8List.fromList(bytes));
          return await decode(buffer);
        }
      }
    } catch (_) {
      // Network unavailable — expected when offline
    }

    // ── Tier 4: Transparent 1×1 fallback (no broken image icon) ──
    final buffer = await ui.ImmutableBuffer.fromUint8List(_kTransparentPng);
    return decode(buffer);
  }

  /// Saves tile bytes to disk without blocking the image pipeline.
  void _saveToCacheAsync(File cacheFile, List<int> bytes) {
    Future<void>(() async {
      try {
        await cacheFile.parent.create(recursive: true);
        await cacheFile.writeAsBytes(bytes, flush: true);
      } catch (e) {
        debugPrint('[TileCache] Write failed for $tileKey: $e');
      }
    });
  }

  /// Minimal valid 1×1 transparent PNG (67 bytes).
  static final Uint8List _kTransparentPng = Uint8List.fromList(const <int>[
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1×1 pixel
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // RGBA 8-bit
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, // compressed data
    0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, // IEND chunk
    0x60, 0x82,
  ]);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _CachingNetworkTileImage &&
          runtimeType == other.runtimeType &&
          tileKey == other.tileKey;

  @override
  int get hashCode => tileKey.hashCode;

  @override
  String toString() =>
      '${objectRuntimeType(this, '_CachingNetworkTileImage')}($tileKey)';
}
