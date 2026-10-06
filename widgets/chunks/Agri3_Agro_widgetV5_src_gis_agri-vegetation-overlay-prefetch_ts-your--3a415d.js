(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agro_widgetV5_src_gis_agri-vegetation-overlay-prefetch_ts-your--3a415d"],{

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-polygon-api-source.ts":
/*!****************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-polygon-api-source.ts ***!
  \****************************************************************************************/
/***/ (() => {

throw new Error("Module parse failed: Identifier 'regionDatesWithImagery' has already been declared (436:6)\nFile was processed with these loaders:\n * ./node_modules/ts-loader/index.js\n * ./node_modules/thread-loader/dist/cjs.js\nYou may need an additional loader to handle the result of these loaders.\n| }\n| /** region|date pairs export-image has served (HTTP 200) this session. */\n> const regionDatesWithImagery = new Set();\n| export function rememberRegionDateWithImagery(regionId, date) {\n|     const key = regionDateKey(regionId, date);");

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

/***/ "./node_modules/lucide-react/dist/esm/icons/chart-line.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/chart-line.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ ChartLine)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "m19 9-5 5-4-4-3 3", key: "2osh9i" }]
];
const ChartLine = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("chart-line", __iconNode);


//# sourceMappingURL=chart-line.mjs.map


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyb193aWRnZXRWNV9zcmNfZ2lzX2FncmktdmVnZXRhdGlvbi1vdmVybGF5LXByZWZldGNoX3RzLXlvdXItLTNhNDE1ZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0dBR0c7QUFJcUM7QUFFeEMsTUFBTSxnQkFBZ0IsR0FBRywyQkFBMkIsQ0FBQztBQUNyRCxNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixDQUFDO0FBQ3ZELE1BQU0sa0JBQWtCLEdBQUcsNkJBQTZCLENBQUM7QUFDekQsTUFBTSxnQkFBZ0IsR0FBRywyQkFBMkIsQ0FBQztBQUNyRCxNQUFNLHVCQUF1QixHQUFHLGlDQUFpQyxDQUFDO0FBQ2xFLE1BQU0scUJBQXFCLEdBQUcsK0JBQStCLENBQUM7QUFnQjlELElBQUksR0FBRyxHQUFtQixFQUFFLENBQUM7QUFFN0IsU0FBUyxXQUFXO0lBQ2xCLElBQUksQ0FBQztRQUNILElBQUksT0FBTyxjQUFjLEtBQUssV0FBVztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3JELE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxTQUFTLENBQUM7UUFDbkUsTUFBTSxLQUFLLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1lBQ3RELFNBQVMsQ0FBcUMsQ0FBQztRQUNqRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDN0QsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0RSxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbEUsTUFBTSxRQUFRLEdBQUcs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QUFnQyxHQUFHO0lBQzlDLE1BQU07SUFDTixNQUFNO0lBQ04sS0FBSztJQUNMLEtBQUs7SUFDTCxJQUFJO0lBQ0osTUFBTTtDQUNFLENBQUM7QUFLSixTQUFTLDhCQUE4QixDQUM1QyxLQUFhO0lBRWIsT0FBUSxnQ0FBc0QsQ0FBQyxRQUFRLENBQ3JFLEtBQUssQ0FDTixDQUFDO0FBQ0osQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFdUQ7O0FBRXZEO0FBQ0EsYUFBYSw4Q0FBOEM7QUFDM0QsYUFBYSx1Q0FBdUM7QUFDcEQ7QUFDQSxrQkFBa0IsaUVBQWdCOztBQUVVO0FBQzVDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2dpcy9hZ3JpLXZlZ2V0YXRpb24tb3ZlcmxheS1wcmVmZXRjaC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvcGFuZWxzL0dyYWZmUGFuZWwvcnVudGltZS9ncmFmZi1ncmFwaC1jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvY2hhcnQtbGluZS5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFNoYXJlZCB2ZWdldGF0aW9uIG92ZXJsYXkgY29udGV4dCBzbyBQb3B1cCBjYW4gd2FybSBleHBvcnQtaW1hZ2UgYXMgc29vbiBhc1xyXG4gKiB1bmlxdWVpZCBpcyBrbm93biDigJQgd2l0aG91dCB3YWl0aW5nIGZvciBHcmFmZiBzZXRTdGF0ZSAvIGF2YWlsYWJsZS1kYXRlcyByYWNlLlxyXG4gKi9cclxuaW1wb3J0IHtcclxuICByZXNvbHZlRXhwb3J0SW1hZ2VXaXRoRGF0ZVdhbGssXHJcbiAgdHlwZSBWZWdldGF0aW9uSW5kaWNlVHlwZSxcclxufSBmcm9tIFwiLi4vZ2lzL2FncmktcG9seWdvbi1hcGktc291cmNlXCI7XHJcblxyXG5jb25zdCBTRVNTSU9OX0RBVEVfS0VZID0gXCJhZ3JpLnZlZy5vdmVybGF5Lmxhc3REYXRlXCI7XHJcbmNvbnN0IFNFU1NJT05fSU5ERVhfS0VZID0gXCJhZ3JpLnZlZy5vdmVybGF5Lmxhc3RJbmRleFwiO1xyXG5jb25zdCBTRVNTSU9OX1JFR0lPTl9LRVkgPSBcImFncmkudmVnLm92ZXJsYXkubGFzdFJlZ2lvblwiO1xyXG5jb25zdCBTRVNTSU9OX1lFQVJfS0VZID0gXCJhZ3JpLnZlZy5vdmVybGF5Lmxhc3RZZWFyXCI7XHJcbmNvbnN0IFNFU1NJT05fREFURV9SRUdJT05fS0VZID0gXCJhZ3JpLnZlZy5vdmVybGF5Lmxhc3REYXRlUmVnaW9uXCI7XHJcbmNvbnN0IFNFU1NJT05fREFURV9ZRUFSX0tFWSA9IFwiYWdyaS52ZWcub3ZlcmxheS5sYXN0RGF0ZVllYXJcIjtcclxuXHJcbnR5cGUgT3ZlcmxheUNvbnRleHQgPSB7XHJcbiAgcmVnaW9uSWQ/OiBudW1iZXI7XHJcbiAgeWVhcj86IG51bWJlcjtcclxuICBsYXN0RGF0ZT86IHN0cmluZyB8IG51bGw7XHJcbiAgbGFzdEluZGV4PzogVmVnZXRhdGlvbkluZGljZVR5cGU7XHJcbiAgLyoqXHJcbiAgICogUmVnaW9uL3llYXIgdGhlIGNhY2hlZCBgbGFzdERhdGVgIGFjdHVhbGx5IGNhbWUgZnJvbS4gU2NlbmUgZGF0ZXMgZGlmZmVyXHJcbiAgICogcGVyIHJlZ2lvbiwgc28gcmV1c2luZyBhIGRhdGUgYWNyb3NzIHJlZ2lvbnMgbWFrZXMgZXhwb3J0LWltYWdlIGFuc3dlclxyXG4gICAqIDQwMCBmb3IgYSBkYXRlIHRoYXQgaGFzIG5vIHJhc3RlciBmb3IgdGhlIG5ldyBwb2x5Z29uLlxyXG4gICAqL1xyXG4gIGxhc3REYXRlUmVnaW9uSWQ/OiBudW1iZXI7XHJcbiAgbGFzdERhdGVZZWFyPzogbnVtYmVyO1xyXG59O1xyXG5cclxubGV0IGN0eDogT3ZlcmxheUNvbnRleHQgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIHJlYWRTZXNzaW9uKCk6IE92ZXJsYXlDb250ZXh0IHtcclxuICB0cnkge1xyXG4gICAgaWYgKHR5cGVvZiBzZXNzaW9uU3RvcmFnZSA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHt9O1xyXG4gICAgY29uc3QgZGF0ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU0VTU0lPTl9EQVRFX0tFWSkgfHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgaW5kZXggPSAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTRVNTSU9OX0lOREVYX0tFWSkgfHxcclxuICAgICAgdW5kZWZpbmVkKSBhcyBWZWdldGF0aW9uSW5kaWNlVHlwZSB8IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHJlZ2lvblJhdyA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU0VTU0lPTl9SRUdJT05fS0VZKTtcclxuICAgIGNvbnN0IHllYXJSYXcgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFNFU1NJT05fWUVBUl9LRVkpO1xyXG4gICAgY29uc3QgZGF0ZVJlZ2lvblJhdyA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU0VTU0lPTl9EQVRFX1JFR0lPTl9LRVkpO1xyXG4gICAgY29uc3QgZGF0ZVllYXJSYXcgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFNFU1NJT05fREFURV9ZRUFSX0tFWSk7XHJcbiAgICBjb25zdCByZWdpb25JZCA9IHJlZ2lvblJhdyAhPSBudWxsID8gTnVtYmVyKHJlZ2lvblJhdykgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCB5ZWFyID0geWVhclJhdyAhPSBudWxsID8gTnVtYmVyKHllYXJSYXcpIDogdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgbGFzdERhdGVSZWdpb25JZCA9XHJcbiAgICAgIGRhdGVSZWdpb25SYXcgIT0gbnVsbCA/IE51bWJlcihkYXRlUmVnaW9uUmF3KSA6IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IGxhc3REYXRlWWVhciA9IGRhdGVZZWFyUmF3ICE9IG51bGwgPyBOdW1iZXIoZGF0ZVllYXJSYXcpIDogdW5kZWZpbmVkO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGFzdERhdGU6IGRhdGUgfHwgbnVsbCxcclxuICAgICAgbGFzdEluZGV4OiBpbmRleCB8fCBcIm5kdmlcIixcclxuICAgICAgcmVnaW9uSWQ6IE51bWJlci5pc0Zpbml0ZShyZWdpb25JZCBhcyBudW1iZXIpID8gcmVnaW9uSWQgOiB1bmRlZmluZWQsXHJcbiAgICAgIHllYXI6IE51bWJlci5pc0Zpbml0ZSh5ZWFyIGFzIG51bWJlcikgPyB5ZWFyIDogdW5kZWZpbmVkLFxyXG4gICAgICBsYXN0RGF0ZVJlZ2lvbklkOiBOdW1iZXIuaXNGaW5pdGUobGFzdERhdGVSZWdpb25JZCBhcyBudW1iZXIpXHJcbiAgICAgICAgPyBsYXN0RGF0ZVJlZ2lvbklkXHJcbiAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICAgIGxhc3REYXRlWWVhcjogTnVtYmVyLmlzRmluaXRlKGxhc3REYXRlWWVhciBhcyBudW1iZXIpXHJcbiAgICAgICAgPyBsYXN0RGF0ZVllYXJcclxuICAgICAgICA6IHVuZGVmaW5lZCxcclxuICAgIH07XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4ge307XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB3cml0ZVNlc3Npb24obmV4dDogT3ZlcmxheUNvbnRleHQpOiB2b2lkIHtcclxuICB0cnkge1xyXG4gICAgaWYgKHR5cGVvZiBzZXNzaW9uU3RvcmFnZSA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xyXG4gICAgaWYgKG5leHQubGFzdERhdGUpIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oU0VTU0lPTl9EQVRFX0tFWSwgbmV4dC5sYXN0RGF0ZSk7XHJcbiAgICBlbHNlIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oU0VTU0lPTl9EQVRFX0tFWSk7XHJcbiAgICBpZiAobmV4dC5sYXN0SW5kZXgpXHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oU0VTU0lPTl9JTkRFWF9LRVksIG5leHQubGFzdEluZGV4KTtcclxuICAgIGlmIChuZXh0LnJlZ2lvbklkICE9IG51bGwpXHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oU0VTU0lPTl9SRUdJT05fS0VZLCBTdHJpbmcobmV4dC5yZWdpb25JZCkpO1xyXG4gICAgaWYgKG5leHQueWVhciAhPSBudWxsKVxyXG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFNFU1NJT05fWUVBUl9LRVksIFN0cmluZyhuZXh0LnllYXIpKTtcclxuICAgIGlmIChuZXh0Lmxhc3REYXRlICYmIG5leHQubGFzdERhdGVSZWdpb25JZCAhPSBudWxsKSB7XHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXHJcbiAgICAgICAgU0VTU0lPTl9EQVRFX1JFR0lPTl9LRVksXHJcbiAgICAgICAgU3RyaW5nKG5leHQubGFzdERhdGVSZWdpb25JZCksXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFNFU1NJT05fREFURV9SRUdJT05fS0VZKTtcclxuICAgIH1cclxuICAgIGlmIChuZXh0Lmxhc3REYXRlICYmIG5leHQubGFzdERhdGVZZWFyICE9IG51bGwpIHtcclxuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTRVNTSU9OX0RBVEVfWUVBUl9LRVksIFN0cmluZyhuZXh0Lmxhc3REYXRlWWVhcikpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShTRVNTSU9OX0RBVEVfWUVBUl9LRVkpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLyogaWdub3JlIHF1b3RhIC8gcHJpdmF0ZSBtb2RlICovXHJcbiAgfVxyXG59XHJcblxyXG4vKiogTWVyZ2UgbGl2ZSBHcmFmZi9Mb2NhbGl6YXRpb24gY29udGV4dCAocmVnaW9uL3llYXIvbGFzdCBzdWNjZXNzZnVsIGRhdGUpLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0VmVnZXRhdGlvbk92ZXJsYXlDb250ZXh0KFxyXG4gIHBhdGNoOiBPdmVybGF5Q29udGV4dCxcclxuKTogT3ZlcmxheUNvbnRleHQge1xyXG4gIGNvbnN0IG5leHQ6IE92ZXJsYXlDb250ZXh0ID0ge1xyXG4gICAgLi4uY3R4LFxyXG4gICAgLi4ucGF0Y2gsXHJcbiAgfTtcclxuICAvLyBBIGRhdGUgaXMgb25seSBtZWFuaW5nZnVsIHRvZ2V0aGVyIHdpdGggdGhlIHJlZ2lvbi95ZWFyIGl0IGNhbWUgZnJvbS5cclxuICBpZiAocGF0Y2gubGFzdERhdGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKHBhdGNoLmxhc3REYXRlKSB7XHJcbiAgICAgIG5leHQubGFzdERhdGVSZWdpb25JZCA9XHJcbiAgICAgICAgcGF0Y2gubGFzdERhdGVSZWdpb25JZCA/PyBwYXRjaC5yZWdpb25JZCA/PyBjdHgucmVnaW9uSWQ7XHJcbiAgICAgIG5leHQubGFzdERhdGVZZWFyID0gcGF0Y2gubGFzdERhdGVZZWFyID8/IHBhdGNoLnllYXIgPz8gY3R4LnllYXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuZXh0Lmxhc3REYXRlID0gbnVsbDtcclxuICAgICAgbmV4dC5sYXN0RGF0ZVJlZ2lvbklkID0gdW5kZWZpbmVkO1xyXG4gICAgICBuZXh0Lmxhc3REYXRlWWVhciA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICB9XHJcbiAgY3R4ID0gbmV4dDtcclxuICB3cml0ZVNlc3Npb24oY3R4KTtcclxuICByZXR1cm4gY3R4O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVnZXRhdGlvbk92ZXJsYXlDb250ZXh0KCk6IE92ZXJsYXlDb250ZXh0IHtcclxuICBpZiAoXHJcbiAgICBjdHgucmVnaW9uSWQgPT0gbnVsbCB8fFxyXG4gICAgY3R4LnllYXIgPT0gbnVsbCB8fFxyXG4gICAgIWN0eC5sYXN0RGF0ZVxyXG4gICkge1xyXG4gICAgY29uc3QgZnJvbVNlc3Npb24gPSByZWFkU2Vzc2lvbigpO1xyXG4gICAgY3R4ID0ge1xyXG4gICAgICByZWdpb25JZDogY3R4LnJlZ2lvbklkID8/IGZyb21TZXNzaW9uLnJlZ2lvbklkLFxyXG4gICAgICB5ZWFyOiBjdHgueWVhciA/PyBmcm9tU2Vzc2lvbi55ZWFyLFxyXG4gICAgICBsYXN0RGF0ZTogY3R4Lmxhc3REYXRlID8/IGZyb21TZXNzaW9uLmxhc3REYXRlLFxyXG4gICAgICBsYXN0SW5kZXg6IGN0eC5sYXN0SW5kZXggPz8gZnJvbVNlc3Npb24ubGFzdEluZGV4ID8/IFwibmR2aVwiLFxyXG4gICAgICBsYXN0RGF0ZVJlZ2lvbklkOiBjdHgubGFzdERhdGVSZWdpb25JZCA/PyBmcm9tU2Vzc2lvbi5sYXN0RGF0ZVJlZ2lvbklkLFxyXG4gICAgICBsYXN0RGF0ZVllYXI6IGN0eC5sYXN0RGF0ZVllYXIgPz8gZnJvbVNlc3Npb24ubGFzdERhdGVZZWFyLFxyXG4gICAgfTtcclxuICB9XHJcbiAgcmV0dXJuIGN0eDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhY2hlZCBvdmVybGF5IGRhdGUsIGJ1dCBvbmx5IHdoZW4gaXQgYmVsb25ncyB0byB0aGUgc2FtZSByZWdpb24gKGFuZCB5ZWFyKTpcclxuICogZXhwb3J0LWltYWdlIGFuc3dlcnMgNDAwIGZvciBhIHJhc3Rlcl9kYXRlIHRoYXQgaGFzIG5vIHNjZW5lIGZvciB0aGVcclxuICogcmVxdWVzdGVkIHBvbHlnb24vcmVnaW9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZlZ2V0YXRpb25PdmVybGF5RGF0ZUZvclJlZ2lvbihcclxuICByZWdpb25JZDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICB5ZWFyPzogbnVtYmVyIHwgbnVsbCxcclxuKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgY29uc3QgbGl2ZSA9IGdldFZlZ2V0YXRpb25PdmVybGF5Q29udGV4dCgpO1xyXG4gIGNvbnN0IGRhdGUgPSBTdHJpbmcobGl2ZS5sYXN0RGF0ZSB8fCBcIlwiKS50cmltKCk7XHJcbiAgaWYgKCFkYXRlIHx8IHJlZ2lvbklkID09IG51bGwpIHJldHVybiBudWxsO1xyXG4gIGlmIChsaXZlLmxhc3REYXRlUmVnaW9uSWQgIT0gbnVsbCAmJiBsaXZlLmxhc3REYXRlUmVnaW9uSWQgIT09IHJlZ2lvbklkKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgaWYgKFxyXG4gICAgeWVhciAhPSBudWxsICYmXHJcbiAgICBsaXZlLmxhc3REYXRlWWVhciAhPSBudWxsICYmXHJcbiAgICBsaXZlLmxhc3REYXRlWWVhciAhPT0geWVhclxyXG4gICkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHJldHVybiBkYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhblVuaXF1ZWlkKHVuaXF1ZWlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBTdHJpbmcodW5pcXVlaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50cmltKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaXJlLWFuZC1mb3JnZXQ6IHJlc29sdmUgYSBzZXJ2YWJsZSByYXN0ZXJfZGF0ZSAoY3JvcCBzZWFzb24gKyBpbWFnZXJ5KSBhbmRcclxuICogd2FybSB0aGUgVElGRiBjYWNoZS4gRGVkdXBlZCB3aXRoIEdyYWZmJ3MgZWFybHktb3ZlcmxheSB3YWxrIHNvIHRhYmxlIGNsaWNrc1xyXG4gKiBkbyBub3Qgc3RhY2sgc2VxdWVudGlhbCA0MDAgY2FzY2FkZXMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlZmV0Y2hWZWdldGF0aW9uT3ZlcmxheUZvclVuaXF1ZWlkKFxyXG4gIHVuaXF1ZWlkOiBzdHJpbmcsXHJcbiAgb3B0cz86IHtcclxuICAgIHJlZ2lvbklkPzogbnVtYmVyO1xyXG4gICAgeWVhcj86IG51bWJlcjtcclxuICAgIHJhc3RlckRhdGU/OiBzdHJpbmcgfCBudWxsO1xyXG4gICAgaW5kaWNlVHlwZT86IFZlZ2V0YXRpb25JbmRpY2VUeXBlO1xyXG4gICAgY3JvcElkPzogbnVtYmVyIHwgbnVsbDtcclxuICAgIGRhdGVzPzogc3RyaW5nW10gfCBudWxsO1xyXG4gIH0sXHJcbik6IHZvaWQge1xyXG4gIGNvbnN0IGlkID0gY2xlYW5VbmlxdWVpZCh1bmlxdWVpZCk7XHJcbiAgaWYgKCFpZCkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBsaXZlID0gZ2V0VmVnZXRhdGlvbk92ZXJsYXlDb250ZXh0KCk7XHJcbiAgY29uc3QgcmVnaW9uSWQgPSBvcHRzPy5yZWdpb25JZCA/PyBsaXZlLnJlZ2lvbklkO1xyXG4gIGNvbnN0IHllYXIgPSBvcHRzPy55ZWFyID8/IGxpdmUueWVhcjtcclxuICBjb25zdCBjcm9wSWQgPSBvcHRzPy5jcm9wSWQgPz8gbnVsbDtcclxuICBjb25zdCBpbmRpY2VUeXBlID0gKG9wdHM/LmluZGljZVR5cGUgfHxcclxuICAgIGxpdmUubGFzdEluZGV4IHx8XHJcbiAgICBcIm5kdmlcIikgYXMgVmVnZXRhdGlvbkluZGljZVR5cGU7XHJcbiAgaWYgKHJlZ2lvbklkID09IG51bGwgfHwgIU51bWJlci5pc0Zpbml0ZShyZWdpb25JZCkpIHJldHVybjtcclxuICBpZiAoeWVhciA9PSBudWxsIHx8ICFOdW1iZXIuaXNGaW5pdGUoeWVhcikpIHJldHVybjtcclxuXHJcbiAgdm9pZCByZXNvbHZlRXhwb3J0SW1hZ2VXaXRoRGF0ZVdhbGsoe1xyXG4gICAgdW5pcXVlaWQ6IGlkLFxyXG4gICAgcmVnaW9uSWQsXHJcbiAgICB5ZWFyLFxyXG4gICAgY3JvcElkLFxyXG4gICAgaW5kaWNlVHlwZSxcclxuICAgIGRhdGVzOiBvcHRzPy5kYXRlcyxcclxuICB9KVxyXG4gICAgLnRoZW4oKGhpdCkgPT4ge1xyXG4gICAgICBpZiAoIWhpdCkgcmV0dXJuO1xyXG4gICAgICBzZXRWZWdldGF0aW9uT3ZlcmxheUNvbnRleHQoe1xyXG4gICAgICAgIHJlZ2lvbklkLFxyXG4gICAgICAgIHllYXIsXHJcbiAgICAgICAgbGFzdERhdGU6IGhpdC5kYXRlLFxyXG4gICAgICAgIGxhc3REYXRlUmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgIGxhc3REYXRlWWVhcjogeWVhcixcclxuICAgICAgICBsYXN0SW5kZXg6IGluZGljZVR5cGUsXHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaCgoKSA9PiB7XHJcbiAgICAgIC8qIHdhcm0gb25seSDigJQgR3JhZmYgaGFuZGxlcyBlcnJvcnMgKi9cclxuICAgIH0pO1xyXG59XHJcbiIsIi8qKiBTaGFyZWQgdmVnZXRhdGlvbiBpbmRleCBsZWdlbmQgY29uZmlnIGZvciBHcmFmZiBncmFwaC90YWJsZSB2aWV3cy4gKi9cbmV4cG9ydCB0eXBlIEdyYWZmSW5kZXhLZXkgPSBcIm5kdmlcIiB8IFwic2F2aVwiIHwgXCJydmlcIiB8IFwiY2lcIiB8IFwiZXZpXCIgfCBcIm5kd2lcIjtcblxuZXhwb3J0IGludGVyZmFjZSBHcmFmZkluZGV4QnV0dG9uIHtcbiAga2V5OiBHcmFmZkluZGV4S2V5O1xuICBsYWJlbDogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgR1JBRkZfSU5ERVhfQlVUVE9OUzogR3JhZmZJbmRleEJ1dHRvbltdID0gW1xuICB7IGtleTogXCJuZHZpXCIsIGxhYmVsOiBcIk5EVklcIiwgY29sb3I6IFwiIzAwZDA4NFwiIH0sXG4gIHsga2V5OiBcInNhdmlcIiwgbGFiZWw6IFwiU0FWSVwiLCBjb2xvcjogXCIjN2FhNWZmXCIgfSxcbiAgeyBrZXk6IFwicnZpXCIsIGxhYmVsOiBcIlJWSVwiLCBjb2xvcjogXCIjZmZiMzQ3XCIgfSxcbiAgeyBrZXk6IFwiY2lcIiwgbGFiZWw6IFwiQ0lcIiwgY29sb3I6IFwiI2M3OGJmZlwiIH0sXG4gIHsga2V5OiBcImV2aVwiLCBsYWJlbDogXCJFVklcIiwgY29sb3I6IFwiI2ZmNGQ4ZFwiIH0sXG4gIHsga2V5OiBcIm5kd2lcIiwgbGFiZWw6IFwiTkRXSVwiLCBjb2xvcjogXCIjMmVjNGYxXCIgfSxcbl07XG5cbmV4cG9ydCBjb25zdCBHUkFGRl9JTkRFWF9PUkRFUjogR3JhZmZJbmRleEtleVtdID0gR1JBRkZfSU5ERVhfQlVUVE9OUy5tYXAoXG4gIChpdGVtKSA9PiBpdGVtLmtleSxcbik7XG5cbi8qKiBSZXB1YmxpYyByZWdpb25hbCB0aW1lc2VyaWVzIEFWRyBmaWVsZCBhbGxvdy1saXN0LiAqL1xuZXhwb3J0IGNvbnN0IFJFUFVCTElDX1RJTUVTRVJJRVNfSU5ERVhfRklFTERTID0gW1xuICBcIm5kdmlcIixcbiAgXCJzYXZpXCIsXG4gIFwiZXZpXCIsXG4gIFwicnZpXCIsXG4gIFwiY2lcIixcbiAgXCJuZHdpXCIsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBSZXB1YmxpY1RpbWVzZXJpZXNJbmRleEZpZWxkID1cbiAgKHR5cGVvZiBSRVBVQkxJQ19USU1FU0VSSUVTX0lOREVYX0ZJRUxEUylbbnVtYmVyXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVwdWJsaWNUaW1lc2VyaWVzSW5kZXhGaWVsZChcbiAgdmFsdWU6IHN0cmluZyxcbik6IHZhbHVlIGlzIFJlcHVibGljVGltZXNlcmllc0luZGV4RmllbGQge1xuICByZXR1cm4gKFJFUFVCTElDX1RJTUVTRVJJRVNfSU5ERVhfRklFTERTIGFzIHJlYWRvbmx5IHN0cmluZ1tdKS5pbmNsdWRlcyhcbiAgICB2YWx1ZSxcbiAgKTtcbn1cbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTMgM3YxNmEyIDIgMCAwIDAgMiAyaDE2XCIsIGtleTogXCJjMjRpNDhcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwibTE5IDktNSA1LTQtNC0zIDNcIiwga2V5OiBcIjJvc2g5aVwiIH1dXG5dO1xuY29uc3QgQ2hhcnRMaW5lID0gY3JlYXRlTHVjaWRlSWNvbihcImNoYXJ0LWxpbmVcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIENoYXJ0TGluZSBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jaGFydC1saW5lLm1qcy5tYXBcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==