import type { D1DatabaseLike } from '../env';
import type { DiscoveryId, SpawnId } from '../../shared/ids';
import type { HomeState, ProfilePatch } from '../../shared/schemas';
import type { PlayerProfile, WorldBootstrap } from '../../shared/api';
import type { GoogleIdentity } from '../auth/google';
import type { SessionRecord, Store, UserRecord } from './store';
import { ApiHttpError } from '../response';

function profileFromRow(row: Record<string, unknown>): PlayerProfile {
  return {
    userId: String(row.user_id),
    schemaVersion: 1,
    playerName: String(row.player_name),
    lastSpawnId: String(row.last_spawn_id) as SpawnId,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export class D1Store implements Store {
  constructor(private readonly db: D1DatabaseLike) {}

  async upsertGoogleUser(identity: GoogleIdentity, now: string): Promise<UserRecord> {
    const existing = await this.db.prepare('SELECT id,email,display_name FROM users WHERE google_sub=?1').bind(identity.sub).first<Record<string, unknown>>();
    if (existing) {
      await this.db.prepare('UPDATE users SET email=?1, display_name=?2, last_login_at=?3 WHERE id=?4').bind(identity.email, identity.name, now, existing.id).run();
      return { id: String(existing.id), email: identity.email, displayName: identity.name };
    }
    const id = crypto.randomUUID();
    const playerName = (identity.name?.trim() || 'Tiny Explorer').slice(0, 24);
    await this.db.batch([
      this.db.prepare('INSERT INTO users (id,google_sub,email,display_name,created_at,last_login_at) VALUES (?1,?2,?3,?4,?5,?5)').bind(id, identity.sub, identity.email, identity.name, now),
      this.db.prepare('INSERT INTO player_profiles (user_id,schema_version,player_name,created_at,updated_at,last_spawn_id) VALUES (?1,1,?2,?3,?3,\'village-square\')').bind(id, playerName, now),
      this.db.prepare('INSERT INTO player_home_state (user_id,lamp_on,updated_at) VALUES (?1,0,?2)').bind(id, now)
    ]);
    return { id, email: identity.email, displayName: identity.name };
  }

  async createSession(userId: string, tokenHash: string, createdAt: string, expiresAt: string): Promise<void> {
    await this.db.prepare('INSERT INTO sessions (id,user_id,token_hash,created_at,expires_at,last_seen_at) VALUES (?1,?2,?3,?4,?5,?4)').bind(crypto.randomUUID(), userId, tokenHash, createdAt, expiresAt).run();
  }

  async getSession(tokenHash: string): Promise<SessionRecord | null> {
    const row = await this.db.prepare('SELECT user_id,expires_at FROM sessions WHERE token_hash=?1').bind(tokenHash).first<Record<string, unknown>>();
    return row ? { userId: String(row.user_id), expiresAt: String(row.expires_at) } : null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.db.prepare('DELETE FROM sessions WHERE token_hash=?1').bind(tokenHash).run();
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM sessions WHERE user_id=?1').bind(userId).run();
  }

  async checkAuthRateLimit(rateKey: string, nowMs: number): Promise<{ allowed: boolean; retryAfter: number }> {
    const row = await this.db.prepare('SELECT window_start,attempts FROM auth_rate_limits WHERE rate_key=?1').bind(rateKey).first<Record<string, unknown>>();
    const windowMs = 60_000;
    if (!row || nowMs - Number(row.window_start) >= windowMs) {
      await this.db.prepare('INSERT INTO auth_rate_limits (rate_key,window_start,attempts) VALUES (?1,?2,1) ON CONFLICT(rate_key) DO UPDATE SET window_start=excluded.window_start, attempts=1').bind(rateKey, nowMs).run();
      return { allowed: true, retryAfter: 0 };
    }
    const attempts = Number(row.attempts);
    if (attempts >= 5) return { allowed: false, retryAfter: Math.max(1, Math.ceil((windowMs - (nowMs - Number(row.window_start))) / 1000)) };
    await this.db.prepare('UPDATE auth_rate_limits SET attempts=attempts+1 WHERE rate_key=?1').bind(rateKey).run();
    return { allowed: true, retryAfter: 0 };
  }

  async getUser(userId: string): Promise<UserRecord | null> {
    const row = await this.db.prepare('SELECT id,email,display_name FROM users WHERE id=?1').bind(userId).first<Record<string, unknown>>();
    return row ? { id: String(row.id), email: row.email == null ? null : String(row.email), displayName: row.display_name == null ? null : String(row.display_name) } : null;
  }

  async getProfile(userId: string): Promise<PlayerProfile> {
    const row = await this.db.prepare('SELECT * FROM player_profiles WHERE user_id=?1').bind(userId).first<Record<string, unknown>>();
    if (!row) throw new ApiHttpError(404, 'NOT_FOUND', 'Profile not found');
    if (Number(row.schema_version) !== 1) throw new ApiHttpError(409, 'UNSUPPORTED_VERSION', 'Unsupported profile schema');
    return profileFromRow(row);
  }

  async patchProfile(userId: string, patch: ProfilePatch, now: string): Promise<PlayerProfile> {
    const current = await this.getProfile(userId);
    const playerName = patch.playerName ?? current.playerName;
    const lastSpawnId = patch.lastSpawnId ?? current.lastSpawnId;
    await this.db.prepare('UPDATE player_profiles SET player_name=?1,last_spawn_id=?2,updated_at=?3 WHERE user_id=?4').bind(playerName, lastSpawnId, now, userId).run();
    return { ...current, playerName, lastSpawnId, updatedAt: now };
  }

  async getBootstrap(userId: string): Promise<WorldBootstrap> {
    const profile = await this.getProfile(userId);
    const discoveries = await this.db.prepare('SELECT discovery_id FROM player_discoveries WHERE user_id=?1 ORDER BY discovered_at').bind(userId).all<Record<string, unknown>>();
    const homeRow = await this.db.prepare('SELECT lamp_on FROM player_home_state WHERE user_id=?1').bind(userId).first<Record<string, unknown>>();
    return {
      profile,
      discoveries: (discoveries.results || []).map((row) => String(row.discovery_id) as DiscoveryId),
      home: { lampOn: Number(homeRow?.lamp_on || 0) === 1 }
    };
  }

  async addDiscovery(userId: string, id: DiscoveryId, now: string): Promise<boolean> {
    const before = await this.db.prepare('SELECT discovery_id FROM player_discoveries WHERE user_id=?1 AND discovery_id=?2').bind(userId, id).first();
    if (before) return false;
    await this.db.prepare('INSERT INTO player_discoveries (user_id,discovery_id,discovered_at) VALUES (?1,?2,?3) ON CONFLICT(user_id,discovery_id) DO NOTHING').bind(userId, id, now).run();
    return true;
  }

  async saveHome(userId: string, home: HomeState, now: string): Promise<HomeState> {
    await this.db.prepare('UPDATE player_home_state SET lamp_on=?1,updated_at=?2 WHERE user_id=?3').bind(home.lampOn ? 1 : 0, now, userId).run();
    return home;
  }
}
