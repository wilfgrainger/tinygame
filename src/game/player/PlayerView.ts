import * as pc from 'playcanvas';
import type { PlayerMode, PlayerSnapshot } from './PlayerController';
import { material, primitive } from '../world/meshFactory';
import { HandProps, type PropType } from './HandProps';

export class PlayerView {
  readonly root = new pc.Entity('TinyExplorer');
  private readonly bodyRoot = new pc.Entity('ExplorerTorso');
  private readonly headRoot = new pc.Entity('ExplorerHeadRoot');
  private readonly legL = new pc.Entity('ExplorerHipL');
  private readonly legR = new pc.Entity('ExplorerHipR');
  private readonly armL = new pc.Entity('ExplorerShoulderL');
  private readonly armR = new pc.Entity('ExplorerShoulderR');
  private readonly backpack = new pc.Entity('ExplorerBackpack');
  readonly handProps: HandProps;

  private walkPhase = 0;
  private prevPos = { x: 0, y: 0, z: 0 };
  private prevYaw = 0;
  private currentBank = 0;
  private landSquash = 0;
  private prevMode: PlayerMode = 'grounded';

  onStep?: (surface: 'grass' | 'wood' | 'stone' | 'sand' | 'asphalt') => void;

  constructor(app: pc.Application) {
    app.root.addChild(this.root);

    // Warm, Rich Stylized Materials
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
    // Jacket Zipper Line & Collar
    primitive(app, 'JacketZipper', 'box', jacketTrim, new pc.Vec3(0, 0.36, 0.27), new pc.Vec3(0.06, 0.72, 0.04), this.bodyRoot);
    primitive(app, 'JacketCollar', 'cylinder', jacketTrim, new pc.Vec3(0, 0.74, 0), new pc.Vec3(0.50, 0.10, 0.50), this.bodyRoot);

    // Utility Belt & Canteen
    primitive(app, 'Belt', 'cylinder', leatherMat, new pc.Vec3(0, 0.05, 0), new pc.Vec3(0.70, 0.10, 0.56), this.bodyRoot);
    primitive(app, 'BeltBuckle', 'box', goldMat, new pc.Vec3(0, 0.05, 0.29), new pc.Vec3(0.14, 0.12, 0.05), this.bodyRoot);
    primitive(app, 'CanteenFlask', 'sphere', goldMat, new pc.Vec3(0.34, 0.05, 0.05), new pc.Vec3(0.16, 0.20, 0.14), this.bodyRoot);

    // Backpack
    this.bodyRoot.addChild(this.backpack);
    this.backpack.setLocalPosition(0, 0.42, -0.34);
    primitive(app, 'PackBag', 'box', leatherMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.50, 0.56, 0.30), this.backpack);
    primitive(app, 'PackBedroll', 'cylinder', bedrollMat, new pc.Vec3(0, 0.34, 0), new pc.Vec3(0.22, 0.62, 0.22), this.backpack)
      .setLocalEulerAngles(0, 0, 90);

    // Head root
    this.bodyRoot.addChild(this.headRoot);
    this.headRoot.setLocalPosition(0, 0.95, 0);

    // Head Sphere
    primitive(app, 'HeadSphere', 'sphere', skinMat, new pc.Vec3(0, 0.28, 0), new pc.Vec3(0.70, 0.72, 0.70), this.headRoot);

    // Cute Hair Bangs (framing cap)
    const bangs: ReadonlyArray<readonly [number, number, number]> = [
      [-0.22, 0.24, -15],
      [0.22, 0.24, 15],
      [0, 0.32, 0]
    ];
    for (const [hx, hz, rot] of bangs) {
      primitive(app, 'HairTuft', 'sphere', hairMat, new pc.Vec3(hx, 0.45, hz), new pc.Vec3(0.24, 0.16, 0.20), this.headRoot)
        .setLocalEulerAngles(0, 0, rot);
    }


    // Explorer Cap
    primitive(app, 'CapCrown', 'sphere', capMat, new pc.Vec3(0, 0.52, -0.04), new pc.Vec3(0.74, 0.42, 0.74), this.headRoot);
    primitive(app, 'CapBrim', 'cylinder', capMat, new pc.Vec3(0, 0.42, 0.28), new pc.Vec3(0.68, 0.05, 0.44), this.headRoot)
      .setLocalEulerAngles(12, 0, 0);
    // Gold Star Badge on Cap
    primitive(app, 'CapBadge', 'cylinder', goldMat, new pc.Vec3(0, 0.54, 0.32), new pc.Vec3(0.12, 0.04, 0.12), this.headRoot)
      .setLocalEulerAngles(90, 0, 0);

