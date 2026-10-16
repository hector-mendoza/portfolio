import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __test_resetScheduleState } from "./schedule";
import {
  __test_attachMockRenderer,
  __test_detachRenderer,
  __test_getFrameCallCount,
  __test_getRafId,
  __test_resetSceneLoopMetrics,
  setScenePaused,
} from "./store";

type RafEntry = { id: number; cb: FrameRequestCallback };

describe("scene store animation loop", () => {
  let rafQueue: RafEntry[] = [];
  let nextRafId = 1;
  let nowMs = 0;

  beforeEach(() => {
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
    vi.unstubAllGlobals();
  });

  function flushOneFrame(advanceMs = 20) {
    nowMs += advanceMs;
    const entry = rafQueue.shift();
    entry?.cb(nowMs);
  }

  function pendingRafCount() {
    return rafQueue.length;
  }

  it("keeps at most one pending rAF and resumes frame() after hide/show cycles", () => {
    __test_attachMockRenderer(() => undefined);

    flushOneFrame();
    expect(__test_getFrameCallCount()).toBe(1);
    expect(__test_getRafId()).not.toBeNull();
    expect(pendingRafCount()).toBeLessThanOrEqual(1);

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
