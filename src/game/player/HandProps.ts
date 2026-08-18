import * as pc from 'playcanvas';
import { material, primitive } from '../world/meshFactory';

export type PropType = 'none' | 'coffee' | 'icecream' | 'flashlight' | 'balloon';

export class HandProps {
  private readonly root = new pc.Entity('HandPropRoot');
  private currentType: PropType = 'none';
  private flashlightLight: pc.Entity | null = null;
  private balloonEntity: pc.Entity | null = null;

  // Rich Materials
  private whiteCeramic = material(new pc.Color(0.96, 0.96, 0.96), 0.6, 0.2);
  private latteCoffee = material(new pc.Color(0.38, 0.22, 0.12), 0.7, 0.05);
  private latteFoam = material(new pc.Color(0.95, 0.90, 0.82), 0.5, 0.05);
  private waffleCone = material(new pc.Color(0.85, 0.65, 0.40), 0.25);
  private pinkScoop = material(new pc.Color(0.98, 0.48, 0.68), 0.35);
  private sprinkleYellow = material(new pc.Color(0.98, 0.85, 0.25), 0.4);
  private sprinkleGreen = material(new pc.Color(0.35, 0.85, 0.45), 0.4);
  private cherryGloss = material(new pc.Color(0.88, 0.08, 0.15), 0.9, 0.3);
  private torchMetal = material(new pc.Color(0.24, 0.26, 0.30), 0.75, 0.6);
  private torchGrip = material(new pc.Color(0.88, 0.45, 0.15), 0.3);
  private torchLens = material(new pc.Color(1.0, 0.96, 0.75), 0.9, 0, 1.0, new pc.Color(0.95, 0.88, 0.5));
  private balloonGloss = material(new pc.Color(0.95, 0.18, 0.22), 0.92, 0.15, 0.95);
  private stringMat = material(new pc.Color(0.90, 0.90, 0.92), 0.1);

  constructor(private readonly app: pc.Application, private readonly handMount: pc.Entity) {
    this.handMount.addChild(this.root);
    this.root.setLocalPosition(0, -0.62, 0.24);
  }

  get current(): PropType {
    return this.currentType;
  }

  setProp(type: PropType) {
    if (this.currentType === type) {
      type = 'none';
    }

    this.clear();
    this.currentType = type;

    if (type === 'coffee') {
      this.buildCoffee();
    } else if (type === 'icecream') {
      this.buildIceCream();
    } else if (type === 'flashlight') {
      this.buildFlashlight();
    } else if (type === 'balloon') {
      this.buildBalloon();
    }
  }

  private clear() {
    while (this.root.children.length > 0) {
      const child = this.root.children[0]!;
      child.destroy();
    }
    this.flashlightLight = null;
    this.balloonEntity = null;
  }

  private buildCoffee() {
    // Ceramic Coffee Mug
    primitive(this.app, 'MugBody', 'cylinder', this.whiteCeramic, new pc.Vec3(0, 0, 0), new pc.Vec3(0.28, 0.36, 0.28), this.root);
    // Dark roast espresso with creamy latte foam
    primitive(this.app, 'MugLiquid', 'cylinder', this.latteCoffee, new pc.Vec3(0, 0.17, 0), new pc.Vec3(0.25, 0.04, 0.25), this.root);
    primitive(this.app, 'MugFoamArt', 'sphere', this.latteFoam, new pc.Vec3(0, 0.18, 0), new pc.Vec3(0.14, 0.03, 0.14), this.root);
    // Handle
    const handle = primitive(this.app, 'MugHandle', 'cylinder', this.whiteCeramic, new pc.Vec3(0.18, 0, 0), new pc.Vec3(0.06, 0.24, 0.06), this.root);
    handle.setLocalEulerAngles(0, 0, 90);
  }

