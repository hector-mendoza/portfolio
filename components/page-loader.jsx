"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

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
          transition={{ duration: 0.55, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Breathing glow orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative mb-8 flex h-24 w-24 items-center justify-center"
          >
            <motion.span
              className="absolute h-24 w-24 rounded-full bg-primary/30 blur-2xl"
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            />
            <motion.span
              className="absolute h-16 w-16 rounded-full bg-primary/50 blur-xl"
              animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="relative h-8 w-8 rounded-full bg-primary shadow-lg shadow-primary/40"
              animate={{ scale: [0.9, 1.08, 0.9] }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: 0.1 }}
            />
          </motion.div>

          {/* Name */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="text-2xl italic text-foreground"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Hector Mendoza
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