    // Expressive Eyes with Specular Glints & Cheeks
    for (const side of [-1, 1]) {
      const eyeX = side * 0.16;
      primitive(app, 'EyeWhite', 'sphere', eyeWhite, new pc.Vec3(eyeX, 0.28, 0.31), new pc.Vec3(0.12, 0.15, 0.08), this.headRoot);
      primitive(app, 'EyePupil', 'sphere', eyeMat, new pc.Vec3(eyeX, 0.28, 0.34), new pc.Vec3(0.08, 0.11, 0.05), this.headRoot);
      primitive(app, 'EyeHighlight', 'sphere', eyeWhite, new pc.Vec3(eyeX + 0.02, 0.31, 0.36), new pc.Vec3(0.035, 0.035, 0.035), this.headRoot);
      primitive(app, 'CheekBlush', 'sphere', blushMat, new pc.Vec3(side * 0.23, 0.18, 0.29), new pc.Vec3(0.13, 0.06, 0.06), this.headRoot);
    }

    // Legs (Pivot at hip)
    this.root.addChild(this.legL);
    this.root.addChild(this.legR);
    this.legL.setPosition(-0.19, 0.85, 0);
    this.legR.setPosition(0.19, 0.85, 0);

    // Left leg and sneaker
    primitive(app, 'LegL_Pants', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legL);
    primitive(app, 'LegL_Sneaker', 'box', leatherMat, new pc.Vec3(0, -0.74, 0.06), new pc.Vec3(0.28, 0.20, 0.44), this.legL);
    primitive(app, 'LegL_Sole', 'box', sneakerSole, new pc.Vec3(0, -0.84, 0.06), new pc.Vec3(0.30, 0.06, 0.46), this.legL);

    // Right leg and sneaker
    primitive(app, 'LegR_Pants', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legR);
    primitive(app, 'LegR_Sneaker', 'box', leatherMat, new pc.Vec3(0, -0.74, 0.06), new pc.Vec3(0.28, 0.20, 0.44), this.legR);
    primitive(app, 'LegR_Sole', 'box', sneakerSole, new pc.Vec3(0, -0.84, 0.06), new pc.Vec3(0.30, 0.06, 0.46), this.legR);

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

