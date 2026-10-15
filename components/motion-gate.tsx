"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type MotionGateProps = {
  motion: ReactNode;
  fallback: ReactNode;
  className?: string;
};

export default function MotionGate({ motion, fallback, className }: MotionGateProps) {
  const reducedMotion = usePrefersReducedMotion();
  return <div className={className}>{reducedMotion ? fallback : motion}</div>;
}
