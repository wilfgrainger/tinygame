import * as pc from 'playcanvas';
import type { Vec3 } from '../../shared/world';
import { material, primitive } from '../world/meshFactory';
import { wakeStrength } from './vehicleFeel';

export class RaftWake {
  private readonly root = new pc.Entity('TinyRaftWake');
  private readonly ripples: pc.Entity[] = [];
  private readonly foam = material(new pc.Color(0.88, 0.96, 1.0), 0.15, 0, 0.34);

  constructor(private readonly app: pc.Application) {
    app.root.addChild(this.root);
    for (let index = 0; index < 3; index += 1) {
      const ripple = primitive(
        app,
        `RaftWakeRipple${index}`,
        'sphere',
        this.foam,
        new pc.Vec3(0, 0.02, index * 0.85),
        new pc.Vec3(1.2 + index * 0.45, 0.035, 0.55 + index * 0.18),
        this.root
      );
      this.ripples.push(ripple);
    }
    this.root.enabled = false;
  }

  update(position: Vec3, yaw: number, speedRatio: number, time: number): void {
    const strength = wakeStrength(speedRatio);
    if (strength <= 0) {
      this.root.enabled = false;
      return;
    }

    this.root.enabled = true;
    const behind = 1.7;
    this.root.setPosition(
      position.x - Math.sin(yaw) * behind,
      position.y - 0.08,
      position.z + Math.cos(yaw) * behind
    );
    this.root.setEulerAngles(0, (yaw * 180) / Math.PI, 0);

    for (let index = 0; index < this.ripples.length; index += 1) {
      const ripple = this.ripples[index]!;
      const pulse = 1 + Math.sin(time * 4 - index * 0.8) * 0.08;
      const spread = strength * pulse;
      ripple.setLocalScale(
        (1.2 + index * 0.45) * spread,
        0.035,
        (0.55 + index * 0.18) * spread
      );
    }
  }
}
