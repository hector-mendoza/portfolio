"use client";

import { useEffect, useState } from "react";

/** True on calm tier until first trusted scroll / pointer / touch wakes the scene loop. */
export function useCalmSceneAwaitingInput(): boolean {
  const [awaiting, setAwaiting] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      setAwaiting(root.hasAttribute("data-calm-scene-awaiting-input"));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-calm-scene-awaiting-input"],
    });
    return () => observer.disconnect();
  }, []);

  return awaiting;
}
