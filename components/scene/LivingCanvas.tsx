"use client";

import {
  attachSceneRenderer,
  initSceneStore,
  setSceneCanvasMounted,
  setScenePaused,
  useSceneDisabled,
} from "@/lib/scene/store";
import { createGradientAsciiRenderer } from "@/lib/scene/gradient-ascii-renderer";
import {
  cancelAnimationFrame as scheduleCancelAnimationFrame,
  detectTier,
  requestAnimationFrame as scheduleRequestAnimationFrame,
} from "@/lib/scene/schedule";
import SceneStaticPoster from "@/components/scene/SceneStaticPoster";
import { useEffect, useRef, useState } from "react";

export default function LivingCanvas() {
  const disabled = useSceneDisabled();

  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (disabled) return;
    const t = scheduleRequestAnimationFrame(() => setVisible(true));
    return () => scheduleCancelAnimationFrame(t);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    const host = hostRef.current;
    if (!host) return;

    initSceneStore();

    const tier = detectTier();
    const renderer = createGradientAsciiRenderer();
    renderer.mount(host, { scale: tier.scale, dprCap: tier.dprCap });
    setSceneCanvasMounted(true);
    attachSceneRenderer(renderer);

    const offscreenObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setScenePaused("offscreen", !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    offscreenObserver.observe(host);

    return () => {
      offscreenObserver.disconnect();
      attachSceneRenderer(null);
      setSceneCanvasMounted(false);
      renderer.dispose();
    };
  }, [disabled]);

  if (disabled) {
    return <SceneStaticPoster />;
  }

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0, pointerEvents: "none" }}
    />
  );
}
