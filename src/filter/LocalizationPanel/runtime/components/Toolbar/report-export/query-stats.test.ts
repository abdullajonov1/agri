type Feature = { attributes: Record<string, unknown> };

function fakeLayer(
  fields: Array<[string, string]>,
  respond: (q: any) => Feature[],
) {
  const queries: any[] = [];
  return {
    queries,
    layer: {
      objectIdField: "objectid",
      fields: fields.map(([name, type]) => ({ name, type })),
      createQuery: () => ({}),
      queryFeatures: async (q: any) => {
        queries.push(q);
        return { features: respond(q) };
      },
    },
  };
}

const mockMappings = [
  { viloyat: "Jizzax viloyati", region: 8, tuman: "Zomin tumani", district: 801, count: 1 },
  { viloyat: "Sirdaryo viloyati", region: 24, tuman: "Shirin", district: 2401, count: 1 },
];

const mockTable = fakeLayer(
  [
    ["viloyat", "string"],
    ["region", "integer"],
    ["tuman", "string"],
    ["district", "integer"],
    ["turi", "string"],
    ["maydon", "double"],
    ["yil", "string"],
    ["land_type", "string"],
  ],
  () => [
    {
      attributes: {
        viloyat: "Jizzax viloyati",
        region: 8,
        land_type: "Asosiy",
        sum_m: 95,
      },
    },
    {
      attributes: {
        viloyat: "Jizzax viloyati",
        region: 8,
        land_type: "Lalmi",
        sum_m: 84,
      },
    },
  ],
);

const mockReserve = fakeLayer(
  [
    ["region", "integer"],
    ["district", "integer"],
    ["turi", "string"],
    ["crop_id", "string"],
    ["maydon", "double"],
    ["yil", "integer"],
  ],
  (q) => {
    // Distinct turi/crop_id map probe (where 1=1, no maydon sum)
    if (String(q.where) === "1=1") {
      return [
        { attributes: { turi: "Makkajo'xori", crop_id: "3", cnt: 1 } },
        { attributes: { turi: "Bug'doy", crop_id: "6", cnt: 1 } },
      ];
    }
    return [
      {
        attributes: {
          region: 24,
          turi: "Makkajo'xori",
          crop_id: "3",
          cnt: 2,
          sum_m: 3,
        },
      },
      // turi empty — resolve via crop_id 6 → bugdoy
      {
        attributes: {
          region: 24,
          turi: "",
          crop_id: "6",
          cnt: 5,
          sum_m: 10,
        },
      },
      // turi is numeric crop_id
      {
        attributes: {
          region: 24,
          turi: "6",
          crop_id: "",
          cnt: 1,
          sum_m: 4,
        },
      },
    ];
  },
);

jest.mock("../../../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: async () => ({ layer: mockTable.layer }),
  queryAgriRegionDistrictMappings: async () => mockMappings,
  queryAgriTuriCropMappings: async () => [
    { turi: "Bug'doy", cropId: "6" },
    { turi: "Paxta", cropId: "1" },
    { turi: "Makkajo'xori", cropId: "3" },
  ],
}));
jest.mock("../../../../../../shared/agri-access-config", () => ({
  combineAccessWhereIfFieldsExist: (where: string) => where,
}));
jest.mock("../../../../../../gis/agri-reserve-land-data-source", () => ({
  getAgriReserveLandLayer: async () => ({ layer: mockReserve.layer }),
}));
jest.mock("../../../../../../gis/agri-unused-land-data-source", () => ({
  getAgroUnusedLandLayer: async () => ({ layer: mockReserve.layer }),
  getAgriUnusedLandLayer: async () => ({ layer: mockReserve.layer }),
}));

const mockCropPlan = fakeLayer(
  [
    ["region", "string"],
    ["district", "string"],
    ["region_id", "double"],
    ["distrct_id", "double"],
    ["plant_name", "string"],
    ["areaha", "double"],
    ["year", "double"],
    ["full_name", "string"],
    ["inn", "string"],
  ],
  (q) => {
    if (String(q.where) === "1=1") {
      return [
        { attributes: { year: 2025, plant_name: "Paxta", cnt: 5 } },
        { attributes: { year: 2025, plant_name: "Bug'doy", cnt: 3 } },
      ];
    }
    return [
      {
        attributes: {
          region: "Jizzax viloyati",
          region_id: 8,
          sum_m: 120,
        },
      },
      {
        attributes: {
          region: "Sirdaryo viloyati",
          region_id: 24,
          sum_m: 45,
        },
      },
    ];
  },
);

jest.mock("../../../../../../gis/agri-crop-plan-data-source", () => ({
  getAgriCropPlanLayer: async () => ({ layer: mockCropPlan.layer }),
}));

