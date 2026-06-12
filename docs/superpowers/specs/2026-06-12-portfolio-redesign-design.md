# Portfolio Redesign — "Ink & Paper" Design Spec
**Date:** 2026-06-12
**Status:** Approved

---

## Overview

A full redesign of Hector Mendoza's personal portfolio (Next.js 16). The goal is an awwwards-worthy experience — not a website, but a tactile, living artifact. The aesthetic is editorial "Ink & Paper": warm parchment canvas, near-black ink typography, forest green accent, rounded Rubik typeface, and paper grain texture. The experience is driven by a large morphing cursor and GSAP-pinned chapters that unfold like turning pages in a printed book.

---

## Design Decisions

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F0EAD6` | Page background (warm parchment) |
| `--ink` | `#0F0F0F` | Primary text, borders |
| `--accent` | `#2A6B45` | Forest green — links, highlights, cursor, active states |
| `--muted` | `#6B6860` | Secondary text, labels |
| `--card` | `#E8E1CE` | Slightly darker parchment for inset areas |
| `--border` | `rgba(15,15,15,0.08)` | Dividers, card borders |
| Paper grain | SVG `feTurbulence` noise | ~3% opacity overlay on `<body>` |

### Typography

| Role | Font | Weight/Style |
|---|---|---|
| Display headlines | Rubik | 900, italic for accent words |
| UI labels / numbers | Space Mono | 400, tracked out, small |
| Body copy | Rubik | 300–400 |
| Section numbers | Space Mono | 700, very large ghost opacity |

Google Fonts CDN: `Rubik` (300,400,700,900,italic) + `Space Mono` (400,700).

### Paper Texture

An SVG filter with `feTurbulence` (`baseFrequency="0.65"`, `numOctaves="3"`) applied as a pseudo-element on `body` at `pointer-events: none; opacity: 0.03`. Gives the parchment a subtle organic grain without affecting readability.

---

## Architecture

### Stack (unchanged)
- Next.js 16, React 19, TypeScript/JSX mix
- Tailwind CSS v4
- GSAP (add `gsap` + `@gsap/react` packages, use ScrollTrigger plugin — free tier only)
- Three.js via `@react-three/fiber` + `@react-three/drei` (already installed)
- Lenis smooth scroll (`lenis` package — add)
- Framer Motion (already installed — keep for simple mount/unmount transitions only; GSAP owns scroll animations)
- Resend + hCaptcha contact flow (untouched)

### New packages to install
```
gsap @gsap/react lenis
```

---

## Page Structure — 6 Chapters

All chapters use `ScrollTrigger.pin()` except Contact and Footer.

### Chapter 01 — Hero
**Layout:** Full-screen pinned section.

**Content:**
- Top-left: `HM` logo mark + nav links (Work / About / Experience / Contact)
- Center: Large Rubik 900 headline — `"Making the web"` (ink) + `"move."` (green italic). Char-by-char reveal using a custom `splitChars()` utility that wraps each character in a `<span>`, then GSAP staggers them in. No Club GSAP plugin required.
- Below headline: one-line descriptor + two magnetic CTA buttons ("View Work" outlined, "Let's Talk" filled green)
- Bottom: scroll hint — `"Scroll →"` in Space Mono

**Three.js / WebGL:**
- Fluid ink-wash shader behind the text. Dark forest green ink diffusing in warm water. Uses a custom `ShaderMaterial` with a simplex noise uniform animated via `useFrame`. Cursor position passed as a uniform — moves the ink toward the mouse.
- Canvas is `position: fixed`, `z-index: 0`, fades out via opacity as user scrolls past the hero pin.
- Unmounts (via `dynamic` + conditional render) after the hero section leaves the viewport to free GPU memory.

**Animations:**
- On load: 300ms delay → chars fly up from `y:60, opacity:0, rotateX:90` with stagger 0.03s
- CTA buttons: fade-slide-up after headline completes
- Scroll hint: fade in after CTAs

### Chapter 02 — About
**Layout:** Pinned full-screen. Two-column (40/60 split on desktop, stacked on mobile).

