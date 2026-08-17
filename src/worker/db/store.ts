import type { DiscoveryId, SpawnId } from '../../shared/ids';
import type { HomeState, ProfilePatch } from '../../shared/schemas';
import type { PlayerProfile, WorldBootstrap } from '../../shared/api';
import type { GoogleIdentity } from '../auth/google';

export type UserRecord = { id: string; email: string | null; displayName: string | null };
export type SessionRecord = { userId: string; expiresAt: string };

export interface Store {
  upsertGoogleUser(identity: GoogleIdentity, now: string): Promise<UserRecord>;
  createSession(userId: string, tokenHash: string, createdAt: string, expiresAt: string): Promise<void>;
  getSession(tokenHash: string): Promise<SessionRecord | null>;
  deleteSession(tokenHash: string): Promise<void>;
  checkAuthRateLimit(rateKey: string, nowMs: number): Promise<{ allowed: boolean; retryAfter: number }>;
  getUser(userId: string): Promise<UserRecord | null>;
  getProfile(userId: string): Promise<PlayerProfile>;
  patchProfile(userId: string, patch: ProfilePatch, now: string): Promise<PlayerProfile>;
  getBootstrap(userId: string): Promise<WorldBootstrap>;
  addDiscovery(userId: string, id: DiscoveryId, now: string): Promise<boolean>;
  saveHome(userId: string, home: HomeState, now: string): Promise<HomeState>;
}
