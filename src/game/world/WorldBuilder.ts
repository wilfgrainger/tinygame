import * as pc from 'playcanvas';
import type { Aabb2 } from '../player/CollisionWorld';
import { heightAt, WATER_SURFACE_Y } from './heightfield';
import { createTerrain, material, primitive } from './meshFactory';
import { WATER_BOUNDS } from './WorldDefinition';

export type WorldRuntime = {
  colliders: Aabb2[];
  bikeEntity: pc.Entity;
  raftEntity: pc.Entity;
  lampEntity: pc.Entity;
  cupboardDoor: pc.Entity;
  chairPosition: { x: number; y: number; z: number };
  lampPosition: { x: number; y: number; z: number };
  cupboardPosition: { x: number; y: number; z: number };
};

export class WorldBuilder {
  private grass = material(new pc.Color(0.37, 0.58, 0.32));
  private path = material(new pc.Color(0.68, 0.59, 0.43));
  private wood = material(new pc.Color(0.42, 0.25, 0.13));
  private darkWood = material(new pc.Color(0.24, 0.14, 0.08));
  private cream = material(new pc.Color(0.88, 0.78, 0.62));
  private coral = material(new pc.Color(0.76, 0.39, 0.33));
  private blue = material(new pc.Color(0.3, 0.58, 0.7));
  private leaf = material(new pc.Color(0.18, 0.42, 0.22));
  private leaf2 = material(new pc.Color(0.3, 0.52, 0.25));
  private stone = material(new pc.Color(0.48, 0.49, 0.45));
  private water = material(new pc.Color(0.18, 0.55, 0.7), 0.7);
  private glow = material(new pc.Color(1, 0.78, 0.36), 0.2);

  constructor(private readonly app: pc.Application) {}

  build(): WorldRuntime {
    createTerrain(this.app, this.grass);
    this.buildRoutes();
    this.buildVillage();
    const home = this.buildHome();
    this.buildWoodland();
    this.buildMountain();
    this.buildHarbour();
    const bikeEntity = this.buildBike();
    const raftEntity = this.buildRaft();
    const colliders = this.colliders();
    return { colliders, bikeEntity, raftEntity, ...home };
  }

  private route(name: string, x: number, z: number, sx: number, sz: number, yaw = 0) {
    const y = heightAt(x, z) + 0.08;
    const entity = primitive(this.app, name, 'box', this.path, new pc.Vec3(x, y, z), new pc.Vec3(sx, 0.14, sz));
    entity.setEulerAngles(0, yaw, 0);
  }

  private buildRoutes() {
    this.route('HomeLanePath', -20, 16, 9, 39, -51);
    this.route('WoodlandPath', -24, -18, 8, 48, 53);
    this.route('MountainPathA', 19, -18, 8, 42, -47);
    this.route('HarbourPath', 23, 23, 10, 49, 45);
  }

  private house(name: string, x: number, z: number, body: pc.Material, roof: pc.Material, scale = 1) {
    const y = heightAt(x, z);
    primitive(this.app, `${name}Body`, 'box', body, new pc.Vec3(x, y + 2.6 * scale, z), new pc.Vec3(8 * scale, 5.2 * scale, 7 * scale));
    const roofRoot = new pc.Entity(`${name}Roof`);
    roofRoot.setPosition(x, y + 5.8 * scale, z);
    this.app.root.addChild(roofRoot);
    const left = primitive(this.app, `${name}RoofLeft`, 'box', roof, new pc.Vec3(0, 0, -1.3 * scale), new pc.Vec3(8.8 * scale, 0.5 * scale, 4.5 * scale), roofRoot);
    left.setLocalEulerAngles(28, 0, 0);
    const right = primitive(this.app, `${name}RoofRight`, 'box', roof, new pc.Vec3(0, 0, 1.3 * scale), new pc.Vec3(8.8 * scale, 0.5 * scale, 4.5 * scale), roofRoot);
    right.setLocalEulerAngles(-28, 0, 0);
  }

  private buildVillage() {
    const y = heightAt(0, 0);
    primitive(this.app, 'VillageFountainBase', 'cylinder', this.stone, new pc.Vec3(0, y + 0.5, 0), new pc.Vec3(4.5, 1, 4.5));
    primitive(this.app, 'VillageFountainWater', 'cylinder', this.blue, new pc.Vec3(0, y + 1.05, 0), new pc.Vec3(3.7, 0.25, 3.7));
    this.house('Bakery', 14, 9, this.cream, this.coral, 0.9);
    this.house('Workshop', -13, 10, this.coral, this.darkWood, 0.92);
    this.house('LittleShop', 14, -11, this.blue, this.darkWood, 0.86);
  }

