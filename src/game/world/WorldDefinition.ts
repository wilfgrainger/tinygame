import type { DiscoveryPoint, SpawnPoint, WorldZone } from '../../shared/world';
import { heightAt, WATER_SURFACE_Y } from './heightfield';

export const ZONES: WorldZone[] = [
  { id: 'village-square', centre: { x: 0, y: heightAt(0, 0), z: 0 }, radius: 20 },
  { id: 'home-lane', centre: { x: -38, y: heightAt(-38, 30), z: 30 }, radius: 24 },
  { id: 'woodland', centre: { x: -45, y: heightAt(-45, -34), z: -34 }, radius: 28 },
  { id: 'mountain-rise', centre: { x: 46, y: heightAt(46, -46), z: -46 }, radius: 42 },
  { id: 'harbour', centre: { x: 46, y: heightAt(46, 46), z: 46 }, radius: 30 }
];

export const ROUTES = [
  { from: 'village-square', to: 'home-lane', width: 9 },
  { from: 'village-square', to: 'woodland', width: 8 },
  { from: 'village-square', to: 'mountain-rise', width: 8 },
  { from: 'village-square', to: 'harbour', width: 10 }
] as const;

export const MOUNTAIN_WAYPOINTS = [
  { x: 20, z: -24 }, { x: 35, z: -25 }, { x: 29, z: -38 }, { x: 44, z: -39 }, { x: 46, z: -50 }
].map((point) => ({ ...point, y: heightAt(point.x, point.z) }));

export const SPAWN_POINTS: SpawnPoint[] = [
  { id: 'village-square', position: { x: 0, y: heightAt(0, 8), z: 8 }, yaw: Math.PI },
  { id: 'home-lane', position: { x: -34, y: heightAt(-34, 27), z: 27 }, yaw: 1.2 },
  { id: 'harbour', position: { x: 34, y: heightAt(34, 35), z: 35 }, yaw: 2.4 }
];

export const DISCOVERIES: DiscoveryPoint[] = [
  { id: 'mountain-summit', position: { x: 46, y: heightAt(46, -50), z: -50 }, radius: 4 },
  { id: 'woodland-grove', position: { x: -53, y: heightAt(-53, -42), z: -42 }, radius: 5 },
  { id: 'harbour-lookout', position: { x: 36, y: heightAt(36, 38), z: 38 }, radius: 4 }
];

export const WATER_BOUNDS = { minX: 27, maxX: 79, minZ: 48, maxZ: 79 };
export const WORLD_DEFINITION = { zones: ZONES, routes: ROUTES, mountainWaypoints: MOUNTAIN_WAYPOINTS, spawnPoints: SPAWN_POINTS, discoveries: DISCOVERIES, waterBounds: WATER_BOUNDS, waterSurfaceY: WATER_SURFACE_Y };
