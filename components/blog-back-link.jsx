"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeftIcon } from "@animateicons/react/lucide";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export default function BlogBackLink() {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Link
      href="/blog"
      data-cuelume-hover="tick"
      className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
      onMouseEnter={() => {
        if (!reducedMotion) ref.current?.startAnimation();
      }}
      onMouseLeave={() => {
        if (!reducedMotion) ref.current?.stopAnimation();
      }}
    >
      <ChevronLeftIcon ref={ref} size={16} color="currentColor" />
      Back to blog
    </Link>
  );
}
