// Romantic Ambient Soundscape & Call Audio Generator
// Powered by Web Audio API for 100% offline, zero-asset, lush romantic harmonies & audio chimes,
// plus HTML5 Audio streaming for custom couple songs and synced background listening.

export interface RomanticTrack {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  icon: string;
  duration: string;
  bpm: number;
  description: string;
  gradient: string;
  glowColor: string;
  isCustom?: boolean;
}

export const ROMANTIC_TRACKS: RomanticTrack[] = [
  {
    id: 'candlelight-piano',
    title: 'Candlelight Velvet Piano',
    subtitle: 'Intimate Rhodes & grand piano chords',
    genre: 'Piano Ballad',
    icon: '🎹',
    duration: 'Looping',
    bpm: 68,
    description: 'Warm, velvety piano chords in Fmaj7 → Cmaj7 → Dm7 with soft harmonic sparkle.',
    gradient: 'from-amber-600 via-rose-600 to-pink-700',
    glowColor: 'rgba(251, 146, 60, 0.5)',
  },
  {
    id: 'midnight-lofi',
    title: 'Midnight Lofi Love Beats',
    subtitle: 'Cozy vinyl warmth, mellow chords & bass',
    genre: 'Lofi Chillhop',
    icon: '☕',
    duration: 'Looping',
    bpm: 72,
    description: 'Chill late-night lofi groove with soft vinyl crackle, gentle electric piano, and warm bass.',
    gradient: 'from-purple-900 via-indigo-900 to-slate-900',
    glowColor: 'rgba(168, 85, 247, 0.45)',
  },
  {
    id: 'starlight-serenade',
    title: 'Celestial Starlight Serenade',
    subtitle: 'Dreamy harp arpeggios & stardust pads',
    genre: 'Ambient Dreamscape',
    icon: '🌌',
    duration: 'Looping',
    bpm: 60,
    description: 'Ethereal celestial pads and twinkling harp notes that make you feel like floating among the stars.',
    gradient: 'from-cyan-900 via-blue-900 to-purple-950',
    glowColor: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'sakura-breeze',
    title: 'Kyoto Sakura Blossom',
    subtitle: 'Gentle bamboo flute & koto harp strings',
    genre: 'Zen Romance',
    icon: '🌸',
    duration: 'Looping',
    bpm: 66,
    description: 'Traditional Japanese pentatonic flute and delicate koto plucks floating on a spring blossom breeze.',
    gradient: 'from-pink-900 via-rose-900 to-fuchsia-950',
    glowColor: 'rgba(244, 114, 182, 0.5)',
  },
  {
    id: 'sunset-acoustic',
    title: 'Golden Sunset Acoustic',
    subtitle: 'Warm nylon guitar & ocean tide',
    genre: 'Acoustic Folk Romance',
    icon: '🌅',
    duration: 'Looping',
    bpm: 76,
    description: 'Gentle fingerpicked Spanish guitar melodies evoking a quiet beach sunset hand-in-hand.',
    gradient: 'from-orange-900 via-amber-900 to-rose-950',
    glowColor: 'rgba(249, 115, 22, 0.5)',
  },
  {
    id: 'paris-waltz',
    title: 'Parisian Cafe Waltz',
    subtitle: 'Romantic Seine waltz under streetlights',
    genre: 'French Musette',
    icon: '🥐',
    duration: 'Looping',
    bpm: 84,
    description: 'Charming 3/4 French accordion waltz with warm vintage streetlamp cafe atmosphere.',
    gradient: 'from-emerald-950 via-teal-900 to-slate-900',
    glowColor: 'rgba(52, 211, 153, 0.45)',
  },
];

type TrackChangeListener = (state: {
  activeTrackId: string;
  isPlaying: boolean;
  volume: number;
  customTitle?: string;
}) => void;

class RomanticMusicService {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private timer: any = null;
  private ringTimer: any = null;
  private activeTrackId: string = 'candlelight-piano';
  private currentVolume: number = 0.22;
  private customAudioEl: HTMLAudioElement | null = null;
  private customAudioTitle: string = '';
  private customAudioUrl: string = '';
  private listeners: Set<TrackChangeListener> = new Set();

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

  private notify() {
    this.listeners.forEach((l) =>
      l({
        activeTrackId: this.activeTrackId,
        isPlaying: this.isRunning,
        volume: this.currentVolume,
        customTitle: this.customAudioTitle,
      })
    );
  }

  public onTrackChange(listener: TrackChangeListener): () => void {
    this.listeners.add(listener);
    listener({
      activeTrackId: this.activeTrackId,
      isPlaying: this.isRunning,
      volume: this.currentVolume,
      customTitle: this.customAudioTitle,
    });
    return () => this.listeners.delete(listener);
  }

