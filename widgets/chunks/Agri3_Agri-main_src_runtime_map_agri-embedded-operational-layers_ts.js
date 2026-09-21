"use strict";
(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agri-main_src_runtime_map_agri-embedded-operational-layers_ts"],{

/***/ "./your-extensions/widgets/Agri3/Agri-main/src/runtime/map/agri-embedded-operational-layers.ts":
/*!*****************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agri-main/src/runtime/map/agri-embedded-operational-layers.ts ***!
  \*****************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   injectUseDataSourcesOntoMap: () => (/* binding */ injectUseDataSourcesOntoMap)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-arcgis */ "jimu-arcgis");
/* harmony import */ var _embedded_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../embedded/shared/evapo-data-source-engine */ "./your-extensions/widgets/Agri3/Agri-main/src/embedded/shared/evapo-data-source-engine.ts");
/* harmony import */ var _embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../embedded/shared/feature-layer-data */ "./your-extensions/widgets/Agri3/Agri-main/src/embedded/shared/feature-layer-data.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




/** Prevent overlapping inject runs (Localization + map mount race). */
let injectInFlight = null;
let lastInjectAt = 0;
const INJECT_MIN_GAP_MS = 1500;
function collectMapUrls(map) {
    var _a, _b, _c, _d;
    const urls = new Set();
    const layers = ((_b = (_a = map.allLayers) === null || _a === void 0 ? void 0 : _a.toArray) === null || _b === void 0 ? void 0 : _b.call(_a)) || ((_d = (_c = map.layers) === null || _c === void 0 ? void 0 : _c.toArray) === null || _d === void 0 ? void 0 : _d.call(_c)) || [];
    for (const layer of layers) {
        const url = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.normalizeQueryableLayerUrl)(String((layer === null || layer === void 0 ? void 0 : layer.url) || ""));
        if (url)
            urls.add(url);
        const queryable = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.getQueryableLayer)(layer);
        const qUrl = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.normalizeQueryableLayerUrl)(String((queryable === null || queryable === void 0 ? void 0 : queryable.url) || ""));
        if (qUrl)
            urls.add(qUrl);
    }
    return urls;
}
function layerAlreadyOnMap(map, layer) {
    var _a, _b, _c, _d;
    if (!layer)
        return false;
    const url = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.normalizeQueryableLayerUrl)(String((layer === null || layer === void 0 ? void 0 : layer.url) || ""));
    if (url && (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.findQueryableLayerOnMapByUrl)(map, url))
        return true;
    try {
        const layers = ((_b = (_a = map.allLayers) === null || _a === void 0 ? void 0 : _a.toArray) === null || _b === void 0 ? void 0 : _b.call(_a)) || ((_d = (_c = map.layers) === null || _c === void 0 ? void 0 : _c.toArray) === null || _d === void 0 ? void 0 : _d.call(_c)) || [];
        return layers.some((ly) => ly === layer || ((ly === null || ly === void 0 ? void 0 : ly.id) != null && ly.id === layer.id));
    }
    catch (_e) {
        return false;
    }
}
function resolveLayerTitle(layer, ds, useDs, dsId) {
    var _a;
    return (String((layer === null || layer === void 0 ? void 0 : layer.title) ||
        ((_a = ds === null || ds === void 0 ? void 0 : ds.getLabel) === null || _a === void 0 ? void 0 : _a.call(ds)) ||
        (ds === null || ds === void 0 ? void 0 : ds.label) ||
        (useDs === null || useDs === void 0 ? void 0 : useDs.label) ||
        dsId).trim() || dsId);
}
function isMapServerRootUrl(url) {
    return (/\/MapServer\/?$/i.test(url) ||
        (/\/MapServer/i.test(url) && !/\/MapServer\/\d+/i.test(url)));
}
/**
 * Adds already-created builder DS layers onto the embedded MapView.
 *
 * IMPORTANT: never call createDataSourceByUseDataSource here — that freezes the
 * app when dozens of agri year layers are selected. DataSourceComponents in
 * Localization create the DS instances; we only clone ready ones onto the map.
 */
