import type { Env } from '../env';
import type { Store } from '../db/store';
import { ApiHttpError } from '../response';
import { sha256Hex } from '../security';

const COOKIE_NAME = 'tinyworld_session';
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const item of header.split(';')) {
    const [key, ...rest] = item.trim().split('=');
    if (key === name) return rest.join('=') || null;
  }
  return null;
}

export async function tokenHash(token: string, env: Env): Promise<string> {
  return sha256Hex(`${token}:${env.SESSION_PEPPER}`);
}

export async function createSession(store: Store, userId: string, env: Env, now = new Date()): Promise<{ cookie: string; expiresAt: string }> {
  const token = randomToken();
  const hash = await tokenHash(token, env);
  const expires = new Date(now.getTime() + SESSION_MS);
  await store.createSession(userId, hash, now.toISOString(), expires.toISOString());
  return {
    expiresAt: expires.toISOString(),
    cookie: `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_MS / 1000)}`
  };
}

export async function requireSession(request: Request, store: Store, env: Env): Promise<{ userId: string }> {
  const token = parseCookie(request.headers.get('Cookie'), COOKIE_NAME);
  if (!token) throw new ApiHttpError(401, 'AUTH_REQUIRED', 'Sign in required');
  const session = await store.getSession(await tokenHash(token, env));
  if (!session || Date.parse(session.expiresAt) <= Date.now()) throw new ApiHttpError(401, 'AUTH_REQUIRED', 'Session expired');
  return { userId: session.userId };
}

export async function revokeRequestSession(request: Request, store: Store, env: Env): Promise<void> {
  const token = parseCookie(request.headers.get('Cookie'), COOKIE_NAME);
  if (token) await store.deleteSession(await tokenHash(token, env));
}

export const CLEAR_SESSION_COOKIE = `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
