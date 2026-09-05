import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  accentColor = colors.accent.cyan,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.surfaceSubtle,
    borderColor: colors.background.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    flex: 1,
    minWidth: 100,
  },
  label: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xxs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  unit: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: spacing.xxs,
  },
});
