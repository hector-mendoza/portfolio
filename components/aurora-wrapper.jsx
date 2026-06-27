"use client";

import dynamic from "next/dynamic";

const AuroraCanvas = dynamic(() => import("./aurora-canvas"), { ssr: false });

export default function AuroraWrapper() {
  return <AuroraCanvas />;
}
