"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { MoonIcon, SunIcon } from "@animateicons/react/lucide";

const navLinks = [
  { label: "Home",       href: "/#hero" },
  { label: "About",      href: "/#about" },
  { label: "Projects",   href: "/#projects" },
  { label: "Blog",       href: "/blog" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact",    href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const themeIconRef = useRef(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";
  const isHome = pathname === "/";
  const showSolidNav = scrolled || !isHome;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (e) => {
    const next = isDark ? "light" : "dark";
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);

    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }
    document.startViewTransition(() => setTheme(next));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showSolidNav ? "navbar-scrolled" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="/" className="group flex items-center gap-2" data-cuelume-hover="tick">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all group-hover:border-primary/40 group-hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/15">
              <img
                src="/logos/logo.svg"
                alt="HM logo"
                className="h-7 w-7 dark:invert dark:brightness-110"
              />
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-cuelume-hover="tick"
                className={`group relative px-4 py-2 text-sm transition-colors ${
                  showSolidNav
                    ? "font-medium text-foreground/90 hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>

          {/* CTA + theme toggle + hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              data-cuelume-toggle
              onMouseEnter={() => themeIconRef.current?.startAnimation()}
              onMouseLeave={() => themeIconRef.current?.stopAnimation()}
              aria-label="Toggle theme"
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border transition-all hover:border-primary/40 hover:text-primary ${
                showSolidNav
                  ? "bg-card text-foreground shadow-sm"
                  : "bg-background/50 text-muted-foreground"
              }`}
            >
              {isDark ? (
                <SunIcon ref={themeIconRef} size={16} color="currentColor" />
              ) : (
                <MoonIcon ref={themeIconRef} size={16} color="currentColor" />
              )}
            </button>
            <a
              href="/#contact"
              data-cuelume-press
              data-cuelume-release
              className="hidden btn-juicy btn-juicy-pill px-5 py-2 text-sm md:block"
            >
              {"Let's Talk"}
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-cuelume-press
              data-cuelume-release
              className="flex flex-col gap-1.5 p-2 md:hidden"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 7.5 }  : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-6 bg-foreground"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-6 bg-foreground"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-6 bg-foreground"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-xl md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                data-cuelume-hover="tick"
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-2xl font-semibold text-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
