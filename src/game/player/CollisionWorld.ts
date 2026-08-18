import type { Vec3 } from '../../shared/world';

export type Aabb2 = { minX: number; maxX: number; minZ: number; maxZ: number };
export type MoveOptions = { maxStepHeight?: number; maxSlopeDegrees?: number };

function intersects(x: number, z: number, radius: number, box: Aabb2) {
  const cx = Math.max(box.minX, Math.min(x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
  return (x - cx) ** 2 + (z - cz) ** 2 < radius ** 2;
}

function terrainChangeAllowed(
  fromHeight: number,
  toHeight: number,
  horizontalDistance: number,
  maxStepHeight: number,
  maxSlopeDegrees: number
) {
  const rise = Math.abs(toHeight - fromHeight);
  if (rise > maxStepHeight) return false;
  if (horizontalDistance <= 0.0001) return rise <= 0.0001;
  const slopeDegrees = (Math.atan2(rise, horizontalDistance) * 180) / Math.PI;
  return slopeDegrees <= maxSlopeDegrees;
}

export class CollisionWorld {
  constructor(
    public readonly heightAt: (x: number, z: number) => number,
    public readonly colliders: Aabb2[],
    public readonly safeSpawn: Vec3,
    public readonly halfExtent = 78
  ) {}

  resolveMove(position: Vec3, delta: Vec3, radius: number, options: MoveOptions = {}): Vec3 {
    if (position.y < -20) return { ...this.safeSpawn };

    const maxStepHeight = options.maxStepHeight ?? 0.75;
    const maxSlopeDegrees = options.maxSlopeDegrees ?? 48;
    const targetX = Math.max(-this.halfExtent, Math.min(this.halfExtent, position.x + delta.x));
    const targetZ = Math.max(-this.halfExtent, Math.min(this.halfExtent, position.z + delta.z));
    let x = targetX;
    let z = position.z;

    const startHeight = this.heightAt(position.x, position.z);
    const xHeight = this.heightAt(x, z);
    const xBlockedByCollider = this.colliders.some((box) => intersects(x, z, radius, box));
    const xTerrainAllowed = terrainChangeAllowed(
      startHeight,
      xHeight,
      Math.abs(x - position.x),
      maxStepHeight,
      maxSlopeDegrees
    );
    if (xBlockedByCollider || !xTerrainAllowed) x = position.x;

    z = targetZ;
    const beforeZHeight = this.heightAt(x, position.z);
    const zHeight = this.heightAt(x, z);
    const zBlockedByCollider = this.colliders.some((box) => intersects(x, z, radius, box));
    const zTerrainAllowed = terrainChangeAllowed(
      beforeZHeight,
      zHeight,
      Math.abs(z - position.z),
      maxStepHeight,
      maxSlopeDegrees
    );
    if (zBlockedByCollider || !zTerrainAllowed) z = position.z;

    return { x, y: this.heightAt(x, z), z };
  }

  isFree(x: number, z: number, radius: number) {
    return !this.colliders.some((box) => intersects(x, z, radius, box));
  }
}
