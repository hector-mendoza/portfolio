"use client";

import { usePathname } from "next/navigation";
import { DARK_THEMES, resolveThemeFromPath } from "@/lib/themes";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";

export default function ThemeSwitcher() {
  const pathname = usePathname();
  const active = resolveThemeFromPath(pathname);

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
      <span className="text-muted-foreground">Themes:</span>
      {Object.entries(DARK_THEMES).map(([key, theme], index) => (
        <span key={key} className="inline-flex items-center">
          {index > 0 && <span className="mx-1 text-border">·</span>}
          {key === active ? (
            <span className="font-medium text-primary">{theme.label}</span>
          ) : (
            <Link001
              href={theme.path}
              className="inline-flex text-xs text-muted-foreground hover:text-primary"
            >
              {theme.label}
            </Link001>
          )}
        </span>
      ))}
    </span>
  );
}
