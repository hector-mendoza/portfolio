'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, splitChars } from '@/lib/gsap';
import ContactForm from './contact-form';
import ContactInfo from './contact-info';

export default function ContactSection() {
  const sectionRef  = useRef(null);
  const headlineRef = useRef(null);

  useGSAP(() => {
    const chars = splitChars(headlineRef.current);
    gsap.from(chars, {
      y: 50, opacity: 0, stagger: 0.02, duration: 0.6, ease: 'power3.out',
      transformOrigin: 'bottom center',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
      },
    });
  }, { scope: sectionRef, dependencies: [] });

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative bg-background py-32"
    >
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-20">
          <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary">
            05 / Contact
          </p>
          <h2
            ref={headlineRef}
            className="font-sans font-black leading-[0.88] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 5rem)', perspective: '500px' }}
          >
            {"Let's build something together."}
          </h2>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <ContactInfo />
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
