import type { Capability } from "./types";

let cached: Capability | null = null;

function probeWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return gl != null;
  } catch {
    return false;
  }
}

function pickDpr(): 1 | 1.5 | 2 {
  const ratio = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  if (mobile) return 1;
  if (ratio >= 2) return 2;
  if (ratio >= 1.5) return 1.5;
  return 1;
}

function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  if (nav.deviceMemory != null && nav.deviceMemory <= 2) return true;
  if (
    nav.hardwareConcurrency != null &&
    nav.hardwareConcurrency <= 2
  ) {
    return true;
  }
  return false;
}

export function detectCapability(): Capability {
  if (cached) return cached;

  if (typeof window === "undefined") {
    cached = { kind: "static", reason: "no-webgl" };
    return cached;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cached = { kind: "static", reason: "reduced-motion" };
    return cached;
  }

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;
  if (connection?.saveData) {
    cached = { kind: "static", reason: "save-data" };
    return cached;
  }

  if (!probeWebGL()) {
    cached = { kind: "static", reason: "no-webgl" };
    return cached;
  }

  if (isLowPower()) {
    cached = { kind: "static", reason: "low-power" };
    return cached;
  }

  cached = { kind: "living", dpr: pickDpr() };
  return cached;
}

/** Test-only reset */
export function resetCapabilityCache(): void {
  cached = null;
}
