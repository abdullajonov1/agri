import { makeIndicatorHost } from "../__test-utils__/indicator-host-stub";
import type { IndicatorWidgetHost } from "../indicator-host";
import {
  handleCategorySelection,
  handleConstructionYearChanged,
  handleCropTypeChange,
  handleExternalCategory,
  handleKadastrFiltersChanged,
  handleKadastrFiltersReset,
  handleRegionChange,
  handleVegetationStatusChange,
  handleWaterSupplyFilterChange,
  handleYilChange,
  readFiltersFromUrl,
  refreshData,
} from "./filter-handlers";

const ev = (detail: Record<string, unknown>): CustomEvent => new CustomEvent("e", { detail });

const throttled = (): IndicatorWidgetHost["throttledFetchData"] =>
  jest.fn() as unknown as IndicatorWidgetHost["throttledFetchData"];

describe("Indicator filter event handlers", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("handleRegionChange normalises apostrophes and refreshes", () => {
    const { host } = makeIndicatorHost();
    handleRegionChange(host, ev({ viloyat: "Farg‘ona", tuman: "Quva" }));
    expect(host.state.selectedViloyat).toBe("Farg'ona");
    expect(host.state.selectedTuman).toBe("Quva");
    expect(host.state.isHandlingExternalEvent).toBe(true);
    expect(host.refreshData).toHaveBeenCalled();
    jest.advanceTimersByTime(250);
    expect(host.state.isHandlingExternalEvent).toBe(false);
  });

  test("handlers ignore own source, resetting state and missing detail", () => {
    const { host, setState } = makeIndicatorHost();
    handleRegionChange(host, ev({ source: "VegetationStatsWidget", viloyat: "x" }));
    handleRegionChange(host, new Event("e"));
    handleYilChange(host, new Event("e"));
    host._isResetting = true;
    handleYilChange(host, ev({ yil: "2024" }));
    handleCropTypeChange(host, ev({ cropType: "a" }));
    expect(setState).not.toHaveBeenCalled();
  });

  test("handleYilChange and handleConstructionYearChanged set year", () => {
    const { host } = makeIndicatorHost();
    handleYilChange(host, ev({ yil: 2024 }));
    expect(host.state.selectedYil).toBe("2024");
    handleConstructionYearChanged(host, ev({ year: 2023 }));
    expect(host.state.selectedYil).toBe("2023");
    handleConstructionYearChanged(host, ev({}));
    expect(host.state.selectedYil).toBe("");
  });

  test("handleExternalCategory falls back to current filters", async () => {
    const { host } = makeIndicatorHost({ selectedYil: "2022", selectedViloyat: "A", selectedTuman: "T" });
    await handleExternalCategory(host, ev({ tur: "ekin" }));
    expect(host.state).toMatchObject({
      selectedYil: "2022",
      selectedViloyat: "A",
      selectedTuman: "T",
      selectedYerToifas: "ekin",
    });
  });

  test("handleWaterSupplyFilterChange throttles events within 200ms", () => {
    jest.setSystemTime(10_000);
    const { host, setState } = makeIndicatorHost({ lastFilterEventTimestamp: 9_950 });
    handleWaterSupplyFilterChange(host, ev({ massivNom: "M" }));
    expect(setState).not.toHaveBeenCalled();
    host.state = { ...host.state, lastFilterEventTimestamp: 0 };
    handleWaterSupplyFilterChange(host, ev({ massivNom: "M", tumanNomi: "T", yil: "2024", yerToifas: "y" }));
    expect(host.state).toMatchObject({
      selectedViloyat: "M",
      selectedTuman: "T",
      selectedYil: "2024",
      selectedYerToifas: "y",
    });
  });

  test("category, kadastr, vegetation and crop handlers update their fields", () => {
    const { host } = makeIndicatorHost({ selectedYil: "2020", selectedViloyat: "V" });
    handleCategorySelection(host, ev({ category: "c" }));
    expect(host.state).toMatchObject({ selectedYerToifas: "c", selectedYil: "2020", selectedViloyat: "V" });
    handleKadastrFiltersChanged(host, ev({ tur: "k", viloyat: "W" }));
    expect(host.state).toMatchObject({ selectedYerToifas: "k", selectedViloyat: "W", selectedYil: "" });
    handleVegetationStatusChange(host, ev({ vh: "good" }));
    expect(host.state.selectedVegetationStatus).toBe("good");
    handleCropTypeChange(host, ev({ ekin_turi: "paxta" }));
    expect(host.state.selectedCropType).toBe("paxta");
    handleKadastrFiltersReset(host);
    expect(host._onReset).toHaveBeenCalled();
  });
});

describe("Indicator refreshData", () => {
  test("API mode fetches when a year is set, else keeps spinner", () => {
    const yes = makeIndicatorHost({}, { useApiDataSource: true });
    refreshData(yes.host);
    expect(yes.host.fetchApiData).toHaveBeenCalled();

    const no = makeIndicatorHost({}, { useApiDataSource: true }, { shouldFetchForViloyat: () => false });
    refreshData(no.host);
    expect(no.host.fetchApiData).not.toHaveBeenCalled();
    expect(no.host.state.loading).toBe(true);
  });

  test("map mode uses throttled fetch when connected", () => {
    const fetch = throttled();
    const { host } = makeIndicatorHost({ connectionStatus: "connected" }, {}, { throttledFetchData: fetch });
    refreshData(host);
    expect(fetch).toHaveBeenCalled();

    const blocked = makeIndicatorHost(
      { connectionStatus: "connected" },
      {},
      { throttledFetchData: throttled(), shouldFetchForViloyat: () => false },
    );
    refreshData(blocked.host);
    expect(blocked.host.state.vegetationArea).toBeNull();
    expect(blocked.host.throttledFetchData).not.toHaveBeenCalled();
  });

  test("map mode retries after a second when not yet connected", () => {
    jest.useFakeTimers();
    const fetch = throttled();
    const { host } = makeIndicatorHost({ connectionStatus: "connecting" }, {}, { throttledFetchData: fetch });
    refreshData(host);
    expect(host.state.loading).toBe(true);
    host.state = { ...host.state, connectionStatus: "connected" };
    jest.advanceTimersByTime(1000);
    expect(fetch).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe("Indicator readFiltersFromUrl", () => {
  afterEach(() => window.history.replaceState({}, "", "/"));

  test("applies changed URL filters and refetches", () => {
    window.history.replaceState({}, "", "/?yil=2024&viloyat=A&tur=t&vh=v&ekin_turi=e");
    const fetch = throttled();
    const { host } = makeIndicatorHost({ connectionStatus: "connected" }, {}, { throttledFetchData: fetch });
    readFiltersFromUrl(host);
    expect(host.state).toMatchObject({
      selectedYil: "2024",
      selectedViloyat: "A",
      selectedYerToifas: "t",
      selectedVegetationStatus: "v",
      selectedCropType: "e",
    });
    expect(fetch).toHaveBeenCalled();
  });

  test("does nothing when URL filters are unchanged", () => {
    const { host, setState } = makeIndicatorHost();
    readFiltersFromUrl(host);
    expect(setState).not.toHaveBeenCalled();
  });

  test("uses API fetch in API mode", () => {
    window.history.replaceState({}, "", "/?yil=2025");
    const { host } = makeIndicatorHost({}, { useApiDataSource: true });
    readFiltersFromUrl(host);
    expect(host.fetchApiData).toHaveBeenCalled();
  });
});
