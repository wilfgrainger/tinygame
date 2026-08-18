export class SoundFx {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private lastFootstep = 0;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    const unlock = () => {
      if (this.unlocked) return;
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      this.unlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined' && (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.buildNoiseBuffer();
    }
    return this.ctx;
  }

  private buildNoiseBuffer() {
    if (!this.ctx) return;
    const length = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  footstep(surface: 'grass' | 'wood' | 'stone' | 'sand' = 'grass') {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    if (now - this.lastFootstep < 0.18) return;
    this.lastFootstep = now;

    if (surface === 'grass' || surface === 'sand') {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(surface === 'grass' ? 380 : 500, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.09);
    } else if (surface === 'wood') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 25, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  }

  jump() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.16);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  land() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  bikeBell() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const ring = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc.type = 'sine';
      osc2.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc2.frequency.setValueAtTime(freq * 2.76, now + delay);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.28, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc2.start(now + delay);
      osc.stop(now + delay + duration);
      osc2.stop(now + delay + duration);
    };
    ring(2093, 0, 0.45);
    ring(2637, 0.12, 0.65);
  }

  splash() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.35);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.36);
  }

  swimStroke() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(160, now + 0.22);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.23);
  }

  discovery() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 880.0, 1046.5]; // C5, E5, G5, A5, C6
    notes.forEach((freq, i) => {
      const delay = i * 0.085;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now + delay);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.24, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.7);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc2.start(now + delay);
      osc.stop(now + delay + 0.75);
      osc2.stop(now + delay + 0.75);
    });
  }

  lamp(on: boolean) {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(on ? 1200 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(on ? 1800 : 400, now + 0.04);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  click() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}
