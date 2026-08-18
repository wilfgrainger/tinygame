import { describe, expect, it } from 'vitest';
import { sampleTerrainRoad } from '../../src/game/world/roadGeometry';
import { heightAt } from '../../src/game/world/heightfield';

describe('terrain-following roads', () => {
  it('breaks a long road into short spans whose centres follow terrain height', () => {
    const spans = sampleTerrainRoad(
      { x: 0, z: -36 },
      { x: 0, z: 36 },
      9.5,
      heightAt,
      { maxSpanLength: 4, surfaceOffset: 0.09 }
    );

    expect(spans.length).toBeGreaterThan(12);
    for (const span of spans) {
      expect(span.length).toBeLessThanOrEqual(4.01);
      expect(span.y).toBeCloseTo(heightAt(span.x, span.z) + 0.09, 4);
      expect(span.width).toBe(9.5);
    }

    const uniqueHeights = new Set(spans.map((span) => span.y.toFixed(2)));
    expect(uniqueHeights.size).toBeGreaterThan(2);
  });
});
