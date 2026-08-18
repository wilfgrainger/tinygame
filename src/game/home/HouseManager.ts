export class HouseManager {
  private theme: 'white' | 'brick' | 'pastel' = 'white';

  // Legacy method name retained so the current composition root does not need a
  // large mechanical rewrite. V0.1 has a player home, not a persistent claim/
  // lock system, so this action is deliberately welcoming and stateless.
  claim(playerName: string): { success: boolean; message: string } {
    return {
      success: true,
      message: `🏠 Welcome home, ${playerName}!`
    };
  }

  get isClaimed(): boolean {
    return false;
  }

  get owner(): string | null {
    return null;
  }

  get isLocked(): boolean {
    return false;
  }

  get currentTheme(): 'white' | 'brick' | 'pastel' {
    return this.theme;
  }

  cycleTheme(): 'white' | 'brick' | 'pastel' {
    if (this.theme === 'white') this.theme = 'brick';
    else if (this.theme === 'brick') this.theme = 'pastel';
    else this.theme = 'white';
    return this.theme;
  }
}
