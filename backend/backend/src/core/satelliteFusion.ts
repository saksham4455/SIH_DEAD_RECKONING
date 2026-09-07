import {
  ConstellationType,
  FusionMode,
  GnssFix,
  NavicWeight,
  SatelliteBreakdownEntry,
} from '../types/navigation';
import {
  DEFAULT_HDOP,
  HDOP_DEGRADED_THRESHOLD,
  MIN_SATELLITES_FOR_GOOD_FIX,
  UERE_METERS,
} from '../config/constants';

function uereFor(constellation: ConstellationType): number {
  if (constellation === 'GPS') return UERE_METERS.GPS;
  if (constellation === 'NAVIC') return UERE_METERS.NAVIC;
  return UERE_METERS.OTHER;
}

export function computeSatelliteBreakdown(fix: GnssFix): SatelliteBreakdownEntry[] {
  const byConstellation = new Map<ConstellationType, { count: number; snrSum: number }>();
  for (const sat of fix.satellites) {
    if (!sat.usedInFix) continue;
    const entry = byConstellation.get(sat.constellation) ?? { count: 0, snrSum: 0 };
    entry.count += 1;
    entry.snrSum += sat.snrDbHz;
    byConstellation.set(sat.constellation, entry);
  }
  return Array.from(byConstellation.entries()).map(([constellation, { count, snrSum }]) => ({
    constellation,
    satelliteCount: count,
    avgSnrDbHz: count > 0 ? snrSum / count : 0,
  }));
}

/**
 * Weight each constellation by (satellite count * average SNR), normalized.
 * This is a simple but reasonable proxy for "how much this constellation is
 * contributing to fix quality" without needing the receiver's internal
 * least-squares weighting matrix.
 */
export function computeNavicWeight(breakdown: SatelliteBreakdownEntry[]): NavicWeight {
  const navic = breakdown.find((b) => b.constellation === 'NAVIC');
  const gps = breakdown.find((b) => b.constellation === 'GPS');

  const navicScore = navic ? navic.satelliteCount * Math.max(navic.avgSnrDbHz, 1) : 0;
  const gpsScore = gps ? gps.satelliteCount * Math.max(gps.avgSnrDbHz, 1) : 0;
  const total = navicScore + gpsScore;

  return {
    navicWeight: total > 0 ? navicScore / total : 0,
    gpsWeight: total > 0 ? gpsScore / total : 0,
    navicSatCount: navic?.satelliteCount ?? 0,
    gpsSatCount: gps?.satelliteCount ?? 0,
  };
}

export interface GnssQualityAssessment {
  fusionMode: Extract<FusionMode, 'FUSION' | 'DEGRADED'>;
  measurementVarianceMeters2: number;
  totalSatellitesUsed: number;
  hdop: number;
}

/**
 * Blend the per-constellation UERE by their weight, scale by HDOP to get a
 * measurement sigma, and classify fix quality into a fusion mode band.
 * (DEAD_RECKONING_ONLY is decided one level up, based on fix *staleness*,
 * not fix *quality* — see sessionEngine.ts.)
 */
export function assessGnssQuality(fix: GnssFix, navicWeight: NavicWeight): GnssQualityAssessment {
  const hdop = fix.hdop ?? DEFAULT_HDOP;
  const totalSatellitesUsed = fix.satellites.filter((s) => s.usedInFix).length;

  const blendedUere =
    navicWeight.navicWeight * uereFor('NAVIC') + navicWeight.gpsWeight * uereFor('GPS');
  const effectiveUere = blendedUere > 0 ? blendedUere : UERE_METERS.OTHER;

  const sigmaMeters = effectiveUere * hdop;
  const measurementVarianceMeters2 = sigmaMeters * sigmaMeters;

  const fusionMode: GnssQualityAssessment['fusionMode'] =
    totalSatellitesUsed < MIN_SATELLITES_FOR_GOOD_FIX || hdop > HDOP_DEGRADED_THRESHOLD
      ? 'DEGRADED'
      : 'FUSION';

  return { fusionMode, measurementVarianceMeters2, totalSatellitesUsed, hdop };
}
