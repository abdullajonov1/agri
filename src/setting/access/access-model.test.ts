import {
  buildRuleFromForm,
  cloneAccessConfig,
  getConfigGroupIds,
  getInitialAccessConfig,
  makeGlobalGroupKey,
  makeGroupKey,
  normalizeLoadedConfig,
  normalizeOperator,
  type RuleFormValues,
} from "./access-model";

const emptyForm: RuleFormValues = {
  operator: "equal",
  value: "",
  from: "",
  to: "",
  values: [],
};

describe("access-model", () => {
  test("normalizeOperator maps aliases and falls back to equal", () => {
    expect(normalizeOperator("eq")).toBe("equal");
    expect(normalizeOperator("between")).toBe("range");
    expect(normalizeOperator("in")).toBe("include");
    expect(normalizeOperator("like")).toBe("like");
    expect(normalizeOperator("???")).toBe("equal");
    expect(normalizeOperator(undefined)).toBe("equal");
  });

  test("normalizeLoadedConfig stringifies lists and fills ids", () => {
    const result = normalizeLoadedConfig({
      fullAccessGroups: [1, "g2"],
      rules: [
        {
          title: "Region",
          field: "viloyat",
          rules: [{ id: "r1", operator: "in", values: [10], groups: ["g"] }],
        },
      ],
    });
    expect(result.fullAccessGroups).toEqual(["1", "g2"]);
    expect(result.rules[0].id).toEqual(expect.any(String));
    expect(result.rules[0].id.length).toBeGreaterThan(0);
    expect(result.rules[0].rules[0]).toEqual({
      id: "r1",
      operator: "include",
      value: undefined,
      from: undefined,
      to: undefined,
      values: ["10"],
      groups: ["g"],
    });
  });

  test("normalizeLoadedConfig tolerates missing / non-object data", () => {
    expect(normalizeLoadedConfig(undefined)).toEqual({ fullAccessGroups: [], rules: [] });
    expect(normalizeLoadedConfig("x")).toEqual({ fullAccessGroups: [], rules: [] });
    const noRules = normalizeLoadedConfig({ rules: [{ id: "f", rules: "bad" }] });
    expect(noRules.rules[0]).toEqual({ id: "f", title: "", field: "", rules: [] });
  });

  test("cloneAccessConfig returns a deep copy", () => {
    const original = { fullAccessGroups: ["a"], rules: [] };
    const copy = cloneAccessConfig(original);
    expect(copy).toEqual(original);
    expect(copy.fullAccessGroups).not.toBe(original.fullAccessGroups);
  });

  test("getInitialAccessConfig reads immutable or plain stored config", () => {
    expect(getInitialAccessConfig(undefined)).toEqual({ fullAccessGroups: [], rules: [] });
    const stored = { fullAccessGroups: ["x"], rules: [] };
    expect(getInitialAccessConfig({ accessConfig: stored })).toEqual(stored);
    const immutable = { asMutable: () => ({ fullAccessGroups: ["y"], rules: [] }) };
    expect(getInitialAccessConfig({ accessConfig: immutable }).fullAccessGroups).toEqual(["y"]);
  });

  test("getConfigGroupIds collects unique sorted ids", () => {
    const ids = getConfigGroupIds({
      fullAccessGroups: ["b", "a"],
      rules: [
        {
          id: "f",
          title: "",
          field: "x",
          rules: [{ id: "r", operator: "equal", value: "1", groups: ["c", "a"] }],
        },
      ],
    });
    expect(ids).toEqual(["a", "b", "c"]);
  });

  test("group keys are stable strings", () => {
    expect(makeGroupKey("r1", 2)).toBe("r1_2");
    expect(makeGlobalGroupKey(3)).toBe("global_3");
  });

  test("buildRuleFromForm validates and trims per operator", () => {
    expect(buildRuleFromForm(emptyForm)).toBeNull();
    expect(buildRuleFromForm({ ...emptyForm, value: " 5 " })).toMatchObject({
      operator: "equal",
      value: "5",
      groups: [],
    });
    expect(buildRuleFromForm({ ...emptyForm, operator: "range", from: "1" })).toBeNull();
    expect(
      buildRuleFromForm({ ...emptyForm, operator: "range", from: " 1", to: "9 " })
    ).toMatchObject({ operator: "range", from: "1", to: "9" });
    expect(buildRuleFromForm({ ...emptyForm, operator: "include", values: [" ", ""] })).toBeNull();
    expect(
      buildRuleFromForm({ ...emptyForm, operator: "include", values: [" a ", "", "b"] })
    ).toMatchObject({ operator: "include", values: ["a", "b"] });
    expect(buildRuleFromForm({ ...emptyForm, operator: "like", value: " ab" })).toMatchObject({
      operator: "like",
      value: "ab",
    });
    expect(buildRuleFromForm({ ...emptyForm, operator: "like" })).toBeNull();
  });
});
