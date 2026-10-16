"use client";

import { useSyncExternalStore } from "react";
import { detectCapability } from "./capability";
import {
  DEFAULT_THEME_MAP,
  themeUniforms,
  type ScenePointer,
  type SceneUniforms,
} from "./uniforms";
import type { SceneRenderer } from "./renderer";
import {
  detectTier,
  getActivity,
  getNativeRafPending,
  markDraw,
  noteActivity,
  requestAnimationFrame as scheduleRequestAnimationFrame,
  setSceneSchedulerPaused,
  shouldDraw,
  subscribe,
  type FrameBudget,
} from "./schedule";
import type { Capability, SceneState, SectionId } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();

let capability: Capability | null = null;
let state: SceneState = { phase: "idle" };
let scrollProgress = 0;
let activeSection: SectionId = "hero";
let pointer: ScenePointer | null = null;
let uniforms: SceneUniforms = themeUniforms(
  DEFAULT_THEME_MAP.hero,
  0,
  null,
  "hero"
);

let sceneRenderer: SceneRenderer | null = null;
let unsubscribeSceneLoop: (() => void) | null = null;
let canvasMounted = false;
let pauseHidden = false;
let pauseOffscreen = false;

let frameCallCount = 0;
const frameBudget: FrameBudget = { targetFps: 60, lastDraw: -1 };
/** Hold the rAF loop until LCP (or timeout) so hero text is not competing with WebGL on the main thread. */
let sceneLoopGateOpen = false;
let sceneLoopGateScheduled = false;

const sectionElements = new Map<SectionId, Element>();
const sectionRatios = new Map<SectionId, number>();
let scrollRaf: number | null = null;
let pendingScrollProgress: number | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function isScenePausedByCause(): boolean {
  return pauseHidden || pauseOffscreen;
}

function shouldRunSceneLoop(): boolean {
  if (!sceneRenderer || capability?.kind !== "living") return false;
  if (state.phase === "disabled") return false;
  if (!sceneLoopGateOpen) return false;
  if (isScenePausedByCause() || state.phase === "paused") return false;
  return true;
}

function openSceneLoopGate(): void {
  if (sceneLoopGateOpen) return;
  sceneLoopGateOpen = true;
  reconcileSceneLoop();
}

function scheduleSceneLoopGate(): void {
  if (sceneLoopGateScheduled || typeof window === "undefined") return;
  sceneLoopGateScheduled = true;
  let opened = false;
  const done = () => {
    if (opened) return;
    opened = true;
    openSceneLoopGate();
  };

  try {
    const po = new PerformanceObserver(() => {
      done();
      po.disconnect();
    });
    po.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // LCP observer unavailable
  }

  window.setTimeout(done, 3500);
}

function publishSceneLoopDebug(): void {
  if (typeof window === "undefined") return;
  (
    window as Window & { __SCENE_FRAME_COUNT?: number; __SCENE_RAF_ID?: number | null }
  ).__SCENE_FRAME_COUNT = frameCallCount;
  (
    window as Window & { __SCENE_RAF_ID?: number | null }
  ).__SCENE_RAF_ID = getNativeRafPending() ? 1 : null;
}

function pauseSceneLoop(): void {
  if (unsubscribeSceneLoop) {
    unsubscribeSceneLoop();
    unsubscribeSceneLoop = null;
  }
  publishSceneLoopDebug();
  sceneRenderer?.pause();
}

function sceneLoopTick(now: number): void {
  if (!shouldRunSceneLoop()) {
    pauseSceneLoop();
    sceneRenderer?.pause();
    return;
  }
  const tier = detectTier();
  const act = getActivity(now);
  sceneRenderer?.setTier(tier);

  if (shouldDraw(now, frameBudget, tier, act)) {
    markDraw(now, frameBudget, tier, act);
    frameCallCount += 1;
    sceneRenderer?.frame(getSceneUniforms());
  }

  publishSceneLoopDebug();
}

function resumeSceneLoop(): void {
  if (unsubscribeSceneLoop !== null) return;
  if (!shouldRunSceneLoop()) return;
  unsubscribeSceneLoop = subscribe(sceneLoopTick);
  publishSceneLoopDebug();
}

function reconcileSceneLoop(): void {
  pauseSceneLoop();
  resumeSceneLoop();
}

function applyCapability(cap: Capability) {
  capability = cap;
  if (cap.kind === "static") {
    state = { phase: "disabled", capability: cap };
  } else if (state.phase === "disabled") {
    state = { phase: "idle" };
  }
  reconcileSceneLoop();
  emit();
}

function recomputeRunningSection() {
  if (capability?.kind !== "living") return;

  if (isScenePausedByCause()) {
    if (state.phase !== "paused" && state.phase !== "disabled") {
      state = {
        phase: "paused",
        cause: pauseHidden ? "hidden" : "offscreen",
      };
      emit();
    }
    pauseSceneLoop();
    return;
  }

  let best: SectionId = activeSection;
  let bestRatio = -1;
  for (const [id, ratio] of sectionRatios) {
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = id;
    }
  }
  if (bestRatio <= 0 && sectionElements.size === 0) {
    if (isScenePausedByCause()) {
      if (state.phase !== "paused") {
        state = {
          phase: "paused",
          cause: pauseHidden ? "hidden" : "offscreen",
        };
        emit();
      }
      pauseSceneLoop();
      return;
    }
    if (state.phase !== "idle") {
      state = { phase: "idle" };
      emit();
    }
    reconcileSceneLoop();
    return;
  }

  const prevSection = activeSection;
  activeSection = best;
  if (prevSection !== best) {
    noteActivity(performance.now());
  }
  uniforms = themeUniforms(
    DEFAULT_THEME_MAP[best],
    scrollProgress,
    pointer,
    best
  );

  const prevPhase = state.phase;
  state = {
    phase: "running",
    section: best,
    progress: scrollProgress,
  };
  if (prevPhase !== "running") emit();
  reconcileSceneLoop();
}