**Content:**
- Left column: Ghost `"02"` in Space Mono 700 at ~5% opacity, then headline "A bit about me" in Rubik 900, then short 2-paragraph bio
- Right column: Stats grid (8+ years, 20+ projects, 10+ clients, 3 countries) + tech stack pills + floating "Master's Degree" badge
- Image: `profile-transp.png` or `cartoon-tech-profile.webp` — clipped with a loose organic SVG mask that animates to reveal on scroll-into-pin

**Animations:**
- Ghost number scales from 150% → 100% as section pins
- Headline chars stagger in from left
- Stats count up (GSAP `snap` on a number tween)
- Tech pills pop in with stagger scale from 0.5

### Chapter 03 — Experience
**Layout:** Pinned full-screen. Centered single-column timeline.

**Content:**
- Section label `"03 / Experience"` top-left
- Vertical SVG `<line>` animated via `strokeDashoffset`/`strokeDasharray` (free GSAP core, no DrawSVG plugin). Draws top to bottom as scroll progresses within the pin.
- 3 experience cards stagger in from left/right alternating as the line passes their dot
- Education subsection below

**Animations:**
- GSAP `fromTo` on `strokeDashoffset` drives the line draw scrubbed to scroll progress
- Each card: `x: ±80 → 0`, `opacity: 0 → 1` triggered when the line reaches its dot

### Chapter 04 — Projects
**Layout:** Pinned container. Horizontal scroll driven by vertical scroll wheel.

**Content:**
- 4 project panels in a horizontal flex row, each ~80vw wide
- Each panel: large project image (top half), title + tags + description (bottom half)
- Left edge: panel counter `"01 / 04"`
- Right edge: gradient fade hinting at next panel

**Animations:**
- `ScrollTrigger.pin()` the container. `scrub: true` drives `gsap.to(inner, { x: -totalWidth })`
- On panel enter: image scale `1.1 → 1`, title slides up
- Draggable fallback on touch devices (Draggable plugin)

**Note:** Projects section component exists at `components/projects-section.jsx` but is **not currently imported in `app/page.jsx`** — add the import.

### Chapter 05 — Contact
**Layout:** Full-screen (not pinned). Two-column.

**Content:**
- Left: Giant editorial headline "Let's build something together." + contact info (email, location, availability status)
- Right: Existing `<ContactForm />` component — form fields, hCaptcha, submit button. **Visual restyle only** — all logic in `components/contact-form.jsx` and `app/api/contact/route.js` stays unchanged.

**Visual restyle:**
- Inputs: bottom-border only (`border-bottom: 1px solid var(--border)`), transparent background, Rubik 400 text, focus state animates border to green
- Submit button: full-width, green background, Rubik 700, rounded pill
- hCaptcha widget: change `theme` prop from `"dark"` to `"light"` to match parchment background

### Chapter 06 — Footer
**Layout:** Single horizontal strip.
- Left: `HM` logo + "Hector Mendoza"
- Center: `"Designed & built with Next.js, GSAP & Three.js"`
- Right: social links (GitHub, LinkedIn)

---

## Cursor System

A global `<CustomCursor />` component rendered in `app/layout.jsx`. Uses GSAP `quickTo` for performant lerp-follow (no React state updates on mousemove).

### States

| State | Trigger | Appearance |
|---|---|---|
| Default | — | 40px circle, `border: 1.5px solid #2A6B45`, 4px green dot center |
| Hover link/button | `data-cursor="link"` on element | Expands to 70px, fills `#2A6B45`, shows text label from `data-cursor-label` attr |
| Hover text body | `data-cursor="text"` | Collapses to 6×24px vertical bar |
| Drag (projects) | Inside horizontal reel | Changes to `←→` drag icon |
| Hidden | `data-cursor="none"` | Opacity 0 |

### Trail
3 ghost circles (`16px`, `10px`, `6px`) that follow with increasing lag (`duration: 0.15`, `0.25`, `0.35`). Opacity `0.4`, `0.25`, `0.15`.

### Implementation
```
components/custom-cursor.jsx
```
- `useEffect` adds `mousemove` listener → `gsap.quickTo(cursorRef, "x")` and `gsap.quickTo(cursorRef, "y")`
- Mutation observer (or event delegation) detects `data-cursor` attribute on hovered elements
- `pointer-events: none` on the cursor element always

