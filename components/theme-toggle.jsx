'use client';

import { useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { gsap } from '@/lib/gsap';

function SunSVG() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const rippleRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const handleToggle = () => {
    const isDark = resolvedTheme === 'dark';
    const tl = gsap.timeline();

    tl.fromTo(
      rippleRef.current,
      { scale: 0, opacity: 0.55 },
      { scale: 5, opacity: 0, duration: 0.55, ease: 'power2.out' },
      0
    )
    .to(
      iconRef.current,
      { scale: 0.5, rotate: isDark ? -40 : 40, opacity: 0, duration: 0.15, ease: 'power2.in' },
      0
    )
    .add(() => setTheme(isDark ? 'light' : 'dark'), 0.15)
    .fromTo(
      iconRef.current,
      { scale: 0.5, rotate: isDark ? 40 : -40, opacity: 0 },
      { scale: 1, rotate: 0, opacity: 1, duration: 0.25, ease: 'back.out(2)' },
      0.2
    );
  };

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative h-9 w-9 overflow-hidden rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
    >
      <span
        ref={rippleRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-primary"
        style={{ transform: 'scale(0)', opacity: 0 }}
      />
      <span
        ref={iconRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {isDark ? <MoonSVG /> : <SunSVG />}
      </span>
    </button>
  );
}
