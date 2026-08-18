export class HouseManager {
  private claimed = false;
  private ownerName: string | null = null;
  private locked = false;
  private theme: 'white' | 'brick' | 'pastel' = 'white';

  claim(playerName: string): { success: boolean; message: string } {
    if (this.claimed && this.ownerName === playerName) {
      // Toggle door lock
      this.locked = !this.locked;
      return {
        success: true,
        message: this.locked ? '🔒 Front Door Locked' : '🔓 Front Door Unlocked'
      };
    }

    this.claimed = true;
    this.ownerName = playerName;
    this.locked = false;
    return {
      success: true,
      message: `🏠 House Claimed by ${playerName}!`
    };
  }

  get isClaimed(): boolean {
    return this.claimed;
  }

  get owner(): string | null {
    return this.ownerName;
  }

  get isLocked(): boolean {
    return this.locked;
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
