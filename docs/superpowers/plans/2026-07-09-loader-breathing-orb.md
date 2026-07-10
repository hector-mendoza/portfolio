# Loader Breathing Orb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the loader's two-line italic name with a breathing glow orb (echoing the hero section's pulsing status-dot pattern) plus a single-line italic name caption below it.

**Architecture:** Single-file change to `components/page-loader.jsx`. No new dependencies, no font changes (Instrument Serif is already configured in `app/layout.jsx` from the prior loader task).

**Tech Stack:** Next.js App Router, React (`.jsx`), Framer Motion, Tailwind CSS v4.

## Global Constraints

- No test framework exists in this repo. Verification is `npm run build` and manual browser-preview checks — not unit tests. (`npm run lint` fails in this environment with a pre-existing, unrelated `eslint: command not found` error — not a blocker for this task.)
- Keep loader total visible duration at 1600ms (`setTimeout(() => setVisible(false), 1600)`) and the existing exit transition (`opacity: 0, y: -16`, `duration: 0.55`, `ease: EASE`) unchanged.
- Spec source of truth: `docs/superpowers/specs/2026-07-09-loader-breathing-orb-design.md`.
- The orb's breathing loop must run continuously for the loader's full visible duration (not a one-shot animation that completes and stops).
- Name caption is a single line ("Hector Mendoza"), not the prior two-line split.
- No changes to `app/layout.jsx`, `components/hero-section.jsx`, or any file outside `components/page-loader.jsx`.

---

### Task 1: Replace loader content with breathing orb + single-line name

**Files:**
- Modify: `components/page-loader.jsx` (full rewrite of the content block inside the `motion.div` at lines 26-46)

**Interfaces:**
- Consumes: existing `EASE` constant (`components/page-loader.jsx:6`, `[0.22, 1, 0.36, 1]`); existing CSS variable `--font-instrument-serif` (already wired into `app/layout.jsx`'s body className); existing Tailwind `bg-primary`/`text-foreground` color utilities.
- Produces: nothing consumed by later tasks (this is the only task).

- [ ] **Step 1: Rewrite `components/page-loader.jsx`**

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
          {/* Breathing glow orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative mb-8 flex h-24 w-24 items-center justify-center"
          >
            <motion.span
              className="absolute h-24 w-24 rounded-full bg-primary/30 blur-2xl"
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            />
            <motion.span
              className="absolute h-16 w-16 rounded-full bg-primary/50 blur-xl"
              animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="relative h-8 w-8 rounded-full bg-primary shadow-lg shadow-primary/40"
              animate={{ scale: [0.9, 1.08, 0.9] }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: 0.1 }}
            />
          </motion.div>

          {/* Name */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="text-2xl italic text-foreground"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Hector Mendoza
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify in the browser preview**

Start the dev server (launch config `portfolio-dev`, port 3000). Reload and screenshot. Confirm:
- Three concentric circles render, layered, in the terracotta primary color, breathing (scaling/fading) continuously — not static, not a single one-shot animation that freezes.
- "Hector Mendoza" (single line, italic serif, foreground color) fades in below the orb.
- No monogram, no two-line split, no leftover elements from the prior loader version.
- No console errors (check via preview console logs tool).
- The overlay disappears after ~1.6s and page content underneath renders normally.

Since the loader is only visible for 1.6s, a screenshot taken after a normal page load will likely miss it. If so, temporarily multiply the `setTimeout` value (line with `setTimeout(() => setVisible(false), 1600)`) by ~5x (to ~8000ms) and the two non-repeating `transition.duration`/`delay` values (the orb container's `0.5`, and the name's `0.5`/`delay: 0.5`) by a similar factor, reload, screenshot mid-animation to confirm the breathing motion and name fade are both visible and correct, then revert every value to exactly what Step 1's code block shows before committing. Do NOT alter the `repeat: Infinity` breathing animations' durations for this test — leaving those at their real speed while slowing the entry/exit is fine and makes it easier to see the breathing loop clearly.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: build completes successfully, no errors.

- [ ] **Step 4: Commit**

```bash
git add components/page-loader.jsx
git commit -m "$(cat <<'EOF'
Replace loader italic name with breathing glow orb

Swaps the two-line italic name for a layered, continuously breathing
glow orb (echoing the hero section's pulsing status-dot pattern) with
a single-line italic name caption below.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** Orb construction (layered, blurred, breathing continuously), sequence/timing (orb in at 0s, name at ~0.5s, exit unchanged at ~1.6s), single-line name (vs. prior two-line), no changes outside `page-loader.jsx` — all covered by Task 1's single code block and Global Constraints.
- **Placeholder scan:** None — Step 1 contains the complete, final code.
- **Type/name consistency:** `EASE` constant reused verbatim from the existing file (already present, not redefined). No new exports or interfaces for other tasks to consume, since this is the only task.
