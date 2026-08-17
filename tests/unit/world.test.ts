import { describe, expect, it } from 'vitest';
import { DISCOVERIES, MOUNTAIN_WAYPOINTS, ROUTES, SPAWN_POINTS, ZONES } from '../../src/game/world/WorldDefinition';
import { heightAt } from '../../src/game/world/heightfield';

describe('TinyWorld topology', () => {
  it('has exactly five authored zones and sixteen-home sprawl is not encoded', () => expect(ZONES.map((z) => z.id)).toEqual(['village-square','home-lane','woodland','mountain-rise','harbour']));
  it('makes the summit materially higher than the square', () => expect(heightAt(46,-46) - heightAt(0,0)).toBeGreaterThanOrEqual(18));
  it('uses multiple mountain switchbacks/terraces', () => expect(MOUNTAIN_WAYPOINTS.length).toBeGreaterThanOrEqual(4));
  it('keeps ordinary routes wide enough for touch traversal', () => { for (const route of ROUTES) expect(route.width).toBeGreaterThanOrEqual(6); });
  it('defines all V0.1 discoveries and spawns', () => { expect(DISCOVERIES).toHaveLength(3); expect(SPAWN_POINTS).toHaveLength(3); });
  it('has varied ground authority rather than universal groundY=0', () => expect(new Set([[0,0],[30,-30],[-40,25],[45,-45]].map(([x,z]) => Math.round(heightAt(x!,z!)*10))).size).toBeGreaterThan(2));
});
