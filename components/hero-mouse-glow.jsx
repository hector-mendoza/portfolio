"use client";

import { useRef } from "react";
import { motion, useSpring } from "framer-motion";

const SPRING = {
  mass: 0.12,
  damping: 16,
  stiffness: 120,
};

/**
 * Soft spring mouse-follow glow adapted from Skiper UI skiper61.
 * Attribution: Skiper UI — https://skiper-ui.com
 */
export default function HeroMouseGlow({ children, className }) {
  const boundsRef = useRef(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0, SPRING);

  return (
    <div
      ref={boundsRef}
      className={className}
      onPointerMove={(e) => {
        const bounds = boundsRef.current?.getBoundingClientRect();
        if (!bounds) return;
        x.set(e.clientX - bounds.left - 160);
        y.set(e.clientY - bounds.top - 160);
      }}
      onPointerEnter={() => opacity.set(1)}
      onPointerLeave={() => opacity.set(0)}
    >
      <motion.div
        aria-hidden
        style={{ x, y, opacity }}
        className="pointer-events-none absolute z-0 hidden size-80 rounded-full bg-primary/20 blur-3xl md:block"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
