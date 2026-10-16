"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import styles from "./hairline-figure.module.css";

const HairlineTerminal = dynamic(() => import("@/components/hairline-terminal"), {
  ssr: false,
});

export default function HeroHairlineTerminal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) setMounted(true);
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(run, { timeout: 4500 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(run, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        className={styles.figure}
        aria-hidden="true"
        style={{ minHeight: "clamp(220px, 32vh, 360px)" }}
      />
    );
  }

  return <HairlineTerminal />;
}
