import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { mockDashboardData } from '../data/mockData';

// Navigation components
import { NavigationMap } from '../components/navigation/NavigationMap';

// Diagnostic components (composed directly)
import { FusionModeBadge } from '../components/diagnostics/FusionModeBadge';
import { SatelliteBreakdown } from '../components/diagnostics/SatelliteBreakdown';
import { NavicWeightIndicator } from '../components/diagnostics/NavicWeightIndicator';
import { AiInferencePanel } from '../components/diagnostics/AiInferencePanel';
import { RoadAnomalyTicker } from '../components/diagnostics/RoadAnomalyTicker';
import { ThermalCompensationCard } from '../components/diagnostics/ThermalCompensationCard';
import { SensorHealthBar } from '../components/diagnostics/SensorHealthBar';
import { SessionControls } from '../components/diagnostics/SessionControls';

// Common components
import { StatCard } from '../components/common/StatCard';

// Theme
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // Phase 7: Local mock frontend debug state
  const [isOutageSimulated, setIsOutageSimulated] = useState<boolean>(false);
  const [isRecordingLogs, setIsRecordingLogs] = useState<boolean>(false);
  const [isDebugVisible, setIsDebugVisible] = useState<boolean>(true);

  // Ingest baseline mock data
  const data = mockDashboardData;

  // Local simulated telemetry derivation based on outage toggle
  const navigationState = isOutageSimulated
    ? {
        ...data.navigationState,
        fusionMode: 'DEAD_RECKONING' as const,
        confidence: 0.42,
      }
    : data.navigationState;

  const sensorHealth = isOutageSimulated
    ? {
        ...data.sensorHealth,
        gnss: false,
      }
    : data.sensorHealth;

  const satelliteBreakdown = isOutageSimulated
    ? {
        NavIC: { count: 1, signalStrength: 12.0 },
        GPS: { count: 0, signalStrength: 0 },
        Galileo: { count: 0, signalStrength: 0 },
        GLONASS: { count: 0, signalStrength: 0 },
      }
    : data.satelliteBreakdown;

  const mapMatchConfidence = isOutageSimulated ? 0.61 : data.mapMatchConfidence;

  // Convert speed from m/s to km/h for secondary readout
  const speedKmh = (navigationState.speed * 3.6).toFixed(1);
  const confidencePercent = Math.round(navigationState.confidence * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.dark} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* OUTAGE ALERT BANNER (PHASE 7 SIMULATION)                  */}
        {/* ========================================================= */}
        {isOutageSimulated && (
          <View style={styles.outageBanner}>
            <View style={styles.outageBannerDot} />
            <View style={styles.outageBannerContent}>
              <Text style={styles.outageBannerTitle}>GNSS OUTAGE SIMULATED</Text>
              <Text style={styles.outageBannerText}>
                Primary GNSS lock lost. Fallback dead reckoning active (IMU + Kinematic Dead Reckoning).
              </Text>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* 1. HEADER SECTION                                         */}
        {/* ========================================================= */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.appSuperTitle}>SIH 2026 // DEAD RECKONING</Text>
              <Text style={styles.appTitle}>Telemetry Dashboard</Text>
            </View>
            <View style={styles.headerRightCol}>
              <View style={styles.confidencePill}>
                <Text style={styles.confidenceLabel}>FUSION CONF</Text>
                <Text
                  style={[
                    styles.confidenceValue,
                    isOutageSimulated && { color: colors.status.warning },
                  ]}
                >
                  {confidencePercent}%
                </Text>
              </View>

              {/* Local Mock Recording Pill */}
              {isRecordingLogs && (
                <View style={styles.recordingBadge}>
                  <View style={styles.recordingBadgeDot} />
                  <Text style={styles.recordingBadgeText}>LOGGING ACTIVE</Text>
                </View>
              )}
            </View>
          </View>

          {/* Fusion Mode Badge */}
          <View style={styles.fusionModeContainer}>
            <FusionModeBadge fusionMode={navigationState.fusionMode} />
          </View>
        </View>

        {/* ========================================================= */}
        {/* 2. MAIN NAVIGATION AREA                                    */}
        {/* ========================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NAVIGATION SURFACE</Text>
          <Text style={styles.sectionSubtitle}>Tactical Vector &amp; Dead Reckoning Core</Text>
        </View>

        <NavigationMap
          navigationState={navigationState}
          mapMatchConfidence={mapMatchConfidence}
        />

        {/* ========================================================= */}
        {/* 3. NAVIGATION TELEMETRY STATS                              */}
        {/* ========================================================= */}
        <View style={styles.statsRow}>
          <StatCard
            label="SPEED"
            value={navigationState.speed.toFixed(1)}
            unit="m/s"
            subtitle={`${speedKmh} km/h`}
            accentColor={colors.accent.cyan}
          />
          <StatCard
            label="HEADING"
            value={`${Math.round(navigationState.heading)}°`}
            subtitle="True North Track"
            accentColor={colors.accent.blue}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="POSITION FIX"
            value={`${navigationState.latitude.toFixed(3)}°N`}
            unit={`${navigationState.longitude.toFixed(3)}°E`}
            subtitle={
              isOutageSimulated
                ? 'DR Dead Reckoning Fix (No GNSS)'
                : 'GNSS + EKF Estimated Fix'
            }
            accentColor={
              isOutageSimulated
                ? colors.status.error
                : colors.constellations.GPS
            }
          />
          <StatCard
            label="MAP MATCH"
            value={`${(mapMatchConfidence * 100).toFixed(0)}%`}
            subtitle="Road Network Alignment"
            accentColor={
              isOutageSimulated ? colors.status.warning : colors.status.healthy
            }
          />
        </View>

        {/* ========================================================= */}
        {/* 4. DIAGNOSTICS SECTION (WITH DEBUG OVERLAY TOGGLE)        */}
        {/* ========================================================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>SYSTEM DIAGNOSTICS</Text>
            {!isDebugVisible && (
              <View style={styles.overlayHiddenTag}>
                <Text style={styles.overlayHiddenTagText}>OVERLAY HIDDEN</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>Sensors, Constellations &amp; Edge AI</Text>
        </View>

        {isDebugVisible ? (
          <>
            {/* Hardware sensor health — uses StatusBadge internally */}
            <SensorHealthBar sensorHealth={sensorHealth} />

            {/* Multi-GNSS constellation reception */}
            <SatelliteBreakdown satelliteBreakdown={satelliteBreakdown} />

            {/* NavIC fusion weight indicator */}
            <NavicWeightIndicator navicWeight={isOutageSimulated ? 0.95 : data.navicWeight} />

            {/* AI / Visual odometry inference panel */}
            <AiInferencePanel inferenceStats={data.inferenceStats} />

            {/* Thermal bias compensation & map-match confidence */}
            <ThermalCompensationCard
              thermalState={data.thermalState}
              mapMatchConfidence={mapMatchConfidence}
            />

            {/* Road surface anomaly event ticker */}
            <RoadAnomalyTicker anomalyEvents={data.anomalyEvents} />
          </>
        ) : (
          <View style={styles.debugHiddenCard}>
            <View style={styles.debugHiddenDot} />
            <View style={styles.debugHiddenContent}>
              <Text style={styles.debugHiddenTitle}>DIAGNOSTIC OVERLAY HIDDEN</Text>
              <Text style={styles.debugHiddenText}>
                Diagnostics UI collapsed via local debug control. Tap "DEBUG OVERLAY" below to restore visibility.
              </Text>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* 5. SESSION & DEBUG CONTROLS (PHASE 7 LOCAL MOCK)          */}
        {/* ========================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SESSION CONTROLS</Text>
          <Text style={styles.sectionSubtitle}>Simulation &amp; Scenario Testing (Local State)</Text>
        </View>

        <SessionControls
          isOutageSimulated={isOutageSimulated}
          onToggleOutage={() => setIsOutageSimulated((prev) => !prev)}
          isRecording={isRecordingLogs}
          onToggleRecording={() => setIsRecordingLogs((prev) => !prev)}
          isDebugVisible={isDebugVisible}
          onToggleDebug={() => setIsDebugVisible((prev) => !prev)}
        />

        {/* ========================================================= */}
        {/* 6. START SESSION NAVIGATION (PRIMARY WORKFLOW)            */}
        {/* ========================================================= */}
        <TouchableOpacity
          style={styles.sessionButton}
          onPress={() => navigation.navigate('Session')}
          activeOpacity={0.7}
        >
          <View style={styles.sessionButtonDot} />
          <Text style={styles.sessionButtonText}>START SESSION</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SMART INDIA HACKATHON • DEAD RECKONING TELEMETRY (PHASE 7)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  outageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  outageBannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.error,
    marginRight: spacing.sm,
  },
  outageBannerContent: {
    flex: 1,
  },
  outageBannerTitle: {
    color: colors.status.error,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.heavy,
    letterSpacing: 1,
  },
  outageBannerText: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  appSuperTitle: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.heavy,
    letterSpacing: 1.5,
  },
  appTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  confidencePill: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.35)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 3,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  confidenceValue: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.heavy,
    fontFamily: 'monospace',
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.status.warning,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recordingBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.warning,
    marginRight: 6,
  },
  recordingBadgeText: {
    color: colors.status.warning,
    fontSize: typography.fontSizes.xs - 3,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  fusionModeContainer: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayHiddenTag: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.4)',
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overlayHiddenTagText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 4,
    fontWeight: typography.fontWeights.bold,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 1,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  debugHiddenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderColor: colors.background.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  debugHiddenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.cyan,
    marginRight: spacing.sm,
  },
  debugHiddenContent: {
    flex: 1,
  },
  debugHiddenTitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  debugHiddenText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 2,
  },
  footer: {
    marginTop: spacing.lg,
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
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.4)',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sessionButtonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.cyan,
    marginRight: spacing.sm,
  },
  sessionButtonText: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1.2,
  },
});
