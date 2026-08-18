import * as pc from 'playcanvas';
import type { Aabb2 } from '../player/CollisionWorld';
import { heightAt, WATER_SURFACE_Y } from './heightfield';
import { createTerrain, material, primitive } from './meshFactory';
import { MOUNTAIN_WAYPOINTS, WATER_BOUNDS } from './WorldDefinition';

export type WorldRuntime = {
  colliders: Aabb2[];
  bikeEntity: pc.Entity;
  bikeWheelPivots: pc.Entity[];
  raftEntity: pc.Entity;
  lampEntity: pc.Entity;
  cupboardDoor: pc.Entity;
  chairPosition: { x: number; y: number; z: number };
  lampPosition: { x: number; y: number; z: number };
  cupboardPosition: { x: number; y: number; z: number };
  chimneyEmitters: pc.Vec3[];
  fountainEmitter: pc.Vec3;
};

export class WorldBuilder {
  // Palettes
  private wood = material(new pc.Color(0.46, 0.28, 0.16), 0.25);
  private darkWood = material(new pc.Color(0.24, 0.14, 0.08), 0.2);
  private lightWood = material(new pc.Color(0.72, 0.54, 0.36), 0.25);
  private cream = material(new pc.Color(0.94, 0.89, 0.78), 0.15);
  private terracotta = material(new pc.Color(0.82, 0.40, 0.28), 0.2);
  private slateBlue = material(new pc.Color(0.32, 0.46, 0.60), 0.25);
  private sageGreen = material(new pc.Color(0.42, 0.58, 0.44), 0.2);
  private warmStone = material(new pc.Color(0.68, 0.66, 0.60), 0.15);
  private darkStone = material(new pc.Color(0.42, 0.42, 0.40), 0.2);
  private leafOak = material(new pc.Color(0.28, 0.58, 0.26), 0.15);
  private leafOak2 = material(new pc.Color(0.38, 0.68, 0.32), 0.15);
  private leafPine = material(new pc.Color(0.18, 0.42, 0.26), 0.15);
  private leafBirch = material(new pc.Color(0.78, 0.72, 0.28), 0.2);
  private water = material(new pc.Color(0.22, 0.62, 0.78), 0.85, 0.05, 0.78);
  private foam = material(new pc.Color(0.95, 0.98, 1.0), 0.5, 0, 0.85);
  private warmGlow = material(new pc.Color(1.0, 0.90, 0.55), 0.4, 0, 1.0, new pc.Color(0.9, 0.75, 0.35));
  private windowGlow = material(new pc.Color(1.0, 0.88, 0.52), 0.8, 0, 0.95, new pc.Color(0.8, 0.65, 0.2));
  private redFlower = material(new pc.Color(0.92, 0.25, 0.25), 0.3);
  private yellowFlower = material(new pc.Color(0.98, 0.82, 0.22), 0.3);
  private purpleFlower = material(new pc.Color(0.68, 0.38, 0.82), 0.3);
  private whiteFlower = material(new pc.Color(0.98, 0.98, 0.98), 0.4);
  private metal = material(new pc.Color(0.32, 0.34, 0.38), 0.7, 0.7);
  private brass = material(new pc.Color(0.84, 0.70, 0.32), 0.8, 0.6);
  private tentCanvas = material(new pc.Color(0.88, 0.82, 0.68), 0.15);

  private chimneyEmitters: pc.Vec3[] = [];
  private fountainEmitter = new pc.Vec3(0, 0, 0);

  constructor(private readonly app: pc.Application) {}

  build(): WorldRuntime {
    createTerrain(this.app, 64);
    this.buildVillage();
    const home = this.buildHome();
    this.buildWoodland();
    this.buildMountain();
    this.buildHarbour();
    const bike = this.buildBike();
    const raftEntity = this.buildRaft();
    this.buildDetails();

    return {
      colliders: this.colliders(),
      bikeEntity: bike.root,
      bikeWheelPivots: bike.wheels,
      raftEntity,
      chimneyEmitters: this.chimneyEmitters,
      fountainEmitter: this.fountainEmitter,
      ...home
    };
  }

