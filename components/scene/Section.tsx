"use client";

import { registerSection } from "@/lib/scene/store";
import type { SectionId } from "@/lib/scene/types";
import { useEffect, useRef, type ReactNode } from "react";

type SectionProps = {
  id: SectionId;
  children: ReactNode;
  className?: string;
};

export default function Section({ id, children, className }: SectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerSection(id, el);
  }, [id]);

  return (
    <section ref={ref} data-section={id} className={className}>
      {children}
    </section>
  );
}
