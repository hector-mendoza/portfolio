"use client";

import { useEffect, useRef, useState } from "react";
import { createTriangleLedRenderer } from "@/lib/triangle-led/triangle-led-renderer";

function CssFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-[#0a0c0d]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(168 45% 42% / 0.12), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, hsl(205 50% 52% / 0.08), transparent 60%)",
      }}
    />
  );
}

export default function TriangleLedBackground() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === "undefined" || !("gpu" in navigator)) {
      setUnavailable(true);
      return;
    }

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = createTriangleLedRenderer({
        canvas,
        interactive: !prefersReducedMotion,
        input: "window",
        dpr: [1, 2],
      });
      void renderer.ready
        .then(() => setReady(true))
        .catch(() => setUnavailable(true));
    } catch {
      setUnavailable(true);
    }

    return () => renderer?.dispose();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {unavailable && <CssFallback />}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
