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
  null
);

let sceneRenderer: SceneRenderer | null = null;
let sceneLoopRaf = 0;
let canvasMounted = false;

const sectionElements = new Map<SectionId, Element>();
const sectionRatios = new Map<SectionId, number>();
let scrollRaf: number | null = null;
let pendingScrollProgress: number | null = null;

function emit() {
  listeners.forEach((l) => l());
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

  let best: SectionId = activeSection;
  let bestRatio = -1;
  for (const [id, ratio] of sectionRatios) {
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = id;
    }
  }
  if (bestRatio <= 0 && sectionElements.size === 0) {
    if (state.phase !== "idle" && state.phase !== "paused") {
      state = { phase: "idle" };
      emit();
    }
    reconcileSceneLoop();
    return;
  }

  activeSection = best;
  uniforms = themeUniforms(
    DEFAULT_THEME_MAP[best],
    scrollProgress,
    pointer
  );

  if (state.phase === "paused") return;

  state = {
    phase: "running",
    section: best,
    progress: scrollProgress,
  };
  reconcileSceneLoop();
  emit();
}

function shouldRunSceneLoop(): boolean {
  if (!sceneRenderer || capability?.kind !== "living") return false;
  if (state.phase === "paused" || state.phase === "disabled") return false;
  return true;
}

function reconcileSceneLoop() {
  cancelAnimationFrame(sceneLoopRaf);
  sceneLoopRaf = 0;
  if (!shouldRunSceneLoop()) {
    sceneRenderer?.pause();
    return;
  }

  const tick = () => {
    if (!shouldRunSceneLoop()) {
      sceneLoopRaf = 0;
      sceneRenderer?.pause();
      return;
    }
    sceneRenderer?.frame(getSceneUniforms());
    sceneLoopRaf = requestAnimationFrame(tick);
  };
  sceneLoopRaf = requestAnimationFrame(tick);
}

export function initSceneStore(): Capability {
  if (capability) return capability;
  const cap = detectCapability();
  applyCapability(cap);
  return cap;
}

function ensureInitialized(): void {
  if (typeof window !== "undefined" && capability === null) {
    initSceneStore();
  }
}

export function getSceneState(): SceneState {
  ensureInitialized();
  return state;
}

export function getSceneCapability(): Capability | null {
  ensureInitialized();
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
  ensureInitialized();
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
  const clamped = Math.min(1, Math.max(0, p));
  pendingScrollProgress = clamped;
  if (scrollRaf != null) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    if (pendingScrollProgress == null) return;
    scrollProgress = pendingScrollProgress;
    pendingScrollProgress = null;
    if (state.phase === "running") {
      state = { ...state, progress: scrollProgress };
      uniforms = themeUniforms(
        DEFAULT_THEME_MAP[state.section],
        scrollProgress,
        pointer
      );
      emit();
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
  if (paused) {
    if (state.phase !== "paused") {
      state = { phase: "paused", cause };
      reconcileSceneLoop();
      emit();
    }
  } else if (state.phase === "paused" && state.cause === cause) {
    recomputeRunningSection();
  }
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
