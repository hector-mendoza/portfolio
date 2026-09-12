"use client";

import { useEffect, useState } from "react";
import ClickSpark from "@/components/ClickSpark";
import { cssVarToColor } from "@/lib/aurora-stops";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export default function ClickSparkRoot({ children }) {
  const reducedMotion = usePrefersReducedMotion();
  const [sparkColor, setSparkColor] = useState("#6b8f78");

  useEffect(() => {
    const sync = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      setSparkColor(cssVarToColor(raw, "#6b8f78"));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode", "data-theme", "class"],
    });
    return () => observer.disconnect();
  }, []);

  if (reducedMotion) return children;

  return (
    <ClickSpark
      sparkColor={sparkColor}
      sparkSize={8}
      sparkRadius={18}
      sparkCount={10}
      duration={420}
      className="min-h-dvh max-w-full overflow-x-clip"
    >
      {children}
    </ClickSpark>
  );
}
