"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MorphIcon } from "morphicons/react";
import { Code2, Loader, Sparkles } from "lucide";
import { ThinkingOrb } from "thinking-orbs";

const EASE = [0.22, 1, 0.36, 1];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const morphRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sparklesTimer = setTimeout(
      () => morphRef.current?.morphTo(Sparkles, "smooth"),
      450,
    );
    const codeTimer = setTimeout(
      () => morphRef.current?.morphTo(Code2, "smooth"),
      950,
    );

    return () => {
      clearTimeout(sparklesTimer);
      clearTimeout(codeTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-background"
        >
          <ThinkingOrb state="shaping" size={64} aria-label="Loading" />
          <MorphIcon
            ref={morphRef}
            icon={Loader}
            size={24}
            color="hsl(var(--primary))"
            spring="smooth"
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