  sync(snapshot: PlayerSnapshot, rideOffset = 0, dt = 0.016, simTime = 0) {
    const mode = snapshot.mode;
    const isGrounded = mode === 'grounded';

    if (this.prevMode === 'airborne' && isGrounded) {
      this.landSquash = 0.35;
    }
    this.landSquash = Math.max(0, this.landSquash - dt * 2.8);

    this.root.setPosition(snapshot.position.x, snapshot.position.y + rideOffset, snapshot.position.z);

    const dx = snapshot.position.x - this.prevPos.x;
    const dz = snapshot.position.z - this.prevPos.z;
    const horizontalDist = Math.hypot(dx, dz);
    const speed = horizontalDist / Math.max(dt, 0.001);
    this.prevPos = { ...snapshot.position };

    let yawDelta = snapshot.yaw - this.prevYaw;
    while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
    while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;
    this.prevYaw = snapshot.yaw;
    const targetBank = Math.max(-18, Math.min(18, -yawDelta * 35));
    this.currentBank += (targetBank - this.currentBank) * Math.min(1, dt * 10);

    const degYaw = (snapshot.yaw * 180) / Math.PI;
    const isHoldingItem = this.handProps.current !== 'none';

    if (mode === 'bike') {
      this.root.setEulerAngles(0, degYaw, this.currentBank);
      this.bodyRoot.setLocalPosition(0, 0.68, -0.12);
      this.bodyRoot.setLocalEulerAngles(18, 0, 0);
      this.headRoot.setLocalEulerAngles(-12, 0, 0);

      this.walkPhase += horizontalDist * 2.8;
      const legAngleL = Math.sin(this.walkPhase) * 35 + 25;
      const legAngleR = -Math.sin(this.walkPhase) * 35 + 25;
      this.legL.setLocalPosition(-0.19, 0.65, 0);
      this.legR.setLocalPosition(0.19, 0.65, 0);
      this.legL.setLocalEulerAngles(legAngleL, 0, 0);
      this.legR.setLocalEulerAngles(legAngleR, 0, 0);

      this.armL.setLocalEulerAngles(55, 15, -10);
      this.armR.setLocalEulerAngles(55, -15, 10);

    } else if (mode === 'car') {
      this.root.setEulerAngles(0, degYaw, this.currentBank * 0.4);
      this.bodyRoot.setLocalPosition(-0.45, 0.35, 0);
      this.bodyRoot.setLocalEulerAngles(6, 0, 0);
      this.headRoot.setLocalEulerAngles(0, 0, 0);

      this.legL.setLocalPosition(-0.19, 0.55, 0.2);
      this.legR.setLocalPosition(0.19, 0.55, 0.2);
      this.legL.setLocalEulerAngles(75, -5, 0);
      this.legR.setLocalEulerAngles(75, 5, 0);

      this.armL.setLocalEulerAngles(60, 18, -12);
      this.armR.setLocalEulerAngles(60, -18, 12);

    } else if (mode === 'swimming') {
      this.walkPhase += dt * 5.5;
      this.root.setEulerAngles(68, degYaw, this.currentBank);
      this.bodyRoot.setLocalPosition(0, 0.55, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, 0);
      this.headRoot.setLocalEulerAngles(-52, 0, 0);

      const strokeL = Math.sin(this.walkPhase) * 60 + 20;
      const strokeR = Math.sin(this.walkPhase + Math.PI) * 60 + 20;
      this.armL.setLocalEulerAngles(strokeL, 20, 0);
      this.armR.setLocalEulerAngles(strokeR, -20, 0);

      const kickL = Math.sin(this.walkPhase * 1.6) * 22;
      const kickR = Math.sin(this.walkPhase * 1.6 + Math.PI) * 22;
      this.legL.setLocalPosition(-0.19, 0.85, 0);
      this.legR.setLocalPosition(0.19, 0.85, 0);
      this.legL.setLocalEulerAngles(kickL, 0, 0);
      this.legR.setLocalEulerAngles(kickR, 0, 0);

    } else {
      const forwardTilt = Math.min(14, speed * 1.2);
      this.root.setEulerAngles(forwardTilt, degYaw, this.currentBank);

      const moving = speed > 0.4;
      if (moving && isGrounded) {
        const prevPhase = this.walkPhase;
        this.walkPhase += horizontalDist * 4.2;

        if (Math.floor(this.walkPhase / Math.PI) !== Math.floor(prevPhase / Math.PI)) {
          const isRoad = Math.abs(snapshot.position.x) < 5 || Math.abs(snapshot.position.z) < 5;
          this.onStep?.(isRoad ? 'asphalt' : 'grass');
        }

        const legSwing = Math.sin(this.walkPhase) * Math.min(42, speed * 5.5);
        const armSwing = -Math.sin(this.walkPhase) * Math.min(38, speed * 5.0);
        const bob = Math.abs(Math.sin(this.walkPhase)) * 0.09;

        this.bodyRoot.setLocalPosition(0, 0.95 + bob - this.landSquash * 0.2, 0);
        this.bodyRoot.setLocalEulerAngles(0, 0, -Math.sin(this.walkPhase) * 3);
        this.headRoot.setLocalEulerAngles(0, 0, Math.sin(this.walkPhase) * 2);

        this.legL.setLocalPosition(-0.19, 0.85 + bob * 0.5, 0);
        this.legR.setLocalPosition(0.19, 0.85 + bob * 0.5, 0);
        this.legL.setLocalEulerAngles(legSwing, 0, 0);
        this.legR.setLocalEulerAngles(-legSwing, 0, 0);

        this.armL.setLocalEulerAngles(armSwing, 0, 10);
        if (isHoldingItem) {
          this.armR.setLocalEulerAngles(48, -12, 0);
        } else {
          this.armR.setLocalEulerAngles(-armSwing, 0, -10);
        }

      } else if (mode === 'airborne') {
        this.bodyRoot.setLocalPosition(0, 1.05, 0);
        this.bodyRoot.setLocalEulerAngles(-8, 0, 0);
        this.headRoot.setLocalEulerAngles(6, 0, 0);

        this.legL.setLocalPosition(-0.19, 0.85, 0);
        this.legR.setLocalPosition(0.19, 0.85, 0);
        this.legL.setLocalEulerAngles(-24, 0, -6);
        this.legR.setLocalEulerAngles(18, 0, 6);

        this.armL.setLocalEulerAngles(-35, 20, 25);
        if (isHoldingItem) {
          this.armR.setLocalEulerAngles(48, -12, 0);
        } else {
          this.armR.setLocalEulerAngles(-35, -20, -25);
        }

      } else {
        const breathe = Math.sin(Date.now() * 0.003) * 0.02;
        this.bodyRoot.setLocalPosition(0, 0.95 + breathe - this.landSquash * 0.25, 0);
        this.bodyRoot.setLocalEulerAngles(0, 0, 0);
        this.headRoot.setLocalEulerAngles(breathe * 20, 0, 0);

        this.legL.setLocalPosition(-0.19, 0.85, 0);
        this.legR.setLocalPosition(0.19, 0.85, 0);
        this.legL.setLocalEulerAngles(0, 0, 0);
        this.legR.setLocalEulerAngles(0, 0, 0);

        this.armL.setLocalEulerAngles(Math.sin(Date.now() * 0.002) * 5, 0, 8);
        if (isHoldingItem) {
          this.armR.setLocalEulerAngles(48, -12, 0);
        } else {
          this.armR.setLocalEulerAngles(-Math.sin(Date.now() * 0.002) * 5, 0, -8);
        }
      }
    }

    this.handProps.update(simTime);
    this.prevMode = mode;
  }
}
