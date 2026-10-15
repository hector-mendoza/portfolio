import { DEFAULT_THEME_MAP } from "@/lib/scene/uniforms";
import type { SectionTheme } from "@/lib/scene/types";

type SceneStaticPosterProps = {
  theme?: SectionTheme;
};

function posterGradient(theme: SectionTheme): string {
  const { hue, intensity } = theme;
  const lift = intensity * 4;
  return [
    `linear-gradient(180deg,`,
    `hsl(${hue} 42% ${10 + lift}%) 0%,`,
    `hsl(${hue} 38% ${16 + lift}%) 42%,`,
    `hsl(${(hue + 32) % 360} 32% ${8 + lift}%) 100%)`,
  ].join(" ");
}

export default function SceneStaticPoster({
  theme = DEFAULT_THEME_MAP.hero,
}: SceneStaticPosterProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: posterGradient(theme), pointerEvents: "none" }}
    />
  );
}
