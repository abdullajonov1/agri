import type { PieWidgetHost } from "../pie-host";
import { DataSource, QueriableDataSource } from "jimu-core";
import { buildPieStatsWhere } from "../../../../controller/agri-where-builder";
import { getPieVhFilterUniqueIds } from "../../../../gis/agri-chart-filter-order";
import { buildSpatialJoinWhere, queryAgriTuriCropMappings, getAgriTableDataLayer } from "../../../../gis/agri-table-data-source";
import { normalizeCropName, getTuriCropLookupKey, getCropDisplayName, getCropColor as cropColorForTuri } from "../../../../shared/agri-crop-labels";
import type { AgriCropLanguage } from "../../../../shared/agri-crop-labels";
import { escapeArcGIS } from "../../../../gis/feature-layer-data";
import { getAgriDashboardBootstrap } from "../../../../data/agri-bootstrap";
import { JimuMapView } from "jimu-arcgis";
import { adjustHexColor as pieAdjustHexColor } from "../pie-colors";
import { APOSTROPHE_VARIANTS as pieApostropheVariants } from "../pie-colors";

export const getSliceBorderColor = (host: PieWidgetHost): string =>
  host.state.isDarkTheme ? "#1f2030" : "#ffffff";

export const getSliceFillStyle = (host: PieWidgetHost, baseColor: string): string | { type: "linear"; x: number; y: number; x2: number; y2: number; colorStops: Array<{ offset: number; color: string }> } => {
  const color = (baseColor || "#3b82f6").toLowerCase();
  if (color === "#E8E1D1" || color === "#fff") {
    return {
      type: "linear",
      x: 0,
      y: 0,
      x2: 1,
      y2: 1,
      colorStops: [
        { offset: 0, color: "#f8fafc" },
        { offset: 0.55, color: "#dbe4ee" },
        { offset: 1, color: "#94a3b8" },
      ],
    };
  }

  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: pieAdjustHexColor(baseColor, 34) },
      { offset: 0.48, color: baseColor },
      { offset: 1, color: pieAdjustHexColor(baseColor, -30) },
    ],
  };
};

export const initializeTheme = (host: PieWidgetHost) => {
  try {
    const savedTheme = localStorage.getItem("agri_v11_app_theme");
    const isDarkTheme =
      savedTheme !== null ? savedTheme === "dark" : true;
    host.setState({ isDarkTheme });
  } catch {
    host.setState({ isDarkTheme: true });
  }
};

export const handleThemeToggled = (host: PieWidgetHost, event: Event) => {
  const d: any = (event as CustomEvent)?.detail || {};
  if (typeof d.isDarkTheme === "boolean") {
    host.setState({ isDarkTheme: d.isDarkTheme });
    return;
  }

  if (d.theme === "dark" || d.theme === "light") {
    host.setState({ isDarkTheme: d.theme === "dark" });
    return;
  }

  try {
    const savedTheme = localStorage.getItem("agri_v11_app_theme");
    const isDarkTheme =
      savedTheme !== null ? savedTheme === "dark" : true;
    host.setState({ isDarkTheme });
  } catch {
    host.setState({ isDarkTheme: true });
  }
};

export const onDataSourceCreated = (host: PieWidgetHost, ds: DataSource) => {
  const queriableDs = ds as QueriableDataSource;

  if (typeof (queriableDs as any).setListenSelection === "function") {
    (queriableDs as any).setListenSelection(false);
  }
  host.setState({ dataSource: queriableDs, error: null }, async () => {
    if (host.state.connectionStatus === "connected") {
      await host.fetchCategoryData();
    }
  });
};

export const onDataSourceInfoChange = (host: PieWidgetHost, info: any) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") return;
  if (!info) return;

  const sawRecords = Array.isArray(info.records);
  if (!sawRecords) return;

  host.fetchCategoryData();
};

export function findFieldByPossibleNames(host: PieWidgetHost, possibleNames: string[]): string | null {
  const { dataSource } = host.state;
  if (!dataSource) return null;

  const schema = dataSource.getSchema();
  if (!schema || !schema.fields) return null;

  const fieldNames = Object.keys(schema.fields).map((f) => f.toLowerCase());

  for (const name of possibleNames) {
    const exact = fieldNames.findIndex((f) => f === name.toLowerCase());
    if (exact !== -1) return Object.keys(schema.fields)[exact];
  }
  for (const name of possibleNames) {
    const partial = fieldNames.findIndex((f) =>
      f.includes(name.toLowerCase()),
    );
    if (partial !== -1) return Object.keys(schema.fields)[partial];
  }
  return null;
}

