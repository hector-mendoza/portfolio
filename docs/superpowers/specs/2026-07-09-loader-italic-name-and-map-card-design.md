# Loader Italic Name Redesign + Morelia Map Card

## Part 1: Loader — italic serif name (supersedes the HM monogram)

The HM draw-on monogram from the earlier loader redesign (see
`2026-07-09-loader-redesign-design.md`) is replaced. The loader's centerpiece
becomes "Hector Mendoza" set in an elegant italic serif.

### Font
- Add `Instrument_Serif` (italic, weight 400) via `next/font/google` in
  `app/layout.jsx`, following the same pattern as the existing
  `Space_Grotesk` / `JetBrains_Mono` imports. Expose as CSS variable
  `--font-instrument-serif`.

### Layout & content
- Two stacked lines: "Hector" then "Mendoza", ~`text-5xl`/`text-6xl`,
  italic serif.
- "Hector" in `text-foreground`, "Mendoza" in `text-primary` (terracotta) —
  echoes the two-tone treatment already used on the homepage hero heading.
- The small uppercase mono caption ("HECTOR MENDOZA") below the mark is
  removed entirely — no replacement rule/divider. The italic name is the
  whole moment.

### Animation (~1.6s total, unchanged overall duration/exit)
1. `0–0.6s`: "Hector" fades in with upward drift (`y: 12 → 0`,
   `opacity: 0 → 1`) and slight scale (`0.96 → 1`).
2. `0.15–0.75s`: "Mendoza" follows the same treatment, ~150ms stagger
   behind "Hector".
3. `~1.6s`: overlay exits with the existing fade/slide-up transition
   (`opacity: 0, y: -16`, unchanged).

### Implementation
- All changes in `components/page-loader.jsx` (remove monogram SVG block,
  remove real-logo crossfade `<img>`, remove mono caption `<motion.p>`,
  add the two italic name lines) and `app/layout.jsx` (font import).
- No changes to trigger/duration logic (`setTimeout` stays 1600ms).

## Part 2: Morelia location card — mapcn integration

Replace the current icon+text-only "Location" card in
`components/hero-section.jsx` (~lines 102–117) with a static map preview
from [mapcn](https://mapcn.vercel.app/), an open-source shadcn-style map
component built on MapLibre GL. No API key required (free tiles, automatic
light/dark style switching).

### Installation
- `npx shadcn@latest add @mapcn/map` (npm, matching this repo's
  `package-lock.json`) — installs `maplibre-gl` and
  `components/ui/map.tsx`.

### Card behavior
- Map centered on Morelia (`[-101.19, 19.70]`), fixed zoom, static:
  `pointer-events-none`, no `MapControls`, no pan/zoom/drag.
- Card retains its existing shell (`rounded-3xl border border-border`,
  `160px` min-height, `col-span-1`); map fills it with `overflow-hidden`.
- Existing text (`Morelia, Mexico` / `UTC−6` /
  `19.70° N · 101.19° W`) stays as an overlay, positioned bottom-left,
  over a subtle gradient scrim for legibility against map tiles.
- A single `Marker` marks the city location.
- Relies on mapcn's built-in automatic theme switching to track the
  site's light/dark mode — no custom dark-mode wiring needed.

### Out of scope
- `components/contact-info.jsx`'s plain "Morelia, Mexico" text line is
  untouched.
- No lazy-loading / viewport gating for `maplibre-gl` — accepted as a
  reasonable dependency weight for a single static preview card.
- No interactivity (pan/zoom/rotate) on the map card.
