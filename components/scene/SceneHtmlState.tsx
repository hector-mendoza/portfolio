"use client";

import { useSceneDataSceneAttribute } from "@/lib/scene/store";
import { useEffect } from "react";

export default function SceneHtmlState() {
  const dataScene = useSceneDataSceneAttribute();

  useEffect(() => {
    document.documentElement.setAttribute("data-scene", dataScene);
  }, [dataScene]);

  return null;
}
