"use client";

import { useEffect, useRef, useState } from "react";
import { createTransmissionRenderer } from "@/lib/vgpu-transmission/renderer";

function CssFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundColor: "#e8e8e6",
        backgroundImage:
          "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,255,255,0.65), transparent 70%), radial-gradient(ellipse 40% 30% at 75% 20%, rgba(255,255,255,0.35), transparent 60%)",
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
      return;
    }

    try {
      renderer = createTransmissionRenderer({ canvas });
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
