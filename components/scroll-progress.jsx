"use client";

import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

/**
 * Fixed scroll-progress ring adapted from Skiper UI skiper89.
 * Attribution: Skiper UI — https://skiper-ui.com
 */
export default function ScrollProgress({ className }) {
  const { scrollYProgress } = useScroll();
  const [progressPercent, setProgressPercent] = useState(0);

  const clampedProgress = useTransform(scrollYProgress, (value) =>
    Math.min(Math.max(value, 0), 1),
  );
  const progressAsPercent = useTransform(clampedProgress, (value) =>
    Math.round(value * 100),
  );

  useMotionValueEvent(progressAsPercent, "change", (value) => {
    setProgressPercent(value);
  });

  const svgRadius = 18;
  const circumference = 2 * Math.PI * svgRadius;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ left: -24, right: 24, top: -24, bottom: 24 }}
      className={cn(
        "group fixed bottom-5 right-5 z-40 hidden cursor-grab items-center gap-1 active:cursor-grabbing sm:flex",
        className,
      )}
      aria-hidden="true"
    >
      <NumberFlow
        value={progressPercent}
        className={cn(
          "text-foreground/40 absolute top-1 flex h-8 -translate-y-full items-center justify-center px-3 text-xs font-medium tabular-nums opacity-0 transition-opacity group-hover:opacity-100",
        )}
        suffix="%"
      />
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background/40 shadow-lg shadow-primary/5 backdrop-blur-md">
        <svg className="size-10 text-primary" viewBox="0 0 48 48" role="presentation">
          <circle
            cx="24"
            cy="24"
            r={svgRadius}
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-25"
            fill="none"
          />
          <motion.circle
            cx="24"
            cy="24"
            r={svgRadius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            style={{
              pathLength: clampedProgress,
              rotate: -90,
              transformOrigin: "50% 50%",
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
