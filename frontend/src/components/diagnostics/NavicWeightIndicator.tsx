import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface NavicWeightIndicatorProps {
  navicWeight: number; // e.g. 0.65
}

export const NavicWeightIndicator: React.FC<NavicWeightIndicatorProps> = ({
  navicWeight,
}) => {
  const percentage = Math.round(navicWeight * 100);

  return (
    <Card
      title="NAVIC FUSION WEIGHT"
      subtitle="Priority Regional Constellation Integration"
      headerRight={
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{percentage}% WEIGHT</Text>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Metric Overview */}
        <View style={styles.metricRow}>
          <View>
            <Text style={styles.rawWeightLabel}>COEFFICIENT</Text>
            <Text style={styles.rawWeightValue}>{navicWeight.toFixed(2)}</Text>
          </View>
          <View style={styles.allocationBox}>
            <Text style={styles.allocationStatus}>
              {percentage >= 50 ? 'DOMINANT FUSION SOURCE' : 'BALANCED MULTI-GNSS'}
            </Text>
            <Text style={styles.allocationDesc}>
              High signal-to-noise ratio in Indian subcontinent region
            </Text>
          </View>
        </View>

        {/* Visual Dual-Tone Progress Meter */}
        <View style={styles.meterContainer}>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.navicBar,
                { width: `${percentage}%` },
              ]}
            />
            <View
              style={[
                styles.otherBar,
                { width: `${100 - percentage}%` },
              ]}
            />
          </View>

          {/* Meter Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.constellations.NavIC }]} />
              <Text style={styles.legendText}>NavIC ({percentage}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.text.muted }]} />
              <Text style={styles.legendText}>Other Constellations ({100 - percentage}%)</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.constellations.NavIC,
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
  },
  container: {
    marginTop: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rawWeightLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  rawWeightValue: {
    color: colors.constellations.NavIC,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.heavy,
    fontFamily: 'monospace',
  },
  allocationBox: {
    flex: 1,
    marginLeft: spacing.lg,
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.background.surfaceBorder,
  },
  allocationStatus: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  allocationDesc: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 2,
  },
  meterContainer: {
    marginTop: spacing.xs,
  },
  meterTrack: {
    height: 10,
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'rgba(35, 50, 82, 0.6)',
  },
  navicBar: {
    height: '100%',
    backgroundColor: colors.constellations.NavIC,
  },
  otherBar: {
    height: '100%',
    backgroundColor: 'rgba(100, 116, 139, 0.5)',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs - 2,
  },
});
