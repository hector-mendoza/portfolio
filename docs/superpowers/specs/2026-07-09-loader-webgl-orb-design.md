# Loader WebGL Orb Redesign

## Problem
The current loader shows a CSS-layered breathing orb (three concentric
blurred circles). The user wants something closer to a glossy, iridescent,
colorful blob (reference: a swirling multi-hued glass-petal orb), which the
current CSS approximation doesn't achieve.

## Design
Replace the CSS breathing orb with reactbits' `Orb` component — a WebGL
shader background that renders an animated, colorful, noise-driven blob
with hue rotation and hover-reactive distortion. Source:
`DavidHDev/react-bits`, path `src/ts-tailwind/Backgrounds/Orb/Orb.tsx`,
built on the `ogl` WebGL micro-library.

### Installation
- Install via the reactbits shadcn-compatible CLI:
  `npx shadcn@latest add https://reactbits.dev/r/Orb-TS-TW` (or the
  equivalent registry command reactbits documents for this component —
  confirm exact URL/command at implementation time since it wasn't
  directly observable from the JS-rendered docs site; the GitHub source
  path above is the fallback/reference if the CLI install fails).
- Adds `ogl` as an npm dependency.
- Component lands at `components/ui/orb.tsx` (or wherever the installer
  places it — follow the installer's actual output, consistent with how
  `components/ui/map.tsx` was installed for the map card).

### Color
- Use the `hue` prop to rotate the shader's default purple/cyan/indigo
  palette toward warm terracotta tones. Starting guess: `hue={110}`–`140`
  (the rotation is applied uniformly to three fixed base colors via a
  YIQ chrominance rotation, not a direct hex swap, so the exact value
  needs visual tuning in the browser rather than computing it precisely).
  Aim for warm orange/red dominance while keeping enough of the natural
  shimmer/multi-color blend that it still reads as glossy/iridescent
  rather than flat orange.
- `backgroundColor` prop set to match the loader's `bg-background` value
  so the orb's canvas doesn't show a mismatched background box against
  the loader overlay (the overlay's `bg-background` class is a Tailwind
  CSS variable, not a hex string, so this may need the actual computed
  hex/rgb pulled from `app/globals.css`'s `--background` custom property
  for both light and dark mode, or default to a value close to the
  darker of the two given the shader looks best against dark).

### Composition & layout
- Orb container: large square, roughly 240–320px, as the loader's
  centerpiece — replacing the current three-layer CSS breathing orb
  block entirely in `components/page-loader.jsx`.
- "Hector Mendoza" name caption (italic Instrument Serif) is unchanged:
  same position below the orb, same fade-in timing (~0.5s delay).

### Behavior
- Leave `rotateOnHover`, `hoverIntensity`, and `forceHoverState` at the
  component's defaults — no need to force a hover state artificially; a
  stray mouse move over the loader just adds a subtle ripple, which is
  fine on a full-screen overlay.
- The orb's own internal animation loop (driven by `requestAnimationFrame`
  and shader `iTime`) is its entrance — no additional Framer Motion
  entrance animation is needed on top of it, unlike the previous CSS orb
  which needed an explicit fade/scale-in.

### Sequence (~1.6s total, unchanged loader duration/exit)
1. `0s`: orb container mounts and its shader animation begins
   immediately (no separate fade-in choreography needed).
2. `~0.5s`: "Hector Mendoza" fades in below, as before.
3. `~1.6s`: overlay exits with the existing fade/slide-up transition
   (`opacity: 0, y: -16`, `duration: 0.55`, `ease: EASE` — unchanged).

## Risk (flagged, not blocking)
The shader compiles on mount, which happens at the exact moment the
loader appears — this is real added work compared to the pure-CSS orb,
for a component visible only ~1.6s. This must be verified in the browser
preview (check for visible stutter/jank on load) before the task is
considered complete. If jank is visible, that becomes a follow-up
decision point (e.g. revert, or accept as a one-time cost), not a
silent ship.

## Implementation
- All changes contained in `components/page-loader.jsx` (swap the orb
  block) plus whatever files the reactbits CLI installer generates
  (expected: `components/ui/orb.tsx` or similar, `package.json`/
  `package-lock.json` for the new `ogl` dependency).
- No changes to `app/layout.jsx`, `components/hero-section.jsx`, or any
  other file.

## Out of scope
- No changes to the Morelia map card or its marker color (already
  shipped, unrelated).
- No changes to loader trigger/duration logic (`setTimeout` stays
  1600ms).
