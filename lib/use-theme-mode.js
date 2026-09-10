"use client";

import { useEffect, useState } from "react";

function readThemeMode() {
  if (typeof document === "undefined") {
    return { mode: "light", theme: "sage" };
  }

  const el = document.documentElement;
  return {
    mode: el.dataset.mode || (el.classList.contains("dark") ? "dark" : "light"),
    theme: el.dataset.theme || "obsidian",
  };
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState(readThemeMode);

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setThemeMode(readThemeMode());

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-mode", "data-theme", "class"],
    });

    return () => observer.disconnect();
  }, []);

  return themeMode;
}

export function projectSurface(project, themeMode) {
  const { mode, theme } = themeMode;
  const isPastel = mode === "pastel";

  if (isPastel && project.pastelGradient) {
    return {
      gradient: project.pastelGradient,
      accent: project.pastelAccent || project.accent,
    };
  }

  if (isPastel && theme === "sage") {
    return {
      gradient: project.sageGradient || project.pastelGradient || "from-emerald-950 via-teal-950 to-stone-900",
      accent: project.sageAccent || project.pastelAccent || project.accent,
    };
  }

  if (isPastel && theme === "mist") {
    return {
      gradient: project.mistGradient || project.pastelGradient || "from-slate-900 via-blue-950 to-indigo-950",
      accent: project.mistAccent || project.pastelAccent || project.accent,
    };
  }

  if (isPastel) {
    return {
      gradient: project.pastelGradient || project.gradient,
      accent: project.pastelAccent || project.accent,
    };
  }

  return {
    gradient: project.gradient,
    accent: project.accent,
  };
}
