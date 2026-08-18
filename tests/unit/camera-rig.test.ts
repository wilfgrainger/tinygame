import { describe, expect, it } from 'vitest';
import { cameraTarget, followAlpha } from '../../src/game/player/cameraRig';

describe('third-person camera rig', () => {
  it('keeps the camera behind the camera heading and looks above the player centre', () => {
    const target = cameraTarget({ x: 10, y: 2, z: 20 }, 0, -18, 16 / 9, false);
    expect(target.position.x).toBeCloseTo(10, 6);
    expect(target.position.z).toBeGreaterThan(20);
    expect(target.lookAt.x).toBe(10);
    expect(target.lookAt.y).toBeGreaterThan(3);
    expect(target.lookAt.z).toBe(20);
  });

  it('uses a wider portrait distance without changing movement semantics', () => {
    const landscape = cameraTarget({ x: 0, y: 0, z: 0 }, 0, -18, 16 / 9, false);
    const portrait = cameraTarget({ x: 0, y: 0, z: 0 }, 0, -18, 9 / 16, false);
    const landscapeDistance = Math.hypot(landscape.position.x, landscape.position.z);
    const portraitDistance = Math.hypot(portrait.position.x, portrait.position.z);
    expect(portraitDistance).toBeGreaterThan(landscapeDistance);
  });

  it('uses frame-rate independent follow damping', () => {
    const at60 = followAlpha(1 / 60, 12);
    const at30 = followAlpha(1 / 30, 12);
    expect(at60).toBeGreaterThan(0);
    expect(at60).toBeLessThan(1);
    expect(at30).toBeGreaterThan(at60);
    expect(1 - Math.pow(1 - at60, 2)).toBeCloseTo(at30, 5);
  });
});
