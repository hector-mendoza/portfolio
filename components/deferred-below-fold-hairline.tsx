"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCalmSceneAwaitingInput } from "@/components/use-calm-scene-awaiting-input";
import styles from "./hairline-figure.module.css";
import slotStyles from "./deferred-below-fold-hairline.module.css";

const HairlinePlot = dynamic(
  () => import("@/components/hairline-terminal").then((m) => ({ default: m.HairlinePlot })),
  { ssr: false }
);
const HairlineRiffle = dynamic(
  () => import("@/components/hairline-terminal").then((m) => ({ default: m.HairlineRiffle })),
  { ssr: false }
);
const HairlineBranches = dynamic(
  () =>
    import("@/components/hairline-terminal").then((m) => ({ default: m.HairlineBranches })),
  { ssr: false }
);
const HairlineCabinet = dynamic(
  () =>
    import("@/components/hairline-terminal").then((m) => ({ default: m.HairlineCabinet })),
  { ssr: false }
);
const HairlinePhone = dynamic(
  () => import("@/components/hairline-terminal").then((m) => ({ default: m.HairlinePhone })),
  { ssr: false }
);
const HairlineKeyboard = dynamic(
  () =>
    import("@/components/hairline-terminal").then((m) => ({ default: m.HairlineKeyboard })),
  { ssr: false }
);

type DeferredBelowFoldHairlineProps = {
  which:
    | "plot-riffle"
    | "branches"
    | "cabinet"
    | "phone"
    | "keyboard-dark";
};

function HairlineSlotPlaceholder({ which }: { which: DeferredBelowFoldHairlineProps["which"] }) {
  return (
    <div
      className={`${slotStyles.slot} ${slotStyles[which]}`}
      aria-hidden="true"
      data-hairline-slot={which}
    >
      <div className={styles.figure} style={{ width: "100%", aspectRatio: "5 / 4" }} />
    </div>
  );
}

export function DeferredBelowFoldHairline({ which }: DeferredBelowFoldHairlineProps) {
  const calmHold = useCalmSceneAwaitingInput();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) setReady(true);
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(run, { timeout: 3500 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(run, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  if (calmHold || !ready) {
    return <HairlineSlotPlaceholder which={which} />;
  }

  switch (which) {
    case "plot-riffle":
      return (
        <div className={`${slotStyles.slot} ${slotStyles["plot-riffle"]}`}>
          <HairlinePlot />
          <HairlineRiffle />
        </div>
      );
    case "branches":
      return (
        <div className={`${slotStyles.slot} ${slotStyles.branches}`}>
          <HairlineBranches />
        </div>
      );
    case "cabinet":
      return (
        <div className={`${slotStyles.slot} ${slotStyles.cabinet}`}>
          <HairlineCabinet />
        </div>
      );
    case "phone":
      return (
        <div className={`${slotStyles.slot} ${slotStyles.phone}`}>
          <HairlinePhone />
        </div>
      );
    case "keyboard-dark":
      return (
        <div className={`${slotStyles.slot} ${slotStyles["keyboard-dark"]}`}>
          <HairlineKeyboard theme="dark" />
        </div>
      );
    default:
      return null;
  }
}
