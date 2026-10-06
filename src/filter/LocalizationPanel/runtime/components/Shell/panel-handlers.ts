import { agriLog } from "../localization-log";
import type { LocalizationHost, ValueChangeEvent } from "../host";
import { errorMessage } from "../../../../../shared/agri-plain-object";
import type { FilterState } from "../../widget-state";
import { clearPieVhFilterUniqueIds, upsertChartDimOrder } from "../../../../../gis/agri-chart-filter-order";
import { getLayerMatchStateForViloyat as getLayerMatchStateForViloyatShared } from "../../../../localization/layer-utils";
import { resolveRegionNumberFromMaps, resolveDistrictNumberFromMaps, listDistrictsForViloyat } from "../../../../localization/resolve-geo-codes";

const GROUP_ID_TO_VIEW: Record<
  string,
  { viewItemId: string; viloyat: string }
> = {
  // EXAMPLE - replace with your real group ids + viloyat names
  // "99e138d333434fe9a0fd426f6e873af0": { viewItemId: "xxxxxxxxxxxxxxxxxxxx", viloyat: "Andijon viloyati" },
};

export function getAdminBoundarySelection(host: LocalizationHost) {
  const viloyat = host.getEffectiveViloyat();
  const tuman = host.normalizeApos(String(host.state.tuman || ""));
  const helpers = host.getGeoCodeHelpers();
  const regionCode = resolveRegionNumberFromMaps(
    viloyat,
    host._viloyatToRegion,
    helpers,
  );
  // Admin borders (Tuman_chegara) filter by SOATO. Pass the mapped district
  // code for named tumans so a single-district outline can use soato=, not
  // fragile name matching (Yakkabog' apostrophe variants often miss).
  // Map/table WHERE still prefers tuman text — see buildTumanDistrictClause.
  const districtCode = resolveDistrictNumberFromMaps(
    tuman,
    host._tumanToDistrict,
    helpers,
    {
      rawViloyat: viloyat,
      viloyatToRegion: host._viloyatToRegion,
    },
  );
  const listed = listDistrictsForViloyat(
    viloyat,
    host._tumanToDistrict,
    host._viloyatToRegion,
    helpers,
  );
  return {
    viloyat,
    tuman,
    regionCode,
    districtCode,
    districtNames: listed.names,
    districtCodes: listed.codes,
  };
}

export const setMapSurfaceLoading = (host: LocalizationHost, loading: boolean, reason: string) => {
  try {
    document.dispatchEvent(
      new CustomEvent("agriMapSurfaceLoading", {
        detail: { loading, reason, timestamp: Date.now() },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }
};

export function getLayerMatchStateForViloyat(host: LocalizationHost, layer: __esri.FeatureLayer, effectiveViloyat: string) {
  return getLayerMatchStateForViloyatShared({
    effectiveViloyat,
    layer,
    viloyatKeyToLayerKeys: host._viloyatKeyToLayerKeys,
    makeRegionDistrictKey: (raw) => host.makeRegionDistrictKey(raw),
    getLayerKey: (l) => host.getLayerKey(l),
  });
}

/**
 * Popup hit-testing can make an ArcGIS MapImage sublayer briefly lose its
 * runtime definitionExpression. Reapply the current geography synchronously
 * during the click chain, before the unfiltered export can be painted.
 */
export const handlePolygonMapClickPhase = (host: LocalizationHost, event: Event) => {
  if (!host._isMounted) return;
  const phase = String((event as CustomEvent)?.detail?.phase || "click");
  const map = host.state.activeMapView?.view?.map;
  if (!map) return;
  const shown = host.syncShownRegionYearLayers(map);
  host._lastShownRegionYearLayers = shown;
  agriLog("polygonClickFilter:reasserted", {
    phase,
    tuman: host.state.tuman,
    shownLayerCount: shown.length,
  });
};

export const ensureInitialization = async (host: LocalizationHost) => {
  if (!host._isMounted) return;
  const { dataSource, connectionStatus } = host.state;

  if (
    dataSource &&
    connectionStatus === "connected" &&
    host.state.yilOptions.length === 0
  ) {
    await host.runInitialDataLoad();
  } else if (connectionStatus === "failed") {
    host.retryMapConnection();
  }
};

export const resolveGroupScope = (host: LocalizationHost, groups: Array<{ id: string; title: string }>) => {
  const userIds = groups.map((g) => host._normId(g.id)).filter(Boolean);
  const normIdToOriginal: Record<string, string> = {};
  for (const k of Object.keys(GROUP_ID_TO_VIEW))
    normIdToOriginal[host._normId(k)] = k;

  for (const gid of userIds) {
    const originalKey = normIdToOriginal[gid];
    if (originalKey) return GROUP_ID_TO_VIEW[originalKey];
  }
  return null;
};

export const resolveAllowedViloyats = (host: LocalizationHost, groups: Array<{ id: string; title: string }>) => {
  const normIdToOriginal: Record<string, string> = {};
  for (const k of Object.keys(GROUP_ID_TO_VIEW)) {
    normIdToOriginal[host._normId(k)] = k;
  }
  const set = new Set<string>();
  for (const g of groups) {
    const origKey = normIdToOriginal[host._normId(g.id)];
    if (origKey) {
      set.add(host.normalizeApos(GROUP_ID_TO_VIEW[origKey].viloyat));
    }
  }
  return Array.from(set);
};

export const toggleToolbarMenu = (host: LocalizationHost, menu: "yil" | "language" | "indexInfo" | "notifications") => {
  host.setState(
    (prev) => ({
      openToolbarMenu: prev.openToolbarMenu === menu ? null : menu,
      // Always return to the index list (not a stale detail page) whenever
      // the indexInfo menu is (re)opened or closed.
      selectedIndexInfoKey: null as string | null,
    }),
    () => {
      if (host.state.openToolbarMenu === "notifications") {
        host.onNotificationsMenuOpened();
      }
    },
  );
};

export const handleYilChange = (host: LocalizationHost, event: ValueChangeEvent) => {
  if (!host._isMounted) return;

  const selectedYil = host.normalizeApos(String(event?.target?.value ?? ""));

  // Auto‑select latest NDVI date so bar/Graff use fresh data without manual date pick
  const { ndviDateOptions } = host.state;
  const autoNdviDate =
    Array.isArray(ndviDateOptions) && ndviDateOptions.length
      ? ndviDateOptions[ndviDateOptions.length - 1]
      : "";

  host.setState(
    {
      yil: selectedYil,

      // reset full hierarchy when year changes
      viloyat: "",
      tuman: "",
      turi: "",
      turlar: [],
      vh: "",
      ndviDate: autoNdviDate,

      loading: true,
    },
    async () => {
      try {
        const w =
          typeof window !== "undefined"
            ? (window as Window & { __AGRI3_DEBUG_YEAR__?: string })
            : null;
        if (w)
          w.__AGRI3_DEBUG_YEAR__ = /\b2024\b/.test(selectedYil)
            ? "2024"
            : "";
      } catch {
        /* ignore */
      }
      try {
        await host.applyMapFiltersOptimized({ mode: "home", reason: "year" });
        host.warmYearRegionMapImages();
        await host.fetchDataWithCurrentState();
        host.broadcastFilterState();
      } catch (e) {
        if (host._isMounted)
          host.setState({ error: errorMessage(e), loading: false });
      }
    },
  );
};

export const applyLanguage = (host: LocalizationHost, lang: FilterState["language"]) => {
  if (!host._isMounted) return;
  if (!lang || lang === host.state.language) return;

  host.setState({ language: lang, openToolbarMenu: null }, () => {
    try {
      localStorage.setItem("app_lang", lang);
      localStorage.setItem("agri_app_lang", lang);
    } catch {
      /* ignore storage errors */
    }

    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          lang,
          language: lang,
          code: lang,
          source: "AgriLocalization",
          timestamp: Date.now(),
        },
        bubbles: true,
      }),
    );

    host.broadcastFilterState();
  });
};

