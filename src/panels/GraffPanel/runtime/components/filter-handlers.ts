import type { GraffWidgetHost } from "../graff-host";
import { describeThrown } from "../graff-guards";
import { toPlainValue } from "../../../../shared/agri-plain-object";
import { escapeArcGIS, withAgriAccessWhere } from "../../../../gis/feature-layer-data";
import { buildYearLikeClause } from "../../../../controller/agri-where-builder";
import { getAgriDashboardBootstrap } from "../../../../data/agri-bootstrap";
import { getTuriCropLookupKey } from "../../../../shared/agri-crop-labels";
import type { AgriGraffWidgetState, ConfiguredFilters, RecordData } from "../widget";
import { VH_TO_NDVI_STATUS } from "../../../../filter/localization/vh-constants";
import type { VegetationIndiceType } from "../../../../gis/agri-polygon-api-source";
import { normalizeUniqueidKey as normalizeUniqueidKeyShared, recordMatchesUniqueidKey } from "../../../../data/agri-uniqueid-sql";
import { graffLog } from "../graff-log";

/**
 * ✅ WHERE builder: viloyat/tuman become region/district (numeric) when layer has those fields.
 * Includes: region (or viloyat), district (or tuman), yil, turi (uzspace), vh.
 */
export function buildWhereClause(host: GraffWidgetHost): string {
  const { viloyat, tuman, yil, uzspace } = host.state.regionalFilters;
  const { searchText, isSearchActive } = host.state;
  const hasActiveSearch = isSearchActive && Boolean(searchText?.trim());

  // Default mode: require only yil. Empty viloyat means republic-wide.
  // Exception: an active farmer/ИНН search should be able to match
  // records across all years, not just the currently selected one.
  if (!yil && !hasActiveSearch) {
    return "1=0";
  }

  const clauses: string[] = [];
  const layerFields =
    host.state.featureLayer?.fields?.map((f) => f.name.toLowerCase()) ?? [];
  const hasRegion = layerFields.includes("region");
  const hasDistrict = layerFields.includes("district");
  const regionField = host.state.featureLayer?.fields?.find(
    (ff) => ff?.name?.toLowerCase() === "region",
  );
  const districtField = host.state.featureLayer?.fields?.find(
    (ff) => ff?.name?.toLowerCase() === "district",
  );
  const isRegionString = (regionField?.type || "")
    .toLowerCase()
    .includes("string");
  const isDistrictString = (districtField?.type || "")
    .toLowerCase()
    .includes("string");

  if (viloyat) {
    const effectiveViloyat = host.normalizeApos(viloyat);
    const vilKey = host.makeRegionDistrictKey(effectiveViloyat);
    if (hasRegion && /^\d+$/.test(effectiveViloyat)) {
      clauses.push(
        isRegionString
          ? `region = '${escapeArcGIS(effectiveViloyat)}'`
          : `region = ${Number(effectiveViloyat)}`,
      );
    } else if (
      hasRegion &&
      vilKey &&
      host._viloyatToRegion[vilKey] !== undefined &&
      Number.isFinite(host._viloyatToRegion[vilKey])
    ) {
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

  if (yil) {
    const yearClause = buildYearLikeClause(yil, { digitFallback: false });
    if (yearClause) clauses.push(yearClause);
  }

  // ✅ Category (turi) stored in uzspace bucket
  if (uzspace) {
    const catField = host.getCategoryFieldName();
    if (catField) clauses.push(host.eqAposSmart(catField, uzspace));
  }

  // VH comes from the vegetation table; filter Agri_table_data by joined uniqueids.
  // null = Localization is still resolving. Omit the join here; applyMapFilters
  // keeps the previous definitionExpression so the layer does not flash 1=0
  // or the unscoped crop set. An empty array is a finished query with no rows.
  const vhActive = !!String(
    host.state.regionalFilters?.vh || "",
  ).trim();
  if (vhActive && Array.isArray(host.state.vhUniqueids)) {
    const vhIdsClause = host.buildVhUniqueIdsClause();
    clauses.push(vhIdsClause || "1=0");
  } else if (!vhActive) {
    const statusClause = host.buildNdviStatusClauseForCurrentVh();
    if (statusClause) clauses.push(statusClause);
  }

  // ✅ Search / STIR filter
  const farmerInn = String(host.state.farmerInn || "").trim();
  if (farmerInn) {
    const innField = host.resolveFieldCaseInsensitive("f_inn") || "f_inn";
    clauses.push(`UPPER(${innField})=UPPER('${escapeArcGIS(farmerInn)}')`);
  } else if (isSearchActive && searchText?.trim()) {
    const searchClause = host.buildSearchWhere(searchText);
    if (searchClause && searchClause !== "1=0") {
      clauses.push(`(${searchClause})`);
    }
  }

  const result = clauses.length ? clauses.join(" AND ") : "1=1";

  if (tuman) {
    graffLog("buildWhereClause:tuman", {
      tuman,
      usesDistrictId: true,
      whereSample: result.slice(0, 240),
    });
  }

  return withAgriAccessWhere(result);
}

/**
 * Loads viloyat→region and tuman→district mappings from the full
 * Agri_table_data table (grouped DISTINCT query), not from a 50k-row
 * sample that may only cover a couple of viloyats.
 */
export const fetchAndStoreRegionDistrictMappings = async (host: GraffWidgetHost): Promise<void> => {
  const rawSamples: Array<Record<string, unknown>> = [];

  try {
    const { regionDistrictRows, turiCropRows } =
      await getAgriDashboardBootstrap();

    host._viloyatToRegion = {};
    host._tumanToDistrict = {};
    host._tumanToDistrictVotes = {};
    host._turiToCropId = {};

    for (const row of regionDistrictRows) {
      if (rawSamples.length < 10) {
        rawSamples.push({
          viloyat: row.viloyat,
          region: row.region,
          tuman: row.tuman,
          district: row.district,
          count: row.count,
        });
      }
      host.storeRegionDistrictMappingRow(
        row.viloyat,
        row.region,
        row.tuman,
        row.district,
        row.count,
      );
    }

    for (const row of turiCropRows) {
      const turiKey = getTuriCropLookupKey(row.turi);
      if (turiKey && row.cropId && !(turiKey in host._turiToCropId)) {
        host._turiToCropId[turiKey] = row.cropId;
      }
    }

    graffLog("regionDistrictMap:built", {
      rawSamples,
      regionDistrictRowCount: regionDistrictRows.length,
      turiCropRowCount: turiCropRows.length,
      viloyatToRegionKeys: Object.keys(host._viloyatToRegion).length,
      tumanToDistrictKeys: Object.keys(host._tumanToDistrict).length,
      turiToCropIdKeys: Object.keys(host._turiToCropId).length,
    });
  } catch (err) {
    graffLog("regionDistrictMap:FAILED", {
      error: describeThrown(err),
    });
  }
};

// 🗓️ Year change: map to regional.yil + reset vh
export const handleConstructionYearChange = (host: GraffWidgetHost, event: CustomEvent) => {
  if (!host._isMounted) return;
  const { detail } = event || {};
  if (!detail || detail.source === "AgriGraffWidget") return;

  const yil = detail.year || detail.yil || detail.constructionYear || "";
  const next = {
    ...host.state.regionalFilters,
    yil: yil ? String(yil) : "",
    vh: "",
  };

  if (!host.filtersChanged(host.state.regionalFilters, next)) return;

  host.setState(
    {
      regionalFilters: next,
      vhUniqueids: null,
      loading: true,
      records: [],
      currentPage: 1,
    },
    () => {
      host.scheduleRefresh();

      // Broadcast updated filters so AgriFilter/AgriBar react automatically
      document.dispatchEvent(
        new CustomEvent("widgetSelectionChanged", {
          detail: {
            source: "AgriGraffWidget",
            yil: next.yil,
            viloyat: next.viloyat,
            tuman: next.tuman,
            turi: next.uzspace,
            vh: next.vh,
            timestamp: Date.now(),
          },
          bubbles: true,
        }),
      );
    },
  );
};

/** Get configured display fields from settings */
export function getDisplayFields(host: GraffWidgetHost): string[] {
  const displayFields = toPlainValue(host.props?.config?.displayFields) as string[] | undefined;

  if (!displayFields || displayFields.length === 0) {
    return ["uniqueid", "tuman", "f_name", "f_inn", "maydon", "turi", "vh"];
  }

  return displayFields;
}

/** Resolve the area/Maydon attribute used for table sorting. */
export function getMaydonSortFieldName(host: GraffWidgetHost): string | null {
  const fields = host.getDisplayFields();
  const exact = fields.find((name) => name.toLowerCase() === "maydon");
  if (exact) return exact;
  const fuzzy = fields.find((name) => {
    const lower = name.toLowerCase();
    return lower.includes("maydon") || lower.includes("area");
  });
  return fuzzy || null;
}

export const getTableOrderByFields = (host: GraffWidgetHost): string[] => {
  const oidField = host.state.featureLayer?.objectIdField || "objectid";
  const { tableSort } = host.state;
  if (tableSort?.column === "maydon") {
    const maydonField = host.getMaydonSortFieldName();
    if (maydonField) {
      return [`${maydonField} ${tableSort.order.toUpperCase()}`];
    }
  }
  return [oidField];
};

export const toggleMaydonSort = (host: GraffWidgetHost): void => {
  const maydonField = host.getMaydonSortFieldName();
  if (!maydonField) return;

  host.setState(
    (prev) => {
      const prevSort = prev.tableSort;
      let next: AgriGraffWidgetState["tableSort"] = null;
      if (prevSort?.column !== "maydon") {
        next = { column: "maydon", order: "desc" };
      } else if (prevSort.order === "desc") {
        next = { column: "maydon", order: "asc" };
      } else {
        next = null;
      }
      return { tableSort: next };
    },
    () => {
      if (host.state.viewMode === "table") {
        void host.fetchData();
      }
    },
  );
};

/** Build a server-side table predicate from VH-matched polygon IDs. */
export function buildVhUniqueIdsClause(host: GraffWidgetHost): string {
  const ids = host.state.vhUniqueids;
  if (!Array.isArray(ids)) return "";
  if (!ids.length) return "1=0";
  const chunks: string[] = [];
  for (let offset = 0; offset < ids.length; offset += 400) {
    const values = ids
      .slice(offset, offset + 400)
      .map((id) => `'${escapeArcGIS(String(id))}'`)
      .join(",");
    if (values) chunks.push(`uniqueid IN (${values})`);
  }
  return chunks.length === 1 ? chunks[0] : `(${chunks.join(" OR ")})`;
}

/** Resolve polygon NDVI status field for the currently selected NDVI date (e.g. status_2025_06_12). */
export function getStatusFieldNameForCurrentDate(host: GraffWidgetHost): string | null {
  const fl = host.state.featureLayer;
  const ndviDate = (host.state.selectedNdviDate || "").trim();
  if (!fl || !fl.fields) return null;
  if (host._barCategoryField) {
    const broadcastMatch = fl.fields.find((f) => String(f.name || "").toLowerCase() === host._barCategoryField.toLowerCase());
    if (broadcastMatch) return broadcastMatch.name;
  }
  if (!ndviDate) return null;

  const prefix =
    String(host.props.config?.polygonStatusPrefix || "status_").trim() || "status_";
  const suffix = ndviDate.replace(/-/g, "_");
  const desired = `${prefix}${suffix}`.toLowerCase();

  const match = fl.fields.find(
    (f) => (f.name || "").toString().toLowerCase() === desired,
  );
  return match ? match.name : null;
}

/** Build NDVI status WHERE clause for the current VH selection and NDVI date. */
export function buildNdviStatusClauseForCurrentVh(host: GraffWidgetHost): string {
  const ndviDate = (host.state.selectedNdviDate || "").trim();
  const vhCategory = (host.state.regionalFilters?.vh || "").trim();
  if (!vhCategory) return "";
  if (!ndviDate && !host._barCategoryField) return "";

  const statusTableValue = host._barCategoryValue || VH_TO_NDVI_STATUS[vhCategory];
  if (!statusTableValue) return "";

  const statusField = host.getStatusFieldNameForCurrentDate();
  if (!statusField) return "";

  return `${statusField} = '${escapeArcGIS(statusTableValue)}'`;
}

/** Get display name for a field (alias or field name) */
export function getFieldDisplayName(host: GraffWidgetHost, fieldName: string): string {
  const { featureLayer } = host.state;

  if (!featureLayer?.fields) return fieldName;

  const field = featureLayer.fields.find(
    (f) => f.name.toLowerCase() === fieldName.toLowerCase(),
  );
  return field?.alias || fieldName;
}

// 🔗 Handles categoryFilterChanged from GeoPie
export const handleLandCategoryChange = (host: GraffWidgetHost, event: CustomEvent) => {
  if (!host._isMounted) return;
  const { detail } = event || {};
  if (!detail || detail.source === "AgriGraffWidget") return;

  const selected = (
    detail.category ??
    detail.turi ??
    detail.tur ??
    detail.uzspace ??
    ""
  )
    .toString()
    .trim();

  const v = detail.viloyat
    ? host.normalizeApos(detail.viloyat)
    : host.state.regionalFilters.viloyat;
  const t = detail.tuman
    ? host.normalizeApos(detail.tuman)
    : host.state.regionalFilters.tuman;
  const y =
    detail.yil != null
      ? String(detail.yil)
      : detail.year != null
        ? String(detail.year)
        : host.state.regionalFilters.yil;

  // ✅ Keep current bar selection (vh) when only category changes so bar + crop filters apply together
  const nextRegional = {
    viloyat: v || "",
    tuman: t || "",
    yil: y || "",
    uzspace: selected ? host.normalizeApos(selected) : "",
    vh: host.state.regionalFilters.vh || "",
  };

  if (!host.filtersChanged(host.state.regionalFilters, nextRegional)) return;

  host.cancelVegetationImageOverlay();

  host.setState(
    {
      regionalFilters: nextRegional,
      vhUniqueids: null,
      selecteduniqueid: "",
      selectedNdviDate: null,
      selectedChartIndexKey: null,
      polygonAvailableDates: [],
      polygonImageError: null,
      vegetationError: null,
      records: [],
      currentPage: 1,
      loading: true,
    },
    () => {
      try {
        host.state.activeMapView?.view?.graphics?.removeAll?.();
      } catch (err) {
        // View may already be destroyed — clearing highlights is best-effort.
        graffLog("cropChange:clear-graphics-failed", { error: describeThrown(err) });
      }

      host.applyMapFilters();
      host.throttledFetchData();

      // Keep graph view alive when crop changes without polygon selection.
      // Otherwise vegetationData stays empty and UI shows "Viloyat ma'lumoti yo'q".
      if (host.state.viewMode === "graph" && !host.state.selecteduniqueid) {
        host.fetchRegionalTimeseries();
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
        graffLog("cropChange:broadcast-failed", { error: describeThrown(err) });
      }
    },
  );
};

// 🌍 Region change: update + reset vh
export const handleRegionalChange = (host: GraffWidgetHost, event: CustomEvent) => {
  if (!host._isMounted) return;
  const { detail } = event || {};
  if (!detail || detail.source === "AgriGraffWidget") return;

  const next = {
    viloyat: detail.viloyat ? host.normalizeApos(detail.viloyat) : "",
    tuman: detail.tuman ? host.normalizeApos(detail.tuman) : "",
    yil: detail.yil ? String(detail.yil) : "",
    uzspace: detail.uzspace ? host.normalizeApos(detail.uzspace) : "",
    vh: "", // ✅ reset vh when region changes
  };

  if (!host.filtersChanged(host.state.regionalFilters, next)) return;

  const returningToRepublic =
    !String(next.viloyat || "").trim() &&
    !!String(host.state.regionalFilters.viloyat || "").trim();

  host.setState(
    {
      regionalFilters: next,
      vhUniqueids: null,
      selectedIndices: returningToRepublic
        ? (["ndvi"] as VegetationIndiceType[])
        : host.state.selectedIndices,
      loading: true,
      records: [],
      currentPage: 1,
    },
    () => {
      host.scheduleRefresh();

      document.dispatchEvent(
        new CustomEvent("widgetSelectionChanged", {
          detail: {
            source: "AgriGraffWidget",
            yil: next.yil,
            viloyat: next.viloyat,
            tuman: next.tuman,
            turi: next.uzspace,
            vh: next.vh,
            timestamp: Date.now(),
          },
          bubbles: true,
        }),
      );
    },
  );
};

// 🧩 General filter: supports vh + turi
export const handleGeneralFilterChange = (host: GraffWidgetHost, event: CustomEvent) => {
  if (!host._isMounted) return;
  const { detail } = event || {};
  if (!detail || detail.source === "AgriGraffWidget") return;

  const next = { ...host.state.regionalFilters };
  let parentChanged = false;

  if (detail.viloyat || detail.massivNom || detail.region) {
    const v = host.normalizeApos(
      detail.viloyat || detail.massivNom || detail.region,
    );
    if (v !== next.viloyat) parentChanged = true;
    next.viloyat = v;
  }
  if (detail.tuman || detail.tumanNomi || detail.district) {
    const t = host.normalizeApos(
      detail.tuman || detail.tumanNomi || detail.district,
    );
    if (t !== next.tuman) parentChanged = true;
    next.tuman = t;
  }
  if (detail.yil || detail.year || detail.constructionYear) {
    const y = String(detail.yil || detail.year || detail.constructionYear);
    if (y !== next.yil) parentChanged = true;
    next.yil = y;
  }

  // ✅ Category (turi)
  if (
    detail.turi ||
    detail.tur ||
    detail.uzspace ||
    detail.yerToifas ||
    detail.category
  ) {
    const cat = host.normalizeApos(
      detail.turi ||
        detail.tur ||
        detail.uzspace ||
        detail.yerToifas ||
        detail.category,
    );
    if (cat !== next.uzspace) parentChanged = true;
    next.uzspace = cat;
  }

  // ✅ VH
  if (detail.vh !== undefined) {
    next.vh = host.normalizeApos(detail.vh || "");
  }

  // ✅ parent changed => clear vh unless explicitly set
  if (parentChanged && detail.vh === undefined) {
    next.vh = "";
  }

  if (!host.filtersChanged(host.state.regionalFilters, next)) return;

  host.setState(
    {
      regionalFilters: next,
      loading: true,
      records: [],
      currentPage: 1,
    },
    () => {
      host.scheduleRefresh();

      document.dispatchEvent(
        new CustomEvent("widgetSelectionChanged", {
          detail: {
            source: "AgriGraffWidget",
            yil: next.yil,
            viloyat: next.viloyat,
            tuman: next.tuman,
            turi: next.uzspace,
            vh: next.vh,
            timestamp: Date.now(),
          },
          bubbles: true,
        }),
      );
    },
  );
};

// Central external filter update processor
export const processExternalFilterUpdate = (host: GraffWidgetHost, sourceWidget: string, updates: ConfiguredFilters) => {
  const now = Date.now();

  if (
    host.state.isProcessingExternalUpdate ||
    now - host.state.lastUpdateTimestamp < 300
  )
    return;
  if (Object.keys(updates).length === 0) return;

  const changed = Object.entries(updates).some(
    ([k, v]) => host.state.externalFilters[k] !== v,
  );
  if (!changed) return;

  clearTimeout(host._updateDebounceTimer);
  host._updateDebounceTimer = setTimeout(() => {
    host.applyExternalFilterUpdate(sourceWidget, updates);
  }, 200);
};

export const applyExternalFilterUpdate = async (host: GraffWidgetHost, sourceWidget: string, updates: ConfiguredFilters) => {
  if (!host._isMounted) return;

  if (host.state.connectionStatus !== "connected") {
    host.setState({
      externalFilters: { ...host.state.externalFilters, ...updates },
      lastUpdateTimestamp: Date.now(),
    });
    return;
  }

  host.setState(
    {
      isProcessingExternalUpdate: true,
      lastUpdateTimestamp: Date.now(),
      externalFilters: { ...host.state.externalFilters, ...updates },
      records: [],
      currentPage: 1,
      loading: true,
    },
    () => {
      host.scheduleRefresh();
    },
  );

  setTimeout(() => {
    if (host._isMounted) host.setState({ isProcessingExternalUpdate: false });
  }, 100);
};

export const normalizeUniqueidKey = (host: GraffWidgetHost, value: string | null | undefined): string =>
  normalizeUniqueidKeyShared(value);

export const recordMatchesUniqueid = (host: GraffWidgetHost, record: RecordData, uniqueid: string): boolean =>
  recordMatchesUniqueidKey(
      String(record.uniqueid || record.objectid || ""),
      uniqueid,
    );
