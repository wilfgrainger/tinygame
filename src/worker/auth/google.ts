import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Env } from '../env';
import { ApiHttpError } from '../response';

export type GoogleIdentity = { sub: string; email: string | null; name: string | null };
export interface GoogleVerifier { verify(credential: string, env: Env): Promise<GoogleIdentity>; }

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export const liveGoogleVerifier: GoogleVerifier = {
  async verify(credential, env) {
    try {
      const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: env.GOOGLE_CLIENT_ID
      });
      if (typeof payload.sub !== 'string' || payload.sub.length === 0) throw new Error('missing subject');
      return {
        sub: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : null,
        name: typeof payload.name === 'string' ? payload.name : null
      };
    } catch {
      throw new ApiHttpError(401, 'AUTH_REQUIRED', 'Google credential is invalid');
    }
  }
};
