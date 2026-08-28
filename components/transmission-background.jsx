"use client";

import { useEffect, useRef, useState } from "react";
import { createTransmissionRenderer } from "@/lib/vgpu-transmission/renderer";

function CssFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundColor: "hsl(200 12% 6%)",
        backgroundImage:
          "radial-gradient(ellipse 90% 60% at 15% -5%, hsl(168 45% 42% / 0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 85% 105%, hsl(205 50% 35% / 0.12) 0%, transparent 55%), radial-gradient(ellipse 45% 30% at 82% 18%, hsl(195 40% 40% / 0.08) 0%, transparent 60%)",
      }}
    />
  );
}

export default function TransmissionBackground() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === "undefined" || !("gpu" in navigator)) {
      setUnavailable(true);
      document.documentElement.dataset.transmissionBg = "fallback";
      return;
    }

    let renderer;
    try {
      renderer = createTransmissionRenderer({ canvas });
      void renderer.ready
        .then(() => {
          setReady(true);
          document.documentElement.dataset.transmissionBg = "active";
        })
        .catch(() => {
          setUnavailable(true);
          document.documentElement.dataset.transmissionBg = "fallback";
        });
    } catch {
      setUnavailable(true);
      document.documentElement.dataset.transmissionBg = "fallback";
    }

    return () => {
      delete document.documentElement.dataset.transmissionBg;
      renderer?.dispose();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {unavailable && <CssFallback />}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        style={{ filter: "brightness(0.42) contrast(1.15) saturate(0.85)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 50%, hsl(200 12% 6% / 0.35) 0%, hsl(200 12% 6% / 0.72) 100%)",
        }}
      />
    </div>
  );
}
