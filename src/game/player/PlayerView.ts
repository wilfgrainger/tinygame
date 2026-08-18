import * as pc from 'playcanvas';
import type { PlayerMode, PlayerSnapshot } from './PlayerController';
import { material, primitive } from '../world/meshFactory';

export class PlayerView {
  readonly root = new pc.Entity('TinyExplorer');
  private readonly bodyRoot = new pc.Entity('ExplorerTorso');
  private readonly headRoot = new pc.Entity('ExplorerHeadRoot');
  private readonly legL = new pc.Entity('ExplorerHipL');
  private readonly legR = new pc.Entity('ExplorerHipR');
  private readonly armL = new pc.Entity('ExplorerShoulderL');
  private readonly armR = new pc.Entity('ExplorerShoulderR');
  private readonly backpack = new pc.Entity('ExplorerBackpack');

  private walkPhase = 0;
  private prevPos = { x: 0, y: 0, z: 0 };
  private prevYaw = 0;
  private currentBank = 0;
  private landSquash = 0;
  private prevGrounded = true;
  private prevMode: PlayerMode = 'grounded';

  // Step trigger callback for footstep audio
  onStep?: (surface: 'grass' | 'wood' | 'stone' | 'sand') => void;

  constructor(app: pc.Application) {
    app.root.addChild(this.root);

    const shirtMat = material(new pc.Color(0.24, 0.54, 0.74), 0.25);
    const shirtTrimMat = material(new pc.Color(0.18, 0.42, 0.58), 0.2);
    const skinMat = material(new pc.Color(0.92, 0.74, 0.60), 0.3);
    const pantsMat = material(new pc.Color(0.22, 0.28, 0.35), 0.2);
    const leatherMat = material(new pc.Color(0.48, 0.28, 0.16), 0.3);
    const capMat = material(new pc.Color(0.85, 0.38, 0.28), 0.2);
    const matRollMat = material(new pc.Color(0.72, 0.65, 0.45), 0.2);
    const eyeMat = material(new pc.Color(0.12, 0.12, 0.14), 0.8, 0.1);
    const whiteMat = material(new pc.Color(0.98, 0.98, 0.98), 0.4);

    // Torso hierarchy
    this.root.addChild(this.bodyRoot);
    this.bodyRoot.setPosition(0, 0.95, 0);

    // Shirt Body
    primitive(app, 'ShirtBody', 'capsule', shirtMat, new pc.Vec3(0, 0.35, 0), new pc.Vec3(0.68, 0.85, 0.56), this.bodyRoot);
    // Belt
    primitive(app, 'Belt', 'cylinder', leatherMat, new pc.Vec3(0, 0.04, 0), new pc.Vec3(0.72, 0.12, 0.60), this.bodyRoot);
    // Collar
    primitive(app, 'Collar', 'cylinder', shirtTrimMat, new pc.Vec3(0, 0.72, 0), new pc.Vec3(0.48, 0.1, 0.48), this.bodyRoot);

    // Backpack
    this.bodyRoot.addChild(this.backpack);
    this.backpack.setLocalPosition(0, 0.42, -0.36);
    primitive(app, 'PackBag', 'box', leatherMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.52, 0.58, 0.32), this.backpack);
    primitive(app, 'PackBedroll', 'cylinder', matRollMat, new pc.Vec3(0, 0.34, 0), new pc.Vec3(0.24, 0.64, 0.24), this.backpack)
      .setLocalEulerAngles(0, 0, 90);

    // Head root
    this.bodyRoot.addChild(this.headRoot);
    this.headRoot.setLocalPosition(0, 0.95, 0);

    // Head Sphere
    primitive(app, 'HeadSphere', 'sphere', skinMat, new pc.Vec3(0, 0.28, 0), new pc.Vec3(0.70, 0.72, 0.70), this.headRoot);

    // Explorer Cap
    primitive(app, 'CapCrown', 'sphere', capMat, new pc.Vec3(0, 0.52, -0.04), new pc.Vec3(0.74, 0.42, 0.74), this.headRoot);
    primitive(app, 'CapBrim', 'cylinder', capMat, new pc.Vec3(0, 0.40, 0.28), new pc.Vec3(0.68, 0.06, 0.44), this.headRoot)
      .setLocalEulerAngles(12, 0, 0);

