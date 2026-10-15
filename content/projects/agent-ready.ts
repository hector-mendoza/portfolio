import { defineCaseStudy } from "@/content/schema";

export const agentReadyCaseStudy = defineCaseStudy({
  slug: "agent-ready",
  title: "Agent Ready",
  subtitle: "npm Package · AI Crawler Toolkit",
  summary:
    "Makes your web app readable by AI agents and crawlers, automatically. A typed config generates robots.txt (with Content-Signal directives), llms.txt, sitemap.xml, an MCP server card, and an API catalog — plus a CLI to audit any live site.",
  role: "Dev Tool",
  year: "2026",
  category: "Dev Tool",
  stack: ["TypeScript", "npm", "Next.js", "CLI", "Monorepo"],
  accent: "#EF4444",
  links: {
    primary: {
      kind: "repository",
      label: "View repository",
      href: "https://github.com/hector-mendoza/agent-ready",
    },
    secondary: null,
  },
  sections: [
    {
      type: "overview",
      heading: "Overview",
      paragraphs: [
        "Makes your web app readable by AI agents and crawlers, automatically. A typed config generates robots.txt (with Content-Signal directives), llms.txt, sitemap.xml, an MCP server card, and an API catalog — plus a CLI to audit any live site.",
      ],
    },
    {
      type: "highlights",
      heading: "What ships",
      items: [
        "robots.txt with Content-Signal directives",
        "llms.txt for agent-readable site context",
        "sitemap.xml generation",
        "MCP server card and API catalog",
        "CLI to audit any live site",
      ],
    },
    {
      type: "overview",
      heading: "Architecture",
      paragraphs: [
        "MIT licensed monorepo with core, Next.js, and CLI packages. The Next.js integration keeps production apps aligned with the same source of truth that powers the audit tooling.",
      ],
    },
    {
      type: "stack",
      heading: "Stack",
      items: ["TypeScript", "npm", "Next.js", "CLI", "Monorepo"],
    },
  ],
  featured: true,
});
