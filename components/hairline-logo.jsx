"use client";

import { useEffect, useRef } from "react";
import HL from "@/lib/hairline-kernel";
import { MONOGRAM_RANGE, mountMonogram } from "@/lib/hairline-monogram";
import styles from "./hairline-logo.module.css";

export default function HairlineLogo() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    HL.inject(document);
    host.setAttribute("data-hairline", "");
    host.setAttribute("data-hairline-theme", "light");

    const svg = HL.mk("svg", { viewBox: "0 0 400 320" }, host);
    const live = document.createElement("div");
    live.setAttribute("data-hairline-live", "");
    live.setAttribute("aria-live", "polite");
    host.appendChild(live);

    const figure = mountMonogram({ stage: host, svg, read: live }, MONOGRAM_RANGE[1]);

    return () => {
      figure.destroy();
      live.remove();
      host.removeAttribute("data-hairline");
      host.removeAttribute("data-hairline-theme");
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={styles.figure}
      role="img"
      aria-label="Hector Mendoza's HM logo, drawn as a Hairline figure"
      tabIndex={0}
    />
  );
}
