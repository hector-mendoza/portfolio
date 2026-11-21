import { projects } from "@/lib/projects";
import {
  EDUCATION,
  EXPERIENCE,
  PERSON,
  SITE_URL,
} from "@/lib/site";

export const runtime = "edge";

const payload = {
  schema: "https://schema.org/Person",
  name: PERSON.name,
  jobTitle: PERSON.jobTitle,
  description: PERSON.summary,
  url: SITE_URL,
  email: PERSON.email,
  location: {
    city: PERSON.city,
    country: PERSON.country,
    timezone: "UTC-6",
    coordinates: "19.70° N, 101.19° W",
  },
  availability: "Open to new projects and collaborations",
  skills: {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "GSAP"],
    cms: ["WordPress", "WooCommerce", "Shopify", "Headless CMS"],
    design: ["Figma", "Responsive Design", "Pixel-Perfect"],
    backend: ["Node.js", "Firebase", "APIs", "Pipedream"],
  },
  experience: EXPERIENCE.map((item) => ({
    role: item.role,
    company: item.org,
    period: item.years,
    location: item.place,
  })),
  education: EDUCATION.map((item) => ({
    degree: item.degree,
    school: item.school,
    period: item.years,
  })),
  projects: projects.map((project) => ({
    title: project.title,
    url: project.url,
    stack: project.tags,
    category: project.category,
    year: Number(project.year) || project.year,
  })),
  social: {
    github: PERSON.sameAs.find((url) => url.includes("github.com")),
    linkedin: PERSON.sameAs.find((url) => url.includes("linkedin.com")),
    threads: PERSON.sameAs.find((url) => url.includes("threads.com")),
  },
  llmsTxt: `${SITE_URL}/llms.txt`,
};

export function GET() {
  return Response.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
