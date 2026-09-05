import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

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
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  btnNeutral: {
    backgroundColor: colors.background.surfaceSubtle,
    borderColor: colors.background.surfaceBorder,
  },
  btnCyanActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: colors.accent.cyan,
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
    shadowColor: colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  btnTextActive: {
    color: colors.accent.cyan,
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
    color: colors.accent.cyan,
    letterSpacing: 0.3,
  },
});
