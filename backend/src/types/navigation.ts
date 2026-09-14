/**
 * Domain types shared between the fusion engine, the API/WebSocket layer,
 * and (mirrored 1:1) the frontend's `src/types/navigation.ts`. Keeping the
 * two in sync is what lets the mobile app consume backend payloads without
 * any runtime translation layer.
 */

export type ConstellationType = 'GPS' | 'NAVIC' | 'OTHER';

export type FusionMode = 'FUSION' | 'DEGRADED' | 'DEAD_RECKONING_ONLY';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * One raw IMU sample from the device. Accelerometer is device-frame,
 * gravity-INCLUDED (i.e. straight off the sensor) — gravity/bias removal
 * happens in the engine, not on the client, so the server sees the same
 * raw numbers regardless of device.
 */
export interface ImuSample {
  timestamp: number; // ms epoch, device clock
  gyro: Vector3; // rad/s
  accel: Vector3; // m/s^2, gravity included
  temperatureC?: number | null; // ambient/IMU die temperature if the device exposes it
}

export interface SatelliteInfo {
  constellation: ConstellationType;
  svId?: number;
  snrDbHz: number;
  usedInFix: boolean;
}

export interface GnssFix {
  timestamp: number; // ms epoch
  latitude: number;
  longitude: number;
  altitude?: number;
  speedMps?: number; // Doppler-derived ground speed, if the chipset/OS exposes it
  bearingDeg?: number; // Doppler-derived course-over-ground, compass degrees
  hdop?: number;
  satellites: SatelliteInfo[];
}

export interface SatelliteBreakdownEntry {
  constellation: ConstellationType;
  satelliteCount: number;
  avgSnrDbHz: number;
}

export interface NavicWeight {
  navicWeight: number;
  gpsWeight: number;
  navicSatCount: number;
  gpsSatCount: number;
}

export interface ThermalCompensationInfo {
  currentTempC: number | null;
  gyroBiasCorrection: Vector3;
  accelBiasCorrection: Vector3;
  compensationActive: boolean;
}

export interface RoadAnomalyEvent {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  severity: AnomalySeverity;
  verticalAccelMps2: number;
}

export interface VehicleState {
  timestamp: number;
  latitude: number;
  longitude: number;
  headingDeg: number; // compass bearing, 0 = North, clockwise
  speedMps: number;
}

export interface AiInference {
  confidenceScore: number; // 0-100
  driftEstimateMeters: number; // 1-sigma position uncertainty
  recommendation: string;
}

/** Broadcast to clients at DIAGNOSTICS_BROADCAST_INTERVAL_MS — the single payload SessionScreen renders. */
export interface DiagnosticsSnapshot {
  timestamp: number;
  sessionId: string;
  vehicleState: VehicleState;
  fusionMode: FusionMode;
  satelliteBreakdown: SatelliteBreakdownEntry[];
  navicWeight: NavicWeight;
  aiInference: AiInference;
  thermalCompensation: ThermalCompensationInfo;
  recentAnomalies: RoadAnomalyEvent[];
  outageSimulated: boolean;
  msSinceLastGnssFix: number | null;
}

export interface SessionSummary {
  id: string;
  startedAt: number;
  endedAt: number | null;
  distanceMeters: number;
  anomalyCount: number;
  avgConfidenceScore: number;
}

export interface SessionDetail extends SessionSummary {
  track: VehicleState[];
  anomalies: RoadAnomalyEvent[];
}

export interface DashboardAggregate {
  totalSessions: number;
  totalDistanceMeters: number;
  totalAnomalies: number;
  avgConfidenceScore: number;
  recentSessions: SessionSummary[];
}
