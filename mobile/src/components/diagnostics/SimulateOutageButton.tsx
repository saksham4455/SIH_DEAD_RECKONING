import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

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
            backgroundColor: isOutageSimulated
              ? colors.status.error
              : colors.status.error,
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
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  btnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btnDangerActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: colors.status.error,
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.4,
  },
  btnIconDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  btnDangerTextActive: {
    color: '#FF6B6B',
    fontWeight: typography.fontWeights.heavy,
  },
  tag: {
    fontSize: typography.fontSizes.xs - 4,
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
