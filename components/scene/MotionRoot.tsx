"use client";

import {
  initSceneStore,
  setScenePaused,
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

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <RouteTransition>
      <div className="relative z-10">{children}</div>
    </RouteTransition>
  );
}
