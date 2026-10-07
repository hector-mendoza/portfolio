"use client";

import { motion } from "framer-motion";
import { Laptop } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/hairline-figure";
import SocialLinks from "@/components/social-links";
import { Link005 } from "@/components/ui/skiper-ui/skiper40";
import { getProjectByTitle } from "@/lib/projects";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const featured = [
  getProjectByTitle("Cantera Diez Hotel"),
  getProjectByTitle("Vibe Theme"),
].filter(Boolean);

export default function HeroSection() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-[88vh] items-center px-6 py-24 md:py-32"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_260px] lg:items-center lg:gap-20 xl:grid-cols-[1fr_300px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Software engineer
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-[3.25rem] md:leading-[1.05]">
            Hector{" "}
            <span className="text-gradient font-semibold">Mendoza</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Head of Web Integrations at UrVenue. I lead delivery of performant,
            accessible products with Next.js, WordPress, and Shopify.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="mailto:hey@hectormendoza.me"
              data-cuelume-press
              data-cuelume-release
              className="btn-juicy btn-juicy-pill px-6 py-2.5 text-sm"
            >
              Let&apos;s talk
            </a>
            <Link005
              href="#projects"
              className="text-sm font-medium text-foreground/85 hover:text-foreground"
            >
              View work →
            </Link005>
          </div>

          {featured.length > 0 ? (
            <ul className="mt-12 space-y-0 border-t border-border pt-8">
              {featured.map((project) => (
                <li key={project.title} className="hairline-rule-list">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cuelume-hover="tick"
                    className="group flex items-baseline justify-between gap-4 py-3.5 text-sm"
                  >
                    <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {project.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {project.year}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10">
            <SocialLinks />
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[300px] lg:max-w-none"
        >
          <HairlineFigure
            as={Laptop}
            intensity={0.48}
            label="Isometric laptop; lid opens toward the pointer"
          />
        </motion.div>
      </div>
    </section>
  );
}
