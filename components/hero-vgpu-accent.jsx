"use client";

import { useEffect, useRef, useState } from "react";
import { startAmbientRenderer } from "@/lib/vgpu-ambient";

export default function HeroVgpuAccent() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === "undefined" || !("gpu" in navigator)) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return startAmbientRenderer(canvas, {
      animate: !prefersReducedMotion,
      onReady: () => setReady(true),
      onUnavailable: () => setReady(false),
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-1000 ${
        ready ? "opacity-35" : "opacity-0"
      }`}
    />
  );
}
