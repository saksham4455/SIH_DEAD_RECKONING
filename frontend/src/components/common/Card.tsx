import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface CardProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'highlight' | 'compact';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerRight,
  children,
  style,
  variant = 'default',
}) => {
  const isHighlight = variant === 'highlight';
  const isCompact = variant === 'compact';

  return (
    <View
      style={[
        styles.card,
        isHighlight && styles.cardHighlight,
        isCompact && styles.cardCompact,
        style,
      ]}
    >
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderColor: colors.background.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHighlight: {
    borderColor: colors.accent.cyan,
    backgroundColor: colors.background.surfaceHighlight,
  },
  cardCompact: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.surfaceBorder,
    paddingBottom: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xxs,
  },
  headerRight: {
    marginLeft: spacing.sm,
  },
  content: {
    width: '100%',
  },
});
