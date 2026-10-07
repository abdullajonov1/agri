jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  withAgriAccessWhere: (where: string): string => where,
}));
jest.mock("../../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: jest.fn(),
  queryAgriUniqueIdsForFarmerInn: jest.fn(),
}));

import type { ChangeEvent } from "react";
import {
  getAgriTableDataLayer,
  queryAgriUniqueIdsForFarmerInn,
} from "../../../../../gis/agri-table-data-source";
import { makeFakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import type { GraffSearchRecord } from "../../widget-state";
import {
  applyFarmerSearchSelection,
  buildGraffSearchScopeWhere,
  buildGraffSearchTextWhere,
  clearFarmerSearchAndRestoreGeo,
  emitGraffTableRowSelected,
  emitGraffTableSearchChanged,
  emitGraffTableSearchClear,
  formatGraffSearchCellValue,
  getGraffDisplayFields,
  getGraffSearchFieldLabel,
  handleGraffSearchClear,
  handleGraffSearchFocus,
  handleGraffSearchInputChange,
  handleGraffSearchRowClick,
  runGraffAutoComplete,
} from "./graff-search-service";

const layerMock = jest.mocked(getAgriTableDataLayer);
const farmerIdsMock = jest.mocked(queryAgriUniqueIdsForFarmerInn);

type FakeQuery = { where?: string; outFields?: string[]; num?: number; orderByFields?: string[]; returnGeometry?: boolean };

const fakeLayer = (rows: Array<Record<string, unknown>> | Error): { layer: __esri.FeatureLayer; queries: FakeQuery[] } => {
  const queries: FakeQuery[] = [];
  const layer = {
    createQuery: (): FakeQuery => {
      const q: FakeQuery = {};
      queries.push(q);
      return q;
    },
    queryFeatures: jest.fn(() =>
      rows instanceof Error
        ? Promise.reject(rows)
        : Promise.resolve({ features: rows.map((attributes) => ({ attributes })) }),
    ),
  } as unknown as __esri.FeatureLayer;
  return { layer, queries };
};

const inputEvent = (value: string): ChangeEvent<HTMLInputElement> =>
  ({ target: { value } }) as unknown as ChangeEvent<HTMLInputElement>;

const searchHost = (init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
  makeFakeHost({
    findLayerFieldName: () => null,
    emitGraffTableSearchChanged: jest.fn(),
    emitGraffTableSearchClear: jest.fn(),
    broadcastFilterState: jest.fn(),
    applyMapFiltersOptimized: jest.fn(() => Promise.resolve()),
    fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
    runGraffAutoComplete: jest.fn(() => Promise.resolve()),
    clearFarmerSearchAndRestoreGeo: jest.fn(),
    applyFarmerSearchSelection: jest.fn(() => Promise.resolve()),
    buildViloyatRegionClause: () => "region = 1703",
    buildTumanDistrictClause: () => "district = 17",
    getEffectiveViloyat: () => "",
    ...init,
  });

const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
};

describe("graff-search-service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("emitters dispatch table search and row events", () => {
    const search = jest.fn();
    const row = jest.fn();
    document.addEventListener("agriGraff4TableSearchChanged", search);
    document.addEventListener("agriGraff4TableRowSelected", row);
    const host = makeFakeHost();
    host.emitGraffTableSearchChanged = (q, o) => emitGraffTableSearchChanged(host, q, o);
    emitGraffTableSearchChanged(host, "  123 ", { preserveSelection: true });
    emitGraffTableSearchClear(host);
    emitGraffTableRowSelected(host, { f_inn: "1" });
    const details = search.mock.calls.map((c) => (c[0] as CustomEvent<{ query: string; preserveSelection: boolean }>).detail);
    expect(details[0]).toMatchObject({ query: "123", preserveSelection: true, source: "AgriLocalization" });
    expect(details[1]).toMatchObject({ query: "", preserveSelection: false });
    expect((row.mock.calls[0][0] as CustomEvent<{ record: GraffSearchRecord }>).detail.record).toEqual({ f_inn: "1" });
    document.removeEventListener("agriGraff4TableSearchChanged", search);
    document.removeEventListener("agriGraff4TableRowSelected", row);
  });

  test("getGraffDisplayFields lists INN and name", () => {
    expect(getGraffDisplayFields(makeFakeHost())).toEqual(["f_inn", "f_name"]);
  });

  test("buildGraffSearchTextWhere escapes and ORs both fields", () => {
    const host = searchHost({ findLayerFieldName: (_l, n) => n.toUpperCase() });
    expect(buildGraffSearchTextWhere(host, "  ")).toBe("1=0");
    const noLayer = buildGraffSearchTextWhere(host, "ab");
    expect(noLayer).toBe("(UPPER(f_inn) LIKE UPPER('%ab%') OR UPPER(f_name) LIKE UPPER('%ab%'))");
    const withLayer = buildGraffSearchTextWhere(host, "O'k", {} as __esri.FeatureLayer);
    expect(withLayer).toContain("UPPER(F_INN)");
    expect(withLayer).toContain("UPPER(F_NAME)");
    expect(withLayer).toContain("O''k");
  });

  test("buildGraffSearchScopeWhere requires year and adds viloyat", () => {
    expect(buildGraffSearchScopeWhere(searchHost())).toBe("1=0");
    const where = buildGraffSearchScopeWhere(searchHost({ state: { yil: "2025" } }));
    expect(where).toContain("2025");
    expect(where).toContain("AND region = 1703");
  });

  test.each([
    ["f_inn", "en", "TIN"],
    ["F_INN", "ru", "ИНН"],
    ["f_inn", "uz_lat", "STIR"],
    ["f_inn", "uz_cyr", "СТИР"],
    ["uniqueid", "en", "TIN"],
    ["uniqueid", "ru", "ИНН"],
    ["uniqueid", "uz_lat", "STIR"],
    ["uniqueid", "uz_cyr", "СТИР"],
    ["tuman", "en", "District"],
    ["tuman", "ru", "Район"],
    ["tuman", "uz_lat", "Tuman"],
    ["tuman", "uz_cyr", "Туман"],
    ["f_name", "en", "Farmer name"],
    ["f_name", "ru", "Название фермера"],
    ["f_name", "uz_lat", "Fermer nomi"],
    ["f_name", "uz_cyr", "Фермер номи"],
    ["maydon", "en", "Area"],
    ["maydon", "ru", "Площадь"],
    ["maydon", "uz_lat", "Maydon"],
    ["maydon", "uz_cyr", "Майдон"],
    ["turi", "en", "Crop type"],
    ["uzspace", "ru", "Тип посева"],
    ["turi", "uz_lat", "Ekin turi"],
    ["turi", "uz_cyr", "Экин тури"],
    ["vh", "en", "VS"],
    ["vh", "uz_lat", "VH"],
    ["vh", "ru", "ВХ"],
    ["other", "en", "other"],
  ] as const)("label for %s in %s is %s", (field, lang, expected) => {
    expect(getGraffSearchFieldLabel(makeFakeHost(), field, lang)).toBe(expected);
  });

  test("formatGraffSearchCellValue", () => {
    const host = makeFakeHost();
    expect(formatGraffSearchCellValue(host, "x", null)).toBe("—");
    expect(formatGraffSearchCellValue(host, "x", "")).toBe("—");
    expect(formatGraffSearchCellValue(host, "maydon", 1234.567)).toBe("1 234.57");
    expect(formatGraffSearchCellValue(host, "count", 5)).toBe("5");
    expect(formatGraffSearchCellValue(host, "x", "abc")).toBe("abc");
    expect(formatGraffSearchCellValue(host, "x", Number.NaN)).toBe("NaN");
  });

  describe("runGraffAutoComplete", () => {
    test("returns early when unmounted", async () => {
      const host = searchHost({ _isMounted: false });
      await runGraffAutoComplete(host, "a");
      expect(host.setState).not.toHaveBeenCalled();
    });

    test("clears suggestions for blank term", async () => {
      const host = searchHost({ state: { graffSearchShowSuggestions: true } });
      await runGraffAutoComplete(host, "   ");
      expect(host.state.graffSearchShowSuggestions).toBe(false);
    });

    test("falls back to the table layer and handles its failure", async () => {
      layerMock.mockRejectedValue(new Error("no layer"));
      const host = searchHost();
      await runGraffAutoComplete(host, "12");
      expect(host.state.graffSearchSuggestions).toEqual([]);
      expect(host.state.graffSearchShowSuggestions).toBe(true);
      expect(host.state.graffSearchLoading).toBe(false);
    });

    test("queries, normalizes and dedupes results", async () => {
      const { layer, queries } = fakeLayer([
        { F_INN: "111", F_NAME: "Ali", VILOYAT: "Andijon", TUMAN: "Asaka", UID: "u1" },
        { F_INN: "111", F_NAME: "Ali", VILOYAT: "andijon", TUMAN: "ASAKA", UID: "u2" },
        { F_INN: "222", F_NAME: "Vali", VILOYAT: "Andijon", TUMAN: "Asaka", UID: "u3" },
        { OTHER: 1 },
      ]);
      layerMock.mockResolvedValue({ layer } as Awaited<ReturnType<typeof getAgriTableDataLayer>>);
      const names: Record<string, string> = { uniqueid: "UID", f_inn: "F_INN", f_name: "F_NAME", viloyat: "VILOYAT", tuman: "TUMAN" };
      const host = searchHost({
        findLayerFieldName: (_l, n) => names[n] ?? null,
        getGraffDisplayFields: () => ["f_inn", "f_name"],
        buildGraffSearchScopeWhere: () => "yil = 2025",
        buildGraffSearchTextWhere: () => "TEXT",
      });
      await runGraffAutoComplete(host, " 1 ");
      expect(queries[0].where).toBe("(yil = 2025) AND (TEXT)");
      expect(queries[0].num).toBe(50);
      expect(queries[0].orderByFields).toEqual(["F_INN ASC", "F_NAME ASC"]);
      const suggestions = host.state.graffSearchSuggestions;
      expect(suggestions.map((s) => s.f_inn)).toEqual(["111", "222"]);
      expect(suggestions[0].uniqueid).toBe("u1");
      expect(suggestions[0].viloyat).toBe("Andijon");
      expect(host.state.graffSearchLoading).toBe(false);
    });

    test("uses the text where alone when scope is 1=1 and reports failures", async () => {
      const { layer, queries } = fakeLayer(new Error("bad query"));
      const host = searchHost({
        state: { featureLayer: layer },
        getGraffDisplayFields: () => [],
        buildGraffSearchScopeWhere: () => "1=1",
        buildGraffSearchTextWhere: () => "TEXT",
      });
      await runGraffAutoComplete(host, "x");
      expect(queries[0].where).toBe("TEXT");
      expect(host.state.graffSearchShowSuggestions).toBe(true);
      expect(host.state.graffSearchSuggestions).toEqual([]);
    });

    test("drops stale responses", async () => {
      const { layer } = fakeLayer([{ f_inn: "1" }]);
      const host = searchHost({
        state: { featureLayer: layer },
        getGraffDisplayFields: () => [],
        buildGraffSearchScopeWhere: () => "",
        buildGraffSearchTextWhere: () => "T",
      });
      const pending = runGraffAutoComplete(host, "x");
      host._graffAutoCompleteRequestId += 1;
      await pending;
      expect(host.state.graffSearchSuggestions).toEqual([]);
    });
  });

  describe("handleGraffSearchInputChange", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test("debounces autocomplete when year is set", () => {
      const host = searchHost({ state: { yil: "2025" } });
      handleGraffSearchInputChange(host, inputEvent("12"));
      expect(host.state.graffSearchText).toBe("12");
      expect(host.state.graffSearchLoading).toBe(true);
      jest.advanceTimersByTime(300);
      expect(jest.mocked(host.runGraffAutoComplete)).toHaveBeenCalledWith("12");
    });

    test("cancels the previous debounce", () => {
      const host = searchHost({ state: { yil: "2025" } });
      handleGraffSearchInputChange(host, inputEvent("1"));
      handleGraffSearchInputChange(host, inputEvent("12"));
      jest.advanceTimersByTime(300);
      expect(jest.mocked(host.runGraffAutoComplete)).toHaveBeenCalledTimes(1);
    });

    test("without year it hides suggestions", () => {
      const host = searchHost({ state: { graffSearchShowSuggestions: true } });
      handleGraffSearchInputChange(host, inputEvent("12"));
      expect(host.state.graffSearchShowSuggestions).toBe(false);
    });

    test("empty input clears or restores prior geography", () => {
      const host = searchHost();
      handleGraffSearchInputChange(host, inputEvent(""));
      expect(host.state.graffSearchSuggestions).toEqual([]);
      const withGeo = searchHost({ _preFarmerSearchGeo: { viloyat: "A", tuman: "" } });
      handleGraffSearchInputChange(withGeo, inputEvent(""));
      expect(jest.mocked(withGeo.clearFarmerSearchAndRestoreGeo)).toHaveBeenCalled();
    });

    test("editing away from a committed STIR restores geography and re-applies", () => {
      const host = searchHost({
        state: { selectedFarmerInn: "111", viloyat: "B", tuman: "T", connectionStatus: "connected" },
        _preFarmerSearchGeo: { viloyat: "A", tuman: "" },
        _farmerMapUniqueIds: ["x"],
      });
      handleGraffSearchInputChange(host, inputEvent("11"));
      expect(host.state.selectedFarmerInn).toBe("");
      expect(host.state.viloyat).toBe("A");
      expect(host.state.tuman).toBe("");
      expect(host._farmerMapUniqueIds).toBeNull();
      expect(jest.mocked(host.emitGraffTableSearchClear)).toHaveBeenCalled();
      expect(jest.mocked(host.applyMapFiltersOptimized)).toHaveBeenCalledWith({ mode: "selection", reason: "region" });
    });

    test("leaving STIR without saved geo keeps geography; zoom home or district", () => {
      const home = searchHost({ state: { selectedFarmerInn: "1", connectionStatus: "connected" } });
      handleGraffSearchInputChange(home, inputEvent("2"));
      expect(jest.mocked(home.applyMapFiltersOptimized)).toHaveBeenCalledWith({ mode: "home", reason: "reset" });
      const district = searchHost({ state: { selectedFarmerInn: "1", viloyat: "V", tuman: "T", connectionStatus: "connected" } });
      handleGraffSearchInputChange(district, inputEvent("2"));
      expect(jest.mocked(district.applyMapFiltersOptimized)).toHaveBeenCalledWith({ mode: "selection", reason: "district" });
      const offline = searchHost({ state: { selectedFarmerInn: "1" } });
      handleGraffSearchInputChange(offline, inputEvent("2"));
      expect(jest.mocked(offline.broadcastFilterState)).not.toHaveBeenCalled();
    });
  });

  describe("handleGraffSearchFocus", () => {
    test("no-op without text or year", () => {
      const host = searchHost({ state: { graffSearchText: "x" } });
      handleGraffSearchFocus(host);
      expect(host.setState).not.toHaveBeenCalled();
    });

    test("reopens cached suggestions", () => {
      const host = searchHost({ state: { graffSearchText: "x", yil: "2025", graffSearchSuggestions: [{ f_inn: "1" }] } });
      handleGraffSearchFocus(host);
      expect(host.state.graffSearchShowSuggestions).toBe(true);
      expect(jest.mocked(host.runGraffAutoComplete)).not.toHaveBeenCalled();
    });

    test("re-runs search when nothing cached", () => {
      const host = searchHost({ state: { graffSearchText: " x ", yil: "2025" } });
      handleGraffSearchFocus(host);
      expect(host.state.graffSearchLoading).toBe(true);
      expect(jest.mocked(host.runGraffAutoComplete)).toHaveBeenCalledWith("x");
    });
  });

  describe("clearFarmerSearchAndRestoreGeo", () => {
    test("restores geography and re-applies when a farmer was selected", async () => {
      const timer = setTimeout(() => undefined, 10000);
      const host = searchHost({
        state: { selectedFarmerInn: "1", viloyat: "B", tuman: "T", connectionStatus: "connected", graffSearchText: "1" },
        _preFarmerSearchGeo: { viloyat: "A", tuman: "Z" },
        _graffSearchDebounceTimer: timer,
      });
      clearFarmerSearchAndRestoreGeo(host);
      expect(host._graffSearchDebounceTimer).toBeNull();
      expect(host.state.viloyat).toBe("A");
      expect(host.state.tuman).toBe("Z");
      expect(host.state.graffSearchText).toBe("");
      expect(jest.mocked(host.applyMapFiltersOptimized)).toHaveBeenCalledWith({ mode: "selection", reason: "district" });
      expect(jest.mocked(host.fetchDataWithCurrentState)).toHaveBeenCalled();
      await flush();
      expect(host._farmerSearchApplying).toBe(false);
    });

    test("does not re-apply without a farmer or when disconnected", () => {
      const idle = searchHost({ state: { connectionStatus: "connected" } });
      clearFarmerSearchAndRestoreGeo(idle);
      expect(jest.mocked(idle.broadcastFilterState)).not.toHaveBeenCalled();
      expect(idle._farmerSearchApplying).toBe(false);
      const offline = searchHost({ state: { selectedFarmerInn: "1" } });
      clearFarmerSearchAndRestoreGeo(offline);
      expect(offline._farmerSearchApplying).toBe(false);
    });

    test("zooms home when restored geography is republic", () => {
      const host = searchHost({
        state: { selectedFarmerInn: "1", viloyat: "B", connectionStatus: "connected" },
        _preFarmerSearchGeo: { viloyat: "", tuman: "" },
      });
      clearFarmerSearchAndRestoreGeo(host);
      expect(jest.mocked(host.applyMapFiltersOptimized)).toHaveBeenCalledWith({ mode: "home", reason: "reset" });
    });

    test("handleGraffSearchClear delegates", () => {
      const host = searchHost();
      handleGraffSearchClear(host);
      expect(jest.mocked(host.clearFarmerSearchAndRestoreGeo)).toHaveBeenCalled();
    });
  });

  describe("handleGraffSearchRowClick", () => {
    test("ignores rows without label", () => {
      const host = searchHost();
      handleGraffSearchRowClick(host, {});
      expect(host.setState).not.toHaveBeenCalled();
    });

    test("republic search adopts the row geography and applies STIR", () => {
      const host = searchHost({ state: { viloyat: "", tuman: "" } });
      handleGraffSearchRowClick(host, { f_inn: " 111 ", viloyat: "Andijon", tuman: "Asaka" });
      expect(host._preFarmerSearchGeo).toEqual({ viloyat: "", tuman: "" });
      expect(host.state.viloyat).toBe("Andijon");
      expect(host.state.tuman).toBe("Asaka");
      expect(host.state.selectedFarmerInn).toBe("111");
      expect(jest.mocked(host.emitGraffTableSearchChanged)).toHaveBeenCalledWith("111");
      expect(jest.mocked(host.applyFarmerSearchSelection)).toHaveBeenCalledWith("111");
    });

    test("viloyat-scoped search moves to the row tuman; name-only rows broadcast", () => {
      const host = searchHost({
        state: { viloyat: "Andijon", tuman: "Asaka" },
        getEffectiveViloyat: () => "Andijon",
        _preFarmerSearchGeo: { viloyat: "X", tuman: "" },
      });
      handleGraffSearchRowClick(host, { f_name: "Ali", district: "Shahrixon" });
      expect(host.state.tuman).toBe("Shahrixon");
      expect(host._preFarmerSearchGeo).toEqual({ viloyat: "X", tuman: "" });
      expect(host._farmerSearchApplying).toBe(false);
      expect(jest.mocked(host.broadcastFilterState)).toHaveBeenCalled();
      expect(jest.mocked(host.applyMapFiltersOptimized)).toHaveBeenCalledWith({ mode: "selection", reason: "ndvi" });
    });
  });

  describe("applyFarmerSearchSelection", () => {
    test("clears ids for blank INN and skips when unmounted", async () => {
      const host = searchHost({ _farmerMapUniqueIds: ["x"] });
      await applyFarmerSearchSelection(host, " ");
      expect(host._farmerMapUniqueIds).toBeNull();
      const unmounted = searchHost({ _isMounted: false });
      await applyFarmerSearchSelection(unmounted, "1");
      expect(farmerIdsMock).not.toHaveBeenCalled();
    });

    test("resolves ids with year/viloyat/tuman scope and re-applies", async () => {
      farmerIdsMock.mockResolvedValue(["u1", "u2"]);
      const host = searchHost({ state: { yil: "2025", tuman: "Asaka", selectedFarmerInn: "111" } });
      await applyFarmerSearchSelection(host, "111");
      const scope = farmerIdsMock.mock.calls[0][1];
      expect(scope).toContain("2025");
      expect(scope).toContain("region = 1703");
      expect(scope).toContain("district = 17");
      expect(host._farmerMapUniqueIds).toEqual(["u1", "u2"]);
      expect(jest.mocked(host.fetchDataWithCurrentState)).toHaveBeenCalled();
      expect(host._farmerSearchApplying).toBe(false);
    });

    test("ignores result when selection changed meanwhile", async () => {
      farmerIdsMock.mockResolvedValue(["u1"]);
      const host = searchHost({ state: { selectedFarmerInn: "222" } });
      await applyFarmerSearchSelection(host, "111");
      expect(host._farmerMapUniqueIds).toBeNull();
      expect(jest.mocked(host.broadcastFilterState)).not.toHaveBeenCalled();
    });

    test("on failure sets empty ids and broadcasts", async () => {
      farmerIdsMock.mockRejectedValue(new Error("down"));
      const host = searchHost({ state: { selectedFarmerInn: "111" } });
      await applyFarmerSearchSelection(host, "111");
      expect(host._farmerMapUniqueIds).toEqual([]);
      expect(jest.mocked(host.broadcastFilterState)).toHaveBeenCalled();
      expect(host._farmerSearchApplying).toBe(false);
    });
  });
});
