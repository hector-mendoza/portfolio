"use client";

import { useEffect, useState } from "react";
import Aurora from "@/components/Aurora";
import { SAGE_AURORA_STOPS } from "@/lib/aurora-stops";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export default function AuroraBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    setMounted(true);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!mounted || reducedMotion || !isDesktop) return null;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden opacity-55">
      <Aurora
        colorStops={SAGE_AURORA_STOPS}
        amplitude={0.8}
        blend={0.75}
        speed={0.55}
      />
    </div>
  );
}
