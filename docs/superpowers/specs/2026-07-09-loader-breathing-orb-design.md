# Loader Breathing Orb Redesign

## Problem
The loader currently shows "Hector Mendoza" as two stacked italic serif lines
(from the prior redesign). The request now is for something that reads as
"AI agent activating" — the loader should feel like the moment an agent
spins up, not a static name reveal.

## Design
Replace the two-line italic name with a breathing glow orb as the visual
centerpiece, echoing the pulsing-dot pattern already used by the
"Available" status indicator in `components/hero-section.jsx:91-93`
(layered circles, `animate-ping`-style pulsing, `bg-primary` at varying
opacity) for visual consistency with the rest of the site.

### Orb construction
- 2-3 layered `div`s, concentric, each a blurred radial circle in the
  terracotta primary color (`bg-primary`, `blur-xl`/`blur-2xl`).
- Each layer breathes continuously: `scale` oscillates roughly
  `0.85 ↔ 1.15`, `opacity` oscillates roughly `0.4 ↔ 0.8`, on a smooth
  easeInOut loop, staggered slightly between layers so they don't move in
  perfect unison.
- The breathing loop runs continuously for the loader's full visible
  duration — it does not need to "complete" like the old draw-on/name
  animations did.

### Layout & sequence (~1.6s total, unchanged loader duration/exit)
1. `0s`: orb container fades and scales in (`opacity 0→1`, `scale 0.8→1`),
   then the breathing loop begins immediately and continues throughout.
2. `~0.5s`: "Hector Mendoza" fades in below the orb as a single line
   (not split into two lines like the prior version — smaller/secondary
   now that the orb carries the primary visual weight), in italic
   Instrument Serif (font already loaded in `app/layout.jsx`, no changes
   needed there).
3. `~1.6s`: overlay exits with the existing fade/slide-up transition
   (`opacity: 0, y: -16`, `duration: 0.55`, `ease: EASE` — unchanged).

## Implementation
- All changes contained in `components/page-loader.jsx`.
- Remove the current two-line italic name block (`<motion.p>` "Hector" +
  `<motion.p>` "Mendoza").
- Add the layered breathing-orb `div`s (pure Tailwind + Framer Motion —
  no new SVG, no new font, no new dependency).
- Add a single-line italic name caption below the orb.
- No changes to `app/layout.jsx` (Instrument Serif font already
  configured) or to loader trigger/duration logic (`setTimeout` stays
  1600ms).

## Out of scope
- No changes to the "Available" status indicator in `hero-section.jsx`
  itself — this design only borrows its visual language, doesn't touch
  that code.
- No changes to the Morelia map card (unrelated, already shipped).
