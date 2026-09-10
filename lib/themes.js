export const THEMES = {
  obsidian: {
    label: "Obsidian",
    description: {
      dark: "Charcoal base · burgundy accents · cream text",
      light: "Almond Hearth base · obsidian text · burgundy accents",
    },
    themeColor: {
      dark: "#151311",
      light: "#EED3BA",
    },
  },
  velvet: {
    label: "Velvet",
    description: {
      dark: "Burgundy base · obsidian cards · cream text",
      light: "Blush cream base · burgundy accents · obsidian text",
    },
    themeColor: {
      dark: "#4B262F",
      light: "#F0E0D8",
    },
  },
  ember: {
    label: "Ember",
    description: {
      dark: "Charcoal base · rich burgundy glow · warm cards",
      light: "Warm almond base · burgundy-washed cards · deep accents",
    },
    themeColor: {
      dark: "#151311",
      light: "#EDD4BC",
    },
  },
  noir: {
    label: "Noir",
    description: {
      dark: "Deep black · cream accents · minimal burgundy",
      light: "Warm white base · obsidian text · subtle burgundy",
    },
    themeColor: {
      dark: "#0E0C0A",
      light: "#F7F2EC",
    },
  },
};

export function resolveThemeFromPath(pathname) {
  const isLight = pathname === "/light" || pathname.startsWith("/light/");

  if (isLight) {
    const segment = pathname.replace(/^\/light\/?/, "") || "obsidian";
    const theme = THEMES[segment] ? segment : "obsidian";
    return { theme, mode: "light" };
  }

  if (pathname === "/theme/velvet") return { theme: "velvet", mode: "dark" };
  if (pathname === "/theme/ember") return { theme: "ember", mode: "dark" };
  if (pathname === "/theme/noir") return { theme: "noir", mode: "dark" };
  return { theme: "obsidian", mode: "dark" };
}

export function themePath(theme, mode) {
  if (mode === "light") {
    return theme === "obsidian" ? "/light" : `/light/${theme}`;
  }
  return theme === "obsidian" ? "/" : `/theme/${theme}`;
}

export function homeBaseFromPath(pathname) {
  const { theme, mode } = resolveThemeFromPath(pathname);
  return themePath(theme, mode);
}

export function isThemePreviewPath(pathname) {
  return (
    pathname === "/" ||
    pathname.startsWith("/theme/") ||
    pathname === "/light" ||
    pathname.startsWith("/light/")
  );
}