  private buildHome() {
    const x = -39;
    const z = 31;
    const y = heightAt(x, z);
    const wall = this.cream;
    const roof = this.coral;
    primitive(this.app, 'PlayerHomeFloor', 'box', this.wood, new pc.Vec3(x, y + 0.15, z), new pc.Vec3(10, 0.3, 9));
    primitive(this.app, 'PlayerHomeBack', 'box', wall, new pc.Vec3(x, y + 2.5, z + 4.35), new pc.Vec3(10, 5, 0.35));
    primitive(this.app, 'PlayerHomeLeft', 'box', wall, new pc.Vec3(x - 4.85, y + 2.5, z), new pc.Vec3(0.35, 5, 9));
    primitive(this.app, 'PlayerHomeRight', 'box', wall, new pc.Vec3(x + 4.85, y + 2.5, z), new pc.Vec3(0.35, 5, 9));
    primitive(this.app, 'PlayerHomeFrontLeft', 'box', wall, new pc.Vec3(x - 3.4, y + 2.5, z - 4.35), new pc.Vec3(3, 5, 0.35));
    primitive(this.app, 'PlayerHomeFrontRight', 'box', wall, new pc.Vec3(x + 3.4, y + 2.5, z - 4.35), new pc.Vec3(3, 5, 0.35));
    const roofRoot = new pc.Entity('PlayerHomeRoof');
    roofRoot.setPosition(x, y + 5.7, z);
    this.app.root.addChild(roofRoot);
    const r1 = primitive(this.app, 'PlayerHomeRoofA', 'box', roof, new pc.Vec3(0, 0, -1.7), new pc.Vec3(11, 0.5, 5.5), roofRoot);
    r1.setLocalEulerAngles(26, 0, 0);
    const r2 = primitive(this.app, 'PlayerHomeRoofB', 'box', roof, new pc.Vec3(0, 0, 1.7), new pc.Vec3(11, 0.5, 5.5), roofRoot);
    r2.setLocalEulerAngles(-26, 0, 0);
    const lampPosition = { x: x - 2.3, y: y + 2.1, z: z + 1.8 };
    const lampEntity = primitive(this.app, 'HomeLamp', 'sphere', this.glow, new pc.Vec3(lampPosition.x, lampPosition.y, lampPosition.z), new pc.Vec3(0.7, 0.7, 0.7));
    const chairPosition = { x: x + 1.8, y, z: z + 1.7 };
    primitive(this.app, 'HomeChairSeat', 'box', this.wood, new pc.Vec3(chairPosition.x, y + 0.7, chairPosition.z), new pc.Vec3(1.3, 0.25, 1.3));
    const cupboardPosition = { x: x + 2.8, y, z: z + 3.4 };
    primitive(this.app, 'HomeCupboard', 'box', this.darkWood, new pc.Vec3(cupboardPosition.x, y + 1.5, cupboardPosition.z), new pc.Vec3(2.2, 3, 0.7));
    const cupboardDoor = primitive(this.app, 'HomeCupboardDoor', 'box', this.cream, new pc.Vec3(cupboardPosition.x, y + 1.5, cupboardPosition.z - 0.45), new pc.Vec3(2, 2.7, 0.18));
    return { lampEntity, cupboardDoor, chairPosition, lampPosition, cupboardPosition };
  }

  private tree(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    primitive(this.app, 'TreeTrunk', 'cylinder', this.wood, new pc.Vec3(x, y + 2 * scale, z), new pc.Vec3(0.7 * scale, 4 * scale, 0.7 * scale));
    primitive(this.app, 'TreeCanopyA', 'sphere', this.leaf, new pc.Vec3(x, y + 5.1 * scale, z), new pc.Vec3(3.6 * scale, 3.2 * scale, 3.6 * scale));
    primitive(this.app, 'TreeCanopyB', 'sphere', this.leaf2, new pc.Vec3(x + 1.1 * scale, y + 6.3 * scale, z - 0.5 * scale), new pc.Vec3(2.5 * scale, 2.2 * scale, 2.5 * scale));
  }

  private buildWoodland() {
    const trees: ReadonlyArray<readonly [number, number, number]> = [
      [-55, -25, 1.2], [-48, -30, 1.1], [-59, -37, 1.3], [-48, -44, 1.25], [-38, -39, 1.05],
      [-57, -51, 1.1], [-35, -52, 1.2], [-65, -45, 1.15], [-42, -20, 0.9]
    ];
    for (const [x, z, scale] of trees) this.tree(x, z, scale);
    const y = heightAt(-53, -42);
    const log = primitive(this.app, 'GroveLog', 'cylinder', this.wood, new pc.Vec3(-53, y + 0.6, -42), new pc.Vec3(0.8, 5, 0.8));
    log.setEulerAngles(0, 0, 90);
    primitive(this.app, 'GroveRock', 'sphere', this.stone, new pc.Vec3(-50, y + 0.8, -45), new pc.Vec3(2.4, 1.5, 2));
  }

