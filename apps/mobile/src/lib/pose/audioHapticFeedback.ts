/**
 * Audio Chime & Haptic Feedback Controller
 * Uses Web Audio API for zero-latency, cross-platform synthesized sound effects,
 * combined with device haptics / vibration.
 */

import { Platform } from 'react-native';

class AudioHapticController {
  private audioCtx: any = null;

  private getAudioContext(): any {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        return this.audioCtx;
      }
    }
    return null;
  }

  /**
   * Play high-energy harmonic chime on successful rep completion
   */
  public playRepSuccessChime() {
    this.triggerHapticPulse(40);

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.30);
    } catch (e) {
      // Audio fallback
    }
  }

  /**
   * Countdown tick (3, 2, 1)
   */
  public playCountdownTick(isGo: boolean = false) {
    this.triggerHapticPulse(isGo ? 80 : 30);

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isGo ? 'triangle' : 'sine';
      const freq = isGo ? 880 : 440;
      const duration = isGo ? 0.35 : 0.12;

      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(isGo ? 0.4 : 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Play attention / warning chime on form correction hold
   */
  public playFormWarningChime() {
    this.triggerHapticPulse(90);

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Subtle vibration pulse
   */
  public triggerHapticPulse(durationMs: number = 35) {
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(durationMs);
      }
    } catch (e) {
      // Ignore
    }
  }
}

export const audioHaptics = new AudioHapticController();
