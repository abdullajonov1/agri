/**
 * Smoke asserts against the REAL production helpers in src/data/agri-sql.ts
 * (transpiled in-process). Run from widget root:
 *   node scripts/smoke-sql-helpers.mjs
 *
 * Covers F-05 / F-12 (agri-sql) without requiring the ExB jest harness.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetRoot = path.resolve(__dirname, "..");
const agriSqlPath = path.join(widgetRoot, "src", "data", "agri-sql.ts");
// agri-main → widgets → your-extensions → client
const clientRoot = path.resolve(widgetRoot, "..", "..", "..");
const require = createRequire(path.join(clientRoot, "package.json"));
const ts = require("typescript");

const source = fs.readFileSync(agriSqlPath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: "agri-sql.ts",
});

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agri-sql-smoke-"));
const tmpFile = path.join(tmpDir, "agri-sql.mjs");
fs.writeFileSync(tmpFile, outputText, "utf8");

const mod = await import(pathToFileURL(tmpFile).href);
const {
  escapeLikeLiteral,
  dateEqualsClause,
  escapeArcGIS,
  sanitizeLikeInput,
  normalizeApos,
  normalizeAposKey,
  isExactArcGisYmd,
  eqAposSmart,
  buildTumanEqualsSql,
} = mod;

assert.equal(typeof escapeLikeLiteral, "function");
assert.equal(typeof dateEqualsClause, "function");
assert.equal(typeof escapeArcGIS, "function");
assert.equal(typeof sanitizeLikeInput, "function");
assert.equal(typeof normalizeApos, "function");
assert.equal(typeof eqAposSmart, "function");
assert.equal(typeof buildTumanEqualsSql, "function");

assert.equal(escapeLikeLiteral("%"), "");
assert.equal(escapeLikeLiteral("_"), "");
assert.equal(escapeLikeLiteral("a'b"), "a''b");
assert.equal(escapeLikeLiteral("100%x"), "100x");
assert.equal(escapeLikeLiteral("2024"), "2024");

const yearLike = `yil LIKE '${escapeLikeLiteral("2024")}%'`;
assert.ok(!yearLike.includes("ESCAPE"));
assert.equal(yearLike, "yil LIKE '2024%'");

assert.equal(
  dateEqualsClause("raster_date", "2024-01-01"),
  "raster_date >= DATE '2024-01-01' AND raster_date < DATE '2024-01-02'",
);
assert.equal(dateEqualsClause("raster_date", "2024-01-01' OR '1'='1"), "1=0");
assert.equal(dateEqualsClause("raster_date;drop", "2024-01-01"), "1=0");

// normalizeApos — Yakkabog‘ (U+2018) and modifier letter apostrophes
assert.equal(normalizeApos("Yakkabog\u2018"), "Yakkabog'");
assert.equal(normalizeApos("Farg\u02BBona"), "Farg'ona");
assert.equal(normalizeApos("  trim  "), "  trim  "); // no trim in shared helper
assert.equal(normalizeAposKey("  Farg\u02BBona  "), "Farg'ona");
assert.equal(isExactArcGisYmd("2024-01-01"), true);
assert.equal(isExactArcGisYmd("2024-01-01' OR '1'='1"), false);
assert.equal(isExactArcGisYmd("2024-1-1"), false);

assert.equal(eqAposSmart("viloyat", ""), "");
assert.equal(eqAposSmart("viloyat", "Toshkent"), "viloyat='Toshkent'");
assert.ok(eqAposSmart("viloyat", "Farg'ona").includes(" OR "));

const tumanSql = buildTumanEqualsSql("tuman", "Yakkabog'");
assert.ok(tumanSql.includes("tuman="));
assert.ok(!tumanSql.includes("ESCAPE"));
// Must stay compact — no cartesian apostrophe × suffix explosion
assert.ok(tumanSql.length < 800, `tuman SQL too large: ${tumanSql.length}`);

function transpileRel(rel, outName) {
  const srcPath = path.join(widgetRoot, "src", ...rel.split("/"));
  const source = fs.readFileSync(srcPath, "utf8");
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: path.basename(srcPath),
  });
  const sqlHref = JSON.stringify(pathToFileURL(tmpFile).href);
  const whereHref = JSON.stringify(
    pathToFileURL(path.join(tmpDir, "agri-where-builder.mjs")).href,
  );
  const vhHref = JSON.stringify(
    pathToFileURL(path.join(tmpDir, "vh-constants.mjs")).href,
  );
  outputText = outputText
    .replace(/from\s+["'](?:\.\.\/)+data\/agri-sql["']/g, `from ${sqlHref}`)
    .replace(
      /from\s+["'](?:\.\.\/)+controller\/agri-where-builder["']/g,
      `from ${whereHref}`,
    )
    .replace(/from\s+["']\.\/vh-constants["']/g, `from ${vhHref}`);
  const out = path.join(tmpDir, outName);
  fs.writeFileSync(out, outputText, "utf8");
  return out;
}

fs.writeFileSync(
  path.join(tmpDir, "vh-constants.mjs"),
  "export const VH_TO_NDVI_STATUS = {};\n",
  "utf8",
);
fs.writeFileSync(
  path.join(tmpDir, "agri-where-builder.mjs"),
  "export const extractYearDigits = () => '';\n",
  "utf8",
);
const whereOut = transpileRel(
  "filter/localization/map-where-clauses.ts",
  "map-where-clauses.mjs",
);
const whereMod = await import(pathToFileURL(whereOut).href);
assert.equal(
  whereMod.buildTableDateEqualsWhere("ndvi_date", "2024-01-01"),
  "ndvi_date = '2024-01-01'",
);
assert.equal(
  whereMod.buildTableDateEqualsWhere("ndvi_date", "2024-01-01' OR '1'='1"),
  null,
);
assert.equal(whereMod.buildTableDateEqualsWhere("ndvi_date", "2024-1-1"), null);
assert.equal(whereMod.buildTableDateEqualsWhere("", "2024-01-01"), null);

const vhWhere = (vhUniqueIds) =>
  whereMod.assembleLocalizationWhere({
    yearClause: "yil LIKE '2026%'",
    includeViloyat: true,
    viloyatClause: "region = '1724'",
    includeTuman: true,
    tumanClause: "district = '1724216'",
    includeTuri: true,
    cropClause: "turi='Paxta'",
    includeVh: true,
    vhCategory: "3-O'rta",
    vhUniqueIds,
    uniqueIdClause: "",
    buildSpatialJoinWhere: (ids) =>
      ids.length ? `uniqueid IN ('${ids[0]}')` : "1=0",
    withAccessWhere: (where) => where,
  });
assert.equal(
  vhWhere(null),
  "yil LIKE '2026%' AND region = '1724' AND district = '1724216' AND turi='Paxta'",
);
assert.equal(vhWhere([]), "1=0");
assert.ok(vhWhere(["abc"]).includes("uniqueid IN ('abc')"));

try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch {
  /* ignore */
}

console.log("smoke-sql-helpers: OK (bound to src/data/agri-sql.ts)");
console.log("widgetRoot:", widgetRoot);
