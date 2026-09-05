import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { mockDashboardData } from '../data/mockData';

// Navigation components
import { NavigationMap } from '../components/navigation/NavigationMap';

// Diagnostic components (composed directly — Phase 5)
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

export const DashboardScreen: React.FC = () => {
  // Ingest static mock data for Phase 5
  const data = mockDashboardData;
  const { navigationState, mapMatchConfidence } = data;

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
        {/* 1. HEADER SECTION                                         */}
        {/* ========================================================= */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.appSuperTitle}>SIH 2026 // DEAD RECKONING</Text>
              <Text style={styles.appTitle}>Telemetry Dashboard</Text>
            </View>
            <View style={styles.confidencePill}>
              <Text style={styles.confidenceLabel}>FUSION CONF</Text>
              <Text style={styles.confidenceValue}>{confidencePercent}%</Text>
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

        {/*
          NavigationMap internally renders VehicleMarker.
          Architecture: DashboardScreen → NavigationMap → VehicleMarker
        */}
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
            subtitle="GNSS + EKF Estimated Fix"
            accentColor={colors.constellations.GPS}
          />
          <StatCard
            label="MAP MATCH"
            value={`${(mapMatchConfidence * 100).toFixed(0)}%`}
            subtitle="Road Network Alignment"
            accentColor={colors.status.healthy}
          />
        </View>

        {/* ========================================================= */}
        {/* 4. DIAGNOSTICS SECTION                                    */}
        {/* ========================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SYSTEM DIAGNOSTICS</Text>
          <Text style={styles.sectionSubtitle}>Sensors, Constellations &amp; Edge AI</Text>
        </View>

        {/* Hardware sensor health — uses StatusBadge internally */}
        <SensorHealthBar sensorHealth={data.sensorHealth} />

        {/* Multi-GNSS constellation reception */}
        <SatelliteBreakdown satelliteBreakdown={data.satelliteBreakdown} />

        {/* NavIC fusion weight indicator */}
        <NavicWeightIndicator navicWeight={data.navicWeight} />

        {/* AI / Visual odometry inference panel */}
        <AiInferencePanel inferenceStats={data.inferenceStats} />

        {/* Thermal bias compensation & map-match confidence */}
        <ThermalCompensationCard
          thermalState={data.thermalState}
          mapMatchConfidence={mapMatchConfidence}
        />

        {/* Road surface anomaly event ticker */}
        <RoadAnomalyTicker anomalyEvents={data.anomalyEvents} />

        {/* ========================================================= */}
        {/* 5. SESSION & DEMO CONTROLS (PLACEHOLDER)                  */}
        {/* ========================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SESSION CONTROLS</Text>
          <Text style={styles.sectionSubtitle}>Simulation &amp; Scenario Testing</Text>
        </View>

        <SessionControls />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SMART INDIA HACKATHON • DEAD RECKONING TELEMETRY (PHASE 5)
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
  header: {
    marginBottom: spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
  fusionModeContainer: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
});
