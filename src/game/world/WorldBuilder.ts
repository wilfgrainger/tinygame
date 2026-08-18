import * as pc from 'playcanvas';
import type { Aabb2 } from '../player/CollisionWorld';
import { heightAt, WATER_SURFACE_Y } from './heightfield';
import { createTerrain, material, primitive } from './meshFactory';
import { WATER_BOUNDS } from './WorldDefinition';

export type WorldRuntime = {
  colliders: Aabb2[];
  bikeEntity: pc.Entity;
  bikeWheelPivots: pc.Entity[];
  carEntity: pc.Entity;
  carWheelPivots: pc.Entity[];
  carFrontWheelMounts: pc.Entity[];
  raftEntity: pc.Entity;
  lampEntity: pc.Entity;
  cupboardDoor: pc.Entity;
  chairPosition: { x: number; y: number; z: number };
  lampPosition: { x: number; y: number; z: number };
  cupboardPosition: { x: number; y: number; z: number };
  cafeCounterPosition: { x: number; y: number; z: number };
  groceryRegisterPosition: { x: number; y: number; z: number };
  townHallPodiumPosition: { x: number; y: number; z: number };
  doorbellPosition: { x: number; y: number; z: number };
  fridgePosition: { x: number; y: number; z: number };
  chimneyEmitters: pc.Vec3[];
  fountainEmitter: pc.Vec3;
  cafeSteamEmitter: pc.Vec3;
};

export class WorldBuilder {
  // Town & Architectural Materials
  private asphalt = material(new pc.Color(0.22, 0.24, 0.26), 0.2);
  private roadStripe = material(new pc.Color(0.96, 0.96, 0.96), 0.3);
  private sidewalk = material(new pc.Color(0.78, 0.79, 0.80), 0.15);
  private curb = material(new pc.Color(0.68, 0.70, 0.72), 0.15);
  private wood = material(new pc.Color(0.48, 0.30, 0.18), 0.25);
  private darkWood = material(new pc.Color(0.25, 0.15, 0.08), 0.2);
  private lightWood = material(new pc.Color(0.74, 0.58, 0.40), 0.25);
  private cream = material(new pc.Color(0.95, 0.92, 0.84), 0.15);
  private cafePink = material(new pc.Color(0.95, 0.58, 0.68), 0.2);
  private martGreen = material(new pc.Color(0.32, 0.68, 0.46), 0.2);
  private townBlue = material(new pc.Color(0.28, 0.48, 0.72), 0.25);
  private policeNavy = material(new pc.Color(0.16, 0.24, 0.42), 0.3);
  private terracotta = material(new pc.Color(0.82, 0.40, 0.28), 0.2);
  private warmStone = material(new pc.Color(0.72, 0.70, 0.64), 0.15);
  private darkStone = material(new pc.Color(0.44, 0.44, 0.42), 0.2);
  private leafOak = material(new pc.Color(0.28, 0.58, 0.26), 0.15);
  private leafOak2 = material(new pc.Color(0.38, 0.68, 0.32), 0.15);
  private leafPine = material(new pc.Color(0.18, 0.42, 0.26), 0.15);
  private leafBirch = material(new pc.Color(0.78, 0.72, 0.28), 0.2);
  private water = material(new pc.Color(0.22, 0.62, 0.78), 0.85, 0.05, 0.78);
  private glass = material(new pc.Color(0.68, 0.85, 0.95), 0.9, 0.1, 0.65);
  private warmGlow = material(new pc.Color(1.0, 0.90, 0.55), 0.4, 0, 1.0, new pc.Color(0.9, 0.75, 0.35));
  private windowGlow = material(new pc.Color(1.0, 0.88, 0.52), 0.8, 0, 0.95, new pc.Color(0.8, 0.65, 0.2));
  private redFlower = material(new pc.Color(0.92, 0.25, 0.25), 0.3);
  private yellowFlower = material(new pc.Color(0.98, 0.82, 0.22), 0.3);
  private whiteFlower = material(new pc.Color(0.98, 0.98, 0.98), 0.4);
  private metal = material(new pc.Color(0.32, 0.34, 0.38), 0.7, 0.7);
  private chrome = material(new pc.Color(0.88, 0.90, 0.92), 0.9, 0.8);
  private brass = material(new pc.Color(0.84, 0.70, 0.32), 0.8, 0.6);
  private carTurquoise = material(new pc.Color(0.18, 0.75, 0.82), 0.8, 0.4);
  private carLeather = material(new pc.Color(0.88, 0.72, 0.55), 0.3);
  private tentCanvas = material(new pc.Color(0.88, 0.82, 0.68), 0.15);

  private chimneyEmitters: pc.Vec3[] = [];
  private fountainEmitter = new pc.Vec3(0, 0, 0);
  private cafeSteamEmitter = new pc.Vec3(18, 2, 12);

  constructor(private readonly app: pc.Application) {}

  build(): WorldRuntime {
    createTerrain(this.app, 64);
    this.buildTownRoads();
    this.buildTownSquare();
    this.buildCafe();
    this.buildSupermarket();
    this.buildTownHall();
    const home = this.buildSuburbanHouse();
    this.buildWoodland();
    this.buildMountain();
    this.buildHarbour();
    const bike = this.buildBike();
    const car = this.buildCar();
    const raftEntity = this.buildRaft();
    this.buildDetails();

    return {
      colliders: this.colliders(),
      bikeEntity: bike.root,
      bikeWheelPivots: bike.wheels,
      carEntity: car.root,
      carWheelPivots: car.wheels,
      carFrontWheelMounts: car.frontMounts,
      raftEntity,
      chimneyEmitters: this.chimneyEmitters,
      fountainEmitter: this.fountainEmitter,
      cafeSteamEmitter: this.cafeSteamEmitter,
      cafeCounterPosition: { x: 18.5, y: heightAt(18.5, 12), z: 12.2 },
      groceryRegisterPosition: { x: -17.5, y: heightAt(-17.5, 11), z: 11.2 },
      townHallPodiumPosition: { x: 18, y: heightAt(18, -17), z: -17.5 },
      doorbellPosition: { x: -34.8, y: heightAt(-34.8, 27) + 1.2, z: 27 },
      fridgePosition: { x: -41.2, y: heightAt(-41.2, 32.5), z: 32.5 },
      ...home
    };
  }

