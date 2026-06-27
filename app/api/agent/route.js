export const runtime = "edge";

const payload = {
  schema: "https://schema.org/Person",
  name: "Hector Mendoza",
  jobTitle: "Head of Web Integrations",
  description:
    "Senior Software Engineer & Lead Developer with 8+ years of experience crafting performant, accessible web experiences. Based in Morelia, Mexico.",
  url: "https://hectormendoza.com",
  email: "hey@hectormendoza.me",
  location: {
    city: "Morelia",
    country: "Mexico",
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
  experience: [
    { role: "Head of Web Integrations", company: "UrVenue", period: "2024–Present", location: "Morelia, Mexico" },
    { role: "Web Services Developer", company: "UrVenue", period: "2023–2024", location: "Morelia, Mexico" },
    { role: "Office Manager & Lead Developer", company: "Once Interactive Inc.", period: "2019–2023", location: "Remote" },
    { role: "Senior Web Developer", company: "Once Interactive Inc.", period: "2017–2023", location: "Remote" },
    { role: "Web Developer", company: "COPARMEX Michoacán", period: "2017", location: "Morelia, Mexico" },
  ],
  education: [
    { degree: "Master's in Computer Science", specialty: "Mobile App Development", school: "Universidad Vasco de Quiroga", period: "2018–2020" },
    { degree: "Engineer's in Computer Science", school: "Universidad Vasco de Quiroga", period: "2013–2017" },
  ],
  projects: [
    { title: "Cantera Diez Hotel", url: "https://canteradiezhotel.com", stack: ["AngularJS", "Firebase", "i18n"], category: "Hospitality", year: 2025 },
    { title: "Vibe Theme", url: "https://vibetheme.hectormendoza.me", stack: ["Design", "VS Code", "Color Theory"], category: "Design Tool", year: 2026 },
    { title: "Astes", url: "https://astes.com.mx", stack: ["WordPress", "SEO"], category: "Corporate", year: 2024 },
    { title: "Mojito Cocktails", url: "https://gsap-cocktails-hm.vercel.app", stack: ["GSAP", "Next.js", "WebGL"], category: "Creative Dev", year: 2026 },
    { title: "Our Wedding", url: "http://wedding.hectormendoza.me", stack: ["Next.js", "Tailwind CSS"], category: "Personal", year: 2025 },
  ],
  social: {
    github: "https://github.com/hector-mendoza",
    linkedin: "https://www.linkedin.com/in/hector-mendoza-m/",
    threads: "https://www.threads.com/@hectormendozax2",
  },
  llmsTxt: "https://hectormendoza.com/llms.txt",
};

export function GET() {
  return Response.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
