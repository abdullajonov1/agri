import type { GraffWidgetHost } from "../graff-host";
import type { VegetationIndiceType } from "../../../../gis/agri-polygon-api-source";
import { clearMapSelectionGraphics, isAgriSpatialLayerUrl, isLayerTreeVisible } from "../graff-map-utils";
import { buildGidvSmartWhere, buildUniqueidUpperEqualsWhere } from "../../../../data/agri-uniqueid-sql";
import { escapeLikeLiteral } from "../../../../data/agri-sql";
import { AGRI_TABLE_JOIN_FIELD } from "../../../../gis/agri-table-data-source";
import { ensureAgriServerIdentityToken, resolveQueryableServiceUrl, getDetachedQueryLayerForUrl, isMapImageGroupSublayer, collectQueryableFieldLayers, getQueryableLayer, getMapImageParentLayer, scoreHaystackForFilters, haystackMatchesRegion, escapeArcGIS, isMapImageOwnedLayer } from "../../../../gis/feature-layer-data";
import { buildYearLikeClause } from "../../../../controller/agri-where-builder";
import type { RecordData } from "../widget";
import { graffLog } from "../graff-log";

/**
 * ✅ MAIN INPUT: Master filter state from AgriFilter
 * - reacts to yil + viloyat + tuman + turi + vh
 */
