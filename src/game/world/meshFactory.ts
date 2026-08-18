import * as pc from 'playcanvas';
import { heightAt, WATER_SURFACE_Y, WORLD_HALF_EXTENT } from './heightfield';
import { MOUNTAIN_WAYPOINTS } from './WorldDefinition';

export function material(color: pc.Color, gloss = 0.15, metalness = 0, opacity = 1, emissive?: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.metalness = metalness;
  if (opacity < 1) {
    m.opacity = opacity;
    m.blendType = pc.BLEND_NORMAL;
  }
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = 1;
  }
  m.update();
  return m;
}

export function primitive(
  app: pc.Application,
  name: string,
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'capsule' | 'plane',
  mat: pc.Material,
  position: pc.Vec3,
  scale: pc.Vec3,
  parent?: pc.Entity
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material: mat });
  entity.setPosition(position);
  entity.setLocalScale(scale);
  (parent ?? app.root).addChild(entity);
  return entity;
}

const PATH_SEGMENTS: Array<readonly [number, number, number, number, number]> = [
  // Home lane
  [-4, 3, -10, 8, 3.8],
  [-10, 8, -18, 14, 3.5],
  [-18, 14, -27, 21, 3.2],
  [-27, 21, -35, 27, 3.2],
  [-35, 27, -40, 31, 3.5],
  // Woodland path
  [-4, -3, -13, -10, 3.6],
  [-13, -10, -24, -18, 3.4],
  [-24, -18, -34, -25, 3.2],
  [-34, -25, -43, -32, 3.2],
  [-43, -32, -53, -42, 3.5],
  // Mountain path
  [4, -4, 12, -13, 3.8],
  [12, -13, MOUNTAIN_WAYPOINTS[0]!.x, MOUNTAIN_WAYPOINTS[0]!.z, 3.4],
  [MOUNTAIN_WAYPOINTS[0]!.x, MOUNTAIN_WAYPOINTS[0]!.z, MOUNTAIN_WAYPOINTS[1]!.x, MOUNTAIN_WAYPOINTS[1]!.z, 3.2],
  [MOUNTAIN_WAYPOINTS[1]!.x, MOUNTAIN_WAYPOINTS[1]!.z, MOUNTAIN_WAYPOINTS[2]!.x, MOUNTAIN_WAYPOINTS[2]!.z, 3.2],
  [MOUNTAIN_WAYPOINTS[2]!.x, MOUNTAIN_WAYPOINTS[2]!.z, MOUNTAIN_WAYPOINTS[3]!.x, MOUNTAIN_WAYPOINTS[3]!.z, 3.2],
  [MOUNTAIN_WAYPOINTS[3]!.x, MOUNTAIN_WAYPOINTS[3]!.z, MOUNTAIN_WAYPOINTS[4]!.x, MOUNTAIN_WAYPOINTS[4]!.z, 3.2],
  // Harbour path
  [4, 4, 12, 12, 3.8],
  [12, 12, 21, 20, 3.6],
  [21, 20, 29, 28, 3.5],
  [29, 28, 35, 37, 3.5],
  [35, 37, 42, 48, 3.8]
];

function distToSegmentSq(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const l2 = (bx - ax) * (bx - ax) + (bz - az) * (bz - az);
  if (l2 === 0) return (px - ax) * (px - ax) + (pz - az) * (pz - az);
  let t = ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * (bx - ax);
  const projZ = az + t * (bz - az);
  return (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ);
}