function injectUseDataSourcesOntoMap(map, useDataSources) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!map)
            return 0;
        const now = Date.now();
        if (injectInFlight)
            return injectInFlight;
        if (now - lastInjectAt < INJECT_MIN_GAP_MS)
            return 0;
        injectInFlight = (() => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const useDss = (0,_embedded_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_2__.toPlainArray)(useDataSources).filter((ds) => ds === null || ds === void 0 ? void 0 : ds.dataSourceId);
            if (!useDss.length)
                return 0;
            const [FeatureLayer, MapImageLayer] = yield (0,jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__.loadArcGISJSAPIModules)([
                "esri/layers/FeatureLayer",
                "esri/layers/MapImageLayer",
            ]);
            const existingUrls = collectMapUrls(map);
            const dsMgr = jimu_core__WEBPACK_IMPORTED_MODULE_0__.DataSourceManager.getInstance();
            let added = 0;
            let readyDs = 0;
            let processed = 0;
            for (const useDs of useDss) {
                const dsId = String(useDs.dataSourceId || "");
                if (!dsId)
                    continue;
                try {
                    // Only use DS instances that already exist — never create them here.
                    const ds = dsMgr.getDataSource(dsId);
                    if (!ds)
                        continue;
                    readyDs += 1;
                    processed += 1;
                    // Yield so React can paint / charts stay responsive.
                    if (processed % 3 === 0) {
                        yield new Promise((r) => setTimeout(r, 0));
                    }
                    // Prefer URL from DS json — avoid getLayer() when possible (can hang).
                    let url = String((ds === null || ds === void 0 ? void 0 : ds.url) ||
                        ((_a = ds === null || ds === void 0 ? void 0 : ds.layer) === null || _a === void 0 ? void 0 : _a.url) ||
                        ((_c = (_b = ds === null || ds === void 0 ? void 0 : ds.getDataSourceJson) === null || _b === void 0 ? void 0 : _b.call(ds)) === null || _c === void 0 ? void 0 : _c.url) ||
                        (useDs === null || useDs === void 0 ? void 0 : useDs.url) ||
                        "").trim();
                    let sourceLayer = null;
                    if (!url && typeof ds.getLayer === "function") {
                        try {
                            sourceLayer = yield ds.getLayer();
                            url = String((sourceLayer === null || sourceLayer === void 0 ? void 0 : sourceLayer.url) || "").trim();
                        }
                        catch (_j) {
                            sourceLayer = null;
                        }
                    }
                    const normUrl = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.normalizeQueryableLayerUrl)(url);
                    if (normUrl && existingUrls.has(normUrl))
                        continue;
                    if (sourceLayer && layerAlreadyOnMap(map, sourceLayer))
                        continue;
                    const title = resolveLayerTitle(sourceLayer, ds, useDs, dsId);
                    let layer = null;
                    if (url) {
                        layer = isMapServerRootUrl(url)
                            ? new MapImageLayer({ url, title, visible: false })
                            : new FeatureLayer({
                                url,
                                title,
                                outFields: ["*"],
                                visible: false,
                            });
                    }
                    else if (sourceLayer && !sourceLayer.parent) {
                        layer = sourceLayer;
                        try {
                            if (!layer.title)
                                layer.title = title;
                            layer.visible = false;
                        }
                        catch (_k) {
                            /* ignore */
                        }
                    }
                    if (!layer)
                        continue;
                    if (layerAlreadyOnMap(map, layer))
                        continue;
                    // Do not await layer.load() — that blocks UI when adding many layers.
                    map.add(layer);
                    added += 1;
                    if (normUrl)
                        existingUrls.add(normUrl);
                    const qUrl = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.normalizeQueryableLayerUrl)(String(((_d = (0,_embedded_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_3__.getQueryableLayer)(layer)) === null || _d === void 0 ? void 0 : _d.url) || ""));
                    if (qUrl)
                        existingUrls.add(qUrl);
                }
                catch (_l) {
                    /* skip bad DS */
                }
            }
            lastInjectAt = Date.now();
            try {
                // eslint-disable-next-line no-console
                console.log(`[AgriEmbeddedLayers] inject done — added=${added}`, {
                    requested: useDss.length,
                    readyDs,
                    mapLayerCount: (_h = (_f = (_e = map.allLayers) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : (_g = map.layers) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0,
                });
            }
            catch (_m) {
                /* ignore */
            }
            return added;
        }))().finally(() => {
            injectInFlight = null;
        });
        return injectInFlight;
    });
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyaS1tYWluX3NyY19ydW50aW1lX21hcF9hZ3JpLWVtYmVkZGVkLW9wZXJhdGlvbmFsLWxheWVyc190cy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUE4QztBQUNPO0FBQ3lCO0FBSzVCO0FBRWxELHVFQUF1RTtBQUN2RSxJQUFJLGNBQWMsR0FBMkIsSUFBSSxDQUFDO0FBQ2xELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQUNyQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUUvQixTQUFTLGNBQWMsQ0FBQyxHQUFlOztJQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQy9CLE1BQU0sTUFBTSxHQUNWLGFBQUMsR0FBVyxDQUFDLFNBQVMsMENBQUUsT0FBTyxrREFBSSxNQUFJLGVBQUcsQ0FBQyxNQUFNLDBDQUFFLE9BQU8sa0RBQUksS0FBSSxFQUFFLENBQUM7SUFDdkUsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixNQUFNLEdBQUcsR0FBRywrRkFBMEIsQ0FBQyxNQUFNLENBQUMsTUFBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEdBQUcsS0FBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksR0FBRztZQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsTUFBTSxTQUFTLEdBQUcsc0ZBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxJQUFJLEdBQUcsK0ZBQTBCLENBQUMsTUFBTSxDQUFDLFVBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxHQUFHLEtBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNk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QUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQLFlBQVk7WUFDZCxDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDLEVBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDaEIsY0FBYyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7Q0FBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JpLW1haW4vc3JjL3J1bnRpbWUvbWFwL2FncmktZW1iZWRkZWQtb3BlcmF0aW9uYWwtbGF5ZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFTb3VyY2VNYW5hZ2VyIH0gZnJvbSBcImppbXUtY29yZVwiO1xuaW1wb3J0IHsgbG9hZEFyY0dJU0pTQVBJTW9kdWxlcyB9IGZyb20gXCJqaW11LWFyY2dpc1wiO1xuaW1wb3J0IHsgdG9QbGFpbkFycmF5IH0gZnJvbSBcIi4uLy4uL2VtYmVkZGVkL3NoYXJlZC9ldmFwby1kYXRhLXNvdXJjZS1lbmdpbmVcIjtcbmltcG9ydCB7XG4gIGZpbmRRdWVyeWFibGVMYXllck9uTWFwQnlVcmwsXG4gIGdldFF1ZXJ5YWJsZUxheWVyLFxuICBub3JtYWxpemVRdWVyeWFibGVMYXllclVybCxcbn0gZnJvbSBcIi4uLy4uL2VtYmVkZGVkL3NoYXJlZC9mZWF0dXJlLWxheWVyLWRhdGFcIjtcblxuLyoqIFByZXZlbnQgb3ZlcmxhcHBpbmcgaW5qZWN0IHJ1bnMgKExvY2FsaXphdGlvbiArIG1hcCBtb3VudCByYWNlKS4gKi9cbmxldCBpbmplY3RJbkZsaWdodDogUHJvbWlzZTxudW1iZXI+IHwgbnVsbCA9IG51bGw7XG5sZXQgbGFzdEluamVjdEF0ID0gMDtcbmNvbnN0IElOSkVDVF9NSU5fR0FQX01TID0gMTUwMDtcblxuZnVuY3Rpb24gY29sbGVjdE1hcFVybHMobWFwOiBfX2VzcmkuTWFwKTogU2V0PHN0cmluZz4ge1xuICBjb25zdCB1cmxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IGxheWVyczogYW55W10gPVxuICAgIChtYXAgYXMgYW55KS5hbGxMYXllcnM/LnRvQXJyYXk/LigpIHx8IG1hcC5sYXllcnM/LnRvQXJyYXk/LigpIHx8IFtdO1xuICBmb3IgKGNvbnN0IGxheWVyIG9mIGxheWVycykge1xuICAgIGNvbnN0IHVybCA9IG5vcm1hbGl6ZVF1ZXJ5YWJsZUxheWVyVXJsKFN0cmluZyhsYXllcj8udXJsIHx8IFwiXCIpKTtcbiAgICBpZiAodXJsKSB1cmxzLmFkZCh1cmwpO1xuICAgIGNvbnN0IHF1ZXJ5YWJsZSA9IGdldFF1ZXJ5YWJsZUxheWVyKGxheWVyKTtcbiAgICBjb25zdCBxVXJsID0gbm9ybWFsaXplUXVlcnlhYmxlTGF5ZXJVcmwoU3RyaW5nKHF1ZXJ5YWJsZT8udXJsIHx8IFwiXCIpKTtcbiAgICBpZiAocVVybCkgdXJscy5hZGQocVVybCk7XG4gIH1cbiAgcmV0dXJuIHVybHM7XG59XG5cbmZ1bmN0aW9uIGxheWVyQWxyZWFkeU9uTWFwKG1hcDogX19lc3JpLk1hcCwgbGF5ZXI6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoIWxheWVyKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHVybCA9IG5vcm1hbGl6ZVF1ZXJ5YWJsZUxheWVyVXJsKFN0cmluZyhsYXllcj8udXJsIHx8IFwiXCIpKTtcbiAgaWYgKHVybCAmJiBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5VXJsKG1hcCwgdXJsKSkgcmV0dXJuIHRydWU7XG4gIHRyeSB7XG4gICAgY29uc3QgbGF5ZXJzOiBhbnlbXSA9XG4gICAgICAobWFwIGFzIGFueSkuYWxsTGF5ZXJzPy50b0FycmF5Py4oKSB8fCBtYXAubGF5ZXJzPy50b0FycmF5Py4oKSB8fCBbXTtcbiAgICByZXR1cm4gbGF5ZXJzLnNvbWUoXG4gICAgICAobHkpID0+IGx5ID09PSBsYXllciB8fCAobHk/LmlkICE9IG51bGwgJiYgbHkuaWQgPT09IGxheWVyLmlkKSxcbiAgICApO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUxheWVyVGl0bGUobGF5ZXI6IGFueSwgZHM6IGFueSwgdXNlRHM6IGFueSwgZHNJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIChcbiAgICBTdHJpbmcoXG4gICAgICBsYXllcj8udGl0bGUgfHxcbiAgICAgICAgZHM/LmdldExhYmVsPy4oKSB8fFxuICAgICAgICBkcz8ubGFiZWwgfHxcbiAgICAgICAgdXNlRHM/LmxhYmVsIHx8XG4gICAgICAgIGRzSWQsXG4gICAgKS50cmltKCkgfHwgZHNJZFxuICApO1xufVxuXG5mdW5jdGlvbiBpc01hcFNlcnZlclJvb3RVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAvXFwvTWFwU2VydmVyXFwvPyQvaS50ZXN0KHVybCkgfHxcbiAgICAoL1xcL01hcFNlcnZlci9pLnRlc3QodXJsKSAmJiAhL1xcL01hcFNlcnZlclxcL1xcZCsvaS50ZXN0KHVybCkpXG4gICk7XG59XG5cbi8qKlxuICogQWRkcyBhbHJlYWR5LWNyZWF0ZWQgYnVpbGRlciBEUyBsYXllcnMgb250byB0aGUgZW1iZWRkZWQgTWFwVmlldy5cbiAqXG4gKiBJTVBPUlRBTlQ6IG5ldmVyIGNhbGwgY3JlYXRlRGF0YVNvdXJjZUJ5VXNlRGF0YVNvdXJjZSBoZXJlIOKAlCB0aGF0IGZyZWV6ZXMgdGhlXG4gKiBhcHAgd2hlbiBkb3plbnMgb2YgYWdyaSB5ZWFyIGxheWVycyBhcmUgc2VsZWN0ZWQuIERhdGFTb3VyY2VDb21wb25lbnRzIGluXG4gKiBMb2NhbGl6YXRpb24gY3JlYXRlIHRoZSBEUyBpbnN0YW5jZXM7IHdlIG9ubHkgY2xvbmUgcmVhZHkgb25lcyBvbnRvIHRoZSBtYXAuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbmplY3RVc2VEYXRhU291cmNlc09udG9NYXAoXG4gIG1hcDogX19lc3JpLk1hcCxcbiAgdXNlRGF0YVNvdXJjZXM6IHVua25vd24sXG4pOiBQcm9taXNlPG51bWJlcj4ge1xuICBpZiAoIW1hcCkgcmV0dXJuIDA7XG5cbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgaWYgKGluamVjdEluRmxpZ2h0KSByZXR1cm4gaW5qZWN0SW5GbGlnaHQ7XG4gIGlmIChub3cgLSBsYXN0SW5qZWN0QXQgPCBJTkpFQ1RfTUlOX0dBUF9NUykgcmV0dXJuIDA7XG5cbiAgaW5qZWN0SW5GbGlnaHQgPSAoYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHVzZURzcyA9IHRvUGxhaW5BcnJheTxhbnk+KHVzZURhdGFTb3VyY2VzKS5maWx0ZXIoXG4gICAgICAoZHMpID0+IGRzPy5kYXRhU291cmNlSWQsXG4gICAgKTtcbiAgICBpZiAoIXVzZURzcy5sZW5ndGgpIHJldHVybiAwO1xuXG4gICAgY29uc3QgW0ZlYXR1cmVMYXllciwgTWFwSW1hZ2VMYXllcl0gPSBhd2FpdCBsb2FkQXJjR0lTSlNBUElNb2R1bGVzKFtcbiAgICAgIFwiZXNyaS9sYXllcnMvRmVhdHVyZUxheWVyXCIsXG4gICAgICBcImVzcmkvbGF5ZXJzL01hcEltYWdlTGF5ZXJcIixcbiAgICBdKTtcblxuICAgIGNvbnN0IGV4aXN0aW5nVXJscyA9IGNvbGxlY3RNYXBVcmxzKG1hcCk7XG4gICAgY29uc3QgZHNNZ3IgPSBEYXRhU291cmNlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgIGxldCBhZGRlZCA9IDA7XG4gICAgbGV0IHJlYWR5RHMgPSAwO1xuICAgIGxldCBwcm9jZXNzZWQgPSAwO1xuXG4gICAgZm9yIChjb25zdCB1c2VEcyBvZiB1c2VEc3MpIHtcbiAgICAgIGNvbnN0IGRzSWQgPSBTdHJpbmcodXNlRHMuZGF0YVNvdXJjZUlkIHx8IFwiXCIpO1xuICAgICAgaWYgKCFkc0lkKSBjb250aW51ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gT25seSB1c2UgRFMgaW5zdGFuY2VzIHRoYXQgYWxyZWFkeSBleGlzdCDigJQgbmV2ZXIgY3JlYXRlIHRoZW0gaGVyZS5cbiAgICAgICAgY29uc3QgZHM6IGFueSA9IGRzTWdyLmdldERhdGFTb3VyY2UoZHNJZCk7XG4gICAgICAgIGlmICghZHMpIGNvbnRpbnVlO1xuICAgICAgICByZWFkeURzICs9IDE7XG4gICAgICAgIHByb2Nlc3NlZCArPSAxO1xuXG4gICAgICAgIC8vIFlpZWxkIHNvIFJlYWN0IGNhbiBwYWludCAvIGNoYXJ0cyBzdGF5IHJlc3BvbnNpdmUuXG4gICAgICAgIGlmIChwcm9jZXNzZWQgJSAzID09PSAwKSB7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJlZmVyIFVSTCBmcm9tIERTIGpzb24g4oCUIGF2b2lkIGdldExheWVyKCkgd2hlbiBwb3NzaWJsZSAoY2FuIGhhbmcpLlxuICAgICAgICBsZXQgdXJsID0gU3RyaW5nKFxuICAgICAgICAgIGRzPy51cmwgfHxcbiAgICAgICAgICAgIGRzPy5sYXllcj8udXJsIHx8XG4gICAgICAgICAgICAoZHMgYXMgYW55KT8uZ2V0RGF0YVNvdXJjZUpzb24/LigpPy51cmwgfHxcbiAgICAgICAgICAgIHVzZURzPy51cmwgfHxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICkudHJpbSgpO1xuXG4gICAgICAgIGxldCBzb3VyY2VMYXllcjogYW55ID0gbnVsbDtcbiAgICAgICAgaWYgKCF1cmwgJiYgdHlwZW9mIGRzLmdldExheWVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgc291cmNlTGF5ZXIgPSBhd2FpdCBkcy5nZXRMYXllcigpO1xuICAgICAgICAgICAgdXJsID0gU3RyaW5nKHNvdXJjZUxheWVyPy51cmwgfHwgXCJcIikudHJpbSgpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgc291cmNlTGF5ZXIgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vcm1VcmwgPSBub3JtYWxpemVRdWVyeWFibGVMYXllclVybCh1cmwpO1xuICAgICAgICBpZiAobm9ybVVybCAmJiBleGlzdGluZ1VybHMuaGFzKG5vcm1VcmwpKSBjb250aW51ZTtcbiAgICAgICAgaWYgKHNvdXJjZUxheWVyICYmIGxheWVyQWxyZWFkeU9uTWFwKG1hcCwgc291cmNlTGF5ZXIpKSBjb250aW51ZTtcblxuICAgICAgICBjb25zdCB0aXRsZSA9IHJlc29sdmVMYXllclRpdGxlKHNvdXJjZUxheWVyLCBkcywgdXNlRHMsIGRzSWQpO1xuXG4gICAgICAgIGxldCBsYXllcjogYW55ID0gbnVsbDtcbiAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgIGxheWVyID0gaXNNYXBTZXJ2ZXJSb290VXJsKHVybClcbiAgICAgICAgICAgID8gbmV3IE1hcEltYWdlTGF5ZXIoeyB1cmwsIHRpdGxlLCB2aXNpYmxlOiBmYWxzZSB9KVxuICAgICAgICAgICAgOiBuZXcgRmVhdHVyZUxheWVyKHtcbiAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgb3V0RmllbGRzOiBbXCIqXCJdLFxuICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2VMYXllciAmJiAhKHNvdXJjZUxheWVyIGFzIGFueSkucGFyZW50KSB7XG4gICAgICAgICAgbGF5ZXIgPSBzb3VyY2VMYXllcjtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFsYXllci50aXRsZSkgbGF5ZXIudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgICAgIGxheWVyLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGF5ZXIpIGNvbnRpbnVlO1xuICAgICAgICBpZiAobGF5ZXJBbHJlYWR5T25NYXAobWFwLCBsYXllcikpIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIERvIG5vdCBhd2FpdCBsYXllci5sb2FkKCkg4oCUIHRoYXQgYmxvY2tzIFVJIHdoZW4gYWRkaW5nIG1hbnkgbGF5ZXJzLlxuICAgICAgICBtYXAuYWRkKGxheWVyKTtcbiAgICAgICAgYWRkZWQgKz0gMTtcbiAgICAgICAgaWYgKG5vcm1VcmwpIGV4aXN0aW5nVXJscy5hZGQobm9ybVVybCk7XG4gICAgICAgIGNvbnN0IHFVcmwgPSBub3JtYWxpemVRdWVyeWFibGVMYXllclVybChcbiAgICAgICAgICBTdHJpbmcoZ2V0UXVlcnlhYmxlTGF5ZXIobGF5ZXIpPy51cmwgfHwgXCJcIiksXG4gICAgICAgICk7XG4gICAgICAgIGlmIChxVXJsKSBleGlzdGluZ1VybHMuYWRkKHFVcmwpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qIHNraXAgYmFkIERTICovXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdEluamVjdEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0cnkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUubG9nKGBbQWdyaUVtYmVkZGVkTGF5ZXJzXSBpbmplY3QgZG9uZSDigJQgYWRkZWQ9JHthZGRlZH1gLCB7XG4gICAgICAgIHJlcXVlc3RlZDogdXNlRHNzLmxlbmd0aCxcbiAgICAgICAgcmVhZHlEcyxcbiAgICAgICAgbWFwTGF5ZXJDb3VudDpcbiAgICAgICAgICAobWFwIGFzIGFueSkuYWxsTGF5ZXJzPy5sZW5ndGggPz8gbWFwLmxheWVycz8ubGVuZ3RoID8/IDAsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGlnbm9yZSAqL1xuICAgIH1cblxuICAgIHJldHVybiBhZGRlZDtcbiAgfSkoKS5maW5hbGx5KCgpID0+IHtcbiAgICBpbmplY3RJbkZsaWdodCA9IG51bGw7XG4gIH0pO1xuXG4gIHJldHVybiBpbmplY3RJbkZsaWdodDtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==