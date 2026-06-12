'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const experiences = [
  {
    period: '2019 – 2023',
    role: 'Office Manager & Lead Developer',
    company: 'Once Interactive Inc.',
    location: 'Remote',
    description:
      'Promoted to lead the First-Line Web Team while managing all office operations. Oversaw development workflows, client communications, and project delivery for 100+ international companies.',
    tags: ['Leadership', 'WordPress', 'Shopify', 'Project Management'],
  },
  {
    period: '2017 – 2023',
    role: 'Senior Web Developer',
    company: 'Once Interactive Inc.',
    location: 'Remote',
    description:
      'Full-time front-end development for clients across e-commerce, corporate, and SaaS. Built custom themes, plugins, and integrations using WordPress, WooCommerce, and Shopify.',
    tags: ['WordPress', 'WooCommerce', 'Shopify', 'JavaScript', 'CSS'],
  },
  {
    period: '2017',
    role: 'Web Developer',
    company: 'COPARMEX',
    location: 'Morelia, Mexico',
    description:
      'Managed and maintained the web platform. First professional role — contributed to social and business event sites using WordPress.',
    tags: ['WordPress', 'PHP', 'Web Maintenance'],
  },
];

const education = [
  {
    period: '2018 – 2020',
    degree: "Master's Degree in Computer Science",
    school: 'Universidad Vasco de Quiroga, A.C.',
    detail: 'Specialty in Mobile App Development',
  },
  {
    period: '2013 – 2017',
    degree: "Engineer's Degree in Computer Science",
    school: 'Universidad Vasco de Quiroga, A.C.',
    detail: 'Full CS curriculum',
  },
];

export default function ExperienceSection() {
  const sectionRef  = useRef(null);
  const lineRef     = useRef(null);
  const card0Ref    = useRef(null);
  const card1Ref    = useRef(null);
  const card2Ref    = useRef(null);
  const eduRef      = useRef(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const line    = lineRef.current;

    const lineLength = line.getTotalLength?.() ?? 400;
    gsap.set(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength });

    gsap.matchMedia().add('(min-width: 768px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: '+=200%',
          scrub: 1,
        },
      });
      tl.to(line, { strokeDashoffset: 0, ease: 'none', duration: 3 }, 0)
        .from(card0Ref.current, { x: -80, opacity: 0, duration: 1 }, 0.8)
        .from(card1Ref.current, { x:  80, opacity: 0, duration: 1 }, 1.6)
        .from(card2Ref.current, { x: -80, opacity: 0, duration: 1 }, 2.4)
        .from(eduRef.current.children, { y: 40, opacity: 0, stagger: 0.4, duration: 0.8 }, 3.2);
    });
  }, { scope: sectionRef, dependencies: [] });

  const cardRefs = [card0Ref, card1Ref, card2Ref];

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-4xl px-6 py-24">
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary">
          03 / Experience
        </p>
        <h2
          className="mb-16 font-sans font-black leading-[0.9] tracking-tight text-foreground"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
        >
          Where I've{' '}
          <span className="italic text-primary">worked.</span>
        </h2>

        <div className="relative">
          <svg
            className="absolute left-4 top-2 h-full md:left-1/2 md:-translate-x-px"
            width="2"
            style={{ height: 'calc(100% - 2rem)', overflow: 'visible' }}
          >
            <line
              ref={lineRef}
              x1="1" y1="0" x2="1" y2="100%"
              stroke="#2A6B45"
              strokeWidth="1.5"
            />
          </svg>

          {experiences.map((exp, i) => (
            <div
              key={exp.role}
              ref={cardRefs[i]}
              className={`relative mb-12 pl-12 md:w-[47%] md:pl-0 ${
                i % 2 === 0
                  ? 'md:pr-12'
                  : 'md:ml-auto md:pl-12'
              }`}
            >
              <div
                className={`absolute top-4 left-3 h-2.5 w-2.5 rounded-full bg-primary shadow-md shadow-primary/40 md:left-auto ${
                  i % 2 === 0 ? 'md:-right-[5.25px]' : 'md:-left-[5.25px]'
                }`}
              />

              <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-foreground/5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[0.6rem] text-primary">
                    {exp.period}
                  </span>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">{exp.location}</span>
                </div>
                <h3 className="mb-1 font-sans text-lg font-bold text-foreground">{exp.role}</h3>
                <p className="mb-3 font-sans text-sm font-semibold text-primary">{exp.company}</p>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground" data-cursor="text">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.6rem] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={eduRef} className="mt-20 grid gap-5 md:grid-cols-2">
          {education.map((edu) => (
            <div
              key={edu.degree}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md hover:shadow-foreground/5"
            >
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-[0.6rem] text-primary">
                {edu.period}
              </span>
              <h4 className="mb-1 font-sans text-base font-bold text-foreground">{edu.degree}</h4>
              <p className="mb-1 font-sans text-sm font-semibold text-primary">{edu.school}</p>
              <p className="font-sans text-sm text-muted-foreground">{edu.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
