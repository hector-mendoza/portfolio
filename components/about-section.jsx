'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, splitChars } from '@/lib/gsap';

const stats = [
  { value: '8+',  label: 'Years Experience' },
  { value: '20+', label: 'Projects Delivered' },
  { value: '10+', label: 'Happy Clients' },
  { value: '3',   label: 'Countries' },
];

const techStack = [
  'Next.js', 'React', 'TypeScript', 'WordPress', 'Shopify',
  'Node.js', 'Tailwind CSS', 'Three.js', 'GSAP', 'Figma',
  'WooCommerce', 'SEO',
];

export default function AboutSection() {
  const sectionRef  = useRef(null);
  const ghostRef    = useRef(null);
  const headlineRef = useRef(null);
  const imageRef    = useRef(null);
  const statsRef    = useRef(null);
  const pillsRef    = useRef(null);

  useGSAP(() => {
    const section = sectionRef.current;

    ScrollTrigger.matchMedia({
      '(min-width: 768px)': function () {
        ScrollTrigger.create({
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: '+=150%',
        });
      },
    });

    const defaults = { scrollTrigger: { trigger: section, start: 'top 70%', once: true } };

    gsap.from(ghostRef.current, {
      scale: 1.4, opacity: 0, duration: 1.2, ease: 'power3.out',
      ...defaults,
    });

    const chars = splitChars(headlineRef.current);
    gsap.from(chars, {
      y: 50, opacity: 0, rotateX: 80, stagger: 0.025,
      duration: 0.7, ease: 'power3.out',
      transformOrigin: 'bottom center',
      ...defaults,
    });

    gsap.from(imageRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.2, ease: 'power3.out',
      delay: 0.2,
      ...defaults,
    });

    const statEls = statsRef.current.querySelectorAll('[data-stat-value]');
    statEls.forEach((el) => {
      const target = parseInt(el.dataset.statValue, 10);
      gsap.from({ val: 0 }, {
        val: target, duration: 1.5, ease: 'power2.out',
        snap: { val: 1 },
        onUpdate() { el.textContent = Math.round(this.targets()[0].val) + (el.dataset.statSuffix ?? ''); },
        scrollTrigger: { trigger: section, start: 'top 60%', once: true },
      });
    });

    gsap.from(pillsRef.current.children, {
      scale: 0.5, opacity: 0, stagger: 0.04, duration: 0.4, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: pillsRef.current, start: 'top 85%', once: true },
    });
  }, { scope: sectionRef, dependencies: [] });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <div className="mx-auto flex h-screen max-w-7xl flex-col justify-center px-6 lg:flex-row lg:items-center lg:gap-20">

        {/* ── Left column ── */}
        <div className="relative flex-1">
          <span
            ref={ghostRef}
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-4 font-mono text-[10rem] font-black leading-none text-foreground opacity-[0.04] select-none"
          >
            02
          </span>

          <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary">
            02 / About
          </p>
          <h2
            ref={headlineRef}
            className="mb-6 font-sans font-black leading-[0.9] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', perspective: '500px' }}
          >
            A bit about me.
          </h2>

          <p className="mb-4 max-w-lg text-base leading-relaxed text-muted-foreground" data-cursor="text">
            I'm a{' '}
            <span className="font-bold text-foreground">Senior Software Engineer</span>{' '}
            based in Morelia, Mexico, with over 8 years of experience building digital
            products that make an impact.
          </p>
          <p className="mb-10 max-w-lg text-base leading-relaxed text-muted-foreground" data-cursor="text">
            From leading the web team at{' '}
            <span className="font-bold text-foreground">Once Interactive</span>{' '}
            (100+ international clients) to earning my Master's in Computer Science, I
            bring both craft and strategy to every project.
          </p>

          <div ref={statsRef} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card p-4 text-center"
              >
                <p
                  className="text-2xl font-black text-primary"
                  data-stat-value={parseInt(s.value)}
                  data-stat-suffix={s.value.replace(/\d+/, '')}
                >
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div ref={pillsRef} className="mt-8 flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span
                key={t}
                data-cursor="link"
                data-cursor-label={t}
                className="cursor-default rounded-full border border-border bg-secondary px-3 py-1.5 font-sans text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column — profile image ── */}
        <div className="hidden lg:block lg:w-80 xl:w-96">
          <div ref={imageRef} className="overflow-hidden rounded-2xl shadow-2xl shadow-foreground/10">
            <Image
              src="/cartoon-tech-profile.webp"
              alt="Hector Mendoza"
              width={400}
              height={500}
              className="h-full w-full object-cover"
              sizes="(max-width: 1024px) 0vw, 400px"
            />
          </div>
        </div>

      </div>

      {/* Marquee strip */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-border bg-card/60 py-4">
        <div className="animate-marquee flex whitespace-nowrap">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              {['NEXT.JS','REACT','TYPESCRIPT','WORDPRESS','SHOPIFY','NODE.JS','TAILWIND','THREE.JS','GSAP','FIGMA'].map((item) => (
                <span key={item} className="flex items-center gap-8 font-mono text-xs tracking-widest text-muted-foreground">
                  <span>{item}</span>
                  <span className="text-primary">///</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
