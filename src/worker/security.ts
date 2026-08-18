import { ApiHttpError } from './response';
import type { Env } from './env';

export function assertAllowedOrigin(request: Request, env: Env): void {
  const origin = request.headers.get('Origin');
  if (origin !== env.ALLOWED_ORIGIN) throw new ApiHttpError(403, 'FORBIDDEN', 'Origin is not allowed');
}

export async function readJson(request: Request, maxBytes = 32_768): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') || '0');
  if (declared > maxBytes) throw new ApiHttpError(400, 'INVALID_REQUEST', 'Request body is too large');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new ApiHttpError(400, 'INVALID_REQUEST', 'Request body is too large');
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiHttpError(400, 'INVALID_REQUEST', 'Request body must be valid JSON');
  }
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function clientRateKey(request: Request, env: Env): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  return sha256Hex(`${ip}:${env.AUTH_RATE_LIMIT_SALT}`);
}
