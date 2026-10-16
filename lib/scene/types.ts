export type Capability =
  | { kind: "static"; reason: "reduced-motion" | "no-webgl" | "save-data" | "low-power" }
  | { kind: "living"; dpr: 1 | 1.5 | 2 };

export type SectionId = "hero" | "work" | "case" | "about" | "contact";

export type SceneState =
  | { phase: "idle" }
  | { phase: "running"; section: SectionId; progress: number }
  | { phase: "paused"; cause: "hidden" | "offscreen" }
  | { phase: "disabled"; capability: Extract<Capability, { kind: "static" }> };

export type Density = "sparse" | "medium" | "dense";

export type SectionTheme = {
  /** 0–359 */
  hue: number;
  intensity: 0 | 1 | 2 | 3;
  density: Density;
  flow: "calm" | "drift";
};

export type ThemeMap = Readonly<Record<SectionId, SectionTheme>>;

export type RouteTransition = {
  from: string;
  to: string;
  kind: "fade" | "morph";
};
