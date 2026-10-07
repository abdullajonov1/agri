let mockGroups: Array<{ id: string }> = [];

jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): { user: { groups: Array<{ id: string }> } } => ({
      user: { groups: mockGroups },
    }),
  }),
}));

import * as access from "./agri-access-config";
import {
  buildAccessRuleWhere,
  combineAccessWhere,
  combineAccessWhereIfFieldsExist,
  escapeAccessLikePattern,
  getAccessWhere,
  isAccessConfigured,
  isAccessDenied,
  normalizeAccessConfig,
  resolveAllowedViloyatsForGroups,
  setAccessConfig,
  summarizeAccessConfigDiff,
  validateAccessConfigImport,
  type AccessConfig,
  type AccessConfigValidationResult,
  type AccessRule,
} from "./agri-access-config";

const errorsOf = (res: AccessConfigValidationResult): string[] =>
  "errors" in res ? res.errors : [];

const rule = (partial: Partial<AccessRule>): AccessRule => ({
  id: "r",
  operator: "equal",
  groups: [],
  ...partial,
});

function viloyatConfig(): AccessConfig {
  return {
    fullAccessGroups: ["admins"],
    rules: [
      {
        id: "f1",
        title: "Viloyat",
        field: "viloyat",
        rules: [
          rule({ id: "a", operator: "equal", value: "Andijon", groups: ["g-and"] }),
          rule({ id: "b", operator: "include", values: ["Buxoro"], groups: ["g-bux"] }),
          rule({ id: "c", operator: "equal", value: "Navoiy", groups: ["g-multi"] }),
          rule({ id: "d", operator: "equal", value: "Xorazm", groups: ["g-multi"] }),
        ],
      },
      {
        id: "f2",
        title: "Year",
        field: "yil",
        rules: [rule({ id: "y", operator: "range", from: "2020", to: "2024", groups: ["g-year"] })],
      },
    ],
  };
}

beforeEach(() => {
  mockGroups = [];
});

describe("buildAccessRuleWhere", () => {
  test("equal quotes strings, passes numbers and booleans", () => {
    expect(buildAccessRuleWhere("viloyat", rule({ value: "Farg'ona" }))).toBe(
      "viloyat = 'Farg''ona'",
    );
    expect(buildAccessRuleWhere("region", rule({ value: " 12 " }))).toBe("region = 12");
    expect(buildAccessRuleWhere("flag", rule({ value: "TRUE" }))).toBe("flag = true");
    expect(buildAccessRuleWhere("n", rule({ value: "-1.5" }))).toBe("n = -1.5");
  });

  test("range, include and like", () => {
    expect(buildAccessRuleWhere("yil", rule({ operator: "range", from: "2020", to: "2024" }))).toBe(
      "yil BETWEEN 2020 AND 2024",
    );
    expect(
      buildAccessRuleWhere("viloyat", rule({ operator: "include", values: ["A", "1", "bad;drop"] })),
    ).toBe("viloyat IN ('A', 1)");
    expect(buildAccessRuleWhere("name", rule({ operator: "like", value: "Tosh" }))).toBe(
      "name LIKE 'Tosh'",
    );
    // '%' is not an allowed token character, so wildcard LIKE rules fail closed.
    expect(buildAccessRuleWhere("name", rule({ operator: "like", value: "Tosh%" }))).toBe("1=0");
  });

  test("fails closed on unsafe field names, values or unknown operator", () => {
    expect(buildAccessRuleWhere("vil oyat", rule({ value: "A" }))).toBe("1=0");
    expect(buildAccessRuleWhere("", rule({ value: "A" }))).toBe("1=0");
    expect(buildAccessRuleWhere("viloyat", rule({ value: "A; DROP TABLE x" }))).toBe("1=0");
    expect(buildAccessRuleWhere("yil", rule({ operator: "range", from: "1", to: "2=2;" }))).toBe("1=0");
    expect(buildAccessRuleWhere("v", rule({ operator: "include", values: [] }))).toBe("1=0");
    expect(buildAccessRuleWhere("v", rule({ operator: "like", value: "a;b" }))).toBe("1=0");
    expect(
      buildAccessRuleWhere("v", rule({ operator: "nope" as unknown as AccessRule["operator"] })),
    ).toBe("1=0");
  });

  test("escapeAccessLikePattern strips LIKE metacharacters", () => {
    expect(escapeAccessLikePattern("a%b_c\\d")).toBe("abcd");
  });
});

