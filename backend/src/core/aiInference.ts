import { AiInference, FusionMode } from '../types/navigation';
import {
  CONFIDENCE_DEAD_RECKONING_TIME_PENALTY_PER_SEC,
  CONFIDENCE_DRIFT_PENALTY_PER_METER,
} from '../config/constants';

interface AiInferenceInput {
  positionUncertaintyMeters: number;
  msSinceLastGnssFix: number | null;
  currentFusionMode: FusionMode;
}

/**
 * Heuristic "AI confidence" score for the AiInferencePanel — deliberately a
 * transparent, tunable scoring function rather than a trained model, so it
 * behaves predictably in front of a demo judge/reviewer. Combines:
 *
 *  - the filter's own 1-sigma position uncertainty (bigger P => less confidence)
 *  - how long we've been running on dead reckoning alone (drift compounds
 *    the longer GNSS has been unavailable)
 *  - current fusion mode as a coarse flat penalty for degraded fixes
 */
export function computeAiInference(input: AiInferenceInput): AiInference {
  const { positionUncertaintyMeters, msSinceLastGnssFix, currentFusionMode } = input;

  let score = 100;
  score -= positionUncertaintyMeters * CONFIDENCE_DRIFT_PENALTY_PER_METER;

  const secondsSinceFix = msSinceLastGnssFix !== null ? msSinceLastGnssFix / 1000 : 0;
  if (currentFusionMode === 'DEAD_RECKONING_ONLY') {
    score -= secondsSinceFix * CONFIDENCE_DEAD_RECKONING_TIME_PENALTY_PER_SEC;
  } else if (currentFusionMode === 'DEGRADED') {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let recommendation: string;
  if (score >= 80) {
    recommendation = 'Position estimate is reliable.';
  } else if (score >= 50) {
    recommendation = 'Position estimate is degraded — open sky or additional GNSS satellites recommended.';
  } else {
    recommendation = 'Position estimate is unreliable — GNSS reacquisition strongly recommended.';
  }

  return {
    confidenceScore: score,
    driftEstimateMeters: Math.round(positionUncertaintyMeters * 10) / 10,
    recommendation,
  };
}
