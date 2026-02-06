"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function ScrollTextReveal() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const words =
    "I build digital experiences that are fast, accessible, and beautiful. Every line of code is written with intention. Every pixel is placed with purpose.".split(
      " "
    );

  return (
    <section ref={containerRef} className="relative py-40 overflow-hidden">
      {/* Large masked background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.03]">
        <span className="text-[20vw] font-bold leading-none text-foreground whitespace-nowrap">
          CRAFT
        </span>
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;

            return (
              <Word
                key={`${word}-${i}`}
                word={word}
                progress={scrollYProgress}
                range={[start * .55, end * .55 + 0.1]}
              />
            );
          })}
        </div>
      </div>

      {/* Divider line */}
      <motion.div
        style={{
          scaleX: useTransform(scrollYProgress, [0, 0.5], [0, 1]),
        }}
        className="mx-auto mt-20 max-w-md origin-left line-glow"
      />
    </section>
  );
}

function Word({ word, progress, range }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [10, 0]);

  return (
    <motion.span
      style={{ opacity, y }}
      className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl"
    >
      {word}
    </motion.span>
  );
}
