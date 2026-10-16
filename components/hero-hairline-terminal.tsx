"use client";

import dynamic from "next/dynamic";
import { useCalmSceneAwaitingInput } from "@/components/use-calm-scene-awaiting-input";
import styles from "./hairline-figure.module.css";

function HeroHairlinePlaceholder() {
  return (
    <div
      className={styles.figure}
      aria-hidden="true"
      style={{ width: "100%", aspectRatio: "5 / 4", maxHeight: "320px" }}
    />
  );
}

const HairlineTerminal = dynamic(() => import("@/components/hairline-terminal"), {
  ssr: false,
  loading: HeroHairlinePlaceholder,
});

export default function HeroHairlineTerminal() {
  const calmHold = useCalmSceneAwaitingInput();
  if (calmHold) {
    return <HeroHairlinePlaceholder />;
  }
  return <HairlineTerminal />;
}
