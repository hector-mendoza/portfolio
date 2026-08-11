"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { BackgroundPathsLayer } from "@/components/kokonutui/background-paths";

export default function HeroPathsBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 18 });

  const layer1X = useTransform(springX, [-0.5, 0.5], [-60, 60]);
  const layer1Y = useTransform(springY, [-0.5, 0.5], [-40, 40]);
  const layer2X = useTransform(springX, [-0.5, 0.5], [45, -45]);
  const layer2Y = useTransform(springY, [-0.5, 0.5], [30, -30]);

  useEffect(() => {
    const handleMove = (event) => {
      mouseX.set(event.clientX / window.innerWidth - 0.5);
      mouseY.set(event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-[-15%]" style={{ x: layer1X, y: layer1Y }}>
        <BackgroundPathsLayer position={1} intensity="hero" />
      </motion.div>

      <motion.div
        className="absolute inset-[-15%] scale-x-[-1]"
        style={{ x: layer2X, y: layer2Y }}
      >
        <BackgroundPathsLayer position={-1} intensity="hero" className="opacity-70" />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,hsl(var(--background)/0.35)_45%,hsl(var(--background)/0.92)_100%)]" />

      <div
        className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, hsl(var(--accent) / 0.15) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}
