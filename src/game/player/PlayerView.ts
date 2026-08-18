import * as pc from 'playcanvas';
import { material, primitive } from '../world/meshFactory';
import { HandProps, type PropType } from './HandProps';

export type FootstepSurface = 'grass' | 'asphalt' | 'wood' | 'stone';

export class PlayerView {
  readonly root = new pc.Entity('Player');
  private readonly bodyRoot = new pc.Entity('BodyRoot');
  private readonly headRoot = new pc.Entity('HeadRoot');
  private readonly backpack = new pc.Entity('Backpack');
  private readonly legL = new pc.Entity('LegL');
  private readonly legR = new pc.Entity('LegR');
  private readonly armL = new pc.Entity('ArmL');
  private readonly armR = new pc.Entity('ArmR');
  private readonly handProps: HandProps;

  private walkCycle = 0;
  private isStepping = false;
  private lastStepPhase = 0;
  private currentMode: 'grounded' | 'airborne' | 'swimming' | 'car' | 'bike' | 'raft' = 'grounded';
  public onStep?: (surface: FootstepSurface) => void;

  constructor(private readonly app: pc.Application) {
    app.root.addChild(this.root);

    // Warm Stylized Color Palette
    const skinMat = material(new pc.Color(0.96, 0.78, 0.65), 0.3);
    const hairMat = material(new pc.Color(0.28, 0.16, 0.10), 0.25);
    const jacketMat = material(new pc.Color(0.20, 0.52, 0.76), 0.35, 0.1);
    const jacketTrim = material(new pc.Color(0.94, 0.94, 0.94), 0.3);
    const capMat = material(new pc.Color(0.88, 0.32, 0.24), 0.3);
    const goldMat = material(new pc.Color(0.92, 0.76, 0.28), 0.8, 0.6);
    const pantsMat = material(new pc.Color(0.24, 0.30, 0.38), 0.25);
    const leatherMat = material(new pc.Color(0.44, 0.26, 0.16), 0.3);
    const bedrollMat = material(new pc.Color(0.72, 0.68, 0.48), 0.2);
    const eyeMat = material(new pc.Color(0.10, 0.10, 0.12), 0.85, 0.1);
    const eyeWhite = material(new pc.Color(0.98, 0.98, 0.98), 0.5);
    const blushMat = material(new pc.Color(0.95, 0.45, 0.45), 0.35);
    const sneakerSole = material(new pc.Color(0.96, 0.96, 0.96), 0.4);

    // Torso hierarchy
    this.root.addChild(this.bodyRoot);
    this.bodyRoot.setPosition(0, 0.95, 0);

    // Jacket Body
    primitive(app, 'JacketBody', 'capsule', jacketMat, new pc.Vec3(0, 0.36, 0), new pc.Vec3(0.68, 0.82, 0.54), this.bodyRoot);
    // Jacket Zipper Line & Collar (Front = -Z)
    primitive(app, 'JacketZipper', 'box', jacketTrim, new pc.Vec3(0, 0.36, -0.27), new pc.Vec3(0.06, 0.72, 0.04), this.bodyRoot);
    primitive(app, 'JacketCollar', 'cylinder', jacketTrim, new pc.Vec3(0, 0.74, 0), new pc.Vec3(0.50, 0.10, 0.50), this.bodyRoot);

    // Utility Belt & Canteen (Buckle on Front = -Z)
    primitive(app, 'Belt', 'cylinder', leatherMat, new pc.Vec3(0, 0.05, 0), new pc.Vec3(0.70, 0.10, 0.56), this.bodyRoot);
    primitive(app, 'BeltBuckle', 'box', goldMat, new pc.Vec3(0, 0.05, -0.29), new pc.Vec3(0.14, 0.12, 0.05), this.bodyRoot);
    primitive(app, 'CanteenFlask', 'sphere', goldMat, new pc.Vec3(0.34, 0.05, -0.05), new pc.Vec3(0.16, 0.20, 0.14), this.bodyRoot);

    // Backpack (Back = +Z)
    this.bodyRoot.addChild(this.backpack);
    this.backpack.setLocalPosition(0, 0.42, 0.34);
    primitive(app, 'PackBag', 'box', leatherMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.50, 0.56, 0.30), this.backpack);
    primitive(app, 'PackBedroll', 'cylinder', bedrollMat, new pc.Vec3(0, 0.34, 0), new pc.Vec3(0.22, 0.62, 0.22), this.backpack)
      .setLocalEulerAngles(0, 0, 90);

