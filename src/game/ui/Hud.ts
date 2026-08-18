import type { ReleaseMetadata } from '../../generated/release';
import type { PropType } from '../player/HandProps';
import type { PlayerRole, PlayerEmote } from '../player/PlayerView';
import type { VehicleType, PaintColor } from '../vehicles/VehicleSpawner';

export class Hud {
  readonly element = document.createElement('div');
  readonly movePad = document.createElement('div');
  readonly lookPad = document.createElement('div');
  readonly jumpButton = document.createElement('button');
  readonly actionButton = document.createElement('button');
  readonly hornButton = document.createElement('button');
  readonly usePropButton = document.createElement('button');

  // Top Bar & Menus
  readonly propsButton = document.createElement('button');
  readonly rolesButton = document.createElement('button');
  readonly emotesButton = document.createElement('button');
  readonly vehicleButton = document.createElement('button');
  readonly musicButton = document.createElement('button');
  readonly controlsToggle = document.createElement('button');

  readonly propsDock = document.createElement('div');
  readonly rolesDock = document.createElement('div');
  readonly emotesDock = document.createElement('div');
  readonly vehicleDock = document.createElement('div');
  readonly controlsOverlay = document.createElement('div');

  private readonly toast = document.createElement('div');
  private readonly discoveryBanner = document.createElement('div');
  private readonly saveState = document.createElement('div');

  private toastTimer = 0;
  private bannerTimer = 0;
  private currentActiveProp: PropType = 'none';

  public onSelectPropCallback?: (prop: PropType) => void;
  public onSelectRoleCallback?: (role: PlayerRole) => void;
  public onSelectEmoteCallback?: (emote: PlayerEmote) => void;
  public onSpawnVehicleCallback?: (type: VehicleType, color: PaintColor) => void;
  public onToggleMusicCallback?: () => boolean;
  public onUsePropCallback?: (prop: PropType) => void;

