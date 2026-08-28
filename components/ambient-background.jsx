"use client";

import { useEffect, useRef, useState } from "react";
import { startAmbientRenderer } from "@/lib/vgpu-ambient";

function CssFogFallback() {
  return (
    <>
      <div className="ambient-fog ambient-fog-1" />
      <div className="ambient-fog ambient-fog-2" />
      <div className="ambient-fog ambient-fog-3" />
      <div className="ambient-fog ambient-fog-4" />
      <div className="ambient-fog ambient-fog-5" />
      <div className="ambient-fog ambient-fog-6" />
    </>
  );
}

export default function AmbientBackground() {
  const canvasRef = useRef(null);
  const [webgpuReady, setWebgpuReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === "undefined" || !("gpu" in navigator)) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return startAmbientRenderer(canvas, {
      animate: !prefersReducedMotion,
      onReady: () => setWebgpuReady(true),
      onUnavailable: () => setWebgpuReady(false),
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className={webgpuReady ? "opacity-0" : "opacity-100"}>
        <CssFogFallback />
      </div>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full transition-opacity duration-700 ${
          webgpuReady ? "opacity-90" : "opacity-0"
        }`}
      />
    </div>
  );
}
