"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Orb from "@/components/Orb";

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
          {/* WebGL shader orb. backgroundColor only feeds the shader's
              internal luminance mixing (canvas is alpha-transparent) — it's
              not a visible layer, so keep it #000000 regardless of theme;
              matching it to the page background washes out the color. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-8 h-64 w-64"
          >
            <Orb hue={-115} backgroundColor="#000000" />
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
