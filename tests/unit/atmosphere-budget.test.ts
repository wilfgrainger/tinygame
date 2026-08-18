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
    expect(pool.activeCount).toBe(2);

    pool.release(first!);
    expect(pool.activeCount).toBe(1);
    expect(pool.acquire()).toBe(first);
    expect(pool.activeCount).toBe(2);
    expect(created).toBe(2);
  });

  it('keeps release idempotent so lifecycle cleanup cannot corrupt capacity', () => {
    const pool = new FixedPool(1, () => ({ id: 1 }));
    const item = pool.acquire();
    expect(item).not.toBeNull();
    pool.release(item!);
    pool.release(item!);
    expect(pool.activeCount).toBe(0);
    expect(pool.acquire()).toBe(item);
  });
});
