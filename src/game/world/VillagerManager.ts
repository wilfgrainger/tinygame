import * as pc from 'playcanvas';
import { material, primitive } from './meshFactory';
import type { Vec3 } from '../../shared/world';

export interface VillagerDefinition {
  id: string;
  name: string;
  role: string;
  position: Vec3;
  yaw: number;
  dialogue: string[];
  skinTone: pc.Color;
  hairColor: pc.Color;
  shirtColor: pc.Color;
  pantsColor: pc.Color;
  hatType: 'none' | 'straw' | 'police' | 'barista' | 'tophat';
  hatColor: pc.Color;
  toolType: 'pitcher' | 'scanner' | 'wateringCan' | 'flashlight' | 'none';
  workAnimation: 'barista' | 'shopkeeper' | 'mayor' | 'gardener' | 'police';
}

export const VILLAGERS: VillagerDefinition[] = [
  {
    id: 'barista-bruno',
    name: 'Bruno',
    role: 'Cafe Barista',
    position: { x: 28.5, y: 0.4, z: -20.5 },
    yaw: Math.PI,
    dialogue: ['Welcome to Bean & Berry! ☕', 'Freshly roasted hazelnut latte today!', 'Need a warm drink for your walk?'],
    skinTone: new pc.Color(0.85, 0.62, 0.48),
    hairColor: new pc.Color(0.18, 0.12, 0.08),
    shirtColor: new pc.Color(0.92, 0.90, 0.85),
    pantsColor: new pc.Color(0.24, 0.20, 0.16),
    hatType: 'barista',
    hatColor: new pc.Color(0.35, 0.22, 0.14),
    toolType: 'pitcher',
    workAnimation: 'barista'
  },
  {
    id: 'shopkeeper-sarah',
    name: 'Sarah',
    role: 'Market Manager',
    position: { x: -27.5, y: 0.4, z: -21.0 },
    yaw: Math.PI,
    dialogue: ['Welcome to Fresh Mart! 🛒', 'Crisp red apples just arrived from the orchard!', 'Scan your items at the counter!'],
    skinTone: new pc.Color(0.96, 0.80, 0.68),
    hairColor: new pc.Color(0.75, 0.35, 0.15),
    shirtColor: new pc.Color(0.25, 0.65, 0.35),
    pantsColor: new pc.Color(0.22, 0.28, 0.36),
    hatType: 'none',
    hatColor: new pc.Color(0.2, 0.2, 0.2),
    toolType: 'scanner',
    workAnimation: 'shopkeeper'
  },
  {
    id: 'mayor-sterling',
    name: 'Mayor Sterling',
    role: 'Town Mayor',
    position: { x: -28.0, y: 0.4, z: 21.0 },
    yaw: 0,
    dialogue: ['Greetings, citizen! 🏛️', 'TinyWorld is thriving today!', 'Be sure to visit our mountain trails!'],
    skinTone: new pc.Color(0.94, 0.76, 0.65),
    hairColor: new pc.Color(0.82, 0.82, 0.85),
    shirtColor: new pc.Color(0.16, 0.22, 0.36),
    pantsColor: new pc.Color(0.14, 0.18, 0.28),
    hatType: 'tophat',
    hatColor: new pc.Color(0.12, 0.14, 0.18),
    toolType: 'none',
    workAnimation: 'mayor'
  },
  {
    id: 'gardener-gary',
    name: 'Gary',
    role: 'Park Botanist',
    position: { x: 6.5, y: 0.4, z: 4.5 },
    yaw: 0.8,
    dialogue: ['The tulips are blooming beautifully! 🌻', 'A little water every morning does wonders.', 'Enjoy the town square fragrance!'],
    skinTone: new pc.Color(0.92, 0.74, 0.60),
    hairColor: new pc.Color(0.38, 0.25, 0.15),
    shirtColor: new pc.Color(0.85, 0.75, 0.35),
    pantsColor: new pc.Color(0.25, 0.40, 0.65),
    hatType: 'straw',
    hatColor: new pc.Color(0.92, 0.82, 0.50),
    toolType: 'wateringCan',
    workAnimation: 'gardener'
  },
  {
    id: 'officer-ollie',
    name: 'Officer Ollie',
    role: 'Town Safety Patrol',
    position: { x: 12.5, y: 0.4, z: -6.0 },
    yaw: -Math.PI / 2,
    dialogue: ['Patrol check: all clear! 👮', 'Drive safely around the fountain circle!', 'Have a wonderful day in TinyWorld.'],
    skinTone: new pc.Color(0.88, 0.68, 0.55),
    hairColor: new pc.Color(0.12, 0.12, 0.12),
    shirtColor: new pc.Color(0.20, 0.38, 0.65),
    pantsColor: new pc.Color(0.12, 0.16, 0.24),
    hatType: 'police',
    hatColor: new pc.Color(0.14, 0.24, 0.45),
    toolType: 'flashlight',
    workAnimation: 'police'
  }
];

