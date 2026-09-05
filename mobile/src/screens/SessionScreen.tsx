import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, SessionStatus } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SessionScreenProps = NativeStackScreenProps<RootStackParamList, 'Session'>;

export const SessionScreen: React.FC<SessionScreenProps> = ({ navigation }) => {
  // Phase 7: Local frontend session lifecycle (READY -> RECORDING -> STOPPED)
  const [status, setStatus] = useState<SessionStatus>('READY');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const isRecording = status === 'RECORDING';
  const isStopped = status === 'STOPPED';
  const isReady = status === 'READY';

  // Local duration timer when recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStart = () => {
    if (isStopped) {
      setElapsedSeconds(0);
    }
    setStatus('RECORDING');
  };

  const handleStop = () => {
    setStatus('STOPPED');
  };

  // Format elapsed time as MM:SS
  const formatDuration = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Status visual attributes
  const getStatusColor = (): string => {
    switch (status) {
      case 'RECORDING':
        return colors.status.error;
      case 'STOPPED':
        return colors.status.warning;
      case 'READY':
      default:
        return colors.status.healthy;
    }
  };

  const getStatusBadgeLabel = (): string => {
    switch (status) {
      case 'RECORDING':
        return 'IN PROGRESS';
      case 'STOPPED':
        return 'COMPLETED';
      case 'READY':
      default:
        return 'STANDBY';
    }
  };

  const statusColor = getStatusColor();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.dark} />
      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>DASHBOARD</Text>
          </TouchableOpacity>

          <Text style={styles.headerSuperTitle}>SIH 2026 // DEAD RECKONING</Text>
          <Text style={styles.headerTitle}>Session</Text>
        </View>

        {/* ── Status Indicator ── */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: statusColor },
            ]}
          >
            {status}
          </Text>
        </View>

        {/* ── Session Info Card ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SESSION</Text>
            <Text style={styles.infoValue}>DR-SESSION-001</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DURATION</Text>
            <Text
              style={[
                styles.durationValue,
                isStopped && { color: colors.status.warning },
              ]}
            >
              {formatDuration(elapsedSeconds)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  borderColor: `${statusColor}55`,
                  backgroundColor: `${statusColor}1A`,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: statusColor },
                ]}
              >
                {getStatusBadgeLabel()}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Controls (Start / Stop) ── */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.startButton,
              isRecording && styles.controlButtonDisabled,
            ]}
            onPress={handleStart}
            activeOpacity={0.7}
            disabled={isRecording}
          >
            <View style={[styles.controlDot, { backgroundColor: colors.status.healthy }]} />
            <Text
              style={[
                styles.startButtonText,
                isRecording && styles.controlButtonTextDisabled,
              ]}
            >
              {isStopped ? 'RESTART' : 'START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.stopButton,
              !isRecording && styles.controlButtonDisabled,
            ]}
            onPress={handleStop}
            activeOpacity={0.7}
            disabled={!isRecording}
          >
            <View style={[styles.controlDot, { backgroundColor: colors.status.error }]} />
            <Text
              style={[
                styles.stopButtonText,
                !isRecording && styles.controlButtonTextDisabled,
              ]}
            >
              STOP
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <View style={styles.disclaimerDot} />
          <Text style={styles.disclaimerText}>
            Local frontend mock state only. Zero real sensor, backend, or disk telemetry recording is active.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SMART INDIA HACKATHON • SESSION SCREEN (PHASE 7)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  // ── Header ──
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    marginBottom: spacing.md,
  },
  backArrow: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.lg,
    marginRight: spacing.xs,
  },
  backText: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1,
  },
  headerSuperTitle: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.heavy,
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  // ── Status Indicator ──
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1,
  },
  // ── Info Card ──
  infoCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.background.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.8,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    fontFamily: 'monospace',
  },
  durationValue: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.heavy,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.surfaceBorder,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  // ── Controls ──
  controlsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  startButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  startButtonText: {
    color: colors.status.healthy,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1,
  },
  stopButtonText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1,
  },
  controlButtonTextDisabled: {
    opacity: 0.5,
  },
  // ── Disclaimer ──
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderColor: colors.background.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  disclaimerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.indigo,
    marginRight: spacing.xs,
  },
  disclaimerText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 1,
    flex: 1,
  },
  // ── Footer ──
  footer: {
    marginTop: 'auto',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.background.surfaceBorder,
  },
  footerText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    letterSpacing: 0.8,
  },
});
