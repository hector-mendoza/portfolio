# Loader Italic Name + Morelia Map Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the loader's HM draw-on monogram with an italic serif rendering of "Hector Mendoza", and replace the Morelia hero card's icon+text content with a static mapcn map preview.

**Architecture:** Two independent, unrelated UI changes touching separate files — no shared state or sequencing dependency between them. Task 1 edits `app/layout.jsx` (font) and rewrites `components/page-loader.jsx`. Task 2 installs the `mapcn` shadcn component and rewrites the location card block inside `components/hero-section.jsx`.

**Tech Stack:** Next.js App Router, React (JS, not TS — this repo's components are `.jsx`), Framer Motion, Tailwind CSS v4, shadcn/ui, `next/font/google`, MapLibre GL (via mapcn).

## Global Constraints

- No test framework exists in this repo (`package.json` only defines `dev`/`build`/`start`/`lint`/`sanity`). Verification is `npm run lint`, `npm run build`, and manual browser-preview checks via the preview tools — not unit tests.
- Package manager is npm (`package-lock.json` present, no `pnpm-lock.yaml`/`yarn.lock`).
- Keep loader total visible duration at 1600ms (`setTimeout(() => setVisible(false), 1600)` in `components/page-loader.jsx`) and the existing exit transition (`opacity: 0, y: -16`, `duration: 0.55`, `ease: EASE`) unchanged.
- Spec source of truth: `docs/superpowers/specs/2026-07-09-loader-italic-name-and-map-card-design.md`.
- The map card overlay shows only the city label (`Morelia, Mexico`) — no UTC offset, no coordinates (per spec amendment).
- Map is static/non-interactive: no `MapControls`, `pointer-events-none` on the map itself.
- `components/contact-info.jsx` is untouched — out of scope.

---

### Task 1: Loader — italic serif name replaces HM monogram

**Files:**
- Modify: `app/layout.jsx:1-16` (font imports/config), `app/layout.jsx:85` (body className)
- Modify: `components/page-loader.jsx:1-96` (full rewrite of the monogram block)

**Interfaces:**
- Consumes: existing `EASE` constant already defined in `components/page-loader.jsx:6` (`[0.22, 1, 0.36, 1]`); existing CSS custom properties `--primary`/`--foreground` (via Tailwind `text-primary`/`text-foreground` classes) already defined in `app/globals.css`.
- Produces: new CSS variable `--font-instrument-serif` (consumed only within `page-loader.jsx` via an inline `style={{ fontFamily: "var(--font-instrument-serif)" }}` — not added to `tailwind.config.ts` `fontFamily` since no other component needs a `font-serif` utility yet).

- [ ] **Step 1: Add the Instrument Serif font import to `app/layout.jsx`**

Edit `app/layout.jsx` — add `Instrument_Serif` to the existing `next/font/google` import and configure it as italic-only, weight 400:

```jsx
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google";
```

Add below the existing `jetbrainsMono` const (after line 16):

```jsx
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
});
```

- [ ] **Step 2: Wire the new font variable into the body className**

In `app/layout.jsx:85`, change:

```jsx
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
```

to:

```jsx
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans antialiased`}
```

- [ ] **Step 3: Verify the font loads with no build errors**

Run: `npm run build`
Expected: build completes successfully, no "Instrument_Serif is not exported by next/font/google" or similar error. If the exact export name differs, check the error message and correct the import name (Google font names in `next/font/google` use the family name with underscores in place of spaces — `Instrument_Serif` is correct for the "Instrument Serif" family).

- [ ] **Step 4: Rewrite `components/page-loader.jsx` to remove the monogram and add the italic name**

Replace the entire file with:

```jsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <div
            className="text-center leading-none"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-5xl md:text-6xl italic text-foreground"
            >
              Hector
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              className="text-5xl md:text-6xl italic text-primary"
            >
              Mendoza
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Verify in the browser preview**

Start the dev server (`portfolio-dev` launch config, port 3000). Reload the page and screenshot. Confirm:
- "Hector" (foreground color) and "Mendoza" (terracotta primary color) render stacked, in italic serif, no monogram/logo/spinning ring/progress bar/mono caption present.
- No console errors (check via preview console logs tool).
- The overlay disappears after ~1.6s and the page content underneath renders normally.

If screenshots land after the animation finishes (timing race), temporarily multiply the `setTimeout` and `transition.duration`/`delay` values by ~5x, reload, screenshot mid-animation, then revert to the exact values shown in Step 4 before committing (same technique used for the original monogram loader verification).

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors introduced in `app/layout.jsx` or `components/page-loader.jsx`.

- [ ] **Step 7: Commit**

