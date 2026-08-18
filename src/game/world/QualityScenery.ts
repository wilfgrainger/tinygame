import * as pc from 'playcanvas';
import { heightAt } from './heightfield';
import { material, primitive } from './meshFactory';
import { QUALITY_COMPOSITION, type QualityElement, type QualityZoneId } from './qualityComposition';

export class QualityScenery {
  private readonly root = new pc.Entity('QualityScenery');
  private readonly bark = material(new pc.Color(0.30, 0.18, 0.10), 0.18);
  private readonly leafDeep = material(new pc.Color(0.16, 0.40, 0.22), 0.12);
  private readonly leafWarm = material(new pc.Color(0.30, 0.58, 0.26), 0.14);
  private readonly shrub = material(new pc.Color(0.22, 0.50, 0.24), 0.12);
  private readonly stone = material(new pc.Color(0.46, 0.48, 0.45), 0.12);
  private readonly wood = material(new pc.Color(0.46, 0.29, 0.16), 0.18);
  private readonly darkWood = material(new pc.Color(0.25, 0.15, 0.08), 0.16);
  private readonly cream = material(new pc.Color(0.90, 0.86, 0.72), 0.18);
  private readonly flowerPink = material(new pc.Color(0.88, 0.40, 0.54), 0.24);
  private readonly flowerGold = material(new pc.Color(0.96, 0.76, 0.20), 0.24);
  private readonly glow = material(
    new pc.Color(1.0, 0.82, 0.42),
    0.35,
    0,
    0.96,
    new pc.Color(0.55, 0.32, 0.08)
  );

  constructor(private readonly app: pc.Application) {
    app.root.addChild(this.root);
  }

  build(): pc.Entity {
    for (const [zoneId, zone] of Object.entries(QUALITY_COMPOSITION) as Array<[QualityZoneId, (typeof QUALITY_COMPOSITION)[QualityZoneId]]>) {
      this.buildAnchor(zoneId, zone.anchor.x, zone.anchor.z);
      for (const cluster of zone.clusters) {
        const clusterRoot = new pc.Entity(`Quality-${cluster.id}`);
        this.root.addChild(clusterRoot);
        for (const element of cluster.elements) this.buildElement(element, clusterRoot);
      }
    }
    return this.root;
  }

  private elementRoot(element: QualityElement, parent: pc.Entity): pc.Entity {
    const root = new pc.Entity(`Quality-${element.kind}`);
    root.setPosition(element.x, heightAt(element.x, element.z), element.z);
    root.setEulerAngles(0, element.rotation ?? 0, 0);
    parent.addChild(root);
    return root;
  }

