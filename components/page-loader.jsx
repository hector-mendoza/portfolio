"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MorphLoader } from "@/components/morph-loader";
import VgpuLoaderCanvas from "@/components/vgpu-loader-canvas";

const EASE = [0.22, 1, 0.36, 1];
const LOADER_DURATION_MS = 2600;

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [useVgpu, setUseVgpu] = useState(
    () => typeof navigator !== "undefined" && "gpu" in navigator,
  );

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.01, filter: "blur(6px)" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-background"
        >
          <VgpuLoaderCanvas onStatusChange={(status) => {
            if (status === "unavailable") setUseVgpu(false);
          }} />

          {!useVgpu && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 45%, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative flex flex-col items-center gap-6 rounded-3xl glass-card px-12 py-10"
              >
                <MorphLoader size="lg" loop={false} />
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-[12vh] flex flex-col items-center gap-2 px-6 text-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/50">
              WebGPU
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-foreground/80 sm:text-sm">
              Hector Mendoza
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
