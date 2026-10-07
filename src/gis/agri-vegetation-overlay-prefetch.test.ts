interface WalkArgs {
  uniqueid: string;
  regionId: number;
  year: number;
  cropId: number | null;
  indiceType: string;
  dates?: string[] | null;
}

const mockWalk = jest.fn<Promise<{ date: string } | null>, [WalkArgs]>();
jest.mock("../gis/agri-polygon-api-source", () => ({
  resolveExportImageWithDateWalk: (args: WalkArgs) => mockWalk(args),
}));

type PrefetchModule = typeof import("./agri-vegetation-overlay-prefetch");

function loadFresh(): PrefetchModule {
  let mod: PrefetchModule | undefined;
  jest.isolateModules(() => {
    mod = jest.requireActual<PrefetchModule>("./agri-vegetation-overlay-prefetch");
  });
  if (!mod) throw new Error("module did not load");
  return mod;
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe("vegetation overlay context", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockWalk.mockReset();
  });

  test("setting a date stamps it with the current region/year", () => {
    const m = loadFresh();
    m.setVegetationOverlayContext({ regionId: 3, year: 2024 });
    const next = m.setVegetationOverlayContext({ lastDate: "2024-04-01" });
    expect(next).toMatchObject({ lastDate: "2024-04-01", lastDateRegionId: 3, lastDateYear: 2024 });
    expect(window.sessionStorage.getItem("agri.veg.overlay.lastDate")).toBe("2024-04-01");
    expect(window.sessionStorage.getItem("agri.veg.overlay.lastDateRegion")).toBe("3");
  });

  test("clearing the date clears its region/year stamp", () => {
    const m = loadFresh();
    m.setVegetationOverlayContext({ regionId: 3, year: 2024, lastDate: "2024-04-01" });
    const next = m.setVegetationOverlayContext({ lastDate: null });
    expect(next.lastDate).toBeNull();
    expect(next.lastDateRegionId).toBeUndefined();
    expect(window.sessionStorage.getItem("agri.veg.overlay.lastDate")).toBeNull();
    expect(window.sessionStorage.getItem("agri.veg.overlay.lastDateRegion")).toBeNull();
  });

  test("context is restored from sessionStorage in a fresh module", () => {
    loadFresh().setVegetationOverlayContext({
      regionId: 5,
      year: 2023,
      lastDate: "2023-05-05",
      lastIndex: "evi",
    });
    const restored = loadFresh().getVegetationOverlayContext();
    expect(restored).toEqual({
      regionId: 5,
      year: 2023,
      lastDate: "2023-05-05",
      lastIndex: "evi",
      lastDateRegionId: 5,
      lastDateYear: 2023,
    });
  });

  test("empty session defaults lastIndex to ndvi", () => {
    const ctx = loadFresh().getVegetationOverlayContext();
    expect(ctx.lastIndex).toBe("ndvi");
    expect(ctx.lastDate).toBeNull();
    expect(ctx.regionId).toBeUndefined();
  });

  test("getVegetationOverlayDateForRegion only returns a date for the same region/year", () => {
    const m = loadFresh();
    m.setVegetationOverlayContext({ regionId: 3, year: 2024, lastDate: "2024-04-01" });
    expect(m.getVegetationOverlayDateForRegion(3, 2024)).toBe("2024-04-01");
    expect(m.getVegetationOverlayDateForRegion(3)).toBe("2024-04-01");
    expect(m.getVegetationOverlayDateForRegion(4, 2024)).toBeNull();
    expect(m.getVegetationOverlayDateForRegion(3, 2023)).toBeNull();
    expect(m.getVegetationOverlayDateForRegion(null)).toBeNull();
  });
});

describe("prefetchVegetationOverlayForUniqueid", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockWalk.mockReset();
  });

  test("does nothing for empty ids or missing region/year", () => {
    const m = loadFresh();
    m.prefetchVegetationOverlayForUniqueid("{}");
    m.prefetchVegetationOverlayForUniqueid("abc");
    m.prefetchVegetationOverlayForUniqueid("abc", { regionId: 3 });
    expect(mockWalk).not.toHaveBeenCalled();
  });

  test("walks dates with cleaned id and stores the hit", async () => {
    const m = loadFresh();
    mockWalk.mockResolvedValue({ date: "2024-04-10" });
    m.prefetchVegetationOverlayForUniqueid(" {ABC} ", {
      regionId: 3,
      year: 2024,
      cropId: 6,
      dates: ["2024-04-10"],
    });
    expect(mockWalk).toHaveBeenCalledWith({
      uniqueid: "ABC",
      regionId: 3,
      year: 2024,
      cropId: 6,
      indiceType: "ndvi",
      dates: ["2024-04-10"],
    });
    await flush();
    expect(m.getVegetationOverlayDateForRegion(3, 2024)).toBe("2024-04-10");
  });

  test("uses live context region/year and ignores misses and errors", async () => {
    const m = loadFresh();
    m.setVegetationOverlayContext({ regionId: 7, year: 2022, lastIndex: "savi" });
    mockWalk.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error("x"));
    m.prefetchVegetationOverlayForUniqueid("u1");
    m.prefetchVegetationOverlayForUniqueid("u2");
    await flush();
    expect(mockWalk.mock.calls[0][0]).toMatchObject({ regionId: 7, year: 2022, indiceType: "savi", cropId: null });
    expect(m.getVegetationOverlayContext().lastDate).toBeNull();
  });
});

export {};
