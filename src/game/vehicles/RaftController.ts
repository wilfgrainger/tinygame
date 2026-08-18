import type { Vec3 } from '../../shared/world';
import type { InputFrame } from '../input/InputState';
import type { WaterSystem } from '../water/WaterSystem';

export type RaftSnapshot = { position: Vec3; yaw: number; mounted: boolean; speed: number };

export class RaftController {
  readonly maxSpeed = 4.2;
  private readonly spawn: Vec3;
  private state: RaftSnapshot;
  constructor(spawn: Vec3, private readonly water: WaterSystem) { this.spawn = { ...spawn }; this.state = { position: { ...spawn }, yaw: 0, mounted: false, speed: 0 }; }
  get snapshot() { return { ...this.state, position: { ...this.state.position } }; }
  canMount(player: Vec3) { return Math.hypot(player.x - this.state.position.x, player.z - this.state.position.z) <= 3.8; }
  mount(player: Vec3) { if (!this.canMount(player) || this.state.mounted) return false; this.state.mounted = true; return true; }
  update(dt: number, input: InputFrame) {
    if (!this.state.mounted) return this.snapshot;
    this.state.speed += (input.moveY * this.maxSpeed - this.state.speed) * Math.min(1, dt * 2.2);
    this.state.yaw -= input.moveX * 0.9 * dt;
    const x = this.state.position.x + Math.sin(this.state.yaw) * this.state.speed * dt;
    const z = this.state.position.z - Math.cos(this.state.yaw) * this.state.speed * dt;
    const clamped = this.water.clamp(x, z, 1.8);
    this.state.position = { x: clamped.x, y: this.water.surfaceY + 0.15, z: clamped.z };
    return this.snapshot;
  }
  dismount() {
    if (!this.state.mounted) return null;
    this.state.mounted = false; this.state.speed = 0;
    return { x: this.state.position.x, y: this.water.surfaceY - 0.55, z: this.state.position.z };
  }
  reset() { this.state = { position: { ...this.spawn }, yaw: 0, mounted: false, speed: 0 }; }
}
