import * as pc from 'playcanvas';
import { material, primitive } from '../world/meshFactory';
import { HandProps, type PropType } from './HandProps';

export type FootstepSurface = 'grass' | 'asphalt' | 'wood' | 'stone';
export type PlayerRole = 'explorer' | 'barista' | 'firefighter' | 'police';
export type PlayerEmote = 'none' | 'wave' | 'dance' | 'cheer' | 'sit';

export class PlayerView {
  readonly root = new pc.Entity('Player');
  private readonly bodyRoot = new pc.Entity('BodyRoot');
  private readonly headRoot = new pc.Entity('HeadRoot');
  private readonly backpack = new pc.Entity('Backpack');
  private readonly hatRoot = new pc.Entity('HatRoot');
  private readonly legL = new pc.Entity('LegL');
  private readonly legR = new pc.Entity('LegR');
  private readonly armL = new pc.Entity('ArmL');
  private readonly armR = new pc.Entity('ArmR');
  private readonly handProps: HandProps;

  private currentRole: PlayerRole = 'explorer';
  private currentEmote: PlayerEmote = 'none';
  private emoteTimer = 0;

  private walkCycle = 0;
  private isStepping = false;
  private lastStepPhase = 0;
  private currentMode: 'grounded' | 'airborne' | 'swimming' | 'car' | 'bike' | 'raft' = 'grounded';
  public onStep?: (surface: FootstepSurface) => void;

  // Materials
  private skinMat = material(new pc.Color(0.96, 0.78, 0.65), 0.3);
  private hairMat = material(new pc.Color(0.28, 0.16, 0.10), 0.25);
  private jacketMat = material(new pc.Color(0.20, 0.52, 0.76), 0.35, 0.1);
  private jacketTrim = material(new pc.Color(0.94, 0.94, 0.94), 0.3);
  private capMat = material(new pc.Color(0.88, 0.32, 0.24), 0.3);
  private goldMat = material(new pc.Color(0.92, 0.76, 0.28), 0.8, 0.6);
  private pantsMat = material(new pc.Color(0.24, 0.30, 0.38), 0.25);
  private leatherMat = material(new pc.Color(0.44, 0.26, 0.16), 0.3);
  private bedrollMat = material(new pc.Color(0.72, 0.68, 0.48), 0.2);
  private eyeMat = material(new pc.Color(0.10, 0.10, 0.12), 0.85, 0.1);
  private eyeWhite = material(new pc.Color(0.98, 0.98, 0.98), 0.5);
  private blushMat = material(new pc.Color(0.95, 0.45, 0.45), 0.35);
  private sneakerSole = material(new pc.Color(0.96, 0.96, 0.96), 0.4);

  // Role Materials
  private fireYellow = material(new pc.Color(0.95, 0.75, 0.15), 0.35);
  private fireRed = material(new pc.Color(0.85, 0.20, 0.18), 0.35);
  private policeNavy = material(new pc.Color(0.16, 0.24, 0.42), 0.35);
  private baristaApron = material(new pc.Color(0.35, 0.22, 0.14), 0.25);
  private baristaWhite = material(new pc.Color(0.96, 0.96, 0.94), 0.3);

  constructor(private readonly app: pc.Application) {
    app.root.addChild(this.root);

    this.root.addChild(this.bodyRoot);
    this.bodyRoot.setPosition(0, 0.95, 0);

    // Torso Base
    primitive(app, 'JacketBody', 'capsule', this.jacketMat, new pc.Vec3(0, 0.36, 0), new pc.Vec3(0.68, 0.82, 0.54), this.bodyRoot);
    primitive(app, 'JacketZipper', 'box', this.jacketTrim, new pc.Vec3(0, 0.36, -0.27), new pc.Vec3(0.06, 0.72, 0.04), this.bodyRoot);
    primitive(app, 'JacketCollar', 'cylinder', this.jacketTrim, new pc.Vec3(0, 0.74, 0), new pc.Vec3(0.50, 0.10, 0.50), this.bodyRoot);

    primitive(app, 'Belt', 'cylinder', this.leatherMat, new pc.Vec3(0, 0.05, 0), new pc.Vec3(0.70, 0.10, 0.56), this.bodyRoot);
    primitive(app, 'BeltBuckle', 'box', this.goldMat, new pc.Vec3(0, 0.05, -0.29), new pc.Vec3(0.14, 0.12, 0.05), this.bodyRoot);

    // Backpack (Back = +Z)
    this.bodyRoot.addChild(this.backpack);
    this.backpack.setLocalPosition(0, 0.42, 0.34);
    primitive(app, 'PackBag', 'box', this.leatherMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.50, 0.56, 0.30), this.backpack);
    primitive(app, 'PackBedroll', 'cylinder', this.bedrollMat, new pc.Vec3(0, 0.34, 0), new pc.Vec3(0.22, 0.62, 0.22), this.backpack)
      .setLocalEulerAngles(0, 0, 90);

