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

export type CaseStudyBase = {
  slug: Slug;
  title: string;
  summary: string;
  stack: string[];
  links: { live?: string; repo?: string };
};

export type DraftCaseStudy = CaseStudyBase & {
  status: "draft";
  role?: string;
  outcomes: Outcome[];
};

export type PublishedCaseStudy = CaseStudyBase & {
  status: "published";
  role: string;
  org: string;
  period: { start: string; end: string | "present" };
  problem: string;
  approach: string[];
  outcomes: [Outcome, ...Outcome[]];
  cover: Media;
  gallery: Media[];
};

export type CaseStudy = DraftCaseStudy | PublishedCaseStudy;

export type MotionPreference = "full" | "reduced";
