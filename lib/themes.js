export const DARK_THEMES = {
  obsidian: {
    path: "/",
    label: "Obsidian",
    description: "Charcoal base · burgundy accents · cream text",
    themeColor: "#151311",
  },
  velvet: {
    path: "/theme/velvet",
    label: "Velvet",
    description: "Burgundy base · obsidian cards · cream text",
    themeColor: "#4B262F",
  },
  ember: {
    path: "/theme/ember",
    label: "Ember",
    description: "Charcoal base · rich burgundy glow · warm cards",
    themeColor: "#151311",
  },
  noir: {
    path: "/theme/noir",
    label: "Noir",
    description: "Deep black · cream accents · minimal burgundy",
    themeColor: "#0E0C0A",
  },
};

export function resolveThemeFromPath(pathname) {
  if (pathname === "/theme/velvet") return "velvet";
  if (pathname === "/theme/ember") return "ember";
  if (pathname === "/theme/noir") return "noir";
  return "obsidian";
}

export function homeBaseFromPath(pathname) {
  const theme = resolveThemeFromPath(pathname);
  return DARK_THEMES[theme].path;
}
