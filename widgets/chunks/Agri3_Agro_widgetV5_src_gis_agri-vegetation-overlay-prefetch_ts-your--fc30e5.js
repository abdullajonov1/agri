(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agro_widgetV5_src_gis_agri-vegetation-overlay-prefetch_ts-your--fc30e5"],{

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-polygon-api-source.ts":
/*!****************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-polygon-api-source.ts ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   agriPolygonApiLog: () => (/* binding */ agriPolygonApiLog),
/* harmony export */   fetchPolygonAvailableDates: () => (/* binding */ fetchPolygonAvailableDates),
/* harmony export */   fetchPolygonExportImageTiff: () => (/* binding */ fetchPolygonExportImageTiff),
/* harmony export */   getAgriPolygonApiBaseUrl: () => (/* binding */ getAgriPolygonApiBaseUrl),
/* harmony export */   getDefaultCropIndexSeasonMonths: () => (/* binding */ getDefaultCropIndexSeasonMonths),
/* harmony export */   getExportImageSeasonMonths: () => (/* binding */ getExportImageSeasonMonths),
/* harmony export */   isExportImageNoImageryError: () => (/* binding */ isExportImageNoImageryError),
/* harmony export */   isExportImageOutOfSeasonError: () => (/* binding */ isExportImageOutOfSeasonError),
/* harmony export */   isRegionDateWithImagery: () => (/* binding */ isRegionDateWithImagery),
/* harmony export */   isRegionDateWithoutImagery: () => (/* binding */ isRegionDateWithoutImagery),
/* harmony export */   listExportRasterDateCandidates: () => (/* binding */ listExportRasterDateCandidates),
/* harmony export */   parseExportImageCropId: () => (/* binding */ parseExportImageCropId),
/* harmony export */   parseExportImageSeasonMonths: () => (/* binding */ parseExportImageSeasonMonths),
/* harmony export */   pickExportRasterDate: () => (/* binding */ pickExportRasterDate),
/* harmony export */   pickLatestDateInMonths: () => (/* binding */ pickLatestDateInMonths),
/* harmony export */   pickLatestUsableExportDate: () => (/* binding */ pickLatestUsableExportDate),
/* harmony export */   rememberExportImageSeasonMonths: () => (/* binding */ rememberExportImageSeasonMonths),
/* harmony export */   rememberRegionDateWithImagery: () => (/* binding */ rememberRegionDateWithImagery),
/* harmony export */   rememberRegionDateWithoutImagery: () => (/* binding */ rememberRegionDateWithoutImagery),
/* harmony export */   resolveCropIdFromAttributes: () => (/* binding */ resolveCropIdFromAttributes),
/* harmony export */   resolveExportImageWithDateWalk: () => (/* binding */ resolveExportImageWithDateWalk),
/* harmony export */   sampleIndexFromRgba: () => (/* binding */ sampleIndexFromRgba),
/* harmony export */   warmPolygonApiConnection: () => (/* binding */ warmPolygonApiConnection)
/* harmony export */ });
/* harmony import */ var geotiff__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! geotiff */ "./node_modules/geotiff/dist-module/compression/index.js");
/* harmony import */ var geotiff__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! geotiff */ "./node_modules/geotiff/dist-module/geotiff.js");
/* harmony import */ var _vendor_geotiff_decoders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vendor/geotiff-decoders */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/vendor/geotiff-decoders.ts");
/* harmony import */ var _shared_agri_service_urls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/agri-service-urls */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/agri-service-urls.ts");
/* harmony import */ var _shared_agri_crop_labels__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/agri-crop-labels */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/agri-crop-labels.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Client for the api-agri.sgm.uzspace.uz REST API — per-polygon vegetation
 * index available dates and colored raster exports.
 *
 * Separate from agri-vegetation-data-source.ts (which queries the raw
 * ArcGIS agri_vegetation_indices Table directly): that table has scalar
 * index values per (uniqueid, raster_date), fine for charts and the
 * region-wide status bar, but no pixel data. This API is used specifically
 * for the single-selected-polygon case in AgriGraff10, where we need an
 * actual rendered, georeferenced raster image to overlay on the map.
 */




(0,geotiff__WEBPACK_IMPORTED_MODULE_3__.addDecoder)([undefined, 1], () => __awaiter(void 0, void 0, void 0, function* () { return _vendor_geotiff_decoders__WEBPACK_IMPORTED_MODULE_0__.RawDecoder; }), undefined, false);
(0,geotiff__WEBPACK_IMPORTED_MODULE_3__.addDecoder)(5, () => __awaiter(void 0, void 0, void 0, function* () { return _vendor_geotiff_decoders__WEBPACK_IMPORTED_MODULE_0__.LzwDecoder; }), undefined, false);
(0,geotiff__WEBPACK_IMPORTED_MODULE_3__.addDecoder)([8, 32946], () => __awaiter(void 0, void 0, void 0, function* () { return _vendor_geotiff_decoders__WEBPACK_IMPORTED_MODULE_0__.DeflateDecoder; }), undefined, false);
(0,geotiff__WEBPACK_IMPORTED_MODULE_3__.addDecoder)(32773, () => __awaiter(void 0, void 0, void 0, function* () { return _vendor_geotiff_decoders__WEBPACK_IMPORTED_MODULE_0__.PackbitsDecoder; }), undefined, false);
function getAgriPolygonApiBaseUrl() {
    return (0,_shared_agri_service_urls__WEBPACK_IMPORTED_MODULE_1__.getAgriServiceUrls)().polygonApiBaseUrl;
}
/** Logger disabled — keep call sites without console noise. */
function agriPolygonApiLog(_phase, _detail) {
    /* no-op */
}
/**
 * GET /v1/polygon/{uniqueid}/available-dates
 * Confirmed response shape: { uniqueid, region, year, count, dates: [] }
 */
