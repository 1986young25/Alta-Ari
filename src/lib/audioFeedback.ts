/**
 * Audio Feedback System for Cyber-Physical Telemetry & Services
 * Synthesizes subtle, non-intrusive harmonic tones using the Web Audio API
 * with zero external asset dependencies.
 */

class AudioFeedbackService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Read persisted mute preference if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('titan_telemetry_audio_muted');
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      }
    } catch {
      // Ignore localStorage access failures
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        // Browser may require user interaction first
      });
    }
    return this.audioCtx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('titan_telemetry_audio_muted', String(muted));
      }
    } catch {
      // Ignore
    }
    this.listeners.forEach(cb => cb(muted));
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public subscribe(callback: (muted: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Plays a subtle, tactical down-tone when a service transitions to 'Offline'
   * Frequency: Gentle sweep from 392Hz (G4) down to 196Hz (G3) with a warm sub-harmonic,
   * gentle low-pass filtering, soft attack, and exponential decay (~280ms total).
   */
  public playOfflineTransition(options?: { volume?: number; serviceTitle?: string }) {
    if (this.isMuted) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const baseVolume = Math.min(options?.volume ?? 0.08, 0.15); // subtle ceiling

      // Master gain node with smooth anti-click envelope
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(baseVolume, now + 0.025); // 25ms soft attack
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32); // exponential fade

      // Low-pass filter for a smooth, high-end softened tactical acoustic profile
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);

      // Primary tone: Warm triangle wave sliding down
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(392, now); // G4
      osc1.frequency.exponentialRampToValueAtTime(196, now + 0.28); // G3

      // Secondary tone: Soft sub-harmonic sine wave for warmth
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(196, now); // G3
      osc2.frequency.exponentialRampToValueAtTime(98, now + 0.28); // G2

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.45, now);

      // Routing
      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start and schedule clean stop
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.34);
      osc2.stop(now + 0.34);

      // Clean disconnect
      setTimeout(() => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          masterGain.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }, 400);

    } catch (err) {
      // Audio playback fails silently if browser blocks autoplay before user gesture
      console.debug('AudioFeedbackService notice:', err);
    }
  }

  /**
   * Optional test chime / preview so users can calibrate their audio output
   */
  public previewOfflineSound() {
    const wasMuted = this.isMuted;
    if (wasMuted) {
      this.setMuted(false);
    }
    this.playOfflineTransition({ volume: 0.08 });
    if (wasMuted) {
      setTimeout(() => this.setMuted(true), 350);
    }
  }
}

export const audioFeedback = new AudioFeedbackService();
