import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const SessionControls: React.FC = () => {
  return (
    <Card
      title="SESSION CONTROLS"
      subtitle="Simulation & Telemetry Logging (Future Phase)"
      headerRight={
        <View style={styles.standbyBadge}>
          <Text style={styles.standbyText}>STANDBY</Text>
        </View>
      }
    >
      <View style={styles.controlsRow}>
        {/* Simulate Outage Button Placeholder */}
        <TouchableOpacity
          style={[styles.controlBtn, styles.btnDanger]}
          activeOpacity={0.7}
          disabled={true}
        >
          <View style={[styles.btnIconDot, { backgroundColor: colors.status.error }]} />
          <Text style={styles.btnDangerText}>SIMULATE OUTAGE</Text>
          <Text style={styles.disabledTag}>DISABLED (PHASE 4)</Text>
        </TouchableOpacity>

        {/* Recording Controls Placeholder */}
        <TouchableOpacity
          style={[styles.controlBtn, styles.btnNeutral]}
          activeOpacity={0.7}
          disabled={true}
        >
          <View style={[styles.btnIconDot, { backgroundColor: colors.status.warning }]} />
          <Text style={styles.btnText}>RECORD LOGS</Text>
          <Text style={styles.disabledTag}>DISABLED (PHASE 4)</Text>
        </TouchableOpacity>

        {/* Debug Overlay Toggle Placeholder */}
        <TouchableOpacity
          style={[styles.controlBtn, styles.btnNeutral]}
          activeOpacity={0.7}
          disabled={true}
        >
          <View style={[styles.btnIconDot, { backgroundColor: colors.accent.cyan }]} />
          <Text style={styles.btnText}>DEBUG OVERLAY</Text>
          <Text style={styles.disabledTag}>DISABLED (PHASE 4)</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  standbyBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  standbyText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  btnNeutral: {
    backgroundColor: colors.background.surfaceSubtle,
    borderColor: colors.background.surfaceBorder,
  },
  btnIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  btnDangerText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
  },
  btnText: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
  },
  disabledTag: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 4,
    marginTop: 2,
    textAlign: 'center',
  },
});
