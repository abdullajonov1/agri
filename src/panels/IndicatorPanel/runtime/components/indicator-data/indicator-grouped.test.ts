import { makeIndicatorHost } from "../../__test-utils__/indicator-host-stub";
import type { IndicatorConfig, VegetationStatsWidgetState } from "../../widget";
import { fetchGroupedFirst, fetchGroupedStats } from "./indicator-grouped";

interface FakeQuery {
  where?: string;
  num?: number;
  outFields?: string[];
  orderByFields?: string[];
  groupByFieldsForStatistics?: string[];
  returnGeometry?: boolean;
  set: (key: string, value: unknown) => void;
}

type AttributeRow = Record<string, unknown>;

const fakeLayer = (responses: AttributeRow[][]): { layer: __esri.FeatureLayer; queries: FakeQuery[] } => {
  const queries: FakeQuery[] = [];
  let call = 0;
  const layer = {
    objectIdField: "oid",
    createQuery: (): FakeQuery => {
      const q: FakeQuery = { set: () => undefined };
      queries.push(q);
      return q;
    },
    queryFeatures: async () => {
      const rows = responses[call++] || [];
      return { features: rows.map((attributes) => ({ attributes })) };
    },
  } as unknown as __esri.FeatureLayer;
  return { layer, queries };
};

const connectedState = (layer: __esri.FeatureLayer): Partial<VegetationStatsWidgetState> => ({
  featureLayer: layer,
  connectionStatus: "connected",
});

describe("fetchGroupedStats", () => {
  test("falls back to fetchData without layer / group field", async () => {
    const { host } = makeIndicatorHost({}, { groupByField: "g" });
    await fetchGroupedStats(host);
    expect(host.fetchData).toHaveBeenCalled();
  });

  test("delegates to fetchGroupedFirst for the 'first' operation", async () => {
    const { layer } = fakeLayer([]);
    const fetchGroupedFirstMock = jest.fn(async (): Promise<void> => undefined);
    const { host } = makeIndicatorHost(
      connectedState(layer),
      { groupByField: "g", statOperation: "first", attributeField: "v" },
      { fetchGroupedFirst: fetchGroupedFirstMock },
    );
    await fetchGroupedStats(host);
    expect(fetchGroupedFirstMock).toHaveBeenCalledWith(layer, "g", "v", "agg");
  });

  test("groups, adds null bucket, labels and commits totals", async () => {
    const { layer, queries } = fakeLayer([
      [
        { g: "b", agg: 2 },
        { g: "a", agg: 3 },
      ],
      [{ agg: 1 }],
    ]);
    const cfg: IndicatorConfig = {
      groupByField: "g",
      statOperation: "sum",
      attributeField: "v",
      includeNullCategory: true,
      excludeZeroValues: true,
    };
    const { host, setState } = makeIndicatorHost(connectedState(layer), cfg, {
      buildWhereClause: () => "1=1",
      nz: (f: string) => `(${f} > 0)`,
      labelNoValue: () => "none",
    });
    await fetchGroupedStats(host);
    expect(queries[0].where).toBe("1=1 AND g IS NOT NULL AND (v > 0) AND g <> 0 AND g <> '0'");
    expect(queries[1].where).toBe("1=1 AND g IS NULL AND (v > 0)");
    const last = setState.mock.calls[setState.mock.calls.length - 1][0];
    expect(last.groupResults?.map((r) => r.label)).toEqual(["none", "a", "b"]);
    expect(last.totalArea).toBe(6);
    expect(last.vegetationArea).toBe(6);
    expect(last.loading).toBe(false);
  });

  test("ENUM mode maps to configured categories and honours displayGroupValue", async () => {
    const { layer } = fakeLayer([[{ g: 1, agg: 4 }]]);
    const { host, setState } = makeIndicatorHost(
      connectedState(layer),
      {
        groupByField: "g",
        categoryMode: "ENUM",
        enumCategories: [
          { label: "One", value: 1 },
          { label: "Two", value: 2 },
        ],
        displayGroupValue: 1,
      },
      { buildWhereClause: () => "w", labelNoValue: () => "none", nz: (f: string) => f },
    );
    await fetchGroupedStats(host);
    const last = setState.mock.calls[setState.mock.calls.length - 1][0];
    expect(last.groupResults?.map((r) => [r.label, r.value])).toEqual([
      ["One", 4],
      ["Two", 0],
    ]);
    expect(last.vegetationArea).toBe(4);
  });

  test("drops stale results when unmounted mid-request", async () => {
    const { layer } = fakeLayer([[{ g: "a", agg: 1 }]]);
    const { host, setState } = makeIndicatorHost(connectedState(layer), { groupByField: "g" }, {
      buildWhereClause: () => "w",
      labelNoValue: () => "none",
      nz: (f: string) => f,
    });
    const p = fetchGroupedStats(host);
    host._isMounted = false;
    await p;
    expect(setState).toHaveBeenCalledTimes(1);
  });
});

describe("fetchGroupedFirst", () => {
  test("keeps first value per group and the null bucket", async () => {
    const { layer, queries } = fakeLayer([
      [
        { g: "a", v: 5 },
        { g: "a", v: 9 },
        { g: "b", v: 2 },
      ],
      [{ v: "x" }],
    ]);
    const { host, setState } = makeIndicatorHost({}, { includeNullCategory: true, excludeZeroValues: true }, {
      buildWhereClause: () => "w",
      nz: (f: string) => `nz(${f})`,
      labelNoValue: () => "none",
    });
    await fetchGroupedFirst(host, layer, "g", "v", "agg");
    expect(queries[0].where).toBe("w AND g IS NOT NULL AND nz(v)");
    expect(queries[0].orderByFields).toEqual(["g ASC"]);
    const last = setState.mock.calls[setState.mock.calls.length - 1][0];
    expect(last.groupResults).toEqual([
      { key: null, label: "none", value: 0 },
      { key: "a", label: "a", value: 5 },
      { key: "b", label: "b", value: 2 },
    ]);
    expect(last.totalArea).toBe(7);
  });
});
