import type { CaseStudy, Slug } from "./schema";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slug(value: string): Slug {
  if (!SLUG_PATTERN.test(value)) {
    throw new Error(
      `Invalid slug "${value}": expected ${SLUG_PATTERN.toString()}`
    );
  }
  return value as Slug;
}

export function assertUniqueSlugs(studies: readonly CaseStudy[]): void {
  const seen = new Set<string>();
  for (const study of studies) {
    const key = study.slug as string;
    if (seen.has(key)) {
      throw new Error(`Duplicate case study slug: ${key}`);
    }
    seen.add(key);
  }
}
