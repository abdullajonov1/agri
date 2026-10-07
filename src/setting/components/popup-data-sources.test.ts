import type { DataSource, IMUseDataSource } from "jimu-core";
import type { PopupSettingHost } from "../popup-setting-host";
import type { State } from "../agri-popup-setting";
import * as ds from "./popup-data-sources";

type StatePatch = Partial<State>;
type StateUpdater = StatePatch | ((prev: State) => StatePatch);

interface DsManagerStub {
  getDataSource: jest.Mock<DataSource | null, [string]>;
  createDataSourceByUseDataSource: jest.Mock<Promise<DataSource | null>, [IMUseDataSource]>;
  destroyDataSource: jest.Mock<void, [string]>;
}

const makeMgr = (): DsManagerStub => ({
  getDataSource: jest.fn<DataSource | null, [string]>(() => null),
  createDataSourceByUseDataSource: jest.fn<Promise<DataSource | null>, [IMUseDataSource]>(async () => null),
  destroyDataSource: jest.fn(),
});

const useList = (ids: string[]) => {
  const list = ids.map((dataSourceId) => ({ dataSourceId }) as unknown as IMUseDataSource);
  return Object.assign([...list], { asMutable: () => list });
};

const makeHost = (
  opts: { useDataSources?: ReturnType<typeof useList>; config?: Record<string, unknown>; state?: StatePatch } = {},
): { host: PopupSettingHost; mgr: DsManagerStub; setState: jest.Mock } => {
  const mgr = makeMgr();
  const host = {
    props: { useDataSources: opts.useDataSources, config: opts.config ?? {} },
    state: {
      dss: null,
      titleField: "",
      zoomToSelection: false,
      showMapPopup: false,
      allFields: [],
      fieldsToShowLocal: [],
      fieldOrder: [],
      popupFieldMenuOpen: false,
      ...opts.state,
    },
    lastUseDataSourceKey: "",
    ownedDataSourceIds: [],
    fieldsExtractToken: 0,
    dsMgr: mgr,
    getAgriConfig: () => ({ fieldOrder: ["b"] }),
  } as unknown as PopupSettingHost;

  const bind = <A extends unknown[], R>(fn: (h: PopupSettingHost, ...args: A) => R) =>
    (...args: A): R => fn(host, ...args);

  Object.assign(host, {
    getUseDataSourceKey: bind(ds.getUseDataSourceKey),
    releaseOwnedDataSources: bind(ds.releaseOwnedDataSources),
    createDataSources: bind(ds.createDataSources),
    extractFieldsFromDs: bind(ds.extractFieldsFromDs),
    resolveLayerFromDataSource: bind(ds.resolveLayerFromDataSource),
    fieldsFromSchemaObject: bind(ds.fieldsFromSchemaObject),
    fieldsFromLayer: bind(ds.fieldsFromLayer),
    mergeFieldOrder: bind(ds.mergeFieldOrder),
  });

  const setState = jest.fn((update: StateUpdater, cb?: () => void) => {
    const patch = typeof update === "function" ? update(host.state) : update;
    host.state = { ...host.state, ...patch };
    cb?.();
  });
  host.setState = setState as unknown as PopupSettingHost["setState"];
  return { host, mgr, setState };
};

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe("popup-data-sources lifecycle", () => {
  test("initializeDataSources with no sources clears state and owned sources", async () => {
    const { host, mgr } = makeHost({ state: { allFields: [{ name: "a", alias: "a", type: "x" }] } });
    host.ownedDataSourceIds = ["old"];
    await ds.initializeDataSources(host);
    expect(mgr.destroyDataSource).toHaveBeenCalledWith("old");
    expect(host.ownedDataSourceIds).toEqual([]);
    expect(host.state.allFields).toEqual([]);
    expect(host.state.dss).toBeNull();
  });

  test("initializeDataSources skips the web map and only creates the first candidate", async () => {
    const { host, mgr } = makeHost({
      useDataSources: useList(["webmap", "ds2", "ds3"]),
      config: { webMapDataSourceId: "webmap" },
    });
    const created = { id: "ds2", getSchema: () => ({ fields: {} }) } as unknown as DataSource;
    mgr.createDataSourceByUseDataSource.mockResolvedValue(created);
    await ds.initializeDataSources(host);
    await flush();
    expect(mgr.createDataSourceByUseDataSource).toHaveBeenCalledTimes(1);
    expect(host.lastUseDataSourceKey).toBe("ds2|ds3");
    expect(host.ownedDataSourceIds).toEqual(["ds2"]);
    expect(host.state.dss).toEqual([created]);

    // Same key with loaded dss → no rework.
    await ds.initializeDataSources(host);
    expect(mgr.createDataSourceByUseDataSource).toHaveBeenCalledTimes(1);
  });

  test("createDataSources reuses existing sources and skips failures", async () => {
    const { host, mgr } = makeHost();
    const existing = { id: "e", getSchema: (): null => null } as unknown as DataSource;
    mgr.getDataSource.mockImplementation((id: string) => (id === "e" ? existing : null));
    mgr.createDataSourceByUseDataSource.mockRejectedValue(new Error("nope"));
    await ds.createDataSources(host, [
      { dataSourceId: "e" } as unknown as IMUseDataSource,
      { dataSourceId: "bad" } as unknown as IMUseDataSource,
      { dataSourceId: "" } as unknown as IMUseDataSource,
    ]);
    expect(host.state.dss).toEqual([existing]);
    expect(host.ownedDataSourceIds).toEqual([]);
  });

  test("releaseOwnedDataSources tolerates destroy errors", () => {
    const { host, mgr } = makeHost();
    host.ownedDataSourceIds = ["a", "b"];
    mgr.destroyDataSource.mockImplementationOnce(() => {
      throw new Error("gone");
    });
    ds.cleanupDataSources(host);
    expect(mgr.destroyDataSource).toHaveBeenCalledTimes(2);
    expect(host.ownedDataSourceIds).toEqual([]);
  });
});

