import { APP_VERSION } from '../../generated/release';
import type { ApiResponse, MeResponse, PlayerProfile, WorldBootstrap } from '../../shared/api';
import type { DiscoveryId } from '../../shared/ids';
import type { HomeState, ProfilePatch } from '../../shared/schemas';
import type { ApiErrorCode } from '../../shared/errors';

export class ApiClientError extends Error {
  constructor(public readonly code: ApiErrorCode, message: string, public readonly status: number) { super(message); }
}

export class ApiClient {
  constructor(private readonly base = '') {}

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('X-TinyWorld-Version', APP_VERSION);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(`${this.base}${path}`, { ...init, headers, credentials: 'include' });
    let payload: ApiResponse<T>;
    try { payload = await response.json() as ApiResponse<T>; }
    catch { throw new ApiClientError('INTERNAL', 'TinyWorld received an invalid server response', response.status); }
    if (!response.ok || !payload.ok) {
      const error = payload.ok ? { code: 'INTERNAL' as const, message: 'Request failed' } : payload.error;
      throw new ApiClientError(error.code, error.message, response.status);
    }
    return payload.data;
  }

  me() { return this.call<MeResponse>('/api/me'); }
  bootstrap() { return this.call<WorldBootstrap>('/api/world/bootstrap'); }
  saveProfile(patch: ProfilePatch) { return this.call<PlayerProfile>('/api/profile', { method: 'PUT', body: JSON.stringify(patch) }); }
  saveDiscovery(id: DiscoveryId) { return this.call<{ discoveryId: DiscoveryId; created: boolean }>(`/api/discoveries/${encodeURIComponent(id)}`, { method: 'POST' }); }
  saveHome(home: HomeState) { return this.call<HomeState>('/api/home/save', { method: 'POST', body: JSON.stringify(home) }); }
  googleCredential(credential: string) { return this.call<{ userId: string }>('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }); }
  logout() { return this.call<{ loggedOut: true }>('/api/auth/logout', { method: 'POST' }); }
}
