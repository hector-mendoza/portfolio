#!/usr/bin/env node
/**
 * CI guards: single rAF caller + no raw colors in components.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const RAF_ALLOW = "lib/scene/schedule.ts";

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
  `!${RAF_ALLOW}`,
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

let failed = false;

function report(title, lines) {
  if (lines.length === 0) return;
  failed = true;
  console.error(`\n${title} (${lines.length} hit(s)):`);
  for (const line of lines) console.error(`  ${line}`);
}

const rafHits = ripgrep("requestAnimationFrame", ".", [], true);
report(`Forbidden "requestAnimationFrame" outside ${RAF_ALLOW}`, rafHits);

const componentsDir = path.join(root, "components");
report(
  'Raw color rgb( in components/',
  ripgrep("rgb(", componentsDir, [], true)
);
report(
  'Raw color hsl( in components/',
  ripgrep("hsl(", componentsDir, [], true)
);
report(
  "Raw color #hex in components/",
  ripgrep("#[0-9a-fA-F]{3,8}\\b", componentsDir, [], false)
);

if (failed) {
  console.error("\ncheck:guards failed.\n");
  process.exit(1);
}

console.log("check:guards passed.");
