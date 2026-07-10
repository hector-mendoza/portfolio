# Page Loader Redesign

## Problem
The current `PageLoader` (`components/page-loader.jsx`) uses a generic pattern: logo scale-in, spinning dashed ring, linear progress bar, name fade. Functional but not distinctive.

## Design
Replace the spinning ring + progress bar with a self-drawing "HM" monogram built from simplified single-stroke line art (not the real logo file, which is a complex filled silhouette unsuited to stroke animation).

**Sequence (~1.6-1.8s total):**
1. `0-1.0s` — H and M stroke paths draw on simultaneously via animated `pathLength` (terracotta `--primary` stroke color).
2. `1.0-1.2s` — brief hold with a quick fill/glow flash on the completed strokes.
3. `1.2-1.4s` — crossfade from the stroke monogram to the real `/logos/logo.svg` mark, small scale bump.
4. Name text (`Hector Mendoza`) fades in ~0.3s in, unchanged from current timing.
5. `~1.6s` — overlay exits with the existing fade/slide-up transition.

## Implementation
- All changes contained in `components/page-loader.jsx`.
- New inline SVG monogram (H + M as simple stroke paths) animated with Framer Motion's `pathLength`/`opacity`, replacing the `animate-spin-slow` ring and the progress-bar div.
- Real logo `<img>` fades/scales in on top at the crossfade step; monogram strokes fade out.
- No new files, no new dependencies (Framer Motion already in use).

## Out of scope
- No changes to loader trigger/duration logic in `app/page.jsx`.
- No changes to the real `/logos/logo.svg` asset.
