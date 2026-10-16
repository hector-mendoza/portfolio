export type RenderTier =
  | { kind: "full"; fps: 60; scale: 1; dprCap: 2 }
  | { kind: "calm"; fps: 24; scale: 0.5; dprCap: 1 };

export type Activity =
  | { kind: "active"; until: number }
  | { kind: "idle" };

export type FrameBudget = { targetFps: number; lastDraw: number };

export const IDLE_FPS = 4;
export const ACTIVE_MS = 1500;

type Subscriber = (now: number) => void;

let activity: Activity = { kind: "idle" };

let scenePaused = false;
let nativeRafId: number | null = null;
const subscribers = new Map<symbol, Subscriber>();
const oneShots = new Map<number, FrameRequestCallback>();
let nextOneShotId = 1;

let nativeRafScheduleCount = 0;
let nativeRafTickCount = 0;

/** Playwright / QA: tick counts attributed to allowlisted effect sources. */
const effectRafTicks: Record<string, number> = {};
const effectRafPending: Record<string, number> = {};

const RAF_EFFECT_SOURCES = [
  "lib/scene/schedule.ts",
  "components/SpotlightCard.jsx",
  "components/Magnet.jsx",
  "components/block/rectangular-text-reveal.jsx",
  "components/block/text-fill-animation.jsx",
  "components/ClickSpark.jsx",
  "lib/hairline-ambient.js",
  "public/vendor/hairline-kernel.js",
] as const;

function publishEffectRafMetrics(): void {
  for (const key of RAF_EFFECT_SOURCES) {
    if (!(key in effectRafTicks)) effectRafTicks[key] = 0;
    if (!(key in effectRafPending)) effectRafPending[key] = 0;
  }
  publishEffectRafMetricsWindow();
}

function publishEffectRafMetricsWindow(): void {
  if (typeof window === "undefined") return;
  (
    window as Window & {
      __EFFECT_RAF_TICKS__?: Record<string, number>;
      __EFFECT_RAF_PENDING__?: Record<string, number>;
    }
  ).__EFFECT_RAF_TICKS = { ...effectRafTicks };
  (
    window as Window & {
      __EFFECT_RAF_PENDING__?: Record<string, number>;
    }
  ).__EFFECT_RAF_PENDING = { ...effectRafPending };
}

function noteEffectTick(source: string): void {
  effectRafTicks[source] = (effectRafTicks[source] ?? 0) + 1;
  publishEffectRafMetricsWindow();
}

export function noteEffectRafPending(
  source: string,
  delta: number
): void {
  effectRafPending[source] = Math.max(
    0,
    (effectRafPending[source] ?? 0) + delta
  );
  publishEffectRafMetricsWindow();
}

/** @internal QA — reset per-file counters between Playwright phases. */
export function __test_resetEffectRafMetrics(): void {
  for (const key of Object.keys(effectRafTicks)) delete effectRafTicks[key];
  for (const key of Object.keys(effectRafPending)) delete effectRafPending[key];
  publishEffectRafMetricsWindow();
}

