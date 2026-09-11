import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sih_dead_reckoning/core/platform/hardware/vehicle_alignment_engine.dart';
import 'package:sih_dead_reckoning/core/platform/maps/offline_tile_provider.dart';
import 'package:sih_dead_reckoning/features/navigation_engine/domain/entities/navigation_state.dart';

void main() {
  group('VehicleAlignmentEngine Unit Tests', () {
    late VehicleAlignmentEngine engine;

    setUp(() {
      engine = VehicleAlignmentEngine();
    });

    test('Initial state is uncalibrated with zero pitch and roll', () {
      expect(engine.isCalibrated, isFalse);
      expect(engine.pitch, equals(0.0));
      expect(engine.roll, equals(0.0));
    });

    test('Stationary phone flat on table produces ~0 longitudinal acceleration after gravity subtraction', () {
      // Simulate phone resting flat on table (ax=0, ay=0, az=9.81 m/s²)
      for (int i = 0; i < 30; i++) {
        final vehicleAccel = engine.transformToVehicleFrame(0.0, 0.0, 9.81);
        final nhc = engine.applyNonHolonomicConstraints(vehicleAccel);

        if (i > 15) {
          // Longitudinal forward acceleration should be ~0 when stationary
          expect(nhc[0].abs(), lessThan(0.05));
          // Lateral and vertical NHC clamped to strictly 0
          expect(nhc[1], equals(0.0));
          expect(nhc[2], equals(0.0));
        }
      }
      expect(engine.isCalibrated, isTrue);
    });

    test('Phone mounted vertically in car mount auto-calibrates pitch/roll', () {
      // Simulate phone standing vertically in a mount (ax=0, ay=9.81, az=0)
      for (int i = 0; i < 150; i++) {
        engine.transformToVehicleFrame(0.0, 9.81, 0.0);
      }
      expect(engine.isCalibrated, isTrue);
      // Roll angle should reflect 90-degree tilt (pi/2 rad)
      expect(engine.roll, closeTo(pi / 2, 0.1));
    });

    test('Non-Holonomic Constraints (NHC) enforce 1D kinematics', () {
      final rawVehicle = [2.5, -1.2, 0.8];
      final nhc = engine.applyNonHolonomicConstraints(rawVehicle);
      expect(nhc[0], equals(2.5)); // Longitudinal forward preserved
      expect(nhc[1], equals(0.0)); // Lateral clamped to 0
      expect(nhc[2], equals(0.0)); // Vertical clamped to 0
    });
  });

  group('BundledOfflineTileProvider Unit Tests', () {
    late BundledOfflineTileProvider provider;

    setUp(() {
      provider = BundledOfflineTileProvider();
    });

    test('Known bundled tiles return AssetImage with correct path', () {
      // Test zoom 11 metropolitan tile
      final image11 = provider.getImage(
        TileCoordinates(1462, 853, 11),
        TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
      );
      expect(image11, isA<AssetImage>());
      expect((image11 as AssetImage).assetName, equals('assets/maps/tiles/11/1462/853.png'));

      // Test zoom 15 street-level tile
      final image15 = provider.getImage(
        TileCoordinates(23398, 13661, 15),
        TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
      );
      expect(image15, isA<AssetImage>());
      expect((image15 as AssetImage).assetName, equals('assets/maps/tiles/15/23398/13661.png'));

      // Test zoom 16 intersection tile
      final image16 = provider.getImage(
        TileCoordinates(46797, 27322, 16),
        TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
      );
      expect(image16, isA<AssetImage>());
      expect((image16 as AssetImage).assetName, equals('assets/maps/tiles/16/46797/27322.png'));
    });

    test('Unbundled tile outside coverage returns NetworkImage with formatted URL', () {
      final unbundled = provider.getImage(
        TileCoordinates(99999, 99999, 17),
        TileLayer(urlTemplate: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}.png?api_key=9ca55c4e-7cb5-45b9-9da3-10421c141cbe'),
      );
      expect(unbundled, isA<NetworkImage>());
      expect((unbundled as NetworkImage).url, contains('tiles.stadiamaps.com/tiles/osm_bright/17/99999/99999.png'));
    });
  });

  group('Navigation Domain State Unit Tests', () {
    test('SensorHealthModel explicitly supports barometer absence detection', () {
      const healthWithBaro = SensorHealthModel(
        accelerometer: true,
        gyroscope: true,
        magnetometer: true,
        gnss: true,
        barometer: true,
      );
      expect(healthWithBaro.barometer, isTrue);

      const healthNoBaro = SensorHealthModel(
        accelerometer: true,
        gyroscope: true,
        magnetometer: true,
        gnss: true,
        barometer: false,
      );
      expect(healthNoBaro.barometer, isFalse);
    });

    test('FusionMode names match backend telemetry schema expectations', () {
      expect(FusionMode.gnssLocked.nameString, equals('GNSS_LOCKED'));
      expect(FusionMode.gnssDegraded.nameString, equals('GNSS_DEGRADED'));
      expect(FusionMode.deadReckoning.nameString, equals('DEAD_RECKONING'));
      expect(FusionMode.reacquiring.nameString, equals('REACQUIRING'));
    });
  });
}
