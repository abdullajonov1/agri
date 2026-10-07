import {
  extractGraffYearToken,
  formatGraffRangeDate,
  graffRegionalFiltersChanged,
  isGraffRegionalFilterSnapshotStale,
  resolveAgainstAvailableDates,
  snapshotGraffRegionalFilters,
  type GraffRegionalFilterSlice,
} from "./agri-graff-date";

describe("resolveAgainstAvailableDates", () => {
  test("no advertised dates -> UTC YMD of input", () => {
    expect(resolveAgainstAvailableDates(Date.UTC(2024, 4, 3, 12), [])).toBe("2024-05-03");
    expect(resolveAgainstAvailableDates("garbage", [])).toBeNull();
  });

  test("exact UTC day match", () => {
    expect(
      resolveAgainstAvailableDates(Date.UTC(2024, 4, 3), ["2024-05-01", "2024-05-03"]),
    ).toBe("2024-05-03");
  });

  test("snaps to nearest advertised date within 2 days", () => {
    expect(
      resolveAgainstAvailableDates(Date.UTC(2024, 4, 3), ["2024-05-01", "2024-05-06"]),
    ).toBe("2024-05-01");
    expect(
      resolveAgainstAvailableDates(new Date(Date.UTC(2024, 4, 3)), ["bad", "2024-05-04"]),
    ).toBe("2024-05-04");
  });

  test("returns null when nearest is farther than 2 days", () => {
    expect(resolveAgainstAvailableDates(Date.UTC(2024, 4, 3), ["2024-05-10"])).toBeNull();
  });

  test("returns null for unparseable input with advertised dates", () => {
    expect(resolveAgainstAvailableDates("not a date", ["2024-05-10"])).toBeNull();
  });
});

describe("graffRegionalFiltersChanged", () => {
  const base: GraffRegionalFilterSlice = {
    viloyat: "A",
    tuman: "B",
    yil: "2024",
    uzspace: "x",
    vh: "",
    turlar: ["1"],
  };

  test("identical slices are unchanged; missing turlar equals []", () => {
    expect(graffRegionalFiltersChanged(base, { ...base })).toBe(false);
    expect(
      graffRegionalFiltersChanged({ ...base, turlar: undefined }, { ...base, turlar: [] }),
    ).toBe(false);
  });

  test.each(["viloyat", "tuman", "yil", "uzspace", "vh"] as const)("detects %s change", (key) => {
    expect(graffRegionalFiltersChanged(base, { ...base, [key]: "changed" })).toBe(true);
  });

  test("detects turlar change", () => {
    expect(graffRegionalFiltersChanged(base, { ...base, turlar: ["2"] })).toBe(true);
  });
});

describe("formatGraffRangeDate", () => {
  test("formats as DD.MM.YYYY local", () => {
    expect(formatGraffRangeDate("2024-03-07T12:00:00")).toBe("07.03.2024");
  });

  test("empty/invalid -> empty string", () => {
    expect(formatGraffRangeDate("")).toBe("");
    expect(formatGraffRangeDate(null)).toBe("");
  });
});

describe("extractGraffYearToken", () => {
  test.each([
    ["2024", "2024"],
    ["Yil 1999 hosil", "1999"],
    ["12024", ""],
    ["", ""],
    [null, ""],
    [2023, "2023"],
  ])("%p -> %p", (input, out) => {
    expect(extractGraffYearToken(input)).toBe(out);
  });
});

describe("graff regional snapshots", () => {
  test("snapshot prefers uzspace over turi and stringifies turlar", () => {
    expect(
      snapshotGraffRegionalFilters({ viloyat: "A", uzspace: "u", turi: "t", turlar: ["1", "2"] }),
    ).toEqual({ viloyat: "A", tuman: "", yil: "", turi: "u", turlar: '["1","2"]', vh: "" });
    expect(snapshotGraffRegionalFilters({ turi: "t" }).turi).toBe("t");
  });

  test("stale detection compares every field", () => {
    const snap = snapshotGraffRegionalFilters({ viloyat: "A", yil: "2024" });
    expect(isGraffRegionalFilterSnapshotStale(snap, { viloyat: "A", yil: "2024" })).toBe(false);
    expect(isGraffRegionalFilterSnapshotStale(snap, { viloyat: "B", yil: "2024" })).toBe(true);
    expect(isGraffRegionalFilterSnapshotStale(snap, { viloyat: "A", yil: "2024", vh: "x" })).toBe(
      true,
    );
    expect(
      isGraffRegionalFilterSnapshotStale(snap, { viloyat: "A", yil: "2024", turlar: ["1"] }),
    ).toBe(true);
    expect(isGraffRegionalFilterSnapshotStale(snapshotGraffRegionalFilters({}), null)).toBe(false);
  });
});
