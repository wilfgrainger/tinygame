import { describe, expect, it } from 'vitest';
import { bikeLeanDegrees, raftPose, steerResponse, wakeStrength } from '../../src/game/vehicles/vehicleFeel';

describe('vehicle feel helpers', () => {
  it('makes steering speed-aware without becoming twitchy at rest', () => {
    const slow = steerResponse(1, 0.05, 0.55, 1.7);
    const fast = steerResponse(1, 1, 0.55, 1.7);
    expect(slow).toBeGreaterThanOrEqual(0.55);
    expect(fast).toBeCloseTo(1.7, 6);
    expect(fast).toBeGreaterThan(slow);
  });

  it('keeps bike lean subtle at low speed and bounded at full speed', () => {
    expect(Math.abs(bikeLeanDegrees(1, 0.05))).toBeLessThan(3);
    expect(bikeLeanDegrees(1, 1)).toBeLessThanOrEqual(12);
    expect(bikeLeanDegrees(-1, 1)).toBeGreaterThanOrEqual(-12);
  });

  it('gives the raft calm bounded water motion and a speed-based wake', () => {
    const idle = raftPose(1.25, 0, 0);
    const moving = raftPose(1.25, 1, 1);
    expect(Math.abs(idle.bob)).toBeLessThanOrEqual(0.06);
    expect(Math.abs(moving.roll)).toBeLessThanOrEqual(3.5);
    expect(Math.abs(moving.pitch)).toBeLessThanOrEqual(2.5);
    expect(wakeStrength(0.05)).toBe(0);
    expect(wakeStrength(1)).toBe(1);
  });
});
