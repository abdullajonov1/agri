const queries: any[] = [];
const tableQueries: any[] = [];
const mockTable = {
  objectIdField: "objectid",
  fields: [
    ["viloyat", "string"],
    ["tuman", "string"],
    ["f_name", "string"],
    ["f_inn", "string"],
    ["turi", "string"],
    ["yld", "double"],
    ["yil", "string"],
    ["maydon", "double"],
  ].map(([name, type]) => ({ name, type })),
  createQuery: () => ({}),
  queryFeatures: async (q: any) => {
    tableQueries.push(q);
    if (q.start > 0) return { features: [] };
    return {
      features: [
        {
          attributes: {
            f_name: "Asal",
            f_inn: "205376243",
            turi: "Bug'doy",
            avg_y: 61.594,
          },
        },
      ],
    };
  },
};
const mockCropPlan = {
  objectIdField: "objectid",
  fields: [
    ["region", "string"],
    ["district", "string"],
    ["region_id", "double"],
    ["distrct_id", "double"],
    ["full_name", "string"],
    ["inn", "string"],
    ["plant_name", "string"],
    ["areaha", "double"],
    ["year", "double"],
  ].map(([name, type]) => ({ name, type })),
  createQuery: () => ({}),
  queryFeatures: async (q: any) => {
    queries.push(q);
    if (q.start > 0) return { features: [] };
    // Probe: year × plant_name
    if (
      Array.isArray(q.groupByFieldsForStatistics) &&
      q.groupByFieldsForStatistics.includes("year") &&
      q.groupByFieldsForStatistics.includes("plant_name") &&
      String(q.where) === "1=1"
    ) {
      return {
        features: [
          { attributes: { year: 2024, plant_name: "Bug'doy", cnt: 10 } },
          { attributes: { year: 2025, plant_name: "Paxta", cnt: 20 } },
        ],
      };
    }
    const base = { region: "Qashqadaryo viloyati", district: "Chiroqchi tumani" };
    return {
      features: [
        {
          attributes: {
            ...base,
            full_name: "Asal",
            inn: "205376243",
            plant_name: "Makkajo'xori",
            sum_m: 2.99,
          },
        },
        {
          attributes: {
            ...base,
            full_name: "Asal",
            inn: "205376243",
            plant_name: "Wheat",
            sum_m: 1.6,
          },
        },
        {
          attributes: {
            ...base,
            full_name: "Bobur",
            inn: "301",
            plant_name: "Paxta",
            sum_m: 0,
          },
        },
      ],
    };
  },
};

jest.mock("../../../../../../gis/agri-crop-plan-data-source", () => ({
  getAgriCropPlanLayer: async () => ({ layer: mockCropPlan }),
}));
jest.mock("../../../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: async () => ({ layer: mockTable }),
  queryAgriRegionDistrictMappings: async () => [],
  queryAgriTuriCropMappings: async () => [],
}));
jest.mock("../../../../../../shared/agri-access-config", () => ({
  combineAccessWhereIfFieldsExist: (where: string) => where,
}));
jest.mock("../../../../../../gis/agri-reserve-land-data-source", () => ({
  getAgriReserveLandLayer: async () => ({ layer: mockCropPlan }),
}));
jest.mock("../../../../../../gis/agri-unused-land-data-source", () => ({
  getAgriUnusedLandLayer: async () => ({ layer: mockCropPlan }),
}));

import { queryFarmerRows } from "./query-stats";
import { fillFermerWorkbook } from "./fill-fermer-workbook";
import { loadXlsxPopulate } from "../../../../../../vendor/xlsx-populate-shim";

const scope = { yil: "2025", viloyat: "Qashqadaryo viloyati", tuman: "Chiroqchi tumani" };

