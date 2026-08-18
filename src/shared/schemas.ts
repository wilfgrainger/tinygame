import { z } from 'zod';
import { DISCOVERY_IDS, SPAWN_IDS } from './ids';

export const ProfilePatchSchema = z.object({
  playerName: z.string().trim().min(1).max(24).optional(),
  lastSpawnId: z.enum(SPAWN_IDS).optional()
}).strict();

export const HomeStateSchema = z.object({
  lampOn: z.boolean()
}).strict();

export const GoogleCredentialSchema = z.object({
  credential: z.string().min(20).max(16_384)
}).strict();

export const DiscoveryIdSchema = z.enum(DISCOVERY_IDS);

export type ProfilePatch = z.infer<typeof ProfilePatchSchema>;
export type HomeState = z.infer<typeof HomeStateSchema>;
