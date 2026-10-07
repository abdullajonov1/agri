import type { IndicatorWidgetHost } from "../indicator-host";
import type { IndicatorConfig, VegetationStatsWidgetState } from "../widget";

type StatePatch = Partial<VegetationStatsWidgetState>;

export const baseIndicatorState = (): VegetationStatsWidgetState => ({
  vegetationArea: null,
  loading: false,
  error: null,
  featureCount: 0,
  lastUpdate: null,
  connectionStatus: "idle",
  mapConnectionAttempts: 0,
  selectedYil: "",
  selectedViloyat: "",
  selectedTuman: "",
  selectedYerToifas: "",
  selectedYerToifalari: [],
  selectedVegetationStatus: "",
  vhUniqueids: null,
  selectedCropType: "",
  barCategoryField: null,
  barCategoryValue: null,
  selectedUniqueid: "",
  totalArea: null,
  lastFilterEventTimestamp: 0,
  isHandlingExternalEvent: false,
  isDarkTheme: true,
  widgetSize: "md",
  language: "ru",
});

export interface IndicatorHostStub {
  host: IndicatorWidgetHost;
  setState: jest.Mock<void, [StatePatch, (() => void)?]>;
}

/**
 * Minimal typed host for exercising Indicator helper functions.
 * setState merges synchronously and runs the callback immediately.
 */
export const makeIndicatorHost = (
  state: StatePatch = {},
  config: IndicatorConfig = {},
  overrides: Partial<IndicatorWidgetHost> = {},
): IndicatorHostStub => {
  const partial: Partial<IndicatorWidgetHost> = {
    props: { id: "w1", config } as unknown as IndicatorWidgetHost["props"],
    state: { ...baseIndicatorState(), ...state },
    _isMounted: true,
    _isResetting: false,
    _requestId: 0,
    _lastFilterEventMs: 0,
    refreshTimer: null,
    refreshData: jest.fn(),
    fetchData: jest.fn(async (): Promise<void> => undefined),
    fetchApiData: jest.fn(async (): Promise<void> => undefined),
    initializeTheme: jest.fn(),
    _onReset: jest.fn(),
    normalizeUzbekForApi: (s: string) => s.replace(/[\u02BB\u02BC\u2019\u2018`]/g, "'"),
    normalizeTurlar: () => [],
    buildTurlarClause: () => "",
    shouldFetchForViloyat: () => true,
    ...overrides,
  };
  const host = partial as IndicatorWidgetHost;
  const setState = jest.fn((patch: StatePatch, cb?: () => void) => {
    host.state = { ...host.state, ...patch };
    cb?.();
  });
  host.setState = setState as unknown as IndicatorWidgetHost["setState"];
  return { host, setState };
};
