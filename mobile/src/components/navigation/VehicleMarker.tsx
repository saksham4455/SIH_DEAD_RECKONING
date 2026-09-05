import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

interface VehicleMarkerProps {
  heading: number; // in degrees (0 to 360)
  speed?: number;
  color?: string;
  size?: number;
}

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({
  heading,
  speed,
  color = colors.accent.cyan,
  size = 64,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Radar Pulse Ring */}
      <View
        style={[
          styles.radarRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: `${color}33`,
          },
        ]}
      />

      {/* Middle Concentric Ring */}
      <View
        style={[
          styles.middleRing,
          {
            width: size * 0.68,
            height: size * 0.68,
            borderRadius: (size * 0.68) / 2,
            borderColor: `${color}66`,
          },
        ]}
      />

      {/* Rotated Vehicle Pointer */}
      <View
        style={[
          styles.headingContainer,
          {
            transform: [{ rotate: `${heading}deg` }],
          },
        ]}
      >
        {/* Directional Chevron / Arrow */}
        <View style={[styles.chevronTip, { borderBottomColor: color }]} />
        <View style={[styles.vehicleBody, { backgroundColor: color }]} />
      </View>

      {/* Center Core Dot */}
      <View style={[styles.centerDot, { backgroundColor: colors.text.primary }]} />

      {/* Heading Readout Tag */}
      <View style={styles.headingBadge}>
        <Text style={styles.headingText}>{Math.round(heading)}°</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: dimensions.borderWidth.normal,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
  },
  middleRing: {
    position: 'absolute',
    borderWidth: dimensions.borderWidth.thin,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  headingContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -2,
  },
  vehicleBody: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
  centerDot: {
    position: 'absolute',
    width: dimensions.iconDot.xs,
    height: dimensions.iconDot.xs,
    borderRadius: dimensions.iconDot.xs / 2,
  },
  headingBadge: {
    position: 'absolute',
    bottom: -14,
    backgroundColor: colors.background.overlay,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: dimensions.borderRadius.xs,
    borderWidth: dimensions.borderWidth.hairline,
    borderColor: colors.background.surfaceBorder,
  },
  headingText: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
  },
});
