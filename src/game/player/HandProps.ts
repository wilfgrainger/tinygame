import * as pc from 'playcanvas';
import { material, primitive } from '../world/meshFactory';

export type PropType = 'none' | 'coffee' | 'icecream' | 'flashlight' | 'balloon';

export class HandProps {
  private readonly root = new pc.Entity('HandPropRoot');
  private currentType: PropType = 'none';
  private flashlightLight: pc.Entity | null = null;
  private balloonEntity: pc.Entity | null = null;

  // Materials
  private whiteMat = material(new pc.Color(0.95, 0.95, 0.95), 0.4);
  private coffeeMat = material(new pc.Color(0.28, 0.16, 0.08), 0.8, 0.1);
  private coneMat = material(new pc.Color(0.82, 0.62, 0.38), 0.2);
  private icecreamMat = material(new pc.Color(0.98, 0.45, 0.65), 0.3);
  private cherryMat = material(new pc.Color(0.88, 0.12, 0.18), 0.8);
  private torchMat = material(new pc.Color(0.22, 0.24, 0.28), 0.7, 0.6);
  private glowYellow = material(new pc.Color(1.0, 0.95, 0.75), 0.8, 0, 1.0, new pc.Color(0.9, 0.85, 0.5));
  private balloonMat = material(new pc.Color(0.95, 0.22, 0.25), 0.85, 0.1, 0.95);
  private stringMat = material(new pc.Color(0.88, 0.88, 0.90), 0.1);

  constructor(private readonly app: pc.Application, private readonly handMount: pc.Entity) {
    this.handMount.addChild(this.root);
    this.root.setLocalPosition(0, -0.65, 0.25);
  }

  get current(): PropType {
    return this.currentType;
  }

  setProp(type: PropType) {
    if (this.currentType === type) {
      type = 'none'; // toggle off if already active
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
    // Ceramic mug
    primitive(this.app, 'CoffeeMug', 'cylinder', this.whiteMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.28, 0.35, 0.28), this.root);
    // Dark roast coffee liquid
    primitive(this.app, 'CoffeeLiquid', 'cylinder', this.coffeeMat, new pc.Vec3(0, 0.16, 0), new pc.Vec3(0.24, 0.04, 0.24), this.root);
    // Mug handle
    const handle = primitive(this.app, 'CoffeeHandle', 'cylinder', this.whiteMat, new pc.Vec3(0.18, 0, 0), new pc.Vec3(0.06, 0.24, 0.06), this.root);
    handle.setLocalEulerAngles(0, 0, 90);
  }

  private buildIceCream() {
    // Waffle cone (inverted cone)
    const cone = primitive(this.app, 'Cone', 'cone', this.coneMat, new pc.Vec3(0, -0.05, 0), new pc.Vec3(0.26, 0.45, 0.26), this.root);
    cone.setLocalEulerAngles(180, 0, 0);

    // Strawberry scoop
    primitive(this.app, 'Scoop', 'sphere', this.icecreamMat, new pc.Vec3(0, 0.22, 0), new pc.Vec3(0.34, 0.32, 0.34), this.root);

    // Cherry on top
    primitive(this.app, 'Cherry', 'sphere', this.cherryMat, new pc.Vec3(0, 0.40, 0), new pc.Vec3(0.12, 0.12, 0.12), this.root);
  }

  private buildFlashlight() {
    // Torch cylinder body
    const body = primitive(this.app, 'TorchBody', 'cylinder', this.torchMat, new pc.Vec3(0, 0, 0.15), new pc.Vec3(0.14, 0.45, 0.14), this.root);
    body.setLocalEulerAngles(90, 0, 0);

    // Lens rim & bulb
    const lens = primitive(this.app, 'TorchLens', 'cylinder', this.glowYellow, new pc.Vec3(0, 0, 0.38), new pc.Vec3(0.20, 0.08, 0.20), this.root);
    lens.setLocalEulerAngles(90, 0, 0);

    // Forward spotlight beam
    const lightEntity = new pc.Entity('TorchSpot');
    lightEntity.setLocalPosition(0, 0, 0.42);
    lightEntity.setLocalEulerAngles(0, 0, 0);
    lightEntity.addComponent('light', {
      type: 'spot',
      color: new pc.Color(1.0, 0.96, 0.82),
      intensity: 3.5,
      range: 35,
      innerConeAngle: 18,
      outerConeAngle: 36,
      castShadows: false
    });
    this.root.addChild(lightEntity);
    this.flashlightLight = lightEntity;
  }

  private buildBalloon() {
    // Balloon floating above hand
    const balloonGroup = new pc.Entity('BalloonGroup');
    balloonGroup.setLocalPosition(0.1, 1.35, 0.1);
    this.root.addChild(balloonGroup);

    // Shiny rubber balloon sphere
    primitive(this.app, 'BalloonBody', 'sphere', this.balloonMat, new pc.Vec3(0, 0.35, 0), new pc.Vec3(0.72, 0.88, 0.72), balloonGroup);
    // Balloon tie knot
    primitive(this.app, 'BalloonKnot', 'cone', this.balloonMat, new pc.Vec3(0, -0.10, 0), new pc.Vec3(0.16, 0.16, 0.16), balloonGroup);

    // Thin string connecting hand to balloon
    primitive(this.app, 'BalloonString', 'cylinder', this.stringMat, new pc.Vec3(-0.05, -0.72, -0.05), new pc.Vec3(0.015, 1.25, 0.015), balloonGroup);

    this.balloonEntity = balloonGroup;
  }

  update(time: number) {
    // Gentle sway for the floating balloon
    if (this.balloonEntity) {
      const swayX = Math.sin(time * 2.4) * 8;
      const swayZ = Math.cos(time * 1.8) * 8;
      const bob = Math.sin(time * 3.2) * 0.06;
      this.balloonEntity.setLocalPosition(0.1, 1.35 + bob, 0.1);
      this.balloonEntity.setLocalEulerAngles(swayX, 0, swayZ);
    }
  }
}
