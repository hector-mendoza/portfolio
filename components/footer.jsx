"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { GithubIcon, LinkedinIcon } from "@animateicons/react/lucide";

function FooterSocialLink({ href, label, Icon }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cuelume-hover="tick"
      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary font-mono"
      onMouseEnter={() => { setHovered(true); ref.current?.startAnimation(); }}
      onMouseLeave={() => { setHovered(false); ref.current?.stopAnimation(); }}
    >
      <Icon ref={ref} size={14} color={hovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} />
      {label}
    </a>
  );
}

function FooterSocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <FooterSocialLink href="https://github.com/hector-mendoza" label="GitHub" Icon={GithubIcon} />
      <FooterSocialLink href="https://www.linkedin.com/in/hector-mendoza-m/" label="LinkedIn" Icon={LinkedinIcon} />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card dark:border-primary/30 dark:bg-primary/15">
              <img
                src="/logos/logo.svg"
                alt="HM logo"
                className="h-5 w-5 dark:invert dark:brightness-110"
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

          <FooterSocialLinks />
        </div>
      </div>
    </footer>
  );
}