  private buildTownRoads() {
    const roadY = heightAt(0, 0) + 0.06;
    const roadGroup = new pc.Entity('TownRoadGrid');
    this.app.root.addChild(roadGroup);

    // North-South Main Town Avenue (Z: -32 to 32, X: 0)
    primitive(this.app, 'AvenueAsphalt', 'box', this.asphalt, new pc.Vec3(0, roadY, 0), new pc.Vec3(8.8, 0.12, 64), roadGroup);
    // Sidewalks along Avenue
    primitive(this.app, 'AvenueSidewalkL', 'box', this.sidewalk, new pc.Vec3(-5.6, roadY + 0.08, 0), new pc.Vec3(2.4, 0.18, 64), roadGroup);
    primitive(this.app, 'AvenueSidewalkR', 'box', this.sidewalk, new pc.Vec3(5.6, roadY + 0.08, 0), new pc.Vec3(2.4, 0.18, 64), roadGroup);

    // Curbs
    primitive(this.app, 'AvenueCurbL', 'box', this.curb, new pc.Vec3(-4.45, roadY + 0.09, 0), new pc.Vec3(0.2, 0.20, 64), roadGroup);
    primitive(this.app, 'AvenueCurbR', 'box', this.curb, new pc.Vec3(4.45, roadY + 0.09, 0), new pc.Vec3(0.2, 0.20, 64), roadGroup);

    // East-West Boulevard (X: -36 to 36, Z: 0)
    primitive(this.app, 'BoulevardAsphalt', 'box', this.asphalt, new pc.Vec3(0, roadY, 0), new pc.Vec3(72, 0.12, 8.8), roadGroup);
    primitive(this.app, 'BoulevardSidewalkT', 'box', this.sidewalk, new pc.Vec3(0, roadY + 0.08, 5.6), new pc.Vec3(72, 0.18, 2.4), roadGroup);
    primitive(this.app, 'BoulevardSidewalkB', 'box', this.sidewalk, new pc.Vec3(0, roadY + 0.08, -5.6), new pc.Vec3(72, 0.18, 2.4), roadGroup);

    // Painted White Dashed Centerlines
    for (let z = -28; z <= 28; z += 4.5) {
      if (Math.abs(z) < 5) continue; // skip intersection
      primitive(this.app, 'AvenueStripe', 'box', this.roadStripe, new pc.Vec3(0, roadY + 0.07, z), new pc.Vec3(0.32, 0.02, 2.4), roadGroup);
    }
    for (let x = -32; x <= 32; x += 4.5) {
      if (Math.abs(x) < 5) continue; // skip intersection
      primitive(this.app, 'BoulevardStripe', 'box', this.roadStripe, new pc.Vec3(x, roadY + 0.07, 0), new pc.Vec3(2.4, 0.02, 0.32), roadGroup);
    }

    // Pedestrian Zebra Crossings
    for (const offset of [-4.8, 4.8]) {
      // NS Crosswalks
      for (let s = -3.2; s <= 3.2; s += 1.1) {
        primitive(this.app, 'ZebraNS', 'box', this.roadStripe, new pc.Vec3(s, roadY + 0.07, offset), new pc.Vec3(0.65, 0.02, 1.4), roadGroup);
      }
      // EW Crosswalks
      for (let s = -3.2; s <= 3.2; s += 1.1) {
        primitive(this.app, 'ZebraEW', 'box', this.roadStripe, new pc.Vec3(offset, roadY + 0.07, s), new pc.Vec3(1.4, 0.02, 0.65), roadGroup);
      }
    }

    // Streetlamps along sidewalks
    const lampPosts = [
      { x: -5.8, z: -14 }, { x: 5.8, z: -14 },
      { x: -5.8, z: 14 }, { x: 5.8, z: 14 },
      { x: -16, z: 5.8 }, { x: 16, z: 5.8 },
      { x: -16, z: -5.8 }, { x: 16, z: -5.8 }
    ];
    for (const lp of lampPosts) {
      const ly = heightAt(lp.x, lp.z);
      const post = new pc.Entity('TownStreetLamp');
      post.setPosition(lp.x, ly, lp.z);
      this.app.root.addChild(post);

      primitive(this.app, 'LampPole', 'cylinder', this.metal, new pc.Vec3(0, 2.4, 0), new pc.Vec3(0.22, 4.8, 0.22), post);
      primitive(this.app, 'LampArm', 'box', this.metal, new pc.Vec3(0, 4.6, 0.4), new pc.Vec3(0.18, 0.18, 0.9), post);
      primitive(this.app, 'LampLantern', 'box', this.metal, new pc.Vec3(0, 4.3, 0.8), new pc.Vec3(0.55, 0.7, 0.55), post);
      primitive(this.app, 'LampBulb', 'sphere', this.warmGlow, new pc.Vec3(0, 4.25, 0.8), new pc.Vec3(0.42, 0.45, 0.42), post);
    }
  }