  private buildElement(element: QualityElement, parent: pc.Entity) {
    const root = this.elementRoot(element, parent);
    const s = element.scale;

    switch (element.kind) {
      case 'tree': {
        primitive(this.app, 'QualityTreeTrunk', 'cylinder', this.bark, new pc.Vec3(0, 2.2 * s, 0), new pc.Vec3(0.62 * s, 4.4 * s, 0.62 * s), root);
        primitive(this.app, 'QualityTreeCrownA', 'sphere', this.leafWarm, new pc.Vec3(0, 4.8 * s, 0), new pc.Vec3(3.2 * s, 2.7 * s, 3.0 * s), root);
        primitive(this.app, 'QualityTreeCrownB', 'sphere', this.leafDeep, new pc.Vec3(-1.0 * s, 5.2 * s, 0.5 * s), new pc.Vec3(2.1 * s, 2.0 * s, 2.0 * s), root);
        primitive(this.app, 'QualityTreeCrownC', 'sphere', this.leafWarm, new pc.Vec3(1.0 * s, 5.4 * s, -0.4 * s), new pc.Vec3(2.0 * s, 1.8 * s, 2.0 * s), root);
        break;
      }
      case 'pine': {
        primitive(this.app, 'QualityPineTrunk', 'cylinder', this.bark, new pc.Vec3(0, 2.2 * s, 0), new pc.Vec3(0.48 * s, 4.4 * s, 0.48 * s), root);
        primitive(this.app, 'QualityPineLower', 'cone', this.leafDeep, new pc.Vec3(0, 3.4 * s, 0), new pc.Vec3(3.0 * s, 3.8 * s, 3.0 * s), root);
        primitive(this.app, 'QualityPineUpper', 'cone', this.leafWarm, new pc.Vec3(0, 5.2 * s, 0), new pc.Vec3(2.2 * s, 3.2 * s, 2.2 * s), root);
        break;
      }
      case 'bush': {
        primitive(this.app, 'QualityBushA', 'sphere', this.shrub, new pc.Vec3(0, 0.55 * s, 0), new pc.Vec3(1.5 * s, 1.0 * s, 1.3 * s), root);
        primitive(this.app, 'QualityBushB', 'sphere', this.leafWarm, new pc.Vec3(0.8 * s, 0.5 * s, 0.15 * s), new pc.Vec3(1.0 * s, 0.8 * s, 0.9 * s), root);
        primitive(this.app, 'QualityBushC', 'sphere', this.leafDeep, new pc.Vec3(-0.7 * s, 0.48 * s, -0.1 * s), new pc.Vec3(0.9 * s, 0.75 * s, 0.9 * s), root);
        break;
      }
      case 'rock': {
        const rock = primitive(this.app, 'QualityRock', 'sphere', this.stone, new pc.Vec3(0, 0.5 * s, 0), new pc.Vec3(2.0 * s, 1.15 * s, 1.65 * s), root);
        rock.setLocalEulerAngles(12, 28, -8);
        break;
      }
      case 'post': {
        primitive(this.app, 'QualityPost', 'cylinder', this.darkWood, new pc.Vec3(0, 1.1 * s, 0), new pc.Vec3(0.22 * s, 2.2 * s, 0.22 * s), root);
        primitive(this.app, 'QualityPostCap', 'sphere', this.cream, new pc.Vec3(0, 2.25 * s, 0), new pc.Vec3(0.30 * s, 0.20 * s, 0.30 * s), root);
        break;
      }
      case 'lantern': {
        primitive(this.app, 'QualityLanternPost', 'cylinder', this.darkWood, new pc.Vec3(0, 1.25 * s, 0), new pc.Vec3(0.18 * s, 2.5 * s, 0.18 * s), root);
        primitive(this.app, 'QualityLanternGlow', 'sphere', this.glow, new pc.Vec3(0, 2.55 * s, 0), new pc.Vec3(0.46 * s, 0.58 * s, 0.46 * s), root);
        primitive(this.app, 'QualityLanternTop', 'cone', this.darkWood, new pc.Vec3(0, 2.95 * s, 0), new pc.Vec3(0.65 * s, 0.45 * s, 0.65 * s), root);
        break;
      }
      case 'bench': {
        primitive(this.app, 'QualityBenchSeat', 'box', this.wood, new pc.Vec3(0, 0.62 * s, 0), new pc.Vec3(3.2 * s, 0.25 * s, 0.9 * s), root);
        primitive(this.app, 'QualityBenchBack', 'box', this.wood, new pc.Vec3(0, 1.15 * s, 0.38 * s), new pc.Vec3(3.2 * s, 0.75 * s, 0.18 * s), root);
        primitive(this.app, 'QualityBenchLegL', 'box', this.darkWood, new pc.Vec3(-1.15 * s, 0.28 * s, 0), new pc.Vec3(0.20 * s, 0.58 * s, 0.55 * s), root);
        primitive(this.app, 'QualityBenchLegR', 'box', this.darkWood, new pc.Vec3(1.15 * s, 0.28 * s, 0), new pc.Vec3(0.20 * s, 0.58 * s, 0.55 * s), root);
        break;
      }
      case 'flower': {
        for (const [index, offset] of [-0.45, 0, 0.45].entries()) {
          primitive(this.app, `QualityFlowerStem${index}`, 'cylinder', this.shrub, new pc.Vec3(offset * s, 0.32 * s, 0), new pc.Vec3(0.06 * s, 0.62 * s, 0.06 * s), root);
          primitive(this.app, `QualityFlowerBloom${index}`, 'sphere', index === 1 ? this.flowerGold : this.flowerPink, new pc.Vec3(offset * s, 0.68 * s, 0), new pc.Vec3(0.26 * s, 0.22 * s, 0.26 * s), root);
        }
        break;
      }
      case 'plank': {
        primitive(this.app, 'QualityPlank', 'box', this.wood, new pc.Vec3(0, 0.16 * s, 0), new pc.Vec3(3.8 * s, 0.24 * s, 0.72 * s), root);
        break;
      }
    }
  }

