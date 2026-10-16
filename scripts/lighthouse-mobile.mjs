import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ORIGIN = process.env.LH_ORIGIN ?? "http://127.0.0.1:3000";
const RUNS = Number(process.env.LH_RUNS ?? "3");

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
  fs.rmSync(outDir, { recursive: true, force: true });
  return { run: index + 1, score: Math.round(perf), lcpMs: Math.round(lcp), tbtMs: Math.round(tbt) };
}

const results = [];
for (let i = 0; i < RUNS; i++) {
  results.push(runOnce(i));
}
console.log(JSON.stringify(results, null, 2));
