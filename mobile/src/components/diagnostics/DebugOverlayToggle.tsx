import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

export interface DebugOverlayToggleProps {
  isDebugVisible: boolean;
  onToggleDebug: () => void;
  disabled?: boolean;
}

export const DebugOverlayToggle: React.FC<DebugOverlayToggleProps> = ({
  isDebugVisible,
  onToggleDebug,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.controlBtn,
        isDebugVisible ? styles.btnCyanActive : styles.btnNeutral,
        disabled && styles.disabled,
      ]}
      onPress={onToggleDebug}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.btnIconDot,
          {
            backgroundColor: isDebugVisible
              ? colors.accent.cyan
              : colors.text.muted,
          },
          isDebugVisible && styles.btnIconDotActive,
        ]}
      />
      <Text
        style={[
          styles.btnText,
          isDebugVisible && styles.btnTextActive,
        ]}
      >
        DEBUG OVERLAY
      </Text>
      <Text
        style={[
          styles.tag,
          isDebugVisible ? styles.tagActive : styles.tagInactive,
        ]}
      >
        {isDebugVisible ? 'OVERLAY ON' : 'OVERLAY OFF'}
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
  btnNeutral: {
    backgroundColor: colors.background.surfaceSubtle,
    borderColor: colors.background.surfaceBorder,
  },
  btnCyanActive: {
    backgroundColor: colors.accent.cyanSubtle,
    borderColor: colors.accent.cyan,
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
    shadowColor: colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.medium,
  },
  btnTextActive: {
    color: colors.accent.cyan,
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
    color: colors.accent.cyan,
    letterSpacing: 0.3,
  },
});
