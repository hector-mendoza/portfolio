# Portfolio Redesign — "Ink & Paper" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Hector Mendoza's Next.js 16 portfolio with an "Ink & Paper" aesthetic — warm parchment background, forest green accent (#2A6B45), Rubik rounded typeface, GSAP ScrollTrigger-pinned chapters, a custom cursor with ink trail, magnetic buttons, and a Three.js ink-wash shader hero.

**Architecture:** All major sections use `ScrollTrigger.pin()` (except Contact/Footer). A global `CustomCursor` component uses GSAP `quickTo` for performant lerp-follow with no React state on mousemove. Lenis drives smooth scroll and syncs with ScrollTrigger via GSAP's ticker. Three.js renders a fluid ink-diffusion `ShaderMaterial` plane only during the hero viewport, then unmounts to free GPU memory.

**Tech Stack:** Next.js 16, React 19, `gsap` + `@gsap/react` + `ScrollTrigger`, `lenis`, `@react-three/fiber` (already installed), `next/font/google` (Rubik + Space Mono), Resend/hCaptcha contact flow (untouched).

**Design spec:** `docs/superpowers/specs/2026-06-12-portfolio-redesign-design.md`

---

## File Map

**New files:**
- `lib/gsap.js` — plugin registration (ScrollTrigger, useGSAP) + `splitChars()` utility
- `components/smooth-scroll.jsx` — Lenis wrapper synced to GSAP ticker
- `components/custom-cursor.jsx` — Global cursor: circle + trail + state changes via `data-cursor`
- `components/magnetic-button.jsx` — Reusable magnetic hover wrapper
- `components/ink-scene.jsx` — Three.js full-screen ink-wash ShaderMaterial (hero only, no SSR)

**Modified files:**
- `app/globals.css` — New parchment palette tokens, paper grain texture, `cursor: none` on body
- `tailwind.config.ts` — Update `fontFamily` CSS var names to match new fonts
- `app/layout.jsx` — Swap Space Grotesk/JetBrains → Rubik/Space Mono; add `<SmoothScroll>`, `<CustomCursor>`; remove `class="dark"` from `<html>`
- `app/page.jsx` — Add `ProjectsSection` import (currently missing); confirm section order
- `components/navbar.jsx` — Parchment theme restyle
- `components/hero-section.jsx` — Full rewrite: GSAP char reveal, InkScene, magnetic CTAs
- `components/about-section.jsx` — GSAP pinned, ghost number, counter stats, clip-path image reveal
- `components/experience-section.jsx` — GSAP pinned, `strokeDashoffset` timeline, staggered cards
- `components/projects-section.jsx` — Horizontal reel: scroll-wheel drives x-axis travel
- `components/contact-section.jsx` — Editorial headline + full-width layout restyle
- `components/contact-form.jsx` — **Visual restyle only**: underline inputs, hCaptcha `theme="light"`
- `components/footer.jsx` — Parchment strip

**Do not touch:**
- `app/api/contact/route.js` — Resend logic is correct, leave as-is
- `components/ui/*` — Radix primitives untouched
- `components/contact-form.jsx` form logic — only change input styles + hCaptcha theme prop

---

## Task 1: Install new packages

**Files:** `package.json` (updated by npm)

- [ ] **Step 1: Install GSAP, @gsap/react, and Lenis**

```bash
cd /Users/hectormendoza/Developer/Portfolio
npm install gsap @gsap/react lenis
```

Expected output: 3 packages added, no peer dependency warnings.

- [ ] **Step 2: Verify packages exist in node_modules**

```bash
ls node_modules | grep -E "^gsap$|^lenis$"
```

Expected: `gsap` and `lenis` listed.

- [ ] **Step 3: Confirm dev server still starts**

```bash
npm run dev -- --port 3001
```

Wait ~10 seconds, then `Ctrl+C`. Expected: `✓ Ready in` message, no import errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install gsap, @gsap/react, lenis"
```

---

## Task 2: GSAP utility + plugin registration

**Files:**
- Create: `lib/gsap.js`

- [ ] **Step 1: Create `lib/gsap.js`**

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

/**
 * Splits all text content of an element into individual inline-block <span>
 * elements for per-character GSAP animation. Returns the array of spans.
 * Replaces whitespace chars with non-breaking spaces to preserve word gaps.
 *
 * @param {HTMLElement} el - Element whose textContent will be split.
 * @returns {HTMLElement[]} Array of character span elements.
 */
export function splitChars(el) {
  const text = el.textContent ?? '';
  el.textContent = '';
  return Array.from(text).map((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? ' ' : char;
    span.style.display = 'inline-block';
    el.appendChild(span);
    return span;
  });
}
```

