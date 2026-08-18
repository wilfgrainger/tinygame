import { describe, expect, it } from 'vitest';
import { cameraRelativeMove, facingYawForMovement, applyCameraLook } from '../../src/game/player/controlModel';

describe('simple third-person control model', () => {
  it('moves forward in the direction the camera is looking', () => {
    const forwardNorth = cameraRelativeMove(0, 1, 0);
    expect(forwardNorth.x).toBeCloseTo(0, 6);
    expect(forwardNorth.z).toBeCloseTo(-1, 6);

    const forwardEast = cameraRelativeMove(0, 1, Math.PI / 2);
    expect(forwardEast.x).toBeCloseTo(1, 6);
    expect(forwardEast.z).toBeCloseTo(0, 6);
  });

  it('faces the actual travel direction and preserves facing while stationary', () => {
    expect(facingYawForMovement({ x: 1, z: 0 }, 0)).toBeCloseTo(Math.PI / 2, 6);
    expect(facingYawForMovement({ x: 0, z: 1 }, 0)).toBeCloseTo(Math.PI, 6);
    expect(facingYawForMovement({ x: 0, z: 0 }, 1.25)).toBeCloseTo(1.25, 6);
  });

  it('changes camera yaw and pitch without changing avatar facing', () => {
    const camera = applyCameraLook({ yaw: 0.4, pitch: -18 }, 120, -40);
    expect(camera.yaw).not.toBeCloseTo(0.4, 6);
    expect(camera.pitch).not.toBeCloseTo(-18, 6);
    expect(camera.pitch).toBeGreaterThanOrEqual(-55);
    expect(camera.pitch).toBeLessThanOrEqual(20);
  });
});