    // Cute Eyes (with specular glint)
    for (const side of [-1, 1]) {
      const eyeX = side * 0.16;
      primitive(app, 'Eye', 'sphere', eyeMat, new pc.Vec3(eyeX, 0.28, 0.32), new pc.Vec3(0.09, 0.12, 0.06), this.headRoot);
      primitive(app, 'EyeHighlight', 'sphere', whiteMat, new pc.Vec3(eyeX + 0.02, 0.31, 0.34), new pc.Vec3(0.035, 0.035, 0.035), this.headRoot);
      // Cheeks blush
      primitive(app, 'Blush', 'sphere', capMat, new pc.Vec3(side * 0.22, 0.18, 0.29), new pc.Vec3(0.12, 0.06, 0.06), this.headRoot);
    }

    // Legs (Pivot at hip)
    this.root.addChild(this.legL);
    this.root.addChild(this.legR);
    this.legL.setPosition(-0.19, 0.85, 0);
    this.legR.setPosition(0.19, 0.85, 0);

    // Left leg and shoe
    primitive(app, 'LegL_Pants', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legL);
    primitive(app, 'LegL_Boot', 'box', leatherMat, new pc.Vec3(0, -0.74, 0.06), new pc.Vec3(0.29, 0.22, 0.44), this.legL);

    // Right leg and shoe
    primitive(app, 'LegR_Pants', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legR);
    primitive(app, 'LegR_Boot', 'box', leatherMat, new pc.Vec3(0, -0.74, 0.06), new pc.Vec3(0.29, 0.22, 0.44), this.legR);

    // Arms (Pivot at shoulder)
    this.bodyRoot.addChild(this.armL);
    this.bodyRoot.addChild(this.armR);
    this.armL.setLocalPosition(-0.42, 0.62, 0);
    this.armR.setLocalPosition(0.42, 0.62, 0);

    // Left arm & hand
    primitive(app, 'ArmL_Sleeve', 'capsule', shirtMat, new pc.Vec3(0, -0.32, 0), new pc.Vec3(0.22, 0.62, 0.22), this.armL);
    primitive(app, 'ArmL_Hand', 'sphere', skinMat, new pc.Vec3(0, -0.64, 0), new pc.Vec3(0.19, 0.19, 0.19), this.armL);

