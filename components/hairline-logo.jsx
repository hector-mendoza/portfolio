"use client";

import { useEffect, useRef } from "react";
import { startHairlineAmbient } from "@/lib/hairline-ambient";
import { MONOGRAM_RANGE, createMonogramMount } from "@/lib/hairline-monogram";
import styles from "./hairline-logo.module.css";

function loadKernel() {
  if (window.HL?.inject) return Promise.resolve(window.HL);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-hairline-kernel]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.HL), { once: true });
      existing.addEventListener("error", () => reject(new Error("Hairline kernel failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/vendor/hairline-kernel.js";
    script.async = true;
    script.dataset.hairlineKernel = "";
    script.onload = () => resolve(window.HL);
    script.onerror = () => reject(new Error("Hairline kernel failed to load"));
    document.head.appendChild(script);
  });
}

export default function HairlineLogo() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let cancelled = false;
    let figure;
    let live;
    let stopAmbient;

    loadKernel()
      .then((HL) => {
        if (cancelled || !HL?.inject) return;

        HL.inject(document);
        host.setAttribute("data-hairline", "");
        host.setAttribute("data-hairline-theme", "light");

        const svg = HL.mk("svg", { viewBox: "0 0 400 320" }, host);
        live = document.createElement("div");
        live.setAttribute("data-hairline-live", "");
        live.setAttribute("aria-live", "polite");
        host.appendChild(live);

        figure = createMonogramMount(HL)({ stage: host, svg, read: live }, MONOGRAM_RANGE[1]);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        stopAmbient = startHairlineAmbient(host, { reducedMotion });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      stopAmbient?.();
      figure?.destroy();
      live?.remove();
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
