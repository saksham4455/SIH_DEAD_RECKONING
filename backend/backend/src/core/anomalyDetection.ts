import { v4 as uuidv4 } from 'uuid';
import { AnomalySeverity, RoadAnomalyEvent } from '../types/navigation';
import { ANOMALY_MIN_INTERVAL_MS, ANOMALY_THRESHOLD_MPS2, ANOMALY_WINDOW_SIZE } from '../config/constants';

function classifySeverity(magnitude: number): AnomalySeverity | null {
  if (magnitude >= ANOMALY_THRESHOLD_MPS2.HIGH) return 'HIGH';
  if (magnitude >= ANOMALY_THRESHOLD_MPS2.MEDIUM) return 'MEDIUM';
  if (magnitude >= ANOMALY_THRESHOLD_MPS2.LOW) return 'LOW';
  return null;
}

/**
 * Detects potholes/speed bumps from spikes in gravity-removed vertical
 * acceleration. Keeps a short rolling baseline so the threshold adapts
 * a little to generally rough vs generally smooth road surfaces, then
 * debounces so a single bump doesn't fire repeated events as it rings down.
 */
export class RoadAnomalyDetector {
  private window: number[] = [];
  private lastEventAt = 0;

  detect(verticalAccelMps2: number, timestamp: number, latitude: number, longitude: number): RoadAnomalyEvent | null {
    this.window.push(Math.abs(verticalAccelMps2));
    if (this.window.length > ANOMALY_WINDOW_SIZE) this.window.shift();

    const baseline = this.window.reduce((s, v) => s + v, 0) / this.window.length;
    const deviation = Math.abs(verticalAccelMps2) - baseline;

    const severity = classifySeverity(deviation);
    if (!severity) return null;
    if (timestamp - this.lastEventAt < ANOMALY_MIN_INTERVAL_MS) return null;

    this.lastEventAt = timestamp;
    return {
      id: uuidv4(),
      timestamp,
      latitude,
      longitude,
      severity,
      verticalAccelMps2,
    };
  }
}
