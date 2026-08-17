import { describe, expect, it } from 'vitest';
import { HomeStateSchema, ProfilePatchSchema } from '../../src/shared/schemas';

describe('authoritative persistence contracts', () => {
  it('rejects speculative economy state', () => {
    expect(ProfilePatchSchema.safeParse({ coins: 500 }).success).toBe(false);
  });

  it('keeps home persistence deliberately tiny', () => {
    expect(HomeStateSchema.safeParse({ lampOn: false }).success).toBe(true);
    expect(HomeStateSchema.safeParse({ lampOn: false, furniture: [] }).success).toBe(false);
  });
});
