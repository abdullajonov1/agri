import {
  aggregateVhRowsByPolygonArea,
  aggregateVhServiceRows,
  buildEmptyVhBarData,
  buildVhBarComputeKey,
  type VhBarComputeKeyInput,
} from "./vh-bar-aggregate";
import { VH_CATEGORIES } from "./vh-constants";

describe("buildEmptyVhBarData", () => {
  test("returns every category with zero values", () => {
    const data = buildEmptyVhBarData();
    expect(data.totalCount).toBe(0);
    expect(data.categories.map((c) => c.category)).toEqual(
      VH_CATEGORIES.map((c) => c.value),
    );
    expect(data.categories.every((c) => c.count === 0 && c.percentage === 0)).toBe(true);
  });
});

describe("aggregateVhServiceRows", () => {
  test("sums area and field counts per category and computes percentages", () => {
    const data = aggregateVhServiceRows([
      { ndvi_status: "Juda Yaxshi", count: 2, areaHa: 30 },
      { ndvi_status: "yaxshi", count: 1, areaHa: 10 },
      { ndvi_status: "yaxshi", count: 3, areaHa: 20 },
      { ndvi_status: "past", count: 1, areaHa: 40 },
    ]);
    expect(data.totalCount).toBe(100);
    const byCat = Object.fromEntries(data.categories.map((c) => [c.category, c]));
    expect(byCat["1-Juda yaxshi"].count).toBe(30);
    expect(byCat["2-Yaxshi"].count).toBe(30);
    expect(byCat["2-Yaxshi"].fieldCount).toBe(4);
    expect(byCat["3-O'rta"].count).toBe(0);
    expect(byCat["4-Past"].percentage).toBe(40);
  });

  test("skips unknown status, zero counts and negative areas", () => {
    const data = aggregateVhServiceRows([
      { ndvi_status: "unknown", count: 1, areaHa: 5 },
      { ndvi_status: "orta", count: 0, areaHa: 5 },
      { ndvi_status: "orta", count: 1, areaHa: -1 },
      { ndvi_status: "", count: 1, areaHa: 1 },
    ]);
    expect(data.totalCount).toBe(0);
    expect(data.categories.every((c) => c.percentage === 0)).toBe(true);
  });
});

describe("aggregateVhRowsByPolygonArea", () => {
  test("joins by normalized uniqueid and dedupes across rows", () => {
    const areas = new Map<string, number>([
      ["aaa", 10],
      ["bbb", 5],
      ["ccc", 0],
      ["ddd", Number.NaN],
    ]);
    const data = aggregateVhRowsByPolygonArea(
      [
        { ndvi_status: "yaxshi", count: 0, areaHa: 0, uniqueIds: ["{AAA}", "aaa", "", "zzz"] },
        { ndvi_status: "orta", count: 0, areaHa: 0, uniqueIds: ["AAA", "bbb", "ccc", "ddd"] },
        { ndvi_status: "nope", count: 0, areaHa: 0, uniqueIds: ["bbb"] },
        { ndvi_status: "past", count: 0, areaHa: 0 },
      ],
      areas,
    );
    const byCat = Object.fromEntries(data.categories.map((c) => [c.category, c]));
    expect(byCat["2-Yaxshi"].count).toBe(10);
    expect(byCat["2-Yaxshi"].fieldCount).toBe(1);
    expect(byCat["3-O'rta"].count).toBe(5);
    expect(byCat["3-O'rta"].fieldCount).toBe(1);
    expect(data.totalCount).toBe(15);
  });
});

describe("buildVhBarComputeKey", () => {
  const input: VhBarComputeKeyInput = {
    yil: "2025",
    viloyat: "Buxoro",
    tuman: "",
    turlar: ["g"],
    ndviDate: " 2025-09-01 ",
    ndviDateLocked: true,
    polygonMode: true,
    uniqueid: "u",
    filterVhBarByCrop: true,
    farmerInn: " 123 ",
  };

  test("includes locked date and trimmed inn", () => {
    const parsed = JSON.parse(buildVhBarComputeKey(input)) as Record<string, unknown>;
    expect(parsed.ndviDate).toBe("2025-09-01");
    expect(parsed.ndviDateLocked).toBe(true);
    expect(parsed.farmerInn).toBe("123");
  });

  test("ignores date when unlocked and polygon fields entirely", () => {
    const a = buildVhBarComputeKey({ ...input, ndviDateLocked: false });
    const b = buildVhBarComputeKey({
      ...input,
      ndviDateLocked: false,
      ndviDate: "other",
      polygonMode: false,
      uniqueid: "x",
    });
    expect(a).toBe(b);
    const parsed = JSON.parse(a) as Record<string, unknown>;
    expect(parsed.ndviDate).toBe("");
    expect(parsed.ndviDateLocked).toBe(false);
  });

  test("handles missing optional values", () => {
    const parsed = JSON.parse(
      buildVhBarComputeKey({ ...input, yil: "", farmerInn: undefined, ndviDate: "" }),
    ) as Record<string, unknown>;
    expect(parsed.yil).toBe("");
    expect(parsed.farmerInn).toBe("");
    expect(parsed.ndviDateLocked).toBe(false);
  });
});