export const handleMasterFilterChanged = (host: GraffWidgetHost, event: Event) => {
  if (!host._isMounted) return;

  const d: any = (event as CustomEvent).detail || {};
  if (!d?.filters) return;

  if (d.source === "AgriGraffWidget") return;

  const eventTs =
    typeof d?.meta?.timestamp === "number" && Number.isFinite(d.meta.timestamp)
      ? d.meta.timestamp
      : 0;
  const eventGen =
    typeof d?.meta?.broadcastGeneration === "number" &&
    Number.isFinite(d.meta.broadcastGeneration)
      ? d.meta.broadcastGeneration
      : 0;
  if (
    eventGen > 0 &&
    host._lastMasterFilterBroadcastGeneration > 0 &&
    eventGen < host._lastMasterFilterBroadcastGeneration
  ) {
    graffLog("handleMasterFilterChanged:SKIP-stale-generation", {
      eventGen,
      lastGen: host._lastMasterFilterBroadcastGeneration,
      viloyat: d.filters?.viloyat,
      tuman: d.filters?.tuman,
    });
    return;
  }
  if (
    eventTs > 0 &&
    host._lastMasterFilterTs > 0 &&
    eventTs < host._lastMasterFilterTs
  ) {
    graffLog("handleMasterFilterChanged:SKIP-stale-timestamp", {
      eventTs,
      lastTs: host._lastMasterFilterTs,
      viloyat: d.filters?.viloyat,
      tuman: d.filters?.tuman,
    });
    return;
  }
  if (eventGen > 0) host._lastMasterFilterBroadcastGeneration = eventGen;
  if (eventTs > 0) host._lastMasterFilterTs = eventTs;

  const f = d.filters || {};
  host._barCategoryField = String(f.barCategoryField || "").trim();
  host._barCategoryValue = String(f.barCategoryValue || "").trim();

  const nextLanguage: "uz_cyr" | "uz_lat" | "ru" | "en" =
    (f.language as any) || host.state.language || "ru";

  // AgriFilter may provide the active "locked viloyat" via scope.
  // In that case, f.viloyat can be empty, so we still need to route queries to the locked layer.
  const lockedViloyat = d?.scope?.lockedViloyat
    ? host.normalizeApos(String(d.scope.lockedViloyat))
    : "";

  // Try to capture numeric region code from AgriFilter WHERE clause, if available
  let regionalRegionCode: number | null =
    host.state.regionalRegionCode ?? null;
  let regionCodeCameFromEvent = false;
  let regionalDistrictCode: number | null = null;
  let districtCodeCameFromEvent = false;
  const whereClause: string | undefined = d?.meta?.whereClause;
  if (typeof whereClause === "string") {
    const match = whereClause.match(/region\s*=\s*'?(\d+)'?/i);
    if (match && match[1]) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) {
        regionalRegionCode = parsed;
        regionCodeCameFromEvent = true;
      }
    }
    const districtMatch = whereClause.match(/district\s*=\s*'?(\d+)'?/i);
    if (districtMatch && districtMatch[1]) {
      const parsed = Number(districtMatch[1]);
      if (Number.isFinite(parsed)) {
        regionalDistrictCode = parsed;
        districtCodeCameFromEvent = true;
      }
    }
  }

  // A polygon was selected/deselected elsewhere (e.g. AgriPopup's map
  // click inspector) — sync our own chart to it. Only when geography is
  // unchanged: a Back/region change must exit single-field mode even if a
  // stale broadcast still carries uniqueid/polygonMode.
  const effectiveViloyatEarly =
    lockedViloyat || (f.viloyat ? host.normalizeApos(String(f.viloyat)) : "");
  const effectiveTumanForSync = f.tuman
    ? host.normalizeApos(String(f.tuman))
    : "";
  const geographyChangingForSync =
    effectiveViloyatEarly !== host.state.regionalFilters.viloyat ||
    effectiveTumanForSync !== host.state.regionalFilters.tuman ||
    String(f.yil || "") !== host.state.regionalFilters.yil;

  if (geographyChangingForSync) {
    host.syncExternalPolygonSelection("", false, regionalRegionCode);
  } else {
    host.syncExternalPolygonSelection(
      f.uniqueid ? String(f.uniqueid).trim() : "",
      Boolean(f.polygonMode),
      regionalRegionCode,
      typeof f.uniqueidClickedAt === "number" ? f.uniqueidClickedAt : undefined,
    );
  }

  const effectiveViloyat = effectiveViloyatEarly;

  // Never retain a code belonging to the previous viloyat. If this event
  // does not carry a fresh numeric code, the name→region mapping below is
  // safer than reusing stale state.
  const viloyatChanged =
    effectiveViloyat !== host.state.regionalFilters.viloyat;
  if (!effectiveViloyat || (viloyatChanged && !regionCodeCameFromEvent)) {
    regionalRegionCode = null;
  }

  const effectiveTumanEarly = f.tuman ? host.normalizeApos(String(f.tuman)) : "";
  const tumanChanged =
    effectiveTumanEarly !== host.state.regionalFilters.tuman;
  if (!effectiveTumanEarly || (tumanChanged && !districtCodeCameFromEvent)) {
    regionalDistrictCode = null;
  }

  if (
    regionalDistrictCode != null &&
    Number.isFinite(regionalDistrictCode) &&
    effectiveTumanEarly &&
    effectiveViloyat
  ) {
    host.storeRegionDistrictMappingRow(
      effectiveViloyat,
      regionalRegionCode,
      effectiveTumanEarly,
      regionalDistrictCode,
    );
  }

  const next: {
    viloyat: string;
    tuman: string;
    yil: string;
    uzspace: string;
    turlar: string[];
    vh: string;
  } = {
    viloyat: effectiveViloyat,
    tuman: f.tuman ? host.normalizeApos(String(f.tuman)) : "",
    yil: f.yil ? String(f.yil) : "",
    uzspace:
      Array.isArray(f.turlar) && f.turlar.length === 1
        ? host.normalizeApos(String(f.turlar[0]))
        : f.turi
          ? host.normalizeApos(String(f.turi))
          : "",
    turlar: Array.isArray(f.turlar)
      ? Array.from(
          new Set(
            (f.turlar as unknown[])
              .map((value: unknown) =>
                host.normalizeApos(String(value || "")),
              )
              .filter(Boolean),
          ),
        )
      : f.turi
        ? [host.normalizeApos(String(f.turi))]
        : [],
    vh: f.vh ? host.normalizeApos(String(f.vh)) : "", // ✅ vh
  };

  // We now filter directly on layer fields (including per-date status fields)
  // instead of receiving giant uniqueid IN (...) lists from AgriFilter.
  const vhUniqueids: string[] | null = Array.isArray(d.vhUniqueids)
    ? Array.from(
        new Set(
          (d.vhUniqueids as unknown[])
            .map((id) => String(id || "").trim())
            .filter(Boolean),
        ),
      )
    : null;

  // ✅ Defensive: if parent changed and vh not included properly, clear it
  const parentChanged =
    next.yil !== host.state.regionalFilters.yil ||
    next.viloyat !== host.state.regionalFilters.viloyat ||
    next.tuman !== host.state.regionalFilters.tuman ||
    next.uzspace !== host.state.regionalFilters.uzspace ||
    JSON.stringify(next.turlar || []) !==
      JSON.stringify(host.state.regionalFilters.turlar || []);

  if (parentChanged && next.vh && next.vh === host.state.regionalFilters.vh) {
    // keep
  } else if (parentChanged && !f.vh) {
    next.vh = "";
  }

  const ndviDate = f.ndviDate ? String(f.ndviDate) : "";
  const geographyUnchanged = !host.filtersChanged(
    host.state.regionalFilters,
    next,
  );
  // Localization always sends polygonMode/uniqueid on every broadcast.
  // Only treat as polygon-only when a field is being focused or cleared —
  // bare polygonMode:false must not swallow VH uniqueid follow-ups.
  const incomingUniqueid =
    typeof f.uniqueid === "string" ? String(f.uniqueid).trim() : "";
  const hadSelectedField = Boolean(
    String(host.state.selecteduniqueid || "").trim(),
  );
  const polygonOnlyEvent =
    f.polygonMode === true ||
    incomingUniqueid !== "" ||
    (f.polygonMode === false &&
      hadSelectedField &&
      incomingUniqueid === "");
  // Pending null → resolved id list (or empty []) must refresh Jadval.
  const vhIdsSig = (ids: string[] | null): string =>
    ids == null
      ? "null"
      : `${ids.length}:${ids[0] || ""}:${ids[ids.length - 1] || ""}`;
  const vhIdsChanged =
    vhIdsSig(vhUniqueids) !== vhIdsSig(host.state.vhUniqueids);

  const nextFarmerInn = String(f.farmerInn || "").trim();
  const farmerInnChanged =
    nextFarmerInn !== String(host.state.farmerInn || "").trim();

  // Polygon pick/clear does not change geography. syncExternal already
  // cleared selectedNdviDate, so comparing against the hub's effective
  // ndviDate would falsely fall through into scheduleRefresh /
  // applyMapFilters — rewriting MapImage definitionExpression and racing
  // the popup click path.
  if (
    geographyUnchanged &&
    polygonOnlyEvent &&
    !vhIdsChanged &&
    !farmerInnChanged
  ) {
    if (nextLanguage !== host.state.language) {
      host.setState({ language: nextLanguage });
    }
    return;
  }

  if (
    geographyUnchanged &&
    ndviDate === (host.state.selectedNdviDate || "") &&
    !vhIdsChanged &&
    !farmerInnChanged
  ) {
    // Language-only change: update UI state, but don't refetch data.
    if (nextLanguage !== host.state.language) {
      host.setState({ language: nextLanguage });
    }
    return;
  }

  

  const targetLayer = effectiveViloyat
    ? host.getFeatureLayerForViloyat(effectiveViloyat) ||
      host.state.featureLayer
    : host.state.featureLayer;

  // If parent geography/time changed, polygon selection becomes stale.
  // Also release the field when a VH status is active and the polygon is
  // not in that status's uniqueid list — then show regional VH chart.
  const selectedId = String(host.state.selecteduniqueid || "").trim();
  const selectedClean = selectedId.replace(/[{}]/g, "").toLowerCase();
  const vhActive = !!String(next.vh || "").trim();
  const polygonNotInVhStatus =
    !!selectedClean &&
    vhActive &&
    Array.isArray(vhUniqueids) &&
    !vhUniqueids.some(
      (id) =>
        String(id || "")
          .replace(/[{}]/g, "")
          .toLowerCase() === selectedClean,
    );
  const shouldClearPolygonSelection =
    !!selectedId &&
    (next.viloyat !== host.state.regionalFilters.viloyat ||
      next.tuman !== host.state.regionalFilters.tuman ||
      next.yil !== host.state.regionalFilters.yil ||
      polygonNotInVhStatus);

  // Search filter is scoped to the previous geography — clear on yil/viloyat/tuman,
  // unless master filter still carries an active header STIR selection.
  const shouldClearSearch =
    !nextFarmerInn &&
    (next.viloyat !== host.state.regionalFilters.viloyat ||
      next.tuman !== host.state.regionalFilters.tuman ||
      next.yil !== host.state.regionalFilters.yil);

  if (shouldClearPolygonSelection || shouldClearSearch) {
    // Prevent restoring a pre-selection extent from a previous geography.
    host._extentBeforeTableSelection = null;
  }

  const vhChanged = next.vh !== host.state.regionalFilters.vh;
  const willHavePolygon =
    !!selectedId && !shouldClearPolygonSelection;
  const shouldRefreshGraph =
    host.state.viewMode === "graph" &&
    (shouldClearPolygonSelection || !willHavePolygon || vhChanged);
  // Republic default is NDVI-only — drop SAVI/RVI/etc. when viloyat clears.
  const returningToRepublic =
    !String(next.viloyat || "").trim() &&
    !!String(host.state.regionalFilters.viloyat || "").trim();

  host.setState(
    {
      regionalFilters: next,
      featureLayer: targetLayer,
      regionalRegionCode,
      regionalDistrictCode,
      vhUniqueids,
      selectedNdviDate: ndviDate || null,
      selectedChartIndexKey: null,
      selectedIndices: returningToRepublic
        ? (["ndvi"] as VegetationIndiceType[])
        : host.state.selectedIndices,
      selectedMonth: parentChanged ? null : host.state.selectedMonth,
      isMonthPickerOpen: false,
      chartTooltip: parentChanged ? null : host.state.chartTooltip,
      selecteduniqueid: shouldClearPolygonSelection
        ? ""
        : host.state.selecteduniqueid,
      // Keep previous graph series while the next filter result loads (Agrobank morph).
      vegetationData: host.state.vegetationData,
      vegetationError: null,
      loadingVegetation: shouldRefreshGraph
        ? true
        : host.state.loadingVegetation,
      farmerInn: nextFarmerInn,
      searchText: nextFarmerInn
        ? nextFarmerInn
        : shouldClearSearch
          ? ""
          : host.state.searchText,
      searchError: shouldClearSearch && !nextFarmerInn
        ? null
        : host.state.searchError,
      searchResultCount: shouldClearSearch && !nextFarmerInn
        ? null
        : host.state.searchResultCount,
      isSearchActive: nextFarmerInn
        ? true
        : shouldClearSearch
          ? false
          : host.state.isSearchActive,
      records: [],
      currentPage: 1,
      loading: true,
      language: nextLanguage,
    },
      () => {
        host.publishVegetationOverlayContext();
        if (shouldClearPolygonSelection) {
          host.cancelVegetationImageOverlay();
          clearMapSelectionGraphics(host.state.activeMapView?.view);
          try {
            document.dispatchEvent(
              new CustomEvent("widgetSelectionChanged", {
                detail: {
                  source: "AgriGraffWidget",
                  polygonMode: false,
                  uniqueid: "",
                  timestamp: Date.now(),
                },
                bubbles: true,
              }),
            );
          } catch {}
        }
        host.scheduleRefresh();
        if (host.state.viewMode === "graph" && !host.state.selecteduniqueid) {
          host.fetchRegionalTimeseries();
        } else if (
          host.state.viewMode === "graph" &&
          host.state.selecteduniqueid &&
          vhChanged
        ) {
          // Polygon still in VH status — keep field chart, but refresh series.
          host.fetchVegetationData();
        }
      },
  );
};

