"use client";

import { Terminal } from "@lucasmarkes/hairline/react";

export default function HairlineTerminal() {
  return (
    <Terminal
      intensity={0.72}
      theme="light"
      label="An interactive isometric terminal representing Hector's engineering work"
    />
  );
}
