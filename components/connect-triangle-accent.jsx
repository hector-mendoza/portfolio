"use client";

import { useEffect, useRef, useState } from "react";
import { createAccentRenderer } from "@/lib/triangle-led/accent-renderer";

function TriangleFallback() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className="h-14 w-14 opacity-90"
    >
      <defs>
        <linearGradient id="connect-tri-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(168 45% 42%)" />
          <stop offset="100%" stopColor="hsl(205 50% 52%)" />
        </linearGradient>
        <filter id="connect-tri-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points="32,10 54,50 10,50"
        fill="none"
        stroke="url(#connect-tri-a)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#connect-tri-glow)"
      />
      <circle cx="32" cy="10" r="2.2" fill="hsl(168 45% 52%)" />
      <circle cx="54" cy="50" r="2.2" fill="hsl(205 50% 58%)" />
      <circle cx="10" cy="50" r="2.2" fill="hsl(195 40% 58%)" />
    </svg>
  );
}

export default function ConnectTriangleAccent() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === "undefined" || !("gpu" in navigator)) {
      setStatus("unavailable");
      return;
    }

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    setStatus("loading");

    try {
      renderer = createAccentRenderer({
        canvas,
        interactive: !prefersReducedMotion,
      });
      void renderer.ready
        .then(() => setStatus("ready"))
        .catch(() => setStatus("unavailable"));
    } catch {
      setStatus("unavailable");
    }

    return () => renderer?.dispose();
  }, []);

  if (status === "unavailable") {
    return <TriangleFallback />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive triangle accent"
      className={`block h-14 w-14 touch-none transition-opacity duration-700 ${
        status === "ready" ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
