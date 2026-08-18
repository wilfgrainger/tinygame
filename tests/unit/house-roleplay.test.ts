import { describe, expect, it } from 'vitest';
import { HouseManager } from '../../src/game/home/HouseManager';
import { InteractionSystem } from '../../src/game/world/InteractionSystem';

describe('V0.1 home semantics', () => {
  it('treats the house as the player home without fake claim or lock state', () => {
    const house = new HouseManager();
    const result = house.claim('Tiny Tester');
    expect(result.message).toBe('🏠 Welcome home, Tiny Tester!');
    expect(house.isClaimed).toBe(false);
    expect(house.isLocked).toBe(false);
    expect(house.owner).toBeNull();
  });

  it('normalises the legacy houseClaim interaction to an honest home prompt', () => {
    const interactions = new InteractionSystem();
    interactions.register({
      id: 'houseClaim',
      label: 'Claim House 🏠',
      position: { x: 0, y: 0, z: 0 },
      radius: 2,
      run: () => undefined
    });
    expect(interactions.nearest({ x: 0, y: 0, z: 0 })?.label).toBe('Welcome Home 🏠');
  });
});
