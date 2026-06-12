'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import MagneticButton from './magnetic-button';
import ThemeToggle from './theme-toggle';
import Image from 'next/image';
import { MessageCircleIcon } from '@animateicons/react/lucide';

const links = [
  { label: 'Work',       href: '#projects'   },
  { label: 'About',      href: '#about'       },
  { label: 'Experience', href: '#experience'  },
  { label: 'Contact',    href: '#contact'     },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const navRef    = useRef(null);
  const msgIconRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(() => {
    gsap.from(navRef.current, { y: -80, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
  }, { scope: navRef });

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="#hero" data-cursor="link" data-cursor-label="Home" className="flex items-center gap-2">
            <Image src="/logos/logo.svg" alt="HM" width={40} height={40} className="rounded-full" />
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                data-cursor="link"
                data-cursor-label={l.label}
                className="group relative px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute bottom-1 left-4 right-4 h-px origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          {/* CTA + theme toggle + hamburger */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <MagneticButton className="hidden md:block">
              <a
                href="#contact"
                data-cursor="link"
                data-cursor-label="Talk"
                onMouseEnter={() => msgIconRef.current?.startAnimation()}
                onMouseLeave={() => msgIconRef.current?.stopAnimation()}
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 font-sans text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <MessageCircleIcon ref={msgIconRef} size={15} color="currentColor" />
                Let's Talk
              </a>
            </MagneticButton>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className="flex flex-col gap-1.5 p-2 md:hidden"
            >
              <span
                className="block h-0.5 w-6 bg-foreground transition-transform duration-300"
                style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}
              />
              <span
                className="block h-0.5 w-6 bg-foreground transition-opacity duration-300"
                style={{ opacity: mobileOpen ? 0 : 1 }}
              />
              <span
                className="block h-0.5 w-6 bg-foreground transition-transform duration-300"
                style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/97 backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="font-sans text-3xl font-black text-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
