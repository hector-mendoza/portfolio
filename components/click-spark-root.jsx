"use client";

import { useEffect, useState } from "react";
import ClickSpark from "@/components/ClickSpark";
import { CLICK_SPARK_FALLBACK } from "@/lib/react-bits-default-colors";
import { cssVarToColor } from "@/lib/aurora-stops";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export default function ClickSparkRoot({ children }) {
  const reducedMotion = usePrefersReducedMotion();
  const [sparkColor, setSparkColor] = useState(CLICK_SPARK_FALLBACK);

  useEffect(() => {
    const sync = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      setSparkColor(cssVarToColor(raw, CLICK_SPARK_FALLBACK));
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
