const mockGroup = jest.fn();
jest.mock("../../../data/agri-stats-store", () => ({
  getRegionGroupFeaturesCached: (o: unknown): Promise<unknown[]> => mockGroup(o) as Promise<unknown[]>,
}));
const mockLayer = {
  fields: [
    { name: "yil", type: "string" },
    { name: "viloyat", type: "string" },
    { name: "turi", type: "string" },
  ],
};
jest.mock("../../../gis/agri-reserve-land-data-source", () => ({
  getAgriReserveLandLayer: async (): Promise<unknown> => ({ layer: mockLayer }),
  getAgriReserveLandUrl: (): string => "reserve-url",
}));
jest.mock("../../../gis/agri-unused-land-data-source", () => ({
  getAgriUnusedLandUrl: (): string => "unused-url",
}));
const mockMappings = jest.fn();
jest.mock("../../../gis/agri-table-data-source", () => ({
  queryAgriTuriCropMappings: (): Promise<unknown[]> => mockMappings() as Promise<unknown[]>,
}));
jest.mock("jimu-arcgis", () => ({ loadArcGISJSAPIModules: jest.fn() }));
jest.mock("../../../shared/agri-access-config", () => ({
  ...jest.requireActual("../../../shared/agri-access-config"),
  combineAccessWhereIfFieldsExist: (where: string): string => where,
}));

import { buildReserveCropWhere, queryReserveCropRows, toReserveCropRows } from "./reserve-crop-data";

const row = (turi: unknown, crop_id: unknown, sum_m: unknown): { attributes: Record<string, unknown> } => ({
  attributes: { turi, crop_id, sum_m },
});

const SCOPE = { yil: "2026", viloyat: "", tuman: "", lockedViloyat: "" };

describe("toReserveCropRows", () => {
  it("drops a summary (total) row stored next to the crops", () => {
    const rows = toReserveCropRows(
      [
        row("Jami", "", 100),
        row("Zaxira yer", "", 300),
        row("Paxta", "10", 60),
        row("Всего", "", 100),
      ],
      new Map(),
    );
    expect(rows.map(({ crop, maydon }) => ({ crop, maydon }))).toEqual([{ crop: "Paxta", maydon: 60 }]);
  });

  it("merges spellings of one crop, sorted by area", () => {
    const rows = toReserveCropRows(
      [row("Paxta", "10", 5), row("Bug'doy", "6", 10), row("paxta", "10", 7)],
      new Map(),
    );
    expect(rows.map((r) => r.maydon)).toEqual([12, 10]);
    expect(rows[0].crop).toBe("Paxta");
  });

  it("resolves empty or numeric turi through crop_id", () => {
    const names = new Map([["10", "Paxta"], ["6", "Bug'doy"]]);
    const rows = toReserveCropRows([row("", "10", 5), row("6", "", 3)], names);
    expect(rows.map((r) => r.crop)).toEqual(["Paxta", "Bug'doy"]);
  });

  it("keeps unresolved rows under Boshqa and drops zero areas", () => {
    const rows = toReserveCropRows([row("", "99", 5), row("Paxta", "10", 0), row("Paxta", "10", null)], new Map());
    expect(rows.map(({ crop, maydon }) => ({ crop, maydon }))).toEqual([{ crop: "Boshqa", maydon: 5 }]);
  });
});

describe("queryReserveCropRows", () => {
  beforeEach(() => {
    mockGroup.mockReset();
    mockMappings.mockReset();
  });

  it("groups Agri_reserve_land by crop, summing maydon", async () => {
    mockGroup.mockResolvedValue([row("Paxta", "10", 5)]);
    await expect(queryReserveCropRows(SCOPE)).resolves.toMatchObject([{ crop: "Paxta", maydon: 5 }]);
    const opts = mockGroup.mock.calls[0][0] as Record<string, unknown>;
    expect(opts).toMatchObject({
      layer: mockLayer,
      groupField: "turi",
      codeField: "crop_id",
      statMode: "sum",
      areaField: "maydon",
    });
    expect(opts.where).toContain("yil LIKE '2026%'");
    expect(mockMappings).not.toHaveBeenCalled();
  });

  it("loads crop names only when a row needs them, and survives their failure", async () => {
    mockGroup.mockResolvedValue([row("", "10", 5)]);
    mockMappings.mockRejectedValue(new Error("down"));
    await expect(queryReserveCropRows(SCOPE)).resolves.toMatchObject([{ crop: "Boshqa", maydon: 5 }]);
    expect(mockMappings).toHaveBeenCalledTimes(1);
  });

  it("does not query without a year", async () => {
    await expect(queryReserveCropRows({ ...SCOPE, yil: "" })).resolves.toEqual([]);
    expect(mockGroup).not.toHaveBeenCalled();
  });
});

