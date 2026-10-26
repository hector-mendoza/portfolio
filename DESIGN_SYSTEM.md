# Design System

**Product:** hectormendoza.me  
**Source of truth:** `app/globals.css` (tokens) · `tailwind.config.ts` (Tailwind maps) · section components

This document defines visual language, UI patterns, and rules for implementing UI on the portfolio. Prefer tokens and established patterns over one-off styling.

---

## 1. Brand & composition principles

1. **One composition per viewport** — the home first screen is a single bento composition, not a dashboard of widgets.
2. **Brand first** — name and role are hero-level signals; secondary copy must not overpower identity.
3. **Atmosphere over flat fill** — glass gradients, mesh drift, and soft depth create the surface; avoid plain single-color canvases.
4. **One job per section** — each section gets one purpose, one headline energy, and restrained supporting copy.
5. **Cards only when interactive** — glass cards frame hover/spotlight targets; do not wrap static prose in decorative cards.
6. **Motion with intent** — choreograph entrance, hover, and scroll reveals; never decorate for noise.
7. **Delight without clutter** — no pill clusters, floating promo badges on hero media, or competing stat strips in the first viewport.

---

## 2. Typography

| Role | Family | Token / usage |
| --- | --- | --- |
| UI & display | **Outfit** | `--font-outfit` · `font-sans` |
| Code / labels | **JetBrains Mono** | `--font-jetbrains` · `font-mono` |

Rules:

- Default body uses Outfit with `antialiased`.
- Eyebrows and stack chips often use mono with wide tracking (`tracking-[0.25em]`, uppercase).
- Prefer type scale via Tailwind (`text-xs` … `text-5xl`) rather than arbitrary sizes unless matching an existing section.
- Do not introduce Inter, Roboto, Arial, or system-default stacks as primary type.

---

## 3. Color system

Colors are **HSL CSS custom properties** remapped by mode and theme on `<html>`:

```html
<html data-theme="sage" data-mode="pastel">
```

### Semantic tokens

| Token | Role |
| --- | --- |
| `--background` / `--foreground` | Page canvas and primary text |
| `--card` / `--card-foreground` | Elevated surfaces |
| `--primary` / `--primary-foreground` | Brand actions and emphasis |
| `--secondary` / `--muted` | Quiet surfaces and secondary text |
| `--accent` | Highlights, hover washes |
| `--border` / `--input` / `--ring` | Edges and focus |
| `--destructive` | Errors only |
| `--radius` | Base corner radius (`0.75rem`) |

Tailwind maps these via `hsl(var(--…))` (see `tailwind.config.ts`). Named palette helpers also exist (`obsidian-ink`, `velvet-curfew`, `almond-hearth`, pastel creams, `sage-green`, `mist-blue`, etc.) for rare fixed accents — prefer semantic tokens first.

### Modes & themes

| Mode | Character |
| --- | --- |
| `pastel` (default) | Soft cream / mint / rose atmospheres |
| `light` | Stronger saturation, still warm |
| `.dark` | Obsidian / velvet / ember / noir charcoal bases |

| Theme | Character |
| --- | --- |
| `sage` | Mint cream, eucalyptus green (default) |
| `obsidian` | Ivory cream, dusty rose |
| `velvet` | Rose / burgundy |
| `ember` | Peach / coral blush |
| `noir` | Whisper cream / taupe or deep charcoal |
| `mist` | Powder blue / periwinkle |

Rules:

- New UI must read correctly across at least **default pastel sage** and **one dark theme**.
- Do not hard-code purple-on-white / indigo glow aesthetics as the primary look.
- Project accent colors may live on project data (`accent`, `pastelAccent`) but surface gradients should use `projectSurface()` helpers when available.

---

## 4. Surfaces & glass

Core utility classes (defined in `globals.css`):

