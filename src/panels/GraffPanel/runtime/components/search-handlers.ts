import type { GraffWidgetHost } from "../graff-host";
import { applyGraffDefinitionExpression, eventDetail, thrownMessage } from "../graff-guards";
import { clearMapSelectionGraphics } from "../graff-map-utils";
import { buildGidvSmartWhere } from "../../../../data/agri-uniqueid-sql";
import { escapeLikeLiteral } from "../../../../data/agri-sql";
import { escapeArcGIS } from "../../../../gis/feature-layer-data";
import { buildYearLikeClause } from "../../../../controller/agri-where-builder";
import type { RecordData } from "../widget";
import { graffDebugCatch } from "../graff-log";
import { arcgisEaseInOut } from "../../../../shared/agri-plain-object";

export { handleMasterFilterChanged } from "./master-filter-handler";
export { findSpatialFeatureByUniqueId, getTableSpatialQueryCandidates } from "./spatial-candidates";

/** Builder config: plain object or an Immutable wrapper exposing get(). */
interface SearchFieldConfig {
  searchField?: string;
  get?: (key: string) => unknown;
}

interface ExternalTableSearchDetail {
  query?: unknown;
  preserveSelection?: unknown;
}

interface ExternalTableRowDetail {
  source?: unknown;
  record?: RecordData;
}

/** Read setting: 'uniqueid' | 'gidv' (defaults to 'uniqueid') */
export const getSearchField = (host: GraffWidgetHost): "uniqueid" | "gidv" => {
  const cfg = host.props?.config as SearchFieldConfig | undefined;
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
      } catch (err) {
        graffDebugCatch("runAutoSearch:highlight", err);
      }

      try {
        await activeMapView.view.goTo(
          spatialFeat.geometry?.extent?.expand(1.35) || spatialFeat.geometry,
          { duration: 700, easing: arcgisEaseInOut },
        );
      } catch (err) {
        // navigation interruption is harmless
        graffDebugCatch("runAutoSearch:goTo", err);
      }
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
  } catch (err: unknown) {
    host.setState({ searchError: thrownMessage(err) || "Излаш амалга ошмади." });
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
        easing: arcgisEaseInOut,
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
        applyGraffDefinitionExpression(featureLayer, host.state.dataSource, baseWhere || "1=0");
      } catch (err) {
        graffDebugCatch("clearSelectionAfterSearchClear:definitionExpression", err);
      }
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
      } catch (err) {
        graffDebugCatch("clearSelectionAfterSearchClear:dispatch", err);
      }
      if (host.state.viewMode === "graph") {
        host.fetchRegionalTimeseries();
      }
    },
  );
};

export const handleExternalTableSearchChanged = (host: GraffWidgetHost, event: Event) => {
  if (!host._isMounted) return;

  const detail = eventDetail<ExternalTableSearchDetail>(event);
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

  const detail = eventDetail<ExternalTableRowDetail>(event);
  if (detail?.source === "AgriGraffWidget") return;

  const record = detail?.record;
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
