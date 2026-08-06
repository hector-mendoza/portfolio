"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThinkingOrb } from "thinking-orbs";
import { MorphLoader } from "@/components/morph-loader";

const EASE = [0.22, 1, 0.36, 1];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-background"
        >
          {/* Ambient gradient backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 45%, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
            }}
          />

          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative flex flex-col items-center gap-8 rounded-3xl glass-card px-12 py-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <ThinkingOrb state="shaping" size={72} aria-label="Loading" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            >
              <MorphLoader size="md" loop={false} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/70"
            >
              Hector Mendoza
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