/** Read setting: 'uniqueid' | 'gidv' (defaults to 'uniqueid') */
export const getSearchField = (host: GraffWidgetHost): "uniqueid" | "gidv" => {
  const cfg: any = host.props?.config;
  const val = cfg?.get ? cfg.get("searchField") : cfg?.searchField;
  return val === "gidv" ? "gidv" : "uniqueid";
};

/** Build WHERE for GIDV smart search (accepts plain GUID, {GUID}, or the SU{GUID} style) */
export const buildGidvWhere = (host: GraffWidgetHost, raw: string, field: string = "gidv") =>
  buildGidvSmartWhere(raw, field);

/** Build WHERE for search text: INN (STIR) like OR farmer name like */
export const buildSearchWhere = (host: GraffWidgetHost, raw: string): string => {
  const term = (raw || "").trim();
  if (!term) return "1=0";

  const farmerField = host.resolveFieldCaseInsensitive("f_name") || "f_name";
  const innField = host.resolveFieldCaseInsensitive("f_inn") || "f_inn";
  const escaped = escapeLikeLiteral(term);

  const farmerLikeClause = `UPPER(${farmerField}) LIKE UPPER('%${escaped}%')`;
  const innLikeClause = `UPPER(${innField}) LIKE UPPER('%${escaped}%')`;

  return `(${innLikeClause} OR ${farmerLikeClause})`;
};