| Class | Use |
| --- | --- |
| `.glass-card` | Primary interactive glass panel |
| `.glass-card-hero` | Large hero identity / featured panels |
| `.glass-card-gradient` | Gradient-washed glass |
| `.glass-subtle` | Quiet translucent wash |
| `.glass-pill` | Compact interactive chips |
| `.glass-gradient-base` / `.mesh` / `.shine` | Full-bleed atmospheric background |

Rules:

- Prefer glass utilities over inventing new backdrop-filter stacks.
- Hover elevation is already encoded in glass hover styles — avoid stacking multi-layer drop shadows.
- Background atmosphere is owned by `GlassGradientBackground` / aurora helpers at the layout level; page sections should not fight it with opaque full-bleed walls unless intentional.

---

## 5. Layout & spacing

- Home sections stack inside a `main` with `overflow-x-clip` to prevent mobile bleed.
- Hero uses a responsive **bento grid** (`grid-cols-2` → `md:grid-cols-4`) with intentional `order-*` for mobile.
- Max content width for dense hero grids: roughly `max-w-5xl`.
- Radius: base `--radius` (`0.75rem`); hero tiles commonly `rounded-3xl`.
- Prefer Tailwind spacing scale (`gap-3`, `p-6`, `md:p-10`) consistent with neighboring sections.

---

## 6. Motion

| Principle | Implementation cue |
| --- | --- |
| Staggered entrance | Framer Motion variants with ~0.08s stagger |
| Soft ease | Cubic bezier ≈ `[0.22, 1, 0.36, 1]` |
| Reduced motion | `usePrefersReducedMotion` — skip or simplify ornamental motion |
| Background drift | CSS keyframes on glass mesh/shine (respect reduced motion where applied) |
| Micro-interaction | Spotlight, magnet, click spark, glare — attached to interactive targets only |

Ship **2–3 intentional motions** per visually led change; do not add parallel competing loops on one card.

---

## 7. Component inventory (UI building blocks)

| Area | Examples |
| --- | --- |
| Sections | `hero-section`, `about-section`, `projects-section`, `experience-section`, `contact-section` |
| Motion primitives | `BlurText`, `ShinyText`, `Magnet`, `SpotlightCard`, `ClickSpark`, `TiltedCard` |
| Blog | `blog-card`, masonry grid, Portable Text renderer, skeletons |
| Blocks | `components/block/*` (flip text, scroll stack, hover image, etc.) |
| Chrome | `navbar`, `footer`, `scroll-progress`, toaster, error boundary |

Rules:

- Extend an existing section before creating a parallel section component.
- Skeletons / Boneyard fixtures live under `components/blog/*-skeleton` and `bones/` — keep loading shapes aligned with final cards.
- Interactive registry experiments belong in documented registries (e.g. ObsidianUI / bones) rather than ad-hoc one-offs on production sections.

---

## 8. Iconography & imagery

- Icons: Lucide / MorphIcon patterns already in use — keep stroke weight consistent within a section.
- Photography and product shots should show real work or atmosphere; abstract gradients alone are not the main visual idea for project proof.
- Prefer `/public` assets and Sanity CDN images (`cdn.sanity.io` is allow-listed).

---

## 9. Accessibility

- Maintain contrast for text on glass; if a new glass treatment fails contrast, adjust token opacity — not text color hacks per component.
- Interactive controls need visible focus (`ring` token).
- Do not convey meaning by color alone (project filters need labels / selected state beyond hue).
- Decorative canvases (WebGL, aurora) must not trap focus or block clicks on content.

---

## 10. Do / don’t

**Do**

- Use semantic tokens and glass utilities
- Keep hero budget: brand, one identity statement, stack/social, featured work
- Match existing motion easing and reduced-motion paths
- Update this doc when introducing a new mode, theme, or surface pattern

**Don’t**

- Add purple glow / neon glass as a new default aesthetic
- Place floating badges or promo stickers on hero media
- Introduce a second primary typeface without an intentional brand decision
- Ship cards around non-interactive text blocks “for polish”
