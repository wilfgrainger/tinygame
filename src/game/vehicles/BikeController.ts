import type { Vec3 } from '../../shared/world';
import type { InputFrame } from '../input/InputState';
import type { CollisionWorld } from '../player/CollisionWorld';
import { steerResponse } from './vehicleFeel';

export type BikeSnapshot = { position: Vec3; yaw: number; mounted: boolean; speed: number; steerInput: number };

export class BikeController {
  readonly maxSpeed = 11;
  private state: BikeSnapshot;
  private readonly spawn: Vec3;

  constructor(spawn: Vec3, private readonly collision: CollisionWorld) {
    this.spawn = { ...spawn };
    this.state = { position: { ...spawn }, yaw: Math.PI, mounted: false, speed: 0, steerInput: 0 };
  }

  get snapshot() { return { ...this.state, position: { ...this.state.position } }; }
  canMount(player: Vec3) { return Math.hypot(player.x - this.state.position.x, player.z - this.state.position.z) <= 3.2; }
  mount(player: Vec3) { if (!this.canMount(player) || this.state.mounted) return false; this.state.mounted = true; return true; }

  update(dt: number, input: InputFrame) {
    if (!this.state.mounted) return this.snapshot;
    const throttle = Math.max(-0.35, Math.min(1, input.moveY));
    this.state.speed += (throttle * this.maxSpeed - this.state.speed) * Math.min(1, dt * 4);
    this.state.steerInput = Math.max(-1, Math.min(1, input.moveX));
    const speedRatio = Math.min(1, Math.abs(this.state.speed) / this.maxSpeed);
    const steer = steerResponse(this.state.steerInput, speedRatio, 0.55, 1.7);
    this.state.yaw -= steer * dt;
    const delta = {
      x: Math.sin(this.state.yaw) * this.state.speed * dt,
      y: 0,
      z: -Math.cos(this.state.yaw) * this.state.speed * dt
    };
    this.state.position = this.collision.resolveMove(this.state.position, delta, 0.9, {
      maxStepHeight: 0.55,
      maxSlopeDegrees: 34
    });
    return this.snapshot;
  }

  dismount() {
    if (!this.state.mounted) return null;
    const side = 1.5;
    const candidates = [
      { x: this.state.position.x + Math.cos(this.state.yaw) * side, z: this.state.position.z + Math.sin(this.state.yaw) * side },
      { x: this.state.position.x - Math.cos(this.state.yaw) * side, z: this.state.position.z - Math.sin(this.state.yaw) * side }
    ];
    const chosen = candidates.find((p) => this.collision.isFree(p.x, p.z, 0.55));
    if (!chosen) return null;
    this.state.mounted = false;
    this.state.speed = 0;
    this.state.steerInput = 0;
    return { x: chosen.x, y: this.collision.heightAt(chosen.x, chosen.z), z: chosen.z };
  }

  teleport(position: Vec3, yaw = Math.PI) {
    this.state = { position: { ...position }, yaw, mounted: false, speed: 0, steerInput: 0 };
  }

  reset() {
    this.state = { position: { ...this.spawn }, yaw: Math.PI, mounted: false, speed: 0, steerInput: 0 };
  }
}
