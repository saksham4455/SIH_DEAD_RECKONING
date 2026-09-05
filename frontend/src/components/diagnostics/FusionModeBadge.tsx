import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FusionMode } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface FusionModeBadgeProps {
  fusionMode: FusionMode;
}

interface ModeConfig {
  label: string;
  sublabel: string;
  color: string;
  badgeBg: string;
}

export const FusionModeBadge: React.FC<FusionModeBadgeProps> = ({ fusionMode }) => {
  const getModeConfig = (mode: FusionMode): ModeConfig => {
    switch (mode) {
      case 'GNSS_LOCKED':
        return {
          label: 'GNSS LOCKED',
          sublabel: 'Full Constellation Fusion',
          color: colors.fusionMode.GNSS_LOCKED,
          badgeBg: 'rgba(16, 185, 129, 0.12)',
        };
      case 'GNSS_DEGRADED':
        return {
          label: 'GNSS DEGRADED',
          sublabel: 'Multipath / Signal Attenuation',
          color: colors.fusionMode.GNSS_DEGRADED,
          badgeBg: 'rgba(245, 158, 11, 0.12)',
        };
      case 'DEAD_RECKONING':
        return {
          label: 'DEAD RECKONING',
          sublabel: 'Pure Inertial / Wheel Odometry',
          color: colors.fusionMode.DEAD_RECKONING,
          badgeBg: 'rgba(239, 68, 68, 0.12)',
        };
      case 'REACQUIRING':
        return {
          label: 'REACQUIRING',
          sublabel: 'Searching Almanac & Ephemeris',
          color: colors.fusionMode.REACQUIRING,
          badgeBg: 'rgba(139, 92, 246, 0.12)',
        };
      default:
        return {
          label: mode,
          sublabel: 'Unknown State',
          color: colors.text.muted,
          badgeBg: 'rgba(100, 116, 139, 0.12)',
        };
    }
  };

  const config = getModeConfig(fusionMode);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: `${config.color}55`,
          backgroundColor: config.badgeBg,
        },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <View style={styles.textContainer}>
        <Text style={[styles.modeTitle, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={styles.modeSubtitle}>{config.sublabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  textContainer: {
    justifyContent: 'center',
  },
  modeTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.8,
  },
  modeSubtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 1,
  },
});
