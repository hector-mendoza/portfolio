import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ORIGIN = process.env.LH_ORIGIN ?? "http://localhost:3000";
const RUNS = Number(process.env.LH_RUNS ?? "3");

function topMainThreadCosts(report, limit = 3) {
  const audit = report.audits["mainthread-work-breakdown"];
  const items = audit?.details?.items;
  if (!Array.isArray(items)) return [];
  return [...items]
    .sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
    .slice(0, limit)
    .map((item) => ({
      group: item.group ?? item.groupLabel ?? "unknown",
      ms: Math.round(item.duration ?? 0),
    }));
}

function runOnce(index) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "lh-"));
  const outPath = path.join(outDir, "report.json");
  execSync(
    `npx --yes lighthouse ${ORIGIN}/ --quiet --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --throttling-method=simulate --output=json --output-path=${outPath}`,
    { stdio: "pipe", encoding: "utf8" }
  );
  const report = JSON.parse(fs.readFileSync(outPath, "utf8"));
  const perf = report.categories.performance.score * 100;
  const lcp = report.audits["largest-contentful-paint"].numericValue;
  const tbt = report.audits["total-blocking-time"].numericValue;
  const cls = report.audits["cumulative-layout-shift"]?.numericValue ?? null;
  const shiftItems =
    report.audits["layout-shift-elements"]?.details?.items ?? [];
  const result = {
    run: index + 1,
    score: Math.round(perf),
    lcpMs: Math.round(lcp),
    tbtMs: Math.round(tbt),
    cls: cls != null ? Math.round(cls * 1000) / 1000 : null,
    layoutShiftElements: shiftItems.slice(0, 5).map((item) => ({
      node: item.node?.snippet ?? item.node?.selector ?? "unknown",
      score: item.score,
    })),
    mainThreadTop3: topMainThreadCosts(report),
  };
  fs.rmSync(outDir, { recursive: true, force: true });
  return result;
}

const results = [];
for (let i = 0; i < RUNS; i++) {
  results.push(runOnce(i));
}
console.log(JSON.stringify({ runs: results }, null, 2));
