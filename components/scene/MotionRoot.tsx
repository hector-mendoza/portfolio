"use client";

import { setGsapScenePaused } from "@/lib/scene/gsap-scheduler";
import {
  cancelAnimationFrame as scheduleCancelAnimationFrame,
  noteActivity,
  requestAnimationFrame as scheduleRequestAnimationFrame,
  setSceneSchedulerPaused,
} from "@/lib/scene/schedule";
import {
  setScenePaused,
  setScenePointer,
  setScrollProgress,
  wakeCalmSceneLoopFromUserInput,
} from "@/lib/scene/store";
import { useEffect, type ReactNode } from "react";
import RouteTransition from "@/components/transition/RouteTransition";

type MotionRootProps = {
  children: ReactNode;
};

function computeScrollProgress(): number {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return window.scrollY / max;
}

export default function MotionRoot({ children }: MotionRootProps) {
  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      setSceneSchedulerPaused(hidden);
      setGsapScenePaused(hidden);
      setScenePaused("hidden", hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const attach = () => {
      if (cancelled) return;

      const onScrollCapture = () => {
        wakeCalmSceneLoopFromUserInput();
      };
      window.addEventListener("scroll", onScrollCapture, {
        passive: true,
        capture: true,
      });

      const onScroll = (event: Event) => {
        if (event.isTrusted) {
          wakeCalmSceneLoopFromUserInput();
        }
        setScrollProgress(computeScrollProgress(), event.isTrusted);
      };
      setScrollProgress(computeScrollProgress(), false);
      window.addEventListener("scroll", onScroll, { passive: true });

      let pendingPointer: { x: number; y: number } | null = null;
      let pointerRaf: number | null = null;

      const flushPointer = () => {
        pointerRaf = null;
        setScenePointer(pendingPointer);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.isTrusted) {
          wakeCalmSceneLoopFromUserInput();
        }
        noteActivity(performance.now());
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w <= 0 || h <= 0) return;
        pendingPointer = {
          x: Math.min(1, Math.max(0, event.clientX / w)),
          y: Math.min(1, Math.max(0, event.clientY / h)),
        };
        if (pointerRaf === null) {
          pointerRaf = scheduleRequestAnimationFrame(flushPointer);
        }
      };
      const onPointerLeave = () => {
        pendingPointer = null;
        if (pointerRaf === null) {
          pointerRaf = scheduleRequestAnimationFrame(flushPointer);
        }
      };

      const onTouchStart = (event: TouchEvent) => {
        if (event.isTrusted) {
          wakeCalmSceneLoopFromUserInput();
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave, {
        passive: true,
      });
      window.addEventListener("touchstart", onTouchStart, { passive: true });

      teardown = () => {
        window.removeEventListener("scroll", onScrollCapture, { capture: true });
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("touchstart", onTouchStart);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave
        );
        if (pointerRaf !== null) scheduleCancelAnimationFrame(pointerRaf);
      };
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(attach, { timeout: 1200 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
        teardown?.();
      };
    }

    const id = window.setTimeout(attach, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      teardown?.();
    };
  }, []);

  return (
    <RouteTransition>
      <div className="relative z-[1]">{children}</div>
    </RouteTransition>
  );
}
