/**
 * Zero-byte procedural Web Audio synthesizer.
 * Provides rich, responsive audio feedback for footsteps, ambient interactions,
 * town roleplay props, doorbells, barcode scanners, car horns, discovery fanfares,
 * and relaxing procedural town background music.
 */
export class SoundFx {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private musicPlaying = false;
  private musicTimer: number | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    const unlock = () => {
      if (this.unlocked) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          if (this.ctx.state === 'suspended') {
            void this.ctx.resume();
          }
          this.unlocked = true;
        }
      } catch {
        // AudioContext not supported
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  // --- Background Music Synthesizer ---
  startMusic() {
    if (this.musicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.musicPlaying = true;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.045, ctx.currentTime);
    this.musicGain.connect(ctx.destination);

    // Warm chord progression in C Major / A Minor: C -> G -> Am -> F
    const chords = [
      [261.63, 329.63, 392.00], // C (C4, E4, G4)
      [196.00, 246.94, 293.66], // G (G3, B3, D4)
      [220.00, 261.63, 329.63], // Am (A3, C4, E4)
      [174.61, 220.00, 261.63]  // F (F3, A3, C4)
    ];

    const melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    let step = 0;

    const playBar = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const chord = chords[step % chords.length]!;

      // Play soft warm pad chord
      for (const freq of chord) {
        const osc = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        chordGain.gain.setValueAtTime(0.001, now);
        chordGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

        osc.connect(chordGain);
        chordGain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 2.85);
      }

      // Play light melodic bell plucks
      for (let i = 0; i < 4; i++) {
        const pluckTime = now + i * 0.7;
        const noteIdx = Math.floor(Math.random() * melodyNotes.length);
        const freq = melodyNotes[noteIdx]!;

        const osc = this.ctx.createOscillator();
        const pluckGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, pluckTime);

        pluckGain.gain.setValueAtTime(0.035, pluckTime);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, pluckTime + 0.6);

        osc.connect(pluckGain);
        pluckGain.connect(this.musicGain);

        osc.start(pluckTime);
        osc.stop(pluckTime + 0.62);
      }

      step++;
      this.musicTimer = window.setTimeout(playBar, 2800);
    };

    playBar();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      this.musicGain = null;
    }
  }

  toggleMusic(): boolean {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  get isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  // --- Sound Effects ---
  footstep(surface: 'grass' | 'wood' | 'stone' | 'sand' | 'asphalt' = 'grass') {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let baseFreq = 85;
    let filterFreq = 380;
    let decay = 0.07;

    if (surface === 'wood') {
      baseFreq = 120;
      filterFreq = 700;
      decay = 0.09;
    } else if (surface === 'stone' || surface === 'asphalt') {
      baseFreq = 150;
      filterFreq = 950;
      decay = 0.06;
    } else if (surface === 'sand') {
      baseFreq = 70;
      filterFreq = 260;
      decay = 0.11;
    }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + decay);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + decay);
  }

  jump() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  land() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  bikeBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chimes: ReadonlyArray<readonly [number, number]> = [
      [0, 1568],
      [0.11, 2093]
    ];
    for (const [offset, freq] of chimes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);

      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.35);
    }
  }

  carHorn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (const offset of [0, 0.14]) {
      for (const freq of [420, 525]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + offset);

        gain.gain.setValueAtTime(0.10, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.10);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.10);
      }
    }
  }

  doorbell() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const tones = [
      { freq: 880, start: 0, dur: 0.45 },
      { freq: 659.25, start: 0.35, dur: 0.65 }
    ];

    for (const tone of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.start);

      gain.gain.setValueAtTime(0.2, now + tone.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.dur);
    }
  }

  doorLock(locked: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs = locked ? [520, 390] : [390, 520];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.14, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.1);
    });
  }

  waterHose() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.6), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
  }

  crunch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 200, now + i * 0.05);

      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.06);
    }
  }

  cheer() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);

      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  }

  cashRegister() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.setValueAtTime(2349, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  coffeeBrew() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.5);
  }

  slurp() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  splash() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  lamp(on: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(on ? 680 : 420, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  click() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  discovery() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + idx * 0.09;
      const duration = idx === notes.length - 1 ? 0.6 : 0.25;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}
