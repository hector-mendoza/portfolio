#!/usr/bin/env node
/**
 * CI guards: centralized rAF policy + no raw author colors in components/.
 */
import { spawnSync } from "node:child_process";
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

const RG_IGNORE = [
  "--no-heading",
  "--glob",
  "!node_modules/**",
  "--glob",
  "!.next/**",
  "--glob",
  "!**/*.test.ts",
  "--glob",
  "!**/*.test.tsx",
  "--glob",
  "!vitest.setup.js",
  "--glob",
  "!scripts/check-guards.mjs",
];

function ripgrep(pattern, searchPath, extraGlobs = [], fixed = false) {
  const args = [
    ...(fixed ? ["-F"] : []),
    pattern,
    searchPath,
    ...RG_IGNORE,
    ...extraGlobs.flatMap((g) => ["--glob", g]),
  ];
  const result = spawnSync("rg", args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status === 0) {
    return result.stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  }
  if (result.status === 1) return [];
  throw new Error(result.stderr || `rg exited ${result.status}`);
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
