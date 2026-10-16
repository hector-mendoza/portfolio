"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let installed = false;
let gsapPaused = false;

/** Detach GSAP from its native ticker; updates run from the scene loop only. */
export function installGsapOnSceneScheduler(): void {
  if (typeof window === "undefined" || installed) return;
  installed = true;

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.remove(gsap.updateRoot);
  gsap.ticker.sleep();
}

export function tickGsapScene(timeMs: number): void {
  if (!installed || gsapPaused) return;
  gsap.updateRoot(timeMs / 1000);
  ScrollTrigger.update();
}

export function setGsapScenePaused(paused: boolean): void {
  if (typeof window === "undefined" || !installed) return;
  gsapPaused = paused;
  if (paused) {
    gsap.ticker.sleep();
    ScrollTrigger.disable();
  } else {
    gsap.ticker.wake();
    ScrollTrigger.enable();
  }
}
