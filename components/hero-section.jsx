"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPinIcon, MailIcon } from "@animateicons/react/lucide";
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

const techStack = ["Next.js", "React", "TypeScript", "WordPress", "Shopify", "Figma"];

export default function HeroSection() {
  const locationIconRef = useRef(null);
  const ctaIconRef = useRef(null);
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
        {/* ── Name / Identity — tall left card (2×2) ── */}
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
            <div className="flex flex-wrap gap-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 md:text-sm"
              >
                View Work →
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 md:text-sm"
              >
                Contact
              </a>
            </div>
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

          {/* Big pulsing status ring */}
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

        {/* ── Stats (2×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="col-span-2 rounded-3xl border border-border bg-card p-6 grid grid-cols-3 gap-4 items-center"
        >
          {[
            { value: "8+", label: "Years Exp." },
            { value: "20+", label: "Projects" },
            { value: "50+", label: "Clients" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl lg:text-5xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

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
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 transition-all duration-500 group-hover:from-violet-900 group-hover:via-purple-800 group-hover:to-indigo-900" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_hsl(280_90%_65%/0.4),transparent_60%)]" />
          <div className="relative flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-300/80">
              Featured Project
            </span>
            <svg
              className="h-4 w-4 text-purple-300/60 transition-colors group-hover:text-purple-200"
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
            <p className="text-xs text-purple-300/70 mt-1">
              VS Code Theme Collection · 8 dark themes · MIT licensed
            </p>
          </div>
        </motion.a>

        {/* ── Tech Stack (1×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="relative col-span-1 rounded-3xl border border-border bg-card p-5"
          style={{ minHeight: "160px" }}
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

          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── CTA (1×1) ── */}
        <motion.a
          variants={card}
          data-game-target
          href="#contact"
          className="col-span-1 rounded-3xl border border-border bg-card p-5 flex flex-col items-center justify-center gap-3 text-center group hover:border-primary/40 hover:bg-primary/5 transition-all"
          style={{ minHeight: "160px" }}
          onMouseEnter={() => ctaIconRef.current?.startAnimation()}
          onMouseLeave={() => ctaIconRef.current?.stopAnimation()}
        >
          <MailIcon ref={ctaIconRef} size={36} color="hsl(var(--primary))" />
          <div>
            <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary md:text-base">
              Let&apos;s build something great
            </p>
            <p className="mt-1 font-mono text-xs text-primary">Get in touch →</p>
          </div>
        </motion.a>
      </motion.div>

      <GeometryWarsGame open={gameOpen} onClose={() => setGameOpen(false)} />
    </section>
  );
}
