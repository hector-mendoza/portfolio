"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./scene-3d"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-b from-background via-background/95 to-background" />
  ),
});

const charVariants = {
  hidden: { opacity: 0, y: 80, rotateX: 90 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.8 + i * 0.04,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function AnimatedText({ text, className, startDelay = 0 }) {
  const chars = text.split("");
  return (
    <span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          custom={i + startDelay}
          variants={charVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
          style={{ perspective: "500px" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function HeroSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="fixed inset-0 z-0">
        <Scene3D />
      </div>

      <div className="absolute inset-0 bg-background/50 z-[1] pointer-events-none" />

      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative z-10 mx-auto max-w-7xl px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5"
        >
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs text-primary">
            Available for new projects
          </span>
        </motion.div>

        <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-foreground sm:text-7xl lg:text-9xl">
          <span className="block overflow-hidden">
            <AnimatedText text="Crafting" className="text-foreground" />
            {" "}
            <AnimatedText text="Digital" className="text-gradient" startDelay={8} />
          </span>
          <span className="block overflow-hidden mt-2">
            <AnimatedText text="Experiences" className="text-foreground" startDelay={16} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          {"Senior Software Engineer with 8+ years building performant web applications. Specializing in "}
          <span className="text-foreground font-medium">Next.js</span>
          {", "}
          <span className="text-foreground font-medium">React</span>
          {", and modern web technologies."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.9 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/25"
          >
            View My Work
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.a>
          <motion.a
            href="#about"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            About Me
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-24"
        >
          <a
            href="#about"
            className="group inline-flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em]">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </a>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
