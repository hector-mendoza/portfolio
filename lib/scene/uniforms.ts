import type { SectionId, SectionTheme, ThemeMap } from "./types";

export const DEFAULT_THEME_MAP: ThemeMap = {
  hero: { hue: 220, intensity: 2, flow: "drift" },
  work: { hue: 260, intensity: 2, flow: "calm" },
  case: { hue: 200, intensity: 3, flow: "drift" },
  about: { hue: 180, intensity: 1, flow: "calm" },
  contact: { hue: 240, intensity: 1, flow: "calm" },
} as const;

export type SceneUniforms = {
  uTime: number;
  uProgress: number;
  uHue: number;
  uIntensity: number;
  uFlow: number;
  uResolution: [number, number];
};

export function themeToUniforms(
  theme: SectionTheme,
  progress: number,
  time: number,
  resolution: [number, number]
): SceneUniforms {
  return {
    uTime: time,
    uProgress: progress,
    uHue: theme.hue / 360,
    uIntensity: theme.intensity / 3,
    uFlow: theme.flow === "drift" ? 1 : 0,
    uResolution: resolution,
  };
}

export function sectionTheme(
  map: ThemeMap,
  section: SectionId
): SectionTheme {
  return map[section];
}

export const INITIAL_UNIFORMS: SceneUniforms = themeToUniforms(
  DEFAULT_THEME_MAP.hero,
  0,
  0,
  [1, 1]
);
