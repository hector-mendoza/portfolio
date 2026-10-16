import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  __test_resetScheduleState,
  detectTier,
  effectiveTargetFps,
  markDraw,
  noteActivity,
  shouldDraw,
  type FrameBudget,
} from "./schedule";

describe("detectTier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns calm for coarse pointer", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("pointer: coarse"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    vi.stubGlobal("innerWidth", 1024);
    const tier = detectTier();
    expect(tier.kind).toBe("calm");
    expect(tier.fps).toBe(24);
  });

  it("returns calm for innerWidth under 768", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    vi.stubGlobal("innerWidth", 390);
    expect(detectTier().kind).toBe("calm");
  });

  it("returns full for fine pointer and wide viewport", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    vi.stubGlobal("innerWidth", 1280);
    const tier = detectTier();
    expect(tier.kind).toBe("full");
    expect(tier.fps).toBe(60);
  });
});

describe("shouldDraw", () => {
  beforeEach(() => {
    __test_resetScheduleState();
  });

  const full = { kind: "full", fps: 60, scale: 1, dprCap: 2 } as const;
  const calm = { kind: "calm", fps: 24, scale: 0.5, dprCap: 1 } as const;

  it("draws immediately when lastDraw is unset", () => {
    const budget: FrameBudget = { targetFps: 60, lastDraw: -1 };
    expect(shouldDraw(1000, budget, full, { kind: "idle" })).toBe(true);
  });

  it("respects calm tier active fps", () => {
    noteActivity(0);
    const budget: FrameBudget = { targetFps: 24, lastDraw: -1 };
    markDraw(0, budget, calm, { kind: "active", until: 2000 });
    expect(shouldDraw(30, budget, calm, { kind: "active", until: 2000 })).toBe(false);
    expect(shouldDraw(42, budget, calm, { kind: "active", until: 2000 })).toBe(true);
  });

  it("uses idle 4 fps after active window", () => {
    const budget: FrameBudget = { targetFps: 4, lastDraw: 1000 };
    const act = { kind: "idle" as const };
    expect(effectiveTargetFps(full, act, 5000)).toBe(4);
    expect(shouldDraw(1200, budget, full, act)).toBe(false);
    expect(shouldDraw(1250, budget, full, act)).toBe(true);
  });
});
