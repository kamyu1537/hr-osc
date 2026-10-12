import { describe, expect, it } from 'vitest';
import { heartRatePercent } from './service';

describe('heartRatePercent', () => {
  it('divides heart rate by max heart rate', () => {
    expect(heartRatePercent(100, 200)).toBe(0.5);
  });

  it('clamps heart rate above max to 1', () => {
    expect(heartRatePercent(250, 200)).toBe(1);
  });

  it('clamps negative heart rate to 0', () => {
    expect(heartRatePercent(-10, 200)).toBe(0);
  });

  it('returns 0 when max heart rate is 0', () => {
    expect(heartRatePercent(100, 0)).toBe(0);
  });
});
