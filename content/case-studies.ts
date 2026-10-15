import type {
  CaseStudy,
  PublishedCaseStudy,
  Slug,
} from "./schema";

function slug(value: string): Slug {
  return value as Slug;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: slug("orbit"),
    status: "draft",
    title: "Orbit",
    summary:
      "A desktop pet that shows what your Claude Code sessions are doing.",
    stack: ["Rust", "JavaScript", "HTML", "CSS"],
    links: { repo: "https://github.com/hector-mendoza/orbit" },
    outcomes: [],
  },
  {
    slug: slug("vibe-theme"),
    status: "draft",
    title: "Vibe Theme",
    summary:
      "VS Code/Cursor extension with 7 dark themes, plus a landing page with live theme switching.",
    stack: ["VS Code extension", "HTML", "CSS", "JavaScript"],
    links: {
      live: "https://vibetheme.hectormendoza.me",
      repo: "https://github.com/hector-mendoza/vibe-theme",
    },
    outcomes: [],
  },
  {
    slug: slug("agent-ready"),
    status: "draft",
    title: "agent-ready",
    summary:
      "Makes web apps readable by AI agents — generates robots.txt, llms.txt, sitemaps and more.",
    stack: ["TypeScript"],
    links: { repo: "https://github.com/hector-mendoza/agent-ready" },
    outcomes: [],
  },
  {
    slug: slug("ai-ops-console"),
    status: "draft",
    title: "AI Ops Console",
    summary:
      "A natural-language ops ask drives a venue sync, a webhook trail, and a live status board.",
    stack: ["TypeScript", "Next.js", "Vercel AI SDK", "Anthropic"],
    links: {
      live: "https://venue-ops-console.vercel.app",
      repo: "https://github.com/hector-mendoza/ai-ops-console",
    },
    outcomes: [],
  },
];

export function published(
  studies: readonly CaseStudy[] = caseStudies
): PublishedCaseStudy[] {
  return studies.filter(
    (study): study is PublishedCaseStudy => study.status === "published"
  );
}