/** Agri_table_data has no geometry — look up the matching spatial feature (for highlight/zoom) by uniqueid. */
export const findSpatialFeatureByUniqueId = async (host: GraffWidgetHost, uniqueId: string): Promise<__esri.Graphic | null> => {
  const id = String(uniqueId || "").trim();
  if (!id) return null;
  const where = buildUniqueidUpperEqualsWhere(id, AGRI_TABLE_JOIN_FIELD);
  if (!where || where === "1=0") return null;
  await ensureAgriServerIdentityToken();
  for (const spatialLayer of host.getTableSpatialQueryCandidates()) {
    const url = resolveQueryableServiceUrl(spatialLayer);
    if (!url) continue;
    let detached = host._detachedSpatialQueryLayers.get(url);
    if (!detached) {
      try {
        detached = await getDetachedQueryLayerForUrl(url);
        if (detached) host._detachedSpatialQueryLayers.set(url, detached);
      } catch {
        detached = null as any;
      }
    }
    if (!detached) continue;
    const q = detached.createQuery();
    q.outFields = ["*"];
    q.returnGeometry = true;
    q.num = 1;
    q.where = where;
    try {
      const res = await detached.queryFeatures(q);
      if (res?.features?.length) return res.features[0];
    } catch {
      /* try next layer */
    }
  }
  return null;
};

