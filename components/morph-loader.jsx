"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MorphIcon } from "morphicons/react";
import { Code2, Loader, Rocket, Sparkles } from "lucide";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

const STAGES = [
  { icon: Loader, label: "Loading", spring: "smooth", delay: 0 },
  { icon: Sparkles, label: "Crafting", spring: "bouncy", delay: 500 },
  { icon: Code2, label: "Building", spring: "smooth", delay: 1050 },
  { icon: Rocket, label: "Launching", spring: "snappy", delay: 1600 },
];

const STAGE_DURATION = 550;

const CYCLE_DURATION = STAGES[STAGES.length - 1].delay + STAGE_DURATION;

export function MorphLoader({
  size = "md",
  showLabel = true,
  loop = true,
  className,
}) {
  const morphRef = useRef(null);
  const [stageIndex, setStageIndex] = useState(0);

  const sizeMap = {
    sm: { icon: 20, ring: 56 },
    md: { icon: 28, ring: 80 },
    lg: { icon: 36, ring: 104 },
  };

  const dims = sizeMap[size] ?? sizeMap.md;
  const stage = STAGES[stageIndex];

  useEffect(() => {
    const runCycle = () => {
      setStageIndex(0);
      morphRef.current?.morphTo(STAGES[0].icon, "smooth");

      return STAGES.slice(1).map((nextStage, index) =>
        setTimeout(() => {
          morphRef.current?.morphTo(nextStage.icon, nextStage.spring);
          setStageIndex(index + 1);
        }, nextStage.delay),
      );
    };

    let activeTimers = runCycle();
    const intervalId = loop
      ? setInterval(() => {
          activeTimers.forEach(clearTimeout);
          activeTimers = runCycle();
        }, CYCLE_DURATION)
      : undefined;

    return () => {
      activeTimers.forEach(clearTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [loop]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: dims.ring, height: dims.ring }}
      >
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/20"
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Rotating dashed ring */}
        <motion.div
          className="absolute inset-1 rounded-full border border-dashed border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Counter-rotating accent arc */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.35) 25%, transparent 50%)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Glass orb backdrop */}
        <motion.div
          className="absolute inset-3 rounded-full glass-subtle shadow-[0_0_24px_hsl(var(--primary)/0.15)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Morph icon */}
        <motion.div
          className="relative z-10"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <MorphIcon
            ref={morphRef}
            icon={STAGES[0].icon}
            size={dims.icon}
            color="hsl(var(--primary))"
            spring="smooth"
            aria-hidden
          />
        </motion.div>
      </div>

      {showLabel && (
        <div className="flex flex-col items-center gap-2.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={stage.label}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              {stage.label}
            </motion.span>
          </AnimatePresence>

          {/* Stage progress dots */}
          <div className="flex items-center gap-1.5">
            {STAGES.map((s, i) => (
              <motion.span
                key={s.label}
                className={`block size-1 rounded-full ${
                  i === stageIndex
                    ? "bg-primary"
                    : i < stageIndex
                      ? "bg-primary/45"
                      : "bg-muted-foreground/35"
                }`}
                animate={{ scale: i === stageIndex ? 1.4 : 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
