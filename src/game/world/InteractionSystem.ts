import type { Vec3 } from '../../shared/world';

export type Interaction = { id: string; label: string; position: Vec3; radius: number; run: () => void | Promise<void> };

export class InteractionSystem {
  private interactions: Interaction[] = [];
  register(interaction: Interaction) { this.interactions.push(interaction); }
  nearest(position: Vec3): Interaction | null {
    let best: Interaction | null = null; let bestDistance = Infinity;
    for (const item of this.interactions) {
      const d = Math.hypot(position.x - item.position.x, position.z - item.position.z);
      if (d <= item.radius && d < bestDistance) { best = item; bestDistance = d; }
    }
    return best;
  }
}
