"use client";

import { RectangularTextReveal } from "@/components/block/rectangular-text-reveal";

const QUOTE =
  "I build digital experiences that are fast, accessible, and beautiful. Every line of code is written with intention. Every pixel is placed with purpose.";

export default function ScrollTextReveal() {
  return (
    <section className="relative overflow-hidden py-20 md:py-40">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
        <span className="whitespace-nowrap text-[20vw] font-bold leading-none text-foreground">
          CRAFT
        </span>
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <span className="mb-6 inline-block font-mono text-xs uppercase tracking-widest text-primary">
          Philosophy
        </span>
        <RectangularTextReveal
          as="p"
          baseColor="hsl(var(--primary))"
          overlayColor="hsl(var(--background))"
          className="text-balance text-3xl font-bold sm:text-4xl md:text-5xl"
          stagger={0.12}
        >
          {QUOTE}
        </RectangularTextReveal>
      </div>

      <div className="mx-auto mt-20 max-w-md origin-left line-glow" />
    </section>
  );
}
