import * as ops from "./access-config-ops";
import type { AccessConfig } from "./access-model";

const base = (): AccessConfig => ({
  fullAccessGroups: ["g0", "g1", "g2"],
  rules: [
    {
      id: "f1",
      title: "Region",
      field: "viloyat",
      rules: [
        { id: "r1", operator: "equal", value: "A", groups: ["a", "b"] },
        { id: "r2", operator: "like", value: "B", groups: ["c"] },
      ],
    },
    { id: "f2", title: "Other", field: "x", rules: [] },
  ],
});

describe("access-config-ops", () => {
  test("field operations do not mutate input", () => {
    const config = base();
    const snapshot = JSON.stringify(config);
    const added = ops.addField(config, { id: "f3", title: "t", field: "y", rules: [] });
    expect(added.rules.map((f) => f.id)).toEqual(["f1", "f2", "f3"]);
    const renamed = ops.updateFieldMeta(config, "f2", "New", "z");
    expect(renamed.rules[1]).toMatchObject({ title: "New", field: "z" });
    expect(renamed.rules[0]).toBe(config.rules[0]);
    expect(ops.removeField(config, "f1").rules.map((f) => f.id)).toEqual(["f2"]);
    expect(JSON.stringify(config)).toBe(snapshot);
  });

  test("rule operations", () => {
    const config = base();
    const rule = { id: "r3", operator: "equal" as const, value: "C", groups: [] as string[] };
    expect(ops.addRule(config, "f2", rule).rules[1].rules).toEqual([rule]);

    const replaced = ops.replaceRuleCondition(config, "f1", "r1", {
      id: "new",
      operator: "range",
      from: "1",
      to: "2",
      groups: [],
    });
    expect(replaced.rules[0].rules[0]).toEqual({
      id: "r1",
      operator: "range",
      from: "1",
      to: "2",
      groups: ["a", "b"],
    });

    expect(ops.removeRule(config, "f1", "r1").rules[0].rules.map((r) => r.id)).toEqual(["r2"]);
    expect(ops.removeRules(config, "f1", ["r1", "r2"]).rules[0].rules).toEqual([]);
  });

  test("rule group operations", () => {
    const config = base();
    expect(ops.addRuleGroup(config, "f1", "r2", "d").rules[0].rules[1].groups).toEqual(["c", "d"]);
    expect(ops.updateRuleGroup(config, "f1", "r1", 1, "z").rules[0].rules[0].groups).toEqual([
      "a",
      "z",
    ]);
    expect(ops.removeRuleGroup(config, "f1", "r1", 0).rules[0].rules[0].groups).toEqual(["b"]);
    const byKeys = ops.removeRuleGroupsByKeys(config, "f1", ["r1_1", "r2_0"]);
    expect(byKeys.rules[0].rules[0].groups).toEqual(["a"]);
    expect(byKeys.rules[0].rules[1].groups).toEqual([]);
  });

  test("global group operations", () => {
    const config = base();
    expect(ops.addGlobalGroup(config, "g3").fullAccessGroups).toEqual(["g0", "g1", "g2", "g3"]);
    expect(ops.updateGlobalGroup(config, 1, "x").fullAccessGroups).toEqual(["g0", "x", "g2"]);
    expect(ops.removeGlobalGroup(config, 0).fullAccessGroups).toEqual(["g1", "g2"]);
    expect(
      ops.removeGlobalGroupsByKeys(config, ["global_0", "global_2"]).fullAccessGroups
    ).toEqual(["g1"]);
  });
});
