/**
 * Real Web Audio API sound synthesizer and dynamic music engine.
 * Generates tactile haptics, notification chimes, and actual playable ambient music
 * with real-time frequency analysis for the Dynamic Notch visualizer.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: NodeJS.Timeout | null = null;
  private currentTrackId: number = 0;
  private trackStep: number = 0;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /** Subtle haptic click for expand / collapse */
  playMorph(enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio suppressed
    }
  }

  /** Discreet notification chime */
  playChime(enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.14); // C6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.14);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {
      // Audio suppressed
    }
  }

  /** Subtle button tap */
  playTap(enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio suppressed
    }
  }

  /**
   * REAL SYNTH MUSIC GENERATOR:
   * Plays lush ambient dark monochrome synth chords with real audio frequency output.
   */
  startMusic(trackIndex: number = 0, volumePct: number = 75) {
    const ctx = this.initCtx();
    if (!ctx) return;

    this.currentTrackId = trackIndex;
    this.isMusicPlaying = true;

    // Set up master gain and analyzer if not created
    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.85;

      this.musicGain.connect(this.analyser);
      this.analyser.connect(ctx.destination);
    }

    this.setVolume(volumePct);

    // Stop any existing loop
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }

    // Play initial note immediately
    this.playAmbientChord();

    // Schedule rhythmic ambient chord progressions every 1.6s
    this.musicInterval = setInterval(() => {
      if (this.isMusicPlaying) {
        this.playAmbientChord();
      }
    }, 1600);
  }

  private playAmbientChord() {
    const ctx = this.initCtx();
    if (!ctx || !this.musicGain || !this.isMusicPlaying) return;

    // Scales for 3 tracks:
    // Track 0 (Resonance in Minor): D minor pentatonic [D3, F3, A3, C4, D4]
    // Track 1 (Monochrome Horizon): A minor ambient [A2, E3, A3, C4, E4]
    // Track 2 (Obsidian Pulse): F# minor neo-noir [F#2, C#3, F#3, A3, C#4]
    const scales = [
      [146.83, 174.61, 220.00, 261.63, 293.66],
      [110.00, 164.81, 220.00, 261.63, 329.63],
      [92.50, 138.59, 185.00, 220.00, 277.18],
    ];

    const currentScale = scales[this.currentTrackId % scales.length];
    const now = ctx.currentTime;

    const baseFreq = currentScale[this.trackStep % currentScale.length];
    const harmonyFreq = currentScale[(this.trackStep + 2) % currentScale.length];
    this.trackStep = (this.trackStep + 1) % currentScale.length;

    // Bass pad
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.4);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.55);

    osc1.connect(gain1);
    gain1.connect(this.musicGain);

    osc1.start(now);
    osc1.stop(now + 1.6);

    // Harmony pad
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(harmonyFreq, now + 0.1);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.07, now + 0.5);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.55);

    osc2.connect(gain2);
    gain2.connect(this.musicGain);

    osc2.start(now + 0.1);
    osc2.stop(now + 1.6);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  setVolume(volumePct: number) {
    if (this.musicGain && this.ctx) {
      const vol = Math.max(0, Math.min(1, volumePct / 100)) * 0.4;
      this.musicGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }
}

export const soundFx = new SoundEngine();
