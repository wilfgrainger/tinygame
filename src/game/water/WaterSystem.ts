export type WaterBounds = { minX: number; maxX: number; minZ: number; maxZ: number };

export class WaterSystem {
  constructor(public readonly bounds: WaterBounds, public readonly surfaceY: number) {}
  contains(x: number, z: number) { return x >= this.bounds.minX && x <= this.bounds.maxX && z >= this.bounds.minZ && z <= this.bounds.maxZ; }
  clamp(x: number, z: number, margin = 1) { return { x: Math.max(this.bounds.minX + margin, Math.min(this.bounds.maxX - margin, x)), z: Math.max(this.bounds.minZ + margin, Math.min(this.bounds.maxZ - margin, z)) }; }
}