    // Head root
    this.bodyRoot.addChild(this.headRoot);
    this.headRoot.setLocalPosition(0, 0.95, 0);

    // Head Sphere
    primitive(app, 'HeadSphere', 'sphere', skinMat, new pc.Vec3(0, 0.28, 0), new pc.Vec3(0.70, 0.72, 0.70), this.headRoot);

    // Cute Hair Bangs (framing cap, Front = -Z)
    const bangs: ReadonlyArray<readonly [number, number, number]> = [
      [-0.22, -0.24, -15],
      [0.22, -0.24, 15],
      [0, -0.32, 0]
    ];
    for (const [hx, hz, rot] of bangs) {
      primitive(app, 'HairTuft', 'sphere', hairMat, new pc.Vec3(hx, 0.45, hz), new pc.Vec3(0.24, 0.16, 0.20), this.headRoot)
        .setLocalEulerAngles(0, 0, rot);
    }

    // Explorer Cap (Crown center, Brim on Front = -Z)
    primitive(app, 'CapCrown', 'sphere', capMat, new pc.Vec3(0, 0.52, 0.04), new pc.Vec3(0.74, 0.42, 0.74), this.headRoot);
    primitive(app, 'CapBrim', 'cylinder', capMat, new pc.Vec3(0, 0.42, -0.28), new pc.Vec3(0.68, 0.05, 0.44), this.headRoot)
      .setLocalEulerAngles(-12, 0, 0);
    // Gold Star Badge on Cap
    primitive(app, 'CapBadge', 'cylinder', goldMat, new pc.Vec3(0, 0.54, -0.32), new pc.Vec3(0.12, 0.04, 0.12), this.headRoot)
      .setLocalEulerAngles(90, 0, 0);

    // Expressive Eyes with Specular Glints & Cheeks (Front = -Z)
    for (const side of [-1, 1]) {
      const eyeX = side * 0.16;
      primitive(app, 'EyeWhite', 'sphere', eyeWhite, new pc.Vec3(eyeX, 0.28, -0.31), new pc.Vec3(0.12, 0.15, 0.08), this.headRoot);
      primitive(app, 'EyePupil', 'sphere', eyeMat, new pc.Vec3(eyeX, 0.28, -0.34), new pc.Vec3(0.08, 0.11, 0.05), this.headRoot);
      primitive(app, 'EyeHighlight', 'sphere', eyeWhite, new pc.Vec3(eyeX + 0.02, 0.31, -0.36), new pc.Vec3(0.035, 0.035, 0.035), this.headRoot);
      primitive(app, 'CheekBlush', 'sphere', blushMat, new pc.Vec3(side * 0.23, 0.18, -0.29), new pc.Vec3(0.13, 0.06, 0.06), this.headRoot);
    }

    // Legs (Pivot at hip)
    this.root.addChild(this.legL);
    this.root.addChild(this.legR);
    this.legL.setPosition(-0.19, 0.85, 0);
    this.legR.setPosition(0.19, 0.85, 0);

    // Left leg and sneaker (Toes pointing towards Front = -Z)
    primitive(app, 'LegL_Pants', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legL);
    primitive(app, 'LegL_Sneaker', 'box', leatherMat, new pc.Vec3(0, -0.74, -0.06), new pc.Vec3(0.28, 0.20, 0.44), this.legL);
    primitive(app, 'LegL_Sole', 'box', sneakerSole, new pc.Vec3(0, -0.84, -0.06), new pc.Vec3(0.30, 0.06, 0.46), this.legL);

    // Right leg and sneaker (Toes pointing towards Front = -Z)
    primitive(app, 'LegR_Pants', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legR);
    primitive(app, 'LegR_Sneaker', 'box', leatherMat, new pc.Vec3(0, -0.74, -0.06), new pc.Vec3(0.28, 0.20, 0.44), this.legR);
    primitive(app, 'LegR_Sole', 'box', sneakerSole, new pc.Vec3(0, -0.84, -0.06), new pc.Vec3(0.30, 0.06, 0.46), this.legR);