  private buildTownSquare() {
    const y = heightAt(0, 0);
    const square = new pc.Entity('TownSquare');
    square.setPosition(0, y, 0);
    this.app.root.addChild(square);

    // Landmark Town Clock Tower
    const towerX = 0;
    const towerZ = -18;
    const towerY = heightAt(towerX, towerZ);
    const tower = new pc.Entity('ClockTower');
    tower.setPosition(towerX, towerY, towerZ);
    this.app.root.addChild(tower);

    // Base & Shaft
    primitive(this.app, 'TowerBase', 'box', this.warmStone, new pc.Vec3(0, 2.5, 0), new pc.Vec3(4.8, 5.0, 4.8), tower);
    primitive(this.app, 'TowerShaft', 'box', this.cream, new pc.Vec3(0, 8.5, 0), new pc.Vec3(3.8, 7.0, 3.8), tower);
    primitive(this.app, 'TowerBelfry', 'box', this.warmStone, new pc.Vec3(0, 13.0, 0), new pc.Vec3(4.2, 2.2, 4.2), tower);

    // Clock faces on 4 sides
    const clockFaces: ReadonlyArray<readonly [number, number, number]> = [
      [0, 0, 1.95],
      [180, 0, -1.95],
      [90, 1.95, 0],
      [-90, -1.95, 0]
    ];
    for (const [rot, ox, oz] of clockFaces) {
      const clock = primitive(this.app, 'ClockFace', 'cylinder', this.roadStripe, new pc.Vec3(ox, 13.0, oz), new pc.Vec3(1.8, 0.12, 1.8), tower);
      clock.setEulerAngles(90, rot, 0);
      primitive(this.app, 'ClockHub', 'sphere', this.darkWood, new pc.Vec3(ox, 13.0, oz), new pc.Vec3(0.25, 0.25, 0.25), tower);
    }


    // Spire roof
    const spire = primitive(this.app, 'TowerSpire', 'cone', this.townBlue, new pc.Vec3(0, 16.5, 0), new pc.Vec3(4.4, 5.0, 4.4), tower);
    spire.setLocalEulerAngles(0, 0, 0);
    primitive(this.app, 'TowerWeathervane', 'cylinder', this.brass, new pc.Vec3(0, 19.4, 0), new pc.Vec3(0.12, 1.2, 0.12), tower);

    // Central Park Fountain
    this.fountainEmitter = new pc.Vec3(0, y + 1.8, 0);
    primitive(this.app, 'FountainRim', 'cylinder', this.warmStone, new pc.Vec3(0, y + 0.45, 0), new pc.Vec3(5.6, 0.9, 5.6));
    primitive(this.app, 'FountainPool', 'cylinder', this.water, new pc.Vec3(0, y + 0.75, 0), new pc.Vec3(4.8, 0.25, 4.8));

    // Floating water lilies
    const lilies: ReadonlyArray<readonly [number, number]> = [[-1.2, 0.8], [1.4, -0.9], [-0.8, -1.3]];
    for (const [lx, lz] of lilies) {
      primitive(this.app, 'LilyPad', 'cylinder', this.leafOak, new pc.Vec3(lx, y + 0.88, lz), new pc.Vec3(0.75, 0.04, 0.75));
      primitive(this.app, 'LilyFlower', 'sphere', this.whiteFlower, new pc.Vec3(lx, y + 0.96, lz), new pc.Vec3(0.24, 0.2, 0.24));
    }

    // Fountain Pedestal & Spout
    primitive(this.app, 'FountainPedestal', 'cylinder', this.warmStone, new pc.Vec3(0, y + 1.1, 0), new pc.Vec3(1.2, 1.2, 1.2));
    primitive(this.app, 'FountainBowl', 'cylinder', this.warmStone, new pc.Vec3(0, y + 1.7, 0), new pc.Vec3(2.4, 0.4, 2.4));
    primitive(this.app, 'FountainSpout', 'cylinder', this.metal, new pc.Vec3(0, y + 2.0, 0), new pc.Vec3(0.3, 0.6, 0.3));

    // Park Benches
    const benches: ReadonlyArray<readonly [number, number, number]> = [
      [-4.2, 3.8, 45], [4.2, 3.8, -45], [0, -4.8, 0]
    ];
    for (const [bx, bz, rot] of benches) {
      const by = heightAt(bx, bz);
      const bench = new pc.Entity('ParkBench');
      bench.setPosition(bx, by, bz);
      bench.setEulerAngles(0, rot, 0);
      this.app.root.addChild(bench);
      primitive(this.app, 'BenchSeat', 'box', this.wood, new pc.Vec3(0, 0.45, 0), new pc.Vec3(2.2, 0.14, 0.7), bench);
      primitive(this.app, 'BenchBack', 'box', this.wood, new pc.Vec3(0, 0.9, -0.3), new pc.Vec3(2.2, 0.6, 0.12), bench);
      primitive(this.app, 'BenchLegL', 'box', this.darkWood, new pc.Vec3(-0.95, 0.22, 0), new pc.Vec3(0.14, 0.44, 0.6), bench);
      primitive(this.app, 'BenchLegR', 'box', this.darkWood, new pc.Vec3(0.95, 0.22, 0), new pc.Vec3(0.14, 0.44, 0.6), bench);
    }
  }

