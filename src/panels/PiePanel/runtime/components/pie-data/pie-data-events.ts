import type { PieWidgetHost } from "../../pie-host";
import { getPieVhFilterUniqueIdsSig } from "../../../../../gis/agri-chart-filter-order";
import { agroV5Log } from "../../../../../gis/agri-debug-log";
import { bindMasterFilter } from "../../../../../data/agri-filter-bus";
import { findAreaFieldByPreferredNames, AREA_FIELD_PREFERRED_PIE } from "../../../../../data/agri-area-field";
import { getPieCategoryStatsCached } from "../../../../../data/agri-stats-store";
import type { AgriPieProps, AgriPieState } from "../../widget";
import { MAP_CONNECTION_RETRY_MS } from "../../../../../shared/map-connection-service";
import { initPieChart, toPieSliceData, type PieSliceClickParams } from "../../echarts-setup";
import { readPanelEventDetail, toPanelLanguage } from "../../../../panel-filter-detail";

export const handleMasterFilterChange = (host: PieWidgetHost, event: Event) => {
  const d = readPanelEventDetail(event);
  if (!d.filters) return;

  if (!host._cropMapsReady) {
    void host.ensureCropIdMaps().then(() => {
      if (host._isMounted) host.handleMasterFilterChange(event);
    });
    return;
  }

  const incoming = d.filters || {};
  const scopeLockedRaw =
    d.scope && Object.prototype.hasOwnProperty.call(d.scope, "lockedViloyat")
      ? d.scope.lockedViloyat
      : undefined;
  const nextLockedViloyat =
    scopeLockedRaw !== undefined
      ? scopeLockedRaw
        ? host.normalizeName(String(scopeLockedRaw))
        : ""
      : host.state.lockedViloyat;
  const hasField = (k: string) =>
    Object.prototype.hasOwnProperty.call(incoming, k);
  // Keep current values when upstream event doesn't include that field.
  const nextYil = hasField("yil") ? incoming.yil || "" : host.state.yil;
  const nextViloyatRaw = hasField("viloyat")
    ? incoming.viloyat || ""
    : host.state.viloyat;
  const nextTumanRaw = hasField("tuman")
    ? incoming.tuman || ""
    : host.state.tuman;
  const incomingTurlar = hasField("turlar") && Array.isArray(incoming.turlar)
    ? incoming.turlar
    : hasField("turi")
      ? incoming.turi
        ? [incoming.turi]
        : []
      : host.state.turlar;
  const nextTurlarNames: string[] = Array.from(
    new Set(
      (incomingTurlar as unknown[])
        .map((value: unknown) => host.normalizeName(String(value || "")))
        .filter(Boolean),
    ),
  );
  // Selection highlight keys are crop_id; master filter still sends turi names.
  const nextTurlar: string[] = host.turiNamesToCropIds(nextTurlarNames);
  const nextTuri: string = nextTurlar.length === 1 ? nextTurlar[0] : "";
  const nextVh = hasField("vh")
    ? String(incoming.vh || "")
    : host.state.vh;
  const nextNdviDate = hasField("ndviDate")
    ? String(incoming.ndviDate || "")
    : host.state.ndviDate;
  const nextFilterPieByVh = hasField("filterPieByVh")
    ? Boolean(incoming.filterPieByVh)
    : host.state.filterPieByVh;
  const nextPieVhUniqueIdsSig = nextFilterPieByVh
    ? getPieVhFilterUniqueIdsSig()
    : "";
  const nextFarmerInn = hasField("farmerInn")
    ? String(incoming.farmerInn || "").trim()
    : host.state.farmerInn;

  const nextBarField = hasField("barCategoryField")
    ? (incoming.barCategoryField ?? null)
    : host.state.barCategoryField;
  let nextBarValue = hasField("barCategoryValue")
    ? (incoming.barCategoryValue ?? null)
    : host.state.barCategoryValue;

  if (nextVh && !hasField("barCategoryValue")) nextBarValue = null;

  const nextLanguage = hasField("language")
    ? toPanelLanguage(incoming.language, host.state.language || "ru")
    : host.state.language;

  const effectiveViloyat = host.normalizeName(nextViloyatRaw || "");
  const nextTuman = host.normalizeName(nextTumanRaw || "");

  const parentChanged =
    nextYil !== host.state.yil ||
    effectiveViloyat !== host.state.viloyat ||
    nextTuman !== host.state.tuman ||
    nextLockedViloyat !== host.state.lockedViloyat ||
    nextFarmerInn !== host.state.farmerInn;

  const barSelectionChanged =
    nextBarField !== host.state.barCategoryField ||
    nextBarValue !== host.state.barCategoryValue ||
    nextVh !== host.state.vh ||
    nextNdviDate !== host.state.ndviDate ||
    nextFilterPieByVh !== host.state.filterPieByVh ||
    nextPieVhUniqueIdsSig !== host.state.pieVhUniqueIdsSig;

  const languageChanged = nextLanguage !== host.state.language;
  const cropSelectionChanged =
    JSON.stringify(nextTurlar) !== JSON.stringify(host.state.turlar);

  if (
    !parentChanged &&
    !barSelectionChanged &&
    !languageChanged &&
    !cropSelectionChanged
  ) {
    return;
  }

  agroV5Log(
    "pie:master-filter",
    {
      parentChanged,
      barSelectionChanged,
      cropSelectionChanged,
      nextVh,
      nextFilterPieByVh,
      nextPieVhUniqueIdsSig,
      nextTurlar,
      chartDimOrder: incoming.chartDimOrder,
      viloyat: effectiveViloyat,
      tuman: nextTuman,
      yil: nextYil,
    },
    nextTuman || host.state.tuman ? "tuman" : "vh",
  );

  const nextSelectedCategories: string[] = parentChanged ? [] : nextTurlar;
  const nextActiveSlice = parentChanged
    ? null
    : host.state.categoryData.categories.findIndex((category) =>
          nextSelectedCategories.some(
            (selected) => host.normalizeName(category.key) === selected,
          ),
        );

  host.setState(
    {
      yil: String(nextYil || ""),
      viloyat: effectiveViloyat,
      lockedViloyat: nextLockedViloyat,
      tuman: nextTuman,
      turi: nextTuri,
      turlar: nextSelectedCategories,
      vh: nextVh,
      ndviDate: nextNdviDate,
      filterPieByVh: nextFilterPieByVh,
      pieVhUniqueIdsSig: nextPieVhUniqueIdsSig,
      farmerInn: nextFarmerInn,
      barCategoryField: nextBarField,
      barCategoryValue: nextBarValue,
      selectedCategory: nextTuri || null,
      selectedCategories: nextSelectedCategories,
      activeSlice: nextActiveSlice !== null && nextActiveSlice >= 0 ? nextActiveSlice : null,
      language: nextLanguage,
      activeFeatureLayer: effectiveViloyat
        ? host.getFeatureLayerForViloyat(effectiveViloyat)
        : host.getDefaultFeatureLayer(host.state.featureLayers),
    },
    () => {
      if (
        parentChanged ||
        barSelectionChanged ||
        languageChanged ||
        cropSelectionChanged
      ) {
        host.fetchCategoryData();
      }
    },
  );
};
export function componentDidMount(host: PieWidgetHost) {
  host._isMounted = true;
  host.initializeTheme();
  void host.ensureCropIdMaps();

  host.setState({
    mapLoadingStatus: "idle",
    connectionStatus: "idle",
    debugInfo: "Widget mounted",
  });

  host._unbindMasterFilter = bindMasterFilter(host.handleMasterFilterChange);
  document.addEventListener(
    "agriV11ThemeToggled",
    host.handleThemeToggled as EventListener,
  );

  window.addEventListener("resize", host.handleResize);

  // Force proceed if connection stalls
  setTimeout(() => {
    if (
      host._isMounted &&
      (host.state.mapLoadingStatus === "loading" ||
        host.state.connectionStatus === "connecting")
    ) {
      host.setState(
        {
          connectionStatus: "connected",
          mapLoadingStatus: "loaded",
          debugInfo: "Timeout reached, proceeding",
        },
        () => host.fetchCategoryData(),
      );
    }
  }, host.CONNECTION_TIMEOUT_MS);

  host.updatePieChart("data");
}
export const updateFiltersFromProps = (host: PieWidgetHost, filters: {
    yil?: string;
    viloyat?: string;
    tuman?: string;
    turi?: string;
  }): void => {
  const next = {
    yil: filters?.yil ?? "",
    viloyat: filters?.viloyat ?? "",
    tuman: filters?.tuman ?? "",
    turi: filters?.turi ?? "",
  };

  const changed =
    host.state.yil !== next.yil ||
    host.state.viloyat !== next.viloyat ||
    host.state.tuman !== next.tuman ||
    host.state.turi !== next.turi;

  if (!changed) return;

  host.setState(
    {
      ...next,
      isHandlingExternalEvent: true,
      error: null,
      activeFeatureLayer: next.viloyat
        ? host.getFeatureLayerForViloyat(next.viloyat)
        : host.state.activeFeatureLayer,
      debugInfo: `Filters from props: y=${next.yil}, v=${next.viloyat}, t=${next.tuman}, turi=${next.turi}`,
    },
    () => {
      host.fetchCategoryData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        300,
      );
    },
  );
};
export function findAreaStatisticField(host: PieWidgetHost, fl: __esri.FeatureLayer): string | null {
  const fromLayer = findAreaFieldByPreferredNames(
    fl,
    AREA_FIELD_PREFERRED_PIE,
    { finalMaydonFallback: false },
  );
  if (fromLayer) return fromLayer;
  return host.findFieldByPossibleNames([...AREA_FIELD_PREFERRED_PIE]);
}
export async function queryCategoryStatsJSON(host: PieWidgetHost, fl: __esri.FeatureLayer, where: string, categoryField: string): Promise<Array<{ key: string; value: number }>> {
  const areaField = host.findAreaStatisticField(fl);
  const oidField = fl?.objectIdField || "OBJECTID";
  return getPieCategoryStatsCached({
    layer: fl,
    where: where || "1=1",
    categoryField,
    areaField,
    objectIdField: oidField,
  });
}
export function componentDidUpdate(host: PieWidgetHost, prevProps: AgriPieProps, prevState: AgriPieState) {
  if (
    host.props.externalFilters !== prevProps.externalFilters &&
    host.props.externalFilters
  ) {
    host.updateFiltersFromProps(host.props.externalFilters);
  }

  if (
    prevState.connectionStatus !== "connected" &&
    host.state.connectionStatus === "connected"
  ) {
    setTimeout(
      () => host._isMounted && host.initializeAfterConnection(),
      100,
    );
  }

  const { mapLoadingStatus, mapConnectionAttempts } = host.state;
  const { useMapWidgetIds } = host.props;

  if (
    (mapLoadingStatus === "failed" || mapLoadingStatus === "idle") &&
    useMapWidgetIds &&
    useMapWidgetIds.length > 0 &&
    !host.state.activeMapView &&
    mapConnectionAttempts !== prevState.mapConnectionAttempts
  ) {
    if (mapConnectionAttempts < host.MAX_CONNECTION_ATTEMPTS) {
      setTimeout(() => {
        if (host._isMounted) {
          host.setState((prev) => ({
            mapConnectionAttempts: prev.mapConnectionAttempts + 1,
            mapLoadingStatus: "idle",
            debugInfo: `Retry attempt ${prev.mapConnectionAttempts + 1}`,
          }));
        }
      }, MAP_CONNECTION_RETRY_MS);
    } else {
      host.setState(
        {
          mapLoadingStatus: "failed",
          connectionStatus: "connected",
          error: null,
          debugInfo: "Proceeding after multiple failed attempts",
        },
        () => host.fetchCategoryData(),
      );
    }
  }

  const shouldRefreshPieData =
    prevState.categoryData !== host.state.categoryData ||
    prevState.language !== host.state.language ||
    prevState.isDarkTheme !== host.state.isDarkTheme;

  const shouldRefreshPieSelection =
    !shouldRefreshPieData &&
    (prevState.activeSlice !== host.state.activeSlice ||
      prevState.selectedCategories !== host.state.selectedCategories);

  if (shouldRefreshPieData) {
    host.updatePieChart("data");
  } else if (shouldRefreshPieSelection) {
    host.updatePieChart("selection");
  }
}
export function componentWillUnmount(host: PieWidgetHost) {
  host._isMounted = false;

  if (host._fetchDebounceTimer) {
    clearTimeout(host._fetchDebounceTimer);
  }

  document.removeEventListener(
    "agriV11ThemeToggled",
    host.handleThemeToggled as EventListener,
  );
  host._unbindMasterFilter?.();
  host._unbindMasterFilter = null;

  window.removeEventListener("resize", host.handleResize);
  host.detachPieResizeObserver();

  if (host._pieChart) {
    host._pieChart.dispose();
    host._pieChart = null;
    host._pieChartHostEl = null;
    host._pieHasRendered = false;
    host._pieStableKeys = [];
    host._pieStableRawKeys = {};
  }
}
export const selectCategoryByName = (host: PieWidgetHost, name: string | null) => {
  if (!name) {
    host.setState({
      turi: "",
      turlar: [],
      selectedCategory: null,
      selectedCategories: [],
      activeSlice: null,
    });
    return;
  }
  const idx = host.state.categoryData.categories.findIndex(
    (c) => host.normalizeName(c.key) === host.normalizeName(name),
  );
  host.setState({
    turi: name,
    turlar: [name],
    selectedCategory: name,
    selectedCategories: [name],
    activeSlice: idx >= 0 ? idx : null,
  });
};
export const schedulePieChartResize = (host: PieWidgetHost): void => {
  if (host._pieResizeRaf) cancelAnimationFrame(host._pieResizeRaf);
  host._pieResizeRaf = window.requestAnimationFrame(() => {
    host._pieResizeRaf = 0;
    host._pieChart?.resize();
  });
};
export const attachPieResizeObserver = (pieHost: PieWidgetHost, host: HTMLDivElement): void => {
  if (typeof ResizeObserver === "undefined") return;

  const stage =
    host.closest(".land-category-echart-stage") ??
    host.parentElement ??
    host;

  if (pieHost._pieResizeObserver && pieHost._pieObservedStage === stage) {
    return;
  }

  pieHost._pieResizeObserver?.disconnect();
  pieHost._pieResizeObserver = new ResizeObserver(() => {
    pieHost.schedulePieChartResize();
  });
  pieHost._pieObservedStage = stage;
  pieHost._pieResizeObserver.observe(stage);
};
export const detachPieResizeObserver = (host: PieWidgetHost): void => {
  if (host._pieResizeRaf) {
    cancelAnimationFrame(host._pieResizeRaf);
    host._pieResizeRaf = 0;
  }
  host._pieResizeObserver?.disconnect();
  host._pieResizeObserver = null;
  host._pieObservedStage = null;
};
export const handleResize = (host: PieWidgetHost) => {
  host.schedulePieChartResize();
  const isIpad = host.isIpadLayout();
  if (host._lastIpadLayout === isIpad) return;
  host._lastIpadLayout = isIpad;
  host.forceUpdate();
  window.requestAnimationFrame(() => {
    host.updatePieChart("selection");
    host.schedulePieChartResize();
  });
};
export const getChartDataForPie = (host: PieWidgetHost) => {
  const { categoryData, language } = host.state;
  const sortedCategories = [...(categoryData?.categories ?? [])]
    .filter((category) => (Number(category.value) || 0) > 0)
    .sort((a, b) => b.value - a.value);

  // Only positive slices — zero placeholders from prior year/region leave
  // empty arcs when minAngle boosts them.
  host._pieStableKeys = sortedCategories
    .map((category) => String(category.key || "").trim())
    .filter(Boolean);
  host._pieStableRawKeys = {};

  return sortedCategories.map((category) => {
    const norm = String(category.key || "").trim();
    host._pieStableRawKeys[norm] = category.key;
    return {
      name: host.getCategoryDisplayName(category.key, language),
      rawKey: category.key,
      value: category.value,
      percentage: category.percentage,
    };
  });
};
export const ensurePieChart = (pieHost: PieWidgetHost) => {
  const host = pieHost._pieChartRef.current;
  if (!host) return null;

  if (
    pieHost._pieChart &&
    pieHost._pieChartHostEl &&
    pieHost._pieChartHostEl !== host
  ) {
    pieHost._pieChart.dispose();
    pieHost._pieChart = null;
    pieHost._pieChartHostEl = null;
    pieHost._pieHasRendered = false;
    pieHost._pieStableKeys = [];
    pieHost._pieStableRawKeys = {};
  }

  if (!pieHost._pieChart) {
    pieHost._pieChart = initPieChart(host);
    pieHost._pieChartHostEl = host;
    pieHost._pieChart.on("click", (params: PieSliceClickParams) => {
      if (typeof params?.dataIndex !== "number") return;
      pieHost.handleSliceClick(toPieSliceData(params.data), params.dataIndex);
    });
  }

  pieHost.attachPieResizeObserver(host);

  return pieHost._pieChart;
};
export const formatCenterArea = (host: PieWidgetHost, value: number): string => {
  const { language } = host.state;
  const areaUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString("ru-RU", {
    maximumFractionDigits: safe >= 100 ? 0 : 1,
  })}\u00A0${areaUnit}`;
};
export const formatCenterPercent = (host: PieWidgetHost, value: number): string => {
  if (!Number.isFinite(value)) return "0%";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? `${rounded.toFixed(0)}%`
    : `${rounded.toFixed(1)}%`;
};
export const getCenterAllLabel = (host: PieWidgetHost): string => {
  const { language } = host.state;
  if (language === "en") return "All";
  if (language === "ru") return "Все";
  if (language === "uz_lat") return "Barchasi";
  return "Барчаси";
};
export const isIpadLayout = (host: PieWidgetHost): boolean => {
  // Hide legend / expand pie on iPad Pro (~1366) and every smaller viewport.
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 1400;
};
export const getPieCenterContent = (host: PieWidgetHost, chartData: Array<{
      name: string;
      rawKey?: string;
      value: number;
      percentage?: number;
    }>): {
    showPercent: boolean;
    percent: number;
    area: number;
    label: string;
  } => {
  const { selectedCategories, categoryData } = host.state;
  const totalValue =
    Number(categoryData?.totalValue) ||
    chartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  if (selectedCategories.length > 0) {
    const selectedKeys = new Set(
      selectedCategories.map((selected) => host.normalizeName(selected)),
    );
    const selectedItems = chartData.filter((item) =>
      selectedKeys.has(host.normalizeName(item.rawKey || item.name || "")),
    );
    if (selectedItems.length > 0) {
      const area = selectedItems.reduce(
        (sum, item) => sum + (Number(item.value) || 0),
        0,
      );
      return {
        showPercent: true,
        percent: totalValue > 0 ? (area / totalValue) * 100 : 0,
        area,
        label: selectedItems.map((item) => item.name).join(", "),
      };
    }
  }

  return {
    showPercent: true,
    percent: totalValue > 0 ? 100 : 0,
    area: totalValue,
    label: host.getCenterAllLabel(),
  };
};
