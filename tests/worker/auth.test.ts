import { beforeEach, describe, expect, it } from 'vitest';
import type { DiscoveryId } from '../../src/shared/ids';
import type { HomeState, ProfilePatch } from '../../src/shared/schemas';
import type { PlayerProfile, WorldBootstrap } from '../../src/shared/api';
import type { Env } from '../../src/worker/env';
import type { GoogleIdentity, GoogleVerifier } from '../../src/worker/auth/google';
import type { SessionRecord, Store, UserRecord } from '../../src/worker/db/store';
import { createRouter } from '../../src/worker/router';

class MemoryStore implements Store {
  user: UserRecord | null = null;
  sessions = new Map<string, SessionRecord>();
  profile: PlayerProfile | null = null;
  discoveries = new Set<DiscoveryId>();
  home: HomeState = { lampOn: false };
  attempts = 0;

  async upsertGoogleUser(identity: GoogleIdentity, now: string): Promise<UserRecord> {
    this.user ??= { id: 'u1', email: identity.email, displayName: identity.name };
    this.profile ??= { userId: 'u1', schemaVersion: 1, playerName: identity.name || 'Tiny Explorer', lastSpawnId: 'village-square', createdAt: now, updatedAt: now };
    return this.user;
  }
  async createSession(userId: string, tokenHash: string, _createdAt: string, expiresAt: string): Promise<void> { this.sessions.set(tokenHash, { userId, expiresAt }); }
  async getSession(tokenHash: string): Promise<SessionRecord | null> { return this.sessions.get(tokenHash) || null; }
  async deleteSession(tokenHash: string): Promise<void> { this.sessions.delete(tokenHash); }
  async deleteUserSessions(userId: string): Promise<void> { for (const [hash, session] of this.sessions) if (session.userId === userId) this.sessions.delete(hash); }
  async checkAuthRateLimit(): Promise<{ allowed: boolean; retryAfter: number }> { this.attempts += 1; return this.attempts > 5 ? { allowed: false, retryAfter: 60 } : { allowed: true, retryAfter: 0 }; }
  async getUser(): Promise<UserRecord | null> { return this.user; }
  async getProfile(): Promise<PlayerProfile> { if (!this.profile) throw new Error('missing'); return this.profile; }
  async patchProfile(_userId: string, patch: ProfilePatch, now: string): Promise<PlayerProfile> {
    const current = await this.getProfile();
    const next: PlayerProfile = { ...current, playerName: patch.playerName ?? current.playerName, lastSpawnId: patch.lastSpawnId ?? current.lastSpawnId, updatedAt: now };
    this.profile = next;
    return next;
  }
  async getBootstrap(): Promise<WorldBootstrap> { return { profile: await this.getProfile(), discoveries: [...this.discoveries], home: this.home }; }
  async addDiscovery(_userId: string, id: DiscoveryId): Promise<boolean> { const had = this.discoveries.has(id); this.discoveries.add(id); return !had; }
  async saveHome(_userId: string, home: HomeState): Promise<HomeState> { this.home = home; return home; }
}

const env: Env = {
  DB: null as never,
  ASSETS: { fetch: async () => new Response('asset') },
  GOOGLE_CLIENT_ID: 'client',
  ALLOWED_ORIGIN: 'https://dev.tinyworld.test',
  SESSION_PEPPER: 'pepper',
  AUTH_RATE_LIMIT_SALT: 'salt',
  TINY_ENV: 'test'
};

const verifier: GoogleVerifier = { verify: async () => ({ sub: 'google-1', email: 'tiny@example.com', name: 'Tiny Tester' }) };

function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.method && init.method !== 'GET') headers.set('Origin', env.ALLOWED_ORIGIN);
  return new Request(`https://dev.tinyworld.test${path}`, { ...init, headers });
}

function sessionCookie(response: Response): string {
  const setCookie = response.headers.get('Set-Cookie') || '';
  return setCookie.split(';')[0] || '';
}

function login(router: ReturnType<typeof createRouter>) {
  return router.handle(request('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential: 'x'.repeat(40) }) }));
}

describe('authentication', () => {
  let store: MemoryStore;
  beforeEach(() => { store = new MemoryStore(); });

  it('boots a Google account and returns a secure opaque session cookie', async () => {
    const router = createRouter(env, { store, googleVerifier: verifier, now: () => new Date('2026-08-17T20:00:00Z') });
    const response = await login(router);
    expect(response.status).toBe(200);
    const cookie = response.headers.get('Set-Cookie') || '';
    expect(cookie).toContain('tinyworld_session=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    const me = await router.handle(request('/api/me', { headers: { Cookie: sessionCookie(response) } }));
    expect(me.status).toBe(200);
  });

  it('rotates prior sessions on a fresh Google login', async () => {
    const router = createRouter(env, { store, googleVerifier: verifier });
    const first = await login(router);
    const firstCookie = sessionCookie(first);
    const second = await login(router);
    const secondCookie = sessionCookie(second);
    expect(firstCookie).not.toBe(secondCookie);
    expect((await router.handle(request('/api/me', { headers: { Cookie: firstCookie } }))).status).toBe(401);
    expect((await router.handle(request('/api/me', { headers: { Cookie: secondCookie } }))).status).toBe(200);
  });

  it('rejects a wrong mutation origin', async () => {
    const router = createRouter(env, { store, googleVerifier: verifier });
    const response = await router.handle(new Request('https://dev.tinyworld.test/api/auth/google', { method: 'POST', headers: { Origin: 'https://evil.example' }, body: JSON.stringify({ credential: 'x'.repeat(40) }) }));
    expect(response.status).toBe(403);
  });

  it('rate limits the sixth sign-in attempt in a minute', async () => {
    const router = createRouter(env, { store, googleVerifier: verifier });
    for (let i = 0; i < 5; i += 1) expect((await login(router)).status).toBe(200);
    const blocked = await login(router);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBe('60');
  });
});
