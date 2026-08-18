import type { Vec3 } from '../../shared/world';

export type Aabb2 = { minX: number; maxX: number; minZ: number; maxZ: number };
export type MoveOptions = { maxStepHeight?: number; maxSlopeDegrees?: number };

const SLOPE_PROBE_DISTANCE = 0.75;

function intersects(x: number, z: number, radius: number, box: Aabb2) {
  const cx = Math.max(box.minX, Math.min(x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
  return (x - cx) ** 2 + (z - cz) ** 2 < radius ** 2;
}

function slopeDegrees(rise: number, run: number) {
  if (run <= 0.0001) return rise <= 0.0001 ? 0 : 90;
  return (Math.atan2(Math.abs(rise), run) * 180) / Math.PI;
}

export class CollisionWorld {
  constructor(
    public readonly heightAt: (x: number, z: number) => number,
    public readonly colliders: Aabb2[],
    public readonly safeSpawn: Vec3,
    public readonly halfExtent = 78
  ) {}

  private axisSlopeAllowed(
    x: number,
    z: number,
    axis: 'x' | 'z',
    direction: number,
    maxSlopeDegrees: number
  ) {
    if (direction === 0) return true;
    const startHeight = this.heightAt(x, z);
    const probeX = axis === 'x'
      ? Math.max(-this.halfExtent, Math.min(this.halfExtent, x + direction * SLOPE_PROBE_DISTANCE))
      : x;
    const probeZ = axis === 'z'
      ? Math.max(-this.halfExtent, Math.min(this.halfExtent, z + direction * SLOPE_PROBE_DISTANCE))
      : z;
    const run = Math.hypot(probeX - x, probeZ - z);
    const probeHeight = this.heightAt(probeX, probeZ);
    return slopeDegrees(probeHeight - startHeight, run) <= maxSlopeDegrees;
  }

  resolveMove(position: Vec3, delta: Vec3, radius: number, options: MoveOptions = {}): Vec3 {
    if (position.y < -20) return { ...this.safeSpawn };

    const maxStepHeight = options.maxStepHeight ?? 0.75;
    const maxSlopeDegrees = options.maxSlopeDegrees ?? 58;
    const targetX = Math.max(-this.halfExtent, Math.min(this.halfExtent, position.x + delta.x));
    const targetZ = Math.max(-this.halfExtent, Math.min(this.halfExtent, position.z + delta.z));
    let x = targetX;
    let z = position.z;

    const startHeight = this.heightAt(position.x, position.z);
    const xHeight = this.heightAt(x, z);
    const xBlockedByCollider = this.colliders.some((box) => intersects(x, z, radius, box));
    const xStepAllowed = Math.abs(xHeight - startHeight) <= maxStepHeight;
    const xSlopeAllowed = this.axisSlopeAllowed(
      position.x,
      position.z,
      'x',
      Math.sign(x - position.x),
      maxSlopeDegrees
    );
    if (xBlockedByCollider || !xStepAllowed || !xSlopeAllowed) x = position.x;

    z = targetZ;
    const beforeZHeight = this.heightAt(x, position.z);
    const zHeight = this.heightAt(x, z);
    const zBlockedByCollider = this.colliders.some((box) => intersects(x, z, radius, box));
    const zStepAllowed = Math.abs(zHeight - beforeZHeight) <= maxStepHeight;
    const zSlopeAllowed = this.axisSlopeAllowed(
      x,
      position.z,
      'z',
      Math.sign(z - position.z),
      maxSlopeDegrees
    );
    if (zBlockedByCollider || !zStepAllowed || !zSlopeAllowed) z = position.z;

    return { x, y: this.heightAt(x, z), z };
  }

  isFree(x: number, z: number, radius: number) {
    return !this.colliders.some((box) => intersects(x, z, radius, box));
  }
}
