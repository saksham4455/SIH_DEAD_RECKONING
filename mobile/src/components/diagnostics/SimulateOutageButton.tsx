import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

export interface SimulateOutageButtonProps {
  isOutageSimulated: boolean;
  onToggleOutage: () => void;
  disabled?: boolean;
}

export const SimulateOutageButton: React.FC<SimulateOutageButtonProps> = ({
  isOutageSimulated,
  onToggleOutage,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.controlBtn,
        isOutageSimulated ? styles.btnDangerActive : styles.btnDanger,
        disabled && styles.disabled,
      ]}
      onPress={onToggleOutage}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.btnIconDot,
          {
            backgroundColor: colors.status.error,
          },
          isOutageSimulated && styles.btnIconDotActive,
        ]}
      />
      <Text
        style={[
          styles.btnDangerText,
          isOutageSimulated && styles.btnDangerTextActive,
        ]}
      >
        {isOutageSimulated ? 'OUTAGE ACTIVE' : 'SIMULATE OUTAGE'}
      </Text>
      <Text
        style={[
          styles.tag,
          isOutageSimulated ? styles.tagActive : styles.tagInactive,
        ]}
      >
        {isOutageSimulated ? 'GNSS OUTAGE SIMULATED' : 'TAP TO SIMULATE'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  controlBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: dimensions.borderRadius.md,
    borderWidth: dimensions.borderWidth.thin,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: dimensions.controlHeight.toggle,
  },
  btnDanger: {
    backgroundColor: colors.status.errorSubtle,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btnDangerActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: colors.status.error,
    borderWidth: dimensions.borderWidth.normal,
  },
  disabled: {
    opacity: 0.4,
  },
  btnIconDot: {
    width: dimensions.iconDot.sm,
    height: dimensions.iconDot.sm,
    borderRadius: dimensions.iconDot.sm / 2,
    marginBottom: 4,
  },
  btnIconDotActive: {
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDangerText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.medium,
  },
  btnDangerTextActive: {
    color: '#FF6B6B',
    fontWeight: typography.fontWeights.heavy,
  },
  tag: {
    fontSize: typography.fontSizes.micro,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: typography.fontWeights.semibold,
  },
  tagInactive: {
    color: colors.text.muted,
  },
  tagActive: {
    color: colors.status.error,
    letterSpacing: 0.3,
  },
});
