import {
  DiagnosticsSnapshot,
  FusionMode,
  GnssFix,
  ImuSample,
  NavicWeight,
  RoadAnomalyEvent,
  SatelliteBreakdownEntry,
  ThermalCompensationInfo,
} from '../types/navigation';
import { VehicleKalmanFilter } from './kalmanFilter';
import { ImuPreprocessor } from './deadReckoning';
import { RoadAnomalyDetector } from './anomalyDetection';
import { computeAiInference } from './aiInference';
import { applyBiasCorrection, computeThermalCompensation } from './thermalCompensation';
import { computeNavicWeight, computeSatelliteBreakdown, assessGnssQuality, GnssQualityAssessment } from './satelliteFusion';
import { compassDegToHeadingRad, enuToLatLon, headingRadToCompassDeg, latLonToEnu } from '../utils/geo';
import { diag, columnVector, Matrix } from '../utils/matrix';
import {
  GNSS_HEADING_VARIANCE_RAD2,
  GNSS_OUTAGE_TIMEOUT_MS,
  GNSS_SPEED_VARIANCE_MPS2,
  MIN_SPEED_FOR_BEARING_MPS,
  RECENT_ANOMALIES_BUFFER,
} from '../config/constants';

const DEFAULT_THERMAL_INFO: ThermalCompensationInfo = {
  currentTempC: null,
  gyroBiasCorrection: { x: 0, y: 0, z: 0 },
  accelBiasCorrection: { x: 0, y: 0, z: 0 },
  compensationActive: false,
};

const DEFAULT_NAVIC_WEIGHT: NavicWeight = {
  navicWeight: 0,
  gpsWeight: 0,
  navicSatCount: 0,
  gpsSatCount: 0,
};

/**
 * Owns all per-session engine state: the Kalman filter, IMU preprocessor,
 * anomaly detector, and the bookkeeping needed to turn raw device samples
 * into a DiagnosticsSnapshot the frontend can render directly.
 *
 * One instance per active session — created by SessionManager on
 * `start_session` and torn down on `stop_session` / disconnect.
 */
export class NavigationEngine {
  private kf = new VehicleKalmanFilter();
  private imuPreprocessor = new ImuPreprocessor();
  private anomalyDetector = new RoadAnomalyDetector();

  private anchor: { latitude: number; longitude: number } | null = null;
  private lastGnssTimestamp: number | null = null;
  private lastGnssQuality: GnssQualityAssessment | null = null;
  private lastSatelliteBreakdown: SatelliteBreakdownEntry[] = [];
  private lastNavicWeight: NavicWeight = DEFAULT_NAVIC_WEIGHT;
  private lastThermalInfo: ThermalCompensationInfo = DEFAULT_THERMAL_INFO;

  private outageSimulated = false;
  private anomalies: RoadAnomalyEvent[] = [];
  private totalDistanceMeters = 0;
  private confidenceSum = 0;
  private confidenceSamples = 0;

  /** Feed one IMU sample through thermal compensation -> DR preprocessing -> KF predict. */
  processImu(sample: ImuSample): RoadAnomalyEvent | null {
    const { correctedGyroBias, correctedAccelBias, info } = computeThermalCompensation(sample.temperatureC);
    this.lastThermalInfo = info;

    const correctedGyro = applyBiasCorrection(sample.gyro, correctedGyroBias);
    const correctedAccel = applyBiasCorrection(sample.accel, correctedAccelBias);

    const pre = this.imuPreprocessor.process(sample, correctedGyro, correctedAccel);
    this.kf.predict(pre.forwardAccelMps2, pre.yawRateRadS, pre.dtSeconds);
    this.totalDistanceMeters += Math.abs(this.kf.v) * pre.dtSeconds;

    if (!this.anchor) return null; // can't place an anomaly on the map without a GNSS anchor yet

    const { latitude, longitude } = enuToLatLon(this.kf.x, this.kf.y, this.anchor.latitude, this.anchor.longitude);
    const anomaly = this.anomalyDetector.detect(pre.verticalAccelMps2, sample.timestamp, latitude, longitude);
    if (anomaly) {
      this.anomalies.push(anomaly);
      return anomaly;
    }
    return null;
  }