  private buildCafe() {
    const x = 18;
    const z = 12;
    const y = heightAt(x, z);
    const cafe = new pc.Entity('TownCafe');
    cafe.setPosition(x, y, z);
    this.app.root.addChild(cafe);

    const w = 9.5;
    const h = 5.2;
    const d = 8.5;

    // Floor & Plastered walls
    primitive(this.app, 'CafeFloor', 'box', this.lightWood, new pc.Vec3(0, 0.15, 0), new pc.Vec3(w, 0.3, d), cafe);
    primitive(this.app, 'CafeWallBack', 'box', this.cream, new pc.Vec3(0, h * 0.5, d * 0.5), new pc.Vec3(w, h, 0.4), cafe);
    primitive(this.app, 'CafeWallLeft', 'box', this.cream, new pc.Vec3(-w * 0.5, h * 0.5, 0), new pc.Vec3(0.4, h, d), cafe);
    primitive(this.app, 'CafeWallRight', 'box', this.cream, new pc.Vec3(w * 0.5, h * 0.5, 0), new pc.Vec3(0.4, h, d), cafe);

    // Front Glass Window & Entrance
    primitive(this.app, 'CafeFrontWallR', 'box', this.cafePink, new pc.Vec3(2.8, h * 0.5, -d * 0.5), new pc.Vec3(3.8, h, 0.4), cafe);
    primitive(this.app, 'CafeFrontGlass', 'box', this.glass, new pc.Vec3(-2.2, 2.2, -d * 0.5), new pc.Vec3(4.2, 3.2, 0.15), cafe);
    primitive(this.app, 'CafeFrontBase', 'box', this.cafePink, new pc.Vec3(-2.2, 0.4, -d * 0.5), new pc.Vec3(4.2, 0.8, 0.4), cafe);

    // Striped Awning
    const awning = primitive(this.app, 'CafeAwning', 'box', this.cafePink, new pc.Vec3(0, 4.4, -d * 0.5 - 1.2), new pc.Vec3(w + 0.6, 0.3, 2.6), cafe);
    awning.setLocalEulerAngles(18, 0, 0);

    // Cafe Counter & Coffee Machine
    primitive(this.app, 'CafeCounter', 'box', this.wood, new pc.Vec3(0.5, 0.6, 0.2), new pc.Vec3(5.5, 1.1, 1.2), cafe);
    primitive(this.app, 'PastryCase', 'box', this.glass, new pc.Vec3(-1.2, 1.4, 0.2), new pc.Vec3(2.2, 0.6, 0.9), cafe);

    // Espresso Machine & Steam Emitter
    primitive(this.app, 'EspressoMachine', 'box', this.chrome, new pc.Vec3(1.5, 1.5, 0.2), new pc.Vec3(1.2, 0.8, 0.7), cafe);
    this.cafeSteamEmitter = new pc.Vec3(x + 1.5, y + 2.0, z + 0.2);

    // Cafe Tables & Chairs
    const cafeTables: ReadonlyArray<readonly [number, number]> = [
      [-2.5, 2.2],
      [-2.5, -1.8]
    ];
    for (const [tx, tz] of cafeTables) {
      primitive(this.app, 'CafeTable', 'cylinder', this.lightWood, new pc.Vec3(tx, 0.55, tz), new pc.Vec3(1.4, 1.0, 1.4), cafe);
      primitive(this.app, 'CafeChairA', 'cylinder', this.cafePink, new pc.Vec3(tx - 0.9, 0.35, tz), new pc.Vec3(0.65, 0.7, 0.65), cafe);
      primitive(this.app, 'CafeChairB', 'cylinder', this.cafePink, new pc.Vec3(tx + 0.9, 0.35, tz), new pc.Vec3(0.65, 0.7, 0.65), cafe);
    }


    // Pitched Roof
    const roofL = primitive(this.app, 'CafeRoofL', 'box', this.terracotta, new pc.Vec3(0, h + 1.1, -1.8), new pc.Vec3(w + 1.2, 0.38, 5.5), cafe);
    roofL.setLocalEulerAngles(-30, 0, 0);
    const roofR = primitive(this.app, 'CafeRoofR', 'box', this.terracotta, new pc.Vec3(0, h + 1.1, 1.8), new pc.Vec3(w + 1.2, 0.38, 5.5), cafe);
    roofR.setLocalEulerAngles(30, 0, 0);
    primitive(this.app, 'CafeRidge', 'box', this.darkWood, new pc.Vec3(0, h + 2.4, 0), new pc.Vec3(w + 1.4, 0.35, 0.5), cafe);
  }

  private buildSupermarket() {
    const x = -18;
    const z = 12;
    const y = heightAt(x, z);
    const mart = new pc.Entity('TownSupermarket');
    mart.setPosition(x, y, z);
    this.app.root.addChild(mart);

    const w = 10.5;
    const h = 5.2;
    const d = 8.5;

    // Floor & Plastered walls
    primitive(this.app, 'MartFloor', 'box', this.sidewalk, new pc.Vec3(0, 0.15, 0), new pc.Vec3(w, 0.3, d), mart);
    primitive(this.app, 'MartWallBack', 'box', this.cream, new pc.Vec3(0, h * 0.5, d * 0.5), new pc.Vec3(w, h, 0.4), mart);
    primitive(this.app, 'MartWallLeft', 'box', this.cream, new pc.Vec3(-w * 0.5, h * 0.5, 0), new pc.Vec3(0.4, h, d), mart);
    primitive(this.app, 'MartWallRight', 'box', this.cream, new pc.Vec3(w * 0.5, h * 0.5, 0), new pc.Vec3(0.4, h, d), mart);

    // Front Entrance
    primitive(this.app, 'MartFrontL', 'box', this.martGreen, new pc.Vec3(-3.2, h * 0.5, -d * 0.5), new pc.Vec3(4.0, h, 0.4), mart);
    primitive(this.app, 'MartFrontR', 'box', this.martGreen, new pc.Vec3(3.2, h * 0.5, -d * 0.5), new pc.Vec3(4.0, h, 0.4), mart);

    // Green Storefront Awning
    const awning = primitive(this.app, 'MartAwning', 'box', this.martGreen, new pc.Vec3(0, 4.4, -d * 0.5 - 1.2), new pc.Vec3(w + 0.6, 0.3, 2.6), mart);
    awning.setLocalEulerAngles(18, 0, 0);

    // Grocery Aisles & Shelves
    for (const sx of [-2.2, 1.8]) {
      primitive(this.app, 'AisleShelf', 'box', this.whiteFlower, new pc.Vec3(sx, 1.2, 1.5), new pc.Vec3(1.2, 2.2, 4.8), mart);
      // Colorful grocery boxes
      for (let sz = -0.5; sz <= 3.5; sz += 1.0) {
        primitive(this.app, 'CerealBox', 'box', this.redFlower, new pc.Vec3(sx - 0.4, 1.5, sz), new pc.Vec3(0.3, 0.4, 0.3), mart);
        primitive(this.app, 'JuiceBottle', 'cylinder', this.yellowFlower, new pc.Vec3(sx + 0.4, 1.5, sz), new pc.Vec3(0.2, 0.4, 0.2), mart);
      }
    }

    // Checkout Counter with Scanner Register
    primitive(this.app, 'CheckoutCounter', 'box', this.wood, new pc.Vec3(0.5, 0.6, -2.0), new pc.Vec3(4.2, 1.1, 1.4), mart);
    primitive(this.app, 'CashRegister', 'box', this.metal, new pc.Vec3(0.5, 1.3, -2.0), new pc.Vec3(0.7, 0.5, 0.6), mart);

    // Pitched Roof
    const roofL = primitive(this.app, 'MartRoofL', 'box', this.townBlue, new pc.Vec3(0, h + 1.1, -1.8), new pc.Vec3(w + 1.2, 0.38, 5.5), mart);
    roofL.setLocalEulerAngles(-30, 0, 0);
    const roofR = primitive(this.app, 'MartRoofR', 'box', this.townBlue, new pc.Vec3(0, h + 1.1, 1.8), new pc.Vec3(w + 1.2, 0.38, 5.5), mart);
    roofR.setLocalEulerAngles(30, 0, 0);
    primitive(this.app, 'MartRidge', 'box', this.darkWood, new pc.Vec3(0, h + 2.4, 0), new pc.Vec3(w + 1.4, 0.35, 0.5), mart);
  }

