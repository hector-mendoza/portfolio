"use client";

import {
  notifySceneUserActivation,
  setScenePaused,
  setScenePointer,
  setScrollProgress,
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
      setScenePaused("hidden", document.visibilityState === "hidden");
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

      const onScroll = () => {
        notifySceneUserActivation();
        setScrollProgress(computeScrollProgress());
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      let pendingPointer: { x: number; y: number } | null = null;
      let pointerRaf: number | null = null;

      const flushPointer = () => {
        pointerRaf = null;
        setScenePointer(pendingPointer);
      };

      const onPointerMove = (event: PointerEvent) => {
        notifySceneUserActivation();
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w <= 0 || h <= 0) return;
        pendingPointer = {
          x: Math.min(1, Math.max(0, event.clientX / w)),
          y: Math.min(1, Math.max(0, event.clientY / h)),
        };
        if (pointerRaf === null) {
          pointerRaf = requestAnimationFrame(flushPointer);
        }
      };
      const onPointerLeave = () => {
        pendingPointer = null;
        if (pointerRaf === null) {
          pointerRaf = requestAnimationFrame(flushPointer);
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave, {
        passive: true,
      });

      teardown = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave
        );
        if (pointerRaf !== null) cancelAnimationFrame(pointerRaf);
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
