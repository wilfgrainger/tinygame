import { RELEASE } from '../../generated/release';
import { Hud } from './Hud';

export type ShellState = 'loading' | 'signed-out' | 'entering' | 'playing' | 'fatal';

export class Shell {
  readonly hud = new Hud(RELEASE);
  private readonly panel = document.createElement('section');
  private readonly root: HTMLElement;
  private googleHandler: (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.panel.className = 'shell-panel';
    this.root.replaceChildren(this.panel);
    this.setState('loading', 'Opening TinyWorld…');
  }

  setState(state: ShellState, message = '') {
    this.panel.dataset.state = state;
    if (state === 'playing') { this.root.replaceChildren(this.hud.element); return; }
    const title = document.createElement('h1'); title.textContent = 'TinyWorld';
    const copy = document.createElement('p'); copy.textContent = message;
    const stamp = document.createElement('small'); stamp.className = 'shell-stamp'; stamp.textContent = `v${RELEASE.version} • ${RELEASE.commitSha.slice(0, 8)}`;
    this.panel.replaceChildren(title, copy, stamp);
    if (state === 'signed-out') {
      const button = document.createElement('button'); button.id = 'google-sign-in'; button.className = 'google-button'; button.textContent = 'Continue with Google'; button.onclick = () => this.googleHandler?.(); this.panel.append(button);
    }
  }

  onGoogle(handler: () => void) { this.googleHandler = handler; }
  fatal(message: string) { this.setState('fatal', message); }
}
