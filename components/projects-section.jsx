'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const projects = [
  {
    title: 'E-Commerce Platform',
    subtitle: 'Shopify & Custom Integration',
    description:
      'Full-featured e-commerce solution built on Shopify with custom theme development, advanced filtering, and seamless checkout flow. Increased client revenue by 40%.',
    tags: ['Shopify', 'Liquid', 'JavaScript', 'CSS'],
    image: '/placeholder.svg',
    year: '2023',
    category: 'E-Commerce',
  },
  {
    title: 'Corporate Website Redesign',
    subtitle: 'Next.js & Headless CMS',
    description:
      'Complete redesign of a Fortune 500 company web presence. Headless CMS architecture with Next.js for blazing-fast performance and a 95+ Lighthouse score.',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Sanity'],
    image: '/placeholder.svg',
    year: '2022',
    category: 'Corporate',
  },
  {
    title: 'Analytics Dashboard',
    subtitle: 'React & Real-time Data',
    description:
      'Interactive analytics dashboard with real-time data visualization, custom charting, and comprehensive reporting for a B2B SaaS product.',
    tags: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    image: '/placeholder.svg',
    year: '2022',
    category: 'Web App',
  },
  {
    title: 'Fitness Mobile App',
    subtitle: 'React Native & Cloud',
    description:
      'Cross-platform fitness tracking app with workout planning, progress visualization, and social features. 10k+ downloads on launch.',
    tags: ['React Native', 'Firebase', 'TypeScript', 'Expo'],
    image: '/placeholder.svg',
    year: '2021',
    category: 'Mobile',
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef(null);
  const innerRef   = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const inner   = innerRef.current;
    if (!section || !inner) return;

    // Skip horizontal reel on mobile; let CSS stack cards vertically
    if (window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      const totalWidth = inner.scrollWidth - window.innerWidth;

      gsap.to(inner, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger:    section,
          pin:        true,
          pinSpacing: true,
          start:      'top top',
          end:        () => `+=${totalWidth}`,
          scrub:      1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="overflow-hidden bg-background md:h-screen"
    >
      <div className="absolute top-8 left-6 z-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary">
          04 / Projects
        </p>
        <h2
          className="font-sans font-black leading-[0.9] tracking-tight text-foreground"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          Featured{' '}
          <span className="italic text-primary">work.</span>
        </h2>
      </div>

      <div
        ref={innerRef}
        className="flex h-full items-start gap-8 px-8 pt-24 md:flex-nowrap md:items-center md:pt-32 flex-wrap"
        style={{ width: 'max-content' }}
      >
        {projects.map((project, i) => (
          <div
            key={project.title}
            className="group relative h-[65vh] w-[80vw] max-w-2xl flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5 sm:w-[60vw]"
            data-cursor="link"
            data-cursor-label="View"
          >
            <div className="relative h-1/2 overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 80vw, 60vw"
              />
              <span className="absolute top-4 left-4 rounded-full bg-background/80 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-foreground backdrop-blur-sm">
                {project.category}
              </span>
              <span className="absolute top-4 right-4 font-mono text-[0.55rem] text-foreground/50">
                {project.year}
              </span>
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/10">
                <span className="translate-y-2 rounded-full border border-primary bg-background/80 px-5 py-2 font-mono text-[0.6rem] text-primary opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  View Project ↗
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-1 font-sans text-xl font-black text-foreground">{project.title}</h3>
              <p className="mb-2 font-sans text-sm font-semibold text-primary">{project.subtitle}</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground" data-cursor="text">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.55rem] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <span className="absolute bottom-5 right-6 font-mono text-[0.55rem] text-muted-foreground/40">
              {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
          </div>
        ))}

        <div className="w-8 flex-shrink-0" />
      </div>

      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}