    // Right arm & hand
    primitive(app, 'ArmR_Sleeve', 'capsule', shirtMat, new pc.Vec3(0, -0.32, 0), new pc.Vec3(0.22, 0.62, 0.22), this.armR);
    primitive(app, 'ArmR_Hand', 'sphere', skinMat, new pc.Vec3(0, -0.64, 0), new pc.Vec3(0.19, 0.19, 0.19), this.armR);
  }

  sync(snapshot: PlayerSnapshot, rideOffset = 0, dt = 0.016) {
    const mode = snapshot.mode;
    const isGrounded = mode === 'grounded';

    // Detect landing impact for squash animation
    if (this.prevMode === 'airborne' && isGrounded) {
      this.landSquash = 0.35;
    }
    this.prevGrounded = isGrounded;
    this.landSquash = Math.max(0, this.landSquash - dt * 2.8);

    // Position & Yaw
    this.root.setPosition(snapshot.position.x, snapshot.position.y + rideOffset, snapshot.position.z);

    // Calculate speed and turn rate
    const dx = snapshot.position.x - this.prevPos.x;
    const dz = snapshot.position.z - this.prevPos.z;
    const horizontalDist = Math.hypot(dx, dz);
    const speed = horizontalDist / Math.max(dt, 0.001);
    this.prevPos = { ...snapshot.position };

    // Turn banking
    let yawDelta = snapshot.yaw - this.prevYaw;
    while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
    while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;
    this.prevYaw = snapshot.yaw;
    const targetBank = Math.max(-18, Math.min(18, -yawDelta * 35));
    this.currentBank += (targetBank - this.currentBank) * Math.min(1, dt * 10);

    const degYaw = (snapshot.yaw * 180) / Math.PI;

    if (mode === 'bike') {
      // Bike riding pose
      this.root.setEulerAngles(0, degYaw, this.currentBank);
      this.bodyRoot.setLocalPosition(0, 0.68, -0.12);
      this.bodyRoot.setLocalEulerAngles(18, 0, 0);
      this.headRoot.setLocalEulerAngles(-12, 0, 0);

      // Pedaling rotation
      this.walkPhase += horizontalDist * 2.8;
      const legAngleL = Math.sin(this.walkPhase) * 35 + 25;
      const legAngleR = -Math.sin(this.walkPhase) * 35 + 25;
      this.legL.setLocalPosition(-0.19, 0.65, 0);
      this.legR.setLocalPosition(0.19, 0.65, 0);
      this.legL.setLocalEulerAngles(legAngleL, 0, 0);
      this.legR.setLocalEulerAngles(legAngleR, 0, 0);

      // Hands gripping handlebars
      this.armL.setLocalEulerAngles(55, 15, -10);
      this.armR.setLocalEulerAngles(55, -15, 10);

    } else if (mode === 'swimming') {
      // Swimming prone crawl pose
      this.walkPhase += dt * 5.5;
      this.root.setEulerAngles(68, degYaw, this.currentBank);
      this.bodyRoot.setLocalPosition(0, 0.55, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, 0);
      this.headRoot.setLocalEulerAngles(-52, 0, 0);

      // Swimming arm strokes
      const strokeL = Math.sin(this.walkPhase) * 60 + 20;
      const strokeR = Math.sin(this.walkPhase + Math.PI) * 60 + 20;
      this.armL.setLocalEulerAngles(strokeL, 20, 0);
      this.armR.setLocalEulerAngles(strokeR, -20, 0);

      // Swimming flutter kick
      const kickL = Math.sin(this.walkPhase * 1.6) * 22;
      const kickR = Math.sin(this.walkPhase * 1.6 + Math.PI) * 22;
      this.legL.setLocalPosition(-0.19, 0.85, 0);
      this.legR.setLocalPosition(0.19, 0.85, 0);
      this.legL.setLocalEulerAngles(kickL, 0, 0);
      this.legR.setLocalEulerAngles(kickR, 0, 0);

    } else {
      // Grounded or Airborne
      const forwardTilt = Math.min(14, speed * 1.2);
      this.root.setEulerAngles(forwardTilt, degYaw, this.currentBank);

      const moving = speed > 0.4;
      if (moving && isGrounded) {
        const prevPhase = this.walkPhase;
        this.walkPhase += horizontalDist * 4.2;

        // Footstep trigger at gait peaks
        if (Math.floor(this.walkPhase / Math.PI) !== Math.floor(prevPhase / Math.PI)) {
          this.onStep?.('grass');
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
        this.armR.setLocalEulerAngles(-armSwing, 0, -10);

      } else if (mode === 'airborne') {
        // Airborne pose
        this.bodyRoot.setLocalPosition(0, 1.05, 0);
        this.bodyRoot.setLocalEulerAngles(-8, 0, 0);
        this.headRoot.setLocalEulerAngles(6, 0, 0);

        this.legL.setLocalPosition(-0.19, 0.85, 0);
        this.legR.setLocalPosition(0.19, 0.85, 0);
        this.legL.setLocalEulerAngles(-24, 0, -6);
        this.legR.setLocalEulerAngles(18, 0, 6);

        this.armL.setLocalEulerAngles(-35, 20, 25);
        this.armR.setLocalEulerAngles(-35, -20, -25);

      } else {
        // Idle breathing
        const breathe = Math.sin(Date.now() * 0.003) * 0.02;
        this.bodyRoot.setLocalPosition(0, 0.95 + breathe - this.landSquash * 0.25, 0);
        this.bodyRoot.setLocalEulerAngles(0, 0, 0);
        this.headRoot.setLocalEulerAngles(breathe * 20, 0, 0);

        this.legL.setLocalPosition(-0.19, 0.85, 0);
        this.legR.setLocalPosition(0.19, 0.85, 0);
        this.legL.setLocalEulerAngles(0, 0, 0);
        this.legR.setLocalEulerAngles(0, 0, 0);

        this.armL.setLocalEulerAngles(Math.sin(Date.now() * 0.002) * 5, 0, 8);
        this.armR.setLocalEulerAngles(-Math.sin(Date.now() * 0.002) * 5, 0, -8);
      }
    }

    this.prevMode = mode;
  }
}