- [ ] **Step 2: Verify the file parses (no syntax errors)**

```bash
node --input-type=module < lib/gsap.js 2>&1 | head -5
```

Expected: no output (or a harmless note about missing `window` in Node). If you see `SyntaxError`, fix before proceeding.

- [ ] **Step 3: Commit**

```bash
git add lib/gsap.js
git commit -m "feat: add GSAP utility with ScrollTrigger registration and splitChars helper"
```

---

## Task 3: Smooth scroll with Lenis

**Files:**
- Create: `components/smooth-scroll.jsx`

- [ ] **Step 1: Create `components/smooth-scroll.jsx`**

```jsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Wraps the page in Lenis smooth scroll, synced to GSAP's ticker so that
 * ScrollTrigger pin/scrub animations stay in lockstep with Lenis momentum.
 */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Drive Lenis from GSAP's ticker so ScrollTrigger stays synced.
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Let ScrollTrigger know about scroll position updates.
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/smooth-scroll.jsx
git commit -m "feat: add Lenis smooth scroll synced to GSAP ticker"
```

---

## Task 4: Custom cursor component

**Files:**
- Create: `components/custom-cursor.jsx`

- [ ] **Step 1: Create `components/custom-cursor.jsx`**

```jsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const SIZE_DEFAULT = 40;
const SIZE_LINK    = 68;

/**
 * Global custom cursor. Hidden on touch devices.
 *
 * Cursor state is controlled via data attributes on hover targets:
 *   data-cursor="link"  data-cursor-label="View"  → expands + fills green + shows label
 *   data-cursor="text"                             → collapses to 3×20px bar
 *   data-cursor="none"                             → hides cursor
 *
 * Uses gsap.quickTo for position (no React state on mousemove).
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef    = useRef(null);
  const labelRef  = useRef(null);
  const t1Ref     = useRef(null);
  const t2Ref     = useRef(null);
  const t3Ref     = useRef(null);

  useEffect(() => {
    // Don't render on touch-only devices.
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = cursorRef.current;
    const dot    = dotRef.current;
    const label  = labelRef.current;

    // Position followers with increasing lag for trail effect.
    const pos = (el, dur) => ({
      x: gsap.quickTo(el, 'x', { duration: dur, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: dur, ease: 'power3.out' }),
    });
    const main = pos(cursor,    0.4);
    const p1   = pos(t1Ref.current, 0.55);
    const p2   = pos(t2Ref.current, 0.70);
    const p3   = pos(t3Ref.current, 0.85);

    function move(e) {
      const { clientX: x, clientY: y } = e;
      main.x(x); main.y(y);
      p1.x(x);   p1.y(y);
      p2.x(x);   p2.y(y);
      p3.x(x);   p3.y(y);
    }

    function over(e) {
      const el = e.target.closest('[data-cursor]');
      if (!el) return;
      const type = el.dataset.cursor;
      if (type === 'link') {
        gsap.to(cursor, { width: SIZE_LINK, height: SIZE_LINK, backgroundColor: '#2A6B45', duration: 0.3, ease: 'power2.out' });
        gsap.to(dot,    { opacity: 0, duration: 0.15 });
        label.textContent = el.dataset.cursorLabel ?? '';
        gsap.to(label,  { opacity: 1, duration: 0.2 });
      } else if (type === 'text') {
        gsap.to(cursor, { width: 3, height: 20, duration: 0.25 });
      } else if (type === 'none') {
        gsap.to(cursor, { opacity: 0, duration: 0.2 });
      }
    }

    function out(e) {
      const el = e.target.closest('[data-cursor]');
      if (!el) return;
      gsap.to(cursor, {
        width: SIZE_DEFAULT, height: SIZE_DEFAULT,
        backgroundColor: 'transparent', opacity: 1,
        duration: 0.35, ease: 'power2.out',
      });
      gsap.to(dot,   { opacity: 1, duration: 0.2 });
      gsap.to(label, { opacity: 0, duration: 0.15 });
    }

    window.addEventListener('mousemove',   move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout',  out);

    return () => {
      window.removeEventListener('mousemove',   move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout',  out);
    };
  }, []);

  const base = {
    position: 'fixed',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
  };

  const trail = (size, opacity) => ({
    ...base,
    width: size,
    height: size,
    background: `rgba(42,107,69,${opacity})`,
    zIndex: 9997,
  });

  return (
    <>
      <div ref={t3Ref} style={trail(6,  0.15)} />
      <div ref={t2Ref} style={trail(10, 0.22)} />
      <div ref={t1Ref} style={trail(16, 0.35)} />
      <div
        ref={cursorRef}
        style={{
          ...base,
          width: SIZE_DEFAULT,
          height: SIZE_DEFAULT,
          border: '1.5px solid #2A6B45',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mixBlendMode: 'multiply',
        }}
      >
        <div
          ref={dotRef}
          style={{ width: 4, height: 4, borderRadius: '50%', background: '#2A6B45' }}
        />
        <span
          ref={labelRef}
          style={{
            position: 'absolute',
            fontSize: 9,
            fontFamily: 'var(--font-space-mono), monospace',
            color: '#F0EAD6',
            opacity: 0,
            whiteSpace: 'nowrap',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/custom-cursor.jsx
git commit -m "feat: add custom cursor with GSAP quickTo follow and link/text/none states"
```

