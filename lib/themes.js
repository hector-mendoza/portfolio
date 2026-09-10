export const THEMES = {
  obsidian: {
    label: "Obsidian",
    description: {
      dark: "Charcoal base · burgundy accents · cream text",
      light: "Almond Hearth base · obsidian text · burgundy accents",
      pastel: "Ivory cream · dusty rose accents · soft warm text",
    },
    themeColor: {
      dark: "#151311",
      light: "#EED3BA",
      pastel: "#FAF6F1",
    },
  },
  velvet: {
    label: "Velvet",
    description: {
      dark: "Burgundy base · obsidian cards · cream text",
      light: "Blush cream base · burgundy accents · obsidian text",
      pastel: "Rose cream · soft mauve accents · warm gray text",
    },
    themeColor: {
      dark: "#4B262F",
      light: "#F0E0D8",
      pastel: "#F9F0EE",
    },
  },
  ember: {
    label: "Ember",
    description: {
      dark: "Charcoal base · rich burgundy glow · warm cards",
      light: "Warm almond base · burgundy-washed cards · deep accents",
      pastel: "Peach cream · coral blush accents · soft warmth",
    },
    themeColor: {
      dark: "#151311",
      light: "#EDD4BC",
      pastel: "#FBF3EB",
    },
  },
  noir: {
    label: "Noir",
    description: {
      dark: "Deep black · cream accents · minimal burgundy",
      light: "Warm white base · obsidian text · subtle burgundy",
      pastel: "Barely-there cream · taupe accents · gentle contrast",
    },
    themeColor: {
      dark: "#0E0C0A",
      light: "#F7F2EC",
      pastel: "#FDFBF8",
    },
  },
  sage: {
    label: "Sage",
    description: {
      dark: "Deep forest · muted green accents · soft cream text",
      light: "Mint cream base · sage green accents",
      pastel: "Soft mint · sage & eucalyptus pastels · dotted poster board",
    },
    themeColor: {
      dark: "#0F1612",
      light: "#E8F3EC",
      pastel: "#F0F7F2",
    },
  },
  mist: {
    label: "Mist",
    description: {
      dark: "Deep slate · dusty blue accents · pale text",
      light: "Sky cream base · soft blue accents",
      pastel: "Powder blue · periwinkle pastels · dotted poster board",
    },
    themeColor: {
      dark: "#0E1218",
      light: "#E8EEF6",
      pastel: "#F0F5FA",
    },
  },
};

export const MODES = ["dark", "light", "pastel"];

function parsePrefixedPath(pathname, prefix) {
  if (pathname === prefix) {
    return prefix === "/pastel" ? "sage" : "obsidian";
  }
  if (!pathname.startsWith(`${prefix}/`)) return null;
  const segment = pathname.slice(prefix.length + 1);
  return THEMES[segment] ? segment : prefix === "/pastel" ? "sage" : "obsidian";
}

export function resolveThemeFromPath(pathname) {
  const pastelTheme = parsePrefixedPath(pathname, "/pastel");
  if (pastelTheme) return { theme: pastelTheme, mode: "pastel" };

  const lightTheme = parsePrefixedPath(pathname, "/light");
  if (lightTheme) return { theme: lightTheme, mode: "light" };

  const darkTheme = parsePrefixedPath(pathname, "/theme");
  if (darkTheme) return { theme: darkTheme, mode: "dark" };

  return { theme: "sage", mode: "light" };
}

export function themePath(theme, mode) {
  if (mode === "pastel") {
    return theme === "sage" ? "/pastel" : `/pastel/${theme}`;
  }
  if (mode === "light") {
    if (theme === "sage") return "/";
    return theme === "obsidian" ? "/light" : `/light/${theme}`;
  }
  return `/theme/${theme}`;
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
    pathname.startsWith("/light/") ||
    pathname === "/pastel" ||
    pathname.startsWith("/pastel/")
  );
}
