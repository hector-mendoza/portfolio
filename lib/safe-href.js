/**
 * Allow only relative paths, mailto, and http(s) URLs.
 * Blocks javascript:, data:, vbscript:, and malformed hrefs.
 */
export function safeHref(href) {
  if (!href || typeof href !== "string") return null;

  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return trimmed;

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  if (trimmed.toLowerCase().startsWith("mailto:")) {
    const address = trimmed.slice("mailto:".length);
    if (!address || /[\s<>"]/.test(address.split("?")[0] ?? "")) return null;
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}
