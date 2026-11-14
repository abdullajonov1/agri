jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): { user: { groups?: unknown[] } | null } => ({ user: null }),
  }),
}));

import {
  getAccessWhere,
  getAccessWhereHash,
  hashAccessString,
  isAccessDenied,
  onAccessWhereChange,
  resolveAllowedViloyatsForGroups,
  setAccessConfig,
} from "./agri-access-config";

describe("agri-access-config", () => {
  test("is fail-closed until setAccessConfig", () => {
    expect(getAccessWhere()).toBe("1=0");
    expect(isAccessDenied()).toBe(true);
  });

  test("empty config stays public after setAccessConfig", () => {
    setAccessConfig({ fullAccessGroups: [], rules: [] });
    expect(getAccessWhere()).toBe("1=1");
    expect(isAccessDenied()).toBe(false);
  });

  test("keeps a region name that contains a space", () => {
    expect(
      resolveAllowedViloyatsForGroups([{ id: "g1" }], {
        fullAccessGroups: [],
        rules: [
          {
            id: "r1",
            title: "Viloyat",
            field: "viloyat",
            rules: [
              {
                id: "a1",
                operator: "equal",
                value: "Toshkent viloyati",
                groups: ["g1"],
              },
            ],
          },
        ],
      }),
    ).toEqual(["Toshkent viloyati"]);
  });
});

describe("access WHERE change notifications", () => {
  const restricted = {
    fullAccessGroups: [],
    rules: [
      {
        field: "viloyat",
        rules: [{ groups: ["g1"], include: ["Andijon"] }],
      },
    ],
  };

  test("hash is deterministic and differs per WHERE", () => {
    expect(hashAccessString("1=1")).toBe(hashAccessString("1=1"));
    expect(hashAccessString("1=1")).not.toBe(hashAccessString("1=0"));
  });

  test("notifies only when the computed WHERE changes", () => {
    setAccessConfig({ fullAccessGroups: [], rules: [] });
    const listener = jest.fn();
    const off = onAccessWhereChange(listener);
    setAccessConfig({ fullAccessGroups: [], rules: [] });
    expect(listener).not.toHaveBeenCalled();
    const before = getAccessWhereHash();
    setAccessConfig(restricted);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getAccessWhereHash()).not.toBe(before);
    off();
    setAccessConfig({ fullAccessGroups: [], rules: [] });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
