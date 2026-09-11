"use client";

import { useEffect, useState } from "react";
import ClickSpark from "@/components/ClickSpark";
import { cssVarToColor } from "@/lib/aurora-stops";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useThemeMode } from "@/lib/use-theme-mode";

export default function ClickSparkRoot({ children }) {
  const { mode } = useThemeMode();
  const reducedMotion = usePrefersReducedMotion();
  const [sparkColor, setSparkColor] = useState("#ffffff");

  useEffect(() => {
    const sync = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      setSparkColor(
        mode === "dark" ? "#f8fafc" : cssVarToColor(raw, "#0f172a"),
      );
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode", "data-theme", "class"],
    });
    return () => observer.disconnect();
  }, [mode]);

  if (reducedMotion) return children;

  return (
    <ClickSpark
      sparkColor={sparkColor}
      sparkSize={8}
      sparkRadius={18}
      sparkCount={10}
      duration={420}
      className="min-h-dvh"
    >
      {children}
    </ClickSpark>
  );
}