    // Arms (Pivot at shoulder)
    this.bodyRoot.addChild(this.armL);
    this.bodyRoot.addChild(this.armR);
    this.armL.setLocalPosition(-0.42, 0.62, 0);
    this.armR.setLocalPosition(0.42, 0.62, 0);

    // Left arm & hand
    primitive(app, 'ArmL_Sleeve', 'capsule', jacketMat, new pc.Vec3(0, -0.32, 0), new pc.Vec3(0.22, 0.62, 0.22), this.armL);
    primitive(app, 'ArmL_Cuff', 'cylinder', jacketTrim, new pc.Vec3(0, -0.58, 0), new pc.Vec3(0.23, 0.08, 0.23), this.armL);
    primitive(app, 'ArmL_Hand', 'sphere', skinMat, new pc.Vec3(0, -0.66, 0), new pc.Vec3(0.18, 0.18, 0.18), this.armL);

    // Right arm & hand
    primitive(app, 'ArmR_Sleeve', 'capsule', jacketMat, new pc.Vec3(0, -0.32, 0), new pc.Vec3(0.22, 0.62, 0.22), this.armR);
    primitive(app, 'ArmR_Cuff', 'cylinder', jacketTrim, new pc.Vec3(0, -0.58, 0), new pc.Vec3(0.23, 0.08, 0.23), this.armR);
    primitive(app, 'ArmR_Hand', 'sphere', skinMat, new pc.Vec3(0, -0.66, 0), new pc.Vec3(0.18, 0.18, 0.18), this.armR);

