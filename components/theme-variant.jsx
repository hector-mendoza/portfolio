"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function isAlmondRoute(pathname) {
  return pathname === "/almond" || pathname.startsWith("/almond/");
}

export default function ThemeVariant() {
  const pathname = usePathname();

  useEffect(() => {
    const almond = isAlmondRoute(pathname);
    document.documentElement.classList.toggle("dark", !almond);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", almond ? "#EED3BA" : "#151311");
    }
  }, [pathname]);

  return null;
}
