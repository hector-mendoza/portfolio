"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

export function DeferredBelowFoldHairline({ which }: DeferredBelowFoldHairlineProps) {
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

  if (!ready) return null;

  switch (which) {
    case "plot-riffle":
      return (
        <>
          <HairlinePlot />
          <HairlineRiffle />
        </>
      );
    case "branches":
      return <HairlineBranches />;
    case "cabinet":
      return <HairlineCabinet />;
    case "phone":
      return <HairlinePhone />;
    case "keyboard-dark":
      return <HairlineKeyboard theme="dark" />;
    default:
      return null;
  }
}
