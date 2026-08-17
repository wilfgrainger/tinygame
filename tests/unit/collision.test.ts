import { describe, expect, it } from 'vitest';
import { CollisionWorld } from '../../src/game/player/CollisionWorld';

const collision = new CollisionWorld(() => 2, [{ minX: 3, maxX: 5, minZ: -1, maxZ: 1 }], { x: 0, y: 2, z: 0 }, 20);

describe('CollisionWorld', () => {
  it('blocks a house collider but not open ground', () => { expect(collision.resolveMove({x:2,y:2,z:0},{x:2,y:0,z:0},0.55).x).toBe(2); expect(collision.resolveMove({x:0,y:2,z:0},{x:1,y:0,z:0},0.55).x).toBe(1); });
  it('recovers below-world positions', () => expect(collision.resolveMove({x:9,y:-30,z:9},{x:0,y:0,z:0},0.55)).toEqual({x:0,y:2,z:0}));
});
