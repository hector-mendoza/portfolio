"use client";

import { useEffect, useId, useState } from "react";
import styles from "./hairline-logo.module.css";

export default function HairlineLogo() {
  const maskId = useId().replaceAll(":", "");
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setActive(false);
    };

    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  const setInteractiveState = (nextState) => {
    if (!reducedMotion) setActive(nextState);
  };

  return (
    <div
      className={`${styles.figure} ${active ? styles.active : ""}`}
      role="img"
      aria-label="Dimensional rendering of Hector Mendoza's HM logo"
      tabIndex={0}
      onPointerEnter={() => setInteractiveState(true)}
      onPointerLeave={() => setInteractiveState(false)}
      onFocus={() => setInteractiveState(true)}
      onBlur={() => setInteractiveState(false)}
    >
      <svg viewBox="0 0 400 320" aria-hidden="true">
        <defs>
          <mask id={maskId} style={{ maskType: "alpha" }}>
            <image
              href="/logos/logo.svg"
              x="104"
              y="64"
              width="192"
              height="192"
            />
          </mask>
        </defs>

        <path className={styles.guide} d="M24 254 200 288 376 254" />
        <path className={styles.guide} d="M72 77 200 38 328 77" />
        <path className={styles.guide} d="M200 38v250" />
        <ellipse className={styles.plinth} cx="200" cy="254" rx="148" ry="30" />

        <g className={`${styles.layer} ${styles.low}`} mask={`url(#${maskId})`}>
          <rect x="90" y="50" width="220" height="220" />
        </g>
        <g className={`${styles.layer} ${styles.mid}`} mask={`url(#${maskId})`}>
          <rect x="90" y="50" width="220" height="220" />
        </g>
        <g className={`${styles.layer} ${styles.edge}`} mask={`url(#${maskId})`}>
          <rect x="90" y="50" width="220" height="220" />
        </g>
        <g className={`${styles.layer} ${styles.front}`} mask={`url(#${maskId})`}>
          <rect x="90" y="50" width="220" height="220" />
        </g>
      </svg>
    </div>
  );
}
