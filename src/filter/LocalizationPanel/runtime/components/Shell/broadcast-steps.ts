import { AGRI_EVENTS } from "../../../../../shared/agri-events";
import { agriLog } from "../localization-log";
import type { BroadcastHost } from "./shell-host";
import { syncMasterFilterSnapshot } from "../../../../../data/agri-filter-store";
import { getPieVhFilterUniqueIdsSig } from "../../../../../gis/agri-chart-filter-order";
import { isBroadcastGeoCurrent } from "../../../../localization/broadcast-detail";
import type { buildBroadcastGeoSnapshot, resolveVhUniqueidSlices } from "../../../../localization/broadcast-detail";
import type { VHBarData } from "../../../../localization/vh-constants";

type HostState = BroadcastHost["state"];
type VhSlices = ReturnType<typeof resolveVhUniqueidSlices>;
type GeoSnapshot = ReturnType<typeof buildBroadcastGeoSnapshot>;

/** Detail shared by every send of one broadcast (before vhBarData is attached). */
export type BaseBroadcastDetail = ReturnType<typeof buildBaseDetail>;
export type BroadcastDetail = BaseBroadcastDetail & {
  vhBarData: VHBarData | null;
  vhBarDataPending: boolean;
};

/** Prefer the date the VH bar already proved has rows (Pie must match the bar totals). */
export const resolveEffectiveNdviDate = (params: {
  explicitNdvi: string;
  ndviDateLocked: boolean | undefined;
  barUsedNdvi: string | null | undefined;
  latestForPrimaryLayer: () => string;
}): string =>
  (params.ndviDateLocked && params.explicitNdvi) ||
  params.barUsedNdvi ||
  params.explicitNdvi ||
  params.latestForPrimaryLayer();

export const buildBaseDetail = (p: {
  state: HostState;
  effectiveViloyat: HostState["viloyat"];
  effectiveNdviDate: string;
  explicitNdvi: string;
  normalizedTurlar: ReturnType<BroadcastHost["normalizeTurlar"]>;
  barCategoryField: string | null | undefined;
  barCategoryValue: string | null | undefined;
  chartFlags: { filterPieByVh: boolean; filterVhBarByCrop: boolean };
  chartDimOrder: readonly string[];
  vhUniqueids: VhSlices["vhUniqueids"];
  vhRegionChartUniqueids: VhSlices["vhRegionChartUniqueids"];
  whereClause: string;
  broadcastGeneration: number;
}) => {
  const s = p.state;
  const { polygonMode, selectedGraffUniqueid } = s;
  return {
    filters: {
      yil: s.yil,
      viloyat: p.effectiveViloyat,
      tuman: s.tuman,
      turi: s.turi,
      turlar: p.normalizedTurlar,
      vh: s.vh,
      ndviDate: p.effectiveNdviDate,
      // Whether ndviDate came from an explicit user choice (Graff/date picker)
      // so listeners can tell it from the auto "latest date" used for bars.
      ndviDateLocked: Boolean(s.ndviDateLocked && p.explicitNdvi),
      barCategoryField: p.barCategoryField ?? undefined,
      barCategoryValue: p.barCategoryValue ?? undefined,
      language: s.language,
      // Single-polygon focus (AgriPopup / AgriGraff10 row click).
      uniqueid: polygonMode ? selectedGraffUniqueid || "" : "",
      uniqueidClickedAt: polygonMode
        ? s.selectedGraffUniqueidClickedAt || undefined
        : undefined,
      polygonMode: Boolean(polygonMode),
      farmerInn: String(s.selectedFarmerInn || "").trim(),
      // First-selected chart scopes the other widget; second only maps.
      filterPieByVh: p.chartFlags.filterPieByVh,
      filterVhBarByCrop: p.chartFlags.filterVhBarByCrop,
      chartDimOrder: p.chartDimOrder.slice(),
    },
    vhUniqueids: p.vhUniqueids,
    vhRegionChartUniqueids: p.vhRegionChartUniqueids,
    options: {
      yil: s.yilOptions,
    },
    scope: {
      lockedViloyat: s.lockedViloyat,
      locked: Boolean(s.lockedViloyat),
    },
    meta: {
      recordCount: s.totalRecordCount ?? s.records?.length ?? 0,
      whereClause: p.whereClause,
      // Frozen at broadcast start so late VH completions cannot look newer.
      timestamp: Date.now(),
      broadcastGeneration: p.broadcastGeneration,
      language: s.language,
    },
    source: "AgriFilter",
  };
};