export function findCategoryField(host: PieWidgetHost, flOverride?: __esri.FeatureLayer | null): string | null {
  // Prefer crop_id so spelling variants of the same crop stay one slice.
  const possible = ["crop_id", "turi", "ekin_turi", "crop_type"];

  const fl = flOverride ?? host.state.activeFeatureLayer;
  const fields = fl?.fields ?? [];
  if (fields.length) {
    const byLower = new Map(
      fields.map((f: any) => [String(f.name).toLowerCase(), f.name]),
    );
    for (const p of possible) {
      const exact = byLower.get(p.toLowerCase());
      if (exact) return exact;
    }
  }

  const fromDS = host.findFieldByPossibleNames(possible);
  if (fromDS) return fromDS;

  return "crop_id";
}

export function buildWhereClauseForDS(host: PieWidgetHost, opts: {
      includeCategory?: boolean;
      includeViloyat?: boolean;
      districtCode?: number | null;
    } = {}): string {
  const includeCategory = opts.includeCategory !== false;
  const includeViloyat = opts.includeViloyat !== false;
  // Match Agro_widgetV1: scope by selected viloyat (not lockedViloyat)
  // when includeViloyat is on; layer routing handles region layers.
  const { yil, viloyat, tuman, turi, lockedViloyat, turlar, farmerInn } =
    host.state;
  // Pie selection keys are crop_id; SQL still filters the `turi` text field.
  const turiNames = host.cropIdsToTuriNames(
    Array.isArray(turlar) && turlar.length
      ? turlar
      : turi
        ? [turi]
        : [],
  );

  return buildPieStatsWhere(
    {
      yil: yil || "",
      viloyat: viloyat || "",
      tuman: tuman || "",
      turi: turiNames.length === 1 ? turiNames[0] : "",
      turlar: turiNames,
      lockedViloyat: lockedViloyat || "",
      districtCode: opts.districtCode ?? null,
      farmerInn: farmerInn || "",
    },
    { includeCategory, includeViloyat },
  );
}

/** WHERE fragments for VH→pie uniqueid filter (empty = no VH scope). */
export function buildPieVhWhereChunks(host: PieWidgetHost, idsOverride?: string[] | null): string[] | null {
  if (!host.state.filterPieByVh) return null;
  const ids =
    idsOverride !== undefined ? idsOverride : getPieVhFilterUniqueIds();
  if (!ids) return null;
  if (!ids.length) return ["1=0"];
  const CHUNK = 800;
  const chunks: string[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    chunks.push(buildSpatialJoinWhere(ids.slice(i, i + CHUNK)));
  }
  return chunks;
}

export function normalizeName(host: PieWidgetHost, s: string): string {
  return normalizeCropName(s);
}

export async function ensureCropIdMaps(host: PieWidgetHost): Promise<void> {
  if (host._cropMapsReady) return;
  const rows = await queryAgriTuriCropMappings();
  const cropIdToTuri: Record<string, string> = {};
  const turiToCropId: Record<string, string> = {};
  for (const row of rows) {
    const id = String(row.cropId || "").trim();
    const turi = String(row.turi || "").trim();
    if (!id || !turi) continue;
    if (!cropIdToTuri[id]) cropIdToTuri[id] = turi;
    const turiKey = getTuriCropLookupKey(turi);
    if (turiKey && !turiToCropId[turiKey]) turiToCropId[turiKey] = id;
  }
  host._cropIdToTuri = cropIdToTuri;
  host._turiToCropId = turiToCropId;
  host._cropMapsReady = true;
}

export function resolveCropIdToTuri(host: PieWidgetHost, cropId: string): string {
  const id = String(cropId || "").trim();
  if (!id) return "";
  return host._cropIdToTuri[id] || id;
}

export function resolveTuriToCropId(host: PieWidgetHost, turi: string): string {
  const raw = String(turi || "").trim();
  if (!raw) return "";
  // Already a known crop_id.
  if (host._cropIdToTuri[raw]) return raw;
  const key = getTuriCropLookupKey(raw);
  if (key && host._turiToCropId[key]) return host._turiToCropId[key];
  return raw;
}

export function cropIdsToTuriNames(host: PieWidgetHost, ids: string[]): string[] {
  return Array.from(
    new Set(
      ids
        .map((id) => host.normalizeName(host.resolveCropIdToTuri(id)))
        .filter(Boolean),
    ),
  );
}

export function turiNamesToCropIds(host: PieWidgetHost, names: string[]): string[] {
  return Array.from(
    new Set(
      names
        .map((name) => String(host.resolveTuriToCropId(name) || "").trim())
        .filter(Boolean),
    ),
  );
}

