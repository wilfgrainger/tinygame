import type { ReleaseMetadata } from '../../generated/release';

export class Hud {
  readonly element = document.createElement('div');
  readonly movePad = document.createElement('div');
  readonly lookPad = document.createElement('div');
  readonly jumpButton = document.createElement('button');
  readonly actionButton = document.createElement('button');
  private readonly toast = document.createElement('div');
  private readonly discoveryBanner = document.createElement('div');
  private readonly saveState = document.createElement('div');
  private toastTimer = 0;
  private bannerTimer = 0;

  constructor(release: ReleaseMetadata) {
    this.element.className = 'hud';

    this.movePad.className = 'move-pad';
    this.movePad.innerHTML = '<span class="stick-knob"></span>';

    this.lookPad.className = 'look-pad';

    this.jumpButton.className = 'action-button jump';
    this.jumpButton.innerHTML = '<span class="btn-icon">▲</span><span class="btn-text">Jump</span>';

    this.actionButton.className = 'action-button interact';
    this.actionButton.textContent = 'Action';
    this.actionButton.hidden = true;

    this.toast.className = 'toast';
    this.toast.hidden = true;

    this.discoveryBanner.className = 'discovery-banner';
    this.discoveryBanner.hidden = true;

    this.saveState.className = 'save-state';

    const stamp = document.createElement('div');
    stamp.className = 'build-stamp';
    stamp.textContent = `v${release.version} • ${release.commitSha.slice(0, 8)} • ${release.environment}`;

    this.element.append(stamp, this.lookPad, this.movePad, this.jumpButton, this.actionButton, this.toast, this.discoveryBanner, this.saveState);
  }

  setAction(label: string | null) {
    this.actionButton.hidden = !label;
    if (label) {
      this.actionButton.textContent = label;
      this.actionButton.classList.add('pop');
      window.setTimeout(() => this.actionButton.classList.remove('pop'), 150);
    }
  }

  showToast(message: string, ms = 2200) {
    window.clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.hidden = false;
    this.toast.classList.remove('fade-out');
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.add('fade-out');
      window.setTimeout(() => { this.toast.hidden = true; }, 300);
    }, ms);
  }

  showDiscovery(title: string, subtitle: string, ms = 4000) {
    window.clearTimeout(this.bannerTimer);
    this.discoveryBanner.innerHTML = `
      <div class="discovery-badge">★ DISCOVERY ★</div>
      <div class="discovery-title">${title}</div>
      <div class="discovery-sub">${subtitle}</div>
    `;
    this.discoveryBanner.hidden = false;
    this.discoveryBanner.classList.remove('fade-out');
    this.bannerTimer = window.setTimeout(() => {
      this.discoveryBanner.classList.add('fade-out');
      window.setTimeout(() => { this.discoveryBanner.hidden = true; }, 400);
    }, ms);
  }

  setSave(status: string) {
    if (status === 'saving') {
      this.saveState.innerHTML = '<span class="save-dot saving"></span> Saving…';
    } else if (status === 'saved') {
      this.saveState.innerHTML = '<span class="save-dot saved"></span> Saved';
      window.setTimeout(() => {
        if (this.saveState.textContent?.includes('Saved')) this.saveState.innerHTML = '';
      }, 3000);
    } else if (status === 'failed') {
      this.saveState.innerHTML = '<span class="save-dot failed"></span> Save failed';
    } else {
      this.saveState.innerHTML = '';
    }
  }
}