export const attachVhBar = (
  base: BaseBroadcastDetail,
  vhBarData: VHBarData | null,
  vhBarDataPending: boolean,
): BroadcastDetail => ({ ...base, vhBarData, vhBarDataPending });

/** Digest used to skip duplicate broadcasts. */
export const buildBroadcastDigest = (
  detail: BroadcastDetail,
  pieVhUniqueIdsSig: unknown = getPieVhFilterUniqueIdsSig(),
): string =>
  JSON.stringify({
    filters: detail.filters,
    options: detail.options,
    scope: detail.scope,
    vhUniqueids: detail.vhUniqueids,
    vhRegionChartUniqueids: detail.vhRegionChartUniqueids,
    pieVhUniqueIdsSig,
    vhBarData: detail.vhBarData,
    vhBarDataPending: detail.vhBarDataPending,
    recordCount: detail.meta.recordCount,
    whereClause: detail.meta.whereClause,
  });

export const countOrValue = (value: unknown): unknown =>
  Array.isArray(value) ? value.length : value;

export const buildSendLogPayload = (
  detail: BroadcastDetail,
  pendingOnly: boolean,
) => ({
  vh: detail.filters.vh || "",
  filterPieByVh: detail.filters.filterPieByVh,
  filterVhBarByCrop: detail.filters.filterVhBarByCrop,
  chartDimOrder: detail.filters.chartDimOrder,
  vhUniqueidsCount: countOrValue(detail.vhUniqueids),
  vhRegionChartUniqueidsCount: countOrValue(detail.vhRegionChartUniqueids),
  turlar: detail.filters.turlar,
  viloyat: detail.filters.viloyat,
  tuman: detail.filters.tuman,
  whereClauseSample: String(detail.meta?.whereClause || "").slice(0, 280),
  vhBarDataPending: detail.vhBarDataPending,
  pendingOnly,
});

/** Store snapshot first, then the DOM event (order is load-bearing). */
export const publishBroadcast = (detail: BroadcastDetail): void => {
  syncMasterFilterSnapshot(detail);
  document.dispatchEvent(
    new CustomEvent(AGRI_EVENTS.masterFilterChanged, {
      detail,
      bubbles: true,
    }),
  );
};

export const makeIsBroadcastCurrent =
  (host: BroadcastHost, broadcastGeneration: number, geoSnapshot: GeoSnapshot) =>
  (): boolean => {
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

export const makeSender = (p: {
  host: BroadcastHost;
  baseDetail: BaseBroadcastDetail;
  broadcastGeneration: number;
  geoSnapshot: GeoSnapshot;
  isCurrent: () => boolean;
  pendingOnly: boolean;
}) =>
  (vhBarData: VHBarData | null, vhBarDataPending: boolean): void => {
    const { host } = p;
    if (!p.isCurrent()) {
      agriLog("broadcastFilterState:SKIP-stale", {
        broadcastGeneration: p.broadcastGeneration,
        currentGeneration: host._broadcastGeneration,
        snapshot: p.geoSnapshot,
        live: {
          yil: host.state.yil,
          viloyat: host.state.lockedViloyat || host.state.viloyat,
          tuman: host.state.tuman,
        },
      });
      return;
    }
    const detail = attachVhBar(p.baseDetail, vhBarData, vhBarDataPending);
    const digest = buildBroadcastDigest(detail);
    if (digest === host._lastBroadcastDigest) {
      agriLog("broadcastFilterState:SKIP-duplicate");
      return;
    }
    host._lastBroadcastDigest = digest;
    host._lastBroadcastDetail = detail;
    agriLog("broadcastFilterState:send", buildSendLogPayload(detail, p.pendingOnly));
    publishBroadcast(detail);
  };