import {
  mergeEhtimoliyIntoCrops,
  mergePlanIntoCrops,
  queryGallaAreas,
  queryOzuqaAreas,
  queryPlanAreas,
  queryReserveAreas,
  resolveReserveCropColumn,
  reserveColumnKey,
} from "./query-stats";
import { reportPlaceKey } from "./place-key";

describe("report queries follow the layer schema", () => {
  beforeEach(() => {
    jest.spyOn(console, "info").mockImplementation(() => undefined);
  });

  test("galla splits asosiy / lalmi by land_type", async () => {
    const rows = await queryGallaAreas({ yil: "2026", viloyat: "" });
    expect(rows).toEqual([
      { key: reportPlaceKey("Jizzax"), area: 179, asosiy: 95, lalmi: 84, reja: 0, ehtimoliy: 0 },
    ]);
    const q = mockTable.queries[0];
    expect(q.where).toContain("yil LIKE '2026%'");
    expect(q.groupByFieldsForStatistics).toEqual(
      expect.arrayContaining(["viloyat", "region", "land_type"]),
    );
  });

  test("plan areas use year= and plant_name; group by region name", async () => {
    mockCropPlan.queries.length = 0;
    const rows = await queryPlanAreas({ yil: "2025", viloyat: "" }, ["paxta"]);
    expect(rows).toEqual([
      { key: reportPlaceKey("Jizzax"), area: 120 },
      { key: reportPlaceKey("Sirdaryo"), area: 45 },
    ]);
    const dataQ = mockCropPlan.queries.find((q) =>
      String(q.where || "").includes("year"),
    );
    expect(dataQ.where).toMatch(/year\s*=\s*2025/);
    expect(dataQ.where).toMatch(/plant_name/i);
    expect(dataQ.groupByFieldsForStatistics).toEqual(
      expect.arrayContaining(["region", "region_id"]),
    );
  });

  test("mergePlanIntoCrops attaches reja by place key", () => {
    const merged = mergePlanIntoCrops(
      [{ key: reportPlaceKey("Jizzax"), area: 10, asosiy: 10, lalmi: 0, reja: 0, ehtimoliy: 0 }],
      [{ key: reportPlaceKey("Jizzax"), area: 7 }],
    );
    expect(merged).toEqual([
      { key: reportPlaceKey("Jizzax"), area: 10, asosiy: 10, lalmi: 0, reja: 7, ehtimoliy: 0 },
    ]);
  });

  test("ozuqa query filters turi and merge fills ehtimoliy", async () => {
    mockTable.queries.length = 0;
    await queryOzuqaAreas({ yil: "2026", viloyat: "" });
    expect(mockTable.queries[0].where).toMatch(/ozuqa|Озуқа|Fodder/i);
    const merged = mergeEhtimoliyIntoCrops(
      [{ key: reportPlaceKey("Jizzax"), area: 10, asosiy: 10, lalmi: 0, reja: 0, ehtimoliy: 0 }],
      [{ key: reportPlaceKey("Jizzax"), area: 22, asosiy: 22, lalmi: 0, reja: 0, ehtimoliy: 0 }],
    );
    expect(merged[0].ehtimoliy).toBe(22);
  });

  test("reserve uses turi and falls back to crop_id for Excel columns", async () => {
    mockReserve.queries.length = 0;
    const rows = await queryReserveAreas({ yil: "2026", viloyat: "" });
    expect(rows).toEqual([
      {
        key: reportPlaceKey("Sirdaryo"),
        kontur: 8,
        umumiy: 17,
        byCrop: { makka: 3, bugdoy: 14 },
      },
    ]);
    const dataQuery = mockReserve.queries.find((q) =>
      String(q.where || "").includes("yil"),
    );
    expect(dataQuery.groupByFieldsForStatistics).toEqual([
      "region",
      "turi",
      "crop_id",
    ]);
  });

  test("district scope filters a code-only layer by region code", async () => {
    mockReserve.queries.length = 0;
    await queryReserveAreas({ yil: "2026", viloyat: "Sirdaryo viloyati" });
    const dataQuery = mockReserve.queries.find((q) =>
      String(q.where || "").includes("yil"),
    );
    expect(dataQuery.where).toContain("region = 24");
  });

  test("resolveReserveCropColumn prefers turi, then crop_id map", () => {
    const idMap = new Map([
      ["6", "bugdoy"],
      ["1", "paxta"],
    ]);
    expect(resolveReserveCropColumn("Paxta", "", idMap)).toBe("paxta");
    expect(resolveReserveCropColumn("", "6", idMap)).toBe("bugdoy");
    expect(resolveReserveCropColumn("6", "", idMap)).toBe("bugdoy");
    expect(resolveReserveCropColumn("noma'lum", "99", idMap)).toBe("boshqa");
    expect(reserveColumnKey("Makkajo'xori")).toBe("makka");
  });
});