describe("Fermer report (agri_crop)", () => {
  beforeEach(() => {
    queries.length = 0;
    tableQueries.length = 0;
    jest.spyOn(console, "info").mockImplementation(() => undefined);
  });

  test("no tuman → no query, no rows", async () => {
    expect(await queryFarmerRows({ yil: "2025", viloyat: "Qashqadaryo viloyati" })).toEqual([]);
    expect(queries.filter((q) => q.start === 0 && /areaha|sum_m/.test(JSON.stringify(q.outStatistics || [])))).toHaveLength(0);
  });

  test("groups by farmer × plant_name; yld average from Agri_table_data", async () => {
    const rows = await queryFarmerRows(scope);
    const dataQ = queries.find(
      (q) =>
        Array.isArray(q.outStatistics) &&
        q.outStatistics[0]?.statisticType === "sum" &&
        q.groupByFieldsForStatistics?.includes("full_name"),
    );
    expect(dataQ.where).toMatch(/year\s*=\s*2025/);
    expect(dataQ.where).toContain("region=");
    expect(dataQ.where).toMatch(/district/);
    expect(dataQ.groupByFieldsForStatistics).toEqual([
      "region",
      "district",
      "full_name",
      "inn",
      "plant_name",
    ]);
    expect(tableQueries[0].where).toMatch(/yld > 0/);
    expect(tableQueries[0].outStatistics[0].statisticType).toBe("avg");

    expect(rows.map((r) => [r.name, r.turi, r.maydon, r.hosildorlik])).toEqual([
      ["Asal", "Makkajo'xori", 2.99, 0],
      ["Asal", "Wheat", 1.6, 61.594],
    ]);
  });

  test("fills template rows with row-2 style", async () => {
    const rows = await queryFarmerRows(scope);
    const many = Array.from({ length: 12 }, (_, i) => ({ ...rows[i % 2] }));
    const { filename, buffer } = await fillFermerWorkbook(scope, many);
    expect(filename).toBe("Fermer_xisobot_Chiroqchi tumani_2025.xlsx");

    const X = await loadXlsxPopulate();
    const wb: any = await X.fromDataAsync(new Uint8Array(buffer));
    const sh = wb.sheets()[0];
    expect(sh.cell("B1").value()).toBe("Hudud");
    expect(sh.cell("A2").value()).toBe(1);
    expect(sh.cell("C2").value()).toBe("Chiroqchi tumani");
    expect(sh.cell("E2").value()).toBe(205376243);
    expect(sh.cell("F2").value()).toBe("Makkajo'xori");
    expect(sh.cell("G2").value()).toBe(0);
    expect(sh.cell("F3").value()).toBe("Bug'doy");
    expect(sh.cell("G3").value()).toBe(61.59);
    expect(sh.cell("A13").value()).toBe(12);
    expect(sh.cell("H13").value()).toBe(1.6);
    expect(sh.cell("A14").value()).toBeUndefined();
    expect(sh.cell("H13")._node.attributes.s).toBe(sh.cell("H2")._node.attributes.s);
  });

  test("English crop names become Uzbek Latin in Excel", async () => {
    const { buffer } = await fillFermerWorkbook(scope, [
      {
        viloyat: "Qashqadaryo viloyati",
        tuman: "Chiroqchi tumani",
        name: "Asal",
        inn: "205376243",
        turi: "Cotton",
        hosildorlik: 0,
        maydon: 1,
      },
    ]);
    const X = await loadXlsxPopulate();
    const sh: any = (await X.fromDataAsync(new Uint8Array(buffer))).sheets()[0];
    expect(sh.cell("F2").value()).toBe("Paxta");
  });

  test("short list clears template sample rows", async () => {
    const rows = await queryFarmerRows(scope);
    const { buffer } = await fillFermerWorkbook(scope, rows.slice(0, 1));
    const X = await loadXlsxPopulate();
    const sh: any = (await X.fromDataAsync(new Uint8Array(buffer))).sheets()[0];
    expect(sh.cell("D2").value()).toBe("Asal");
    expect(sh.cell("D3").value()).toBeUndefined();
    expect(sh.cell("H4").value()).toBeUndefined();
  });
});
