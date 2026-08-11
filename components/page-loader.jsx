"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/kokonutui/loader";
import GlitchText from "@/components/kokonutui/glitch-text";
import { BackgroundPathsLayer } from "@/components/kokonutui/background-paths";

const EASE = [0.22, 1, 0.36, 1];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-background"
        >
          <BackgroundPathsLayer intensity="hero" className="opacity-100" />
          <BackgroundPathsLayer position={-1} intensity="hero" className="scale-x-[-1] opacity-80" />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.5)_55%,hsl(var(--background)/0.95)_100%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative flex flex-col items-center gap-8 px-6"
          >
            <GlitchText
              text="MENDOZA"
              color="cyan"
              glitchIntensity="extreme"
              size="2xl"
              letterSpacing={12}
              className="p-0"
            />

            <Loader
              size="lg"
              title="Loading portfolio"
              subtitle="Crafting pixels with intention"
              className="gap-6 p-0 [&_h1]:font-mono [&_h1]:text-xs [&_h1]:uppercase [&_h1]:tracking-[0.35em] [&_h1]:text-primary [&_p]:font-mono [&_p]:text-[10px] [&_p]:uppercase [&_p]:tracking-[0.25em] [&_p]:text-muted-foreground"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
