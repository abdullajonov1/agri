#!/usr/bin/env node
/**
 * Code-quality gate for agri-main/src. Prints metrics and exits non-zero when
 * any limit is exceeded. Usage: node scripts/check-quality.mjs [--report] [dir]
 *   --report  print metrics only, never fail
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const LIMITS = {
  maxFileLines: 800,
  anyUsages: 0,
  emptyCatches: 0,
  consoleLogs: 0,
};

const args = process.argv.slice(2);
const reportOnly = args.includes("--report");
const widgetRoot = fileURLToPath(new URL("..", import.meta.url));
const srcDir = args.find((a) => !a.startsWith("--")) || join(widgetRoot, "src");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const isSource = (f) => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f);
const isTest = (f) => /\.(test|spec)\.tsx?$/.test(f);

const ANY_RE = /(:\s*any\b|\bas\s+any\b|<any>|\bany\[\]|Array<any>|Record<string,\s*any>)/g;
const EMPTY_CATCH_RE = /catch\s*(\([^)]*\))?\s*\{\s*\}/g;
const CONSOLE_RE = /console\.(log|debug|info)\(/g;

const files = walk(srcDir).filter(isSource);
const rows = [];
const totals = { files: 0, tests: 0, lines: 0, any: 0, emptyCatch: 0, console: 0, oversized: 0 };

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/).length;
  const test = isTest(file);
  totals.files += 1;
  if (test) {
    totals.tests += 1;
    continue;
  }
  const any = (text.match(ANY_RE) || []).length;
  const emptyCatch = (text.match(EMPTY_CATCH_RE) || []).length;
  const consoleLogs = (text.match(CONSOLE_RE) || []).length;
  const oversized = lines > LIMITS.maxFileLines;
  totals.lines += lines;
  totals.any += any;
  totals.emptyCatch += emptyCatch;
  totals.console += consoleLogs;
  if (oversized) totals.oversized += 1;
  if (any || emptyCatch || consoleLogs || oversized) {
    rows.push({ file: relative(srcDir, file), lines, any, emptyCatch, consoleLogs });
  }
}

rows.sort((a, b) => b.any + b.emptyCatch - (a.any + a.emptyCatch) || b.lines - a.lines);
for (const r of rows.slice(0, 40)) {
  console.log(
    `${String(r.lines).padStart(5)} lines  any=${String(r.any).padStart(3)}  emptyCatch=${r.emptyCatch}  console=${r.consoleLogs}  ${r.file}`,
  );
}
console.log("\nTOTALS", JSON.stringify(totals));

const failures = [];
if (totals.oversized) failures.push(`${totals.oversized} files > ${LIMITS.maxFileLines} lines`);
if (totals.any > LIMITS.anyUsages) failures.push(`${totals.any} any usages`);
if (totals.emptyCatch > LIMITS.emptyCatches) failures.push(`${totals.emptyCatch} empty catch blocks`);
if (totals.console > LIMITS.consoleLogs) failures.push(`${totals.console} console.log/debug/info calls`);

if (failures.length && !reportOnly) {
  console.error(`\nQUALITY GATE FAILED: ${failures.join("; ")}`);
  process.exit(1);
}
console.log(failures.length ? `\n(report only) would fail: ${failures.join("; ")}` : "\nQUALITY GATE PASSED");
