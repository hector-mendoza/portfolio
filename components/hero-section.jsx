"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPinIcon } from "@animateicons/react/lucide";
import GeometryWarsGame from "./geometry-wars-game";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const card = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const primaryStack = ["Next.js", "React", "TypeScript", "WordPress"];
const moreStack = ["Shopify", "Figma"];

export default function HeroSection() {
  const locationIconRef = useRef(null);
  const [gameOpen, setGameOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-28"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {/* ── Identity (2×2) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="col-span-2 row-span-2 rounded-3xl border border-border bg-card p-8 md:p-10 flex flex-col justify-between"
          style={{ minHeight: "340px" }}
        >
          <div>
            <span className="mb-5 inline-block font-mono text-xs uppercase tracking-[0.25em] text-primary">
              Software Engineer
            </span>
            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl xl:text-8xl">
              Hector
              <br />
              <span className="text-gradient">Mendoza</span>
            </h1>
          </div>

          <div>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">
              Head of Web Integrations at{" "}
              <span className="font-medium text-foreground">UrVenue</span>
              {" · "}Lead Developer · 8+ years crafting performant web
              experiences.
            </p>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 md:text-sm"
            >
              View Work →
            </a>
          </div>
        </motion.div>

        {/* ── Available (1×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="col-span-1 rounded-3xl border border-primary/25 bg-primary/10 p-5 flex flex-col"
          style={{ minHeight: "160px" }}
        >
          <div className="flex items-center gap-2 mb-auto">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Available
            </span>
          </div>

          <div className="flex items-center justify-center py-3">
            <div className="relative flex items-center justify-center">
              <span className="absolute h-14 w-14 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2.4s" }} />
              <span className="absolute h-10 w-10 rounded-full bg-primary/15 animate-ping" style={{ animationDuration: "1.8s", animationDelay: "0.3s" }} />
              <span className="relative h-6 w-6 rounded-full bg-primary/60 shadow-lg shadow-primary/40" />
            </div>
          </div>

          <p className="mt-auto text-xs leading-snug text-muted-foreground">
            Open to new projects &amp; collaborations
          </p>
        </motion.div>

        {/* ── Location (1×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="col-span-1 rounded-3xl border border-border bg-card p-5 flex flex-col items-center justify-center gap-3 text-center"
          style={{ minHeight: "160px" }}
          onMouseEnter={() => locationIconRef.current?.startAnimation()}
          onMouseLeave={() => locationIconRef.current?.stopAnimation()}
        >
          <MapPinIcon ref={locationIconRef} size={36} color="hsl(var(--primary))" />
          <div>
            <p className="text-base font-bold text-foreground">Morelia, Mexico</p>
            <p className="text-xs text-muted-foreground">UTC−6</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/50 tracking-wide">19.70° N · 101.19° W</p>
          </div>
        </motion.div>

        {/* ── Currently at UrVenue (2×1) — fills row 2 gap ── */}
        <motion.a
          variants={card}
          data-game-target
          href="#experience"
          className="col-span-2 md:col-start-3 rounded-3xl border border-border bg-card p-5 flex flex-col justify-between group transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
          style={{ minHeight: "160px" }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Currently
            </span>
            <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
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
          <span className="font-mono text-xs text-primary">View experience →</span>
        </motion.a>

        {/* ── Latest build: Cantera Diez (2×1) ── */}
        <motion.a
          variants={card}
          data-game-target
          href="https://canteradiezhotel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 rounded-3xl overflow-hidden relative group flex flex-col justify-between p-6"
          style={{ minHeight: "180px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900/80 transition-all duration-500 group-hover:from-amber-900 group-hover:via-stone-800 group-hover:to-amber-800/80" />
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(32_95%_55%/0.35),transparent_60%)]" />
          <div className="relative flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-300/80">
              Latest Build
            </span>
            <svg
              className="h-4 w-4 text-amber-300/60 transition-colors group-hover:text-amber-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </div>
          <div className="relative">
            <p className="text-2xl font-bold text-white md:text-3xl">Cantera Diez Hotel</p>
            <p className="text-xs text-amber-200/70 mt-1">
              Boutique hospitality · AngularJS · Firebase · i18n
            </p>
          </div>
        </motion.a>

        {/* ── Featured project: Vibe Theme (2×1) ── */}
        <motion.a
          variants={card}
          data-game-target
          href="https://vibetheme.hectormendoza.me"
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 rounded-3xl overflow-hidden relative group flex flex-col justify-between p-6"
          style={{ minHeight: "180px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-fuchsia-950 to-purple-950 transition-all duration-500 group-hover:from-violet-900 group-hover:via-fuchsia-900 group-hover:to-purple-900" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_hsl(300_90%_65%/0.4),transparent_60%)]" />
          <div className="relative flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-fuchsia-300/80">
              Featured Project
            </span>
            <svg
              className="h-4 w-4 text-fuchsia-300/60 transition-colors group-hover:text-fuchsia-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </div>
          <div className="relative">
            <p className="text-2xl font-bold text-white md:text-3xl">Vibe Theme</p>
            <p className="text-xs text-fuchsia-300/70 mt-1">
              VS Code Theme Collection · 8 dark themes · MIT licensed
            </p>
          </div>
        </motion.a>

        {/* ── About / profile (2×1) ── */}
        <motion.a
          variants={card}
          data-game-target
          href="#about"
          className="col-span-2 rounded-3xl border border-border bg-card p-5 flex items-center gap-5 group transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
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
            <p className="mt-1 text-xs text-primary">Read my story →</p>
          </div>
        </motion.a>

        {/* ── Tech Stack (2×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="relative col-span-2 rounded-3xl border border-border bg-card p-5 flex flex-col justify-between"
          style={{ minHeight: "140px" }}
        >
          <button
            onClick={() => setGameOpen(true)}
            aria-label="Play a hidden mini-game"
            title="Psst — play a mini-game"
            className="group absolute right-3 top-3 flex items-center justify-center"
          >
            <span className="absolute h-9 w-9 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2.4s" }} />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h4m-2-2v4m8-3h.01M17 13h.01M7.5 7h9A4.5 4.5 0 0121 11.5v3a3 3 0 01-5.6 1.5l-.9-1.5H9.5l-.9 1.5A3 3 0 013 14.5v-3A4.5 4.5 0 017.5 7z" />
              </svg>
            </span>
          </button>

          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {primaryStack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {moreStack.join(" · ")}
            </span>
          </div>
        </motion.div>
      </motion.div>

      <GeometryWarsGame open={gameOpen} onClose={() => setGameOpen(false)} />
    </section>
  );
}
