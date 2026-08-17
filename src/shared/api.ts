import type { ApiErrorCode } from './errors';
import type { DiscoveryId, SpawnId } from './ids';
import type { HomeState } from './schemas';

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: { code: ApiErrorCode; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PlayerProfile = {
  userId: string;
  schemaVersion: 1;
  playerName: string;
  lastSpawnId: SpawnId;
  createdAt: string;
  updatedAt: string;
};

export type MeResponse = {
  userId: string;
  displayName: string | null;
  email: string | null;
};

export type WorldBootstrap = {
  profile: PlayerProfile;
  discoveries: DiscoveryId[];
  home: HomeState;
};