export class VillagerManager {
  private readonly villagerRoots: { entity: pc.Entity; head: pc.Entity; armR: pc.Entity; armL: pc.Entity; def: VillagerDefinition }[] = [];
  private readonly app: pc.Application;
  private speechBubbleElement: HTMLElement | null = null;
  private currentSpokenVillager: string | null = null;

  constructor(app: pc.Application) {
    this.app = app;
    this.createSpeechBubble();
  }

  private createSpeechBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'npc-speech-bubble';
    bubble.hidden = true;
    document.getElementById('ui-root')?.appendChild(bubble);
    this.speechBubbleElement = bubble;
  }

  buildAll() {
    for (const def of VILLAGERS) {
      this.buildVillager(def);
    }
  }

  private buildVillager(def: VillagerDefinition) {
    const root = new pc.Entity(`Villager_${def.id}`);
    root.setPosition(def.position.x, def.position.y, def.position.z);
    root.setEulerAngles(0, (def.yaw * 180) / Math.PI, 0);
    this.app.root.addChild(root);

    const skinMat = material(def.skinTone, 0.3);
    const hairMat = material(def.hairColor, 0.25);
    const shirtMat = material(def.shirtColor, 0.3);
    const pantsMat = material(def.pantsColor, 0.25);
    const eyeMat = material(new pc.Color(0.1, 0.1, 0.12), 0.8);
    const eyeWhite = material(new pc.Color(0.98, 0.98, 0.98), 0.5);
    const goldMat = material(new pc.Color(0.95, 0.80, 0.25), 0.8, 0.5);
    const leatherMat = material(new pc.Color(0.42, 0.25, 0.15), 0.3);
    const hatMat = material(def.hatColor, 0.3);

    // Torso
    const bodyRoot = new pc.Entity('Body');
    bodyRoot.setPosition(0, 0.90, 0);
    root.addChild(bodyRoot);

    primitive(this.app, 'Torso', 'capsule', shirtMat, new pc.Vec3(0, 0.34, 0), new pc.Vec3(0.64, 0.78, 0.52), bodyRoot);

    // Apron or sash for specific roles
    if (def.workAnimation === 'barista' || def.workAnimation === 'shopkeeper') {
      const apronMat = material(new pc.Color(0.35, 0.22, 0.14), 0.25);
      primitive(this.app, 'ApronFront', 'box', apronMat, new pc.Vec3(0, 0.30, -0.27), new pc.Vec3(0.46, 0.65, 0.04), bodyRoot);
    } else if (def.workAnimation === 'mayor') {
      // Gold Sash
      primitive(this.app, 'Sash', 'box', goldMat, new pc.Vec3(0, 0.36, -0.27), new pc.Vec3(0.12, 0.72, 0.04), bodyRoot)
        .setLocalEulerAngles(0, 0, -25);
    } else if (def.workAnimation === 'police') {
      // Police Badge
      primitive(this.app, 'PoliceBadge', 'cylinder', goldMat, new pc.Vec3(-0.16, 0.52, -0.27), new pc.Vec3(0.10, 0.04, 0.10), bodyRoot)
        .setLocalEulerAngles(90, 0, 0);
    }

    // Legs & Shoes
    const legL = new pc.Entity('LegL');
    const legR = new pc.Entity('LegR');
    legL.setPosition(-0.18, 0.85, 0);
    legR.setPosition(0.18, 0.85, 0);
    root.addChild(legL);
    root.addChild(legR);

    primitive(this.app, 'PantsL', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.26, 0.68, 0.26), legL);
    primitive(this.app, 'ShoeL', 'box', leatherMat, new pc.Vec3(0, -0.74, -0.06), new pc.Vec3(0.26, 0.18, 0.42), legL);
    primitive(this.app, 'PantsR', 'capsule', pantsMat, new pc.Vec3(0, -0.42, 0), new pc.Vec3(0.26, 0.68, 0.26), legR);
    primitive(this.app, 'ShoeR', 'box', leatherMat, new pc.Vec3(0, -0.74, -0.06), new pc.Vec3(0.26, 0.18, 0.42), legR);

    // Head
    const headRoot = new pc.Entity('Head');
    headRoot.setPosition(0, 1.82, 0);
    root.addChild(headRoot);

    primitive(this.app, 'HeadSphere', 'sphere', skinMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.68, 0.70, 0.68), headRoot);

    // Hair
    primitive(this.app, 'HairBack', 'sphere', hairMat, new pc.Vec3(0, 0.12, 0.16), new pc.Vec3(0.72, 0.52, 0.68), headRoot);
    primitive(this.app, 'HairBangL', 'sphere', hairMat, new pc.Vec3(-0.20, 0.18, -0.24), new pc.Vec3(0.24, 0.20, 0.20), headRoot);
    primitive(this.app, 'HairBangR', 'sphere', hairMat, new pc.Vec3(0.20, 0.18, -0.24), new pc.Vec3(0.24, 0.20, 0.20), headRoot);

    // Eyes
    for (const side of [-1, 1]) {
      const eyeX = side * 0.16;
      primitive(this.app, 'EyeW', 'sphere', eyeWhite, new pc.Vec3(eyeX, 0, -0.30), new pc.Vec3(0.11, 0.14, 0.08), headRoot);
      primitive(this.app, 'EyeP', 'sphere', eyeMat, new pc.Vec3(eyeX, 0, -0.33), new pc.Vec3(0.07, 0.10, 0.04), headRoot);
    }

    // Hats
    if (def.hatType === 'straw') {
      primitive(this.app, 'StrawBrim', 'cylinder', hatMat, new pc.Vec3(0, 0.24, 0), new pc.Vec3(0.96, 0.05, 0.96), headRoot);
      primitive(this.app, 'StrawCrown', 'cylinder', hatMat, new pc.Vec3(0, 0.38, 0), new pc.Vec3(0.64, 0.26, 0.64), headRoot);
    } else if (def.hatType === 'police') {
      primitive(this.app, 'PoliceCrown', 'cylinder', hatMat, new pc.Vec3(0, 0.34, 0.02), new pc.Vec3(0.72, 0.22, 0.72), headRoot)
        .setLocalEulerAngles(-8, 0, 0);
      primitive(this.app, 'PolicePeak', 'box', leatherMat, new pc.Vec3(0, 0.22, -0.28), new pc.Vec3(0.56, 0.04, 0.34), headRoot)
        .setLocalEulerAngles(15, 0, 0);
      primitive(this.app, 'PoliceBadge', 'cylinder', goldMat, new pc.Vec3(0, 0.38, -0.32), new pc.Vec3(0.10, 0.03, 0.10), headRoot)
        .setLocalEulerAngles(90, 0, 0);
    } else if (def.hatType === 'barista') {
      primitive(this.app, 'BaristaCap', 'sphere', hatMat, new pc.Vec3(0, 0.32, 0.04), new pc.Vec3(0.68, 0.32, 0.68), headRoot);
    } else if (def.hatType === 'tophat') {
      primitive(this.app, 'TopHatBrim', 'cylinder', hatMat, new pc.Vec3(0, 0.26, 0), new pc.Vec3(0.85, 0.04, 0.85), headRoot);
      primitive(this.app, 'TopHatCrown', 'cylinder', hatMat, new pc.Vec3(0, 0.52, 0), new pc.Vec3(0.56, 0.48, 0.56), headRoot);
      primitive(this.app, 'TopHatBand', 'cylinder', goldMat, new pc.Vec3(0, 0.32, 0), new pc.Vec3(0.58, 0.08, 0.58), headRoot);
    }

    // Arms
    const armL = new pc.Entity('ArmL');
    const armR = new pc.Entity('ArmR');
    armL.setPosition(-0.40, 1.50, 0);
    armR.setPosition(0.40, 1.50, 0);
    root.addChild(armL);
    root.addChild(armR);

    primitive(this.app, 'SleeveL', 'capsule', shirtMat, new pc.Vec3(0, -0.30, 0), new pc.Vec3(0.20, 0.58, 0.20), armL);
    primitive(this.app, 'HandL', 'sphere', skinMat, new pc.Vec3(0, -0.62, 0), new pc.Vec3(0.16, 0.16, 0.16), armL);

    primitive(this.app, 'SleeveR', 'capsule', shirtMat, new pc.Vec3(0, -0.30, 0), new pc.Vec3(0.20, 0.58, 0.20), armR);
    primitive(this.app, 'HandR', 'sphere', skinMat, new pc.Vec3(0, -0.62, 0), new pc.Vec3(0.16, 0.16, 0.16), armR);

    // Held Tools
    if (def.toolType === 'wateringCan') {
      const metalMat = material(new pc.Color(0.35, 0.65, 0.55), 0.6, 0.4);
      const can = primitive(this.app, 'CanBody', 'cylinder', metalMat, new pc.Vec3(0, -0.65, -0.22), new pc.Vec3(0.26, 0.34, 0.26), armR);
      can.setLocalEulerAngles(0, 0, 0);
      primitive(this.app, 'CanSpout', 'cylinder', metalMat, new pc.Vec3(0, -0.55, -0.40), new pc.Vec3(0.08, 0.32, 0.08), armR)
        .setLocalEulerAngles(-45, 0, 0);
    } else if (def.toolType === 'pitcher') {
      const steelMat = material(new pc.Color(0.88, 0.88, 0.90), 0.8, 0.8);
      primitive(this.app, 'Pitcher', 'cylinder', steelMat, new pc.Vec3(0, -0.62, -0.20), new pc.Vec3(0.20, 0.30, 0.20), armR);
    } else if (def.toolType === 'scanner') {
      const darkMat = material(new pc.Color(0.2, 0.2, 0.2), 0.5);
      const beamMat = material(new pc.Color(1.0, 0.2, 0.2), 0.9, 0, 1.0, new pc.Color(1.0, 0.1, 0.1));
      primitive(this.app, 'ScannerBody', 'box', darkMat, new pc.Vec3(0, -0.62, -0.18), new pc.Vec3(0.14, 0.22, 0.28), armR)
        .setLocalEulerAngles(-30, 0, 0);
      primitive(this.app, 'ScannerLaser', 'cylinder', beamMat, new pc.Vec3(0, -0.68, -0.32), new pc.Vec3(0.03, 0.14, 0.03), armR)
        .setLocalEulerAngles(90, 0, 0);
    } else if (def.toolType === 'flashlight') {
      const torchMat = material(new pc.Color(0.2, 0.2, 0.25), 0.7);
      primitive(this.app, 'Torch', 'cylinder', torchMat, new pc.Vec3(0, -0.62, -0.16), new pc.Vec3(0.12, 0.38, 0.12), armR)
        .setLocalEulerAngles(-90, 0, 0);
    }

    this.villagerRoots.push({ entity: root, head: headRoot, armR, armL, def });
  }

  update(simTime: number, playerPos: Vec3) {
    let nearestVillager: VillagerDefinition | null = null;
    let minDistance = 3.6;

    for (const v of this.villagerRoots) {
      const dx = playerPos.x - v.def.position.x;
      const dz = playerPos.z - v.def.position.z;
      const dist = Math.hypot(dx, dz);

      // Work Animations
      if (v.def.workAnimation === 'barista') {
        const stir = Math.sin(simTime * 4.2) * 18;
        v.armR.setLocalEulerAngles(-45 + stir, stir * 0.5, 0);
        v.armL.setLocalEulerAngles(-30, 0, 0);
      } else if (v.def.workAnimation === 'shopkeeper') {
        const scan = Math.sin(simTime * 3.5) * 22;
        v.armR.setLocalEulerAngles(-50 + scan, 0, 0);
        v.armL.setLocalEulerAngles(-25, Math.cos(simTime * 2.5) * 15, 0);
      } else if (v.def.workAnimation === 'mayor') {
        const gesticulateR = Math.sin(simTime * 2.8) * 32;
        const gesticulateL = Math.cos(simTime * 2.2) * 28;
        v.armR.setLocalEulerAngles(-60 + gesticulateR, 20, 0);
        v.armL.setLocalEulerAngles(-60 + gesticulateL, -20, 0);
      } else if (v.def.workAnimation === 'gardener') {
        const pour = Math.sin(simTime * 3.0) * 25;
        v.armR.setLocalEulerAngles(-65 + pour, 0, 0);
        v.armL.setLocalEulerAngles(-20, 0, 0);
      } else if (v.def.workAnimation === 'police') {
        const point = Math.sin(simTime * 1.5) * 15;
        v.armR.setLocalEulerAngles(-45 + point, 0, 0);
        v.armL.setLocalEulerAngles(-15, 0, 0);
      }

      // Head Tracking when player is nearby
      if (dist < 6.0) {
        const lookAngle = Math.atan2(dx, dz) - v.def.yaw;
        const clampedYaw = Math.max(-0.9, Math.min(0.9, lookAngle));
        v.head.setLocalEulerAngles(0, (clampedYaw * 180) / Math.PI, 0);

        if (dist < minDistance) {
          minDistance = dist;
          nearestVillager = v.def;
        }
      } else {
        v.head.setLocalEulerAngles(0, 0, 0);
      }
    }

    // Display Speech Bubble for nearest NPC
    if (nearestVillager && this.speechBubbleElement) {
      if (this.currentSpokenVillager !== nearestVillager.id) {
        this.currentSpokenVillager = nearestVillager.id;
        const line = nearestVillager.dialogue[Math.floor(simTime * 0.25) % nearestVillager.dialogue.length]!;
        this.speechBubbleElement.innerHTML = `
          <div class="npc-name">${nearestVillager.name} <span class="npc-role">${nearestVillager.role}</span></div>
          <div class="npc-text">${line}</div>
        `;
        this.speechBubbleElement.hidden = false;
        this.speechBubbleElement.classList.add('pop');
      }
    } else if (this.speechBubbleElement && this.currentSpokenVillager !== null) {
      this.currentSpokenVillager = null;
      this.speechBubbleElement.hidden = true;
    }
  }
}
