import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { InferenceStats } from '../../types/navigation';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

interface AiInferencePanelProps {
  inferenceStats: InferenceStats;
}

export const AiInferencePanel: React.FC<AiInferencePanelProps> = ({
  inferenceStats,
}) => {
  const { latencyMs, modelVersion, confidence, estimatedSpeed } = inferenceStats;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Card
      title="AI INFERENCE TELEMETRY"
      subtitle="Visual Odometry & Kinematic Model Estimator"
      headerRight={
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>SIMULATED / MOCK</Text>
        </View>
      }
    >
      {/* 2x2 Grid of Inference Metrics */}
      <View style={styles.grid}>
        {/* Model Version */}
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>MODEL VERSION</Text>
          <Text style={styles.cellValuePrimary}>{modelVersion}</Text>
          <Text style={styles.cellSubtitle}>Edge TFLite Architecture</Text>
        </View>

        {/* Inference Latency */}
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>LATENCY</Text>
          <View style={styles.valueWithUnit}>
            <Text style={[styles.cellValue, { color: colors.status.healthy }]}>
              {latencyMs}
            </Text>
            <Text style={styles.cellUnit}>ms</Text>
          </View>
          <Text style={styles.cellSubtitle}>Real-time budget &lt; 50ms</Text>
        </View>

        {/* Model Confidence */}
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>CONFIDENCE</Text>
          <View style={styles.valueWithUnit}>
            <Text style={[styles.cellValue, { color: colors.accent.cyan }]}>
              {confidencePercent}
            </Text>
            <Text style={styles.cellUnit}>%</Text>
          </View>
          <Text style={styles.cellSubtitle}>Model estimation certainty</Text>
        </View>

        {/* Estimated Speed */}
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>ESTIMATED SPEED</Text>
          <View style={styles.valueWithUnit}>
            <Text style={[styles.cellValue, { color: colors.accent.blue }]}>
              {estimatedSpeed.toFixed(1)}
            </Text>
            <Text style={styles.cellUnit}>m/s</Text>
          </View>
          <Text style={styles.cellSubtitle}>{(estimatedSpeed * 3.6).toFixed(1)} km/h equiv</Text>
        </View>
      </View>

      {/* Required Disclaimer Footer */}
      <View style={styles.disclaimerContainer}>
        <View style={styles.disclaimerDot} />
        <Text style={styles.disclaimerText}>
          Displaying static mock values. No onboard neural network execution in progress.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  mockBadge: {
    backgroundColor: colors.accent.indigoSubtle,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderWidth: dimensions.borderWidth.thin,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.sm,
  },
  mockBadgeText: {
    color: '#818CF8',
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  metricCell: {
    width: '50%',
    padding: spacing.xs,
  },
  cellLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.medium,
    marginBottom: 2,
  },
  cellValuePrimary: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    fontFamily: typography.fontFamilies.mono,
  },
  valueWithUnit: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cellValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    fontFamily: typography.fontFamilies.mono,
  },
  cellUnit: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  cellSubtitle: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    marginTop: 2,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: dimensions.borderWidth.thin,
    borderTopColor: colors.background.surfaceBorder,
  },
  disclaimerDot: {
    width: dimensions.iconDot.sm,
    height: dimensions.iconDot.sm,
    borderRadius: dimensions.iconDot.sm / 2,
    backgroundColor: '#818CF8',
    marginRight: spacing.xs,
  },
  disclaimerText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    flex: 1,
  },
});
