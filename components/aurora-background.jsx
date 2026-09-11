"use client";

import Aurora from "@/components/Aurora";
import { auroraStopsForTheme } from "@/lib/aurora-stops";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useThemeMode } from "@/lib/use-theme-mode";

export default function AuroraBackground() {
  const { mode, theme } = useThemeMode();
  const reducedMotion = usePrefersReducedMotion();

  if (mode !== "dark" || reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-80"
    >
      <Aurora
        colorStops={auroraStopsForTheme(theme)}
        amplitude={0.85}
        blend={0.55}
        speed={0.7}
      />
    </div>
  );
}
