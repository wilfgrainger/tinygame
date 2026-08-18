import type { DiscoveryId, SpawnId } from './ids';

export type Vec3 = { x: number; y: number; z: number };
export type ZoneId = 'village-square' | 'home-lane' | 'woodland' | 'mountain-rise' | 'harbour';

export type WorldZone = {
  id: ZoneId;
  centre: Vec3;
  radius: number;
};

export type DiscoveryPoint = {
  id: DiscoveryId;
  position: Vec3;
  radius: number;
};

export type SpawnPoint = {
  id: SpawnId;
  position: Vec3;
  yaw: number;
};