  private buildIceCream() {
    // Crisp waffle cone
    const cone = primitive(this.app, 'Cone', 'cone', this.waffleCone, new pc.Vec3(0, -0.06, 0), new pc.Vec3(0.26, 0.48, 0.26), this.root);
    cone.setLocalEulerAngles(180, 0, 0);

    // Strawberry scoop
    primitive(this.app, 'Scoop', 'sphere', this.pinkScoop, new pc.Vec3(0, 0.22, 0), new pc.Vec3(0.35, 0.32, 0.35), this.root);

    // Colorful sprinkles
    primitive(this.app, 'Sprinkle1', 'cylinder', this.sprinkleYellow, new pc.Vec3(0.08, 0.32, 0.08), new pc.Vec3(0.03, 0.07, 0.03), this.root)
      .setLocalEulerAngles(35, 20, 0);
    primitive(this.app, 'Sprinkle2', 'cylinder', this.sprinkleGreen, new pc.Vec3(-0.08, 0.30, -0.06), new pc.Vec3(0.03, 0.07, 0.03), this.root)
      .setLocalEulerAngles(-25, 45, 0);

    // Glazed cherry on top
    primitive(this.app, 'Cherry', 'sphere', this.cherryGloss, new pc.Vec3(0, 0.41, 0), new pc.Vec3(0.13, 0.13, 0.13), this.root);
  }

  private buildFlashlight() {
    // Torch casing with grip ring
    const body = primitive(this.app, 'TorchBody', 'cylinder', this.torchMetal, new pc.Vec3(0, 0, 0.15), new pc.Vec3(0.14, 0.46, 0.14), this.root);
    body.setLocalEulerAngles(90, 0, 0);
    const grip = primitive(this.app, 'TorchGrip', 'cylinder', this.torchGrip, new pc.Vec3(0, 0, 0.08), new pc.Vec3(0.15, 0.22, 0.15), this.root);
    grip.setLocalEulerAngles(90, 0, 0);

    // Reflector bezel & Glowing lens
    const lens = primitive(this.app, 'TorchLens', 'cylinder', this.torchLens, new pc.Vec3(0, 0, 0.39), new pc.Vec3(0.22, 0.08, 0.22), this.root);
    lens.setLocalEulerAngles(90, 0, 0);

    // Spotlight beam
    const lightEntity = new pc.Entity('TorchSpot');
    lightEntity.setLocalPosition(0, 0, 0.42);
    lightEntity.addComponent('light', {
      type: 'spot',
      color: new pc.Color(1.0, 0.96, 0.82),
      intensity: 3.8,
      range: 38,
      innerConeAngle: 18,
      outerConeAngle: 38,
      castShadows: false
    });
    this.root.addChild(lightEntity);
    this.flashlightLight = lightEntity;
  }

  private buildBalloon() {
    const balloonGroup = new pc.Entity('BalloonGroup');
    balloonGroup.setLocalPosition(0.1, 1.45, 0.1);
    this.root.addChild(balloonGroup);

    // Glossy rubber balloon sphere
    primitive(this.app, 'BalloonBody', 'sphere', this.balloonGloss, new pc.Vec3(0, 0.38, 0), new pc.Vec3(0.76, 0.92, 0.76), balloonGroup);
    primitive(this.app, 'BalloonKnot', 'cone', this.balloonGloss, new pc.Vec3(0, -0.10, 0), new pc.Vec3(0.16, 0.16, 0.16), balloonGroup);

    // Balloon string
    primitive(this.app, 'BalloonString', 'cylinder', this.stringMat, new pc.Vec3(-0.05, -0.75, -0.05), new pc.Vec3(0.015, 1.35, 0.015), balloonGroup);

    this.balloonEntity = balloonGroup;
  }

  update(time: number) {
    if (this.balloonEntity) {
      const swayX = Math.sin(time * 2.4) * 8;
      const swayZ = Math.cos(time * 1.8) * 8;
      const bob = Math.sin(time * 3.2) * 0.06;
      this.balloonEntity.setLocalPosition(0.1, 1.45 + bob, 0.1);
      this.balloonEntity.setLocalEulerAngles(swayX, 0, swayZ);
    }
  }
}
