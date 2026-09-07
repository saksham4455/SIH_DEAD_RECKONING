import { NavigationEngine } from '../core/navigationEngine';
import { GnssFix, ImuSample } from '../types/navigation';

function imuSample(t: number, forwardAccel = 0, yawRate = 0): ImuSample {
  return {
    timestamp: t,
    accel: { x: forwardAccel, y: 0, z: 9.80665 },
    gyro: { x: 0, y: 0, z: yawRate },
    temperatureC: 25,
  };
}

function gnssFix(t: number, lat: number, lon: number): GnssFix {
  return {
    timestamp: t,
    latitude: lat,
    longitude: lon,
    speedMps: 5,
    bearingDeg: 90,
    hdop: 1.2,
    satellites: [
      { constellation: 'GPS', snrDbHz: 40, usedInFix: true },
      { constellation: 'GPS', snrDbHz: 38, usedInFix: true },
      { constellation: 'NAVIC', snrDbHz: 35, usedInFix: true },
      { constellation: 'GPS', snrDbHz: 33, usedInFix: true },
      { constellation: 'GPS', snrDbHz: 30, usedInFix: true },
    ],
  };
}

describe('NavigationEngine', () => {
  it('has no anchor before the first GNSS fix', () => {
    const engine = new NavigationEngine();
    expect(engine.hasAnchor()).toBe(false);
    engine.processImu(imuSample(0));
    engine.processImu(imuSample(100));
    expect(engine.hasAnchor()).toBe(false); // IMU alone never anchors
  });

  it('anchors on the first GNSS fix and starts producing anomaly-eligible positions', () => {
    const engine = new NavigationEngine();
    engine.processGnss(gnssFix(0, 28.6139, 77.209));
    expect(engine.hasAnchor()).toBe(true);

    const snapshot = engine.buildSnapshot('s1', 0);
    expect(snapshot.vehicleState.latitude).toBeCloseTo(28.6139, 3);
    expect(snapshot.vehicleState.longitude).toBeCloseTo(77.209, 3);
  });

  it('falls back to DEAD_RECKONING_ONLY after the GNSS timeout elapses', () => {
    const engine = new NavigationEngine();
    engine.processGnss(gnssFix(0, 28.6139, 77.209));
    const snapshotFresh = engine.buildSnapshot('s1', 500);
    expect(snapshotFresh.fusionMode).not.toBe('DEAD_RECKONING_ONLY');

    const snapshotStale = engine.buildSnapshot('s1', 10000);
    expect(snapshotStale.fusionMode).toBe('DEAD_RECKONING_ONLY');
  });

  it('ignores GNSS fixes entirely while an outage is simulated', () => {
    const engine = new NavigationEngine();
    engine.processGnss(gnssFix(0, 28.6139, 77.209));
    engine.setOutageSimulated(true);
    engine.processGnss(gnssFix(1000, 29.0, 78.0)); // should be dropped

    const snapshot = engine.buildSnapshot('s1', 1000);
    expect(snapshot.outageSimulated).toBe(true);
    expect(snapshot.fusionMode).toBe('DEAD_RECKONING_ONLY');
    // Position should not have jumped toward the ignored fix.
    expect(snapshot.vehicleState.latitude).toBeCloseTo(28.6139, 2);
  });

  it('accumulates distance as IMU samples drive the filter forward', () => {
    const engine = new NavigationEngine();
    engine.processGnss(gnssFix(0, 28.6139, 77.209));
    for (let i = 1; i <= 50; i++) {
      engine.processImu(imuSample(i * 100, 1)); // steady forward acceleration
    }
    const stats = engine.getSummaryStats();
    expect(stats.distanceMeters).toBeGreaterThan(0);
  });
});
