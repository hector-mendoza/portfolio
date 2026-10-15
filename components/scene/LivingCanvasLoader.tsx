"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LivingCanvas = dynamic(() => import("./LivingCanvas"), {
  ssr: false,
});

export default function LivingCanvasLoader() {
  const [sceneMounted, setSceneMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const mount = () => {
      if (!cancelled) setSceneMounted(true);
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(mount, { timeout: 800 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    let timeoutId: number | undefined;
    const onLoad = () => {
      timeoutId = window.setTimeout(mount, 800);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelled = true;
      if (timeoutId != null) window.clearTimeout(timeoutId);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (!sceneMounted) return null;

  return <LivingCanvas />;
}