  public getTracks(): RomanticTrack[] {
    return ROMANTIC_TRACKS;
  }

  public getActiveTrack(): RomanticTrack {
    return (
      ROMANTIC_TRACKS.find((t) => t.id === this.activeTrackId) ||
      ROMANTIC_TRACKS[0]
    );
  }

  public getActiveTrackId(): string {
    return this.activeTrackId;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getCustomTitle(): string {
    return this.customAudioTitle;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(volume, 1.0));
    if (this.masterGain && this.ctx) {
      const scaled = this.currentVolume * 0.45; // scale to pleasant background range
      this.masterGain.gain.linearRampToValueAtTime(scaled, this.ctx.currentTime + 0.1);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.currentVolume;
    }
    this.notify();
  }

  // Play a specific track by ID
  public playTrack(trackId: string, initialVolume?: number) {
    if (initialVolume !== undefined) {
      this.currentVolume = initialVolume;
    }
    this.stopPlayback();
    this.activeTrackId = trackId;
    this.startActiveTrack();
  }

  // Play custom audio stream or user-selected song
  public playCustomAudio(url: string, title: string = 'Our Special Song', initialVolume?: number) {
    if (initialVolume !== undefined) {
      this.currentVolume = initialVolume;
    }
    this.stopPlayback();
    this.activeTrackId = 'custom-song';
    this.customAudioUrl = url;
    this.customAudioTitle = title;

    try {
      if (!this.customAudioEl) {
        this.customAudioEl = new Audio();
        this.customAudioEl.loop = true;
      }
      this.customAudioEl.src = url;
      this.customAudioEl.volume = this.currentVolume;
      this.customAudioEl
        .play()
        .then(() => {
          this.isRunning = true;
          this.notify();
        })
        .catch((err) => {
          console.warn('Custom audio playback failed:', err);
        });
    } catch (e) {
      console.warn('Custom audio setup error:', e);
    }
  }

