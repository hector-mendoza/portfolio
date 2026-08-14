"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";
import { Link000 } from "@/components/ui/skiper-ui/skiper40";

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";
  const showSolidNav = scrolled || !isHome;

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
          <a href="/" className="group flex items-center gap-2" data-cuelume-hover="tick">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 shadow-sm transition-all group-hover:border-primary/40 group-hover:bg-primary/20">
              <img
                src="/logos/logo.svg"
                alt="HM logo"
                className="h-7 w-7 invert brightness-110"
              />
            </div>
          </a>

          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((link) => (
              <Link000
                key={link.label}
                href={link.href}
                className={`text-sm transition-colors ${
                  showSolidNav
                    ? "font-medium text-foreground/90 hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link000>
            ))}
          </div>

          <div className="flex items-center gap-3">
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
              onClick={() => setMobileOpen((open) => !open)}
              data-cuelume-press
              data-cuelume-release
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground md:hidden"
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
      </motion.nav>

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
