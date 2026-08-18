import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../../src/generated/release';
import { HomeStateSchema, ProfilePatchSchema } from '../../src/shared/schemas';

describe('release metadata', () => {
  it('exposes the package version', () => expect(APP_VERSION).toBe('0.1.0'));
});

describe('strict mutation schemas', () => {
  it('rejects client-authoritative fields', () => {
    expect(() => ProfilePatchSchema.parse({ playerName: 'Willow', coins: 999 })).toThrow();
  });

  it('accepts only the bounded V0.1 home state', () => {
    expect(HomeStateSchema.parse({ lampOn: true })).toEqual({ lampOn: true });
    expect(() => HomeStateSchema.parse({ lampOn: true, inventory: [] })).toThrow();
  });
});
