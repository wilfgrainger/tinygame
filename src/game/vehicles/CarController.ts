import type { Vec3 } from '../../shared/world';
import type { InputFrame } from '../input/InputState';
import type { CollisionWorld } from '../player/CollisionWorld';

export type CarSnapshot = {
  position: Vec3;
  yaw: number;
  mounted: boolean;
  speed: number;
  steerAngle: number;
};

export class CarController {
  readonly maxSpeed = 12.5;
  readonly maxReverseSpeed = 5.0;
  private state: CarSnapshot;
  private readonly spawn: Vec3;

  constructor(spawn: Vec3, private readonly collision: CollisionWorld) {
    this.spawn = { ...spawn };
    this.state = {
      position: { ...spawn },
      yaw: 0,
      mounted: false,
      speed: 0,
      steerAngle: 0
    };
  }

  get snapshot(): CarSnapshot {
    return { ...this.state, position: { ...this.state.position } };
  }

  canMount(player: Vec3): boolean {
    return Math.hypot(player.x - this.state.position.x, player.z - this.state.position.z) <= 3.8;
  }

  mount(player: Vec3): boolean {
    if (!this.canMount(player) || this.state.mounted) return false;
    this.state.mounted = true;
    return true;
  }

  update(dt: number, input: InputFrame): CarSnapshot {
    if (!this.state.mounted) return this.snapshot;

    const throttle = Math.max(-1, Math.min(1, input.moveY));
    const targetSpeed = throttle >= 0 ? throttle * this.maxSpeed : throttle * this.maxReverseSpeed;
    const accel = throttle >= 0 ? 5.5 : 4.0;
    this.state.speed += (targetSpeed - this.state.speed) * Math.min(1, dt * accel);

    const targetSteer = -input.moveX * 32;
    this.state.steerAngle += (targetSteer - this.state.steerAngle) * Math.min(1, dt * 10);

    if (Math.abs(this.state.speed) > 0.2) {
      const turnSign = this.state.speed >= 0 ? 1 : -1;
      const turnRate = (this.state.steerAngle * Math.PI / 180) * 1.6 * turnSign;
      this.state.yaw -= turnRate * dt;
    }

    const delta = {
      x: -Math.sin(this.state.yaw) * this.state.speed * dt,
      y: 0,
      z: -Math.cos(this.state.yaw) * this.state.speed * dt
    };

    this.state.position = this.collision.resolveMove(this.state.position, delta, 1.4, {
      maxStepHeight: 0.4,
      maxSlopeDegrees: 28
    });
    return this.snapshot;
  }

  dismount(): Vec3 | null {
    if (!this.state.mounted) return null;
    const side = 2.2;
    const candidates = [
      { x: this.state.position.x - Math.cos(this.state.yaw) * side, z: this.state.position.z + Math.sin(this.state.yaw) * side },
      { x: this.state.position.x + Math.cos(this.state.yaw) * side, z: this.state.position.z - Math.sin(this.state.yaw) * side }
    ];
    const chosen = candidates.find((p) => this.collision.isFree(p.x, p.z, 0.55));
    if (!chosen) return null;
    this.state.mounted = false;
    this.state.speed = 0;
    return { x: chosen.x, y: this.collision.heightAt(chosen.x, chosen.z), z: chosen.z };
  }

  teleport(position: Vec3, yaw = 0) {
    this.state = { position: { ...position }, yaw, mounted: false, speed: 0, steerAngle: 0 };
  }

  reset() {
    this.state = { position: { ...this.spawn }, yaw: 0, mounted: false, speed: 0, steerAngle: 0 };
  }
}