export function getCropColor(host: PieWidgetHost, rawKey: string, index: number): string {
  const turi = host.resolveCropIdToTuri(rawKey);
  return cropColorForTuri(turi, index);
}

export function getCategoryDisplayName(host: PieWidgetHost, rawKey: string, language: AgriCropLanguage): string {
  const turi = host.resolveCropIdToTuri(rawKey);
  return getCropDisplayName(turi, language);
}

export function makeAposVariants(host: PieWidgetHost, s: string): string[] {
  const base = host.normalizeName(s);
  if (!base) return [""];
  if (!base.includes("'")) return [base];

  const mask = base.replace(/'/g, "\uFFFF");
  const variants = pieApostropheVariants.map((ch) =>
    mask.split("\uFFFF").join(ch),
  );
  return Array.from(new Set(variants));
}

export function eqAposSmart(host: PieWidgetHost, field: string, raw: string): string {
  const variants = host.makeAposVariants(raw);
  const clauses = variants
    .filter((v) => v)
    .map((v) => `${field}='${escapeArcGIS(v)}'`);
  if (!clauses.length) return "";
  return clauses.length === 1 ? clauses[0] : `(${clauses.join(" OR ")})`;
}

export function makeViloyatKey(host: PieWidgetHost, raw: string | null | undefined): string {
  if (raw == null) return "";
  return host.normalizeName(String(raw))
    .replace(/['ʻʼ`´]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const isRepublicLayer = (host: PieWidgetHost, layer?: __esri.FeatureLayer): boolean => {
  if (!layer) return false;
  const text =
    `${(layer as any)?.title || ""} ${(layer as any)?.id || ""} ${(layer as any)?.url || ""}`.toLowerCase();
  return /\brepublic\b|respublika/.test(text);
};

export const getDefaultFeatureLayer = (host: PieWidgetHost, layersOverride?: __esri.FeatureLayer[]): __esri.FeatureLayer | undefined => {
  const layers =
    (layersOverride && layersOverride.length
      ? layersOverride
      : host.state.featureLayers) || [];
  if (!layers.length) return host.state.activeFeatureLayer;

  const republic = layers.find((l) => host.isRepublicLayer(l));
  if (republic) return republic;

  return layers[0] || host.state.activeFeatureLayer;
};

export const getFeatureLayerForViloyat = (host: PieWidgetHost, viloyat: string): __esri.FeatureLayer | undefined => {
  const layers = host.state.featureLayers ?? [];
  if (!layers.length) return undefined;
  const key = host.makeViloyatKey(viloyat);
  if (!key) return undefined;
  const idx = host._viloyatKeyToLayerIndex[key];
  if (typeof idx === "number" && layers[idx]) return layers[idx];
  return host.state.activeFeatureLayer || layers[0];
};

export const resolveFeatureLayersFromUseDataSources = async (host: PieWidgetHost): Promise<
    __esri.FeatureLayer[]
  > => {
  // Agri_table_data is an external Table, not a builder-assigned Data
  // Source or a map layer — it is loaded directly by URL.
  try {
    const { layer } = await getAgriTableDataLayer();
    return [layer as __esri.FeatureLayer];
  } catch (e) {
    return [];
  }
};

// resolveFeatureLayersFromUseDataSources() always resolves exactly one
// shared Agri_table_data layer, so every viloyat maps to index 0 anyway
// (same as the layers[0] fallback in getFeatureLayerForViloyat) — no
// distinct-viloyat scan is needed; use the already-shared/cached region
// mapping only if multiple layers ever appear.
export const buildViloyatKeyToLayerIndex = async (host: PieWidgetHost, layers: __esri.FeatureLayer[]): Promise<void> => {
  host._viloyatKeyToLayerIndex = {};
  if (layers.length <= 1) return;

  try {
    const { regionDistrictRows } = await getAgriDashboardBootstrap();
    for (const row of regionDistrictRows) {
      const key = host.makeViloyatKey(row.viloyat);
      if (key && host._viloyatKeyToLayerIndex[key] === undefined) {
        host._viloyatKeyToLayerIndex[key] = 0;
      }
    }
  } catch (e) {}
};

export const ensureFeatureLayersResolved = async (host: PieWidgetHost): Promise<
    __esri.FeatureLayer | undefined
  > => {
  // Already resolved: still need to re-route to the correct layer for current viloyat
  if ((host.state.featureLayers?.length ?? 0) > 0) {
    const nextActive = host.state.viloyat
      ? host.getFeatureLayerForViloyat(host.state.viloyat)
      : host.getDefaultFeatureLayer(host.state.featureLayers);

    if (nextActive && host.state.activeFeatureLayer?.id !== nextActive.id) {
      host.setState({ activeFeatureLayer: nextActive });
    }

    return nextActive;
  }

  if (!host._featureLayersInitPromise) {
    host._featureLayersInitPromise = (async () => {
      const layers = await host.resolveFeatureLayersFromUseDataSources();
      host.setState({ featureLayers: layers });

      await host.buildViloyatKeyToLayerIndex(layers);
    })();
  }

  await host._featureLayersInitPromise;

  const nextActive = host.state.viloyat
    ? host.getFeatureLayerForViloyat(host.state.viloyat)
    : host.getDefaultFeatureLayer(host.state.featureLayers);

  host.setState({ activeFeatureLayer: nextActive });
  return nextActive;
};

export const waitForMapToLoad = (host: PieWidgetHost, jimuMapView: JimuMapView): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!jimuMapView || !jimuMapView.view) {
      reject(new Error("Invalid map view provided"));
      return;
    }
    if (jimuMapView.view.ready) {
      resolve();
      return;
    }

    const timeout = setTimeout(
      () => reject(new Error("Map load timeout")),
      host.CONNECTION_TIMEOUT_MS,
    );
    const watchHandle = jimuMapView.view.watch("ready", (isReady) => {
      if (isReady) {
        clearTimeout(timeout);
        watchHandle.remove();
        resolve();
      }
    });
  });
};

