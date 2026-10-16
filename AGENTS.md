<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cloud Agent

- Use Node.js 22.22.2 or newer and npm 11. `npm ci` fails on npm 10 with `Missing: undici@7.29.0 from lock file`. jsdom requires Node `^22.22.2`.
- Dev server: `npm run dev` at http://localhost:3000. The home page, `/blog` (Sanity setup state), and `/api/agent` work without Sanity credentials.
- Checks: `npm test` and `npm run build`. `npm run lint` expects ESLint, which is not installed by this repo.
