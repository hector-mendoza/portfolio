"use client";

import { useEffect, useState } from "react";
import Aurora from "@/components/Aurora";
import { auroraStopsForTheme } from "@/lib/aurora-stops";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useThemeMode } from "@/lib/use-theme-mode";

export default function AuroraBackground() {
  const { theme } = useThemeMode();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reducedMotion) return null;

  return (
    <div aria-hidden className="absolute inset-0 opacity-80">
      <Aurora
        colorStops={auroraStopsForTheme(theme)}
        amplitude={0.95}
        blend={0.7}
        speed={0.65}
      />
    </div>
  );
}
