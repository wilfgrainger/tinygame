import { describe, expect, it } from 'vitest';
import { CollisionWorld } from '../../src/game/player/CollisionWorld';

const collision = new CollisionWorld(() => 2, [{ minX: 3, maxX: 5, minZ: -1, maxZ: 1 }], { x: 0, y: 2, z: 0 }, 20);

describe('CollisionWorld', () => {
  it('blocks a house collider but not open ground', () => {
    expect(collision.resolveMove({ x: 2, y: 2, z: 0 }, { x: 2, y: 0, z: 0 }, 0.55).x).toBe(2);
    expect(collision.resolveMove({ x: 0, y: 2, z: 0 }, { x: 1, y: 0, z: 0 }, 0.55).x).toBe(1);
  });

  it('recovers below-world positions', () => {
    expect(collision.resolveMove({ x: 9, y: -30, z: 9 }, { x: 0, y: 0, z: 0 }, 0.55)).toEqual({ x: 0, y: 2, z: 0 });
  });

  it('rejects an abrupt terrain step instead of snapping the mover up a cliff', () => {
    const cliff = new CollisionWorld((x) => (x >= 1 ? 3 : 0), [], { x: 0, y: 0, z: 0 }, 20);
    const next = cliff.resolveMove({ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, 0.55);
    expect(next.x).toBe(0);
    expect(next.y).toBe(0);
  });

  it('allows a gentle terrain change within the configured step budget', () => {
    const slope = new CollisionWorld((x) => x * 0.2, [], { x: 0, y: 0, z: 0 }, 20);
    const next = slope.resolveMove(
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
      0.55,
      { maxStepHeight: 0.5 }
    );
    expect(next.x).toBe(2);
    expect(next.y).toBeCloseTo(0.4);
  });
});
