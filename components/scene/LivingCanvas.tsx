"use client";

import {
  attachSceneRenderer,
  getSceneCapability,
  setSceneCanvasMounted,
  setScenePaused,
  useScene,
} from "@/lib/scene/store";
import { createGradientAsciiRenderer } from "@/lib/scene/gradient-ascii-renderer";
import SceneStaticPoster from "@/components/scene/SceneStaticPoster";
import { useEffect, useRef, useState } from "react";

export default function LivingCanvas() {
  const scene = useScene();
  const phase = scene.phase;

  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (phase === "disabled") return;
    const idle =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: IdleRequestCallback) =>
            window.setTimeout(
              () => cb({ didTimeout: false, timeRemaining: () => 0 }),
              1
            );
    const cancel =
      typeof cancelIdleCallback !== "undefined"
        ? cancelIdleCallback
        : clearTimeout;
    const id = idle(() => setReady(true));
    return () => cancel(id);
  }, [phase]);

  useEffect(() => {
    if (!ready || phase === "disabled") return;
    const t = window.requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [ready, phase]);

  useEffect(() => {
    if (!ready || phase === "disabled") return;
    const host = hostRef.current;
    if (!host) return;

    const cap = getSceneCapability();
    const dpr =
      cap?.kind === "living" ? cap.dpr : Math.min(window.devicePixelRatio, 2);

    const renderer = createGradientAsciiRenderer();
    renderer.mount(host, dpr);
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
  }, [ready, phase]);

  if (phase === "disabled") {
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
