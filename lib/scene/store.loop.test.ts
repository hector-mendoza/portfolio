import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __test_resetScheduleState } from "./schedule";
import {
  __test_attachMockRenderer,
  __test_detachRenderer,
  __test_getFrameCallCount,
  __test_getRafId,
  __test_resetSceneLoopMetrics,
  __test_wakeCalmSceneLoopFromUserInput,
  setScenePaused,
} from "./store";

type RafEntry = { id: number; cb: FrameRequestCallback };

describe("scene store animation loop", () => {
  let rafQueue: RafEntry[] = [];
  let nextRafId = 1;
  let nowMs = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    rafQueue = [];
    nextRafId = 1;
    nowMs = 0;
    vi.stubGlobal("performance", {
      now: () => nowMs,
    });
    __test_resetSceneLoopMetrics();
    __test_resetScheduleState();
    __test_detachRenderer();

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafQueue.push({ id, cb });
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      rafQueue = rafQueue.filter((entry) => entry.id !== id);
    });
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    }));
  });

  afterEach(() => {
    __test_detachRenderer();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function flushOneFrame(advanceMs = 260) {
    nowMs += advanceMs;
    vi.advanceTimersByTime(advanceMs);
    while (rafQueue.length > 0) {
      const entry = rafQueue.shift();
      entry?.cb(nowMs);
    }
  }

  function pendingRafCount() {
    return rafQueue.length;
  }

  it("calm tier schedules no loop frames until first user input", () => {
    vi.stubGlobal("innerWidth", 390);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("pointer: coarse"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    }));
    __test_attachMockRenderer(() => undefined, "calm");
    expect(__test_getRafId()).toBeNull();
    for (let i = 0; i < 12; i++) flushOneFrame();
    expect(__test_getFrameCallCount()).toBe(0);

    __test_wakeCalmSceneLoopFromUserInput();
    flushOneFrame();
    expect(__test_getFrameCallCount()).toBeGreaterThanOrEqual(1);
  });

  it("keeps at most one pending rAF and resumes frame() after hide/show cycles", () => {
    __test_attachMockRenderer(() => undefined);

    flushOneFrame();
    expect(__test_getFrameCallCount()).toBeGreaterThanOrEqual(1);
    expect(pendingRafCount()).toBeLessThanOrEqual(2);

    for (let cycle = 0; cycle < 2; cycle++) {
      setScenePaused("hidden", true);
      expect(__test_getRafId()).toBeNull();
      expect(pendingRafCount()).toBe(0);
      for (let i = 0; i < 8; i++) flushOneFrame();
      const whileHidden = __test_getFrameCallCount();

      setScenePaused("hidden", false);
      expect(pendingRafCount()).toBeLessThanOrEqual(1);
      flushOneFrame();
      expect(__test_getFrameCallCount()).toBeGreaterThan(whileHidden);
    }
  });
});
