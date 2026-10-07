"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";
import { Link000 } from "@/components/ui/skiper-ui/skiper40";

const navLinks = [
  { label: "Work", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";
  const showSolidNav = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          showSolidNav ? "navbar-scrolled" : "border-b border-transparent bg-background/80"
        }`}
      >
        <div className="notion-section-inner flex items-center justify-between py-3 md:py-4">
          <a href="/" className="flex items-center gap-2.5" data-cuelume-hover="tick">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
              <img src="/logos/logo.svg" alt="HM logo" className="h-5 w-5" />
            </div>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              Hector Mendoza
            </span>
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link000
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link000>
            ))}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("site-spotlight:toggle"))}
              className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              aria-label="Open site search"
            >
              <span>Search</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
                ⌘K
              </kbd>
            </button>
            <a
              href="mailto:hey@hectormendoza.me"
              className="notion-btn hidden px-4 py-1.5 text-xs md:inline-flex"
            >
              Email
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <MorphIcon
                icon={mobileOpen ? X : Menu}
                size={22}
                color="currentColor"
                spring="snappy"
              />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col items-start gap-1 bg-background px-6 pt-20 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="notion-row w-full rounded-md px-2 py-3 text-lg font-medium text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}
