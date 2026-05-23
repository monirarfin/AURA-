/**
 * Native Web Audio API Synthesizer for high-end, professional audio feedback.
 * Synthesizes subtle, premium 'ping' and 'chime' sounds.
 * Avoids slow and failure-prone network asset fetches (MP3/WAV).
 */

class AudioEngine {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (common browser security constraint)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Safely triggers hardware vibration haptics on supported mobile devices
   */
  private triggerHaptic(pattern: number | number[]) {
    try {
      if (typeof window !== 'undefined' && navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.warn("Haptic feedback blocked or unsupported:", e);
    }
  }

  /**
   * Synthesizes a beautiful, dual-tone premium golden chime sound (Perfect for Match Activated)
   */
  public playMatchChime() {
    try {
      // Trigger elegant matching double-pulse haptic feedback (100ms vibration, 50ms pause, 150ms vibration)
      this.triggerHaptic([100, 50, 150]);

      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Dual oscillators for a richer harmonic vibe check
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Golden pair aesthetic: root fundamental at A5 (880Hz) and a sparkling fifth at E6 (1318.51Hz)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now);

      // Low pass filter to remove harshness and create a warm analog signature
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);

      // Smooth envelope to prevent audio pops
      gainNode.gain.setValueAtTime(0, now);
      // Fast but soft attack
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.04);
      // Beautiful echoing exponential decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      // Routing
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(this.ctx.destination);

      // Execute play
      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
    } catch (e) {
      console.warn("AudioEngine chime blocked or failed:", e);
    }
  }

  /**
   * Synthesizes a subtle, highly professional digital ping sound (Perfect for Blind Date requests)
   */
  public playRequestPing() {
    try {
      // Trigger light single-pulse haptic feedback (60ms vibration)
      this.triggerHaptic(60);

      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Sharp, technical pure sine wave at C6 (1046.50Hz) for precise digital confirmation
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, now);

      // Rapid envelope signature: quick ramp, instant ping, fast fade
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn("AudioEngine ping blocked or failed:", e);
    }
  }
}

export const audioEngine = new AudioEngine();
