"use client";

import SocialLinks from "./social-links";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-background">
      <div className="notion-section-inner py-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border">
              <img src="/logos/logo.svg" alt="HM logo" className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Hector Mendoza</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Built with Next.js · Figures by{" "}
            <Link001
              href="https://hairline.lucasmarkes.com"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Hairline
            </Link001>
          </p>

          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
