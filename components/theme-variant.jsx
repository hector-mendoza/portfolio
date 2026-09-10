"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DARK_THEMES, resolveThemeFromPath } from "@/lib/themes";

export default function ThemeVariant() {
  const pathname = usePathname();

  useEffect(() => {
    const theme = resolveThemeFromPath(pathname);
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", DARK_THEMES[theme].themeColor);
    }
  }, [pathname]);

  return null;
}
