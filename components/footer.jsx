"use client";

import { useState } from "react";
import { Github, Linkedin } from "@/lib/brand-icons";
import { MorphIconHover } from "@/components/morph-icon-hover";

function FooterSocialLink({ href, label, icon }) {
  const [hovered, setHovered] = useState(false);
  const muted = "hsl(var(--muted-foreground))";
  const primary = "hsl(var(--primary))";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cuelume-hover="tick"
      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary font-mono"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MorphIconHover
        icon={icon}
        hovered={hovered}
        size={14}
        color={muted}
        hoverColor={primary}
      />
      {label}
    </a>
  );
}

function FooterSocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <FooterSocialLink href="https://github.com/hector-mendoza" label="GitHub" icon={Github} />
      <FooterSocialLink href="https://www.linkedin.com/in/hector-mendoza-m/" label="LinkedIn" icon={Linkedin} />
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