export const getTableSpatialQueryCandidates = (host: GraffWidgetHost): __esri.FeatureLayer[] => {
  const candidates: __esri.FeatureLayer[] = [];
  const seen = new Set<string>();
  const filters = {
    yil: String(host.state.regionalFilters?.yil || "").trim(),
    viloyat: String(host.state.regionalFilters?.viloyat || "").trim(),
  };
  const add = (layer: any) => {
    if (!layer || isMapImageGroupSublayer(layer)) return;
    const rawUrl = resolveQueryableServiceUrl(layer);
    if (!rawUrl || !isAgriSpatialLayerUrl(rawUrl)) return;
    // FeatureLayer queries need a leaf endpoint — MapServer roots always 499/fail.
    if (!/\/(?:MapServer|FeatureServer)\/\d+$/i.test(rawUrl)) return;
    const key = rawUrl.toLowerCase();
    if (seen.has(key)) return;
    const fields = (layer.fields || []).map((field: any) =>
      String(field?.name || "").toLowerCase(),
    );
    if (
      fields.length &&
      !fields.includes("uniqueid") &&
      !fields.includes(AGRI_TABLE_JOIN_FIELD) &&
      !fields.includes("turi") &&
      !fields.includes("crop_id")
    ) {
      return;
    }
    seen.add(key);
    // Stash resolved URL so the query loop does not re-derive from a bad live.url
    try {
      (layer as any).__agriQueryableUrl = rawUrl;
    } catch {
      /* ignore */
    }
    candidates.push(layer as __esri.FeatureLayer);
  };

  (host.state.spatialClickLayers || []).forEach(add);
  const map: any = host.state.activeMapView?.view?.map;
  // allLayers is essential here: map.layers only contains top-level
  // GroupLayers in this portal, while the regional MapImageLayers live
  // below database-YYYY groups.
  const roots: any[] = map?.allLayers?.toArray?.() || map?.layers?.toArray?.() || [];
  for (const root of roots) {
    for (const leaf of collectQueryableFieldLayers(root)) {
      add(leaf);
    }
    // Fallback when collectQueryableFieldLayers finds nothing yet (still hydrating)
    add(getQueryableLayer(root));
  }

  const scored = candidates.map((layer: any) => {
    const parent = getMapImageParentLayer(layer) as any;
    const haystack = `${parent?.title || ""} ${layer?.title || ""} ${
      (layer as any).__agriQueryableUrl || resolveQueryableServiceUrl(layer)
    }`;
    let score = scoreHaystackForFilters(haystack, filters);
    if (isLayerTreeVisible(layer)) score += 50;
    if (haystackMatchesRegion(haystack, filters.viloyat)) score += 40;
    return { layer, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Cap: wrong-year republic leaves burn tokens and hide the real miss.
  return scored.slice(0, 8).map((item) => item.layer);
};

export const runAutoSearch = async (host: GraffWidgetHost, termRaw: string) => {
  if (!host._isMounted) return;
  const { featureLayer, activeMapView } = host.state;

  const term = (termRaw || "").trim();

  
  if (!term) {
    host.setState({ searchLoading: false, searchError: null, searchResultCount: null });
    return;
  }

  if (!featureLayer || !activeMapView) {
    host.setState({ searchError: "Харита ёки қатлам ҳали уланмаган." });
    return;
  }

  try {
    host.setState({ searchLoading: true, searchError: null, searchResultCount: null });

    const q = featureLayer.createQuery();
    q.outFields = ["*"];
    q.returnGeometry = true;
    
    // ✅ Combine search WHERE with regional filters (viloyat/tuman/yil/uzspace)
    const searchWhere = host.buildSearchWhere(term);
    const { viloyat, tuman, yil, uzspace } = host.state.regionalFilters;
    const clauses: string[] = [searchWhere];
    
    const layerFields =
      featureLayer?.fields?.map((f) => f.name.toLowerCase()) ?? [];
    const hasRegion = layerFields.includes("region");
    const hasDistrict = layerFields.includes("district");
    const regionField = featureLayer?.fields?.find(
      (ff) => ff?.name?.toLowerCase() === "region",
    );
    const districtField = featureLayer?.fields?.find(
      (ff) => ff?.name?.toLowerCase() === "district",
    );
    const isRegionString = (regionField?.type || "")
      .toLowerCase()
      .includes("string");
    const isDistrictString = (districtField?.type || "")
      .toLowerCase()
      .includes("string");
    
    // Add viloyat regional filter
    if (viloyat) {
      const effectiveViloyat = host.normalizeApos(viloyat);
      const vilKey = host.makeRegionDistrictKey(effectiveViloyat);
      if (hasRegion && /^\d+$/.test(effectiveViloyat)) {
        clauses.push(
          isRegionString
            ? `region = '${escapeArcGIS(effectiveViloyat)}'`
            : `region = ${Number(effectiveViloyat)}`,
        );
      } else if (hasRegion && vilKey && host._viloyatToRegion[vilKey] !== undefined) {
        const regionNum = host._viloyatToRegion[vilKey];
        clauses.push(
          isRegionString
            ? `region = '${escapeArcGIS(String(regionNum))}'`
            : `region = ${regionNum}`,
        );
      } else {
        clauses.push(host.eqAposSmart("viloyat", viloyat));
      }
    }
    
    // Add tuman district filter
    if (tuman) {
      const effectiveTuman = host.normalizeApos(tuman);
      const districtNum = /^\d+$/.test(effectiveTuman)
        ? Number(effectiveTuman)
        : host.resolveDistrictNumber(viloyat, tuman);
      if (hasDistrict && districtNum != null && Number.isFinite(districtNum)) {
        clauses.push(
          isDistrictString
            ? `district = '${escapeArcGIS(String(districtNum))}'`
            : `district = ${districtNum}`,
        );
      } else {
        const tumanClause = host.buildTumanNameClause(tuman, viloyat);
        if (tumanClause) clauses.push(tumanClause);
      }
    }
    
    // Add year filter
    if (yil) {
      const yearClause = buildYearLikeClause(yil, { digitFallback: false });
      if (yearClause) clauses.push(yearClause);
    }
    
    // Add category filter
    if (uzspace) {
      const catField = host.getCategoryFieldName();
      if (catField) clauses.push(host.eqAposSmart(catField, uzspace));
    }
    
    q.where = clauses.join(" AND ");

    const fs = await featureLayer.queryFeatures(q);
    const found = fs?.features?.length ?? 0;
    host.setState({ searchResultCount: found });

    if (!found) {
      host.setState({ searchError: "Излаш бўйича объект топилмади." });
      return;
    }

    const feat = fs.features[0];
    const gid = (feat.attributes?.uniqueid || "").toString();

    // Agri_table_data itself has no geometry — resolve the matching
    // spatial polygon feature (by uniqueid) for highlight/zoom.
    const spatialFeat = gid
      ? await host.findSpatialFeatureByUniqueId(gid)
      : null;

    if (spatialFeat?.geometry) {
      try {
        clearMapSelectionGraphics(activeMapView.view);
        host.addSelectionGlow(activeMapView.view, spatialFeat);
      } catch {}

      try {
        await activeMapView.view.goTo(
          spatialFeat.geometry?.extent?.expand(1.35) || spatialFeat.geometry,
          { duration: 700, easing: "ease-in-out" as any },
        );
      } catch {}
    }

    if (gid) {
      host.cancelVegetationImageOverlay();

      host.setState({
        selecteduniqueid: gid,
        searchText: term,
        isSearchActive: true,  // Enable search WHERE filter
        records: [],
        currentPage: 1,
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        polygonAvailableDates: [],
        polygonImageError: null,
      }, () => {
        // Fetch table data filtered by search term
        host.fetchData();
      });
    }
  } catch (err: any) {
    host.setState({ searchError: err?.message || "Излаш амалга ошмади." });
  } finally {
    host.setState({ searchLoading: false });
  }
};

export const clearSelectionAfterSearchClear = async (host: GraffWidgetHost) => {
  const { featureLayer, activeMapView, selecteduniqueid } = host.state;
  if (!selecteduniqueid) return;

  clearMapSelectionGraphics(activeMapView?.view);
  host.cancelVegetationImageOverlay();

  const restoreExtent = host._extentBeforeTableSelection;
  host._extentBeforeTableSelection = null;
  if (restoreExtent && activeMapView?.view) {
    try {
      await activeMapView.view.goTo(restoreExtent, {
        duration: 700,
        easing: "ease-in-out" as any,
      });
    } catch {
      /* navigation interruption is harmless */
    }
  }

  host.setState(
    {
      selecteduniqueid: "",
      selectedNdviDate: null,
      selectedChartIndexKey: null,
      polygonAvailableDates: [],
      polygonImageError: null,
      vegetationError: null,
    },
    () => {
      try {
        const baseWhere = host.buildWhereClause();
        if (featureLayer && !isMapImageOwnedLayer(featureLayer)) {
          (featureLayer as any).definitionExpression = baseWhere || "1=0";
        }
        (host.state.dataSource as any)?.setDefinitionExpression?.(
          baseWhere || "1=0",
        );
      } catch {}
      try {
        document.dispatchEvent(
          new CustomEvent("widgetSelectionChanged", {
            detail: {
              source: "AgriGraffWidget",
              polygonMode: false,
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      } catch {}
      if (host.state.viewMode === "graph") {
        host.fetchRegionalTimeseries();
      }
    },
  );
};

export const handleExternalTableSearchChanged = (host: GraffWidgetHost, event: Event) => {
  if (!host._isMounted) return;

  const detail: any = (event as CustomEvent).detail || {};
  const nextQuery = String(detail?.query ?? "").trim();
  const preserveSelection = Boolean(detail?.preserveSelection);

  if (!nextQuery) {
    host.setState(
      {
        searchText: "",
        searchError: null,
        searchResultCount: null,
        isSearchActive: false,
        farmerInn: "",
      },
      () => {
        if (!preserveSelection) {
          void host.clearSelectionAfterSearchClear();
        }
        if (host.state.connectionStatus === "connected") {
          void host.fetchData();
        }
      },
    );
    return;
  }

  host.setState(
    {
      searchText: nextQuery,
      searchError: null,
      isSearchActive: true,
      // Committed header selection only (typing no longer emits this event).
      farmerInn: /^\d{5,}$/.test(nextQuery)
        ? nextQuery
        : String(host.state.farmerInn || "").trim(),
    },
    () => {
      if (host.state.connectionStatus === "connected") {
        void host.fetchData();
      }
    },
  );
};

export const handleExternalTableRowSelected = async (host: GraffWidgetHost, event: Event) => {
  if (!host._isMounted) return;

  const detail: any = (event as CustomEvent).detail || {};
  if (detail?.source === "AgriGraffWidget") return;

  const record = detail?.record as RecordData | undefined;
  if (!record || !record.uniqueid) return;

  const selectedId = String(record.uniqueid).replace(/[{}]/g, "");

  // If the record is already in the table, just trigger handleRowClick
  const exists = host.state.records.some((row) => {
    return String(row.uniqueid || "").replace(/[{}]/g, "") === selectedId;
  });

  if (exists) {
    await host.handleRowClick(record);
    return;
  }

  // Prepend record so handleRowClick can find it, then select it
  await new Promise<void>((resolve) =>
    host.setState(
      (prev) => {
        const alreadyIn = prev.records.some(
          (r) => String(r.uniqueid || "").replace(/[{}]/g, "") === selectedId,
        );
        if (alreadyIn) return null;
        return { records: [record, ...prev.records] };
      },
      resolve,
    ),
  );

  await host.handleRowClick(record);
};
