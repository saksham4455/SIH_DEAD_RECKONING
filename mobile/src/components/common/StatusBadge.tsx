import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  color?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  color,
  size = 'md',
  showDot = true,
  style,
}) => {
  const getBadgeColor = (): string => {
    if (color) return color;
    switch (variant) {
      case 'success':
        return colors.status.healthy;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      case 'info':
        return colors.accent.cyan;
      case 'neutral':
      default:
        return colors.text.muted;
    }
  };

  const badgeColor = getBadgeColor();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: `${badgeColor}55`,
          backgroundColor: `${badgeColor}1A`,
        },
        isSmall && styles.badgeSmall,
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: badgeColor },
            isSmall && styles.dotSmall,
          ]}
        />
      )}
      <Text
        style={[
          styles.label,
          { color: badgeColor },
          isSmall && styles.labelSmall,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: dimensions.borderRadius.pill,
    borderWidth: dimensions.borderWidth.thin,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: dimensions.borderRadius.lg,
  },
  dot: {
    width: dimensions.iconDot.md,
    height: dimensions.iconDot.md,
    borderRadius: dimensions.iconDot.md / 2,
    marginRight: spacing.xs,
  },
  dotSmall: {
    width: dimensions.iconDot.sm,
    height: dimensions.iconDot.sm,
    borderRadius: dimensions.iconDot.sm / 2,
    marginRight: spacing.xxs,
  },
  label: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.medium,
  },
  labelSmall: {
    fontSize: typography.fontSizes.xxs,
  },
});
