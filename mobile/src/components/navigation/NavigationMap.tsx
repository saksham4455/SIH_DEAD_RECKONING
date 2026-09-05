import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationState } from '../../types/navigation';
import { VehicleMarker } from './VehicleMarker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

interface NavigationMapProps {
  navigationState: NavigationState;
  mapMatchConfidence?: number;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  navigationState,
  mapMatchConfidence,
}) => {
  const { latitude, longitude, heading, speed } = navigationState;

  // Derive cardinal direction from heading
  const getCardinal = (angle: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((angle % 360) / 45)) % 8;
    return directions[index];
  };

  return (
    <View style={styles.mapContainer}>
      {/* Tactical Background Grid */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridHorizontal1} />
        <View style={styles.gridHorizontal2} />
        <View style={styles.gridHorizontal3} />
        <View style={styles.gridVertical1} />
        <View style={styles.gridVertical2} />
        <View style={styles.gridVertical3} />
      </View>

      {/* Simulated Road / Path Vector */}
      <View style={styles.roadNetwork}>
        {/* Main Road Corridor */}
        <View style={styles.roadCorridor} />
        <View style={styles.roadCenterLine} />
        <View style={styles.branchRoad} />
      </View>

      {/* Center Target Crosshairs */}
      <View style={styles.crosshairH} />
      <View style={styles.crosshairV} />

      {/* Vehicle Marker at Center */}
      <View style={styles.markerAnchor}>
        <VehicleMarker heading={heading} speed={speed} />
      </View>

      {/* Top HUD: Coordinates & Fix Status */}
      <View style={styles.hudTop}>
        <View style={styles.hudCoordinates}>
          <Text style={styles.hudCoordLabel}>COORDINATES</Text>
          <Text style={styles.hudCoordValue}>
            {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </Text>
        </View>

        {/* Compass & Cardinal */}
        <View style={styles.compassBox}>
          <Text style={styles.compassCardinal}>{getCardinal(heading)}</Text>
          <Text style={styles.compassDegree}>{heading.toFixed(1)}°</Text>
        </View>
      </View>

      {/* Bottom HUD: Map Mock Label & Confidence */}
      <View style={styles.hudBottom}>
        <View style={styles.surfaceTag}>
          <View style={styles.surfaceDot} />
          <Text style={styles.surfaceTagText}>MOCK TACTICAL MAP SURFACE</Text>
        </View>
        {mapMatchConfidence !== undefined && (
          <Text style={styles.mapMatchText}>
            MATCH: {(mapMatchConfidence * 100).toFixed(0)}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 240,
    backgroundColor: colors.background.tactical,
    borderRadius: dimensions.borderRadius.xl,
    borderWidth: dimensions.borderWidth.thin,
    borderColor: colors.background.surfaceBorder,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridHorizontal1: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  gridHorizontal2: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  gridHorizontal3: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  gridVertical1: {
    position: 'absolute',
    left: '25%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border.subtle,
  },
  gridVertical2: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border.subtle,
  },
  gridVertical3: {
    position: 'absolute',
    left: '75%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border.subtle,
  },
  roadNetwork: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadCorridor: {
    position: 'absolute',
    width: 44,
    height: '140%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderLeftWidth: dimensions.borderWidth.thin,
    borderRightWidth: dimensions.borderWidth.thin,
    transform: [{ rotate: '-35deg' }],
  },
  roadCenterLine: {
    position: 'absolute',
    width: 2,
    height: '140%',
    borderLeftWidth: dimensions.borderWidth.thick,
    borderLeftColor: 'rgba(0, 229, 255, 0.4)',
    borderStyle: 'dashed',
    transform: [{ rotate: '-35deg' }],
  },
  branchRoad: {
    position: 'absolute',
    width: 32,
    height: '80%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderTopWidth: dimensions.borderWidth.thin,
    borderBottomWidth: dimensions.borderWidth.thin,
    transform: [{ rotate: '55deg' }, { translateX: -30 }],
  },
  crosshairH: {
    position: 'absolute',
    width: 32,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.3)',
  },
  crosshairV: {
    position: 'absolute',
    height: 32,
    width: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.3)',
  },
  markerAnchor: {
    position: 'absolute',
    zIndex: 10,
  },
  hudTop: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 20,
  },
  hudCoordinates: {
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.borderRadius.sm,
    borderWidth: dimensions.borderWidth.thin,
    borderColor: colors.background.surfaceBorder,
  },
  hudCoordLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.medium,
  },
  hudCoordValue: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    fontFamily: typography.fontFamilies.mono,
    marginTop: 2,
  },
  compassBox: {
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.borderRadius.sm,
    borderWidth: dimensions.borderWidth.thin,
    borderColor: colors.background.surfaceBorder,
    alignItems: 'center',
    minWidth: 50,
  },
  compassCardinal: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  compassDegree: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.medium,
  },
  hudBottom: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  surfaceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.xs,
    borderWidth: dimensions.borderWidth.hairline,
    borderColor: colors.background.surfaceBorder,
  },
  surfaceDot: {
    width: dimensions.iconDot.sm,
    height: dimensions.iconDot.sm,
    borderRadius: dimensions.iconDot.sm / 2,
    backgroundColor: colors.accent.cyan,
    marginRight: 4,
  },
  surfaceTagText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    letterSpacing: typography.letterSpacing.medium,
  },
  mapMatchText: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.semibold,
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.xs,
    borderWidth: dimensions.borderWidth.hairline,
    borderColor: colors.background.surfaceBorder,
  },
});
