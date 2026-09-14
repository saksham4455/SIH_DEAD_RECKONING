"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSatelliteBreakdown = computeSatelliteBreakdown;
exports.computeNavicWeight = computeNavicWeight;
exports.assessGnssQuality = assessGnssQuality;
const constants_1 = require("../config/constants");
function uereFor(constellation) {
    if (constellation === 'GPS')
        return constants_1.UERE_METERS.GPS;
    if (constellation === 'NAVIC')
        return constants_1.UERE_METERS.NAVIC;
    return constants_1.UERE_METERS.OTHER;
}
function computeSatelliteBreakdown(fix) {
    const byConstellation = new Map();
    for (const sat of fix.satellites) {
        if (!sat.usedInFix)
            continue;
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
function computeNavicWeight(breakdown) {
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
/**
 * Blend the per-constellation UERE by their weight, scale by HDOP to get a
 * measurement sigma, and classify fix quality into a fusion mode band.
 * (DEAD_RECKONING_ONLY is decided one level up, based on fix *staleness*,
 * not fix *quality* — see sessionEngine.ts.)
 */
function assessGnssQuality(fix, navicWeight) {
    const hdop = fix.hdop ?? constants_1.DEFAULT_HDOP;
    const totalSatellitesUsed = fix.satellites.filter((s) => s.usedInFix).length;
    const blendedUere = navicWeight.navicWeight * uereFor('NAVIC') + navicWeight.gpsWeight * uereFor('GPS');
    const effectiveUere = blendedUere > 0 ? blendedUere : constants_1.UERE_METERS.OTHER;
    const sigmaMeters = effectiveUere * hdop;
    const measurementVarianceMeters2 = sigmaMeters * sigmaMeters;
    const fusionMode = totalSatellitesUsed < constants_1.MIN_SATELLITES_FOR_GOOD_FIX || hdop > constants_1.HDOP_DEGRADED_THRESHOLD
        ? 'DEGRADED'
        : 'FUSION';
    return { fusionMode, measurementVarianceMeters2, totalSatellitesUsed, hdop };
}
//# sourceMappingURL=satelliteFusion.js.map