  private buildTownHall() {
    const x = 18;
    const z = -16;
    const y = heightAt(x, z);
    const hall = new pc.Entity('TownHall');
    hall.setPosition(x, y, z);
    this.app.root.addChild(hall);

    const w = 11.5;
    const h = 5.8;
    const d = 9.5;

    // Stone Steps & Grand Pillars
    primitive(this.app, 'HallSteps', 'box', this.warmStone, new pc.Vec3(0, 0.3, d * 0.5 + 1.2), new pc.Vec3(8.5, 0.6, 2.4), hall);
    for (const px of [-3.8, -1.3, 1.3, 3.8]) {
      primitive(this.app, 'HallPillar', 'cylinder', this.warmStone, new pc.Vec3(px, h * 0.5 + 0.3, d * 0.5 + 0.2), new pc.Vec3(0.7, h, 0.7), hall);
    }

    // Walls & Floor
    primitive(this.app, 'HallFloor', 'box', this.warmStone, new pc.Vec3(0, 0.3, 0), new pc.Vec3(w, 0.6, d), hall);
    primitive(this.app, 'HallWallBack', 'box', this.cream, new pc.Vec3(0, h * 0.5 + 0.3, -d * 0.5), new pc.Vec3(w, h, 0.4), hall);
    primitive(this.app, 'HallWallLeft', 'box', this.cream, new pc.Vec3(-w * 0.5, h * 0.5 + 0.3, 0), new pc.Vec3(0.4, h, d), hall);
    primitive(this.app, 'HallWallRight', 'box', this.cream, new pc.Vec3(w * 0.5, h * 0.5 + 0.3, 0), new pc.Vec3(0.4, h, d), hall);

    // Mayor Podium in the center
    primitive(this.app, 'HallPodium', 'box', this.darkWood, new pc.Vec3(0, 1.2, -2.5), new pc.Vec3(1.6, 1.6, 1.2), hall);
    primitive(this.app, 'HallMic', 'cylinder', this.metal, new pc.Vec3(0, 2.2, -2.4), new pc.Vec3(0.08, 0.4, 0.08), hall);

    // Police Desk on the side
    primitive(this.app, 'PoliceDesk', 'box', this.policeNavy, new pc.Vec3(-3.4, 0.9, 1.5), new pc.Vec3(2.4, 1.1, 1.4), hall);

    // Classical Pediment Triangle
    const pediment = primitive(this.app, 'HallPediment', 'box', this.warmStone, new pc.Vec3(0, h + 1.2, d * 0.5 + 0.2), new pc.Vec3(w + 0.5, 1.6, 0.6), hall);
    pediment.setLocalEulerAngles(0, 0, 0);

    // Pitched Roof
    const roofL = primitive(this.app, 'HallRoofL', 'box', this.slateBlueMat(), new pc.Vec3(0, h + 1.5, -2.2), new pc.Vec3(w + 1.2, 0.38, 6.2), hall);
    roofL.setLocalEulerAngles(-28, 0, 0);
    const roofR = primitive(this.app, 'HallRoofR', 'box', this.slateBlueMat(), new pc.Vec3(0, h + 1.5, 2.2), new pc.Vec3(w + 1.2, 0.38, 6.2), hall);
    roofR.setLocalEulerAngles(28, 0, 0);
    primitive(this.app, 'HallRidge', 'box', this.darkWood, new pc.Vec3(0, h + 2.9, 0), new pc.Vec3(w + 1.4, 0.35, 0.5), hall);
  }

  private slateBlueMat() {
    return material(new pc.Color(0.32, 0.46, 0.60), 0.25);
  }

