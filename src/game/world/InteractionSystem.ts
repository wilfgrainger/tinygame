import type { Vec3 } from '../../shared/world';

export type Interaction = { id: string; label: string; position: Vec3; radius: number; run: () => void | Promise<void> };

export class InteractionSystem {
  private interactions: Interaction[] = [];

  register(interaction: Interaction) {
    // `houseClaim` is a legacy interaction id from the roleplay expansion.
    // V0.1 intentionally has no durable house-claim/lock system, so prevent
    // old composition code from advertising persistence/security that does
    // not exist server-side.
    this.interactions.push(
      interaction.id === 'houseClaim'
        ? { ...interaction, label: 'Welcome Home 🏠' }
        : interaction
    );
  }

  nearest(position: Vec3): Interaction | null {
    let best: Interaction | null = null;
    let bestDistance = Infinity;
    for (const item of this.interactions) {
      const d = Math.hypot(position.x - item.position.x, position.z - item.position.z);
      if (d <= item.radius && d < bestDistance) {
        best = item;
        bestDistance = d;
      }
    }
    return best;
  }
}
