"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Orbit } from "lucide";
import { MorphIcon } from "morphicons/react";
import BlackHoleCanvas from "./black-hole-canvas";

export default function BlackHoleShowcase({ onExpand }) {
  const [ready, setReady] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="order-first col-span-2 md:col-span-4"
    >
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/50">
        <div className="relative aspect-[16/9] min-h-[220px] sm:min-h-[280px] md:min-h-[340px]">
          <BlackHoleCanvas onStatusChange={(status) => setReady(status === "ready")} />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-200/90 backdrop-blur sm:text-xs">
                <MorphIcon icon={Orbit} size={12} color="hsl(43 96% 76% / 0.9)" />
                WebGPU Demo
              </span>
              {ready && (
                <span className="hidden rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/45 backdrop-blur sm:inline-block">
                  Live
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onExpand}
              aria-label="Open black hole demo fullscreen"
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] text-white/75 backdrop-blur transition-colors hover:border-amber-300/40 hover:text-amber-100 sm:text-xs"
            >
              <MorphIcon icon={Maximize2} size={14} color="currentColor" />
              Fullscreen
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/70 sm:text-xs">
              Raymarched black hole
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              Gravitational lensing in the browser
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/55 sm:text-sm">
              Null geodesics bend starlight around an event horizon, with a
              Keplerian accretion disk and HDR bloom — built with{" "}
              <a
                href="https://vgpu.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-amber-200/80 underline-offset-2 hover:text-amber-100 hover:underline"
              >
                vgpu
              </a>
              .
            </p>
            {ready && (
              <p className="mt-3 font-mono text-[10px] text-white/35 sm:text-xs">
                Move pointer to orbit · Click fullscreen for immersive view
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
