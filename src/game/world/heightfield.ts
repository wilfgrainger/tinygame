const mountainX = 46;
const mountainZ = -46;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function heightAt(x: number, z: number): number {
  const undulation = Math.sin(x * 0.075) * 0.45 + Math.cos(z * 0.062) * 0.35;
  const dx = x - mountainX; const dz = z - mountainZ;
  const r = Math.hypot(dx, dz);
  const mountain = Math.max(0, 1 - r / 42) ** 2 * 25;
  const terrace = mountain > 3 ? Math.floor(mountain / 3.2) * 0.28 : 0;
  const harbourApproach = smoothstep(24, 52, z) * smoothstep(18, 38, x);
  const coastDrop = harbourApproach * 3.4;
  return undulation + mountain + terrace - coastDrop;
}

export const WATER_SURFACE_Y = -1.65;
export const WORLD_HALF_EXTENT = 80;
