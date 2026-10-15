import type { SectionId, SectionTheme, ThemeMap } from "./types";

export type ScenePointer = { x: number; y: number };

export type SceneUniforms = {
  theme: SectionTheme;
  progress: number;
  pointer: ScenePointer | null;
  section: SectionId;
};

export const DEFAULT_THEME_MAP: ThemeMap = {
  hero: { hue: 220, intensity: 1, density: "medium", flow: "drift" },
  work: { hue: 260, intensity: 1, density: "medium", flow: "calm" },
  case: { hue: 200, intensity: 1, density: "dense", flow: "drift" },
  about: { hue: 180, intensity: 1, density: "sparse", flow: "calm" },
  contact: { hue: 240, intensity: 1, density: "sparse", flow: "calm" },
} as const;

export function themeUniforms(
  theme: SectionTheme,
  progress: number,
  pointer: ScenePointer | null,
  section: SectionId = "hero"
): SceneUniforms {
  return { theme, progress, pointer, section };
}

export function sectionTheme(
  map: ThemeMap,
  section: SectionId
): SectionTheme {
  return map[section];
}

export const INITIAL_UNIFORMS: SceneUniforms = themeUniforms(
  DEFAULT_THEME_MAP.hero,
  0,
  null,
  "hero"
);