    // Head root
    this.bodyRoot.addChild(this.headRoot);
    this.headRoot.setLocalPosition(0, 0.95, 0);
    primitive(app, 'HeadSphere', 'sphere', this.skinMat, new pc.Vec3(0, 0.28, 0), new pc.Vec3(0.70, 0.72, 0.70), this.headRoot);

    // Cute Hair Bangs (Front = -Z)
    const bangs = [
      { x: -0.22, z: -0.24, rot: -15 },
      { x: 0.22, z: -0.24, rot: 15 },
      { x: 0, z: -0.32, rot: 0 }
    ];
    for (const b of bangs) {
      primitive(app, 'HairTuft', 'sphere', this.hairMat, new pc.Vec3(b.x, 0.45, b.z), new pc.Vec3(0.24, 0.16, 0.20), this.headRoot)
        .setLocalEulerAngles(0, 0, b.rot);
    }

    // Hat Root
    this.headRoot.addChild(this.hatRoot);
    this.buildHat('explorer');

    // Eyes & Blush (Front = -Z)
    for (const side of [-1, 1]) {
      const eyeX = side * 0.16;
      primitive(app, 'EyeWhite', 'sphere', this.eyeWhite, new pc.Vec3(eyeX, 0.28, -0.31), new pc.Vec3(0.12, 0.15, 0.08), this.headRoot);
      primitive(app, 'EyePupil', 'sphere', this.eyeMat, new pc.Vec3(eyeX, 0.28, -0.34), new pc.Vec3(0.08, 0.11, 0.05), this.headRoot);
      primitive(app, 'EyeHighlight', 'sphere', this.eyeWhite, new pc.Vec3(eyeX + 0.02, 0.31, -0.36), new pc.Vec3(0.035, 0.035, 0.035), this.headRoot);
      primitive(app, 'CheekBlush', 'sphere', this.blushMat, new pc.Vec3(side * 0.23, 0.18, -0.29), new pc.Vec3(0.13, 0.06, 0.06), this.headRoot);
    }

    // Legs
    this.root.addChild(this.legL);
    this.root.addChild(this.legR);
    this.legL.setPosition(-0.19, 0.85, 0);
    this.legR.setPosition(0.19, 0.85, 0);

    primitive(app, 'LegL_Pants', 'capsule', this.pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legL);
    primitive(app, 'LegL_Sneaker', 'box', this.leatherMat, new pc.Vec3(0, -0.74, -0.06), new pc.Vec3(0.28, 0.20, 0.44), this.legL);
    primitive(app, 'LegL_Sole', 'box', this.sneakerSole, new pc.Vec3(0, -0.84, -0.06), new pc.Vec3(0.30, 0.06, 0.46), this.legL);

