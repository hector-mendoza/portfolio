import { client } from "@/sanity/lib/client";
import { postBySlugQuery, postSlugsQuery, postsQuery } from "@/sanity/lib/queries";

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  accent?: string;
  publishedAt: string;
  coverImage?: {
    asset?: { _ref: string };
    alt?: string;
  };
  body?: unknown;
};

export async function getPosts(): Promise<BlogPost[]> {
  if (!client) {
    return [];
  }

  try {
    return await client.fetch(postsQuery);
  } catch {
    return [];
  }
}

export async function getPostSlugs(): Promise<{ slug: string; publishedAt: string }[]> {
  if (!client) {
    return [];
  }

  try {
    return await client.fetch(postSlugsQuery);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!client) {
    return null;
  }

  try {
    return await client.fetch(postBySlugQuery, { slug });
  } catch {
    return null;
  }
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getPostYear(date: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(new Date(date));
}

export const DEFAULT_ACCENT = "#E15A3D";

const LEGACY_GREEN_ACCENTS = new Set([
  "#157A55",
  "#157a55",
  "#10B981",
  "#10b981",
  "#065F46",
  "#065f46",
]);

export function getPostAccent(accent?: string) {
  if (accent && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(accent)) {
    return LEGACY_GREEN_ACCENTS.has(accent) ? DEFAULT_ACCENT : accent;
  }

  return DEFAULT_ACCENT;
}

export function getPostGradient(accent: string) {
  return `linear-gradient(135deg, ${accent}33 0%, hsl(var(--card)) 45%, ${accent}22 100%)`;
}