describe("normalizeAccessConfig", () => {
  test("non-object -> empty config", () => {
    expect(normalizeAccessConfig(null)).toEqual({ fullAccessGroups: [], rules: [] });
    expect(normalizeAccessConfig("x")).toEqual({ fullAccessGroups: [], rules: [] });
  });

  test("maps legacy operator aliases and stringifies values", () => {
    const cfg = normalizeAccessConfig({
      fullAccessGroups: [1, "a"],
      rules: [
        {
          id: 5,
          field: "yil",
          rules: [
            { operator: "eq", value: 2024, groups: ["g"] },
            { operator: "between", from: 1, to: 2 },
            { operator: "in", values: [1, 2] },
            { operator: "weird" },
            "garbage",
          ],
        },
        "bad-field-rule",
      ],
    });
    expect(cfg.fullAccessGroups).toEqual(["1", "a"]);
    const ops = cfg.rules[0].rules.map((r) => r.operator);
    expect(ops).toEqual(["equal", "range", "include", "equal", "equal"]);
    expect(cfg.rules[0].rules[0].value).toBe("2024");
    expect(cfg.rules[0].rules[2].values).toEqual(["1", "2"]);
    expect(cfg.rules[1]).toEqual({ id: "", title: "", field: "", rules: [] });
  });
});

describe("validateAccessConfigImport", () => {
  test("rejects non-object roots", () => {
    expect(validateAccessConfigImport(null)).toEqual({ ok: false, errors: ["Root must be a JSON object"] });
    expect(validateAccessConfigImport([])).toEqual({ ok: false, errors: ["Root must be a JSON object"] });
  });

  test("rejects unknown keys and wrong shapes", () => {
    const res = validateAccessConfigImport({ extra: 1, fullAccessGroups: "x", rules: {} });
    expect(res.ok).toBe(false);
    expect(errorsOf(res)).toEqual([
      "Unknown top-level key: extra",
      "fullAccessGroups must be an array",
      "rules must be an array",
    ]);
  });

  test("accepts a valid config", () => {
    const res = validateAccessConfigImport(viloyatConfig());
    expect(res.ok).toBe(true);
  });

  test("reports unsafe group ids, field names, values and long titles", () => {
    const res = validateAccessConfigImport({
      fullAccessGroups: ["ok", "bad group!"],
      rules: [
        {
          field: "1bad",
          title: "t".repeat(201),
          rules: [{ operator: "equal", value: "x'; DROP--;", groups: ["bad id"] }],
        },
      ],
    });
    expect(res.ok).toBe(false);
    expect(errorsOf(res)).toEqual(
      expect.arrayContaining([
        "Invalid fullAccess group id: bad group!",
        "Invalid field name: 1bad",
        "Field title too long: 1bad",
        "Invalid rule group id: bad id",
        "Unsafe rule value on 1bad: contains disallowed characters",
      ]),
    );
  });

  test("enforces count limits", () => {
    const manyValues = Array.from({ length: 201 }, (_v, i) => `v${i}`);
    const manyRules = Array.from({ length: 65 }, () => ({ operator: "equal", value: "a" }));
    const manyFields = Array.from({ length: 65 }, () => ({ field: "f", rules: [] }));
    const r1 = validateAccessConfigImport({ rules: [{ field: "f", rules: [{ operator: "in", values: manyValues }] }] });
    const r2 = validateAccessConfigImport({ rules: [{ field: "f", rules: manyRules }] });
    const r3 = validateAccessConfigImport({ rules: manyFields });
    expect(r1.ok).toBe(false);
    expect(errorsOf(r1).some((e) => e.startsWith("Too many include values"))).toBe(true);
    expect(errorsOf(r2).some((e) => e.startsWith("Too many rules on field f"))).toBe(true);
    expect(errorsOf(r3).some((e) => e.startsWith("Too many field rules"))).toBe(true);
  });

  test("reports empty field name", () => {
    const res = validateAccessConfigImport({ rules: [{ field: "", rules: [] }] });
    expect(errorsOf(res)).toEqual(["Invalid field name: (empty)"]);
  });

  // Regression (was a bug): unknown operators were coerced to "equal" before
  // the operator check ran, so a bogus import became an equality rule.
  test("rejects unknown rule operators on import", () => {
    const res = validateAccessConfigImport({
      rules: [{ field: "viloyat", rules: [{ operator: "drop", value: "A", groups: ["g"] }] }],
    });
    expect(res.ok).toBe(false);
  });
});

describe("summarizeAccessConfigDiff", () => {
  test("counts groups, fields and rules", () => {
    const empty: AccessConfig = { fullAccessGroups: [], rules: [] };
    expect(summarizeAccessConfigDiff(empty, viloyatConfig())).toBe(
      "Full-access groups: 0 → 1\nField definitions: 0 → 2\nRules: 0 → 5",
    );
  });
});

