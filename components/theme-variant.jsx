"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { THEMES, resolveThemeFromPath } from "@/lib/themes";

export default function ThemeVariant() {
  const pathname = usePathname();

  useEffect(() => {
    const { theme, mode } = resolveThemeFromPath(pathname);
    const isDark = mode === "dark";

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", THEMES[theme].themeColor[mode]);
    }
  }, [pathname]);

  return null;
}