    primitive(app, 'LegR_Pants', 'capsule', this.pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.28, 0.68, 0.28), this.legR);
    primitive(app, 'LegR_Sneaker', 'box', this.leatherMat, new pc.Vec3(0, -0.74, -0.06), new pc.Vec3(0.28, 0.20, 0.44), this.legR);
    primitive(app, 'LegR_Sole', 'box', this.sneakerSole, new pc.Vec3(0, -0.84, -0.06), new pc.Vec3(0.30, 0.06, 0.46), this.legR);

    // Arms
    this.bodyRoot.addChild(this.armL);
    this.bodyRoot.addChild(this.armR);
    this.armL.setLocalPosition(-0.42, 0.62, 0);
    this.armR.setLocalPosition(0.42, 0.62, 0);

    primitive(app, 'ArmL_Sleeve', 'capsule', this.jacketMat, new pc.Vec3(0, -0.32, 0), new pc.Vec3(0.22, 0.62, 0.22), this.armL);
    primitive(app, 'ArmL_Hand', 'sphere', this.skinMat, new pc.Vec3(0, -0.66, 0), new pc.Vec3(0.18, 0.18, 0.18), this.armL);

    primitive(app, 'ArmR_Sleeve', 'capsule', this.jacketMat, new pc.Vec3(0, -0.32, 0), new pc.Vec3(0.22, 0.62, 0.22), this.armR);
    primitive(app, 'ArmR_Hand', 'sphere', this.skinMat, new pc.Vec3(0, -0.66, 0), new pc.Vec3(0.18, 0.18, 0.18), this.armR);

    this.handProps = new HandProps(app, this.armR);
  }

  setRole(role: PlayerRole) {
    this.currentRole = role;
    this.buildHat(role);

    if (role === 'firefighter') {
      this.backpack.enabled = false;
      this.setProp('waterhose');
    } else if (role === 'barista') {
      this.backpack.enabled = false;
      this.setProp('coffee');
    } else if (role === 'police') {
      this.backpack.enabled = false;
      this.setProp('flashlight');
    } else {
      this.backpack.enabled = true;
      this.setProp('none');
    }
  }

  get role(): PlayerRole {
    return this.currentRole;
  }

  playEmote(emote: PlayerEmote, duration = 3.5) {
    this.currentEmote = emote;
    this.emoteTimer = duration;
  }

  get activeEmote(): PlayerEmote {
    return this.currentEmote;
  }

  private buildHat(role: PlayerRole) {
    while (this.hatRoot.children.length > 0) {
      const child = this.hatRoot.children[0]!;
      child.destroy();
    }

    if (role === 'explorer') {
      primitive(this.app, 'CapCrown', 'sphere', this.capMat, new pc.Vec3(0, 0.52, 0.04), new pc.Vec3(0.74, 0.42, 0.74), this.hatRoot);
      primitive(this.app, 'CapBrim', 'cylinder', this.capMat, new pc.Vec3(0, 0.42, -0.28), new pc.Vec3(0.68, 0.05, 0.44), this.hatRoot)
        .setLocalEulerAngles(-12, 0, 0);
      primitive(this.app, 'CapBadge', 'cylinder', this.goldMat, new pc.Vec3(0, 0.54, -0.32), new pc.Vec3(0.12, 0.04, 0.12), this.hatRoot)
        .setLocalEulerAngles(90, 0, 0);
    } else if (role === 'firefighter') {
      primitive(this.app, 'FireHelmet', 'sphere', this.fireRed, new pc.Vec3(0, 0.56, 0), new pc.Vec3(0.82, 0.52, 0.82), this.hatRoot);
      primitive(this.app, 'FireShield', 'cylinder', this.goldMat, new pc.Vec3(0, 0.60, -0.36), new pc.Vec3(0.18, 0.04, 0.18), this.hatRoot)
        .setLocalEulerAngles(90, 0, 0);
      primitive(this.app, 'FireBrim', 'cylinder', this.fireRed, new pc.Vec3(0, 0.46, 0.1), new pc.Vec3(0.88, 0.06, 0.95), this.hatRoot);
    } else if (role === 'police') {
      primitive(this.app, 'PoliceCap', 'cylinder', this.policeNavy, new pc.Vec3(0, 0.52, 0), new pc.Vec3(0.76, 0.26, 0.76), this.hatRoot);
      primitive(this.app, 'PolicePeak', 'box', this.leatherMat, new pc.Vec3(0, 0.42, -0.28), new pc.Vec3(0.62, 0.04, 0.35), this.hatRoot)
        .setLocalEulerAngles(15, 0, 0);
      primitive(this.app, 'PoliceStar', 'cylinder', this.goldMat, new pc.Vec3(0, 0.56, -0.34), new pc.Vec3(0.12, 0.03, 0.12), this.hatRoot)
        .setLocalEulerAngles(90, 0, 0);
    } else if (role === 'barista') {
      primitive(this.app, 'BaristaBeret', 'sphere', this.baristaApron, new pc.Vec3(0, 0.52, 0.04), new pc.Vec3(0.72, 0.28, 0.72), this.hatRoot);
    }
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

    // Emote Timer Countdown
    if (this.currentEmote !== 'none') {
      this.emoteTimer -= dt;
      if (this.emoteTimer <= 0 || isMoving || mode !== 'grounded') {
        this.currentEmote = 'none';
      }
    }

    if (mode === 'car') {
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
      this.bodyRoot.setLocalPosition(0, 0.95, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, 0);
      this.headRoot.setLocalEulerAngles(0, 0, 0);

      this.legL.setLocalPosition(-0.19, 0.85, 0);
      this.legR.setLocalPosition(0.19, 0.85, 0);
      this.legL.setLocalEulerAngles(-28, 0, 0);
      this.legR.setLocalEulerAngles(18, 0, 0);

      this.armL.setLocalEulerAngles(-110, -15, 0);
      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(-110, 15, 0);
      }
      return;
    }

    // Active Emote Animations
    if (this.currentEmote === 'wave') {
      const waveAngle = Math.sin(performance.now() * 0.008) * 35 - 130;
      this.armR.setLocalEulerAngles(waveAngle, -15, 0);
      this.armL.setLocalEulerAngles(0, 0, 0);
      this.headRoot.setLocalEulerAngles(0, Math.sin(performance.now() * 0.005) * 12, 0);
      return;
    } else if (this.currentEmote === 'dance') {
      const now = performance.now() * 0.006;
      const hipSway = Math.sin(now) * 18;
      this.bodyRoot.setLocalPosition(Math.sin(now) * 0.12, 0.95 + Math.abs(Math.sin(now * 2)) * 0.08, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, hipSway);
      this.armL.setLocalEulerAngles(Math.sin(now) * 55 - 45, 0, 0);
      this.armR.setLocalEulerAngles(-Math.sin(now) * 55 - 45, 0, 0);
      return;
    } else if (this.currentEmote === 'cheer') {
      const jumpY = Math.abs(Math.sin(performance.now() * 0.008)) * 0.25;
      this.bodyRoot.setLocalPosition(0, 0.95 + jumpY, 0);
      this.armL.setLocalEulerAngles(-145, -20, 0);
      this.armR.setLocalEulerAngles(-145, 20, 0);
      return;
    } else if (this.currentEmote === 'sit') {
      this.bodyRoot.setLocalPosition(0, 0.45, 0);
      this.legL.setLocalPosition(-0.19, 0.45, 0.2);
      this.legR.setLocalPosition(0.19, 0.45, 0.2);
      this.legL.setLocalEulerAngles(-80, 0, 0);
      this.legR.setLocalEulerAngles(-80, 0, 0);
      this.armL.setLocalEulerAngles(-30, 0, 0);
      this.armR.setLocalEulerAngles(-30, 0, 0);
      return;
    }

    // Standard Grounded Walk/Run
    this.bodyRoot.setLocalPosition(0, 0.95, 0);
    this.legL.setLocalPosition(-0.19, 0.85, 0);
    this.legR.setLocalPosition(0.19, 0.85, 0);

    if (isMoving) {
      this.walkCycle += dt * speed * 3.6;

      const legAngleL = Math.sin(this.walkCycle) * 36;
      const legAngleR = -Math.sin(this.walkCycle) * 36;
      this.legL.setLocalEulerAngles(legAngleL, 0, 0);
      this.legR.setLocalEulerAngles(legAngleR, 0, 0);

      const armAngleL = -Math.sin(this.walkCycle) * 32;
      this.armL.setLocalEulerAngles(armAngleL, 0, 0);

      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        const armAngleR = Math.sin(this.walkCycle) * 32;
        this.armR.setLocalEulerAngles(armAngleR, 0, 0);
      }

      const bobY = Math.abs(Math.sin(this.walkCycle)) * 0.07;
      const swayZ = Math.sin(this.walkCycle * 0.5) * 3.5;
      this.bodyRoot.setLocalPosition(0, 0.95 + bobY, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, swayZ);

      // Footstep Sound Trigger
      const stepPhase = Math.sin(this.walkCycle);
      if ((this.lastStepPhase <= 0 && stepPhase > 0) || (this.lastStepPhase >= 0 && stepPhase < 0)) {
        if (!this.isStepping) {
          this.isStepping = true;
          this.onStep?.('grass');
        }
      } else {
        this.isStepping = false;
      }
      this.lastStepPhase = stepPhase;
    } else {
      this.walkCycle = 0;
      this.legL.setLocalEulerAngles(0, 0, 0);
      this.legR.setLocalEulerAngles(0, 0, 0);
      this.armL.setLocalEulerAngles(0, 0, 0);

      if (holdingProp) {
        this.armR.setLocalEulerAngles(-48, -12, 0);
      } else {
        this.armR.setLocalEulerAngles(0, 0, 0);
      }

      // Idle breathing
      const breath = Math.sin(performance.now() * 0.0025) * 0.015;
      this.bodyRoot.setLocalPosition(0, 0.95 + breath, 0);
      this.bodyRoot.setLocalEulerAngles(0, 0, 0);
    }
  }
}
