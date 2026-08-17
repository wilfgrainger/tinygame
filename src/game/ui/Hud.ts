import type { ReleaseMetadata } from '../../generated/release';

export class Hud {
  readonly element = document.createElement('div');
  readonly movePad = document.createElement('div');
  readonly lookPad = document.createElement('div');
  readonly jumpButton = document.createElement('button');
  readonly actionButton = document.createElement('button');
  private readonly toast = document.createElement('div');
  private readonly saveState = document.createElement('div');

  constructor(release: ReleaseMetadata) {
    this.element.className = 'hud';
    this.movePad.className = 'move-pad'; this.movePad.innerHTML = '<span class="stick-knob"></span>';
    this.lookPad.className = 'look-pad';
    this.jumpButton.className = 'action-button jump'; this.jumpButton.textContent = 'Jump';
    this.actionButton.className = 'action-button interact'; this.actionButton.textContent = 'Action'; this.actionButton.hidden = true;
    this.toast.className = 'toast'; this.toast.hidden = true;
    this.saveState.className = 'save-state';
    const stamp = document.createElement('div'); stamp.className = 'build-stamp'; stamp.textContent = `v${release.version} • ${release.commitSha.slice(0, 8)} • ${release.environment}`;
    this.element.append(stamp, this.lookPad, this.movePad, this.jumpButton, this.actionButton, this.toast, this.saveState);
  }
  setAction(label: string | null) { this.actionButton.hidden = !label; if (label) this.actionButton.textContent = label; }
  showToast(message: string, ms = 2200) { this.toast.textContent = message; this.toast.hidden = false; window.setTimeout(() => { this.toast.hidden = true; }, ms); }
  setSave(status: string) { this.saveState.textContent = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'failed' ? 'Save failed — retry' : ''; }
}
