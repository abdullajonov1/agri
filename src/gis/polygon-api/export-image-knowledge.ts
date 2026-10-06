/**
 * Everything learned from export-image responses: crop index seasons, regional
 * imagery gaps and proven scenes. Mirrored to localStorage so every widget
 * instance (each has its own module copy) shares it.
 */
import { agriPolygonApiLog } from "./config";

/**
 * Default index seasons for crops whose export-image rules are known from the
 * API. Without this, the first click probes /available-dates' latest scene
 * (often September) and burns a 400 before learning the season from the error.
 */
const DEFAULT_CROP_INDEX_SEASON_MONTHS: Record<number, number[]> = {
  6: [3, 4], // wheat / Bug'doy
};

export function getDefaultCropIndexSeasonMonths(
  cropId?: number | null,
): number[] {
  if (cropId == null || !Number.isFinite(Number(cropId))) return [];
  const months = DEFAULT_CROP_INDEX_SEASON_MONTHS[Number(cropId)];
  return months ? months.slice() : [];
}

/** Per-polygon index season learned from a 400. */
const seasonMonthsByUniqueid = new Map<string, number[]>();
/** Same season shared by all polygons of that crop_id (wheat=6 → Mar/Apr). */
const seasonMonthsByCropId = new Map<number, number[]>();
/**
 * Most recently learned season. Used when the next table row's crop_id is not
 * known yet — without this every new uniqueid re-tries September and 400s.
 * Overwritten when a different crop's season is discovered.
 */
let lastLearnedSeasonMonths: number[] = [];

/** region|date pairs export-image refused with "No imagery available". */
const regionDatesWithoutImagery = new Set<string>();
/** region|date pairs export-image has served (HTTP 200). */
const regionDatesWithImagery = new Set<string>();

/**
 * Everything learned from export-image (season per crop, regional scene gaps
 * and proven scenes) is mirrored to localStorage and re-read before use.
 *
 * This is NOT only for reloads: every Experience Builder widget (GraffPanel,
 * PopupPanel, …) gets its own webpack runtime and therefore its own instance
 * of this module — in-memory Maps here are per widget. Without the shared
 * store the map-click path (PopupPanel) re-probes September and the same
 * regional gaps GraffPanel already learned, producing fresh 400s.
 */
const EXPORT_IMAGE_KNOWLEDGE_STORAGE_KEY = "agri_export_image_knowledge_v1";
const KNOWLEDGE_SYNC_MIN_INTERVAL_MS = 300;
let lastKnowledgeSyncAt = 0;
let knowledgeStorageSignature = "";

interface ExportImageKnowledge {
  gaps?: string[];
  scenes?: string[];
  seasonsByCrop?: Record<string, number[]>;
  seasonsByUid?: Record<string, number[]>;
  lastSeason?: number[];
}

function isValidRegionDateKey(key: unknown): key is string {
  return typeof key === "string" && /^\d+\|\d{4}-\d{2}-\d{2}$/.test(key);
}

function sanitizeMonths(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((m) => Number(m))
        .filter((m) => Number.isInteger(m) && m >= 1 && m <= 12),
    ),
  ).sort((a, b) => a - b);
}

export function syncExportImageKnowledgeFromStorage(force = false): void {
  const now = Date.now();
  if (!force && now - lastKnowledgeSyncAt < KNOWLEDGE_SYNC_MIN_INTERVAL_MS) {
    return;
  }
  lastKnowledgeSyncAt = now;
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(EXPORT_IMAGE_KNOWLEDGE_STORAGE_KEY);
    if (!raw || raw === knowledgeStorageSignature) return;
    knowledgeStorageSignature = raw;
    const parsed = JSON.parse(raw) as ExportImageKnowledge;
    if (!parsed || typeof parsed !== "object") return;
    for (const key of parsed.gaps || []) {
      if (isValidRegionDateKey(key)) regionDatesWithoutImagery.add(key);
    }
    for (const key of parsed.scenes || []) {
      if (isValidRegionDateKey(key)) regionDatesWithImagery.add(key);
    }
    for (const [crop, months] of Object.entries(parsed.seasonsByCrop || {})) {
      const id = Number(crop);
      const list = sanitizeMonths(months);
      if (Number.isFinite(id) && list.length) seasonMonthsByCropId.set(id, list);
    }
    for (const [uid, months] of Object.entries(parsed.seasonsByUid || {})) {
      const list = sanitizeMonths(months);
      if (uid && list.length) seasonMonthsByUniqueid.set(uid, list);
    }
    if (!lastLearnedSeasonMonths.length) {
      const last = sanitizeMonths(parsed.lastSeason);
      if (last.length) lastLearnedSeasonMonths = last;
    }
  } catch (err: unknown) {
    // Corrupt / blocked storage only loses cross-widget hints; the API will
    // re-teach seasons and gaps on the next refusal.
    agriPolygonApiLog("knowledge:sync-failed", { error: String(err) });
  }
}

