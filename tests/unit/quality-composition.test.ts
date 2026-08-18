import { describe, expect, it } from 'vitest';
import { QUALITY_COMPOSITION } from '../../src/game/world/qualityComposition';

const REQUIRED_ZONES = ['woodland', 'mountain-rise', 'harbour', 'home-lane'] as const;

describe('20x quality composition', () => {
  it('gives every outer zone an anchor and multiple authored clusters', () => {
    for (const zoneId of REQUIRED_ZONES) {
      const zone = QUALITY_COMPOSITION[zoneId];
      expect(zone.anchor.name.length).toBeGreaterThan(3);
      expect(Number.isFinite(zone.anchor.x)).toBe(true);
      expect(Number.isFinite(zone.anchor.z)).toBe(true);
      expect(zone.clusters.length).toBeGreaterThanOrEqual(2);
      expect(zone.clusters.every((cluster) => cluster.elements.length >= 2)).toBe(true);
    }
  });

  it('keeps every authored element deterministic and explicitly typed', () => {
    for (const zone of Object.values(QUALITY_COMPOSITION)) {
      for (const cluster of zone.clusters) {
        expect(cluster.id.length).toBeGreaterThan(3);
        for (const element of cluster.elements) {
          expect(['tree', 'pine', 'bush', 'rock', 'post', 'lantern', 'bench', 'flower', 'plank']).toContain(element.kind);
          expect(Number.isFinite(element.x)).toBe(true);
          expect(Number.isFinite(element.z)).toBe(true);
          expect(element.scale).toBeGreaterThan(0);
        }
      }
    }
  });
});
