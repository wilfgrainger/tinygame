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
  readonly propsDock = document.createElement('div');
  private readonly toast = document.createElement('div');
  private readonly discoveryBanner = document.createElement('div');
  private readonly saveState = document.createElement('div');
  private toastTimer = 0;
  private bannerTimer = 0;
  private currentActiveProp: PropType = 'none';
  private propButtons: Map<PropType, HTMLButtonElement> = new Map();
  private onSelectPropCallback?: (prop: PropType) => void;

  constructor(release: ReleaseMetadata) {
    this.element.className = 'hud';

    // Virtual Touch Stick
    this.movePad.className = 'move-pad';
    this.movePad.innerHTML = '<span class="stick-ring"></span><span class="stick-knob"></span>';

    // Look Area (Right screen half)
    this.lookPad.className = 'look-pad';

    // Jump & Horn Controls
    this.jumpButton.className = 'action-button jump';
    this.jumpButton.innerHTML = '<span class="btn-icon">▲</span><span class="btn-text">Jump</span>';

    this.actionButton.className = 'action-button interact';
    this.actionButton.textContent = 'Action';
    this.actionButton.hidden = true;

    this.hornButton.className = 'action-button horn';
    this.hornButton.innerHTML = '📢 <span class="btn-text">Horn</span>';
    this.hornButton.hidden = true;

    // Top Navigation & Props Dock
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';

    this.propsButton.className = 'top-pill-btn';
    this.propsButton.innerHTML = '🎒 <span class="pill-text">Items</span>';
    this.propsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.propsDock.classList.toggle('open');
    });

    topBar.append(this.propsButton);

    // Horizontal Floating Props Dock
    this.propsDock.className = 'props-dock';

    const propOptions: { type: PropType; label: string; icon: string }[] = [
      { type: 'coffee', label: 'Coffee', icon: '☕' },
      { type: 'icecream', label: 'Ice Cream', icon: '🍦' },
      { type: 'flashlight', label: 'Flashlight', icon: '🔦' },
      { type: 'balloon', label: 'Balloon', icon: '🎈' },
      { type: 'none', label: 'Store', icon: '✕' }
    ];

    for (const opt of propOptions) {
      const btn = document.createElement('button');
      btn.className = 'dock-btn';
      btn.setAttribute('aria-label', opt.label);
      btn.innerHTML = `<span class="dock-icon">${opt.icon}</span><span class="dock-label">${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectProp(opt.type);
      });
      this.propButtons.set(opt.type, btn);
      this.propsDock.append(btn);
    }

    this.toast.className = 'toast';
    this.toast.hidden = true;

    this.discoveryBanner.className = 'discovery-banner';
    this.discoveryBanner.hidden = true;

    this.saveState.className = 'save-state';

    const stamp = document.createElement('div');
    stamp.className = 'build-stamp';
    stamp.textContent = `v${release.version} • ${release.commitSha.slice(0, 7)} • ${release.environment}`;

    this.element.append(
      stamp,
      topBar,
      this.propsDock,
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
    this.currentActiveProp = this.currentActiveProp === prop ? 'none' : prop;
    for (const [t, btn] of this.propButtons) {
      btn.classList.toggle('active', t === this.currentActiveProp && t !== 'none');
    }
    this.onSelectPropCallback?.(this.currentActiveProp);
  }

  setAction(label: string | null) {
    this.actionButton.hidden = !label;
    if (label) {
      this.actionButton.textContent = label;
      this.actionButton.classList.add('pop');
      window.setTimeout(() => this.actionButton.classList.remove('pop'), 120);
    }
  }

  setCarMode(inCar: boolean) {
    this.hornButton.hidden = !inCar;
    this.jumpButton.hidden = inCar;
  }

  showToast(message: string, ms = 2000) {
    window.clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.hidden = false;
    this.toast.classList.remove('fade-out');
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.add('fade-out');
      window.setTimeout(() => { this.toast.hidden = true; }, 250);
    }, ms);
  }

  showDiscovery(title: string, subtitle: string, ms = 3800) {
    window.clearTimeout(this.bannerTimer);
    this.discoveryBanner.innerHTML = `
      <div class="discovery-badge">✦ DISCOVERY UNLOCKED ✦</div>
      <div class="discovery-title">${title}</div>
      <div class="discovery-sub">${subtitle}</div>
    `;
    this.discoveryBanner.hidden = false;
    this.discoveryBanner.classList.remove('fade-out');
    this.bannerTimer = window.setTimeout(() => {
      this.discoveryBanner.classList.add('fade-out');
      window.setTimeout(() => { this.discoveryBanner.hidden = true; }, 350);
    }, ms);
  }

  setSave(status: string) {
    if (status === 'saving') {
      this.saveState.innerHTML = '<span class="save-dot saving"></span> Saving';
    } else if (status === 'saved') {
      this.saveState.innerHTML = '<span class="save-dot saved"></span> Cloud Synced';
      window.setTimeout(() => {
        if (this.saveState.textContent?.includes('Cloud Synced')) this.saveState.innerHTML = '';
      }, 2500);
    } else if (status === 'failed') {
      this.saveState.innerHTML = '<span class="save-dot failed"></span> Sync Failed';
    } else {
      this.saveState.innerHTML = '';
    }
  }
}
