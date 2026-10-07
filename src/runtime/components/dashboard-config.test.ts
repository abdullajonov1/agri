import {
  buildIndicatorChildConfig,
  buildPopupChildConfig,
  hasAsMutableFn,
  leftPanelWidthCss,
  mapSurfaceLoadingSafetyMs,
  rowFrValues,
  toMutableUseDataSources,
  toPlainConfigRecord,
  toPlainPopupConfig,
} from "./dashboard-config";

const immutableLike = <T>(plain: T): { asMutable: jest.Mock } => ({
  asMutable: jest.fn(() => plain),
});

describe("hasAsMutableFn", () => {
  test("detects seamless-immutable style values", () => {
    expect(hasAsMutableFn(immutableLike({}))).toBe(true);
    expect(hasAsMutableFn({ a: 1 })).toBe(false);
    expect(hasAsMutableFn(null)).toBe(false);
    expect(hasAsMutableFn("text")).toBe(false);
  });
});

describe("toPlainConfigRecord", () => {
  test("deep-unwraps immutable configs", () => {
    const source = immutableLike({ leftPanelWidthPercent: 30 });
    expect(toPlainConfigRecord(source)).toEqual({ leftPanelWidthPercent: 30 });
    expect(source.asMutable).toHaveBeenCalledWith({ deep: true });
  });

  test("shallow-copies plain configs and tolerates undefined", () => {
    const plain = { webMapDataSourceId: "ds-1" };
    const copy = toPlainConfigRecord(plain);
    expect(copy).toEqual(plain);
    expect(copy).not.toBe(plain);
    expect(toPlainConfigRecord(undefined)).toEqual({});
  });
});

describe("toPlainPopupConfig", () => {
  test("returns {} for missing popup config", () => {
    expect(toPlainPopupConfig(undefined)).toEqual({});
    expect(toPlainPopupConfig(null)).toEqual({});
  });

  test("unwraps immutable popup config and copies plain ones", () => {
    expect(toPlainPopupConfig(immutableLike({ titleField: "name" }))).toEqual({
      titleField: "name",
    });
    const plain = { chartEnabled: true };
    expect(toPlainPopupConfig(plain)).toEqual(plain);
    expect(toPlainPopupConfig(plain)).not.toBe(plain);
  });
});

describe("toMutableUseDataSources", () => {
  test("unwraps immutable arrays deeply", () => {
    const source = immutableLike([{ dataSourceId: "a", mainDataSourceId: "a" }]);
    expect(toMutableUseDataSources(source)).toEqual([
      { dataSourceId: "a", mainDataSourceId: "a" },
    ]);
    expect(source.asMutable).toHaveBeenCalledWith({ deep: true });
  });

  test("copies plain arrays and maps missing values to []", () => {
    const list = [{ dataSourceId: "b", mainDataSourceId: "b" }];
    expect(toMutableUseDataSources(list)).toEqual(list);
    expect(toMutableUseDataSources(undefined)).toEqual([]);
    expect(toMutableUseDataSources(null)).toEqual([]);
  });
});

describe("buildIndicatorChildConfig", () => {
  test("applies defaults when the indicator section is missing", () => {
    expect(buildIndicatorChildConfig({})).toEqual({
      useApiDataSource: false,
      apiEndpoint: "",
      responseField: "total",
      statOperation: "sum",
      attributeField: "maydon",
      label: "Ekin maydonlari",
      unitLabel: "ga",
      decimalPlaces: 0,
      excludeZeroValues: true,
      mapOverlayMode: true,
    });
  });

  test("uses the API only when enabled and an endpoint is set", () => {
    const enabled = buildIndicatorChildConfig({
      indicator: { useApiDataSource: true, apiUrl: "  https://api/x  " },
    });
    expect(enabled.useApiDataSource).toBe(true);
    expect(enabled.apiEndpoint).toBe("https://api/x");

    const noEndpoint = buildIndicatorChildConfig({
      indicator: { useApiDataSource: true },
    });
    expect(noEndpoint.useApiDataSource).toBe(false);
  });

  test("keeps explicit values, including zero decimals and excludeZero=false", () => {
    const config = buildIndicatorChildConfig({
      indicator: {
        apiEndpoint: "https://api/y",
        statOperation: "avg",
        decimalPlaces: 2,
        excludeZeroValues: false,
      },
    });
    expect(config.apiEndpoint).toBe("https://api/y");
    expect(config.statOperation).toBe("avg");
    expect(config.decimalPlaces).toBe(2);
    expect(config.excludeZeroValues).toBe(false);
  });
});

describe("buildPopupChildConfig", () => {
  test("fills defaults for an empty popup config", () => {
    expect(buildPopupChildConfig({})).toEqual({
      fieldsToShow: [],
      titleField: "",
      labels: {},
      settings: {
        zoomToSelection: true,
        showMapPopup: false,
        showAttachments: true,
      },
      selectedFieldsMap: undefined,
      chartEnabled: false,
      chartType: "bar",
      chartTitle: "",
      chartFields: [],
      chartColor: "#00a8e8",
    });
  });

  test("passes configured values through", () => {
    const config = buildPopupChildConfig({
      fieldsToShow: ["a"],
      settings: { zoomToSelection: false, showMapPopup: true, showAttachments: false },
      chartType: "line",
      chartColor: "#123456",
    });
    expect(config.fieldsToShow).toEqual(["a"]);
    expect(config.settings).toEqual({
      zoomToSelection: false,
      showMapPopup: true,
      showAttachments: false,
    });
    expect(config.chartType).toBe("line");
    expect(config.chartColor).toBe("#123456");
  });
});

describe("layout sizing", () => {
  test("leftPanelWidthCss clamps to 18..45 and defaults to 26", () => {
    expect(leftPanelWidthCss(undefined)).toBe("calc(26% + 0.35cm)");
    expect(leftPanelWidthCss(10)).toBe("calc(18% + 0.35cm)");
    expect(leftPanelWidthCss(60)).toBe("calc(45% + 0.35cm)");
    expect(leftPanelWidthCss("abc")).toBe("calc(26% + 0.35cm)");
  });

  test("rowFrValues clamps the bottom row to 28..55", () => {
    expect(rowFrValues(undefined)).toEqual({ top: 62, bottom: 38 });
    expect(rowFrValues(10)).toEqual({ top: 72, bottom: 28 });
    expect(rowFrValues(90)).toEqual({ top: 45, bottom: 55 });
    expect(rowFrValues("x")).toEqual({ top: 62, bottom: 38 });
  });

  test("mapSurfaceLoadingSafetyMs is longer for vegetation rasters", () => {
    expect(mapSurfaceLoadingSafetyMs("vegetation-raster")).toBe(28000);
    expect(mapSurfaceLoadingSafetyMs("vegetation-raster-cancel")).toBe(28000);
    expect(mapSurfaceLoadingSafetyMs("region")).toBe(12000);
    expect(mapSurfaceLoadingSafetyMs(undefined)).toBe(12000);
  });
});
