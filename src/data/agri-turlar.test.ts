import {
  normalizeTurlar,
  normalizeTurlarListSql,
  turlarSourceFromDetail,
} from "./agri-turlar";
import { normalizeApos } from "../shared/agri-sql";

const upper = (s: string) => s.toUpperCase();

describe("normalizeTurlar stringify option", () => {
  test("custom stringify keeps falsy values like 0", () => {
    const stringify = (v: unknown): string => String(v ?? "").trim();
    expect(normalizeTurlar([0, " a ", "a", null], { dedupe: true, stringify })).toEqual(["0", "a"]);
    expect(normalizeTurlar([0])).toEqual([]);
  });
});

describe("normalizeTurlar", () => {
  const cases: Array<[string, unknown, Parameters<typeof normalizeTurlar>[1], string[]]> = [
    ["plain keeps duplicates and drops empties", ["a", "", "b", "a", null], {}, ["a", "b", "a"]],
    ["dedupe", ["a", "b", "a"], { dedupe: true }, ["a", "b"]],
    ["custom normalize then dedupe", ["a", "A", ""], { dedupe: true, normalize: upper }, ["A"]],
    ["normalize drops values that become empty", [" "], { normalize: (s: string) => s.trim() }, []],
    ["apostrophe variants", ["Bug’doy", "Bug'doy", "Bugʻdoy"], { dedupe: true, normalize: normalizeApos },
      Array.from(new Set(["Bug’doy", "Bug'doy", "Bugʻdoy"].map(normalizeApos)))],
    ["single value", "Paxta", {}, ["Paxta"]],
    ["empty value uses fallback", "", { fallback: "Sholi" }, ["Sholi"]],
    ["empty without fallback", undefined, {}, []],
    ["array ignores fallback", ["x"], { fallback: "y" }, ["x"]],
    ["numbers stringified", [1, 0, 2], {}, ["1", "2"]],
  ];
  test.each(cases)("%s", (_n, raw, options, expected) => {
    expect(normalizeTurlar(raw, options)).toEqual(expected);
  });
});

describe("turlarSourceFromDetail", () => {
  test.each([
    [{ turlar: ["a", "b"] }, ["a", "b"]],
    [{ turlar: [], turi: "x" }, []],
    [{ turi: "x" }, ["x"]],
    [{ turlar: "x", turi: "y" }, ["y"]],
    [{}, []],
  ])("%j", (detail, expected) => {
    expect(turlarSourceFromDetail(detail)).toEqual(expected);
  });
});

describe("panel parity", () => {
  test("bar: no dedupe, no apostrophe normalisation", () => {
    const d = { turlar: ["Bug'doy", "Bug'doy", ""] };
    expect(normalizeTurlar(turlarSourceFromDetail(d))).toEqual(["Bug'doy", "Bug'doy"]);
  });
  test("sql: apostrophe normalised and deduped", () => {
    expect(normalizeTurlarListSql(["Bug’doy", "Bug'doy"])).toEqual([normalizeApos("Bug'doy")]);
  });
  test("region: turlar array else single turi, apostrophe normalised, deduped", () => {
    const run = (d: { turlar?: unknown; turi?: unknown }) =>
      normalizeTurlar(turlarSourceFromDetail(d), { dedupe: true, normalize: normalizeApos });
    expect(run({ turlar: ["Bug’doy", "Bug'doy", ""] })).toEqual([normalizeApos("Bug'doy")]);
    expect(run({ turi: "Paxta" })).toEqual(["Paxta"]);
    expect(run({ turlar: [], turi: "Paxta" })).toEqual([]);
    expect(run({})).toEqual([]);
  });
  test("pie: array input, custom normalizer, deduped, empties dropped", () => {
    const normalizeName = (v: string) => v.trim().toLowerCase();
    expect(normalizeTurlar(["A ", "a", " ", "B"], { dedupe: true, normalize: normalizeName })).toEqual(["a", "b"]);
    expect(normalizeTurlar([], { dedupe: true, normalize: normalizeName })).toEqual([]);
  });
  test("sql: single value and fallback", () => {
    expect(normalizeTurlarListSql("Paxta")).toEqual(["Paxta"]);
    expect(normalizeTurlarListSql("", "Sholi")).toEqual(["Sholi"]);
    expect(normalizeTurlarListSql(undefined)).toEqual([]);
    expect(normalizeTurlarListSql(["x"], "y")).toEqual(["x"]);
  });
});