    // Handheld Props manager
    this.handProps = new HandProps(app, this.armR);
  }

  setProp(prop: PropType) {
    this.handProps.setProp(prop);
  }

  get activeProp(): PropType {
    return this.handProps.current;
  }

  sync(
    pos: { x: number; y: number; z: number },
    yaw: number,
    speed: number,
    dt: number,
    mode: 'grounded' | 'airborne' | 'swimming' | 'car' | 'bike' | 'raft' = 'grounded',
    steerInput = 0
  ) {
    this.currentMode = mode;
    this.root.setPosition(pos.x, pos.y, pos.z);
    this.root.setEulerAngles(0, (yaw * 180) / Math.PI, 0);

    const isMoving = speed > 0.15;
    const holdingProp = this.handProps.current !== 'none';
    this.handProps.update(performance.now() * 0.001);

    if (mode === 'car') {
      // Driver seated inside car
      this.bodyRoot.setLocalPosition(-0.42, 0.34, 0.05);
      this.bodyRoot.setLocalEulerAngles(5, 0, -steerInput * 8);
      this.headRoot.setLocalEulerAngles(0, steerInput * 15, 0);

      this.legL.setLocalPosition(-0.42 - 0.14, 0.35, 0.10);
      this.legR.setLocalPosition(-0.42 + 0.14, 0.35, 0.10);
      this.legL.setLocalEulerAngles(-72, 0, 0);
      this.legR.setLocalEulerAngles(-72, 0, 0);

      this.armL.setLocalEulerAngles(-55, -20 + steerInput * 15, 0);
      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(-55, 20 + steerInput * 15, 0);
      }
      return;
    }

    if (mode === 'bike') {
      // Cyclist riding posture
      this.bodyRoot.setLocalPosition(0, 0.68, 0.12);
      this.bodyRoot.setLocalEulerAngles(18, 0, -steerInput * 12);
      this.headRoot.setLocalEulerAngles(-10, steerInput * 8, 0);

      if (isMoving) {
        this.walkCycle += dt * speed * 4.5;
      }
      const pedalL = Math.sin(this.walkCycle) * 35 - 35;
      const pedalR = -Math.sin(this.walkCycle) * 35 - 35;

      this.legL.setLocalPosition(-0.19, 0.65, 0.12);
      this.legR.setLocalPosition(0.19, 0.65, 0.12);
      this.legL.setLocalEulerAngles(pedalL, 0, 0);
      this.legR.setLocalEulerAngles(pedalR, 0, 0);

      this.armL.setLocalEulerAngles(-45, -15, 0);
      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(-45, 15, 0);
      }
      return;
    }

    if (mode === 'swimming') {
      // Swimming stroke posture
      this.bodyRoot.setLocalPosition(0, 0.32, 0);
      this.bodyRoot.setLocalEulerAngles(75, 0, 0);
      this.headRoot.setLocalEulerAngles(-52, 0, 0);

      this.legL.setLocalPosition(-0.19, 0.32, 0);
      this.legR.setLocalPosition(0.19, 0.32, 0);

      if (isMoving) {
        this.walkCycle += dt * 6.5;
        const kickL = Math.sin(this.walkCycle) * 25 + 75;
        const kickR = -Math.sin(this.walkCycle) * 25 + 75;
        this.legL.setLocalEulerAngles(kickL, 0, 0);
        this.legR.setLocalEulerAngles(kickR, 0, 0);

        const strokeL = Math.sin(this.walkCycle) * 45 - 20;
        this.armL.setLocalEulerAngles(-75, strokeL, 0);
        this.armR.setLocalEulerAngles(-75, -strokeL, 0);
      } else {
        this.legL.setLocalEulerAngles(75, 0, 0);
        this.legR.setLocalEulerAngles(75, 0, 0);
        this.armL.setLocalEulerAngles(-30, 0, 0);
        this.armR.setLocalEulerAngles(-30, 0, 0);
      }
      return;
    }

    if (mode === 'airborne') {
      // Airborne jump pose
      this.bodyRoot.setLocalPosition(0, 0.95, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, 0);
      this.headRoot.setLocalEulerAngles(0, 0, 0);

      this.legL.setLocalPosition(-0.19, 0.85, 0);
      this.legR.setLocalPosition(0.19, 0.85, 0);
      this.legL.setLocalEulerAngles(28, 0, 0);
      this.legR.setLocalEulerAngles(-22, 0, 0);

      this.armL.setLocalEulerAngles(-55, 0, -25);
      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(-55, 0, 25);
      }
      return;
    }

    // Grounded walking/running
    this.bodyRoot.setLocalPosition(0, 0.95, 0);
    this.legL.setLocalPosition(-0.19, 0.85, 0);
    this.legR.setLocalPosition(0.19, 0.85, 0);

    if (isMoving) {
      const cycleSpeed = speed > 5.5 ? 9.5 : 6.8;
      this.walkCycle += dt * cycleSpeed;

      const legSwing = Math.sin(this.walkCycle) * (speed > 5.5 ? 42 : 30);
      this.legL.setLocalEulerAngles(legSwing, 0, 0);
      this.legR.setLocalEulerAngles(-legSwing, 0, 0);

      const armSwing = Math.sin(this.walkCycle) * (speed > 5.5 ? 38 : 25);
      this.armL.setLocalEulerAngles(-armSwing, 0, 0);
      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(armSwing, 0, 0);
      }

      // Torso bob & sway
      const bob = Math.abs(Math.sin(this.walkCycle)) * 0.06;
      const sway = Math.sin(this.walkCycle * 0.5) * 2.5;
      this.bodyRoot.setLocalPosition(0, 0.95 + bob, 0);
      this.bodyRoot.setLocalEulerAngles(4, sway, 0);
      this.headRoot.setLocalEulerAngles(0, -sway * 0.5, 0);

      // Footstep Sound Trigger
      const phase = Math.sin(this.walkCycle);
      if (phase * this.lastStepPhase < 0 && !this.isStepping) {
        this.isStepping = true;
        this.triggerFootstep(pos);
      } else if (Math.abs(phase) < 0.1) {
        this.isStepping = false;
      }
      this.lastStepPhase = phase;
    } else {
      // Idle Breathing
      const idle = Math.sin(performance.now() * 0.002) * 0.015;
      this.bodyRoot.setLocalPosition(0, 0.95 + idle, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, 0);
      this.headRoot.setLocalEulerAngles(0, 0, 0);

      this.legL.setLocalEulerAngles(0, 0, 0);
      this.legR.setLocalEulerAngles(0, 0, 0);
      this.armL.setLocalEulerAngles(0, 0, 0);
      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(0, 0, 0);
      }
    }
  }

  private triggerFootstep(pos: { x: number; y: number; z: number }) {
    let surface: FootstepSurface = 'grass';
    if (pos.x > -14 && pos.x < 14) {
      surface = 'asphalt';
    } else if (pos.x > 18 && pos.x < 42 && pos.z > -36 && pos.z < -6) {
      surface = 'wood';
    } else if (pos.x > -40 && pos.x < -14 && pos.z > 8 && pos.z < 38) {
      surface = 'stone';
    }
    this.onStep?.(surface);
  }
}
