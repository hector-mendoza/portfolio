import * as THREE from "three";
import {
  LIVE_PLACE,
  TIME_PRESETS,
  WEATHER_KINDS,
  formatClock,
  lerp,
  liveUrl,
  localHour,
  parseLive,
  phaseLabel,
  skyPhase,
  smoothstep,
  sunPosition,
  weatherFromLive,
} from "../environment.js";
import { Rain, Snow } from "./weather-fx.js";

const RAD = Math.PI / 180;
const C = (hex) => new THREE.Color(hex);

const PALETTE = {
  day: { top: C("#3f8fe8"), horizon: C("#cfeaff"), bottom: C("#9fd4ff"), sun: C("#fff3c4"), hemiSky: C("#cfe9ff"), hemiGround: C("#7a9a52") },
  golden: { top: C("#5a78c8"), horizon: C("#ffb677"), bottom: C("#e6a06a"), sun: C("#ffae55"), hemiSky: C("#ffd2a8"), hemiGround: C("#8a7048") },
  night: { top: C("#060c24"), horizon: C("#1a2a5c"), bottom: C("#0b1530"), sun: C("#e9eefc"), hemiSky: C("#1a2a55"), hemiGround: C("#0a0a12") },
};

const STORAGE_KEY = "pilleland-live-weather";
const CACHE_MS = 10 * 60 * 1000;
const REFRESH_MS = 15 * 60 * 1000;

const mix3 = (out, a, b, t) => out.copy(a).lerp(b, t);
const GRAY = new THREE.Vector3(0.3, 0.59, 0.11);

/** Pulls colours toward their own gray: overcast and rain drain the sky. */
function desaturate(color, amount, darken = 0) {
  const g = color.r * GRAY.x + color.g * GRAY.y + color.b * GRAY.z;
  color.r = lerp(color.r, g * 0.92, amount) * (1 - darken);
  color.g = lerp(color.g, g * 0.95, amount) * (1 - darken);
  color.b = lerp(color.b, g * 1.0, amount) * (1 - darken);
  return color;
}

/**
 * Drives everything that depends on the sky: time of day from the real sun at
 * the live place (or a manual preset), weather from Open-Meteo (or a preset),
 * and applies it smoothly to lights, sky, fog, clouds, precipitation,
 * lightning, wet plastic, street lamps and sound.
 */
export class EnvironmentController {
  constructor(app) {
    this.app = app;
    this.timeMode = "live";
    this.weatherMode = "live";
    this.live = null;
    this.liveStatus = "loading"; // loading | ok | offline
    this.cur = { day: 1, golden: 0, cloud: 0.12, rain: 0, snow: 0, fog: 0, storm: 0 };
    this.bodyDir = new THREE.Vector3(0.5, 0.7, 0.4).normalize();
    this.lightDir = new THREE.Vector3(0.5, 0.7, 0.4).normalize();
    this.flash = 0;
    this.nextFlash = 4 + Math.random() * 5;
    this.snap = true;
    this.pub = { next: 0, json: "" };
    this.rainT = 0;
    this.umbrellas = false;
    this.lastNight = -1;
    this.lastWet = -1;
    this.target = { elevation: 50, azimuth: 205, kind: "clear", w: WEATHER_KINDS.clear };

    const low = app.quality === "low";
    this.rain = new Rain(low ? 1800 : 4200);
    this.snow = new Snow(low ? 1500 : 3600);
    app.scene.add(this.rain.object, this.snow.object);
    app.sunDisc.material.transparent = true;

    this._c = { a: new THREE.Color(), b: new THREE.Color(), top: new THREE.Color(), horizon: new THREE.Color(), bottom: new THREE.Color(), sun: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color() };
  }

  /* ------------------------------------------------------------ inputs */

  setTimeMode(mode) {
    this.timeMode = mode;
    this.publish(true);
  }

  setWeatherMode(mode) {
    this.weatherMode = mode;
    this.publish(true);
  }

