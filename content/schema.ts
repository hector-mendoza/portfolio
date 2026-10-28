const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CaseStudyLink =
  | {
      readonly kind: "external";
      readonly label: string;
      readonly href: `https://${string}` | `http://${string}`;
    }
  | {
      readonly kind: "repository";
      readonly label: string;
      readonly href: `https://github.com/${string}` | `https://gitlab.com/${string}`;
    };

export type CaseStudySection =
  | {
      readonly type: "overview";
      readonly heading: string;
      readonly paragraphs: readonly [string, ...string[]];
    }
  | {
      readonly type: "highlights";
      readonly heading: string;
      readonly items: readonly [string, ...string[]];
    }
  | {
      readonly type: "stack";
      readonly heading: string;
      readonly items: readonly [string, ...string[]];
    };

export type CaseStudyLinks = {
  readonly primary: CaseStudyLink;
  readonly secondary: CaseStudyLink | null;
};

export type CaseStudy = {
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly summary: string;
  readonly role: string;
  readonly year: `${number}` | `${number}-${number}`;
  readonly category: string;
  readonly stack: readonly [string, ...string[]];
  readonly accent: `#${string}`;
  readonly links: CaseStudyLinks;
  readonly sections: readonly [CaseStudySection, ...CaseStudySection[]];
  readonly featured: true;
};

export function defineCaseStudy<T extends CaseStudy>(study: T): T {
  if (!SLUG_PATTERN.test(study.slug)) {
    throw new Error(`Invalid case study slug: ${study.slug}`);
  }
  return study;
}

export function isCaseStudyLink(value: unknown): value is CaseStudyLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Record<string, unknown>;
  if (link.kind !== "external" && link.kind !== "repository") return false;
  return typeof link.label === "string" && typeof link.href === "string";
}