---

## Task 5: Magnetic button component

**Files:**
- Create: `components/magnetic-button.jsx`

- [ ] **Step 1: Create `components/magnetic-button.jsx`**

```jsx
'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Wraps any child element with a magnetic hover effect.
 * On mousemove within the element, the child shifts toward the cursor (±20px max).
 * On mouseleave, snaps back with an elastic ease.
 *
 * Usage:
 *   <MagneticButton>
 *     <a href="#work">View Work</a>
 *   </MagneticButton>
 */
export default function MagneticButton({ children, className = '', style = {}, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;

    const MAX = 20;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)) * MAX;
      const dy = ((e.clientY - (r.top  + r.height / 2)) / (r.height / 2)) * MAX;
      gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
    }

    function onLeave() {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    }

    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ display: 'inline-block', ...style }} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/magnetic-button.jsx
git commit -m "feat: add MagneticButton with elastic return on mouseleave"
```

---

## Task 6: Three.js ink-wash shader (hero scene)

**Files:**
- Create: `components/ink-scene.jsx`

- [ ] **Step 1: Create `components/ink-scene.jsx`**

```jsx
'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uResolution;
  varying vec2  vUv;

  // Pseudo-random hash
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // Bilinear noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  // Fractal brownian motion
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += noise(p) * a;
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Mouse warps the noise field toward cursor position
    vec2  mouse     = uMouse * 0.5 + 0.5;
    float mouseDist = distance(uv, mouse);
    float pull      = smoothstep(0.45, 0.0, mouseDist) * 0.25;

    float t  = uTime * 0.06;
    float n1 = fbm(uv * 2.8 + vec2(t, t * 0.6) + pull);
    float n2 = fbm(uv * 2.0 - vec2(t * 0.4, 0.0) + n1 * 0.55);
    float ink = smoothstep(0.35, 0.72, n2);

    vec3 parchment = vec3(0.941, 0.918, 0.839); // #F0EAD6
    vec3 inkCol    = vec3(0.165, 0.420, 0.271); // #2A6B45

    vec3 col = mix(parchment, inkCol, ink * 0.20);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function InkPlane() {
  const meshRef    = useRef(null);
  const mouseRef   = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  // Track mouse in normalized device coords (-1 to +1)
  useEffect(() => {
    function onMove(e) {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const uniforms = useRef({
    uTime:       { value: 0 },
    uMouse:      { value: mouseRef.current },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  });

  useFrame(({ clock }) => {
    uniforms.current.uTime.value  = clock.getElapsedTime();
    uniforms.current.uMouse.value = mouseRef.current;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

/**
 * Full-screen Three.js ink-wash canvas for the hero section.
 * Loaded only client-side (no SSR) via Next.js dynamic().
 * Parent controls visibility — unmount this component to free GPU memory.
 */
export default function InkScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: '#F0EAD6' }}
    >
      <InkPlane />
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify no import errors by starting dev server**

```bash
npm run dev -- --port 3001 &
sleep 8
curl -s http://localhost:3001 | grep -c "html" && kill %1
```

Expected: `1` (page responds). Kill background process.

- [ ] **Step 3: Commit**

```bash
git add components/ink-scene.jsx
git commit -m "feat: add Three.js ink-wash shader scene for hero (cursor-reactive, parchment palette)"
```

---

## Task 7: Update global CSS — parchment palette + paper grain

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace all of `app/globals.css` with the following**

```css
@import 'tailwindcss';
@config '../tailwind.config.ts';

