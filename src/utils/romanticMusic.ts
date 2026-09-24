// Romantic Ambient Soundscape & Call Audio Generator
// Uses Web Audio API for 100% offline, zero-asset, lush romantic harmonies & call chimes.

class RomanticMusicService {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private timer: any = null;
  private ringTimer: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play a gentle, dreamy romantic chord progression (Fmaj7 -> Cmaj7 -> Dm7 -> Am9)
  public startRomanticAmbience(initialVolume: number = 0.25) {
    if (this.isRunning) return;
    this.initContext();
    if (!this.ctx) return;

    this.isRunning = true;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(Math.min(initialVolume, 0.4), this.ctx.currentTime + 3);
    this.masterGain.connect(this.ctx.destination);

    // Warm chord progressions in Hz
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
      [110.00, 164.81, 220.00, 293.66], // Am(add9) (A2, E3, A3, D4)
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const currentChord = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      const chordGain = this.ctx.createGain();
      chordGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      chordGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.8);
      chordGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 5.8);
      chordGain.connect(this.masterGain);

      // Low-pass filter for velvety softness
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1100, this.ctx.currentTime + 2.5);
      filter.frequency.linearRampToValueAtTime(650, this.ctx.currentTime + 5.5);
      filter.connect(chordGain);

      currentChord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        // Subtle romantic vibrato
        osc.detune.setValueAtTime(i * 1.5, this.ctx.currentTime);
        osc.connect(filter);
        osc.start();
        osc.stop(this.ctx.currentTime + 6.0);
      });
    };

    playChord();
    this.timer = setInterval(playChord, 5500);
  }

  public stopRomanticAmbience() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timer);
    this.timer = null;

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        setTimeout(() => {
          this.masterGain?.disconnect();
          this.masterGain = null;
        }, 1300);
      } catch {
        this.masterGain = null;
      }
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(volume, 0.6));
      this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.1);
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  // Romantic Ringing Melody for Incoming Calls
  public startRinging() {
    this.initContext();
    if (!this.ctx) return;
    this.stopRinging();

    const ring = () => {
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Sweet love chime)
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.18);
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + idx * 0.18 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.18 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.18);
        osc.stop(this.ctx.currentTime + idx * 0.18 + 0.65);
      });
    };

    ring();
    this.ringTimer = setInterval(ring, 2800);
  }

  public stopRinging() {
    if (this.ringTimer) {
      clearInterval(this.ringTimer);
      this.ringTimer = null;
    }
  }

  // Connected Celebration Chime
  public playConnectedChime() {
    this.initContext();
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.85);
    });
  }

  // Call Ended Chime
  public playHangupChime() {
    this.initContext();
    if (!this.ctx) return;
    const notes = [587.33, 440, 329.63]; // D5, A4, E4
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.15);
      osc.stop(this.ctx.currentTime + idx * 0.15 + 0.5);
    });
  }
}

export const romanticMusic = new RomanticMusicService();
