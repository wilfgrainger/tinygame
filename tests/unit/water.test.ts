import { describe, expect, it } from 'vitest';
import { WaterSystem } from '../../src/game/water/WaterSystem';

describe('WaterSystem', () => {
  const water=new WaterSystem({minX:10,maxX:20,minZ:30,maxZ:40},-1.5);
  it('identifies bounded water and clamps vehicles away from edge', () => { expect(water.contains(15,35)).toBe(true); expect(water.contains(2,35)).toBe(false); expect(water.clamp(50,35,2).x).toBe(18); });
});