/* ─── Parchment palette (shadcn-compatible HSL tokens) ─── */
@layer base {
  :root {
    --background:        38 44% 88%;   /* #F0EAD6 — warm parchment        */
    --foreground:         0  0%  6%;   /* #0F0F0F — near-black ink         */
    --card:              38 32% 82%;   /* #E8E1CE — inset parchment        */
    --card-foreground:    0  0%  6%;
    --popover:           38 44% 88%;
    --popover-foreground: 0  0%  6%;
    --primary:          145 44% 29%;   /* #2A6B45 — forest green           */
    --primary-foreground: 38 44% 88%;  /* parchment text on green buttons  */
    --secondary:         38 25% 84%;
    --secondary-foreground: 0  0% 15%;
    --muted:             38 20% 85%;
    --muted-foreground:  38  5% 40%;   /* #6B6860 — warm gray              */
    --accent:           145 44% 29%;   /* matches primary                  */
    --accent-foreground: 38 44% 88%;
    --destructive:        0 84%  60%;
    --destructive-foreground: 0 0% 98%;
    --border:            38 20% 76%;
    --input:             38 20% 76%;
    --ring:             145 44% 29%;
    --radius:           0.75rem;

    /* Direct hex tokens for JS / inline styles */
    --parchment: #F0EAD6;
    --ink:       #0F0F0F;
    --green:     #2A6B45;
  }
}

@layer base {
  * { @apply border-border; }

  /* Hide native cursor globally — CustomCursor takes over on pointer devices */
  html { cursor: none; }
  @media (hover: none) { html { cursor: auto; } }

  body { @apply bg-background text-foreground; }
}

/* ─── Paper grain texture ─── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9990;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}

/* ─── Smooth scroll behaviour ─── */
html {
  scroll-behavior: auto; /* Lenis owns scrolling — disable native smooth */
  scrollbar-width: thin;
  scrollbar-color: rgba(42, 107, 69, 0.3) transparent;
}

body { overflow-x: hidden; }

/* ─── Selection ─── */
::selection {
  background: rgba(42, 107, 69, 0.2);
  color: #0F0F0F;
}

/* ─── Marquee (reused from AboutSection) ─── */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
```

- [ ] **Step 2: Update `tailwind.config.ts` — swap font family CSS var names**

Open `tailwind.config.ts` and replace the `fontFamily` block:

```ts
// Replace this:
fontFamily: {
  sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-jetbrains)', 'monospace'],
},

// With this:
fontFamily: {
  sans: ['var(--font-rubik)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-space-mono)', 'monospace'],
},
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: apply parchment palette tokens, paper grain texture, font family tokens"
```

---

## Task 8: Update app/layout.jsx

**Files:**
- Modify: `app/layout.jsx`

- [ ] **Step 1: Replace `app/layout.jsx` entirely**

```jsx
import { Rubik, Space_Mono } from 'next/font/google';
import SmoothScroll from '@/components/smooth-scroll';
import CustomCursor from '@/components/custom-cursor';
import ErrorBoundary from '@/components/error-boundary';
import { ToasterProvider } from '@/components/toaster-provider';
import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-rubik',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://hectormendoza.me'),
  title: 'Hector Mendoza | Senior Software Engineer',
  description:
    'Senior Software Engineer with 8+ years of experience specializing in Next.js, React, WordPress, and Shopify. Based in Morelia, Mexico.',
  keywords: [
    'Hector Mendoza', 'Software Engineer', 'Web Developer',
    'Next.js', 'React', 'WordPress', 'Shopify',
  ],
  openGraph: {
    title: 'Hector Mendoza | Senior Software Engineer',
    description:
      'Senior Software Engineer with 8+ years of experience specializing in Next.js, React, WordPress, and Shopify. Based in Morelia, Mexico.',
    url: 'https://hectormendoza.me',
    siteName: 'Hector Mendoza',
    type: 'website',
    images: [{ url: '/cartoon-tech-profile.webp', width: 1200, height: 630 }],
  },
};

