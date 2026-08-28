"use client";

import { useEffect, useRef, useState } from "react";
import { createLoaderRenderer } from "@/lib/triangle-led/loader-renderer";

export default function VgpuLoaderCanvas({ className = "", onStatusChange }) {
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
      renderer = createLoaderRenderer({ canvas });
      void renderer.ready
        .then(() => setStatus("ready"))
        .catch(() => setStatus("unavailable"));
    } catch {
      setStatus("unavailable");
    }

    return () => renderer?.dispose();
  }, []);

  if (status === "unavailable") return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full touch-none ${className}`}
      />
      {status === "loading" && (
        <div className="absolute inset-0 bg-black" aria-hidden />
      )}
    </>
  );
}