  private house(name: string, x: number, z: number, wallMat: pc.Material, roofMat: pc.Material, scale = 1, rotationY = 0) {
    const y = heightAt(x, z);
    const houseRoot = new pc.Entity(name);
    houseRoot.setPosition(x, y, z);
    houseRoot.setEulerAngles(0, rotationY, 0);
    this.app.root.addChild(houseRoot);

    const w = 7.5 * scale;
    const h = 4.8 * scale;
    const d = 6.8 * scale;

    // Stone foundation
    primitive(this.app, `${name}Base`, 'box', this.warmStone, new pc.Vec3(0, 0.4 * scale, 0), new pc.Vec3(w + 0.3, 0.8 * scale, d + 0.3), houseRoot);

    // Main plastered walls
    primitive(this.app, `${name}Walls`, 'box', wallMat, new pc.Vec3(0, h * 0.5 + 0.4 * scale, 0), new pc.Vec3(w, h, d), houseRoot);

    // Timber corner posts
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        primitive(
          this.app,
          `${name}TimberCorner`,
          'box',
          this.darkWood,
          new pc.Vec3(sx * (w * 0.5 - 0.2), h * 0.5 + 0.4 * scale, sz * (d * 0.5 - 0.2)),
          new pc.Vec3(0.48 * scale, h + 0.1, 0.48 * scale),
          houseRoot
        );
      }
    }

    // Wooden front door
    primitive(this.app, `${name}DoorFrame`, 'box', this.darkWood, new pc.Vec3(0, 1.4 * scale, d * 0.5 + 0.05), new pc.Vec3(1.8 * scale, 2.7 * scale, 0.22), houseRoot);
    primitive(this.app, `${name}Door`, 'box', this.wood, new pc.Vec3(0, 1.35 * scale, d * 0.5 + 0.1), new pc.Vec3(1.4 * scale, 2.4 * scale, 0.18), houseRoot);
    primitive(this.app, `${name}DoorKnob`, 'sphere', this.brass, new pc.Vec3(0.5 * scale, 1.3 * scale, d * 0.5 + 0.22), new pc.Vec3(0.14 * scale, 0.14 * scale, 0.14 * scale), houseRoot);

    // Glowing front windows
    for (const sx of [-2.4 * scale, 2.4 * scale]) {
      primitive(this.app, `${name}WinFrame`, 'box', this.darkWood, new pc.Vec3(sx, 2.2 * scale, d * 0.5 + 0.04), new pc.Vec3(1.5 * scale, 1.6 * scale, 0.16), houseRoot);
      primitive(this.app, `${name}WinGlass`, 'box', this.windowGlow, new pc.Vec3(sx, 2.2 * scale, d * 0.5 + 0.08), new pc.Vec3(1.2 * scale, 1.3 * scale, 0.12), houseRoot);
      // Window flowerbox
      primitive(this.app, `${name}Flowerbox`, 'box', this.darkWood, new pc.Vec3(sx, 1.25 * scale, d * 0.5 + 0.25), new pc.Vec3(1.6 * scale, 0.35 * scale, 0.45 * scale), houseRoot);
      primitive(this.app, `${name}Flowers`, 'sphere', this.redFlower, new pc.Vec3(sx - 0.4 * scale, 1.55 * scale, d * 0.5 + 0.25), new pc.Vec3(0.35 * scale, 0.35 * scale, 0.35 * scale), houseRoot);
      primitive(this.app, `${name}FlowersY`, 'sphere', this.yellowFlower, new pc.Vec3(sx + 0.35 * scale, 1.55 * scale, d * 0.5 + 0.25), new pc.Vec3(0.35 * scale, 0.35 * scale, 0.35 * scale), houseRoot);
    }

    // Overhanging pitched roof (A-frame gable)
    const roofY = h + 0.4 * scale;
    const roofPitch = 32;
    const rL = primitive(this.app, `${name}RoofFront`, 'box', roofMat, new pc.Vec3(0, roofY + 1.1 * scale, -1.8 * scale), new pc.Vec3(w + 1.4 * scale, 0.38 * scale, 4.4 * scale), houseRoot);
    rL.setLocalEulerAngles(-roofPitch, 0, 0);

    const rR = primitive(this.app, `${name}RoofBack`, 'box', roofMat, new pc.Vec3(0, roofY + 1.1 * scale, 1.8 * scale), new pc.Vec3(w + 1.4 * scale, 0.38 * scale, 4.4 * scale), houseRoot);
    rR.setLocalEulerAngles(roofPitch, 0, 0);

    // Ridge cap along the apex
    primitive(this.app, `${name}RoofRidge`, 'box', this.darkWood, new pc.Vec3(0, roofY + 2.3 * scale, 0), new pc.Vec3(w + 1.6 * scale, 0.35 * scale, 0.5 * scale), houseRoot);


    // Stone Chimney
    const chimX = 2.2 * scale;
    const chimZ = -1.5 * scale;
    const chimH = 3.6 * scale;
    primitive(this.app, `${name}Chimney`, 'box', this.darkStone, new pc.Vec3(chimX, roofY + 1.6 * scale, chimZ), new pc.Vec3(0.9 * scale, chimH, 0.9 * scale), houseRoot);
    primitive(this.app, `${name}ChimneyCap`, 'box', this.terracotta, new pc.Vec3(chimX, roofY + 3.4 * scale, chimZ), new pc.Vec3(1.1 * scale, 0.25 * scale, 1.1 * scale), houseRoot);

    const worldChimPos = new pc.Vec3(x + chimX, y + roofY + 3.6 * scale, z + chimZ);
    this.chimneyEmitters.push(worldChimPos);
  }

  private buildVillage() {
    const y = heightAt(0, 0);

    // Village Fountain
    this.fountainEmitter = new pc.Vec3(0, y + 1.8, 0);
    primitive(this.app, 'FountainRim', 'cylinder', this.warmStone, new pc.Vec3(0, y + 0.45, 0), new pc.Vec3(5.6, 0.9, 5.6));
    primitive(this.app, 'FountainPool', 'cylinder', this.water, new pc.Vec3(0, y + 0.75, 0), new pc.Vec3(4.8, 0.25, 4.8));

    // Floating water lilies
    const lilies: ReadonlyArray<readonly [number, number]> = [
      [-1.2, 0.8],
      [1.4, -0.9],
      [-0.8, -1.3]
    ];
    for (const [lx, lz] of lilies) {
      primitive(this.app, 'LilyPad', 'cylinder', this.leafOak, new pc.Vec3(lx, y + 0.88, lz), new pc.Vec3(0.75, 0.04, 0.75));
      primitive(this.app, 'LilyFlower', 'sphere', this.whiteFlower, new pc.Vec3(lx, y + 0.96, lz), new pc.Vec3(0.24, 0.2, 0.24));
    }


    // Central fountain tier & spout
    primitive(this.app, 'FountainPedestal', 'cylinder', this.warmStone, new pc.Vec3(0, y + 1.1, 0), new pc.Vec3(1.2, 1.2, 1.2));
    primitive(this.app, 'FountainBowl', 'cylinder', this.warmStone, new pc.Vec3(0, y + 1.7, 0), new pc.Vec3(2.4, 0.4, 2.4));
    primitive(this.app, 'FountainSpout', 'cylinder', this.metal, new pc.Vec3(0, y + 2.0, 0), new pc.Vec3(0.3, 0.6, 0.3));

    // Surrounding wooden benches & flower planters
    const benches: ReadonlyArray<readonly [number, number, number]> = [
      [-4.2, 3.8, 45],
      [4.2, 3.8, -45],
      [0, -4.8, 0]
    ];
    for (const [bx, bz, rot] of benches) {
      const by = heightAt(bx, bz);
      const bench = new pc.Entity('VillageBench');
      bench.setPosition(bx, by, bz);
      bench.setEulerAngles(0, rot, 0);
      this.app.root.addChild(bench);
      primitive(this.app, 'BenchSeat', 'box', this.wood, new pc.Vec3(0, 0.45, 0), new pc.Vec3(2.2, 0.14, 0.7), bench);
      primitive(this.app, 'BenchBack', 'box', this.wood, new pc.Vec3(0, 0.9, -0.3), new pc.Vec3(2.2, 0.6, 0.12), bench);
      primitive(this.app, 'BenchLegL', 'box', this.darkWood, new pc.Vec3(-0.95, 0.22, 0), new pc.Vec3(0.14, 0.44, 0.6), bench);
      primitive(this.app, 'BenchLegR', 'box', this.darkWood, new pc.Vec3(0.95, 0.22, 0), new pc.Vec3(0.14, 0.44, 0.6), bench);
    }


    // Village Houses
    this.house('Bakery', 14, 9, this.cream, this.terracotta, 0.94, -25);
    this.house('Workshop', -13, 10, this.sageGreen, this.darkWood, 0.96, 20);
    this.house('LittleShop', 14, -11, this.slateBlue, this.terracotta, 0.92, -45);
  }

  private buildHome() {
    const x = -39;
    const z = 31;
    const y = heightAt(x, z);

    const homeRoot = new pc.Entity('PlayerHome');
    homeRoot.setPosition(x, y, z);
    this.app.root.addChild(homeRoot);

    // Warm wooden plank floor
    primitive(this.app, 'HomeFloor', 'box', this.lightWood, new pc.Vec3(0, 0.15, 0), new pc.Vec3(10.5, 0.3, 9.5), homeRoot);

    // Cozy rug
    primitive(this.app, 'HomeRug', 'box', this.terracotta, new pc.Vec3(0, 0.31, 0.5), new pc.Vec3(5.2, 0.04, 4.2), homeRoot);

    // Walls with timber frame
    const wallH = 5.2;
    primitive(this.app, 'HomeWallBack', 'box', this.cream, new pc.Vec3(0, wallH * 0.5, 4.5), new pc.Vec3(10.5, wallH, 0.4), homeRoot);
    primitive(this.app, 'HomeWallLeft', 'box', this.cream, new pc.Vec3(-5.05, wallH * 0.5, 0), new pc.Vec3(0.4, wallH, 9.5), homeRoot);
    primitive(this.app, 'HomeWallRight', 'box', this.cream, new pc.Vec3(5.05, wallH * 0.5, 0), new pc.Vec3(0.4, wallH, 9.5), homeRoot);
    primitive(this.app, 'HomeWallFrontL', 'box', this.cream, new pc.Vec3(-3.5, wallH * 0.5, -4.5), new pc.Vec3(3.4, wallH, 0.4), homeRoot);
    primitive(this.app, 'HomeWallFrontR', 'box', this.cream, new pc.Vec3(3.5, wallH * 0.5, -4.5), new pc.Vec3(3.4, wallH, 0.4), homeRoot);

    // Timber posts
    for (const sx of [-5.05, 5.05]) {
      for (const sz of [-4.5, 4.5]) {
        primitive(this.app, 'HomeTimber', 'box', this.darkWood, new pc.Vec3(sx, wallH * 0.5, sz), new pc.Vec3(0.55, wallH, 0.55), homeRoot);
      }
    }

    // Doorway lintel
    primitive(this.app, 'HomeDoorLintel', 'box', this.darkWood, new pc.Vec3(0, 4.1, -4.5), new pc.Vec3(3.6, 0.45, 0.45), homeRoot);

    // Roof (A-frame gable)
    const roofL = primitive(this.app, 'HomeRoofFront', 'box', this.terracotta, new pc.Vec3(0, 6.1, -2.4), new pc.Vec3(11.8, 0.45, 5.8), homeRoot);
    roofL.setLocalEulerAngles(-28, 0, 0);
    const roofR = primitive(this.app, 'HomeRoofBack', 'box', this.terracotta, new pc.Vec3(0, 6.1, 2.4), new pc.Vec3(11.8, 0.45, 5.8), homeRoot);
    roofR.setLocalEulerAngles(28, 0, 0);
    primitive(this.app, 'HomeRoofRidge', 'box', this.darkWood, new pc.Vec3(0, 7.5, 0), new pc.Vec3(12.2, 0.45, 0.6), homeRoot);


    // Chimney & Emitter
    primitive(this.app, 'HomeChimney', 'box', this.darkStone, new pc.Vec3(3.5, 6.2, 2.2), new pc.Vec3(1.1, 3.8, 1.1), homeRoot);
    this.chimneyEmitters.push(new pc.Vec3(x + 3.5, y + 8.1, z + 2.2));

    // Bed in corner
    primitive(this.app, 'HomeBedFrame', 'box', this.darkWood, new pc.Vec3(-3.2, 0.4, 2.6), new pc.Vec3(2.6, 0.6, 3.4), homeRoot);
    primitive(this.app, 'HomeBedMattress', 'box', this.cream, new pc.Vec3(-3.2, 0.8, 2.6), new pc.Vec3(2.4, 0.4, 3.2), homeRoot);
    primitive(this.app, 'HomeBedBlanket', 'box', this.slateBlue, new pc.Vec3(-3.2, 0.9, 2.1), new pc.Vec3(2.45, 0.25, 2.2), homeRoot);
    primitive(this.app, 'HomePillow', 'box', this.whiteFlower, new pc.Vec3(-3.2, 1.05, 3.7), new pc.Vec3(2.0, 0.3, 0.9), homeRoot);

    // Table & Lamp
    const lampPosition = { x: x - 2.4, y: y + 1.2, z: z + 0.2 };
    primitive(this.app, 'HomeTable', 'box', this.wood, new pc.Vec3(-2.4, 0.65, 0.2), new pc.Vec3(1.6, 1.0, 1.4), homeRoot);
    primitive(this.app, 'LampBase', 'cylinder', this.brass, new pc.Vec3(-2.4, 1.2, 0.2), new pc.Vec3(0.45, 0.15, 0.45), homeRoot);
    const lampEntity = primitive(this.app, 'HomeLamp', 'sphere', this.warmGlow, new pc.Vec3(-2.4, 1.6, 0.2), new pc.Vec3(0.72, 0.72, 0.72), homeRoot);

    // Chair
    const chairPosition = { x: x + 1.8, y, z: z + 1.7 };
    primitive(this.app, 'HomeChairSeat', 'box', this.wood, new pc.Vec3(1.8, 0.65, 1.7), new pc.Vec3(1.4, 0.25, 1.4), homeRoot);
    primitive(this.app, 'HomeChairBack', 'box', this.wood, new pc.Vec3(1.8, 1.35, 2.3), new pc.Vec3(1.4, 1.2, 0.18), homeRoot);
    primitive(this.app, 'HomeChairCushion', 'box', this.terracotta, new pc.Vec3(1.8, 0.82, 1.7), new pc.Vec3(1.2, 0.12, 1.2), homeRoot);

    // Cupboard
    const cupboardPosition = { x: x + 3.2, y, z: z + 3.2 };
    primitive(this.app, 'HomeCupboardBody', 'box', this.darkWood, new pc.Vec3(3.2, 1.8, 3.2), new pc.Vec3(2.4, 3.4, 0.9), homeRoot);
    const cupboardDoor = primitive(this.app, 'HomeCupboardDoor', 'box', this.lightWood, new pc.Vec3(3.2, 1.8, 2.7), new pc.Vec3(2.1, 3.1, 0.18), homeRoot);
    primitive(this.app, 'CupboardHandle', 'sphere', this.brass, new pc.Vec3(0.8, 0, -0.15), new pc.Vec3(0.16, 0.16, 0.16), cupboardDoor);

    return { lampEntity, cupboardDoor, chairPosition, lampPosition, cupboardPosition };
  }

  private treeOak(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity('OakTree');
    root.setPosition(x, y, z);
    this.app.root.addChild(root);

    // Textured trunk
    primitive(this.app, 'OakTrunk', 'cylinder', this.wood, new pc.Vec3(0, 2.2 * scale, 0), new pc.Vec3(0.85 * scale, 4.4 * scale, 0.85 * scale), root);

    // Layered foliage spheres
    const canopies = [
      { ox: 0, oy: 5.2, oz: 0, s: 4.2, mat: this.leafOak },
      { ox: 1.2, oy: 6.2, oz: -0.6, s: 3.2, mat: this.leafOak2 },
      { ox: -1.0, oy: 5.8, oz: 0.8, s: 3.4, mat: this.leafOak },
      { ox: 0.2, oy: 7.4, oz: 0.2, s: 2.8, mat: this.leafOak2 }
    ];

    for (const c of canopies) {
      primitive(this.app, 'Canopy', 'sphere', c.mat, new pc.Vec3(c.ox * scale, c.oy * scale, c.oz * scale), new pc.Vec3(c.s * scale, c.s * 0.9 * scale, c.s * scale), root);
    }
  }

  private treePine(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity('PineTree');
    root.setPosition(x, y, z);
    this.app.root.addChild(root);

    // Trunk
    primitive(this.app, 'PineTrunk', 'cylinder', this.darkWood, new pc.Vec3(0, 2.0 * scale, 0), new pc.Vec3(0.7 * scale, 4.0 * scale, 0.7 * scale), root);

    // Tiered cones
    const tiers = [
      { oy: 4.0, r: 3.8, h: 2.8 },
      { oy: 5.8, r: 3.0, h: 2.4 },
      { oy: 7.4, r: 2.2, h: 2.0 },
      { oy: 8.8, r: 1.4, h: 1.6 }
    ];

    for (const t of tiers) {
      primitive(this.app, 'PineTier', 'cone', this.leafPine, new pc.Vec3(0, t.oy * scale, 0), new pc.Vec3(t.r * scale, t.h * scale, t.r * scale), root);
    }
  }

  private treeBirch(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity('BirchTree');
    root.setPosition(x, y, z);
    this.app.root.addChild(root);

    // Slender white trunk
    primitive(this.app, 'BirchTrunk', 'cylinder', this.cream, new pc.Vec3(0, 2.6 * scale, 0), new pc.Vec3(0.55 * scale, 5.2 * scale, 0.55 * scale), root);

    // Golden-green foliage
    primitive(this.app, 'BirchCanopyA', 'sphere', this.leafBirch, new pc.Vec3(0, 5.8 * scale, 0), new pc.Vec3(3.2 * scale, 3.6 * scale, 3.2 * scale), root);
    primitive(this.app, 'BirchCanopyB', 'sphere', this.leafBirch, new pc.Vec3(0.6 * scale, 6.8 * scale, -0.4 * scale), new pc.Vec3(2.4 * scale, 2.4 * scale, 2.4 * scale), root);
  }

  private buildWoodland() {
    const oaks: ReadonlyArray<readonly [number, number, number]> = [
      [-48, -26, 1.25], [-58, -34, 1.35], [-38, -36, 1.15], [-54, -48, 1.2], [-65, -42, 1.3]
    ];
    for (const [x, z, s] of oaks) this.treeOak(x, z, s);

    const pines: ReadonlyArray<readonly [number, number, number]> = [
      [-62, -22, 1.3], [-44, -46, 1.2], [-36, -52, 1.35], [-68, -52, 1.25], [-50, -56, 1.1]
    ];
    for (const [x, z, s] of pines) this.treePine(x, z, s);

    const birches: ReadonlyArray<readonly [number, number, number]> = [
      [-32, -22, 1.1], [-42, -16, 1.0], [-26, -28, 1.05]
    ];
    for (const [x, z, s] of birches) this.treeBirch(x, z, s);

    // Woodland Grove clearing (Discovery area)
    const gy = heightAt(-53, -42);
    const groveRoot = new pc.Entity('WoodlandGrove');
    groveRoot.setPosition(-53, gy, -42);
    this.app.root.addChild(groveRoot);

    // Hollow mossy log
    const log = primitive(this.app, 'GroveLog', 'cylinder', this.wood, new pc.Vec3(0, 0.55, 0), new pc.Vec3(0.9, 5.5, 0.9), groveRoot);
    log.setEulerAngles(0, 25, 90);

    // Campfire ring
    primitive(this.app, 'FirePitRim', 'cylinder', this.darkStone, new pc.Vec3(2.8, 0.2, 2.2), new pc.Vec3(1.8, 0.35, 1.8), groveRoot);
    primitive(this.app, 'FirePitCoals', 'cylinder', this.terracotta, new pc.Vec3(2.8, 0.35, 2.2), new pc.Vec3(1.4, 0.15, 1.4), groveRoot);
    primitive(this.app, 'FireEmberGlow', 'sphere', this.warmGlow, new pc.Vec3(2.8, 0.45, 2.2), new pc.Vec3(0.6, 0.3, 0.6), groveRoot);

    // Cozy mini tent (A-frame)
    const tent = new pc.Entity('GroveTent');
    tent.setPosition(-56, heightAt(-56, -44), -44);
    tent.setEulerAngles(0, 40, 0);
    this.app.root.addChild(tent);
    const tL = primitive(this.app, 'TentL', 'box', this.tentCanvas, new pc.Vec3(-0.9, 1.1, 0), new pc.Vec3(2.2, 0.12, 3.2), tent);
    tL.setLocalEulerAngles(0, 0, -52);
    const tR = primitive(this.app, 'TentR', 'box', this.tentCanvas, new pc.Vec3(0.9, 1.1, 0), new pc.Vec3(2.2, 0.12, 3.2), tent);
    tR.setLocalEulerAngles(0, 0, 52);


    // Toadstools
    const mushrooms: ReadonlyArray<readonly [number, number, number]> = [
      [-1.2, 2.4, 0.4],
      [-1.8, 2.1, 0.3],
      [1.2, -2.2, 0.45],
      [1.6, -1.8, 0.35]
    ];
    for (const [mx, mz, ms] of mushrooms) {
      primitive(this.app, 'MushroomStem', 'cylinder', this.cream, new pc.Vec3(mx, 0.2 * ms, mz), new pc.Vec3(0.25 * ms, 0.4 * ms, 0.25 * ms), groveRoot);
      primitive(this.app, 'MushroomCap', 'sphere', this.redFlower, new pc.Vec3(mx, 0.42 * ms, mz), new pc.Vec3(0.7 * ms, 0.35 * ms, 0.7 * ms), groveRoot);
    }

  }

  private buildMountain() {
    const summitY = heightAt(46, -50);
    const summitRoot = new pc.Entity('MountainSummit');
    summitRoot.setPosition(46, summitY, -50);
    this.app.root.addChild(summitRoot);

    // Carved stone platform
    primitive(this.app, 'SummitPlatform', 'cylinder', this.warmStone, new pc.Vec3(0, 0.4, 0), new pc.Vec3(6.5, 0.8, 6.5), summitRoot);
    primitive(this.app, 'SummitInnerRing', 'cylinder', this.darkStone, new pc.Vec3(0, 0.75, 0), new pc.Vec3(4.8, 0.2, 4.8), summitRoot);

    // Overlook rustic bench
    primitive(this.app, 'SummitBenchSeat', 'box', this.wood, new pc.Vec3(0, 1.1, -1.8), new pc.Vec3(2.6, 0.2, 0.8), summitRoot);
    primitive(this.app, 'SummitBenchLegL', 'box', this.darkStone, new pc.Vec3(-1.1, 0.55, -1.8), new pc.Vec3(0.3, 0.9, 0.6), summitRoot);
    primitive(this.app, 'SummitBenchLegR', 'box', this.darkStone, new pc.Vec3(1.1, 0.55, -1.8), new pc.Vec3(0.3, 0.9, 0.6), summitRoot);

    // Summit Flagpole & fluttering banner
    primitive(this.app, 'FlagPole', 'cylinder', this.metal, new pc.Vec3(1.8, 3.2, 1.2), new pc.Vec3(0.18, 6.2, 0.18), summitRoot);
    primitive(this.app, 'FlagFinial', 'sphere', this.brass, new pc.Vec3(1.8, 6.3, 1.2), new pc.Vec3(0.35, 0.35, 0.35), summitRoot);
    const flag = primitive(this.app, 'FlagBanner', 'box', this.redFlower, new pc.Vec3(1.8 + 0.9, 5.5, 1.2), new pc.Vec3(1.7, 1.1, 0.08), summitRoot);
    flag.setLocalEulerAngles(0, 20, 0);

    // Mountain rock clusters along trail
    const mountainRocks: ReadonlyArray<readonly [number, number, number]> = [
      [24, -26, 1.3], [36, -29, 1.4], [31, -39, 1.2], [43, -42, 1.5], [40, -48, 1.25], [49, -46, 1.4]
    ];
    for (const [rx, rz, rs] of mountainRocks) {
      const ry = heightAt(rx, rz);
      primitive(this.app, 'MountainCrag', 'box', this.darkStone, new pc.Vec3(rx, ry + 1.2 * rs, rz), new pc.Vec3(3.2 * rs, 2.4 * rs, 2.8 * rs))
        .setEulerAngles(15, 35, 10);
    }
  }

  private buildHarbour() {
    // Water surface
    const waterW = WATER_BOUNDS.maxX - WATER_BOUNDS.minX;
    const waterD = WATER_BOUNDS.maxZ - WATER_BOUNDS.minZ;
    const waterEntity = primitive(
      this.app,
      'HarbourWater',
      'box',
      this.water,
      new pc.Vec3(53, WATER_SURFACE_Y - 0.25, 64),
      new pc.Vec3(waterW, 0.5, waterD)
    );
    waterEntity.render!.castShadows = false;

    // Wooden Dock Boardwalk
    const dockY = WATER_SURFACE_Y + 0.65;
    const dockRoot = new pc.Entity('HarbourDock');
    dockRoot.setPosition(42, dockY, 52);
    this.app.root.addChild(dockRoot);

    // Main dock platform
    primitive(this.app, 'DockPlanks', 'box', this.lightWood, new pc.Vec3(0, 0, 0), new pc.Vec3(6.4, 0.45, 14.5), dockRoot);

    // Piling posts with ropes
    for (const x of [-2.9, 2.9]) {
      for (const z of [-6.0, -2.0, 2.0, 6.0]) {
        primitive(this.app, 'DockPost', 'cylinder', this.darkWood, new pc.Vec3(x, -0.6, z), new pc.Vec3(0.5, 2.8, 0.5), dockRoot);
        // Post rope ring
        primitive(this.app, 'PostRope', 'cylinder', this.lightWood, new pc.Vec3(x, 0.35, z), new pc.Vec3(0.62, 0.15, 0.62), dockRoot);
      }
    }

    // Cargo crates & barrels on the dock
    primitive(this.app, 'CargoCrateA', 'box', this.wood, new pc.Vec3(-1.8, 0.8, -4.5), new pc.Vec3(1.4, 1.2, 1.4), dockRoot);
    primitive(this.app, 'CargoCrateB', 'box', this.wood, new pc.Vec3(-1.6, 1.8, -4.3), new pc.Vec3(1.1, 0.9, 1.1), dockRoot)
      .setLocalEulerAngles(0, 15, 0);
    primitive(this.app, 'FishBarrelA', 'cylinder', this.darkWood, new pc.Vec3(1.8, 0.75, -5.0), new pc.Vec3(0.9, 1.1, 0.9), dockRoot);
    primitive(this.app, 'FishBarrelB', 'cylinder', this.darkWood, new pc.Vec3(2.0, 0.75, -3.8), new pc.Vec3(0.85, 1.0, 0.85), dockRoot);

    // Dock Lantern
    primitive(this.app, 'DockLanternPost', 'cylinder', this.metal, new pc.Vec3(2.6, 1.4, 6.2), new pc.Vec3(0.18, 2.6, 0.18), dockRoot);
    primitive(this.app, 'DockLanternGlow', 'sphere', this.warmGlow, new pc.Vec3(2.6, 2.6, 6.2), new pc.Vec3(0.48, 0.55, 0.48), dockRoot);
  }

  private buildBike() {
    const root = new pc.Entity('TinyBike');
    root.setPosition(-10, heightAt(-10, 13) + 0.8, 13);
    this.app.root.addChild(root);

    const wheels: pc.Entity[] = [];

    // Wheels
    for (const z of [-1.35, 1.35]) {
      const pivot = new pc.Entity(z < 0 ? 'BikeFrontWheelPivot' : 'BikeRearWheelPivot');
      pivot.setLocalPosition(0, 0, z);
      root.addChild(pivot);

      // Tire & rim
      const tire = primitive(this.app, 'Tire', 'cylinder', this.darkStone, new pc.Vec3(0, 0, 0), new pc.Vec3(1.35, 0.16, 1.35), pivot);
      tire.setLocalEulerAngles(0, 0, 90);
      const hub = primitive(this.app, 'Hub', 'cylinder', this.brass, new pc.Vec3(0, 0, 0), new pc.Vec3(0.35, 0.22, 0.35), pivot);
      hub.setLocalEulerAngles(0, 0, 90);

      wheels.push(pivot);
    }

    // Bike Frame Tubes (Glossy coral red)
    const frameBottom = primitive(this.app, 'FrameBottom', 'box', this.terracotta, new pc.Vec3(0, 0.15, 0), new pc.Vec3(0.14, 0.14, 2.6), root);
    frameBottom.setLocalEulerAngles(0, 0, 0);

    const frameSeatTube = primitive(this.app, 'SeatTube', 'box', this.terracotta, new pc.Vec3(0, 0.65, 0.25), new pc.Vec3(0.14, 1.1, 0.14), root);
    frameSeatTube.setLocalEulerAngles(-18, 0, 0);

    const frameHeadTube = primitive(this.app, 'HeadTube', 'box', this.terracotta, new pc.Vec3(0, 0.75, -1.05), new pc.Vec3(0.14, 1.3, 0.14), root);
    frameHeadTube.setLocalEulerAngles(22, 0, 0);

    // Saddle
    primitive(this.app, 'Saddle', 'box', this.darkWood, new pc.Vec3(0, 1.18, 0.42), new pc.Vec3(0.48, 0.16, 0.65), root);

    // Handlebars
    primitive(this.app, 'Handlebars', 'box', this.metal, new pc.Vec3(0, 1.35, -0.92), new pc.Vec3(1.45, 0.12, 0.12), root);
    for (const sx of [-0.68, 0.68]) {
      primitive(this.app, 'Grip', 'cylinder', this.darkWood, new pc.Vec3(sx, 1.35, -0.92), new pc.Vec3(0.16, 0.22, 0.16), root)
        .setLocalEulerAngles(0, 0, 90);
    }

    // Headlight
    primitive(this.app, 'Headlight', 'cylinder', this.brass, new pc.Vec3(0, 1.15, -1.2), new pc.Vec3(0.32, 0.24, 0.32), root)
      .setLocalEulerAngles(90, 0, 0);
    primitive(this.app, 'HeadlightLens', 'sphere', this.warmGlow, new pc.Vec3(0, 1.15, -1.32), new pc.Vec3(0.24, 0.24, 0.12), root);

    return { root, wheels };
  }

  private buildRaft() {
    const root = new pc.Entity('TinyRaft');
    root.setPosition(50, WATER_SURFACE_Y + 0.15, 59);
    this.app.root.addChild(root);

    // Timber buoyant logs
    for (let x = -2.2; x <= 2.2; x += 0.88) {
      primitive(this.app, 'RaftLog', 'cylinder', this.lightWood, new pc.Vec3(x, 0, 0), new pc.Vec3(0.72, 4.6, 0.72), root)
        .setLocalEulerAngles(90, 0, 0);
    }

    // Cross beams & lashings
    for (const z of [-1.5, 0, 1.5]) {
      primitive(this.app, 'CrossBeam', 'box', this.darkWood, new pc.Vec3(0, 0.38, z), new pc.Vec3(5.2, 0.18, 0.28), root);
    }

    // Steering Oar / Rudder at back
    primitive(this.app, 'RudderShaft', 'cylinder', this.darkWood, new pc.Vec3(0, 0.6, 2.4), new pc.Vec3(0.16, 2.6, 0.16), root)
      .setLocalEulerAngles(35, 0, 0);
    primitive(this.app, 'RudderBlade', 'box', this.wood, new pc.Vec3(0, 0.1, 3.2), new pc.Vec3(0.08, 0.65, 1.1), root)
      .setLocalEulerAngles(35, 0, 0);

    return root;
  }

  private buildDetails() {
    // Wildflower patches around the world
    const flowers = [
      { x: 5, z: 2, mat: this.redFlower },
      { x: 6, z: 4, mat: this.yellowFlower },
      { x: -7, z: -4, mat: this.purpleFlower },
      { x: -12, z: -5, mat: this.whiteFlower },
      { x: 18, z: 16, mat: this.yellowFlower },
      { x: 25, z: 24, mat: this.redFlower },
      { x: -28, z: 18, mat: this.purpleFlower },
      { x: -32, z: 24, mat: this.yellowFlower },
      { x: 16, z: -18, mat: this.whiteFlower },
      { x: 22, z: -22, mat: this.purpleFlower }
    ];

    for (const f of flowers) {
      const y = heightAt(f.x, f.z);
      for (let i = 0; i < 4; i += 1) {
        const ox = (Math.sin(i * 1.7) * 0.8);
        const oz = (Math.cos(i * 1.7) * 0.8);
        primitive(this.app, 'FlowerStem', 'cylinder', this.leafOak, new pc.Vec3(f.x + ox, y + 0.18, f.z + oz), new pc.Vec3(0.06, 0.36, 0.06));
        primitive(this.app, 'FlowerPetal', 'sphere', f.mat, new pc.Vec3(f.x + ox, y + 0.36, f.z + oz), new pc.Vec3(0.24, 0.18, 0.24));
      }
    }
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