// Minimal connection: we just store the view and mark as connected
export const connectToMap = async (host: PieWidgetHost, jimuMapView: JimuMapView): Promise<void> => {
  if (!jimuMapView?.view?.map)
    throw new Error("Map view has no map property");
  return new Promise((resolve) => {
    host.setState(
      {
        activeMapView: jimuMapView,
        connectionStatus: "connected",
        error: null,
        debugInfo: "Connected to map",
      },
      resolve,
    );
  });
};

export const initializeAfterConnection = (host: PieWidgetHost): void => {
  if (host._didInitOnce) return;
  host._didInitOnce = true;

  if (
    !host.state.activeMapView ||
    host.state.connectionStatus !== "connected"
  )
    return;

  if (host.props.externalFilters) {
    const f = host.props.externalFilters;
    host.setState(
      {
        yil: f.yil || "",
        viloyat: f.viloyat || "",
        tuman: f.tuman || "",
        turi: f.turi || "",
        debugInfo: "External filters applied from props",
      },
      () => host.fetchCategoryData(),
    );
  } else {
    host.fetchCategoryData();
  }
};

export const onActiveViewChange = async (host: PieWidgetHost, jimuMapView: JimuMapView) => {
  if (!jimuMapView) {
    // Treat as fallback: still allow data load (no map interaction needed)
    if (host.state.mapConnectionAttempts === 0) {
      host.setState({
        mapLoadingStatus: "failed",
        mapConnectionAttempts: 1,
        debugInfo: "No map view provided",
      });
    }
    host.setState(
      { connectionStatus: "connected", debugInfo: "Proceeding without map" },
      () => {
        host.fetchCategoryData();
      },
    );
    return;
  }

  host.setState({ mapLoadingStatus: "loading", error: null });

  try {
    const loadingTimeout = setTimeout(() => {
      if (host._isMounted && host.state.mapLoadingStatus === "loading") {
        host.setState(
          {
            connectionStatus: "connected",
            mapLoadingStatus: "loaded",
            debugInfo: "Timeout, proceeding",
          },
          () => {
            host.fetchCategoryData();
          },
        );
      }
    }, host.CONNECTION_TIMEOUT_MS);

    await host.waitForMapToLoad(jimuMapView);
    clearTimeout(loadingTimeout);

    host.setState({
      mapLoadingStatus: "loaded",
      connectionStatus: "connecting",
      debugInfo: "Map loaded, connecting",
    });

    await host.connectToMap(jimuMapView);
    host.initializeAfterConnection();
  } catch (err) {
    host.setState(
      {
        error: `Map initialization issue: ${(err as Error).message}`,
        mapLoadingStatus: (err as Error).message.includes("timeout")
          ? "failed"
          : host.state.mapLoadingStatus,
        connectionStatus: "connected",
        debugInfo: `Error: ${(err as Error).message}, continuing`,
      },
      () => host.fetchCategoryData(),
    );
  }
};

export const retryMapConnection = (host: PieWidgetHost) => {
  host.setState({
    connectionStatus: "idle",
    mapLoadingStatus: "idle",
    mapConnectionAttempts: 0,
    error: null,
    debugInfo: "Manual retry initiated",
  });
};
