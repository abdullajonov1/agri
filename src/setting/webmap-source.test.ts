import type { UseDataSource } from "jimu-core";

const mockState: { value: unknown } = { value: {} };
const mockCreated: Record<string, { type: string }> = {};
jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: () => ({ getState: () => mockState.value }),
  DataSourceManager: { getInstance: () => ({ getDataSource: (id: string) => mockCreated[id] }) },
}));

import { isWebMapSource, listFailedWebMapSourceIds, readSettingDataSourceType, splitWebMapSelection } from "./webmap-source";

const ds = (id: string, rootId?: string): UseDataSource =>
  ({ dataSourceId: id, mainDataSourceId: id, rootDataSourceId: rootId }) as unknown as UseDataSource;

describe("readSettingDataSourceType", () => {
  afterEach(() => {
    mockState.value = {};
    for (const key of Object.keys(mockCreated)) delete mockCreated[key];
  });

  it("reads the edited app (Builder) before the Builder's own config", () => {
    mockState.value = {
      appStateInBuilder: { appConfig: { dataSources: { d1: { type: "WEB_MAP" } } } },
      appConfig: { dataSources: { d1: { type: "FEATURE_LAYER" } } },
    };
    expect(readSettingDataSourceType("d1")).toBe("WEB_MAP");
  });

  it("falls back to appConfig, then to the created data source", () => {
    mockState.value = { appConfig: { dataSources: { d2: { type: "WEB_MAP" } } } };
    expect(readSettingDataSourceType("d2")).toBe("WEB_MAP");
    mockCreated.d3 = { type: "FEATURE_LAYER" };
    expect(readSettingDataSourceType("d3")).toBe("FEATURE_LAYER");
    expect(readSettingDataSourceType("none")).toBeUndefined();
    expect(readSettingDataSourceType("")).toBeUndefined();
  });
});

describe("isWebMapSource", () => {
  const types: Record<string, string> = { wm: "WEB_MAP", fl: "FEATURE_LAYER" };
  const read = (id: string): string | undefined => types[id];

  it("is true only for a root WebMap", () => {
    expect(isWebMapSource(ds("wm"), read)).toBe(true);
    expect(isWebMapSource(ds("wm", "wm"), read)).toBe(true);
    expect(isWebMapSource(ds("fl"), read)).toBe(false);
    expect(isWebMapSource(ds("wm-layer", "wm"), () => "WEB_MAP")).toBe(false);
    expect(isWebMapSource(null, read)).toBe(false);
  });
});

describe("splitWebMapSelection", () => {
  const isWebMap = (s: UseDataSource): boolean => String(s.dataSourceId).startsWith("wm");

  it("keeps the layers and the last WebMap picked", () => {
    const out = splitWebMapSelection([ds("wmA"), ds("fl1"), ds("wmB")], isWebMap);
    expect(out.useDataSources.map((d) => d.dataSourceId)).toEqual(["fl1", "wmB"]);
    expect(out.webMapDataSourceId).toBe("wmB");
  });

  it("no WebMap → only layers and an empty id", () => {
    const out = splitWebMapSelection([ds("fl1")], isWebMap);
    expect(out.useDataSources.map((d) => d.dataSourceId)).toEqual(["fl1"]);
    expect(out.webMapDataSourceId).toBe("");
  });
});

describe("listFailedWebMapSourceIds", () => {
  const apps = {
    appStateInBuilder: {
      appConfig: {
        dataSources: {
          wmFailed: { type: "WEB_MAP" },
          wmNoLayers: { type: "WEB_MAP" },
          wmOk: { type: "WEB_MAP" },
          wmLoading: { type: "WEB_MAP" },
          fl: { type: "FEATURE_LAYER" },
        },
      },
      dataSourcesInfo: {
        wmFailed: { instanceStatus: "CREATE_ERROR" },
        wmNoLayers: { instanceStatus: "CREATED" },
        wmOk: { instanceStatus: "CREATED" },
        wmLoading: { instanceStatus: "CREATED" },
        fl: { instanceStatus: "CREATE_ERROR" },
      },
    },
  };
  const instances: Record<string, { areChildDataSourcesCreated: () => boolean; getChildDataSources: () => unknown[] }> = {
    wmNoLayers: { areChildDataSourcesCreated: () => true, getChildDataSources: () => [] },
    wmOk: { areChildDataSourcesCreated: () => true, getChildDataSources: () => [{}] },
    wmLoading: { areChildDataSourcesCreated: () => false, getChildDataSources: () => [] },
  };

  it("lists WebMaps that failed or whose layers could not be loaded", () => {
    expect(listFailedWebMapSourceIds(apps, (id) => instances[id]).sort()).toEqual(["wmFailed", "wmNoLayers"]);
  });

  it("is empty without an app config", () => {
    expect(listFailedWebMapSourceIds(undefined, () => null)).toEqual([]);
  });
});
