import * as pc from 'playcanvas';
import { material, primitive } from './meshFactory';
import { QualityScenery } from './QualityScenery';

export type Particle = {
  entity: pc.Entity;
  basePos: pc.Vec3;
  life: number;
  maxLife: number;
  velocity: pc.Vec3;
  initialScale: number;
};

export class Atmosphere {
  private clouds: pc.Entity[] = [];
  private smokeParticles: Particle[] = [];
  private fountainParticles: Particle[] = [];
  private interactionMarker: pc.Entity;
  private cloudMat = material(new pc.Color(0.98, 0.98, 1.0), 0.05, 0, 0.88);
  private smokeMat = material(new pc.Color(0.92, 0.92, 0.94), 0.05, 0, 0.45);
  private waterDropMat = material(new pc.Color(0.65, 0.88, 0.98), 0.9, 0.1, 0.75);
  private markerMat = material(new pc.Color(1.0, 0.84, 0.28), 0.5, 0, 0.95, new pc.Color(0.6, 0.45, 0.1));

  constructor(private readonly app: pc.Application) {
    app.scene.fog.type = pc.FOG_LINEAR;
    app.scene.fog.color = new pc.Color(0.76, 0.88, 0.98);
    app.scene.fog.start = 45;
    app.scene.fog.end = 240;

    new QualityScenery(app).build();
    this.spawnClouds();
    this.interactionMarker = this.createInteractionMarker();
  }

  private spawnClouds() {
    const cloudRoot = new pc.Entity('CloudSystem');
    this.app.root.addChild(cloudRoot);

    const cloudDefs = [
      { x: -45, y: 52, z: -35, scale: 1.4 },
      { x: 20, y: 56, z: -40, scale: 1.8 },
      { x: -25, y: 58, z: 30, scale: 1.5 },
      { x: 45, y: 54, z: 25, scale: 1.6 },
      { x: -60, y: 50, z: 15, scale: 1.3 },
      { x: 10, y: 60, z: -10, scale: 1.7 },
      { x: 60, y: 55, z: -25, scale: 1.5 }
    ];

    for (const def of cloudDefs) {
      const cloud = new pc.Entity('FluffyCloud');
      cloud.setPosition(def.x, def.y, def.z);
      cloudRoot.addChild(cloud);

      const puffs = [
        { ox: 0, oy: 0, oz: 0, sx: 7, sy: 3.5, sz: 5 },
        { ox: -3.2, oy: -0.6, oz: 0.5, sx: 5, sy: 3.0, sz: 4 },
        { ox: 3.5, oy: -0.4, oz: -0.5, sx: 5.5, sy: 3.2, sz: 4.2 },
        { ox: 1.2, oy: 1.2, oz: 0.2, sx: 4.5, sy: 3.0, sz: 3.8 },
        { ox: -1.8, oy: 0.8, oz: -0.8, sx: 4.2, sy: 2.8, sz: 3.6 }
      ];

      for (const p of puffs) {
        primitive(
          this.app,
          'CloudPuff',
          'sphere',
          this.cloudMat,
          new pc.Vec3(p.ox * def.scale, p.oy * def.scale, p.oz * def.scale),
          new pc.Vec3(p.sx * def.scale, p.sy * def.scale, p.sz * def.scale),
          cloud
        );
      }
      this.clouds.push(cloud);
    }
  }

  private createInteractionMarker(): pc.Entity {
    const marker = new pc.Entity('InteractionMarker');
    primitive(this.app, 'MarkerDiamond', 'box', this.markerMat, new pc.Vec3(0, 0, 0), new pc.Vec3(0.5, 0.5, 0.5), marker);
    marker.setLocalEulerAngles(45, 45, 45);
    marker.enabled = false;
    this.app.root.addChild(marker);
    return marker;
  }

  setInteractionTarget(pos: { x: number; y: number; z: number } | null, time: number) {
    if (!pos) {
      this.interactionMarker.enabled = false;
      return;
    }
    this.interactionMarker.enabled = true;
    const bob = Math.sin(time * 4) * 0.18;
    this.interactionMarker.setPosition(pos.x, pos.y + 2.2 + bob, pos.z);
    this.interactionMarker.setEulerAngles(45 + time * 60, 45 + time * 80, 0);
  }

  addChimneySmoke(emitterPos: pc.Vec3) {
    if (this.smokeParticles.length > 20) return;
    const entity = primitive(this.app, 'SmokePuff', 'sphere', this.smokeMat, emitterPos, new pc.Vec3(0.4, 0.4, 0.4));
    this.smokeParticles.push({
      entity,
      basePos: emitterPos.clone(),
      life: 0,
      maxLife: 3.2,
      velocity: new pc.Vec3((Math.random() - 0.5) * 0.3 + 0.2, 0.9 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3),
      initialScale: 0.4 + Math.random() * 0.2
    });
  }

  addFountainSpray(fountainPos: pc.Vec3) {
    if (this.fountainParticles.length > 15) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 0.4;
    const entity = primitive(
      this.app,
      'WaterDrop',
      'sphere',
      this.waterDropMat,
      new pc.Vec3(fountainPos.x, fountainPos.y + 1.2, fountainPos.z),
      new pc.Vec3(0.18, 0.18, 0.18)
    );
    this.fountainParticles.push({
      entity,
      basePos: new pc.Vec3(fountainPos.x, fountainPos.y + 1.2, fountainPos.z),
      life: 0,
      maxLife: 1.1,
      velocity: new pc.Vec3(Math.cos(angle) * speed, 2.2 + Math.random() * 0.6, Math.sin(angle) * speed),
      initialScale: 0.18
    });
  }

  update(dt: number, time: number, chimneyEmitters: pc.Vec3[], fountainEmitter?: pc.Vec3) {
    const windSpeed = 1.2;
    for (const cloud of this.clouds) {
      const pos = cloud.getPosition();
      let nx = pos.x + windSpeed * dt;
      if (nx > 95) nx = -95;
      cloud.setPosition(nx, pos.y + Math.sin(time * 0.4 + pos.z) * 0.02, pos.z);
    }

    if (Math.random() < 0.25) {
      for (const emitter of chimneyEmitters) this.addChimneySmoke(emitter);
    }

    if (fountainEmitter && Math.random() < 0.6) this.addFountainSpray(fountainEmitter);

    for (let i = this.smokeParticles.length - 1; i >= 0; i -= 1) {
      const p = this.smokeParticles[i]!;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.entity.destroy();
        this.smokeParticles.splice(i, 1);
        continue;
      }
      const progress = p.life / p.maxLife;
      const curPos = p.entity.getPosition();
      curPos.add(new pc.Vec3(p.velocity.x * dt, p.velocity.y * dt, p.velocity.z * dt));
      p.entity.setPosition(curPos);
      const scale = p.initialScale * (1 + progress * 2.8);
      p.entity.setLocalScale(scale, scale, scale);
    }

    for (let i = this.fountainParticles.length - 1; i >= 0; i -= 1) {
      const p = this.fountainParticles[i]!;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.entity.destroy();
        this.fountainParticles.splice(i, 1);
        continue;
      }
      p.velocity.y -= 5.5 * dt;
      const curPos = p.entity.getPosition();
      curPos.add(new pc.Vec3(p.velocity.x * dt, p.velocity.y * dt, p.velocity.z * dt));
      p.entity.setPosition(curPos);
    }
  }
}
