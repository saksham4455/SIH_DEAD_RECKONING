import { computeAiInference } from '../core/aiInference';

describe('computeAiInference', () => {
  it('gives high confidence with low drift and active fusion', () => {
    const result = computeAiInference({
      positionUncertaintyMeters: 1,
      msSinceLastGnssFix: 200,
      currentFusionMode: 'FUSION',
    });
    expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
  });

  it('penalizes prolonged dead reckoning', () => {
    const short = computeAiInference({
      positionUncertaintyMeters: 5,
      msSinceLastGnssFix: 1000,
      currentFusionMode: 'DEAD_RECKONING_ONLY',
    });
    const long = computeAiInference({
      positionUncertaintyMeters: 5,
      msSinceLastGnssFix: 30000,
      currentFusionMode: 'DEAD_RECKONING_ONLY',
    });
    expect(long.confidenceScore).toBeLessThan(short.confidenceScore);
  });

  it('clamps the score into [0, 100]', () => {
    const result = computeAiInference({
      positionUncertaintyMeters: 1000,
      msSinceLastGnssFix: 600000,
      currentFusionMode: 'DEAD_RECKONING_ONLY',
    });
    expect(result.confidenceScore).toBe(0);
  });
});
