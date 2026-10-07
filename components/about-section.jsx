"use client";

import { useRef } from "react";
import CountUp from "@/components/CountUp";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const stats = [
  { value: 8, suffix: "+", label: "Years" },
  { value: 20, suffix: "+", label: "Projects" },
  { value: 10, suffix: "+", label: "Clients" },
  { value: 3, suffix: "", label: "Countries" },
];

const techStack = [
  "Next.js", "React", "TypeScript", "WordPress", "Shopify",
  "Node.js", "Tailwind CSS", "GSAP", "Figma",
];

export default function AboutSection() {
  const containerRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="about" ref={containerRef} className="relative py-16 md:py-24">
      <div className="notion-section-inner">
        <p className="notion-caption mb-2">About</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Background
        </h2>

        <div className="mt-10 grid gap-10 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-12">
          <div className="mx-auto w-full max-w-[11rem] md:mx-0">
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <img
                src="/pp.png"
                alt="Hector Mendoza"
                className="aspect-square w-full object-cover grayscale"
              />
            </div>
          </div>

          <div className="min-w-0 space-y-5 text-base leading-[1.75] text-muted-foreground">
            <p>
              I&apos;m{" "}
              <span className="font-medium text-foreground">
                Head of Web Integrations at UrVenue
              </span>
              , based in Morelia, Mexico. I focus on performant, accessible,
              polished web experiences across the stack.
            </p>
            <p>
              Before UrVenue I led the web team at{" "}
              <span className="font-medium text-foreground">Once Interactive</span>
              , working with 50+ international clients in e-commerce, hospitality,
              and corporate sectors. I hold a Master&apos;s in Computer Science
              (mobile app development specialty).
            </p>
            <p>
              I care about clean code and calm interfaces — every interaction
              should feel intentional.
            </p>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-background px-4 py-4 text-center">
              <dt className="notion-caption">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {reducedMotion ? (
                  `${stat.value}${stat.suffix}`
                ) : (
                  <>
                    <CountUp
                      to={stat.value}
                      duration={1.2}
                      className="text-2xl font-semibold text-foreground"
                    />
                    {stat.suffix}
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">
          <p className="notion-caption mb-3">Stack</p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
