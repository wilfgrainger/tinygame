import { APP_VERSION } from '../generated/release';
import { DiscoveryIdSchema, GoogleCredentialSchema, HomeStateSchema, ProfilePatchSchema } from '../shared/schemas';
import type { Env } from './env';
import { D1Store } from './db/d1Store';
import type { Store } from './db/store';
import { liveGoogleVerifier, type GoogleVerifier } from './auth/google';
import { CLEAR_SESSION_COOKIE, createSession, requireSession, revokeRequestSession } from './auth/session';
import { assertAllowedOrigin, clientRateKey, readJson } from './security';
import { ApiHttpError, fail, ok } from './response';

export type RouterDeps = {
  store?: Store;
  googleVerifier?: GoogleVerifier;
  now?: () => Date;
};

function zodMessage(): string { return 'Request did not match the TinyWorld contract'; }

export function createRouter(env: Env, deps: RouterDeps = {}) {
  const store = deps.store ?? new D1Store(env.DB);
  const googleVerifier = deps.googleVerifier ?? liveGoogleVerifier;
  const now = deps.now ?? (() => new Date());

  async function auth(request: Request) {
    return requireSession(request, store, env);
  }

  async function handle(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/health' && request.method === 'GET') return ok({ version: APP_VERSION, environment: env.TINY_ENV });

      if (path === '/api/auth/google' && request.method === 'POST') {
        assertAllowedOrigin(request, env);
        const key = await clientRateKey(request, env);
        const limit = await store.checkAuthRateLimit(key, now().getTime());
        if (!limit.allowed) return fail(429, 'RATE_LIMITED', 'Too many sign-in attempts', { 'Retry-After': String(limit.retryAfter) });
        const parsed = GoogleCredentialSchema.safeParse(await readJson(request));
        if (!parsed.success) throw new ApiHttpError(400, 'INVALID_REQUEST', zodMessage());
        const identity = await googleVerifier.verify(parsed.data.credential, env);
        const current = now().toISOString();
        const user = await store.upsertGoogleUser(identity, current);
        await store.deleteUserSessions(user.id);
        const session = await createSession(store, user.id, env, now());
        return ok({ userId: user.id }, { headers: { 'Set-Cookie': session.cookie } });
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        assertAllowedOrigin(request, env);
        await revokeRequestSession(request, store, env);
        return ok({ loggedOut: true }, { headers: { 'Set-Cookie': CLEAR_SESSION_COOKIE } });
      }

      if (path === '/api/me' && request.method === 'GET') {
        const session = await auth(request);
        const user = await store.getUser(session.userId);
        if (!user) throw new ApiHttpError(401, 'AUTH_REQUIRED', 'Account not found');
        return ok({ userId: user.id, displayName: user.displayName, email: user.email });
      }

      if (path === '/api/profile' && request.method === 'GET') {
        const session = await auth(request);
        return ok(await store.getProfile(session.userId));
      }

      if (path === '/api/profile' && request.method === 'PUT') {
        assertAllowedOrigin(request, env);
        const session = await auth(request);
        const parsed = ProfilePatchSchema.safeParse(await readJson(request));
        if (!parsed.success) throw new ApiHttpError(400, 'INVALID_REQUEST', zodMessage());
        return ok(await store.patchProfile(session.userId, parsed.data, now().toISOString()));
      }

      if (path === '/api/world/bootstrap' && request.method === 'GET') {
        const session = await auth(request);
        return ok(await store.getBootstrap(session.userId));
      }

      if (path.startsWith('/api/discoveries/') && request.method === 'POST') {
        assertAllowedOrigin(request, env);
        const session = await auth(request);
        const rawId = decodeURIComponent(path.slice('/api/discoveries/'.length));
        const parsed = DiscoveryIdSchema.safeParse(rawId);
        if (!parsed.success) throw new ApiHttpError(400, 'INVALID_REQUEST', 'Unknown discovery');
        const created = await store.addDiscovery(session.userId, parsed.data, now().toISOString());
        return ok({ discoveryId: parsed.data, created });
      }

      if (path === '/api/home/save' && request.method === 'POST') {
        assertAllowedOrigin(request, env);
        const session = await auth(request);
        const parsed = HomeStateSchema.safeParse(await readJson(request));
        if (!parsed.success) throw new ApiHttpError(400, 'INVALID_REQUEST', zodMessage());
        return ok(await store.saveHome(session.userId, parsed.data, now().toISOString()));
      }

      return fail(404, 'NOT_FOUND', 'API route not found');
    } catch (error) {
      if (error instanceof ApiHttpError) return fail(error.status, error.code, error.message, error.headers);
      console.error('TinyWorld API error', error);
      return fail(500, 'INTERNAL', 'TinyWorld could not complete the request');
    }
  }

  return { handle };
}
