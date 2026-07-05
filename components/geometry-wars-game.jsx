"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CHASE_SPEED_MIN = 1.9;
const CHASE_SPEED_MAX = 3.2;
const INVULN_FRAMES = 70;
const ENEMY_RADIUS = 12;
const ENEMY_HP = 3;
const PLAYER_RADIUS = 9;
const BULLET_SPEED = 7.5;
const BULLET_RADIUS = 3;
const FIRE_INTERVAL_FRAMES = 8;
const START_LIVES = 3;
const MIN_PER_TARGET = 4;
const MAX_PER_TARGET = 9;
const DARK_OVERLAY_ALPHA = 0.9;
const MAX_LIVES = 5;
const POWERUP_RADIUS = 14;
const POWERUP_SPAWN_MIN_FRAMES = 300;
const POWERUP_SPAWN_MAX_FRAMES = 480;
const POWERUP_LIFETIME_FRAMES = 480;
const POWERUP_EFFECT_FRAMES = 360;
const HIGH_SCORE_KEY = "portfolio-geo-wars-grid-high-score";

const NEON_COLORS = ["#00E5FF", "#FF2E9A", "#7CFF6B", "#FFD23F", "#B24BFF", "#FF7A29", "#4DFFDF"];

const POWERUP_DEFS = {
  rapid: { color: "#FFD23F", label: "R", name: "Rapid Fire" },
  shield: { color: "#00E5FF", label: "S", name: "Shield" },
  multi: { color: "#FF2E9A", label: "M", name: "Multi-Shot" },
  life: { color: "#7CFF6B", label: "+", name: "Extra Life" },
};
const POWERUP_TYPE_LIST = Object.keys(POWERUP_DEFS);

function rotateVector(x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function mixColor(hex, targetRgb, amount) {
  const c = hexToRgb(hex);
  const r = Math.round(c.r + (targetRgb.r - c.r) * amount);
  const g = Math.round(c.g + (targetRgb.g - c.g) * amount);
  const b = Math.round(c.b + (targetRgb.b - c.b) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function lighten(hex, amount) {
  return mixColor(hex, { r: 255, g: 255, b: 255 }, amount);
}

function darken(hex, amount) {
  return mixColor(hex, { r: 0, g: 0, b: 0 }, amount);
}

function hslTripleToHex(triple) {
  const [h, sPct, lPct] = triple.trim().split(/\s+/).map((v) => parseFloat(v));
  const s = sPct / 100;
  const l = lPct / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function drawGroundShadow(ctx, x, y, radiusX, radiusY, alpha) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
  grd.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  grd.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
}

function spawnParticles(list, x, y, color, count, speedMul = 1) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 2.4 + 0.6) * speedMul;
    list.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 24 + Math.random() * 16,
      maxLife: 40,
      color,
      size: Math.random() * 2 + 1.2,
    });
  }
}

function buildEnemies() {
  const targets = Array.from(document.querySelectorAll("[data-game-target]")).filter((el) => {
    const rect = el.getBoundingClientRect();
    const cy = rect.top + rect.height / 2;
    return cy > 40 && cy < window.innerHeight - 40;
  });

  const enemies = [];
  let colorIndex = 0;
  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    const count = Math.min(MAX_PER_TARGET, Math.max(MIN_PER_TARGET, Math.round(area / 9000)));
    const pad = 22;
    for (let i = 0; i < count; i++) {
      const anchorX = rect.left + pad + Math.random() * Math.max(1, rect.width - pad * 2);
      const anchorY = rect.top + pad + Math.random() * Math.max(1, rect.height - pad * 2);
      enemies.push({
        el,
        anchorX,
        anchorY,
        x: anchorX,
        y: anchorY,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        chaseSpeed: CHASE_SPEED_MIN + Math.random() * (CHASE_SPEED_MAX - CHASE_SPEED_MIN),
        color: NEON_COLORS[colorIndex % NEON_COLORS.length],
        hp: ENEMY_HP,
        alive: true,
      });
      colorIndex++;
    }
  });
  return enemies;
}

