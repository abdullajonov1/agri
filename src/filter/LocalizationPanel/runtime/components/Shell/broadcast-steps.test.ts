import {
  attachVhBar,
  buildBroadcastDigest,
  buildSendLogPayload,
  countOrValue,
  resolveEffectiveNdviDate,
} from "./broadcast-steps";

const makeDetail = (over: Record<string, unknown> = {}): any => ({
  filters: { vh: "", turlar: [], viloyat: "v", tuman: "t", chartDimOrder: [] },
  options: { yil: [] },
  scope: { lockedViloyat: "", locked: false },
  vhUniqueids: [1, 2, 3],
  vhRegionChartUniqueids: null,
  meta: { recordCount: 5, whereClause: "x".repeat(400) },
  source: "AgriFilter",
  vhBarData: null,
  vhBarDataPending: false,
  ...over,
});

describe("broadcast-steps", () => {
  test("resolveEffectiveNdviDate prefers locked explicit date", () => {
    const latest = jest.fn(() => "L");
    expect(
      resolveEffectiveNdviDate({ explicitNdvi: "E", ndviDateLocked: true, barUsedNdvi: "B", latestForPrimaryLayer: latest }),
    ).toBe("E");
    expect(latest).not.toHaveBeenCalled();
  });

  test("resolveEffectiveNdviDate falls back bar, explicit, latest", () => {
    const latest = () => "L";
    expect(
      resolveEffectiveNdviDate({ explicitNdvi: "E", ndviDateLocked: false, barUsedNdvi: "B", latestForPrimaryLayer: latest }),
    ).toBe("B");
    expect(
      resolveEffectiveNdviDate({ explicitNdvi: "E", ndviDateLocked: false, barUsedNdvi: null, latestForPrimaryLayer: latest }),
    ).toBe("E");
    expect(
      resolveEffectiveNdviDate({ explicitNdvi: "", ndviDateLocked: true, barUsedNdvi: "", latestForPrimaryLayer: latest }),
    ).toBe("L");
  });

  test("buildBroadcastDigest changes with pending flag and pie signature", () => {
    const base = makeDetail();
    const a = buildBroadcastDigest(base, "s1");
    expect(buildBroadcastDigest(base, "s1")).toBe(a);
    expect(buildBroadcastDigest(base, "s2")).not.toBe(a);
    expect(buildBroadcastDigest(makeDetail({ vhBarDataPending: true }), "s1")).not.toBe(a);
  });

  test("attachVhBar keeps base fields", () => {
    const out = attachVhBar(makeDetail(), null, true);
    expect(out.vhBarDataPending).toBe(true);
    expect(out.source).toBe("AgriFilter");
  });

  test("countOrValue returns length for arrays and value otherwise", () => {
    expect(countOrValue([1, 2])).toBe(2);
    expect(countOrValue(null)).toBeNull();
  });

  test("buildSendLogPayload truncates where clause and counts ids", () => {
    const p = buildSendLogPayload(makeDetail(), true);
    expect(p.whereClauseSample).toHaveLength(280);
    expect(p.vhUniqueidsCount).toBe(3);
    expect(p.pendingOnly).toBe(true);
  });
});
