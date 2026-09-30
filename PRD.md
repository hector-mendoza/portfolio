# Product Requirements Document

**Product:** hectormendoza.me  
**Owner:** Hector Mendoza  
**Status:** Living document — reflects the shipped portfolio and near-term product intent

---

## 1. Problem

Hiring managers, collaborators, and peers need a trustworthy signal of who Hector is as an engineer — not a résumé PDF or a generic template site. Existing personal sites often look like boilerplate, bury writing, or are invisible to AI tools that now mediate discovery.

This product solves that by presenting a polished, motion-aware portfolio and editorial blog that also exposes structured, machine-readable profile data for agents and crawlers.

## 2. Product vision

A refined personal portfolio and writing platform that feels like a product: experience-first home, Sanity-backed blog, skeleton-instant navigation, and agent-ready metadata — fast, accessible, and unmistakably branded.

## 3. Goals

| Goal | Success signal |
| --- | --- |
| Communicate identity & craft | First viewport clearly establishes name, role, and visual language |
| Showcase selected work | Projects are filterable, previewable, and link out to live work |
| Publish long-form writing | Blog posts ship from Sanity with SEO metadata and readable layout |
| Feel instantly responsive | Routes show structured skeletons via Boneyard; no empty flash |
| Stay discoverable by agents | `/api/agent`, `/llms.txt`, and crawl rules stay accurate and linked |
| Remain accessible | Reduced-motion paths, semantic landmarks, readable contrast across themes |

## 4. Non-goals

- Multi-author CMS workflows or client login portals
- E-commerce, booking, or lead-gen funnels beyond contact affordances
- A public theme marketplace or design-system package for third parties
- Replacing LinkedIn / GitHub as systems of record for employment history

## 5. Users & jobs-to-be-done

| Persona | Job |
| --- | --- |
| Hiring manager / recruiter | Quickly assess seniority, stack, and recent work |
| Potential collaborator | Find contact path and relevant project proof |
| Peer engineer | Read technical writing and evaluate craft |
| AI agent / crawler | Ingest structured profile, projects, and crawl rules |

## 6. Core surfaces

### 6.1 Home (`/`)

Single-page composition with:

1. **Hero** — identity, stack chips, social presence, featured work (bento grid)
2. **About** — bio, location, education cues
3. **Projects** — gallery with category filters and previews
4. **Experience** — role timeline
5. **Contact** — email and social paths (no heavy form funnel required)
6. **Footer** — secondary navigation and credits

### 6.2 Blog (`/blog`, `/blog/[slug]`)

- Index with featured posts, category metadata, and masonry/card layout
- Post pages with Portable Text, code blocks, share affordances
- Graceful empty / loading / not-found states

### 6.3 Studio (`/studio`)

Embedded Sanity Studio for drafting and publishing posts.

### 6.4 Agent & crawl surfaces

| Endpoint | Purpose |
| --- | --- |
| `GET /api/agent` | JSON Person profile (skills, experience, projects, social) |
| `/llms.txt` | Human/LLM-readable summary of Hector |
| `/robots.txt` → `/api/crawl-rules` | Crawl policy and content signals |
| `Link` headers on `/` | Advertise agent + llms + sitemap relations |

## 7. Functional requirements

### Must have

- Responsive home that works on mobile and desktop without horizontal overflow
- Theme tokens via CSS variables (`data-mode` / `data-theme` / `.dark`)
- Respect `prefers-reduced-motion` for ornamental animation
- Sanity-backed posts when env credentials are present; home remains usable without them
- Structured SEO: metadata, Open Graph, Person JSON-LD
- Tests for critical utilities (theme helpers, aurora stops, etc.)

### Should have

- Interactive delight (spotlight, magnet, click spark, easter eggs) that never blocks primary content
- Boneyard snapshots for blog/card loading states
- Project filter tabs with clear active state

### Nice to have

- Additional agent tooling integrations (MCP cards, richer API catalog)
- Expanded writing categories and series

## 8. Content requirements

- Projects live in `lib/projects.js` until a CMS migration is intentional
- Blog posts are Sanity documents (`post` schema) with title, slug, description, category, body
- Profile facts in `/api/agent` and `public/llms.txt` must stay aligned with About / Experience UI

## 9. Quality bar

- **Performance:** Prefer CSS and intentional Framer Motion; avoid layout thrash and empty flashes
- **Accessibility:** Semantic sections, keyboard-reachable controls, readable contrast per theme
- **Reliability:** Error boundary at root; blog not-found and loading routes
- **Maintainability:** Section components own one job; design tokens — not one-off hex — drive color

## 10. Out-of-scope risks to watch

| Risk | Mitigation |
| --- | --- |
| Motion overwhelms content | Reduced-motion hooks; keep hero budget tight |
| Theme drift across surfaces | Single token source in `app/globals.css` |
| Agent payload goes stale | Treat `/api/agent` + `llms.txt` as product surfaces in PRs that change bio/projects |
| Next.js API churn | Read `node_modules/next/dist/docs/` before framework changes |

## 11. Open questions

- Whether projects should eventually move from static JS into Sanity
- How aggressively to expand agent/MCP surfaces beyond the current endpoints
