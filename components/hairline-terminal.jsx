"use client";

import { useEffect, useRef } from "react";
import {
  branches,
  cabinet,
  drawer,
  keyboard,
  lockers,
  loupe,
  phone,
  phosphor,
  plot,
  query,
  riffle,
  slow,
  terminal,
  vault,
} from "@lucasmarkes/hairline";
import styles from "./hairline-figure.module.css";

function HairlineFigure({
  mount,
  label,
  intensity = 0.72,
  theme = "light",
  variant,
}) {
  const figureRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const host = figureRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const restIntensity = () =>
      motionPreference.matches ? Math.min(intensity, 0.25) : intensity;
    const activeIntensity = () =>
      motionPreference.matches ? restIntensity() : Math.min(intensity + 0.22, 1);

    const figure = mount(canvas, {
      intensity: restIntensity(),
      theme,
      label,
    });

    const activate = () => figure.update({ intensity: activeIntensity() });
    const rest = () => figure.update({ intensity: restIntensity() });
    const syncMotionPreference = () => {
      figure.update({ intensity: restIntensity() });
      host.dataset.reducedMotion = String(motionPreference.matches);
    };

    host.addEventListener("pointerenter", activate);
    host.addEventListener("pointerleave", rest);
    host.addEventListener("focusin", activate);
    host.addEventListener("focusout", rest);
    motionPreference.addEventListener("change", syncMotionPreference);
    syncMotionPreference();

    return () => {
      host.removeEventListener("pointerenter", activate);
      host.removeEventListener("pointerleave", rest);
      host.removeEventListener("focusin", activate);
      host.removeEventListener("focusout", rest);
      motionPreference.removeEventListener("change", syncMotionPreference);
      figure.destroy();
    };
  }, [intensity, label, mount, theme]);

  return (
    <div
      ref={figureRef}
      className={`${styles.figure} ${styles[variant]}`}
      role="group"
      aria-label={`${label}. Move the pointer or focus to increase its response.`}
      tabIndex={0}
    >
      <div ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

export default function HairlineTerminal() {
  return (
    <HairlineFigure
      mount={terminal}
      label="An interactive isometric terminal representing Hector's engineering work"
      variant="terminal"
    />
  );
}

export function HairlineBranches() {
  return (
    <HairlineFigure
      mount={branches}
      intensity={0.65}
      theme="dark"
      label="An interactive commit graph branching from and merging into the main line"
      variant="branches"
    />
  );
}

export function HairlineQuery() {
  return (
    <HairlineFigure
      mount={query}
      intensity={0.6}
      label="An interactive question mark that follows the pointer"
      variant="query"
    />
  );
}

export function HairlinePlot() {
  return (
    <HairlineFigure
      mount={plot}
      intensity={0.58}
      label="An interactive Hairline plot whose bars lift toward the pointer"
      variant="plot"
    />
  );
}

export function HairlineSlow() {
  return (
    <HairlineFigure
      mount={slow}
      intensity={0.58}
      label="An animated Hairline conveyor carrying work through a gate"
      variant="slow"
    />
  );
}

export function HairlinePhosphor() {
  return (
    <HairlineFigure
      mount={phosphor}
      intensity={0.62}
      label="An animated Hairline phosphor matrix that can be painted with the pointer"
      variant="phosphor"
    />
  );
}

export function HairlineCabinet() {
  return (
    <HairlineFigure
      mount={cabinet}
      intensity={0.62}
      label="An interactive Hairline cabinet whose blades slide toward the pointer"
      variant="cabinet"
    />
  );
}

export function HairlinePhone() {
  return (
    <HairlineFigure
      mount={phone}
      intensity={0.6}
      label="An exploded Hairline phone whose layers open under the pointer"
      variant="phone"
    />
  );
}

export function HairlineKeyboard({ theme = "light" }) {
  return (
    <HairlineFigure
      mount={keyboard}
      intensity={0.58}
      theme={theme}
      label="An interactive Hairline keyboard whose keys sink under the pointer"
      variant="keyboard"
    />
  );
}

export function HairlineRiffle() {
  return (
    <HairlineFigure
      mount={riffle}
      intensity={0.55}
      label="A Hairline tray of cards that stand up under the pointer"
      variant="riffle"
    />
  );
}

export function HairlineLoupe() {
  return (
    <HairlineFigure
      mount={loupe}
      intensity={0.58}
      label="A Hairline loupe that follows the pointer across a blank sheet"
      variant="loupe"
    />
  );
}

export function HairlineVault() {
  return (
    <HairlineFigure
      mount={vault}
      intensity={0.62}
      label="A Hairline vault whose dial turns with the pointer"
      variant="vault"
    />
  );
}

export function HairlineLockers() {
  return (
    <HairlineFigure
      mount={lockers}
      intensity={0.58}
      label="A bank of Hairline lockers that open under the pointer"
      variant="lockers"
    />
  );
}

export function HairlineDrawer() {
  return (
    <HairlineFigure
      mount={drawer}
      intensity={0.58}
      label="A Hairline cabinet whose drawers slide toward the pointer"
      variant="drawer"
    />
  );
}