export const viewport = {
  themeColor: '#F0EAD6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rubik.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <SmoothScroll>
            <CustomCursor />
            <ToasterProvider />
            {children}
          </SmoothScroll>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Start dev server and check the page renders**

```bash
npm run dev
```

Open `http://localhost:3000` in Chrome. Expected:
- Page background is warm parchment (not dark)
- Custom green cursor visible when moving mouse
- No console errors about missing imports

- [ ] **Step 3: Commit**

```bash
git add app/layout.jsx
git commit -m "feat: swap fonts to Rubik/Space Mono, wire SmoothScroll and CustomCursor in layout"
```

---

## Task 9: Rewrite Navbar

**Files:**
- Modify: `components/navbar.jsx`

- [ ] **Step 1: Replace `components/navbar.jsx` entirely**

```jsx
'use client';

import { useState, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import MagneticButton from './magnetic-button';
import Image from 'next/image';

const links = [
  { label: 'Work',       href: '#projects'   },
  { label: 'About',      href: '#about'       },
  { label: 'Experience', href: '#experience'  },
  { label: 'Contact',    href: '#contact'     },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(() => {
    gsap.from('nav', { y: -80, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
  }, []);

  return (
    <>
      <nav
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

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <MagneticButton className="hidden md:block">
              <a
                href="#contact"
                data-cursor="link"
                data-cursor-label="Talk"
                className="rounded-full border-2 border-primary px-5 py-2 font-sans text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
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
```

- [ ] **Step 2: Check in browser**

Open `http://localhost:3000`. Expected:
- Navbar shows on parchment background
- Links have underline slide-in on hover
- "Let's Talk" button has green border, magnetic on hover
- Mobile hamburger works on narrow viewport

- [ ] **Step 3: Commit**

```bash
git add components/navbar.jsx
git commit -m "feat: restyle navbar to parchment theme with slide underline links"
```

---

## Task 10: Rewrite Hero section

**Files:**
- Modify: `components/hero-section.jsx`

- [ ] **Step 1: Replace `components/hero-section.jsx` entirely**

```jsx
'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, splitChars } from '@/lib/gsap';
import MagneticButton from './magnetic-button';

// Load Three.js scene only client-side
const InkScene = dynamic(() => import('./ink-scene'), {
  ssr: false,
  loading: () => <div style={{ background: '#F0EAD6', width: '100%', height: '100%' }} />,
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

    // 1 — Pin section for one full viewport-height of scroll
    ScrollTrigger.create({
      trigger: section,
      pin:        true,
      pinSpacing: true,
      start:      'top top',
      end:        '+=100%',
    });

    // 2 — Fade ink canvas out when hero leaves view
    ScrollTrigger.create({
      trigger:     section,
      start:       'top top',
      end:         'bottom top',
      onLeave:     () => setInkVisible(false),
      onEnterBack: () => setInkVisible(true),
    });

    // 3 — Char-by-char text reveal on load
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
      {/* Ink canvas — fixed, full screen, behind everything */}
      {inkVisible && (
        <div className="fixed inset-0 z-0">
          <InkScene />
        </div>
      )}

      {/* Subtle parchment vignette to improve text contrast */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-radial from-transparent to-background/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Section label */}
        <p className="mb-10 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-primary">
          01 / Introduction
        </p>

        {/* Headline — split into two lines for independent char animation */}
        <h1
          className="mb-6 font-sans font-black leading-[0.88] tracking-tight text-foreground"
          style={{ fontSize: 'clamp(3.2rem, 10vw, 8rem)', perspective: '600px' }}
        >
          <span ref={line1Ref} className="block" aria-hidden="true">Making the web</span>
          <span ref={line2Ref} className="block italic text-primary" aria-hidden="true">move.</span>
          {/* Screen-reader-friendly full text */}
          <span className="sr-only">Making the web move.</span>
        </h1>

        {/* Sub-headline */}
        <p
          ref={subRef}
          className="mx-auto mb-12 max-w-md font-mono text-xs uppercase tracking-widest text-muted-foreground"
          data-cursor="text"
        >
          Senior Software Engineer &nbsp;·&nbsp; 8+ years &nbsp;·&nbsp; Morelia, Mexico
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton>
            <a
              href="#projects"
              data-cursor="link"
              data-cursor-label="View"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-sans text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
            >
              View Work
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
            </a>
          </MagneticButton>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
            Scroll →
          </span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000`. Expected:
- Ink wash animation fills the hero background, reacts to mouse
- Headline chars fly up one-by-one on load
- CTAs magnetic-pull toward cursor
- After scrolling past hero, ink canvas disappears (check that background becomes plain parchment)

- [ ] **Step 3: Commit**

```bash
git add components/hero-section.jsx
git commit -m "feat: rewrite hero with GSAP char reveal, Three.js ink shader, and magnetic CTAs"
```

---

## Task 11: Rewrite About section

**Files:**
- Modify: `components/about-section.jsx`

- [ ] **Step 1: Replace `components/about-section.jsx` entirely**

```jsx
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

    // Pin section for 150% scroll distance so content has time to reveal
    ScrollTrigger.create({
      trigger:    section,
      pin:        true,
      pinSpacing: true,
      start:      'top top',
      end:        '+=150%',
    });

    const defaults = { scrollTrigger: { trigger: section, start: 'top 70%', once: true } };

    // Ghost number scales down as it enters
    gsap.from(ghostRef.current, {
      scale: 1.4, opacity: 0, duration: 1.2, ease: 'power3.out',
      ...defaults,
    });

    // Headline char reveal
    const chars = splitChars(headlineRef.current);
    gsap.from(chars, {
      y: 50, opacity: 0, rotateX: 80, stagger: 0.025,
      duration: 0.7, ease: 'power3.out',
      transformOrigin: 'bottom center',
      ...defaults,
    });

    // Image clip-path reveal (slides up from bottom)
    gsap.from(imageRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.2, ease: 'power3.out',
      delay: 0.2,
      ...defaults,
    });

    // Stats count-up
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

    // Tech pills pop in
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
          {/* Ghost section number */}
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

          {/* Stats */}
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

          {/* Tech pills */}
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
```

- [ ] **Step 2: Verify in browser** — Scroll to about section. Expected: ghost "02" scales down, headline chars stagger in, image clips up from bottom, stats count up.

- [ ] **Step 3: Commit**

```bash
git add components/about-section.jsx
git commit -m "feat: rewrite about section with GSAP pin, char reveal, clip-path image, count-up stats"
```

---

## Task 12: Rewrite Experience section

**Files:**
- Modify: `components/experience-section.jsx`

- [ ] **Step 1: Replace `components/experience-section.jsx` entirely**

```jsx
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

    // Measure SVG line length for dashoffset animation
    const lineLength = line.getTotalLength?.() ?? 400;
    gsap.set(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength });

    // Build a scrub timeline pinned to this section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:    section,
        pin:        true,
        pinSpacing: true,
        start:      'top top',
        end:        '+=200%',
        scrub:      1,
      },
    });

    // Draw line from top to bottom
    tl.to(line, { strokeDashoffset: 0, ease: 'none', duration: 3 }, 0)
      // Cards stagger in as line passes their position
      .from(card0Ref.current, { x: -80, opacity: 0, duration: 1 }, 0.8)
      .from(card1Ref.current, { x:  80, opacity: 0, duration: 1 }, 1.6)
      .from(card2Ref.current, { x: -80, opacity: 0, duration: 1 }, 2.4)
      .from(eduRef.current.children, { y: 40, opacity: 0, stagger: 0.4, duration: 0.8 }, 3.2);
  }, { scope: sectionRef, dependencies: [] });

  const cardRefs = [card0Ref, card1Ref, card2Ref];

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-4xl px-6 py-24">
        {/* Header */}
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

        {/* Timeline */}
        <div className="relative">
          {/* Animated SVG line */}
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

          {/* Experience cards */}
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
              {/* Timeline dot */}
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

        {/* Education */}
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
```

- [ ] **Step 2: Verify in browser** — Scroll slowly through Experience. Expected: SVG line draws downward, each card slides in from alternating sides as line passes, education fades in at end.

- [ ] **Step 3: Commit**

```bash
git add components/experience-section.jsx
git commit -m "feat: rewrite experience section with GSAP pin and strokeDashoffset timeline"
```

---

## Task 13: Rewrite Projects section — horizontal reel

**Files:**
- Modify: `components/projects-section.jsx`

- [ ] **Step 1: Replace `components/projects-section.jsx` entirely**

```jsx
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

  // useLayoutEffect so measurements happen before paint
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const inner   = innerRef.current;
    if (!section || !inner) return;

    const ctx = gsap.context(() => {
      // Horizontal travel distance
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
      className="overflow-hidden bg-background"
      style={{ height: '100vh' }}
    >
      {/* Section label — fixed to top-left while pinned */}
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

      {/* Horizontal reel */}
      <div
        ref={innerRef}
        className="flex h-full items-center gap-8 px-8 pt-32"
        style={{ width: 'max-content' }}
      >
        {projects.map((project, i) => (
          <div
            key={project.title}
            className="group relative h-[65vh] w-[80vw] max-w-2xl flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5 sm:w-[60vw]"
            data-cursor="link"
            data-cursor-label="View"
          >
            {/* Image */}
            <div className="relative h-1/2 overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 80vw, 60vw"
              />
              {/* Overlay badges */}
              <span className="absolute top-4 left-4 rounded-full bg-background/80 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-foreground backdrop-blur-sm">
                {project.category}
              </span>
              <span className="absolute top-4 right-4 font-mono text-[0.55rem] text-foreground/50">
                {project.year}
              </span>
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/10">
                <span className="translate-y-2 rounded-full border border-primary bg-background/80 px-5 py-2 font-mono text-[0.6rem] text-primary opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  View Project ↗
                </span>
              </div>
            </div>

            {/* Content */}
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

            {/* Panel number */}
            <span className="absolute bottom-5 right-6 font-mono text-[0.55rem] text-muted-foreground/40">
              {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
          </div>
        ))}

        {/* Right buffer so last card isn't flush with screen edge */}
        <div className="w-8 flex-shrink-0" />
      </div>

      {/* Gradient fade on right edge hinting at next panel */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}
```

- [ ] **Step 2: Verify in browser** — Scroll into Projects. Expected: section pins, horizontal panels slide left as you scroll down. Last panel visible after enough scroll.

- [ ] **Step 3: Commit**

```bash
git add components/projects-section.jsx
git commit -m "feat: rewrite projects section as GSAP-pinned horizontal reel"
```

---

## Task 14: Rewrite Contact section

**Files:**
- Modify: `components/contact-section.jsx`

- [ ] **Step 1: Replace `components/contact-section.jsx` entirely**

```jsx
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
      {/* Subtle green glow at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Editorial headline */}
        <div className="mb-20">
          <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary">
            05 / Contact
          </p>
          <h2
            ref={headlineRef}
            className="font-sans font-black leading-[0.88] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', perspective: '500px' }}
          >
            {"Let's build something together."}
          </h2>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          {/* Contact info */}
          <div>
            <ContactInfo />
          </div>
          {/* Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/contact-section.jsx
git commit -m "feat: rewrite contact section with editorial headline and GSAP char reveal"
```

---

## Task 15: Restyle Contact form (visual only)

**Files:**
- Modify: `components/contact-form.jsx`

The form logic, validation, Resend submission, and hCaptcha verification are **100% unchanged**. Only the visual wrapper and input styles change.

- [ ] **Step 1: In `components/contact-form.jsx`, change only the following**

**A. Change hCaptcha theme prop** (line ~81 in original):
```jsx
// Before:
<HCaptcha ... theme="dark" />

// After:
<HCaptcha ... theme="light" />
```

**B. Replace the `<form>` wrapper class** — find:
```jsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-border bg-card p-8">
```
Replace with:
```jsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
```

**C. Replace all `<input>` className values** from the pill/box style to underline style. For the `name` input:
```jsx
// Before:
className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/25"

// After (apply same change to ALL <input> elements and the <textarea>):
className="w-full border-0 border-b border-border bg-transparent px-0 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary"
```

**D. Replace submit button** — find:
```jsx
<button
  type="submit"
  disabled={isSubmitting || !captchaToken}
  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
>
```
Replace with:
```jsx
<button
  type="submit"
  disabled={isSubmitting || !captchaToken}
  className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-sans text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
  data-cursor="link"
  data-cursor-label="Send"
>
```

- [ ] **Step 2: Verify form still works**

Open `http://localhost:3000#contact`. Fill in the form fields. Expected:
- Inputs show underline style (no boxes)
- hCaptcha widget shows in light theme
- Submit button is rounded pill, green
- Form submits and shows success/error toast (if env vars are set)

- [ ] **Step 3: Commit**

```bash
git add components/contact-form.jsx
git commit -m "feat: restyle contact form with underline inputs and light hCaptcha theme"
```

---

## Task 16: Restyle Footer

**Files:**
- Modify: `components/footer.jsx`

- [ ] **Step 1: Replace `components/footer.jsx` entirely**

```jsx
import Image from 'next/image';

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/hector-mendoza',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/hector-mendoza',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <Image src="/logos/logo.svg" alt="HM" width={32} height={32} className="rounded-full" />
          <span className="font-sans text-sm font-semibold text-foreground">Hector Mendoza</span>
        </div>

        {/* Credit */}
        <p className="font-mono text-[0.6rem] text-muted-foreground">
          Designed &amp; built with Next.js, GSAP &amp; Three.js
        </p>

        {/* Social links */}
        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              data-cursor="link"
              data-cursor-label={s.label}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/footer.jsx
git commit -m "feat: restyle footer to parchment theme with social links"
```

---

## Task 17: Wire app/page.jsx

**Files:**
- Modify: `app/page.jsx`

- [ ] **Step 1: Replace `app/page.jsx` entirely**

```jsx
import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero-section';
import AboutSection from '@/components/about-section';
import ExperienceSection from '@/components/experience-section';
import ProjectsSection from '@/components/projects-section';
import ContactSection from '@/components/contact-section';
import Footer from '@/components/footer';

export default function Page() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
```

Note: `ScrollTextReveal` is removed (superseded by the per-section GSAP reveals).

- [ ] **Step 2: Check full page in browser**

Open `http://localhost:3000`. Scroll through all 6 sections. Expected:
- Navbar: parchment/transparent
- Hero: ink shader + char reveal + magnetic CTAs
- About: ghost number + clip-path image
- Experience: timeline draws as you scroll
- Projects: horizontal reel
- Contact: editorial headline + form
- Footer: minimal strip

- [ ] **Step 3: Run build to catch TypeScript/import errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with no errors. Fix any import/prop errors before committing.

- [ ] **Step 4: Commit**

```bash
git add app/page.jsx
git commit -m "feat: wire all sections in page.jsx, add ProjectsSection (was missing)"
```

---

## Task 18: Mobile responsiveness

**Files:**
- Modify: `components/hero-section.jsx`, `components/about-section.jsx`, `components/experience-section.jsx`, `components/projects-section.jsx`

- [ ] **Step 1: Add `ScrollTrigger.matchMedia` mobile guard to hero, about, and experience**

In **each** of `hero-section.jsx`, `about-section.jsx`, and `experience-section.jsx`, wrap the `ScrollTrigger.create({ pin: true, ... })` calls inside a media query check:

```js
// Wrap the pin ScrollTrigger in a matchMedia so it only pins on desktop
ScrollTrigger.matchMedia({
  '(min-width: 768px)': function () {
    ScrollTrigger.create({
      trigger: section,
      pin: true,
      pinSpacing: true,
      start: 'top top',
      end: '+=100%', // use the same end value as before
    });
  },
});
```

Do this for: the hero pin, the about pin, and the experience timeline pin. Keep all other animations (char reveal, clip-path, etc.) outside the matchMedia guard so they still fire on mobile.

- [ ] **Step 2: Add mobile fallback for horizontal projects reel**

In `components/projects-section.jsx`, wrap the `useLayoutEffect` horizontal scroll logic in a desktop guard:

```js
useLayoutEffect(() => {
  const section = sectionRef.current;
  const inner   = innerRef.current;
  if (!section || !inner) return;

  // On mobile: skip the pin and let projects stack vertically (CSS handles it)
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
```

Also add mobile CSS so project panels stack vertically instead of being in a horizontal row. Add this to the reel container div:

```jsx
<div
  ref={innerRef}
  className="flex h-full items-center gap-8 px-8 pt-32 md:flex-row flex-col md:w-max w-full"
  // On mobile: remove height constraint from parent section
>
```

And update the section's `style` to be conditional:
```jsx
<section
  ref={sectionRef}
  id="projects"
  className="overflow-hidden bg-background md:h-screen"
>
```

- [ ] **Step 3: Verify on mobile viewport**

In Chrome DevTools, toggle device toolbar to 390×844 (iPhone 14). Scroll through the full page. Expected:
- No section pinning on mobile — normal scroll flow
- Project cards stack vertically on mobile
- Headline font sizes scale down correctly (using `clamp()` — they should already)
- Custom cursor absent on touch (the `(hover: none)` media query handles this)

- [ ] **Step 4: Final build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`. No errors.

- [ ] **Step 5: Final commit**

```bash
git add components/hero-section.jsx components/about-section.jsx components/experience-section.jsx components/projects-section.jsx
git commit -m "feat: add mobile responsive guards — disable pins and horizontal reel below 768px"
```

---

## Self-Review Checklist

After all tasks are complete, verify against the spec:

| Spec requirement | Covered in |
|---|---|
| Parchment palette + forest green accent | Task 7 |
| Rubik + Space Mono fonts | Task 7, Task 8 |
| Paper grain texture | Task 7 |
| Custom cursor: states, trail, quickTo | Task 4 |
| Magnetic buttons | Task 5 |
| Lenis smooth scroll + GSAP sync | Task 3 |
| Three.js ink-wash shader (cursor-reactive) | Task 6 |
| Hero: char reveal, ink scene, magnetic CTAs, pin | Task 10 |
| About: ghost number, clip-path image, count-up stats, pin | Task 11 |
| Experience: strokeDashoffset line, stagger cards, pin | Task 12 |
| Projects: horizontal reel, scroll-driven | Task 13 |
| Contact: editorial headline, char reveal | Task 14 |
| Contact form: Resend/hCaptcha logic untouched | Task 15 |
| hCaptcha theme="light" | Task 15 |
| Footer: parchment strip | Task 16 |
| ProjectsSection wired in page.jsx | Task 17 |
| Mobile: no pins, vertical projects, no cursor | Task 18 |
| `app/api/contact/route.js` never touched | ✓ (all tasks skip it) |
