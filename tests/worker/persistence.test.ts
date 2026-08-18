import { describe, expect, it } from 'vitest';
import { HomeStateSchema, ProfilePatchSchema } from '../../src/shared/schemas';
import type { D1DatabaseLike, D1PreparedStatement, D1Result } from '../../src/worker/env';
import { D1Store } from '../../src/worker/db/d1Store';

function failingDb(): D1DatabaseLike {
  const statement: D1PreparedStatement = {
    bind: () => statement,
    first: async <T>() => null as T | null,
    all: async <T>() => ({ success: true, results: [] as T[] }),
    run: async <T>() => { throw new Error('quota exhausted'); }
  };
  return {
    prepare: () => statement,
    batch: async <T>() => [] as D1Result<T>[]
  };
}

describe('authoritative persistence contracts', () => {
  it('rejects speculative economy state', () => {
    expect(ProfilePatchSchema.safeParse({ coins: 500 }).success).toBe(false);
  });

  it('keeps home persistence deliberately tiny', () => {
    expect(HomeStateSchema.safeParse({ lampOn: false }).success).toBe(true);
    expect(HomeStateSchema.safeParse({ lampOn: false, furniture: [] }).success).toBe(false);
  });

  it('turns a D1 write failure into SAVE_FAILED instead of fake success', async () => {
    const store = new D1Store(failingDb());
    await expect(store.saveHome('u1', { lampOn: true }, '2026-08-17T20:00:00Z')).rejects.toMatchObject({
      status: 503,
      code: 'SAVE_FAILED'
    });
  });
});