describe("reserve crop map filter", () => {
  const layer = {
    fields: [
      { name: "Turi", type: "string" },
      { name: "crop_id", type: "integer" },
    ],
  } as unknown as __esri.FeatureLayer;

  it("remembers every raw spelling and crop_id a merged row came from", () => {
    const names = new Map([["10", "Paxta"]]);
    const [paxta] = toReserveCropRows(
      [row("Paxta", "10", 5), row("paxta", "10", 7), row("", "10", 1), row("Paxta", "10", 2)],
      names,
    );
    expect(paxta.match).toEqual({ turi: ["Paxta", "paxta"], cropIds: ["10"], blank: false });
  });

  it("builds a WHERE with the layer's own field names and quoting", () => {
    expect(buildReserveCropWhere(layer, { turi: ["Bug'doy"], cropIds: [], blank: false })).toBe(
      "Turi IN ('Bug''doy')",
    );
    expect(buildReserveCropWhere(layer, { turi: ["Paxta"], cropIds: ["10"], blank: false })).toBe(
      "(Turi IN ('Paxta') OR crop_id IN (10))",
    );
    expect(buildReserveCropWhere(layer, { turi: [], cropIds: ["x1"], blank: false })).toBe("");
    expect(buildReserveCropWhere(layer, { turi: [], cropIds: [], blank: true })).toBe(
      "(Turi IS NULL OR Turi = '')",
    );
  });

  it("attaches the WHERE to each queried row", async () => {
    mockGroup.mockResolvedValue([row("Paxta", "10", 5)]);
    const [paxta] = await queryReserveCropRows(SCOPE);
    expect(paxta.where).toBe("turi IN ('Paxta')");
  });
});

describe("live Agri_reserve_land rows (2026-11-03)", () => {
  const LIVE: Array<[string, string, number]> = [
    ["Zaxira yer", "0", 876733.04],
    ["Zahira yer", " ", 451704.346],
    ["Zaxira yeri", " ", 70068.273],
    ["Paxta", "10", 33859.972],
    ["Bug'doy", "6", 24841.073],
    ["Bug‘doy", "6", 20216.322],
    ["Beda", "3", 3702.251],
    ["Makka", "8", 2935.501],
    ["Sholi", "13", 2793.575],
    ["Mosh", "9", 949.479],
    ["Poliz ekinlari", "26", 680.888],
    ["Kartoshka", "16", 487.604],
    ["Noxot", "18", 409.121],
    ["tariq", "21", 161.768],
    ["Piyoz", "19", 91.105],
    ["Yeryong'oq", "22", 7.022],
    ["Kungaboqar", "17", 3.044],
    ["Sabzi", "12", 1.175],
    ["Sarimsoqpiyoz", "29", 0.124],
  ];
  const rows = toReserveCropRows(LIVE.map(([t, c, m]) => row(t, c, m)), new Map());

  it("drops every spelling of the uncropped reserve row and keeps all 15 crops", () => {
    expect(rows.map((r) => r.crop)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^Za[xh]ira/i)]),
    );
    expect(rows).toHaveLength(15);
    // Both apostrophe spellings of wheat are one bar, and both go to the map filter.
    const wheat = rows.find((r) => r.crop.startsWith("Bug"));
    expect(wheat?.maydon).toBeCloseTo(45057.395, 3);
    expect(wheat?.match.turi).toEqual(["Bug'doy", "Bug‘doy"]);
  });

  it("has a translation for every crop in every language", () => {
    const { getCropDisplayName } = jest.requireActual("../../../shared/agri-crop-labels") as
      typeof import("../../../shared/agri-crop-labels");
    const untranslated = rows
      .filter((r) => getCropDisplayName(r.crop, "ru") === r.crop || getCropDisplayName(r.crop, "en") === r.crop)
      .map((r) => r.crop);
    expect(untranslated).toEqual([]);
    expect(getCropDisplayName("Noxot", "uz_cyr")).toBe("Нўхат");
    expect(getCropDisplayName("tariq", "uz_lat")).toBe("Tariq");
    expect(getCropDisplayName("Sarimsoqpiyoz", "ru")).toBe("Чеснок");
  });
});