  private buildSuburbanHouse() {
    const x = -39;
    const z = 31;
    const y = heightAt(x, z);

    const homeRoot = new pc.Entity('PlayerEstate');
    homeRoot.setPosition(x, y, z);
    this.app.root.addChild(homeRoot);

    // Driveway connecting to town
    primitive(this.app, 'Driveway', 'box', this.asphalt, new pc.Vec3(7.5, 0.08, -3.5), new pc.Vec3(6.5, 0.14, 4.8), homeRoot);
    primitive(this.app, 'MailboxPost', 'cylinder', this.wood, new pc.Vec3(10.2, 0.6, -5.5), new pc.Vec3(0.14, 1.2, 0.14), homeRoot);
    primitive(this.app, 'MailboxBox', 'box', this.policeNavy, new pc.Vec3(10.2, 1.2, -5.5), new pc.Vec3(0.4, 0.35, 0.6), homeRoot);

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

    // Doorbell on front door
    primitive(this.app, 'HomeDoorbell', 'cylinder', this.brass, new pc.Vec3(1.8, 1.4, -4.7), new pc.Vec3(0.16, 0.08, 0.16), homeRoot)
      .setLocalEulerAngles(90, 0, 0);

    // Timber posts
    for (const sx of [-5.05, 5.05]) {
      for (const sz of [-4.5, 4.5]) {
        primitive(this.app, 'HomeTimber', 'box', this.darkWood, new pc.Vec3(sx, wallH * 0.5, sz), new pc.Vec3(0.55, wallH, 0.55), homeRoot);
      }
    }

    // Doorway lintel
    primitive(this.app, 'HomeDoorLintel', 'box', this.darkWood, new pc.Vec3(0, 4.1, -4.5), new pc.Vec3(3.6, 0.45, 0.45), homeRoot);

    // Pitched Roof (A-frame gable)
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
    primitive(this.app, 'HomeBedBlanket', 'box', this.townBlue, new pc.Vec3(-3.2, 0.9, 2.1), new pc.Vec3(2.45, 0.25, 2.2), homeRoot);
    primitive(this.app, 'HomePillow', 'box', this.whiteFlower, new pc.Vec3(-3.2, 1.05, 3.7), new pc.Vec3(2.0, 0.3, 0.9), homeRoot);

    // Table & Lamp
    const lampPosition = { x: x - 2.4, y: y + 1.2, z: z + 0.2 };
    primitive(this.app, 'HomeTable', 'box', this.wood, new pc.Vec3(-2.4, 0.65, 0.2), new pc.Vec3(1.6, 1.0, 1.4), homeRoot);
    primitive(this.app, 'LampBase', 'cylinder', this.brass, new pc.Vec3(-2.4, 1.2, 0.2), new pc.Vec3(0.45, 0.15, 0.45), homeRoot);
    const lampEntity = primitive(this.app, 'HomeLamp', 'sphere', this.warmGlow, new pc.Vec3(-2.4, 1.6, 0.2), new pc.Vec3(0.72, 0.72, 0.72), homeRoot);

    // Living Room Sofa & TV
    const chairPosition = { x: x + 1.8, y, z: z + 1.7 };
    primitive(this.app, 'HomeSofaSeat', 'box', this.townBlue, new pc.Vec3(1.8, 0.55, 1.7), new pc.Vec3(2.4, 0.45, 1.4), homeRoot);
    primitive(this.app, 'HomeSofaBack', 'box', this.townBlue, new pc.Vec3(1.8, 1.15, 2.3), new pc.Vec3(2.4, 0.85, 0.35), homeRoot);
    primitive(this.app, 'HomeTVStand', 'box', this.darkWood, new pc.Vec3(1.8, 0.5, -2.5), new pc.Vec3(2.8, 0.7, 0.8), homeRoot);
    primitive(this.app, 'HomeFlatscreenTV', 'box', this.asphalt, new pc.Vec3(1.8, 1.4, -2.5), new pc.Vec3(2.4, 1.3, 0.12), homeRoot);

    // Kitchen Refrigerator & Counter
    primitive(this.app, 'HomeFridge', 'box', this.whiteFlower, new pc.Vec3(-2.2, 1.6, 1.5), new pc.Vec3(1.3, 3.2, 1.2), homeRoot);
    primitive(this.app, 'FridgeHandle', 'cylinder', this.metal, new pc.Vec3(-1.5, 1.8, 1.9), new pc.Vec3(0.08, 0.8, 0.08), homeRoot);

    // Cupboard
    const cupboardPosition = { x: x + 3.2, y, z: z + 3.2 };
    primitive(this.app, 'HomeCupboardBody', 'box', this.darkWood, new pc.Vec3(3.2, 1.8, 3.2), new pc.Vec3(2.4, 3.4, 0.9), homeRoot);
    const cupboardDoor = primitive(this.app, 'HomeCupboardDoor', 'box', this.lightWood, new pc.Vec3(3.2, 1.8, 2.7), new pc.Vec3(2.1, 3.1, 0.18), homeRoot);
    primitive(this.app, 'CupboardHandle', 'sphere', this.brass, new pc.Vec3(0.8, 0, -0.15), new pc.Vec3(0.16, 0.16, 0.16), cupboardDoor);

    return { lampEntity, cupboardDoor, chairPosition, lampPosition, cupboardPosition };
  }

  private buildCar() {
    const root = new pc.Entity('TownMiniCar');
    root.setPosition(5, heightAt(5, 8) + 0.6, 8);
    this.app.root.addChild(root);

    const wheels: pc.Entity[] = [];
    const frontMounts: pc.Entity[] = [];

    // Car Body / Chassis (Glossy Turquoise)
    primitive(this.app, 'CarChassis', 'box', this.carTurquoise, new pc.Vec3(0, 0.45, 0), new pc.Vec3(2.4, 0.75, 4.4), root);
    primitive(this.app, 'CarHood', 'box', this.carTurquoise, new pc.Vec3(0, 0.65, -1.2), new pc.Vec3(2.3, 0.45, 1.8), root);

    // Windshield frame & glass
    const windshield = primitive(this.app, 'CarWindshield', 'box', this.glass, new pc.Vec3(0, 1.25, -0.4), new pc.Vec3(2.2, 0.8, 0.1), root);
    windshield.setLocalEulerAngles(-22, 0, 0);

    // Leather Interior & Steering Wheel
    primitive(this.app, 'CarSeatL', 'box', this.carLeather, new pc.Vec3(-0.45, 0.55, 0.4), new pc.Vec3(0.8, 0.6, 0.9), root);
    primitive(this.app, 'CarSeatR', 'box', this.carLeather, new pc.Vec3(0.45, 0.55, 0.4), new pc.Vec3(0.8, 0.6, 0.9), root);
    const wheel = primitive(this.app, 'CarSteeringWheel', 'cylinder', this.metal, new pc.Vec3(-0.45, 0.95, -0.2), new pc.Vec3(0.42, 0.08, 0.42), root);
    wheel.setLocalEulerAngles(65, 0, 0);

    // Front Headlights
    for (const sx of [-0.85, 0.85]) {
      primitive(this.app, 'HeadlightBezel', 'cylinder', this.chrome, new pc.Vec3(sx, 0.65, -2.15), new pc.Vec3(0.35, 0.15, 0.35), root)
        .setLocalEulerAngles(90, 0, 0);
      primitive(this.app, 'HeadlightGlow', 'sphere', this.warmGlow, new pc.Vec3(sx, 0.65, -2.22), new pc.Vec3(0.26, 0.26, 0.12), root);
    }

    // 4 Wheels (Front steerable, rear fixed)
    const wheelOffsets = [
      { name: 'FrontL', x: -1.25, z: -1.3, isFront: true },
      { name: 'FrontR', x: 1.25, z: -1.3, isFront: true },
      { name: 'RearL', x: -1.25, z: 1.3, isFront: false },
      { name: 'RearR', x: 1.25, z: 1.3, isFront: false }
    ];

    for (const w of wheelOffsets) {
      const mount = new pc.Entity(`WheelMount_${w.name}`);
      mount.setLocalPosition(w.x, 0.15, w.z);
      root.addChild(mount);
      if (w.isFront) frontMounts.push(mount);

      const pivot = new pc.Entity(`WheelPivot_${w.name}`);
      mount.addChild(pivot);

      const tire = primitive(this.app, 'Tire', 'cylinder', this.darkStone, new pc.Vec3(0, 0, 0), new pc.Vec3(0.85, 0.28, 0.85), pivot);
      tire.setLocalEulerAngles(0, 0, 90);
      const hub = primitive(this.app, 'Hub', 'cylinder', this.chrome, new pc.Vec3(0, 0, 0), new pc.Vec3(0.42, 0.32, 0.42), pivot);
      hub.setLocalEulerAngles(0, 0, 90);

      wheels.push(pivot);
    }

    return { root, wheels, frontMounts };
  }