describe("resolveAllowedViloyatsForGroups", () => {
  test("full access groups get no restriction list", () => {
    expect(resolveAllowedViloyatsForGroups([{ id: "admins" }], viloyatConfig())).toEqual([]);
  });

  test("collects equal + include values across matching rules", () => {
    expect(
      resolveAllowedViloyatsForGroups([{ id: "g-and" }, { id: "g-bux" }], viloyatConfig()),
    ).toEqual(["Andijon", "Buxoro"]);
  });

  test("ignores non-viloyat fields and other operators", () => {
    expect(resolveAllowedViloyatsForGroups([{ id: "g-year" }], viloyatConfig())).toEqual([]);
  });
});

describe("setAccessConfig computed state", () => {
  test("null config is treated as not provided -> public", () => {
    setAccessConfig(undefined);
    expect(getAccessWhere()).toBe("1=1");
    expect(isAccessConfigured()).toBe(false);
    expect(access.fullAccess).toBe(true);
  });

  test("full access group -> 1=1 and no lock", () => {
    mockGroups = [{ id: "admins" }];
    setAccessConfig(viloyatConfig());
    expect(getAccessWhere()).toBe("1=1");
    expect(isAccessConfigured()).toBe(true);
    expect(access.lockedViloyat).toBe("");
  });

  test("single viloyat group -> equality WHERE and lock", () => {
    mockGroups = [{ id: "g-and" }];
    setAccessConfig(viloyatConfig());
    expect(getAccessWhere()).toBe("viloyat = 'Andijon'");
    expect(access.fullAccess).toBe(false);
    expect(access.lockedViloyat).toBe("Andijon");
  });

  test("single-value include also locks", () => {
    mockGroups = [{ id: "g-bux" }];
    setAccessConfig(viloyatConfig());
    expect(getAccessWhere()).toBe("viloyat IN ('Buxoro')");
    expect(access.lockedViloyat).toBe("Buxoro");
  });

  test("multiple allowed viloyats -> OR clause and no lock", () => {
    mockGroups = [{ id: "g-multi" }];
    setAccessConfig(viloyatConfig());
    expect(getAccessWhere()).toBe("(viloyat = 'Navoiy' OR viloyat = 'Xorazm')");
    expect(access.lockedViloyat).toBe("");
  });

  test("region_id numeric equality is recovered from SQL fallback", () => {
    mockGroups = [{ id: "g" }];
    setAccessConfig({
      fullAccessGroups: [],
      rules: [{ id: "f", title: "", field: "soato", rules: [rule({ value: "1703", groups: ["g"] })] }],
    });
    expect(getAccessWhere()).toBe("soato = 1703");
    expect(access.lockedViloyat).toBe("");
  });

  test("user in no rule group is denied", () => {
    mockGroups = [{ id: "stranger" }];
    setAccessConfig(viloyatConfig());
    expect(isAccessDenied()).toBe(true);
    expect(combineAccessWhere("yil=2024")).toBe("(1=0) AND (yil=2024)");
  });
});

describe("combineAccessWhere / combineAccessWhereIfFieldsExist", () => {
  test("public access returns base (default 1=1)", () => {
    setAccessConfig({ fullAccessGroups: [], rules: [] });
    expect(combineAccessWhere("  ")).toBe("1=1");
    expect(combineAccessWhere("a=1")).toBe("a=1");
    expect(combineAccessWhereIfFieldsExist("a=1", ["viloyat"])).toBe("a=1");
  });

  test("restricted access wraps only when layer has all referenced fields", () => {
    mockGroups = [{ id: "g-and" }];
    setAccessConfig(viloyatConfig());
    expect(combineAccessWhere("a=1")).toBe("(viloyat = 'Andijon') AND (a=1)");
    expect(combineAccessWhereIfFieldsExist("a=1", ["region"])).toBe("a=1");
    expect(combineAccessWhereIfFieldsExist(undefined, [])).toBe("1=1");
  });

  // Regression (was a bug): words inside quoted literals
  // ('Andijon') matched as field names, so string-valued rules returned the
  // UNRESTRICTED base WHERE even when the layer had the viloyat field.
  test("wraps string-valued access rules when the layer has the field", () => {
    mockGroups = [{ id: "g-and" }];
    setAccessConfig(viloyatConfig());
    expect(combineAccessWhereIfFieldsExist("a=1", ["VILOYAT", "a"])).toBe(
      "(viloyat = 'Andijon') AND (a=1)",
    );
  });

  test("SQL keywords and numbers in the clause are not treated as fields", () => {
    mockGroups = [{ id: "g-year" }];
    setAccessConfig(viloyatConfig());
    expect(getAccessWhere()).toBe("yil BETWEEN 2020 AND 2024");
    expect(combineAccessWhereIfFieldsExist("x=1", ["yil"])).toBe(
      "(yil BETWEEN 2020 AND 2024) AND (x=1)",
    );
  });

  test("denied access stays denied regardless of layer fields", () => {
    mockGroups = [];
    setAccessConfig(viloyatConfig());
    expect(combineAccessWhereIfFieldsExist("a=1", ["region"])).toBe("1=0");
  });
});
