export type RoadPoint = { x: number; z: number };

export type TerrainRoadSpan = {
  x: number;
  y: number;
  z: number;
  yawRadians: number;
  pitchRadians: number;
  length: number;
  width: number;
};

export type TerrainRoadOptions = {
  maxSpanLength?: number;
  surfaceOffset?: number;
};

export function sampleTerrainRoad(
  from: RoadPoint,
  to: RoadPoint,
  width: number,
  heightAt: (x: number, z: number) => number,
  options: TerrainRoadOptions = {}
): TerrainRoadSpan[] {
  const maxSpanLength = Math.max(0.5, options.maxSpanLength ?? 4);
  const surfaceOffset = options.surfaceOffset ?? 0.08;
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const horizontalLength = Math.hypot(dx, dz);
  if (horizontalLength <= 0.0001) return [];

  const count = Math.max(1, Math.ceil(horizontalLength / maxSpanLength));
  const spans: TerrainRoadSpan[] = [];

  for (let index = 0; index < count; index += 1) {
    const t0 = index / count;
    const t1 = (index + 1) / count;
    const x0 = from.x + dx * t0;
    const z0 = from.z + dz * t0;
    const x1 = from.x + dx * t1;
    const z1 = from.z + dz * t1;
    const x = (x0 + x1) * 0.5;
    const z = (z0 + z1) * 0.5;
    const y0 = heightAt(x0, z0) + surfaceOffset;
    const y1 = heightAt(x1, z1) + surfaceOffset;
    const y = heightAt(x, z) + surfaceOffset;
    const run = Math.hypot(x1 - x0, z1 - z0);
    const rise = y1 - y0;

    spans.push({
      x,
      y,
      z,
      yawRadians: Math.atan2(x1 - x0, z1 - z0),
      pitchRadians: -Math.atan2(rise, run),
      length: run,
      width
    });
  }

  return spans;
}