  constructor(release: ReleaseMetadata) {
    this.element.className = 'hud';

    // Virtual Touch Stick
    this.movePad.className = 'move-pad';
    this.movePad.innerHTML = '<span class="stick-ring"></span><span class="stick-knob"></span>';

    // Look Area
    this.lookPad.className = 'look-pad';

    // Action / Jump Buttons
    this.jumpButton.className = 'action-button jump';
    this.jumpButton.innerHTML = '<span class="btn-icon">▲</span><span class="btn-text">Jump</span>';

    this.actionButton.className = 'action-button interact';
    this.actionButton.textContent = 'Action';
    this.actionButton.hidden = true;

    this.hornButton.className = 'action-button horn';
    this.hornButton.innerHTML = '📢 <span class="btn-text">Horn</span>';
    this.hornButton.hidden = true;

    this.usePropButton.className = 'action-button use-prop';
    this.usePropButton.innerHTML = '✨ <span class="btn-text">Use</span>';
    this.usePropButton.hidden = true;
    this.usePropButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentActiveProp !== 'none') {
        this.onUsePropCallback?.(this.currentActiveProp);
      }
    });

    // Top Bar
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';

    this.propsButton.className = 'top-pill-btn';
    this.propsButton.innerHTML = '🎒 <span class="pill-text">Items</span>';
    this.propsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllDocksExcept(this.propsDock);
      this.propsDock.classList.toggle('open');
    });

    this.rolesButton.className = 'top-pill-btn';
    this.rolesButton.innerHTML = '👔 <span class="pill-text">Jobs</span>';
    this.rolesButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllDocksExcept(this.rolesDock);
      this.rolesDock.classList.toggle('open');
    });

    this.emotesButton.className = 'top-pill-btn';
    this.emotesButton.innerHTML = '✨ <span class="pill-text">Emotes</span>';
    this.emotesButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllDocksExcept(this.emotesDock);
      this.emotesDock.classList.toggle('open');
    });

    this.vehicleButton.className = 'top-pill-btn';
    this.vehicleButton.innerHTML = '🏎️ <span class="pill-text">Vehicle</span>';
    this.vehicleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllDocksExcept(this.vehicleDock);
      this.vehicleDock.classList.toggle('open');
    });

    this.musicButton.className = 'top-pill-btn';
    this.musicButton.innerHTML = '🎵 <span class="pill-text">Music</span>';
    this.musicButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const playing = this.onToggleMusicCallback?.() ?? false;
      this.musicButton.classList.toggle('active', playing);
      this.showToast(playing ? '🎶 Town Music: ON' : '🔇 Town Music: OFF', 1.8);
    });

    this.controlsToggle.className = 'top-pill-btn';
    this.controlsToggle.innerHTML = '⌨️ <span class="pill-text">Keys</span>';
    this.controlsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.controlsOverlay.classList.toggle('hidden');
    });

    topBar.append(
      this.propsButton,
      this.rolesButton,
      this.emotesButton,
      this.vehicleButton,
      this.musicButton,
      this.controlsToggle
    );

    // 1. Props Dock
    this.propsDock.className = 'props-dock modal-dock';
    const propOptions: { type: PropType; label: string; icon: string }[] = [
      { type: 'coffee', label: 'Coffee', icon: '☕' },
      { type: 'icecream', label: 'Ice Cream', icon: '🍦' },
      { type: 'flashlight', label: 'Flashlight', icon: '🔦' },
      { type: 'balloon', label: 'Balloon', icon: '🎈' },
      { type: 'waterhose', label: 'Hose', icon: '💦' },
      { type: 'none', label: 'Store', icon: '✕' }
    ];
    for (const opt of propOptions) {
      const btn = document.createElement('button');
      btn.className = 'dock-btn';
      btn.innerHTML = `<span class="dock-icon">${opt.icon}</span><span class="dock-label">${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectProp(opt.type);
      });
      this.propsDock.append(btn);
    }

    // 2. Roles Dock
    this.rolesDock.className = 'roles-dock modal-dock';
    const roleOptions: { role: PlayerRole; label: string; icon: string }[] = [
      { role: 'explorer', label: 'Explorer', icon: '🎒' },
      { role: 'barista', label: 'Barista', icon: '☕' },
      { role: 'firefighter', label: 'Firefighter', icon: '👨‍🚒' },
      { role: 'police', label: 'Police', icon: '👮' }
    ];
    for (const opt of roleOptions) {
      const btn = document.createElement('button');
      btn.className = 'dock-btn';
      btn.innerHTML = `<span class="dock-icon">${opt.icon}</span><span class="dock-label">${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelectRoleCallback?.(opt.role);
        this.rolesDock.classList.remove('open');
        this.showToast(`👔 Uniform: ${opt.label}`, 2.0);
      });
      this.rolesDock.append(btn);
    }

    // 3. Emotes Dock
    this.emotesDock.className = 'emotes-dock modal-dock';
    const emoteOptions: { emote: PlayerEmote; label: string; icon: string }[] = [
      { emote: 'wave', label: 'Wave', icon: '👋' },
      { emote: 'dance', label: 'Dance', icon: '💃' },
      { emote: 'cheer', label: 'Cheer', icon: '🎉' },
      { emote: 'sit', label: 'Sit', icon: '🪑' }
    ];
    for (const opt of emoteOptions) {
      const btn = document.createElement('button');
      btn.className = 'dock-btn';
      btn.innerHTML = `<span class="dock-icon">${opt.icon}</span><span class="dock-label">${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelectEmoteCallback?.(opt.emote);
        this.emotesDock.classList.remove('open');
      });
      this.emotesDock.append(btn);
    }

    // 4. Vehicle Dock
    this.vehicleDock.className = 'vehicle-dock modal-dock';
    const vehicleOptions: { type: VehicleType; color: PaintColor; label: string; icon: string }[] = [
      { type: 'car', color: 'red', label: 'Red Car', icon: '🏎️' },
      { type: 'car', color: 'blue', label: 'Blue Car', icon: '🚙' },
      { type: 'car', color: 'yellow', label: 'Yellow Car', icon: '🚕' },
      { type: 'bike', color: 'red', label: 'Bike', icon: '🚲' }
    ];
    for (const opt of vehicleOptions) {
      const btn = document.createElement('button');
      btn.className = 'dock-btn';
      btn.innerHTML = `<span class="dock-icon">${opt.icon}</span><span class="dock-label">${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSpawnVehicleCallback?.(opt.type, opt.color);
        this.vehicleDock.classList.remove('open');
        this.showToast(`🏎️ Spawned ${opt.label}!`, 2.5);
      });
      this.vehicleDock.append(btn);
    }

    // Keyboard Controls Card
    this.controlsOverlay.className = 'keyboard-controls-card hidden';
    this.controlsOverlay.innerHTML = `
      <div class="controls-header">
        <span class="controls-title">⌨️ Keyboard Controls</span>
        <button class="controls-close" aria-label="Close">✕</button>
      </div>
      <div class="controls-grid">
        <div class="control-row"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Move / Steer</span></div>
        <div class="control-row"><kbd>Space</kbd><span>Jump</span></div>
        <div class="control-row"><kbd>E</kbd><span>Action / Drive / Sit</span></div>
        <div class="control-row"><kbd>F</kbd><span>Use Held Prop</span></div>
        <div class="control-row"><kbd>H</kbd><span>Car Horn</span></div>
        <div class="control-row"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd><kbd>5</kbd><span>Props</span></div>
        <div class="control-row"><kbd>0</kbd><span>Put away prop</span></div>
        <div class="control-row"><kbd>Mouse Drag</kbd><span>Orbit Camera</span></div>
      </div>
    `;

    const closeBtn = this.controlsOverlay.querySelector('.controls-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.controlsOverlay.classList.add('hidden');
    });

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
      this.rolesDock,
      this.emotesDock,
      this.vehicleDock,
      this.controlsOverlay,
      this.lookPad,
      this.movePad,
      this.jumpButton,
      this.actionButton,
      this.hornButton,
      this.usePropButton,
      this.toast,
      this.discoveryBanner,
      this.saveState
    );
  }

  private closeAllDocksExcept(except?: HTMLElement) {
    if (this.propsDock !== except) this.propsDock.classList.remove('open');
    if (this.rolesDock !== except) this.rolesDock.classList.remove('open');
    if (this.emotesDock !== except) this.emotesDock.classList.remove('open');
    if (this.vehicleDock !== except) this.vehicleDock.classList.remove('open');
  }

  selectProp(type: PropType) {
    this.currentActiveProp = type;
    this.onSelectPropCallback?.(type);

    if (type === 'coffee') {
      this.usePropButton.hidden = false;
      this.usePropButton.innerHTML = '☕ <span class="btn-text">Sip</span>';
    } else if (type === 'icecream') {
      this.usePropButton.hidden = false;
      this.usePropButton.innerHTML = '🍦 <span class="btn-text">Eat</span>';
    } else if (type === 'waterhose') {
      this.usePropButton.hidden = false;
      this.usePropButton.innerHTML = '💦 <span class="btn-text">Spray</span>';
    } else {
      this.usePropButton.hidden = true;
    }
  }

  setCarMode(inCar: boolean) {
    this.hornButton.hidden = !inCar;
    this.jumpButton.hidden = inCar;
  }

  showToast(message: string, durationSeconds = 2.4) {
    this.toast.textContent = message;
    this.toast.hidden = false;
    this.toast.classList.add('pop');
    this.toastTimer = durationSeconds;
  }

  showDiscovery(title: string, subtitle: string) {
    this.discoveryBanner.innerHTML = `
      <div class="discovery-badge">⭐ DISCOVERY</div>
      <div class="discovery-title">${title}</div>
      <div class="discovery-sub">${subtitle}</div>
    `;
    this.discoveryBanner.hidden = false;
    this.discoveryBanner.classList.add('celebrate');
    this.bannerTimer = 4.2;
  }

  setAction(label: string | null) {
    if (label) {
      this.actionButton.textContent = label;
      this.actionButton.hidden = false;
    } else {
      this.actionButton.hidden = true;
    }
  }

  setSave(status: 'idle' | 'saving' | 'saved' | 'error' | 'failed') {
    this.setSaveState(status);
  }

  setSaveState(status: 'idle' | 'saving' | 'saved' | 'error' | 'failed') {
    this.saveState.className = `save-state ${status === 'failed' ? 'error' : status}`;
    if (status === 'saving') this.saveState.textContent = 'Saving...';
    else if (status === 'saved') this.saveState.textContent = 'Saved ✓';
    else if (status === 'error' || status === 'failed') this.saveState.textContent = 'Save failed';
    else this.saveState.textContent = '';
  }



  update(dt: number) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.toast.hidden = true;
        this.toast.classList.remove('pop');
      }
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.discoveryBanner.hidden = true;
        this.discoveryBanner.classList.remove('celebrate');
      }
    }
  }
}
