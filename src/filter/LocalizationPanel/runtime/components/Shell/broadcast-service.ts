import { agriLog } from "../localization-log";
import type { LocalizationConfig } from "../host";
import type { BroadcastHost } from "./shell-host";
import {
  buildBaseDetail,
  makeIsBroadcastCurrent,
  makeSender,
  resolveEffectiveNdviDate,
} from "./broadcast-steps";
import { resolveVhUniqueidSlices, buildBarCategoryBroadcast, buildBroadcastGeoSnapshot } from "../../../../localization/broadcast-detail";
import { errorMessage } from "../../../../../shared/agri-plain-object";

export const broadcastFilterState = (host: BroadcastHost, opts?: { pendingOnly?: boolean }) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") return;

  const {
    yil,
    viloyat,
    tuman,
    turi,
    turlar,
    vh,
    ndviDate,
    lockedViloyat,
    selectedGraffUniqueid,
    polygonMode,
  } = host.state;

  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];

  // Prefer the date the VH bar already proved has rows — Pie vegetation
  // crop mix must use the same NDVI date as A'lo/Yaxshi totals.
  const explicitNdvi = (ndviDate || "").trim();
  const barUsedNdvi = host.getGeoScopedVhBarUsedDate();
  const effectiveNdviDate = resolveEffectiveNdviDate({
    explicitNdvi,
    ndviDateLocked: host.state.ndviDateLocked,
    barUsedNdvi,
    latestForPrimaryLayer: () =>
      primaryLayer ? host.getLatestNdviDateForBar(primaryLayer) || "" : "",
  });

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
  const cfg = (host.props.config || {}) as LocalizationConfig;
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

  const baseDetail = buildBaseDetail({
    state: host.state,
    effectiveViloyat,
    effectiveNdviDate,
    explicitNdvi,
    normalizedTurlar: host.normalizeTurlar(turlar, turi),
    barCategoryField,
    barCategoryValue,
    chartFlags,
    chartDimOrder: host._chartDimOrder,
    vhUniqueids,
    vhRegionChartUniqueids,
    whereClause: host.buildWhereClause(),
    broadcastGeneration,
  });

  const isBroadcastCurrent = makeIsBroadcastCurrent(host, broadcastGeneration, geoSnapshot);
  const send = makeSender({
    host,
    baseDetail,
    broadcastGeneration,
    geoSnapshot,
    isCurrent: isBroadcastCurrent,
    pendingOnly: opts?.pendingOnly ?? false,
  });

  // Previously we required a separate NDVI table (2nd data source).
  // Now NDVI status is stored directly on the polygon layer as date-based fields.
  const hasNdviSource = !!(
    host.state.featureLayer || host.state.featureLayers?.[0]
  );

  // Publish geography immediately so Graff/Indicators do not wait on VH.
  // A follow-up send attaches vhBarData when ready (if still current).
  // VH-only toggles reuse the last bar payload — category counts do not change.
  // Only while the bar scope is unchanged: clearing VH under VH-first + crop
  // flips filterVhBarByCrop, so the old all-crop payload is no longer valid.
  const vhComputeKey = host.makeVhBarComputeKey();
  if (
    host._reuseVhBarDataOnNextBroadcast &&
    host._lastVhBarData &&
    host._lastVhBarDataKey === vhComputeKey
  ) {
    host._reuseVhBarDataOnNextBroadcast = false;
    send(host._lastVhBarData, false);
    return;
  }
  host._reuseVhBarDataOnNextBroadcast = false;

  // Same geography/year/crop already computed — skip pending→recompute cycle.
  const memoizedVh = host._vhBarComputeMemo.get(vhComputeKey);
  if (memoizedVh && hasNdviSource && !opts?.pendingOnly) {
    host._lastVhBarData = memoizedVh;
    host._lastVhBarDataKey = vhComputeKey;
    send(memoizedVh, false);
    return;
  }

  send(null, hasNdviSource);

  // Charts show loader immediately; caller re-broadcasts after crop_id resolve.
  if (opts?.pendingOnly) return;

  if (hasNdviSource) {
    const vhKeyAtStart = vhComputeKey;
    host.computeVhBarData()
      .then((vhBarData) => {
        // Superseded by a newer geography/filter — do not clear or overwrite.
        if (!isBroadcastCurrent()) return;
        if (host.makeVhBarComputeKey() !== vhKeyAtStart) return;
        if (vhBarData) {
          host._lastVhBarData = vhBarData;
          host._lastVhBarDataKey = vhKeyAtStart;
          send(vhBarData, false);
          return;
        }
        // Empty final result (not abort): clear pending with zeros.
        send(null, false);
      })
      .catch((error: unknown) => {
        agriLog("broadcastFilterState:vh-data-failed", {
          error: errorMessage(error),
        });
        if (!isBroadcastCurrent()) return;
        if (host.makeVhBarComputeKey() !== vhKeyAtStart) return;
        send(null, false);
      });
  }
};
