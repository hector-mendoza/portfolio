import type { CaseStudy, PublishedCaseStudy, Source } from "./schema";
import { assertUniqueSlugs, slug } from "./slug";

const vouched: Source = { kind: "internal", note: "vouched by Hector" };

export const caseStudies: CaseStudy[] = [
  {
    slug: slug("orbit"),
    status: "draft",
    title: "Orbit",
    summary:
      "A desktop pet that shows what your Claude Code sessions are doing.",
    role: "Solo builder",
    org: "Personal",
    period: { start: "2026-08", end: "present" },
    stack: ["Tauri", "Rust", "JavaScript"],
    links: { repo: "https://github.com/hector-mendoza/orbit" },
    problem:
      "I wanted to be able to access any of my AI Agents from a single place, and know when an AI Agent finishes working and on what it was working.",
    approach: [
      "Tauri desktop app: a transparent, always-on-top window that lives in the menu bar.",
      "Claude Code hooks feed one status file, so a single pet shows the latest state across all sessions.",
      "Four states (working, waiting on you, done, idle), and the pet grows with tokens spent.",
    ],
    outcomes: [
      {
        kind: "qualitative",
        source: vouched,
        statement:
          "One place to see every AI agent session and know when each one finishes.",
      },
    ],
  },
  {
    slug: slug("vibe-theme"),
    status: "draft",
    title: "Vibe Theme",
    summary:
      "VS Code/Cursor extension with 7 dark themes, plus a landing page with live theme switching.",
    role: "Solo builder",
    org: "Personal",
    period: { start: "2026-06", end: "2026-07" },
    stack: ["VS Code extension", "HTML", "CSS", "JavaScript"],
    links: {
      live: "https://vibetheme.hectormendoza.me",
      repo: "https://github.com/hector-mendoza/vibe-theme",
      listing: {
        url: "https://marketplace.visualstudio.com/items?itemName=HectorMendoza.vibe-theme",
        label: "VS Code Marketplace",
      },
    },
    problem: "Always wanted to create and build a VS Code theme.",
    approach: [
      "A family of 7 dark themes built on 2026 design trends, from SaaS dashboards to earthy palettes.",
      "Each theme gets its own palette: a background, an accent, and a secondary color.",
      "Published to the VS Code Marketplace, plus a landing page with live theme switching.",
    ],
    outcomes: [
      {
        kind: "qualitative",
        source: {
          kind: "link",
          url: "https://marketplace.visualstudio.com/items?itemName=HectorMendoza.vibe-theme",
          label: "VS Code Marketplace",
        },
        statement: "Shipped a public extension to the VS Code Marketplace.",
      },
    ],
    cover: {
      kind: "image",
      src: "/work/vibe-theme/cover.png",
      alt: "Vibe Theme landing page at vibetheme.hectormendoza.me",
      width: 1600,
      height: 1000,
    },
  },
  {
    slug: slug("agent-ready"),
    status: "draft",
    title: "agent-ready",
    summary:
      "Makes web apps readable by AI agents — generates robots.txt, llms.txt, sitemaps and more.",
    role: "Solo builder",
    org: "Personal",
    period: { start: "2026-07", end: "2026-07" },
    stack: ["TypeScript"],
    links: { repo: "https://github.com/hector-mendoza/agent-ready" },
    problem: "A quick way to detect whether a project is AI-ready.",
    approach: [
      "One typed config generates robots.txt, llms.txt, sitemap.xml, an MCP server card, and an API catalog.",
      "Monorepo with three packages: core (pure functions), Next.js middleware, and a CLI.",
      "`agent-ready audit` checks any live URL and prints a pass/fail score.",
    ],
    outcomes: [
      {
        kind: "qualitative",
        source: vouched,
        statement:
          "A quick check of whether a project is AI-ready, with the files it needs generated for you.",
      },
    ],
    cover: {
      kind: "image",
      src: "/work/agent-ready/cover.png",
      alt: "Terminal output from agent-ready audit against vibetheme.hectormendoza.me",
      width: 1600,
      height: 1000,
    },
  },
  {
    slug: slug("ai-ops-console"),
    status: "draft",
    title: "AI Ops Console",
    summary:
      "A natural-language ops ask drives a venue sync, a webhook trail, and a live status board.",
    role: "Solo builder",
    org: "Personal",
    period: { start: "2026-09", end: "2026-09" },
    stack: ["TypeScript", "Next.js", "Vercel AI SDK", "Anthropic"],
    links: {
      live: "https://venue-ops-console.vercel.app",
      repo: "https://github.com/hector-mendoza/ai-ops-console",
    },
    problem: "A showcase of directing AI agents from an idea to a shipped app.",
    approach: [
      "Next.js with the Vercel AI SDK on Anthropic: streamText with multi-step tool calls.",
      "Two chained tools, syncVenues then deliverWebhook, run on deterministic mock data.",
      "The tool trail and status board update live, then a wrap-up streams in.",
    ],
    outcomes: [
      {
        kind: "qualitative",
        source: vouched,
        statement:
          "Directing a team of AI agents from an idea to a deployed, QA-verified app.",
      },
    ],
  },
];

assertUniqueSlugs(caseStudies);

export function isPublished(c: CaseStudy): c is PublishedCaseStudy {
  return c.status === "published";
}

export const publishedStudies = caseStudies.filter(isPublished);
