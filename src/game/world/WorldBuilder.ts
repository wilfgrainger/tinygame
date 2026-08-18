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
  houseClaimPosition: { x: number; y: number; z: number };
  vehicleSpawnPosition: { x: number; y: number; z: number };
  chimneyEmitters: pc.Vec3[];
  fountainEmitter: pc.Vec3;
  cafeSteamEmitter: pc.Vec3;
};

export class WorldBuilder {
  // Rich Curated Material Palette
  private asphalt = material(new pc.Color(0.20, 0.22, 0.24), 0.15);
  private roadStripe = material(new pc.Color(0.96, 0.96, 0.96), 0.35);
  private roadYellow = material(new pc.Color(0.96, 0.82, 0.22), 0.35);
  private sidewalk = material(new pc.Color(0.82, 0.83, 0.85), 0.2);
  private curb = material(new pc.Color(0.70, 0.72, 0.74), 0.2);
  private wood = material(new pc.Color(0.46, 0.28, 0.16), 0.25);
  private darkWood = material(new pc.Color(0.22, 0.13, 0.07), 0.2);
  private lightWood = material(new pc.Color(0.76, 0.60, 0.42), 0.25);
  private cream = material(new pc.Color(0.96, 0.93, 0.86), 0.2);
  private cafePink = material(new pc.Color(0.94, 0.48, 0.60), 0.3, 0.1);
  private cafeStripe = material(new pc.Color(0.98, 0.98, 0.98), 0.3);
  private martGreen = material(new pc.Color(0.28, 0.65, 0.42), 0.3, 0.1);
  private townBlue = material(new pc.Color(0.26, 0.46, 0.72), 0.3, 0.1);
  private policeNavy = material(new pc.Color(0.14, 0.22, 0.38), 0.35);
  private terracotta = material(new pc.Color(0.82, 0.38, 0.26), 0.25);
  private warmStone = material(new pc.Color(0.74, 0.72, 0.66), 0.2);
  private darkStone = material(new pc.Color(0.38, 0.38, 0.36), 0.2);
  private mossStone = material(new pc.Color(0.48, 0.54, 0.42), 0.25);
  private leafOak = material(new pc.Color(0.28, 0.58, 0.26), 0.2);
  private leafOak2 = material(new pc.Color(0.38, 0.68, 0.32), 0.2);
  private leafPine = material(new pc.Color(0.16, 0.40, 0.24), 0.2);
  private leafBirch = material(new pc.Color(0.80, 0.74, 0.28), 0.25);
  private leafCherry = material(new pc.Color(0.98, 0.62, 0.76), 0.35);
  private leafCherryDark = material(new pc.Color(0.92, 0.48, 0.65), 0.35);
  private sandMat = material(new pc.Color(0.92, 0.85, 0.65), 0.2);
  private water = material(new pc.Color(0.20, 0.60, 0.78), 0.9, 0.05, 0.8);
  private glass = material(new pc.Color(0.70, 0.88, 0.98), 0.95, 0.1, 0.6);
  private warmGlow = material(new pc.Color(1.0, 0.92, 0.60), 0.5, 0, 1.0, new pc.Color(0.95, 0.80, 0.40));
  private tailLightGlow = material(new pc.Color(0.95, 0.15, 0.15), 0.8, 0, 0.9, new pc.Color(0.85, 0.1, 0.1));
  private redFlower = material(new pc.Color(0.92, 0.22, 0.25), 0.35);
  private yellowFlower = material(new pc.Color(0.98, 0.84, 0.20), 0.35);
  private orangeFruit = material(new pc.Color(0.95, 0.52, 0.15), 0.4);
  private whiteFlower = material(new pc.Color(0.98, 0.98, 0.98), 0.4);
  private metal = material(new pc.Color(0.30, 0.32, 0.36), 0.7, 0.7);
  private chrome = material(new pc.Color(0.90, 0.92, 0.94), 0.95, 0.85);
  private brass = material(new pc.Color(0.86, 0.72, 0.34), 0.85, 0.65);
  private tireRubber = material(new pc.Color(0.16, 0.16, 0.18), 0.2, 0.05);

  // Sports Car Paint
  private carPaint = material(new pc.Color(0.90, 0.26, 0.22), 0.92, 0.25);
  private carStripe = material(new pc.Color(0.98, 0.98, 0.98), 0.9, 0.2);
  private carLeather = material(new pc.Color(0.24, 0.22, 0.20), 0.3, 0.05);
  private tentCanvas = material(new pc.Color(0.88, 0.82, 0.68), 0.2);

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
    this.buildStreetDecorations();

