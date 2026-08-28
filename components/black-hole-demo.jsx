"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BlackHoleCanvas from "./black-hole-canvas";

export default function BlackHoleDemo({ open, onClose }) {
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (!open) {
      setHint(true);
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setHint(false), 4000);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9995] bg-black"
        >
          <div className="absolute inset-0">
            <BlackHoleCanvas />
          </div>

          <div className="pointer-events-none fixed inset-x-0 top-0 flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-300/90">
              WebGPU · Black Hole
            </span>
            <span className="font-mono text-[10px] text-white/40 sm:text-xs">
              vgpu raymarching + HDR bloom
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close black hole demo"
            className="pointer-events-auto fixed right-4 top-3 rounded-full border border-white/15 bg-black/60 p-1.5 text-white/70 backdrop-blur transition-colors hover:border-amber-300/40 hover:text-amber-200 sm:right-6"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {hint && (
            <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-4">
              <p className="rounded-full border border-white/10 bg-black/70 px-5 py-2.5 font-mono text-xs text-white/70 backdrop-blur">
                Move pointer to orbit the accretion disk · Esc to close
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
