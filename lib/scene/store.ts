"use client";

import { useSyncExternalStore } from "react";
import { detectCapability } from "./capability";
import { DEFAULT_THEME_MAP, themeToUniforms, type SceneUniforms } from "./uniforms";
import type { Capability, SceneState, SectionId } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();

let capability: Capability | null = null;
let state: SceneState = { phase: "idle" };
let scrollProgress = 0;
let activeSection: SectionId = "hero";
let uniforms: SceneUniforms = themeToUniforms(
  DEFAULT_THEME_MAP.hero,
  0,
  0,
  [1, 1]
);

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
    return;
  }

  activeSection = best;
  const theme = DEFAULT_THEME_MAP[best];
  uniforms = themeToUniforms(theme, scrollProgress, uniforms.uTime, uniforms.uResolution);

  if (state.phase === "paused") return;

  state = {
    phase: "running",
    section: best,
    progress: scrollProgress,
  };
  emit();
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
      uniforms = themeToUniforms(
        DEFAULT_THEME_MAP[state.section],
        scrollProgress,
        uniforms.uTime,
        uniforms.uResolution
      );
      emit();
    } else {
      recomputeRunningSection();
    }
  });
}

export function setScenePaused(cause: "hidden" | "offscreen", paused: boolean): void {
  if (capability?.kind !== "living") return;
  if (paused) {
    if (state.phase !== "paused") {
      state = { phase: "paused", cause };
      emit();
    }
  } else if (state.phase === "paused" && state.cause === cause) {
    recomputeRunningSection();
  }
}

export function setUniformTime(time: number): void {
  uniforms = { ...uniforms, uTime: time };
}

export function setUniformResolution(width: number, height: number): void {
  uniforms = {
    ...uniforms,
    uResolution: [width, height],
  };
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
