import type { HomeState } from '../../shared/schemas';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

export class HomeSystem {
  private state: HomeState;
  status: SaveStatus = 'idle';
  constructor(initial: HomeState, private readonly save: (home: HomeState) => Promise<HomeState>, private readonly onStatus: (status: SaveStatus) => void = () => {}) { this.state = { ...initial }; }
  get current() { return { ...this.state }; }
  async setLamp(on: boolean) {
    const previous = this.state;
    this.state = { lampOn: on }; this.status = 'saving'; this.onStatus(this.status);
    try { this.state = await this.save(this.state); this.status = 'saved'; this.onStatus(this.status); return 'saved' as const; }
    catch { this.state = previous; this.status = 'failed'; this.onStatus(this.status); return 'failed' as const; }
  }
}
