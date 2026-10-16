"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

const CuelumeProvider = dynamic(() => import("@/components/cuelume-provider"), {
  ssr: false,
});

const SiteSpotlight = dynamic(() => import("@/components/site-spotlight"), {
  ssr: false,
});

type DeferredLayoutClientsProps = {
  children?: ReactNode;
};

export default function DeferredLayoutClients({
  children,
}: DeferredLayoutClientsProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(run, { timeout: 2500 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const id = window.setTimeout(run, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <CuelumeProvider />
      <SiteSpotlight />
      {children}
    </>
  );
}
