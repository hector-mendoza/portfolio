"use client";

import { motion } from "motion/react";
import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
              <img
                src="/logos/logo.svg"
                alt="HM logo"
                className="h-5 w-5 invert brightness-110"
              />
            </div>
            <span className="text-sm font-semibold text-foreground">Hector Mendoza</span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {"Designed & Built with Next.js & Framer Motion · "}
            <a
              href="https://vibetheme.hectormendoza.me"
              target="_blank"
              rel="noopener noreferrer"
              data-cuelume-hover="tick"
              className="text-primary hover:underline"
            >
              Vibe Theme
            </a>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SocialLinks />
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