  public togglePlay() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    if (!this.isRunning) return;
    this.stopPlayback();
    this.isRunning = false;
    this.notify();
  }

  public resume() {
    if (this.isRunning) return;
    if (this.activeTrackId === 'custom-song' && this.customAudioUrl) {
      this.playCustomAudio(this.customAudioUrl, this.customAudioTitle);
    } else {
      this.startActiveTrack();
    }
  }

  public nextTrack() {
    const idx = ROMANTIC_TRACKS.findIndex((t) => t.id === this.activeTrackId);
    const nextIdx = (idx + 1) % ROMANTIC_TRACKS.length;
    this.playTrack(ROMANTIC_TRACKS[nextIdx].id);
  }

  public previousTrack() {
    const idx = ROMANTIC_TRACKS.findIndex((t) => t.id === this.activeTrackId);
    const prevIdx = (idx - 1 + ROMANTIC_TRACKS.length) % ROMANTIC_TRACKS.length;
    this.playTrack(ROMANTIC_TRACKS[prevIdx].id);
  }

  // Stop active synthesis / audio
  private stopPlayback() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.customAudioEl) {
      try {
        this.customAudioEl.pause();
      } catch {}
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          this.masterGain?.disconnect();
          this.masterGain = null;
          if (this.ctx && this.ctx.state === 'running' && !this.isRunning) {
            this.ctx.suspend().catch(() => {});
          }
        }, 700);
      } catch {
        this.masterGain = null;
        if (this.ctx && this.ctx.state === 'running' && !this.isRunning) {
          this.ctx.suspend().catch(() => {});
        }
      }
    } else {
      if (this.ctx && this.ctx.state === 'running' && !this.isRunning) {
        this.ctx.suspend().catch(() => {});
      }
    }
  }

  // Start synthesizing active romantic track
  private startActiveTrack() {
    this.initContext();
    if (!this.ctx) return;

    this.isRunning = true;
    this.masterGain = this.ctx.createGain();
    const scaledGain = this.currentVolume * 0.45;
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(scaledGain, this.ctx.currentTime + 2.0);
    this.masterGain.connect(this.ctx.destination);

    switch (this.activeTrackId) {
      case 'midnight-lofi':
        this.startMidnightLofi();
        break;
      case 'starlight-serenade':
        this.startStarlightSerenade();
        break;
      case 'sakura-breeze':
        this.startSakuraBreeze();
        break;
      case 'sunset-acoustic':
        this.startSunsetAcoustic();
        break;
      case 'paris-waltz':
        this.startParisWaltz();
        break;
      case 'candlelight-piano':
      default:
        this.startCandlelightPiano();
        break;
    }

    this.notify();
  }

  // 1. CANDLELIGHT VELVET PIANO (Fmaj7 -> Cmaj7 -> Dm7 -> Am9)
  private startCandlelightPiano() {
    const chords = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
    ];

    let chordIndex = 0;
    const playChord = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const currentChord = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      const chordGain = this.ctx.createGain();
      chordGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      chordGain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + 1.8);
      chordGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 5.6);
      chordGain.connect(this.masterGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1150, this.ctx.currentTime + 2.5);
      filter.frequency.linearRampToValueAtTime(700, this.ctx.currentTime + 5.5);
      filter.connect(chordGain);

      currentChord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.detune.setValueAtTime(i * 1.5, this.ctx.currentTime);
        osc.connect(filter);
        osc.start();
        osc.stop(this.ctx.currentTime + 5.8);
      });
    };

    playChord();
    this.timer = setInterval(playChord, 5400);
  }

  // 2. MIDNIGHT LOFI LOVE BEATS (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
  private startMidnightLofi() {
    const lofiChords = [
      [87.31, 174.61, 220.0, 261.63, 329.63], // F2 + Fmaj7
      [82.41, 164.81, 196.0, 246.94, 293.66], // E2 + Em7
      [73.42, 146.83, 174.61, 220.0, 261.63], // D2 + Dm7
      [65.41, 130.81, 196.0, 246.94, 329.63], // C2 + Cmaj7
    ];

    let chordIdx = 0;
    const playLofiBar = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const chord = lofiChords[chordIdx];
      chordIdx = (chordIdx + 1) % lofiChords.length;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4.2);
      gain.connect(this.masterGain);

      // Lowpass with resonance for cozy bedroom warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(580, this.ctx.currentTime);
      filter.connect(gain);

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
        osc.connect(filter);
        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + 4.4);
      });
    };

    playLofiBar();
    this.timer = setInterval(playLofiBar, 4400);
  }

  // 3. CELESTIAL STARLIGHT SERENADE (Dmaj7 -> Bm7 -> Gmaj7 -> A9sus4)
  private startStarlightSerenade() {
    const starChords = [
      [146.83, 220.0, 277.18, 369.99, 440.0],  // Dmaj7
      [123.47, 185.0, 220.0, 293.66, 369.99],  // Bm7
      [98.00, 146.83, 185.0, 246.94, 293.66],  // Gmaj7
      [110.0, 164.81, 220.0, 293.66, 329.63],  // A9sus4
    ];

    let step = 0;
    const playHarp = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const chord = starChords[step];
      step = (step + 1) % starChords.length;

      // Celestial pad
      const padGain = this.ctx.createGain();
      padGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      padGain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 2.0);
      padGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 6.0);
      padGain.connect(this.masterGain);

      chord.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        osc.connect(padGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 6.2);
      });

      // Twinkling arpeggios
      chord.forEach((f, idx) => {
        if (!this.ctx) return;
        const highNote = f * 2;
        const bellGain = this.ctx.createGain();
        const delay = 0.5 + idx * 0.45;
        bellGain.gain.setValueAtTime(0.001, this.ctx.currentTime + delay);
        bellGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + delay + 0.04);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 1.2);
        bellGain.connect(this.masterGain!);

        const bell = this.ctx.createOscillator();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(highNote, this.ctx.currentTime + delay);
        bell.connect(bellGain);
        bell.start(this.ctx.currentTime + delay);
        bell.stop(this.ctx.currentTime + delay + 1.3);
      });
    };

    playHarp();
    this.timer = setInterval(playHarp, 5600);
  }

  // 4. KYOTO SAKURA BLOSSOM (Japanese Insen/Hirajoshi romance)
  private startSakuraBreeze() {
    const scale = [293.66, 311.13, 392.0, 440.0, 523.25, 587.33]; // D4, Eb4, G4, A4, C5, D5
    let phrase = 0;

    const playSakuraPhrase = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const root = 146.83; // D3 drone
      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 1.5);
      droneGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4.8);
      droneGain.connect(this.masterGain);

      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(root, this.ctx.currentTime);
      droneOsc.connect(droneGain);
      droneOsc.start();
      droneOsc.stop(this.ctx.currentTime + 5.0);

      // Flute / koto phrase
      const melodyNotes = [
        scale[phrase % scale.length],
        scale[(phrase + 2) % scale.length],
        scale[(phrase + 4) % scale.length],
        scale[(phrase + 3) % scale.length],
      ];
      phrase++;

      melodyNotes.forEach((freq, i) => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + i * 0.9;
        const noteGain = this.ctx.createGain();
        noteGain.gain.setValueAtTime(0.001, t);
        noteGain.gain.linearRampToValueAtTime(0.07, t + 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        noteGain.connect(this.masterGain!);

        const flute = this.ctx.createOscillator();
        flute.type = 'triangle';
        flute.frequency.setValueAtTime(freq, t);
        flute.detune.setValueAtTime(i * 2, t);
        flute.connect(noteGain);
        flute.start(t);
        flute.stop(t + 1.5);
      });
    };

    playSakuraPhrase();
    this.timer = setInterval(playSakuraPhrase, 4800);
  }

  // 5. GOLDEN SUNSET ACOUSTIC (G -> D/F# -> Em7 -> Cadd9)
  private startSunsetAcoustic() {
    const acousticChords = [
      [98.0, 196.0, 246.94, 293.66, 392.0],   // G
      [92.5, 146.83, 220.0, 293.66, 369.99],  // D/F#
      [82.41, 164.81, 196.0, 246.94, 329.63], // Em7
      [65.41, 130.81, 196.0, 261.63, 329.63], // Cadd9
    ];

    let chordIdx = 0;
    const playAcousticStrum = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const chord = acousticChords[chordIdx];
      chordIdx = (chordIdx + 1) % acousticChords.length;

      const strumFilter = this.ctx.createBiquadFilter();
      strumFilter.type = 'lowpass';
      strumFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      strumFilter.connect(this.masterGain);

      // Simulating delicate fingerpicking
      chord.forEach((freq, strIdx) => {
        if (!this.ctx) return;
        const noteTime = this.ctx.currentTime + strIdx * 0.14;
        const noteGain = this.ctx.createGain();
        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.08, noteTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2);
        noteGain.connect(strumFilter);

        const osc = this.ctx.createOscillator();
        osc.type = strIdx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);
        osc.connect(noteGain);
        osc.start(noteTime);
        osc.stop(noteTime + 2.3);
      });
    };

    playAcousticStrum();
    this.timer = setInterval(playAcousticStrum, 4200);
  }

  // 6. PARISIAN CAFE WALTZ (C -> G7 -> Am -> F in 3/4)
  private startParisWaltz() {
    const waltzBars = [
      { bass: 130.81, chord: [261.63, 329.63, 392.0] }, // C
      { bass: 98.0, chord: [246.94, 293.66, 349.23] },  // G7
      { bass: 110.0, chord: [220.0, 261.63, 329.63] },  // Am
      { bass: 87.31, chord: [174.61, 220.0, 261.63] },  // F
    ];

    let barIdx = 0;
    const playWaltzBar = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const bar = waltzBars[barIdx];
      barIdx = (barIdx + 1) % waltzBars.length;

      const baseTime = this.ctx.currentTime;
      // Beat 1: Bass note
      const bassGain = this.ctx.createGain();
      bassGain.gain.setValueAtTime(0.001, baseTime);
      bassGain.gain.linearRampToValueAtTime(0.1, baseTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, baseTime + 1.1);
      bassGain.connect(this.masterGain);

      const bassOsc = this.ctx.createOscillator();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bar.bass, baseTime);
      bassOsc.connect(bassGain);
      bassOsc.start(baseTime);
      bassOsc.stop(baseTime + 1.2);

      // Beats 2 & 3: Accordion chords
      [0.45, 0.9].forEach((offset) => {
        if (!this.ctx) return;
        const chordTime = baseTime + offset;
        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0.001, chordTime);
        cGain.gain.linearRampToValueAtTime(0.06, chordTime + 0.04);
        cGain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.5);
        cGain.connect(this.masterGain!);

        bar.chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);
          osc.connect(cGain);
          osc.start(chordTime);
          osc.stop(chordTime + 0.55);
        });
      });
    };

    playWaltzBar();
    this.timer = setInterval(playWaltzBar, 2200);
  }

  // Backward-compatible method
  public startRomanticAmbience(initialVolume: number = 0.22) {
    this.currentVolume = initialVolume;
    this.startActiveTrack();
  }

  // Backward-compatible method
  public stopRomanticAmbience() {
    this.stopPlayback();
  }

  // Pause ambient audio while user plays an online streaming service (Spotify/Apple Music/YouTube)
  public pauseForStreaming() {
    this.stopPlayback();
    this.isRunning = false;
    this.notify();
  }

  // Romantic Ringing Melody for Incoming Calls
  public startRinging() {
    this.initContext();
    if (!this.ctx) return;
    this.stopRinging();

    const ring = () => {
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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
