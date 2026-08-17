import * as pc from 'playcanvas';
import { heightAt, WORLD_HALF_EXTENT } from './heightfield';

export function material(color: pc.Color, gloss = 0.12) {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.metalness = 0;
  m.update();
  return m;
}

export function primitive(app: pc.Application, name: string, type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'capsule' | 'plane', mat: pc.Material, position: pc.Vec3, scale: pc.Vec3, parent?: pc.Entity) {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material: mat });
  entity.setPosition(position);
  entity.setLocalScale(scale);
  (parent ?? app.root).addChild(entity);
  return entity;
}

export function createTerrain(app: pc.Application, mat: pc.Material, segments = 32) {
  const positions: number[] = [];
  const indices: number[] = [];
  const size = WORLD_HALF_EXTENT * 2;
  for (let z = 0; z <= segments; z += 1) {
    for (let x = 0; x <= segments; x += 1) {
      const wx = -WORLD_HALF_EXTENT + (x / segments) * size;
      const wz = -WORLD_HALF_EXTENT + (z / segments) * size;
      positions.push(wx, heightAt(wx, wz), wz);
    }
  }
  for (let z = 0; z < segments; z += 1) for (let x = 0; x < segments; x += 1) {
    const a = z * (segments + 1) + x; const b = a + 1; const c = a + segments + 1; const d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(positions);
  mesh.setNormals(pc.calculateNormals(positions, indices));
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);
  const entity = new pc.Entity('TinyWorldTerrain');
  entity.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, mat)] });
  app.root.addChild(entity);
  return entity;
}
