import {
  clearChartDimOrder,
  clearPieVhFilterUniqueIds,
  deriveChartFilterFlags,
  getPieVhFilterUniqueIds,
  getPieVhFilterUniqueIdsSig,
  setPieVhFilterUniqueIds,
  upsertChartDimOrder,
  type ChartDim,
} from "./agri-chart-filter-order";

describe("pie VH uniqueid bridge", () => {
  afterEach(() => clearPieVhFilterUniqueIds());

  test("stores ids and a compact signature", () => {
    setPieVhFilterUniqueIds(["a", "b", "c"]);
    expect(getPieVhFilterUniqueIds()).toEqual(["a", "b", "c"]);
    expect(getPieVhFilterUniqueIdsSig()).toBe("3:a:c");
  });

  test("empty array has a signature that differs from null", () => {
    setPieVhFilterUniqueIds([]);
    expect(getPieVhFilterUniqueIdsSig()).toBe("0::");
    setPieVhFilterUniqueIds(null);
    expect(getPieVhFilterUniqueIds()).toBeNull();
    expect(getPieVhFilterUniqueIdsSig()).toBe("");
  });

  test("clear resets ids and signature", () => {
    setPieVhFilterUniqueIds(["x"]);
    clearPieVhFilterUniqueIds();
    expect(getPieVhFilterUniqueIds()).toBeNull();
    expect(getPieVhFilterUniqueIdsSig()).toBe("");
  });
});

describe("deriveChartFilterFlags", () => {
  test("nothing active -> no scoping", () => {
    expect(deriveChartFilterFlags([], false, false)).toEqual({
      filterPieByVh: false,
      filterVhBarByCrop: false,
    });
  });

  test("only vh active -> pie scoped by vh", () => {
    expect(deriveChartFilterFlags(["vh"], true, false)).toEqual({
      filterPieByVh: true,
      filterVhBarByCrop: false,
    });
  });

  test("only turi active -> vh bar scoped by crop", () => {
    expect(deriveChartFilterFlags(["turi"], false, true)).toEqual({
      filterPieByVh: false,
      filterVhBarByCrop: true,
    });
  });

  test("both active: first selected dimension wins", () => {
    expect(deriveChartFilterFlags(["vh", "turi"], true, true)).toEqual({
      filterPieByVh: true,
      filterVhBarByCrop: false,
    });
    expect(deriveChartFilterFlags(["turi", "vh"], true, true)).toEqual({
      filterPieByVh: false,
      filterVhBarByCrop: true,
    });
  });

  test("both active with only one in order: the ordered one wins", () => {
    expect(deriveChartFilterFlags(["vh"], true, true).filterPieByVh).toBe(true);
    expect(deriveChartFilterFlags(["turi"], true, true).filterVhBarByCrop).toBe(true);
  });

  test("both active with empty order: neither scopes", () => {
    expect(deriveChartFilterFlags([], true, true)).toEqual({
      filterPieByVh: false,
      filterVhBarByCrop: false,
    });
  });
});

describe("upsertChartDimOrder", () => {
  test("appends a new active dim without mutating input", () => {
    const order: ChartDim[] = ["vh"];
    const next = upsertChartDimOrder(order, "turi", true);
    expect(next).toEqual(["vh", "turi"]);
    expect(order).toEqual(["vh"]);
  });

  test("keeps existing position when re-activated and returns a copy", () => {
    const order: ChartDim[] = ["turi", "vh"];
    const next = upsertChartDimOrder(order, "turi", true);
    expect(next).toEqual(["turi", "vh"]);
    expect(next).not.toBe(order);
  });

  test("removes a deactivated dim", () => {
    expect(upsertChartDimOrder(["turi", "vh"], "turi", false)).toEqual(["vh"]);
    expect(upsertChartDimOrder([], "vh", false)).toEqual([]);
  });

  test("clearChartDimOrder returns a fresh empty array", () => {
    expect(clearChartDimOrder()).toEqual([]);
  });
});
