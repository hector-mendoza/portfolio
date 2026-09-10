"use client";

import { usePathname } from "next/navigation";
import { THEMES, resolveThemeFromPath, themePath } from "@/lib/themes";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";

function SwitchRow({ label, children }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </span>
  );
}

function SwitchLink({ href, active, children }) {
  if (active) {
    return <span className="font-medium text-primary">{children}</span>;
  }

  return (
    <Link001
      href={href}
      className="inline-flex text-xs text-muted-foreground hover:text-primary"
    >
      {children}
    </Link001>
  );
}

export default function ThemeSwitcher() {
  const pathname = usePathname();
  const { theme: activeTheme, mode: activeMode } = resolveThemeFromPath(pathname);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <SwitchRow label="Themes:">
        {Object.entries(THEMES).map(([key, theme], index) => (
          <span key={key} className="inline-flex items-center">
            {index > 0 && <span className="mx-1 text-border">·</span>}
            <SwitchLink
              href={themePath(key, activeMode)}
              active={key === activeTheme}
            >
              {theme.label}
            </SwitchLink>
          </span>
        ))}
      </SwitchRow>
      <SwitchRow label="Mode:">
        <SwitchLink
          href={themePath(activeTheme, "dark")}
          active={activeMode === "dark"}
        >
          Dark
        </SwitchLink>
        <span className="mx-1 text-border">·</span>
        <SwitchLink
          href={themePath(activeTheme, "light")}
          active={activeMode === "light"}
        >
          Light
        </SwitchLink>
      </SwitchRow>
    </div>
  );
}
