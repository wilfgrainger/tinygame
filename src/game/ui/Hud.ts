import type { ReleaseMetadata } from '../../generated/release';
import type { PropType } from '../player/HandProps';

export class Hud {
  readonly element = document.createElement('div');
  readonly movePad = document.createElement('div');
  readonly lookPad = document.createElement('div');
  readonly jumpButton = document.createElement('button');
  readonly actionButton = document.createElement('button');
  readonly hornButton = document.createElement('button');
  readonly propsButton = document.createElement('button');
  readonly propsDrawer = document.createElement('div');
  private readonly toast = document.createElement('div');
  private readonly discoveryBanner = document.createElement('div');
  private readonly saveState = document.createElement('div');
  private toastTimer = 0;
  private bannerTimer = 0;
  private onSelectPropCallback?: (prop: PropType) => void;

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

    this.hornButton.className = 'action-button horn';
    this.hornButton.innerHTML = '📢 <span class="btn-text">Horn</span>';
    this.hornButton.hidden = true;

    // Brookhaven-style Top Props Bar
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';

    this.propsButton.className = 'top-pill-btn';
    this.propsButton.innerHTML = '🎒 <span class="pill-text">Props</span>';
    this.propsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.propsDrawer.hidden = !this.propsDrawer.hidden;
    });

    topBar.append(this.propsButton);

    // Props Slide-Out Drawer
    this.propsDrawer.className = 'props-drawer';
    this.propsDrawer.hidden = true;

    const propOptions: { type: PropType; label: string; icon: string }[] = [
      { type: 'coffee', label: 'Coffee', icon: '☕' },
      { type: 'icecream', label: 'Ice Cream', icon: '🍦' },
      { type: 'flashlight', label: 'Flashlight', icon: '🔦' },
      { type: 'balloon', label: 'Balloon', icon: '🎈' },
      { type: 'none', label: 'Put Away', icon: '❌' }
    ];

    for (const opt of propOptions) {
      const btn = document.createElement('button');
      btn.className = 'prop-btn';
      btn.innerHTML = `<span class="prop-icon">${opt.icon}</span><span class="prop-label">${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelectPropCallback?.(opt.type);
        this.propsDrawer.hidden = true;
      });
      this.propsDrawer.append(btn);
    }

    this.toast.className = 'toast';
    this.toast.hidden = true;

    this.discoveryBanner.className = 'discovery-banner';
    this.discoveryBanner.hidden = true;

    this.saveState.className = 'save-state';

    const stamp = document.createElement('div');
    stamp.className = 'build-stamp';
    stamp.textContent = `v${release.version} • ${release.commitSha.slice(0, 8)} • ${release.environment}`;

    this.element.append(
      stamp,
      topBar,
      this.propsDrawer,
      this.lookPad,
      this.movePad,
      this.jumpButton,
      this.actionButton,
      this.hornButton,
      this.toast,
      this.discoveryBanner,
      this.saveState
    );
  }

  onSelectProp(callback: (prop: PropType) => void) {
    this.onSelectPropCallback = callback;
  }

  selectProp(prop: PropType) {
    this.onSelectPropCallback?.(prop);
  }


  setAction(label: string | null) {
    this.actionButton.hidden = !label;
    if (label) {
      this.actionButton.textContent = label;
      this.actionButton.classList.add('pop');
      window.setTimeout(() => this.actionButton.classList.remove('pop'), 150);
    }
  }

  setCarMode(inCar: boolean) {
    this.hornButton.hidden = !inCar;
    this.jumpButton.hidden = inCar;
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
