# Loader Orb: Terracotta Fill + AI-Agent Feel

## Problem
The WebGL `Orb` loader (shipped in the previous iteration) reads as a thin
hollow ring rather than a filled blob, and its color comes from rotating a
generic purple/cyan/dark-blue palette via a `hue` prop — which cannot hit
true terracotta (confirmed empirically: the achievable warm value, `hue=-115`,
leans terracotta/magenta but is an approximation, not the site's actual
`--primary` color). The result doesn't read as "AI agent" enough — it's
closer to a static decorative ring than a breathing, alive indicator.

## Design
`components/Orb.jsx` is a local file now (installed via CLI, no ongoing
package dependency) — edit it directly rather than working around it via
props.

### 1. Fill the blob
The shader's `const float innerRadius = 0.6;` (line ~108) leaves the
center mostly empty, producing a ring. Reduce this value substantially —
exact number determined empirically in the browser (starting guess: try
values between 0.1 and 0.3) — until the orb reads as a filled, glowing
blob rather than a hollow outline. This may also require adjusting how
`r0`/`v0`/`v2`/`v3` blend near the center (lines ~130, 144-145) if
reducing `innerRadius` alone doesn't fully close the hole — verify
visually, don't assume the single constant is sufficient.

### 2. Real terracotta palette, not hue rotation
Replace the three fixed `baseColor1`/`baseColor2`/`baseColor3` shader
constants (lines 105-107) with the site's actual palette instead of
relying on the `hue` prop's YIQ rotation:
- `baseColor1` (highlight): a lighter warm peach-orange
- `baseColor2` (core): the site's exact `--primary` terracotta,
  `rgb(228, 102, 68)` → normalized `vec3(0.894, 0.400, 0.267)`
- `baseColor3` (shadow/accent): a magenta/plum tone, preserving some of
  the glossy multi-tone shimmer that made the reference image and the
  `hue=-115` result appealing, rather than going flat monochrome-orange

Drop the `hue` prop from the loader's `<Orb ... />` usage in
`page-loader.jsx` (or leave it accepted but unused/defaulted to 0) since
color is now fixed by the palette, not rotated.

### 3. "AI-agent" breathing feel
Wrap the `Orb` in a continuous, subtle scale-breathing animation via
Framer Motion (`repeat: Infinity`, smooth `easeInOut`), similar in spirit
to the very first CSS-orb loader iteration's breathing rings. This layers
a gentle "alive" pulse on top of the shader's own internal color/noise
animation — the combination is what should read as "agent thinking"
rather than a static graphic. Exact scale range/duration tuned visually
(starting guess: scale oscillating roughly `0.95 ↔ 1.05` over ~2-3s).

### 4. Remove the name caption
The "Hector Mendoza" italic text below the orb is removed entirely — the
orb is now the loader's sole content.

### Sequence (~1.6s total loader duration, unchanged)
- Orb mounts and both its internal shader animation and the new breathing
  scale start immediately.
- No name caption below it anymore.
- Exit unchanged (`opacity: 0, y: -16`, `duration: 0.55`).

## Implementation
- `components/Orb.jsx`: replace the three `baseColor*` GLSL constants,
  tune `innerRadius` (and related blending terms if needed) for a filled
  look.
- `components/page-loader.jsx`: wrap `<Orb />` in a breathing
  `motion.div`, drop/ignore the `hue` prop usage, remove the name
  `<motion.p>` block entirely.
- No other files touched. No new dependencies (still just `ogl`, already
  installed).
- All color/radius/breathing values require live visual tuning in the
  browser — this spec sets starting points and acceptance criteria
  (filled not ringed, on-brand terracotta with some shimmer, visible
  breathing pulse), not exact final numbers.

## Out of scope
- No changes to the Morelia map card, hero section, or any other loader
  element (name caption, exit transition, overall duration).
- Not re-introducing theme-aware `backgroundColor` — stays fixed at
  `#000000` per the previous fix (shader-internal math only, not a
  painted layer).
