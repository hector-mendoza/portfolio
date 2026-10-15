export type Slug = string & { readonly __brand: "Slug" };

export type Source =
  | { kind: "link"; url: string; label: string }
  | { kind: "internal"; note: string };

export type Outcome =
  | {
      kind: "metric";
      label: string;
      value: number;
      unit: string;
      source: Source;
    }
  | { kind: "qualitative"; statement: string; source: Source };

export type Media =
  | {
      kind: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
    }
  | {
      kind: "video";
      src: string;
      poster: string;
      alt: string;
      width: number;
      height: number;
    };

export type CaseStudy = {
  slug: Slug;
  title: string;
  role: string;
  org: string;
  period: { start: string; end: string | "present" };
  summary: string;
  problem: string;
  approach: string[];
  outcomes: [Outcome, ...Outcome[]];
  stack: string[];
  cover: Media;
  gallery: Media[];
  links: { live?: string; repo?: string };
  status: "draft" | "published";
};

export type MotionPreference = "full" | "reduced";
