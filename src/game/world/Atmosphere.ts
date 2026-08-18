import * as pc from 'playcanvas';
import { material, primitive } from './meshFactory';
import { FixedPool } from './particlePool';
import { QualityScenery } from './QualityScenery';

export type Particle = {
  entity: pc.Entity;
  life: number;
  maxLife: number;
  velocity: pc.Vec3;
  initialScale: number;
};

export class Atmosphere {
  private clouds: pc.Entity[] = [];
  private readonly smokePool: FixedPool<Particle>;
  private readonly fountainPool: FixedPool<Particle>;
  private interactionMarker: pc.Entity;
  private smokeSpawnCooldown = 0;
  private fountainSpawnCooldown = 0;
  private chimneyCursor = 0;
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
    this.smokePool = new FixedPool(18, (index) => this.createPooledParticle(`SmokePuff${index}`, this.smokeMat, 0.4));
    this.fountainPool = new FixedPool(12, (index) => this.createPooledParticle(`WaterDrop${index}`, this.waterDropMat, 0.18));
  }

  private createPooledParticle(name: string, mat: pc.Material, scale: number): Particle {
    const entity = primitive(
      this.app,
      name,
      'sphere',
      mat,
      new pc.Vec3(0, -1000, 0),
      new pc.Vec3(scale, scale, scale)
    );
    entity.enabled = false;
    return { entity, life: 0, maxLife: 1, velocity: new pc.Vec3(), initialScale: scale };
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
    const particle = this.smokePool.acquire();
    if (!particle) return;
    particle.life = 0;
    particle.maxLife = 3.2;
    particle.initialScale = 0.4 + Math.random() * 0.2;
    particle.velocity.set(
      (Math.random() - 0.5) * 0.3 + 0.2,
      0.9 + Math.random() * 0.4,
      (Math.random() - 0.5) * 0.3
    );
    particle.entity.setPosition(emitterPos.x, emitterPos.y, emitterPos.z);
    particle.entity.setLocalScale(particle.initialScale, particle.initialScale, particle.initialScale);
    particle.entity.enabled = true;
  }

  addFountainSpray(fountainPos: pc.Vec3) {
    const particle = this.fountainPool.acquire();
    if (!particle) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 0.4;
    particle.life = 0;
    particle.maxLife = 1.1;
    particle.initialScale = 0.18;
    particle.velocity.set(Math.cos(angle) * speed, 2.2 + Math.random() * 0.6, Math.sin(angle) * speed);
    particle.entity.setPosition(fountainPos.x, fountainPos.y + 1.2, fountainPos.z);
    particle.entity.setLocalScale(0.18, 0.18, 0.18);
    particle.entity.enabled = true;
  }

  private releaseParticle(pool: FixedPool<Particle>, particle: Particle) {
    particle.entity.enabled = false;
    particle.life = 0;
    pool.release(particle);
  }

  update(dt: number, time: number, chimneyEmitters: pc.Vec3[], fountainEmitter?: pc.Vec3) {
    const windSpeed = 1.2;
    for (const cloud of this.clouds) {
      const pos = cloud.getPosition();
      let nx = pos.x + windSpeed * dt;
      if (nx > 95) nx = -95;
      cloud.setPosition(nx, pos.y + Math.sin(time * 0.4 + pos.z) * 0.02, pos.z);
    }

    this.smokeSpawnCooldown -= dt;
    if (chimneyEmitters.length > 0 && this.smokeSpawnCooldown <= 0) {
      const emitter = chimneyEmitters[this.chimneyCursor % chimneyEmitters.length]!;
      this.chimneyCursor += 1;
      this.addChimneySmoke(emitter);
      this.smokeSpawnCooldown = 0.22;
    }

    this.fountainSpawnCooldown -= dt;
    if (fountainEmitter && this.fountainSpawnCooldown <= 0) {
      this.addFountainSpray(fountainEmitter);
      this.fountainSpawnCooldown = 0.12;
    }

    for (const particle of this.smokePool.items) {
      if (!this.smokePool.isActive(particle)) continue;
      particle.life += dt;
      if (particle.life >= particle.maxLife) {
        this.releaseParticle(this.smokePool, particle);
        continue;
      }
      const progress = particle.life / particle.maxLife;
      const pos = particle.entity.getPosition();
      particle.entity.setPosition(
        pos.x + particle.velocity.x * dt,
        pos.y + particle.velocity.y * dt,
        pos.z + particle.velocity.z * dt
      );
      const scale = particle.initialScale * (1 + progress * 2.8);
      particle.entity.setLocalScale(scale, scale, scale);
    }

    for (const particle of this.fountainPool.items) {
      if (!this.fountainPool.isActive(particle)) continue;
      particle.life += dt;
      if (particle.life >= particle.maxLife) {
        this.releaseParticle(this.fountainPool, particle);
        continue;
      }
      particle.velocity.y -= 5.5 * dt;
      const pos = particle.entity.getPosition();
      particle.entity.setPosition(
        pos.x + particle.velocity.x * dt,
        pos.y + particle.velocity.y * dt,
        pos.z + particle.velocity.z * dt
      );
    }
  }
}
