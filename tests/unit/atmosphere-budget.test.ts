import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FixedPool } from '../../src/game/world/particlePool';

describe('mobile atmosphere budget', () => {
  it('caps allocations and reuses released items', () => {
    let created = 0;
    const pool = new FixedPool(2, () => ({ id: ++created }));
    const first = pool.acquire();
    const second = pool.acquire();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(pool.acquire()).toBeNull();
    expect(created).toBe(2);

    pool.release(first!);
    expect(pool.acquire()).toBe(first);
    expect(created).toBe(2);
  });

  it('does not destroy particle entities during the normal atmosphere lifecycle', () => {
    const source = readFileSync('src/game/world/Atmosphere.ts', 'utf8');
    expect(source).not.toContain('.entity.destroy()');
    expect(source).not.toContain('new pc.Vec3(p.velocity.x * dt');
  });
});