    return {
      colliders: this.colliders(),
      bikeEntity: bike.root,
      bikeWheelPivots: bike.wheels,
      carEntity: car.root,
      carWheelPivots: car.wheels,
      carFrontWheelMounts: car.frontMounts,
      raftEntity,
      lampEntity: home.lamp,
      cupboardDoor: home.cupboardDoor,
      chairPosition: home.chairPosition,
      lampPosition: home.lampPosition,
      cupboardPosition: home.cupboardPosition,
      cafeCounterPosition: { x: 28.5, y: 1.0, z: -20.5 },
      groceryRegisterPosition: { x: -27.5, y: 1.0, z: -21.0 },
      townHallPodiumPosition: { x: -28.0, y: 1.0, z: 21.0 },
      doorbellPosition: home.doorbellPosition,
      fridgePosition: home.fridgePosition,
      houseClaimPosition: { x: -30.5, y: heightAt(-30.5, 23.5) + 0.6, z: 23.5 },
      vehicleSpawnPosition: { x: -6.5, y: heightAt(-6.5, -4.5) + 0.4, z: -4.5 },
      chimneyEmitters: this.chimneyEmitters,
      fountainEmitter: this.fountainEmitter,
      cafeSteamEmitter: this.cafeSteamEmitter
    };
  }

  private buildTownRoads() {
    // North-South Main Boulevard
    primitive(this.app, 'RoadNS', 'box', this.asphalt, new pc.Vec3(0, 0.08, 0), new pc.Vec3(9.5, 0.16, 76));
    // East-West Cross Boulevard
    primitive(this.app, 'RoadEW', 'box', this.asphalt, new pc.Vec3(0, 0.08, 0), new pc.Vec3(76, 0.16, 9.5));

    // Dashed White Centerlines
    for (let z = -34; z <= 34; z += 5) {
      if (Math.abs(z) < 6) continue;
      primitive(this.app, 'StripeNS', 'box', this.roadStripe, new pc.Vec3(0, 0.17, z), new pc.Vec3(0.3, 0.02, 2.8));
    }
    for (let x = -34; x <= 34; x += 5) {
      if (Math.abs(x) < 6) continue;
      primitive(this.app, 'StripeEW', 'box', this.roadStripe, new pc.Vec3(x, 0.17, 0), new pc.Vec3(2.8, 0.02, 0.3));
    }

    // Curbs & Sidewalks
    const sidewalkOffsets = [
      { x: -7.5, z: 0, w: 4.8, d: 76 },
      { x: 7.5, z: 0, w: 4.8, d: 76 },
      { x: 0, z: -7.5, w: 76, d: 4.8 },
      { x: 0, z: 7.5, w: 76, d: 4.8 }
    ];
    for (const sw of sidewalkOffsets) {
      primitive(this.app, 'Sidewalk', 'box', this.sidewalk, new pc.Vec3(sw.x, 0.22, sw.z), new pc.Vec3(sw.w, 0.24, sw.d));
    }
  }

  private buildTownSquare() {
    // Center Plaza Roundabout
    primitive(this.app, 'PlazaPlinth', 'cylinder', this.warmStone, new pc.Vec3(0, 0.32, 0), new pc.Vec3(13.5, 0.45, 13.5));
    primitive(this.app, 'PlazaInnerCurb', 'cylinder', this.curb, new pc.Vec3(0, 0.58, 0), new pc.Vec3(11.8, 0.15, 11.8));

    // Multi-Tiered Water Fountain
    primitive(this.app, 'FountainPoolBase', 'cylinder', this.warmStone, new pc.Vec3(0, 0.72, 0), new pc.Vec3(7.2, 0.5, 7.2));
    primitive(this.app, 'FountainWater', 'cylinder', this.water, new pc.Vec3(0, 0.92, 0), new pc.Vec3(6.4, 0.12, 6.4));
    primitive(this.app, 'FountainTier2Base', 'cylinder', this.warmStone, new pc.Vec3(0, 1.45, 0), new pc.Vec3(3.6, 0.8, 3.6));
    primitive(this.app, 'FountainTier2Bowl', 'cylinder', this.warmStone, new pc.Vec3(0, 1.9, 0), new pc.Vec3(4.2, 0.25, 4.2));
    primitive(this.app, 'FountainSpout', 'cylinder', this.brass, new pc.Vec3(0, 2.35, 0), new pc.Vec3(0.5, 0.7, 0.5));
    this.fountainEmitter = new pc.Vec3(0, 2.7, 0);

    // Park Flower Garden Beds around Plaza
    const flowerBedCoords: ReadonlyArray<readonly [number, number]> = [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]];
    for (const [fx, fz] of flowerBedCoords) {
      primitive(this.app, 'GardenBed', 'cylinder', this.curb, new pc.Vec3(fx, 0.56, fz), new pc.Vec3(2.2, 0.25, 2.2));
      primitive(this.app, 'GardenSoil', 'cylinder', this.darkWood, new pc.Vec3(fx, 0.66, fz), new pc.Vec3(1.9, 0.08, 1.9));
      primitive(this.app, 'FlowerBloom1', 'sphere', this.redFlower, new pc.Vec3(fx - 0.35, 0.82, fz), new pc.Vec3(0.4, 0.35, 0.4));
      primitive(this.app, 'FlowerBloom2', 'sphere', this.yellowFlower, new pc.Vec3(fx + 0.35, 0.82, fz), new pc.Vec3(0.4, 0.35, 0.4));
      primitive(this.app, 'FlowerBloom3', 'sphere', this.whiteFlower, new pc.Vec3(fx, 0.82, fz + 0.4), new pc.Vec3(0.4, 0.35, 0.4));
    }

    // Vehicle Spawn Pad Terminal (West Corner of Plaza)
    primitive(this.app, 'VehicleSpawnPad', 'cylinder', this.curb, new pc.Vec3(-6.5, 0.28, -4.5), new pc.Vec3(3.6, 0.12, 3.6));
    primitive(this.app, 'SpawnTerminalBase', 'cylinder', this.metal, new pc.Vec3(-6.5, 0.75, -4.5), new pc.Vec3(0.45, 0.9, 0.45));
    primitive(this.app, 'SpawnTerminalScreen', 'box', this.warmGlow, new pc.Vec3(-6.5, 1.25, -4.5), new pc.Vec3(0.55, 0.35, 0.2))
      .setLocalEulerAngles(15, 45, 0);

    // Beautiful Cherry Blossom Trees in Park
    this.treeCherryBlossom(9.5, 8.5, 1.15);
    this.treeCherryBlossom(-9.5, 8.5, 1.15);

    // Four-Faced Clock Tower
    const towerRoot = new pc.Entity('ClockTower');
    towerRoot.setPosition(0, heightAt(0, -18), -18);
    this.app.root.addChild(towerRoot);

    primitive(this.app, 'TowerBase', 'box', this.warmStone, new pc.Vec3(0, 3.5, 0), new pc.Vec3(5.2, 7.0, 5.2), towerRoot);
    primitive(this.app, 'TowerMidShaft', 'box', this.darkStone, new pc.Vec3(0, 8.5, 0), new pc.Vec3(4.4, 3.5, 4.4), towerRoot);
    primitive(this.app, 'TowerClockBelfry', 'box', this.warmStone, new pc.Vec3(0, 11.5, 0), new pc.Vec3(4.8, 3.0, 4.8), towerRoot);

    const clockFaces: ReadonlyArray<readonly [number, number, number]> = [[0, -2.42, 0], [180, 2.42, 0], [90, 0, -2.42], [-90, 0, 2.42]];
    for (const [rot, zPos, xPos] of clockFaces) {
      const face = primitive(this.app, 'ClockFace', 'cylinder', this.cream, new pc.Vec3(xPos, 11.5, zPos), new pc.Vec3(2.4, 0.08, 2.4), towerRoot);
      face.setLocalEulerAngles(90, rot, 0);
      primitive(this.app, 'ClockRim', 'cylinder', this.brass, new pc.Vec3(xPos, 11.5, zPos), new pc.Vec3(2.6, 0.06, 2.6), towerRoot)
        .setLocalEulerAngles(90, rot, 0);
    }


    const spire = primitive(this.app, 'TowerSpire', 'cone', this.terracotta, new pc.Vec3(0, 14.8, 0), new pc.Vec3(4.8, 4.2, 4.8), towerRoot);
    spire.setLocalEulerAngles(0, 45, 0);
    primitive(this.app, 'TowerFinial', 'sphere', this.brass, new pc.Vec3(0, 17.2, 0), new pc.Vec3(0.65, 0.65, 0.65), towerRoot);
  }

  private buildCafe() {
    const root = new pc.Entity('TownCafe');
    root.setPosition(28, heightAt(28, -20), -20);
    this.app.root.addChild(root);

    // Cafe Main Structure
    primitive(this.app, 'CafeFloor', 'box', this.lightWood, new pc.Vec3(0, 0.15, 0), new pc.Vec3(11.5, 0.3, 9.5), root);
    primitive(this.app, 'CafeWallBack', 'box', this.cafePink, new pc.Vec3(0, 2.4, 4.5), new pc.Vec3(11.5, 4.2, 0.5), root);
    primitive(this.app, 'CafeWallL', 'box', this.cafePink, new pc.Vec3(-5.5, 2.4, 0), new pc.Vec3(0.5, 4.2, 9.5), root);
    primitive(this.app, 'CafeWallR', 'box', this.cafePink, new pc.Vec3(5.5, 2.4, 0), new pc.Vec3(0.5, 4.2, 9.5), root);
    primitive(this.app, 'CafeRoof', 'box', this.darkWood, new pc.Vec3(0, 4.6, 0), new pc.Vec3(12.5, 0.4, 10.5), root);

    // Striped Fabric Awning over Front Counter
    const awning = new pc.Entity('CafeAwning');
    awning.setPosition(28, heightAt(28, -20) + 3.4, -20 - 4.5);
    awning.setEulerAngles(-18, 0, 0);
    this.app.root.addChild(awning);
    for (let ax = -4.5; ax <= 4.5; ax += 1.0) {
      const mat = (Math.round(ax) % 2 === 0) ? this.cafePink : this.cafeStripe;
      primitive(this.app, 'AwningStripe', 'box', mat, new pc.Vec3(ax, 0, 0), new pc.Vec3(0.95, 0.08, 2.4), awning);
    }

    // Outdoor Patio Deck with Bistro Tables & Parasols
    primitive(this.app, 'PatioDeck', 'box', this.lightWood, new pc.Vec3(0, 0.12, -7.5), new pc.Vec3(10.5, 0.24, 5.5), root);
    for (const tx of [-3.2, 3.2]) {
      // Bistro Table
      primitive(this.app, 'BistroLeg', 'cylinder', this.metal, new pc.Vec3(tx, 0.55, -7.5), new pc.Vec3(0.12, 0.85, 0.12), root);
      primitive(this.app, 'BistroTop', 'cylinder', this.whiteFlower, new pc.Vec3(tx, 0.98, -7.5), new pc.Vec3(1.8, 0.06, 1.8), root);
      // Parasol
      primitive(this.app, 'ParasolPole', 'cylinder', this.wood, new pc.Vec3(tx, 1.8, -7.5), new pc.Vec3(0.08, 1.8, 0.08), root);
      primitive(this.app, 'ParasolCanopy', 'cone', this.cafePink, new pc.Vec3(tx, 2.7, -7.5), new pc.Vec3(2.8, 0.7, 2.8), root);
    }

    // Interior Espresso Bar & Pastry Showcase
    primitive(this.app, 'EspressoCounter', 'box', this.wood, new pc.Vec3(0.5, 0.6, -0.5), new pc.Vec3(5.5, 1.1, 1.4), root);
    primitive(this.app, 'PastryGlassCase', 'box', this.glass, new pc.Vec3(2.2, 1.4, -0.5), new pc.Vec3(1.8, 0.6, 1.1), root);
    primitive(this.app, 'EspressoMachineBody', 'box', this.metal, new pc.Vec3(-1.2, 1.45, -0.5), new pc.Vec3(1.2, 0.7, 0.9), root);
    primitive(this.app, 'EspressoPortafilter', 'cylinder', this.brass, new pc.Vec3(-1.2, 1.35, -0.9), new pc.Vec3(0.18, 0.15, 0.18), root);
  }

  private buildSupermarket() {
    const root = new pc.Entity('TownSupermarket');
    root.setPosition(-28, heightAt(-28, -20), -20);
    this.app.root.addChild(root);

    // Market Main Shell
    primitive(this.app, 'MarketFloor', 'box', this.sidewalk, new pc.Vec3(0, 0.15, 0), new pc.Vec3(12.5, 0.3, 10.5), root);
    primitive(this.app, 'MarketWallBack', 'box', this.martGreen, new pc.Vec3(0, 2.4, 5.0), new pc.Vec3(12.5, 4.2, 0.5), root);
    primitive(this.app, 'MarketWallL', 'box', this.martGreen, new pc.Vec3(-6.0, 2.4, 0), new pc.Vec3(0.5, 4.2, 10.5), root);
    primitive(this.app, 'MarketWallR', 'box', this.martGreen, new pc.Vec3(6.0, 2.4, 0), new pc.Vec3(0.5, 4.2, 10.5), root);
    primitive(this.app, 'MarketRoof', 'box', this.darkStone, new pc.Vec3(0, 4.6, 0), new pc.Vec3(13.5, 0.4, 11.5), root);

    // Green Striped Awning
    const awning = new pc.Entity('MarketAwning');
    awning.setPosition(-28, heightAt(-28, -20) + 3.4, -20 - 5.0);
    awning.setEulerAngles(-18, 0, 0);
    this.app.root.addChild(awning);
    for (let ax = -5.0; ax <= 5.0; ax += 1.0) {
      const mat = (Math.round(ax) % 2 === 0) ? this.martGreen : this.cafeStripe;
      primitive(this.app, 'AwningStripe', 'box', mat, new pc.Vec3(ax, 0, 0), new pc.Vec3(0.95, 0.08, 2.4), awning);
    }

    // Produce Crates Display Outside (Fresh Apples & Oranges)
    const produceCrates: ReadonlyArray<readonly [number, number, pc.StandardMaterial]> = [
      [-3.5, -6.2, this.redFlower],
      [-1.8, -6.2, this.orangeFruit],
      [1.8, -6.2, this.redFlower],
      [3.5, -6.2, this.orangeFruit]
    ];
    for (const [cx, cz, fruitMat] of produceCrates) {
      primitive(this.app, 'FruitCrate', 'box', this.wood, new pc.Vec3(cx, 0.45, cz), new pc.Vec3(1.4, 0.6, 1.2), root);
      for (let fx = -0.4; fx <= 0.4; fx += 0.4) {
        for (let fz = -0.3; fz <= 0.3; fz += 0.3) {
          primitive(this.app, 'Fruit', 'sphere', fruitMat, new pc.Vec3(cx + fx, 0.85, cz + fz), new pc.Vec3(0.3, 0.3, 0.3), root);
        }
      }
    }


    // Checkout Register Counter Inside
    primitive(this.app, 'RegisterCounter', 'box', this.wood, new pc.Vec3(0.5, 0.6, -1.0), new pc.Vec3(4.8, 1.1, 1.4), root);
    primitive(this.app, 'BarcodeScannerBody', 'box', this.metal, new pc.Vec3(0.5, 1.3, -1.0), new pc.Vec3(0.8, 0.4, 0.6), root);
  }

  private buildTownHall() {
    const root = new pc.Entity('TownHall');
    root.setPosition(-28, heightAt(-28, 20), 20);
    this.app.root.addChild(root);

    // Marble Steps & Base
    primitive(this.app, 'Steps1', 'box', this.warmStone, new pc.Vec3(0, 0.2, -6.5), new pc.Vec3(14, 0.3, 3.5), root);
    primitive(this.app, 'Steps2', 'box', this.warmStone, new pc.Vec3(0, 0.45, -5.5), new pc.Vec3(12, 0.3, 2.5), root);
    primitive(this.app, 'TownHallFloor', 'box', this.warmStone, new pc.Vec3(0, 0.7, 0), new pc.Vec3(14, 0.4, 11), root);

    // Classical Columns
    for (const cx of [-5.5, -2.5, 2.5, 5.5]) {
      primitive(this.app, 'Column', 'cylinder', this.cream, new pc.Vec3(cx, 3.2, -4.5), new pc.Vec3(0.95, 4.8, 0.95), root);
    }

    // Pediment & Portico Roof
    const pediment = primitive(this.app, 'Pediment', 'cone', this.warmStone, new pc.Vec3(0, 6.4, -4.5), new pc.Vec3(14.5, 2.2, 3.5), root);
    pediment.setLocalEulerAngles(0, 45, 0);

    // Main Hall Walls
    primitive(this.app, 'HallWallBack', 'box', this.townBlue, new pc.Vec3(0, 3.2, 5.0), new pc.Vec3(14, 5.2, 0.6), root);
    primitive(this.app, 'HallWallL', 'box', this.townBlue, new pc.Vec3(-6.7, 3.2, 0.2), new pc.Vec3(0.6, 5.2, 10), root);
    primitive(this.app, 'HallWallR', 'box', this.townBlue, new pc.Vec3(6.7, 3.2, 0.2), new pc.Vec3(0.6, 5.2, 10), root);
    primitive(this.app, 'HallRoof', 'box', this.darkStone, new pc.Vec3(0, 6.0, 0.2), new pc.Vec3(15, 0.5, 11), root);

    // Mayor Speech Podium
    primitive(this.app, 'Podium', 'cylinder', this.darkWood, new pc.Vec3(0, 1.4, 1.0), new pc.Vec3(1.2, 1.3, 1.2), root);
    primitive(this.app, 'Microphone', 'cylinder', this.metal, new pc.Vec3(0, 2.2, 0.8), new pc.Vec3(0.08, 0.45, 0.08), root);
  }

  private buildSuburbanHouse() {
    const root = new pc.Entity('SuburbanHouse');
    root.setPosition(-39, heightAt(-39, 31), 31);
    this.app.root.addChild(root);

    // Foundation & Wood Plank Flooring
    primitive(this.app, 'HouseFloor', 'box', this.lightWood, new pc.Vec3(0, 0.2, 0), new pc.Vec3(9.8, 0.4, 8.8), root);

    // White Siding Walls
    primitive(this.app, 'WallBack', 'box', this.cream, new pc.Vec3(0, 2.2, 4.2), new pc.Vec3(9.8, 3.8, 0.4), root);
    primitive(this.app, 'WallL', 'box', this.cream, new pc.Vec3(-4.7, 2.2, 0), new pc.Vec3(0.4, 3.8, 8.8), root);
    primitive(this.app, 'WallR', 'box', this.cream, new pc.Vec3(4.7, 2.2, 0), new pc.Vec3(0.4, 3.8, 8.8), root);

    // Front Wall with Doorway
    primitive(this.app, 'FrontL', 'box', this.cream, new pc.Vec3(-3.0, 2.2, -4.2), new pc.Vec3(3.8, 3.8, 0.4), root);
    primitive(this.app, 'FrontR', 'box', this.cream, new pc.Vec3(3.0, 2.2, -4.2), new pc.Vec3(3.8, 3.8, 0.4), root);
    primitive(this.app, 'DoorLintel', 'box', this.cream, new pc.Vec3(0, 3.5, -4.2), new pc.Vec3(2.4, 1.2, 0.4), root);

    // Terracotta Pitched Roof
    const roofL = primitive(this.app, 'RoofL', 'box', this.terracotta, new pc.Vec3(-2.6, 5.0, 0), new pc.Vec3(5.8, 0.35, 9.6), root);
    roofL.setLocalEulerAngles(0, 0, 30);
    const roofR = primitive(this.app, 'RoofR', 'box', this.terracotta, new pc.Vec3(2.6, 5.0, 0), new pc.Vec3(5.8, 0.35, 9.6), root);
    roofR.setLocalEulerAngles(0, 0, -30);

    // Brick Chimney
    primitive(this.app, 'Chimney', 'box', this.terracotta, new pc.Vec3(3.2, 5.6, 2.0), new pc.Vec3(1.2, 3.2, 1.2), root);
    this.chimneyEmitters.push(new pc.Vec3(-39 + 3.2, heightAt(-39, 31) + 7.4, 31 + 2.0));

    // Front Porch & White Picket Fence
    primitive(this.app, 'PorchDeck', 'box', this.wood, new pc.Vec3(0, 0.15, -5.6), new pc.Vec3(5.5, 0.28, 2.6), root);
    primitive(this.app, 'MailboxPost', 'cylinder', this.wood, new pc.Vec3(8.5, 0.6, -7.5), new pc.Vec3(0.18, 1.2, 0.18), root);
    primitive(this.app, 'MailboxBox', 'box', this.policeNavy, new pc.Vec3(8.5, 1.3, -7.5), new pc.Vec3(0.55, 0.45, 0.8), root);
    primitive(this.app, 'DoorbellBtn', 'sphere', this.brass, new pc.Vec3(1.4, 1.6, -4.45), new pc.Vec3(0.14, 0.14, 0.08), root);

    // Living Room Sofa
    primitive(this.app, 'SofaBase', 'box', this.townBlue, new pc.Vec3(-2.6, 0.55, 1.5), new pc.Vec3(2.4, 0.6, 1.2), root);
    primitive(this.app, 'SofaBack', 'box', this.townBlue, new pc.Vec3(-2.6, 1.05, 2.0), new pc.Vec3(2.4, 0.7, 0.35), root);

    // Kitchen Fridge
    primitive(this.app, 'Fridge', 'box', this.chrome, new pc.Vec3(3.6, 1.4, 2.8), new pc.Vec3(1.2, 2.4, 1.1), root);
    primitive(this.app, 'FridgeHandle', 'cylinder', this.metal, new pc.Vec3(3.05, 1.5, 2.8), new pc.Vec3(0.06, 0.6, 0.06), root);

    // Bedside Lamp & Cupboard
    const lamp = primitive(this.app, 'BedsideLamp', 'cylinder', this.warmGlow, new pc.Vec3(3.5, 1.6, -1.8), new pc.Vec3(0.45, 0.65, 0.45), root);
    primitive(this.app, 'BedsideTable', 'box', this.wood, new pc.Vec3(3.5, 0.6, -1.8), new pc.Vec3(1.0, 1.1, 1.0), root);
    const cupboardDoor = primitive(this.app, 'WardrobeDoor', 'box', this.wood, new pc.Vec3(-3.2, 1.5, -2.2), new pc.Vec3(1.2, 2.6, 0.1), root);

    return {
      lamp,
      cupboardDoor,
      chairPosition: { x: -39 - 2.6, y: heightAt(-39, 31) + 0.6, z: 31 + 1.5 },
      lampPosition: { x: -39 + 3.5, y: heightAt(-39, 31) + 1.6, z: 31 - 1.8 },
      cupboardPosition: { x: -39 - 3.2, y: heightAt(-39, 31) + 1.5, z: 31 - 2.2 },
      doorbellPosition: { x: -39 + 1.4, y: heightAt(-39, 31) + 1.6, z: 31 - 4.45 },
      fridgePosition: { x: -39 + 3.6, y: heightAt(-39, 31) + 1.4, z: 31 + 2.8 }
    };
  }

  private treeCherryBlossom(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity('CherryBlossom');
    root.setPosition(x, y, z);
    this.app.root.addChild(root);

    primitive(this.app, 'CherryTrunk', 'cylinder', this.darkWood, new pc.Vec3(0, 2.2 * scale, 0), new pc.Vec3(0.65 * scale, 4.4 * scale, 0.65 * scale), root);
    const canopies = [
      { ox: 0, oy: 5.0, oz: 0, s: 4.2, mat: this.leafCherry },
      { ox: 1.1, oy: 5.8, oz: -0.6, s: 3.2, mat: this.leafCherryDark },
      { ox: -1.0, oy: 5.5, oz: 0.8, s: 3.4, mat: this.leafCherry },
      { ox: 0.2, oy: 6.8, oz: 0.2, s: 2.8, mat: this.leafCherryDark }
    ];
    for (const c of canopies) {
      primitive(this.app, 'Canopy', 'sphere', c.mat, new pc.Vec3(c.ox * scale, c.oy * scale, c.oz * scale), new pc.Vec3(c.s * scale, c.s * 0.9 * scale, c.s * scale), root);
    }
  }

  private treeRock(x: number, z: number, scale: number) {
    const y = heightAt(x, z);
    const rock = primitive(this.app, 'MossyRock', 'sphere', this.mossStone, new pc.Vec3(x, y + 0.3 * scale, z), new pc.Vec3(2.4 * scale, 1.4 * scale, 2.2 * scale));
    rock.setLocalEulerAngles(15, (x * 37) % 360, -10);
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

    // Scattered Mossy Rocks & Boulders in woods
    this.treeRock(-42, -32, 1.2);
    this.treeRock(-56, -24, 1.4);
    this.treeRock(-48, -52, 1.6);
    this.treeRock(-34, -44, 1.1);

    const gy = heightAt(-53, -42);
    const groveRoot = new pc.Entity('WoodlandGrove');
    groveRoot.setPosition(-53, gy, -42);
    this.app.root.addChild(groveRoot);

    const log = primitive(this.app, 'GroveLog', 'cylinder', this.wood, new pc.Vec3(0, 0.55, 0), new pc.Vec3(0.9, 5.5, 0.9), groveRoot);
    log.setEulerAngles(0, 25, 90);

    primitive(this.app, 'FirePitRim', 'cylinder', this.darkStone, new pc.Vec3(2.8, 0.2, 2.2), new pc.Vec3(1.8, 0.35, 1.8), groveRoot);
    primitive(this.app, 'FirePitCoals', 'cylinder', this.terracotta, new pc.Vec3(2.8, 0.35, 2.2), new pc.Vec3(1.4, 0.15, 1.4), groveRoot);
    primitive(this.app, 'FireEmberGlow', 'sphere', this.warmGlow, new pc.Vec3(2.8, 0.45, 2.2), new pc.Vec3(0.6, 0.3, 0.6), groveRoot);

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

    // Mountain Ascent Rocky Boulders
    this.treeRock(32, -32, 1.8);
    this.treeRock(38, -42, 2.2);
    this.treeRock(42, -48, 1.9);
  }

  private buildHarbour() {
    const waterW = WATER_BOUNDS.maxX - WATER_BOUNDS.minX;
    const waterD = WATER_BOUNDS.maxZ - WATER_BOUNDS.minZ;
    const waterEntity = primitive(this.app, 'HarbourWater', 'box', this.water, new pc.Vec3(53, WATER_SURFACE_Y - 0.25, 64), new pc.Vec3(waterW, 0.5, waterD));
    waterEntity.render!.castShadows = false;

    // Sandy Shoreline Beach
    primitive(this.app, 'HarbourBeach', 'box', this.sandMat, new pc.Vec3(33, WATER_SURFACE_Y + 0.15, 52), new pc.Vec3(14, 0.4, 22));

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

  private buildBike() {
    const root = new pc.Entity('TownBike');
    root.setPosition(15, heightAt(15, 7) + 0.8, 7);
    this.app.root.addChild(root);

    const wheels: pc.Entity[] = [];

    for (const z of [-1.35, 1.35]) {
      const pivot = new pc.Entity(z < 0 ? 'BikeFrontWheelPivot' : 'BikeRearWheelPivot');
      pivot.setLocalPosition(0, 0, z);
      root.addChild(pivot);

      const tire = primitive(this.app, 'Tire', 'cylinder', this.tireRubber, new pc.Vec3(0, 0, 0), new pc.Vec3(1.35, 0.16, 1.35), pivot);
      tire.setLocalEulerAngles(0, 0, 90);
      const hub = primitive(this.app, 'Hub', 'cylinder', this.brass, new pc.Vec3(0, 0, 0), new pc.Vec3(0.35, 0.22, 0.35), pivot);
      hub.setLocalEulerAngles(0, 0, 90);

      wheels.push(pivot);
    }

    primitive(this.app, 'FrameBottom', 'box', this.terracotta, new pc.Vec3(0, 0.15, 0), new pc.Vec3(0.14, 0.14, 2.6), root);
    const frameSeatTube = primitive(this.app, 'SeatTube', 'box', this.terracotta, new pc.Vec3(0, 0.65, 0.25), new pc.Vec3(0.14, 1.1, 0.14), root);
    frameSeatTube.setLocalEulerAngles(-18, 0, 0);
    const frameHeadTube = primitive(this.app, 'HeadTube', 'box', this.terracotta, new pc.Vec3(0, 0.75, -1.05), new pc.Vec3(0.14, 1.3, 0.14), root);
    frameHeadTube.setLocalEulerAngles(22, 0, 0);

    primitive(this.app, 'Saddle', 'box', this.darkWood, new pc.Vec3(0, 1.18, 0.42), new pc.Vec3(0.48, 0.16, 0.65), root);
    primitive(this.app, 'Handlebars', 'box', this.metal, new pc.Vec3(0, 1.35, -0.92), new pc.Vec3(1.45, 0.12, 0.12), root);
    primitive(this.app, 'Basket', 'box', this.lightWood, new pc.Vec3(0, 1.25, -1.25), new pc.Vec3(0.8, 0.5, 0.5), root);

    return { root, wheels };
  }

  private buildCar() {
    const root = new pc.Entity('TownCar');
    root.setPosition(-16, heightAt(-16, 7) + 0.65, 7);
    this.app.root.addChild(root);

    const wheels: pc.Entity[] = [];
    const frontMounts: pc.Entity[] = [];

    // Sculpted Aerodynamic Body (Glossy Red Convertible)
    primitive(this.app, 'CarLowerChassis', 'box', this.carPaint, new pc.Vec3(0, 0.38, 0), new pc.Vec3(2.3, 0.45, 4.4), root);
    primitive(this.app, 'CarHoodSloped', 'box', this.carPaint, new pc.Vec3(0, 0.58, -1.3), new pc.Vec3(2.2, 0.35, 1.8), root);
    primitive(this.app, 'CarRearTrunk', 'box', this.carPaint, new pc.Vec3(0, 0.62, 1.3), new pc.Vec3(2.2, 0.38, 1.8), root);

    // Dual White Racing Stripes
    for (const sx of [-0.35, 0.35]) {
      primitive(this.app, 'RacingStripeFront', 'box', this.carStripe, new pc.Vec3(sx, 0.77, -1.3), new pc.Vec3(0.24, 0.02, 1.78), root);
      primitive(this.app, 'RacingStripeRear', 'box', this.carStripe, new pc.Vec3(sx, 0.82, 1.3), new pc.Vec3(0.24, 0.02, 1.78), root);
    }

    // Chrome Bumpers & Front Grille
    primitive(this.app, 'FrontBumper', 'box', this.chrome, new pc.Vec3(0, 0.32, -2.25), new pc.Vec3(2.35, 0.22, 0.25), root);
    primitive(this.app, 'FrontGrille', 'box', this.metal, new pc.Vec3(0, 0.45, -2.22), new pc.Vec3(1.5, 0.32, 0.1), root);
    primitive(this.app, 'RearBumper', 'box', this.chrome, new pc.Vec3(0, 0.32, 2.25), new pc.Vec3(2.35, 0.22, 0.25), root);

    // Curved Tinted Windshield
    const windshield = primitive(this.app, 'CarWindshield', 'box', this.glass, new pc.Vec3(0, 1.05, -0.42), new pc.Vec3(2.1, 0.75, 0.12), root);
    windshield.setLocalEulerAngles(-24, 0, 0);

    // Dashboard & Steering Wheel
    primitive(this.app, 'CarDashboard', 'box', this.carLeather, new pc.Vec3(0, 0.78, -0.32), new pc.Vec3(2.1, 0.35, 0.4), root);
    const wheel = primitive(this.app, 'CarSteeringWheel', 'cylinder', this.metal, new pc.Vec3(-0.45, 0.95, -0.15), new pc.Vec3(0.42, 0.08, 0.42), root);
    wheel.setLocalEulerAngles(65, 0, 0);

    // Leather Bucket Seats with Headrests
    for (const sx of [-0.45, 0.45]) {
      primitive(this.app, 'SeatBase', 'box', this.carLeather, new pc.Vec3(sx, 0.52, 0.45), new pc.Vec3(0.75, 0.5, 0.85), root);
      primitive(this.app, 'SeatBack', 'box', this.carLeather, new pc.Vec3(sx, 0.92, 0.82), new pc.Vec3(0.75, 0.65, 0.22), root);
      primitive(this.app, 'SeatHeadrest', 'box', this.carLeather, new pc.Vec3(sx, 1.32, 0.82), new pc.Vec3(0.45, 0.25, 0.18), root);
    }

    // Chrome Headlights with Glowing Lenses & Taillights
    for (const sx of [-0.85, 0.85]) {
      primitive(this.app, 'HeadlightHousing', 'cylinder', this.chrome, new pc.Vec3(sx, 0.62, -2.18), new pc.Vec3(0.36, 0.15, 0.36), root)
        .setLocalEulerAngles(90, 0, 0);
      primitive(this.app, 'HeadlightLens', 'sphere', this.warmGlow, new pc.Vec3(sx, 0.62, -2.25), new pc.Vec3(0.28, 0.28, 0.12), root);
      primitive(this.app, 'TailLight', 'box', this.tailLightGlow, new pc.Vec3(sx, 0.65, 2.22), new pc.Vec3(0.35, 0.22, 0.08), root);
    }

    // 4 Detailed Wheels with Rubber Tires & 5-Spoke Chrome Hubcaps
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

      // Tire Rubber
      const tire = primitive(this.app, 'Tire', 'cylinder', this.tireRubber, new pc.Vec3(0, 0, 0), new pc.Vec3(0.85, 0.30, 0.85), pivot);
      tire.setLocalEulerAngles(0, 0, 90);
      // Chrome Rim & Hubcap
      const rim = primitive(this.app, 'Rim', 'cylinder', this.chrome, new pc.Vec3(0, 0, 0), new pc.Vec3(0.55, 0.34, 0.55), pivot);
      rim.setLocalEulerAngles(0, 0, 90);
      // Center Nut
      const nut = primitive(this.app, 'Nut', 'cylinder', this.metal, new pc.Vec3(0, 0, 0), new pc.Vec3(0.20, 0.36, 0.20), pivot);
      nut.setLocalEulerAngles(0, 0, 90);

      wheels.push(pivot);
    }

    return { root, wheels, frontMounts };
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

  private buildStreetDecorations() {
    const planterBoxes = [
      { x: 6.8, z: 8, mat: this.redFlower },
      { x: 6.8, z: 16, mat: this.yellowFlower },
      { x: -6.8, z: 8, mat: this.yellowFlower },
      { x: -6.8, z: 16, mat: this.redFlower },
      { x: 12, z: -6.8, mat: this.whiteFlower },
      { x: 22, z: -6.8, mat: this.redFlower }
    ];

    for (const pb of planterBoxes) {
      const y = heightAt(pb.x, pb.z);
      primitive(this.app, 'PlanterBox', 'box', this.wood, new pc.Vec3(pb.x, y + 0.25, pb.z), new pc.Vec3(2.2, 0.45, 1.2));
      primitive(this.app, 'PlanterSoil', 'box', this.darkWood, new pc.Vec3(pb.x, y + 0.45, pb.z), new pc.Vec3(2.0, 0.10, 1.0));
      for (let fx = -0.6; fx <= 0.6; fx += 0.6) {
        primitive(this.app, 'FlowerBloom', 'sphere', pb.mat, new pc.Vec3(pb.x + fx, y + 0.62, pb.z), new pc.Vec3(0.42, 0.35, 0.42));
      }
    }

    const hydrantY = heightAt(-5.6, 5.6);
    const hydrant = new pc.Entity('FireHydrant');
    hydrant.setPosition(-5.6, hydrantY, 5.6);
    this.app.root.addChild(hydrant);
    primitive(this.app, 'HydrantBase', 'cylinder', this.redFlower, new pc.Vec3(0, 0.35, 0), new pc.Vec3(0.38, 0.7, 0.38), hydrant);
    primitive(this.app, 'HydrantCap', 'sphere', this.brass, new pc.Vec3(0, 0.72, 0), new pc.Vec3(0.42, 0.28, 0.42), hydrant);
  }

  private colliders(): Aabb2[] {
    return [
      { minX: -2.5, maxX: 2.5, minZ: -20.5, maxZ: -15.5 },
      { minX: 13, maxX: 23, minZ: 7.5, maxZ: 16.5 },
      { minX: -23.5, maxX: -12.5, minZ: 7.5, maxZ: 16.5 },
      { minX: 12, maxX: 24, minZ: -21, maxZ: -11 },
      { minX: -44, maxX: -34, minZ: 35.1, maxZ: 35.6 },
      { minX: -44, maxX: -43.5, minZ: 26.5, maxZ: 35.5 },
      { minX: -34.5, maxX: -34, minZ: 26.5, maxZ: 35.5 },
      { minX: -44, maxX: -41.9, minZ: 26.4, maxZ: 26.9 },
      { minX: -36.1, maxX: -34, minZ: 26.4, maxZ: 26.9 }
    ];
  }
}
