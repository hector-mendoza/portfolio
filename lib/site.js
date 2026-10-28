/** One source of truth for who/what the site is about: used by metadata, JSON-LD, /about and the crawlable home copy. */

export const SITE_URL = "https://www.hectormendoza.me";
export const SITE_UPDATED = "2026-10-28";

export const PERSON = {
  name: "Hector Mendoza",
  jobTitle: "Head of Web Integrations",
  tagline: "Senior Software Engineer & Lead Developer",
  employer: "UrVenue",
  email: "hey@hectormendoza.me",
  city: "Morelia",
  country: "Mexico",
  countryCode: "MX",
  summary:
    "Senior Software Engineer and Lead Developer with 8+ years of experience building performant, accessible and visually polished web experiences. Based in Morelia, Mexico.",
  sameAs: [
    "https://github.com/hector-mendoza",
    "https://www.linkedin.com/in/hector-mendoza-m/",
    "https://www.threads.com/@hectormendozax2",
  ],
  skills: ["React", "Next.js", "TypeScript", "WordPress", "WooCommerce", "Shopify", "Node.js", "Tailwind CSS", "Three.js", "GSAP", "Firebase", "Figma"],
};

export const EXPERIENCE = [
  { role: "Head of Web Integrations", org: "UrVenue", years: "2024–Present", place: "Morelia, Mexico" },
  { role: "Web Services Developer", org: "UrVenue", years: "2023–2024", place: "Morelia, Mexico" },
  { role: "Office Manager & Lead Developer", org: "Once Interactive Inc.", years: "2019–2023", place: "Remote" },
  { role: "Senior Web Developer", org: "Once Interactive Inc.", years: "2017–2023", place: "Remote" },
  { role: "Web Developer", org: "COPARMEX Michoacán", years: "2017", place: "Morelia, Mexico" },
];

export const EDUCATION = [
  { degree: "Master's Degree in Computer Science, Mobile App Development", school: "Universidad Vasco de Quiroga", years: "2018–2020" },
  { degree: "Engineer's Degree in Computer Science", school: "Universidad Vasco de Quiroga", years: "2013–2017" },
];

export const PROJECTS = [
  { name: "Cantera Diez Hotel", url: "https://canteradiezhotel.com", year: "2025", text: "Hotel and hospitality website built with AngularJS and Firebase, with bilingual i18n and a room showcase." },
  { name: "Vibe Theme", url: "https://vibetheme.hectormendoza.me", year: "2026", text: "A collection of 8 premium dark VS Code and Cursor themes, MIT licensed." },
  { name: "Astes", url: "https://astes.com.mx", year: "2024", text: "Corporate website built with WordPress and optimised for SEO." },
  { name: "Mojito Cocktails", url: "https://gsap-cocktails-hm.vercel.app", year: "2026", text: "GSAP animation showcase with scroll-driven animation and 3D transforms." },
  { name: "Our Wedding", url: "http://wedding.hectormendoza.me", year: "2025", text: "Personal wedding website with RSVP management and a countdown." },
];

export const PILLELAND = {
  name: "Pilleland",
  summary:
    "Pilleland is Hector Mendoza's interactive 3D portfolio: a LEGO-style city built from bricks in Three.js where every building is a project, a job or a chapter of his story. Visitors ride the tram for a guided tour, walk the streets as a minifig, or orbit the whole city like a model, and can fly to travel cities (Madrid, Paris, Rome, Punta Cana).",
};

/** Question → answer pairs; the same text feeds the FAQPage JSON-LD, /about and the crawlable home copy. */
export const FAQ = [
  {
    q: "Who is Hector Mendoza?",
    a: `${PERSON.name} is a ${PERSON.tagline} with 8+ years of experience, currently ${PERSON.jobTitle} at ${PERSON.employer}. He is based in ${PERSON.city}, ${PERSON.country}.`,
  },
  {
    q: "What does Hector Mendoza do?",
    a: "He builds and leads web projects: Next.js and React applications, WordPress and WooCommerce sites, Shopify stores, headless CMS builds and API integrations, with a focus on performance, accessibility and polished interfaces.",
  },
  {
    q: "What technologies does Hector Mendoza work with?",
    a: `${PERSON.skills.join(", ")}.`,
  },
  {
    q: "Where is Hector Mendoza based?",
    a: `${PERSON.city}, ${PERSON.country} (UTC−6). He works remotely with international teams and clients.`,
  },
  {
    q: "Is Hector Mendoza available for new projects?",
    a: `Yes, he is open to new projects and collaborations, especially for hospitality, e-commerce and corporate web experiences. Contact: ${PERSON.email}.`,
  },
  {
    q: "What is Pilleland?",
    a: PILLELAND.summary,
  },
  {
    q: "Where did Hector Mendoza study?",
    a: "He holds a Master's degree in Computer Science (Mobile App Development) and an Engineer's degree in Computer Science, both from Universidad Vasco de Quiroga in Morelia.",
  },
];

const personId = `${SITE_URL}/#person`;
const siteId = `${SITE_URL}/#website`;

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": personId,
    name: PERSON.name,
    jobTitle: PERSON.jobTitle,
    description: PERSON.summary,
    url: SITE_URL,
    image: `${SITE_URL}/og/pilleland.jpg`,
    email: PERSON.email,
    sameAs: PERSON.sameAs,
    address: { "@type": "PostalAddress", addressLocality: PERSON.city, addressCountry: PERSON.countryCode },
    knowsAbout: PERSON.skills,
    worksFor: { "@type": "Organization", name: PERSON.employer },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad Vasco de Quiroga" },
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": siteId,
    url: SITE_URL,
    name: "Hector Mendoza",
    description: PERSON.summary,
    inLanguage: "en",
    publisher: { "@id": personId },
  };
}

export function siteGraph() {
  return { "@context": "https://schema.org", "@graph": [personJsonLd(), websiteJsonLd()] };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function profilePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/about#profile`,
    url: `${SITE_URL}/about`,
    name: `About ${PERSON.name}`,
    dateModified: SITE_UPDATED,
    mainEntity: { "@id": personId },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function articleJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    ...(post.image ? { image: post.image } : {}),
    author: { "@id": personId },
    publisher: { "@id": personId },
  };
}