  async fetchLive() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (cached && Date.now() - cached.t < CACHE_MS && cached.live) {
        this.live = cached.live;
        this.liveStatus = "ok";
        this.publish(true);
        return;
      }
    } catch {
      /* private mode */
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(liveUrl(), { signal: ctrl.signal });
      if (!res.ok) throw new Error(`weather ${res.status}`);
      const live = parseLive(await res.json());
      if (!live) throw new Error("bad weather payload");
      this.live = live;
      this.liveStatus = "ok";
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ t: Date.now(), live }));
      } catch {
        /* ignore */
      }
      this.publish(true);
    } catch {
      if (!this.live) {
        this.liveStatus = "offline";
        // the first attempt often collides with the heavy city build: try again soon
        if (!this.retried) {
          this.retried = true;
          this.retryTimer = setTimeout(() => this.fetchLive(), 20000);
        }
      }
      this.publish(true);
    } finally {
      clearTimeout(timer);
    }
  }

  start() {
    this.fetchLive();
    this.refresh = setInterval(() => this.fetchLive(), REFRESH_MS);
  }

  /* ------------------------------------------------------------ targets */

  computeTarget() {
    const now = new Date();
    let elevation;
    let azimuth;
    if (this.timeMode === "live") {
      ({ elevation, azimuth } = sunPosition(now));
    } else {
      ({ elevation, azimuth } = TIME_PRESETS[this.timeMode]);
    }
    let kind;
    let w;
    if (this.weatherMode === "live") {
      const lw = this.live ? weatherFromLive(this.live) : { kind: "clear", ...WEATHER_KINDS.clear };
      kind = lw.kind;
      w = lw;
    } else {
      kind = this.weatherMode;
      w = WEATHER_KINDS[kind];
    }
    this.target = { elevation, azimuth, kind, w, now };
    return this.target;
  }

  /* ------------------------------------------------------------ frame */

  update(dt) {
    const app = this.app;
    const nowMs = performance.now();
    const real = Math.min(1, (nowMs - (this.lastT ?? nowMs)) / 1000); // wall-clock, so slow frames still finish a fade on time
    this.lastT = nowMs;
    const { elevation, azimuth, w } = this.computeTarget();
    const { day, golden } = skyPhase(elevation);
    const goal = { day, golden, cloud: w.cloud, rain: w.rain, snow: w.snow, fog: w.fog, storm: w.storm };
    const k = this.snap ? 1 : 1 - Math.exp(-real * 1.3);
    for (const key of Object.keys(goal)) this.cur[key] = lerp(this.cur[key], goal[key], k);
    this.snap = false;
    const s = this.cur;
    const c = this._c;

    // lightning
    if (s.storm > 0.5 && !app.reducedMotion) {
      this.nextFlash -= dt;
      if (this.nextFlash <= 0) {
        this.flash = 1;
        this.nextFlash = 4 + Math.random() * 8;
        if (Math.random() < 0.45) setTimeout(() => (this.flash = 0.85), 140);
        setTimeout(() => app.sounds.thunder(), 500 + Math.random() * 1800);
      }
    }
    this.flash = Math.max(0, this.flash - dt * 3.2);

    // palette: night <-> day, with a warm band near the horizon, then overcast
    const nightToDay = (field, out) => mix3(out, PALETTE.night[field], PALETTE.day[field], s.day);
    const warm = (field, out) => mix3(out, out, PALETTE.golden[field], s.golden * 0.9);
    const overcast = Math.min(0.92, s.cloud * 0.74 + s.rain * 0.18 + s.snow * 0.08);
    const darken = s.rain * 0.3 + s.storm * 0.28;
    for (const field of ["top", "horizon", "bottom", "sun", "hemiSky", "hemiGround"]) {
      warm(field, nightToDay(field, c[field]));
      if (field !== "sun") desaturate(c[field], overcast, darken);
    }
    // fog bleaches the sky toward the horizon colour
    if (s.fog > 0.05) {
      c.top.lerp(c.horizon, s.fog * 0.7);
      c.bottom.lerp(c.horizon, s.fog * 0.7);
    }
    // lightning flash lifts everything toward white-blue
    if (this.flash > 0) {
      c.top.lerp(C("#dfe8ff"), this.flash * 0.5);
      c.horizon.lerp(C("#ffffff"), this.flash * 0.6);
    }

    // celestial body: sun while it is up, the moon after
    const sunUp = elevation > -3;
    const bodyEl = (sunUp ? Math.max(elevation, 2) : 42) * RAD;
    const bodyAz = (sunUp ? azimuth : 205) * RAD;
    const target = new THREE.Vector3(Math.cos(bodyEl) * Math.sin(bodyAz), Math.sin(bodyEl), -Math.cos(bodyEl) * Math.cos(bodyAz));
    this.bodyDir.lerp(target, 1 - Math.exp(-real * 2.5)).normalize();
    const lightEl = Math.max(sunUp ? elevation : 40, 15) * RAD;
    this.lightDir
      .lerp(new THREE.Vector3(Math.cos(lightEl) * Math.sin(bodyAz), Math.sin(lightEl), -Math.cos(lightEl) * Math.cos(bodyAz)), 1 - Math.exp(-real * 2.5))
      .normalize();

    // lights
    const sunStrength = lerp(0.22, 2.8, s.day) * (1 - 0.68 * s.cloud) * (1 - 0.3 * s.rain);
    app.sun.color.copy(c.sun);
    app.sun.intensity = sunStrength;
    app.hemi.color.copy(c.hemiSky);
    app.hemi.groundColor.copy(c.hemiGround);
    app.hemi.intensity = lerp(0.45, 0.9, s.day) + s.cloud * 0.25 * s.day + this.flash * 3.2;
    app.fill.intensity = lerp(0.12, 0.5, s.day) * (1 - 0.5 * s.cloud);
    app.renderer.toneMappingExposure = lerp(0.9, 1.0, s.day) * (1 - 0.1 * s.rain - 0.12 * s.storm);
    app.scene.environmentIntensity = lerp(0.1, 1, s.day) * (1 - 0.45 * s.cloud) + this.flash * 0.9;

    // sky + fog
    const u = app.sky.uniforms;
    u.topColor.value.copy(c.top);
    u.horizonColor.value.copy(c.horizon);
    u.bottomColor.value.copy(c.bottom);
    u.sunDir.value.copy(this.bodyDir);
    u.sunColor.value.copy(c.sun);
    u.glow.value = (lerp(0.12, 0.35, s.day) + s.golden * 0.45) * (1 - 0.8 * s.cloud);
    u.sunSize.value = lerp(0.006, 0.012, s.day);
    u.stars.value = (1 - smoothstep(0.2, 0.65, s.day)) * (1 - 0.95 * s.cloud);
    app.scene.background.copy(c.horizon);
    app.scene.fog.color.copy(c.horizon);
    app.scene.fog.near = lerp(180, 40, s.fog) * (1 - 0.35 * s.rain);
    app.scene.fog.far = lerp(560, 260, s.fog) * (1 - 0.3 * s.rain - 0.25 * s.snow);
    app.sunDisc.position.copy(this.bodyDir).multiplyScalar(430);
    app.sunDisc.material.color.copy(sunUp ? c.sun : PALETTE.night.sun);
    app.sunDisc.material.opacity = 1 - smoothstep(0.5, 0.9, s.cloud);
    app.sunDisc.visible = app.sunDisc.material.opacity > 0.02;

    // clouds
    app.clouds.setCover(s.cloud, Math.min(1, s.rain * 0.85 + s.storm * 0.4 + (1 - s.day) * 0.55), warmTint(s.golden, s.day));

    // lamps and windows
    const level = THREE.MathUtils.clamp(Math.max(1 - smoothstep(0.22, 0.62, s.day), s.storm * 0.55, s.rain * s.cloud * 0.18), 0, 1);
    if (Math.abs(level - this.lastNight) > 0.01) {
      this.lastNight = level;
      app.mats.setNight(level);
      app.nightLights.setLevel(level, app.scene);
    }
    const wet = Math.max(s.rain, s.snow * 0.25);
    if (Math.abs(wet - this.lastWet) > 0.01) {
      this.lastWet = wet;
      app.mats.setWet(wet);
    }

    // precipitation + umbrellas + rain sound
    const h = app.renderer.domElement.height || 800;
    const dpr = app.renderer.getPixelRatio();
    this.rain.update(dt * (app.reducedMotion ? 0.5 : 1), app.camera, s.rain, h / dpr);
    this.snow.update(dt * (app.reducedMotion ? 0.5 : 1), app.camera, s.snow, h / dpr);
    const umbrellas = s.rain > 0.3;
    if (umbrellas !== this.umbrellas) {
      this.umbrellas = umbrellas;
      app.citizens.setRain(umbrellas);
    }
    this.rainT -= dt;
    if (this.rainT <= 0) {
      this.rainT = 0.3;
      app.sounds.rain(s.rain * 0.85 + s.storm * 0.15);
    }

    this.publish(false);
  }

  /* ------------------------------------------------------------ HUD state */

  publish(force) {
    const t = performance.now();
    if (!force && t < this.pub.next) return;
    this.pub.next = t + 500;
    const { elevation, now, kind } = this.target;
    const date = now ?? new Date();
    const sky = {
      timeMode: this.timeMode,
      weatherMode: this.weatherMode,
      kind,
      weatherLabel: WEATHER_KINDS[kind].label,
      phase: this.timeMode === "live" ? phaseLabel(elevation, localHour(date)) : { day: "Day", dusk: "Sunset", night: "Night" }[this.timeMode],
      clock: this.timeMode === "live" ? formatClock(date) : null,
      temp: this.live && this.weatherMode === "live" ? Math.round(this.live.temp) : null,
      place: LIVE_PLACE.name,
      status: this.liveStatus,
      dark: this.cur.day < 0.4,
    };
    const json = JSON.stringify(sky);
    if (json !== this.pub.json) {
      this.pub.json = json;
      this.app.setState({ sky, night: sky.dark });
    }
  }

  dispose() {
    clearInterval(this.refresh);
    clearTimeout(this.retryTimer);
    this.rain.dispose();
    this.snow.dispose();
  }
}

const _tint = new THREE.Color();
function warmTint(golden, day) {
  // clouds catch the sunset glow; at night they stay neutral-dark
  _tint.set("#ffffff").lerp(C("#ffb07a"), golden * 0.7 * day + golden * 0.3);
  return _tint;
}
