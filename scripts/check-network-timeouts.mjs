#!/usr/bin/env node
/**
 * Network guard for agri-main/src. Fails when:
 *   - a raw `fetch(` (bare, window., globalThis. or self.) is used outside
 *     src/shared/agri-http.ts (use fetchJson / fetchArrayBuffer /
 *     fetchWithTimeout so every call has a timeout), or
 *   - an `esriRequest(` call does not pass an explicit `timeout`.
 * Usage: node scripts/check-network-timeouts.mjs [dir]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const widgetRoot = fileURLToPath(new URL("..", import.meta.url));
const srcDir = process.argv[2] || join(widgetRoot, "src");
const HTTP_HELPER = join("shared", "agri-http.ts");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const isSource = (f) => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f) && !/\.(test|spec)\.tsx?$/.test(f);

/**
 * Blank out comments but keep offsets so line numbers stay correct. String
 * and template literals are matched first, so a URL or glob inside a string
 * is never mistaken for a comment.
 */
const TOKEN_RE = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
const stripComments = (text) =>
  text.replace(TOKEN_RE, (m) => (m[0] === "/" ? m.replace(/[^\n]/g, " ") : m));

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** Text of the argument list starting at the "(" at `open`. */
const callArgs = (text, open) => {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")" && --depth === 0) return text.slice(open, i + 1);
  }
  return text.slice(open);
};

const RAW_FETCH_RE = /(?:\b(?:window|globalThis|self)\.|(?<![\w$.]))fetch\s*\(/g;
const ESRI_REQUEST_RE = /(?<![\w.$])esriRequest\s*\(/g;
/** `timeout: x`, or shorthand `{ timeout }` / `{ timeout, … }`. */
const TIMEOUT_OPTION_RE = /\btimeout\s*[:,}]/;

const violations = [];
for (const file of walk(srcDir).filter(isSource)) {
  const rel = relative(srcDir, file);
  const text = stripComments(readFileSync(file, "utf8"));

  if (rel !== HTTP_HELPER) {
    for (const m of text.matchAll(RAW_FETCH_RE)) {
      violations.push(`${rel}:${lineOf(text, m.index)} raw fetch( — use shared/agri-http`);
    }
  }
  for (const m of text.matchAll(ESRI_REQUEST_RE)) {
    const args = callArgs(text, m.index + m[0].length - 1);
    if (!TIMEOUT_OPTION_RE.test(args)) {
      violations.push(`${rel}:${lineOf(text, m.index)} esriRequest( without timeout`);
    }
  }
}

if (violations.length) {
  console.error(violations.map((v) => v.split(sep).join("/")).join("\n"));
  console.error(`\nNETWORK TIMEOUT CHECK FAILED: ${violations.length} violation(s)`);
  process.exit(1);
}
console.log("NETWORK TIMEOUT CHECK PASSED");
