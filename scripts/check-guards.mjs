#!/usr/bin/env node
/**
 * CI guards: centralized rAF policy + no raw author colors in components/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Each original rAF site: subscribed (via schedule), exempt, removed, or native-only. */
export const RAF_POLICY = [
  {
    path: "lib/scene/schedule.ts",
    status: "native-only",
    reason: "Single native requestAnimationFrame loop for the scene scheduler.",
  },
  {
    path: "lib/scene/store.ts",
    status: "subscribed",
    reason: "Scene draw loop uses schedule.subscribe(); scroll coalescing uses schedule.requestAnimationFrame.",
  },
  {
    path: "lib/scene/store.loop.test.ts",
    status: "exempt",
    reason: "Vitest stubs global requestAnimationFrame (test harness only).",
  },
  {
    path: "components/scene/MotionRoot.tsx",
    status: "subscribed",
    reason: "Pointer coalescing one-shots via schedule.requestAnimationFrame.",
  },
  {
    path: "components/scene/LivingCanvas.tsx",
    status: "subscribed",
    reason: "Opacity reveal one-shot via schedule.requestAnimationFrame.",
  },
  {
    path: "lib/hairline-ambient.js",
    status: "subscribed",
    reason: "Hairline wander loop uses schedule.subscribe (no direct rAF).",
  },
  {
    path: "public/vendor/hairline-kernel.js",
    status: "exempt",
    reason: "Vendor bundle; prefers window.__portfolioScheduleFrame, native rAF fallback when scheduler unavailable.",
  },
  {
    path: "components/ClickSpark.jsx",
    status: "subscribed",
    reason: "Click sparks only; schedule.requestAnimationFrame while sparks active.",
  },
  {
    path: "components/SpotlightCard.jsx",
    status: "removed",
    reason: "Spotlight hover is CSS/state only — no rAF.",
  },
  {
    path: "components/Magnet.jsx",
    status: "removed",
    reason: "Magnet is transform on mousemove — no rAF.",
  },
  {
    path: "components/block/rectangular-text-reveal.jsx",
    status: "removed",
    reason: "SplitText/GSAP ticker; no direct requestAnimationFrame in repo.",
  },
  {
    path: "components/block/text-fill-animation.jsx",
    status: "removed",
    reason: "SplitText/GSAP; no direct requestAnimationFrame in repo.",
  },
  {
    path: "components/geometry-wars-game.jsx",
    status: "subscribed",
    reason: "Game loop only while overlay open; schedule.requestAnimationFrame.",
  },
  {
    path: "components/vibe-easter-egg.jsx",
    status: "subscribed",
    reason: "Canvas loop only while easter-egg open; schedule.requestAnimationFrame.",
  },
  {
    path: "components/emoji-day-easter-egg.jsx",
    status: "subscribed",
    reason: "Canvas loop only while open; schedule.requestAnimationFrame.",
  },
];

const RAF_ALLOW_PATHS = new Set(
  RAF_POLICY.filter((e) => e.status !== "removed").map((e) => e.path)
);

const SKIP_DIR_NAMES = new Set(["node_modules", ".next", ".git"]);

const SKIP_FILE_SUFFIXES = [".test.ts", ".test.tsx"];

function shouldSkipFile(relativePath) {
  if (relativePath === "scripts/check-guards.mjs") return true;
  if (relativePath === "vitest.setup.js") return true;
  for (const suffix of SKIP_FILE_SUFFIXES) {
    if (relativePath.endsWith(suffix)) return true;
  }
  return false;
}

/** @returns {string[]} repo-relative file paths */
function walkFiles(dirAbs, dirRel = "") {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const rel = dirRel ? `${dirRel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      out.push(...walkFiles(path.join(dirAbs, ent.name), rel));
      continue;
    }
    if (!ent.isFile()) continue;
    if (shouldSkipFile(rel)) continue;
    out.push(rel);
  }
  return out;
}

/**
 * @param {string} searchRootAbs absolute directory to walk
 * @param {(line: string, lineIndex: number) => boolean} lineMatches
 * @returns {string[]} hits as `./path:line:content`
 */
function grepTree(searchRootAbs, lineMatches) {
  const searchRootRel =
    searchRootAbs === root
      ? ""
      : path.relative(root, searchRootAbs).split(path.sep).join("/");
  const files = walkFiles(searchRootAbs, searchRootRel);
  const hits = [];
  for (const rel of files) {
    const abs = path.join(root, rel);
    let text;
    try {
      text = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    if (text.includes("\0")) continue;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lineMatches(lines[i], i)) {
        hits.push(`./${rel}:${i + 1}:${lines[i]}`);
      }
    }
  }
  return hits;
}

function ripgrep(pattern, searchPath, _extraGlobs = [], fixed = false) {
  const searchRootAbs = path.isAbsolute(searchPath)
    ? searchPath
    : path.join(root, searchPath === "." ? "" : searchPath);
  if (fixed) {
    return grepTree(searchRootAbs, (line) => line.includes(pattern));
  }
  const re = new RegExp(pattern, "g");
  return grepTree(searchRootAbs, (line) => {
    re.lastIndex = 0;
    return re.test(line);
  });
}

function normalizeHit(line) {
  const m = line.match(/^\.\/(.+?):/);
  return m ? m[1] : line;
}

function isAllowedColorLine(line) {
  const body = line.includes(":") ? line.split(":").slice(1).join(":") : line;
  if (/hsl\s*\(\s*var\s*\(/i.test(body)) return true;
  if (/rgb\s*\(\s*var\s*\(/i.test(body)) return true;
  if (/hsl\s*\(\s*\$\{/i.test(body)) return true;
  if (/rgb\s*\(\s*\$\{/i.test(body)) return true;
  if (/hsl\s*\(\s*0\s+0%/i.test(body)) return true;
  if (/var\s*\(\s*--/.test(body)) return true;
  if (/^\s*\/\//.test(body.trim())) return true;
  if (body.includes("/*") || body.includes("WCAG")) return true;
  if (/^[\s]*\*[\s\w]/.test(body.trim())) return true;
  return false;
}

function isAllowedHexInCss(line) {
  return /\.(css|module\.css):/.test(line);
}

let failed = false;

function report(title, lines) {
  if (lines.length === 0) return;
  failed = true;
  console.error(`\n${title} (${lines.length} hit(s)):`);
  for (const line of lines) console.error(`  ${line}`);
}

const rafHits = ripgrep("requestAnimationFrame", ".", [], true);
const rafViolations = rafHits.filter((hit) => {
  const file = normalizeHit(hit);
  if (file === "lib/scene/schedule.ts") return false;
  return !RAF_ALLOW_PATHS.has(file);
});
report("requestAnimationFrame outside policy", rafViolations);

const componentsDir = path.join(root, "components");

const rgbHits = ripgrep("rgb(", componentsDir, [], true).filter(
  (line) => !isAllowedColorLine(line)
);
report("Raw rgb( in components/", rgbHits);

const hslHits = ripgrep("hsl(", componentsDir, [], true).filter(
  (line) => !isAllowedColorLine(line)
);
report("Raw hsl( in components/", hslHits);

const hexHits = ripgrep("#[0-9a-fA-F]{3,8}\\b", componentsDir, [], false).filter(
  (line) => !isAllowedHexInCss(line) && !isAllowedColorLine(line)
);
report("Raw #hex in components/", hexHits);

if (failed) {
  console.error("\ncheck:guards failed.\n");
  process.exit(1);
}

console.log("check:guards passed.");
console.log(`rAF policy entries: ${RAF_POLICY.length} (see scripts/check-guards.mjs RAF_POLICY).`);
