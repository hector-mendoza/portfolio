"use client";

import {
  initSceneStore,
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
    initSceneStore();

    const onScroll = () => {
      setScrollProgress(computeScrollProgress());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onVisibility = () => {
      setScenePaused("hidden", document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    const onPointerMove = (event: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w <= 0 || h <= 0) return;
      setScenePointer({
        x: Math.min(1, Math.max(0, event.clientX / w)),
        y: Math.min(1, Math.max(0, event.clientY / h)),
      });
    };
    const onPointerLeave = () => setScenePointer(null);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave
      );
    };
  }, []);

  return (
    <RouteTransition>
      <div className="relative z-10">{children}</div>
    </RouteTransition>
  );
}
