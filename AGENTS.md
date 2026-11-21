<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio agent guide

Personal site for Hector Mendoza: interactive Three.js city (Pilleland), classic portfolio, and Sanity blog.

Live: https://www.hectormendoza.me

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) · React 19 |
| Styling | Tailwind CSS 4 · CSS modules · CSS variables in `app/globals.css` |
| Motion | Framer Motion / Motion · GSAP (selective) |
| 3D | Three.js (`lib/lego-city/three/`) · Blender offline pipeline |
| CMS | Sanity 6 · `next-sanity` · embedded Studio at `/studio` |
| Tests | Vitest · Testing Library |
| Skeletons | Boneyard (`/bones`, `bones/`) |

## Source of truth (do not duplicate)

| Data | Canonical file | Consumers |
| --- | --- | --- |
| Person, experience, education, FAQ, JSON-LD helpers | `lib/site.js` | `/about`, SEO, `/api/agent` |
| Project cards (gallery / classic / agent stacks) | `lib/projects.js` | Classic home, city landmarks, `/api/agent` |
| City lots, districts, tram | `lib/lego-city/spec.js` + `cities/*.js` | Compiler + Three runtime |
| Blog posts | Sanity (`sanity/schemaTypes/post.ts`) | `/blog` via `lib/blog.ts` |
| Agent / crawler copy | `public/llms.txt` + `/api/agent` | AI crawlers |

When profile or project facts change, update `lib/site.js` / `lib/projects.js` / `llms.txt` together. Prefer importing those modules over copying strings into API routes or components.

## Routes

| Path | Role |
| --- | --- |
| `/` | Pilleland (client Three.js; falls back messaging without WebGL) |
| `/classic` | Static single-page portfolio |
| `/about` | Crawlable profile + FAQ |
| `/blog`, `/blog/[slug]` | Sanity posts (`revalidate = 60`) |
| `/studio` | Embedded Sanity Studio — **noindex**, authenticated via Sanity |
| `/bones` | Boneyard snapshot target — **noindex**, not for visitors |
| `/api/agent` | Public JSON profile (CORS `*`, intentional) |
| `/api/crawl-rules` | Served as `/robots.txt` |

## Commands

```bash
npm install
cp .env.local.example .env.local   # optional Sanity
npm run dev                        # http://localhost:3000
npm run lint
npm test
npm run build
npm run city:compile               # after editing city spec/builders
npm run bones:build                # needs dev server; rebuilds skeletons
```

## Environment

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SANITY_*` | Public project/dataset/version — safe in the client |
| `SANITY_API_READ_TOKEN` | Server-only if draft preview is wired; never prefix with `NEXT_PUBLIC_` |

Home and classic routes work without Sanity. Blog returns empty when the client is unconfigured (`sanity/lib/client.ts`).

## Conventions for agents

1. **Read Next.js docs in `node_modules/next/dist/docs/`** before inventing App Router APIs.
2. Prefer **Server Components** by default. Mark `"use client"` only for interactivity, Three.js, or browser APIs.
3. Keep the city behind `next/dynamic` + `ssr: false` (`components/lego-city/lego-city-page.jsx`). Do not eagerly import `city-app` into server graphs.
4. After city geometry/content changes, run `npm run city:compile` so `public/city/city-parts.json` stays in sync.
5. Do not commit secrets. `.env.local` is gitignored; only `.env.local.example` is committed.
6. Match existing file style (mostly `.jsx` for UI, `.ts` for Sanity/blog helpers). Avoid drive-by refactors.
7. Preserve accessibility: focus states, reduced-motion paths (`usePrefersReducedMotion`), and meaningful `alt` text.
8. JSON-LD must escape `<` (`components/seo/json-ld.jsx`). Reuse that helper.

## Security rules

- Sanitize any user- or CMS-influenced URLs with `lib/safe-href.js` before rendering `href`.
- Never `dangerouslySetInnerHTML` on unsanitized markup. SVG blueprints go through `lib/sanitize-svg.js`; city ids must stay allowlisted via `resolveCityId`.
- Do not re-enable Sanity Vision in production (`sanity.config.ts` gates it to development).
- Keep `/bones` and `/studio` out of search indexes (metadata + robots).
- Security headers live in `next.config.mjs`. Extend carefully — Studio and WebGL are sensitive to aggressive CSP.
- Public CORS on `/api/agent` is intentional (read-only profile). Do not attach secrets to that payload.
- Portable Text links are scheme-restricted in the Sanity schema; still validate at render time.

## Performance notes

- `images.unoptimized: true` is intentional today (static/remote mix). Do not flip it without verifying deploy image support for `cdn.sanity.io`.
- Three.js quality already scales down on coarse pointers / low `hardwareConcurrency`.
- Prefer dynamic imports for heavy client-only surfaces; avoid pulling `lib/lego-city/three/*` into blog or classic routes.
- Blog fetch failures fail soft to `[]` / `null` — keep that resilience.

## Testing

- Unit tests live next to modules as `*.test.js` (city, sanitize helpers, etc.).
- Run `npm test` before finishing security or city changes.
- Manual city checks: WebGL home, `?city=paris`, classic fallback, blog with/without Sanity.

## Out of scope / careful areas

- Do not treat `/bones` as a product page.
- Blender / blueprint toolchains under `tools/` are offline pipelines; do not break their CLI contracts casually.
- Dependabot already tracks production vulns; prefer upstream bumps over local patches unless a fix is required now.
