import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import { syncMasterFilterSnapshot } from "../../../../../data/agri-filter-store";
import { getPieVhFilterUniqueIdsSig } from "../../../../../gis/agri-chart-filter-order";
import { resolveVhUniqueidSlices, buildBarCategoryBroadcast, buildBroadcastGeoSnapshot, isBroadcastGeoCurrent } from "../../../../localization/broadcast-detail";
import type { VHBarData } from "../../../../localization/vh-constants";

export const broadcastFilterState = (host: LocalizationHost, opts?: { pendingOnly?: boolean }) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") return;

  const {
    yil,
    viloyat,
    tuman,
    turi,
    turlar,
    vh,
    yilOptions,
    ndviDate,
    lockedViloyat,
    records,
    totalRecordCount,
    selectedGraffUniqueid,
    selectedGraffUniqueidClickedAt,
    polygonMode,
    selectedFarmerInn,
  } = host.state;

  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];

  // Prefer the date the VH bar already proved has rows — Pie vegetation
  // crop mix must use the same NDVI date as A'lo/Yaxshi totals.
  const explicitNdvi = (ndviDate || "").trim();
  const barUsedNdvi = host.getGeoScopedVhBarUsedDate();
  const effectiveNdviDate =
    (host.state.ndviDateLocked && explicitNdvi) ||
    barUsedNdvi ||
    explicitNdvi ||
    (primaryLayer ? host.getLatestNdviDateForBar(primaryLayer) || "" : "");

  const effectiveViloyat = lockedViloyat || viloyat;

  // We now filter polygons via uniqueid lists resolved locally.
  // Huge ID arrays are NOT put on the event — Pie reads them from the
  // agri-chart-filter-order bridge when filterPieByVh is true.
  const chartFlags = host.getChartFilterFlags();
  // Map / Graff: district-scoped when a tuman is selected.
  // AgriRegion "Tumanlar kesimida": viloyat-wide VH(+crop) ids (no district).
  // While those are still resolving with a tuman selected, broadcast null so
  // Region keeps its loader instead of AND-ing district-scoped map ids.
  const { vhUniqueids, vhRegionChartUniqueids } = resolveVhUniqueidSlices({
    vh,
    tuman,
    vhMapUniqueIds: host._vhMapUniqueIds,
    vhRegionChartUniqueIds: host._vhRegionChartUniqueIds,
  });

  // Bar chart uses status_YYYY_MM_DD field; broadcast that attribute + value so Pie/Indicator filter like Graff
  const cfg = (host.props.config || {}) as any;
  const { barCategoryField, barCategoryValue } = buildBarCategoryBroadcast({
    polygonStatusPrefix: cfg.polygonStatusPrefix,
    effectiveNdviDate,
    vh,
  });

  // Capture generation for this broadcast. computeVhBarData is async; a
  // newer geography selection must discard this payload when it resolves.
  const broadcastGeneration = ++host._broadcastGeneration;
  const geoSnapshot = buildBroadcastGeoSnapshot({
    yil: String(yil || ""),
    effectiveViloyat: String(effectiveViloyat || ""),
    tuman: String(tuman || ""),
    turi: String(turi || ""),
    turlar,
    polygonMode: Boolean(polygonMode),
    selectedGraffUniqueid,
    chartFlags,
    chartDimOrder: host._chartDimOrder,
  });

  const baseDetail = {
    filters: {
      yil,
      viloyat: effectiveViloyat,
      tuman,
      turi,
      turlar: host.normalizeTurlar(turlar, turi),
      vh,
      ndviDate: effectiveNdviDate,
      // expose whether this ndviDate came from an explicit
      // user choice (Graff/date picker) so listeners like
      // AgriIndicator can distinguish it from the auto
      // "latest date" used only for bar charts.
      ndviDateLocked: Boolean(host.state.ndviDateLocked && explicitNdvi),
      barCategoryField: barCategoryField ?? undefined,
      barCategoryValue: barCategoryValue ?? undefined,
      language: host.state.language,
      // Single-polygon focus (e.g. from AgriPopup or AgriGraff10's own row
      // click) — lets AgriGraff10 switch its chart to that one polygon's
      // vegetation-index series instead of the region-wide timeseries.
      uniqueid: polygonMode ? selectedGraffUniqueid || "" : "",
      uniqueidClickedAt: polygonMode
        ? selectedGraffUniqueidClickedAt || undefined
        : undefined,
      polygonMode: Boolean(polygonMode),
      farmerInn: String(selectedFarmerInn || "").trim(),
      // First-selected chart scopes the other widget; second only maps.
      filterPieByVh: chartFlags.filterPieByVh,
      filterVhBarByCrop: chartFlags.filterVhBarByCrop,
      chartDimOrder: host._chartDimOrder.slice(),
    },
    vhUniqueids,
    vhRegionChartUniqueids,
    options: {
      yil: yilOptions,
    },
    scope: {
      lockedViloyat,
      locked: Boolean(lockedViloyat),
    },
    meta: {
      recordCount: totalRecordCount ?? records?.length ?? 0,
      whereClause: host.buildWhereClause(),
      // Frozen at broadcast start so late VH completions cannot look "newer"
      // than a subsequent geography broadcast.
      timestamp: Date.now(),
      broadcastGeneration,
      language: host.state.language,
    },
    source: "AgriFilter",
  };

  const isBroadcastCurrent = (): boolean => {
    if (!host._isMounted) return false;
    if (broadcastGeneration !== host._broadcastGeneration) return false;
    const liveViloyat = String(host.state.lockedViloyat || host.state.viloyat || "");
    return isBroadcastGeoCurrent(geoSnapshot, {
      yil: host.state.yil,
      viloyat: liveViloyat,
      tuman: host.state.tuman,
      turi: host.state.turi,
      turlar: host.state.turlar,
      polygonMode: Boolean(host.state.polygonMode),
      selectedGraffUniqueid: host.state.selectedGraffUniqueid,
      chartFlags: host.getChartFilterFlags(),
      chartDimOrder: host._chartDimOrder,
    });
  };

  const send = (
    vhBarData: VHBarData | null,
    vhBarDataPending: boolean,
  ) => {
    if (!isBroadcastCurrent()) {
      agriLog("broadcastFilterState:SKIP-stale", {
        broadcastGeneration,
        currentGeneration: host._broadcastGeneration,
        snapshot: geoSnapshot,
        live: {
          yil: host.state.yil,
          viloyat: host.state.lockedViloyat || host.state.viloyat,
          tuman: host.state.tuman,
        },
      });
      return;
    }
    const detail = { ...baseDetail, vhBarData, vhBarDataPending };
    const digest = JSON.stringify({
      filters: detail.filters,
      options: detail.options,
      scope: detail.scope,
      vhUniqueids: detail.vhUniqueids,
      vhRegionChartUniqueids: (detail as any).vhRegionChartUniqueids,
      pieVhUniqueIdsSig: getPieVhFilterUniqueIdsSig(),
      vhBarData,
      vhBarDataPending,
      recordCount: detail.meta.recordCount,
      whereClause: detail.meta.whereClause,
    });
    if (digest === host._lastBroadcastDigest) {
      agriLog('broadcastFilterState:SKIP-duplicate');
      return;
    }
    host._lastBroadcastDigest = digest;
    host._lastBroadcastDetail = detail;
    agriLog("broadcastFilterState:send", {
      vh: detail.filters.vh || "",
      filterPieByVh: detail.filters.filterPieByVh,
      filterVhBarByCrop: detail.filters.filterVhBarByCrop,
      chartDimOrder: detail.filters.chartDimOrder,
      vhUniqueidsCount: Array.isArray(detail.vhUniqueids)
        ? detail.vhUniqueids.length
        : detail.vhUniqueids,
      vhRegionChartUniqueidsCount: Array.isArray(
        (detail as any).vhRegionChartUniqueids,
      )
        ? (detail as any).vhRegionChartUniqueids.length
        : (detail as any).vhRegionChartUniqueids,
      turlar: detail.filters.turlar,
      viloyat: detail.filters.viloyat,
      tuman: detail.filters.tuman,
      whereClauseSample: String(detail.meta?.whereClause || "").slice(0, 280),
      vhBarDataPending,
      pendingOnly: opts?.pendingOnly ?? false,
    });
    syncMasterFilterSnapshot(detail);
    document.dispatchEvent(
      new CustomEvent("masterFilterChanged", {
        detail,
        bubbles: true,
      }),
    );
  };

  // Previously we required a separate NDVI table (2nd data source).
  // Now NDVI status is stored directly on the polygon layer as date-based fields.
  const hasNdviSource = !!(
    host.state.featureLayer || host.state.featureLayers?.[0]
  );

  // Publish geography immediately so Graff/Indicators do not wait on VH.
  // A follow-up send attaches vhBarData when ready (if still current).
  // VH-only toggles reuse the last bar payload — category counts do not change.
  if (host._reuseVhBarDataOnNextBroadcast && host._lastVhBarData) {
    host._reuseVhBarDataOnNextBroadcast = false;
    send(host._lastVhBarData, false);
    return;
  }
  host._reuseVhBarDataOnNextBroadcast = false;

  // Same geography/year/crop already computed — skip pending→recompute cycle.
  const vhComputeKey = host.makeVhBarComputeKey();
  const memoizedVh = host._vhBarComputeMemo.get(vhComputeKey);
  if (memoizedVh && hasNdviSource && !opts?.pendingOnly) {
    host._lastVhBarData = memoizedVh;
    send(memoizedVh, false);
    return;
  }

  send(null, hasNdviSource);

  // Charts show loader immediately; caller re-broadcasts after crop_id resolve.
  if (opts?.pendingOnly) return;

  if (hasNdviSource) {
    const vhKeyAtStart = host.makeVhBarComputeKey();
    host.computeVhBarData()
      .then((vhBarData) => {
        // Superseded by a newer geography/filter — do not clear or overwrite.
        if (!isBroadcastCurrent()) return;
        if (host.makeVhBarComputeKey() !== vhKeyAtStart) return;
        if (vhBarData) {
          host._lastVhBarData = vhBarData;
          send(vhBarData, false);
          return;
        }
        // Empty final result (not abort): clear pending with zeros.
        send(null, false);
      })
      .catch((error: any) => {
        agriLog("broadcastFilterState:vh-data-failed", {
          error: String(error?.message || error),
        });
        if (!isBroadcastCurrent()) return;
        if (host.makeVhBarComputeKey() !== vhKeyAtStart) return;
        send(null, false);
      });
  }
};
