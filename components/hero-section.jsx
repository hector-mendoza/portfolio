'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, splitChars } from '@/lib/gsap';
import MagneticButton from './magnetic-button';
import { SendIcon, MessageCircleIcon } from '@animateicons/react/lucide';

const InkScene = dynamic(() => import('./ink-scene'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background" />,
});

export default function HeroSection() {
  const sectionRef   = useRef(null);
  const line1Ref     = useRef(null);
  const line2Ref     = useRef(null);
  const subRef       = useRef(null);
  const ctaRef       = useRef(null);
  const hintRef      = useRef(null);
  const [inkVisible, setInkVisible] = useState(true);

  useGSAP(() => {
    const section = sectionRef.current;

    gsap.matchMedia().add('(min-width: 768px)', () => {
      ScrollTrigger.create({
        trigger: section,
        pin: true,
        pinSpacing: true,
        start: 'top top',
        end: '+=60%',
      });
    });

    ScrollTrigger.create({
      trigger:     section,
      start:       'top top',
      end:         'bottom top',
      onLeave:     () => setInkVisible(false),
      onEnterBack: () => setInkVisible(true),
    });

    const chars1 = splitChars(line1Ref.current);
    const chars2 = splitChars(line2Ref.current);

    const tl = gsap.timeline({ delay: 0.4 });
    tl.from(chars1, {
        y: 70, opacity: 0, rotateX: 90,
        stagger: 0.028, duration: 0.75, ease: 'power3.out',
        transformOrigin: 'bottom center',
      })
      .from(chars2, {
        y: 70, opacity: 0, rotateX: 90,
        stagger: 0.028, duration: 0.75, ease: 'power3.out',
        transformOrigin: 'bottom center',
      }, '-=0.55')
      .from(subRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .from(ctaRef.current.children, { y: 20, opacity: 0, stagger: 0.12, duration: 0.5 }, '-=0.3')
      .from(hintRef.current,  { opacity: 0, duration: 0.5 }, '-=0.1');
  }, { scope: sectionRef, dependencies: [] });

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      {inkVisible && (
        <div className="fixed inset-0 z-0">
          <InkScene />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-radial from-transparent to-background/30" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <p className="mb-10 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-primary">
          01 / Introduction
        </p>

        <h1
          className="mb-6 font-sans font-black leading-[0.88] tracking-tight text-foreground"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 6.5rem)', perspective: '600px' }}
        >
          <span ref={line1Ref} className="block" aria-hidden="true">Making the web</span>
          <span ref={line2Ref} className="block italic text-primary" aria-hidden="true">move.</span>
          <span className="sr-only">Making the web move.</span>
        </h1>

        <p
          ref={subRef}
          className="mx-auto mb-12 max-w-md font-mono text-xs uppercase tracking-widest text-muted-foreground"
          data-cursor="text"
        >
          Senior Software Engineer &nbsp;·&nbsp; 8+ years &nbsp;·&nbsp; Morelia, Mexico
        </p>

        <div ref={ctaRef} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton>
            <a
              href="#projects"
              data-cursor="link"
              data-cursor-label="View"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-sans text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
            >
              View Work
              <SendIcon size={16} color="currentColor" />
            </a>
          </MagneticButton>

          <MagneticButton>
            <a
              href="#contact"
              data-cursor="link"
              data-cursor-label="Talk"
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-8 py-4 font-sans text-sm font-bold text-foreground transition-all hover:border-primary hover:text-primary"
            >
              Let's Talk
              <MessageCircleIcon size={16} color="currentColor" />
            </a>
          </MagneticButton>
        </div>

        <div ref={hintRef} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
            Scroll →
          </span>
        </div>
      </div>
    </section>
  );
}