  private buildMountain() {
    const summitY = heightAt(46, -50);
    primitive(this.app, 'SummitLookout', 'cylinder', this.stone, new pc.Vec3(46, summitY + 0.35, -50), new pc.Vec3(5, 0.7, 5));
    const rocks: ReadonlyArray<readonly [number, number]> = [[24, -26], [36, -29], [31, -39], [43, -42]];
    for (const [x, z] of rocks) {
      const y = heightAt(x, z);
      primitive(this.app, 'MountainRock', 'sphere', this.stone, new pc.Vec3(x, y + 1.1, z), new pc.Vec3(2.6, 2.1, 2.2));
    }
  }

  private buildHarbour() {
    const water = primitive(this.app, 'HarbourWater', 'box', this.water, new pc.Vec3(53, WATER_SURFACE_Y - 0.3, 64), new pc.Vec3(WATER_BOUNDS.maxX - WATER_BOUNDS.minX, 0.55, WATER_BOUNDS.maxZ - WATER_BOUNDS.minZ));
    water.render!.castShadows = false;
    const dockY = WATER_SURFACE_Y + 0.7;
    primitive(this.app, 'HarbourDock', 'box', this.wood, new pc.Vec3(42, dockY, 52), new pc.Vec3(6, 0.5, 13));
    for (const x of [39.5, 44.5]) for (const z of [47, 57]) {
      primitive(this.app, 'DockPost', 'cylinder', this.darkWood, new pc.Vec3(x, dockY - 0.7, z), new pc.Vec3(0.45, 2.4, 0.45));
    }
  }

  private buildBike() {
    const root = new pc.Entity('TinyBike');
    root.setPosition(-10, heightAt(-10, 13) + 0.8, 13);
    this.app.root.addChild(root);
    for (const z of [-1.25, 1.25]) {
      const wheel = primitive(this.app, 'BikeWheel', 'cylinder', this.darkWood, new pc.Vec3(0, 0, z), new pc.Vec3(1.25, 0.18, 1.25), root);
      wheel.setLocalEulerAngles(0, 0, 90);
    }
    const frame = primitive(this.app, 'BikeFrame', 'box', this.coral, new pc.Vec3(0, 0.2, 0), new pc.Vec3(0.25, 0.25, 2.4), root);
    frame.setLocalEulerAngles(18, 0, 0);
    primitive(this.app, 'BikeSeat', 'box', this.darkWood, new pc.Vec3(0, 1, 0.3), new pc.Vec3(0.8, 0.18, 0.55), root);
    primitive(this.app, 'BikeHandlebars', 'box', this.darkWood, new pc.Vec3(0, 1.2, -0.8), new pc.Vec3(1.4, 0.12, 0.12), root);
    return root;
  }

  private buildRaft() {
    const root = new pc.Entity('TinyRaft');
    root.setPosition(50, WATER_SURFACE_Y + 0.15, 59);
    this.app.root.addChild(root);
    for (let x = -2; x <= 2; x += 1) {
      primitive(this.app, 'RaftLog', 'box', this.wood, new pc.Vec3(x * 0.8, 0, 0), new pc.Vec3(0.65, 0.38, 4.2), root);
    }
    primitive(this.app, 'RaftRopeA', 'box', this.darkWood, new pc.Vec3(0, 0.25, -1.3), new pc.Vec3(4.4, 0.12, 0.16), root);
    primitive(this.app, 'RaftRopeB', 'box', this.darkWood, new pc.Vec3(0, 0.25, 1.3), new pc.Vec3(4.4, 0.12, 0.16), root);
    return root;
  }

  private colliders(): Aabb2[] {
    return [
      { minX: 10, maxX: 18, minZ: 5, maxZ: 13 },
      { minX: -17, maxX: -9, minZ: 6, maxZ: 14 },
      { minX: 10, maxX: 18, minZ: -15, maxZ: -7 },
      { minX: -44, maxX: -34, minZ: 35.1, maxZ: 35.6 },
      { minX: -44, maxX: -43.5, minZ: 26.5, maxZ: 35.5 },
      { minX: -34.5, maxX: -34, minZ: 26.5, maxZ: 35.5 },
      { minX: -44, maxX: -41.9, minZ: 26.4, maxZ: 26.9 },
      { minX: -36.1, maxX: -34, minZ: 26.4, maxZ: 26.9 }
    ];
  }
}
