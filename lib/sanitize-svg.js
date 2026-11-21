/**
 * Defense-in-depth for inlined SVG markup from static city blueprints.
 * City ids are already allowlisted; this strips scripts and event handlers
 * if a blueprint file were ever compromised.
 */
export function sanitizeSvgMarkup(markup) {
  if (!markup || typeof markup !== "string") return "";

  return markup
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/<path /g, '<path pathLength="1" ');
}