export function initSceneStore(): Capability {
  if (capability) return capability;
  const cap = detectCapability();
  applyCapability(cap);
  return cap;
}

export function getSceneState(): SceneState {
  return state;
}

export function getSceneCapability(): Capability | null {
  return capability;
}

export function getSceneUniforms(): SceneUniforms {
  return uniforms;
}

export function attachSceneRenderer(renderer: SceneRenderer | null): void {
  if (sceneRenderer && sceneRenderer !== renderer) {
    sceneRenderer.dispose();
  }
  sceneRenderer = renderer;
  if (renderer) {
    sceneLoopGateOpen = false;
    sceneLoopGateScheduled = false;
    scheduleSceneLoopGate();
  } else {
    sceneLoopGateOpen = false;
    sceneLoopGateScheduled = false;
  }
  reconcileSceneLoop();
}

export function setSceneCanvasMounted(mounted: boolean): void {
  if (canvasMounted === mounted) return;
  canvasMounted = mounted;
  emit();
}

export function getSceneDataSceneAttribute(): string {
  if (typeof window === "undefined") {
    return "static:pending";
  }
  if (capability === null) {
    return "static:pending";
  }
  if (capability.kind === "static") {
    return `static:${capability.reason}`;
  }
  if (!canvasMounted || state.phase === "disabled") {
    return "static:pending";
  }
  return "living";
}

export function useSceneDataSceneAttribute(): string {
  return useSyncExternalStore(
    subscribeScene,
    getSceneDataSceneAttribute,
    () => "static:pending"
  );
}

export function subscribeScene(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setScrollProgress(p: number): void {
  noteActivity(performance.now());
  const clamped = Math.min(1, Math.max(0, p));
  pendingScrollProgress = clamped;
  if (scrollRaf != null) return;
  scrollRaf = scheduleRequestAnimationFrame(() => {
    scrollRaf = null;
    if (pendingScrollProgress == null) return;
    scrollProgress = pendingScrollProgress;
    pendingScrollProgress = null;
    if (state.phase === "running") {
      state = { ...state, progress: scrollProgress };
      uniforms = themeUniforms(
        DEFAULT_THEME_MAP[state.section],
        scrollProgress,
        pointer,
        state.section
      );
    } else {
      recomputeRunningSection();
    }
  });
}

export function setScenePointer(next: ScenePointer | null): void {
  pointer = next;
  uniforms = { ...uniforms, pointer: next };
}

export function setScenePaused(cause: "hidden" | "offscreen", paused: boolean): void {
  if (capability?.kind !== "living") return;
  if (cause === "hidden") {
    pauseHidden = paused;
    setSceneSchedulerPaused(paused);
  } else pauseOffscreen = paused;

  if (isScenePausedByCause()) {
    if (state.phase !== "paused" && state.phase !== "disabled") {
      state = {
        phase: "paused",
        cause: pauseHidden ? "hidden" : "offscreen",
      };
      emit();
    }
    pauseSceneLoop();
    return;
  }

  recomputeRunningSection();
}

export function registerSection(id: SectionId, el: Element | null): () => void {
  if (!el) return () => undefined;

  sectionElements.set(id, el);
  sectionRatios.set(id, 0);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        sectionRatios.set(id, entry.intersectionRatio);
      }
      recomputeRunningSection();
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
  );
  observer.observe(el);

  return () => {
    observer.disconnect();
    sectionElements.delete(id);
    sectionRatios.delete(id);
    recomputeRunningSection();
  };
}

export function useScene(): SceneState {
  return useSyncExternalStore(
    subscribeScene,
    getSceneState,
    () => ({ phase: "idle" } satisfies SceneState)
  );
}

export function useSceneDisabled(): boolean {
  return useSyncExternalStore(
    subscribeScene,
    () => getSceneState().phase === "disabled",
    () => false
  );
}

export function useSceneCapability(): Capability | null {
  return useSyncExternalStore(
    subscribeScene,
    getSceneCapability,
    () => null
  );
}

export function useSceneRunning(): boolean {
  const scene = useScene();
  return scene.phase === "running" || scene.phase === "paused";
}

/** @internal Vitest / diagnostics */
export function __test_getRafId(): number | null {
  return unsubscribeSceneLoop !== null ? 1 : null;
}

/** @internal Vitest / diagnostics */
export function __test_getFrameCallCount(): number {
  return frameCallCount;
}

/** @internal Vitest / diagnostics */
export function __test_resetSceneLoopMetrics(): void {
  frameCallCount = 0;
  frameBudget.lastDraw = -1;
  frameBudget.targetFps = 60;
}

/** @internal Vitest — reset module loop state without touching capability detection */
export function __test_attachMockRenderer(frame: () => void): SceneRenderer {
  const renderer: SceneRenderer = {
    mount: () => undefined,
    setTier: () => undefined,
    frame: () => frame(),
    pause: () => undefined,
    dispose: () => undefined,
  };
  capability = { kind: "living", dpr: 1 };
  state = { phase: "running", section: "hero", progress: 0 };
  pauseHidden = false;
  pauseOffscreen = false;
  noteActivity(performance.now() + 1_000_000);
  attachSceneRenderer(renderer);
  sceneLoopGateOpen = true;
  sceneLoopGateScheduled = true;
  reconcileSceneLoop();
  return renderer;
}

/** @internal Vitest */
export function __test_detachRenderer(): void {
  pauseSceneLoop();
  attachSceneRenderer(null);
}
