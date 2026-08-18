import { describe, expect, it } from 'vitest';
import { applyRadialDeadzone, approachMagnitude } from '../../src/game/player/movementFeel';

describe('movement feel', () => {
  it('kills tiny joystick drift and remaps useful input smoothly', () => {
    expect(applyRadialDeadzone(0.05, -0.04, 0.12)).toEqual({ x: 0, y: 0, magnitude: 0 });

    const mid = applyRadialDeadzone(0.5, 0, 0.12);
    expect(mid.x).toBeGreaterThan(0.4);
    expect(mid.x).toBeLessThan(0.5);
    expect(mid.y).toBeCloseTo(0, 6);
    expect(mid.magnitude).toBeCloseTo(mid.x, 6);

    const full = applyRadialDeadzone(1, 0, 0.12);
    expect(full.x).toBeCloseTo(1, 6);
    expect(full.magnitude).toBeCloseTo(1, 6);
  });

  it('accelerates quickly and releases even faster without overshooting', () => {
    const accelerated = approachMagnitude(0, 1, 1 / 60, 12, 18);
    expect(accelerated).toBeGreaterThan(0);
    expect(accelerated).toBeLessThan(1);

    const released = approachMagnitude(0.5, 0, 1 / 60, 12, 18);
    expect(released).toBeLessThan(0.5);
    expect(0.5 - released).toBeGreaterThan(accelerated);

    expect(approachMagnitude(0.99, 1, 1, 12, 18)).toBe(1);
    expect(approachMagnitude(0.01, 0, 1, 12, 18)).toBe(0);
  });
});