function fetchPolygonAvailableDates(uniqueid, regionId, year) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${getAgriPolygonApiBaseUrl()}/v1/polygon/${encodeURIComponent(uniqueid)}/available-dates` +
            `?region_id=${encodeURIComponent(String(regionId))}&year=${encodeURIComponent(String(year))}`;
        agriPolygonApiLog("available-dates:request", { url, uniqueid, regionId, year });
        const res = yield fetch(url, { headers: { accept: "application/json" } });
        if (!res.ok) {
            agriPolygonApiLog("available-dates:FAILED", { url, status: res.status });
            throw new Error(`HTTP ${res.status}`);
        }
        const json = yield res.json();
        agriPolygonApiLog("available-dates:response", {
            uniqueid,
            count: json === null || json === void 0 ? void 0 : json.count,
            dates: json === null || json === void 0 ? void 0 : json.dates,
        });
        return Array.isArray(json === null || json === void 0 ? void 0 : json.dates) ? json.dates : [];
    });
}
/** Classic vegetation color stops (low → high) for client-side colorize + RGB reverse. */
const VEG_COLOR_STOPS = [
    { v: 0.0, r: 165, g: 0, b: 38 },
    { v: 0.15, r: 215, g: 48, b: 39 },
    { v: 0.3, r: 244, g: 109, b: 67 },
    { v: 0.45, r: 253, g: 174, b: 97 },
    { v: 0.55, r: 254, g: 224, b: 139 },
    { v: 0.65, r: 217, g: 239, b: 139 },
    { v: 0.75, r: 166, g: 217, b: 106 },
    { v: 0.85, r: 102, g: 189, b: 99 },
    { v: 0.95, r: 26, g: 152, b: 80 },
    { v: 1.0, r: 0, g: 104, b: 55 },
];
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function colorizeIndexValue(value, out, offset) {
    if (!Number.isFinite(value)) {
        out[offset] = 0;
        out[offset + 1] = 0;
        out[offset + 2] = 0;
        out[offset + 3] = 0;
        return;
    }
    const v = Math.max(0, Math.min(1, value));
    let i = 0;
    while (i < VEG_COLOR_STOPS.length - 1 && VEG_COLOR_STOPS[i + 1].v < v)
        i++;
    const a = VEG_COLOR_STOPS[i];
    const b = VEG_COLOR_STOPS[Math.min(i + 1, VEG_COLOR_STOPS.length - 1)];
    const span = b.v - a.v || 1;
    const t = (v - a.v) / span;
    out[offset] = Math.round(lerp(a.r, b.r, t));
    out[offset + 1] = Math.round(lerp(a.g, b.g, t));
    out[offset + 2] = Math.round(lerp(a.b, b.b, t));
    out[offset + 3] = 255;
}
/**
 * Recover an approximate continuous index (0..1) from a pre-colored RGB pixel.
 * Projects onto the nearest segment of VEG_COLOR_STOPS (not nearest stop only),
 * so hover shows values like 0.22 / 0.37 instead of only 0.15 / 0.30 / 0.45.
 * Still an approximation when the TIFF has no float band — true NDVI needs floats.
 */
function sampleIndexFromRgba(r, g, b, a) {
    if (a != null && a < 8)
        return null;
    if (r + g + b < 8)
        return null;
    let bestVal = 0;
    let bestDist = Infinity;
    for (let i = 0; i < VEG_COLOR_STOPS.length - 1; i++) {
        const stopA = VEG_COLOR_STOPS[i];
        const stopC = VEG_COLOR_STOPS[i + 1];
        const abx = stopC.r - stopA.r;
        const aby = stopC.g - stopA.g;
        const abz = stopC.b - stopA.b;
        const ab2 = abx * abx + aby * aby + abz * abz || 1;
        const apx = r - stopA.r;
        const apy = g - stopA.g;
        const apz = b - stopA.b;
        let t = (apx * abx + apy * aby + apz * abz) / ab2;
        if (t < 0)
            t = 0;
        else if (t > 1)
            t = 1;
        const cx = stopA.r + abx * t;
        const cy = stopA.g + aby * t;
        const cz = stopA.b + abz * t;
        const dr = r - cx;
        const dg = g - cy;
        const db = b - cz;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
            bestDist = dist;
            bestVal = stopA.v + (stopC.v - stopA.v) * t;
        }
    }
    return bestVal;
}
/** Session cache: first click pays network+decode; repeats reuse the canvas. */
const exportImageCache = new Map();
const EXPORT_IMAGE_CACHE_MAX = 24;
const MONTH_NAME_TO_NUMBER = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};
/**
 * export-image rejects dates outside a crop's index season with HTTP 400, e.g.
 * "Indices for crop_id=6 (wheat) are calculated only in March, April; September
 * is outside the season". /available-dates lists every scene date regardless of
 * crop, so an out-of-season date is a normal answer there — the season is only
 * discoverable from this error.
 */
function isExportImageOutOfSeasonError(err) {
    const status = Number(err === null || err === void 0 ? void 0 : err.status);
    const text = String((err === null || err === void 0 ? void 0 : err.responseText) || (err === null || err === void 0 ? void 0 : err.message) || "");
    if (status !== 400 && !/HTTP\s+400/i.test(text))
        return false;
    return /outside the season|calculated only in/i.test(text);
}
/** Month numbers (1–12) named in an out-of-season export-image error. */
function parseExportImageSeasonMonths(err) {
    const text = String((err === null || err === void 0 ? void 0 : err.responseText) || (err === null || err === void 0 ? void 0 : err.message) || err || "").toLowerCase();
    const marker = text.indexOf("calculated only in");
    if (marker < 0)
        return [];
    // Stop before the "; <Month> is outside the season" tail — that month is NOT allowed.
    const tail = text.slice(marker);
    const allowedPart = tail.split(";")[0];
    const months = new Set();
    for (const [name, num] of Object.entries(MONTH_NAME_TO_NUMBER)) {
        if (allowedPart.includes(name))
            months.add(num);
    }
    return Array.from(months).sort((a, b) => a - b);
}
/** crop_id from "Indices for crop_id=6 (wheat) are calculated only in …". */
function parseExportImageCropId(err) {
    const text = String((err === null || err === void 0 ? void 0 : err.responseText) || (err === null || err === void 0 ? void 0 : err.message) || err || "");
    const match = text.match(/crop_id\s*=\s*(\d+)/i);
    if (!match)
        return null;
    const id = Number(match[1]);
    return Number.isFinite(id) ? id : null;
}
/**
 * Default index seasons for crops whose export-image rules are known from the
 * API. Without this, the first click probes /available-dates' latest scene
 * (often September) and burns a 400 before learning the season from the error.
 */
const DEFAULT_CROP_INDEX_SEASON_MONTHS = {
    6: [3, 4], // wheat / Bug'doy
};
function getDefaultCropIndexSeasonMonths(cropId) {
    if (cropId == null || !Number.isFinite(Number(cropId)))
        return [];
    const months = DEFAULT_CROP_INDEX_SEASON_MONTHS[Number(cropId)];
    return months ? months.slice() : [];
}
/** Per-polygon index season learned from a 400. */
const seasonMonthsByUniqueid = new Map();
/** Same season shared by all polygons of that crop_id (wheat=6 → Mar/Apr). */
const seasonMonthsByCropId = new Map();
/**
 * Most recently learned season. Used when the next table row's crop_id is not
 * known yet — without this every new uniqueid re-tries September and 400s.
 * Overwritten when a different crop's season is discovered.
 */
let lastLearnedSeasonMonths = [];
/** region|date pairs export-image refused with "No imagery available". */
const regionDatesWithoutImagery = new Set();
/** region|date pairs export-image has served (HTTP 200). */
const regionDatesWithImagery = new Set();
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
function isValidRegionDateKey(key) {
    return typeof key === "string" && /^\d+\|\d{4}-\d{2}-\d{2}$/.test(key);
}
function sanitizeMonths(value) {
    if (!Array.isArray(value))
        return [];
    return Array.from(new Set(value
        .map((m) => Number(m))
        .filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))).sort((a, b) => a - b);
}
function syncExportImageKnowledgeFromStorage(force = false) {
    const now = Date.now();
    if (!force && now - lastKnowledgeSyncAt < KNOWLEDGE_SYNC_MIN_INTERVAL_MS) {
        return;
    }
    lastKnowledgeSyncAt = now;
    try {
        if (typeof localStorage === "undefined")
            return;
        const raw = localStorage.getItem(EXPORT_IMAGE_KNOWLEDGE_STORAGE_KEY);
        if (!raw || raw === knowledgeStorageSignature)
            return;
        knowledgeStorageSignature = raw;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object")
            return;
        for (const key of parsed.gaps || []) {
            if (isValidRegionDateKey(key))
                regionDatesWithoutImagery.add(key);
        }
        for (const key of parsed.scenes || []) {
            if (isValidRegionDateKey(key))
                regionDatesWithImagery.add(key);
        }
        for (const [crop, months] of Object.entries(parsed.seasonsByCrop || {})) {
            const id = Number(crop);
            const list = sanitizeMonths(months);
            if (Number.isFinite(id) && list.length)
                seasonMonthsByCropId.set(id, list);
        }
        for (const [uid, months] of Object.entries(parsed.seasonsByUid || {})) {
            const list = sanitizeMonths(months);
            if (uid && list.length)
                seasonMonthsByUniqueid.set(uid, list);
        }
        if (!lastLearnedSeasonMonths.length) {
            const last = sanitizeMonths(parsed.lastSeason);
            if (last.length)
                lastLearnedSeasonMonths = last;
        }
    }
    catch (_a) {
        /* ignore */
    }
}
function persistExportImageKnowledge() {
    try {
        if (typeof localStorage === "undefined")
            return;
        // Merge with what other widget instances wrote meanwhile.
        syncExportImageKnowledgeFromStorage(true);
        const seasonsByCrop = {};
        for (const [crop, months] of seasonMonthsByCropId) {
            seasonsByCrop[String(crop)] = months;
        }
        const seasonsByUid = {};
        for (const [uid, months] of seasonMonthsByUniqueid) {
            seasonsByUid[uid] = months;
        }
        const payload = {
            gaps: Array.from(regionDatesWithoutImagery),
            scenes: Array.from(regionDatesWithImagery),
            seasonsByCrop,
            seasonsByUid,
            lastSeason: lastLearnedSeasonMonths,
        };
        const raw = JSON.stringify(payload);
        knowledgeStorageSignature = raw;
        localStorage.setItem(EXPORT_IMAGE_KNOWLEDGE_STORAGE_KEY, raw);
    }
    catch (_a) {
        /* ignore */
    }
}
syncExportImageKnowledgeFromStorage(true);
function normalizeUniqueidKey(uniqueid) {
    return String(uniqueid || "").replace(/[{}]/g, "").trim().toLowerCase();
}
function rememberExportImageSeasonMonths(uniqueid, months, cropId) {
    if (!months.length)
        return;
    lastLearnedSeasonMonths = months.slice();
    const key = normalizeUniqueidKey(uniqueid);
    if (key) {
        seasonMonthsByUniqueid.set(key, months.slice());
        while (seasonMonthsByUniqueid.size > 128) {
            const oldest = seasonMonthsByUniqueid.keys().next().value;
            if (oldest == null)
                break;
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
function getExportImageSeasonMonths(uniqueid, cropId) {
    syncExportImageKnowledgeFromStorage();
    const key = normalizeUniqueidKey(uniqueid);
    if (key) {
        const byUid = seasonMonthsByUniqueid.get(key);
        if (byUid === null || byUid === void 0 ? void 0 : byUid.length)
            return byUid;
    }
    if (cropId != null && Number.isFinite(cropId)) {
        const byCrop = seasonMonthsByCropId.get(Number(cropId));
        if (byCrop === null || byCrop === void 0 ? void 0 : byCrop.length)
            return byCrop;
        const defaults = getDefaultCropIndexSeasonMonths(cropId);
        if (defaults.length)
            return defaults;
    }
    return lastLearnedSeasonMonths.slice();
}
/** Newest→oldest export candidates (season + known imagery gaps). */
function listExportRasterDateCandidates(dates, opts) {
    var _a;
    const months = getExportImageSeasonMonths((opts === null || opts === void 0 ? void 0 : opts.uniqueid) || "", opts === null || opts === void 0 ? void 0 : opts.cropId);
    const limit = Math.max(1, (_a = opts === null || opts === void 0 ? void 0 : opts.limit) !== null && _a !== void 0 ? _a : 3);
    const out = [];
    const exclude = [...((opts === null || opts === void 0 ? void 0 : opts.exclude) || [])];
    while (out.length < limit) {
        const next = pickLatestUsableExportDate(dates, {
            months,
            regionId: opts === null || opts === void 0 ? void 0 : opts.regionId,
            exclude,
        }) ||
            (!months.length
                ? pickLatestUsableExportDate(dates, {
                    regionId: opts === null || opts === void 0 ? void 0 : opts.regionId,
                    exclude,
                })
                : null);
        if (!next)
            break;
        out.push(next);
        exclude.push(next);
    }
    return out;
}
/**
 * Pick the newest available-dates entry that export-image is likely to serve
 * for this polygon (crop season + known regional imagery gaps).
 */
function pickExportRasterDate(dates, opts) {
    return (listExportRasterDateCandidates(dates, Object.assign(Object.assign({}, opts), { limit: 1 }))[0] || null);
}
/** Latest YYYY-MM-DD whose month is in `months` (all dates when months empty). */
function pickLatestDateInMonths(dates, months) {
    return pickLatestUsableExportDate(dates, { months });
}
/**
 * `/available-dates` lists dates that have *index records*, but export-image
 * also needs the region's raster scene for that day and answers
 * "No imagery available for region_id=… on …" (HTTP 400) when it is missing.
 * That gap is region-wide, so cache it for every polygon of the region.
 */
function isExportImageNoImageryError(err) {
    const status = Number(err === null || err === void 0 ? void 0 : err.status);
    const text = String((err === null || err === void 0 ? void 0 : err.responseText) || (err === null || err === void 0 ? void 0 : err.message) || "");
    if (status !== 400 && !/HTTP\s+400/i.test(text))
        return false;
    return /no imagery available/i.test(text);
}
function regionDateKey(regionId, date) {
    return `${regionId !== null && regionId !== void 0 ? regionId : ""}|${String(date || "").slice(0, 10)}`;
}
function rememberRegionDateWithoutImagery(regionId, date) {
    const key = regionDateKey(regionId, date);
    if (!isValidRegionDateKey(key))
        return;
    if (regionDatesWithoutImagery.has(key))
        return;
    regionDatesWithoutImagery.add(key);
    while (regionDatesWithoutImagery.size > 512) {
        const oldest = regionDatesWithoutImagery.keys().next().value;
        if (oldest == null)
            break;
        regionDatesWithoutImagery.delete(oldest);
    }
    persistExportImageKnowledge();
}
function isRegionDateWithoutImagery(regionId, date) {
    syncExportImageKnowledgeFromStorage();
    return regionDatesWithoutImagery.has(regionDateKey(regionId, date));
}
function rememberRegionDateWithImagery(regionId, date) {
    const key = regionDateKey(regionId, date);
    if (!isValidRegionDateKey(key))
        return;
    if (regionDatesWithImagery.has(key))
        return;
    regionDatesWithImagery.add(key);
    while (regionDatesWithImagery.size > 512) {
        const oldest = regionDatesWithImagery.keys().next().value;
        if (oldest == null)
            break;
        regionDatesWithImagery.delete(oldest);
    }
    persistExportImageKnowledge();
}
function isRegionDateWithImagery(regionId, date) {
    syncExportImageKnowledgeFromStorage();
    return regionDatesWithImagery.has(regionDateKey(regionId, date));
}
/**
 * crop_id from a field polygon's attributes (table row or clicked graphic):
 * numeric crop_id/cropId first, else the turi name (wheat → 6 in api-agri).
 */
function resolveCropIdFromAttributes(attrs) {
    if (!attrs || typeof attrs !== "object")
        return null;
    let turi = "";
    for (const [key, value] of Object.entries(attrs)) {
        const lower = key.toLowerCase();
        if (lower === "crop_id" || lower === "cropid") {
            const n = Number(value);
            if (Number.isFinite(n) && n > 0)
                return n;
        }
        else if (lower === "turi" && value != null) {
            turi = String(value).trim();
        }
    }
    if (turi && (0,_shared_agri_crop_labels__WEBPACK_IMPORTED_MODULE_2__.getTuriCropLookupKey)(turi) === "bugdoy")
        return 6;
    return null;
}
/**
 * Newest date export-image can plausibly serve: inside the crop season and not
 * already known to lack regional imagery.
 */
function pickLatestUsableExportDate(dates, opts) {
    const months = (opts === null || opts === void 0 ? void 0 : opts.months) || [];
    const exclude = new Set(((opts === null || opts === void 0 ? void 0 : opts.exclude) || []).map((d) => String(d || "").slice(0, 10)));
    const list = (dates || [])
        .map((d) => String(d || "").slice(0, 10))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort((a, b) => a.localeCompare(b));
    for (let i = list.length - 1; i >= 0; i--) {
        const date = list[i];
        if (exclude.has(date))
            continue;
        if (months.length && !months.includes(Number(date.slice(5, 7))))
            continue;
        if ((opts === null || opts === void 0 ? void 0 : opts.regionId) != null &&
            isRegionDateWithoutImagery(opts.regionId, date)) {
            continue;
        }
        return date;
    }
    return null;
}
function exportImageCacheKey(params) {
    return [
        String(params.uniqueid || "").replace(/[{}]/g, ""),
        params.regionId,
        params.rasterDate,
        params.indiceType || "ndvi",
        params.stretch || "fixed",
    ].join("|");
}
function cloneExportCanvas(source) {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    const ctx = copy.getContext("2d");
    if (ctx)
        ctx.drawImage(source, 0, 0);
    return copy;
}
/**
 * Best-effort TLS / DNS warmup for api-agri so the first field click does not
 * pay cold-connection cost on export-image.
 */
function warmPolygonApiConnection() {
    try {
        void fetch(`${getAgriPolygonApiBaseUrl()}/`, {
            method: "GET",
            headers: { accept: "*/*" },
            mode: "cors",
            cache: "no-store",
        }).catch(() => {
            /* ignore — warmup only */
        });
    }
    catch (_a) {
        /* ignore */
    }
}
/**
 * GET /v1/polygon/{uniqueid}/export-image, requested with
 * response_format=tiff — fetches the raw GeoTIFF bytes directly (skips the
 * response_format=json envelope, whose exact stats/base64 field names
 * weren't confirmed) and decodes it client-side with geotiff.js. A GeoTIFF
 * carries its own extent + CRS in its tags, so no separate georeferencing
 * call is needed — read it straight off the decoded image.
 */
function fetchPolygonExportImageTiff(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheKey = exportImageCacheKey(params);
        let pending = exportImageCache.get(cacheKey);
        if (!pending) {
            pending = fetchPolygonExportImageTiffUncached(params).catch((err) => {
                exportImageCache.delete(cacheKey);
                throw err;
            });
            exportImageCache.set(cacheKey, pending);
            while (exportImageCache.size > EXPORT_IMAGE_CACHE_MAX) {
                const oldest = exportImageCache.keys().next().value;
                if (oldest == null)
                    break;
                exportImageCache.delete(oldest);
            }
        }
        const result = yield pending;
        // Clone canvas so a later MediaLayer remove/reuse cannot blank a cached entry.
        return Object.assign(Object.assign({}, result), { canvas: cloneExportCanvas(result.canvas) });
    });
}
/** One in-flight date-walk per polygon — kickOptimistic + fetchData share it. */
const exportDateWalkInFlight = new Map();
/**
 * Fetch available-dates (or use provided), then race a small parallel batch of
 * in-season candidates. First HTTP 200 wins; 400s update season/imagery caches.
 * Deduped so overlapping table-click paths do not stack sequential 400 cascades.
 */
function resolveExportImageWithDateWalk(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = normalizeUniqueidKey(params.uniqueid);
        if (!id)
            return null;
        const indiceType = params.indiceType || "ndvi";
        const key = `${id}|${params.regionId}|${indiceType}`;
        const existing = exportDateWalkInFlight.get(key);
        if (existing)
            return existing;
        // Pull what other widget instances learned (seasons, gaps, proven scenes).
        syncExportImageKnowledgeFromStorage(true);
        const walk = (() => __awaiter(this, void 0, void 0, function* () {
            let dates = params.dates || null;
            if (!(dates === null || dates === void 0 ? void 0 : dates.length)) {
                try {
                    dates = yield fetchPolygonAvailableDates(id, params.regionId, params.year);
                }
                catch (_a) {
                    return null;
                }
            }
            if (!(dates === null || dates === void 0 ? void 0 : dates.length))
                return null;
            const tried = [];
            for (let round = 0; round < 4; round++) {
                let candidates = listExportRasterDateCandidates(dates, {
                    uniqueid: id,
                    cropId: params.cropId,
                    regionId: params.regionId,
                    exclude: tried,
                    limit: 3,
                });
                if (!candidates.length)
                    return null;
                // Region scene already proven for the newest candidate (another
                // polygon of this region got a 200 on it) → single request, no
                // speculative siblings that would 400 on unknown gaps.
                if (isRegionDateWithImagery(params.regionId, candidates[0])) {
                    candidates = [candidates[0]];
                }
                const outcomes = yield Promise.all(candidates.map((date) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield fetchPolygonExportImageTiff({
                            uniqueid: id,
                            regionId: params.regionId,
                            rasterDate: date,
                            indiceType,
                            stretch: params.stretch || "fixed",
                        });
                        return { date, result, err: null };
                    }
                    catch (err) {
                        return { date, result: null, err };
                    }
                })));
                // Learn from EVERY 400 in the batch before returning the winner —
                // otherwise a gap behind the first success (e.g. 04-28 ok, 04-27 no
                // imagery) is never cached and the next polygon 400s on it again.
                let hit = null;
                for (const outcome of outcomes) {
                    tried.push(outcome.date);
                    if (outcome.result) {
                        rememberRegionDateWithImagery(params.regionId, outcome.date);
                        if (!hit || outcome.date > hit.date) {
                            hit = { date: outcome.date, result: outcome.result };
                        }
                        continue;
                    }
                    const err = outcome.err;
                    if (isExportImageOutOfSeasonError(err)) {
                        const months = parseExportImageSeasonMonths(err);
                        const crop = parseExportImageCropId(err);
                        if (months.length) {
                            rememberExportImageSeasonMonths(id, months, crop !== null && crop !== void 0 ? crop : params.cropId);
                        }
                    }
                    else if (isExportImageNoImageryError(err)) {
                        rememberRegionDateWithoutImagery(params.regionId, outcome.date);
                    }
                }
                if (hit)
                    return hit;
            }
            return null;
        }))().finally(() => {
            exportDateWalkInFlight.delete(key);
        });
        exportDateWalkInFlight.set(key, walk);
        return walk;
    });
}
function fetchPolygonExportImageTiffUncached(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const qs = new URLSearchParams({
            region_id: String(params.regionId),
            raster_date: params.rasterDate,
            indice_type: params.indiceType || "ndvi",
            stretch: params.stretch || "fixed",
            response_format: "tiff",
        });
        const url = `${getAgriPolygonApiBaseUrl()}/v1/polygon/${encodeURIComponent(params.uniqueid)}/export-image?${qs.toString()}`;
        agriPolygonApiLog("export-image:request", Object.assign({ url }, params));
        // Bound hung export-image calls so the map loader cannot stick forever.
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timeoutId = controller && typeof setTimeout === "function"
            ? setTimeout(() => {
                try {
                    controller.abort();
                }
                catch (_a) {
                    /* ignore */
                }
            }, 25000)
            : null;
        let res;
        try {
            res = yield fetch(url, Object.assign({ headers: { accept: "*/*" } }, (controller ? { signal: controller.signal } : {})));
        }
        catch (err) {
            if (timeoutId)
                clearTimeout(timeoutId);
            if ((err === null || err === void 0 ? void 0 : err.name) === "AbortError") {
                throw new Error("Export-image so‘rovi vaqtidan oshdi (25s).");
            }
            throw err;
        }
        if (timeoutId)
            clearTimeout(timeoutId);
        if (!res.ok) {
            let responseText = '';
            try {
                responseText = yield res.text();
            }
            catch (bodyError) {
                responseText = `<response body read failed: ${String((bodyError === null || bodyError === void 0 ? void 0 : bodyError.message) || bodyError)}>`;
            }
            const contentType = res.headers.get('content-type') || '';
            agriPolygonApiLog('export-image:FAILED-response', {
                url,
                status: res.status,
                statusText: res.statusText,
                contentType,
                responseText,
            });
            const error = new Error(`HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ''}${responseText ? `: ${responseText}` : ''}`);
            error.status = res.status;
            error.statusText = res.statusText;
            error.contentType = contentType;
            error.responseText = responseText;
            error.url = url;
            // Learn from every caller's 400 (not only the date walk) so the next
            // polygon in this region / crop never re-asks the same refused date.
            if (isExportImageNoImageryError(error)) {
                rememberRegionDateWithoutImagery(params.regionId, params.rasterDate);
            }
            else if (isExportImageOutOfSeasonError(error)) {
                const months = parseExportImageSeasonMonths(error);
                if (months.length) {
                    rememberExportImageSeasonMonths(params.uniqueid, months, parseExportImageCropId(error));
                }
            }
            throw error;
        }
        rememberRegionDateWithImagery(params.regionId, params.rasterDate);
        const buffer = yield res.arrayBuffer();
        const tiff = yield (0,geotiff__WEBPACK_IMPORTED_MODULE_4__.fromArrayBuffer)(buffer);
        const image = yield tiff.getImage();
        const bbox = image.getBoundingBox();
        const width = image.getWidth();
        const height = image.getHeight();
        const samplesPerPixel = image.getSamplesPerPixel();
        const pixelCount = width * height;
        if (!Array.isArray(bbox) ||
            bbox.length < 4 ||
            ![bbox[0], bbox[1], bbox[2], bbox[3]].every((n) => Number.isFinite(n)) ||
            !(bbox[2] > bbox[0]) ||
            !(bbox[3] > bbox[1]) ||
            !(width > 0) ||
            !(height > 0)) {
            throw new Error("GeoTIFF bounding box/size invalid");
        }
        let epsgCode = null;
        try {
            const geoKeys = image.getGeoKeys();
            epsgCode =
                Number(geoKeys === null || geoKeys === void 0 ? void 0 : geoKeys.ProjectedCSTypeGeoKey) ||
                    Number(geoKeys === null || geoKeys === void 0 ? void 0 : geoKeys.GeographicTypeGeoKey) ||
                    null;
            if (!Number.isFinite(epsgCode))
                epsgCode = null;
        }
        catch (_c) {
            epsgCode = null;
        }
        // Geographic coords without geo-keys: safe default. Projected metres without
        // an EPSG must not be tagged as the map view SR (causes stretch/misplace).
        if (epsgCode == null) {
            const absMax = Math.max(Math.abs(bbox[0]), Math.abs(bbox[1]), Math.abs(bbox[2]), Math.abs(bbox[3]));
            if (absMax <= 180)
                epsgCode = 4326;
        }
        let noData = null;
        try {
            const gd = Number((_b = (_a = image).getGDALNoData) === null || _b === void 0 ? void 0 : _b.call(_a));
            noData = Number.isFinite(gd) ? gd : null;
        }
        catch (_d) {
            noData = null;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("2D canvas context unavailable");
        const imageData = ctx.createImageData(width, height);
        const out = imageData.data;
        const clamp255 = (v) => {
            const n = Math.round(Number(v) || 0);
            return n < 0 ? 0 : n > 255 ? 255 : n;
        };
        let hoverValues = null;
        let dataMin = Infinity;
        let dataMax = -Infinity;
        if (samplesPerPixel >= 3) {
            // Pre-colored RGB/RGBA: one interleaved read only (was double-read before).
            const raster = (yield image.readRasters({ interleave: true }));
            const stride = samplesPerPixel;
            if (samplesPerPixel >= 4) {
                for (let p = 0; p < pixelCount; p++) {
                    const o = p * stride;
                    out[p * 4] = clamp255(raster[o]);
                    out[p * 4 + 1] = clamp255(raster[o + 1]);
                    out[p * 4 + 2] = clamp255(raster[o + 2]);
                    out[p * 4 + 3] = clamp255(raster[o + 3]);
                }
            }
            else {
                for (let p = 0; p < pixelCount; p++) {
                    const o = p * 3;
                    out[p * 4] = clamp255(raster[o]);
                    out[p * 4 + 1] = clamp255(raster[o + 1]);
                    out[p * 4 + 2] = clamp255(raster[o + 2]);
                    out[p * 4 + 3] = 255;
                }
            }
        }
        else {
            const bands = (yield image.readRasters({ interleave: false }));
            const band0 = bands === null || bands === void 0 ? void 0 : bands[0];
            const values = new Float32Array(pixelCount);
            for (let p = 0; p < pixelCount; p++) {
                const raw = Number(band0 === null || band0 === void 0 ? void 0 : band0[p]);
                const v = Number.isFinite(raw) ? raw : NaN;
                values[p] = v;
                if (Number.isFinite(v) && (noData == null || v !== noData)) {
                    if (v < dataMin)
                        dataMin = v;
                    if (v > dataMax)
                        dataMax = v;
                }
            }
            const looksLikeIndex = Number.isFinite(dataMin) &&
                Number.isFinite(dataMax) &&
                dataMin >= -1.5 &&
                dataMax <= 1.5;
            const looksLikeByte = Number.isFinite(dataMin) &&
                Number.isFinite(dataMax) &&
                dataMax > 2 &&
                dataMax <= 255;
            if (looksLikeIndex) {
                hoverValues = values;
            }
            else if (looksLikeByte) {
                hoverValues = new Float32Array(pixelCount);
                for (let p = 0; p < pixelCount; p++) {
                    const v = values[p];
                    hoverValues[p] =
                        !Number.isFinite(v) || v <= 0 || (noData != null && v === noData)
                            ? NaN
                            : v / 255;
                }
            }
            if (looksLikeIndex || (looksLikeByte && hoverValues)) {
                const src = hoverValues || values;
                for (let p = 0; p < pixelCount; p++) {
                    colorizeIndexValue(src[p], out, p * 4);
                }
            }
            else {
                for (let p = 0; p < pixelCount; p++) {
                    const v = clamp255(values[p]);
                    out[p * 4] = v;
                    out[p * 4 + 1] = v;
                    out[p * 4 + 2] = v;
                    out[p * 4 + 3] = v > 0 ? 255 : 0;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
        // Only keep RGBA when hover floats were not recovered (typical RGB TIFF).
        const rgbaForHover = !hoverValues && samplesPerPixel >= 3
            ? new Uint8ClampedArray(out)
            : null;
        agriPolygonApiLog("export-image:decoded", {
            uniqueid: params.uniqueid,
            rasterDate: params.rasterDate,
            width,
            height,
            samplesPerPixel,
            bbox,
            epsgCode,
            dataMin: Number.isFinite(dataMin) ? dataMin : null,
            dataMax: Number.isFinite(dataMax) ? dataMax : null,
            hasHoverValues: Boolean(hoverValues),
            hasRgbaHover: Boolean(rgbaForHover),
        });
        return {
            canvas,
            bbox,
            epsgCode,
            width,
            height,
            values: hoverValues,
            rgba: rgbaForHover,
            noData,
        };
    });
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-vegetation-overlay-prefetch.ts":
/*!*************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-vegetation-overlay-prefetch.ts ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getVegetationOverlayContext: () => (/* binding */ getVegetationOverlayContext),
/* harmony export */   getVegetationOverlayDateForRegion: () => (/* binding */ getVegetationOverlayDateForRegion),
/* harmony export */   prefetchVegetationOverlayForUniqueid: () => (/* binding */ prefetchVegetationOverlayForUniqueid),
/* harmony export */   setVegetationOverlayContext: () => (/* binding */ setVegetationOverlayContext)
/* harmony export */ });
/* harmony import */ var _gis_agri_polygon_api_source__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../gis/agri-polygon-api-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-polygon-api-source.ts");
/**
 * Shared vegetation overlay context so Popup can warm export-image as soon as
 * uniqueid is known — without waiting for Graff setState / available-dates race.
 */

const SESSION_DATE_KEY = "agri.veg.overlay.lastDate";
const SESSION_INDEX_KEY = "agri.veg.overlay.lastIndex";
const SESSION_REGION_KEY = "agri.veg.overlay.lastRegion";
const SESSION_YEAR_KEY = "agri.veg.overlay.lastYear";
const SESSION_DATE_REGION_KEY = "agri.veg.overlay.lastDateRegion";
const SESSION_DATE_YEAR_KEY = "agri.veg.overlay.lastDateYear";
let ctx = {};
function readSession() {
    try {
        if (typeof sessionStorage === "undefined")
            return {};
        const date = sessionStorage.getItem(SESSION_DATE_KEY) || undefined;
        const index = (sessionStorage.getItem(SESSION_INDEX_KEY) ||
            undefined);
        const regionRaw = sessionStorage.getItem(SESSION_REGION_KEY);
        const yearRaw = sessionStorage.getItem(SESSION_YEAR_KEY);
        const dateRegionRaw = sessionStorage.getItem(SESSION_DATE_REGION_KEY);
        const dateYearRaw = sessionStorage.getItem(SESSION_DATE_YEAR_KEY);
        const regionId = regionRaw != null ? Number(regionRaw) : undefined;
        const year = yearRaw != null ? Number(yearRaw) : undefined;
        const lastDateRegionId = dateRegionRaw != null ? Number(dateRegionRaw) : undefined;
        const lastDateYear = dateYearRaw != null ? Number(dateYearRaw) : undefined;
        return {
            lastDate: date || null,
            lastIndex: index || "ndvi",
            regionId: Number.isFinite(regionId) ? regionId : undefined,
            year: Number.isFinite(year) ? year : undefined,
            lastDateRegionId: Number.isFinite(lastDateRegionId)
                ? lastDateRegionId
                : undefined,
            lastDateYear: Number.isFinite(lastDateYear)
                ? lastDateYear
                : undefined,
        };
    }
    catch (_a) {
        return {};
    }
}
function writeSession(next) {
    try {
        if (typeof sessionStorage === "undefined")
            return;
        if (next.lastDate)
            sessionStorage.setItem(SESSION_DATE_KEY, next.lastDate);
        else
            sessionStorage.removeItem(SESSION_DATE_KEY);
        if (next.lastIndex)
            sessionStorage.setItem(SESSION_INDEX_KEY, next.lastIndex);
        if (next.regionId != null)
            sessionStorage.setItem(SESSION_REGION_KEY, String(next.regionId));
        if (next.year != null)
            sessionStorage.setItem(SESSION_YEAR_KEY, String(next.year));
        if (next.lastDate && next.lastDateRegionId != null) {
            sessionStorage.setItem(SESSION_DATE_REGION_KEY, String(next.lastDateRegionId));
        }
        else {
            sessionStorage.removeItem(SESSION_DATE_REGION_KEY);
        }
        if (next.lastDate && next.lastDateYear != null) {
            sessionStorage.setItem(SESSION_DATE_YEAR_KEY, String(next.lastDateYear));
        }
        else {
            sessionStorage.removeItem(SESSION_DATE_YEAR_KEY);
        }
    }
    catch (_a) {
        /* ignore quota / private mode */
    }
}
/** Merge live Graff/Localization context (region/year/last successful date). */
function setVegetationOverlayContext(patch) {
    var _a, _b, _c, _d;
    const next = Object.assign(Object.assign({}, ctx), patch);
    // A date is only meaningful together with the region/year it came from.
    if (patch.lastDate !== undefined) {
        if (patch.lastDate) {
            next.lastDateRegionId =
                (_b = (_a = patch.lastDateRegionId) !== null && _a !== void 0 ? _a : patch.regionId) !== null && _b !== void 0 ? _b : ctx.regionId;
            next.lastDateYear = (_d = (_c = patch.lastDateYear) !== null && _c !== void 0 ? _c : patch.year) !== null && _d !== void 0 ? _d : ctx.year;
        }
        else {
            next.lastDate = null;
            next.lastDateRegionId = undefined;
            next.lastDateYear = undefined;
        }
    }
    ctx = next;
    writeSession(ctx);
    return ctx;
}
function getVegetationOverlayContext() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (ctx.regionId == null ||
        ctx.year == null ||
        !ctx.lastDate) {
        const fromSession = readSession();
        ctx = {
            regionId: (_a = ctx.regionId) !== null && _a !== void 0 ? _a : fromSession.regionId,
            year: (_b = ctx.year) !== null && _b !== void 0 ? _b : fromSession.year,
            lastDate: (_c = ctx.lastDate) !== null && _c !== void 0 ? _c : fromSession.lastDate,
            lastIndex: (_e = (_d = ctx.lastIndex) !== null && _d !== void 0 ? _d : fromSession.lastIndex) !== null && _e !== void 0 ? _e : "ndvi",
            lastDateRegionId: (_f = ctx.lastDateRegionId) !== null && _f !== void 0 ? _f : fromSession.lastDateRegionId,
            lastDateYear: (_g = ctx.lastDateYear) !== null && _g !== void 0 ? _g : fromSession.lastDateYear,
        };
    }
    return ctx;
}
/**
 * Cached overlay date, but only when it belongs to the same region (and year):
 * export-image answers 400 for a raster_date that has no scene for the
 * requested polygon/region.
 */
function getVegetationOverlayDateForRegion(regionId, year) {
    const live = getVegetationOverlayContext();
    const date = String(live.lastDate || "").trim();
    if (!date || regionId == null)
        return null;
    if (live.lastDateRegionId != null && live.lastDateRegionId !== regionId) {
        return null;
    }
    if (year != null &&
        live.lastDateYear != null &&
        live.lastDateYear !== year) {
        return null;
    }
    return date;
}
function cleanUniqueid(uniqueid) {
    return String(uniqueid || "").replace(/[{}]/g, "").trim();
}
/**
 * Fire-and-forget: resolve a servable raster_date (crop season + imagery) and
 * warm the TIFF cache. Deduped with Graff's early-overlay walk so table clicks
 * do not stack sequential 400 cascades.
 */
function prefetchVegetationOverlayForUniqueid(uniqueid, opts) {
    var _a, _b, _c;
    const id = cleanUniqueid(uniqueid);
    if (!id)
        return;
    const live = getVegetationOverlayContext();
    const regionId = (_a = opts === null || opts === void 0 ? void 0 : opts.regionId) !== null && _a !== void 0 ? _a : live.regionId;
    const year = (_b = opts === null || opts === void 0 ? void 0 : opts.year) !== null && _b !== void 0 ? _b : live.year;
    const cropId = (_c = opts === null || opts === void 0 ? void 0 : opts.cropId) !== null && _c !== void 0 ? _c : null;
    const indiceType = ((opts === null || opts === void 0 ? void 0 : opts.indiceType) ||
        live.lastIndex ||
        "ndvi");
    if (regionId == null || !Number.isFinite(regionId))
        return;
    if (year == null || !Number.isFinite(year))
        return;
    void (0,_gis_agri_polygon_api_source__WEBPACK_IMPORTED_MODULE_0__.resolveExportImageWithDateWalk)({
        uniqueid: id,
        regionId,
        year,
        cropId,
        indiceType,
        dates: opts === null || opts === void 0 ? void 0 : opts.dates,
    })
        .then((hit) => {
        if (!hit)
            return;
        setVegetationOverlayContext({
            regionId,
            year,
            lastDate: hit.date,
            lastDateRegionId: regionId,
            lastDateYear: year,
            lastIndex: indiceType,
        });
    })
        .catch(() => {
        /* warm only — Graff handles errors */
    });
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/GraffPanel/runtime/graff-graph-constants.ts":
/*!************************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/GraffPanel/runtime/graff-graph-constants.ts ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GRAFF_INDEX_BUTTONS: () => (/* binding */ GRAFF_INDEX_BUTTONS),
/* harmony export */   GRAFF_INDEX_ORDER: () => (/* binding */ GRAFF_INDEX_ORDER),
/* harmony export */   REPUBLIC_TIMESERIES_INDEX_FIELDS: () => (/* binding */ REPUBLIC_TIMESERIES_INDEX_FIELDS),
/* harmony export */   isRepublicTimeseriesIndexField: () => (/* binding */ isRepublicTimeseriesIndexField)
/* harmony export */ });
const GRAFF_INDEX_BUTTONS = [
    { key: "ndvi", label: "NDVI", color: "#00d084" },
    { key: "savi", label: "SAVI", color: "#7aa5ff" },
    { key: "rvi", label: "RVI", color: "#ffb347" },
    { key: "ci", label: "CI", color: "#c78bff" },
    { key: "evi", label: "EVI", color: "#ff4d8d" },
    { key: "ndwi", label: "NDWI", color: "#2ec4f1" },
];
const GRAFF_INDEX_ORDER = GRAFF_INDEX_BUTTONS.map((item) => item.key);
/** Republic regional timeseries AVG field allow-list. */
const REPUBLIC_TIMESERIES_INDEX_FIELDS = [
    "ndvi",
    "savi",
    "evi",
    "rvi",
    "ci",
    "ndwi",
];
function isRepublicTimeseriesIndexField(value) {
    return REPUBLIC_TIMESERIES_INDEX_FIELDS.includes(value);
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/vendor/geotiff-decoders.ts":
/*!************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/vendor/geotiff-decoders.ts ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DeflateDecoder: () => (/* reexport safe */ _node_modules_geotiff_dist_module_compression_deflate_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   LzwDecoder: () => (/* reexport safe */ _node_modules_geotiff_dist_module_compression_lzw_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   PackbitsDecoder: () => (/* reexport safe */ _node_modules_geotiff_dist_module_compression_packbits_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   RawDecoder: () => (/* reexport safe */ _node_modules_geotiff_dist_module_compression_raw_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _node_modules_geotiff_dist_module_compression_raw_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../node_modules/geotiff/dist-module/compression/raw.js */ "./node_modules/geotiff/dist-module/compression/raw.js");
/* harmony import */ var _node_modules_geotiff_dist_module_compression_lzw_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../../node_modules/geotiff/dist-module/compression/lzw.js */ "./node_modules/geotiff/dist-module/compression/lzw.js");
/* harmony import */ var _node_modules_geotiff_dist_module_compression_deflate_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../../node_modules/geotiff/dist-module/compression/deflate.js */ "./node_modules/geotiff/dist-module/compression/deflate.js");
/* harmony import */ var _node_modules_geotiff_dist_module_compression_packbits_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../node_modules/geotiff/dist-module/compression/packbits.js */ "./node_modules/geotiff/dist-module/compression/packbits.js");
/**
 * Single import site for geotiff compression decoders.
 * geotiff's package.json only exports "." — deep imports fail under webpack 5.
 * Relative node_modules paths (6 levels from src/vendor → client/) bypass exports.
 */







/***/ }),

/***/ "?cdec":
/*!**********************!*\
  !*** http (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?753a":
/*!***********************!*\
  !*** https (ignored) ***!
  \***********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?4e4d":
/*!*********************!*\
  !*** url (ignored) ***!
  \*********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?662e":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyb193aWRnZXRWNV9zcmNfZ2lzX2FncmktdmVnZXRhdGlvbi1vdmVybGF5LXByZWZldGNoX3RzLXlvdXItLWZjMzBlNS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7R0FVRztBQUNtRDtBQU1sQjtBQUM2QjtBQUNDO0FBRWxFLG1EQUFVLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBUyxFQUFFLGtEQUFDLHVFQUFpQixNQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1RSxtREFBVSxDQUFDLENBQUMsRUFBRSxHQUFTLEVBQUUsa0RBQUMsdUVBQWlCLE1BQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9ELG1EQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsR0FBUyxFQUFFLGtEQUFDLDJFQUFxQixNQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1RSxtREFBVSxDQUFDLEtBQUssRUFBRSxHQUFTLEVBQUUsa0RBQUMsNEVBQXNCLE1BQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRWpFLFNBQVMsd0JBQXdCO0lBQ3RDLE9BQU8sNkVBQWtCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztBQUNoRCxDQUFDO0FBRUQsK0RBQStEO0FBQ3hELFNBQVMsaUJBQWlCLENBQy9CLE1BQWMsRUFDZCxPQUFpQztJQUVqQyxXQUFXO0FBQ2IsQ0FBQztBQVVEOzs7R0FHRztBQUNJLFNBQWUsMEJBQTBCLENBQzlDLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLElBQVk7O1FBRVosTUFBTSxHQUFHLEdBQ1AsR0FBRyx3QkFBd0IsRUFBRSxlQUFlLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxrQkFBa0I7WUFDMUYsY0FBYyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hHLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUVoRixNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNaLGlCQUFpQixDQUFDLHdCQUF3QixFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUN6RSxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFrQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3RCxpQkFBaUIsQ0FBQywwQkFBMEIsRUFBRTtZQUM1QyxRQUFRO1lBQ1IsS0FBSyxFQUFFLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxLQUFLO1lBQ2xCLEtBQUssRUFBRSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsS0FBSztTQUNuQixDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDdEQsQ0FBQztDQUFBO0FBbUNELDBGQUEwRjtBQUMxRixNQUFNLGVBQWUsR0FBMEQ7SUFDN0UsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO0lBQy9CLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtJQUNqQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7SUFDakMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO0lBQ2xDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtJQUNuQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7SUFDbkMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFO0lBQ25DLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtJQUNsQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7SUFDakMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO0NBQ2hDLENBQUM7QUFFRixTQUFTLElBQUksQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7SUFD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TSxLQUFLLEdBQUcsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDbkQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNaLElBQUksQ0FBQyxHQUFHLENBQUM7WUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDN0IsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7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RSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7SUFDaEQsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtJQUNoRCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO0lBQzlDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7SUFDNUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtJQUM5QyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO0NBQ2pELENBQUM7QUFFSyxNQUFNLGlCQUFpQixHQUFvQixtQkFBbUIsQ0FBQyxHQUFHLENBQ3ZFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNuQixDQUFDO0FBRUYseURBQXlEO0FBQ2xELE1BQU0sZ0NBQWdDLEdBQUc7SUFDOUMsTUFBTTtJQUNOLE1BQU07SUFDTixLQUFLO0lBQ0wsS0FBSztJQUNMLElBQUk7SUFDSixNQUFNO0NBQ0UsQ0FBQztBQUtKLFNBQVMsOEJBQThCLENBQzVDLEtBQWE7SUFFYixPQUFRLGdDQUFzRCxDQUFDLFFBQVEsQ0FDckUsS0FBSyxDQUNOLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pDRDs7OztHQUlHO0FBQzRGO0FBQ0E7QUFDUTtBQUNFO0FBRXRDOzs7Ozs7Ozs7OztBQ1ZuRTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9naXMvYWdyaS1wb2x5Z29uLWFwaS1zb3VyY2UudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2dpcy9hZ3JpLXZlZ2V0YXRpb24tb3ZlcmxheS1wcmVmZXRjaC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvcGFuZWxzL0dyYWZmUGFuZWwvcnVudGltZS9ncmFmZi1ncmFwaC1jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL3ZlbmRvci9nZW90aWZmLWRlY29kZXJzLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvaWdub3JlZHxDOlxcYXJjZ2lzLWV4cGVyaWVuY2UtYnVpbGRlci0xLjE2XFxBcmNHSVNFeHBlcmllbmNlQnVpbGRlclxcY2xpZW50XFxub2RlX21vZHVsZXNcXGdlb3RpZmZcXGRpc3QtbW9kdWxlXFxzb3VyY2VcXGNsaWVudHxodHRwIiwid2VicGFjazovL2V4Yi1jbGllbnQvaWdub3JlZHxDOlxcYXJjZ2lzLWV4cGVyaWVuY2UtYnVpbGRlci0xLjE2XFxBcmNHSVNFeHBlcmllbmNlQnVpbGRlclxcY2xpZW50XFxub2RlX21vZHVsZXNcXGdlb3RpZmZcXGRpc3QtbW9kdWxlXFxzb3VyY2VcXGNsaWVudHxodHRwcyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2lnbm9yZWR8QzpcXGFyY2dpcy1leHBlcmllbmNlLWJ1aWxkZXItMS4xNlxcQXJjR0lTRXhwZXJpZW5jZUJ1aWxkZXJcXGNsaWVudFxcbm9kZV9tb2R1bGVzXFxnZW90aWZmXFxkaXN0LW1vZHVsZVxcc291cmNlXFxjbGllbnR8dXJsIiwid2VicGFjazovL2V4Yi1jbGllbnQvaWdub3JlZHxDOlxcYXJjZ2lzLWV4cGVyaWVuY2UtYnVpbGRlci0xLjE2XFxBcmNHSVNFeHBlcmllbmNlQnVpbGRlclxcY2xpZW50XFxub2RlX21vZHVsZXNcXGdlb3RpZmZcXGRpc3QtbW9kdWxlXFxzb3VyY2V8ZnMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDbGllbnQgZm9yIHRoZSBhcGktYWdyaS5zZ20udXpzcGFjZS51eiBSRVNUIEFQSSDigJQgcGVyLXBvbHlnb24gdmVnZXRhdGlvblxuICogaW5kZXggYXZhaWxhYmxlIGRhdGVzIGFuZCBjb2xvcmVkIHJhc3RlciBleHBvcnRzLlxuICpcbiAqIFNlcGFyYXRlIGZyb20gYWdyaS12ZWdldGF0aW9uLWRhdGEtc291cmNlLnRzICh3aGljaCBxdWVyaWVzIHRoZSByYXdcbiAqIEFyY0dJUyBhZ3JpX3ZlZ2V0YXRpb25faW5kaWNlcyBUYWJsZSBkaXJlY3RseSk6IHRoYXQgdGFibGUgaGFzIHNjYWxhclxuICogaW5kZXggdmFsdWVzIHBlciAodW5pcXVlaWQsIHJhc3Rlcl9kYXRlKSwgZmluZSBmb3IgY2hhcnRzIGFuZCB0aGVcbiAqIHJlZ2lvbi13aWRlIHN0YXR1cyBiYXIsIGJ1dCBubyBwaXhlbCBkYXRhLiBUaGlzIEFQSSBpcyB1c2VkIHNwZWNpZmljYWxseVxuICogZm9yIHRoZSBzaW5nbGUtc2VsZWN0ZWQtcG9seWdvbiBjYXNlIGluIEFncmlHcmFmZjEwLCB3aGVyZSB3ZSBuZWVkIGFuXG4gKiBhY3R1YWwgcmVuZGVyZWQsIGdlb3JlZmVyZW5jZWQgcmFzdGVyIGltYWdlIHRvIG92ZXJsYXkgb24gdGhlIG1hcC5cbiAqL1xuaW1wb3J0IHsgYWRkRGVjb2RlciwgZnJvbUFycmF5QnVmZmVyIH0gZnJvbSBcImdlb3RpZmZcIjtcbmltcG9ydCB7XG4gIERlZmxhdGVEZWNvZGVyLFxuICBMendEZWNvZGVyLFxuICBQYWNrYml0c0RlY29kZXIsXG4gIFJhd0RlY29kZXIsXG59IGZyb20gXCIuLi92ZW5kb3IvZ2VvdGlmZi1kZWNvZGVyc1wiO1xuaW1wb3J0IHsgZ2V0QWdyaVNlcnZpY2VVcmxzIH0gZnJvbSBcIi4uL3NoYXJlZC9hZ3JpLXNlcnZpY2UtdXJsc1wiO1xuaW1wb3J0IHsgZ2V0VHVyaUNyb3BMb29rdXBLZXkgfSBmcm9tIFwiLi4vc2hhcmVkL2FncmktY3JvcC1sYWJlbHNcIjtcblxuYWRkRGVjb2RlcihbdW5kZWZpbmVkLCAxXSwgYXN5bmMgKCkgPT4gUmF3RGVjb2RlciBhcyBhbnksIHVuZGVmaW5lZCwgZmFsc2UpO1xuYWRkRGVjb2Rlcig1LCBhc3luYyAoKSA9PiBMendEZWNvZGVyIGFzIGFueSwgdW5kZWZpbmVkLCBmYWxzZSk7XG5hZGREZWNvZGVyKFs4LCAzMjk0Nl0sIGFzeW5jICgpID0+IERlZmxhdGVEZWNvZGVyIGFzIGFueSwgdW5kZWZpbmVkLCBmYWxzZSk7XG5hZGREZWNvZGVyKDMyNzczLCBhc3luYyAoKSA9PiBQYWNrYml0c0RlY29kZXIgYXMgYW55LCB1bmRlZmluZWQsIGZhbHNlKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFncmlQb2x5Z29uQXBpQmFzZVVybCgpOiBzdHJpbmcge1xuICByZXR1cm4gZ2V0QWdyaVNlcnZpY2VVcmxzKCkucG9seWdvbkFwaUJhc2VVcmw7XG59XG5cbi8qKiBMb2dnZXIgZGlzYWJsZWQg4oCUIGtlZXAgY2FsbCBzaXRlcyB3aXRob3V0IGNvbnNvbGUgbm9pc2UuICovXG5leHBvcnQgZnVuY3Rpb24gYWdyaVBvbHlnb25BcGlMb2coXG4gIF9waGFzZTogc3RyaW5nLFxuICBfZGV0YWlsPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4pOiB2b2lkIHtcbiAgLyogbm8tb3AgKi9cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb2x5Z29uQXZhaWxhYmxlRGF0ZXNSZXNwb25zZSB7XG4gIHVuaXF1ZWlkOiBzdHJpbmc7XG4gIHJlZ2lvbjogc3RyaW5nO1xuICB5ZWFyOiBudW1iZXI7XG4gIGNvdW50OiBudW1iZXI7XG4gIGRhdGVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBHRVQgL3YxL3BvbHlnb24ve3VuaXF1ZWlkfS9hdmFpbGFibGUtZGF0ZXNcbiAqIENvbmZpcm1lZCByZXNwb25zZSBzaGFwZTogeyB1bmlxdWVpZCwgcmVnaW9uLCB5ZWFyLCBjb3VudCwgZGF0ZXM6IFtdIH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUG9seWdvbkF2YWlsYWJsZURhdGVzKFxuICB1bmlxdWVpZDogc3RyaW5nLFxuICByZWdpb25JZDogbnVtYmVyLFxuICB5ZWFyOiBudW1iZXIsXG4pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IHVybCA9XG4gICAgYCR7Z2V0QWdyaVBvbHlnb25BcGlCYXNlVXJsKCl9L3YxL3BvbHlnb24vJHtlbmNvZGVVUklDb21wb25lbnQodW5pcXVlaWQpfS9hdmFpbGFibGUtZGF0ZXNgICtcbiAgICBgP3JlZ2lvbl9pZD0ke2VuY29kZVVSSUNvbXBvbmVudChTdHJpbmcocmVnaW9uSWQpKX0meWVhcj0ke2VuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoeWVhcikpfWA7XG4gIGFncmlQb2x5Z29uQXBpTG9nKFwiYXZhaWxhYmxlLWRhdGVzOnJlcXVlc3RcIiwgeyB1cmwsIHVuaXF1ZWlkLCByZWdpb25JZCwgeWVhciB9KTtcblxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHsgaGVhZGVyczogeyBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0gfSk7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgYWdyaVBvbHlnb25BcGlMb2coXCJhdmFpbGFibGUtZGF0ZXM6RkFJTEVEXCIsIHsgdXJsLCBzdGF0dXM6IHJlcy5zdGF0dXMgfSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c31gKTtcbiAgfVxuICBjb25zdCBqc29uOiBQb2x5Z29uQXZhaWxhYmxlRGF0ZXNSZXNwb25zZSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gIGFncmlQb2x5Z29uQXBpTG9nKFwiYXZhaWxhYmxlLWRhdGVzOnJlc3BvbnNlXCIsIHtcbiAgICB1bmlxdWVpZCxcbiAgICBjb3VudDoganNvbj8uY291bnQsXG4gICAgZGF0ZXM6IGpzb24/LmRhdGVzLFxuICB9KTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoanNvbj8uZGF0ZXMpID8ganNvbi5kYXRlcyA6IFtdO1xufVxuXG5leHBvcnQgdHlwZSBWZWdldGF0aW9uSW5kaWNlVHlwZSA9XG4gIHwgXCJuZHZpXCJcbiAgfCBcInNhdmlcIlxuICB8IFwicnZpXCJcbiAgfCBcImNpXCJcbiAgfCBcImV2aVwiXG4gIHwgXCJuZHJlXCJcbiAgfCBcIm5kd2lcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQb2x5Z29uRXhwb3J0SW1hZ2VSZXN1bHQge1xuICAvKiogRGVjb2RlZCwgY29sb3JlZCByYXN0ZXIgZHJhd24gb250byBhIGNhbnZhcyAoUkdCQSksIHJlYWR5IHRvIGRpc3BsYXkuICovXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIC8qKiBbbWluWCwgbWluWSwgbWF4WCwgbWF4WV0sIHJlYWQgZGlyZWN0bHkgZnJvbSB0aGUgR2VvVElGRidzIG93biBnZW8gdGFncy4gKi9cbiAgYmJveDogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIC8qKiBFUFNHL1dLSUQgcmVhZCBmcm9tIHRoZSBHZW9USUZGIGdlbyBrZXlzLCB3aGVuIHByZXNlbnQuICovXG4gIGVwc2dDb2RlOiBudW1iZXIgfCBudWxsO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgLyoqXG4gICAqIFJvdy1tYWpvciBwZXItcGl4ZWwgaW5kZXggdmFsdWVzIChORFZJL1NBVkkv4oCmKSwgdXNlZCBmb3IgbWFwIGhvdmVyIHRvb2x0aXBzLlxuICAgKiBQcmVzZW50IGZvciBmbG9hdCAvIHNpbmdsZS1iYW5kIHJhc3RlcnMuIEZvciBwcmUtY29sb3JlZCBSR0IsIHByZWZlciBgcmdiYWBcbiAgICogKyBzYW1wbGVJbmRleEZyb21SZ2JhIChhdm9pZHMgYSBmdWxsLWltYWdlIHJldmVyc2UgcGFzcyBiZWZvcmUgZmlyc3QgcGFpbnQpLlxuICAgKi9cbiAgdmFsdWVzOiBGbG9hdDMyQXJyYXkgfCBudWxsO1xuICAvKipcbiAgICogUm93LW1ham9yIFJHQkEgKGxlbmd0aCB3aWR0aCpoZWlnaHQqNCkgZm9yIGxhenkgaG92ZXIgc2FtcGxpbmcgb24gUkdCIFRJRkZzLlxuICAgKiBOdWxsIHdoZW4gYHZhbHVlc2AgYWxyZWFkeSBob2xkcyBmbG9hdCBpbmRpY2VzLlxuICAgKi9cbiAgcmdiYTogVWludDhDbGFtcGVkQXJyYXkgfCBudWxsO1xuICAvKiogU2VudGluZWwgZm9yIHRyYW5zcGFyZW50IC8gb3V0c2lkZS1wb2x5Z29uIHBpeGVscy4gKi9cbiAgbm9EYXRhOiBudW1iZXIgfCBudWxsO1xufVxuXG4vKiogQ2xhc3NpYyB2ZWdldGF0aW9uIGNvbG9yIHN0b3BzIChsb3cg4oaSIGhpZ2gpIGZvciBjbGllbnQtc2lkZSBjb2xvcml6ZSArIFJHQiByZXZlcnNlLiAqL1xuY29uc3QgVkVHX0NPTE9SX1NUT1BTOiBBcnJheTx7IHY6IG51bWJlcjsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9PiA9IFtcbiAgeyB2OiAwLjAsIHI6IDE2NSwgZzogMCwgYjogMzggfSxcbiAgeyB2OiAwLjE1LCByOiAyMTUsIGc6IDQ4LCBiOiAzOSB9LFxuICB7IHY6IDAuMywgcjogMjQ0LCBnOiAxMDksIGI6IDY3IH0sXG4gIHsgdjogMC40NSwgcjogMjUzLCBnOiAxNzQsIGI6IDk3IH0sXG4gIHsgdjogMC41NSwgcjogMjU0LCBnOiAyMjQsIGI6IDEzOSB9LFxuICB7IHY6IDAuNjUsIHI6IDIxNywgZzogMjM5LCBiOiAxMzkgfSxcbiAgeyB2OiAwLjc1LCByOiAxNjYsIGc6IDIxNywgYjogMTA2IH0sXG4gIHsgdjogMC44NSwgcjogMTAyLCBnOiAxODksIGI6IDk5IH0sXG4gIHsgdjogMC45NSwgcjogMjYsIGc6IDE1MiwgYjogODAgfSxcbiAgeyB2OiAxLjAsIHI6IDAsIGc6IDEwNCwgYjogNTUgfSxcbl07XG5cbmZ1bmN0aW9uIGxlcnAoYTogbnVtYmVyLCBiOiBudW1iZXIsIHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBhICsgKGIgLSBhKSAqIHQ7XG59XG5cbmZ1bmN0aW9uIGNvbG9yaXplSW5kZXhWYWx1ZShcbiAgdmFsdWU6IG51bWJlcixcbiAgb3V0OiBVaW50OENsYW1wZWRBcnJheSxcbiAgb2Zmc2V0OiBudW1iZXIsXG4pOiB2b2lkIHtcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgb3V0W29mZnNldF0gPSAwO1xuICAgIG91dFtvZmZzZXQgKyAxXSA9IDA7XG4gICAgb3V0W29mZnNldCArIDJdID0gMDtcbiAgICBvdXRbb2Zmc2V0ICsgM10gPSAwO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB2ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUpKTtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoaSA8IFZFR19DT0xPUl9TVE9QUy5sZW5ndGggLSAxICYmIFZFR19DT0xPUl9TVE9QU1tpICsgMV0udiA8IHYpIGkrKztcbiAgY29uc3QgYSA9IFZFR19DT0xPUl9TVE9QU1tpXTtcbiAgY29uc3QgYiA9IFZFR19DT0xPUl9TVE9QU1tNYXRoLm1pbihpICsgMSwgVkVHX0NPTE9SX1NUT1BTLmxlbmd0aCAtIDEpXTtcbiAgY29uc3Qgc3BhbiA9IGIudiAtIGEudiB8fCAxO1xuICBjb25zdCB0ID0gKHYgLSBhLnYpIC8gc3BhbjtcbiAgb3V0W29mZnNldF0gPSBNYXRoLnJvdW5kKGxlcnAoYS5yLCBiLnIsIHQpKTtcbiAgb3V0W29mZnNldCArIDFdID0gTWF0aC5yb3VuZChsZXJwKGEuZywgYi5nLCB0KSk7XG4gIG91dFtvZmZzZXQgKyAyXSA9IE1hdGgucm91bmQobGVycChhLmIsIGIuYiwgdCkpO1xuICBvdXRbb2Zmc2V0ICsgM10gPSAyNTU7XG59XG5cbi8qKlxuICogUmVjb3ZlciBhbiBhcHByb3hpbWF0ZSBjb250aW51b3VzIGluZGV4ICgwLi4xKSBmcm9tIGEgcHJlLWNvbG9yZWQgUkdCIHBpeGVsLlxuICogUHJvamVjdHMgb250byB0aGUgbmVhcmVzdCBzZWdtZW50IG9mIFZFR19DT0xPUl9TVE9QUyAobm90IG5lYXJlc3Qgc3RvcCBvbmx5KSxcbiAqIHNvIGhvdmVyIHNob3dzIHZhbHVlcyBsaWtlIDAuMjIgLyAwLjM3IGluc3RlYWQgb2Ygb25seSAwLjE1IC8gMC4zMCAvIDAuNDUuXG4gKiBTdGlsbCBhbiBhcHByb3hpbWF0aW9uIHdoZW4gdGhlIFRJRkYgaGFzIG5vIGZsb2F0IGJhbmQg4oCUIHRydWUgTkRWSSBuZWVkcyBmbG9hdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW1wbGVJbmRleEZyb21SZ2JhKFxuICByOiBudW1iZXIsXG4gIGc6IG51bWJlcixcbiAgYjogbnVtYmVyLFxuICBhPzogbnVtYmVyLFxuKTogbnVtYmVyIHwgbnVsbCB7XG4gIGlmIChhICE9IG51bGwgJiYgYSA8IDgpIHJldHVybiBudWxsO1xuICBpZiAociArIGcgKyBiIDwgOCkgcmV0dXJuIG51bGw7XG5cbiAgbGV0IGJlc3RWYWwgPSAwO1xuICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IFZFR19DT0xPUl9TVE9QUy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjb25zdCBzdG9wQSA9IFZFR19DT0xPUl9TVE9QU1tpXTtcbiAgICBjb25zdCBzdG9wQyA9IFZFR19DT0xPUl9TVE9QU1tpICsgMV07XG4gICAgY29uc3QgYWJ4ID0gc3RvcEMuciAtIHN0b3BBLnI7XG4gICAgY29uc3QgYWJ5ID0gc3RvcEMuZyAtIHN0b3BBLmc7XG4gICAgY29uc3QgYWJ6ID0gc3RvcEMuYiAtIHN0b3BBLmI7XG4gICAgY29uc3QgYWIyID0gYWJ4ICogYWJ4ICsgYWJ5ICogYWJ5ICsgYWJ6ICogYWJ6IHx8IDE7XG4gICAgY29uc3QgYXB4ID0gciAtIHN0b3BBLnI7XG4gICAgY29uc3QgYXB5ID0gZyAtIHN0b3BBLmc7XG4gICAgY29uc3QgYXB6ID0gYiAtIHN0b3BBLmI7XG4gICAgbGV0IHQgPSAoYXB4ICogYWJ4ICsgYXB5ICogYWJ5ICsgYXB6ICogYWJ6KSAvIGFiMjtcbiAgICBpZiAodCA8IDApIHQgPSAwO1xuICAgIGVsc2UgaWYgKHQgPiAxKSB0ID0gMTtcbiAgICBjb25zdCBjeCA9IHN0b3BBLnIgKyBhYnggKiB0O1xuICAgIGNvbnN0IGN5ID0gc3RvcEEuZyArIGFieSAqIHQ7XG4gICAgY29uc3QgY3ogPSBzdG9wQS5iICsgYWJ6ICogdDtcbiAgICBjb25zdCBkciA9IHIgLSBjeDtcbiAgICBjb25zdCBkZyA9IGcgLSBjeTtcbiAgICBjb25zdCBkYiA9IGIgLSBjejtcbiAgICBjb25zdCBkaXN0ID0gZHIgKiBkciArIGRnICogZGcgKyBkYiAqIGRiO1xuICAgIGlmIChkaXN0IDwgYmVzdERpc3QpIHtcbiAgICAgIGJlc3REaXN0ID0gZGlzdDtcbiAgICAgIGJlc3RWYWwgPSBzdG9wQS52ICsgKHN0b3BDLnYgLSBzdG9wQS52KSAqIHQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJlc3RWYWw7XG59XG5cbi8qKiBTZXNzaW9uIGNhY2hlOiBmaXJzdCBjbGljayBwYXlzIG5ldHdvcmsrZGVjb2RlOyByZXBlYXRzIHJldXNlIHRoZSBjYW52YXMuICovXG5jb25zdCBleHBvcnRJbWFnZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8UG9seWdvbkV4cG9ydEltYWdlUmVzdWx0Pj4oKTtcbmNvbnN0IEVYUE9SVF9JTUFHRV9DQUNIRV9NQVggPSAyNDtcblxuY29uc3QgTU9OVEhfTkFNRV9UT19OVU1CRVI6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7XG4gIGphbnVhcnk6IDEsXG4gIGZlYnJ1YXJ5OiAyLFxuICBtYXJjaDogMyxcbiAgYXByaWw6IDQsXG4gIG1heTogNSxcbiAganVuZTogNixcbiAganVseTogNyxcbiAgYXVndXN0OiA4LFxuICBzZXB0ZW1iZXI6IDksXG4gIG9jdG9iZXI6IDEwLFxuICBub3ZlbWJlcjogMTEsXG4gIGRlY2VtYmVyOiAxMixcbn07XG5cbi8qKlxuICogZXhwb3J0LWltYWdlIHJlamVjdHMgZGF0ZXMgb3V0c2lkZSBhIGNyb3AncyBpbmRleCBzZWFzb24gd2l0aCBIVFRQIDQwMCwgZS5nLlxuICogXCJJbmRpY2VzIGZvciBjcm9wX2lkPTYgKHdoZWF0KSBhcmUgY2FsY3VsYXRlZCBvbmx5IGluIE1hcmNoLCBBcHJpbDsgU2VwdGVtYmVyXG4gKiBpcyBvdXRzaWRlIHRoZSBzZWFzb25cIi4gL2F2YWlsYWJsZS1kYXRlcyBsaXN0cyBldmVyeSBzY2VuZSBkYXRlIHJlZ2FyZGxlc3Mgb2ZcbiAqIGNyb3AsIHNvIGFuIG91dC1vZi1zZWFzb24gZGF0ZSBpcyBhIG5vcm1hbCBhbnN3ZXIgdGhlcmUg4oCUIHRoZSBzZWFzb24gaXMgb25seVxuICogZGlzY292ZXJhYmxlIGZyb20gdGhpcyBlcnJvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwb3J0SW1hZ2VPdXRPZlNlYXNvbkVycm9yKGVycjogdW5rbm93bik6IGJvb2xlYW4ge1xuICBjb25zdCBzdGF0dXMgPSBOdW1iZXIoKGVyciBhcyBhbnkpPy5zdGF0dXMpO1xuICBjb25zdCB0ZXh0ID0gU3RyaW5nKFxuICAgIChlcnIgYXMgYW55KT8ucmVzcG9uc2VUZXh0IHx8IChlcnIgYXMgYW55KT8ubWVzc2FnZSB8fCBcIlwiLFxuICApO1xuICBpZiAoc3RhdHVzICE9PSA0MDAgJiYgIS9IVFRQXFxzKzQwMC9pLnRlc3QodGV4dCkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIC9vdXRzaWRlIHRoZSBzZWFzb258Y2FsY3VsYXRlZCBvbmx5IGluL2kudGVzdCh0ZXh0KTtcbn1cblxuLyoqIE1vbnRoIG51bWJlcnMgKDHigJMxMikgbmFtZWQgaW4gYW4gb3V0LW9mLXNlYXNvbiBleHBvcnQtaW1hZ2UgZXJyb3IuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeHBvcnRJbWFnZVNlYXNvbk1vbnRocyhlcnI6IHVua25vd24pOiBudW1iZXJbXSB7XG4gIGNvbnN0IHRleHQgPSBTdHJpbmcoXG4gICAgKGVyciBhcyBhbnkpPy5yZXNwb25zZVRleHQgfHwgKGVyciBhcyBhbnkpPy5tZXNzYWdlIHx8IGVyciB8fCBcIlwiLFxuICApLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IG1hcmtlciA9IHRleHQuaW5kZXhPZihcImNhbGN1bGF0ZWQgb25seSBpblwiKTtcbiAgaWYgKG1hcmtlciA8IDApIHJldHVybiBbXTtcbiAgLy8gU3RvcCBiZWZvcmUgdGhlIFwiOyA8TW9udGg+IGlzIG91dHNpZGUgdGhlIHNlYXNvblwiIHRhaWwg4oCUIHRoYXQgbW9udGggaXMgTk9UIGFsbG93ZWQuXG4gIGNvbnN0IHRhaWwgPSB0ZXh0LnNsaWNlKG1hcmtlcik7XG4gIGNvbnN0IGFsbG93ZWRQYXJ0ID0gdGFpbC5zcGxpdChcIjtcIilbMF07XG4gIGNvbnN0IG1vbnRocyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBmb3IgKGNvbnN0IFtuYW1lLCBudW1dIG9mIE9iamVjdC5lbnRyaWVzKE1PTlRIX05BTUVfVE9fTlVNQkVSKSkge1xuICAgIGlmIChhbGxvd2VkUGFydC5pbmNsdWRlcyhuYW1lKSkgbW9udGhzLmFkZChudW0pO1xuICB9XG4gIHJldHVybiBBcnJheS5mcm9tKG1vbnRocykuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xufVxuXG4vKiogY3JvcF9pZCBmcm9tIFwiSW5kaWNlcyBmb3IgY3JvcF9pZD02ICh3aGVhdCkgYXJlIGNhbGN1bGF0ZWQgb25seSBpbiDigKZcIi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4cG9ydEltYWdlQ3JvcElkKGVycjogdW5rbm93bik6IG51bWJlciB8IG51bGwge1xuICBjb25zdCB0ZXh0ID0gU3RyaW5nKFxuICAgIChlcnIgYXMgYW55KT8ucmVzcG9uc2VUZXh0IHx8IChlcnIgYXMgYW55KT8ubWVzc2FnZSB8fCBlcnIgfHwgXCJcIixcbiAgKTtcbiAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9jcm9wX2lkXFxzKj1cXHMqKFxcZCspL2kpO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgaWQgPSBOdW1iZXIobWF0Y2hbMV0pO1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKGlkKSA/IGlkIDogbnVsbDtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IGluZGV4IHNlYXNvbnMgZm9yIGNyb3BzIHdob3NlIGV4cG9ydC1pbWFnZSBydWxlcyBhcmUga25vd24gZnJvbSB0aGVcbiAqIEFQSS4gV2l0aG91dCB0aGlzLCB0aGUgZmlyc3QgY2xpY2sgcHJvYmVzIC9hdmFpbGFibGUtZGF0ZXMnIGxhdGVzdCBzY2VuZVxuICogKG9mdGVuIFNlcHRlbWJlcikgYW5kIGJ1cm5zIGEgNDAwIGJlZm9yZSBsZWFybmluZyB0aGUgc2Vhc29uIGZyb20gdGhlIGVycm9yLlxuICovXG5jb25zdCBERUZBVUxUX0NST1BfSU5ERVhfU0VBU09OX01PTlRIUzogUmVjb3JkPG51bWJlciwgbnVtYmVyW10+ID0ge1xuICA2OiBbMywgNF0sIC8vIHdoZWF0IC8gQnVnJ2RveVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRDcm9wSW5kZXhTZWFzb25Nb250aHMoXG4gIGNyb3BJZD86IG51bWJlciB8IG51bGwsXG4pOiBudW1iZXJbXSB7XG4gIGlmIChjcm9wSWQgPT0gbnVsbCB8fCAhTnVtYmVyLmlzRmluaXRlKE51bWJlcihjcm9wSWQpKSkgcmV0dXJuIFtdO1xuICBjb25zdCBtb250aHMgPSBERUZBVUxUX0NST1BfSU5ERVhfU0VBU09OX01PTlRIU1tOdW1iZXIoY3JvcElkKV07XG4gIHJldHVybiBtb250aHMgPyBtb250aHMuc2xpY2UoKSA6IFtdO1xufVxuXG4vKiogUGVyLXBvbHlnb24gaW5kZXggc2Vhc29uIGxlYXJuZWQgZnJvbSBhIDQwMC4gKi9cbmNvbnN0IHNlYXNvbk1vbnRoc0J5VW5pcXVlaWQgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4vKiogU2FtZSBzZWFzb24gc2hhcmVkIGJ5IGFsbCBwb2x5Z29ucyBvZiB0aGF0IGNyb3BfaWQgKHdoZWF0PTYg4oaSIE1hci9BcHIpLiAqL1xuY29uc3Qgc2Vhc29uTW9udGhzQnlDcm9wSWQgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyW10+KCk7XG4vKipcbiAqIE1vc3QgcmVjZW50bHkgbGVhcm5lZCBzZWFzb24uIFVzZWQgd2hlbiB0aGUgbmV4dCB0YWJsZSByb3cncyBjcm9wX2lkIGlzIG5vdFxuICoga25vd24geWV0IOKAlCB3aXRob3V0IHRoaXMgZXZlcnkgbmV3IHVuaXF1ZWlkIHJlLXRyaWVzIFNlcHRlbWJlciBhbmQgNDAwcy5cbiAqIE92ZXJ3cml0dGVuIHdoZW4gYSBkaWZmZXJlbnQgY3JvcCdzIHNlYXNvbiBpcyBkaXNjb3ZlcmVkLlxuICovXG5sZXQgbGFzdExlYXJuZWRTZWFzb25Nb250aHM6IG51bWJlcltdID0gW107XG5cbi8qKiByZWdpb258ZGF0ZSBwYWlycyBleHBvcnQtaW1hZ2UgcmVmdXNlZCB3aXRoIFwiTm8gaW1hZ2VyeSBhdmFpbGFibGVcIi4gKi9cbmNvbnN0IHJlZ2lvbkRhdGVzV2l0aG91dEltYWdlcnkgPSBuZXcgU2V0PHN0cmluZz4oKTtcbi8qKiByZWdpb258ZGF0ZSBwYWlycyBleHBvcnQtaW1hZ2UgaGFzIHNlcnZlZCAoSFRUUCAyMDApLiAqL1xuY29uc3QgcmVnaW9uRGF0ZXNXaXRoSW1hZ2VyeSA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4vKipcbiAqIEV2ZXJ5dGhpbmcgbGVhcm5lZCBmcm9tIGV4cG9ydC1pbWFnZSAoc2Vhc29uIHBlciBjcm9wLCByZWdpb25hbCBzY2VuZSBnYXBzXG4gKiBhbmQgcHJvdmVuIHNjZW5lcykgaXMgbWlycm9yZWQgdG8gbG9jYWxTdG9yYWdlIGFuZCByZS1yZWFkIGJlZm9yZSB1c2UuXG4gKlxuICogVGhpcyBpcyBOT1Qgb25seSBmb3IgcmVsb2FkczogZXZlcnkgRXhwZXJpZW5jZSBCdWlsZGVyIHdpZGdldCAoR3JhZmZQYW5lbCxcbiAqIFBvcHVwUGFuZWwsIOKApikgZ2V0cyBpdHMgb3duIHdlYnBhY2sgcnVudGltZSBhbmQgdGhlcmVmb3JlIGl0cyBvd24gaW5zdGFuY2VcbiAqIG9mIHRoaXMgbW9kdWxlIOKAlCBpbi1tZW1vcnkgTWFwcyBoZXJlIGFyZSBwZXIgd2lkZ2V0LiBXaXRob3V0IHRoZSBzaGFyZWRcbiAqIHN0b3JlIHRoZSBtYXAtY2xpY2sgcGF0aCAoUG9wdXBQYW5lbCkgcmUtcHJvYmVzIFNlcHRlbWJlciBhbmQgdGhlIHNhbWVcbiAqIHJlZ2lvbmFsIGdhcHMgR3JhZmZQYW5lbCBhbHJlYWR5IGxlYXJuZWQsIHByb2R1Y2luZyBmcmVzaCA0MDBzLlxuICovXG5jb25zdCBFWFBPUlRfSU1BR0VfS05PV0xFREdFX1NUT1JBR0VfS0VZID0gXCJhZ3JpX2V4cG9ydF9pbWFnZV9rbm93bGVkZ2VfdjFcIjtcbmNvbnN0IEtOT1dMRURHRV9TWU5DX01JTl9JTlRFUlZBTF9NUyA9IDMwMDtcbmxldCBsYXN0S25vd2xlZGdlU3luY0F0ID0gMDtcbmxldCBrbm93bGVkZ2VTdG9yYWdlU2lnbmF0dXJlID0gXCJcIjtcblxuaW50ZXJmYWNlIEV4cG9ydEltYWdlS25vd2xlZGdlIHtcbiAgZ2Fwcz86IHN0cmluZ1tdO1xuICBzY2VuZXM/OiBzdHJpbmdbXTtcbiAgc2Vhc29uc0J5Q3JvcD86IFJlY29yZDxzdHJpbmcsIG51bWJlcltdPjtcbiAgc2Vhc29uc0J5VWlkPzogUmVjb3JkPHN0cmluZywgbnVtYmVyW10+O1xuICBsYXN0U2Vhc29uPzogbnVtYmVyW107XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRSZWdpb25EYXRlS2V5KGtleTogdW5rbm93bik6IGtleSBpcyBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAvXlxcZCtcXHxcXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3Qoa2V5KTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVNb250aHModmFsdWU6IHVua25vd24pOiBudW1iZXJbXSB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiBbXTtcbiAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgbmV3IFNldChcbiAgICAgIHZhbHVlXG4gICAgICAgIC5tYXAoKG0pID0+IE51bWJlcihtKSlcbiAgICAgICAgLmZpbHRlcigobSkgPT4gTnVtYmVyLmlzSW50ZWdlcihtKSAmJiBtID49IDEgJiYgbSA8PSAxMiksXG4gICAgKSxcbiAgKS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG59XG5cbmZ1bmN0aW9uIHN5bmNFeHBvcnRJbWFnZUtub3dsZWRnZUZyb21TdG9yYWdlKGZvcmNlID0gZmFsc2UpOiB2b2lkIHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgaWYgKCFmb3JjZSAmJiBub3cgLSBsYXN0S25vd2xlZGdlU3luY0F0IDwgS05PV0xFREdFX1NZTkNfTUlOX0lOVEVSVkFMX01TKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxhc3RLbm93bGVkZ2VTeW5jQXQgPSBub3c7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09IFwidW5kZWZpbmVkXCIpIHJldHVybjtcbiAgICBjb25zdCByYXcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShFWFBPUlRfSU1BR0VfS05PV0xFREdFX1NUT1JBR0VfS0VZKTtcbiAgICBpZiAoIXJhdyB8fCByYXcgPT09IGtub3dsZWRnZVN0b3JhZ2VTaWduYXR1cmUpIHJldHVybjtcbiAgICBrbm93bGVkZ2VTdG9yYWdlU2lnbmF0dXJlID0gcmF3O1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KSBhcyBFeHBvcnRJbWFnZUtub3dsZWRnZTtcbiAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBrZXkgb2YgcGFyc2VkLmdhcHMgfHwgW10pIHtcbiAgICAgIGlmIChpc1ZhbGlkUmVnaW9uRGF0ZUtleShrZXkpKSByZWdpb25EYXRlc1dpdGhvdXRJbWFnZXJ5LmFkZChrZXkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBwYXJzZWQuc2NlbmVzIHx8IFtdKSB7XG4gICAgICBpZiAoaXNWYWxpZFJlZ2lvbkRhdGVLZXkoa2V5KSkgcmVnaW9uRGF0ZXNXaXRoSW1hZ2VyeS5hZGQoa2V5KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbY3JvcCwgbW9udGhzXSBvZiBPYmplY3QuZW50cmllcyhwYXJzZWQuc2Vhc29uc0J5Q3JvcCB8fCB7fSkpIHtcbiAgICAgIGNvbnN0IGlkID0gTnVtYmVyKGNyb3ApO1xuICAgICAgY29uc3QgbGlzdCA9IHNhbml0aXplTW9udGhzKG1vbnRocyk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKGlkKSAmJiBsaXN0Lmxlbmd0aCkgc2Vhc29uTW9udGhzQnlDcm9wSWQuc2V0KGlkLCBsaXN0KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbdWlkLCBtb250aHNdIG9mIE9iamVjdC5lbnRyaWVzKHBhcnNlZC5zZWFzb25zQnlVaWQgfHwge30pKSB7XG4gICAgICBjb25zdCBsaXN0ID0gc2FuaXRpemVNb250aHMobW9udGhzKTtcbiAgICAgIGlmICh1aWQgJiYgbGlzdC5sZW5ndGgpIHNlYXNvbk1vbnRoc0J5VW5pcXVlaWQuc2V0KHVpZCwgbGlzdCk7XG4gICAgfVxuICAgIGlmICghbGFzdExlYXJuZWRTZWFzb25Nb250aHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsYXN0ID0gc2FuaXRpemVNb250aHMocGFyc2VkLmxhc3RTZWFzb24pO1xuICAgICAgaWYgKGxhc3QubGVuZ3RoKSBsYXN0TGVhcm5lZFNlYXNvbk1vbnRocyA9IGxhc3Q7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvKiBpZ25vcmUgKi9cbiAgfVxufVxuXG5mdW5jdGlvbiBwZXJzaXN0RXhwb3J0SW1hZ2VLbm93bGVkZ2UoKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09IFwidW5kZWZpbmVkXCIpIHJldHVybjtcbiAgICAvLyBNZXJnZSB3aXRoIHdoYXQgb3RoZXIgd2lkZ2V0IGluc3RhbmNlcyB3cm90ZSBtZWFud2hpbGUuXG4gICAgc3luY0V4cG9ydEltYWdlS25vd2xlZGdlRnJvbVN0b3JhZ2UodHJ1ZSk7XG4gICAgY29uc3Qgc2Vhc29uc0J5Q3JvcDogUmVjb3JkPHN0cmluZywgbnVtYmVyW10+ID0ge307XG4gICAgZm9yIChjb25zdCBbY3JvcCwgbW9udGhzXSBvZiBzZWFzb25Nb250aHNCeUNyb3BJZCkge1xuICAgICAgc2Vhc29uc0J5Q3JvcFtTdHJpbmcoY3JvcCldID0gbW9udGhzO1xuICAgIH1cbiAgICBjb25zdCBzZWFzb25zQnlVaWQ6IFJlY29yZDxzdHJpbmcsIG51bWJlcltdPiA9IHt9O1xuICAgIGZvciAoY29uc3QgW3VpZCwgbW9udGhzXSBvZiBzZWFzb25Nb250aHNCeVVuaXF1ZWlkKSB7XG4gICAgICBzZWFzb25zQnlVaWRbdWlkXSA9IG1vbnRocztcbiAgICB9XG4gICAgY29uc3QgcGF5bG9hZDogRXhwb3J0SW1hZ2VLbm93bGVkZ2UgPSB7XG4gICAgICBnYXBzOiBBcnJheS5mcm9tKHJlZ2lvbkRhdGVzV2l0aG91dEltYWdlcnkpLFxuICAgICAgc2NlbmVzOiBBcnJheS5mcm9tKHJlZ2lvbkRhdGVzV2l0aEltYWdlcnkpLFxuICAgICAgc2Vhc29uc0J5Q3JvcCxcbiAgICAgIHNlYXNvbnNCeVVpZCxcbiAgICAgIGxhc3RTZWFzb246IGxhc3RMZWFybmVkU2Vhc29uTW9udGhzLFxuICAgIH07XG4gICAgY29uc3QgcmF3ID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gICAga25vd2xlZGdlU3RvcmFnZVNpZ25hdHVyZSA9IHJhdztcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShFWFBPUlRfSU1BR0VfS05PV0xFREdFX1NUT1JBR0VfS0VZLCByYXcpO1xuICB9IGNhdGNoIHtcbiAgICAvKiBpZ25vcmUgKi9cbiAgfVxufVxuXG5zeW5jRXhwb3J0SW1hZ2VLbm93bGVkZ2VGcm9tU3RvcmFnZSh0cnVlKTtcblxuZnVuY3Rpb24gbm9ybWFsaXplVW5pcXVlaWRLZXkodW5pcXVlaWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmcodW5pcXVlaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbWVtYmVyRXhwb3J0SW1hZ2VTZWFzb25Nb250aHMoXG4gIHVuaXF1ZWlkOiBzdHJpbmcsXG4gIG1vbnRoczogbnVtYmVyW10sXG4gIGNyb3BJZD86IG51bWJlciB8IG51bGwsXG4pOiB2b2lkIHtcbiAgaWYgKCFtb250aHMubGVuZ3RoKSByZXR1cm47XG4gIGxhc3RMZWFybmVkU2Vhc29uTW9udGhzID0gbW9udGhzLnNsaWNlKCk7XG4gIGNvbnN0IGtleSA9IG5vcm1hbGl6ZVVuaXF1ZWlkS2V5KHVuaXF1ZWlkKTtcbiAgaWYgKGtleSkge1xuICAgIHNlYXNvbk1vbnRoc0J5VW5pcXVlaWQuc2V0KGtleSwgbW9udGhzLnNsaWNlKCkpO1xuICAgIHdoaWxlIChzZWFzb25Nb250aHNCeVVuaXF1ZWlkLnNpemUgPiAxMjgpIHtcbiAgICAgIGNvbnN0IG9sZGVzdCA9IHNlYXNvbk1vbnRoc0J5VW5pcXVlaWQua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgIGlmIChvbGRlc3QgPT0gbnVsbCkgYnJlYWs7XG4gICAgICBzZWFzb25Nb250aHNCeVVuaXF1ZWlkLmRlbGV0ZShvbGRlc3QpO1xuICAgIH1cbiAgfVxuICBpZiAoY3JvcElkICE9IG51bGwgJiYgTnVtYmVyLmlzRmluaXRlKGNyb3BJZCkpIHtcbiAgICBzZWFzb25Nb250aHNCeUNyb3BJZC5zZXQoTnVtYmVyKGNyb3BJZCksIG1vbnRocy5zbGljZSgpKTtcbiAgfVxuICBwZXJzaXN0RXhwb3J0SW1hZ2VLbm93bGVkZ2UoKTtcbn1cblxuLyoqXG4gKiBTZWFzb24gbW9udGhzIGZvciBleHBvcnQtaW1hZ2UuIFByZWZlciB0aGlzIHBvbHlnb24ncyBsZWFybmVkIG1vbnRocywgZWxzZVxuICogdGhlIGNyb3BfaWQncyAobGVhcm5lZCBvciBidWlsdC1pbiBkZWZhdWx0KSwgZWxzZSBsYXN0IHNlc3Npb24gbGVhcm4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHBvcnRJbWFnZVNlYXNvbk1vbnRocyhcbiAgdW5pcXVlaWQ6IHN0cmluZyxcbiAgY3JvcElkPzogbnVtYmVyIHwgbnVsbCxcbik6IG51bWJlcltdIHtcbiAgc3luY0V4cG9ydEltYWdlS25vd2xlZGdlRnJvbVN0b3JhZ2UoKTtcbiAgY29uc3Qga2V5ID0gbm9ybWFsaXplVW5pcXVlaWRLZXkodW5pcXVlaWQpO1xuICBpZiAoa2V5KSB7XG4gICAgY29uc3QgYnlVaWQgPSBzZWFzb25Nb250aHNCeVVuaXF1ZWlkLmdldChrZXkpO1xuICAgIGlmIChieVVpZD8ubGVuZ3RoKSByZXR1cm4gYnlVaWQ7XG4gIH1cbiAgaWYgKGNyb3BJZCAhPSBudWxsICYmIE51bWJlci5pc0Zpbml0ZShjcm9wSWQpKSB7XG4gICAgY29uc3QgYnlDcm9wID0gc2Vhc29uTW9udGhzQnlDcm9wSWQuZ2V0KE51bWJlcihjcm9wSWQpKTtcbiAgICBpZiAoYnlDcm9wPy5sZW5ndGgpIHJldHVybiBieUNyb3A7XG4gICAgY29uc3QgZGVmYXVsdHMgPSBnZXREZWZhdWx0Q3JvcEluZGV4U2Vhc29uTW9udGhzKGNyb3BJZCk7XG4gICAgaWYgKGRlZmF1bHRzLmxlbmd0aCkgcmV0dXJuIGRlZmF1bHRzO1xuICB9XG4gIHJldHVybiBsYXN0TGVhcm5lZFNlYXNvbk1vbnRocy5zbGljZSgpO1xufVxuXG4vKiogTmV3ZXN04oaSb2xkZXN0IGV4cG9ydCBjYW5kaWRhdGVzIChzZWFzb24gKyBrbm93biBpbWFnZXJ5IGdhcHMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBvcnRSYXN0ZXJEYXRlQ2FuZGlkYXRlcyhcbiAgZGF0ZXM6IHN0cmluZ1tdIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgb3B0cz86IHtcbiAgICB1bmlxdWVpZD86IHN0cmluZztcbiAgICBjcm9wSWQ/OiBudW1iZXIgfCBudWxsO1xuICAgIHJlZ2lvbklkPzogbnVtYmVyIHwgbnVsbDtcbiAgICBleGNsdWRlPzogc3RyaW5nW107XG4gICAgbGltaXQ/OiBudW1iZXI7XG4gIH0sXG4pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IG1vbnRocyA9IGdldEV4cG9ydEltYWdlU2Vhc29uTW9udGhzKFxuICAgIG9wdHM/LnVuaXF1ZWlkIHx8IFwiXCIsXG4gICAgb3B0cz8uY3JvcElkLFxuICApO1xuICBjb25zdCBsaW1pdCA9IE1hdGgubWF4KDEsIG9wdHM/LmxpbWl0ID8/IDMpO1xuICBjb25zdCBvdXQ6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGV4Y2x1ZGUgPSBbLi4uKG9wdHM/LmV4Y2x1ZGUgfHwgW10pXTtcbiAgd2hpbGUgKG91dC5sZW5ndGggPCBsaW1pdCkge1xuICAgIGNvbnN0IG5leHQgPVxuICAgICAgcGlja0xhdGVzdFVzYWJsZUV4cG9ydERhdGUoZGF0ZXMsIHtcbiAgICAgICAgbW9udGhzLFxuICAgICAgICByZWdpb25JZDogb3B0cz8ucmVnaW9uSWQsXG4gICAgICAgIGV4Y2x1ZGUsXG4gICAgICB9KSB8fFxuICAgICAgKCFtb250aHMubGVuZ3RoXG4gICAgICAgID8gcGlja0xhdGVzdFVzYWJsZUV4cG9ydERhdGUoZGF0ZXMsIHtcbiAgICAgICAgICAgIHJlZ2lvbklkOiBvcHRzPy5yZWdpb25JZCxcbiAgICAgICAgICAgIGV4Y2x1ZGUsXG4gICAgICAgICAgfSlcbiAgICAgICAgOiBudWxsKTtcbiAgICBpZiAoIW5leHQpIGJyZWFrO1xuICAgIG91dC5wdXNoKG5leHQpO1xuICAgIGV4Y2x1ZGUucHVzaChuZXh0KTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBpY2sgdGhlIG5ld2VzdCBhdmFpbGFibGUtZGF0ZXMgZW50cnkgdGhhdCBleHBvcnQtaW1hZ2UgaXMgbGlrZWx5IHRvIHNlcnZlXG4gKiBmb3IgdGhpcyBwb2x5Z29uIChjcm9wIHNlYXNvbiArIGtub3duIHJlZ2lvbmFsIGltYWdlcnkgZ2FwcykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrRXhwb3J0UmFzdGVyRGF0ZShcbiAgZGF0ZXM6IHN0cmluZ1tdIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgb3B0cz86IHtcbiAgICB1bmlxdWVpZD86IHN0cmluZztcbiAgICBjcm9wSWQ/OiBudW1iZXIgfCBudWxsO1xuICAgIHJlZ2lvbklkPzogbnVtYmVyIHwgbnVsbDtcbiAgICBleGNsdWRlPzogc3RyaW5nW107XG4gIH0sXG4pOiBzdHJpbmcgfCBudWxsIHtcbiAgcmV0dXJuIChcbiAgICBsaXN0RXhwb3J0UmFzdGVyRGF0ZUNhbmRpZGF0ZXMoZGF0ZXMsIHsgLi4ub3B0cywgbGltaXQ6IDEgfSlbMF0gfHwgbnVsbFxuICApO1xufVxuXG4vKiogTGF0ZXN0IFlZWVktTU0tREQgd2hvc2UgbW9udGggaXMgaW4gYG1vbnRoc2AgKGFsbCBkYXRlcyB3aGVuIG1vbnRocyBlbXB0eSkuICovXG5leHBvcnQgZnVuY3Rpb24gcGlja0xhdGVzdERhdGVJbk1vbnRocyhcbiAgZGF0ZXM6IHN0cmluZ1tdIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgbW9udGhzOiBudW1iZXJbXSxcbik6IHN0cmluZyB8IG51bGwge1xuICByZXR1cm4gcGlja0xhdGVzdFVzYWJsZUV4cG9ydERhdGUoZGF0ZXMsIHsgbW9udGhzIH0pO1xufVxuXG4vKipcbiAqIGAvYXZhaWxhYmxlLWRhdGVzYCBsaXN0cyBkYXRlcyB0aGF0IGhhdmUgKmluZGV4IHJlY29yZHMqLCBidXQgZXhwb3J0LWltYWdlXG4gKiBhbHNvIG5lZWRzIHRoZSByZWdpb24ncyByYXN0ZXIgc2NlbmUgZm9yIHRoYXQgZGF5IGFuZCBhbnN3ZXJzXG4gKiBcIk5vIGltYWdlcnkgYXZhaWxhYmxlIGZvciByZWdpb25faWQ94oCmIG9uIOKAplwiIChIVFRQIDQwMCkgd2hlbiBpdCBpcyBtaXNzaW5nLlxuICogVGhhdCBnYXAgaXMgcmVnaW9uLXdpZGUsIHNvIGNhY2hlIGl0IGZvciBldmVyeSBwb2x5Z29uIG9mIHRoZSByZWdpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cG9ydEltYWdlTm9JbWFnZXJ5RXJyb3IoZXJyOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IHN0YXR1cyA9IE51bWJlcigoZXJyIGFzIGFueSk/LnN0YXR1cyk7XG4gIGNvbnN0IHRleHQgPSBTdHJpbmcoXG4gICAgKGVyciBhcyBhbnkpPy5yZXNwb25zZVRleHQgfHwgKGVyciBhcyBhbnkpPy5tZXNzYWdlIHx8IFwiXCIsXG4gICk7XG4gIGlmIChzdGF0dXMgIT09IDQwMCAmJiAhL0hUVFBcXHMrNDAwL2kudGVzdCh0ZXh0KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gL25vIGltYWdlcnkgYXZhaWxhYmxlL2kudGVzdCh0ZXh0KTtcbn1cblxuZnVuY3Rpb24gcmVnaW9uRGF0ZUtleShyZWdpb25JZDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCwgZGF0ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3JlZ2lvbklkID8/IFwiXCJ9fCR7U3RyaW5nKGRhdGUgfHwgXCJcIikuc2xpY2UoMCwgMTApfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1lbWJlclJlZ2lvbkRhdGVXaXRob3V0SW1hZ2VyeShcbiAgcmVnaW9uSWQ6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQsXG4gIGRhdGU6IHN0cmluZyxcbik6IHZvaWQge1xuICBjb25zdCBrZXkgPSByZWdpb25EYXRlS2V5KHJlZ2lvbklkLCBkYXRlKTtcbiAgaWYgKCFpc1ZhbGlkUmVnaW9uRGF0ZUtleShrZXkpKSByZXR1cm47XG4gIGlmIChyZWdpb25EYXRlc1dpdGhvdXRJbWFnZXJ5LmhhcyhrZXkpKSByZXR1cm47XG4gIHJlZ2lvbkRhdGVzV2l0aG91dEltYWdlcnkuYWRkKGtleSk7XG4gIHdoaWxlIChyZWdpb25EYXRlc1dpdGhvdXRJbWFnZXJ5LnNpemUgPiA1MTIpIHtcbiAgICBjb25zdCBvbGRlc3QgPSByZWdpb25EYXRlc1dpdGhvdXRJbWFnZXJ5LmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgaWYgKG9sZGVzdCA9PSBudWxsKSBicmVhaztcbiAgICByZWdpb25EYXRlc1dpdGhvdXRJbWFnZXJ5LmRlbGV0ZShvbGRlc3QpO1xuICB9XG4gIHBlcnNpc3RFeHBvcnRJbWFnZUtub3dsZWRnZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWdpb25EYXRlV2l0aG91dEltYWdlcnkoXG4gIHJlZ2lvbklkOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuICBkYXRlOiBzdHJpbmcsXG4pOiBib29sZWFuIHtcbiAgc3luY0V4cG9ydEltYWdlS25vd2xlZGdlRnJvbVN0b3JhZ2UoKTtcbiAgcmV0dXJuIHJlZ2lvbkRhdGVzV2l0aG91dEltYWdlcnkuaGFzKHJlZ2lvbkRhdGVLZXkocmVnaW9uSWQsIGRhdGUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbWVtYmVyUmVnaW9uRGF0ZVdpdGhJbWFnZXJ5KFxuICByZWdpb25JZDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgZGF0ZTogc3RyaW5nLFxuKTogdm9pZCB7XG4gIGNvbnN0IGtleSA9IHJlZ2lvbkRhdGVLZXkocmVnaW9uSWQsIGRhdGUpO1xuICBpZiAoIWlzVmFsaWRSZWdpb25EYXRlS2V5KGtleSkpIHJldHVybjtcbiAgaWYgKHJlZ2lvbkRhdGVzV2l0aEltYWdlcnkuaGFzKGtleSkpIHJldHVybjtcbiAgcmVnaW9uRGF0ZXNXaXRoSW1hZ2VyeS5hZGQoa2V5KTtcbiAgd2hpbGUgKHJlZ2lvbkRhdGVzV2l0aEltYWdlcnkuc2l6ZSA+IDUxMikge1xuICAgIGNvbnN0IG9sZGVzdCA9IHJlZ2lvbkRhdGVzV2l0aEltYWdlcnkua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICBpZiAob2xkZXN0ID09IG51bGwpIGJyZWFrO1xuICAgIHJlZ2lvbkRhdGVzV2l0aEltYWdlcnkuZGVsZXRlKG9sZGVzdCk7XG4gIH1cbiAgcGVyc2lzdEV4cG9ydEltYWdlS25vd2xlZGdlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZ2lvbkRhdGVXaXRoSW1hZ2VyeShcbiAgcmVnaW9uSWQ6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQsXG4gIGRhdGU6IHN0cmluZyxcbik6IGJvb2xlYW4ge1xuICBzeW5jRXhwb3J0SW1hZ2VLbm93bGVkZ2VGcm9tU3RvcmFnZSgpO1xuICByZXR1cm4gcmVnaW9uRGF0ZXNXaXRoSW1hZ2VyeS5oYXMocmVnaW9uRGF0ZUtleShyZWdpb25JZCwgZGF0ZSkpO1xufVxuXG4vKipcbiAqIGNyb3BfaWQgZnJvbSBhIGZpZWxkIHBvbHlnb24ncyBhdHRyaWJ1dGVzICh0YWJsZSByb3cgb3IgY2xpY2tlZCBncmFwaGljKTpcbiAqIG51bWVyaWMgY3JvcF9pZC9jcm9wSWQgZmlyc3QsIGVsc2UgdGhlIHR1cmkgbmFtZSAod2hlYXQg4oaSIDYgaW4gYXBpLWFncmkpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNyb3BJZEZyb21BdHRyaWJ1dGVzKFxuICBhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwgfCB1bmRlZmluZWQsXG4pOiBudW1iZXIgfCBudWxsIHtcbiAgaWYgKCFhdHRycyB8fCB0eXBlb2YgYXR0cnMgIT09IFwib2JqZWN0XCIpIHJldHVybiBudWxsO1xuICBsZXQgdHVyaSA9IFwiXCI7XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGF0dHJzKSkge1xuICAgIGNvbnN0IGxvd2VyID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGxvd2VyID09PSBcImNyb3BfaWRcIiB8fCBsb3dlciA9PT0gXCJjcm9waWRcIikge1xuICAgICAgY29uc3QgbiA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG4pICYmIG4gPiAwKSByZXR1cm4gbjtcbiAgICB9IGVsc2UgaWYgKGxvd2VyID09PSBcInR1cmlcIiAmJiB2YWx1ZSAhPSBudWxsKSB7XG4gICAgICB0dXJpID0gU3RyaW5nKHZhbHVlKS50cmltKCk7XG4gICAgfVxuICB9XG4gIGlmICh0dXJpICYmIGdldFR1cmlDcm9wTG9va3VwS2V5KHR1cmkpID09PSBcImJ1Z2RveVwiKSByZXR1cm4gNjtcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogTmV3ZXN0IGRhdGUgZXhwb3J0LWltYWdlIGNhbiBwbGF1c2libHkgc2VydmU6IGluc2lkZSB0aGUgY3JvcCBzZWFzb24gYW5kIG5vdFxuICogYWxyZWFkeSBrbm93biB0byBsYWNrIHJlZ2lvbmFsIGltYWdlcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrTGF0ZXN0VXNhYmxlRXhwb3J0RGF0ZShcbiAgZGF0ZXM6IHN0cmluZ1tdIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgb3B0cz86IHtcbiAgICBtb250aHM/OiBudW1iZXJbXTtcbiAgICByZWdpb25JZD86IG51bWJlciB8IG51bGw7XG4gICAgZXhjbHVkZT86IHN0cmluZ1tdO1xuICB9LFxuKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IG1vbnRocyA9IG9wdHM/Lm1vbnRocyB8fCBbXTtcbiAgY29uc3QgZXhjbHVkZSA9IG5ldyBTZXQoXG4gICAgKG9wdHM/LmV4Y2x1ZGUgfHwgW10pLm1hcCgoZCkgPT4gU3RyaW5nKGQgfHwgXCJcIikuc2xpY2UoMCwgMTApKSxcbiAgKTtcbiAgY29uc3QgbGlzdCA9IChkYXRlcyB8fCBbXSlcbiAgICAubWFwKChkKSA9PiBTdHJpbmcoZCB8fCBcIlwiKS5zbGljZSgwLCAxMCkpXG4gICAgLmZpbHRlcigoZCkgPT4gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QoZCkpXG4gICAgLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSk7XG5cbiAgZm9yIChsZXQgaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBkYXRlID0gbGlzdFtpXTtcbiAgICBpZiAoZXhjbHVkZS5oYXMoZGF0ZSkpIGNvbnRpbnVlO1xuICAgIGlmIChtb250aHMubGVuZ3RoICYmICFtb250aHMuaW5jbHVkZXMoTnVtYmVyKGRhdGUuc2xpY2UoNSwgNykpKSkgY29udGludWU7XG4gICAgaWYgKFxuICAgICAgb3B0cz8ucmVnaW9uSWQgIT0gbnVsbCAmJlxuICAgICAgaXNSZWdpb25EYXRlV2l0aG91dEltYWdlcnkob3B0cy5yZWdpb25JZCwgZGF0ZSlcbiAgICApIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZXhwb3J0SW1hZ2VDYWNoZUtleShwYXJhbXM6IHtcbiAgdW5pcXVlaWQ6IHN0cmluZztcbiAgcmVnaW9uSWQ6IG51bWJlcjtcbiAgcmFzdGVyRGF0ZTogc3RyaW5nO1xuICBpbmRpY2VUeXBlPzogVmVnZXRhdGlvbkluZGljZVR5cGU7XG4gIHN0cmV0Y2g/OiBcImZpeGVkXCIgfCBcIm1pbm1heFwiO1xufSk6IHN0cmluZyB7XG4gIHJldHVybiBbXG4gICAgU3RyaW5nKHBhcmFtcy51bmlxdWVpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLFxuICAgIHBhcmFtcy5yZWdpb25JZCxcbiAgICBwYXJhbXMucmFzdGVyRGF0ZSxcbiAgICBwYXJhbXMuaW5kaWNlVHlwZSB8fCBcIm5kdmlcIixcbiAgICBwYXJhbXMuc3RyZXRjaCB8fCBcImZpeGVkXCIsXG4gIF0uam9pbihcInxcIik7XG59XG5cbmZ1bmN0aW9uIGNsb25lRXhwb3J0Q2FudmFzKHNvdXJjZTogSFRNTENhbnZhc0VsZW1lbnQpOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gIGNvbnN0IGNvcHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICBjb3B5LndpZHRoID0gc291cmNlLndpZHRoO1xuICBjb3B5LmhlaWdodCA9IHNvdXJjZS5oZWlnaHQ7XG4gIGNvbnN0IGN0eCA9IGNvcHkuZ2V0Q29udGV4dChcIjJkXCIpO1xuICBpZiAoY3R4KSBjdHguZHJhd0ltYWdlKHNvdXJjZSwgMCwgMCk7XG4gIHJldHVybiBjb3B5O1xufVxuXG4vKipcbiAqIEJlc3QtZWZmb3J0IFRMUyAvIEROUyB3YXJtdXAgZm9yIGFwaS1hZ3JpIHNvIHRoZSBmaXJzdCBmaWVsZCBjbGljayBkb2VzIG5vdFxuICogcGF5IGNvbGQtY29ubmVjdGlvbiBjb3N0IG9uIGV4cG9ydC1pbWFnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhcm1Qb2x5Z29uQXBpQ29ubmVjdGlvbigpOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICB2b2lkIGZldGNoKGAke2dldEFncmlQb2x5Z29uQXBpQmFzZVVybCgpfS9gLCB7XG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICBoZWFkZXJzOiB7IGFjY2VwdDogXCIqLypcIiB9LFxuICAgICAgbW9kZTogXCJjb3JzXCIsXG4gICAgICBjYWNoZTogXCJuby1zdG9yZVwiLFxuICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgIC8qIGlnbm9yZSDigJQgd2FybXVwIG9ubHkgKi9cbiAgICB9KTtcbiAgfSBjYXRjaCB7XG4gICAgLyogaWdub3JlICovXG4gIH1cbn1cblxuLyoqXG4gKiBHRVQgL3YxL3BvbHlnb24ve3VuaXF1ZWlkfS9leHBvcnQtaW1hZ2UsIHJlcXVlc3RlZCB3aXRoXG4gKiByZXNwb25zZV9mb3JtYXQ9dGlmZiDigJQgZmV0Y2hlcyB0aGUgcmF3IEdlb1RJRkYgYnl0ZXMgZGlyZWN0bHkgKHNraXBzIHRoZVxuICogcmVzcG9uc2VfZm9ybWF0PWpzb24gZW52ZWxvcGUsIHdob3NlIGV4YWN0IHN0YXRzL2Jhc2U2NCBmaWVsZCBuYW1lc1xuICogd2VyZW4ndCBjb25maXJtZWQpIGFuZCBkZWNvZGVzIGl0IGNsaWVudC1zaWRlIHdpdGggZ2VvdGlmZi5qcy4gQSBHZW9USUZGXG4gKiBjYXJyaWVzIGl0cyBvd24gZXh0ZW50ICsgQ1JTIGluIGl0cyB0YWdzLCBzbyBubyBzZXBhcmF0ZSBnZW9yZWZlcmVuY2luZ1xuICogY2FsbCBpcyBuZWVkZWQg4oCUIHJlYWQgaXQgc3RyYWlnaHQgb2ZmIHRoZSBkZWNvZGVkIGltYWdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hQb2x5Z29uRXhwb3J0SW1hZ2VUaWZmKHBhcmFtczoge1xuICB1bmlxdWVpZDogc3RyaW5nO1xuICByZWdpb25JZDogbnVtYmVyO1xuICAvKiogWVlZWS1NTS1ERCAqL1xuICByYXN0ZXJEYXRlOiBzdHJpbmc7XG4gIGluZGljZVR5cGU/OiBWZWdldGF0aW9uSW5kaWNlVHlwZTtcbiAgc3RyZXRjaD86IFwiZml4ZWRcIiB8IFwibWlubWF4XCI7XG59KTogUHJvbWlzZTxQb2x5Z29uRXhwb3J0SW1hZ2VSZXN1bHQ+IHtcbiAgY29uc3QgY2FjaGVLZXkgPSBleHBvcnRJbWFnZUNhY2hlS2V5KHBhcmFtcyk7XG4gIGxldCBwZW5kaW5nID0gZXhwb3J0SW1hZ2VDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICBpZiAoIXBlbmRpbmcpIHtcbiAgICBwZW5kaW5nID0gZmV0Y2hQb2x5Z29uRXhwb3J0SW1hZ2VUaWZmVW5jYWNoZWQocGFyYW1zKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBleHBvcnRJbWFnZUNhY2hlLmRlbGV0ZShjYWNoZUtleSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gICAgZXhwb3J0SW1hZ2VDYWNoZS5zZXQoY2FjaGVLZXksIHBlbmRpbmcpO1xuICAgIHdoaWxlIChleHBvcnRJbWFnZUNhY2hlLnNpemUgPiBFWFBPUlRfSU1BR0VfQ0FDSEVfTUFYKSB7XG4gICAgICBjb25zdCBvbGRlc3QgPSBleHBvcnRJbWFnZUNhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICBpZiAob2xkZXN0ID09IG51bGwpIGJyZWFrO1xuICAgICAgZXhwb3J0SW1hZ2VDYWNoZS5kZWxldGUob2xkZXN0KTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGVuZGluZztcbiAgLy8gQ2xvbmUgY2FudmFzIHNvIGEgbGF0ZXIgTWVkaWFMYXllciByZW1vdmUvcmV1c2UgY2Fubm90IGJsYW5rIGEgY2FjaGVkIGVudHJ5LlxuICByZXR1cm4ge1xuICAgIC4uLnJlc3VsdCxcbiAgICBjYW52YXM6IGNsb25lRXhwb3J0Q2FudmFzKHJlc3VsdC5jYW52YXMpLFxuICB9O1xufVxuXG4vKiogT25lIGluLWZsaWdodCBkYXRlLXdhbGsgcGVyIHBvbHlnb24g4oCUIGtpY2tPcHRpbWlzdGljICsgZmV0Y2hEYXRhIHNoYXJlIGl0LiAqL1xuY29uc3QgZXhwb3J0RGF0ZVdhbGtJbkZsaWdodCA9IG5ldyBNYXA8XG4gIHN0cmluZyxcbiAgUHJvbWlzZTx7IGRhdGU6IHN0cmluZzsgcmVzdWx0OiBQb2x5Z29uRXhwb3J0SW1hZ2VSZXN1bHQgfSB8IG51bGw+XG4+KCk7XG5cbi8qKlxuICogRmV0Y2ggYXZhaWxhYmxlLWRhdGVzIChvciB1c2UgcHJvdmlkZWQpLCB0aGVuIHJhY2UgYSBzbWFsbCBwYXJhbGxlbCBiYXRjaCBvZlxuICogaW4tc2Vhc29uIGNhbmRpZGF0ZXMuIEZpcnN0IEhUVFAgMjAwIHdpbnM7IDQwMHMgdXBkYXRlIHNlYXNvbi9pbWFnZXJ5IGNhY2hlcy5cbiAqIERlZHVwZWQgc28gb3ZlcmxhcHBpbmcgdGFibGUtY2xpY2sgcGF0aHMgZG8gbm90IHN0YWNrIHNlcXVlbnRpYWwgNDAwIGNhc2NhZGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUV4cG9ydEltYWdlV2l0aERhdGVXYWxrKHBhcmFtczoge1xuICB1bmlxdWVpZDogc3RyaW5nO1xuICByZWdpb25JZDogbnVtYmVyO1xuICB5ZWFyOiBudW1iZXI7XG4gIGluZGljZVR5cGU/OiBWZWdldGF0aW9uSW5kaWNlVHlwZTtcbiAgY3JvcElkPzogbnVtYmVyIHwgbnVsbDtcbiAgZGF0ZXM/OiBzdHJpbmdbXSB8IG51bGw7XG4gIHN0cmV0Y2g/OiBcImZpeGVkXCIgfCBcIm1pbm1heFwiO1xufSk6IFByb21pc2U8eyBkYXRlOiBzdHJpbmc7IHJlc3VsdDogUG9seWdvbkV4cG9ydEltYWdlUmVzdWx0IH0gfCBudWxsPiB7XG4gIGNvbnN0IGlkID0gbm9ybWFsaXplVW5pcXVlaWRLZXkocGFyYW1zLnVuaXF1ZWlkKTtcbiAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGluZGljZVR5cGUgPSBwYXJhbXMuaW5kaWNlVHlwZSB8fCBcIm5kdmlcIjtcbiAgY29uc3Qga2V5ID0gYCR7aWR9fCR7cGFyYW1zLnJlZ2lvbklkfXwke2luZGljZVR5cGV9YDtcbiAgY29uc3QgZXhpc3RpbmcgPSBleHBvcnREYXRlV2Fsa0luRmxpZ2h0LmdldChrZXkpO1xuICBpZiAoZXhpc3RpbmcpIHJldHVybiBleGlzdGluZztcbiAgLy8gUHVsbCB3aGF0IG90aGVyIHdpZGdldCBpbnN0YW5jZXMgbGVhcm5lZCAoc2Vhc29ucywgZ2FwcywgcHJvdmVuIHNjZW5lcykuXG4gIHN5bmNFeHBvcnRJbWFnZUtub3dsZWRnZUZyb21TdG9yYWdlKHRydWUpO1xuXG4gIGNvbnN0IHdhbGsgPSAoYXN5bmMgKCkgPT4ge1xuICAgIGxldCBkYXRlcyA9IHBhcmFtcy5kYXRlcyB8fCBudWxsO1xuICAgIGlmICghZGF0ZXM/Lmxlbmd0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0ZXMgPSBhd2FpdCBmZXRjaFBvbHlnb25BdmFpbGFibGVEYXRlcyhcbiAgICAgICAgICBpZCxcbiAgICAgICAgICBwYXJhbXMucmVnaW9uSWQsXG4gICAgICAgICAgcGFyYW1zLnllYXIsXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghZGF0ZXM/Lmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCB0cmllZDogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGxldCByb3VuZCA9IDA7IHJvdW5kIDwgNDsgcm91bmQrKykge1xuICAgICAgbGV0IGNhbmRpZGF0ZXMgPSBsaXN0RXhwb3J0UmFzdGVyRGF0ZUNhbmRpZGF0ZXMoZGF0ZXMsIHtcbiAgICAgICAgdW5pcXVlaWQ6IGlkLFxuICAgICAgICBjcm9wSWQ6IHBhcmFtcy5jcm9wSWQsXG4gICAgICAgIHJlZ2lvbklkOiBwYXJhbXMucmVnaW9uSWQsXG4gICAgICAgIGV4Y2x1ZGU6IHRyaWVkLFxuICAgICAgICBsaW1pdDogMyxcbiAgICAgIH0pO1xuICAgICAgaWYgKCFjYW5kaWRhdGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgICAvLyBSZWdpb24gc2NlbmUgYWxyZWFkeSBwcm92ZW4gZm9yIHRoZSBuZXdlc3QgY2FuZGlkYXRlIChhbm90aGVyXG4gICAgICAvLyBwb2x5Z29uIG9mIHRoaXMgcmVnaW9uIGdvdCBhIDIwMCBvbiBpdCkg4oaSIHNpbmdsZSByZXF1ZXN0LCBub1xuICAgICAgLy8gc3BlY3VsYXRpdmUgc2libGluZ3MgdGhhdCB3b3VsZCA0MDAgb24gdW5rbm93biBnYXBzLlxuICAgICAgaWYgKGlzUmVnaW9uRGF0ZVdpdGhJbWFnZXJ5KHBhcmFtcy5yZWdpb25JZCwgY2FuZGlkYXRlc1swXSkpIHtcbiAgICAgICAgY2FuZGlkYXRlcyA9IFtjYW5kaWRhdGVzWzBdXTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0Y29tZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgY2FuZGlkYXRlcy5tYXAoYXN5bmMgKGRhdGUpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2hQb2x5Z29uRXhwb3J0SW1hZ2VUaWZmKHtcbiAgICAgICAgICAgICAgdW5pcXVlaWQ6IGlkLFxuICAgICAgICAgICAgICByZWdpb25JZDogcGFyYW1zLnJlZ2lvbklkLFxuICAgICAgICAgICAgICByYXN0ZXJEYXRlOiBkYXRlLFxuICAgICAgICAgICAgICBpbmRpY2VUeXBlLFxuICAgICAgICAgICAgICBzdHJldGNoOiBwYXJhbXMuc3RyZXRjaCB8fCBcImZpeGVkXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IGRhdGUsIHJlc3VsdCwgZXJyOiBudWxsIGFzIHVua25vd24gfTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IGRhdGUsIHJlc3VsdDogbnVsbCwgZXJyIH07XG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAgIC8vIExlYXJuIGZyb20gRVZFUlkgNDAwIGluIHRoZSBiYXRjaCBiZWZvcmUgcmV0dXJuaW5nIHRoZSB3aW5uZXIg4oCUXG4gICAgICAvLyBvdGhlcndpc2UgYSBnYXAgYmVoaW5kIHRoZSBmaXJzdCBzdWNjZXNzIChlLmcuIDA0LTI4IG9rLCAwNC0yNyBub1xuICAgICAgLy8gaW1hZ2VyeSkgaXMgbmV2ZXIgY2FjaGVkIGFuZCB0aGUgbmV4dCBwb2x5Z29uIDQwMHMgb24gaXQgYWdhaW4uXG4gICAgICBsZXQgaGl0OiB7IGRhdGU6IHN0cmluZzsgcmVzdWx0OiBQb2x5Z29uRXhwb3J0SW1hZ2VSZXN1bHQgfSB8IG51bGwgPSBudWxsO1xuICAgICAgZm9yIChjb25zdCBvdXRjb21lIG9mIG91dGNvbWVzKSB7XG4gICAgICAgIHRyaWVkLnB1c2gob3V0Y29tZS5kYXRlKTtcbiAgICAgICAgaWYgKG91dGNvbWUucmVzdWx0KSB7XG4gICAgICAgICAgcmVtZW1iZXJSZWdpb25EYXRlV2l0aEltYWdlcnkocGFyYW1zLnJlZ2lvbklkLCBvdXRjb21lLmRhdGUpO1xuICAgICAgICAgIGlmICghaGl0IHx8IG91dGNvbWUuZGF0ZSA+IGhpdC5kYXRlKSB7XG4gICAgICAgICAgICBoaXQgPSB7IGRhdGU6IG91dGNvbWUuZGF0ZSwgcmVzdWx0OiBvdXRjb21lLnJlc3VsdCB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlcnIgPSBvdXRjb21lLmVycjtcbiAgICAgICAgaWYgKGlzRXhwb3J0SW1hZ2VPdXRPZlNlYXNvbkVycm9yKGVycikpIHtcbiAgICAgICAgICBjb25zdCBtb250aHMgPSBwYXJzZUV4cG9ydEltYWdlU2Vhc29uTW9udGhzKGVycik7XG4gICAgICAgICAgY29uc3QgY3JvcCA9IHBhcnNlRXhwb3J0SW1hZ2VDcm9wSWQoZXJyKTtcbiAgICAgICAgICBpZiAobW9udGhzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVtZW1iZXJFeHBvcnRJbWFnZVNlYXNvbk1vbnRocyhpZCwgbW9udGhzLCBjcm9wID8/IHBhcmFtcy5jcm9wSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0V4cG9ydEltYWdlTm9JbWFnZXJ5RXJyb3IoZXJyKSkge1xuICAgICAgICAgIHJlbWVtYmVyUmVnaW9uRGF0ZVdpdGhvdXRJbWFnZXJ5KHBhcmFtcy5yZWdpb25JZCwgb3V0Y29tZS5kYXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGhpdCkgcmV0dXJuIGhpdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0pKCkuZmluYWxseSgoKSA9PiB7XG4gICAgZXhwb3J0RGF0ZVdhbGtJbkZsaWdodC5kZWxldGUoa2V5KTtcbiAgfSk7XG5cbiAgZXhwb3J0RGF0ZVdhbGtJbkZsaWdodC5zZXQoa2V5LCB3YWxrKTtcbiAgcmV0dXJuIHdhbGs7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUG9seWdvbkV4cG9ydEltYWdlVGlmZlVuY2FjaGVkKHBhcmFtczoge1xuICB1bmlxdWVpZDogc3RyaW5nO1xuICByZWdpb25JZDogbnVtYmVyO1xuICByYXN0ZXJEYXRlOiBzdHJpbmc7XG4gIGluZGljZVR5cGU/OiBWZWdldGF0aW9uSW5kaWNlVHlwZTtcbiAgc3RyZXRjaD86IFwiZml4ZWRcIiB8IFwibWlubWF4XCI7XG59KTogUHJvbWlzZTxQb2x5Z29uRXhwb3J0SW1hZ2VSZXN1bHQ+IHtcbiAgY29uc3QgcXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICByZWdpb25faWQ6IFN0cmluZyhwYXJhbXMucmVnaW9uSWQpLFxuICAgIHJhc3Rlcl9kYXRlOiBwYXJhbXMucmFzdGVyRGF0ZSxcbiAgICBpbmRpY2VfdHlwZTogcGFyYW1zLmluZGljZVR5cGUgfHwgXCJuZHZpXCIsXG4gICAgc3RyZXRjaDogcGFyYW1zLnN0cmV0Y2ggfHwgXCJmaXhlZFwiLFxuICAgIHJlc3BvbnNlX2Zvcm1hdDogXCJ0aWZmXCIsXG4gIH0pO1xuICBjb25zdCB1cmwgPSBgJHtnZXRBZ3JpUG9seWdvbkFwaUJhc2VVcmwoKX0vdjEvcG9seWdvbi8ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMudW5pcXVlaWQpfS9leHBvcnQtaW1hZ2U/JHtxcy50b1N0cmluZygpfWA7XG4gIGFncmlQb2x5Z29uQXBpTG9nKFwiZXhwb3J0LWltYWdlOnJlcXVlc3RcIiwgeyB1cmwsIC4uLnBhcmFtcyB9KTtcblxuICAvLyBCb3VuZCBodW5nIGV4cG9ydC1pbWFnZSBjYWxscyBzbyB0aGUgbWFwIGxvYWRlciBjYW5ub3Qgc3RpY2sgZm9yZXZlci5cbiAgY29uc3QgY29udHJvbGxlciA9XG4gICAgdHlwZW9mIEFib3J0Q29udHJvbGxlciAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBBYm9ydENvbnRyb2xsZXIoKSA6IG51bGw7XG4gIGNvbnN0IHRpbWVvdXRJZCA9XG4gICAgY29udHJvbGxlciAmJiB0eXBlb2Ygc2V0VGltZW91dCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvKiBpZ25vcmUgKi9cbiAgICAgICAgICB9XG4gICAgICAgIH0sIDI1MDAwKVxuICAgICAgOiBudWxsO1xuXG4gIGxldCByZXM6IFJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlcyA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgaGVhZGVyczogeyBhY2NlcHQ6IFwiKi8qXCIgfSxcbiAgICAgIC4uLihjb250cm9sbGVyID8geyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0gOiB7fSksXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgaWYgKHRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgaWYgKGVycj8ubmFtZSA9PT0gXCJBYm9ydEVycm9yXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4cG9ydC1pbWFnZSBzb+KAmHJvdmkgdmFxdGlkYW4gb3NoZGkgKDI1cykuXCIpO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgaWYgKHRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgbGV0IHJlc3BvbnNlVGV4dCA9ICcnO1xuICAgIHRyeSB7XG4gICAgICByZXNwb25zZVRleHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgIH0gY2F0Y2ggKGJvZHlFcnJvcjogYW55KSB7XG4gICAgICByZXNwb25zZVRleHQgPSBgPHJlc3BvbnNlIGJvZHkgcmVhZCBmYWlsZWQ6ICR7U3RyaW5nKGJvZHlFcnJvcj8ubWVzc2FnZSB8fCBib2R5RXJyb3IpfT5gO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgYWdyaVBvbHlnb25BcGlMb2coJ2V4cG9ydC1pbWFnZTpGQUlMRUQtcmVzcG9uc2UnLCB7XG4gICAgICB1cmwsXG4gICAgICBzdGF0dXM6IHJlcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiByZXMuc3RhdHVzVGV4dCxcbiAgICAgIGNvbnRlbnRUeXBlLFxuICAgICAgcmVzcG9uc2VUZXh0LFxuICAgIH0pO1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgYEhUVFAgJHtyZXMuc3RhdHVzfSR7cmVzLnN0YXR1c1RleHQgPyBgICR7cmVzLnN0YXR1c1RleHR9YCA6ICcnfSR7cmVzcG9uc2VUZXh0ID8gYDogJHtyZXNwb25zZVRleHR9YCA6ICcnfWAsXG4gICAgKSBhcyBFcnJvciAmIHtcbiAgICAgIHN0YXR1cz86IG51bWJlcjtcbiAgICAgIHN0YXR1c1RleHQ/OiBzdHJpbmc7XG4gICAgICBjb250ZW50VHlwZT86IHN0cmluZztcbiAgICAgIHJlc3BvbnNlVGV4dD86IHN0cmluZztcbiAgICAgIHVybD86IHN0cmluZztcbiAgICB9O1xuICAgIGVycm9yLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG4gICAgZXJyb3Iuc3RhdHVzVGV4dCA9IHJlcy5zdGF0dXNUZXh0O1xuICAgIGVycm9yLmNvbnRlbnRUeXBlID0gY29udGVudFR5cGU7XG4gICAgZXJyb3IucmVzcG9uc2VUZXh0ID0gcmVzcG9uc2VUZXh0O1xuICAgIGVycm9yLnVybCA9IHVybDtcbiAgICAvLyBMZWFybiBmcm9tIGV2ZXJ5IGNhbGxlcidzIDQwMCAobm90IG9ubHkgdGhlIGRhdGUgd2Fsaykgc28gdGhlIG5leHRcbiAgICAvLyBwb2x5Z29uIGluIHRoaXMgcmVnaW9uIC8gY3JvcCBuZXZlciByZS1hc2tzIHRoZSBzYW1lIHJlZnVzZWQgZGF0ZS5cbiAgICBpZiAoaXNFeHBvcnRJbWFnZU5vSW1hZ2VyeUVycm9yKGVycm9yKSkge1xuICAgICAgcmVtZW1iZXJSZWdpb25EYXRlV2l0aG91dEltYWdlcnkocGFyYW1zLnJlZ2lvbklkLCBwYXJhbXMucmFzdGVyRGF0ZSk7XG4gICAgfSBlbHNlIGlmIChpc0V4cG9ydEltYWdlT3V0T2ZTZWFzb25FcnJvcihlcnJvcikpIHtcbiAgICAgIGNvbnN0IG1vbnRocyA9IHBhcnNlRXhwb3J0SW1hZ2VTZWFzb25Nb250aHMoZXJyb3IpO1xuICAgICAgaWYgKG1vbnRocy5sZW5ndGgpIHtcbiAgICAgICAgcmVtZW1iZXJFeHBvcnRJbWFnZVNlYXNvbk1vbnRocyhcbiAgICAgICAgICBwYXJhbXMudW5pcXVlaWQsXG4gICAgICAgICAgbW9udGhzLFxuICAgICAgICAgIHBhcnNlRXhwb3J0SW1hZ2VDcm9wSWQoZXJyb3IpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuICByZW1lbWJlclJlZ2lvbkRhdGVXaXRoSW1hZ2VyeShwYXJhbXMucmVnaW9uSWQsIHBhcmFtcy5yYXN0ZXJEYXRlKTtcbiAgY29uc3QgYnVmZmVyID0gYXdhaXQgcmVzLmFycmF5QnVmZmVyKCk7XG5cbiAgY29uc3QgdGlmZiA9IGF3YWl0IGZyb21BcnJheUJ1ZmZlcihidWZmZXIpO1xuICBjb25zdCBpbWFnZSA9IGF3YWl0IHRpZmYuZ2V0SW1hZ2UoKTtcbiAgY29uc3QgYmJveCA9IGltYWdlLmdldEJvdW5kaW5nQm94KCkgYXMgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIGNvbnN0IHdpZHRoID0gaW1hZ2UuZ2V0V2lkdGgoKTtcbiAgY29uc3QgaGVpZ2h0ID0gaW1hZ2UuZ2V0SGVpZ2h0KCk7XG4gIGNvbnN0IHNhbXBsZXNQZXJQaXhlbCA9IGltYWdlLmdldFNhbXBsZXNQZXJQaXhlbCgpO1xuICBjb25zdCBwaXhlbENvdW50ID0gd2lkdGggKiBoZWlnaHQ7XG4gIGlmIChcbiAgICAhQXJyYXkuaXNBcnJheShiYm94KSB8fFxuICAgIGJib3gubGVuZ3RoIDwgNCB8fFxuICAgICFbYmJveFswXSwgYmJveFsxXSwgYmJveFsyXSwgYmJveFszXV0uZXZlcnkoKG4pID0+IE51bWJlci5pc0Zpbml0ZShuKSkgfHxcbiAgICAhKGJib3hbMl0gPiBiYm94WzBdKSB8fFxuICAgICEoYmJveFszXSA+IGJib3hbMV0pIHx8XG4gICAgISh3aWR0aCA+IDApIHx8XG4gICAgIShoZWlnaHQgPiAwKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW9USUZGIGJvdW5kaW5nIGJveC9zaXplIGludmFsaWRcIik7XG4gIH1cblxuICBsZXQgZXBzZ0NvZGU6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICB0cnkge1xuICAgIGNvbnN0IGdlb0tleXM6IGFueSA9IGltYWdlLmdldEdlb0tleXMoKTtcbiAgICBlcHNnQ29kZSA9XG4gICAgICBOdW1iZXIoZ2VvS2V5cz8uUHJvamVjdGVkQ1NUeXBlR2VvS2V5KSB8fFxuICAgICAgTnVtYmVyKGdlb0tleXM/Lkdlb2dyYXBoaWNUeXBlR2VvS2V5KSB8fFxuICAgICAgbnVsbDtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShlcHNnQ29kZSBhcyBudW1iZXIpKSBlcHNnQ29kZSA9IG51bGw7XG4gIH0gY2F0Y2gge1xuICAgIGVwc2dDb2RlID0gbnVsbDtcbiAgfVxuICAvLyBHZW9ncmFwaGljIGNvb3JkcyB3aXRob3V0IGdlby1rZXlzOiBzYWZlIGRlZmF1bHQuIFByb2plY3RlZCBtZXRyZXMgd2l0aG91dFxuICAvLyBhbiBFUFNHIG11c3Qgbm90IGJlIHRhZ2dlZCBhcyB0aGUgbWFwIHZpZXcgU1IgKGNhdXNlcyBzdHJldGNoL21pc3BsYWNlKS5cbiAgaWYgKGVwc2dDb2RlID09IG51bGwpIHtcbiAgICBjb25zdCBhYnNNYXggPSBNYXRoLm1heChcbiAgICAgIE1hdGguYWJzKGJib3hbMF0pLFxuICAgICAgTWF0aC5hYnMoYmJveFsxXSksXG4gICAgICBNYXRoLmFicyhiYm94WzJdKSxcbiAgICAgIE1hdGguYWJzKGJib3hbM10pLFxuICAgICk7XG4gICAgaWYgKGFic01heCA8PSAxODApIGVwc2dDb2RlID0gNDMyNjtcbiAgfVxuXG4gIGxldCBub0RhdGE6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICB0cnkge1xuICAgIGNvbnN0IGdkID0gTnVtYmVyKChpbWFnZSBhcyBhbnkpLmdldEdEQUxOb0RhdGE/LigpKTtcbiAgICBub0RhdGEgPSBOdW1iZXIuaXNGaW5pdGUoZ2QpID8gZ2QgOiBudWxsO1xuICB9IGNhdGNoIHtcbiAgICBub0RhdGEgPSBudWxsO1xuICB9XG5cbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gIGlmICghY3R4KSB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjYW52YXMgY29udGV4dCB1bmF2YWlsYWJsZVwiKTtcblxuICBjb25zdCBpbWFnZURhdGEgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICBjb25zdCBvdXQgPSBpbWFnZURhdGEuZGF0YTtcbiAgY29uc3QgY2xhbXAyNTUgPSAodjogdW5rbm93bik6IG51bWJlciA9PiB7XG4gICAgY29uc3QgbiA9IE1hdGgucm91bmQoTnVtYmVyKHYpIHx8IDApO1xuICAgIHJldHVybiBuIDwgMCA/IDAgOiBuID4gMjU1ID8gMjU1IDogbjtcbiAgfTtcblxuICBsZXQgaG92ZXJWYWx1ZXM6IEZsb2F0MzJBcnJheSB8IG51bGwgPSBudWxsO1xuICBsZXQgZGF0YU1pbiA9IEluZmluaXR5O1xuICBsZXQgZGF0YU1heCA9IC1JbmZpbml0eTtcblxuICBpZiAoc2FtcGxlc1BlclBpeGVsID49IDMpIHtcbiAgICAvLyBQcmUtY29sb3JlZCBSR0IvUkdCQTogb25lIGludGVybGVhdmVkIHJlYWQgb25seSAod2FzIGRvdWJsZS1yZWFkIGJlZm9yZSkuXG4gICAgY29uc3QgcmFzdGVyID0gKGF3YWl0IGltYWdlLnJlYWRSYXN0ZXJzKHsgaW50ZXJsZWF2ZTogdHJ1ZSB9KSkgYXNcbiAgICAgIHwgVWludDhBcnJheVxuICAgICAgfCBVaW50OENsYW1wZWRBcnJheVxuICAgICAgfCBGbG9hdDMyQXJyYXlcbiAgICAgIHwgbnVtYmVyW107XG4gICAgY29uc3Qgc3RyaWRlID0gc2FtcGxlc1BlclBpeGVsO1xuICAgIGlmIChzYW1wbGVzUGVyUGl4ZWwgPj0gNCkge1xuICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwaXhlbENvdW50OyBwKyspIHtcbiAgICAgICAgY29uc3QgbyA9IHAgKiBzdHJpZGU7XG4gICAgICAgIG91dFtwICogNF0gPSBjbGFtcDI1NShyYXN0ZXJbb10pO1xuICAgICAgICBvdXRbcCAqIDQgKyAxXSA9IGNsYW1wMjU1KHJhc3RlcltvICsgMV0pO1xuICAgICAgICBvdXRbcCAqIDQgKyAyXSA9IGNsYW1wMjU1KHJhc3RlcltvICsgMl0pO1xuICAgICAgICBvdXRbcCAqIDQgKyAzXSA9IGNsYW1wMjU1KHJhc3RlcltvICsgM10pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHBpeGVsQ291bnQ7IHArKykge1xuICAgICAgICBjb25zdCBvID0gcCAqIDM7XG4gICAgICAgIG91dFtwICogNF0gPSBjbGFtcDI1NShyYXN0ZXJbb10pO1xuICAgICAgICBvdXRbcCAqIDQgKyAxXSA9IGNsYW1wMjU1KHJhc3RlcltvICsgMV0pO1xuICAgICAgICBvdXRbcCAqIDQgKyAyXSA9IGNsYW1wMjU1KHJhc3RlcltvICsgMl0pO1xuICAgICAgICBvdXRbcCAqIDQgKyAzXSA9IDI1NTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYmFuZHMgPSAoYXdhaXQgaW1hZ2UucmVhZFJhc3RlcnMoeyBpbnRlcmxlYXZlOiBmYWxzZSB9KSkgYXMgYW55W107XG4gICAgY29uc3QgYmFuZDAgPSBiYW5kcz8uWzBdO1xuICAgIGNvbnN0IHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkocGl4ZWxDb3VudCk7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwaXhlbENvdW50OyBwKyspIHtcbiAgICAgIGNvbnN0IHJhdyA9IE51bWJlcihiYW5kMD8uW3BdKTtcbiAgICAgIGNvbnN0IHYgPSBOdW1iZXIuaXNGaW5pdGUocmF3KSA/IHJhdyA6IE5hTjtcbiAgICAgIHZhbHVlc1twXSA9IHY7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHYpICYmIChub0RhdGEgPT0gbnVsbCB8fCB2ICE9PSBub0RhdGEpKSB7XG4gICAgICAgIGlmICh2IDwgZGF0YU1pbikgZGF0YU1pbiA9IHY7XG4gICAgICAgIGlmICh2ID4gZGF0YU1heCkgZGF0YU1heCA9IHY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbG9va3NMaWtlSW5kZXggPVxuICAgICAgTnVtYmVyLmlzRmluaXRlKGRhdGFNaW4pICYmXG4gICAgICBOdW1iZXIuaXNGaW5pdGUoZGF0YU1heCkgJiZcbiAgICAgIGRhdGFNaW4gPj0gLTEuNSAmJlxuICAgICAgZGF0YU1heCA8PSAxLjU7XG4gICAgY29uc3QgbG9va3NMaWtlQnl0ZSA9XG4gICAgICBOdW1iZXIuaXNGaW5pdGUoZGF0YU1pbikgJiZcbiAgICAgIE51bWJlci5pc0Zpbml0ZShkYXRhTWF4KSAmJlxuICAgICAgZGF0YU1heCA+IDIgJiZcbiAgICAgIGRhdGFNYXggPD0gMjU1O1xuXG4gICAgaWYgKGxvb2tzTGlrZUluZGV4KSB7XG4gICAgICBob3ZlclZhbHVlcyA9IHZhbHVlcztcbiAgICB9IGVsc2UgaWYgKGxvb2tzTGlrZUJ5dGUpIHtcbiAgICAgIGhvdmVyVmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShwaXhlbENvdW50KTtcbiAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcGl4ZWxDb3VudDsgcCsrKSB7XG4gICAgICAgIGNvbnN0IHYgPSB2YWx1ZXNbcF07XG4gICAgICAgIGhvdmVyVmFsdWVzW3BdID1cbiAgICAgICAgICAhTnVtYmVyLmlzRmluaXRlKHYpIHx8IHYgPD0gMCB8fCAobm9EYXRhICE9IG51bGwgJiYgdiA9PT0gbm9EYXRhKVxuICAgICAgICAgICAgPyBOYU5cbiAgICAgICAgICAgIDogdiAvIDI1NTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobG9va3NMaWtlSW5kZXggfHwgKGxvb2tzTGlrZUJ5dGUgJiYgaG92ZXJWYWx1ZXMpKSB7XG4gICAgICBjb25zdCBzcmMgPSBob3ZlclZhbHVlcyB8fCB2YWx1ZXM7XG4gICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHBpeGVsQ291bnQ7IHArKykge1xuICAgICAgICBjb2xvcml6ZUluZGV4VmFsdWUoc3JjW3BdLCBvdXQsIHAgKiA0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwaXhlbENvdW50OyBwKyspIHtcbiAgICAgICAgY29uc3QgdiA9IGNsYW1wMjU1KHZhbHVlc1twXSk7XG4gICAgICAgIG91dFtwICogNF0gPSB2O1xuICAgICAgICBvdXRbcCAqIDQgKyAxXSA9IHY7XG4gICAgICAgIG91dFtwICogNCArIDJdID0gdjtcbiAgICAgICAgb3V0W3AgKiA0ICsgM10gPSB2ID4gMCA/IDI1NSA6IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gIC8vIE9ubHkga2VlcCBSR0JBIHdoZW4gaG92ZXIgZmxvYXRzIHdlcmUgbm90IHJlY292ZXJlZCAodHlwaWNhbCBSR0IgVElGRikuXG4gIGNvbnN0IHJnYmFGb3JIb3ZlciA9XG4gICAgIWhvdmVyVmFsdWVzICYmIHNhbXBsZXNQZXJQaXhlbCA+PSAzXG4gICAgICA/IG5ldyBVaW50OENsYW1wZWRBcnJheShvdXQpXG4gICAgICA6IG51bGw7XG5cbiAgYWdyaVBvbHlnb25BcGlMb2coXCJleHBvcnQtaW1hZ2U6ZGVjb2RlZFwiLCB7XG4gICAgdW5pcXVlaWQ6IHBhcmFtcy51bmlxdWVpZCxcbiAgICByYXN0ZXJEYXRlOiBwYXJhbXMucmFzdGVyRGF0ZSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgc2FtcGxlc1BlclBpeGVsLFxuICAgIGJib3gsXG4gICAgZXBzZ0NvZGUsXG4gICAgZGF0YU1pbjogTnVtYmVyLmlzRmluaXRlKGRhdGFNaW4pID8gZGF0YU1pbiA6IG51bGwsXG4gICAgZGF0YU1heDogTnVtYmVyLmlzRmluaXRlKGRhdGFNYXgpID8gZGF0YU1heCA6IG51bGwsXG4gICAgaGFzSG92ZXJWYWx1ZXM6IEJvb2xlYW4oaG92ZXJWYWx1ZXMpLFxuICAgIGhhc1JnYmFIb3ZlcjogQm9vbGVhbihyZ2JhRm9ySG92ZXIpLFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGNhbnZhcyxcbiAgICBiYm94LFxuICAgIGVwc2dDb2RlLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICB2YWx1ZXM6IGhvdmVyVmFsdWVzLFxuICAgIHJnYmE6IHJnYmFGb3JIb3ZlcixcbiAgICBub0RhdGEsXG4gIH07XG59XG4iLCIvKipcclxuICogU2hhcmVkIHZlZ2V0YXRpb24gb3ZlcmxheSBjb250ZXh0IHNvIFBvcHVwIGNhbiB3YXJtIGV4cG9ydC1pbWFnZSBhcyBzb29uIGFzXHJcbiAqIHVuaXF1ZWlkIGlzIGtub3duIOKAlCB3aXRob3V0IHdhaXRpbmcgZm9yIEdyYWZmIHNldFN0YXRlIC8gYXZhaWxhYmxlLWRhdGVzIHJhY2UuXHJcbiAqL1xyXG5pbXBvcnQge1xyXG4gIHJlc29sdmVFeHBvcnRJbWFnZVdpdGhEYXRlV2FsayxcclxuICB0eXBlIFZlZ2V0YXRpb25JbmRpY2VUeXBlLFxyXG59IGZyb20gXCIuLi9naXMvYWdyaS1wb2x5Z29uLWFwaS1zb3VyY2VcIjtcclxuXHJcbmNvbnN0IFNFU1NJT05fREFURV9LRVkgPSBcImFncmkudmVnLm92ZXJsYXkubGFzdERhdGVcIjtcclxuY29uc3QgU0VTU0lPTl9JTkRFWF9LRVkgPSBcImFncmkudmVnLm92ZXJsYXkubGFzdEluZGV4XCI7XHJcbmNvbnN0IFNFU1NJT05fUkVHSU9OX0tFWSA9IFwiYWdyaS52ZWcub3ZlcmxheS5sYXN0UmVnaW9uXCI7XHJcbmNvbnN0IFNFU1NJT05fWUVBUl9LRVkgPSBcImFncmkudmVnLm92ZXJsYXkubGFzdFllYXJcIjtcclxuY29uc3QgU0VTU0lPTl9EQVRFX1JFR0lPTl9LRVkgPSBcImFncmkudmVnLm92ZXJsYXkubGFzdERhdGVSZWdpb25cIjtcclxuY29uc3QgU0VTU0lPTl9EQVRFX1lFQVJfS0VZID0gXCJhZ3JpLnZlZy5vdmVybGF5Lmxhc3REYXRlWWVhclwiO1xyXG5cclxudHlwZSBPdmVybGF5Q29udGV4dCA9IHtcclxuICByZWdpb25JZD86IG51bWJlcjtcclxuICB5ZWFyPzogbnVtYmVyO1xyXG4gIGxhc3REYXRlPzogc3RyaW5nIHwgbnVsbDtcclxuICBsYXN0SW5kZXg/OiBWZWdldGF0aW9uSW5kaWNlVHlwZTtcclxuICAvKipcclxuICAgKiBSZWdpb24veWVhciB0aGUgY2FjaGVkIGBsYXN0RGF0ZWAgYWN0dWFsbHkgY2FtZSBmcm9tLiBTY2VuZSBkYXRlcyBkaWZmZXJcclxuICAgKiBwZXIgcmVnaW9uLCBzbyByZXVzaW5nIGEgZGF0ZSBhY3Jvc3MgcmVnaW9ucyBtYWtlcyBleHBvcnQtaW1hZ2UgYW5zd2VyXHJcbiAgICogNDAwIGZvciBhIGRhdGUgdGhhdCBoYXMgbm8gcmFzdGVyIGZvciB0aGUgbmV3IHBvbHlnb24uXHJcbiAgICovXHJcbiAgbGFzdERhdGVSZWdpb25JZD86IG51bWJlcjtcclxuICBsYXN0RGF0ZVllYXI/OiBudW1iZXI7XHJcbn07XHJcblxyXG5sZXQgY3R4OiBPdmVybGF5Q29udGV4dCA9IHt9O1xyXG5cclxuZnVuY3Rpb24gcmVhZFNlc3Npb24oKTogT3ZlcmxheUNvbnRleHQge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAodHlwZW9mIHNlc3Npb25TdG9yYWdlID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm4ge307XHJcbiAgICBjb25zdCBkYXRlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTRVNTSU9OX0RBVEVfS0VZKSB8fCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBpbmRleCA9IChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFNFU1NJT05fSU5ERVhfS0VZKSB8fFxyXG4gICAgICB1bmRlZmluZWQpIGFzIFZlZ2V0YXRpb25JbmRpY2VUeXBlIHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgcmVnaW9uUmF3ID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTRVNTSU9OX1JFR0lPTl9LRVkpO1xyXG4gICAgY29uc3QgeWVhclJhdyA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU0VTU0lPTl9ZRUFSX0tFWSk7XHJcbiAgICBjb25zdCBkYXRlUmVnaW9uUmF3ID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTRVNTSU9OX0RBVEVfUkVHSU9OX0tFWSk7XHJcbiAgICBjb25zdCBkYXRlWWVhclJhdyA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU0VTU0lPTl9EQVRFX1lFQVJfS0VZKTtcclxuICAgIGNvbnN0IHJlZ2lvbklkID0gcmVnaW9uUmF3ICE9IG51bGwgPyBOdW1iZXIocmVnaW9uUmF3KSA6IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHllYXIgPSB5ZWFyUmF3ICE9IG51bGwgPyBOdW1iZXIoeWVhclJhdykgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBsYXN0RGF0ZVJlZ2lvbklkID1cclxuICAgICAgZGF0ZVJlZ2lvblJhdyAhPSBudWxsID8gTnVtYmVyKGRhdGVSZWdpb25SYXcpIDogdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgbGFzdERhdGVZZWFyID0gZGF0ZVllYXJSYXcgIT0gbnVsbCA/IE51bWJlcihkYXRlWWVhclJhdykgOiB1bmRlZmluZWQ7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsYXN0RGF0ZTogZGF0ZSB8fCBudWxsLFxyXG4gICAgICBsYXN0SW5kZXg6IGluZGV4IHx8IFwibmR2aVwiLFxyXG4gICAgICByZWdpb25JZDogTnVtYmVyLmlzRmluaXRlKHJlZ2lvbklkIGFzIG51bWJlcikgPyByZWdpb25JZCA6IHVuZGVmaW5lZCxcclxuICAgICAgeWVhcjogTnVtYmVyLmlzRmluaXRlKHllYXIgYXMgbnVtYmVyKSA/IHllYXIgOiB1bmRlZmluZWQsXHJcbiAgICAgIGxhc3REYXRlUmVnaW9uSWQ6IE51bWJlci5pc0Zpbml0ZShsYXN0RGF0ZVJlZ2lvbklkIGFzIG51bWJlcilcclxuICAgICAgICA/IGxhc3REYXRlUmVnaW9uSWRcclxuICAgICAgICA6IHVuZGVmaW5lZCxcclxuICAgICAgbGFzdERhdGVZZWFyOiBOdW1iZXIuaXNGaW5pdGUobGFzdERhdGVZZWFyIGFzIG51bWJlcilcclxuICAgICAgICA/IGxhc3REYXRlWWVhclxyXG4gICAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgfTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiB7fTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHdyaXRlU2Vzc2lvbihuZXh0OiBPdmVybGF5Q29udGV4dCk6IHZvaWQge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAodHlwZW9mIHNlc3Npb25TdG9yYWdlID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XHJcbiAgICBpZiAobmV4dC5sYXN0RGF0ZSkgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTRVNTSU9OX0RBVEVfS0VZLCBuZXh0Lmxhc3REYXRlKTtcclxuICAgIGVsc2Ugc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShTRVNTSU9OX0RBVEVfS0VZKTtcclxuICAgIGlmIChuZXh0Lmxhc3RJbmRleClcclxuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTRVNTSU9OX0lOREVYX0tFWSwgbmV4dC5sYXN0SW5kZXgpO1xyXG4gICAgaWYgKG5leHQucmVnaW9uSWQgIT0gbnVsbClcclxuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTRVNTSU9OX1JFR0lPTl9LRVksIFN0cmluZyhuZXh0LnJlZ2lvbklkKSk7XHJcbiAgICBpZiAobmV4dC55ZWFyICE9IG51bGwpXHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oU0VTU0lPTl9ZRUFSX0tFWSwgU3RyaW5nKG5leHQueWVhcikpO1xyXG4gICAgaWYgKG5leHQubGFzdERhdGUgJiYgbmV4dC5sYXN0RGF0ZVJlZ2lvbklkICE9IG51bGwpIHtcclxuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcclxuICAgICAgICBTRVNTSU9OX0RBVEVfUkVHSU9OX0tFWSxcclxuICAgICAgICBTdHJpbmcobmV4dC5sYXN0RGF0ZVJlZ2lvbklkKSxcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oU0VTU0lPTl9EQVRFX1JFR0lPTl9LRVkpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5leHQubGFzdERhdGUgJiYgbmV4dC5sYXN0RGF0ZVllYXIgIT0gbnVsbCkge1xyXG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFNFU1NJT05fREFURV9ZRUFSX0tFWSwgU3RyaW5nKG5leHQubGFzdERhdGVZZWFyKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFNFU1NJT05fREFURV9ZRUFSX0tFWSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvKiBpZ25vcmUgcXVvdGEgLyBwcml2YXRlIG1vZGUgKi9cclxuICB9XHJcbn1cclxuXHJcbi8qKiBNZXJnZSBsaXZlIEdyYWZmL0xvY2FsaXphdGlvbiBjb250ZXh0IChyZWdpb24veWVhci9sYXN0IHN1Y2Nlc3NmdWwgZGF0ZSkuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRWZWdldGF0aW9uT3ZlcmxheUNvbnRleHQoXHJcbiAgcGF0Y2g6IE92ZXJsYXlDb250ZXh0LFxyXG4pOiBPdmVybGF5Q29udGV4dCB7XHJcbiAgY29uc3QgbmV4dDogT3ZlcmxheUNvbnRleHQgPSB7XHJcbiAgICAuLi5jdHgsXHJcbiAgICAuLi5wYXRjaCxcclxuICB9O1xyXG4gIC8vIEEgZGF0ZSBpcyBvbmx5IG1lYW5pbmdmdWwgdG9nZXRoZXIgd2l0aCB0aGUgcmVnaW9uL3llYXIgaXQgY2FtZSBmcm9tLlxyXG4gIGlmIChwYXRjaC5sYXN0RGF0ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAocGF0Y2gubGFzdERhdGUpIHtcclxuICAgICAgbmV4dC5sYXN0RGF0ZVJlZ2lvbklkID1cclxuICAgICAgICBwYXRjaC5sYXN0RGF0ZVJlZ2lvbklkID8/IHBhdGNoLnJlZ2lvbklkID8/IGN0eC5yZWdpb25JZDtcclxuICAgICAgbmV4dC5sYXN0RGF0ZVllYXIgPSBwYXRjaC5sYXN0RGF0ZVllYXIgPz8gcGF0Y2gueWVhciA/PyBjdHgueWVhcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5leHQubGFzdERhdGUgPSBudWxsO1xyXG4gICAgICBuZXh0Lmxhc3REYXRlUmVnaW9uSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgIG5leHQubGFzdERhdGVZZWFyID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxuICBjdHggPSBuZXh0O1xyXG4gIHdyaXRlU2Vzc2lvbihjdHgpO1xyXG4gIHJldHVybiBjdHg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRWZWdldGF0aW9uT3ZlcmxheUNvbnRleHQoKTogT3ZlcmxheUNvbnRleHQge1xyXG4gIGlmIChcclxuICAgIGN0eC5yZWdpb25JZCA9PSBudWxsIHx8XHJcbiAgICBjdHgueWVhciA9PSBudWxsIHx8XHJcbiAgICAhY3R4Lmxhc3REYXRlXHJcbiAgKSB7XHJcbiAgICBjb25zdCBmcm9tU2Vzc2lvbiA9IHJlYWRTZXNzaW9uKCk7XHJcbiAgICBjdHggPSB7XHJcbiAgICAgIHJlZ2lvbklkOiBjdHgucmVnaW9uSWQgPz8gZnJvbVNlc3Npb24ucmVnaW9uSWQsXHJcbiAgICAgIHllYXI6IGN0eC55ZWFyID8/IGZyb21TZXNzaW9uLnllYXIsXHJcbiAgICAgIGxhc3REYXRlOiBjdHgubGFzdERhdGUgPz8gZnJvbVNlc3Npb24ubGFzdERhdGUsXHJcbiAgICAgIGxhc3RJbmRleDogY3R4Lmxhc3RJbmRleCA/PyBmcm9tU2Vzc2lvbi5sYXN0SW5kZXggPz8gXCJuZHZpXCIsXHJcbiAgICAgIGxhc3REYXRlUmVnaW9uSWQ6IGN0eC5sYXN0RGF0ZVJlZ2lvbklkID8/IGZyb21TZXNzaW9uLmxhc3REYXRlUmVnaW9uSWQsXHJcbiAgICAgIGxhc3REYXRlWWVhcjogY3R4Lmxhc3REYXRlWWVhciA/PyBmcm9tU2Vzc2lvbi5sYXN0RGF0ZVllYXIsXHJcbiAgICB9O1xyXG4gIH1cclxuICByZXR1cm4gY3R4O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FjaGVkIG92ZXJsYXkgZGF0ZSwgYnV0IG9ubHkgd2hlbiBpdCBiZWxvbmdzIHRvIHRoZSBzYW1lIHJlZ2lvbiAoYW5kIHllYXIpOlxyXG4gKiBleHBvcnQtaW1hZ2UgYW5zd2VycyA0MDAgZm9yIGEgcmFzdGVyX2RhdGUgdGhhdCBoYXMgbm8gc2NlbmUgZm9yIHRoZVxyXG4gKiByZXF1ZXN0ZWQgcG9seWdvbi9yZWdpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVnZXRhdGlvbk92ZXJsYXlEYXRlRm9yUmVnaW9uKFxyXG4gIHJlZ2lvbklkOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gIHllYXI/OiBudW1iZXIgfCBudWxsLFxyXG4pOiBzdHJpbmcgfCBudWxsIHtcclxuICBjb25zdCBsaXZlID0gZ2V0VmVnZXRhdGlvbk92ZXJsYXlDb250ZXh0KCk7XHJcbiAgY29uc3QgZGF0ZSA9IFN0cmluZyhsaXZlLmxhc3REYXRlIHx8IFwiXCIpLnRyaW0oKTtcclxuICBpZiAoIWRhdGUgfHwgcmVnaW9uSWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgaWYgKGxpdmUubGFzdERhdGVSZWdpb25JZCAhPSBudWxsICYmIGxpdmUubGFzdERhdGVSZWdpb25JZCAhPT0gcmVnaW9uSWQpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBpZiAoXHJcbiAgICB5ZWFyICE9IG51bGwgJiZcclxuICAgIGxpdmUubGFzdERhdGVZZWFyICE9IG51bGwgJiZcclxuICAgIGxpdmUubGFzdERhdGVZZWFyICE9PSB5ZWFyXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcmV0dXJuIGRhdGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFuVW5pcXVlaWQodW5pcXVlaWQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFN0cmluZyh1bmlxdWVpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRyaW0oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpcmUtYW5kLWZvcmdldDogcmVzb2x2ZSBhIHNlcnZhYmxlIHJhc3Rlcl9kYXRlIChjcm9wIHNlYXNvbiArIGltYWdlcnkpIGFuZFxyXG4gKiB3YXJtIHRoZSBUSUZGIGNhY2hlLiBEZWR1cGVkIHdpdGggR3JhZmYncyBlYXJseS1vdmVybGF5IHdhbGsgc28gdGFibGUgY2xpY2tzXHJcbiAqIGRvIG5vdCBzdGFjayBzZXF1ZW50aWFsIDQwMCBjYXNjYWRlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwcmVmZXRjaFZlZ2V0YXRpb25PdmVybGF5Rm9yVW5pcXVlaWQoXHJcbiAgdW5pcXVlaWQ6IHN0cmluZyxcclxuICBvcHRzPzoge1xyXG4gICAgcmVnaW9uSWQ/OiBudW1iZXI7XHJcbiAgICB5ZWFyPzogbnVtYmVyO1xyXG4gICAgcmFzdGVyRGF0ZT86IHN0cmluZyB8IG51bGw7XHJcbiAgICBpbmRpY2VUeXBlPzogVmVnZXRhdGlvbkluZGljZVR5cGU7XHJcbiAgICBjcm9wSWQ/OiBudW1iZXIgfCBudWxsO1xyXG4gICAgZGF0ZXM/OiBzdHJpbmdbXSB8IG51bGw7XHJcbiAgfSxcclxuKTogdm9pZCB7XHJcbiAgY29uc3QgaWQgPSBjbGVhblVuaXF1ZWlkKHVuaXF1ZWlkKTtcclxuICBpZiAoIWlkKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGxpdmUgPSBnZXRWZWdldGF0aW9uT3ZlcmxheUNvbnRleHQoKTtcclxuICBjb25zdCByZWdpb25JZCA9IG9wdHM/LnJlZ2lvbklkID8/IGxpdmUucmVnaW9uSWQ7XHJcbiAgY29uc3QgeWVhciA9IG9wdHM/LnllYXIgPz8gbGl2ZS55ZWFyO1xyXG4gIGNvbnN0IGNyb3BJZCA9IG9wdHM/LmNyb3BJZCA/PyBudWxsO1xyXG4gIGNvbnN0IGluZGljZVR5cGUgPSAob3B0cz8uaW5kaWNlVHlwZSB8fFxyXG4gICAgbGl2ZS5sYXN0SW5kZXggfHxcclxuICAgIFwibmR2aVwiKSBhcyBWZWdldGF0aW9uSW5kaWNlVHlwZTtcclxuICBpZiAocmVnaW9uSWQgPT0gbnVsbCB8fCAhTnVtYmVyLmlzRmluaXRlKHJlZ2lvbklkKSkgcmV0dXJuO1xyXG4gIGlmICh5ZWFyID09IG51bGwgfHwgIU51bWJlci5pc0Zpbml0ZSh5ZWFyKSkgcmV0dXJuO1xyXG5cclxuICB2b2lkIHJlc29sdmVFeHBvcnRJbWFnZVdpdGhEYXRlV2Fsayh7XHJcbiAgICB1bmlxdWVpZDogaWQsXHJcbiAgICByZWdpb25JZCxcclxuICAgIHllYXIsXHJcbiAgICBjcm9wSWQsXHJcbiAgICBpbmRpY2VUeXBlLFxyXG4gICAgZGF0ZXM6IG9wdHM/LmRhdGVzLFxyXG4gIH0pXHJcbiAgICAudGhlbigoaGl0KSA9PiB7XHJcbiAgICAgIGlmICghaGl0KSByZXR1cm47XHJcbiAgICAgIHNldFZlZ2V0YXRpb25PdmVybGF5Q29udGV4dCh7XHJcbiAgICAgICAgcmVnaW9uSWQsXHJcbiAgICAgICAgeWVhcixcclxuICAgICAgICBsYXN0RGF0ZTogaGl0LmRhdGUsXHJcbiAgICAgICAgbGFzdERhdGVSZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgbGFzdERhdGVZZWFyOiB5ZWFyLFxyXG4gICAgICAgIGxhc3RJbmRleDogaW5kaWNlVHlwZSxcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKCgpID0+IHtcclxuICAgICAgLyogd2FybSBvbmx5IOKAlCBHcmFmZiBoYW5kbGVzIGVycm9ycyAqL1xyXG4gICAgfSk7XHJcbn1cclxuIiwiLyoqIFNoYXJlZCB2ZWdldGF0aW9uIGluZGV4IGxlZ2VuZCBjb25maWcgZm9yIEdyYWZmIGdyYXBoL3RhYmxlIHZpZXdzLiAqL1xuZXhwb3J0IHR5cGUgR3JhZmZJbmRleEtleSA9IFwibmR2aVwiIHwgXCJzYXZpXCIgfCBcInJ2aVwiIHwgXCJjaVwiIHwgXCJldmlcIiB8IFwibmR3aVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdyYWZmSW5kZXhCdXR0b24ge1xuICBrZXk6IEdyYWZmSW5kZXhLZXk7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBHUkFGRl9JTkRFWF9CVVRUT05TOiBHcmFmZkluZGV4QnV0dG9uW10gPSBbXG4gIHsga2V5OiBcIm5kdmlcIiwgbGFiZWw6IFwiTkRWSVwiLCBjb2xvcjogXCIjMDBkMDg0XCIgfSxcbiAgeyBrZXk6IFwic2F2aVwiLCBsYWJlbDogXCJTQVZJXCIsIGNvbG9yOiBcIiM3YWE1ZmZcIiB9LFxuICB7IGtleTogXCJydmlcIiwgbGFiZWw6IFwiUlZJXCIsIGNvbG9yOiBcIiNmZmIzNDdcIiB9LFxuICB7IGtleTogXCJjaVwiLCBsYWJlbDogXCJDSVwiLCBjb2xvcjogXCIjYzc4YmZmXCIgfSxcbiAgeyBrZXk6IFwiZXZpXCIsIGxhYmVsOiBcIkVWSVwiLCBjb2xvcjogXCIjZmY0ZDhkXCIgfSxcbiAgeyBrZXk6IFwibmR3aVwiLCBsYWJlbDogXCJORFdJXCIsIGNvbG9yOiBcIiMyZWM0ZjFcIiB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEdSQUZGX0lOREVYX09SREVSOiBHcmFmZkluZGV4S2V5W10gPSBHUkFGRl9JTkRFWF9CVVRUT05TLm1hcChcbiAgKGl0ZW0pID0+IGl0ZW0ua2V5LFxuKTtcblxuLyoqIFJlcHVibGljIHJlZ2lvbmFsIHRpbWVzZXJpZXMgQVZHIGZpZWxkIGFsbG93LWxpc3QuICovXG5leHBvcnQgY29uc3QgUkVQVUJMSUNfVElNRVNFUklFU19JTkRFWF9GSUVMRFMgPSBbXG4gIFwibmR2aVwiLFxuICBcInNhdmlcIixcbiAgXCJldmlcIixcbiAgXCJydmlcIixcbiAgXCJjaVwiLFxuICBcIm5kd2lcIixcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFJlcHVibGljVGltZXNlcmllc0luZGV4RmllbGQgPVxuICAodHlwZW9mIFJFUFVCTElDX1RJTUVTRVJJRVNfSU5ERVhfRklFTERTKVtudW1iZXJdO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNSZXB1YmxpY1RpbWVzZXJpZXNJbmRleEZpZWxkKFxuICB2YWx1ZTogc3RyaW5nLFxuKTogdmFsdWUgaXMgUmVwdWJsaWNUaW1lc2VyaWVzSW5kZXhGaWVsZCB7XG4gIHJldHVybiAoUkVQVUJMSUNfVElNRVNFUklFU19JTkRFWF9GSUVMRFMgYXMgcmVhZG9ubHkgc3RyaW5nW10pLmluY2x1ZGVzKFxuICAgIHZhbHVlLFxuICApO1xufVxuIiwiLyoqXG4gKiBTaW5nbGUgaW1wb3J0IHNpdGUgZm9yIGdlb3RpZmYgY29tcHJlc3Npb24gZGVjb2RlcnMuXG4gKiBnZW90aWZmJ3MgcGFja2FnZS5qc29uIG9ubHkgZXhwb3J0cyBcIi5cIiDigJQgZGVlcCBpbXBvcnRzIGZhaWwgdW5kZXIgd2VicGFjayA1LlxuICogUmVsYXRpdmUgbm9kZV9tb2R1bGVzIHBhdGhzICg2IGxldmVscyBmcm9tIHNyYy92ZW5kb3Ig4oaSIGNsaWVudC8pIGJ5cGFzcyBleHBvcnRzLlxuICovXG5pbXBvcnQgUmF3RGVjb2RlciBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvY29tcHJlc3Npb24vcmF3LmpzXCI7XG5pbXBvcnQgTHp3RGVjb2RlciBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvY29tcHJlc3Npb24vbHp3LmpzXCI7XG5pbXBvcnQgRGVmbGF0ZURlY29kZXIgZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL2NvbXByZXNzaW9uL2RlZmxhdGUuanNcIjtcbmltcG9ydCBQYWNrYml0c0RlY29kZXIgZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL2NvbXByZXNzaW9uL3BhY2tiaXRzLmpzXCI7XG5cbmV4cG9ydCB7IFJhd0RlY29kZXIsIEx6d0RlY29kZXIsIERlZmxhdGVEZWNvZGVyLCBQYWNrYml0c0RlY29kZXIgfTtcbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==