describe("popup-data-sources field discovery", () => {
  test("resolveLayerFromDataSource loads candidate layers and walks children", async () => {
    const { host } = makeHost();
    expect(await ds.resolveLayerFromDataSource(host, null)).toBeNull();

    const load = jest.fn(async function (this: { fields: unknown[] }) {
      this.fields = [{ name: "a" }];
    });
    const lazy = { loaded: false, fields: [] as unknown[], load };
    const layer = await ds.resolveLayerFromDataSource(host, { getLayer: () => lazy });
    expect(load).toHaveBeenCalled();
    expect(layer?.fields).toHaveLength(1);

    const child = { layer: { fields: [{ name: "c" }] } };
    const parent = { layer: { fields: [] as Array<{ name: string }> }, getChildDataSources: () => [child] };
    expect((await ds.resolveLayerFromDataSource(host, parent))?.fields).toEqual([{ name: "c" }]);

    const broken = { getMainLayer: () => ({ load: async () => Promise.reject(new Error("x")) }) };
    expect(await ds.resolveLayerFromDataSource(host, broken)).toBeNull();
  });

  test("extractFieldsFromDs merges schema + layer fields preferring real aliases", async () => {
    const source = {
      fetchSchema: async () => ({ fields: { a: { name: "a" } } }),
      getSchema: () => ({ fields: { b: { name: "b", alias: "Bee" } } }),
      layer: { fields: [{ name: "a", alias: "Alpha", type: "string" }, { name: "c" }] },
    } as unknown as DataSource;
    const { host } = makeHost({ state: { dss: [source] } });
    await ds.extractFieldsFromDs(host);
    expect(host.state.allFields).toEqual([
      { name: "a", alias: "Alpha", type: "string" },
      { name: "b", alias: "Bee", type: "unknown" },
      { name: "c", alias: "c", type: "unknown" },
    ]);
    expect(host.state.fieldOrder).toEqual(["b", "a", "c"]);
  });

  test("extractFieldsFromDs clears fields with no data sources", async () => {
    const { host } = makeHost({ state: { dss: [], allFields: [{ name: "x", alias: "x", type: "t" }] } });
    await ds.extractFieldsFromDs(host);
    expect(host.state.allFields).toEqual([]);
  });

  test("extractFieldsFromDs drops stale results when a newer extraction started", async () => {
    let release: () => void = () => undefined;
    const source = {
      fetchSchema: () =>
        new Promise((resolve) => {
          release = () => resolve({ fields: { a: { name: "a" } } });
        }),
      getSchema: (): null => null,
    } as unknown as DataSource;
    const { host, setState } = makeHost({ state: { dss: [source] } });
    const pending = ds.extractFieldsFromDs(host);
    host.fieldsExtractToken += 1;
    release();
    await pending;
    expect(setState).not.toHaveBeenCalled();
  });

  test("helpers delegate to popup-field-utils", () => {
    const { host } = makeHost();
    expect(ds.getUseDataSourceKey(host, [{ dataSourceId: "b" }, { dataSourceId: "a" }])).toBe("a|b");
    expect(ds.mergeFieldOrder(host, [{ name: "x", alias: "x", type: "t" }], ["y", "x"])).toEqual(["x"]);
  });
});
