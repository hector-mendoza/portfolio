"use client";

import { registerSection } from "@/lib/scene/store";
import type { SectionId } from "@/lib/scene/types";
import { useEffect } from "react";

type SectionSceneRegisterProps = {
  id: SectionId;
  targetId: string;
};

export default function SectionSceneRegister({
  id,
  targetId,
}: SectionSceneRegisterProps) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    return registerSection(id, el);
  }, [id, targetId]);

  return null;
}
