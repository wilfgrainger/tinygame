export const DISCOVERY_IDS = ['mountain-summit', 'woodland-grove', 'harbour-lookout'] as const;
export type DiscoveryId = (typeof DISCOVERY_IDS)[number];

export const SPAWN_IDS = ['village-square', 'home-lane', 'harbour'] as const;
export type SpawnId = (typeof SPAWN_IDS)[number];
