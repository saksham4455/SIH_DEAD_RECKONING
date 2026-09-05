import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  disabled?: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onToggleRecording,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.controlBtn,
        isRecording ? styles.btnRecordingActive : styles.btnNeutral,
        disabled && styles.disabled,
      ]}
      onPress={onToggleRecording}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.btnIconDot,
          {
            backgroundColor: isRecording
              ? colors.status.warning
              : colors.status.warning,
          },
          isRecording && styles.btnIconDotActive,
        ]}
      />
      <Text
        style={[
          styles.btnText,
          isRecording && styles.btnTextActive,
        ]}
      >
        {isRecording ? 'LOGGING ACTIVE' : 'RECORD LOGS'}
      </Text>
      <Text
        style={[
          styles.tag,
          isRecording ? styles.tagActive : styles.tagInactive,
        ]}
      >
        {isRecording ? 'LOCAL MOCK ONLY' : 'STANDBY'}
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
  btnRecordingActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: colors.status.warning,
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
    shadowColor: colors.status.warning,
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
    color: colors.status.warning,
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
    color: colors.status.warning,
    letterSpacing: 0.3,
  },
});
