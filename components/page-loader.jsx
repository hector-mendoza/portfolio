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
          <div
            className="text-center leading-none"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-5xl md:text-6xl italic text-foreground"
            >
              Hector
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              className="text-5xl md:text-6xl italic text-primary"
            >
              Mendoza
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
