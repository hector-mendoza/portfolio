"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 relative"
          >
            <img src="/logos/logo.svg" alt="HM" className="h-16 w-16" />

            {/* Spinning ring */}
            <svg
              className="absolute -inset-3 h-[88px] w-[88px] animate-spin-slow"
              viewBox="0 0 88 88"
              fill="none"
            >
              <circle
                cx="44"
                cy="44"
                r="40"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="6 10"
                className="text-primary/30"
              />
            </svg>
          </motion.div>

          {/* Progress bar */}
          <div className="w-40 h-px bg-border overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.3, ease: "easeInOut" }}
            />
          </div>

          {/* Name */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            Hector Mendoza
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
