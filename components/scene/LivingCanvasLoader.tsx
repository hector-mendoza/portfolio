"use client";

import dynamic from "next/dynamic";

const LivingCanvas = dynamic(() => import("./LivingCanvas"), {
  ssr: false,
});

export default function LivingCanvasLoader() {
  return <LivingCanvas />;
}
