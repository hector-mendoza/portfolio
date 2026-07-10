# Loader: Replace WebGL Orb with BounceCards (Tech Stack Icons)

## Problem
The WebGL shader orb loader required extensive shader-math tuning (fill,
color, edge masking) and still wasn't landing well. Switching to a
simpler, more mechanical approach: reactbits' `BounceCards` component,
showing the site's tech stack icons bouncing in.

## Design
Install reactbits' `BounceCards` (GSAP-based) via the shadcn-compatible
CLI, JS-TW variant (`npx shadcn@latest add @react-bits/BounceCards-JS-TW`
— adds `gsap` as a new dependency). Fallback: hand-create from the known
source at `github.com/DavidHDev/react-bits`,
`src/tailwind/Components/BounceCards/BounceCards.jsx` if the CLI fails.

### Icons
6 cards, matching `components/hero-section.jsx`'s tech stack exactly:
Next.js, React, TypeScript, WordPress, Shopify, Figma. Official brand
SVG marks added as local files under `public/logos/stack/` (e.g.
`nextjs.svg`, `react.svg`, `typescript.svg`, `wordpress.svg`,
`shopify.svg`, `figma.svg`) — no runtime network dependency, no new npm
package for icons.

### Component usage
`components/page-loader.jsx` replaces its orb content block with:

```jsx
<BounceCards
  images={[
    "/logos/stack/nextjs.svg",
    "/logos/stack/react.svg",
    "/logos/stack/typescript.svg",
    "/logos/stack/wordpress.svg",
    "/logos/stack/shopify.svg",
    "/logos/stack/figma.svg",
  ]}
  containerWidth={320}
  containerHeight={200}
  animationDelay={0.2}
  animationStagger={0.06}
  enableHover={false}
/>
```

- `enableHover={false}` — this is a non-interactive loading overlay, not
  a browsable gallery.
- `containerWidth`/`containerHeight` and the default `transformStyles`
  fan-out sized/tuned visually to fit the loader overlay without
  overflowing — exact values confirmed in the browser, the above are
  starting points not final.
- `animationDelay` reduced from the component's default `0.5` since the
  loader's total visible window is only ~1.6s — cards need to start
  bouncing in promptly. Confirm the full stagger sequence (6 cards ×
  ~0.06s + elastic settle time) completes comfortably before the 1.6s
  exit, adjust `animationDelay`/`animationStagger` if not.

### Removal
- `components/Orb.jsx` deleted entirely — fully superseded.
- `ogl` dependency removed from `package.json`/`package-lock.json`
  (no longer referenced anywhere).
- Any now-unused `hue`/`backgroundColor`-related code in
  `page-loader.jsx` from the orb era removed.

### Sequence (~1.6s total loader duration, unchanged)
- Cards bounce in via the component's own GSAP timeline as soon as it
  mounts.
- No name caption (already removed in a prior iteration, stays removed).
- Exit unchanged (`opacity: 0, y: -16`, `duration: 0.55`).

## Implementation
- `components/page-loader.jsx`: swap orb block for `BounceCards`, remove
  now-unused imports.
- Delete `components/Orb.jsx`.
- Add 6 SVG files under `public/logos/stack/`.
- `package.json`/`package-lock.json`: `ogl` removed, `gsap` added (via
  CLI install + manual removal of the old dependency).

## Out of scope
- No changes to the Morelia map card or hero section (aside from no
  longer needing to reference the old orb anywhere — confirm nothing
  else imports `components/Orb.jsx` before deleting it).
- Page-border glow effect (Siri/Apple-Intelligence style) — raised in
  conversation but explicitly deferred, not part of this change.
