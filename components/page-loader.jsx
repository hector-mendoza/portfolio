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
            animate={{
              opacity: 1,
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              opacity: { duration: 0.5, ease: EASE },
              scale: {
                duration: 2.6,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.5,
              },
            }}
            className="h-64 w-64"
          >
            <Orb backgroundColor="#000000" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
