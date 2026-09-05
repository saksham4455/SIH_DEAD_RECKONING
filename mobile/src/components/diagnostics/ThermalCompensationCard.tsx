import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ThermalState } from '../../types/navigation';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ThermalCompensationCardProps {
  thermalState: ThermalState;
  mapMatchConfidence?: number;
}

export const ThermalCompensationCard: React.FC<ThermalCompensationCardProps> = ({
  thermalState,
  mapMatchConfidence,
}) => {
  const { temperature, biasCorrection } = thermalState;

  // Temperature status calculation
  const getTempStatus = (temp: number) => {
    if (temp < 45) return { label: 'OPTIMAL', color: colors.status.healthy };
    if (temp < 60) return { label: 'ELEVATED', color: colors.status.warning };
    return { label: 'CRITICAL', color: colors.status.error };
  };

  const tempStatus = getTempStatus(temperature);

  return (
    <Card
      title="THERMAL COMPENSATION & MAP MATCH"
      subtitle="Inertial Sensor Bias Drift & Map Topology"
      headerRight={
        <View
          style={[
            styles.tempBadge,
            { borderColor: `${tempStatus.color}55`, backgroundColor: `${tempStatus.color}15` },
          ]}
        >
          <Text style={[styles.tempBadgeText, { color: tempStatus.color }]}>
            {tempStatus.label}
          </Text>
        </View>
      }
    >
      <View style={styles.metricsContainer}>
        {/* IMU Temperature */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>IMU TEMPERATURE</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.metricValue, { color: tempStatus.color }]}>
              {temperature.toFixed(1)}
            </Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
          <Text style={styles.metricNote}>Operating Range: -20°C to +85°C</Text>
        </View>

        {/* Gyro Bias Drift Correction */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>BIAS CORRECTION</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.metricValue, { color: colors.accent.cyan }]}>
              {biasCorrection >= 0 ? `+${biasCorrection.toFixed(3)}` : biasCorrection.toFixed(3)}
            </Text>
            <Text style={styles.metricUnit}>rad/s</Text>
          </View>
          <Text style={styles.metricNote}>Online Zero-Velocity Drift Fix</Text>
        </View>

        {/* Map Match Confidence */}
        {mapMatchConfidence !== undefined && (
          <View style={[styles.metricItem, styles.mapMatchItem]}>
            <Text style={styles.metricLabel}>MAP-MATCH CONFIDENCE</Text>
            <View style={styles.valueRow}>
              <Text style={[styles.metricValue, { color: colors.accent.blue }]}>
                {(mapMatchConfidence * 100).toFixed(0)}
              </Text>
              <Text style={styles.metricUnit}>%</Text>
            </View>
            <Text style={styles.metricNote}>Road Network Topology Match</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  tempBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tempBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  metricItem: {
    width: '50%',
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  mapMatchItem: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(35, 50, 82, 0.4)',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  metricLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.heavy,
    fontFamily: 'monospace',
  },
  metricUnit: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  metricNote: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 2,
  },
});
