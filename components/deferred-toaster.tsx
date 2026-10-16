"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ToasterProvider = dynamic(
  () =>
    import("@/components/toaster-provider").then((m) => ({
      default: m.ToasterProvider,
    })),
  { ssr: false }
);

export default function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) setReady(true);
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(run, { timeout: 4000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(run, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  if (!ready) return null;
  return <ToasterProvider />;
}
