"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 transition-transform group-hover:rotate-12">
              <img
                src="/logos/logo.svg"
                alt="HM logo"
                className="h-8 w-8"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              Hector Mendoza
            </span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {"Designed & Built with Next.js, Three.js & Framer Motion"}
          </p>

        </div>
      </div>
    </footer>
  );
}
