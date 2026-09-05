import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SatelliteBreakdown as SatelliteBreakdownType,
  InferenceStats,
  AnomalyEvent,
  ThermalState,
  SensorHealth,
} from '../../types/navigation';
import { SensorHealthBar } from './SensorHealthBar';
import { SatelliteBreakdown } from './SatelliteBreakdown';
import { NavicWeightIndicator } from './NavicWeightIndicator';
import { AiInferencePanel } from './AiInferencePanel';
import { ThermalCompensationCard } from './ThermalCompensationCard';
import { RoadAnomalyTicker } from './RoadAnomalyTicker';
import { spacing } from '../../theme/spacing';

interface DiagnosticPanelProps {
  sensorHealth: SensorHealth;
  satelliteBreakdown: SatelliteBreakdownType;
  navicWeight: number;
  inferenceStats: InferenceStats;
  thermalState: ThermalState;
  anomalyEvents: AnomalyEvent[];
  mapMatchConfidence?: number;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  sensorHealth,
  satelliteBreakdown,
  navicWeight,
  inferenceStats,
  thermalState,
  anomalyEvents,
  mapMatchConfidence,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Hardware Sensor Health Status */}
      <SensorHealthBar sensorHealth={sensorHealth} />

      {/* 2. Satellite Breakdown */}
      <SatelliteBreakdown satelliteBreakdown={satelliteBreakdown} />

      {/* 3. NavIC Weight Indicator */}
      <NavicWeightIndicator navicWeight={navicWeight} />

      {/* 4. AI Inference Panel */}
      <AiInferencePanel inferenceStats={inferenceStats} />

      {/* 5. Thermal State & Bias Compensation */}
      <ThermalCompensationCard
        thermalState={thermalState}
        mapMatchConfidence={mapMatchConfidence}
      />

      {/* 6. Road Anomaly Ticker */}
      <RoadAnomalyTicker anomalyEvents={anomalyEvents} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.sm,
  },
});
