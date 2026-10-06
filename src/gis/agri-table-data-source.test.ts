const userState: { groups: { id: string }[] } = { groups: [] };

jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): { user: { groups: { id: string }[] } | null } => ({
      user: { groups: userState.groups },
    }),
  }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no layer")),
}));

import { setAccessConfig } from "../shared/agri-access-config";
import {
  agriTableUniqueIdSampleWhere,
  queryAgriUniqueIdsForWhere,
} from "./agri-table-data-source";

describe("agri table uniqueid access", () => {
  test("sample where is fail-closed before setAccessConfig", () => {
    jest.isolateModules(() => {
      const fresh = require("./agri-table-data-source") as typeof import("./agri-table-data-source");
      expect(fresh.agriTableUniqueIdSampleWhere()).toBe(
        "(1=0) AND (uniqueid IS NOT NULL)",
      );
    });
  });

  test("uniqueid mirror query stays off and does not load a layer", async () => {
    await expect(queryAgriUniqueIdsForWhere("1=1")).resolves.toEqual([]);
  });

  test("empty config sample where is only the field predicate", () => {
    setAccessConfig({ fullAccessGroups: [], rules: [] });
    expect(agriTableUniqueIdSampleWhere()).toBe("uniqueid IS NOT NULL");
  });

  test("restricted sample where keeps the viloyat lock", () => {
    userState.groups = [{ id: "g1" }];
    setAccessConfig({
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
    });
    const where = agriTableUniqueIdSampleWhere();
    expect(where).toContain("uniqueid IS NOT NULL");
    expect(where).toContain("Toshkent viloyati");
  });
});
