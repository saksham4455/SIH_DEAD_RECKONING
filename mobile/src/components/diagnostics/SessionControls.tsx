import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';
import { SimulateOutageButton } from './SimulateOutageButton';
import { RecordingControls } from './RecordingControls';
import { DebugOverlayToggle } from './DebugOverlayToggle';

export interface SessionControlsProps {
  isOutageSimulated?: boolean;
  onToggleOutage?: () => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  isDebugVisible?: boolean;
  onToggleDebug?: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isOutageSimulated = false,
  onToggleOutage = () => {},
  isRecording = false,
  onToggleRecording = () => {},
  isDebugVisible = true,
  onToggleDebug = () => {},
}) => {
  const getHeaderBadge = () => {
    if (isOutageSimulated) {
      return (
        <View style={[styles.badge, styles.badgeOutage]}>
          <Text style={[styles.badgeText, styles.badgeTextOutage]}>
            OUTAGE SIMULATED
          </Text>
        </View>
      );
    }
    if (isRecording) {
      return (
        <View style={[styles.badge, styles.badgeRecording]}>
          <Text style={[styles.badgeText, styles.badgeTextRecording]}>
            LOGGING ACTIVE
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgeStandby]}>
        <Text style={[styles.badgeText, styles.badgeTextStandby]}>
          MOCK CONTROLS
        </Text>
      </View>
    );
  };

  return (
    <Card
      title="SESSION CONTROLS"
      subtitle="Simulation & Telemetry Diagnostics (Local UI State)"
      headerRight={getHeaderBadge()}
    >
      <View style={styles.controlsRow}>
        {/* Simulate Outage Button */}
        <SimulateOutageButton
          isOutageSimulated={isOutageSimulated}
          onToggleOutage={onToggleOutage}
        />

        {/* Recording Controls */}
        <RecordingControls
          isRecording={isRecording}
          onToggleRecording={onToggleRecording}
        />

        {/* Debug Overlay Toggle */}
        <DebugOverlayToggle
          isDebugVisible={isDebugVisible}
          onToggleDebug={onToggleDebug}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.sm,
    borderWidth: dimensions.borderWidth.thin,
  },
  badgeStandby: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  badgeTextStandby: {
    color: colors.text.muted,
  },
  badgeOutage: {
    backgroundColor: colors.status.errorSubtle,
    borderColor: colors.status.error,
  },
  badgeTextOutage: {
    color: colors.status.error,
  },
  badgeRecording: {
    backgroundColor: colors.status.warningSubtle,
    borderColor: colors.status.warning,
  },
  badgeTextRecording: {
    color: colors.status.warning,
  },
  badgeText: {
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
});