function persistExportImageKnowledge(): void {
  try {
    if (typeof localStorage === "undefined") return;
    // Merge with what other widget instances wrote meanwhile.
    syncExportImageKnowledgeFromStorage(true);
    const seasonsByCrop: Record<string, number[]> = {};
    for (const [crop, months] of seasonMonthsByCropId) {
      seasonsByCrop[String(crop)] = months;
    }
    const seasonsByUid: Record<string, number[]> = {};
    for (const [uid, months] of seasonMonthsByUniqueid) {
      seasonsByUid[uid] = months;
    }
    const payload: ExportImageKnowledge = {
      gaps: Array.from(regionDatesWithoutImagery),
      scenes: Array.from(regionDatesWithImagery),
      seasonsByCrop,
      seasonsByUid,
      lastSeason: lastLearnedSeasonMonths,
    };
    const raw = JSON.stringify(payload);
    knowledgeStorageSignature = raw;
    localStorage.setItem(EXPORT_IMAGE_KNOWLEDGE_STORAGE_KEY, raw);
  } catch (err: unknown) {
    // Quota / private-mode storage: in-memory knowledge still applies.
    agriPolygonApiLog("knowledge:persist-failed", { error: String(err) });
  }
}

syncExportImageKnowledgeFromStorage(true);

export function normalizeUniqueidKey(uniqueid: string): string {
  return String(uniqueid || "").replace(/[{}]/g, "").trim().toLowerCase();
}

export function rememberExportImageSeasonMonths(
  uniqueid: string,
  months: number[],
  cropId?: number | null,
): void {
  if (!months.length) return;
  lastLearnedSeasonMonths = months.slice();
  const key = normalizeUniqueidKey(uniqueid);
  if (key) {
    seasonMonthsByUniqueid.set(key, months.slice());
    while (seasonMonthsByUniqueid.size > 128) {
      const oldest = seasonMonthsByUniqueid.keys().next().value;
      if (oldest == null) break;
      seasonMonthsByUniqueid.delete(oldest);
    }
  }
  if (cropId != null && Number.isFinite(cropId)) {
    seasonMonthsByCropId.set(Number(cropId), months.slice());
  }
  persistExportImageKnowledge();
}

/**
 * Season months for export-image. Prefer this polygon's learned months, else
 * the crop_id's (learned or built-in default), else last session learn.
 */
export function getExportImageSeasonMonths(
  uniqueid: string,
  cropId?: number | null,
): number[] {
  syncExportImageKnowledgeFromStorage();
  const key = normalizeUniqueidKey(uniqueid);
  if (key) {
    const byUid = seasonMonthsByUniqueid.get(key);
    if (byUid?.length) return byUid;
  }
  if (cropId != null && Number.isFinite(cropId)) {
    const byCrop = seasonMonthsByCropId.get(Number(cropId));
    if (byCrop?.length) return byCrop;
    const defaults = getDefaultCropIndexSeasonMonths(cropId);
    if (defaults.length) return defaults;
  }
  return lastLearnedSeasonMonths.slice();
}

function regionDateKey(regionId: number | null | undefined, date: string): string {
  return `${regionId ?? ""}|${String(date || "").slice(0, 10)}`;
}

export function rememberRegionDateWithoutImagery(
  regionId: number | null | undefined,
  date: string,
): void {
  const key = regionDateKey(regionId, date);
  if (!isValidRegionDateKey(key)) return;
  if (regionDatesWithoutImagery.has(key)) return;
  regionDatesWithoutImagery.add(key);
  while (regionDatesWithoutImagery.size > 512) {
    const oldest = regionDatesWithoutImagery.keys().next().value;
    if (oldest == null) break;
    regionDatesWithoutImagery.delete(oldest);
  }
  persistExportImageKnowledge();
}

export function isRegionDateWithoutImagery(
  regionId: number | null | undefined,
  date: string,
): boolean {
  syncExportImageKnowledgeFromStorage();
  return regionDatesWithoutImagery.has(regionDateKey(regionId, date));
}

export function rememberRegionDateWithImagery(
  regionId: number | null | undefined,
  date: string,
): void {
  const key = regionDateKey(regionId, date);
  if (!isValidRegionDateKey(key)) return;
  if (regionDatesWithImagery.has(key)) return;
  regionDatesWithImagery.add(key);
  while (regionDatesWithImagery.size > 512) {
    const oldest = regionDatesWithImagery.keys().next().value;
    if (oldest == null) break;
    regionDatesWithImagery.delete(oldest);
  }
  persistExportImageKnowledge();
}

export function isRegionDateWithImagery(
  regionId: number | null | undefined,
  date: string,
): boolean {
  syncExportImageKnowledgeFromStorage();
  return regionDatesWithImagery.has(regionDateKey(regionId, date));
}
