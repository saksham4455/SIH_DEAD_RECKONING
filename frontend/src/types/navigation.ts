export type FusionMode =
  | 'GNSS_LOCKED'
  | 'GNSS_DEGRADED'
  | 'DEAD_RECKONING'
  | 'REACQUIRING';

export interface NavigationState {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  confidence: number;
  fusionMode: FusionMode;
}

export interface SensorHealth {
  accelerometer: boolean;
  gyroscope: boolean;
  magnetometer: boolean;
  gnss: boolean;
}

export interface SatelliteInfo {
  count: number;
  signalStrength: number;
}

export interface SatelliteBreakdown {
  NavIC: SatelliteInfo;
  GPS: SatelliteInfo;
  Galileo: SatelliteInfo;
  GLONASS: SatelliteInfo;
}

export interface InferenceStats {
  latencyMs: number;
  modelVersion: string;
  confidence: number;
  estimatedSpeed: number;
}

export interface AnomalyEvent {
  type: string;
  timestamp: number;
  confidence?: number;
}

export interface ThermalState {
  temperature: number;
  biasCorrection: number;
}

export interface DashboardData {
  navigationState: NavigationState;
  sensorHealth: SensorHealth;
  satelliteBreakdown: SatelliteBreakdown;
  inferenceStats: InferenceStats;
  anomalyEvents: AnomalyEvent[];
  thermalState: ThermalState;
  navicWeight: number;
  mapMatchConfidence: number;
}

// ─── Phase 6: App Navigation Types ───────────────────────────────
export type RootStackParamList = {
  Dashboard: undefined;
  Session: undefined;
};
