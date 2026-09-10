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
};

export const MODES = ["dark", "light", "pastel"];

function parsePastelPath(pathname) {
  if (pathname === "/pastel") return "obsidian";
  if (pathname === "/pastel/velvet") return "velvet";
  if (pathname === "/pastel/ember") return "ember";
  if (pathname === "/pastel/noir") return "noir";
  return null;
}

function parseLightPath(pathname) {
  if (pathname === "/light") return "obsidian";
  if (pathname === "/light/velvet") return "velvet";
  if (pathname === "/light/ember") return "ember";
  if (pathname === "/light/noir") return "noir";
  return null;
}

export function resolveThemeFromPath(pathname) {
  const pastelTheme = parsePastelPath(pathname);
  if (pastelTheme) return { theme: pastelTheme, mode: "pastel" };

  const lightTheme = parseLightPath(pathname);
  if (lightTheme) return { theme: lightTheme, mode: "light" };

  if (pathname === "/theme/velvet") return { theme: "velvet", mode: "dark" };
  if (pathname === "/theme/ember") return { theme: "ember", mode: "dark" };
  if (pathname === "/theme/noir") return { theme: "noir", mode: "dark" };
  return { theme: "obsidian", mode: "dark" };
}

export function themePath(theme, mode) {
  if (mode === "pastel") {
    return theme === "obsidian" ? "/pastel" : `/pastel/${theme}`;
  }
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
    pathname.startsWith("/light/") ||
    pathname === "/pastel" ||
    pathname.startsWith("/pastel/")
  );
}
