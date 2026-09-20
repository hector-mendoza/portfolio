"use client";

import { TextFillAnimation } from "@/components/block/text-fill-animation";

export default function CraftTextFill() {
  return (
    <TextFillAnimation
      text="I build digital experiences that are fast, accessible, and beautiful. Every line of code is written with intention. Every pixel is placed with purpose."
      primaryColor="hsl(var(--primary))"
      textColor="hsl(var(--foreground))"
      dimColor="color-mix(in srgb, hsl(var(--foreground)) 22%, hsl(var(--background)))"
      backgroundColor="hsl(var(--background))"
      height="180vh"
      textSize="clamp(1.75rem, 4.5vw, 3.5rem)"
      textWidth="min(90%, 56rem)"
      mobileTextSize="clamp(1.35rem, 7vw, 2rem)"
      showDetails={false}
      containerClassName="border-y border-border/60"
    />
  );
}