export function detectTier(): RenderTier {
  if (typeof window === "undefined") {
    return { kind: "full", fps: 60, scale: 1, dprCap: 2 };
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  if (coarse || narrow) {
    return { kind: "calm", fps: 24, scale: 0.5, dprCap: 1 };
  }
  return { kind: "full", fps: 60, scale: 1, dprCap: 2 };
}

export function noteActivity(now: number): void {
  activity = { kind: "active", until: now + ACTIVE_MS };
}

export function getActivity(now: number): Activity {
  if (activity.kind === "active" && now >= activity.until) {
    activity = { kind: "idle" };
  }
  return activity;
}

/** @internal Vitest */
export function __test_resetScheduleState(): void {
  activity = { kind: "idle" };
  scenePaused = false;
  if (nativeRafId !== null) {
    globalThis.cancelAnimationFrame(nativeRafId);
    nativeRafId = null;
  }
  subscribers.clear();
  oneShots.clear();
  nativeRafScheduleCount = 0;
  nativeRafTickCount = 0;
  __test_resetEffectRafMetrics();
}

export function effectiveTargetFps(
  tier: RenderTier,
  act: Activity,
  now: number
): number {
  const resolved =
    act.kind === "active" && now < act.until ? act : { kind: "idle" as const };
  if (resolved.kind === "active") return tier.fps;
  return IDLE_FPS;
}

export function shouldDraw(
  now: number,
  budget: FrameBudget,
  tier: RenderTier,
  act: Activity
): boolean {
  const targetFps = effectiveTargetFps(tier, act, now);
  const minInterval = 1000 / targetFps;
  if (budget.lastDraw < 0) return true;
  return now - budget.lastDraw >= minInterval - 0.25;
}

export function markDraw(
  now: number,
  budget: FrameBudget,
  tier: RenderTier,
  act: Activity
): void {
  budget.lastDraw = now;
  budget.targetFps = effectiveTargetFps(tier, act, now);
}

function publishDebug(): void {
  if (typeof window === "undefined") return;
  (
    window as Window & {
      __SCENE_RAF_ID?: number | null;
      __SCHEDULE_NATIVE_RAF_PENDING?: boolean;
      __SCHEDULE_NATIVE_RAF_SCHEDULES?: number;
      __SCHEDULE_NATIVE_RAF_TICKS?: number;
    }
  ).__SCENE_RAF_ID = nativeRafId;
  (
    window as Window & {
      __SCHEDULE_NATIVE_RAF_PENDING?: boolean;
      __SCHEDULE_NATIVE_RAF_SCHEDULES?: number;
      __SCHEDULE_NATIVE_RAF_TICKS?: number;
    }
  ).__SCHEDULE_NATIVE_RAF_PENDING = nativeRafId !== null;
  (
    window as Window & {
      __SCHEDULE_NATIVE_RAF_SCHEDULES?: number;
    }
  ).__SCHEDULE_NATIVE_RAF_SCHEDULES = nativeRafScheduleCount;
  (
    window as Window & {
      __SCHEDULE_NATIVE_RAF_TICKS?: number;
    }
  ).__SCHEDULE_NATIVE_RAF_TICKS = nativeRafTickCount;
}

function scheduleNativeIfNeeded(): void {
  if (scenePaused) return;
  if (nativeRafId !== null) return;
  if (subscribers.size === 0 && oneShots.size === 0) return;
  nativeRafScheduleCount += 1;
  nativeRafId = globalThis.requestAnimationFrame(nativeTick);
  publishDebug();
}

function nativeTick(now: number): void {
  nativeRafId = null;
  nativeRafTickCount += 1;
  noteEffectTick("lib/scene/schedule.ts");
  if (scenePaused) {
    publishDebug();
    return;
  }

  const pendingOneShots = [...oneShots.entries()];
  oneShots.clear();
  for (const [, cb] of pendingOneShots) {
    cb(now);
  }

  for (const fn of subscribers.values()) {
    fn(now);
  }

  publishDebug();
  scheduleNativeIfNeeded();
}

/** Scene hidden/offscreen: cancel native rAF and schedule nothing until resumed. */
export function setSceneSchedulerPaused(paused: boolean): void {
  scenePaused = paused;
  if (paused && nativeRafId !== null) {
    globalThis.cancelAnimationFrame(nativeRafId);
    nativeRafId = null;
  } else if (!paused) {
    scheduleNativeIfNeeded();
  }
  publishDebug();
}

export function subscribe(fn: Subscriber): () => void {
  const id = Symbol("schedule-subscriber");
  subscribers.set(id, fn);
  scheduleNativeIfNeeded();
  return () => {
    subscribers.delete(id);
  };
}

export function requestAnimationFrame(cb: FrameRequestCallback): number {
  const id = nextOneShotId++;
  oneShots.set(id, cb);
  scheduleNativeIfNeeded();
  return id;
}

export function cancelAnimationFrame(id: number): void {
  oneShots.delete(id);
}

export function getNativeRafPending(): boolean {
  return nativeRafId !== null;
}

/** @internal Vitest */
export function __test_getNativeRafScheduleCount(): number {
  return nativeRafScheduleCount;
}

/** @internal Vitest */
export function __test_getNativeRafTickCount(): number {
  return nativeRafTickCount;
}

if (typeof window !== "undefined") {
  publishEffectRafMetrics();
  (
    window as Window & {
      __portfolioScheduleFrame?: (cb: FrameRequestCallback) => number;
    }
  ).__portfolioScheduleFrame = requestAnimationFrame;
}
