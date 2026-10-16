"use client";

import dynamic from "next/dynamic";

const SceneHtmlState = dynamic(() => import("@/components/scene/SceneHtmlState"), {
  ssr: false,
});

const LivingCanvasLoader = dynamic(
  () => import("@/components/scene/LivingCanvasLoader"),
  { ssr: false }
);

export default function LayoutSceneShell() {
  return (
    <>
      <SceneHtmlState />
      <LivingCanvasLoader />
    </>
  );
}
