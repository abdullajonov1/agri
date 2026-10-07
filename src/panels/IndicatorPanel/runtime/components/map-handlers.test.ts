import type { JimuMapView } from "jimu-arcgis";
import type { DataSource } from "jimu-core";
import { DataSourceStatus } from "jimu-core";
import { makeIndicatorHost } from "../__test-utils__/indicator-host-stub";
import type { IndicatorWidgetHost } from "../indicator-host";
import {
  buildViloyatLayerIndex,
  ensureInitialization,
  getFeatureLayerForViloyat,
  makeViloyatKeyForRouting,
  onActiveViewChange,
  onDataSourceCreated,
  onDataSourceInfoChange,
  retryMapConnection,
} from "./map-handlers";

const throttled = (): IndicatorWidgetHost["throttledFetchData"] =>
  jest.fn() as unknown as IndicatorWidgetHost["throttledFetchData"];

const withRouting = () => {
  const stub = makeIndicatorHost();
  stub.host.makeViloyatKeyForRouting = (v: string) => makeViloyatKeyForRouting(stub.host, v);
  stub.host._viloyatKeyToLayerIndex = {};
  return stub;
};

const layerWithRows = (rows: Array<Record<string, unknown>>, fail = false): __esri.FeatureLayer =>
  ({
    loaded: false,
    load: jest.fn(async () => undefined),
    createQuery: () => ({}),
    queryFeatures: jest.fn(async () => {
      if (fail) throw new Error("boom");
      return { features: rows.map((attributes) => ({ attributes })) };
    }),
  }) as unknown as __esri.FeatureLayer;

describe("Indicator map-handlers routing", () => {
  test("makeViloyatKeyForRouting strips apostrophes, collapses spaces, lowercases", () => {
    const { host } = makeIndicatorHost();
    expect(makeViloyatKeyForRouting(host, "  Farg‘ona   Viloyati ")).toBe("fargona viloyati");
    expect(makeViloyatKeyForRouting(host, "")).toBe("");
  });

  test("buildViloyatLayerIndex maps each region to its first layer and survives failures", async () => {
    const { host } = withRouting();
    const a = layerWithRows([{ viloyat: "Andijon" }, { viloyat: "Buxoro" }]);
    const b = layerWithRows([{ viloyat: "Buxoro" }, { viloyat: "Xorazm" }]);
    const bad = layerWithRows([], true);
    await buildViloyatLayerIndex(host, [a, bad, b]);
    expect(host._viloyatKeyToLayerIndex).toEqual({ andijon: 0, buxoro: 0, xorazm: 2 });

    host.state = { ...host.state, featureLayers: [a, bad, b] };
    expect(getFeatureLayerForViloyat(host, "XORAZM")).toBe(b);
    expect(getFeatureLayerForViloyat(host, "unknown")).toBe(a);
    host.state = { ...host.state, featureLayer: bad };
    expect(getFeatureLayerForViloyat(host, "unknown")).toBe(bad);
  });
});

describe("Indicator map-handlers lifecycle", () => {
  test("ensureInitialization: API mode fetches or holds spinner", () => {
    const api = makeIndicatorHost({}, { useApiDataSource: true });
    ensureInitialization(api.host);
    expect(api.host.fetchApiData).toHaveBeenCalled();

    const hold = makeIndicatorHost({}, { useApiDataSource: true }, { shouldFetchForViloyat: () => false });
    ensureInitialization(hold.host);
    expect(hold.host.state.loading).toBe(true);
  });

  test("ensureInitialization: connected data source fetches, failed retries", () => {
    const ds = {} as never;
    const ok = makeIndicatorHost({ dataSource: ds, connectionStatus: "connected" });
    ensureInitialization(ok.host);
    expect(ok.host.fetchData).toHaveBeenCalled();

    const noYear = makeIndicatorHost({ dataSource: ds, connectionStatus: "connected" }, {}, { shouldFetchForViloyat: () => false });
    ensureInitialization(noYear.host);
    expect(noYear.host.fetchData).not.toHaveBeenCalled();

    const retry = jest.fn();
    const failed = makeIndicatorHost({ connectionStatus: "failed" }, {}, { retryMapConnection: retry });
    ensureInitialization(failed.host);
    expect(retry).toHaveBeenCalled();
  });

  test("retryMapConnection resets connection state", () => {
    const { host } = makeIndicatorHost({ connectionStatus: "failed", mapConnectionAttempts: 3, error: "x" });
    retryMapConnection(host);
    expect(host.state).toMatchObject({ connectionStatus: "connecting", mapConnectionAttempts: 0, error: null });
  });

  test("onActiveViewChange clears on null and connects ready or later-ready views", () => {
    const init = jest.fn(async () => undefined);
    const { host } = makeIndicatorHost({}, {}, { initializeMapConnection: init });
    onActiveViewChange(host, null as unknown as JimuMapView);
    expect(host.state.featureLayer).toBeNull();

    const ready = { view: { ready: true } } as unknown as JimuMapView;
    onActiveViewChange(host, ready);
    expect(init).toHaveBeenCalledWith(ready);

    let watcher: (isReady: boolean) => void = () => undefined;
    const remove = jest.fn();
    const later = {
      view: {
        ready: false,
        watch: (_p: string, cb: (isReady: boolean) => void) => {
          watcher = cb;
          return { remove };
        },
      },
    } as unknown as JimuMapView;
    onActiveViewChange(host, later);
    watcher(false);
    expect(init).toHaveBeenCalledTimes(1);
    watcher(true);
    expect(remove).toHaveBeenCalled();
    expect(init).toHaveBeenCalledTimes(2);
  });

  test("onDataSourceCreated stores the source and fetches when connected", () => {
    const ds = { id: "d" } as unknown as DataSource;
    const { host } = makeIndicatorHost({ connectionStatus: "connected" });
    onDataSourceCreated(host, ds);
    expect(host.state.dataSource).toBe(ds);
    expect(host.fetchData).toHaveBeenCalled();

    const hold = makeIndicatorHost({ connectionStatus: "connected" }, {}, { shouldFetchForViloyat: () => false });
    onDataSourceCreated(hold.host, ds);
    expect(hold.host.state.loading).toBe(true);
  });

  test("onDataSourceInfoChange refetches on load but not on selection", () => {
    const fetch = throttled();
    const { host } = makeIndicatorHost({ connectionStatus: "connected" }, {}, { throttledFetchData: fetch });
    onDataSourceInfoChange(host, { status: DataSourceStatus.Loaded, selectIds: ["1"] });
    expect(fetch).not.toHaveBeenCalled();
    onDataSourceInfoChange(host, { status: DataSourceStatus.Loaded });
    expect(fetch).toHaveBeenCalledTimes(1);

    const api = makeIndicatorHost({ connectionStatus: "connected" }, { useApiDataSource: true }, { throttledFetchData: fetch });
    onDataSourceInfoChange(api.host, { status: DataSourceStatus.Loaded });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
