"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer } from "@/lib/black-hole/renderer";

export default function BlackHoleCanvas({ className = "", onStatusChange }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof navigator === "undefined" || !("gpu" in navigator)) {
      setStatus("unavailable");
      return;
    }

    let renderer;
    setStatus("loading");

    try {
      renderer = createRenderer({ canvas });
      void renderer.ready
        .then(() => setStatus("ready"))
        .catch(() => setStatus("unavailable"));
    } catch {
      setStatus("unavailable");
    }

    return () => renderer?.dispose();
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full touch-none ${className}`}
      />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="font-mono text-xs text-white/50 sm:text-sm">Initializing WebGPU…</p>
        </div>
      )}
      {status === "unavailable" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-950 via-black to-amber-950/40">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_hsl(32_80%_40%/0.35),transparent_65%)]" />
          <p className="relative max-w-xs px-6 text-center font-mono text-xs text-white/45 sm:text-sm">
            WebGPU unavailable — try Chrome or Edge with GPU acceleration
          </p>
        </div>
      )}
    </>
  );
}