---

## Magnetic Buttons

Reusable `<MagneticButton>` wrapper component (`components/magnetic-button.jsx`). On `mousemove` within the element's bounding rect, computes offset from center and applies `gsap.to(el, { x, y, duration: 0.4 })`. On `mouseleave`, snaps back to `x:0, y:0`. Max offset: `±20px`.

---

## Smooth Scroll

Lenis instance initialized in a `<SmoothScroll>` client component wrapping children in `app/layout.jsx`. GSAP ScrollTrigger synced to Lenis via `lenis.on('scroll', ScrollTrigger.update)`.

---

## Three.js Ink Shader

**File:** `components/ink-scene.jsx`

Replaces current `components/scene-3d.jsx` for the hero section only. The existing `scene-3d.jsx` is kept but no longer used in the hero.

**Approach:**
- Full-screen `<Canvas>` fixed behind hero content
- One plane mesh covering the viewport
- `ShaderMaterial` with:
  - `uTime` uniform (clock)
  - `uMouse` uniform (normalized cursor position)
  - `uResolution` uniform
  - Fragment shader: layered simplex noise to simulate ink diffusion; green tint (`#2A6B45`) at ~15% opacity over parchment, reacts to mouse proximity
- Very low performance cost — single draw call, no geometry complexity
- `dpr={[1,1]}` to cap resolution, `frameloop="demand"` to pause when off-screen

---

## File Changes Summary

### New files
| File | Purpose |
|---|---|
| `components/custom-cursor.jsx` | Global cursor system |
| `components/magnetic-button.jsx` | Magnetic hover wrapper |
| `components/ink-scene.jsx` | Three.js ink shader for hero |
| `components/smooth-scroll.jsx` | Lenis wrapper |
| `lib/gsap.js` | GSAP plugin registration (ScrollTrigger) + `splitChars()` utility |

### Modified files
| File | Change |
|---|---|
| `app/globals.css` | New palette tokens, paper texture, cursor hide on body, font import |
| `app/layout.jsx` | Add `<SmoothScroll>`, `<CustomCursor>` |
| `app/page.jsx` | Add `ProjectsSection` import (currently missing), reorder sections |
| `components/navbar.jsx` | Restyle to parchment theme |
| `components/hero-section.jsx` | Full rewrite — GSAP SplitText, magnetic buttons, ink scene |
| `components/about-section.jsx` | GSAP scroll animations, new layout |
| `components/experience-section.jsx` | DrawSVG timeline, pinned layout |
| `components/projects-section.jsx` | Horizontal reel layout |
| `components/contact-section.jsx` | Editorial layout restyle |
| `components/contact-form.jsx` | Visual restyle only — logic unchanged |
| `components/footer.jsx` | Restyle |
| `tailwind.config.ts` | Add new color tokens |

### Untouched files
| File | Reason |
|---|---|
| `app/api/contact/route.js` | Resend + hCaptcha logic stays exactly as-is |
| `components/contact-form.jsx` (logic) | Form validation, submission, error handling unchanged |
| `components/ui/*` | Radix UI primitives untouched |

---

## Mobile Responsiveness

- Cursor: hidden on touch devices (`@media (hover: none)`)
- Pinned chapters: `ScrollTrigger.matchMedia` — pins disabled below `768px`, sections stack vertically
- Horizontal projects reel: replaced by vertical scroll + Draggable touch swipe on mobile
- Navbar: hamburger menu retained, restyled to parchment theme
- Typography: fluid clamp scaling for headlines

---

## Performance Targets
- Three.js canvas: `dpr={[1,1]}`, `frameloop="demand"`, unmount after hero leaves viewport
- GSAP ScrollTrigger: `once: true` for one-shot animations
- Fonts: `display=swap`, preconnect to fonts.googleapis.com
- Images: Next.js `<Image>` with `sizes` for responsive loading

---

## Out of Scope
- Dark mode (the parchment theme is the identity — no toggle)
- Multi-language support
- CMS integration
- New project images (placeholder images remain until client provides real ones)
