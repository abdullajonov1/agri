import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";

type StateUpdate =
  | Partial<AgriGraffWidgetState>
  | ((prev: AgriGraffWidgetState) => Partial<AgriGraffWidgetState> | null)
  | null;

export const BASE_STATE: AgriGraffWidgetState = {
  records: [],
  loading: false,
  error: null,
  viewMode: "table",
  configuredFields: [],
  externalFilters: {},
  localFilters: {},
  regionalFilters: { viloyat: "", tuman: "", yil: "", uzspace: "", vh: "" },
  regionalRegionCode: null,
  regionalDistrictCode: null,
  vhUniqueids: null,
  filterOptions: {},
  featureLayers: [],
  spatialClickLayers: [],
  loadingFilters: false,
  isDarkTheme: false,
  mapConnectionAttempts: 0,
  connectionStatus: "idle",
  initialDataLoaded: false,
  currentPage: 1,
  totalRecordCount: 0,
  loadingMore: false,
  tableSort: null,
  lastUpdateTimestamp: 0,
  isProcessingExternalUpdate: false,
  vegetationData: [],
  loadingVegetation: false,
  vegetationError: null,
  chartAnimKey: 0,
  selectedIndices: ["ndvi"],
  chartTooltip: null,
  polygonAvailableDates: [],
  polygonImageLoading: false,
  polygonImageError: null,
  selectedMonth: null,
  isMonthPickerOpen: false,
  monthPickerPlacement: "down",
  dateRangeStartIndex: null,
  dateRangeEndIndex: null,
  graphViewportWidth: 0,
  graphViewportHeight: 0,
  language: "uz" as AgriGraffWidgetState["language"],
};

export type StubHost = GraffWidgetHost & { [key: string]: jest.Mock & unknown };

/**
 * Builds a host whose unknown public members are auto-created jest.fn()s and
 * whose `_private` members are undefined until assigned. `setState` merges
 * into `host.state` synchronously and runs the callback.
 */
export const makeStubHost = (
  state: Partial<AgriGraffWidgetState> = {},
  extra: Record<string, unknown> = {},
): GraffWidgetHost => {
  const store: Record<string, unknown> = {
    state: { ...BASE_STATE, ...state },
    props: { config: {}, useDataSources: [], useMapWidgetIds: [], id: "w1" },
    _isMounted: true,
    ...extra,
  };
  if (!("setState" in store)) {
    store.setState = jest.fn((upd: StateUpdate, cb?: () => void) => {
      const prev = store.state as AgriGraffWidgetState;
      const patch = typeof upd === "function" ? upd(prev) : upd;
      if (patch) store.state = { ...prev, ...patch };
      if (cb) cb();
    });
  }
  return new Proxy(store, {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      if (prop === "then" || prop.startsWith("_") || prop === "toJSON") return undefined;
      const fn = jest.fn();
      target[prop] = fn;
      return fn;
    },
    set(target, prop: string, value: unknown) {
      target[prop] = value;
      return true;
    },
  }) as unknown as GraffWidgetHost;
};

export const asMock = (fn: unknown): jest.Mock => fn as jest.Mock;
