"use client";

import { useEffect, useRef } from "react";
import { branches, query, terminal } from "@lucasmarkes/hairline";

function HairlineFigure({ mount, label, intensity = 0.72, theme = "light" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const figure = mount(containerRef.current, {
      intensity,
      theme,
      label,
    });

    return () => figure.destroy();
  }, [intensity, label, mount, theme]);

  return <div ref={containerRef} style={{ aspectRatio: "5 / 4" }} />;
}

export default function HairlineTerminal() {
  return (
    <HairlineFigure
      mount={terminal}
      label="An interactive isometric terminal representing Hector's engineering work"
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
    />
  );
}

export function HairlineQuery() {
  return (
    <HairlineFigure
      mount={query}
      intensity={0.6}
      label="An interactive question mark that follows the pointer"
    />
  );
}