  /** Feed one GNSS fix through satellite weighting -> KF update (unless an outage is simulated). */
  processGnss(fix: GnssFix): void {
    const breakdown = computeSatelliteBreakdown(fix);
    const navicWeight = computeNavicWeight(breakdown);

    if (!this.anchor) {
      // First-ever fix of the session: anchor the local ENU plane here and
      // seed the filter's heading/speed from the fix so DR doesn't start
      // from a meaningless heading of zero.
      this.anchor = { latitude: fix.latitude, longitude: fix.longitude };
      if (typeof fix.bearingDeg === 'number') {
        this.kf.state[3][0] = compassDegToHeadingRad(fix.bearingDeg);
      }
      if (typeof fix.speedMps === 'number') {
        this.kf.state[2][0] = Math.max(0, fix.speedMps);
      }
      this.lastGnssTimestamp = fix.timestamp;
      this.lastSatelliteBreakdown = breakdown;
      this.lastNavicWeight = navicWeight;
      return;
    }

    if (this.outageSimulated) {
      // Deliberately ignore this fix end-to-end (including diagnostics) so
      // the SimulateOutageButton produces a faithful GNSS-denied scenario.
      return;
    }

    const quality = assessGnssQuality(fix, navicWeight);
    const { x, y } = latLonToEnu(fix.latitude, fix.longitude, this.anchor.latitude, this.anchor.longitude);

    // Always observe position. Layer in Doppler speed/course-over-ground
    // when the fix provides them — see constants.ts for why this matters.
    const rows: number[][] = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
    ];
    const measurements: number[] = [x, y];
    const variances: number[] = [quality.measurementVarianceMeters2, quality.measurementVarianceMeters2];
    const angleRowIndices: number[] = [];

    if (typeof fix.speedMps === 'number') {
      rows.push([0, 0, 1, 0]);
      measurements.push(Math.max(0, fix.speedMps));
      variances.push(GNSS_SPEED_VARIANCE_MPS2);
    }
    if (typeof fix.bearingDeg === 'number' && (fix.speedMps ?? 0) >= MIN_SPEED_FOR_BEARING_MPS) {
      rows.push([0, 0, 0, 1]);
      measurements.push(compassDegToHeadingRad(fix.bearingDeg));
      variances.push(GNSS_HEADING_VARIANCE_RAD2);
      angleRowIndices.push(rows.length - 1);
    }

    const H: Matrix = rows;
    this.kf.updateGeneric(H, columnVector(measurements), diag(variances), angleRowIndices);

    this.lastGnssTimestamp = fix.timestamp;
    this.lastGnssQuality = quality;
    this.lastSatelliteBreakdown = breakdown;
    this.lastNavicWeight = navicWeight;
  }

  setOutageSimulated(enabled: boolean): void {
    this.outageSimulated = enabled;
  }

  private currentFusionMode(now: number): FusionMode {
    if (this.outageSimulated) return 'DEAD_RECKONING_ONLY';
    if (this.lastGnssTimestamp === null) return 'DEAD_RECKONING_ONLY';
    if (now - this.lastGnssTimestamp > GNSS_OUTAGE_TIMEOUT_MS) return 'DEAD_RECKONING_ONLY';
    return this.lastGnssQuality?.fusionMode ?? 'FUSION';
  }

  buildSnapshot(sessionId: string, now: number): DiagnosticsSnapshot {
    const position = this.anchor
      ? enuToLatLon(this.kf.x, this.kf.y, this.anchor.latitude, this.anchor.longitude)
      : { latitude: 0, longitude: 0 };

    const fusionMode = this.currentFusionMode(now);
    const msSinceLastGnssFix = this.lastGnssTimestamp !== null ? now - this.lastGnssTimestamp : null;

    const aiInference = computeAiInference({
      positionUncertaintyMeters: this.kf.positionUncertaintyMeters,
      msSinceLastGnssFix,
      currentFusionMode: fusionMode,
    });
    this.confidenceSum += aiInference.confidenceScore;
    this.confidenceSamples += 1;

    return {
      timestamp: now,
      sessionId,
      vehicleState: {
        timestamp: now,
        latitude: position.latitude,
        longitude: position.longitude,
        headingDeg: headingRadToCompassDeg(this.kf.theta),
        speedMps: this.kf.v,
      },
      fusionMode,
      satelliteBreakdown: this.lastSatelliteBreakdown,
      navicWeight: this.lastNavicWeight,
      aiInference,
      thermalCompensation: this.lastThermalInfo,
      recentAnomalies: this.anomalies.slice(-RECENT_ANOMALIES_BUFFER),
      outageSimulated: this.outageSimulated,
      msSinceLastGnssFix,
    };
  }

  getSummaryStats() {
    return {
      distanceMeters: Math.round(this.totalDistanceMeters * 10) / 10,
      anomalyCount: this.anomalies.length,
      avgConfidenceScore:
        this.confidenceSamples > 0 ? Math.round(this.confidenceSum / this.confidenceSamples) : 0,
    };
  }

  getAllAnomalies(): RoadAnomalyEvent[] {
    return this.anomalies;
  }

  hasAnchor(): boolean {
    return this.anchor !== null;
  }
}
