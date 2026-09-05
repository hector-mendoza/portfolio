# Hector Mendoza — Personal Portfolio

Personal portfolio and blog for [hectormendoza.me](https://hectormendoza.me), built with Next.js App Router, Framer Motion, Sanity, and Tailwind CSS.

## Features

- Animated home page (hero bento, projects, experience, contact)
- Sanity-powered blog with portable text
- Skeleton loading via Boneyard
- Agent/crawl metadata (`/llms.txt`, `/api/agent`, `/robots.txt`)

## Tech Stack

- **Next.js 16** + **React 19**
- **Tailwind CSS 4** + CSS variables
- **Framer Motion**
- **Sanity** (CMS + Studio at `/studio`)
- **Vitest** + Testing Library

## Getting Started

1. Clone and install:
   ```bash
   git clone https://github.com/hectormendoza/portfolio.git
   cd portfolio
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in Sanity values (optional for the static home page).

3. Run the app:
   ```bash
   npm run dev
   ```

## Project Structure

```
app/           # Routes (home, blog, studio, bones, API)
components/    # UI sections and shared pieces
lib/           # Utils and blog helpers
sanity/        # Schema, client, queries
bones/         # Boneyard snapshot data
public/        # Static assets
```

## Scripts

```bash
npm run dev           # Dev server
npm run build         # Production build
npm run start         # Serve production build
npm run lint          # ESLint
npm test              # Vitest once
npm run test:watch    # Vitest watch
npm run bones:build   # Rebuild Boneyard snapshots (dev server required)
npm run sanity        # Sanity Studio
```

## Content

- Hero / about / projects / experience / contact: components under `components/`
- Blog posts: Sanity Studio at `/studio`
- Theme tokens: CSS variables in `app/globals.css`

## License

Open source — feel free to fork as a starting point for your own portfolio.
