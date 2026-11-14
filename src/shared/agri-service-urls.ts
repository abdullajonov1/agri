/**
 * Central ArcGIS / REST service URLs for Agro_widgetV5.
 * Defaults match production (sgm.uzspace.uz). Optional widget config overrides
 * are applied once per render via setAgriServiceUrls() in the dashboard shell.
 */
import { toPlainRecord } from "./agri-plain-object";

export interface AgriServiceUrls {
  portalOrigin: string;
  portalUrl: string;
  arcgisServer: string;
  tableDataUrl: string;
  vegetationIndicesUrl: string;
  polygonApiBaseUrl: string;
  adminRegionsUrl: string;
  adminDistrictsUrl: string;
  /** Fallback district borders (Evapo-style Tuman_chegara). */
  adminDistrictsFallbackUrl: string;
  reserveLandUrl: string;
  unusedLandUrl: string;
  /** Crop Agro plan polygons (Excel REJA + Fermer). */
  cropPlanUrl: string;
  /** Pre-aggregated daily index means per raster_date x region_id x district_id x crop_id (Index chart). */
  indexDailySummaryUrl: string;
  /** Per-field yearly VH status (Vegetatsiya holati). */
  fieldStatusYearUrl: string;
  /** Pre-aggregated VH totals per year x region_id x district_id x crop_id x status_code (field_count, area_ha) - Vegetatsiya holati bar. */
  statusCountsYearUrl: string;
}

export type AgriServiceUrlsConfig = Partial<AgriServiceUrls>;

const DEFAULT_AGRI_SERVICE_URLS: AgriServiceUrls = {
  portalOrigin: "https://sgm.uzspace.uz",
  portalUrl: "https://sgm.uzspace.uz/portal",
  arcgisServer: "https://sgm.uzspace.uz/server",
  tableDataUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/Agri_table_data/FeatureServer/2",
  vegetationIndicesUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_vegetation_indices/FeatureServer/1",
  polygonApiBaseUrl: "https://api-agri.sgm.uzspace.uz",
  adminRegionsUrl:
    "https://sgm.uzspace.uz/server/rest/services/Hosted/regions/FeatureServer/5",
  adminDistrictsUrl:
    "https://sgm.uzspace.uz/server/rest/services/Hosted/district/FeatureServer/3",
  adminDistrictsFallbackUrl:
    "https://sgm.uzspace.uz/server/rest/services/Tuman_chegara/FeatureServer/0",
  reserveLandUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/Agri_reserve_land/FeatureServer/1",
  unusedLandUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/Agri_unused_land/FeatureServer/2",
  cropPlanUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_crop/FeatureServer/2",
  indexDailySummaryUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_index_daily_summary/FeatureServer/0",
  fieldStatusYearUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_field_status_year/FeatureServer/0",
  statusCountsYearUrl:
    "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_status_counts_year/FeatureServer/0",
};

let activeUrls: AgriServiceUrls = { ...DEFAULT_AGRI_SERVICE_URLS };

const trimUrl = (value: unknown): string | undefined => {
  const next = String(value ?? "").trim();
  return next || undefined;
};

const pickOverride = (
  raw: Record<string, unknown> | null | undefined,
  key: keyof AgriServiceUrls,
): string | undefined => {
  if (!raw) return undefined;
  return trimUrl(raw[key]);
};

export const normalizeAgriServiceUrls = (
  config?: AgriServiceUrlsConfig | unknown,
): AgriServiceUrls => {
  const raw = toPlainRecord(config);

  const next: AgriServiceUrls = { ...DEFAULT_AGRI_SERVICE_URLS };
  (Object.keys(DEFAULT_AGRI_SERVICE_URLS) as Array<keyof AgriServiceUrls>).forEach(
    (key) => {
      const override = pickOverride(raw, key);
      if (override) next[key] = override;
    },
  );
  return next;
};

export function setAgriServiceUrls(config?: AgriServiceUrlsConfig | unknown): void {
  activeUrls = normalizeAgriServiceUrls(config);
}

export function getAgriServiceUrls(): Readonly<AgriServiceUrls> {
  return activeUrls;
}

export function getAgriPortalSharingRestUrl(): string {
  const base = trimUrl(activeUrls.portalUrl) || DEFAULT_AGRI_SERVICE_URLS.portalUrl;
  return `${base.replace(/\/$/, "")}/sharing/rest`;
}