function vertexTerrainColor(wx: number, wz: number, y: number): [number, number, number] {
  // Base vibrant stylized grass
  const noise = (Math.sin(wx * 0.12) * Math.cos(wz * 0.12) + Math.sin(wx * 0.28 + wz * 0.21)) * 0.5;
  let r = 0.44 + noise * 0.04;
  let g = 0.68 + noise * 0.05;
  let b = 0.32 + noise * 0.03;

  // Woodland deeper forest tones
  if (wx < -18 && wz < -12) {
    const forestFactor = Math.min(1, (Math.hypot(wx + 18, wz + 12) / 30));
    r = r * (1 - forestFactor * 0.35) + 0.22 * forestFactor;
    g = g * (1 - forestFactor * 0.35) + 0.48 * forestFactor;
    b = b * (1 - forestFactor * 0.35) + 0.24 * forestFactor;
  }

  // Mountain rocky stone slopes
  if (y > 4.5 && wx > 10 && wz < -10) {
    const rockFactor = Math.min(1, (y - 4.5) / 10);
    const stoneR = 0.54 + noise * 0.06;
    const stoneG = 0.55 + noise * 0.06;
    const stoneB = 0.52 + noise * 0.05;
    r = r * (1 - rockFactor) + stoneR * rockFactor;
    g = g * (1 - rockFactor) + stoneG * rockFactor;
    b = b * (1 - rockFactor) + stoneB * rockFactor;
  }

  // Harbour shore golden sand
  if (wz > 25 && wx > 18) {
    const sandFactor = Math.max(0, Math.min(1, (WATER_SURFACE_Y + 1.8 - y) / 2.2));
    const sandR = 0.86 + noise * 0.03;
    const sandG = 0.77 + noise * 0.03;
    const sandB = 0.58 + noise * 0.02;
    r = r * (1 - sandFactor) + sandR * sandFactor;
    g = g * (1 - sandFactor) + sandG * sandFactor;
    b = b * (1 - sandFactor) + sandB * sandFactor;
  }

  // Village central square cobblestone/paving
  const distFromCenter = Math.hypot(wx, wz);
  if (distFromCenter < 8.5) {
    const plazaFactor = Math.max(0, Math.min(1, (8.5 - distFromCenter) / 2.5));
    const plazaR = 0.82 + noise * 0.03;
    const plazaG = 0.74 + noise * 0.03;
    const plazaB = 0.60 + noise * 0.02;
    r = r * (1 - plazaFactor) + plazaR * plazaFactor;
    g = g * (1 - plazaFactor) + plazaG * plazaFactor;
    b = b * (1 - plazaFactor) + plazaB * plazaFactor;
  }

  // Path ribbons blending
  for (const [ax, az, bx, bz, width] of PATH_SEGMENTS) {
    const dSq = distToSegmentSq(wx, wz, ax, az, bx, bz);
    const wHalf = width * 0.5;
    if (dSq < (wHalf + 1.8) * (wHalf + 1.8)) {
      const d = Math.sqrt(dSq);
      const pathFactor = Math.max(0, Math.min(1, 1 - (d - wHalf * 0.4) / (wHalf * 0.9)));
      const pathR = 0.80 + noise * 0.02;
      const pathG = 0.71 + noise * 0.02;
      const pathB = 0.54 + noise * 0.02;
      r = r * (1 - pathFactor) + pathR * pathFactor;
      g = g * (1 - pathFactor) + pathG * pathFactor;
      b = b * (1 - pathFactor) + pathB * pathFactor;
    }
  }

  return [r, g, b];
}

export function createTerrain(app: pc.Application, segments = 64): pc.Entity {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const size = WORLD_HALF_EXTENT * 2;

  for (let z = 0; z <= segments; z += 1) {
    for (let x = 0; x <= segments; x += 1) {
      const wx = -WORLD_HALF_EXTENT + (x / segments) * size;
      const wz = -WORLD_HALF_EXTENT + (z / segments) * size;
      const y = heightAt(wx, wz);
      positions.push(wx, y, wz);

      const [r, g, b] = vertexTerrainColor(wx, wz, y);
      colors.push(r, g, b, 1);
    }
  }

  for (let z = 0; z < segments; z += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = z * (segments + 1) + x;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(positions);
  mesh.setNormals(pc.calculateNormals(positions, indices));
  mesh.setColors(colors);
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);

  const mat = new pc.StandardMaterial();
  mat.diffuseVertexColor = true;
  mat.gloss = 0.06;
  mat.metalness = 0;
  mat.useLighting = true;
  mat.update();

  const entity = new pc.Entity('TinyWorldTerrain');
  entity.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, mat)] });
  app.root.addChild(entity);
  return entity;
}
