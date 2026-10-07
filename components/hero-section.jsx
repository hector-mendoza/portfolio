"use client";

import { motion } from "framer-motion";
import { Laptop } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/hairline-figure";
import SocialLinks from "@/components/social-links";
import { getProjectByTitle } from "@/lib/projects";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const featured = [
  getProjectByTitle("Cantera Diez Hotel"),
  getProjectByTitle("Vibe Theme"),
].filter(Boolean);

export default function HeroSection() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="hero" className="relative py-20 md:py-28">
      <div className="notion-section-inner grid gap-12 lg:grid-cols-[1fr_220px] lg:items-start lg:gap-16">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="notion-caption mb-3">Software engineer · Morelia, MX</p>
          <h1 className="text-[2.75rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Hector Mendoza
          </h1>
          <p className="mt-5 max-w-xl text-base leading-[1.7] text-muted-foreground md:text-[17px]">
            Head of Web Integrations at UrVenue. I ship fast, accessible web
            products with Next.js, WordPress, and Shopify.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="mailto:hey@hectormendoza.me"
              className="notion-btn"
              data-cuelume-press
              data-cuelume-release
            >
              Email me
            </a>
            <a href="#projects" className="notion-btn-ghost notion-link">
              View work
            </a>
          </div>

          {featured.length > 0 ? (
            <ul className="mt-12 border-t border-border">
              {featured.map((project) => (
                <li key={project.title} className="hairline-rule-list">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notion-row flex items-baseline justify-between gap-4 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground underline-offset-2 hover:underline">
                      {project.title}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
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
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto w-full max-w-[240px] lg:max-w-none lg:pt-2"
        >
          <HairlineFigure
            as={Laptop}
            intensity={0.32}
            showCaption={false}
            label="Isometric laptop; lid opens toward the pointer"
          />
        </motion.div>
      </div>
    </section>
  );
}
