jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): { user: { groups?: unknown[] } | null } => ({ user: null }),
  }),
}));

import {
  getAccessWhere,
  isAccessDenied,
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