  private buildAnchor(zoneId: QualityZoneId, x: number, z: number) {
    const y = heightAt(x, z);
    const root = new pc.Entity(`QualityAnchor-${zoneId}`);
    root.setPosition(x, y, z);
    this.root.addChild(root);

    if (zoneId === 'woodland') {
      primitive(this.app, 'ThresholdTrunkL', 'cylinder', this.bark, new pc.Vec3(-2.3, 2.5, 0), new pc.Vec3(0.70, 5.0, 0.70), root);
      primitive(this.app, 'ThresholdTrunkR', 'cylinder', this.bark, new pc.Vec3(2.3, 2.5, 0), new pc.Vec3(0.70, 5.0, 0.70), root);
      const branch = primitive(this.app, 'ThresholdBranch', 'cylinder', this.bark, new pc.Vec3(0, 4.7, 0), new pc.Vec3(0.52, 5.2, 0.52), root);
      branch.setLocalEulerAngles(0, 0, 90);
      primitive(this.app, 'ThresholdCanopyL', 'sphere', this.leafDeep, new pc.Vec3(-2.3, 5.6, 0), new pc.Vec3(3.0, 2.3, 2.6), root);
      primitive(this.app, 'ThresholdCanopyR', 'sphere', this.leafWarm, new pc.Vec3(2.3, 5.6, 0), new pc.Vec3(3.0, 2.3, 2.6), root);
    } else if (zoneId === 'mountain-rise') {
      primitive(this.app, 'SummitCairnBase', 'sphere', this.stone, new pc.Vec3(0, 0.45, 0), new pc.Vec3(2.2, 0.9, 1.8), root);
      primitive(this.app, 'SummitCairnMid', 'sphere', this.stone, new pc.Vec3(0.1, 1.15, 0), new pc.Vec3(1.5, 0.8, 1.25), root);
      primitive(this.app, 'SummitCairnTop', 'sphere', this.cream, new pc.Vec3(-0.05, 1.8, 0), new pc.Vec3(0.8, 0.55, 0.7), root);
      primitive(this.app, 'SummitMarker', 'cylinder', this.darkWood, new pc.Vec3(0, 3.0, 0), new pc.Vec3(0.16, 2.8, 0.16), root);
      primitive(this.app, 'SummitPennant', 'box', this.flowerGold, new pc.Vec3(0.75, 3.8, 0), new pc.Vec3(1.5, 0.55, 0.10), root);
    } else if (zoneId === 'harbour') {
      for (const side of [-1, 1]) {
        primitive(this.app, 'MooringAnchorPost', 'cylinder', this.darkWood, new pc.Vec3(side * 2.2, 1.2, 0), new pc.Vec3(0.32, 2.4, 0.32), root);
        primitive(this.app, 'MooringAnchorLamp', 'sphere', this.glow, new pc.Vec3(side * 2.2, 2.6, 0), new pc.Vec3(0.42, 0.50, 0.42), root);
      }
      primitive(this.app, 'MooringCrossbeam', 'box', this.wood, new pc.Vec3(0, 0.28, 0), new pc.Vec3(5.4, 0.28, 1.0), root);
    } else {
      primitive(this.app, 'HomePlanter', 'box', this.wood, new pc.Vec3(0, 0.28, 0), new pc.Vec3(4.4, 0.55, 1.2), root);
      primitive(this.app, 'HomePlanterBushL', 'sphere', this.shrub, new pc.Vec3(-1.2, 0.82, 0), new pc.Vec3(1.2, 0.9, 0.9), root);
      primitive(this.app, 'HomePlanterBushR', 'sphere', this.leafWarm, new pc.Vec3(1.2, 0.82, 0), new pc.Vec3(1.2, 0.9, 0.9), root);
      primitive(this.app, 'HomePorchGlow', 'sphere', this.glow, new pc.Vec3(0, 1.35, 0), new pc.Vec3(0.35, 0.35, 0.35), root);
    }
  }
}