export const applyYil = (host: LocalizationHost, selectedYil: string) => {
  if (!host._isMounted) return;

  const nextYil = host.normalizeApos(selectedYil ?? "");
  if (!nextYil || nextYil === host.state.yil) {
    host.setState({ openToolbarMenu: null });
    return;
  }

  const { ndviDateOptions } = host.state;
  const autoNdviDate =
    Array.isArray(ndviDateOptions) && ndviDateOptions.length
      ? ndviDateOptions[ndviDateOptions.length - 1]
      : "";

  host.setState(
    {
      yil: nextYil,
      viloyat: "",
      tuman: "",
      turi: "",
      turlar: [],
      vh: "",
      ndviDate: autoNdviDate,
      loading: true,
      openToolbarMenu: null,
    },
    async () => {
      try {
        await host.applyMapFiltersOptimized({ mode: "home", reason: "year" });
        host.warmYearRegionMapImages();
        await host.fetchDataWithCurrentState();
        host.broadcastFilterState();
      } catch (e) {
        if (host._isMounted)
          host.setState({ error: errorMessage(e), loading: false });
      }
    },
  );
};

export const handleNdviDateChange = (host: LocalizationHost, event: ValueChangeEvent) => {
  if (!host._isMounted) return;

  const raw = event?.target?.value ?? "";
  const ndviDate = String(raw).trim();

  // When a polygon graph is active in Graff, ignore manual NDVI date changes.
  if (host.state.polygonMode) {
    return;
  }

  host._ndviBucketToIds = {};
  host.setState(
    {
      ndviDate,
      vh: "",
      loading: true,
    },
    async () => {
      try {
        await host.applyMapFiltersOptimized({ mode: "selection", reason: "ndvi" });
        await host.fetchDataWithCurrentState();
        host.broadcastFilterState();
      } catch (e) {
        if (host._isMounted)
          host.setState({ error: errorMessage(e), loading: false });
      }
    },
  );
};

/** Keep first-selected-wins order for Pie ↔ VH chart scoping. */
export const syncChartDimOrder = (host: LocalizationHost, nextVh: string, nextTurlar: string[], resetGeography: boolean) => {
  if (resetGeography) {
    host._chartDimOrder = [];
    clearPieVhFilterUniqueIds();
    agriLog("chartDimOrder:reset", { reason: "geography" });
    return;
  }
  host._chartDimOrder = upsertChartDimOrder(
    host._chartDimOrder,
    "vh",
    Boolean(String(nextVh || "").trim()),
  );
  host._chartDimOrder = upsertChartDimOrder(
    host._chartDimOrder,
    "turi",
    nextTurlar.length > 0,
  );
  agriLog("chartDimOrder:sync", {
    nextVh: String(nextVh || "").trim() || null,
    nextTurlar,
    order: host._chartDimOrder.slice(),
    flags: host.getChartFilterFlags(
      String(nextVh || "").trim(),
      nextTurlar,
    ),
  });
};