  private buildBike() {
    const root = new pc.Entity('TownBike');
    root.setPosition(15, heightAt(15, 7) + 0.8, 7);
    this.app.root.addChild(root);

    const wheels: pc.Entity[] = [];

    // Wheels
    for (const z of [-1.35, 1.35]) {
      const pivot = new pc.Entity(z < 0 ? 'BikeFrontWheelPivot' : 'BikeRearWheelPivot');
      pivot.setLocalPosition(0, 0, z);
      root.addChild(pivot);

      const tire = primitive(this.app, 'Tire', 'cylinder', this.darkStone, new pc.Vec3(0, 0, 0), new pc.Vec3(1.35, 0.16, 1.35), pivot);
      tire.setLocalEulerAngles(0, 0, 90);
      const hub = primitive(this.app, 'Hub', 'cylinder', this.brass, new pc.Vec3(0, 0, 0), new pc.Vec3(0.35, 0.22, 0.35), pivot);
      hub.setLocalEulerAngles(0, 0, 90);

      wheels.push(pivot);
    }

    // Bike Frame Tubes (Glossy Coral)
    primitive(this.app, 'FrameBottom', 'box', this.terracotta, new pc.Vec3(0, 0.15, 0), new pc.Vec3(0.14, 0.14, 2.6), root);
    const frameSeatTube = primitive(this.app, 'SeatTube', 'box', this.terracotta, new pc.Vec3(0, 0.65, 0.25), new pc.Vec3(0.14, 1.1, 0.14), root);
    frameSeatTube.setLocalEulerAngles(-18, 0, 0);
    const frameHeadTube = primitive(this.app, 'HeadTube', 'box', this.terracotta, new pc.Vec3(0, 0.75, -1.05), new pc.Vec3(0.14, 1.3, 0.14), root);
    frameHeadTube.setLocalEulerAngles(22, 0, 0);

    // Saddle & Handlebars
    primitive(this.app, 'Saddle', 'box', this.darkWood, new pc.Vec3(0, 1.18, 0.42), new pc.Vec3(0.48, 0.16, 0.65), root);
    primitive(this.app, 'Handlebars', 'box', this.metal, new pc.Vec3(0, 1.35, -0.92), new pc.Vec3(1.45, 0.12, 0.12), root);

    // Front Basket
    primitive(this.app, 'Basket', 'box', this.lightWood, new pc.Vec3(0, 1.25, -1.25), new pc.Vec3(0.8, 0.5, 0.5), root);

    return { root, wheels };
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

    // Woodland Grove campsite
    const gy = heightAt(-53, -42);
    const groveRoot = new pc.Entity('WoodlandGrove');
    groveRoot.setPosition(-53, gy, -42);
    this.app.root.addChild(groveRoot);

    const log = primitive(this.app, 'GroveLog', 'cylinder', this.wood, new pc.Vec3(0, 0.55, 0), new pc.Vec3(0.9, 5.5, 0.9), groveRoot);
    log.setEulerAngles(0, 25, 90);

    primitive(this.app, 'FirePitRim', 'cylinder', this.darkStone, new pc.Vec3(2.8, 0.2, 2.2), new pc.Vec3(1.8, 0.35, 1.8), groveRoot);
    primitive(this.app, 'FirePitCoals', 'cylinder', this.terracotta, new pc.Vec3(2.8, 0.35, 2.2), new pc.Vec3(1.4, 0.15, 1.4), groveRoot);
    primitive(this.app, 'FireEmberGlow', 'sphere', this.warmGlow, new pc.Vec3(2.8, 0.45, 2.2), new pc.Vec3(0.6, 0.3, 0.6), groveRoot);

    // Cozy mini tent
    const tent = new pc.Entity('GroveTent');
    tent.setPosition(-56, heightAt(-56, -44), -44);
    tent.setEulerAngles(0, 40, 0);
    this.app.root.addChild(tent);
    const tL = primitive(this.app, 'TentL', 'box', this.tentCanvas, new pc.Vec3(-0.9, 1.1, 0), new pc.Vec3(2.2, 0.12, 3.2), tent);
    tL.setLocalEulerAngles(0, 0, -52);
    const tR = primitive(this.app, 'TentR', 'box', this.tentCanvas, new pc.Vec3(0.9, 1.1, 0), new pc.Vec3(2.2, 0.12, 3.2), tent);
    tR.setLocalEulerAngles(0, 0, 52);
  }

  private treeOak(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity('OakTree');
    root.setPosition(x, y, z);
    this.app.root.addChild(root);
    primitive(this.app, 'OakTrunk', 'cylinder', this.wood, new pc.Vec3(0, 2.2 * scale, 0), new pc.Vec3(0.85 * scale, 4.4 * scale, 0.85 * scale), root);
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
    primitive(this.app, 'PineTrunk', 'cylinder', this.darkWood, new pc.Vec3(0, 2.0 * scale, 0), new pc.Vec3(0.7 * scale, 4.0 * scale, 0.7 * scale), root);
    const tiers = [{ oy: 4.0, r: 3.8, h: 2.8 }, { oy: 5.8, r: 3.0, h: 2.4 }, { oy: 7.4, r: 2.2, h: 2.0 }, { oy: 8.8, r: 1.4, h: 1.6 }];
    for (const t of tiers) {
      primitive(this.app, 'PineTier', 'cone', this.leafPine, new pc.Vec3(0, t.oy * scale, 0), new pc.Vec3(t.r * scale, t.h * scale, t.r * scale), root);
    }
  }

  private treeBirch(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity('BirchTree');
    root.setPosition(x, y, z);
    this.app.root.addChild(root);
    primitive(this.app, 'BirchTrunk', 'cylinder', this.cream, new pc.Vec3(0, 2.6 * scale, 0), new pc.Vec3(0.55 * scale, 5.2 * scale, 0.55 * scale), root);
    primitive(this.app, 'BirchCanopyA', 'sphere', this.leafBirch, new pc.Vec3(0, 5.8 * scale, 0), new pc.Vec3(3.2 * scale, 3.6 * scale, 3.2 * scale), root);
    primitive(this.app, 'BirchCanopyB', 'sphere', this.leafBirch, new pc.Vec3(0.6 * scale, 6.8 * scale, -0.4 * scale), new pc.Vec3(2.4 * scale, 2.4 * scale, 2.4 * scale), root);
  }

