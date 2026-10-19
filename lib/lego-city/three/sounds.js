/**
 * Tiny WebAudio synth: no samples to download, everything is generated.
 * Sounds are the LEGO-movie vocabulary: brick snaps, stud chimes, a tram bell.
 */
export class Sounds {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      this.muted = localStorage.getItem("pilleland-muted") === "1";
    } catch {
      /* private mode */
    }
    this.lastStep = 0;
  }

  ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  /** Call from a user gesture so browsers allow playback. */
  unlock() {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      localStorage.setItem("pilleland-muted", muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  tone({ freq = 440, type = "sine", duration = 0.15, gain = 0.3, slide = 0, attack = 0.005 }) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + duration);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  noise({ duration = 0.08, gain = 0.2, freq = 1200 }) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t);
  }

  /** Two bricks pressed together. */
  snap() {
    this.noise({ duration: 0.05, gain: 0.35, freq: 2200 });
    this.tone({ freq: 180, type: "square", duration: 0.06, gain: 0.12, slide: -120 });
  }

  /** Collecting a stud: a quick rising two-note chime. */
  collect(index = 0) {
    const base = 880 * Math.pow(2, (index % 5) / 12);
    this.tone({ freq: base, type: "triangle", duration: 0.12, gain: 0.25 });
    setTimeout(() => this.tone({ freq: base * 1.5, type: "triangle", duration: 0.18, gain: 0.22 }), 70);
  }

  /** The tram bell, rung at every stop. */
  bell() {
    this.tone({ freq: 1760, type: "sine", duration: 0.6, gain: 0.18 });
    this.tone({ freq: 2637, type: "sine", duration: 0.45, gain: 0.08 });
    setTimeout(() => this.tone({ freq: 1760, type: "sine", duration: 0.7, gain: 0.16 }), 260);
  }

  jump() {
    this.tone({ freq: 320, type: "square", duration: 0.16, gain: 0.1, slide: 380 });
  }

  land() {
    this.noise({ duration: 0.06, gain: 0.25, freq: 600 });
  }

  /** Footsteps: little plastic taps, rate-limited by the caller's phase. */
  step(now) {
    if (now - this.lastStep < 0.22) return;
    this.lastStep = now;
    this.noise({ duration: 0.035, gain: 0.12, freq: 900 + Math.random() * 400 });
  }

  open() {
    this.tone({ freq: 523, type: "triangle", duration: 0.1, gain: 0.15 });
    setTimeout(() => this.tone({ freq: 784, type: "triangle", duration: 0.16, gain: 0.15 }), 80);
  }

  dispose() {
    this.ctx?.close?.();
  }
}
