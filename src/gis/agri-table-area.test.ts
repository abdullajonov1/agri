type Attrs = Record<string, unknown>;
type QueryRecord = Record<string, unknown>;

const layerRef: {
  rows: Attrs[];
  fields: string[];
  executed: QueryRecord[];
  inFlight: number;
  maxInFlight: number;
  fail: boolean;
} = { rows: [], fields: [], executed: [], inFlight: 0, maxInFlight: 0, fail: false };

/** Apply `uniqueid < 'x'` / `uniqueid >= 'x'` slice predicates like the server. */
const inSlice = (where: string, id: unknown): boolean => {
  const value = String(id ?? "");
  for (const m of where.matchAll(/uniqueid (<|>=) '([^']*)'/g)) {
    if (m[1] === "<" ? !(value < m[2]) : !(value >= m[2])) return false;
  }
  return true;
};

jest.mock("../shared/agri-singleton-layer-loader", () => ({
  createSingletonLayerLoader: () => () =>
    Promise.resolve({
      layer: {
        objectIdField: "objectid",
        createQuery: () => ({}),
        // Like sgm: resultOffset is ignored; only `objectid > n` pages.
        queryFeatures: async (query: QueryRecord) => {
          layerRef.executed.push({ ...query });
          layerRef.inFlight += 1;
          layerRef.maxInFlight = Math.max(layerRef.maxInFlight, layerRef.inFlight);
          await new Promise((resolve) => setTimeout(resolve, 0));
          layerRef.inFlight -= 1;
          if (layerRef.fail) throw new Error("Wait timeout for the request exceeded.");
          const size = Number(query.resultRecordCount) || 2000;
          const after = Number(/objectid > (-?\d+)/.exec(String(query.where))?.[1] ?? -Infinity);
          const rows = layerRef.rows
            .filter((r) => inSlice(String(query.where), r.uniqueid) && Number(r.objectid) > after)
            .slice(0, size);
          return { features: rows.map((attributes) => ({ attributes })) };
        },
      },
      fields: layerRef.fields,
    }),
}));
jest.mock("../shared/agri-access-config", () => ({
  combineAccessWhere: (where: string) => `ACCESS AND (${where})`,
}));

import { queryAgriTableAreaByUniqueId } from "./agri-table-data-source";
import { MAX_HEAVY_QUERIES_PER_SERVICE, resetStatsQueryScheduler } from "../data/agri-query-scheduler";

beforeEach(() => {
  resetStatsQueryScheduler();
  layerRef.inFlight = 0;
  layerRef.maxInFlight = 0;
  layerRef.fail = false;
  layerRef.rows = [];
  layerRef.fields = ["objectid", "uniqueid", "crop_id", "maydon", "yil", "region", "district"];
  layerRef.executed = [];
});

describe("queryAgriTableAreaByUniqueId", () => {
  test("16 slices, but only a few requests on the server at a time", async () => {
    layerRef.rows = Array.from({ length: 40 }, (_, i) => ({ objectid: i + 1, uniqueid: `${(i % 16).toString(16)}x${i}`, crop_id: "10", maydon: 1 }));
    const out = await queryAgriTableAreaByUniqueId({ region: 1701, year: "2025" });
    expect(out.size).toBe(40);
    expect(layerRef.executed).toHaveLength(16);
    expect(layerRef.maxInFlight).toBeLessThanOrEqual(MAX_HEAVY_QUERIES_PER_SERVICE);
  });

  test("a failed page stops the queued pages of the read", async () => {
    layerRef.fail = true;
    await expect(queryAgriTableAreaByUniqueId({ region: 1702, year: "2025" })).rejects.toThrow();
    expect(layerRef.executed.length).toBeLessThanOrEqual(MAX_HEAVY_QUERIES_PER_SERVICE);
  });

  test("groups rows per normalized uniqueid with crop and maydon; scope reaches every slice", async () => {
    layerRef.rows = [
      { objectid: 1, uniqueid: "{AB12}", region: 1724, crop_id: "6", maydon: 12.5 },
      { objectid: 2, uniqueid: "ab12", region: 1724, crop_id: "15", maydon: 12.4 },
      { objectid: 3, uniqueid: "c3", region: "1724", crop_id: 10, maydon: "7.25" },
      { objectid: 4, uniqueid: "", crop_id: "10", maydon: 1 },
    ];
    const out = await queryAgriTableAreaByUniqueId({ region: 1724, district: 5, year: "2026" });

    // Braced and bare spellings of one id merge (slice order is not fixed).
    expect(out.get("ab12")).toEqual(
      expect.arrayContaining([
        { uniqueId: "{AB12}", region: "1724", cropId: "6", maydon: 12.5 },
        { uniqueId: "ab12", region: "1724", cropId: "15", maydon: 12.4 },
      ]),
    );
    expect(out.get("ab12")).toHaveLength(2);
    expect(out.get("c3")).toEqual([{ uniqueId: "c3", region: "1724", cropId: "10", maydon: 7.25 }]);
    expect(out.size).toBe(2);

    expect(layerRef.executed).toHaveLength(16);
    for (const q of layerRef.executed) {
      expect(q.where).toContain("ACCESS AND (yil LIKE '2026%' AND uniqueid IS NOT NULL AND region='1724' AND district='5')");
      expect(q.outFields).toEqual(["uniqueid", "region", "crop_id", "maydon", "objectid"]);
    }
  });

  test("pages a full slice by objectid keyset — every row once, hectares not multiplied — then caches", async () => {
    layerRef.rows = Array.from({ length: 4500 }, (_, i) => ({ objectid: i + 1, uniqueid: `a${i}`, crop_id: "10", maydon: 2 }));
    const out = await queryAgriTableAreaByUniqueId({ region: 1730, year: "2026" });
    expect(out.size).toBe(4500);
    const total = Array.from(out.values()).flat().reduce((sum, row) => sum + row.maydon, 0);
    expect(total).toBe(9000);
    // 16 slices + two extra pages for the "a…" slice (2000 + 2000 + 500).
    expect(layerRef.executed).toHaveLength(18);
    expect(layerRef.executed.some((q) => String(q.where).includes("objectid > 4000"))).toBe(true);
    expect(layerRef.executed.every((q) => q.resultOffset === undefined)).toBe(true);
    await queryAgriTableAreaByUniqueId({ region: 1730, year: "2026" });
    expect(layerRef.executed).toHaveLength(18);
  });

  test("bad year → empty without a query; missing maydon field rejects", async () => {
    await expect(queryAgriTableAreaByUniqueId({ year: "yo'q" })).resolves.toEqual(new Map());
    expect(layerRef.executed).toHaveLength(0);
    layerRef.fields = ["objectid", "uniqueid"];
    await expect(queryAgriTableAreaByUniqueId({ region: 1, year: "2025" })).rejects.toThrow("maydon");
  });
});