```bash
git add app/layout.jsx components/page-loader.jsx
git commit -m "$(cat <<'EOF'
Replace loader HM monogram with italic serif name

Swaps the draw-on monogram/crossfade for a two-line italic
Instrument Serif rendering of "Hector Mendoza", fading in with a
staggered upward drift.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Morelia location card — mapcn static map

**Files:**
- Create: `components/ui/map.tsx` (generated by the mapcn CLI — exact contents determined by the installer, not hand-written)
- Modify: `package.json` / `package-lock.json` (via `npm install`, triggered by the CLI)
- Modify: `components/hero-section.jsx:102-117` (Location card block)

**Interfaces:**
- Consumes: `Map`, `Marker` exports from `@/components/ui/map` (installed in Step 1 of this task); existing `MapPinIcon` import at `components/hero-section.jsx:5` is removed from this card (still fine to keep the import if used elsewhere in the file — check before removing the import line itself).
- Produces: nothing consumed by later tasks (this is the last task).

- [ ] **Step 1: Install the mapcn map component**

Run: `npx shadcn@latest add @mapcn/map`

Expected: the CLI detects the existing `components.json` config, installs `maplibre-gl` as a dependency, and writes `components/ui/map.tsx` (and any CSS it needs, e.g. importing `maplibre-gl/dist/maplibre-gl.css`). If the CLI prompts for confirmation, accept the defaults (this repo's `components.json` already specifies `style: "default"`, `baseColor: "neutral"`, Tailwind config path, and aliases — the installer should pick these up automatically).

- [ ] **Step 2: Confirm the installed component's API**

Run: `sed -n '1,80p' components/ui/map.tsx` (or open the file) and confirm it exports a `Map` component accepting `center` (`[lng, lat]`), `zoom`, `children`, and a `Marker` component accepting `position` (`[lng, lat]`). If the actual exported prop names differ from this plan's assumption (`center`/`zoom`/`position`), adjust Step 4 below to match the real API — the installed file is the source of truth, not this plan.

- [ ] **Step 3: Check whether `MapPinIcon` is used elsewhere in `hero-section.jsx`**

Run: `grep -n "MapPinIcon" components/hero-section.jsx`

If the only remaining usage after Step 4's edit is the import line itself, remove the import (`import { MapPinIcon } from "@animateicons/react/lucide";` at line 5) and the `locationIconRef` ref (`useRef` at line 27) plus its `onMouseEnter`/`onMouseLeave` handlers on the card (lines 108-109), since they only exist to animate the pin icon being removed. If `MapPinIcon`/`locationIconRef` are used elsewhere in the file, leave the import/ref in place and only remove the JSX usage inside the Location card.

- [ ] **Step 4: Replace the Location card block**

In `components/hero-section.jsx`, replace lines 102-117 (the `{/* ── Location (1×1) ── */}` block):

```jsx
        {/* ── Location (1×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="col-span-1 rounded-3xl border border-border bg-card p-5 flex flex-col items-center justify-center gap-3 text-center"
          style={{ minHeight: "160px" }}
          onMouseEnter={() => locationIconRef.current?.startAnimation()}
          onMouseLeave={() => locationIconRef.current?.stopAnimation()}
        >
          <MapPinIcon ref={locationIconRef} size={36} color="hsl(var(--primary))" />
          <div>
            <p className="text-base font-bold text-foreground">Morelia, Mexico</p>
            <p className="text-xs text-muted-foreground">UTC−6</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/50 tracking-wide">19.70° N · 101.19° W</p>
          </div>
        </motion.div>
```

with:

```jsx
        {/* ── Location (1×1) ── */}
        <motion.div
          variants={card}
          data-game-target
          className="col-span-1 relative rounded-3xl border border-border overflow-hidden"
          style={{ minHeight: "160px" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <Map center={[-101.19, 19.7]} zoom={11} className="h-full w-full">
              <Marker position={[-101.19, 19.7]} />
            </Map>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-10">
            <p className="text-base font-bold text-white">Morelia, Mexico</p>
          </div>
        </motion.div>
```

Add the import at the top of `components/hero-section.jsx` (near the existing imports):

```jsx
import { Map, Marker } from "@/components/ui/map";
```

Note: if Step 2 found different prop names (e.g. the installed component uses `longitude`/`latitude` instead of a `center` tuple, or a `lngLat` prop on `Marker`), use those exact names instead of `center`/`position` shown here.

- [ ] **Step 5: Verify in the browser preview**

Start/reuse the dev server, navigate to the homepage, and confirm:
- The Location card renders a map tile view centered on Morelia (not a blank/error box) with a marker visible.
- The map does not respond to click/drag/scroll (pointer-events disabled) — page scroll works normally when the cursor is over the card.
- "Morelia, Mexico" text is legible over the map via the gradient scrim, bottom-left.
- No UTC offset or coordinate text is present.
- Toggle the site's dark mode control and confirm the map either switches style automatically (per mapcn's built-in theme switching) or at minimum remains legible — note in the commit/PR if it does not auto-switch, since that's a documented mapcn feature this plan relies on rather than builds.
- No console errors (check via preview console logs and network tools — confirm map tile requests succeed, not 4xx/5xx).

- [ ] **Step 6: Lint and build**

Run: `npm run lint`
Expected: no new errors.

Run: `npm run build`
Expected: build completes successfully (confirms `maplibre-gl` bundles correctly for the client and no import errors).

- [ ] **Step 7: Commit**

```bash
git add components/hero-section.jsx components/ui/map.tsx package.json package-lock.json
git commit -m "$(cat <<'EOF'
Replace Morelia location card icon with static mapcn map

Swaps the pin-icon/UTC/coordinates card for a static, non-interactive
mapcn map preview centered on Morelia, with just the city label
overlaid.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

If the CLI also modified other files (e.g. `app/globals.css` for `maplibre-gl` CSS imports, `tailwind.config.ts`), `git status` first and include those in the `git add`.

---

## Self-Review Notes

- **Spec coverage:** Part 1 (font, layout, animation timing, exit unchanged, caption removed) → Task 1. Part 2 (install command, static/non-interactive, card shell/overflow preserved, text overlay reduced to city only, no contact-info changes, no lazy-loading) → Task 2. Both parts of the spec are covered.
- **Placeholder scan:** No TBDs; Task 2 Steps 2-3 intentionally instruct the implementer to verify the real installed API/usages against this plan's assumptions before proceeding, since the mapcn CLI output isn't known until run — this is a verification step, not a placeholder for missing plan content.
- **Type/name consistency:** `EASE` constant reused verbatim from existing file. `Map`/`Marker` prop names (`center`, `zoom`, `position`) are stated as assumptions to be confirmed in Step 2 of Task 2, with an explicit instruction to substitute real names if they differ — flagged rather than silently assumed.
