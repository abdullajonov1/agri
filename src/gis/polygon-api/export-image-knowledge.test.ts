const STORAGE_KEY = "agri_export_image_knowledge_v1";

type KnowledgeModule = typeof import("./export-image-knowledge");

function loadFresh(): KnowledgeModule {
  let mod: KnowledgeModule | undefined;
  jest.isolateModules(() => {
    mod = jest.requireActual<KnowledgeModule>("./export-image-knowledge");
  });
  if (!mod) throw new Error("module did not load");
  return mod;
}

describe("export-image-knowledge", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("normalizeUniqueidKey strips braces, trims and lowercases", () => {
    const k = loadFresh();
    expect(k.normalizeUniqueidKey(" {ABC-def} ")).toBe("abc-def");
    expect(k.normalizeUniqueidKey(null as unknown as string)).toBe("");
  });

  test("default crop seasons: wheat=6 -> Mar/Apr, unknown -> []", () => {
    const k = loadFresh();
    expect(k.getDefaultCropIndexSeasonMonths(6)).toEqual([3, 4]);
    expect(k.getDefaultCropIndexSeasonMonths(99)).toEqual([]);
    expect(k.getDefaultCropIndexSeasonMonths(null)).toEqual([]);
    expect(k.getDefaultCropIndexSeasonMonths(Number.NaN)).toEqual([]);
  });

  test("returned default months are a copy", () => {
    const k = loadFresh();
    const months = k.getDefaultCropIndexSeasonMonths(6);
    months.push(12);
    expect(k.getDefaultCropIndexSeasonMonths(6)).toEqual([3, 4]);
  });

  test("season lookup precedence: uid > crop > default > last learned", () => {
    const k = loadFresh();
    expect(k.getExportImageSeasonMonths("u1")).toEqual([]);
    expect(k.getExportImageSeasonMonths("u1", 6)).toEqual([3, 4]);

    k.rememberExportImageSeasonMonths("{U1}", [5, 6], 7);
    expect(k.getExportImageSeasonMonths("u1")).toEqual([5, 6]);
    expect(k.getExportImageSeasonMonths("other", 7)).toEqual([5, 6]);
    // unknown polygon + unknown crop falls back to last learned
    expect(k.getExportImageSeasonMonths("zzz")).toEqual([5, 6]);
    // crop with built-in default still uses default
    expect(k.getExportImageSeasonMonths("zzz", 6)).toEqual([3, 4]);
  });

  test("remember ignores empty month lists", () => {
    const k = loadFresh();
    k.rememberExportImageSeasonMonths("u", []);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("region imagery gaps and scenes are tracked and persisted", () => {
    const k = loadFresh();
    expect(k.isRegionDateWithoutImagery(3, "2024-04-01")).toBe(false);
    k.rememberRegionDateWithoutImagery(3, "2024-04-01T10:00:00");
    expect(k.isRegionDateWithoutImagery(3, "2024-04-01")).toBe(true);
    k.rememberRegionDateWithImagery(3, "2024-04-02");
    expect(k.isRegionDateWithImagery(3, "2024-04-02")).toBe(true);
    expect(k.isRegionDateWithImagery(4, "2024-04-02")).toBe(false);

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as {
      gaps: string[];
      scenes: string[];
    };
    expect(stored.gaps).toContain("3|2024-04-01");
    expect(stored.scenes).toContain("3|2024-04-02");
  });

  test("invalid region/date keys are ignored", () => {
    const k = loadFresh();
    k.rememberRegionDateWithoutImagery(null, "2024-04-01");
    k.rememberRegionDateWithImagery(3, "bad-date");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(k.isRegionDateWithoutImagery(null, "2024-04-01")).toBe(false);
  });

  test("hydrates sanitized knowledge from localStorage on load", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gaps: ["5|2024-03-03", "garbage"],
        scenes: ["5|2024-03-04"],
        seasonsByCrop: { "8": [4, 4, 13, "5"] },
        seasonsByUid: { abc: [9] },
        lastSeason: [10, 11],
      }),
    );
    const k = loadFresh();
    expect(k.isRegionDateWithoutImagery(5, "2024-03-03")).toBe(true);
    expect(k.isRegionDateWithImagery(5, "2024-03-04")).toBe(true);
    expect(k.getExportImageSeasonMonths("x", 8)).toEqual([4, 5]);
    expect(k.getExportImageSeasonMonths("ABC")).toEqual([9]);
    expect(k.getExportImageSeasonMonths("none")).toEqual([10, 11]);
  });

  test("corrupt storage is tolerated", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    const k = loadFresh();
    expect(k.isRegionDateWithoutImagery(1, "2024-01-01")).toBe(false);
  });

  test("picks up knowledge written by another widget instance on forced sync", () => {
    const k = loadFresh();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ gaps: ["7|2024-05-05"] }));
    k.syncExportImageKnowledgeFromStorage(true);
    expect(k.isRegionDateWithoutImagery(7, "2024-05-05")).toBe(true);
  });
});

export {};
