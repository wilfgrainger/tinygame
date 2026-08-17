import type { Vec3 } from '../../shared/world';

export type Aabb2 = { minX: number; maxX: number; minZ: number; maxZ: number };

function intersects(x: number, z: number, radius: number, box: Aabb2) {
  const cx = Math.max(box.minX, Math.min(x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
  return (x - cx) ** 2 + (z - cz) ** 2 < radius ** 2;
}

export class CollisionWorld {
  constructor(public readonly heightAt: (x: number, z: number) => number, public readonly colliders: Aabb2[], public readonly safeSpawn: Vec3, public readonly halfExtent = 78) {}

  resolveMove(position: Vec3, delta: Vec3, radius: number): Vec3 {
    if (position.y < -20) return { ...this.safeSpawn };
    const targetX = Math.max(-this.halfExtent, Math.min(this.halfExtent, position.x + delta.x));
    const targetZ = Math.max(-this.halfExtent, Math.min(this.halfExtent, position.z + delta.z));
    let x = targetX;
    let z = position.z;
    if (this.colliders.some((box) => intersects(x, z, radius, box))) x = position.x;
    z = targetZ;
    if (this.colliders.some((box) => intersects(x, z, radius, box))) z = position.z;
    return { x, y: this.heightAt(x, z), z };
  }

  isFree(x: number, z: number, radius: number) { return !this.colliders.some((box) => intersects(x, z, radius, box)); }
}