  private buildMountain() {
    const summitY = heightAt(46, -50);
    const summitRoot = new pc.Entity('MountainSummit');
    summitRoot.setPosition(46, summitY, -50);
    this.app.root.addChild(summitRoot);

    primitive(this.app, 'SummitPlatform', 'cylinder', this.warmStone, new pc.Vec3(0, 0.4, 0), new pc.Vec3(6.5, 0.8, 6.5), summitRoot);
    primitive(this.app, 'SummitInnerRing', 'cylinder', this.darkStone, new pc.Vec3(0, 0.75, 0), new pc.Vec3(4.8, 0.2, 4.8), summitRoot);
    primitive(this.app, 'SummitBenchSeat', 'box', this.wood, new pc.Vec3(0, 1.1, -1.8), new pc.Vec3(2.6, 0.2, 0.8), summitRoot);

    primitive(this.app, 'FlagPole', 'cylinder', this.metal, new pc.Vec3(1.8, 3.2, 1.2), new pc.Vec3(0.18, 6.2, 0.18), summitRoot);
    primitive(this.app, 'FlagFinial', 'sphere', this.brass, new pc.Vec3(1.8, 6.3, 1.2), new pc.Vec3(0.35, 0.35, 0.35), summitRoot);
    const flag = primitive(this.app, 'FlagBanner', 'box', this.redFlower, new pc.Vec3(2.7, 5.5, 1.2), new pc.Vec3(1.7, 1.1, 0.08), summitRoot);
    flag.setLocalEulerAngles(0, 20, 0);
  }

  private buildHarbour() {
    const waterW = WATER_BOUNDS.maxX - WATER_BOUNDS.minX;
    const waterD = WATER_BOUNDS.maxZ - WATER_BOUNDS.minZ;
    const waterEntity = primitive(this.app, 'HarbourWater', 'box', this.water, new pc.Vec3(53, WATER_SURFACE_Y - 0.25, 64), new pc.Vec3(waterW, 0.5, waterD));
    waterEntity.render!.castShadows = false;

    const dockY = WATER_SURFACE_Y + 0.65;
    const dockRoot = new pc.Entity('HarbourDock');
    dockRoot.setPosition(42, dockY, 52);
    this.app.root.addChild(dockRoot);

    primitive(this.app, 'DockPlanks', 'box', this.lightWood, new pc.Vec3(0, 0, 0), new pc.Vec3(6.4, 0.45, 14.5), dockRoot);

    for (const x of [-2.9, 2.9]) {
      for (const z of [-6.0, -2.0, 2.0, 6.0]) {
        primitive(this.app, 'DockPost', 'cylinder', this.darkWood, new pc.Vec3(x, -0.6, z), new pc.Vec3(0.5, 2.8, 0.5), dockRoot);
      }
    }
    primitive(this.app, 'CargoCrateA', 'box', this.wood, new pc.Vec3(-1.8, 0.8, -4.5), new pc.Vec3(1.4, 1.2, 1.4), dockRoot);
    primitive(this.app, 'FishBarrelA', 'cylinder', this.darkWood, new pc.Vec3(1.8, 0.75, -5.0), new pc.Vec3(0.9, 1.1, 0.9), dockRoot);
  }

  private buildRaft() {
    const root = new pc.Entity('TownRaft');
    root.setPosition(50, WATER_SURFACE_Y + 0.15, 59);
    this.app.root.addChild(root);

    for (let x = -2.2; x <= 2.2; x += 0.88) {
      primitive(this.app, 'RaftLog', 'cylinder', this.lightWood, new pc.Vec3(x, 0, 0), new pc.Vec3(0.72, 4.6, 0.72), root)
        .setLocalEulerAngles(90, 0, 0);
    }
    for (const z of [-1.5, 0, 1.5]) {
      primitive(this.app, 'CrossBeam', 'box', this.darkWood, new pc.Vec3(0, 0.38, z), new pc.Vec3(5.2, 0.18, 0.28), root);
    }
    return root;
  }

  private buildDetails() {
    // Flowerbeds along sidewalks
    const flowerbeds = [
      { x: 7.2, z: 8, mat: this.redFlower },
      { x: 7.2, z: 16, mat: this.yellowFlower },
      { x: -7.2, z: 8, mat: this.yellowFlower },
      { x: -7.2, z: 16, mat: this.redFlower },
      { x: 12, z: -7.2, mat: this.whiteFlower },
      { x: 22, z: -7.2, mat: this.redFlower }
    ];

    for (const fb of flowerbeds) {
      const y = heightAt(fb.x, fb.z);
      primitive(this.app, 'BedBorder', 'box', this.warmStone, new pc.Vec3(fb.x, y + 0.15, fb.z), new pc.Vec3(2.4, 0.25, 2.4));
      primitive(this.app, 'FlowerBloom', 'sphere', fb.mat, new pc.Vec3(fb.x, y + 0.38, fb.z), new pc.Vec3(1.2, 0.3, 1.2));
    }
  }

  private colliders(): Aabb2[] {
    return [
      // Clock Tower
      { minX: -2.5, maxX: 2.5, minZ: -20.5, maxZ: -15.5 },
      // Town Cafe
      { minX: 13, maxX: 23, minZ: 7.5, maxZ: 16.5 },
      // Supermarket
      { minX: -23.5, maxX: -12.5, minZ: 7.5, maxZ: 16.5 },
      // Town Hall
      { minX: 12, maxX: 24, minZ: -21, maxZ: -11 },
      // Suburban House Walls
      { minX: -44, maxX: -34, minZ: 35.1, maxZ: 35.6 },
      { minX: -44, maxX: -43.5, minZ: 26.5, maxZ: 35.5 },
      { minX: -34.5, maxX: -34, minZ: 26.5, maxZ: 35.5 },
      { minX: -44, maxX: -41.9, minZ: 26.4, maxZ: 26.9 },
      { minX: -36.1, maxX: -34, minZ: 26.4, maxZ: 26.9 }
    ];
  }
}