export default function GeometryWarsGame({ open, onClose }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(null);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const lastPosRef = useRef({ x: -9999, y: -9999 });
  const shipAngleRef = useRef(-Math.PI / 2);
  const firingRef = useRef(false);
  const darkAlphaRef = useRef(0);
  const audioCtxRef = useRef(null);
  const ambienceRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [phase, setPhase] = useState("idle"); // idle | playing | cleared | dead
  const [powerupStatus, setPowerupStatus] = useState({ rapid: 0, shield: 0, multi: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0);
    setHighScore(stored);
  }, []);

  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctor();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playShotSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Short slap-echo so the blaster tail rings out a bit, sci-fi style
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.045;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(ctx.destination);

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.11);
    filter.type = "lowpass";
    filter.Q.value = 9;
    filter.frequency.setValueAtTime(3600, t);
    filter.frequency.exponentialRampToValueAtTime(450, t + 0.12);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(filter).connect(gain);
    gain.connect(ctx.destination);
    gain.connect(delay);
    osc.start(t);
    osc.stop(t + 0.14);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(2600, t);
    clickGain.gain.setValueAtTime(0.05, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    click.connect(clickGain).connect(ctx.destination);
    click.start(t);
    click.stop(t + 0.025);
  };

  const playExplosionSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.22);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  };

  const playHurtSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.33);
  };

  const playPowerupSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [520, 660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      const start = t + i * 0.07;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  };

  const startAmbience = () => {
    const ctx = getAudioContext();
    if (!ctx || ambienceRef.current) return;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.connect(master);

    const engineA = ctx.createOscillator();
    engineA.type = "sine";
    engineA.frequency.value = 54;
    const engineB = ctx.createOscillator();
    engineB.type = "sine";
    engineB.frequency.value = 57.5;
    engineA.connect(filter);
    engineB.connect(filter);

    // slow pulsing swell, like a distant ship engine
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.13;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.018;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);

    // faint high shimmer for "starlight" texture
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 1180;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.006;
    const shimmerLfo = ctx.createOscillator();
    shimmerLfo.frequency.value = 0.07;
    const shimmerLfoGain = ctx.createGain();
    shimmerLfoGain.gain.value = 220;
    shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(shimmer.frequency);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);

    engineA.start();
    engineB.start();
    lfo.start();
    shimmer.start();
    shimmerLfo.start();

    ambienceRef.current = { master, engineA, engineB, lfo, shimmer, shimmerLfo };
  };

  const stopAmbience = () => {
    const nodes = ambienceRef.current;
    const ctx = audioCtxRef.current;
    if (!nodes || !ctx) {
      ambienceRef.current = null;
      return;
    }
    const now = ctx.currentTime;
    try {
      nodes.master.gain.cancelScheduledValues(now);
      nodes.master.gain.setValueAtTime(nodes.master.gain.value, now);
      nodes.master.gain.linearRampToValueAtTime(0, now + 0.5);
      nodes.engineA.stop(now + 0.55);
      nodes.engineB.stop(now + 0.55);
      nodes.lfo.stop(now + 0.55);
      nodes.shimmer.stop(now + 0.55);
      nodes.shimmerLfo.stop(now + 0.55);
    } catch {
      // nodes may already be stopped — safe to ignore
    }
    ambienceRef.current = null;
  };

  const restoreTargets = () => {
    const s = stateRef.current;
    if (!s) return;
    s.elementRemaining.forEach((_, el) => {
      el.style.transition = "opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease";
      el.style.opacity = "";
      el.style.filter = "";
      el.style.transform = "";
    });
  };

  const resetGame = () => {
    startAmbience();
    restoreTargets();
    const enemies = buildEnemies();
    const elementRemaining = new Map();
    enemies.forEach((e) => {
      elementRemaining.set(e.el, (elementRemaining.get(e.el) || 0) + 1);
    });
    stateRef.current = {
      enemies,
      elementRemaining,
      bullets: [],
      particles: [],
      powerups: [],
      frame: 0,
      score: 0,
      invulnFrames: 0,
      rapidFireFrames: 0,
      shieldFrames: 0,
      multiShotFrames: 0,
      nextPowerupFrame:
        POWERUP_SPAWN_MIN_FRAMES + Math.random() * (POWERUP_SPAWN_MAX_FRAMES - POWERUP_SPAWN_MIN_FRAMES),
    };
    setScore(0);
    setLives(START_LIVES);
    setPowerupStatus({ rapid: 0, shield: 0, multi: 0 });
    setPhase("playing");
  };

  const startOrRestart = () => {
    if (phase !== "playing") resetGame();
  };

  useEffect(() => {
    if (!open) return;
    const heroEl = document.getElementById("hero");
    if (heroEl) heroEl.scrollIntoView({ block: "start" });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const styles = getComputedStyle(document.documentElement);
    const primary = `hsl(${styles.getPropertyValue("--primary").trim()})`;
    const primaryHex = hslTripleToHex(styles.getPropertyValue("--primary"));

    darkAlphaRef.current = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function drawShip() {
      const { x, y } = pointerRef.current;
      if (x < -100) return;

      const prev = lastPosRef.current;
      const dx = x - prev.x;
      const dy = y - prev.y;
      if (Math.hypot(dx, dy) > 1.2) {
        shipAngleRef.current = Math.atan2(dy, dx);
      }
      lastPosRef.current = { x, y };

      drawGroundShadow(ctx, x, y + PLAYER_RADIUS * 1.4, PLAYER_RADIUS * 1.3, PLAYER_RADIUS * 0.6, 0.4);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(shipAngleRef.current);
      const shipGrad = ctx.createLinearGradient(PLAYER_RADIUS + 4, -PLAYER_RADIUS, -PLAYER_RADIUS, PLAYER_RADIUS);
      shipGrad.addColorStop(0, lighten(primaryHex, 0.55));
      shipGrad.addColorStop(0.5, primaryHex);
      shipGrad.addColorStop(1, darken(primaryHex, 0.45));
      ctx.fillStyle = shipGrad;
      ctx.strokeStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = firingRef.current ? 18 : 12;
      ctx.beginPath();
      ctx.moveTo(PLAYER_RADIUS + 4, 0);
      ctx.lineTo(-PLAYER_RADIUS, PLAYER_RADIUS * 0.85);
      ctx.lineTo(-PLAYER_RADIUS * 0.4, 0);
      ctx.lineTo(-PLAYER_RADIUS, -PLAYER_RADIUS * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.shadowBlur = 0;

      const s = stateRef.current;
      if (s && s.shieldFrames > 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = "#00E5FF";
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + Math.sin(s.frame * 0.2) * 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, PLAYER_RADIUS + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    function killEnemy(e, s) {
      e.alive = false;
      spawnParticles(s.particles, e.x, e.y, e.color, 18);
      playExplosionSound();
      const remaining = (s.elementRemaining.get(e.el) || 1) - 1;
      s.elementRemaining.set(e.el, remaining);
      if (remaining <= 0) {
        e.el.style.transition = "opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease";
        e.el.style.opacity = "0.25";
        e.el.style.filter = "grayscale(1) blur(1px)";
        e.el.style.transform = "scale(0.94)";
      }
    }

    function draw() {
      const s = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      darkAlphaRef.current += (DARK_OVERLAY_ALPHA - darkAlphaRef.current) * 0.06;
      ctx.fillStyle = `rgba(2, 2, 6, ${darkAlphaRef.current})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!s) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const active = phase === "playing";
      const player = pointerRef.current;

      if (active) {
        s.frame += 1;

        s.enemies.forEach((e) => {
          if (!e.alive) return;

          e.phase += 0.05;

          const dxPlayer = player.x - e.x;
          const dyPlayer = player.y - e.y;
          const distPlayer = Math.hypot(dxPlayer, dyPlayer) || 1;

          // Unconditional pursuit — no leash, no pullback. The tether line is purely
          // a visual link back to the enemy's home card, not a movement constraint.
          const chaseX = dxPlayer / distPlayer;
          const chaseY = dyPlayer / distPlayer;
          const wobbleX = Math.cos(e.phase) * 0.5;
          const wobbleY = Math.sin(e.phase) * 0.5;

          e.vx = chaseX * e.chaseSpeed + wobbleX;
          e.vy = chaseY * e.chaseSpeed + wobbleY;

          const speed = Math.hypot(e.vx, e.vy);
          const maxSpeed = e.chaseSpeed * 1.4;
          if (speed > maxSpeed) {
            e.vx = (e.vx / speed) * maxSpeed;
            e.vy = (e.vy / speed) * maxSpeed;
          }

          e.x += e.vx;
          e.y += e.vy;
        });

        // Powerup timers
        if (s.rapidFireFrames > 0) s.rapidFireFrames -= 1;
        if (s.shieldFrames > 0) s.shieldFrames -= 1;
        if (s.multiShotFrames > 0) s.multiShotFrames -= 1;

        // Spawn powerups over time
        if (s.frame >= s.nextPowerupFrame) {
          const margin = 90;
          s.powerups.push({
            x: margin + Math.random() * Math.max(1, canvas.width - margin * 2),
            y: margin + Math.random() * Math.max(1, canvas.height - margin * 2),
            type: POWERUP_TYPE_LIST[Math.floor(Math.random() * POWERUP_TYPE_LIST.length)],
            life: POWERUP_LIFETIME_FRAMES,
            phase: Math.random() * Math.PI * 2,
          });
          s.nextPowerupFrame =
            s.frame + POWERUP_SPAWN_MIN_FRAMES + Math.random() * (POWERUP_SPAWN_MAX_FRAMES - POWERUP_SPAWN_MIN_FRAMES);
        }

        // Update + collect powerups
        s.powerups.forEach((p) => {
          p.life -= 1;
          p.phase += 0.08;
          const d = Math.hypot(p.x - player.x, p.y - player.y);
          if (d < POWERUP_RADIUS + PLAYER_RADIUS && player.x > -100) {
            p.collected = true;
            playPowerupSound();
            spawnParticles(s.particles, p.x, p.y, POWERUP_DEFS[p.type].color, 16);
            if (p.type === "rapid") s.rapidFireFrames = POWERUP_EFFECT_FRAMES;
            else if (p.type === "shield") s.shieldFrames = POWERUP_EFFECT_FRAMES;
            else if (p.type === "multi") s.multiShotFrames = POWERUP_EFFECT_FRAMES;
            else if (p.type === "life") setLives((prev) => Math.min(MAX_LIVES, prev + 1));
          }
        });
        s.powerups = s.powerups.filter((p) => p.life > 0 && !p.collected);

        // Fire toward nearest alive enemy while the trigger is held
        const fireInterval = s.rapidFireFrames > 0 ? Math.max(3, Math.floor(FIRE_INTERVAL_FRAMES / 2)) : FIRE_INTERVAL_FRAMES;
        if (firingRef.current && s.frame % fireInterval === 0) {
          let nearest = null;
          let nearestDist = Infinity;
          for (const e of s.enemies) {
            if (!e.alive) continue;
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < nearestDist) {
              nearestDist = d;
              nearest = e;
            }
          }
          if (nearest && player.x > -100) {
            const dx = nearest.x - player.x;
            const dy = nearest.y - player.y;
            const dist = Math.hypot(dx, dy) || 1;
            const dirX = dx / dist;
            const dirY = dy / dist;
            const angles = s.multiShotFrames > 0 ? [-0.22, 0, 0.22] : [0];
            angles.forEach((angle) => {
              const v = rotateVector(dirX, dirY, angle);
              s.bullets.push({
                x: player.x,
                y: player.y,
                vx: v.x * BULLET_SPEED,
                vy: v.y * BULLET_SPEED,
                life: 90,
              });
            });
            playShotSound();
          }
        }

        // Update bullets
        s.bullets.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
          b.life -= 1;
        });
        s.bullets = s.bullets.filter(
          (b) => b.life > 0 && b.x > -20 && b.x < canvas.width + 20 && b.y > -20 && b.y < canvas.height + 20
        );

        // Bullet vs enemy
        for (const e of s.enemies) {
          if (!e.alive) continue;
          for (const b of s.bullets) {
            if (b.life <= 0) continue;
            const d = Math.hypot(e.x - b.x, e.y - b.y);
            if (d < ENEMY_RADIUS + BULLET_RADIUS) {
              b.life = 0;
              e.hp -= 1;
              spawnParticles(s.particles, b.x, b.y, e.color, 4, 0.6);
              if (e.hp <= 0) {
                killEnemy(e, s);
                s.score += 25;
              }
            }
          }
        }
        s.bullets = s.bullets.filter((b) => b.life > 0);

        // Enemy vs player (cursor)
        if (s.invulnFrames > 0) {
          s.invulnFrames -= 1;
        } else if (s.shieldFrames > 0) {
          // shielded — no collision damage
        } else {
          for (const e of s.enemies) {
            if (!e.alive) continue;
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < ENEMY_RADIUS + PLAYER_RADIUS && player.x > -100) {
              killEnemy(e, s);
              playHurtSound();
              spawnParticles(s.particles, player.x, player.y, primary, 26, 1.4);
              s.invulnFrames = INVULN_FRAMES;
              setLives((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                  setPhase("dead");
                  setHighScore((prevHigh) => {
                    if (s.score > prevHigh) {
                      window.localStorage.setItem(HIGH_SCORE_KEY, String(s.score));
                      return s.score;
                    }
                    return prevHigh;
                  });
                }
                return Math.max(0, next);
              });
              break;
            }
          }
        }

        setScore(s.score);
        setPowerupStatus({ rapid: s.rapidFireFrames, shield: s.shieldFrames, multi: s.multiShotFrames });

        if (s.enemies.every((e) => !e.alive)) {
          setPhase("cleared");
          setHighScore((prevHigh) => {
            if (s.score > prevHigh) {
              window.localStorage.setItem(HIGH_SCORE_KEY, String(s.score));
              return s.score;
            }
            return prevHigh;
          });
        }
      }

      // Particles always update/draw so death bursts play out
      s.particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.96;
        particle.vy *= 0.96;
        particle.life -= 1;
      });
      s.particles = s.particles.filter((particle) => particle.life > 0);

      // Ground shadows (drawn first, beneath everything, to sell elevation)
      s.enemies.forEach((e) => {
        if (!e.alive) return;
        const t = e.hp / ENEMY_HP;
        const r = ENEMY_RADIUS * (0.7 + t * 0.3);
        drawGroundShadow(ctx, e.x, e.y + r * 1.3, r * 1.15, r * 0.5, 0.35);
      });

      // Draw tethers + enemies
      s.enemies.forEach((e) => {
        if (!e.alive) return;
        ctx.strokeStyle = e.color + "55";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(e.anchorX, e.anchorY);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.save();
        ctx.translate(e.x, e.y);
        const t = e.hp / ENEMY_HP;
        const r = ENEMY_RADIUS * (0.7 + t * 0.3);
        ctx.rotate(e.phase);
        const grad = ctx.createLinearGradient(-r, -r, r, r);
        grad.addColorStop(0, lighten(e.color, 0.55));
        grad.addColorStop(0.5, e.color);
        grad.addColorStop(1, darken(e.color, 0.5));
        ctx.fillStyle = grad;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
      });

      // Draw bullets — glowing plasma orbs
      s.bullets.forEach((b) => {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, BULLET_RADIUS * 1.8);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.4, lighten(primaryHex, 0.3));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS * 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw powerups — spinning coin effect via horizontal squash
      s.powerups.forEach((p) => {
        const def = POWERUP_DEFS[p.type];
        const pulse = 0.85 + Math.sin(p.phase) * 0.15;
        const fading = p.life < 90 ? Math.max(0.25, (p.life % 20) / 20) : 1;
        const spinScale = Math.cos(p.phase);

        drawGroundShadow(ctx, p.x, p.y + POWERUP_RADIUS * 1.4, POWERUP_RADIUS * 1.2, POWERUP_RADIUS * 0.5, 0.3 * fading);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(Math.max(0.15, Math.abs(spinScale)), 1);
        ctx.globalAlpha = fading;
        const grad = ctx.createRadialGradient(-POWERUP_RADIUS * 0.3, -POWERUP_RADIUS * 0.3, 1, 0, 0, POWERUP_RADIUS * pulse);
        grad.addColorStop(0, lighten(def.color, 0.6));
        grad.addColorStop(0.6, def.color);
        grad.addColorStop(1, darken(def.color, 0.35));
        ctx.fillStyle = grad;
        ctx.strokeStyle = def.color;
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, POWERUP_RADIUS * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (spinScale > 0) {
          ctx.scale(1 / Math.max(0.15, Math.abs(spinScale)), 1);
          ctx.font = "bold 13px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#0a0a0a";
          ctx.shadowBlur = 0;
          ctx.fillText(def.label, 0, 1);
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw particles — small glowing embers
      s.particles.forEach((particle) => {
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        const grad = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 1.6);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.45, particle.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      drawShip();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener("resize", resize);
    };
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.code === "Escape") {
        onClose();
      } else if (e.code === "Space") {
        e.preventDefault();
        startOrRestart();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, phase]);

  useEffect(() => {
    if (!open) {
      stopAmbience();
      restoreTargets();
      stateRef.current = null;
      pointerRef.current = { x: -9999, y: -9999 };
      lastPosRef.current = { x: -9999, y: -9999 };
      shipAngleRef.current = -Math.PI / 2;
      firingRef.current = false;
      darkAlphaRef.current = 0;
      setPhase("idle");
      setScore(0);
      setLives(START_LIVES);
      setPowerupStatus({ rapid: 0, shield: 0, multi: 0 });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const stopFiring = () => {
      firingRef.current = false;
    };
    window.addEventListener("pointerup", stopFiring);
    window.addEventListener("pointercancel", stopFiring);
    return () => {
      window.removeEventListener("pointerup", stopFiring);
      window.removeEventListener("pointercancel", stopFiring);
    };
  }, [open]);

  const handlePointerMove = (e) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = () => {
    getAudioContext();
    if (phase !== "playing") {
      startOrRestart();
      return;
    }
    firingRef.current = true;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9995]"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ cursor: "none" }}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
          />

          <div className="pointer-events-none fixed inset-x-0 top-0 flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Easter Egg · Grid Defense
            </span>
            <div className="flex items-center gap-4 font-mono text-xs text-foreground">
              {powerupStatus.rapid > 0 && (
                <span style={{ color: POWERUP_DEFS.rapid.color }}>
                  ⚡ {Math.ceil(powerupStatus.rapid / 60)}s
                </span>
              )}
              {powerupStatus.shield > 0 && (
                <span style={{ color: POWERUP_DEFS.shield.color }}>
                  🛡 {Math.ceil(powerupStatus.shield / 60)}s
                </span>
              )}
              {powerupStatus.multi > 0 && (
                <span style={{ color: POWERUP_DEFS.multi.color }}>
                  ✳ {Math.ceil(powerupStatus.multi / 60)}s
                </span>
              )}
              <span>Score {score}</span>
              <span>Best {highScore}</span>
              <span className="flex items-center gap-1">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${i < lives ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close game"
            className="pointer-events-auto fixed right-4 top-3 rounded-full border border-border bg-card/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-primary sm:right-6"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {phase === "idle" && (
            <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-2 bg-background/30 text-center">
              <p className="rounded-2xl border border-border bg-card/90 px-6 py-4 font-mono text-sm text-foreground backdrop-blur">
                Move to fly · hold to fire
                <br />
                <span className="text-xs text-muted-foreground">
                  The grid is alive — clear every card. Grab glowing powerups for an edge. Click to start.
                </span>
              </p>
            </div>
          )}

          {phase === "cleared" && (
            <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-2 bg-background/30 text-center">
              <p className="rounded-2xl border border-border bg-card/90 px-6 py-4 font-mono text-sm text-foreground backdrop-blur">
                Grid Cleared! Score {score}
                <br />
                <span className="text-xs text-muted-foreground">Click or press Space to play again</span>
              </p>
            </div>
          )}

          {phase === "dead" && (
            <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-2 bg-background/30 text-center">
              <p className="rounded-2xl border border-border bg-card/90 px-6 py-4 font-mono text-sm text-foreground backdrop-blur">
                Grid Breached — Score {score}
                <br />
                <span className="text-xs text-muted-foreground">Click or press Space to retry</span>
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
