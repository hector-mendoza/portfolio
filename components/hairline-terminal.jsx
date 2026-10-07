"use client";

import { useEffect, useRef } from "react";
import { terminal } from "@lucasmarkes/hairline";

export default function HairlineTerminal() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const figure = terminal(containerRef.current, {
      intensity: 0.72,
      theme: "light",
      label:
        "An interactive isometric terminal representing Hector's engineering work",
    });

    return () => figure.destroy();
  }, []);

  return <div ref={containerRef} style={{ aspectRatio: "5 / 4" }} />;
}
