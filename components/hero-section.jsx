"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MorphIcon } from "morphicons/react";
import { Gamepad2, Sparkles } from "lucide";
import GeometryWarsGame from "./geometry-wars-game";
import BentoSocialGrid from "./bento-social-grid";
import HeroMouseGlow from "./hero-mouse-glow";
import { Link005 } from "@/components/ui/skiper-ui/skiper40";
import HeroFeaturedCard from "@/components/hero-featured-card";
import { getProjectByTitle } from "@/lib/projects";
import BlurText from "@/components/BlurText";
import ShinyText from "@/components/ShinyText";
import SpotlightCard from "@/components/SpotlightCard";
import Magnet from "@/components/Magnet";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

let heroIntroPlayed = false;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const primaryStack = ["Next.js", "React", "TypeScript", "WordPress"];
const moreStack = ["Shopify", "Figma"];

const canteraProject = getProjectByTitle("Cantera Diez Hotel");
const vibeProject = getProjectByTitle("Vibe Theme");

export default function HeroSection() {
  const [gameOpen, setGameOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [playIntro] = useState(() => {
    if (heroIntroPlayed) return false;
    heroIntroPlayed = true;
    return true;
  });
  const reducedMotion = usePrefersReducedMotion();
  return (
    <section
      id="hero"
      className="relative min-h-screen max-w-full overflow-x-clip flex items-center justify-center px-4 py-20 md:py-28"
    >
      <HeroMouseGlow className="relative w-full max-w-5xl mx-auto">
      <motion.div
        variants={container}
        initial={playIntro ? "hidden" : false}
        animate="show"
        className="grid w-full min-w-0 grid-cols-2 gap-3 md:grid-cols-4"
      >
        {/* ── Identity (2×2) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="relative order-1 col-span-2 row-span-2 min-w-0 overflow-hidden rounded-3xl"
          style={{ minHeight: "340px" }}
        >
          <SpotlightCard
            className="glass-card glass-card-hero flex h-full min-h-[340px] flex-col justify-between border-0 bg-transparent p-6 md:p-10"
            spotlightColor="hsla(var(--primary) / 0.28)"
          >
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <span className="mb-5 inline-block max-w-full font-mono text-xs uppercase tracking-[0.25em] text-primary">
                <ShinyText
                  text="Software Engineer"
                  speed={3}
                  delay={1.4}
                  color="hsl(var(--primary))"
                  shineColor="#ffffff"
                  className="block max-w-full overflow-hidden font-mono text-[10px] uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.25em]"
                  disabled={reducedMotion}
                />
              </span>
              <h1 className="max-w-full text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                {reducedMotion ? (
                  <>
                    Hector
                    <br />
                    <span className="text-gradient">Mendoza</span>
                  </>
                ) : (
                  <>
                    <BlurText
                      text="Hector"
                      as="span"
                      animateBy="chars"
                      delay={35}
                      stepDuration={0.28}
                      className="block"
                    />
                    <BlurText
                      text="Mendoza"
                      as="span"
                      animateBy="chars"
                      delay={35}
                      stepDuration={0.28}
                      className="block"
                      spanClassName="text-gradient"
                    />
                  </>
                )}
              </h1>
            </div>

            <div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">
                Head of Web Integrations at{" "}
                <span className="font-medium text-foreground">UrVenue</span>
                {" · "}Lead Developer · 8+ years crafting performant web
                experiences.
              </p>
              <Magnet padding={40} magnetStrength={4} disabled={reducedMotion} wrapperClassName="inline-block">
                <Link005
                  href="#projects"
                  className="inline-flex w-fit items-center text-sm font-semibold text-foreground md:text-base"
                >
                  View Work
                </Link005>
              </Magnet>
            </div>
          </div>
          </SpotlightCard>
        </motion.div>

        {/* ── Social bento (2×2) ── */}
        <BentoSocialGrid cardVariant={card} />

        {/* ── Currently at UrVenue (2×1) — fills row 2 gap ── */}
        <motion.a
          variants={card}
          data-game-target
          href="#experience"
          data-cuelume-hover="tick"
          className="order-4 col-span-2 min-w-0 md:order-3 md:col-start-3 rounded-3xl glass-card p-5 flex flex-col justify-between group"
          style={{ minHeight: "160px" }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Currently
            </span>
            <span className="glass-subtle rounded-full px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              2024 — Present
            </span>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground transition-colors group-hover:text-primary md:text-2xl">
              UrVenue
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
              Head of Web Integrations · Venue tech, APIs &amp; enterprise web delivery
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 btn-juicy-outline btn-juicy-pill px-3 py-1.5 font-mono text-xs">
            View experience →
          </span>
        </motion.a>

        {canteraProject && (
          <HeroFeaturedCard
            project={canteraProject}
            badge="Latest Build"
            cardVariant={card}
            className="order-5 col-span-2 min-w-0 md:order-4"
            style={{ minHeight: "180px" }}
          />
        )}

        {vibeProject && (
          <HeroFeaturedCard
            project={vibeProject}
            badge="Featured Project"
            cardVariant={card}
            className="order-6 col-span-2 min-w-0 md:order-5"
            style={{ minHeight: "180px" }}
          />
        )}

        {/* ── About / profile (2×1) — first after identity on mobile ── */}
        <motion.a
          variants={card}
          data-game-target
          href="#about"
          data-cuelume-hover="tick"
          className="order-2 col-span-2 min-w-0 rounded-3xl glass-card p-5 flex items-center gap-5 group md:order-6"
          style={{ minHeight: "140px" }}
        >
          <div
            className="h-20 w-20 shrink-0 overflow-hidden border border-border/60 shadow-lg shadow-primary/10 sm:h-24 sm:w-24"
            style={{ borderRadius: "20px" }}
          >
            <img
              src="/pp.png"
              alt="Hector Mendoza"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              About
            </span>
            <p className="mt-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
              Builder, lead dev &amp; design-minded engineer
            </p>
            <p className="mt-1 text-xs text-primary">
              <span className="inline-flex items-center btn-juicy-outline btn-juicy-pill px-3 py-1 font-mono text-[10px]">
                Read my story →
              </span>
            </p>
          </div>
        </motion.a>

        {/* ── Tech Stack (2×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="relative order-7 col-span-2 min-w-0 rounded-3xl glass-card p-5 flex flex-col justify-between"
          style={{ minHeight: "140px" }}
        >
          <button
            onClick={() => setGameOpen(true)}
            onMouseEnter={() => setHoveredCard("gamepad")}
            onMouseLeave={() => setHoveredCard(null)}
            data-cuelume-press
            data-cuelume-release
            aria-label="Play a hidden mini-game"
            title="Psst — play a mini-game"
            className="group absolute right-3 top-3 flex items-center justify-center"
          >
            <span className="absolute h-9 w-9 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2.4s" }} />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full glass-subtle text-primary transition-all group-hover:scale-110 group-hover:border-primary/50">
              <MorphIcon
                icon={hoveredCard === "gamepad" ? Sparkles : Gamepad2}
                size={16}
                color="hsl(var(--primary))"
                spring="bouncy"
              />
            </span>
          </button>

          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {primaryStack.map((t) => (
              <span
                key={t}
                className="glass-pill rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {t}
              </span>
            ))}
            <span className="glass-pill rounded-full border-dashed px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {moreStack.join(" · ")}
            </span>
          </div>
        </motion.div>
      </motion.div>
      </HeroMouseGlow>

      <GeometryWarsGame open={gameOpen} onClose={() => setGameOpen(false)} />
    </section>
  );
}
