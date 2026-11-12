/**
 * WebMap handling of the "Select data" lists in the settings. A WebMap can be
 * picked in either list; whichever list it came from, it becomes the map the
 * dashboard opens (`config.webMapDataSourceId`). Only one WebMap is kept.
 */
import { AllDataSourceTypes, DataSourceManager, DataSourceStatus, getAppStore, type UseDataSource } from "jimu-core";

type DataSourceTypeMap = Record<string, { type?: unknown } | undefined>;

interface BuilderStateLike {
  /** Settings run inside Builder: the edited app lives here, not in appConfig. */
  appStateInBuilder?: { appConfig?: { dataSources?: DataSourceTypeMap } };
  appConfig?: { dataSources?: DataSourceTypeMap };
}

/** Type of a data source of the edited app ("WEB_MAP", …), undefined if unknown. */
export function readSettingDataSourceType(dataSourceId: string): string | undefined {
  const id = String(dataSourceId || "");
  if (!id) return undefined;
  try {
    const state = getAppStore().getState() as unknown as BuilderStateLike;
    const fromApp =
      state?.appStateInBuilder?.appConfig?.dataSources?.[id]?.type ??
      state?.appConfig?.dataSources?.[id]?.type;
    if (fromApp) return String(fromApp);
  } catch {
    /* no store (tests) — fall through to the created data source */
  }
  const created = DataSourceManager.getInstance().getDataSource(id)?.type;
  return created ? String(created) : undefined;
}

interface BuilderInfoStateLike extends BuilderStateLike {
  appStateInBuilder?: BuilderStateLike["appStateInBuilder"] & {
    dataSourcesInfo?: Record<string, { instanceStatus?: unknown } | undefined>;
  };
  dataSourcesInfo?: Record<string, { instanceStatus?: unknown } | undefined>;
}

/** The parts of a created WebMap data source read here. */
interface WebMapInstanceLike {
  areChildDataSourcesCreated?: () => boolean;
  getChildDataSources?: () => unknown[];
}

/**
 * WebMaps of the edited app that failed: the data source was not created, or
 * it was created but loading its layers failed (children done, none exist).
 */
export function listFailedWebMapSourceIds(
  state: unknown,
  getInstance: (id: string) => WebMapInstanceLike | null | undefined = (id) =>
    DataSourceManager.getInstance().getDataSource(id) as unknown as WebMapInstanceLike,
): string[] {
  const s = (state || {}) as BuilderInfoStateLike;
  const dataSources = s.appStateInBuilder?.appConfig?.dataSources ?? s.appConfig?.dataSources ?? {};
  const infos = s.appStateInBuilder?.dataSourcesInfo ?? s.dataSourcesInfo ?? {};
  return Object.keys(dataSources).filter((id) => {
    if (String(dataSources[id]?.type) !== AllDataSourceTypes.WebMap) return false;
    if (String(infos[id]?.instanceStatus) === DataSourceStatus.CreateError) return true;
    const instance = getInstance(id);
    return (
      !!instance?.areChildDataSourcesCreated?.() &&
      (instance.getChildDataSources?.() || []).length === 0
    );
  });
}

export const isWebMapSource = (
  source: UseDataSource | null | undefined,
  readType: (id: string) => string | undefined = readSettingDataSourceType,
): boolean => {
  const id = String(source?.dataSourceId || "");
  if (!id) return false;
  // A layer of a WebMap carries the WebMap as its root; only the root itself counts.
  const rootId = String(source?.rootDataSourceId || "");
  if (rootId && rootId !== id) return false;
  return readType(id) === AllDataSourceTypes.WebMap;
};

/**
 * New selection of the "Data sources" list → what to store. The last WebMap
 * picked wins and becomes the connected map; other WebMaps are dropped.
 */
export function splitWebMapSelection(
  next: readonly UseDataSource[],
  isWebMap: (source: UseDataSource) => boolean,
): { useDataSources: UseDataSource[]; webMapDataSourceId: string } {
  const webMaps = next.filter((source) => isWebMap(source));
  const webMap = webMaps[webMaps.length - 1];
  const others = next.filter((source) => !isWebMap(source));
  return {
    useDataSources: webMap ? [...others, webMap] : others,
    webMapDataSourceId: webMap ? String(webMap.dataSourceId) : "",
  };
}
