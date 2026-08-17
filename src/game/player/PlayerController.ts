import type { Vec3 } from '../../shared/world';
import type { InputFrame } from '../input/InputState';
import type { CollisionWorld } from './CollisionWorld';
import type { WaterSystem } from '../water/WaterSystem';

export type PlayerMode = 'grounded' | 'airborne' | 'swimming' | 'bike' | 'raft';
export type PlayerSnapshot = { position: Vec3; yaw: number; pitch: number; verticalVelocity: number; mode: PlayerMode };

export class PlayerController {
  readonly radius = 0.55;
  readonly walkSpeed = 6;
  readonly swimSpeed = 3.6;
  private state: PlayerSnapshot;

  constructor(private readonly collision: CollisionWorld, private readonly water: WaterSystem, spawn: Vec3) {
    this.state = { position: { ...spawn, y: collision.heightAt(spawn.x, spawn.z) }, yaw: 0, pitch: -18, verticalVelocity: 0, mode: 'grounded' };
  }

  get snapshot(): PlayerSnapshot { return { ...this.state, position: { ...this.state.position } }; }
  setExternal(position: Vec3, yaw: number, mode: 'bike' | 'raft') { this.state = { ...this.state, position: { ...position }, yaw, mode, verticalVelocity: 0 }; }
  resumeGrounded(position: Vec3) { this.state = { ...this.state, position: { ...position, y: this.collision.heightAt(position.x, position.z) }, mode: 'grounded', verticalVelocity: 0 }; }

  update(dt: number, input: InputFrame): PlayerSnapshot {
    if (this.state.mode === 'bike' || this.state.mode === 'raft') return this.snapshot;
    const capped = Math.min(dt, 1 / 20);
    this.state.yaw -= input.lookX * 0.0035;
    this.state.pitch = Math.max(-55, Math.min(20, this.state.pitch - input.lookY * 0.18));
    const inWater = this.water.contains(this.state.position.x, this.state.position.z);
    if (inWater) this.state.mode = 'swimming';
    else if (this.state.mode === 'swimming') this.state.mode = 'grounded';

    const speed = this.state.mode === 'swimming' ? this.swimSpeed : this.walkSpeed;
    const sin = Math.sin(this.state.yaw); const cos = Math.cos(this.state.yaw);
    const dx = (input.moveX * cos + input.moveY * sin) * speed * capped;
    const dz = (-input.moveY * cos + input.moveX * sin) * speed * capped;
    let next = this.collision.resolveMove(this.state.position, { x: dx, y: 0, z: dz }, this.radius);

    if (this.state.mode === 'swimming') {
      next.y += (this.water.surfaceY - 0.55 - next.y) * Math.min(1, capped * 6);
      this.state.verticalVelocity = 0;
    } else {
      const terrainY = this.collision.heightAt(next.x, next.z);
      const grounded = this.state.position.y <= terrainY + 0.08 && this.state.verticalVelocity <= 0;
      if (input.jumpPressed && grounded) { this.state.verticalVelocity = 7.2; this.state.mode = 'airborne'; }
      this.state.verticalVelocity -= 18 * capped;
      next.y = this.state.position.y + this.state.verticalVelocity * capped;
      if (next.y <= terrainY) { next.y = terrainY; this.state.verticalVelocity = 0; this.state.mode = 'grounded'; }
      else this.state.mode = 'airborne';
    }

    if (next.y < -20) next = { ...this.collision.safeSpawn };
    this.state.position = next;
    return this.snapshot;
  }
}
