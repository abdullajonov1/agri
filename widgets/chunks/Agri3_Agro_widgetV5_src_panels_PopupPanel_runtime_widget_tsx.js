"use strict";
(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agro_widgetV5_src_panels_PopupPanel_runtime_widget_tsx"],{

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/widget.tsx":
/*!**********************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/widget.tsx ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var esri_Graphic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! esri/Graphic */ "esri/Graphic");
/* harmony import */ var esri_layers_GraphicsLayer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! esri/layers/GraphicsLayer */ "esri/layers/GraphicsLayer");
/* harmony import */ var esri_geometry_Point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! esri/geometry/Point */ "esri/geometry/Point");
/* harmony import */ var esri_request__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! esri/request */ "esri/request");
/* harmony import */ var esri_symbols_SimpleFillSymbol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! esri/symbols/SimpleFillSymbol */ "esri/symbols/SimpleFillSymbol");
/* harmony import */ var esri_symbols_SimpleLineSymbol__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! esri/symbols/SimpleLineSymbol */ "esri/symbols/SimpleLineSymbol");
/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! jimu-arcgis */ "jimu-arcgis");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/chart-line.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/chart-column.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/sprout.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/calendar-days.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/inbox.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/chevron-up.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/pin.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/map-pin.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/x.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/settings-2.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/folder-open.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/paperclip.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/download.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.mjs");
/* harmony import */ var _gis_AgriHiddenConnectors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../gis/AgriHiddenConnectors */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/AgriHiddenConnectors.tsx");
/* harmony import */ var _gis_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../gis/agri-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-source-engine.ts");
/* harmony import */ var _gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../gis/agri-data-layer-roles */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-layer-roles.ts");
/* harmony import */ var _gis_agri_linked_map_layout__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../gis/agri-linked-map-layout */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-linked-map-layout.ts");
/* harmony import */ var _gis_agri_engine_registry__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../gis/agri-engine-registry */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-engine-registry.ts");
/* harmony import */ var _gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../gis/agri-map-click-debug */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-map-click-debug.ts");
/* harmony import */ var _GraffPanel_runtime_graff_graph_constants__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../GraffPanel/runtime/graff-graph-constants */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/GraffPanel/runtime/graff-graph-constants.ts");
/* harmony import */ var _popup_field_helpers__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./popup-field-helpers */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/popup-field-helpers.ts");
/* harmony import */ var _popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./popup-format-helpers */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/popup-format-helpers.ts");
/* harmony import */ var _gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../gis/feature-layer-data */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/feature-layer-data.ts");
/* harmony import */ var _gis_agri_vegetation_data_source__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../gis/agri-vegetation-data-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-vegetation-data-source.ts");
/* harmony import */ var _gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../gis/agri-table-data-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-table-data-source.ts");
/* harmony import */ var _data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../data/agri-filter-bus */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/data/agri-filter-bus.ts");
/* harmony import */ var _shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../shared/AgriChartLoader */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/AgriChartLoader.tsx");
/* harmony import */ var _gis_agri_vegetation_overlay_prefetch__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../gis/agri-vegetation-overlay-prefetch */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-vegetation-overlay-prefetch.ts");
/* harmony import */ var _gis_agri_polygon_api_source__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../gis/agri-polygon-api-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-polygon-api-source.ts");
/* harmony import */ var _messages__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./messages */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/messages.ts");
// Polygon Attribute Inspector (AgriPolygon refactor)
// ✅ UPDATED: supports MULTIPLE selected Feature Layers (e.g. yearly layers filtered by another widget)
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


























class AgriPolygon extends jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.PureComponent {
    getPopupWidth(view) {
        const margin = this.POPUP_MARGIN;
        let preferred = this.POPUP_WIDTH;
        if (this.isDashboardEmbedded()) {
            const root = document.querySelector(".agri-dashboard-v3") ||
                document.documentElement;
            const raw = getComputedStyle(root)
                .getPropertyValue("--agri-dashboard-popup-width")
                .trim();
            const parsed = Number.parseFloat(raw);
            if (Number.isFinite(parsed) && parsed > 0) {
                preferred = parsed;
            }
        }
        if (view) {
            const mapW = this.getMapAreaRect(view).width;
            return Math.max(220, Math.min(preferred, mapW - margin * 2));
        }
        return preferred;
    }
    getPinnedPopupHeight(view, topY) {
        const rect = this.getMapAreaRect(view);
        if (this.isDashboardEmbedded()) {
            const bottomInset = this.DASHBOARD_POPUP_VERTICAL_INSET;
            return Math.max(160, rect.bottom - bottomInset - topY);
        }
        const margin = this.POPUP_MARGIN;
        const mapBottom = this.getEffectiveMapBottom(view, margin);
        return Math.max(160, mapBottom - topY);
    }
    getPopupDimensions(view, pinned = false, position) {
        var _a;
        const width = this.getPopupWidth(view);
        if (pinned && view) {
            const topY = (_a = position === null || position === void 0 ? void 0 : position.y) !== null && _a !== void 0 ? _a : this.calculatePinnedPosition(view).y;
            const height = this.getPinnedPopupHeight(view, topY);
            return { width, height };
        }
        return { width, height: width };
    }
    constructor(props) {
        super(props);
        this._isMounted = false;
        this._unbindMasterFilter = null;
        this.themeObserver = null;
        this._clickHandle = null;
        /** Monotonic id so a slow/duplicate click path cannot close a newer popup. */
        this._clickGeneration = 0;
        this._popupRef = jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createRef();
        this._highlightLayer = null;
        this._highlightGraphic = null;
        this._highlightHaloGraphic = null;
        this._extentBeforeSelection = null;
        /** Currently inspected field uniqueid (map or table via hub). Same-id map click toggles off. */
        this._activeInspectedUniqueid = null;
        /** Last yil|viloyat|tuman from masterFilterChanged — geography move closes popup. */
        this._lastMasterGeoKey = "";
        this._isDraggingPopup = false;
        this._popupDragOffset = { x: 0, y: 0 };
        this._popupLayoutTimer = null;
        this._popupLayoutRaf = 0;
        this.mapAreaResizeObserver = null;
        this._featureQueryCacheTtlMs = 60 * 60 * 1000;
        this._featureQueryCache = new Map();
        /** Detached query clients keyed by service URL; never mutate live map sublayers. */
        this._queryOnlyLayers = new Map();
        this.mapViewFallbackTimer = null;
        this.mapInitRetryTimer = null;
        this.connectedMapViewId = "";
        this.mapInitRetryCount = 0;
        this.maxMapInitRetries = 12;
        this.mapClickBootstrapTimer = null;
        this.POPUP_WIDTH = 340;
        this.POPUP_MARGIN = 12;
        /** Match dashboard map overlays: 16px horizontal and 12px vertical inset. */
        this.DASHBOARD_POPUP_HORIZONTAL_INSET = 16;
        this.DASHBOARD_POPUP_VERTICAL_INSET = 12;
        /** Guards against a stale latest-indices response landing after a newer polygon selection. */
        this._latestIndicesRequestId = 0;
        this.getResolvedTheme = () => {
            var _a;
            const root = document.documentElement;
            const body = document.body;
            try {
                const savedTheme = localStorage.getItem("agri_v11_app_theme");
                if (savedTheme === "light")
                    return false;
                if (savedTheme === "dark")
                    return true;
            }
            catch (_b) {
                // ignore storage access issues
            }
            const isLight = root.classList.contains("light-theme") ||
                root.getAttribute("data-theme") === "light" ||
                body.classList.contains("light-theme");
            return (_a = (0,_messages__WEBPACK_IMPORTED_MODULE_24__.getInitialTheme)()) !== null && _a !== void 0 ? _a : !isLight;
        };
        /**
         * Off-map FeatureLayer client for a live map layer's URL. Every query in
         * the click chain must run against these detached clients: createQuery /
         * queryFeatures on a live MapImage Sublayer rehydrates it and can clear its
         * runtime definitionExpression, which makes the map export (and briefly
         * paint) every district's fields until the filter guard restores it.
         *
         * Shared helper also skips MapServer roots and Group Layer folders
         * ("Agri 2026 republic data") that FeatureLayer cannot load.
         */
        this.getDetachedQueryLayer = (layer) => __awaiter(this, void 0, void 0, function* () {
            if (!layer || (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isMapImageGroupSublayer)(layer))
                return null;
            const detached = yield (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getDetachedQueryLayerFor)(layer);
            if (!detached)
                return null;
            const url = String((layer === null || layer === void 0 ? void 0 : layer.url) || "").trim().replace(/\/+$/, "");
            if (url)
                this._queryOnlyLayers.set(url, detached);
            return detached;
        });
        this.tr = (key, params) => {
            return (0,_messages__WEBPACK_IMPORTED_MODULE_24__.t)(this.state.currentLang, key, params);
        };
        this.setupThemeObserver = () => {
            const root = document.documentElement;
            const body = document.body;
            this.themeObserver = new MutationObserver(() => {
                const isDarkTheme = this.getResolvedTheme();
                if (this._isMounted && isDarkTheme !== this.state.isDarkTheme) {
                    this.setState({ isDarkTheme });
                }
            });
            this.themeObserver.observe(root, {
                attributes: true,
                attributeFilter: ["class", "data-theme"],
            });
            this.themeObserver.observe(body, {
                attributes: true,
                attributeFilter: ["class"],
            });
        };
        this.handleThemeChange = (e) => {
            if (!this._isMounted)
                return;
            const detail = (e === null || e === void 0 ? void 0 : e.detail) || {};
            let isDarkTheme = this.getResolvedTheme();
            if (typeof detail.isDarkTheme === "boolean") {
                isDarkTheme = detail.isDarkTheme;
            }
            else if (typeof detail.theme === "string") {
                isDarkTheme = String(detail.theme).toLowerCase() !== "light";
            }
            if (isDarkTheme !== this.state.isDarkTheme) {
                this.setState({ isDarkTheme });
            }
        };
        this.handleLanguageChange = (e) => {
            var _a, _b, _c;
            if (!this._isMounted)
                return;
            const lang = ((_a = e === null || e === void 0 ? void 0 : e.detail) === null || _a === void 0 ? void 0 : _a.lang) || ((_b = e === null || e === void 0 ? void 0 : e.detail) === null || _b === void 0 ? void 0 : _b.language) || ((_c = e === null || e === void 0 ? void 0 : e.detail) === null || _c === void 0 ? void 0 : _c.code);
            const normalized = (0,_messages__WEBPACK_IMPORTED_MODULE_24__.normalizeLang)(lang);
            if (normalized !== this.state.currentLang) {
                this.setState({ currentLang: normalized });
            }
        };
        this.applyPopupPosition = (pos) => {
            if (this.popupPositionsEqual(this.state.popupPosition, pos))
                return;
            this.setState({ popupPosition: pos });
        };
        this.schedulePopupLayout = () => {
            if (this._isDraggingPopup)
                return;
            if (this._popupLayoutTimer)
                clearTimeout(this._popupLayoutTimer);
            this._popupLayoutTimer = setTimeout(() => {
                this._popupLayoutTimer = null;
                this.repositionPinnedIfNeeded();
            }, 48);
        };
        this.schedulePopupLayoutAfterContent = () => {
            if (this._popupLayoutRaf)
                cancelAnimationFrame(this._popupLayoutRaf);
            this._popupLayoutRaf = requestAnimationFrame(() => {
                this._popupLayoutRaf = requestAnimationFrame(() => {
                    this._popupLayoutRaf = 0;
                    this.repositionPinnedIfNeeded();
                });
            });
        };
        this.calculatePinnedPosition = (view) => {
            const rect = this.getMapAreaRect(view);
            const margin = this.POPUP_MARGIN;
            const popupWidth = this.getPopupWidth(view);
            if (this.isDashboardEmbedded()) {
                return {
                    x: rect.right - popupWidth - this.DASHBOARD_POPUP_HORIZONTAL_INSET,
                    y: rect.top + this.DASHBOARD_POPUP_VERTICAL_INSET,
                };
            }
            return {
                x: rect.right - popupWidth - margin,
                y: rect.top + margin,
            };
        };
        this.repositionPinnedIfNeeded = () => {
            var _a;
            if (!this._isMounted)
                return;
            if (!this.state.showPopup)
                return;
            if (this._isDraggingPopup)
                return;
            const view = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view;
            if (!view)
                return;
            if (this.state.pinToCorner) {
                const pos = this.calculatePinnedPosition(view);
                if (this.popupPositionsEqual(this.state.popupPosition, pos)) {
                    this.forceUpdate();
                }
                else {
                    this.setState({ popupPosition: pos });
                }
                return;
            }
            if (!this.state.popupPosition)
                return;
            const clamped = this.clampPopupToMapContainer(this.state.popupPosition, view);
            this.applyPopupPosition(clamped);
        };
        this.togglePinToCorner = () => {
            this.setState((prev) => {
                var _a;
                const next = !prev.pinToCorner;
                const view = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view;
                let pos = prev.popupPosition;
                if (next) {
                    if (view)
                        pos = this.calculatePinnedPosition(view);
                }
                else if (view && prev.clickScreenPoint) {
                    pos = this.calculatePopupPosition(prev.clickScreenPoint, view);
                }
                else if (view) {
                    const rect = view.container.getBoundingClientRect();
                    pos = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    };
                }
                return {
                    pinToCorner: next,
                    popupPosition: pos,
                    chartExpanded: next ? true : prev.chartExpanded,
                };
            }, () => {
                this.schedulePopupLayoutAfterContent();
                if (this.state.showPopup) {
                    this.broadcastPopupVisibility(true);
                }
            });
        };
        this.handleOutsideClick = (event) => {
            var _a, _b, _c, _d;
            if (!this.state.showPopup || !this._popupRef.current)
                return;
            // Collapsed chip stays until an empty-map deselect / geography reset.
            if (this.state.popupMinimized)
                return;
            const target = event.target;
            if (!target || this._popupRef.current.contains(target))
                return;
            const mapContainer = (_b = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view) === null || _b === void 0 ? void 0 : _b.container;
            if (mapContainer && mapContainer.contains(target))
                return;
            if (this.isDashboardEmbedded()) {
                const dashboardUi = (_d = (_c = target).closest) === null || _d === void 0 ? void 0 : _d.call(_c, ".agri-dashboard-v3, .agri-dashboard-crop-overlay, .agri-dashboard-header, .agri-dashboard-left-panel, .agri-dashboard-bottom-row, .agri-dashboard-widget-slot, .agri-dashboard-indicator-overlay, .agri-dashboard-date-index-overlay, .agri-v20-floating-overlay");
                if (dashboardUi)
                    return;
            }
            // Outside dashboard chrome → collapse instead of wiping selection.
            this.minimizePopup();
        };
        this.onPopupHeaderMouseDown = (e) => {
            // Allow normal behavior for controls inside header.
            const target = e.target;
            if (target === null || target === void 0 ? void 0 : target.closest("button, a, input, textarea, select"))
                return;
            if (e.button !== 0)
                return;
            const popupEl = this._popupRef.current;
            if (!popupEl)
                return;
            const rect = popupEl.getBoundingClientRect();
            this._isDraggingPopup = true;
            this._popupDragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            if (this.state.pinToCorner) {
                this.setState({ pinToCorner: false });
            }
            window.addEventListener("mousemove", this.onPopupDragMove);
            window.addEventListener("mouseup", this.onPopupDragEnd);
            e.preventDefault();
        };
        this.onPopupDragMove = (e) => {
            var _a;
            if (!this._isDraggingPopup || !this._isMounted)
                return;
            const view = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view;
            if (!view)
                return;
            const nextPos = {
                x: e.clientX - this._popupDragOffset.x,
                y: e.clientY - this._popupDragOffset.y,
            };
            const clamped = this.clampPopupToMapContainer(nextPos, view);
            this.applyPopupPosition(clamped);
        };
        this.onPopupDragEnd = () => {
            this._isDraggingPopup = false;
            window.removeEventListener("mousemove", this.onPopupDragMove);
            window.removeEventListener("mouseup", this.onPopupDragEnd);
        };
        /* ---------------- Highlight management ---------------- */
        this.setupHighlightLayer = (view) => {
            if (!this._highlightLayer) {
                this._highlightLayer = new esri_layers_GraphicsLayer__WEBPACK_IMPORTED_MODULE_1__["default"]({
                    id: "agri-polygon-highlight",
                    title: "Selected Polygon Highlight",
                });
                view.map.add(this._highlightLayer);
            }
        };
        this.highlightPolygon = (geometry) => {
            var _a, _b, _c, _d;
            if (!this._highlightLayer || !geometry)
                return;
            this.clearHighlight();
            // Drop Graff/table selection graphics so only one outline is visible.
            try {
                (_d = (_c = (_b = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view) === null || _b === void 0 ? void 0 : _b.graphics) === null || _c === void 0 ? void 0 : _c.removeAll) === null || _d === void 0 ? void 0 : _d.call(_c);
            }
            catch (_e) {
                /* ignore */
            }
            // Wide translucent halo plus a bright cyan core keeps the selected field
            // visible over both light and dark satellite imagery.
            const haloSymbol = new esri_symbols_SimpleFillSymbol__WEBPACK_IMPORTED_MODULE_4__["default"]({
                color: [0, 0, 0, 0],
                outline: new esri_symbols_SimpleLineSymbol__WEBPACK_IMPORTED_MODULE_5__["default"]({
                    color: [0, 229, 255, 0.32],
                    width: 9,
                    style: "solid",
                }),
            });
            const highlightSymbol = new esri_symbols_SimpleFillSymbol__WEBPACK_IMPORTED_MODULE_4__["default"]({
                color: [0, 0, 0, 0],
                outline: new esri_symbols_SimpleLineSymbol__WEBPACK_IMPORTED_MODULE_5__["default"]({
                    color: [128, 245, 255, 1],
                    width: 3,
                    style: "solid",
                }),
            });
            this._highlightHaloGraphic = new esri_Graphic__WEBPACK_IMPORTED_MODULE_0__["default"]({ geometry, symbol: haloSymbol });
            this._highlightGraphic = new esri_Graphic__WEBPACK_IMPORTED_MODULE_0__["default"]({ geometry, symbol: highlightSymbol });
            this._highlightLayer.addMany([
                this._highlightHaloGraphic,
                this._highlightGraphic,
            ]);
        };
        this.clearHighlight = () => {
            if (!this._highlightLayer)
                return;
            if (this._highlightHaloGraphic) {
                this._highlightLayer.remove(this._highlightHaloGraphic);
                this._highlightHaloGraphic = null;
            }
            if (this._highlightGraphic) {
                this._highlightLayer.remove(this._highlightGraphic);
                this._highlightGraphic = null;
            }
        };
        this.restoreExtentBeforeSelection = () => {
            var _a, _b, _c;
            const view = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view;
            const savedExtent = this._extentBeforeSelection;
            this._extentBeforeSelection = null;
            const zoomTo = ((_c = (_b = this.props.config) === null || _b === void 0 ? void 0 : _b.settings) === null || _c === void 0 ? void 0 : _c.zoomToSelection) !== false;
            if (!zoomTo || !savedExtent || !view)
                return;
            try {
                void view.goTo(savedExtent, { duration: 400 });
            }
            catch (_d) {
                /* ignore */
            }
        };
        this.cleanupHighlight = () => {
            var _a;
            if (this._highlightLayer) {
                const view = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view;
                if (view && view.map) {
                    view.map.remove(this._highlightLayer);
                }
                this._highlightLayer = null;
                this._highlightGraphic = null;
                this._highlightHaloGraphic = null;
            }
            this._extentBeforeSelection = null;
        };
        this.handleMapViewReady = (event) => {
            var _a;
            const mapWidgetId = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.mapWidgetId;
            const linked = this.getLinkedMapWidgetId();
            if (mapWidgetId && linked && mapWidgetId !== linked)
                return;
            this.scheduleMapViewFallback();
        };
        this.scheduleMapViewFallback = () => {
            var _a, _b;
            // Already have a live map view — do NOT re-enter onActiveViewChange
            // (that path setState → initializeMapConnection → scheduleMapViewFallback
            // and freezes the builder with React #185 when featureLayers stay empty).
            if ((_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view) {
                if (!((_b = this.state.featureLayers) === null || _b === void 0 ? void 0 : _b.length)) {
                    this.scheduleMapInitRetry(this.state.jimuMapView);
                }
                return;
            }
            const mapWidgetId = this.getLinkedMapWidgetId();
            const fromManager = this.getMapViewFromManager(mapWidgetId);
            if (fromManager === null || fromManager === void 0 ? void 0 : fromManager.view) {
                this.onActiveViewChange(fromManager);
                return;
            }
            if (!mapWidgetId)
                return;
            if (this.mapViewFallbackTimer)
                clearTimeout(this.mapViewFallbackTimer);
            this.mapViewFallbackTimer = setTimeout(() => {
                var _a;
                this.mapViewFallbackTimer = null;
                if (!this._isMounted)
                    return;
                if ((_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view)
                    return;
                const late = this.getMapViewFromManager(mapWidgetId);
                if (late === null || late === void 0 ? void 0 : late.view)
                    this.onActiveViewChange(late);
            }, 600);
        };
        this.scheduleMapInitRetry = (jmv) => {
            if (this.mapInitRetryCount >= this.maxMapInitRetries)
                return;
            if (this.mapInitRetryTimer)
                clearTimeout(this.mapInitRetryTimer);
            this.mapInitRetryCount += 1;
            this.mapInitRetryTimer = setTimeout(() => {
                this.mapInitRetryTimer = null;
                if (!this._isMounted)
                    return;
                void this.initializeMapConnection(jmv);
            }, 800);
        };
        this.addResolvedLayer = (target, layerKeyToDsId, seen, layer, dsId) => {
            const queryable = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(layer) || layer;
            if (!(0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isQueryableFieldLayer)(queryable))
                return;
            const key = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(queryable) ||
                String(queryable.url || queryable.id || "");
            if (!key || seen.has(key))
                return;
            seen.add(key);
            target.push(queryable);
            if (dsId)
                layerKeyToDsId[key] = dsId;
        };
        this.collectLayersFromDataSources = (jmv, useList) => {
            var _a, _b;
            const layers = [];
            const layerKeyToDsId = {};
            const seen = new Set();
            const map = (_a = jmv === null || jmv === void 0 ? void 0 : jmv.view) === null || _a === void 0 ? void 0 : _a.map;
            for (const uds of useList) {
                const dsId = String((uds === null || uds === void 0 ? void 0 : uds.dataSourceId) || "");
                if (!dsId)
                    continue;
                const cachedDs = (_b = this.state.dataSourcesById) === null || _b === void 0 ? void 0 : _b[dsId];
                if (cachedDs) {
                    const cachedLayer = cachedDs.layer ||
                        (typeof cachedDs.getLayer === "function"
                            ? cachedDs.getLayer()
                            : null);
                    const live = this.toLiveMapLayer(cachedLayer, map);
                    if (live)
                        this.addResolvedLayer(layers, layerKeyToDsId, seen, live, dsId);
                }
                const dsMgr = jimu_core__WEBPACK_IMPORTED_MODULE_7__.DataSourceManager.getInstance();
                const ds = dsMgr.getDataSource(dsId);
                if (ds) {
                    const dsLayer = (typeof ds.getLayer === "function" ? ds.getLayer() : null) ||
                        ds.layer;
                    const live = this.toLiveMapLayer((0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(dsLayer) || dsLayer, map);
                    if (live)
                        this.addResolvedLayer(layers, layerKeyToDsId, seen, live, dsId);
                }
            }
            return { layers, layerKeyToDsId };
        };
        this.onActiveViewChange = (jimuMapView) => {
            var _a, _b;
            this.detachMapClick();
            this.cleanupHighlight();
            if (!jimuMapView) {
                (_a = this.mapAreaResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
                this.mapAreaResizeObserver = null;
                this.connectedMapViewId = "";
                this.setState({
                    jimuMapView: null,
                    featureLayers: [],
                    objectIdField: null,
                    error: this.tr("error.noMapView"),
                    debugInfo: Object.assign(Object.assign({}, this.state.debugInfo), { layerInfo: this.tr("error.noMapView") }),
                });
                return;
            }
            const activeView = jimuMapView.view;
            if (activeView) {
                this.observeMapAreaResize(activeView);
            }
            const viewId = String(jimuMapView.id || jimuMapView.mapWidgetId || "");
            // Same map already wired — do not setState again (causes freeze loops).
            if (viewId && viewId === this.connectedMapViewId && this.state.jimuMapView) {
                if (!this._clickHandle)
                    this.attachMapClick(jimuMapView);
                if (!((_b = this.state.featureLayers) === null || _b === void 0 ? void 0 : _b.length)) {
                    void this.initializeMapConnection(jimuMapView);
                }
                return;
            }
            this.connectedMapViewId = viewId;
            this.setState({ jimuMapView }, () => __awaiter(this, void 0, void 0, function* () {
                const view = jimuMapView.view;
                if (!view)
                    return;
                // Attach immediately so the first field click never races layer resolve.
                this.attachMapClick(jimuMapView);
                if (view.ready) {
                    this.setupHighlightLayer(view);
                    yield this.initializeMapConnection(jimuMapView);
                    this.repositionPinnedIfNeeded();
                }
                else {
                    const h = view.watch("ready", (ready) => __awaiter(this, void 0, void 0, function* () {
                        if (ready) {
                            h.remove();
                            this.attachMapClick(jimuMapView);
                            this.setupHighlightLayer(view);
                            yield this.initializeMapConnection(jimuMapView);
                            this.repositionPinnedIfNeeded();
                        }
                    }));
                }
            }));
        };
        this.initializeMapConnection = (jmv) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!this._isMounted)
                return;
            const view = jmv === null || jmv === void 0 ? void 0 : jmv.view;
            if (!view || !view.map)
                return;
            const rawList = ((_b = (_a = this.props.useDataSources) === null || _a === void 0 ? void 0 : _a.asMutable) === null || _b === void 0 ? void 0 : _b.call(_a)) || [];
            const useList = this.expandUseDataSourceEntries(rawList);
            // Empty useDataSources is normal right after drop — resolve map layers only.
            // Never bounce through scheduleMapViewFallback here (that re-entered
            // onActiveViewChange and froze the page).
            this.dataSourceEngine.syncSelection((0,_gis_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources));
            const resolvedLayers = [];
            const layerKeyToDsId = {};
            const seen = new Set();
            const mapLayers = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAllFeatureLayersFromMap)(view.map);
            // load() rehydrates MapImage sublayers and can drop their runtime
            // district definitionExpression — snapshot and repair synchronously so
            // a connect/retry that overlaps a field click never flashes other
            // districts' fields.
            const definitionSnapshot = this.snapshotDefinitionExpressions(mapLayers);
            for (const layer of mapLayers) {
                yield (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.safeLoadMapLayer)(layer);
                this.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, layer);
            }
            this.restoreDriftedDefinitionExpressions(definitionSnapshot);
            if (useList.length) {
                const fromDs = this.collectLayersFromDataSources(jmv, useList);
                for (const layer of fromDs.layers) {
                    const live = this.toLiveMapLayer(layer, view.map) || layer;
                    const key = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(live) || String(live.url || live.id || "");
                    const dsId = fromDs.layerKeyToDsId[key];
                    this.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, live, dsId);
                }
                for (const useDs of useList) {
                    const layer = yield this.resolveFeatureLayerForUseDataSource(jmv, useDs);
                    if (!layer)
                        continue;
                    yield (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.safeLoadMapLayer)(layer);
                    const dsId = String((useDs === null || useDs === void 0 ? void 0 : useDs.dataSourceId) || "");
                    const live = this.toLiveMapLayer(layer, view.map) || layer;
                    this.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, live, dsId);
                }
            }
            if (!this._isMounted)
                return;
            if (!resolvedLayers.length) {
                // Soft fail — map may still be loading region-year sublayers. Retry
                // a few times without re-entering onActiveViewChange.
                // Still attach the click handler so the first field click works as soon
                // as live MapImage sublayers become hittable via getClickTargetLayers.
                if (!this._clickHandle)
                    this.attachMapClick(jmv);
                if (this.state.error !== this.tr("error.selectedLayersMissing") ||
                    (((_c = this.state.featureLayers) === null || _c === void 0 ? void 0 : _c.length) || 0) > 0) {
                    this.setState({
                        featureLayers: [],
                        objectIdField: null,
                        error: useList.length
                            ? this.tr("error.selectedLayersMissing")
                            : null,
                    });
                }
                this.scheduleMapInitRetry(jmv);
                return;
            }
            this.mapInitRetryCount = 0;
            (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("initializeMapConnection OK", {
                layerCount: resolvedLayers.length,
                layers: resolvedLayers.map((l) => l.title || l.url || l.id),
            });
            const prevKeys = (this.state.featureLayers || [])
                .map((l) => (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(l) || String(l.url || l.id || ""))
                .join("|");
            const nextKeys = resolvedLayers
                .map((l) => (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(l) || String(l.url || l.id || ""))
                .join("|");
            if (prevKeys === nextKeys && this._clickHandle) {
                this.attachMapClick(jmv);
                return;
            }
            this.setState({
                featureLayers: resolvedLayers,
                layerKeyToDsId,
                error: null,
                debugInfo: Object.assign(Object.assign({}, this.state.debugInfo), { layerInfo: resolvedLayers.map((l) => ({
                        id: l.id,
                        title: l.title,
                        url: l.url,
                        objectIdField: l.objectIdField,
                    })) }),
            }, () => {
                if (!this._isMounted)
                    return;
                this.attachMapClick(jmv);
            });
        });
        this.toLiveMapLayer = (layer, map) => {
            if (!layer)
                return null;
            const url = String((layer === null || layer === void 0 ? void 0 : layer.url) || "");
            if (map && url) {
                const byUrl = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.findQueryableLayerOnMapByUrl)(map, url);
                if (byUrl)
                    return byUrl;
            }
            if (map && (layer === null || layer === void 0 ? void 0 : layer.id) != null) {
                const byId = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.findQueryableLayerOnMapById)(map, String(layer.id));
                if (byId)
                    return byId;
            }
            const queryable = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(layer);
            return (queryable || layer);
        };
        this.layerKeysMatch = (a, b) => {
            if (!a || !b)
                return false;
            const keyA = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(a);
            const keyB = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(b);
            if (keyA && keyB && keyA === keyB)
                return true;
            if (a.id != null && b.id != null && String(a.id) === String(b.id)) {
                return true;
            }
            const urlA = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.normalizeQueryableLayerUrl)(String(a.url || ""));
            const urlB = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.normalizeQueryableLayerUrl)(String(b.url || ""));
            return !!(urlA && urlB && urlA === urlB);
        };
        /** Resolve the live map layer for a selected useDataSource (FeatureLayer or MapImage sublayer). */
        this.resolveFeatureLayerForUseDataSource = (jmv, useDs) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                if (!(useDs === null || useDs === void 0 ? void 0 : useDs.dataSourceId))
                    return null;
                const dsId = String(useDs.dataSourceId);
                const map = (_a = jmv === null || jmv === void 0 ? void 0 : jmv.view) === null || _a === void 0 ? void 0 : _a.map;
                if (!map)
                    return null;
                const jlvByApi = (_c = (_b = jmv).getJimuLayerViewByDataSourceId) === null || _c === void 0 ? void 0 : _c.call(_b, dsId);
                const fromApi = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(jlvByApi === null || jlvByApi === void 0 ? void 0 : jlvByApi.layer);
                if (fromApi)
                    return this.toLiveMapLayer(fromApi, map);
                const jlvList = ((_d = jmv.getAllJimuLayerViews) === null || _d === void 0 ? void 0 : _d.call(jmv)) || [];
                const layerIdHint = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.extractMapLayerIdFromDsId)(dsId);
                for (const lv of jlvList) {
                    if ((lv === null || lv === void 0 ? void 0 : lv.layerDataSourceId) === dsId ||
                        (lv === null || lv === void 0 ? void 0 : lv.dataSourceId) === dsId) {
                        const resolved = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(lv === null || lv === void 0 ? void 0 : lv.layer);
                        if (resolved)
                            return this.toLiveMapLayer(resolved, map);
                    }
                }
                if (layerIdHint) {
                    const match = jlvList.find((lv) => { var _a; return String(((_a = lv === null || lv === void 0 ? void 0 : lv.layer) === null || _a === void 0 ? void 0 : _a.id) || "") === layerIdHint; });
                    const resolved = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(match === null || match === void 0 ? void 0 : match.layer);
                    if (resolved)
                        return this.toLiveMapLayer(resolved, map);
                }
                const dsMgr = jimu_core__WEBPACK_IMPORTED_MODULE_7__.DataSourceManager.getInstance();
                const ds = dsMgr.getDataSource(dsId);
                if (ds) {
                    try {
                        if (typeof ds.fetchSchema === "function")
                            yield ds.fetchSchema();
                    }
                    catch (_e) {
                        /* schema optional */
                    }
                    const dsLayer = (typeof ds.getLayer === "function" ? ds.getLayer() : null) ||
                        ds.layer ||
                        (typeof ds.getJimuLayer === "function" ? ds.getJimuLayer() : null);
                    const queryable = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(dsLayer);
                    if (queryable) {
                        const live = this.toLiveMapLayer(queryable, map);
                        if (live)
                            return live;
                    }
                    const dsUrl = String((ds === null || ds === void 0 ? void 0 : ds.url) || (queryable === null || queryable === void 0 ? void 0 : queryable.url) || (dsLayer === null || dsLayer === void 0 ? void 0 : dsLayer.url) || "");
                    if (dsUrl) {
                        const byUrl = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.findQueryableLayerOnMapByUrl)(map, dsUrl);
                        if (byUrl)
                            return byUrl;
                    }
                }
            }
            catch (_f) {
                /* ignore */
            }
            return null;
        });
        this.clampPopupToMapContainer = (pos, view) => {
            const container = view.container;
            const rect = container.getBoundingClientRect();
            const margin = this.POPUP_MARGIN;
            const pinned = this.state.pinToCorner;
            const { width: popupW, height: popupH } = this.getPopupDimensions(view, pinned, pos);
            const mapLeft = rect.left;
            const mapTop = rect.top;
            const mapRight = rect.right;
            const mapBottom = this.getEffectiveMapBottom(view, margin);
            const x = Math.max(mapLeft + margin, Math.min(pos.x, mapRight - popupW - margin));
            let y = pos.y;
            if (y + popupH > mapBottom) {
                y = mapBottom - popupH - margin;
            }
            y = Math.max(mapTop + margin, y);
            return { x, y };
        };
        this.ensureMapClickAttached = () => {
            var _a, _b;
            if (!this._isMounted)
                return false;
            const mapWidgetId = this.getLinkedMapWidgetId();
            const jmv = ((_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view)
                ? this.state.jimuMapView
                : this.getMapViewFromManager(mapWidgetId);
            if (!(jmv === null || jmv === void 0 ? void 0 : jmv.view))
                return false;
            if (!((_b = this.state.jimuMapView) === null || _b === void 0 ? void 0 : _b.view)) {
                this.onActiveViewChange(jmv);
                return true;
            }
            if (!this._clickHandle) {
                this.attachMapClick(jmv);
            }
            return !!this._clickHandle;
        };
        this.handleXyPageClosed = () => {
            if (!this.isDashboardEmbedded())
                return;
            if (this.state.showPopup) {
                this.closePopup({ restoreExtent: false, notifyDeselect: false });
            }
        };
        /**
         * Close the field popup when the hub geography moves (other tuman /
         * viloyat / year) or when polygon focus is cleared. Do not restore the
         * pre-field extent on geography change — Localization is already zooming
         * to the new district/region.
         */
        this.handleMasterFilterChanged = (event) => {
            if (!this._isMounted)
                return;
            const detail = event.detail || {};
            const f = detail.filters || {};
            const geoKey = `${String(f.yil || "")}|${String(f.viloyat || "")}|${String(f.tuman || "")}`;
            const prevGeo = this._lastMasterGeoKey;
            this._lastMasterGeoKey = geoKey;
            const geoChanged = Boolean(prevGeo) && prevGeo !== geoKey;
            const polygonCleared = f.polygonMode === false;
            const incomingUnique = String(f.uniqueid || "")
                .replace(/[{}]/g, "")
                .trim();
            if (f.polygonMode === true && incomingUnique) {
                this._activeInspectedUniqueid = incomingUnique;
                // Fallback: if selection arrived via hub but popup is still closed, open it.
                if (!this.state.showPopup) {
                    void this.openPopupForUniqueid(incomingUnique, {
                        zoom: false,
                        notifySelection: false,
                    });
                }
            }
            else if (polygonCleared) {
                this._activeInspectedUniqueid = null;
            }
            if (geoChanged) {
                this.closePopup({ restoreExtent: false, notifyDeselect: false });
                return;
            }
            // Same geography but hub cleared polygon focus (e.g. Graff deselect).
            if (polygonCleared && (this.state.showPopup || this.state.loading)) {
                this.closePopup({ restoreExtent: true, notifyDeselect: false });
            }
        };
        /** Immediate close when Region/Pie/year change geography (before map sync finishes). */
        this.handleWidgetSelectionChanged = (event) => {
            if (!this._isMounted)
                return;
            const d = event.detail || {};
            // Our own polygon notify must not close the popup we just opened.
            if (d.source === "AgriPopup")
                return;
            if (d.yil !== undefined ||
                d.viloyat !== undefined ||
                d.tuman !== undefined) {
                this.closePopup({ restoreExtent: false, notifyDeselect: false });
                return;
            }
            if (d.polygonMode === false) {
                this._activeInspectedUniqueid = null;
                this.closePopup({ restoreExtent: true, notifyDeselect: false });
                return;
            }
            if ((d.source === "AgriGraffWidget" || d.source === "AgriGraff10") &&
                d.polygonMode === true &&
                d.uniqueid) {
                const clean = String(d.uniqueid)
                    .replace(/[{}]/g, "")
                    .trim();
                this._activeInspectedUniqueid = clean;
                // Table / Graff selection must always open the field popup.
                void this.openPopupForUniqueid(clean, {
                    zoom: false,
                    notifySelection: false,
                });
            }
        };
        /**
         * Open (or refresh) the field popup for a polygon uniqueid — used when
         * selection comes from the table/Graff path (map click already opens itself).
         */
        this.openPopupForUniqueid = (uniqueid, opts) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const clean = String(uniqueid || "")
                .replace(/[{}]/g, "")
                .trim();
            if (!clean || !this._isMounted)
                return;
            const active = String(this._activeInspectedUniqueid || "")
                .replace(/[{}]/g, "")
                .trim();
            if (this.state.showPopup && active === clean && this.state.selectedAttrs) {
                if (this.state.popupMinimized) {
                    this.expandPopup();
                }
                else {
                    this.broadcastPopupVisibility(true);
                }
                return;
            }
            const jmv = this.state.jimuMapView;
            const view = jmv === null || jmv === void 0 ? void 0 : jmv.view;
            if (!view || !jmv)
                return;
            const clickGeneration = ++this._clickGeneration;
            const isStale = () => !this._isMounted || clickGeneration !== this._clickGeneration;
            this.setState({
                loading: true,
                error: null,
                loadingAttachments: true,
                attachments: [],
                attachmentsExpanded: true,
            });
            try {
                const layers = yield this.resolveClickLayers(view, jmv);
                if (isStale())
                    return;
                let feature = null;
                let clickedLayer = null;
                for (const layer of layers) {
                    if (!this.isAgriculturalFieldLayer(layer))
                        continue;
                    if (!this.isLayerEffectivelyVisible(layer, view))
                        continue;
                    const detached = yield this.getDetachedQueryLayer(layer);
                    if (isStale())
                        return;
                    const queryTarget = detached || layer;
                    const variants = [clean, `{${clean}}`];
                    for (const v of variants) {
                        const q = queryTarget.createQuery();
                        q.outFields = ["*"];
                        q.returnGeometry = true;
                        q.num = 1;
                        const escaped = String(v).replace(/'/g, "''");
                        q.where = `${_gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__.AGRI_TABLE_JOIN_FIELD}='${escaped}'`;
                        try {
                            const res = yield queryTarget.queryFeatures(q);
                            if ((_a = res.features) === null || _a === void 0 ? void 0 : _a[0]) {
                                feature = res.features[0];
                                clickedLayer = layer;
                                break;
                            }
                        }
                        catch (_m) {
                            /* try next variant / layer */
                        }
                    }
                    if (feature)
                        break;
                }
                if (!feature || !clickedLayer || isStale()) {
                    if (!isStale()) {
                        this.setState({
                            loading: false,
                            loadingAttachments: false,
                            attachments: [],
                        });
                    }
                    return;
                }
                const liveLayer = (this.toLiveMapLayer(clickedLayer, view.map) ||
                    clickedLayer);
                const layerKey = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(liveLayer) ||
                    String((liveLayer === null || liveLayer === void 0 ? void 0 : liveLayer.url) || (liveLayer === null || liveLayer === void 0 ? void 0 : liveLayer.id) || "");
                const dsId = ((_b = this.state.layerKeyToDsId) === null || _b === void 0 ? void 0 : _b[layerKey]) || null;
                const oidField = liveLayer.objectIdField ||
                    ((_d = (_c = liveLayer.fields) === null || _c === void 0 ? void 0 : _c.find((f) => f.type === "oid")) === null || _d === void 0 ? void 0 : _d.name) ||
                    null;
                if (!oidField) {
                    if (!isStale()) {
                        this.setState({
                            loading: false,
                            loadingAttachments: false,
                            showPopup: false,
                        });
                    }
                    return;
                }
                const oid = (_e = feature.attributes) === null || _e === void 0 ? void 0 : _e[oidField];
                if (oid == null) {
                    if (!isStale()) {
                        this.setState({
                            loading: false,
                            loadingAttachments: false,
                            showPopup: false,
                        });
                    }
                    return;
                }
                const outFields = this.getOutFields(liveLayer, oidField);
                const f = (yield this.queryFeatureByObjectIdCached(liveLayer, oidField, oid, outFields)) || feature;
                if (isStale())
                    return;
                if (f.geometry)
                    this.highlightPolygon(f.geometry);
                const displayAttrs = yield this.resolveDisplayAttrs(f.attributes);
                if (isStale())
                    return;
                const shouldPin = this.state.pinToCorner;
                const popupPosition = shouldPin
                    ? this.calculatePinnedPosition(view)
                    : this.state.popupPosition || this.calculatePinnedPosition(view);
                const configuredFields = ((_f = this.props.config) === null || _f === void 0 ? void 0 : _f.fieldsToShow) || [];
                const actualFields = Object.keys(displayAttrs);
                const missingFields = configuredFields.filter((field) => !actualFields.includes(field));
                const fieldsWithData = configuredFields.filter((name) => displayAttrs.hasOwnProperty(name) &&
                    displayAttrs[name] != null &&
                    displayAttrs[name] !== "");
                this._activeInspectedUniqueid = clean;
                this.setState({
                    loading: false,
                    lastClickedDsId: dsId,
                    lastClickedLayerKey: layerKey,
                    selectedAttrs: displayAttrs,
                    selectedOID: Number(oid),
                    objectIdField: oidField,
                    showPopup: true,
                    popupMinimized: false,
                    chartExpanded: shouldPin,
                    chartHoverIndex: null,
                    popupPosition,
                    error: missingFields.length > 0
                        ? this.tr("error.configuredFieldMissing", {
                            fields: missingFields.join(", "),
                        })
                        : fieldsWithData.length === 0 && configuredFields.length > 0
                            ? this.tr("error.noDataForConfiguredFields")
                            : null,
                });
                if (opts === null || opts === void 0 ? void 0 : opts.notifySelection) {
                    this.notifyGraffPolygonSelection(clean, true, Date.now());
                }
                void this.fetchLatestVegetationIndices(clean);
                if ((opts === null || opts === void 0 ? void 0 : opts.zoom) !== false && f.geometry && !isStale()) {
                    try {
                        if (!this._extentBeforeSelection && ((_g = view.extent) === null || _g === void 0 ? void 0 : _g.clone)) {
                            this._extentBeforeSelection = view.extent.clone();
                        }
                        const target = ((_j = (_h = f.geometry.extent) === null || _h === void 0 ? void 0 : _h.expand) === null || _j === void 0 ? void 0 : _j.call(_h, 1.08)) || f.geometry;
                        void view.goTo({ target }, { duration: 650, easing: "ease-in-out" });
                    }
                    catch (_o) {
                        /* ignore */
                    }
                }
                if (((_l = (_k = this.props.config) === null || _k === void 0 ? void 0 : _k.settings) === null || _l === void 0 ? void 0 : _l.showAttachments) !== false) {
                    try {
                        const clickedUrl = String(liveLayer.url || "").trim();
                        const attachmentLayer = (clickedUrl && this._queryOnlyLayers.get(clickedUrl)) || liveLayer;
                        yield this.loadAttachmentsForOid(attachmentLayer, Number(oid));
                    }
                    catch (_p) {
                        if (!isStale()) {
                            this.setState({ loadingAttachments: false, attachments: [] });
                        }
                    }
                }
                else if (!isStale()) {
                    this.setState({ loadingAttachments: false, attachments: [] });
                }
                if (!isStale()) {
                    this.schedulePopupLayoutAfterContent();
                }
            }
            catch (e) {
                if (!isStale()) {
                    this.setState({
                        loading: false,
                        loadingAttachments: false,
                        error: (e === null || e === void 0 ? void 0 : e.message) || String(e),
                    });
                }
            }
        });
        this.handleSharedMapClick = (event) => __awaiter(this, void 0, void 0, function* () {
            // Always ignore the Localization click bus. AgriPopup owns view.on("click")
            // exclusively — handling both races two full onViewClick chains: the loser
            // often clears showPopup, restores the pre-selection extent, and flashes
            // other-district fields. Localization may still dispatch for other listeners.
            (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("AgriPolygon ← shared map-click SKIP (direct view click is sole owner)");
            return;
        });
        /* ---------------- Click → hitTest → query full attrs ---------------- */
        this.toClickQueryGeometry = (view, screenPoint, mapPoint) => {
            if (typeof view.toMap === "function") {
                try {
                    const fromView = view.toMap(screenPoint);
                    if (fromView)
                        return fromView;
                }
                catch (_a) {
                    /* ignore */
                }
            }
            const x = Number(mapPoint === null || mapPoint === void 0 ? void 0 : mapPoint.x);
            const y = Number(mapPoint === null || mapPoint === void 0 ? void 0 : mapPoint.y);
            if (!Number.isFinite(x) || !Number.isFinite(y))
                return null;
            try {
                return new esri_geometry_Point__WEBPACK_IMPORTED_MODULE_2__["default"]({
                    x,
                    y,
                    spatialReference: (mapPoint === null || mapPoint === void 0 ? void 0 : mapPoint.spatialReference) || view.spatialReference,
                });
            }
            catch (_b) {
                return null;
            }
        };
        this.findHitGraphic = (hit, layers) => {
            var _a;
            const hitResult = (_a = hit === null || hit === void 0 ? void 0 : hit.results) === null || _a === void 0 ? void 0 : _a.find((r) => {
                if ("graphic" in r && r.graphic) {
                    const lyr = r.graphic.layer;
                    if (!lyr)
                        return false;
                    return layers.some((L) => this.layerKeysMatch(L, lyr));
                }
                return false;
            });
            return hitResult && "graphic" in hitResult ? hitResult.graphic : null;
        };
        this.pickClickGraphic = (hit, preferredLayers) => {
            var _a, _b;
            const activeView = (_a = this.state.jimuMapView) === null || _a === void 0 ? void 0 : _a.view;
            const map = activeView === null || activeView === void 0 ? void 0 : activeView.map;
            const candidates = [];
            const restrictToPreferred = preferredLayers.length > 0;
            for (const r of (hit === null || hit === void 0 ? void 0 : hit.results) || []) {
                if (!r || typeof r !== "object")
                    continue;
                const graphic = "graphic" in r && r.graphic
                    ? r.graphic
                    : null;
                if (!graphic)
                    continue;
                const rawLayer = graphic.layer;
                if (this.isHighlightLayer(rawLayer))
                    continue;
                const layer = this.toLiveMapLayer((0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(rawLayer) || rawLayer, map);
                if (!layer || !this.isAgriculturalFieldLayer(layer))
                    continue;
                if (!activeView || !this.isLayerEffectivelyVisible(layer, activeView))
                    continue;
                if (!this.isAgriculturalFieldGraphic(graphic, layer))
                    continue;
                if (restrictToPreferred &&
                    !preferredLayers.some((L) => this.layerKeysMatch(L, layer))) {
                    continue;
                }
                const geomType = String(((_b = graphic.geometry) === null || _b === void 0 ? void 0 : _b.type) || "").toLowerCase();
                const isPolygonLike = !geomType || geomType === "polygon" || geomType === "multipolygon";
                const hasAttributes = !!graphic.attributes && Object.keys(graphic.attributes).length > 0;
                if (geomType && !isPolygonLike)
                    continue;
                if (!hasAttributes && !graphic.geometry)
                    continue;
                candidates.push(graphic);
            }
            if (!candidates.length)
                return null;
            if (restrictToPreferred) {
                for (const graphic of candidates) {
                    const layer = this.toLiveMapLayer((0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(graphic.layer) || graphic.layer, map);
                    if (layer &&
                        preferredLayers.some((L) => this.layerKeysMatch(L, layer)) &&
                        layer.visible !== false) {
                        return graphic;
                    }
                }
                return null;
            }
            for (const graphic of candidates) {
                const layer = graphic.layer;
                if ((layer === null || layer === void 0 ? void 0 : layer.visible) !== false)
                    return graphic;
            }
            return candidates[0];
        };
        this.resolveClickFeatureAt = (ev, view, layers) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const clickScreenPoint = { x: ev.x, y: ev.y };
            const queryGeometry = this.toClickQueryGeometry(view, clickScreenPoint, ev.mapPoint);
            const queryLayers = layers.length > 0
                ? layers
                : this.getClickTargetLayers(view);
            // hitTest / identify can rehydrate MapImage sublayers and clear their
            // runtime definitionExpression (district filter) — snapshot every click
            // candidate now and restore any drift synchronously afterwards, before
            // an unfiltered export gets painted (other-district fields flash).
            const definitionSnapshot = this.snapshotDefinitionExpressions([
                ...layers,
                ...queryLayers,
            ]);
            // Always hit-test the rendered map without an include restriction. Map-image
            // sublayers frequently have runtime ids/URLs that differ from configured DS
            // wrappers; restricting include/preferred layers makes visible fields unclickable.
            const hit = yield view.hitTest(ev);
            this.restoreDriftedDefinitionExpressions(definitionSnapshot);
            // Only accept graphics belonging to the configured agricultural layers.
            // WebMap sketch/map-notes graphics can contain page-sized polygons; treating
            // one as a field makes goTo zoom out to a world extent.
            // Empty `layers` still allows agricultural hits (no preferred restriction).
            let g = this.pickClickGraphic(hit, layers);
            let queryHitLayer = null;
            if (!g && queryGeometry && queryLayers.length) {
                for (const layer of queryLayers) {
                    if (!this.isLayerEffectivelyVisible(layer, view))
                        continue;
                    if (!this.isAgriculturalFieldLayer(layer))
                        continue;
                    try {
                        // NEVER query the live layer here: on a MapImage sublayer that
                        // rehydrates it and clears the tuman definitionExpression, so the
                        // map briefly exports/paints every district's fields while the
                        // popup zoom runs. Use the detached off-map client instead and
                        // mirror the live filter onto the query WHERE.
                        const liveWhere = String(layer.definitionExpression || "").trim();
                        const detached = yield this.getDetachedQueryLayer(layer);
                        const queryTarget = detached || layer;
                        const q = queryTarget.createQuery();
                        q.geometry = queryGeometry;
                        q.spatialRelationship = "intersects";
                        q.outFields = ["*"];
                        q.returnGeometry = true;
                        q.num = 1;
                        if (liveWhere && liveWhere !== "1=1")
                            q.where = liveWhere;
                        const res = yield queryTarget.queryFeatures(q);
                        if (!detached) {
                            // Live-layer fallback (no URL) — repair any drift immediately.
                            this.restoreDriftedDefinitionExpressions(definitionSnapshot);
                        }
                        if ((_a = res.features) === null || _a === void 0 ? void 0 : _a[0]) {
                            g = res.features[0];
                            // Keep the LIVE layer as the hit layer — downstream layer-key /
                            // dsId / alias resolution must map back to the map's own layer.
                            queryHitLayer = layer;
                            break;
                        }
                    }
                    catch (_b) {
                        /* try next layer */
                    }
                }
            }
            if (!g)
                return null;
            return { graphic: g, queryHitLayer };
        });
        /**
         * Tells AgriGraff10 (via AgriLocalization, the central filter hub) which
         * polygon is currently inspected so its chart can switch to showing that
         * single polygon's vegetation-index series instead of the region-wide
         * timeseries. Mirrors the widgetSelectionChanged shape AgriGraffWidget
         * itself already dispatches on its own row-click selection.
         */
        this.notifyGraffPolygonSelection = (uniqueid, polygonMode, clickedAt) => {
            try {
                document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
                    detail: {
                        source: "AgriPopup",
                        polygonMode,
                        uniqueid: polygonMode ? uniqueid : "",
                        // Timestamp of the ORIGINAL map click (captured before this
                        // widget's own async attribute-resolution chain), not of this
                        // dispatch — lets downstream listeners (AgriGraff10) detect and
                        // ignore a stale notification that resolves after a newer click
                        // was already applied (see AgriGraff10's _lastAppliedPolygonClickedAt).
                        clickedAt: clickedAt !== null && clickedAt !== void 0 ? clickedAt : Date.now(),
                        timestamp: Date.now(),
                    },
                    bubbles: true,
                }));
            }
            catch (_a) {
                /* ignore */
            }
        };
        this.broadcastPopupVisibility = (open) => {
            const pinned = !!this.state.pinToCorner;
            try {
                document.dispatchEvent(new CustomEvent("agriMapPopupVisibility", {
                    detail: {
                        open: !!open,
                        pinned,
                        source: "AgriPopup",
                        timestamp: Date.now(),
                    },
                    bubbles: true,
                }));
            }
            catch (_a) {
                /* ignore */
            }
            if (open) {
                // Re-notify after paint so NDVI can measure the real popup box.
                requestAnimationFrame(() => {
                    try {
                        document.dispatchEvent(new CustomEvent("agriMapPopupVisibility", {
                            detail: {
                                open: true,
                                pinned,
                                layout: true,
                                source: "AgriPopup",
                                timestamp: Date.now(),
                            },
                            bubbles: true,
                        }));
                    }
                    catch (_a) {
                        /* ignore */
                    }
                });
            }
        };
        /**
         * Latest-day vegetation index values for the selected polygon, shown in
         * the popup. Reuses queryVegetationSeriesForUniqueId (queries the
         * agri_vegetation_indices ArcGIS table directly, same source AgriGraff10's
         * chart uses) rather than the api-agri export-image/available-dates REST
         * endpoints — those are for fetching a rendered raster for a specific
         * chosen date, which is unnecessary here; we only need the scalar index
         * values for whichever date is most recent, and the table already has
         * ndvi/savi/rvi/ci/evi/ndwi as plain fields per (uniqueid, raster_date).
         */
        this.fetchLatestVegetationIndices = (uniqueId) => __awaiter(this, void 0, void 0, function* () {
            const id = String(uniqueId || "").trim();
            if (!id) {
                this.setState({
                    loadingLatestIndices: false,
                    latestIndexDate: null,
                    latestIndexValues: null,
                });
                return;
            }
            const requestId = ++this._latestIndicesRequestId;
            (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("vegetation:request", {
                uniqueid: id,
                source: "agri_vegetation_indices/FeatureServer/1",
                requestId,
            });
            this.setState({
                loadingLatestIndices: true,
            });
            try {
                const rows = yield (0,_gis_agri_vegetation_data_source__WEBPACK_IMPORTED_MODULE_18__.queryVegetationSeriesForUniqueId)(id);
                if (!this._isMounted || requestId !== this._latestIndicesRequestId)
                    return;
                if (!rows.length) {
                    this.setState({
                        loadingLatestIndices: false,
                        latestIndexDate: null,
                        latestIndexValues: null,
                    });
                    return;
                }
                // Rows come back ordered by raster_date ASC — the last one is the
                // most recent processed date for this polygon.
                const latest = rows[rows.length - 1];
                const date = (0,_gis_agri_vegetation_data_source__WEBPACK_IMPORTED_MODULE_18__.formatArcgisDateToYmd)(latest.raster_date);
                const values = {};
                for (const field of AgriPolygon.VEG_INDEX_FIELDS) {
                    const v = Number(latest[field]);
                    if (Number.isFinite(v))
                        values[field] = v;
                }
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("vegetation:response", {
                    uniqueid: id,
                    requestId,
                    rowCount: rows.length,
                    latestDate: date,
                    values,
                });
                this.setState({
                    loadingLatestIndices: false,
                    latestIndexDate: date,
                    latestIndexValues: Object.keys(values).length ? values : null,
                });
            }
            catch (_a) {
                if (!this._isMounted || requestId !== this._latestIndicesRequestId)
                    return;
                this.setState({
                    loadingLatestIndices: false,
                    latestIndexDate: null,
                    latestIndexValues: null,
                });
            }
        });
        this.onViewClick = (ev) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            try {
                document.dispatchEvent(new CustomEvent("agriPolygonMapClickPhase", {
                    detail: { phase: "click-start", timestamp: Date.now() },
                }));
            }
            catch (_t) {
                /* best-effort filter guard */
            }
            // Captured BEFORE any awaits below — this widget's attribute-resolution
            // chain (resolveClickLayers/resolveClickFeatureAt/query/resolveDisplayAttrs)
            // can take noticeably longer than AgriGraff10's own, more direct map-click
            // handling of the same click. If the user clicks a second polygon before
            // this chain finishes, the stale result must not win — clickedAt lets
            // AgriGraff10 detect and drop it.
            const clickStartedAt = Date.now();
            const clickGeneration = ++this._clickGeneration;
            (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("click:received", {
                clickGeneration,
                x: ev.x,
                y: ev.y,
                mapPoint: ev.mapPoint
                    ? {
                        x: ev.mapPoint.x,
                        y: ev.mapPoint.y,
                        wkid: ((_a = ev.mapPoint.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid) || null,
                    }
                    : null,
            });
            const isStale = () => !this._isMounted || clickGeneration !== this._clickGeneration;
            let popupOpenedForThisClick = false;
            const jmv = this.state.jimuMapView;
            const view = jmv === null || jmv === void 0 ? void 0 : jmv.view;
            if (!view || !jmv) {
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("onViewClick SKIP: no view/jmv");
                return;
            }
            const layers = yield this.resolveClickLayers(view, jmv);
            if (isStale())
                return;
            (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("onViewClick start", {
                screen: { x: ev.x, y: ev.y },
                layerCount: layers.length,
                layers: layers.map((l) => ({
                    id: l.id,
                    title: l.title,
                    url: l.url,
                })),
            });
            const clickScreenPoint = { x: ev.x, y: ev.y };
            const hitResult = yield this.resolveClickFeatureAt(ev, view, layers);
            if (isStale())
                return;
            try {
                document.dispatchEvent(new CustomEvent("agriPolygonMapClickPhase", {
                    detail: { phase: "after-hit-test", timestamp: Date.now() },
                }));
            }
            catch (_u) {
                /* best-effort filter guard */
            }
            if (!hitResult) {
                // Empty map click while a field popup is open = deselect and return to
                // the district/region extent saved before the field zoom.
                if (this.state.showPopup || this.state.loading) {
                    (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("onViewClick: click outside — close popup + restore extent");
                    this.closePopup({ restoreExtent: true, notifyDeselect: true });
                }
                else {
                    (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("onViewClick: click outside field polygons — ignored");
                }
                return;
            }
            const { graphic: g, queryHitLayer } = hitResult;
            try {
                this.setState({
                    loading: true,
                    error: null,
                    clickScreenPoint,
                    loadingAttachments: true,
                    attachments: [],
                    attachmentsExpanded: true,
                });
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("field polygon hit", {
                    layerId: (_b = g.layer) === null || _b === void 0 ? void 0 : _b.id,
                    geometry: ((_c = g.geometry) === null || _c === void 0 ? void 0 : _c.type) || null,
                    attrKeys: g.attributes
                        ? Object.keys(g.attributes).slice(0, 8)
                        : [],
                });
                // queryFeatures results have no graphic.layer — use the layer we queried
                const clickedLayer = (queryHitLayer
                    ? this.toLiveMapLayer(queryHitLayer, view.map) || queryHitLayer
                    : this.toLiveMapLayer((0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getQueryableLayer)(g.layer) || g.layer, view.map));
                if (!clickedLayer) {
                    (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("no live layer for hit graphic");
                    if (!isStale())
                        this.setState({ loading: false, showPopup: false });
                    return;
                }
                const layerKey = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(clickedLayer) ||
                    String((clickedLayer === null || clickedLayer === void 0 ? void 0 : clickedLayer.url) || (clickedLayer === null || clickedLayer === void 0 ? void 0 : clickedLayer.id) || "");
                const dsId = ((_d = this.state.layerKeyToDsId) === null || _d === void 0 ? void 0 : _d[layerKey]) || null;
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("layer:resolved", {
                    title: clickedLayer.title,
                    id: clickedLayer.id,
                    url: clickedLayer.url || null,
                    layerKey,
                    dataSourceId: dsId,
                    definitionExpression: clickedLayer.definitionExpression || null,
                });
                const oidField = clickedLayer.objectIdField ||
                    ((_f = (_e = clickedLayer.fields) === null || _e === void 0 ? void 0 : _e.find((f) => f.type === "oid")) === null || _f === void 0 ? void 0 : _f.name) ||
                    null;
                if (!oidField) {
                    if (!isStale()) {
                        this.setState({
                            loading: false,
                            error: this.tr("error.objectIdFieldMissing"),
                            showPopup: false,
                            loadingAttachments: false,
                            attachments: [],
                        });
                        this.clearHighlight();
                    }
                    return;
                }
                const oid = (_g = g.attributes) === null || _g === void 0 ? void 0 : _g[oidField];
                if (oid == null) {
                    if (!isStale()) {
                        this.setState({
                            loading: false,
                            error: this.tr("error.objectIdMissing", { field: oidField }),
                            showPopup: false,
                            loadingAttachments: false,
                            attachments: [],
                        });
                        this.clearHighlight();
                    }
                    return;
                }
                const outFields = this.getOutFields(clickedLayer, oidField);
                const f = yield this.queryFeatureByObjectIdCached(clickedLayer, oidField, oid, outFields);
                if (isStale())
                    return;
                if (!f) {
                    this.setState({
                        loading: false,
                        error: this.tr("error.featureByObjectIdMissing"),
                        showPopup: false,
                        loadingAttachments: false,
                        attachments: [],
                    });
                    this.clearHighlight();
                    return;
                }
                if (f.geometry)
                    this.highlightPolygon(f.geometry);
                const earlyUniqueId = (_h = this.findAttributeValueCaseInsensitive(f.attributes, _gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__.AGRI_TABLE_JOIN_FIELD)) !== null && _h !== void 0 ? _h : null;
                const earlyCleanKey = String(earlyUniqueId || "")
                    .replace(/[{}]/g, "")
                    .trim();
                const activeKey = String(this._activeInspectedUniqueid || "")
                    .replace(/[{}]/g, "")
                    .trim();
                /*
                 * Same already-active field (incl. table selection) clicked on map →
                 * deactivate without zooming in again. Graff restores the pre-select extent.
                 * If the panel was only minimized, expand it instead of deselecting.
                 */
                if (activeKey && earlyCleanKey && activeKey === earlyCleanKey) {
                    if (this.state.popupMinimized) {
                        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("selection:expand-minimized-same-field", {
                            uniqueid: earlyCleanKey,
                        });
                        this.expandPopup();
                        return;
                    }
                    (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("selection:toggle-off-same-field", {
                        uniqueid: earlyCleanKey,
                    });
                    this.clearHighlight();
                    this._activeInspectedUniqueid = null;
                    this.closePopup({ restoreExtent: true, notifyDeselect: true });
                    return;
                }
                // Kick Graff overlay + zoom BEFORE Agri_table join — that join used to
                // sit on the critical path (~seconds) while the index TIFF waited.
                if (earlyUniqueId != null && String(earlyUniqueId).trim() !== "") {
                    const earlyNotifyId = String(earlyUniqueId).trim();
                    this._activeInspectedUniqueid = earlyCleanKey;
                    (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("selection:broadcast-early", {
                        uniqueid: earlyNotifyId,
                        source: "AgriPopup",
                        polygonMode: true,
                        destinations: ["AgriLocalization", "AgriGraff10"],
                    });
                    this.notifyGraffPolygonSelection(earlyNotifyId, true, clickStartedAt);
                    // Warm TIFF cache immediately (same tick as click) — uses last
                    // region/year/date published by Graff, or available-dates if needed.
                    // Pass the crop so the date walk starts inside its index season
                    // (wheat = Mar/Apr) instead of probing September and eating 400s.
                    (0,_gis_agri_vegetation_overlay_prefetch__WEBPACK_IMPORTED_MODULE_22__.prefetchVegetationOverlayForUniqueid)(earlyNotifyId, {
                        cropId: (0,_gis_agri_polygon_api_source__WEBPACK_IMPORTED_MODULE_23__.resolveCropIdFromAttributes)(f.attributes),
                    });
                    // Defer FeatureServer series so export-image gets bandwidth first.
                    window.setTimeout(() => {
                        if (!this._isMounted)
                            return;
                        const active = String(this._activeInspectedUniqueid || "")
                            .replace(/[{}]/g, "")
                            .trim();
                        if (active !== earlyCleanKey)
                            return;
                        void this.fetchLatestVegetationIndices(earlyNotifyId);
                    }, 650);
                }
                const zoomToEarly = ((_k = (_j = this.props.config) === null || _j === void 0 ? void 0 : _j.settings) === null || _k === void 0 ? void 0 : _k.zoomToSelection) !== false;
                if (zoomToEarly && f.geometry && !isStale()) {
                    try {
                        if (!this._extentBeforeSelection && ((_l = view.extent) === null || _l === void 0 ? void 0 : _l.clone)) {
                            this._extentBeforeSelection = view.extent.clone();
                        }
                        const target = ((_o = (_m = f.geometry.extent) === null || _m === void 0 ? void 0 : _m.expand) === null || _o === void 0 ? void 0 : _o.call(_m, 1.08)) || f.geometry;
                        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("zoom:start-early", {
                            uniqueid: earlyCleanKey || null,
                            geometryType: f.geometry.type,
                            durationMs: 650,
                        });
                        void view
                            .goTo({ target }, { duration: 650, easing: "ease-in-out" })
                            .then(() => (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("zoom:complete", {
                            uniqueid: earlyCleanKey || null,
                            scale: view.scale,
                        }), (error) => (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("zoom:failed", {
                            uniqueid: earlyCleanKey || null,
                            error: (error === null || error === void 0 ? void 0 : error.message) || String(error),
                        }));
                    }
                    catch (_v) {
                        /* ignore */
                    }
                }
                try {
                    const loadStatus = String(clickedLayer.loadStatus || "").toLowerCase();
                    const isLoaded = Boolean(clickedLayer.loaded) || loadStatus === "loaded";
                    // Loading a live MapImage-owned sublayer rehydrates it and can clear
                    // the runtime tuman definitionExpression (other-district flash). The
                    // detached client from queryFeatureByObjectIdCached is already loaded
                    // and provides the same field metadata.
                    if (!isLoaded &&
                        !(0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isMapImageOwnedLayer)(clickedLayer) &&
                        !(0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isMapImageGroupSublayer)(clickedLayer)) {
                        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("layer:load-required", {
                            title: clickedLayer.title,
                            loadStatus: loadStatus || null,
                            definitionExpression: clickedLayer.definitionExpression || null,
                        });
                        yield (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.safeLoadMapLayer)(clickedLayer);
                    }
                    else {
                        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("layer:load-skip-already-loaded", {
                            title: clickedLayer.title,
                            loadStatus: loadStatus || "loaded",
                            definitionExpression: clickedLayer.definitionExpression || null,
                        });
                    }
                }
                catch (_w) {
                    /* fresh field aliases from live layer */
                }
                if (isStale())
                    return;
                const shouldPin = this.state.pinToCorner;
                const popupPosition = shouldPin
                    ? this.calculatePinnedPosition(view)
                    : this.calculatePopupPosition(clickScreenPoint, view);
                // Agri_table_data has no geometry — the polygon layer only drives
                // map-click/highlight/zoom; the fields the popup shows come from the
                // external table, joined by uniqueid.
                const displayAttrs = yield this.resolveDisplayAttrs(f.attributes);
                if (isStale())
                    return;
                const configuredFields = ((_p = this.props.config) === null || _p === void 0 ? void 0 : _p.fieldsToShow) || [];
                const actualFields = Object.keys(displayAttrs);
                const missingFields = configuredFields.filter((field) => !actualFields.includes(field));
                const fieldsWithData = configuredFields.filter((name) => displayAttrs.hasOwnProperty(name) &&
                    displayAttrs[name] != null &&
                    displayAttrs[name] !== "");
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("popup OPEN", {
                    oid,
                    oidField,
                    layerKey,
                    attributeKeys: actualFields.slice(0, 12),
                    popupPosition,
                });
                // Open the popup BEFORE goTo — awaiting zoom first left a long window
                // where a twin/shared click path could fail and wipe showPopup.
                this.setState({
                    loading: false,
                    // ✅ store which layer/ds was clicked (for alias resolving)
                    lastClickedDsId: dsId,
                    lastClickedLayerKey: layerKey,
                    selectedAttrs: displayAttrs,
                    selectedOID: Number(oid),
                    objectIdField: oidField,
                    showPopup: true,
                    popupMinimized: false,
                    chartExpanded: shouldPin,
                    chartHoverIndex: null,
                    popupPosition,
                    error: missingFields.length > 0
                        ? this.tr("error.configuredFieldMissing", {
                            fields: missingFields.join(", "),
                        })
                        : fieldsWithData.length === 0 && configuredFields.length > 0
                            ? this.tr("error.noDataForConfiguredFields")
                            : null,
                });
                popupOpenedForThisClick = true;
                const clickedUniqueId = (_q = this.findAttributeValueCaseInsensitive(displayAttrs, _gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__.AGRI_TABLE_JOIN_FIELD)) !== null && _q !== void 0 ? _q : this.findAttributeValueCaseInsensitive(f.attributes, _gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__.AGRI_TABLE_JOIN_FIELD);
                if (clickedUniqueId != null && String(clickedUniqueId).trim() !== "") {
                    const cleanUniqueId = String(clickedUniqueId).trim();
                    this._activeInspectedUniqueid = cleanUniqueId.replace(/[{}]/g, "").trim();
                    // Early broadcast already ran when polygon attrs had uniqueid; only
                    // notify again if the table join is the first place we saw it.
                    if (!earlyCleanKey || earlyCleanKey !== this._activeInspectedUniqueid) {
                        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("selection:broadcast", {
                            uniqueid: cleanUniqueId,
                            source: "AgriPopup",
                            polygonMode: true,
                            destinations: ["AgriLocalization", "AgriGraff10"],
                        });
                        this.notifyGraffPolygonSelection(cleanUniqueId, true, clickStartedAt);
                        void this.fetchLatestVegetationIndices(cleanUniqueId);
                    }
                }
                else {
                    this.setState({
                        loadingLatestIndices: false,
                        latestIndexDate: null,
                        latestIndexValues: null,
                    });
                }
                // Zoom already started early (before Agri_table join) when geometry exists.
                // Attachments are best-effort — never let a media fetch wipe an open popup
                // (that was the "vegetation updates but popup only sticks on 2nd/3rd click"
                // failure: notifyGraff ran, then loadAttachments threw → catch closed UI
                // and restoreExtentBeforeSelection made the map look like other fields).
                if (((_s = (_r = this.props.config) === null || _r === void 0 ? void 0 : _r.settings) === null || _s === void 0 ? void 0 : _s.showAttachments) !== false) {
                    try {
                        // Query attachments on the detached client too — queryAttachments
                        // on a live MapImage sublayer can rehydrate it (same DE-clearing
                        // path as queryFeatures) and it often lacks the API anyway.
                        const clickedUrl = String(clickedLayer.url || "").trim();
                        const attachmentLayer = (clickedUrl && this._queryOnlyLayers.get(clickedUrl)) ||
                            clickedLayer;
                        yield this.loadAttachmentsForOid(attachmentLayer, Number(oid));
                    }
                    catch (attachErr) {
                        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("attachments failed (popup kept open)", {
                            message: (attachErr === null || attachErr === void 0 ? void 0 : attachErr.message) || String(attachErr),
                        });
                        if (!isStale()) {
                            this.setState({ loadingAttachments: false, attachments: [] });
                        }
                    }
                }
                else if (!isStale()) {
                    this.setState({ loadingAttachments: false, attachments: [] });
                }
                if (isStale())
                    return;
                if (this.state.pinToCorner) {
                    this.schedulePopupLayoutAfterContent();
                }
                else if (this.isDashboardEmbedded()) {
                    this.schedulePopupLayoutAfterContent();
                }
            }
            catch (e) {
                // Never let a superseded twin/shared click clear a newer popup.
                if (isStale())
                    return;
                // If we already opened the popup for THIS click, keep it — surface error only.
                if (popupOpenedForThisClick) {
                    this.setState({
                        loading: false,
                        error: this.tr("error.unexpected", {
                            message: (e === null || e === void 0 ? void 0 : e.message) || "Unknown error",
                        }),
                        loadingAttachments: false,
                    });
                    return;
                }
                this.setState({
                    loading: false,
                    error: this.tr("error.unexpected", {
                        message: (e === null || e === void 0 ? void 0 : e.message) || "Unknown error",
                    }),
                    showPopup: false,
                    loadingAttachments: false,
                    attachments: [],
                });
                this.clearHighlight();
                this.notifyGraffPolygonSelection("", false);
                this.restoreExtentBeforeSelection();
            }
        });
        this.resolveFieldName = (key) => {
            var _a, _b, _c, _d;
            // Prefer DS schema for the LAST clicked ds (best for alias/jimuName)
            const dsId = this.state.lastClickedDsId;
            const ds = dsId && ((_a = this.state.dataSourcesById) === null || _a === void 0 ? void 0 : _a[dsId])
                ? this.state.dataSourcesById[dsId]
                : null;
            try {
                const schema = (_b = ds === null || ds === void 0 ? void 0 : ds.getSchema) === null || _b === void 0 ? void 0 : _b.call(ds);
                const fieldsObj = (schema === null || schema === void 0 ? void 0 : schema.fields) || {};
                if ((_c = fieldsObj[key]) === null || _c === void 0 ? void 0 : _c.name)
                    return fieldsObj[key].name;
                for (const k of Object.keys(fieldsObj)) {
                    const f = fieldsObj[k];
                    if ((f === null || f === void 0 ? void 0 : f.name) === key || (f === null || f === void 0 ? void 0 : f.jimuName) === key || k === key)
                        return (f === null || f === void 0 ? void 0 : f.name) || key;
                }
            }
            catch (_e) { }
            // fallback to clicked layer fields
            const clickedLayer = this.getClickedLayer();
            const lf = (_d = clickedLayer === null || clickedLayer === void 0 ? void 0 : clickedLayer.fields) === null || _d === void 0 ? void 0 : _d.find((ff) => ff.name === key || ff.alias === key);
            return (lf === null || lf === void 0 ? void 0 : lf.name) || null;
        };
        /* ---------------- Popup positioning ---------------- */
        this.calculatePopupPosition = (clickPoint, view) => {
            const container = view.container;
            const rect = container.getBoundingClientRect();
            const margin = this.POPUP_MARGIN;
            const popupW = this.getPopupWidth(view);
            const popupH = popupW;
            // ✅ EB builds differ:
            // - some give ev.x/ev.y relative to container (0..rect.width)
            // - others give viewport coords (same space as rect.left/top)
            const looksContainerRelative = clickPoint.x >= 0 &&
                clickPoint.y >= 0 &&
                clickPoint.x <= rect.width + 2 &&
                clickPoint.y <= rect.height + 2;
            // Convert click to VIEWPORT coords (because popup is position: fixed)
            const viewportClickX = looksContainerRelative
                ? rect.left + clickPoint.x
                : clickPoint.x;
            const viewportClickY = looksContainerRelative
                ? rect.top + clickPoint.y
                : clickPoint.y;
            // Map container boundaries in viewport coords
            const mapLeft = rect.left;
            const mapTop = rect.top;
            const mapRight = rect.right;
            const mapBottom = this.getEffectiveMapBottom(view, margin);
            // Prefer bottom-right of click
            let x = viewportClickX + margin;
            let y = viewportClickY + margin;
            // Flip left if overflowing right edge (CRITICAL!)
            // Check if popup would go outside map's right boundary
            if (x + popupW > mapRight - margin) {
                x = viewportClickX - popupW - margin;
            }
            // Flip up if overflowing bottom edge
            if (y + popupH > mapBottom - margin) {
                y = viewportClickY - popupH - margin;
            }
            // Final hard clamp to map container bounds
            // This is the critical part - ensure popup NEVER exceeds map bounds
            const minX = mapLeft + margin;
            const maxX = mapRight - popupW - margin;
            const minY = mapTop + margin;
            const maxY = mapBottom - popupH - margin;
            x = Math.max(minX, Math.min(x, maxX));
            y = Math.max(minY, Math.min(y, maxY));
            // FINAL SAFETY NET: Ensure x never exceeds right boundary
            if (x + popupW > mapRight - margin) {
                x = mapRight - popupW - margin;
            }
            // Also ensure x >= left boundary
            if (x < mapLeft + margin) {
                x = mapLeft + margin;
            }
            return { x, y };
        };
        this.closePopup = (opts) => {
            // Closing the panel alone must keep the polygon highlight + map extent.
            // Explicit callers (empty map click / geo reset) opt into restore/deselect.
            const restoreExtent = (opts === null || opts === void 0 ? void 0 : opts.restoreExtent) === true;
            const notifyDeselect = (opts === null || opts === void 0 ? void 0 : opts.notifyDeselect) === true;
            // Invalidate every pending hitTest/query/attachment request. Otherwise a
            // field click that was still loading could reopen its stale popup after
            // the user had already moved to another district or region.
            this._clickGeneration += 1;
            this._latestIndicesRequestId += 1;
            if (!this.state.showPopup) {
                if (notifyDeselect) {
                    this.clearHighlight();
                    this.notifyGraffPolygonSelection("", false);
                }
                if (!restoreExtent)
                    this._extentBeforeSelection = null;
                this.setState({
                    loading: false,
                    error: null,
                    selectedAttrs: null,
                    selectedOID: null,
                    objectIdField: null,
                    lastClickedDsId: null,
                    lastClickedLayerKey: null,
                    popupPosition: null,
                    clickScreenPoint: null,
                    popupMinimized: false,
                });
                return;
            }
            if (notifyDeselect) {
                this.clearHighlight();
                this.notifyGraffPolygonSelection("", false);
            }
            this.revokeAllAttachmentUrls();
            this.setState({
                showPopup: false,
                popupMinimized: false,
                popupPosition: null,
                clickScreenPoint: null,
                loading: false,
                error: null,
                selectedAttrs: null,
                selectedOID: null,
                objectIdField: null,
                lastClickedDsId: null,
                lastClickedLayerKey: null,
                attachments: [],
                attachmentsExpanded: false,
                loadingAttachments: false,
                chartExpanded: false,
                chartHoverIndex: null,
                loadingLatestIndices: false,
                latestIndexDate: null,
                latestIndexValues: null,
            });
            if (restoreExtent) {
                this.restoreExtentBeforeSelection();
            }
            else {
                this._extentBeforeSelection = null;
            }
        };
        /** Header X — collapse the panel; keep polygon selection + loaded attrs. */
        this.minimizePopup = () => {
            if (!this._isMounted || !this.state.showPopup || this.state.popupMinimized) {
                return;
            }
            this.setState({ popupMinimized: true });
        };
        /** Expand a previously minimized attribute panel. */
        this.expandPopup = () => {
            if (!this._isMounted || !this.state.showPopup || !this.state.popupMinimized) {
                return;
            }
            this.setState({ popupMinimized: false });
        };
        /* ---------------- DS hook (instantiates DS) ---------------- */
        this.onDataSourceCreated = (ds) => {
            if (!(ds === null || ds === void 0 ? void 0 : ds.id))
                return;
            this.dataSourceEngine.onDsCreated(ds, (0,_gis_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources));
            this.setState((prev) => ({
                dataSourcesById: Object.assign(Object.assign({}, (prev.dataSourcesById || {})), { [ds.id]: ds }),
            }));
            if (this.state.jimuMapView) {
                void this.initializeMapConnection(this.state.jimuMapView);
            }
            else {
                this.scheduleMapViewFallback();
            }
        };
        /* ---------------- Chart rendering ---------------- */
        this.toggleChartExpanded = () => {
            this.setState((prev) => ({ chartExpanded: !prev.chartExpanded }));
        };
        this.renderChartIcon = (type = "bar") => type === "line" ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_25__["default"], { className: "agri3-chart-icon", strokeWidth: 2, "aria-hidden": "true" })) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_26__["default"], { className: "agri3-chart-icon", strokeWidth: 2, "aria-hidden": "true" }));
        this.clearChartHover = () => {
            if (this.state.chartHoverIndex != null) {
                this.setState({ chartHoverIndex: null });
            }
        };
        this.setChartHover = (index) => {
            if (this.state.chartHoverIndex !== index) {
                this.setState({ chartHoverIndex: index });
            }
        };
        this.renderLatestIndices = () => {
            const { loadingLatestIndices, latestIndexDate, latestIndexValues } = this.state;
            const hasValues = !!latestIndexValues;
            const showBlockingLoader = loadingLatestIndices && !hasValues;
            const showRefreshLoader = loadingLatestIndices && hasValues;
            return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-field-list agri3-indices-list" },
                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-field-row agri3-indices-header-row" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-label agri3-indices-title" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_27__["default"], { size: 14, strokeWidth: 2.2, "aria-hidden": "true" }),
                        this.tr("indices.title")),
                    latestIndexDate && !loadingLatestIndices && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-value agri3-indices-date" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_28__["default"], { size: 13, strokeWidth: 2, "aria-hidden": "true" }),
                        latestIndexDate))),
                showBlockingLoader ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-indices-loading-container" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_21__["default"], { label: this.tr("indices.loading") }))) : hasValues ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-indices-body${showRefreshLoader ? " agri3-indices-body--loading" : ""}` },
                    showRefreshLoader ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_21__["default"], { label: this.tr("indices.loading") })) : null,
                    AgriPolygon.VEG_INDEX_FIELDS.filter((f) => latestIndexValues[f] != null).map((f) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-field-row agri3-index-row agri3-index-row--${f}`, key: f },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: `agri3-field-label agri3-index-label agri3-index-label--${f}` },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-index-dot", "aria-hidden": "true" }),
                            f.toUpperCase()),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-value" }, latestIndexValues[f].toFixed(4))))))) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_29__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                    this.tr("indices.none")))));
        };
        this.renderChart = () => {
            var _a;
            const config = this.props.config;
            if (!(config === null || config === void 0 ? void 0 : config.chartEnabled))
                return null;
            const chartFields = config.chartFields || [];
            const chartType = config.chartType || "bar";
            const chartTitle = config.chartTitle || "";
            const chartColor = config.chartColor || "#00a8e8";
            const attrs = this.state.selectedAttrs;
            const pinned = this.state.pinToCorner;
            const chartExpanded = pinned || this.state.chartExpanded;
            if (!attrs || chartFields.length === 0)
                return null;
            // Collect numeric data for chart
            const dataPoints = [];
            for (const fieldName of chartFields) {
                const raw = attrs[fieldName];
                const numVal = typeof raw === "number" ? raw : parseFloat(raw);
                if (!isNaN(numVal)) {
                    dataPoints.push({
                        label: this.getFieldAlias(fieldName),
                        value: numVal,
                    });
                }
            }
            if (dataPoints.length === 0)
                return null;
            const chartLabel = chartTitle || ((_a = dataPoints[0]) === null || _a === void 0 ? void 0 : _a.label) || "Grafik";
            const hoverIndex = this.state.chartHoverIndex;
            const svgWidth = 340;
            const svgHeight = 168;
            const padding = { top: 12, right: 12, bottom: 8, left: 40 };
            const chartW = svgWidth - padding.left - padding.right;
            const chartH = svgHeight - padding.top - padding.bottom;
            const maxVal = Math.max(...dataPoints.map((d) => d.value), 0);
            const yMax = this.niceChartMax(maxVal);
            const scaleY = (v) => chartH - (v / yMax) * chartH;
            const isDark = this.state.isDarkTheme;
            const axisColor = isDark ? "rgba(255,255,255,0.55)" : "#94a3b8";
            const gridColor = isDark ? "rgba(255,255,255,0.14)" : "#dbeafe";
            const chartBodyBg = isDark ? "transparent" : "#ffffff";
            const highlightFill = isDark
                ? "rgba(0, 168, 232, 0.12)"
                : "rgba(0, 168, 232, 0.1)";
            const gridLines = 4;
            const gridStep = yMax / gridLines;
            const barLayout = chartType === "bar"
                ? (() => {
                    const barGap = Math.max(6, Math.min(10, chartW / dataPoints.length / 4));
                    const barW = Math.max(8, (chartW - (dataPoints.length - 1) * barGap) / dataPoints.length);
                    return dataPoints.map((d, i) => {
                        const x = padding.left + i * (barW + barGap);
                        const barH = Math.max(2, (d.value / yMax) * chartH);
                        const y = padding.top + chartH - barH;
                        return Object.assign(Object.assign({}, d), { i, x, y, barW, barH, centerX: x + barW / 2 });
                    });
                })()
                : [];
            const linePoints = chartType === "line"
                ? (() => {
                    const stepX = dataPoints.length > 1 ? chartW / (dataPoints.length - 1) : 0;
                    return dataPoints.map((d, i) => (Object.assign(Object.assign({}, d), { i, x: padding.left +
                            (dataPoints.length > 1 ? i * stepX : chartW / 2), y: padding.top + scaleY(d.value) })));
                })()
                : [];
            const hoverPoint = hoverIndex != null
                ? chartType === "bar"
                    ? barLayout[hoverIndex]
                    : linePoints[hoverIndex]
                : null;
            const tooltipLeftPct = hoverPoint
                ? Math.max(8, Math.min(82, (hoverPoint.x / svgWidth) * 100))
                : 0;
            const tooltipTopPct = hoverPoint
                ? Math.max(6, Math.min(58, (hoverPoint.y / svgHeight) * 100 - 18))
                : 0;
            const chartSvg = (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("svg", { width: "100%", viewBox: `0 0 ${svgWidth} ${svgHeight}`, className: "agri3-chart-svg", style: { background: chartBodyBg } },
                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("rect", { x: padding.left, y: padding.top, width: chartW, height: chartH, fill: isDark ? "rgba(255,255,255,0.02)" : "#ffffff", rx: 6 }),
                Array.from({ length: gridLines + 1 }).map((_, i) => {
                    const val = gridStep * i;
                    const y = padding.top + scaleY(val);
                    return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("g", { key: `grid-${i}` },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("line", { x1: padding.left, y1: y, x2: svgWidth - padding.right, y2: y, stroke: gridColor, strokeWidth: 1, strokeDasharray: "3 5" }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("text", { x: padding.left - 8, y: y + 4, fill: axisColor, fontSize: 10, textAnchor: "end" }, this.formatChartTick(val))));
                }),
                chartType === "bar" &&
                    barLayout.map((bar) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("g", { key: `bar-${bar.i}` },
                        hoverIndex === bar.i && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("rect", { x: bar.x - 3, y: padding.top, width: bar.barW + 6, height: chartH, fill: highlightFill, rx: 5 })),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("path", { d: this.buildRoundedBarPath(bar.x, bar.y, bar.barW, bar.barH, 5), fill: chartColor, opacity: hoverIndex == null || hoverIndex === bar.i ? 1 : 0.45, className: "agri3-chart-bar", onMouseEnter: () => this.setChartHover(bar.i) }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("rect", { x: bar.x, y: padding.top, width: bar.barW, height: chartH, fill: "transparent", onMouseEnter: () => this.setChartHover(bar.i) })))),
                chartType === "line" && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("g", null,
                    hoverIndex != null && linePoints[hoverIndex] && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("line", { x1: linePoints[hoverIndex].x, y1: padding.top, x2: linePoints[hoverIndex].x, y2: padding.top + chartH, stroke: chartColor, strokeWidth: 1.5, opacity: 0.35 })),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("path", { d: this.buildSmoothLinePath(linePoints), fill: "none", stroke: chartColor, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" }),
                    linePoints.map((p) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("g", { key: `pt-${p.i}` },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("circle", { cx: p.x, cy: p.y, r: hoverIndex === p.i ? 5.5 : 4, fill: isDark ? "#0b1a30" : "#ffffff", stroke: chartColor, strokeWidth: hoverIndex === p.i ? 2.5 : 2, className: "agri3-chart-point", onMouseEnter: () => this.setChartHover(p.i) }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("circle", { cx: p.x, cy: p.y, r: 12, fill: "transparent", onMouseEnter: () => this.setChartHover(p.i) }))))))));
            const chartBody = (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-body", onMouseLeave: this.clearChartHover },
                hoverPoint && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-tooltip", style: {
                        left: `${tooltipLeftPct}%`,
                        top: `${tooltipTopPct}%`,
                    } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-tooltip-label" }, hoverPoint.label),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-tooltip-value" }, this.formatChartTooltipValue(hoverPoint.value)))),
                chartSvg));
            if (!chartExpanded) {
                return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { type: "button", className: "agri3-chart-trigger", onClick: this.toggleChartExpanded },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-icon" }, this.renderChartIcon(chartType)),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-label" }, chartLabel),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-chevron", "aria-hidden": "true" }, "\u25BE")));
            }
            return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-panel" },
                !pinned ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { type: "button", className: "agri3-chart-panel-header", onClick: this.toggleChartExpanded },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-icon" }, this.renderChartIcon(chartType)),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-label" }, chartLabel),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-chevron is-open", "aria-hidden": "true" }, "\u25B4"))) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-panel-header agri3-chart-panel-header--static" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-icon" }, this.renderChartIcon(chartType)),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-chart-trigger-label" }, chartLabel))),
                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-chart-container" }, chartBody)));
        };
        /* ---------------- Popup UI ---------------- */
        this.renderPopup = () => {
            var _a, _b, _c, _d, _e;
            const { selectedAttrs, selectedOID, loading, error, showPopup, popupMinimized, popupPosition, loadingAttachments, attachments, attachmentsError, pinToCorner, } = this.state;
            if (!showPopup)
                return null;
            const fields = (((_a = this.props.config) === null || _a === void 0 ? void 0 : _a.fieldsToShow) || [])
                .map((n) => this.resolveFieldName(n) || n)
                .filter(Boolean);
            const title = this.tr("title.attributes");
            const view = (_b = this.state.jimuMapView) === null || _b === void 0 ? void 0 : _b.view;
            const layoutPos = popupPosition;
            if (popupMinimized) {
                const viewForChip = view || ((_c = this.state.jimuMapView) === null || _c === void 0 ? void 0 : _c.view) || null;
                const mapRect = viewForChip ? this.getMapAreaRect(viewForChip) : null;
                const chipStyle = mapRect
                    ? {
                        position: "fixed",
                        right: Math.max(8, (typeof window !== "undefined" ? window.innerWidth : mapRect.right) -
                            mapRect.right +
                            this.DASHBOARD_POPUP_VERTICAL_INSET),
                        top: mapRect.top + this.DASHBOARD_POPUP_VERTICAL_INSET,
                        left: "auto",
                        bottom: "auto",
                        transform: "none",
                    }
                    : {
                        position: "fixed",
                        right: this.DASHBOARD_POPUP_VERTICAL_INSET,
                        top: this.DASHBOARD_POPUP_VERTICAL_INSET,
                        left: "auto",
                        bottom: "auto",
                    };
                const stopMapHit = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                };
                return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-popup-minimized ${pinToCorner ? "is-pinned" : "is-floating"}`, style: chipStyle, ref: this._popupRef, onMouseDown: stopMapHit, onPointerDown: stopMapHit, onClick: stopMapHit },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { type: "button", className: "agri3-popup-minimized-btn", onMouseDown: stopMapHit, onPointerDown: stopMapHit, onClick: (e) => {
                            stopMapHit(e);
                            this.expandPopup();
                        }, title: this.tr("action.expand"), "aria-label": this.tr("action.expand") },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-popup-minimized-accent", "aria-hidden": "true" }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-popup-minimized-title" }, title),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_30__["default"], { className: "agri3-popup-minimized-icon", size: 16, strokeWidth: 2.4, "aria-hidden": "true" }))));
            }
            const { width: popupWidth, height: popupHeight } = this.getPopupDimensions(view || null, pinToCorner, layoutPos);
            const dimensionStyle = {
                width: `${popupWidth}px`,
                minWidth: `${popupWidth}px`,
                maxWidth: `${popupWidth}px`,
                height: `${popupHeight}px`,
                maxHeight: `${popupHeight}px`,
            };
            const stylePinned = layoutPos
                ? Object.assign({ left: layoutPos.x, top: layoutPos.y, transform: "none" }, dimensionStyle) : Object.assign({}, dimensionStyle);
            const styleFree = Object.assign({ left: (layoutPos === null || layoutPos === void 0 ? void 0 : layoutPos.x) || "50%", top: (layoutPos === null || layoutPos === void 0 ? void 0 : layoutPos.y) || "50%", transform: !layoutPos ? "translate(-50%, -50%)" : "none" }, dimensionStyle);
            const popupStyle = pinToCorner ? stylePinned : styleFree;
            const showAttachments = ((_e = (_d = this.props.config) === null || _d === void 0 ? void 0 : _d.settings) === null || _e === void 0 ? void 0 : _e.showAttachments) !== false;
            const hasAttachments = ((attachments === null || attachments === void 0 ? void 0 : attachments.length) || 0) > 0;
            return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-popup-direct ${pinToCorner ? "is-pinned" : "is-floating"}`, style: popupStyle, ref: this._popupRef },
                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-popup-header", onMouseDown: this.onPopupHeaderMouseDown },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { className: `agri3-popup-pin${pinToCorner ? " active" : ""}`, onClick: this.togglePinToCorner, title: pinToCorner ? this.tr("action.unpin") : this.tr("action.pin"), "aria-pressed": pinToCorner, type: "button" }, pinToCorner ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_31__["default"], { size: 15, strokeWidth: 2.2, "aria-hidden": "true" })) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_32__["default"], { size: 15, strokeWidth: 2.2, "aria-hidden": "true" }))),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("h2", { className: "agri3-popup-title" }, title),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { type: "button", className: "agri3-popup-close", onClick: this.minimizePopup, "aria-label": this.tr("action.minimize"), title: this.tr("action.minimize") },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_33__["default"], { size: 16, strokeWidth: 2.4, "aria-hidden": "true" }))),
                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-popup-content" },
                    error && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-error-container" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_34__["default"], { className: "agri3-error-icon", size: 20, strokeWidth: 2.2, "aria-hidden": "true" }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-error-title" }, this.tr("status.warning")),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-error-message" }, error))),
                    loading && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-loading-container" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_21__["default"], { label: this.tr("status.loadingFeature") }))),
                    !loading && selectedAttrs && fields.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-field-list" },
                        fields
                            .filter((name) => {
                            if (!selectedAttrs.hasOwnProperty(name))
                                return false;
                            const val = selectedAttrs[name];
                            if (val == null || val === "")
                                return false;
                            if (typeof val === "string" && !val.trim())
                                return false;
                            return true;
                        })
                            .map((name) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-field-row", key: name },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-label" }, this.getFieldAlias(name)),
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-value" }, this.formatValue(name, selectedAttrs[name]))))),
                        fields.filter((name) => selectedAttrs.hasOwnProperty(name) &&
                            selectedAttrs[name] != null &&
                            selectedAttrs[name] !== "").length === 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_29__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                            this.tr("status.noConfiguredData"))))),
                    !loading && selectedAttrs && fields.length === 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_35__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                        this.tr("status.noFields"))),
                    !loading && selectedAttrs && this.renderLatestIndices(),
                    !loading && selectedAttrs && this.renderChart(),
                    showAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-header" },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-title" },
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_36__["default"], { size: 15, strokeWidth: 2.2, "aria-hidden": "true" }),
                                this.tr("attachments.title"),
                                " ",
                                hasAttachments ? `(${attachments.length})` : "")),
                        loadingAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-loading-container agri3-loading-container--compact", style: { marginTop: 8 } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_21__["default"], { label: this.tr("status.loadingAttachments") }))),
                        !loadingAttachments && attachmentsError && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting", style: { marginTop: 6 }, title: attachmentsError },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_34__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                            this.tr("status.attachmentsError") || attachmentsError)),
                        !loadingAttachments && !attachmentsError && !hasAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting", style: { marginTop: 6 } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_36__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                            this.tr("status.noAttachments"))),
                        !loadingAttachments && hasAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-body" },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-images agri3-grid" }, attachments
                                .filter((a) => a.previewObjectUrl)
                                .map((a) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("a", { key: `img-${a.id}`, href: a.url, target: "_blank", rel: "noopener noreferrer", className: "agri3-attachment-thumb agri3-card", title: a.name || this.tr("attachment.imageFallback"), download: a.name || undefined },
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("img", { src: a.previewObjectUrl, alt: a.name || this.tr("attachment.imageFallback") }),
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-thumb-caption", title: a.name || "" }, a.name || this.tr("attachment.imageFallback")))))),
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-files" }, attachments
                                .filter((a) => !a.previewObjectUrl)
                                .map((a) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachment-file agri3-card", key: `file-${a.id}` },
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachment-file-top" },
                                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachment-file-name", title: a.name || "" },
                                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_37__["default"], { size: 14, strokeWidth: 2.2, "aria-hidden": "true" }),
                                        a.name ||
                                            this.tr("attachment.fileFallback", {
                                                id: a.id,
                                            })),
                                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("a", { className: "agri3-attachment-download", href: a.url, target: "_blank", rel: "noopener noreferrer", download: a.name || undefined },
                                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_38__["default"], { size: 13, strokeWidth: 2.2, "aria-hidden": "true" }),
                                        this.tr("attachment.download"))),
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachment-file-meta" },
                                    (a.contentType || "").split("/").pop() || "",
                                    " ",
                                    a.size ? `• ${this.bytesToSize(a.size)}` : ""))))))))),
                    !loading && !selectedAttrs && !error && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_39__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                        this.tr("status.clickPolygon"))))));
        };
        this.dataSourceEngine = (0,_gis_agri_engine_registry__WEBPACK_IMPORTED_MODULE_12__.getSharedAgriDataSourceEngine)(props.id);
        this.state = {
            currentLang: (0,_messages__WEBPACK_IMPORTED_MODULE_24__.getInitialLang)(),
            isDarkTheme: this.getResolvedTheme(),
            jimuMapView: null,
            featureLayers: [],
            layerKeyToDsId: {},
            dataSourcesById: {},
            lastClickedDsId: null,
            lastClickedLayerKey: null,
            pinToCorner: true,
            loadingAttachments: false,
            attachments: [],
            attachmentsError: null,
            attachmentsExpanded: false,
            loading: false,
            error: null,
            selectedAttrs: null,
            selectedOID: null,
            objectIdField: null,
            showPopup: false,
            popupMinimized: false,
            popupPosition: null,
            clickScreenPoint: null,
            debugInfo: {},
            chartExpanded: false,
            chartHoverIndex: null,
            loadingLatestIndices: false,
            latestIndexDate: null,
            latestIndexValues: null,
        };
    }
    componentDidMount() {
        this._isMounted = true;
        this.setupThemeObserver();
        const isDarkTheme = this.getResolvedTheme();
        if (isDarkTheme !== this.state.isDarkTheme) {
            this.setState({ isDarkTheme });
        }
        document.addEventListener("themeChanged", this.handleThemeChange);
        document.addEventListener("languageChanged", this.handleLanguageChange);
        document.addEventListener("mousedown", this.handleOutsideClick);
        this._unbindMasterFilter = (0,_data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_20__.bindMasterFilter)(this.handleMasterFilterChanged);
        document.addEventListener("widgetSelectionChanged", this.handleWidgetSelectionChanged);
        window.addEventListener("resize", this.schedulePopupLayout);
        window.addEventListener(_gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.AGRI_MAP_VIEW_READY_EVENT, this.handleMapViewReady);
        window.addEventListener(_gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.AGRI_MAP_CLICK_EVENT, this.handleSharedMapClick);
        window.addEventListener(_gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.AGRI_XY_PAGE_CLOSED_EVENT, this.handleXyPageClosed);
        if (!this.isDashboardEmbedded()) {
            window.addEventListener("scroll", this.schedulePopupLayout, true);
        }
        this.scheduleMapViewFallback();
        this.mapClickBootstrapTimer = setInterval(() => {
            if (this.ensureMapClickAttached() && this.mapClickBootstrapTimer) {
                clearInterval(this.mapClickBootstrapTimer);
                this.mapClickBootstrapTimer = null;
            }
        }, 2500);
        (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("AgriPolygon mounted", {
            widgetId: this.props.id,
            embedded: this.isDashboardEmbedded(),
            mapWidgetId: this.getLinkedMapWidgetId(),
            useDataSourceIds: (0,_gis_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources),
        });
    }
    componentWillUnmount() {
        var _a, _b;
        this._isMounted = false;
        if (this.state.showPopup) {
            this.broadcastPopupVisibility(false);
        }
        document.removeEventListener("themeChanged", this.handleThemeChange);
        document.removeEventListener("languageChanged", this.handleLanguageChange);
        this.detachMapClick();
        this.cleanupHighlight();
        document.removeEventListener("mousedown", this.handleOutsideClick);
        (_a = this._unbindMasterFilter) === null || _a === void 0 ? void 0 : _a.call(this);
        this._unbindMasterFilter = null;
        document.removeEventListener("widgetSelectionChanged", this.handleWidgetSelectionChanged);
        window.removeEventListener("resize", this.schedulePopupLayout);
        window.removeEventListener(_gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.AGRI_MAP_VIEW_READY_EVENT, this.handleMapViewReady);
        window.removeEventListener(_gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.AGRI_MAP_CLICK_EVENT, this.handleSharedMapClick);
        window.removeEventListener(_gis_agri_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.AGRI_XY_PAGE_CLOSED_EVENT, this.handleXyPageClosed);
        if (this.mapViewFallbackTimer)
            clearTimeout(this.mapViewFallbackTimer);
        if (this.mapInitRetryTimer)
            clearTimeout(this.mapInitRetryTimer);
        if (this.mapClickBootstrapTimer)
            clearInterval(this.mapClickBootstrapTimer);
        window.removeEventListener("scroll", this.schedulePopupLayout, true);
        if (this._popupLayoutTimer)
            clearTimeout(this._popupLayoutTimer);
        if (this._popupLayoutRaf)
            cancelAnimationFrame(this._popupLayoutRaf);
        (_b = this.mapAreaResizeObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
        this.mapAreaResizeObserver = null;
        window.removeEventListener("mousemove", this.onPopupDragMove);
        window.removeEventListener("mouseup", this.onPopupDragEnd);
        if (this.themeObserver) {
            this.themeObserver.disconnect();
            this.themeObserver = null;
        }
        this.revokeAllAttachmentUrls();
        this._featureQueryCache.clear();
    }
    pruneFeatureQueryCache(now = Date.now()) {
        for (const [key, entry] of this._featureQueryCache) {
            if (entry.expires <= now)
                this._featureQueryCache.delete(key);
        }
    }
    getFeatureQueryCacheKey(layer, oidField, oid, outFields) {
        const layerKey = String((layer === null || layer === void 0 ? void 0 : layer.url) || layer.id || layer.title || "");
        const fieldsKey = Array.from(new Set(outFields.map((f) => String(f))))
            .sort()
            .join(",");
        return `${layerKey}|${oidField}|${String(oid)}|${fieldsKey}`;
    }
    /** Snapshot the live definitionExpression of each layer (pre-hitTest). */
    snapshotDefinitionExpressions(layers) {
        var _a;
        const snapshot = new Map();
        for (const layer of layers) {
            if (!layer || snapshot.has(layer))
                continue;
            try {
                snapshot.set(layer, String((_a = layer.definitionExpression) !== null && _a !== void 0 ? _a : ""));
            }
            catch (_b) {
                /* ignore */
            }
        }
        return snapshot;
    }
    /**
     * Restore any definitionExpression that drifted (was cleared by hitTest /
     * identify / load rehydration) synchronously, before the unfiltered
     * MapImage export can be painted.
     */
    restoreDriftedDefinitionExpressions(snapshot) {
        snapshot.forEach((expression, layer) => {
            var _a;
            try {
                const current = String((_a = layer.definitionExpression) !== null && _a !== void 0 ? _a : "");
                if (current !== expression) {
                    layer.definitionExpression = expression;
                    (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("definitionExpression drift restored", {
                        layer: (layer === null || layer === void 0 ? void 0 : layer.title) || (layer === null || layer === void 0 ? void 0 : layer.url) || (layer === null || layer === void 0 ? void 0 : layer.id),
                        drifted: current || "<empty>",
                        restored: expression || "<empty>",
                    });
                }
            }
            catch (_b) {
                /* ignore */
            }
        });
    }
    queryFeatureByObjectIdCached(layer, oidField, oid, outFields) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const now = Date.now();
            this.pruneFeatureQueryCache(now);
            const key = this.getFeatureQueryCacheKey(layer, oidField, oid, outFields);
            const hit = this._featureQueryCache.get(key);
            if (hit && hit.expires > now) {
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("feature-query:cache-hit", {
                    layer: layer.title || layer.url || layer.id,
                    oidField,
                    oid,
                    outFieldCount: outFields.length,
                });
                return hit.value;
            }
            const job = (() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const liveDefinitionExpression = String(layer.definitionExpression || "");
                // Calling queryFeatures on a live MapImage sublayer can rehydrate that
                // sublayer and temporarily clear its runtime definitionExpression. The
                // map then renders every district until Localization's guard restores
                // the filter. Query an off-map FeatureLayer client instead.
                const detachedQueryLayer = yield this.getDetachedQueryLayer(layer);
                const queryLayer = detachedQueryLayer || layer;
                const q = queryLayer.createQuery();
                q.where = `${oidField} = ${Number(oid)}`;
                q.outFields = outFields;
                q.returnGeometry = true;
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("feature-query:request", {
                    layer: layer.title || layer.url || layer.id,
                    url: layer.url || null,
                    where: q.where,
                    outFields,
                    returnGeometry: true,
                });
                const res = yield queryLayer.queryFeatures(q);
                // Defensive restore for the no-URL fallback. The detached path above
                // never touches the live layer.
                if (queryLayer === layer &&
                    String(layer.definitionExpression || "") !==
                        liveDefinitionExpression) {
                    layer.definitionExpression = liveDefinitionExpression;
                }
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("feature-query:response", {
                    layer: layer.title || layer.url || layer.id,
                    featureCount: ((_a = res.features) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    hasGeometry: Boolean((_c = (_b = res.features) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.geometry),
                    attributeKeys: Object.keys(((_e = (_d = res.features) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.attributes) || {}),
                    queryMode: queryLayer === layer ? "live-fallback" : "detached",
                    liveDefinitionExpression: layer.definitionExpression || null,
                });
                return ((_f = res.features) === null || _f === void 0 ? void 0 : _f[0]) || null;
            }))();
            this._featureQueryCache.set(key, {
                expires: now + this._featureQueryCacheTtlMs,
                value: job,
            });
            try {
                const feature = yield job;
                if (!feature && ((_a = this._featureQueryCache.get(key)) === null || _a === void 0 ? void 0 : _a.value) === job) {
                    this._featureQueryCache.delete(key);
                }
                return feature;
            }
            catch (err) {
                if (((_b = this._featureQueryCache.get(key)) === null || _b === void 0 ? void 0 : _b.value) === job) {
                    this._featureQueryCache.delete(key);
                }
                throw err;
            }
        });
    }
    /* --- pinned popup helpers --- */
    isDashboardEmbedded() {
        return String(this.props.id || "").endsWith("-popup");
    }
    /** Crop overlay top in viewport coords; null when not used. */
    getCropOverlayTop() {
        if (!this.isDashboardEmbedded())
            return null;
        const cropEl = document.querySelector(".agri-dashboard-crop-overlay.agri-dashboard-managed-crop");
        if (cropEl) {
            const rect = cropEl.getBoundingClientRect();
            if (rect.height > 0 && Number.isFinite(rect.top)) {
                return rect.top;
            }
        }
        return null;
    }
    getMapAreaRect(view) {
        if (this.isDashboardEmbedded()) {
            const mapSlot = document.querySelector(".agri-dashboard-map-slot");
            if (mapSlot) {
                const slotRect = mapSlot.getBoundingClientRect();
                if (slotRect.width > 40 && slotRect.height > 40) {
                    return slotRect;
                }
            }
        }
        return view.container.getBoundingClientRect();
    }
    observeMapAreaResize(view) {
        var _a;
        (_a = this.mapAreaResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.mapAreaResizeObserver = null;
        if (typeof ResizeObserver === "undefined")
            return;
        const target = this.isDashboardEmbedded()
            ? (document.querySelector(".agri-dashboard-map-slot") || view.container)
            : view.container;
        if (!target)
            return;
        this.mapAreaResizeObserver = new ResizeObserver(() => {
            this.schedulePopupLayout();
        });
        this.mapAreaResizeObserver.observe(target);
    }
    getEffectiveMapBottom(view, gap = 4) {
        const rect = this.getMapAreaRect(view);
        const cropTop = this.getCropOverlayTop();
        if (cropTop != null && cropTop > rect.top && cropTop <= rect.bottom + 2) {
            return cropTop - gap;
        }
        return rect.bottom - gap;
    }
    measurePopupHeight(popupEl) {
        const header = popupEl.querySelector(".agri3-popup-header");
        const content = popupEl.querySelector(".agri3-popup-content");
        const headerH = (header === null || header === void 0 ? void 0 : header.offsetHeight) || 0;
        const contentH = (content === null || content === void 0 ? void 0 : content.scrollHeight) || (content === null || content === void 0 ? void 0 : content.offsetHeight) || 0;
        const natural = headerH + contentH;
        if (natural > 0)
            return Math.ceil(natural);
        const rect = popupEl.getBoundingClientRect();
        return rect.height > 0 ? Math.ceil(rect.height) : Math.ceil(popupEl.scrollHeight);
    }
    popupPositionsEqual(a, b, epsilon = 1) {
        if (!a)
            return false;
        return (Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon);
    }
    /** ✅ NEW: safely detect whether this layer supports attachments */
    layerSupportsAttachments(layer) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!layer)
            return false;
        // Different JSAPI/EB builds expose it slightly differently
        const anyLayer = layer;
        // Common signals
        if (typeof anyLayer.supportsAttachments === "boolean")
            return anyLayer.supportsAttachments;
        const cap = anyLayer.capabilities;
        const supported = (_f = (_d = (_b = (_a = cap === null || cap === void 0 ? void 0 : cap.data) === null || _a === void 0 ? void 0 : _a.supportsAttachments) !== null && _b !== void 0 ? _b : (_c = cap === null || cap === void 0 ? void 0 : cap.data) === null || _c === void 0 ? void 0 : _c.supportsAttachment) !== null && _d !== void 0 ? _d : (_e = cap === null || cap === void 0 ? void 0 : cap.operations) === null || _e === void 0 ? void 0 : _e.supportsAttachments) !== null && _f !== void 0 ? _f : (_g = cap === null || cap === void 0 ? void 0 : cap.operations) === null || _g === void 0 ? void 0 : _g.supportsAttachment;
        if (typeof supported === "boolean")
            return supported;
        // Unknown => assume false to avoid ugly warning
        return false;
    }
    /* ---------------- Map wiring ---------------- */
    getLinkedMapWidgetId() {
        var _a, _b;
        const ids = this.props.useMapWidgetIds;
        const list = (ids === null || ids === void 0 ? void 0 : ids.length)
            ? ((_a = ids.asMutable) === null || _a === void 0 ? void 0 : _a.call(ids)) || ((_b = ids.toArray) === null || _b === void 0 ? void 0 : _b.call(ids)) || ids
            : [];
        const first = Array.isArray(list) ? list[0] : null;
        if (first)
            return String(first);
        const hostId = String(this.props.id || "").replace(/-popup$/, "");
        return (0,_gis_agri_linked_map_layout__WEBPACK_IMPORTED_MODULE_11__.discoverMapWidgetIdInApp)({
            hostWidgetId: hostId,
            getSlotElement: () => {
                if (hostId) {
                    const scoped = document.querySelector(`.widget-renderer[data-widgetid="${hostId}"] .agri-dashboard-map-slot`);
                    if (scoped instanceof HTMLElement)
                        return scoped;
                }
                const fallback = document.querySelector(".agri-dashboard-map-slot");
                return fallback instanceof HTMLElement ? fallback : null;
            },
        });
    }
    getMapViewFromManager(mapWidgetId) {
        var _a, _b, _c;
        try {
            const manager = jimu_arcgis__WEBPACK_IMPORTED_MODULE_6__.MapViewManager.getInstance();
            if (!manager)
                return null;
            if (mapWidgetId) {
                const group = manager.getJimuMapViewGroup(mapWidgetId);
                const active = (_a = group === null || group === void 0 ? void 0 : group.getActiveJimuMapView) === null || _a === void 0 ? void 0 : _a.call(group);
                if (active === null || active === void 0 ? void 0 : active.view)
                    return active;
                const groupViews = ((_b = group === null || group === void 0 ? void 0 : group.getAllJimuMapViews) === null || _b === void 0 ? void 0 : _b.call(group)) || [];
                const firstLoaded = groupViews.find((view) => view === null || view === void 0 ? void 0 : view.view);
                if (firstLoaded)
                    return firstLoaded;
            }
            const all = ((_c = manager.getAllJimuMapViews) === null || _c === void 0 ? void 0 : _c.call(manager)) || [];
            return (all.find((view) => (view === null || view === void 0 ? void 0 : view.view) && (view === null || view === void 0 ? void 0 : view.isActive) !== false) ||
                all.find((view) => view === null || view === void 0 ? void 0 : view.view) ||
                null);
        }
        catch (_d) {
            return null;
        }
    }
    expandUseDataSourceEntries(useList) {
        var _a;
        const dsMgr = jimu_core__WEBPACK_IMPORTED_MODULE_7__.DataSourceManager.getInstance();
        const out = [];
        const seen = new Set();
        for (const uds of useList) {
            const id = String((uds === null || uds === void 0 ? void 0 : uds.dataSourceId) || "");
            if (!id || seen.has(id))
                continue;
            seen.add(id);
            out.push(uds);
            const ds = dsMgr.getDataSource(id);
            const children = ((_a = ds === null || ds === void 0 ? void 0 : ds.getChildDataSources) === null || _a === void 0 ? void 0 : _a.call(ds)) || [];
            for (const child of children) {
                const childId = String((child === null || child === void 0 ? void 0 : child.id) || "");
                if (!childId || seen.has(childId))
                    continue;
                seen.add(childId);
                out.push({ dataSourceId: childId, mainDataSourceId: id });
            }
        }
        return out;
    }
    attachMapClick(jmv) {
        this.detachMapClick();
        const view = jmv === null || jmv === void 0 ? void 0 : jmv.view;
        if (!view || typeof view.on !== "function")
            return;
        this._clickHandle = view.on("click", this.onViewClick);
    }
    detachMapClick() {
        var _a;
        if ((_a = this._clickHandle) === null || _a === void 0 ? void 0 : _a.remove)
            this._clickHandle.remove();
        this._clickHandle = null;
    }
    isHighlightLayer(layer) {
        const id = String((layer === null || layer === void 0 ? void 0 : layer.id) || "").toLowerCase();
        const title = String((layer === null || layer === void 0 ? void 0 : layer.title) || "").toLowerCase();
        return id === "agri-polygon-highlight" ||
            title.includes("selected polygon highlight") ||
            title.includes("sketch") ||
            // Viloyat/tuman outline + label layers sit on top of the fields; a
            // hitTest returns their polygon first and it has no uniqueid.
            (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isAgriAdminBoundaryLayer)(layer);
    }
    /** A sublayer is clickable only when it and every parent are visible. */
    isLayerEffectivelyVisible(layer, view) {
        if (!layer || this.isHighlightLayer(layer))
            return false;
        const seen = new Set();
        let current = layer;
        while (current && !seen.has(current)) {
            seen.add(current);
            if (current.visible === false)
                return false;
            current = current.parent || current.layer || null;
        }
        const scale = Number((view === null || view === void 0 ? void 0 : view.scale) || 0);
        const minScale = Number(layer.minScale || 0);
        const maxScale = Number(layer.maxScale || 0);
        if (scale > 0 && minScale > 0 && scale > minScale)
            return false;
        if (scale > 0 && maxScale > 0 && scale < maxScale)
            return false;
        return String(layer.definitionExpression || "1=1").trim() !== "1=0";
    }
    isAgriculturalFieldLayer(layer) {
        var _a;
        if (!layer)
            return false;
        // Group Layer folders are not field polygons — never accept them for click.
        if ((0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isMapImageGroupSublayer)(layer))
            return false;
        // "Agri district borders" / Tuman_chegara outlines match the \bagri\b
        // heuristic below but are administrative polygons, not fields.
        if ((0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isAgriAdminBoundaryLayer)(layer))
            return false;
        // Prefer queryable layers, but title/url identity is enough to accept a
        // live MapImage leaf that is still hydrating its query methods.
        const identity = `${layer.title || ""} ${layer.url || ""} ${((_a = layer.parent) === null || _a === void 0 ? void 0 : _a.title) || ""}`.toLowerCase();
        const looksAgri = /\bagri\b|agriculture|qishloq/.test(identity);
        if (!(0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isQueryableFieldLayer)(layer) && !looksAgri)
            return false;
        const geometryType = String(layer.geometryType || "").toLowerCase();
        if (geometryType && geometryType !== "polygon")
            return false;
        const fields = Array.isArray(layer.fields) ? layer.fields : [];
        const names = new Set(fields.map((field) => String((field === null || field === void 0 ? void 0 : field.name) || "").toLowerCase()));
        if (names.has("uniqueid") || names.has("crop_id") || names.has("turi"))
            return true;
        // looksAgri alone is OK for a hydrating leaf; groups already rejected above.
        return looksAgri;
    }
    isAgriculturalFieldGraphic(graphic, layer) {
        var _a;
        const geometryType = String(((_a = graphic === null || graphic === void 0 ? void 0 : graphic.geometry) === null || _a === void 0 ? void 0 : _a.type) || "").toLowerCase();
        if (geometryType && geometryType !== "polygon" && geometryType !== "multipolygon")
            return false;
        const attrs = (graphic === null || graphic === void 0 ? void 0 : graphic.attributes) || {};
        const keys = new Set(Object.keys(attrs).map((key) => key.toLowerCase()));
        return keys.has("uniqueid") || keys.has("crop_id") || keys.has("turi") ||
            this.isAgriculturalFieldLayer(layer);
    }
    getClickTargetLayers(view) {
        var _a, _b;
        const { featureLayers, layerKeyToDsId } = this.state;
        const dsKeys = Object.keys(layerKeyToDsId || {});
        const map = view.map;
        const configuredLayers = featureLayers || [];
        const liveRoots = ((_b = (_a = map === null || map === void 0 ? void 0 : map.allLayers) === null || _a === void 0 ? void 0 : _a.toArray) === null || _b === void 0 ? void 0 : _b.call(_a)) || [];
        // MapImage parents are not queryable — expand to agri/feature sublayers.
        const liveMapLayers = [];
        const seen = new Set();
        const pushLive = (layer) => {
            if (!layer || !(0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.isQueryableFieldLayer)(layer))
                return;
            const key = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(layer) ||
                String(layer.url || layer.id || "");
            if (!key || seen.has(key))
                return;
            seen.add(key);
            liveMapLayers.push(layer);
        };
        for (const root of liveRoots) {
            // Walk groups fully — never push the Group Layer node itself
            // (FeatureLayer#load fails with unsupported-type "Group Layer").
            for (const leaf of (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.collectQueryableFieldLayers)(root)) {
                pushLive(leaf);
            }
        }
        const candidates = Array.from(new Set([
            ...configuredLayers,
            ...liveMapLayers,
        ]));
        return candidates
            .map((layer) => this.toLiveMapLayer(layer, map) || layer)
            .filter((layer) => {
            if (!this.isLayerEffectivelyVisible(layer, view))
                return false;
            if (!this.isAgriculturalFieldLayer(layer))
                return false;
            const key = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(layer) ||
                String(layer.url || layer.id || "");
            if (this.isDashboardEmbedded())
                return true;
            if (!dsKeys.length)
                return true;
            return !!layerKeyToDsId[key];
        });
    }
    resolveClickLayers(view, jmv) {
        return __awaiter(this, void 0, void 0, function* () {
            let layers = this.getClickTargetLayers(view);
            if (layers.length)
                return layers;
            yield this.initializeMapConnection(jmv);
            layers = this.getClickTargetLayers(view);
            if (layers.length)
                return layers;
            // Last resort: scan map again after layers may have finished loading
            // (portal / MapImage sublayers often aren't queryable at first connect).
            try {
                const mapLayers = (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAllFeatureLayersFromMap)(view.map);
                for (const layer of mapLayers) {
                    yield (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.safeLoadMapLayer)(layer);
                }
            }
            catch (_a) {
                /* ignore */
            }
            return this.getClickTargetLayers(view);
        });
    }
    /** Case-insensitive attribute lookup — the polygon layer's join field casing is not guaranteed. */
    findAttributeValueCaseInsensitive(attributes, fieldName) {
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.findAttributeValueCaseInsensitive)(attributes, fieldName);
    }
    /**
     * Agri_table_data is an external Table (no geometry) — the map click still
     * resolves the polygon feature for highlight/zoom, but the displayed
     * attributes come from Agri_table_data, joined by uniqueid.
     */
    resolveDisplayAttrs(polygonAttributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const joinValue = this.findAttributeValueCaseInsensitive(polygonAttributes, _gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__.AGRI_TABLE_JOIN_FIELD);
            if (joinValue == null || String(joinValue).trim() === "") {
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("agri-table-join:SKIP-no-uniqueid", {
                    polygonAttributeKeys: Object.keys(polygonAttributes || {}),
                });
                return polygonAttributes || {};
            }
            try {
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("agri-table-join:request", {
                    uniqueid: String(joinValue),
                    source: "Agri_table_data/FeatureServer/2",
                });
                const agriRecord = yield (0,_gis_agri_table_data_source__WEBPACK_IMPORTED_MODULE_19__.queryAgriRecordByUniqueId)(String(joinValue));
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickDebug)("agri-table-join:response", {
                    uniqueid: String(joinValue),
                    found: Boolean(agriRecord),
                    attributeKeys: Object.keys(agriRecord || {}),
                });
                if (agriRecord) {
                    // Keep polygon-only values (for example st_area(shape)) while allowing
                    // the joined Agri table to provide/override the popup's business data.
                    return Object.assign(Object.assign({}, (polygonAttributes || {})), agriRecord);
                }
            }
            catch (e) {
                (0,_gis_agri_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.agriMapClickWarn)("Agri_table_data lookup failed", {
                    uniqueId: joinValue,
                    error: (e === null || e === void 0 ? void 0 : e.message) || String(e),
                });
            }
            return polygonAttributes || {};
        });
    }
    /* ---------------- Attachments helpers ---------------- */
    fetchAttachmentPreview(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield (0,esri_request__WEBPACK_IMPORTED_MODULE_3__["default"])(url, {
                responseType: "blob",
                query: {},
            });
            return (resp === null || resp === void 0 ? void 0 : resp.data) instanceof Blob ? resp.data : resp;
        });
    }
    revokeAllAttachmentUrls() {
        try {
            const atts = this.state.attachments || [];
            atts.forEach((a) => {
                if (a.previewObjectUrl)
                    URL.revokeObjectURL(a.previewObjectUrl);
            });
        }
        catch (_a) { }
    }
    isImageContentType(ct) {
        if (!ct)
            return false;
        return /^image\//i.test(ct);
    }
    bytesToSize(n) {
        if (!n && n !== 0)
            return "";
        if (n === 0)
            return "0 B";
        const k = 1024, sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(n) / Math.log(k));
        return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }
    loadAttachmentsForOid(layer, oid) {
        return __awaiter(this, void 0, void 0, function* () {
            // ✅ If layer doesn’t support attachments -> silently show none (NO warning)
            if (!this.layerSupportsAttachments(layer)) {
                if (!this._isMounted)
                    return;
                this.revokeAllAttachmentUrls();
                this.setState({
                    loadingAttachments: false,
                    attachments: [],
                    attachmentsError: null,
                    attachmentsExpanded: true, // keep area visible if you want "No attachments"
                });
                return;
            }
            try {
                this.revokeAllAttachmentUrls();
                this.setState({
                    loadingAttachments: true,
                    attachments: [],
                    attachmentsError: null,
                });
                const result = yield layer.queryAttachments({ objectIds: [oid] });
                const list = ((result === null || result === void 0 ? void 0 : result[oid]) || []);
                const items = list.map((att) => ({
                    id: att.id,
                    name: att.name,
                    size: att.size,
                    contentType: att.contentType,
                    url: att.url,
                }));
                const withPreviews = [];
                for (const it of items) {
                    if (it.url && this.isImageContentType(it.contentType)) {
                        try {
                            const blob = yield this.fetchAttachmentPreview(it.url);
                            it.previewObjectUrl = URL.createObjectURL(blob);
                        }
                        catch (_a) {
                            // ignore preview failures
                        }
                    }
                    withPreviews.push(it);
                }
                if (!this._isMounted)
                    return;
                this.setState({
                    attachments: withPreviews,
                    loadingAttachments: false,
                    attachmentsError: null,
                    attachmentsExpanded: true,
                });
            }
            catch (err) {
                // ✅ If server says attachments not supported/enabled -> SILENT (no red warning)
                const msg = String((err === null || err === void 0 ? void 0 : err.message) || err || "").toLowerCase();
                const isNotSupported = msg.includes("doesn't support attachments") ||
                    msg.includes("does not support attachments") ||
                    msg.includes("attachments are not enabled") ||
                    msg.includes("attachments disabled") ||
                    (msg.includes("not supported") && msg.includes("attachment"));
                if (!this._isMounted)
                    return;
                if (isNotSupported) {
                    this.setState({
                        loadingAttachments: false,
                        attachments: [],
                        attachmentsError: null,
                        attachmentsExpanded: true,
                    });
                    return;
                }
                this.setState({
                    loadingAttachments: false,
                    attachments: [],
                    attachmentsError: String((err === null || err === void 0 ? void 0 : err.message) || err || "Attachments failed"),
                    attachmentsExpanded: true,
                });
            }
        });
    }
    /* ---------------- Field alias + formatting ---------------- */
    isDateField(name) {
        var _a;
        // Use the clicked layer if possible
        const clickedLayer = this.getClickedLayer();
        const fld = (_a = clickedLayer === null || clickedLayer === void 0 ? void 0 : clickedLayer.fields) === null || _a === void 0 ? void 0 : _a.find((ff) => ff.name === name);
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.isEsriDateFieldType)(fld === null || fld === void 0 ? void 0 : fld.type);
    }
    getClickedLayer() {
        const key = this.state.lastClickedLayerKey;
        if (!key)
            return null;
        return (this.state.featureLayers.find((L) => (0,_gis_feature_layer_data__WEBPACK_IMPORTED_MODULE_17__.getAgriLayerMapKey)(L) === key ||
            String(L.url || L.id || "") === key) || null);
    }
    normalizeFieldAlias(field, fallbackName) {
        return (0,_popup_field_helpers__WEBPACK_IMPORTED_MODULE_15__.normalizeFieldAlias)(field, fallbackName);
    }
    findFieldMetaOnLayer(layer, fieldName) {
        const target = fieldName.toLowerCase();
        const fields = Array.isArray(layer === null || layer === void 0 ? void 0 : layer.fields) ? layer.fields : [];
        return (fields.find((f) => String((f === null || f === void 0 ? void 0 : f.name) || "").toLowerCase() === target) || null);
    }
    resolveAliasFromLiveLayers(fieldName) {
        const layers = [];
        const clicked = this.getClickedLayer();
        if (clicked)
            layers.push(clicked);
        for (const layer of this.state.featureLayers || []) {
            if (layer && !layers.includes(layer))
                layers.push(layer);
        }
        for (const layer of layers) {
            const fld = this.findFieldMetaOnLayer(layer, fieldName);
            if (!fld)
                continue;
            const alias = this.normalizeFieldAlias(fld, fieldName);
            if (alias && alias.toLowerCase() !== fieldName.toLowerCase()) {
                return alias;
            }
        }
        return null;
    }
    resolveAliasFromDataSourceSchema(fieldName, ds) {
        var _a, _b;
        if (!ds)
            return null;
        try {
            const fieldsObj = ((_b = (_a = ds === null || ds === void 0 ? void 0 : ds.getSchema) === null || _a === void 0 ? void 0 : _a.call(ds)) === null || _b === void 0 ? void 0 : _b.fields) || {};
            const target = fieldName.toLowerCase();
            for (const key of Object.keys(fieldsObj)) {
                const f = fieldsObj[key];
                const fname = String((f === null || f === void 0 ? void 0 : f.name) || (f === null || f === void 0 ? void 0 : f.jimuName) || key || "");
                if (fname.toLowerCase() !== target &&
                    key.toLowerCase() !== target &&
                    String((f === null || f === void 0 ? void 0 : f.jimuName) || "").toLowerCase() !== target) {
                    continue;
                }
                const alias = this.normalizeFieldAlias(f, fieldName);
                if (alias && alias.toLowerCase() !== fieldName.toLowerCase()) {
                    return alias;
                }
            }
        }
        catch (_c) {
            /* ignore */
        }
        return null;
    }
    getFieldAlias(name) {
        var _a, _b, _c;
        const custom = (_b = (_a = this.props.config) === null || _a === void 0 ? void 0 : _a.labels) === null || _b === void 0 ? void 0 : _b[name];
        if (custom)
            return custom;
        const realName = this.resolveFieldName(name) || name;
        // Live map layer first — reflects latest ArcGIS field display names
        const fromLayer = this.resolveAliasFromLiveLayers(realName);
        if (fromLayer)
            return fromLayer;
        const dsId = this.state.lastClickedDsId;
        const ds = dsId && ((_c = this.state.dataSourcesById) === null || _c === void 0 ? void 0 : _c[dsId])
            ? this.state.dataSourcesById[dsId]
            : null;
        const fromDs = this.resolveAliasFromDataSourceSchema(realName, ds);
        if (fromDs)
            return fromDs;
        for (const layerDs of Object.values(this.state.dataSourcesById || {})) {
            const alias = this.resolveAliasFromDataSourceSchema(realName, layerDs);
            if (alias)
                return alias;
        }
        const clickedLayer = this.getClickedLayer();
        const layerFld = clickedLayer
            ? this.findFieldMetaOnLayer(clickedLayer, realName)
            : null;
        if (layerFld === null || layerFld === void 0 ? void 0 : layerFld.alias)
            return String(layerFld.alias);
        return realName;
    }
    formatDateSmart(raw) {
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.formatDateSmart)(raw);
    }
    formatValue(name, raw) {
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.formatPopupAttributeValue)(raw, {
            isDateField: this.isDateField(name),
            formatDate: (value) => this.formatDateSmart(value),
        });
    }
    getOutFields(layer, oidField) {
        // keep your debugging behavior
        return ["*"];
    }
    componentDidUpdate(prevProps, prevState) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const prevDs = (0,_gis_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(prevProps.useDataSources).join("|");
        const nextDs = (0,_gis_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources).join("|");
        const dsChanged = prevDs !== nextDs;
        const prevMap = String(((_a = prevProps.useMapWidgetIds) === null || _a === void 0 ? void 0 : _a[0]) ||
            ((_c = (_b = prevProps.useMapWidgetIds) === null || _b === void 0 ? void 0 : _b.get) === null || _c === void 0 ? void 0 : _c.call(_b, 0)) ||
            "");
        const nextMap = String(((_d = this.props.useMapWidgetIds) === null || _d === void 0 ? void 0 : _d[0]) ||
            ((_f = (_e = this.props.useMapWidgetIds) === null || _e === void 0 ? void 0 : _e.get) === null || _f === void 0 ? void 0 : _f.call(_e, 0)) ||
            "");
        const mapChanged = prevMap !== nextMap;
        if ((dsChanged || mapChanged) && this.state.jimuMapView) {
            void this.initializeMapConnection(this.state.jimuMapView);
        }
        else if (mapChanged) {
            this.scheduleMapViewFallback();
        }
        if (prevState.showPopup !== this.state.showPopup ||
            prevState.popupMinimized !== this.state.popupMinimized) {
            this.broadcastPopupVisibility(this.state.showPopup && !this.state.popupMinimized);
        }
        else if (this.state.showPopup &&
            !this.state.popupMinimized &&
            prevState.pinToCorner !== this.state.pinToCorner) {
            this.broadcastPopupVisibility(true);
        }
        if (!this.state.showPopup || this.state.popupMinimized)
            return;
        const openedNow = (this.state.showPopup && !prevState.showPopup) ||
            (prevState.popupMinimized && !this.state.popupMinimized);
        const attachmentsChanged = this.state.loadingAttachments !== prevState.loadingAttachments ||
            (((_g = this.state.attachments) === null || _g === void 0 ? void 0 : _g.length) || 0) !==
                (((_h = prevState.attachments) === null || _h === void 0 ? void 0 : _h.length) || 0);
        const loadingChanged = this.state.loading !== prevState.loading;
        const attrsChanged = this.state.selectedAttrs !== prevState.selectedAttrs;
        if (!openedNow &&
            !attachmentsChanged &&
            !loadingChanged &&
            !attrsChanged) {
            return;
        }
        this.schedulePopupLayoutAfterContent();
    }
    niceChartMax(value) {
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.niceChartMax)(value);
    }
    formatChartTick(value) {
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.formatChartTick)(value);
    }
    formatChartTooltipValue(value) {
        return (0,_popup_format_helpers__WEBPACK_IMPORTED_MODULE_16__.formatChartTooltipValue)(value);
    }
    buildSmoothLinePath(points) {
        if (!points.length)
            return "";
        if (points.length === 1) {
            return `M ${points[0].x} ${points[0].y}`;
        }
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return path;
    }
    buildRoundedBarPath(x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height);
        const bottom = y + height;
        return [
            `M ${x} ${bottom}`,
            `L ${x} ${y + r}`,
            `Q ${x} ${y} ${x + r} ${y}`,
            `L ${x + width - r} ${y}`,
            `Q ${x + width} ${y} ${x + width} ${y + r}`,
            `L ${x + width} ${bottom}`,
            "Z",
        ].join(" ");
    }
    render() {
        var _a, _b;
        const { useMapWidgetIds, useDataSources } = this.props;
        const themeClass = this.state.isDarkTheme
            ? "agri3-theme-dark"
            : "agri3-theme-light";
        return (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-attr-card ${themeClass}` },
            this.renderPopup(),
            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_gis_AgriHiddenConnectors__WEBPACK_IMPORTED_MODULE_8__.AgriHiddenConnectors, { useDataSources: useDataSources, useMapWidgetIds: useMapWidgetIds, onDataSourceCreated: this.onDataSourceCreated, onActiveViewChange: this.onActiveViewChange }),
            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { style: {
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    width: "8px",
                    height: "8px",
                    background: ((_a = this.state.featureLayers) === null || _a === void 0 ? void 0 : _a.length)
                        ? "#10b981"
                        : "#94a3b8",
                    borderRadius: "50%",
                    opacity: 0.6,
                    transition: "all 0.3s ease",
                    pointerEvents: "none",
                }, title: ((_b = this.state.featureLayers) === null || _b === void 0 ? void 0 : _b.length)
                    ? this.tr("status.ready")
                    : this.tr("status.loading") })));
    }
}
AgriPolygon.VEG_INDEX_FIELDS = [..._GraffPanel_runtime_graff_graph_constants__WEBPACK_IMPORTED_MODULE_14__.GRAFF_INDEX_ORDER];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AgriPolygon);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/AgriHiddenConnectors.tsx":
/*!**************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/AgriHiddenConnectors.tsx ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgriHiddenConnectors: () => (/* binding */ AgriHiddenConnectors)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-arcgis */ "jimu-arcgis");
/* harmony import */ var _agri_data_source_engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./agri-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-source-engine.ts");
/** @jsx jsx */



/** Hidden DataSource + Map connectors (same pattern as AgriLocalization).
 * Only connect the first useDataSource — mounting all ~30+ region FeatureServers
 * on every child remount floods Network with FeatureServer?f=json loads and
 * does not help map hit-testing (live MapView layers are used instead). */
function AgriHiddenConnectors(props) {
    const selectedUseDataSources = (0,_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_2__.toPlainArray)(props.useDataSources);
    const mapWidgetId = (0,_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_2__.toPlainArray)(props.useMapWidgetIds)[0];
    const primaryDs = selectedUseDataSources[0];
    return ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: { display: "none" }, "aria-hidden": "true" },
        primaryDs ? ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_core__WEBPACK_IMPORTED_MODULE_0__.DataSourceComponent, { key: primaryDs === null || primaryDs === void 0 ? void 0 : primaryDs.dataSourceId, useDataSource: primaryDs, onDataSourceCreated: props.onDataSourceCreated
                ? (ds) => {
                    var _a;
                    (_a = props.onDataSourceCreated) === null || _a === void 0 ? void 0 : _a.call(props, ds);
                }
                : undefined })) : null,
        mapWidgetId && ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__.JimuMapViewComponent, { useMapWidgetId: mapWidgetId, onActiveViewChange: props.onActiveViewChange }))));
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-source-engine.ts":
/*!****************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-source-engine.ts ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgriDataSourceEngine: () => (/* binding */ AgriDataSourceEngine),
/* harmony export */   getSelectedDsIds: () => (/* binding */ getSelectedDsIds),
/* harmony export */   toPlainArray: () => (/* binding */ toPlainArray)
/* harmony export */ });
/* harmony import */ var _feature_layer_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./feature-layer-data */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/feature-layer-data.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function toPlainArray(val) {
    if (!val)
        return [];
    if (Array.isArray(val))
        return val;
    if (typeof val.asMutable === "function")
        return val.asMutable({ deep: true });
    if (typeof val.toArray === "function")
        return val.toArray();
    return [];
}
function getSelectedDsIds(useDataSources) {
    const uds = toPlainArray(useDataSources);
    const ids = uds.map((u) => u === null || u === void 0 ? void 0 : u.dataSourceId).filter(Boolean);
    return Array.from(new Set(ids));
}
/**
 * Resolves the active FeatureLayer for dashboard widgets.
 * Prefers EXB DataSources (same path as AgriLocalization),
 * falls back to JimuMapView map layers.
 */
class AgriDataSourceEngine {
    constructor() {
        this.dsById = {};
        this.selectedIds = [];
        this.resolveCache = new Map();
    }
    onDsCreated(ds, ids) {
        if (!(ds === null || ds === void 0 ? void 0 : ds.id))
            return;
        this.dsById[ds.id] = ds;
        this.selectedIds = [...ids];
        this.resolveCache.clear();
    }
    syncSelection(ids) {
        this.selectedIds = [...ids];
        this.resolveCache.clear();
    }
    clearResolveCache() {
        this.resolveCache.clear();
    }
    /** True while selected data sources are still connecting (no map fallback yet). */
    isResolvePending(jimuMapView) {
        var _a;
        if ((_a = jimuMapView === null || jimuMapView === void 0 ? void 0 : jimuMapView.view) === null || _a === void 0 ? void 0 : _a.map)
            return false;
        if (!this.selectedIds.length)
            return false;
        const connected = this.selectedIds.filter((id) => !!this.dsById[id]).length;
        return connected < this.selectedIds.length;
    }
    hasConnectedSources() {
        return this.selectedIds.some((id) => !!this.dsById[id]);
    }
    getLayerFromDs(ds) {
        const anyDs = ds;
        return (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.getQueryableLayer)(anyDs.layer || anyDs._layer);
    }
    getDsHaystack(ds) {
        var _a, _b, _c, _d, _e, _f, _g;
        const anyDs = ds;
        const layer = anyDs.layer || anyDs._layer;
        const title = String((layer === null || layer === void 0 ? void 0 : layer.title) || "");
        const url = String((layer === null || layer === void 0 ? void 0 : layer.url) || ((_b = (_a = anyDs.getDataSourceJson) === null || _a === void 0 ? void 0 : _a.call(anyDs)) === null || _b === void 0 ? void 0 : _b.url) || "");
        const label = String(((_c = anyDs.getLabel) === null || _c === void 0 ? void 0 : _c.call(anyDs)) ||
            ((_e = (_d = anyDs.getDataSourceJson) === null || _d === void 0 ? void 0 : _d.call(anyDs)) === null || _e === void 0 ? void 0 : _e.label) ||
            ((_g = (_f = anyDs.getDataSourceJson) === null || _f === void 0 ? void 0 : _f.call(anyDs)) === null || _g === void 0 ? void 0 : _g.sourceLabel) ||
            "");
        return `${title} ${url} ${label}`;
    }
    buildRegionProbeWhere(filters, layer, fields, regionScoped, yearScoped) {
        return (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.buildAgriWhere)({
            yil: filters.yil,
            viloyat: filters.viloyat,
            skipRegionFilter: regionScoped,
            skipYearFilter: yearScoped,
        }, fields, layer);
    }
    pickBestDsByCount(pool, filters, preferredDs) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!pool.length)
                return null;
            if (!String((_a = filters.viloyat) !== null && _a !== void 0 ? _a : "").trim() || pool.length === 1) {
                return pool[0];
            }
            const scored = [];
            const tryItem = (item) => __awaiter(this, void 0, void 0, function* () {
                const layer = this.getLayerFromDs(item.ds);
                if (!layer)
                    return;
                try {
                    yield (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.safeLoadMapLayer)(layer);
                }
                catch (_a) {
                    /* ignore */
                }
                const fields = (layer.fields || []).map((f) => f.name);
                const where = this.buildRegionProbeWhere(filters, layer, fields, item.regionMatch, (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.haystackMatchesYear)(this.getDsHaystack(item.ds), filters.yil));
                const count = yield (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.quickLayerFeatureCount)(layer, where);
                scored.push({ item, count });
            });
            if (preferredDs) {
                const preferred = pool.find((p) => p.ds.id === preferredDs.id);
                if (preferred) {
                    yield tryItem(preferred);
                    const preferredCount = (_c = (_b = scored[0]) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : -1;
                    if (preferredCount > 0)
                        return preferred;
                }
            }
            const remaining = pool.filter((p) => !preferredDs || p.ds.id !== preferredDs.id);
            yield Promise.all(remaining.map((item) => tryItem(item)));
            const positive = scored
                .filter((s) => s.count > 0)
                .sort((a, b) => b.count - a.count);
            if (positive.length)
                return positive[0].item;
            return (((_d = scored.find((s) => s.count >= 0)) === null || _d === void 0 ? void 0 : _d.item) ||
                pool.find((p) => p.ds.id === (preferredDs === null || preferredDs === void 0 ? void 0 : preferredDs.id)) ||
                pool[0]);
        });
    }
    resolveFromDataSources(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const normalizedFilters = {
                yil: filters.yil,
                viloyat: (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.canonicalizeRegionFilterValue)(String((_a = filters.viloyat) !== null && _a !== void 0 ? _a : "").trim()),
            };
            const wantsRegion = !!normalizedFilters.viloyat;
            const scored = [];
            for (const id of this.selectedIds) {
                const ds = this.dsById[id];
                if (!ds || !this.getLayerFromDs(ds))
                    continue;
                const haystack = this.getDsHaystack(ds);
                scored.push({
                    ds,
                    score: (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.scoreHaystackForFilters)(haystack, normalizedFilters),
                    regionMatch: (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.haystackMatchesRegion)(haystack, normalizedFilters.viloyat),
                });
            }
            if (!scored.length)
                return null;
            const pool = (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.pickYearRegionLayerPool)(scored, scored.length, normalizedFilters, (item) => this.getDsHaystack(item.ds));
            if (!pool.length)
                return null;
            let bestScore = -1;
            let scoreWinner = null;
            for (const item of pool) {
                if (item.score > bestScore) {
                    bestScore = item.score;
                    scoreWinner = item;
                }
            }
            const preferredDs = (scoreWinner === null || scoreWinner === void 0 ? void 0 : scoreWinner.ds) || null;
            const bestItem = wantsRegion && pool.length > 1
                ? yield this.pickBestDsByCount(pool, normalizedFilters, preferredDs)
                : scoreWinner;
            const bestDs = (bestItem === null || bestItem === void 0 ? void 0 : bestItem.ds) || preferredDs;
            if (!bestDs)
                return null;
            const layer = this.getLayerFromDs(bestDs);
            if (!layer)
                return null;
            try {
                yield (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.safeLoadMapLayer)(layer);
            }
            catch (_e) {
                /* layer may already be loaded */
            }
            (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.disableLayerPbf)(layer);
            const fields = (layer.fields || []).map((f) => f.name);
            const regionMatch = (_b = bestItem === null || bestItem === void 0 ? void 0 : bestItem.regionMatch) !== null && _b !== void 0 ? _b : false;
            const regionScoped = regionMatch || ((_c = bestItem === null || bestItem === void 0 ? void 0 : bestItem.score) !== null && _c !== void 0 ? _c : 0) >= 25;
            const haystack = this.getDsHaystack(bestDs);
            const yearScoped = (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.haystackMatchesYear)(haystack, normalizedFilters.yil);
            (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.flLog)("resolve via DataSource", {
                filters: normalizedFilters,
                dsId: bestDs.id,
                layerTitle: (layer === null || layer === void 0 ? void 0 : layer.title) || (layer === null || layer === void 0 ? void 0 : layer.url) || null,
                score: (_d = bestItem === null || bestItem === void 0 ? void 0 : bestItem.score) !== null && _d !== void 0 ? _d : bestScore,
                regionScoped,
                yearScoped,
                fieldCount: fields.length,
                countBased: wantsRegion && pool.length > 1,
            });
            void (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.prepareValueIndex)(layer, fields);
            return {
                layer,
                fields,
                regionScoped,
                yearScoped,
            };
        });
    }
    resolve(filters, jimuMapView) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cacheKey = JSON.stringify({
                yil: filters.yil || "",
                viloyat: (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.canonicalizeRegionFilterValue)(String((_a = filters.viloyat) !== null && _a !== void 0 ? _a : "").trim()),
                ids: this.selectedIds,
                mapReady: !!jimuMapView,
            });
            const pending = this.resolveCache.get(cacheKey);
            if (pending)
                return pending;
            const job = this.resolveInternal(filters, jimuMapView);
            this.resolveCache.set(cacheKey, job);
            try {
                return yield job;
            }
            finally {
                if (this.resolveCache.get(cacheKey) === job) {
                    this.resolveCache.delete(cacheKey);
                }
            }
        });
    }
    resolveInternal(filters, jimuMapView) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const fromDs = yield this.resolveFromDataSources(filters);
            if (fromDs)
                return fromDs;
            if (!jimuMapView) {
                (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.flLog)("resolve FAILED (no DS layer, no map view)", {
                    filters,
                    selectedIds: this.selectedIds,
                    connectedIds: this.selectedIds.filter((id) => !!this.dsById[id]),
                });
                return null;
            }
            const fromMap = yield (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.resolveFeatureLayerForFilters)(jimuMapView, filters);
            (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.flLog)("resolve via Map", {
                filters,
                layerTitle: ((_a = fromMap === null || fromMap === void 0 ? void 0 : fromMap.layer) === null || _a === void 0 ? void 0 : _a.title) || ((_b = fromMap === null || fromMap === void 0 ? void 0 : fromMap.layer) === null || _b === void 0 ? void 0 : _b.url) || null,
                regionScoped: (_c = fromMap === null || fromMap === void 0 ? void 0 : fromMap.regionScoped) !== null && _c !== void 0 ? _c : null,
                yearScoped: (_d = fromMap === null || fromMap === void 0 ? void 0 : fromMap.yearScoped) !== null && _d !== void 0 ? _d : null,
                found: !!fromMap,
            });
            if (fromMap === null || fromMap === void 0 ? void 0 : fromMap.layer) {
                void (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.prepareValueIndex)(fromMap.layer, fromMap.fields);
            }
            return fromMap;
        });
    }
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-engine-registry.ts":
/*!*************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-engine-registry.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAgriDashboardRootId: () => (/* binding */ getAgriDashboardRootId),
/* harmony export */   getSharedAgriDataSourceEngine: () => (/* binding */ getSharedAgriDataSourceEngine)
/* harmony export */ });
/* harmony import */ var _agri_data_source_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./agri-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-source-engine.ts");

const DASHBOARD_CHILD_SUFFIXES = [
    "-localization",
    "-indicator",
    "-region",
    "-pie",
    "-graff",
    "-bar",
    "-popup",
];
/** Root AgroWidgetV5 widget id from any embedded child id. */
function getAgriDashboardRootId(widgetId) {
    const id = String(widgetId || "");
    for (const suffix of DASHBOARD_CHILD_SUFFIXES) {
        if (id.endsWith(suffix))
            return id.slice(0, -suffix.length);
    }
    return id;
}
const sharedEngines = new Map();
/** One DataSource engine per dashboard instance — shared by all embedded children. */
function getSharedAgriDataSourceEngine(widgetId) {
    const rootId = getAgriDashboardRootId(widgetId);
    let engine = sharedEngines.get(rootId);
    if (!engine) {
        engine = new _agri_data_source_engine__WEBPACK_IMPORTED_MODULE_0__.AgriDataSourceEngine();
        sharedEngines.set(rootId, engine);
    }
    return engine;
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-linked-map-layout.ts":
/*!***************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-linked-map-layout.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgriLinkedMapLayoutManager: () => (/* binding */ AgriLinkedMapLayoutManager),
/* harmony export */   discoverMapWidgetIdInApp: () => (/* binding */ discoverMapWidgetIdInApp),
/* harmony export */   isKnownMapWidgetId: () => (/* binding */ isKnownMapWidgetId)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _agri_data_source_engine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./agri-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/gis/agri-data-source-engine.ts");


const MANAGED_MAP_CLASS = {
    dashboard: "agri-dashboard-managed-map",
    plm: "plm-managed-map",
};
const MANAGED_RENDERER_CLASS = {
    dashboard: "agri-dashboard-managed-map-renderer",
    plm: "plm-managed-map-renderer",
};
const MAP_PANEL_BORDER_RADIUS = "20px";
function isMapWidgetConfig(widget) {
    var _a;
    const manifestName = String(((_a = widget === null || widget === void 0 ? void 0 : widget.manifest) === null || _a === void 0 ? void 0 : _a.name) || "").toLowerCase();
    const uri = String((widget === null || widget === void 0 ? void 0 : widget.uri) || "").toLowerCase();
    return manifestName === "map" || uri.includes("arcgis-map");
}
function findWidgetRenderer(widgetId) {
    const selectors = [
        `.widget-renderer[data-widgetid="${widgetId}"]`,
        `[data-widgetid="${widgetId}"].widget-renderer`,
        `[data-widgetid="${widgetId}"]`,
    ];
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el)
            return el;
    }
    return null;
}
function findWidgetLayoutItem(widgetId) {
    const renderer = findWidgetRenderer(widgetId);
    if (!renderer)
        return null;
    const candidates = [
        renderer.closest(".layout-item.is-widget"),
        renderer.closest(".builder-layout-item"),
        renderer.closest(".layout-item"),
        renderer.closest(".section-layout-item"),
        renderer.closest('[class*="layout-item"]'),
        renderer.parentElement,
    ];
    for (const candidate of candidates) {
        if (candidate instanceof HTMLElement && candidate.contains(renderer)) {
            return candidate;
        }
    }
    return renderer;
}
function isKnownMapWidgetId(widgetId) {
    var _a, _b;
    const id = String(widgetId || "").trim();
    if (!id)
        return false;
    try {
        const widgets = ((_b = (_a = (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.getAppStore)().getState()) === null || _a === void 0 ? void 0 : _a.appConfig) === null || _b === void 0 ? void 0 : _b.widgets) || {};
        const widget = widgets[id];
        if (widget && isMapWidgetConfig(widget))
            return true;
    }
    catch (_c) {
        /* app config may still be warming up */
    }
    try {
        return !!findWidgetRenderer(id);
    }
    catch (_d) {
        return false;
    }
}
function isMapOverlappingSlot(mapWidgetId, slot) {
    const item = findWidgetLayoutItem(mapWidgetId);
    if (!item)
        return false;
    const rect = item.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (cx >= slot.left && cx <= slot.right && cy >= slot.top && cy <= slot.bottom) {
        return true;
    }
    const overlapX = Math.max(0, Math.min(rect.right, slot.right) - Math.max(rect.left, slot.left));
    const overlapY = Math.max(0, Math.min(rect.bottom, slot.bottom) - Math.max(rect.top, slot.top));
    const overlapArea = overlapX * overlapY;
    const mapArea = Math.max(1, rect.width * rect.height);
    return overlapArea / mapArea > 0.3;
}
/** Find the standard Map widget id from app config (published experience safe). */
function discoverMapWidgetIdInApp(options) {
    var _a, _b, _c;
    try {
        const state = (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.getAppStore)().getState();
        const widgets = ((_a = state === null || state === void 0 ? void 0 : state.appConfig) === null || _a === void 0 ? void 0 : _a.widgets) || {};
        const ownId = options.hostWidgetId;
        const candidates = [];
        Object.keys(widgets).forEach((id) => {
            if (id === ownId || id.startsWith(`${ownId}-`))
                return;
            if (isMapWidgetConfig(widgets[id]))
                candidates.push(id);
        });
        if (!candidates.length)
            return null;
        if (candidates.length === 1)
            return candidates[0];
        const slot = (_c = (_b = options.getSlotElement) === null || _b === void 0 ? void 0 : _b.call(options)) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect();
        if (!slot)
            return candidates[0];
        const insideSlot = candidates.filter((id) => isMapOverlappingSlot(id, slot));
        if (insideSlot.length === 1)
            return insideSlot[0];
        const pool = insideSlot.length ? insideSlot : candidates;
        let bestId = pool[0];
        let bestDistance = Number.POSITIVE_INFINITY;
        pool.forEach((id) => {
            const item = findWidgetLayoutItem(id);
            if (!item)
                return;
            const rect = item.getBoundingClientRect();
            const dx = rect.left + rect.width / 2 - (slot.left + slot.width / 2);
            const dy = rect.top + rect.height / 2 - (slot.top + slot.height / 2);
            const distance = Math.hypot(dx, dy);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestId = id;
            }
        });
        return bestId;
    }
    catch (_d) {
        return null;
    }
}
class AgriLinkedMapLayoutManager {
    constructor(options) {
        this.options = options;
        this.mapLayoutItem = null;
        this.mapWidgetRenderer = null;
        this.autoLinkAttempted = false;
        this.layoutRaf = 0;
        this.lastNotifiedMapId = null;
    }
    scheduleLayout() {
        if (this.layoutRaf)
            cancelAnimationFrame(this.layoutRaf);
        this.layoutRaf = requestAnimationFrame(() => {
            this.layoutRaf = 0;
            this.sync();
        });
    }
    layoutNow() {
        this.sync();
    }
    destroy() {
        if (this.layoutRaf)
            cancelAnimationFrame(this.layoutRaf);
        this.layoutRaf = 0;
        this.clear();
    }
    getResolvedMapWidgetId() {
        const linked = this.getLinkedMapWidgetId();
        if (linked && isKnownMapWidgetId(linked))
            return linked;
        return this.discoverMapWidgetIdFromApp();
    }
    getLinkedMapWidgetId() {
        const ids = (0,_agri_data_source_engine__WEBPACK_IMPORTED_MODULE_1__.toPlainArray)(this.options.getUseMapWidgetIds());
        return ids[0] ? String(ids[0]) : null;
    }
    findSharedLayoutSurface(slot) {
        const hostItem = slot.closest(".layout-item, .builder-layout-item");
        return (hostItem === null || hostItem === void 0 ? void 0 : hostItem.parentElement) || null;
    }
    discoverMapWidgetIdFromApp() {
        return discoverMapWidgetIdInApp({
            hostWidgetId: this.options.hostWidgetId,
            getSlotElement: this.options.getSlotElement,
        });
    }
    notifyMapResolved(mapWidgetId) {
        var _a, _b;
        if (!mapWidgetId || mapWidgetId === this.lastNotifiedMapId)
            return;
        this.lastNotifiedMapId = mapWidgetId;
        (_b = (_a = this.options).onMapResolved) === null || _b === void 0 ? void 0 : _b.call(_a, mapWidgetId);
    }
    tryAutoLinkMapWidget(mapWidgetId) {
        var _a, _b;
        const linked = this.getLinkedMapWidgetId();
        if (!mapWidgetId || (linked && isKnownMapWidgetId(linked)) || this.autoLinkAttempted) {
            return;
        }
        const slot = (_a = this.options.getSlotElement()) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (slot && !isMapOverlappingSlot(mapWidgetId, slot))
            return;
        try {
            const mode = (_b = (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.getAppStore)().getState().appRuntimeInfo) === null || _b === void 0 ? void 0 : _b.appMode;
            if (mode !== jimu_core__WEBPACK_IMPORTED_MODULE_0__.AppMode.Design)
                return;
            // Runtime bundles must not depend on the builder-only package. Ask the
            // setting panel to focus the map selector; the user can confirm linkage
            // there without making published apps load `jimu-for-builder`.
            this.autoLinkAttempted = true;
            window.dispatchEvent(new CustomEvent("agri-main:map-settings-request", {
                detail: { widgetId: this.options.hostWidgetId, mapWidgetId },
            }));
        }
        catch (_c) {
            /* builder-only helper */
        }
    }
    applyMapSlotBounds(layoutItem, slotEl) {
        const slotRect = slotEl.getBoundingClientRect();
        const surface = this.findSharedLayoutSurface(slotEl);
        let top = slotRect.top;
        let left = slotRect.left;
        let positionMode = "fixed";
        if (surface) {
            const surfaceRect = surface.getBoundingClientRect();
            top = slotRect.top - surfaceRect.top + surface.scrollTop;
            left = slotRect.left - surfaceRect.left + surface.scrollLeft;
            positionMode = "absolute";
            if (getComputedStyle(surface).position === "static") {
                surface.style.setProperty("position", "relative");
            }
        }
        const entries = [
            ["position", positionMode],
            ["top", `${top}px`],
            ["left", `${left}px`],
            ["width", `${slotRect.width}px`],
            ["height", `${slotRect.height}px`],
            ["right", "auto"],
            ["bottom", "auto"],
            ["margin", "0"],
            ["padding", "0"],
            ["transform", "none"],
            ["border-radius", MAP_PANEL_BORDER_RADIUS],
            ["overflow", "hidden"],
            ["z-index", "12"],
            ["box-sizing", "border-box"],
            ["pointer-events", "auto"],
        ];
        entries.forEach(([key, value]) => {
            layoutItem.style.setProperty(key, value, "important");
        });
        const wrapper = layoutItem.closest(".builder-layout-item");
        if (wrapper && wrapper !== layoutItem) {
            [
                ["position", "static"],
                ["width", "0"],
                ["height", "0"],
                ["margin", "0"],
                ["padding", "0"],
                ["overflow", "visible"],
                ["pointer-events", "none"],
            ].forEach(([key, value]) => {
                wrapper.style.setProperty(key, value, "important");
            });
        }
    }
    fillMapRenderer(renderer) {
        const radius = MAP_PANEL_BORDER_RADIUS;
        [
            ["position", "relative"],
            ["width", "100%"],
            ["height", "100%"],
            ["top", "0"],
            ["left", "0"],
            ["margin", "0"],
            ["padding", "0"],
            ["transform", "none"],
            ["border-radius", radius],
            ["overflow", "hidden"],
            ["box-sizing", "border-box"],
        ].forEach(([key, value]) => {
            renderer.style.setProperty(key, value, "important");
        });
        renderer
            .querySelectorAll(".esri-view, .esri-view-root, .esri-view-surface, .widget-map")
            .forEach((node) => {
            node.style.setProperty("border-radius", radius, "important");
            node.style.setProperty("overflow", "hidden", "important");
        });
    }
    clearManagedElement(target) {
        if (!target)
            return;
        [
            "position",
            "top",
            "left",
            "right",
            "bottom",
            "width",
            "height",
            "z-index",
            "margin",
            "padding",
            "transform",
            "border-radius",
            "overflow",
            "box-sizing",
            "pointer-events",
        ].forEach((key) => target.style.removeProperty(key));
        Object.values(MANAGED_MAP_CLASS).forEach((cls) => target.classList.remove(cls));
        Object.values(MANAGED_RENDERER_CLASS).forEach((cls) => target.classList.remove(cls));
    }
    clear() {
        var _a;
        const wrapper = (_a = this.mapLayoutItem) === null || _a === void 0 ? void 0 : _a.closest(".builder-layout-item");
        if (wrapper && wrapper !== this.mapLayoutItem) {
            ["position", "width", "height", "margin", "padding", "overflow", "pointer-events"].forEach((key) => wrapper.style.removeProperty(key));
        }
        this.clearManagedElement(this.mapLayoutItem);
        this.clearManagedElement(this.mapWidgetRenderer);
        this.mapLayoutItem = null;
        this.mapWidgetRenderer = null;
    }
    sync() {
        var _a, _b, _c, _d;
        const slot = this.options.getSlotElement();
        if (!slot) {
            this.clear();
            return;
        }
        const mapWidgetId = this.getResolvedMapWidgetId();
        if (!mapWidgetId) {
            this.clear();
            return;
        }
        this.notifyMapResolved(mapWidgetId);
        if (!this.getLinkedMapWidgetId()) {
            this.tryAutoLinkMapWidget(mapWidgetId);
        }
        const layoutItem = findWidgetLayoutItem(mapWidgetId);
        const renderer = findWidgetRenderer(mapWidgetId);
        if (!layoutItem || !renderer) {
            // Published portal: map widget DOM often mounts after the dashboard — keep
            // the last positioned map instead of clearing styles (that strands the map).
            if (this.mapLayoutItem && this.mapWidgetRenderer) {
                this.applyMapSlotBounds(this.mapLayoutItem, slot);
                this.fillMapRenderer(this.mapWidgetRenderer);
                (_b = (_a = this.options).resizeMapView) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
            return;
        }
        this.mapLayoutItem = layoutItem;
        this.mapWidgetRenderer = renderer;
        layoutItem.classList.add(MANAGED_MAP_CLASS[this.options.scope]);
        renderer.classList.add(MANAGED_RENDERER_CLASS[this.options.scope]);
        this.applyMapSlotBounds(layoutItem, slot);
        this.fillMapRenderer(renderer);
        (_d = (_c = this.options).resizeMapView) === null || _d === void 0 ? void 0 : _d.call(_c);
    }
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/messages.ts":
/*!***********************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/messages.ts ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getInitialLang: () => (/* binding */ getInitialLang),
/* harmony export */   getInitialTheme: () => (/* binding */ getInitialTheme),
/* harmony export */   normalizeLang: () => (/* binding */ normalizeLang),
/* harmony export */   t: () => (/* binding */ t)
/* harmony export */ });
const MESSAGES = {
    uz_lat: {
        "title.default": "Poligon ma'lumoti",
        "title.attributes": "Atribut ma'lumotlari",
        "title.record": "Ma'lumot #{{id}}",
        "action.pin": "Popupni yuqori-o'ngga qadash",
        "action.unpin": "Popupni yechish",
        "action.minimize": "Popupni yig'ish",
        "action.expand": "Popupni ochish",
        "status.warning": "Ogohlantirish",
        "status.loadingFeature": "Obyekt ma'lumotlari yuklanmoqda...",
        "status.noConfiguredData": "Sozlangan maydonlar uchun ma'lumot topilmadi",
        "status.noFields": "Maydonlar sozlanmagan. Vidjet sozlamalarida maydonlarni tanlang.",
        "attachments.title": "Rasmlar va fayllar",
        "status.loadingAttachments": "Qo'shimchalar yuklanmoqda...",
        "status.noAttachments": "Qo'shimchalar yo'q",
        "attachment.imageFallback": "Rasm",
        "attachment.fileFallback": "fayl-{{id}}",
        "attachment.download": "Yuklab olish",
        "status.clickPolygon": "Tafsilotlarni ko'rish uchun xaritada poligonni bosing",
        "status.ready": "Polygon Inspector tayyor",
        "status.loading": "Yuklanmoqda...",
        "error.noMapView": "Xarita ko'rinishi topilmadi",
        "error.noLayersSelected": "Qatlam tanlanmagan. Sozlamalarda kamida bitta Feature Layer tanlang.",
        "error.selectedLayersMissing": "Tanlangan qatlamlar xaritada topilmadi. Tanlangan Map vidjet ichida shu qatlamlar borligini tekshiring.",
        "error.objectIdFieldMissing": "Bosilgan qatlamda ObjectId maydoni topilmadi.",
        "error.objectIdMissing": "ObjectId topilmadi. Kutilgan maydon: {{field}}",
        "error.featureByObjectIdMissing": "ObjectId bo'yicha obyekt topilmadi.",
        "error.configuredFieldMissing": "Ba'zi sozlangan maydonlar topilmadi: {{fields}}",
        "error.noDataForConfiguredFields": "Sozlangan maydonlar uchun ma'lumot mavjud emas",
        "error.unexpected": "Kutilmagan xato: {{message}}",
        "indices.title": "Vegetatsiya indekslari",
        "indices.loading": "Indekslar yuklanmoqda...",
        "indices.none": "Bu poligon uchun indeks ma'lumoti yo'q",
    },
    uz_cyr: {
        "title.attributes": "Атрибут маълумотлари",
        "title.default": "Полигон маълумоти",
        "title.record": "Маълумот #{{id}}",
        "action.pin": "Попапни юқори-ўнгга қадаш",
        "action.unpin": "Попапни ечиш",
        "action.minimize": "Попапни йиғиш",
        "action.expand": "Попапни очиш",
        "status.warning": "Огоҳлантириш",
        "status.loadingFeature": "Объект маълумотлари юкланмоқда...",
        "status.noConfiguredData": "Созланган майдонлар учун маълумот топилмади",
        "status.noFields": "Майдонлар созланмаган. Виджет созламаларида майдонларни танланг.",
        "attachments.title": "Расмлар ва файллар",
        "status.loadingAttachments": "Қўшимчалар юкланмоқда...",
        "status.noAttachments": "Қўшимчалар йўқ",
        "attachment.imageFallback": "Расм",
        "attachment.fileFallback": "файл-{{id}}",
        "attachment.download": "Юклаб олиш",
        "status.clickPolygon": "Тафсилотларни кўриш учун харитада полигонни босинг",
        "status.ready": "Polygon Inspector тайёр",
        "status.loading": "Юкланмоқда...",
        "error.noMapView": "Харита кўриниши топилмади",
        "error.noLayersSelected": "Қатлам танланмаган. Созламаларда камида битта Feature Layer танланг.",
        "error.selectedLayersMissing": "Танланган қатламлар харитада топилмади. Танланган Map виджет ичида шу қатламлар борлигини текширинг.",
        "error.objectIdFieldMissing": "Босилган қатламда ObjectId майдони топилмади.",
        "error.objectIdMissing": "ObjectId топилмади. Кутилган майдон: {{field}}",
        "error.featureByObjectIdMissing": "ObjectId бўйича объект топилмади.",
        "error.configuredFieldMissing": "Баъзи созланган майдонлар топилмади: {{fields}}",
        "error.noDataForConfiguredFields": "Созланган майдонлар учун маълумот мавжуд эмас",
        "error.unexpected": "Кутилмаган хато: {{message}}",
        "indices.title": "Вегетация индекслари",
        "indices.loading": "Индекслар юкланмоқда...",
        "indices.none": "Бу полигон учун индекс маълумоти йўқ",
    },
    ru: {
        "title.attributes": "Атрибутивные данные",
        "title.default": "Информация о полигоне",
        "title.record": "Запись #{{id}}",
        "action.pin": "Закрепить окно справа сверху",
        "action.unpin": "Открепить окно",
        "action.minimize": "Свернуть окно",
        "action.expand": "Развернуть окно",
        "status.warning": "Предупреждение",
        "status.loadingFeature": "Загрузка данных объекта...",
        "status.noConfiguredData": "Нет данных для настроенных полей",
        "status.noFields": "Поля не настроены. Выберите поля в настройках виджета.",
        "attachments.title": "Изображения и файлы",
        "status.loadingAttachments": "Загрузка вложений...",
        "status.noAttachments": "Нет вложений",
        "attachment.imageFallback": "Изображение",
        "attachment.fileFallback": "файл-{{id}}",
        "attachment.download": "Скачать",
        "status.clickPolygon": "Нажмите на полигон на карте, чтобы увидеть детали",
        "status.ready": "Polygon Inspector готов",
        "status.loading": "Загрузка...",
        "error.noMapView": "Вид карты не найден",
        "error.noLayersSelected": "Слои не выбраны. В настройках выберите минимум один Feature Layer.",
        "error.selectedLayersMissing": "Выбранные слои не найдены на карте. Проверьте, что они есть в выбранном Map виджете.",
        "error.objectIdFieldMissing": "В выбранном слое не найдено поле ObjectId.",
        "error.objectIdMissing": "ObjectId не найден. Ожидаемое поле: {{field}}",
        "error.featureByObjectIdMissing": "Объект по ObjectId не найден.",
        "error.configuredFieldMissing": "Некоторые настроенные поля не найдены: {{fields}}",
        "error.noDataForConfiguredFields": "Нет данных для настроенных полей",
        "error.unexpected": "Непредвиденная ошибка: {{message}}",
        "indices.title": "Индексы вегетации",
        "indices.loading": "Загрузка индексов...",
        "indices.none": "Нет данных по индексам для этого полигона",
    },
    en: {
        "title.attributes": "Attribute data",
        "title.default": "Polygon info",
        "title.record": "Record #{{id}}",
        "action.pin": "Pin popup to top-right",
        "action.unpin": "Unpin popup",
        "action.minimize": "Minimize popup",
        "action.expand": "Expand popup",
        "status.warning": "Warning",
        "status.loadingFeature": "Loading feature data...",
        "status.noConfiguredData": "No data available for configured fields",
        "status.noFields": "No fields configured. Please configure fields in widget settings.",
        "attachments.title": "Images & Files",
        "status.loadingAttachments": "Loading attachments...",
        "status.noAttachments": "No attachments",
        "attachment.imageFallback": "Image",
        "attachment.fileFallback": "attachment-{{id}}",
        "attachment.download": "Download",
        "status.clickPolygon": "Click a polygon on the map to see its details",
        "status.ready": "Polygon Inspector Ready",
        "status.loading": "Loading...",
        "error.noMapView": "No map view provided",
        "error.noLayersSelected": "No layers selected. Please select one or more Feature Layers in Settings.",
        "error.selectedLayersMissing": "None of the selected layers were found on the map. Ensure the chosen layers exist in the selected Map widget.",
        "error.objectIdFieldMissing": "ObjectId field not found for clicked layer.",
        "error.objectIdMissing": "ObjectId not found. Expected field: {{field}}",
        "error.featureByObjectIdMissing": "Feature not found by ObjectId.",
        "error.configuredFieldMissing": "Some configured fields not found: {{fields}}",
        "error.noDataForConfiguredFields": "No data available for configured fields",
        "error.unexpected": "Unexpected error: {{message}}",
        "indices.title": "Vegetation indices",
        "indices.loading": "Loading indices...",
        "indices.none": "No index data for this polygon",
    },
};
function normalizeLang(input) {
    const raw = String(input !== null && input !== void 0 ? input : "")
        .trim()
        .toLowerCase();
    if (raw === "en" || raw === "eng" || raw === "english")
        return "en";
    if (raw === "ru" || raw === "rus" || raw === "russian")
        return "ru";
    if (raw === "uz_cyr" ||
        raw === "uz-cyr" ||
        raw === "uz_cyrl" ||
        raw === "uz-cyrl" ||
        raw === "uzcyrl" ||
        raw === "uz_cyrillic" ||
        raw === "uz-cyrillic" ||
        raw === "cyrillic") {
        return "uz_cyr";
    }
    if (raw === "uz_lat" ||
        raw === "uz-lat" ||
        raw === "uzlatin" ||
        raw === "uz-latin" ||
        raw === "uz") {
        return "uz_lat";
    }
    return "uz_lat";
}
function getInitialLang() {
    return normalizeLang(localStorage.getItem("agri_app_lang") ||
        localStorage.getItem("app_lang") ||
        "uz_lat");
}
function getInitialTheme() {
    const storedTheme = localStorage.getItem("agri_v11_app_theme");
    if (storedTheme === "dark")
        return true;
    if (storedTheme === "light")
        return false;
    const root = document.documentElement;
    const body = document.body;
    const isLight = storedTheme === "light" ||
        root.classList.contains("light-theme") ||
        body.classList.contains("light-theme") ||
        root.getAttribute("data-theme") === "light";
    return !isLight;
}
function t(lang, key, params) {
    var _a, _b;
    const dict = MESSAGES[lang] || MESSAGES.uz_lat;
    const fallback = (_a = MESSAGES.en[key]) !== null && _a !== void 0 ? _a : key;
    const template = (_b = dict[key]) !== null && _b !== void 0 ? _b : fallback;
    if (!params)
        return template;
    return Object.keys(params).reduce((result, paramKey) => {
        var _a;
        const value = String((_a = params[paramKey]) !== null && _a !== void 0 ? _a : "");
        return result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), value);
    }, template);
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/popup-field-helpers.ts":
/*!**********************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/popup-field-helpers.ts ***!
  \**********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalizeFieldAlias: () => (/* binding */ normalizeFieldAlias)
/* harmony export */ });
/**
 * Pure field helpers for PopupPanel (no React / map side effects).
 */
function normalizeFieldAlias(field, fallbackName) {
    const name = String((field === null || field === void 0 ? void 0 : field.name) || fallbackName || "").trim();
    const alias = String((field === null || field === void 0 ? void 0 : field.alias) || (field === null || field === void 0 ? void 0 : field.displayName) || (field === null || field === void 0 ? void 0 : field.label) || "").trim();
    if (!alias)
        return name;
    return alias;
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/popup-format-helpers.ts":
/*!***********************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/panels/PopupPanel/runtime/popup-format-helpers.ts ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findAttributeValueCaseInsensitive: () => (/* binding */ findAttributeValueCaseInsensitive),
/* harmony export */   formatChartTick: () => (/* binding */ formatChartTick),
/* harmony export */   formatChartTooltipValue: () => (/* binding */ formatChartTooltipValue),
/* harmony export */   formatDateSmart: () => (/* binding */ formatDateSmart),
/* harmony export */   formatPopupAttributeValue: () => (/* binding */ formatPopupAttributeValue),
/* harmony export */   isEsriDateFieldType: () => (/* binding */ isEsriDateFieldType),
/* harmony export */   niceChartMax: () => (/* binding */ niceChartMax)
/* harmony export */ });
/**
 * Pure PopupPanel format / attribute helpers.
 */
function findAttributeValueCaseInsensitive(attributes, fieldName) {
    if (!attributes)
        return null;
    const target = fieldName.toLowerCase();
    const key = Object.keys(attributes).find((k) => k.toLowerCase() === target);
    return key ? attributes[key] : null;
}
function formatDateSmart(raw) {
    if (raw instanceof Date)
        return raw.toLocaleString();
    if (typeof raw === "number" && isFinite(raw)) {
        const ms = raw < 1e12 ? raw * 1000 : raw;
        const d = new Date(ms);
        return isNaN(d.getTime())
            ? String(raw)
            : d.toLocaleString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
    }
    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (/^\d{10,13}$/.test(trimmed))
            return formatDateSmart(Number(trimmed));
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
            return d.toLocaleString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    }
    return String(raw);
}
function niceChartMax(value) {
    if (!Number.isFinite(value) || value <= 0)
        return 1;
    const padded = value * 1.08;
    const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
    const normalized = padded / magnitude;
    let nice = 10;
    if (normalized <= 1)
        nice = 1;
    else if (normalized <= 2)
        nice = 2;
    else if (normalized <= 5)
        nice = 5;
    return nice * magnitude;
}
function formatChartTick(value) {
    if (!Number.isFinite(value))
        return "";
    if (Math.abs(value) >= 1000)
        return `${Math.round(value)}`;
    if (Math.abs(value) >= 100)
        return `${Math.round(value)}`;
    if (Number.isInteger(value))
        return String(value);
    return value.toFixed(1);
}
function formatChartTooltipValue(value) {
    if (!Number.isFinite(value))
        return "";
    if (Number.isInteger(value)) {
        return value.toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");
    }
    return value
        .toLocaleString("ru-RU", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })
        .replace(/[\u00a0\u202f]/g, " ")
        .replace(/,/g, ".");
}
/** ArcGIS field type guard for popup date formatting. */
function isEsriDateFieldType(type) {
    const t = String(type || "");
    return (t === "date" ||
        t === "timestamp-offset" ||
        t === "date-only" ||
        t === "time-only");
}
/** Display string for a popup attribute cell. */
function formatPopupAttributeValue(raw, opts) {
    if (raw === null || raw === undefined || raw === "")
        return "—";
    if (opts.isDateField)
        return opts.formatDate(raw);
    if ((typeof raw === "number" && raw > 1e9 && raw < 1e14) ||
        (typeof raw === "string" && /^\d{10,13}$/.test(raw))) {
        return opts.formatDate(raw);
    }
    if (typeof raw === "number" && isFinite(raw)) {
        return raw
            .toLocaleString("ru-RU")
            .replace(/[\u00a0\u202f]/g, " ")
            .replace(/,/g, ".");
    }
    if (Array.isArray(raw))
        return raw.join(", ");
    if (typeof raw === "object")
        return JSON.stringify(raw);
    return String(raw);
}


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/calendar-days.mjs":
/*!********************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/calendar-days.mjs ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ CalendarDays)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
];
const CalendarDays = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("calendar-days", __iconNode);


//# sourceMappingURL=calendar-days.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/chart-column.mjs":
/*!*******************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/chart-column.mjs ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ ChartColumn)
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
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("chart-column", __iconNode);


//# sourceMappingURL=chart-column.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/chevron-up.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/chevron-up.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ ChevronUp)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("chevron-up", __iconNode);


//# sourceMappingURL=chevron-up.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/download.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/download.mjs ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Download)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("download", __iconNode);


//# sourceMappingURL=download.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/folder-open.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/folder-open.mjs ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ FolderOpen)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
];
const FolderOpen = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("folder-open", __iconNode);


//# sourceMappingURL=folder-open.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/inbox.mjs":
/*!************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/inbox.mjs ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Inbox)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("inbox", __iconNode);


//# sourceMappingURL=inbox.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/map-pin.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/map-pin.mjs ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ MapPin)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("map-pin", __iconNode);


//# sourceMappingURL=map-pin.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.mjs":
/*!**************************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.mjs ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ MousePointerClick)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
  ["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
  ["path", { d: "m6 12-1.9 2", key: "mnht97" }],
  ["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
  [
    "path",
    {
      d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
      key: "s0h3yz"
    }
  ]
];
const MousePointerClick = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("mouse-pointer-click", __iconNode);


//# sourceMappingURL=mouse-pointer-click.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/paperclip.mjs":
/*!****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/paperclip.mjs ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Paperclip)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
      key: "1miecu"
    }
  ]
];
const Paperclip = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("paperclip", __iconNode);


//# sourceMappingURL=paperclip.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/pin.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/pin.mjs ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Pin)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M12 17v5", key: "bb1du9" }],
  [
    "path",
    {
      d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
      key: "1nkz8b"
    }
  ]
];
const Pin = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("pin", __iconNode);


//# sourceMappingURL=pin.mjs.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/settings-2.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/settings-2.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Settings2)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.mjs */ "./node_modules/lucide-react/dist/esm/createLucideIcon.mjs");
/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
];
const Settings2 = (0,_createLucideIcon_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])("settings-2", __iconNode);


//# sourceMappingURL=settings-2.mjs.map


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyb193aWRnZXRWNV9zcmNfcGFuZWxzX1BvcHVwUGFuZWxfcnVudGltZV93aWRnZXRfdHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFEQUFxRDtBQUNyRCx1R0FBdUc7Ozs7Ozs7Ozs7QUFFcEU7QUFFbUI7QUFDZDtBQUNEO0FBQ3NCO0FBQ0E7QUFDSDtBQU12QztBQWlCRztBQUNtRDtBQUkzQjtBQUMyRztBQUMxRTtBQUNHO0FBS3ZDO0FBQ3dDO0FBQ007QUFTekQ7QUFnQlM7QUFJUztBQUlMO0FBQ29CO0FBQ0g7QUFDdUM7QUFDbEI7QUFPL0Q7QUFvRnBCLE1BQXFCLFdBQVksU0FBUSw0Q0FBSyxDQUFDLGFBRzlDO0lBMkNTLGFBQWEsQ0FDbkIsSUFBK0M7UUFFL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNqQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRWpDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQztZQUMvQixNQUFNLElBQUksR0FDUCxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUF3QjtnQkFDcEUsUUFBUSxDQUFDLGVBQWUsQ0FBQztZQUMzQixNQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7aUJBQy9CLGdCQUFnQixDQUFDLDhCQUE4QixDQUFDO2lCQUNoRCxJQUFJLEVBQUUsQ0FBQztZQUNWLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztZQUNyQixDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksSUFB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O0FBRXZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpRUFBZ0I7O0FBRVU7QUFDNUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFdUQ7O0FBRXZEO0FBQ0EsYUFBYSw4QkFBOEI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksaUVBQWdCOztBQUVVO0FBQ3RDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXVEOztBQUV2RDtBQUNBLGFBQWEsOEJBQThCO0FBQzNDLGFBQWEsNkJBQTZCO0FBQzFDLGVBQWUsMkNBQTJDO0FBQzFELGVBQWUseUNBQXlDO0FBQ3hEO0FBQ0Esa0JBQWtCLGlFQUFnQjs7QUFFVTtBQUM1QyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9wYW5lbHMvUG9wdXBQYW5lbC9ydW50aW1lL3dpZGdldC50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2dpcy9BZ3JpSGlkZGVuQ29ubmVjdG9ycy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2dpcy9hZ3JpLWRhdGEtc291cmNlLWVuZ2luZS50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvZ2lzL2FncmktZW5naW5lLXJlZ2lzdHJ5LnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9naXMvYWdyaS1saW5rZWQtbWFwLWxheW91dC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvcGFuZWxzL1BvcHVwUGFuZWwvcnVudGltZS9tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvcGFuZWxzL1BvcHVwUGFuZWwvcnVudGltZS9wb3B1cC1maWVsZC1oZWxwZXJzLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9wYW5lbHMvUG9wdXBQYW5lbC9ydW50aW1lL3BvcHVwLWZvcm1hdC1oZWxwZXJzLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L2Rpc3QvZXNtL2ljb25zL2NhbGVuZGFyLWRheXMubWpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L2Rpc3QvZXNtL2ljb25zL2NoYXJ0LWNvbHVtbi5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvY2hldnJvbi11cC5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvZG93bmxvYWQubWpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L2Rpc3QvZXNtL2ljb25zL2ZvbGRlci1vcGVuLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9pbmJveC5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvbWFwLXBpbi5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvbW91c2UtcG9pbnRlci1jbGljay5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvcGFwZXJjbGlwLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9waW4ubWpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L2Rpc3QvZXNtL2ljb25zL3NldHRpbmdzLTIubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvbHlnb24gQXR0cmlidXRlIEluc3BlY3RvciAoQWdyaVBvbHlnb24gcmVmYWN0b3IpXG4vLyDinIUgVVBEQVRFRDogc3VwcG9ydHMgTVVMVElQTEUgc2VsZWN0ZWQgRmVhdHVyZSBMYXllcnMgKGUuZy4geWVhcmx5IGxheWVycyBmaWx0ZXJlZCBieSBhbm90aGVyIHdpZGdldClcblxuaW1wb3J0IEdyYXBoaWMgZnJvbSBcImVzcmkvR3JhcGhpY1wiO1xuaW1wb3J0IEZlYXR1cmVMYXllciBmcm9tIFwiZXNyaS9sYXllcnMvRmVhdHVyZUxheWVyXCI7XG5pbXBvcnQgR3JhcGhpY3NMYXllciBmcm9tIFwiZXNyaS9sYXllcnMvR3JhcGhpY3NMYXllclwiO1xuaW1wb3J0IFBvaW50IGZyb20gXCJlc3JpL2dlb21ldHJ5L1BvaW50XCI7XG5pbXBvcnQgZXNyaVJlcXVlc3QgZnJvbSBcImVzcmkvcmVxdWVzdFwiO1xuaW1wb3J0IFNpbXBsZUZpbGxTeW1ib2wgZnJvbSBcImVzcmkvc3ltYm9scy9TaW1wbGVGaWxsU3ltYm9sXCI7XG5pbXBvcnQgU2ltcGxlTGluZVN5bWJvbCBmcm9tIFwiZXNyaS9zeW1ib2xzL1NpbXBsZUxpbmVTeW1ib2xcIjtcbmltcG9ydCB7IEppbXVNYXBWaWV3LCBNYXBWaWV3TWFuYWdlciB9IGZyb20gXCJqaW11LWFyY2dpc1wiO1xuaW1wb3J0IHtcbiAgQWxsV2lkZ2V0UHJvcHMsXG4gIERhdGFTb3VyY2VNYW5hZ2VyLFxuICBRdWVyaWFibGVEYXRhU291cmNlLFxuICBSZWFjdCxcbn0gZnJvbSBcImppbXUtY29yZVwiO1xuaW1wb3J0IHtcbiAgQWxlcnRUcmlhbmdsZSxcbiAgQmFyQ2hhcnQzLFxuICBDYWxlbmRhckRheXMsXG4gIERvd25sb2FkLFxuICBGb2xkZXJPcGVuLFxuICBJbmJveCxcbiAgTGluZUNoYXJ0LFxuICBNYXBQaW4sXG4gIE1vdXNlUG9pbnRlckNsaWNrLFxuICBQYXBlcmNsaXAsXG4gIFBpbixcbiAgU2V0dGluZ3MyLFxuICBTcHJvdXQsXG4gIENoZXZyb25VcCxcbiAgWCxcbn0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuaW1wb3J0IHsgQWdyaUhpZGRlbkNvbm5lY3RvcnMgfSBmcm9tIFwiLi4vLi4vLi4vZ2lzL0FncmlIaWRkZW5Db25uZWN0b3JzXCI7XG5pbXBvcnQge1xuICBnZXRTZWxlY3RlZERzSWRzLFxuICB0eXBlIEFncmlEYXRhU291cmNlRW5naW5lLFxufSBmcm9tIFwiLi4vLi4vLi4vZ2lzL2FncmktZGF0YS1zb3VyY2UtZW5naW5lXCI7XG5pbXBvcnQgeyBBR1JJX01BUF9WSUVXX1JFQURZX0VWRU5ULCBBR1JJX01BUF9DTElDS19FVkVOVCwgQUdSSV9YWV9QQUdFX0NMT1NFRF9FVkVOVCwgdHlwZSBBZ3JpTWFwQ2xpY2tEZXRhaWwgfSBmcm9tIFwiLi4vLi4vLi4vZ2lzL2FncmktZGF0YS1sYXllci1yb2xlc1wiO1xuaW1wb3J0IHsgZGlzY292ZXJNYXBXaWRnZXRJZEluQXBwIH0gZnJvbSBcIi4uLy4uLy4uL2dpcy9hZ3JpLWxpbmtlZC1tYXAtbGF5b3V0XCI7XG5pbXBvcnQgeyBnZXRTaGFyZWRBZ3JpRGF0YVNvdXJjZUVuZ2luZSB9IGZyb20gXCIuLi8uLi8uLi9naXMvYWdyaS1lbmdpbmUtcmVnaXN0cnlcIjtcbmltcG9ydCB7XG4gIGFncmlNYXBDbGlja0RlYnVnLFxuICBhZ3JpTWFwQ2xpY2tXYXJuLFxuICBsb2dQb2ludGVyU3RhY2ssXG59IGZyb20gXCIuLi8uLi8uLi9naXMvYWdyaS1tYXAtY2xpY2stZGVidWdcIjtcbmltcG9ydCB7IEdSQUZGX0lOREVYX09SREVSIH0gZnJvbSBcIi4uLy4uL0dyYWZmUGFuZWwvcnVudGltZS9ncmFmZi1ncmFwaC1jb25zdGFudHNcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZUZpZWxkQWxpYXMgYXMgbm9ybWFsaXplRmllbGRBbGlhc1NoYXJlZCB9IGZyb20gXCIuL3BvcHVwLWZpZWxkLWhlbHBlcnNcIjtcbmltcG9ydCB7XG4gIGZpbmRBdHRyaWJ1dGVWYWx1ZUNhc2VJbnNlbnNpdGl2ZSBhcyBmaW5kQXR0cmlidXRlVmFsdWVDYXNlSW5zZW5zaXRpdmVTaGFyZWQsXG4gIGZvcm1hdENoYXJ0VGljayBhcyBmb3JtYXRDaGFydFRpY2tTaGFyZWQsXG4gIGZvcm1hdENoYXJ0VG9vbHRpcFZhbHVlIGFzIGZvcm1hdENoYXJ0VG9vbHRpcFZhbHVlU2hhcmVkLFxuICBmb3JtYXREYXRlU21hcnQgYXMgZm9ybWF0RGF0ZVNtYXJ0U2hhcmVkLFxuICBmb3JtYXRQb3B1cEF0dHJpYnV0ZVZhbHVlLFxuICBpc0VzcmlEYXRlRmllbGRUeXBlLFxuICBuaWNlQ2hhcnRNYXggYXMgbmljZUNoYXJ0TWF4U2hhcmVkLFxufSBmcm9tIFwiLi9wb3B1cC1mb3JtYXQtaGVscGVyc1wiO1xuaW1wb3J0IHtcbiAgY29sbGVjdFF1ZXJ5YWJsZUZpZWxkTGF5ZXJzLFxuICBleHRyYWN0TWFwTGF5ZXJJZEZyb21Ec0lkLFxuICBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5VXJsLFxuICBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5SWQsXG4gIGdldEFsbEZlYXR1cmVMYXllcnNGcm9tTWFwLFxuICBnZXREZXRhY2hlZFF1ZXJ5TGF5ZXJGb3IsXG4gIGdldEFncmlMYXllck1hcEtleSxcbiAgZ2V0UXVlcnlhYmxlTGF5ZXIsXG4gIGlzQWdyaUFkbWluQm91bmRhcnlMYXllcixcbiAgaXNNYXBJbWFnZUdyb3VwU3VibGF5ZXIsXG4gIGlzTWFwSW1hZ2VPd25lZExheWVyLFxuICBpc1F1ZXJ5YWJsZUZpZWxkTGF5ZXIsXG4gIG5vcm1hbGl6ZVF1ZXJ5YWJsZUxheWVyVXJsLFxuICBzYWZlTG9hZE1hcExheWVyLFxufSBmcm9tIFwiLi4vLi4vLi4vZ2lzL2ZlYXR1cmUtbGF5ZXItZGF0YVwiO1xuaW1wb3J0IHtcbiAgZm9ybWF0QXJjZ2lzRGF0ZVRvWW1kLFxuICBxdWVyeVZlZ2V0YXRpb25TZXJpZXNGb3JVbmlxdWVJZCxcbn0gZnJvbSBcIi4uLy4uLy4uL2dpcy9hZ3JpLXZlZ2V0YXRpb24tZGF0YS1zb3VyY2VcIjtcbmltcG9ydCB7XG4gIEFHUklfVEFCTEVfSk9JTl9GSUVMRCxcbiAgcXVlcnlBZ3JpUmVjb3JkQnlVbmlxdWVJZCxcbn0gZnJvbSBcIi4uLy4uLy4uL2dpcy9hZ3JpLXRhYmxlLWRhdGEtc291cmNlXCI7XG5pbXBvcnQgeyBiaW5kTWFzdGVyRmlsdGVyIH0gZnJvbSBcIi4uLy4uLy4uL2RhdGEvYWdyaS1maWx0ZXItYnVzXCI7XG5pbXBvcnQgQWdyaUNoYXJ0TG9hZGVyIGZyb20gXCIuLi8uLi8uLi9zaGFyZWQvQWdyaUNoYXJ0TG9hZGVyXCI7XG5pbXBvcnQgeyBwcmVmZXRjaFZlZ2V0YXRpb25PdmVybGF5Rm9yVW5pcXVlaWQgfSBmcm9tIFwiLi4vLi4vLi4vZ2lzL2FncmktdmVnZXRhdGlvbi1vdmVybGF5LXByZWZldGNoXCI7XG5pbXBvcnQgeyByZXNvbHZlQ3JvcElkRnJvbUF0dHJpYnV0ZXMgfSBmcm9tIFwiLi4vLi4vLi4vZ2lzL2FncmktcG9seWdvbi1hcGktc291cmNlXCI7XG5pbXBvcnQge1xuICBnZXRJbml0aWFsTGFuZyxcbiAgZ2V0SW5pdGlhbFRoZW1lLFxuICBub3JtYWxpemVMYW5nLFxuICB0LFxuICB0eXBlIExhbmdDb2RlLFxufSBmcm9tIFwiLi9tZXNzYWdlc1wiO1xuXG50eXBlIENvbmZpZyA9IHtcbiAgZmllbGRzVG9TaG93Pzogc3RyaW5nW107XG4gIHRpdGxlRmllbGQ/OiBzdHJpbmc7XG4gIGxhYmVscz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHNldHRpbmdzPzoge1xuICAgIHpvb21Ub1NlbGVjdGlvbj86IGJvb2xlYW47IC8vIGRlZmF1bHQgdHJ1ZVxuICAgIHNob3dNYXBQb3B1cD86IGJvb2xlYW47IC8vIGRlZmF1bHQgZmFsc2VcbiAgICBzaG93QXR0YWNobWVudHM/OiBib29sZWFuOyAvLyBkZWZhdWx0IHRydWUgKHdoZW4gdW5kZWZpbmVkKVxuICB9O1xuICBjaGFydEVuYWJsZWQ/OiBib29sZWFuO1xuICBjaGFydFR5cGU/OiBcImJhclwiIHwgXCJsaW5lXCI7XG4gIGNoYXJ0VGl0bGU/OiBzdHJpbmc7XG4gIGNoYXJ0RmllbGRzPzogc3RyaW5nW107XG4gIGNoYXJ0Q29sb3I/OiBzdHJpbmc7XG59O1xuXG50eXBlIEF0dGFjaG1lbnRJdGVtID0ge1xuICBpZDogbnVtYmVyO1xuICBuYW1lPzogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xuICBjb250ZW50VHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nOyAvLyBkaXJlY3QgZG93bmxvYWQgVVJMXG4gIHByZXZpZXdPYmplY3RVcmw/OiBzdHJpbmc7IC8vIGNyZWF0ZWQgdmlhIFVSTC5jcmVhdGVPYmplY3RVUkwgZm9yIDxpbWc+IHByZXZpZXdzXG59O1xuXG5pbnRlcmZhY2UgU3RhdGUge1xuICBjdXJyZW50TGFuZzogTGFuZ0NvZGU7XG4gIGlzRGFya1RoZW1lOiBib29sZWFuO1xuXG4gIGppbXVNYXBWaWV3PzogSmltdU1hcFZpZXcgfCBudWxsO1xuXG4gIC8qKiDinIUgTVVMVEk6IGFsbCByZXNvbHZlZCBsYXllcnMgZnJvbSBzZXR0aW5ncyAqL1xuICBmZWF0dXJlTGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW107XG4gIC8qKiDinIUgTVVMVEk6IG1hcCBjbGlja2VkIGxheWVyID0+IGRzSWQgKGJlc3QtZWZmb3J0KSAqL1xuICBsYXllcktleVRvRHNJZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAvKiog4pyFIE1VTFRJOiBzdG9yZSBEUyBzY2hlbWFzIHBlciBEUyBpZCAqL1xuICBkYXRhU291cmNlc0J5SWQ6IFJlY29yZDxzdHJpbmcsIFF1ZXJpYWJsZURhdGFTb3VyY2U+O1xuXG4gIC8qKiB3aGljaCBsYXllciB3YXMgbGFzdCBjbGlja2VkIChmb3IgYWxpYXNlcy9maWVsZCByZXNvbHZpbmcpICovXG4gIGxhc3RDbGlja2VkRHNJZDogc3RyaW5nIHwgbnVsbDtcbiAgbGFzdENsaWNrZWRMYXllcktleTogc3RyaW5nIHwgbnVsbDtcblxuICBwaW5Ub0Nvcm5lcjogYm9vbGVhbjtcblxuICAvLyBhdHRhY2htZW50cyBVSVxuICBsb2FkaW5nQXR0YWNobWVudHM6IGJvb2xlYW47XG4gIGF0dGFjaG1lbnRzOiBBdHRhY2htZW50SXRlbVtdO1xuICBhdHRhY2htZW50c0Vycm9yOiBzdHJpbmcgfCBudWxsO1xuICBhdHRhY2htZW50c0V4cGFuZGVkOiBib29sZWFuO1xuXG4gIGxvYWRpbmc6IGJvb2xlYW47XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsO1xuXG4gIHNlbGVjdGVkQXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsO1xuICBzZWxlY3RlZE9JRDogbnVtYmVyIHwgbnVsbDtcbiAgb2JqZWN0SWRGaWVsZDogc3RyaW5nIHwgbnVsbDtcblxuICBzaG93UG9wdXA6IGJvb2xlYW47XG4gIC8qKiBYIGNvbGxhcHNlcyB0aGUgcGFuZWw7IHNlbGVjdGlvbiArIGRhdGEgc3RheSB1bnRpbCByZWFsIGRlc2VsZWN0LiAqL1xuICBwb3B1cE1pbmltaXplZDogYm9vbGVhbjtcbiAgcG9wdXBQb3NpdGlvbjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbDtcbiAgY2xpY2tTY3JlZW5Qb2ludDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbDtcblxuICBkZWJ1Z0luZm86IHtcbiAgICBsYXllckluZm8/OiBhbnk7XG4gICAgaGl0VGVzdFJlc3VsdHM/OiBhbnk7XG4gICAgcXVlcnlSZXN1bHRzPzogYW55O1xuICAgIGZpZWxkTWFwcGluZz86IGFueTtcbiAgICBhdmFpbGFibGVMYXllcnM/OiBhbnk7XG4gIH07XG5cbiAgY2hhcnRFeHBhbmRlZDogYm9vbGVhbjtcbiAgY2hhcnRIb3ZlckluZGV4OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIExhdGVzdC1kYXkgdmVnZXRhdGlvbiBpbmRleCB2YWx1ZXMgKE5EVkkvU0FWSS9SVkkvQ0kvRVZJL05EV0kpIGZvciB0aGVcbiAgLy8gY3VycmVudGx5IHNlbGVjdGVkIHBvbHlnb24sIGZyb20gYWdyaV92ZWdldGF0aW9uX2luZGljZXMuXG4gIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiBib29sZWFuO1xuICBsYXRlc3RJbmRleERhdGU6IHN0cmluZyB8IG51bGw7XG4gIGxhdGVzdEluZGV4VmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IHwgbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWdyaVBvbHlnb24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PFxuICBBbGxXaWRnZXRQcm9wczxDb25maWc+LFxuICBTdGF0ZVxuPiB7XG4gIHByaXZhdGUgX2lzTW91bnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF91bmJpbmRNYXN0ZXJGaWx0ZXI6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRoZW1lT2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2xpY2tIYW5kbGU6IElIYW5kbGVMaWtlIHwgbnVsbCA9IG51bGw7XG4gIC8qKiBNb25vdG9uaWMgaWQgc28gYSBzbG93L2R1cGxpY2F0ZSBjbGljayBwYXRoIGNhbm5vdCBjbG9zZSBhIG5ld2VyIHBvcHVwLiAqL1xuICBwcml2YXRlIF9jbGlja0dlbmVyYXRpb24gPSAwO1xuICBwcml2YXRlIF9wb3B1cFJlZjogUmVhY3QuUmVmT2JqZWN0PEhUTUxEaXZFbGVtZW50PiA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICBwcml2YXRlIF9oaWdobGlnaHRMYXllcjogX19lc3JpLkdyYXBoaWNzTGF5ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfaGlnaGxpZ2h0R3JhcGhpYzogX19lc3JpLkdyYXBoaWMgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfaGlnaGxpZ2h0SGFsb0dyYXBoaWM6IF9fZXNyaS5HcmFwaGljIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2V4dGVudEJlZm9yZVNlbGVjdGlvbjogX19lc3JpLkV4dGVudCB8IG51bGwgPSBudWxsO1xuICAvKiogQ3VycmVudGx5IGluc3BlY3RlZCBmaWVsZCB1bmlxdWVpZCAobWFwIG9yIHRhYmxlIHZpYSBodWIpLiBTYW1lLWlkIG1hcCBjbGljayB0b2dnbGVzIG9mZi4gKi9cbiAgcHJpdmF0ZSBfYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAvKiogTGFzdCB5aWx8dmlsb3lhdHx0dW1hbiBmcm9tIG1hc3RlckZpbHRlckNoYW5nZWQg4oCUIGdlb2dyYXBoeSBtb3ZlIGNsb3NlcyBwb3B1cC4gKi9cbiAgcHJpdmF0ZSBfbGFzdE1hc3Rlckdlb0tleSA9IFwiXCI7XG4gIHByaXZhdGUgX2lzRHJhZ2dpbmdQb3B1cCA9IGZhbHNlO1xuICBwcml2YXRlIF9wb3B1cERyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbiAgcHJpdmF0ZSBfcG9wdXBMYXlvdXRUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcG9wdXBMYXlvdXRSYWYgPSAwO1xuICBwcml2YXRlIG1hcEFyZWFSZXNpemVPYnNlcnZlcjogUmVzaXplT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBfZmVhdHVyZVF1ZXJ5Q2FjaGVUdGxNcyA9IDYwICogNjAgKiAxMDAwO1xuICBwcml2YXRlIF9mZWF0dXJlUXVlcnlDYWNoZSA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIHsgZXhwaXJlczogbnVtYmVyOyB2YWx1ZTogUHJvbWlzZTxfX2VzcmkuR3JhcGhpYyB8IG51bGw+IH1cbiAgPigpO1xuICAvKiogRGV0YWNoZWQgcXVlcnkgY2xpZW50cyBrZXllZCBieSBzZXJ2aWNlIFVSTDsgbmV2ZXIgbXV0YXRlIGxpdmUgbWFwIHN1YmxheWVycy4gKi9cbiAgcHJpdmF0ZSBfcXVlcnlPbmx5TGF5ZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZlYXR1cmVMYXllcj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBkYXRhU291cmNlRW5naW5lOiBBZ3JpRGF0YVNvdXJjZUVuZ2luZTtcbiAgcHJpdmF0ZSBtYXBWaWV3RmFsbGJhY2tUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBtYXBJbml0UmV0cnlUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjb25uZWN0ZWRNYXBWaWV3SWQgPSBcIlwiO1xuICBwcml2YXRlIG1hcEluaXRSZXRyeUNvdW50ID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBtYXhNYXBJbml0UmV0cmllcyA9IDEyO1xuICBwcml2YXRlIG1hcENsaWNrQm9vdHN0cmFwVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IFBPUFVQX1dJRFRIID0gMzQwO1xuICBwcml2YXRlIHJlYWRvbmx5IFBPUFVQX01BUkdJTiA9IDEyO1xuICAvKiogTWF0Y2ggZGFzaGJvYXJkIG1hcCBvdmVybGF5czogMTZweCBob3Jpem9udGFsIGFuZCAxMnB4IHZlcnRpY2FsIGluc2V0LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IERBU0hCT0FSRF9QT1BVUF9IT1JJWk9OVEFMX0lOU0VUID0gMTY7XG4gIHByaXZhdGUgcmVhZG9ubHkgREFTSEJPQVJEX1BPUFVQX1ZFUlRJQ0FMX0lOU0VUID0gMTI7XG4gIC8qKiBHdWFyZHMgYWdhaW5zdCBhIHN0YWxlIGxhdGVzdC1pbmRpY2VzIHJlc3BvbnNlIGxhbmRpbmcgYWZ0ZXIgYSBuZXdlciBwb2x5Z29uIHNlbGVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfbGF0ZXN0SW5kaWNlc1JlcXVlc3RJZCA9IDA7XG5cbiAgcHJpdmF0ZSBnZXRQb3B1cFdpZHRoKFxuICAgIHZpZXc/OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcgfCBudWxsLFxuICApOiBudW1iZXIge1xuICAgIGNvbnN0IG1hcmdpbiA9IHRoaXMuUE9QVVBfTUFSR0lOO1xuICAgIGxldCBwcmVmZXJyZWQgPSB0aGlzLlBPUFVQX1dJRFRIO1xuXG4gICAgaWYgKHRoaXMuaXNEYXNoYm9hcmRFbWJlZGRlZCgpKSB7XG4gICAgICBjb25zdCByb290ID1cbiAgICAgICAgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWdyaS1kYXNoYm9hcmQtdjNcIikgYXMgSFRNTEVsZW1lbnQgfCBudWxsKSB8fFxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBjb25zdCByYXcgPSBnZXRDb21wdXRlZFN0eWxlKHJvb3QpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1hZ3JpLWRhc2hib2FyZC1wb3B1cC13aWR0aFwiKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyLnBhcnNlRmxvYXQocmF3KTtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocGFyc2VkKSAmJiBwYXJzZWQgPiAwKSB7XG4gICAgICAgIHByZWZlcnJlZCA9IHBhcnNlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodmlldykge1xuICAgICAgY29uc3QgbWFwVyA9IHRoaXMuZ2V0TWFwQXJlYVJlY3Qodmlldykud2lkdGg7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoMjIwLCBNYXRoLm1pbihwcmVmZXJyZWQsIG1hcFcgLSBtYXJnaW4gKiAyKSk7XG4gICAgfVxuICAgIHJldHVybiBwcmVmZXJyZWQ7XG4gIH1cblxuICBwcml2YXRlIGdldFBpbm5lZFBvcHVwSGVpZ2h0KFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgICB0b3BZOiBudW1iZXIsXG4gICk6IG51bWJlciB7XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuZ2V0TWFwQXJlYVJlY3Qodmlldyk7XG4gICAgaWYgKHRoaXMuaXNEYXNoYm9hcmRFbWJlZGRlZCgpKSB7XG4gICAgICBjb25zdCBib3R0b21JbnNldCA9IHRoaXMuREFTSEJPQVJEX1BPUFVQX1ZFUlRJQ0FMX0lOU0VUO1xuICAgICAgcmV0dXJuIE1hdGgubWF4KDE2MCwgcmVjdC5ib3R0b20gLSBib3R0b21JbnNldCAtIHRvcFkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcmdpbiA9IHRoaXMuUE9QVVBfTUFSR0lOO1xuICAgIGNvbnN0IG1hcEJvdHRvbSA9IHRoaXMuZ2V0RWZmZWN0aXZlTWFwQm90dG9tKHZpZXcsIG1hcmdpbik7XG4gICAgcmV0dXJuIE1hdGgubWF4KDE2MCwgbWFwQm90dG9tIC0gdG9wWSk7XG4gIH1cblxuICBwcml2YXRlIGdldFBvcHVwRGltZW5zaW9ucyhcbiAgICB2aWV3PzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3IHwgbnVsbCxcbiAgICBwaW5uZWQgPSBmYWxzZSxcbiAgICBwb3NpdGlvbj86IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwsXG4gICk6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSB7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmdldFBvcHVwV2lkdGgodmlldyk7XG4gICAgaWYgKHBpbm5lZCAmJiB2aWV3KSB7XG4gICAgICBjb25zdCB0b3BZID1cbiAgICAgICAgcG9zaXRpb24/LnkgPz8gdGhpcy5jYWxjdWxhdGVQaW5uZWRQb3NpdGlvbih2aWV3KS55O1xuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRQaW5uZWRQb3B1cEhlaWdodCh2aWV3LCB0b3BZKTtcbiAgICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgd2lkdGgsIGhlaWdodDogd2lkdGggfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBBbGxXaWRnZXRQcm9wczxDb25maWc+KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuZGF0YVNvdXJjZUVuZ2luZSA9IGdldFNoYXJlZEFncmlEYXRhU291cmNlRW5naW5lKHByb3BzLmlkKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjdXJyZW50TGFuZzogZ2V0SW5pdGlhbExhbmcoKSxcbiAgICAgIGlzRGFya1RoZW1lOiB0aGlzLmdldFJlc29sdmVkVGhlbWUoKSxcblxuICAgICAgamltdU1hcFZpZXc6IG51bGwsXG5cbiAgICAgIGZlYXR1cmVMYXllcnM6IFtdLFxuICAgICAgbGF5ZXJLZXlUb0RzSWQ6IHt9LFxuICAgICAgZGF0YVNvdXJjZXNCeUlkOiB7fSxcblxuICAgICAgbGFzdENsaWNrZWREc0lkOiBudWxsLFxuICAgICAgbGFzdENsaWNrZWRMYXllcktleTogbnVsbCxcblxuICAgICAgcGluVG9Db3JuZXI6IHRydWUsXG5cbiAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICBhdHRhY2htZW50czogW10sXG4gICAgICBhdHRhY2htZW50c0Vycm9yOiBudWxsLFxuICAgICAgYXR0YWNobWVudHNFeHBhbmRlZDogZmFsc2UsXG5cbiAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgZXJyb3I6IG51bGwsXG5cbiAgICAgIHNlbGVjdGVkQXR0cnM6IG51bGwsXG4gICAgICBzZWxlY3RlZE9JRDogbnVsbCxcbiAgICAgIG9iamVjdElkRmllbGQ6IG51bGwsXG5cbiAgICAgIHNob3dQb3B1cDogZmFsc2UsXG4gICAgICBwb3B1cE1pbmltaXplZDogZmFsc2UsXG4gICAgICBwb3B1cFBvc2l0aW9uOiBudWxsLFxuICAgICAgY2xpY2tTY3JlZW5Qb2ludDogbnVsbCxcblxuICAgICAgZGVidWdJbmZvOiB7fSxcbiAgICAgIGNoYXJ0RXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgY2hhcnRIb3ZlckluZGV4OiBudWxsLFxuXG4gICAgICBsb2FkaW5nTGF0ZXN0SW5kaWNlczogZmFsc2UsXG4gICAgICBsYXRlc3RJbmRleERhdGU6IG51bGwsXG4gICAgICBsYXRlc3RJbmRleFZhbHVlczogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXNvbHZlZFRoZW1lID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWRUaGVtZSA9XG4gICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYWdyaV92MTFfYXBwX3RoZW1lXCIpO1xuXG4gICAgICBpZiAoc2F2ZWRUaGVtZSA9PT0gXCJsaWdodFwiKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoc2F2ZWRUaGVtZSA9PT0gXCJkYXJrXCIpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlIHN0b3JhZ2UgYWNjZXNzIGlzc3Vlc1xuICAgIH1cblxuICAgIGNvbnN0IGlzTGlnaHQgPVxuICAgICAgcm9vdC5jbGFzc0xpc3QuY29udGFpbnMoXCJsaWdodC10aGVtZVwiKSB8fFxuICAgICAgcm9vdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRoZW1lXCIpID09PSBcImxpZ2h0XCIgfHxcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwibGlnaHQtdGhlbWVcIik7XG5cbiAgICByZXR1cm4gZ2V0SW5pdGlhbFRoZW1lKCkgPz8gIWlzTGlnaHQ7XG4gIH07XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICB0aGlzLnNldHVwVGhlbWVPYnNlcnZlcigpO1xuICAgIGNvbnN0IGlzRGFya1RoZW1lID0gdGhpcy5nZXRSZXNvbHZlZFRoZW1lKCk7XG4gICAgaWYgKGlzRGFya1RoZW1lICE9PSB0aGlzLnN0YXRlLmlzRGFya1RoZW1lKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNEYXJrVGhlbWUgfSk7XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInRoZW1lQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVUaGVtZUNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwibGFuZ3VhZ2VDaGFuZ2VkXCIsXG4gICAgICB0aGlzLmhhbmRsZUxhbmd1YWdlQ2hhbmdlIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuaGFuZGxlT3V0c2lkZUNsaWNrKTtcbiAgICB0aGlzLl91bmJpbmRNYXN0ZXJGaWx0ZXIgPSBiaW5kTWFzdGVyRmlsdGVyKHRoaXMuaGFuZGxlTWFzdGVyRmlsdGVyQ2hhbmdlZCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwid2lkZ2V0U2VsZWN0aW9uQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVXaWRnZXRTZWxlY3Rpb25DaGFuZ2VkIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLnNjaGVkdWxlUG9wdXBMYXlvdXQpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgQUdSSV9NQVBfVklFV19SRUFEWV9FVkVOVCxcbiAgICAgIHRoaXMuaGFuZGxlTWFwVmlld1JlYWR5IGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIEFHUklfTUFQX0NMSUNLX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVTaGFyZWRNYXBDbGljayBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBBR1JJX1hZX1BBR0VfQ0xPU0VEX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVYeVBhZ2VDbG9zZWQgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGlmICghdGhpcy5pc0Rhc2hib2FyZEVtYmVkZGVkKCkpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dCwgdHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuc2NoZWR1bGVNYXBWaWV3RmFsbGJhY2soKTtcbiAgICB0aGlzLm1hcENsaWNrQm9vdHN0cmFwVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5lbnN1cmVNYXBDbGlja0F0dGFjaGVkKCkgJiYgdGhpcy5tYXBDbGlja0Jvb3RzdHJhcFRpbWVyKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5tYXBDbGlja0Jvb3RzdHJhcFRpbWVyKTtcbiAgICAgICAgdGhpcy5tYXBDbGlja0Jvb3RzdHJhcFRpbWVyID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LCAyNTAwKTtcbiAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcIkFncmlQb2x5Z29uIG1vdW50ZWRcIiwge1xuICAgICAgd2lkZ2V0SWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBlbWJlZGRlZDogdGhpcy5pc0Rhc2hib2FyZEVtYmVkZGVkKCksXG4gICAgICBtYXBXaWRnZXRJZDogdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpLFxuICAgICAgdXNlRGF0YVNvdXJjZUlkczogZ2V0U2VsZWN0ZWREc0lkcyh0aGlzLnByb3BzLnVzZURhdGFTb3VyY2VzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnN0YXRlLnNob3dQb3B1cCkge1xuICAgICAgdGhpcy5icm9hZGNhc3RQb3B1cFZpc2liaWxpdHkoZmFsc2UpO1xuICAgIH1cbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0aGVtZUNoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlVGhlbWVDaGFuZ2UgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcImxhbmd1YWdlQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVMYW5ndWFnZUNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgdGhpcy5kZXRhY2hNYXBDbGljaygpO1xuICAgIHRoaXMuY2xlYW51cEhpZ2hsaWdodCgpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5oYW5kbGVPdXRzaWRlQ2xpY2spO1xuICAgIHRoaXMuX3VuYmluZE1hc3RlckZpbHRlcj8uKCk7XG4gICAgdGhpcy5fdW5iaW5kTWFzdGVyRmlsdGVyID0gbnVsbDtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJ3aWRnZXRTZWxlY3Rpb25DaGFuZ2VkXCIsXG4gICAgICB0aGlzLmhhbmRsZVdpZGdldFNlbGVjdGlvbkNoYW5nZWQgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dCk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBBR1JJX01BUF9WSUVXX1JFQURZX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVNYXBWaWV3UmVhZHkgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgQUdSSV9NQVBfQ0xJQ0tfRVZFTlQsXG4gICAgICB0aGlzLmhhbmRsZVNoYXJlZE1hcENsaWNrIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIEFHUklfWFlfUEFHRV9DTE9TRURfRVZFTlQsXG4gICAgICB0aGlzLmhhbmRsZVh5UGFnZUNsb3NlZCBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgaWYgKHRoaXMubWFwVmlld0ZhbGxiYWNrVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyKTtcbiAgICBpZiAodGhpcy5tYXBJbml0UmV0cnlUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMubWFwSW5pdFJldHJ5VGltZXIpO1xuICAgIGlmICh0aGlzLm1hcENsaWNrQm9vdHN0cmFwVGltZXIpIGNsZWFySW50ZXJ2YWwodGhpcy5tYXBDbGlja0Jvb3RzdHJhcFRpbWVyKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnNjaGVkdWxlUG9wdXBMYXlvdXQsIHRydWUpO1xuICAgIGlmICh0aGlzLl9wb3B1cExheW91dFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5fcG9wdXBMYXlvdXRUaW1lcik7XG4gICAgaWYgKHRoaXMuX3BvcHVwTGF5b3V0UmFmKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9wb3B1cExheW91dFJhZik7XG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLm1hcEFyZWFSZXNpemVPYnNlcnZlciA9IG51bGw7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5vblBvcHVwRHJhZ01vdmUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm9uUG9wdXBEcmFnRW5kKTtcbiAgICBpZiAodGhpcy50aGVtZU9ic2VydmVyKSB7XG4gICAgICB0aGlzLnRoZW1lT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy50aGVtZU9ic2VydmVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5yZXZva2VBbGxBdHRhY2htZW50VXJscygpO1xuICAgIHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlLmNsZWFyKCk7XG4gIH1cblxuICBwcml2YXRlIHBydW5lRmVhdHVyZVF1ZXJ5Q2FjaGUobm93ID0gRGF0ZS5ub3coKSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlKSB7XG4gICAgICBpZiAoZW50cnkuZXhwaXJlcyA8PSBub3cpIHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmVhdHVyZVF1ZXJ5Q2FjaGVLZXkoXG4gICAgbGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIsXG4gICAgb2lkRmllbGQ6IHN0cmluZyxcbiAgICBvaWQ6IHVua25vd24sXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSxcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCBsYXllcktleSA9IFN0cmluZygobGF5ZXIgYXMgYW55KT8udXJsIHx8IGxheWVyLmlkIHx8IGxheWVyLnRpdGxlIHx8IFwiXCIpO1xuICAgIGNvbnN0IGZpZWxkc0tleSA9IEFycmF5LmZyb20obmV3IFNldChvdXRGaWVsZHMubWFwKChmKSA9PiBTdHJpbmcoZikpKSlcbiAgICAgIC5zb3J0KClcbiAgICAgIC5qb2luKFwiLFwiKTtcbiAgICByZXR1cm4gYCR7bGF5ZXJLZXl9fCR7b2lkRmllbGR9fCR7U3RyaW5nKG9pZCl9fCR7ZmllbGRzS2V5fWA7XG4gIH1cblxuICAvKipcbiAgICogT2ZmLW1hcCBGZWF0dXJlTGF5ZXIgY2xpZW50IGZvciBhIGxpdmUgbWFwIGxheWVyJ3MgVVJMLiBFdmVyeSBxdWVyeSBpblxuICAgKiB0aGUgY2xpY2sgY2hhaW4gbXVzdCBydW4gYWdhaW5zdCB0aGVzZSBkZXRhY2hlZCBjbGllbnRzOiBjcmVhdGVRdWVyeSAvXG4gICAqIHF1ZXJ5RmVhdHVyZXMgb24gYSBsaXZlIE1hcEltYWdlIFN1YmxheWVyIHJlaHlkcmF0ZXMgaXQgYW5kIGNhbiBjbGVhciBpdHNcbiAgICogcnVudGltZSBkZWZpbml0aW9uRXhwcmVzc2lvbiwgd2hpY2ggbWFrZXMgdGhlIG1hcCBleHBvcnQgKGFuZCBicmllZmx5XG4gICAqIHBhaW50KSBldmVyeSBkaXN0cmljdCdzIGZpZWxkcyB1bnRpbCB0aGUgZmlsdGVyIGd1YXJkIHJlc3RvcmVzIGl0LlxuICAgKlxuICAgKiBTaGFyZWQgaGVscGVyIGFsc28gc2tpcHMgTWFwU2VydmVyIHJvb3RzIGFuZCBHcm91cCBMYXllciBmb2xkZXJzXG4gICAqIChcIkFncmkgMjAyNiByZXB1YmxpYyBkYXRhXCIpIHRoYXQgRmVhdHVyZUxheWVyIGNhbm5vdCBsb2FkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXREZXRhY2hlZFF1ZXJ5TGF5ZXIgPSBhc3luYyAoXG4gICAgbGF5ZXI6IGFueSxcbiAgKTogUHJvbWlzZTxfX2VzcmkuRmVhdHVyZUxheWVyIHwgbnVsbD4gPT4ge1xuICAgIGlmICghbGF5ZXIgfHwgaXNNYXBJbWFnZUdyb3VwU3VibGF5ZXIobGF5ZXIpKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBkZXRhY2hlZCA9IGF3YWl0IGdldERldGFjaGVkUXVlcnlMYXllckZvcihsYXllcik7XG4gICAgaWYgKCFkZXRhY2hlZCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdXJsID0gU3RyaW5nKGxheWVyPy51cmwgfHwgXCJcIikudHJpbSgpLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gICAgaWYgKHVybCkgdGhpcy5fcXVlcnlPbmx5TGF5ZXJzLnNldCh1cmwsIGRldGFjaGVkKTtcbiAgICByZXR1cm4gZGV0YWNoZWQgYXMgdW5rbm93biBhcyBfX2VzcmkuRmVhdHVyZUxheWVyO1xuICB9O1xuXG4gIC8qKiBTbmFwc2hvdCB0aGUgbGl2ZSBkZWZpbml0aW9uRXhwcmVzc2lvbiBvZiBlYWNoIGxheWVyIChwcmUtaGl0VGVzdCkuICovXG4gIHByaXZhdGUgc25hcHNob3REZWZpbml0aW9uRXhwcmVzc2lvbnMoXG4gICAgbGF5ZXJzOiBBcnJheTxfX2VzcmkuRmVhdHVyZUxheWVyIHwgYW55PixcbiAgKTogTWFwPGFueSwgc3RyaW5nPiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBuZXcgTWFwPGFueSwgc3RyaW5nPigpO1xuICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICBpZiAoIWxheWVyIHx8IHNuYXBzaG90LmhhcyhsYXllcikpIGNvbnRpbnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc25hcHNob3Quc2V0KGxheWVyLCBTdHJpbmcoKGxheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gPz8gXCJcIikpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc25hcHNob3Q7XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBhbnkgZGVmaW5pdGlvbkV4cHJlc3Npb24gdGhhdCBkcmlmdGVkICh3YXMgY2xlYXJlZCBieSBoaXRUZXN0IC9cbiAgICogaWRlbnRpZnkgLyBsb2FkIHJlaHlkcmF0aW9uKSBzeW5jaHJvbm91c2x5LCBiZWZvcmUgdGhlIHVuZmlsdGVyZWRcbiAgICogTWFwSW1hZ2UgZXhwb3J0IGNhbiBiZSBwYWludGVkLlxuICAgKi9cbiAgcHJpdmF0ZSByZXN0b3JlRHJpZnRlZERlZmluaXRpb25FeHByZXNzaW9ucyhcbiAgICBzbmFwc2hvdDogTWFwPGFueSwgc3RyaW5nPixcbiAgKTogdm9pZCB7XG4gICAgc25hcHNob3QuZm9yRWFjaCgoZXhwcmVzc2lvbiwgbGF5ZXIpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBTdHJpbmcoKGxheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gPz8gXCJcIik7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSBleHByZXNzaW9uKSB7XG4gICAgICAgICAgKGxheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xuICAgICAgICAgIGFncmlNYXBDbGlja1dhcm4oXCJkZWZpbml0aW9uRXhwcmVzc2lvbiBkcmlmdCByZXN0b3JlZFwiLCB7XG4gICAgICAgICAgICBsYXllcjogbGF5ZXI/LnRpdGxlIHx8IGxheWVyPy51cmwgfHwgbGF5ZXI/LmlkLFxuICAgICAgICAgICAgZHJpZnRlZDogY3VycmVudCB8fCBcIjxlbXB0eT5cIixcbiAgICAgICAgICAgIHJlc3RvcmVkOiBleHByZXNzaW9uIHx8IFwiPGVtcHR5PlwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLyogaWdub3JlICovXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHF1ZXJ5RmVhdHVyZUJ5T2JqZWN0SWRDYWNoZWQoXG4gICAgbGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIsXG4gICAgb2lkRmllbGQ6IHN0cmluZyxcbiAgICBvaWQ6IHVua25vd24sXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSxcbiAgKTogUHJvbWlzZTxfX2VzcmkuR3JhcGhpYyB8IG51bGw+IHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMucHJ1bmVGZWF0dXJlUXVlcnlDYWNoZShub3cpO1xuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0RmVhdHVyZVF1ZXJ5Q2FjaGVLZXkobGF5ZXIsIG9pZEZpZWxkLCBvaWQsIG91dEZpZWxkcyk7XG4gICAgY29uc3QgaGl0ID0gdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKGhpdCAmJiBoaXQuZXhwaXJlcyA+IG5vdykge1xuICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJmZWF0dXJlLXF1ZXJ5OmNhY2hlLWhpdFwiLCB7XG4gICAgICAgIGxheWVyOiBsYXllci50aXRsZSB8fCBsYXllci51cmwgfHwgbGF5ZXIuaWQsXG4gICAgICAgIG9pZEZpZWxkLFxuICAgICAgICBvaWQsXG4gICAgICAgIG91dEZpZWxkQ291bnQ6IG91dEZpZWxkcy5sZW5ndGgsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBoaXQudmFsdWU7XG4gICAgfVxuXG4gICAgY29uc3Qgam9iID0gKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGxpdmVEZWZpbml0aW9uRXhwcmVzc2lvbiA9IFN0cmluZyhcbiAgICAgICAgKGxheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gfHwgXCJcIixcbiAgICAgICk7XG5cbiAgICAgIC8vIENhbGxpbmcgcXVlcnlGZWF0dXJlcyBvbiBhIGxpdmUgTWFwSW1hZ2Ugc3VibGF5ZXIgY2FuIHJlaHlkcmF0ZSB0aGF0XG4gICAgICAvLyBzdWJsYXllciBhbmQgdGVtcG9yYXJpbHkgY2xlYXIgaXRzIHJ1bnRpbWUgZGVmaW5pdGlvbkV4cHJlc3Npb24uIFRoZVxuICAgICAgLy8gbWFwIHRoZW4gcmVuZGVycyBldmVyeSBkaXN0cmljdCB1bnRpbCBMb2NhbGl6YXRpb24ncyBndWFyZCByZXN0b3Jlc1xuICAgICAgLy8gdGhlIGZpbHRlci4gUXVlcnkgYW4gb2ZmLW1hcCBGZWF0dXJlTGF5ZXIgY2xpZW50IGluc3RlYWQuXG4gICAgICBjb25zdCBkZXRhY2hlZFF1ZXJ5TGF5ZXIgPSBhd2FpdCB0aGlzLmdldERldGFjaGVkUXVlcnlMYXllcihsYXllcik7XG4gICAgICBjb25zdCBxdWVyeUxheWVyOiBfX2VzcmkuRmVhdHVyZUxheWVyID0gZGV0YWNoZWRRdWVyeUxheWVyIHx8IGxheWVyO1xuXG4gICAgICBjb25zdCBxID0gcXVlcnlMYXllci5jcmVhdGVRdWVyeSgpO1xuICAgICAgcS53aGVyZSA9IGAke29pZEZpZWxkfSA9ICR7TnVtYmVyKG9pZCl9YDtcbiAgICAgIHEub3V0RmllbGRzID0gb3V0RmllbGRzO1xuICAgICAgcS5yZXR1cm5HZW9tZXRyeSA9IHRydWU7XG4gICAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcImZlYXR1cmUtcXVlcnk6cmVxdWVzdFwiLCB7XG4gICAgICAgIGxheWVyOiBsYXllci50aXRsZSB8fCBsYXllci51cmwgfHwgbGF5ZXIuaWQsXG4gICAgICAgIHVybDogbGF5ZXIudXJsIHx8IG51bGwsXG4gICAgICAgIHdoZXJlOiBxLndoZXJlLFxuICAgICAgICBvdXRGaWVsZHMsXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiB0cnVlLFxuICAgICAgfSk7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBxdWVyeUxheWVyLnF1ZXJ5RmVhdHVyZXMocSk7XG4gICAgICAvLyBEZWZlbnNpdmUgcmVzdG9yZSBmb3IgdGhlIG5vLVVSTCBmYWxsYmFjay4gVGhlIGRldGFjaGVkIHBhdGggYWJvdmVcbiAgICAgIC8vIG5ldmVyIHRvdWNoZXMgdGhlIGxpdmUgbGF5ZXIuXG4gICAgICBpZiAoXG4gICAgICAgIHF1ZXJ5TGF5ZXIgPT09IGxheWVyICYmXG4gICAgICAgIFN0cmluZygobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiB8fCBcIlwiKSAhPT1cbiAgICAgICAgICBsaXZlRGVmaW5pdGlvbkV4cHJlc3Npb25cbiAgICAgICkge1xuICAgICAgICAobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiA9IGxpdmVEZWZpbml0aW9uRXhwcmVzc2lvbjtcbiAgICAgIH1cbiAgICAgIGFncmlNYXBDbGlja0RlYnVnKFwiZmVhdHVyZS1xdWVyeTpyZXNwb25zZVwiLCB7XG4gICAgICAgIGxheWVyOiBsYXllci50aXRsZSB8fCBsYXllci51cmwgfHwgbGF5ZXIuaWQsXG4gICAgICAgIGZlYXR1cmVDb3VudDogcmVzLmZlYXR1cmVzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgaGFzR2VvbWV0cnk6IEJvb2xlYW4ocmVzLmZlYXR1cmVzPy5bMF0/Lmdlb21ldHJ5KSxcbiAgICAgICAgYXR0cmlidXRlS2V5czogT2JqZWN0LmtleXMocmVzLmZlYXR1cmVzPy5bMF0/LmF0dHJpYnV0ZXMgfHwge30pLFxuICAgICAgICBxdWVyeU1vZGU6IHF1ZXJ5TGF5ZXIgPT09IGxheWVyID8gXCJsaXZlLWZhbGxiYWNrXCIgOiBcImRldGFjaGVkXCIsXG4gICAgICAgIGxpdmVEZWZpbml0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgICAobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiB8fCBudWxsLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzLmZlYXR1cmVzPy5bMF0gfHwgbnVsbDtcbiAgICB9KSgpO1xuXG4gICAgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUuc2V0KGtleSwge1xuICAgICAgZXhwaXJlczogbm93ICsgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGVUdGxNcyxcbiAgICAgIHZhbHVlOiBqb2IsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmVhdHVyZSA9IGF3YWl0IGpvYjtcbiAgICAgIGlmICghZmVhdHVyZSAmJiB0aGlzLl9mZWF0dXJlUXVlcnlDYWNoZS5nZXQoa2V5KT8udmFsdWUgPT09IGpvYikge1xuICAgICAgICB0aGlzLl9mZWF0dXJlUXVlcnlDYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmZWF0dXJlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlLmdldChrZXkpPy52YWx1ZSA9PT0gam9iKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIHRyID0gKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlcj4sXG4gICk6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIHQodGhpcy5zdGF0ZS5jdXJyZW50TGFuZywga2V5LCBwYXJhbXMpO1xuICB9O1xuXG4gIHByaXZhdGUgc2V0dXBUaGVtZU9ic2VydmVyID0gKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdGhpcy50aGVtZU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgY29uc3QgaXNEYXJrVGhlbWUgPSB0aGlzLmdldFJlc29sdmVkVGhlbWUoKTtcbiAgICAgIGlmICh0aGlzLl9pc01vdW50ZWQgJiYgaXNEYXJrVGhlbWUgIT09IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy50aGVtZU9ic2VydmVyLm9ic2VydmUocm9vdCwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wiY2xhc3NcIiwgXCJkYXRhLXRoZW1lXCJdLFxuICAgIH0pO1xuXG4gICAgdGhpcy50aGVtZU9ic2VydmVyLm9ic2VydmUoYm9keSwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wiY2xhc3NcIl0sXG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVUaGVtZUNoYW5nZSA9IChlOiBhbnkpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IGRldGFpbCA9IGU/LmRldGFpbCB8fCB7fTtcbiAgICBsZXQgaXNEYXJrVGhlbWUgPSB0aGlzLmdldFJlc29sdmVkVGhlbWUoKTtcblxuICAgIGlmICh0eXBlb2YgZGV0YWlsLmlzRGFya1RoZW1lID09PSBcImJvb2xlYW5cIikge1xuICAgICAgaXNEYXJrVGhlbWUgPSBkZXRhaWwuaXNEYXJrVGhlbWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGV0YWlsLnRoZW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpc0RhcmtUaGVtZSA9IFN0cmluZyhkZXRhaWwudGhlbWUpLnRvTG93ZXJDYXNlKCkgIT09IFwibGlnaHRcIjtcbiAgICB9XG5cbiAgICBpZiAoaXNEYXJrVGhlbWUgIT09IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0RhcmtUaGVtZSB9KTtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVMYW5ndWFnZUNoYW5nZSA9IChlOiBhbnkpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IGxhbmcgPSBlPy5kZXRhaWw/LmxhbmcgfHwgZT8uZGV0YWlsPy5sYW5ndWFnZSB8fCBlPy5kZXRhaWw/LmNvZGU7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUxhbmcobGFuZyk7XG4gICAgaWYgKG5vcm1hbGl6ZWQgIT09IHRoaXMuc3RhdGUuY3VycmVudExhbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXJyZW50TGFuZzogbm9ybWFsaXplZCB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyogLS0tIHBpbm5lZCBwb3B1cCBoZWxwZXJzIC0tLSAqL1xuICBwcml2YXRlIGlzRGFzaGJvYXJkRW1iZWRkZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLnByb3BzLmlkIHx8IFwiXCIpLmVuZHNXaXRoKFwiLXBvcHVwXCIpO1xuICB9XG5cbiAgLyoqIENyb3Agb3ZlcmxheSB0b3AgaW4gdmlld3BvcnQgY29vcmRzOyBudWxsIHdoZW4gbm90IHVzZWQuICovXG4gIHByaXZhdGUgZ2V0Q3JvcE92ZXJsYXlUb3AoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBjcm9wRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIuYWdyaS1kYXNoYm9hcmQtY3JvcC1vdmVybGF5LmFncmktZGFzaGJvYXJkLW1hbmFnZWQtY3JvcFwiLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChjcm9wRWwpIHtcbiAgICAgIGNvbnN0IHJlY3QgPSBjcm9wRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAocmVjdC5oZWlnaHQgPiAwICYmIE51bWJlci5pc0Zpbml0ZShyZWN0LnRvcCkpIHtcbiAgICAgICAgcmV0dXJuIHJlY3QudG9wO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNYXBBcmVhUmVjdChcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICk6IERPTVJlY3Qge1xuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgY29uc3QgbWFwU2xvdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIFwiLmFncmktZGFzaGJvYXJkLW1hcC1zbG90XCIsXG4gICAgICApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgIGlmIChtYXBTbG90KSB7XG4gICAgICAgIGNvbnN0IHNsb3RSZWN0ID0gbWFwU2xvdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKHNsb3RSZWN0LndpZHRoID4gNDAgJiYgc2xvdFJlY3QuaGVpZ2h0ID4gNDApIHtcbiAgICAgICAgICByZXR1cm4gc2xvdFJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICh2aWV3LmNvbnRhaW5lciBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICBwcml2YXRlIG9ic2VydmVNYXBBcmVhUmVzaXplKFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLm1hcEFyZWFSZXNpemVPYnNlcnZlciA9IG51bGw7XG5cbiAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKVxuICAgICAgPyAoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgXCIuYWdyaS1kYXNoYm9hcmQtbWFwLXNsb3RcIixcbiAgICAgICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGwpIHx8ICh2aWV3LmNvbnRhaW5lciBhcyBIVE1MRWxlbWVudCB8IG51bGwpKVxuICAgICAgOiAodmlldy5jb250YWluZXIgYXMgSFRNTEVsZW1lbnQgfCBudWxsKTtcbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuO1xuXG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0KCk7XG4gICAgfSk7XG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFZmZlY3RpdmVNYXBCb3R0b20oXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICAgIGdhcCA9IDQsXG4gICk6IG51bWJlciB7XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuZ2V0TWFwQXJlYVJlY3Qodmlldyk7XG4gICAgY29uc3QgY3JvcFRvcCA9IHRoaXMuZ2V0Q3JvcE92ZXJsYXlUb3AoKTtcbiAgICBpZiAoY3JvcFRvcCAhPSBudWxsICYmIGNyb3BUb3AgPiByZWN0LnRvcCAmJiBjcm9wVG9wIDw9IHJlY3QuYm90dG9tICsgMikge1xuICAgICAgcmV0dXJuIGNyb3BUb3AgLSBnYXA7XG4gICAgfVxuICAgIHJldHVybiByZWN0LmJvdHRvbSAtIGdhcDtcbiAgfVxuXG4gIHByaXZhdGUgbWVhc3VyZVBvcHVwSGVpZ2h0KHBvcHVwRWw6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICBjb25zdCBoZWFkZXIgPSBwb3B1cEVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5hZ3JpMy1wb3B1cC1oZWFkZXJcIixcbiAgICApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBjb25zdCBjb250ZW50ID0gcG9wdXBFbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIuYWdyaTMtcG9wdXAtY29udGVudFwiLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGNvbnN0IGhlYWRlckggPSBoZWFkZXI/Lm9mZnNldEhlaWdodCB8fCAwO1xuICAgIGNvbnN0IGNvbnRlbnRIID0gY29udGVudD8uc2Nyb2xsSGVpZ2h0IHx8IGNvbnRlbnQ/Lm9mZnNldEhlaWdodCB8fCAwO1xuICAgIGNvbnN0IG5hdHVyYWwgPSBoZWFkZXJIICsgY29udGVudEg7XG4gICAgaWYgKG5hdHVyYWwgPiAwKSByZXR1cm4gTWF0aC5jZWlsKG5hdHVyYWwpO1xuXG4gICAgY29uc3QgcmVjdCA9IHBvcHVwRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHJlY3QuaGVpZ2h0ID4gMCA/IE1hdGguY2VpbChyZWN0LmhlaWdodCkgOiBNYXRoLmNlaWwocG9wdXBFbC5zY3JvbGxIZWlnaHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBwb3B1cFBvc2l0aW9uc0VxdWFsKFxuICAgIGE6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgYjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9LFxuICAgIGVwc2lsb24gPSAxLFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoIWEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gKFxuICAgICAgTWF0aC5hYnMoYS54IC0gYi54KSA8PSBlcHNpbG9uICYmIE1hdGguYWJzKGEueSAtIGIueSkgPD0gZXBzaWxvblxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFwcGx5UG9wdXBQb3NpdGlvbiA9IChwb3M6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSk6IHZvaWQgPT4ge1xuICAgIGlmICh0aGlzLnBvcHVwUG9zaXRpb25zRXF1YWwodGhpcy5zdGF0ZS5wb3B1cFBvc2l0aW9uLCBwb3MpKSByZXR1cm47XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBvcHVwUG9zaXRpb246IHBvcyB9KTtcbiAgfTtcblxuICBwcml2YXRlIHNjaGVkdWxlUG9wdXBMYXlvdXQgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuX2lzRHJhZ2dpbmdQb3B1cCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLl9wb3B1cExheW91dFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5fcG9wdXBMYXlvdXRUaW1lcik7XG4gICAgdGhpcy5fcG9wdXBMYXlvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fcG9wdXBMYXlvdXRUaW1lciA9IG51bGw7XG4gICAgICB0aGlzLnJlcG9zaXRpb25QaW5uZWRJZk5lZWRlZCgpO1xuICAgIH0sIDQ4KTtcbiAgfTtcblxuICBwcml2YXRlIHNjaGVkdWxlUG9wdXBMYXlvdXRBZnRlckNvbnRlbnQgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuX3BvcHVwTGF5b3V0UmFmKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9wb3B1cExheW91dFJhZik7XG4gICAgdGhpcy5fcG9wdXBMYXlvdXRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy5fcG9wdXBMYXlvdXRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9wb3B1cExheW91dFJhZiA9IDA7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvblBpbm5lZElmTmVlZGVkKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBwcml2YXRlIGNhbGN1bGF0ZVBpbm5lZFBvc2l0aW9uID0gKFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0+IHtcbiAgICBjb25zdCByZWN0ID0gdGhpcy5nZXRNYXBBcmVhUmVjdCh2aWV3KTtcbiAgICBjb25zdCBtYXJnaW4gPSB0aGlzLlBPUFVQX01BUkdJTjtcbiAgICBjb25zdCBwb3B1cFdpZHRoID0gdGhpcy5nZXRQb3B1cFdpZHRoKHZpZXcpO1xuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogcmVjdC5yaWdodCAtIHBvcHVwV2lkdGggLSB0aGlzLkRBU0hCT0FSRF9QT1BVUF9IT1JJWk9OVEFMX0lOU0VULFxuICAgICAgICB5OiByZWN0LnRvcCArIHRoaXMuREFTSEJPQVJEX1BPUFVQX1ZFUlRJQ0FMX0lOU0VULFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogcmVjdC5yaWdodCAtIHBvcHVwV2lkdGggLSBtYXJnaW4sXG4gICAgICB5OiByZWN0LnRvcCArIG1hcmdpbixcbiAgICB9O1xuICB9O1xuXG4gIHByaXZhdGUgcmVwb3NpdGlvblBpbm5lZElmTmVlZGVkID0gKCkgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLl9pc0RyYWdnaW5nUG9wdXApIHJldHVybjtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldztcbiAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgIGlmICh0aGlzLnN0YXRlLnBpblRvQ29ybmVyKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbGN1bGF0ZVBpbm5lZFBvc2l0aW9uKHZpZXcpO1xuICAgICAgaWYgKHRoaXMucG9wdXBQb3NpdGlvbnNFcXVhbCh0aGlzLnN0YXRlLnBvcHVwUG9zaXRpb24sIHBvcykpIHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBvcHVwUG9zaXRpb246IHBvcyB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUucG9wdXBQb3NpdGlvbikgcmV0dXJuO1xuICAgIGNvbnN0IGNsYW1wZWQgPSB0aGlzLmNsYW1wUG9wdXBUb01hcENvbnRhaW5lcihcbiAgICAgIHRoaXMuc3RhdGUucG9wdXBQb3NpdGlvbixcbiAgICAgIHZpZXcsXG4gICAgKTtcbiAgICB0aGlzLmFwcGx5UG9wdXBQb3NpdGlvbihjbGFtcGVkKTtcbiAgfTtcblxuICBwcml2YXRlIHRvZ2dsZVBpblRvQ29ybmVyID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAocHJldikgPT4ge1xuICAgICAgICBjb25zdCBuZXh0ID0gIXByZXYucGluVG9Db3JuZXI7XG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuXG4gICAgICAgIGxldCBwb3MgPSBwcmV2LnBvcHVwUG9zaXRpb247XG5cbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICBpZiAodmlldykgcG9zID0gdGhpcy5jYWxjdWxhdGVQaW5uZWRQb3NpdGlvbih2aWV3KTtcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3ICYmIHByZXYuY2xpY2tTY3JlZW5Qb2ludCkge1xuICAgICAgICAgIHBvcyA9IHRoaXMuY2FsY3VsYXRlUG9wdXBQb3NpdGlvbihwcmV2LmNsaWNrU2NyZWVuUG9pbnQsIHZpZXcpO1xuICAgICAgICB9IGVsc2UgaWYgKHZpZXcpIHtcbiAgICAgICAgICBjb25zdCByZWN0ID0gKHZpZXcuY29udGFpbmVyIGFzIEhUTUxFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICB4OiByZWN0LmxlZnQgKyByZWN0LndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHBpblRvQ29ybmVyOiBuZXh0LFxuICAgICAgICAgIHBvcHVwUG9zaXRpb246IHBvcyxcbiAgICAgICAgICBjaGFydEV4cGFuZGVkOiBuZXh0ID8gdHJ1ZSA6IHByZXYuY2hhcnRFeHBhbmRlZCxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dEFmdGVyQ29udGVudCgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93UG9wdXApIHtcbiAgICAgICAgICB0aGlzLmJyb2FkY2FzdFBvcHVwVmlzaWJpbGl0eSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlT3V0c2lkZUNsaWNrID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCAhdGhpcy5fcG9wdXBSZWYuY3VycmVudCkgcmV0dXJuO1xuICAgIC8vIENvbGxhcHNlZCBjaGlwIHN0YXlzIHVudGlsIGFuIGVtcHR5LW1hcCBkZXNlbGVjdCAvIGdlb2dyYXBoeSByZXNldC5cbiAgICBpZiAodGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIE5vZGUgfCBudWxsO1xuICAgIGlmICghdGFyZ2V0IHx8IHRoaXMuX3BvcHVwUmVmLmN1cnJlbnQuY29udGFpbnModGFyZ2V0KSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbWFwQ29udGFpbmVyID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldz8uY29udGFpbmVyO1xuICAgIGlmIChtYXBDb250YWluZXIgJiYgbWFwQ29udGFpbmVyLmNvbnRhaW5zKHRhcmdldCkpIHJldHVybjtcblxuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgY29uc3QgZGFzaGJvYXJkVWkgPSAodGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0Py4oXG4gICAgICAgIFwiLmFncmktZGFzaGJvYXJkLXYzLCAuYWdyaS1kYXNoYm9hcmQtY3JvcC1vdmVybGF5LCAuYWdyaS1kYXNoYm9hcmQtaGVhZGVyLCAuYWdyaS1kYXNoYm9hcmQtbGVmdC1wYW5lbCwgLmFncmktZGFzaGJvYXJkLWJvdHRvbS1yb3csIC5hZ3JpLWRhc2hib2FyZC13aWRnZXQtc2xvdCwgLmFncmktZGFzaGJvYXJkLWluZGljYXRvci1vdmVybGF5LCAuYWdyaS1kYXNoYm9hcmQtZGF0ZS1pbmRleC1vdmVybGF5LCAuYWdyaS12MjAtZmxvYXRpbmctb3ZlcmxheVwiLFxuICAgICAgKTtcbiAgICAgIGlmIChkYXNoYm9hcmRVaSkgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE91dHNpZGUgZGFzaGJvYXJkIGNocm9tZSDihpIgY29sbGFwc2UgaW5zdGVhZCBvZiB3aXBpbmcgc2VsZWN0aW9uLlxuICAgIHRoaXMubWluaW1pemVQb3B1cCgpO1xuICB9O1xuXG4gIHByaXZhdGUgb25Qb3B1cEhlYWRlck1vdXNlRG93biA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PikgPT4ge1xuICAgIC8vIEFsbG93IG5vcm1hbCBiZWhhdmlvciBmb3IgY29udHJvbHMgaW5zaWRlIGhlYWRlci5cbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBpZiAodGFyZ2V0Py5jbG9zZXN0KFwiYnV0dG9uLCBhLCBpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdFwiKSkgcmV0dXJuO1xuICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9wdXBFbCA9IHRoaXMuX3BvcHVwUmVmLmN1cnJlbnQ7XG4gICAgaWYgKCFwb3B1cEVsKSByZXR1cm47XG5cbiAgICBjb25zdCByZWN0ID0gcG9wdXBFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0aGlzLl9pc0RyYWdnaW5nUG9wdXAgPSB0cnVlO1xuICAgIHRoaXMuX3BvcHVwRHJhZ09mZnNldCA9IHtcbiAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5waW5Ub0Nvcm5lcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBpblRvQ29ybmVyOiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uUG9wdXBEcmFnTW92ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMub25Qb3B1cERyYWdFbmQpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfTtcblxuICBwcml2YXRlIG9uUG9wdXBEcmFnTW92ZSA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLl9pc0RyYWdnaW5nUG9wdXAgfHwgIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuICAgIGlmICghdmlldykgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV4dFBvcyA9IHtcbiAgICAgIHg6IGUuY2xpZW50WCAtIHRoaXMuX3BvcHVwRHJhZ09mZnNldC54LFxuICAgICAgeTogZS5jbGllbnRZIC0gdGhpcy5fcG9wdXBEcmFnT2Zmc2V0LnksXG4gICAgfTtcbiAgICBjb25zdCBjbGFtcGVkID0gdGhpcy5jbGFtcFBvcHVwVG9NYXBDb250YWluZXIobmV4dFBvcywgdmlldyk7XG4gICAgdGhpcy5hcHBseVBvcHVwUG9zaXRpb24oY2xhbXBlZCk7XG4gIH07XG5cbiAgcHJpdmF0ZSBvblBvcHVwRHJhZ0VuZCA9ICgpID0+IHtcbiAgICB0aGlzLl9pc0RyYWdnaW5nUG9wdXAgPSBmYWxzZTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uUG9wdXBEcmFnTW92ZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMub25Qb3B1cERyYWdFbmQpO1xuICB9O1xuICAvKiog4pyFIE5FVzogc2FmZWx5IGRldGVjdCB3aGV0aGVyIHRoaXMgbGF5ZXIgc3VwcG9ydHMgYXR0YWNobWVudHMgKi9cbiAgcHJpdmF0ZSBsYXllclN1cHBvcnRzQXR0YWNobWVudHMoXG4gICAgbGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBGZWF0dXJlTGF5ZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoIWxheWVyKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEaWZmZXJlbnQgSlNBUEkvRUIgYnVpbGRzIGV4cG9zZSBpdCBzbGlnaHRseSBkaWZmZXJlbnRseVxuICAgIGNvbnN0IGFueUxheWVyOiBhbnkgPSBsYXllciBhcyBhbnk7XG5cbiAgICAvLyBDb21tb24gc2lnbmFsc1xuICAgIGlmICh0eXBlb2YgYW55TGF5ZXIuc3VwcG9ydHNBdHRhY2htZW50cyA9PT0gXCJib29sZWFuXCIpXG4gICAgICByZXR1cm4gYW55TGF5ZXIuc3VwcG9ydHNBdHRhY2htZW50cztcblxuICAgIGNvbnN0IGNhcCA9IGFueUxheWVyLmNhcGFiaWxpdGllcztcbiAgICBjb25zdCBzdXBwb3J0ZWQgPVxuICAgICAgY2FwPy5kYXRhPy5zdXBwb3J0c0F0dGFjaG1lbnRzID8/XG4gICAgICBjYXA/LmRhdGE/LnN1cHBvcnRzQXR0YWNobWVudCA/P1xuICAgICAgY2FwPy5vcGVyYXRpb25zPy5zdXBwb3J0c0F0dGFjaG1lbnRzID8/XG4gICAgICBjYXA/Lm9wZXJhdGlvbnM/LnN1cHBvcnRzQXR0YWNobWVudDtcblxuICAgIGlmICh0eXBlb2Ygc3VwcG9ydGVkID09PSBcImJvb2xlYW5cIikgcmV0dXJuIHN1cHBvcnRlZDtcblxuICAgIC8vIFVua25vd24gPT4gYXNzdW1lIGZhbHNlIHRvIGF2b2lkIHVnbHkgd2FybmluZ1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gSGlnaGxpZ2h0IG1hbmFnZW1lbnQgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgc2V0dXBIaWdobGlnaHRMYXllciA9ICh2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcpID0+IHtcbiAgICBpZiAoIXRoaXMuX2hpZ2hsaWdodExheWVyKSB7XG4gICAgICB0aGlzLl9oaWdobGlnaHRMYXllciA9IG5ldyBHcmFwaGljc0xheWVyKHtcbiAgICAgICAgaWQ6IFwiYWdyaS1wb2x5Z29uLWhpZ2hsaWdodFwiLFxuICAgICAgICB0aXRsZTogXCJTZWxlY3RlZCBQb2x5Z29uIEhpZ2hsaWdodFwiLFxuICAgICAgfSk7XG4gICAgICB2aWV3Lm1hcC5hZGQodGhpcy5faGlnaGxpZ2h0TGF5ZXIpO1xuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIGhpZ2hsaWdodFBvbHlnb24gPSAoZ2VvbWV0cnk6IF9fZXNyaS5HZW9tZXRyeSkgPT4ge1xuICAgIGlmICghdGhpcy5faGlnaGxpZ2h0TGF5ZXIgfHwgIWdlb21ldHJ5KSByZXR1cm47XG4gICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuXG4gICAgLy8gRHJvcCBHcmFmZi90YWJsZSBzZWxlY3Rpb24gZ3JhcGhpY3Mgc28gb25seSBvbmUgb3V0bGluZSBpcyB2aXNpYmxlLlxuICAgIHRyeSB7XG4gICAgICB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3Py5ncmFwaGljcz8ucmVtb3ZlQWxsPy4oKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGlnbm9yZSAqL1xuICAgIH1cblxuICAgIC8vIFdpZGUgdHJhbnNsdWNlbnQgaGFsbyBwbHVzIGEgYnJpZ2h0IGN5YW4gY29yZSBrZWVwcyB0aGUgc2VsZWN0ZWQgZmllbGRcbiAgICAvLyB2aXNpYmxlIG92ZXIgYm90aCBsaWdodCBhbmQgZGFyayBzYXRlbGxpdGUgaW1hZ2VyeS5cbiAgICBjb25zdCBoYWxvU3ltYm9sID0gbmV3IFNpbXBsZUZpbGxTeW1ib2woe1xuICAgICAgY29sb3I6IFswLCAwLCAwLCAwXSxcbiAgICAgIG91dGxpbmU6IG5ldyBTaW1wbGVMaW5lU3ltYm9sKHtcbiAgICAgICAgY29sb3I6IFswLCAyMjksIDI1NSwgMC4zMl0sXG4gICAgICAgIHdpZHRoOiA5LFxuICAgICAgICBzdHlsZTogXCJzb2xpZFwiLFxuICAgICAgfSksXG4gICAgfSk7XG4gICAgY29uc3QgaGlnaGxpZ2h0U3ltYm9sID0gbmV3IFNpbXBsZUZpbGxTeW1ib2woe1xuICAgICAgY29sb3I6IFswLCAwLCAwLCAwXSxcbiAgICAgIG91dGxpbmU6IG5ldyBTaW1wbGVMaW5lU3ltYm9sKHtcbiAgICAgICAgY29sb3I6IFsxMjgsIDI0NSwgMjU1LCAxXSxcbiAgICAgICAgd2lkdGg6IDMsXG4gICAgICAgIHN0eWxlOiBcInNvbGlkXCIsXG4gICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuX2hpZ2hsaWdodEhhbG9HcmFwaGljID0gbmV3IEdyYXBoaWMoeyBnZW9tZXRyeSwgc3ltYm9sOiBoYWxvU3ltYm9sIH0pO1xuICAgIHRoaXMuX2hpZ2hsaWdodEdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7IGdlb21ldHJ5LCBzeW1ib2w6IGhpZ2hsaWdodFN5bWJvbCB9KTtcbiAgICB0aGlzLl9oaWdobGlnaHRMYXllci5hZGRNYW55KFtcbiAgICAgIHRoaXMuX2hpZ2hsaWdodEhhbG9HcmFwaGljLFxuICAgICAgdGhpcy5faGlnaGxpZ2h0R3JhcGhpYyxcbiAgICBdKTtcbiAgfTtcblxuICBwcml2YXRlIGNsZWFySGlnaGxpZ2h0ID0gKCkgPT4ge1xuICAgIGlmICghdGhpcy5faGlnaGxpZ2h0TGF5ZXIpIHJldHVybjtcbiAgICBpZiAodGhpcy5faGlnaGxpZ2h0SGFsb0dyYXBoaWMpIHtcbiAgICAgIHRoaXMuX2hpZ2hsaWdodExheWVyLnJlbW92ZSh0aGlzLl9oaWdobGlnaHRIYWxvR3JhcGhpYyk7XG4gICAgICB0aGlzLl9oaWdobGlnaHRIYWxvR3JhcGhpYyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9oaWdobGlnaHRHcmFwaGljKSB7XG4gICAgICB0aGlzLl9oaWdobGlnaHRMYXllci5yZW1vdmUodGhpcy5faGlnaGxpZ2h0R3JhcGhpYyk7XG4gICAgICB0aGlzLl9oaWdobGlnaHRHcmFwaGljID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSByZXN0b3JlRXh0ZW50QmVmb3JlU2VsZWN0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuICAgIGNvbnN0IHNhdmVkRXh0ZW50ID0gdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uO1xuICAgIHRoaXMuX2V4dGVudEJlZm9yZVNlbGVjdGlvbiA9IG51bGw7XG4gICAgY29uc3Qgem9vbVRvID0gdGhpcy5wcm9wcy5jb25maWc/LnNldHRpbmdzPy56b29tVG9TZWxlY3Rpb24gIT09IGZhbHNlO1xuICAgIGlmICghem9vbVRvIHx8ICFzYXZlZEV4dGVudCB8fCAhdmlldykgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICB2b2lkIHZpZXcuZ29UbyhzYXZlZEV4dGVudCwgeyBkdXJhdGlvbjogNDAwIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgY2xlYW51cEhpZ2hsaWdodCA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5faGlnaGxpZ2h0TGF5ZXIpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuICAgICAgaWYgKHZpZXcgJiYgdmlldy5tYXApIHtcbiAgICAgICAgdmlldy5tYXAucmVtb3ZlKHRoaXMuX2hpZ2hsaWdodExheWVyKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2hpZ2hsaWdodExheWVyID0gbnVsbDtcbiAgICAgIHRoaXMuX2hpZ2hsaWdodEdyYXBoaWMgPSBudWxsO1xuICAgICAgdGhpcy5faGlnaGxpZ2h0SGFsb0dyYXBoaWMgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gPSBudWxsO1xuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gTWFwIHdpcmluZyAtLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgcHJpdmF0ZSBnZXRMaW5rZWRNYXBXaWRnZXRJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBpZHMgPSB0aGlzLnByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnk7XG4gICAgY29uc3QgbGlzdCA9IGlkcz8ubGVuZ3RoXG4gICAgICA/IGlkcy5hc011dGFibGU/LigpIHx8IGlkcy50b0FycmF5Py4oKSB8fCBpZHNcbiAgICAgIDogW107XG4gICAgY29uc3QgZmlyc3QgPSBBcnJheS5pc0FycmF5KGxpc3QpID8gbGlzdFswXSA6IG51bGw7XG4gICAgaWYgKGZpcnN0KSByZXR1cm4gU3RyaW5nKGZpcnN0KTtcbiAgICBjb25zdCBob3N0SWQgPSBTdHJpbmcodGhpcy5wcm9wcy5pZCB8fCBcIlwiKS5yZXBsYWNlKC8tcG9wdXAkLywgXCJcIik7XG4gICAgcmV0dXJuIGRpc2NvdmVyTWFwV2lkZ2V0SWRJbkFwcCh7XG4gICAgICBob3N0V2lkZ2V0SWQ6IGhvc3RJZCxcbiAgICAgIGdldFNsb3RFbGVtZW50OiAoKSA9PiB7XG4gICAgICAgIGlmIChob3N0SWQpIHtcbiAgICAgICAgICBjb25zdCBzY29wZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgYC53aWRnZXQtcmVuZGVyZXJbZGF0YS13aWRnZXRpZD1cIiR7aG9zdElkfVwiXSAuYWdyaS1kYXNoYm9hcmQtbWFwLXNsb3RgLFxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKHNjb3BlZCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSByZXR1cm4gc2NvcGVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hZ3JpLWRhc2hib2FyZC1tYXAtc2xvdFwiKTtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgPyBmYWxsYmFjayA6IG51bGw7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNYXBWaWV3RnJvbU1hbmFnZXIoXG4gICAgbWFwV2lkZ2V0SWQ6IHN0cmluZyB8IG51bGwsXG4gICk6IEppbXVNYXBWaWV3IHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hbmFnZXIgPSBNYXBWaWV3TWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgICAgaWYgKCFtYW5hZ2VyKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmIChtYXBXaWRnZXRJZCkge1xuICAgICAgICBjb25zdCBncm91cCA9IG1hbmFnZXIuZ2V0SmltdU1hcFZpZXdHcm91cChtYXBXaWRnZXRJZCk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdyb3VwPy5nZXRBY3RpdmVKaW11TWFwVmlldz8uKCk7XG4gICAgICAgIGlmIChhY3RpdmU/LnZpZXcpIHJldHVybiBhY3RpdmU7XG4gICAgICAgIGNvbnN0IGdyb3VwVmlld3MgPSBncm91cD8uZ2V0QWxsSmltdU1hcFZpZXdzPy4oKSB8fCBbXTtcbiAgICAgICAgY29uc3QgZmlyc3RMb2FkZWQgPSBncm91cFZpZXdzLmZpbmQoKHZpZXc6IGFueSkgPT4gdmlldz8udmlldyk7XG4gICAgICAgIGlmIChmaXJzdExvYWRlZCkgcmV0dXJuIGZpcnN0TG9hZGVkO1xuICAgICAgfVxuICAgICAgY29uc3QgYWxsID0gbWFuYWdlci5nZXRBbGxKaW11TWFwVmlld3M/LigpIHx8IFtdO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgYWxsLmZpbmQoKHZpZXc6IGFueSkgPT4gdmlldz8udmlldyAmJiB2aWV3Py5pc0FjdGl2ZSAhPT0gZmFsc2UpIHx8XG4gICAgICAgIGFsbC5maW5kKCh2aWV3OiBhbnkpID0+IHZpZXc/LnZpZXcpIHx8XG4gICAgICAgIG51bGxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZU1hcFZpZXdSZWFkeSA9IChldmVudDogRXZlbnQpOiB2b2lkID0+IHtcbiAgICBjb25zdCBtYXBXaWRnZXRJZCA9IChldmVudCBhcyBDdXN0b21FdmVudDx7IG1hcFdpZGdldElkPzogc3RyaW5nIH0+KS5kZXRhaWxcbiAgICAgID8ubWFwV2lkZ2V0SWQ7XG4gICAgY29uc3QgbGlua2VkID0gdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpO1xuICAgIGlmIChtYXBXaWRnZXRJZCAmJiBsaW5rZWQgJiYgbWFwV2lkZ2V0SWQgIT09IGxpbmtlZCkgcmV0dXJuO1xuICAgIHRoaXMuc2NoZWR1bGVNYXBWaWV3RmFsbGJhY2soKTtcbiAgfTtcblxuICBwcml2YXRlIHNjaGVkdWxlTWFwVmlld0ZhbGxiYWNrID0gKCk6IHZvaWQgPT4ge1xuICAgIC8vIEFscmVhZHkgaGF2ZSBhIGxpdmUgbWFwIHZpZXcg4oCUIGRvIE5PVCByZS1lbnRlciBvbkFjdGl2ZVZpZXdDaGFuZ2VcbiAgICAvLyAodGhhdCBwYXRoIHNldFN0YXRlIOKGkiBpbml0aWFsaXplTWFwQ29ubmVjdGlvbiDihpIgc2NoZWR1bGVNYXBWaWV3RmFsbGJhY2tcbiAgICAvLyBhbmQgZnJlZXplcyB0aGUgYnVpbGRlciB3aXRoIFJlYWN0ICMxODUgd2hlbiBmZWF0dXJlTGF5ZXJzIHN0YXkgZW1wdHkpLlxuICAgIGlmICh0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3KSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuZmVhdHVyZUxheWVycz8ubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVNYXBJbml0UmV0cnkodGhpcy5zdGF0ZS5qaW11TWFwVmlldyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1hcFdpZGdldElkID0gdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpO1xuICAgIGNvbnN0IGZyb21NYW5hZ2VyID0gdGhpcy5nZXRNYXBWaWV3RnJvbU1hbmFnZXIobWFwV2lkZ2V0SWQpO1xuICAgIGlmIChmcm9tTWFuYWdlcj8udmlldykge1xuICAgICAgdGhpcy5vbkFjdGl2ZVZpZXdDaGFuZ2UoZnJvbU1hbmFnZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIW1hcFdpZGdldElkKSByZXR1cm47XG4gICAgaWYgKHRoaXMubWFwVmlld0ZhbGxiYWNrVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyKTtcbiAgICB0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyID0gbnVsbDtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgICBpZiAodGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldykgcmV0dXJuO1xuICAgICAgY29uc3QgbGF0ZSA9IHRoaXMuZ2V0TWFwVmlld0Zyb21NYW5hZ2VyKG1hcFdpZGdldElkKTtcbiAgICAgIGlmIChsYXRlPy52aWV3KSB0aGlzLm9uQWN0aXZlVmlld0NoYW5nZShsYXRlKTtcbiAgICB9LCA2MDApO1xuICB9O1xuXG4gIHByaXZhdGUgc2NoZWR1bGVNYXBJbml0UmV0cnkgPSAoam12OiBKaW11TWFwVmlldyk6IHZvaWQgPT4ge1xuICAgIGlmICh0aGlzLm1hcEluaXRSZXRyeUNvdW50ID49IHRoaXMubWF4TWFwSW5pdFJldHJpZXMpIHJldHVybjtcbiAgICBpZiAodGhpcy5tYXBJbml0UmV0cnlUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMubWFwSW5pdFJldHJ5VGltZXIpO1xuICAgIHRoaXMubWFwSW5pdFJldHJ5Q291bnQgKz0gMTtcbiAgICB0aGlzLm1hcEluaXRSZXRyeVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1hcEluaXRSZXRyeVRpbWVyID0gbnVsbDtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgICB2b2lkIHRoaXMuaW5pdGlhbGl6ZU1hcENvbm5lY3Rpb24oam12KTtcbiAgICB9LCA4MDApO1xuICB9O1xuXG4gIHByaXZhdGUgZXhwYW5kVXNlRGF0YVNvdXJjZUVudHJpZXModXNlTGlzdDogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgZHNNZ3IgPSBEYXRhU291cmNlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IG91dDogYW55W10gPSBbXTtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICBmb3IgKGNvbnN0IHVkcyBvZiB1c2VMaXN0KSB7XG4gICAgICBjb25zdCBpZCA9IFN0cmluZyh1ZHM/LmRhdGFTb3VyY2VJZCB8fCBcIlwiKTtcbiAgICAgIGlmICghaWQgfHwgc2Vlbi5oYXMoaWQpKSBjb250aW51ZTtcbiAgICAgIHNlZW4uYWRkKGlkKTtcbiAgICAgIG91dC5wdXNoKHVkcyk7XG5cbiAgICAgIGNvbnN0IGRzID0gZHNNZ3IuZ2V0RGF0YVNvdXJjZShpZCkgYXMgYW55O1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBkcz8uZ2V0Q2hpbGREYXRhU291cmNlcz8uKCkgfHwgW107XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkSWQgPSBTdHJpbmcoY2hpbGQ/LmlkIHx8IFwiXCIpO1xuICAgICAgICBpZiAoIWNoaWxkSWQgfHwgc2Vlbi5oYXMoY2hpbGRJZCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZChjaGlsZElkKTtcbiAgICAgICAgb3V0LnB1c2goeyBkYXRhU291cmNlSWQ6IGNoaWxkSWQsIG1haW5EYXRhU291cmNlSWQ6IGlkIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBwcml2YXRlIGFkZFJlc29sdmVkTGF5ZXIgPSAoXG4gICAgdGFyZ2V0OiBfX2VzcmkuRmVhdHVyZUxheWVyW10sXG4gICAgbGF5ZXJLZXlUb0RzSWQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gICAgc2VlbjogU2V0PHN0cmluZz4sXG4gICAgbGF5ZXI6IGFueSxcbiAgICBkc0lkPzogc3RyaW5nLFxuICApOiB2b2lkID0+IHtcbiAgICBjb25zdCBxdWVyeWFibGUgPSBnZXRRdWVyeWFibGVMYXllcihsYXllcikgfHwgbGF5ZXI7XG4gICAgaWYgKCFpc1F1ZXJ5YWJsZUZpZWxkTGF5ZXIocXVlcnlhYmxlKSkgcmV0dXJuO1xuICAgIGNvbnN0IGtleSA9XG4gICAgICBnZXRBZ3JpTGF5ZXJNYXBLZXkocXVlcnlhYmxlKSB8fFxuICAgICAgU3RyaW5nKHF1ZXJ5YWJsZS51cmwgfHwgcXVlcnlhYmxlLmlkIHx8IFwiXCIpO1xuICAgIGlmICgha2V5IHx8IHNlZW4uaGFzKGtleSkpIHJldHVybjtcbiAgICBzZWVuLmFkZChrZXkpO1xuICAgIHRhcmdldC5wdXNoKHF1ZXJ5YWJsZSBhcyBfX2VzcmkuRmVhdHVyZUxheWVyKTtcbiAgICBpZiAoZHNJZCkgbGF5ZXJLZXlUb0RzSWRba2V5XSA9IGRzSWQ7XG4gIH07XG5cbiAgcHJpdmF0ZSBjb2xsZWN0TGF5ZXJzRnJvbURhdGFTb3VyY2VzID0gKFxuICAgIGptdjogSmltdU1hcFZpZXcsXG4gICAgdXNlTGlzdDogYW55W10sXG4gICk6IHtcbiAgICBsYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXTtcbiAgICBsYXllcktleVRvRHNJZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgfSA9PiB7XG4gICAgY29uc3QgbGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW10gPSBbXTtcbiAgICBjb25zdCBsYXllcktleVRvRHNJZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBtYXAgPSBqbXY/LnZpZXc/Lm1hcDtcblxuICAgIGZvciAoY29uc3QgdWRzIG9mIHVzZUxpc3QpIHtcbiAgICAgIGNvbnN0IGRzSWQgPSBTdHJpbmcodWRzPy5kYXRhU291cmNlSWQgfHwgXCJcIik7XG4gICAgICBpZiAoIWRzSWQpIGNvbnRpbnVlO1xuXG4gICAgICBjb25zdCBjYWNoZWREcyA9IHRoaXMuc3RhdGUuZGF0YVNvdXJjZXNCeUlkPy5bZHNJZF0gYXMgYW55O1xuICAgICAgaWYgKGNhY2hlZERzKSB7XG4gICAgICAgIGNvbnN0IGNhY2hlZExheWVyID1cbiAgICAgICAgICBjYWNoZWREcy5sYXllciB8fFxuICAgICAgICAgICh0eXBlb2YgY2FjaGVkRHMuZ2V0TGF5ZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgPyBjYWNoZWREcy5nZXRMYXllcigpXG4gICAgICAgICAgICA6IG51bGwpO1xuICAgICAgICBjb25zdCBsaXZlID0gdGhpcy50b0xpdmVNYXBMYXllcihjYWNoZWRMYXllciwgbWFwKTtcbiAgICAgICAgaWYgKGxpdmUpIHRoaXMuYWRkUmVzb2x2ZWRMYXllcihsYXllcnMsIGxheWVyS2V5VG9Ec0lkLCBzZWVuLCBsaXZlLCBkc0lkKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHNNZ3IgPSBEYXRhU291cmNlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgICAgY29uc3QgZHMgPSBkc01nci5nZXREYXRhU291cmNlKGRzSWQpIGFzIGFueTtcbiAgICAgIGlmIChkcykge1xuICAgICAgICBjb25zdCBkc0xheWVyID1cbiAgICAgICAgICAodHlwZW9mIGRzLmdldExheWVyID09PSBcImZ1bmN0aW9uXCIgPyBkcy5nZXRMYXllcigpIDogbnVsbCkgfHxcbiAgICAgICAgICBkcy5sYXllcjtcbiAgICAgICAgY29uc3QgbGl2ZSA9IHRoaXMudG9MaXZlTWFwTGF5ZXIoXG4gICAgICAgICAgZ2V0UXVlcnlhYmxlTGF5ZXIoZHNMYXllcikgfHwgZHNMYXllcixcbiAgICAgICAgICBtYXAsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChsaXZlKSB0aGlzLmFkZFJlc29sdmVkTGF5ZXIobGF5ZXJzLCBsYXllcktleVRvRHNJZCwgc2VlbiwgbGl2ZSwgZHNJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgbGF5ZXJzLCBsYXllcktleVRvRHNJZCB9O1xuICB9O1xuXG4gIG9uQWN0aXZlVmlld0NoYW5nZSA9IChqaW11TWFwVmlldzogSmltdU1hcFZpZXcpID0+IHtcbiAgICB0aGlzLmRldGFjaE1hcENsaWNrKCk7XG4gICAgdGhpcy5jbGVhbnVwSGlnaGxpZ2h0KCk7XG5cbiAgICBpZiAoIWppbXVNYXBWaWV3KSB7XG4gICAgICB0aGlzLm1hcEFyZWFSZXNpemVPYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgdGhpcy5jb25uZWN0ZWRNYXBWaWV3SWQgPSBcIlwiO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGppbXVNYXBWaWV3OiBudWxsLFxuICAgICAgICBmZWF0dXJlTGF5ZXJzOiBbXSxcbiAgICAgICAgb2JqZWN0SWRGaWVsZDogbnVsbCxcbiAgICAgICAgZXJyb3I6IHRoaXMudHIoXCJlcnJvci5ub01hcFZpZXdcIiksXG4gICAgICAgIGRlYnVnSW5mbzoge1xuICAgICAgICAgIC4uLnRoaXMuc3RhdGUuZGVidWdJbmZvLFxuICAgICAgICAgIGxheWVySW5mbzogdGhpcy50cihcImVycm9yLm5vTWFwVmlld1wiKSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZVZpZXcgPSBqaW11TWFwVmlldy52aWV3O1xuICAgIGlmIChhY3RpdmVWaWV3KSB7XG4gICAgICB0aGlzLm9ic2VydmVNYXBBcmVhUmVzaXplKGFjdGl2ZVZpZXcpO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdJZCA9IFN0cmluZyhcbiAgICAgIChqaW11TWFwVmlldyBhcyBhbnkpLmlkIHx8IChqaW11TWFwVmlldyBhcyBhbnkpLm1hcFdpZGdldElkIHx8IFwiXCIsXG4gICAgKTtcbiAgICAvLyBTYW1lIG1hcCBhbHJlYWR5IHdpcmVkIOKAlCBkbyBub3Qgc2V0U3RhdGUgYWdhaW4gKGNhdXNlcyBmcmVlemUgbG9vcHMpLlxuICAgIGlmICh2aWV3SWQgJiYgdmlld0lkID09PSB0aGlzLmNvbm5lY3RlZE1hcFZpZXdJZCAmJiB0aGlzLnN0YXRlLmppbXVNYXBWaWV3KSB7XG4gICAgICBpZiAoIXRoaXMuX2NsaWNrSGFuZGxlKSB0aGlzLmF0dGFjaE1hcENsaWNrKGppbXVNYXBWaWV3KTtcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5mZWF0dXJlTGF5ZXJzPy5sZW5ndGgpIHtcbiAgICAgICAgdm9pZCB0aGlzLmluaXRpYWxpemVNYXBDb25uZWN0aW9uKGppbXVNYXBWaWV3KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jb25uZWN0ZWRNYXBWaWV3SWQgPSB2aWV3SWQ7XG5cbiAgICB0aGlzLnNldFN0YXRlKHsgamltdU1hcFZpZXcgfSwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3LnZpZXc7XG4gICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgLy8gQXR0YWNoIGltbWVkaWF0ZWx5IHNvIHRoZSBmaXJzdCBmaWVsZCBjbGljayBuZXZlciByYWNlcyBsYXllciByZXNvbHZlLlxuICAgICAgdGhpcy5hdHRhY2hNYXBDbGljayhqaW11TWFwVmlldyk7XG5cbiAgICAgIGlmICh2aWV3LnJlYWR5KSB7XG4gICAgICAgIHRoaXMuc2V0dXBIaWdobGlnaHRMYXllcih2aWV3KTtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbihqaW11TWFwVmlldyk7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvblBpbm5lZElmTmVlZGVkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBoID0gdmlldy53YXRjaChcInJlYWR5XCIsIGFzeW5jIChyZWFkeSkgPT4ge1xuICAgICAgICAgIGlmIChyZWFkeSkge1xuICAgICAgICAgICAgaC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoTWFwQ2xpY2soamltdU1hcFZpZXcpO1xuICAgICAgICAgICAgdGhpcy5zZXR1cEhpZ2hsaWdodExheWVyKHZpZXcpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbihqaW11TWFwVmlldyk7XG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb25QaW5uZWRJZk5lZWRlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplTWFwQ29ubmVjdGlvbiA9IGFzeW5jIChqbXY6IEppbXVNYXBWaWV3KSA9PiB7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICBjb25zdCB2aWV3ID0gam12Py52aWV3O1xuICAgIGlmICghdmlldyB8fCAhdmlldy5tYXApIHJldHVybjtcblxuICAgIGNvbnN0IHJhd0xpc3QgPSAodGhpcy5wcm9wcy51c2VEYXRhU291cmNlcz8uYXNNdXRhYmxlPy4oKSBhcyBhbnlbXSkgfHwgW107XG4gICAgY29uc3QgdXNlTGlzdCA9IHRoaXMuZXhwYW5kVXNlRGF0YVNvdXJjZUVudHJpZXMocmF3TGlzdCk7XG4gICAgLy8gRW1wdHkgdXNlRGF0YVNvdXJjZXMgaXMgbm9ybWFsIHJpZ2h0IGFmdGVyIGRyb3Ag4oCUIHJlc29sdmUgbWFwIGxheWVycyBvbmx5LlxuICAgIC8vIE5ldmVyIGJvdW5jZSB0aHJvdWdoIHNjaGVkdWxlTWFwVmlld0ZhbGxiYWNrIGhlcmUgKHRoYXQgcmUtZW50ZXJlZFxuICAgIC8vIG9uQWN0aXZlVmlld0NoYW5nZSBhbmQgZnJvemUgdGhlIHBhZ2UpLlxuXG4gICAgdGhpcy5kYXRhU291cmNlRW5naW5lLnN5bmNTZWxlY3Rpb24oZ2V0U2VsZWN0ZWREc0lkcyh0aGlzLnByb3BzLnVzZURhdGFTb3VyY2VzKSk7XG5cbiAgICBjb25zdCByZXNvbHZlZExheWVyczogX19lc3JpLkZlYXR1cmVMYXllcltdID0gW107XG4gICAgY29uc3QgbGF5ZXJLZXlUb0RzSWQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICBjb25zdCBtYXBMYXllcnMgPSBnZXRBbGxGZWF0dXJlTGF5ZXJzRnJvbU1hcCh2aWV3Lm1hcCk7XG4gICAgLy8gbG9hZCgpIHJlaHlkcmF0ZXMgTWFwSW1hZ2Ugc3VibGF5ZXJzIGFuZCBjYW4gZHJvcCB0aGVpciBydW50aW1lXG4gICAgLy8gZGlzdHJpY3QgZGVmaW5pdGlvbkV4cHJlc3Npb24g4oCUIHNuYXBzaG90IGFuZCByZXBhaXIgc3luY2hyb25vdXNseSBzb1xuICAgIC8vIGEgY29ubmVjdC9yZXRyeSB0aGF0IG92ZXJsYXBzIGEgZmllbGQgY2xpY2sgbmV2ZXIgZmxhc2hlcyBvdGhlclxuICAgIC8vIGRpc3RyaWN0cycgZmllbGRzLlxuICAgIGNvbnN0IGRlZmluaXRpb25TbmFwc2hvdCA9IHRoaXMuc25hcHNob3REZWZpbml0aW9uRXhwcmVzc2lvbnMobWFwTGF5ZXJzKTtcbiAgICBmb3IgKGNvbnN0IGxheWVyIG9mIG1hcExheWVycykge1xuICAgICAgYXdhaXQgc2FmZUxvYWRNYXBMYXllcihsYXllcik7XG4gICAgICB0aGlzLmFkZFJlc29sdmVkTGF5ZXIocmVzb2x2ZWRMYXllcnMsIGxheWVyS2V5VG9Ec0lkLCBzZWVuLCBsYXllcik7XG4gICAgfVxuICAgIHRoaXMucmVzdG9yZURyaWZ0ZWREZWZpbml0aW9uRXhwcmVzc2lvbnMoZGVmaW5pdGlvblNuYXBzaG90KTtcblxuICAgIGlmICh1c2VMaXN0Lmxlbmd0aCkge1xuICAgICAgY29uc3QgZnJvbURzID0gdGhpcy5jb2xsZWN0TGF5ZXJzRnJvbURhdGFTb3VyY2VzKGptdiwgdXNlTGlzdCk7XG4gICAgICBmb3IgKGNvbnN0IGxheWVyIG9mIGZyb21Ecy5sYXllcnMpIHtcbiAgICAgICAgY29uc3QgbGl2ZSA9IHRoaXMudG9MaXZlTWFwTGF5ZXIobGF5ZXIsIHZpZXcubWFwKSB8fCBsYXllcjtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0QWdyaUxheWVyTWFwS2V5KGxpdmUpIHx8IFN0cmluZyhsaXZlLnVybCB8fCBsaXZlLmlkIHx8IFwiXCIpO1xuICAgICAgICBjb25zdCBkc0lkID0gZnJvbURzLmxheWVyS2V5VG9Ec0lkW2tleV07XG4gICAgICAgIHRoaXMuYWRkUmVzb2x2ZWRMYXllcihyZXNvbHZlZExheWVycywgbGF5ZXJLZXlUb0RzSWQsIHNlZW4sIGxpdmUsIGRzSWQpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IHVzZURzIG9mIHVzZUxpc3QpIHtcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBhd2FpdCB0aGlzLnJlc29sdmVGZWF0dXJlTGF5ZXJGb3JVc2VEYXRhU291cmNlKGptdiwgdXNlRHMpO1xuICAgICAgICBpZiAoIWxheWVyKSBjb250aW51ZTtcblxuICAgICAgICBhd2FpdCBzYWZlTG9hZE1hcExheWVyKGxheWVyKTtcblxuICAgICAgICBjb25zdCBkc0lkID0gU3RyaW5nKHVzZURzPy5kYXRhU291cmNlSWQgfHwgXCJcIik7XG4gICAgICAgIGNvbnN0IGxpdmUgPSB0aGlzLnRvTGl2ZU1hcExheWVyKGxheWVyLCB2aWV3Lm1hcCkgfHwgbGF5ZXI7XG4gICAgICAgIHRoaXMuYWRkUmVzb2x2ZWRMYXllcihyZXNvbHZlZExheWVycywgbGF5ZXJLZXlUb0RzSWQsIHNlZW4sIGxpdmUsIGRzSWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG5cbiAgICBpZiAoIXJlc29sdmVkTGF5ZXJzLmxlbmd0aCkge1xuICAgICAgLy8gU29mdCBmYWlsIOKAlCBtYXAgbWF5IHN0aWxsIGJlIGxvYWRpbmcgcmVnaW9uLXllYXIgc3VibGF5ZXJzLiBSZXRyeVxuICAgICAgLy8gYSBmZXcgdGltZXMgd2l0aG91dCByZS1lbnRlcmluZyBvbkFjdGl2ZVZpZXdDaGFuZ2UuXG4gICAgICAvLyBTdGlsbCBhdHRhY2ggdGhlIGNsaWNrIGhhbmRsZXIgc28gdGhlIGZpcnN0IGZpZWxkIGNsaWNrIHdvcmtzIGFzIHNvb25cbiAgICAgIC8vIGFzIGxpdmUgTWFwSW1hZ2Ugc3VibGF5ZXJzIGJlY29tZSBoaXR0YWJsZSB2aWEgZ2V0Q2xpY2tUYXJnZXRMYXllcnMuXG4gICAgICBpZiAoIXRoaXMuX2NsaWNrSGFuZGxlKSB0aGlzLmF0dGFjaE1hcENsaWNrKGptdik7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuc3RhdGUuZXJyb3IgIT09IHRoaXMudHIoXCJlcnJvci5zZWxlY3RlZExheWVyc01pc3NpbmdcIikgfHxcbiAgICAgICAgKHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycz8ubGVuZ3RoIHx8IDApID4gMFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGZlYXR1cmVMYXllcnM6IFtdLFxuICAgICAgICAgIG9iamVjdElkRmllbGQ6IG51bGwsXG4gICAgICAgICAgZXJyb3I6IHVzZUxpc3QubGVuZ3RoXG4gICAgICAgICAgICA/IHRoaXMudHIoXCJlcnJvci5zZWxlY3RlZExheWVyc01pc3NpbmdcIilcbiAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNjaGVkdWxlTWFwSW5pdFJldHJ5KGptdik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tYXBJbml0UmV0cnlDb3VudCA9IDA7XG4gICAgYWdyaU1hcENsaWNrRGVidWcoXCJpbml0aWFsaXplTWFwQ29ubmVjdGlvbiBPS1wiLCB7XG4gICAgICBsYXllckNvdW50OiByZXNvbHZlZExheWVycy5sZW5ndGgsXG4gICAgICBsYXllcnM6IHJlc29sdmVkTGF5ZXJzLm1hcCgobCkgPT4gbC50aXRsZSB8fCBsLnVybCB8fCBsLmlkKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHByZXZLZXlzID0gKHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycyB8fCBbXSlcbiAgICAgIC5tYXAoKGwpID0+IGdldEFncmlMYXllck1hcEtleShsKSB8fCBTdHJpbmcobC51cmwgfHwgbC5pZCB8fCBcIlwiKSlcbiAgICAgIC5qb2luKFwifFwiKTtcbiAgICBjb25zdCBuZXh0S2V5cyA9IHJlc29sdmVkTGF5ZXJzXG4gICAgICAubWFwKChsKSA9PiBnZXRBZ3JpTGF5ZXJNYXBLZXkobCkgfHwgU3RyaW5nKGwudXJsIHx8IGwuaWQgfHwgXCJcIikpXG4gICAgICAuam9pbihcInxcIik7XG4gICAgaWYgKHByZXZLZXlzID09PSBuZXh0S2V5cyAmJiB0aGlzLl9jbGlja0hhbmRsZSkge1xuICAgICAgdGhpcy5hdHRhY2hNYXBDbGljayhqbXYpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIGZlYXR1cmVMYXllcnM6IHJlc29sdmVkTGF5ZXJzLFxuICAgICAgICBsYXllcktleVRvRHNJZCxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGRlYnVnSW5mbzoge1xuICAgICAgICAgIC4uLnRoaXMuc3RhdGUuZGVidWdJbmZvLFxuICAgICAgICAgIGxheWVySW5mbzogcmVzb2x2ZWRMYXllcnMubWFwKChsKSA9PiAoe1xuICAgICAgICAgICAgaWQ6IGwuaWQsXG4gICAgICAgICAgICB0aXRsZTogbC50aXRsZSxcbiAgICAgICAgICAgIHVybDogbC51cmwsXG4gICAgICAgICAgICBvYmplY3RJZEZpZWxkOiBsLm9iamVjdElkRmllbGQsXG4gICAgICAgICAgfSkpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hdHRhY2hNYXBDbGljayhqbXYpO1xuICAgICAgfSxcbiAgICApO1xuICB9O1xuXG4gIHByaXZhdGUgdG9MaXZlTWFwTGF5ZXIgPSAoXG4gICAgbGF5ZXI6IGFueSxcbiAgICBtYXA6IF9fZXNyaS5NYXAgfCBudWxsIHwgdW5kZWZpbmVkLFxuICApOiBfX2VzcmkuRmVhdHVyZUxheWVyIHwgbnVsbCA9PiB7XG4gICAgaWYgKCFsYXllcikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdXJsID0gU3RyaW5nKGxheWVyPy51cmwgfHwgXCJcIik7XG4gICAgaWYgKG1hcCAmJiB1cmwpIHtcbiAgICAgIGNvbnN0IGJ5VXJsID0gZmluZFF1ZXJ5YWJsZUxheWVyT25NYXBCeVVybChtYXAsIHVybCk7XG4gICAgICBpZiAoYnlVcmwpIHJldHVybiBieVVybCBhcyBfX2VzcmkuRmVhdHVyZUxheWVyO1xuICAgIH1cbiAgICBpZiAobWFwICYmIGxheWVyPy5pZCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBieUlkID0gZmluZFF1ZXJ5YWJsZUxheWVyT25NYXBCeUlkKG1hcCwgU3RyaW5nKGxheWVyLmlkKSk7XG4gICAgICBpZiAoYnlJZCkgcmV0dXJuIGJ5SWQgYXMgX19lc3JpLkZlYXR1cmVMYXllcjtcbiAgICB9XG4gICAgY29uc3QgcXVlcnlhYmxlID0gZ2V0UXVlcnlhYmxlTGF5ZXIobGF5ZXIpO1xuICAgIHJldHVybiAocXVlcnlhYmxlIHx8IGxheWVyKSBhcyBfX2VzcmkuRmVhdHVyZUxheWVyO1xuICB9O1xuXG4gIHByaXZhdGUgbGF5ZXJLZXlzTWF0Y2ggPSAoYTogYW55LCBiOiBhbnkpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBrZXlBID0gZ2V0QWdyaUxheWVyTWFwS2V5KGEpO1xuICAgIGNvbnN0IGtleUIgPSBnZXRBZ3JpTGF5ZXJNYXBLZXkoYik7XG4gICAgaWYgKGtleUEgJiYga2V5QiAmJiBrZXlBID09PSBrZXlCKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoYS5pZCAhPSBudWxsICYmIGIuaWQgIT0gbnVsbCAmJiBTdHJpbmcoYS5pZCkgPT09IFN0cmluZyhiLmlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHVybEEgPSBub3JtYWxpemVRdWVyeWFibGVMYXllclVybChTdHJpbmcoYS51cmwgfHwgXCJcIikpO1xuICAgIGNvbnN0IHVybEIgPSBub3JtYWxpemVRdWVyeWFibGVMYXllclVybChTdHJpbmcoYi51cmwgfHwgXCJcIikpO1xuICAgIHJldHVybiAhISh1cmxBICYmIHVybEIgJiYgdXJsQSA9PT0gdXJsQik7XG4gIH07XG5cbiAgLyoqIFJlc29sdmUgdGhlIGxpdmUgbWFwIGxheWVyIGZvciBhIHNlbGVjdGVkIHVzZURhdGFTb3VyY2UgKEZlYXR1cmVMYXllciBvciBNYXBJbWFnZSBzdWJsYXllcikuICovXG4gIHByaXZhdGUgcmVzb2x2ZUZlYXR1cmVMYXllckZvclVzZURhdGFTb3VyY2UgPSBhc3luYyAoXG4gICAgam12OiBKaW11TWFwVmlldyxcbiAgICB1c2VEczogYW55LFxuICApOiBQcm9taXNlPF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBudWxsPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdXNlRHM/LmRhdGFTb3VyY2VJZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGNvbnN0IGRzSWQgPSBTdHJpbmcodXNlRHMuZGF0YVNvdXJjZUlkKTtcbiAgICAgIGNvbnN0IG1hcCA9IGptdj8udmlldz8ubWFwO1xuICAgICAgaWYgKCFtYXApIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBqbHZCeUFwaSA9IChqbXYgYXMgYW55KS5nZXRKaW11TGF5ZXJWaWV3QnlEYXRhU291cmNlSWQ/Lihkc0lkKTtcbiAgICAgIGNvbnN0IGZyb21BcGkgPSBnZXRRdWVyeWFibGVMYXllcihqbHZCeUFwaT8ubGF5ZXIpO1xuICAgICAgaWYgKGZyb21BcGkpIHJldHVybiB0aGlzLnRvTGl2ZU1hcExheWVyKGZyb21BcGksIG1hcCk7XG5cbiAgICAgIGNvbnN0IGpsdkxpc3Q6IGFueVtdID0gam12LmdldEFsbEppbXVMYXllclZpZXdzPy4oKSB8fCBbXTtcbiAgICAgIGNvbnN0IGxheWVySWRIaW50ID0gZXh0cmFjdE1hcExheWVySWRGcm9tRHNJZChkc0lkKTtcblxuICAgICAgZm9yIChjb25zdCBsdiBvZiBqbHZMaXN0KSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBsdj8ubGF5ZXJEYXRhU291cmNlSWQgPT09IGRzSWQgfHxcbiAgICAgICAgICBsdj8uZGF0YVNvdXJjZUlkID09PSBkc0lkXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gZ2V0UXVlcnlhYmxlTGF5ZXIobHY/LmxheWVyKTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWQpIHJldHVybiB0aGlzLnRvTGl2ZU1hcExheWVyKHJlc29sdmVkLCBtYXApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXllcklkSGludCkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IGpsdkxpc3QuZmluZChcbiAgICAgICAgICAobHYpID0+IFN0cmluZyhsdj8ubGF5ZXI/LmlkIHx8IFwiXCIpID09PSBsYXllcklkSGludCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBnZXRRdWVyeWFibGVMYXllcihtYXRjaD8ubGF5ZXIpO1xuICAgICAgICBpZiAocmVzb2x2ZWQpIHJldHVybiB0aGlzLnRvTGl2ZU1hcExheWVyKHJlc29sdmVkLCBtYXApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkc01nciA9IERhdGFTb3VyY2VNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG4gICAgICBjb25zdCBkczogYW55ID0gZHNNZ3IuZ2V0RGF0YVNvdXJjZShkc0lkKTtcbiAgICAgIGlmIChkcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh0eXBlb2YgZHMuZmV0Y2hTY2hlbWEgPT09IFwiZnVuY3Rpb25cIikgYXdhaXQgZHMuZmV0Y2hTY2hlbWEoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLyogc2NoZW1hIG9wdGlvbmFsICovXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkc0xheWVyID1cbiAgICAgICAgICAodHlwZW9mIGRzLmdldExheWVyID09PSBcImZ1bmN0aW9uXCIgPyBkcy5nZXRMYXllcigpIDogbnVsbCkgfHxcbiAgICAgICAgICBkcy5sYXllciB8fFxuICAgICAgICAgICh0eXBlb2YgZHMuZ2V0SmltdUxheWVyID09PSBcImZ1bmN0aW9uXCIgPyBkcy5nZXRKaW11TGF5ZXIoKSA6IG51bGwpO1xuICAgICAgICBjb25zdCBxdWVyeWFibGUgPSBnZXRRdWVyeWFibGVMYXllcihkc0xheWVyKTtcbiAgICAgICAgaWYgKHF1ZXJ5YWJsZSkge1xuICAgICAgICAgIGNvbnN0IGxpdmUgPSB0aGlzLnRvTGl2ZU1hcExheWVyKHF1ZXJ5YWJsZSwgbWFwKTtcbiAgICAgICAgICBpZiAobGl2ZSkgcmV0dXJuIGxpdmU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkc1VybCA9IFN0cmluZyhkcz8udXJsIHx8IHF1ZXJ5YWJsZT8udXJsIHx8IGRzTGF5ZXI/LnVybCB8fCBcIlwiKTtcbiAgICAgICAgaWYgKGRzVXJsKSB7XG4gICAgICAgICAgY29uc3QgYnlVcmwgPSBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5VXJsKG1hcCwgZHNVcmwpO1xuICAgICAgICAgIGlmIChieVVybCkgcmV0dXJuIGJ5VXJsIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGlnbm9yZSAqL1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgcHJpdmF0ZSBjbGFtcFBvcHVwVG9NYXBDb250YWluZXIgPSAoXG4gICAgcG9zOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0sXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICApID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3LmNvbnRhaW5lciBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCByZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IG1hcmdpbiA9IHRoaXMuUE9QVVBfTUFSR0lOO1xuICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMuc3RhdGUucGluVG9Db3JuZXI7XG4gICAgY29uc3QgeyB3aWR0aDogcG9wdXBXLCBoZWlnaHQ6IHBvcHVwSCB9ID0gdGhpcy5nZXRQb3B1cERpbWVuc2lvbnMoXG4gICAgICB2aWV3LFxuICAgICAgcGlubmVkLFxuICAgICAgcG9zLFxuICAgICk7XG5cbiAgICBjb25zdCBtYXBMZWZ0ID0gcmVjdC5sZWZ0O1xuICAgIGNvbnN0IG1hcFRvcCA9IHJlY3QudG9wO1xuICAgIGNvbnN0IG1hcFJpZ2h0ID0gcmVjdC5yaWdodDtcbiAgICBjb25zdCBtYXBCb3R0b20gPSB0aGlzLmdldEVmZmVjdGl2ZU1hcEJvdHRvbSh2aWV3LCBtYXJnaW4pO1xuXG4gICAgY29uc3QgeCA9IE1hdGgubWF4KFxuICAgICAgbWFwTGVmdCArIG1hcmdpbixcbiAgICAgIE1hdGgubWluKHBvcy54LCBtYXBSaWdodCAtIHBvcHVwVyAtIG1hcmdpbiksXG4gICAgKTtcblxuICAgIGxldCB5ID0gcG9zLnk7XG4gICAgaWYgKHkgKyBwb3B1cEggPiBtYXBCb3R0b20pIHtcbiAgICAgIHkgPSBtYXBCb3R0b20gLSBwb3B1cEggLSBtYXJnaW47XG4gICAgfVxuICAgIHkgPSBNYXRoLm1heChtYXBUb3AgKyBtYXJnaW4sIHkpO1xuXG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9O1xuXG4gIHByaXZhdGUgYXR0YWNoTWFwQ2xpY2soam12OiBKaW11TWFwVmlldykge1xuICAgIHRoaXMuZGV0YWNoTWFwQ2xpY2soKTtcbiAgICBjb25zdCB2aWV3ID0gam12Py52aWV3IGFzIHsgb24/OiAoZXZlbnQ6IHN0cmluZywgY2I6IHVua25vd24pID0+IHVua25vd24gfSB8IG51bGw7XG4gICAgaWYgKCF2aWV3IHx8IHR5cGVvZiB2aWV3Lm9uICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybjtcbiAgICB0aGlzLl9jbGlja0hhbmRsZSA9IHZpZXcub24oXCJjbGlja1wiLCB0aGlzLm9uVmlld0NsaWNrKSBhcyBhbnk7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZU1hcENsaWNrQXR0YWNoZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBtYXBXaWRnZXRJZCA9IHRoaXMuZ2V0TGlua2VkTWFwV2lkZ2V0SWQoKTtcbiAgICBjb25zdCBqbXYgPVxuICAgICAgdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlld1xuICAgICAgICA/IHRoaXMuc3RhdGUuamltdU1hcFZpZXdcbiAgICAgICAgOiB0aGlzLmdldE1hcFZpZXdGcm9tTWFuYWdlcihtYXBXaWRnZXRJZCk7XG4gICAgaWYgKCFqbXY/LnZpZXcpIHJldHVybiBmYWxzZTtcblxuICAgIGlmICghdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldykge1xuICAgICAgdGhpcy5vbkFjdGl2ZVZpZXdDaGFuZ2Uoam12KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fY2xpY2tIYW5kbGUpIHtcbiAgICAgIHRoaXMuYXR0YWNoTWFwQ2xpY2soam12KTtcbiAgICB9XG4gICAgcmV0dXJuICEhdGhpcy5fY2xpY2tIYW5kbGU7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVYeVBhZ2VDbG9zZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKCF0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnN0YXRlLnNob3dQb3B1cCkge1xuICAgICAgdGhpcy5jbG9zZVBvcHVwKHsgcmVzdG9yZUV4dGVudDogZmFsc2UsIG5vdGlmeURlc2VsZWN0OiBmYWxzZSB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBmaWVsZCBwb3B1cCB3aGVuIHRoZSBodWIgZ2VvZ3JhcGh5IG1vdmVzIChvdGhlciB0dW1hbiAvXG4gICAqIHZpbG95YXQgLyB5ZWFyKSBvciB3aGVuIHBvbHlnb24gZm9jdXMgaXMgY2xlYXJlZC4gRG8gbm90IHJlc3RvcmUgdGhlXG4gICAqIHByZS1maWVsZCBleHRlbnQgb24gZ2VvZ3JhcGh5IGNoYW5nZSDigJQgTG9jYWxpemF0aW9uIGlzIGFscmVhZHkgem9vbWluZ1xuICAgKiB0byB0aGUgbmV3IGRpc3RyaWN0L3JlZ2lvbi5cbiAgICovXG4gIHByaXZhdGUgaGFuZGxlTWFzdGVyRmlsdGVyQ2hhbmdlZCA9IChldmVudDogRXZlbnQpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IGRldGFpbDogYW55ID0gKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwgfHwge307XG4gICAgY29uc3QgZjogYW55ID0gZGV0YWlsLmZpbHRlcnMgfHwge307XG4gICAgY29uc3QgZ2VvS2V5ID0gYCR7U3RyaW5nKGYueWlsIHx8IFwiXCIpfXwke1N0cmluZyhmLnZpbG95YXQgfHwgXCJcIil9fCR7U3RyaW5nKGYudHVtYW4gfHwgXCJcIil9YDtcbiAgICBjb25zdCBwcmV2R2VvID0gdGhpcy5fbGFzdE1hc3Rlckdlb0tleTtcbiAgICB0aGlzLl9sYXN0TWFzdGVyR2VvS2V5ID0gZ2VvS2V5O1xuXG4gICAgY29uc3QgZ2VvQ2hhbmdlZCA9IEJvb2xlYW4ocHJldkdlbykgJiYgcHJldkdlbyAhPT0gZ2VvS2V5O1xuICAgIGNvbnN0IHBvbHlnb25DbGVhcmVkID0gZi5wb2x5Z29uTW9kZSA9PT0gZmFsc2U7XG4gICAgY29uc3QgaW5jb21pbmdVbmlxdWUgPSBTdHJpbmcoZi51bmlxdWVpZCB8fCBcIlwiKVxuICAgICAgLnJlcGxhY2UoL1t7fV0vZywgXCJcIilcbiAgICAgIC50cmltKCk7XG4gICAgaWYgKGYucG9seWdvbk1vZGUgPT09IHRydWUgJiYgaW5jb21pbmdVbmlxdWUpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZUluc3BlY3RlZFVuaXF1ZWlkID0gaW5jb21pbmdVbmlxdWU7XG4gICAgICAvLyBGYWxsYmFjazogaWYgc2VsZWN0aW9uIGFycml2ZWQgdmlhIGh1YiBidXQgcG9wdXAgaXMgc3RpbGwgY2xvc2VkLCBvcGVuIGl0LlxuICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCkge1xuICAgICAgICB2b2lkIHRoaXMub3BlblBvcHVwRm9yVW5pcXVlaWQoaW5jb21pbmdVbmlxdWUsIHtcbiAgICAgICAgICB6b29tOiBmYWxzZSxcbiAgICAgICAgICBub3RpZnlTZWxlY3Rpb246IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBvbHlnb25DbGVhcmVkKSB7XG4gICAgICB0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGdlb0NoYW5nZWQpIHtcbiAgICAgIHRoaXMuY2xvc2VQb3B1cCh7IHJlc3RvcmVFeHRlbnQ6IGZhbHNlLCBub3RpZnlEZXNlbGVjdDogZmFsc2UgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFNhbWUgZ2VvZ3JhcGh5IGJ1dCBodWIgY2xlYXJlZCBwb2x5Z29uIGZvY3VzIChlLmcuIEdyYWZmIGRlc2VsZWN0KS5cbiAgICBpZiAocG9seWdvbkNsZWFyZWQgJiYgKHRoaXMuc3RhdGUuc2hvd1BvcHVwIHx8IHRoaXMuc3RhdGUubG9hZGluZykpIHtcbiAgICAgIHRoaXMuY2xvc2VQb3B1cCh7IHJlc3RvcmVFeHRlbnQ6IHRydWUsIG5vdGlmeURlc2VsZWN0OiBmYWxzZSB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqIEltbWVkaWF0ZSBjbG9zZSB3aGVuIFJlZ2lvbi9QaWUveWVhciBjaGFuZ2UgZ2VvZ3JhcGh5IChiZWZvcmUgbWFwIHN5bmMgZmluaXNoZXMpLiAqL1xuICBwcml2YXRlIGhhbmRsZVdpZGdldFNlbGVjdGlvbkNoYW5nZWQgPSAoZXZlbnQ6IEV2ZW50KTogdm9pZCA9PiB7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICBjb25zdCBkOiBhbnkgPSAoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpLmRldGFpbCB8fCB7fTtcbiAgICAvLyBPdXIgb3duIHBvbHlnb24gbm90aWZ5IG11c3Qgbm90IGNsb3NlIHRoZSBwb3B1cCB3ZSBqdXN0IG9wZW5lZC5cbiAgICBpZiAoZC5zb3VyY2UgPT09IFwiQWdyaVBvcHVwXCIpIHJldHVybjtcbiAgICBpZiAoXG4gICAgICBkLnlpbCAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICBkLnZpbG95YXQgIT09IHVuZGVmaW5lZCB8fFxuICAgICAgZC50dW1hbiAhPT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICB0aGlzLmNsb3NlUG9wdXAoeyByZXN0b3JlRXh0ZW50OiBmYWxzZSwgbm90aWZ5RGVzZWxlY3Q6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZC5wb2x5Z29uTW9kZSA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZUluc3BlY3RlZFVuaXF1ZWlkID0gbnVsbDtcbiAgICAgIHRoaXMuY2xvc2VQb3B1cCh7IHJlc3RvcmVFeHRlbnQ6IHRydWUsIG5vdGlmeURlc2VsZWN0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgKGQuc291cmNlID09PSBcIkFncmlHcmFmZldpZGdldFwiIHx8IGQuc291cmNlID09PSBcIkFncmlHcmFmZjEwXCIpICYmXG4gICAgICBkLnBvbHlnb25Nb2RlID09PSB0cnVlICYmXG4gICAgICBkLnVuaXF1ZWlkXG4gICAgKSB7XG4gICAgICBjb25zdCBjbGVhbiA9IFN0cmluZyhkLnVuaXF1ZWlkKVxuICAgICAgICAucmVwbGFjZSgvW3t9XS9nLCBcIlwiKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgdGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgPSBjbGVhbjtcbiAgICAgIC8vIFRhYmxlIC8gR3JhZmYgc2VsZWN0aW9uIG11c3QgYWx3YXlzIG9wZW4gdGhlIGZpZWxkIHBvcHVwLlxuICAgICAgdm9pZCB0aGlzLm9wZW5Qb3B1cEZvclVuaXF1ZWlkKGNsZWFuLCB7XG4gICAgICAgIHpvb206IGZhbHNlLFxuICAgICAgICBub3RpZnlTZWxlY3Rpb246IGZhbHNlLFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBPcGVuIChvciByZWZyZXNoKSB0aGUgZmllbGQgcG9wdXAgZm9yIGEgcG9seWdvbiB1bmlxdWVpZCDigJQgdXNlZCB3aGVuXG4gICAqIHNlbGVjdGlvbiBjb21lcyBmcm9tIHRoZSB0YWJsZS9HcmFmZiBwYXRoIChtYXAgY2xpY2sgYWxyZWFkeSBvcGVucyBpdHNlbGYpLlxuICAgKi9cbiAgcHJpdmF0ZSBvcGVuUG9wdXBGb3JVbmlxdWVpZCA9IGFzeW5jIChcbiAgICB1bmlxdWVpZDogc3RyaW5nLFxuICAgIG9wdHM/OiB7IHpvb20/OiBib29sZWFuOyBub3RpZnlTZWxlY3Rpb24/OiBib29sZWFuIH0sXG4gICk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGNsZWFuID0gU3RyaW5nKHVuaXF1ZWlkIHx8IFwiXCIpXG4gICAgICAucmVwbGFjZSgvW3t9XS9nLCBcIlwiKVxuICAgICAgLnRyaW0oKTtcbiAgICBpZiAoIWNsZWFuIHx8ICF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcblxuICAgIGNvbnN0IGFjdGl2ZSA9IFN0cmluZyh0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCB8fCBcIlwiKVxuICAgICAgLnJlcGxhY2UoL1t7fV0vZywgXCJcIilcbiAgICAgIC50cmltKCk7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2hvd1BvcHVwICYmIGFjdGl2ZSA9PT0gY2xlYW4gJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZEF0dHJzKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCkge1xuICAgICAgICB0aGlzLmV4cGFuZFBvcHVwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJyb2FkY2FzdFBvcHVwVmlzaWJpbGl0eSh0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBqbXYgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3O1xuICAgIGNvbnN0IHZpZXcgPSBqbXY/LnZpZXc7XG4gICAgaWYgKCF2aWV3IHx8ICFqbXYpIHJldHVybjtcblxuICAgIGNvbnN0IGNsaWNrR2VuZXJhdGlvbiA9ICsrdGhpcy5fY2xpY2tHZW5lcmF0aW9uO1xuICAgIGNvbnN0IGlzU3RhbGUgPSAoKSA9PlxuICAgICAgIXRoaXMuX2lzTW91bnRlZCB8fCBjbGlja0dlbmVyYXRpb24gIT09IHRoaXMuX2NsaWNrR2VuZXJhdGlvbjtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiB0cnVlLFxuICAgICAgYXR0YWNobWVudHM6IFtdLFxuICAgICAgYXR0YWNobWVudHNFeHBhbmRlZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBsYXllcnMgPSBhd2FpdCB0aGlzLnJlc29sdmVDbGlja0xheWVycyh2aWV3LCBqbXYpO1xuICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgICBsZXQgZmVhdHVyZTogX19lc3JpLkdyYXBoaWMgfCBudWxsID0gbnVsbDtcbiAgICAgIGxldCBjbGlja2VkTGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzQWdyaWN1bHR1cmFsRmllbGRMYXllcihsYXllcikpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXRoaXMuaXNMYXllckVmZmVjdGl2ZWx5VmlzaWJsZShsYXllciwgdmlldykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkZXRhY2hlZCA9IGF3YWl0IHRoaXMuZ2V0RGV0YWNoZWRRdWVyeUxheWVyKGxheWVyKTtcbiAgICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBxdWVyeVRhcmdldCA9IGRldGFjaGVkIHx8IGxheWVyO1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IFtjbGVhbiwgYHske2NsZWFufX1gXTtcbiAgICAgICAgZm9yIChjb25zdCB2IG9mIHZhcmlhbnRzKSB7XG4gICAgICAgICAgY29uc3QgcSA9IHF1ZXJ5VGFyZ2V0LmNyZWF0ZVF1ZXJ5KCk7XG4gICAgICAgICAgcS5vdXRGaWVsZHMgPSBbXCIqXCJdO1xuICAgICAgICAgIHEucmV0dXJuR2VvbWV0cnkgPSB0cnVlO1xuICAgICAgICAgIHEubnVtID0gMTtcbiAgICAgICAgICBjb25zdCBlc2NhcGVkID0gU3RyaW5nKHYpLnJlcGxhY2UoLycvZywgXCInJ1wiKTtcbiAgICAgICAgICBxLndoZXJlID0gYCR7QUdSSV9UQUJMRV9KT0lOX0ZJRUxEfT0nJHtlc2NhcGVkfSdgO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBxdWVyeVRhcmdldC5xdWVyeUZlYXR1cmVzKHEpO1xuICAgICAgICAgICAgaWYgKHJlcy5mZWF0dXJlcz8uWzBdKSB7XG4gICAgICAgICAgICAgIGZlYXR1cmUgPSByZXMuZmVhdHVyZXNbMF07XG4gICAgICAgICAgICAgIGNsaWNrZWRMYXllciA9IGxheWVyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8qIHRyeSBuZXh0IHZhcmlhbnQgLyBsYXllciAqL1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZmVhdHVyZSkgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghZmVhdHVyZSB8fCAhY2xpY2tlZExheWVyIHx8IGlzU3RhbGUoKSkge1xuICAgICAgICBpZiAoIWlzU3RhbGUoKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICAgICAgYXR0YWNobWVudHM6IFtdLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGl2ZUxheWVyID1cbiAgICAgICAgKHRoaXMudG9MaXZlTWFwTGF5ZXIoY2xpY2tlZExheWVyLCB2aWV3Lm1hcCkgfHxcbiAgICAgICAgICBjbGlja2VkTGF5ZXIpIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gICAgICBjb25zdCBsYXllcktleSA9XG4gICAgICAgIGdldEFncmlMYXllck1hcEtleShsaXZlTGF5ZXIpIHx8XG4gICAgICAgIFN0cmluZyhsaXZlTGF5ZXI/LnVybCB8fCBsaXZlTGF5ZXI/LmlkIHx8IFwiXCIpO1xuICAgICAgY29uc3QgZHNJZCA9IHRoaXMuc3RhdGUubGF5ZXJLZXlUb0RzSWQ/LltsYXllcktleV0gfHwgbnVsbDtcbiAgICAgIGNvbnN0IG9pZEZpZWxkID1cbiAgICAgICAgbGl2ZUxheWVyLm9iamVjdElkRmllbGQgfHxcbiAgICAgICAgbGl2ZUxheWVyLmZpZWxkcz8uZmluZCgoZjogYW55KSA9PiBmLnR5cGUgPT09IFwib2lkXCIpPy5uYW1lIHx8XG4gICAgICAgIG51bGw7XG4gICAgICBpZiAoIW9pZEZpZWxkKSB7XG4gICAgICAgIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgICBzaG93UG9wdXA6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb2lkID0gZmVhdHVyZS5hdHRyaWJ1dGVzPy5bb2lkRmllbGRdO1xuICAgICAgaWYgKG9pZCA9PSBudWxsKSB7XG4gICAgICAgIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgICBzaG93UG9wdXA6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0RmllbGRzID0gdGhpcy5nZXRPdXRGaWVsZHMobGl2ZUxheWVyIGFzIGFueSwgb2lkRmllbGQpO1xuICAgICAgY29uc3QgZiA9XG4gICAgICAgIChhd2FpdCB0aGlzLnF1ZXJ5RmVhdHVyZUJ5T2JqZWN0SWRDYWNoZWQoXG4gICAgICAgICAgbGl2ZUxheWVyLFxuICAgICAgICAgIG9pZEZpZWxkLFxuICAgICAgICAgIG9pZCxcbiAgICAgICAgICBvdXRGaWVsZHMsXG4gICAgICAgICkpIHx8IGZlYXR1cmU7XG4gICAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG5cbiAgICAgIGlmIChmLmdlb21ldHJ5KSB0aGlzLmhpZ2hsaWdodFBvbHlnb24oZi5nZW9tZXRyeSk7XG5cbiAgICAgIGNvbnN0IGRpc3BsYXlBdHRycyA9IGF3YWl0IHRoaXMucmVzb2x2ZURpc3BsYXlBdHRycyhmLmF0dHJpYnV0ZXMpO1xuICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBzaG91bGRQaW4gPSB0aGlzLnN0YXRlLnBpblRvQ29ybmVyO1xuICAgICAgY29uc3QgcG9wdXBQb3NpdGlvbiA9IHNob3VsZFBpblxuICAgICAgICA/IHRoaXMuY2FsY3VsYXRlUGlubmVkUG9zaXRpb24odmlldylcbiAgICAgICAgOiB0aGlzLnN0YXRlLnBvcHVwUG9zaXRpb24gfHwgdGhpcy5jYWxjdWxhdGVQaW5uZWRQb3NpdGlvbih2aWV3KTtcblxuICAgICAgY29uc3QgY29uZmlndXJlZEZpZWxkcyA9IHRoaXMucHJvcHMuY29uZmlnPy5maWVsZHNUb1Nob3cgfHwgW107XG4gICAgICBjb25zdCBhY3R1YWxGaWVsZHMgPSBPYmplY3Qua2V5cyhkaXNwbGF5QXR0cnMpO1xuICAgICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IGNvbmZpZ3VyZWRGaWVsZHMuZmlsdGVyKFxuICAgICAgICAoZmllbGQpID0+ICFhY3R1YWxGaWVsZHMuaW5jbHVkZXMoZmllbGQpLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGZpZWxkc1dpdGhEYXRhID0gY29uZmlndXJlZEZpZWxkcy5maWx0ZXIoXG4gICAgICAgIChuYW1lKSA9PlxuICAgICAgICAgIGRpc3BsYXlBdHRycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJlxuICAgICAgICAgIGRpc3BsYXlBdHRyc1tuYW1lXSAhPSBudWxsICYmXG4gICAgICAgICAgZGlzcGxheUF0dHJzW25hbWVdICE9PSBcIlwiLFxuICAgICAgKTtcblxuICAgICAgdGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgPSBjbGVhbjtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgbGFzdENsaWNrZWREc0lkOiBkc0lkLFxuICAgICAgICBsYXN0Q2xpY2tlZExheWVyS2V5OiBsYXllcktleSxcbiAgICAgICAgc2VsZWN0ZWRBdHRyczogZGlzcGxheUF0dHJzLFxuICAgICAgICBzZWxlY3RlZE9JRDogTnVtYmVyKG9pZCksXG4gICAgICAgIG9iamVjdElkRmllbGQ6IG9pZEZpZWxkLFxuICAgICAgICBzaG93UG9wdXA6IHRydWUsXG4gICAgICAgIHBvcHVwTWluaW1pemVkOiBmYWxzZSxcbiAgICAgICAgY2hhcnRFeHBhbmRlZDogc2hvdWxkUGluLFxuICAgICAgICBjaGFydEhvdmVySW5kZXg6IG51bGwsXG4gICAgICAgIHBvcHVwUG9zaXRpb24sXG4gICAgICAgIGVycm9yOlxuICAgICAgICAgIG1pc3NpbmdGaWVsZHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyB0aGlzLnRyKFwiZXJyb3IuY29uZmlndXJlZEZpZWxkTWlzc2luZ1wiLCB7XG4gICAgICAgICAgICAgICAgZmllbGRzOiBtaXNzaW5nRmllbGRzLmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogZmllbGRzV2l0aERhdGEubGVuZ3RoID09PSAwICYmIGNvbmZpZ3VyZWRGaWVsZHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICA/IHRoaXMudHIoXCJlcnJvci5ub0RhdGFGb3JDb25maWd1cmVkRmllbGRzXCIpXG4gICAgICAgICAgICAgIDogbnVsbCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAob3B0cz8ubm90aWZ5U2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMubm90aWZ5R3JhZmZQb2x5Z29uU2VsZWN0aW9uKGNsZWFuLCB0cnVlLCBEYXRlLm5vdygpKTtcbiAgICAgIH1cbiAgICAgIHZvaWQgdGhpcy5mZXRjaExhdGVzdFZlZ2V0YXRpb25JbmRpY2VzKGNsZWFuKTtcblxuICAgICAgaWYgKG9wdHM/Lnpvb20gIT09IGZhbHNlICYmIGYuZ2VvbWV0cnkgJiYgIWlzU3RhbGUoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uICYmIHZpZXcuZXh0ZW50Py5jbG9uZSkge1xuICAgICAgICAgICAgdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uID0gdmlldy5leHRlbnQuY2xvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID1cbiAgICAgICAgICAgIChmLmdlb21ldHJ5IGFzIGFueSkuZXh0ZW50Py5leHBhbmQ/LigxLjA4KSB8fCBmLmdlb21ldHJ5O1xuICAgICAgICAgIHZvaWQgdmlldy5nb1RvKFxuICAgICAgICAgICAgeyB0YXJnZXQgfSxcbiAgICAgICAgICAgIHsgZHVyYXRpb246IDY1MCwgZWFzaW5nOiBcImVhc2UtaW4tb3V0XCIgYXMgYW55IH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLyogaWdub3JlICovXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvcHMuY29uZmlnPy5zZXR0aW5ncz8uc2hvd0F0dGFjaG1lbnRzICE9PSBmYWxzZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNsaWNrZWRVcmwgPSBTdHJpbmcoKGxpdmVMYXllciBhcyBhbnkpLnVybCB8fCBcIlwiKS50cmltKCk7XG4gICAgICAgICAgY29uc3QgYXR0YWNobWVudExheWVyID1cbiAgICAgICAgICAgIChjbGlja2VkVXJsICYmIHRoaXMuX3F1ZXJ5T25seUxheWVycy5nZXQoY2xpY2tlZFVybCkpIHx8IGxpdmVMYXllcjtcbiAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRBdHRhY2htZW50c0Zvck9pZChhdHRhY2htZW50TGF5ZXIgYXMgYW55LCBOdW1iZXIob2lkKSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSwgYXR0YWNobWVudHM6IFtdIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLCBhdHRhY2htZW50czogW10gfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dEFmdGVyQ29udGVudCgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogZT8ubWVzc2FnZSB8fCBTdHJpbmcoZSksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIGhhbmRsZVNoYXJlZE1hcENsaWNrID0gYXN5bmMgKGV2ZW50OiBFdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIC8vIEFsd2F5cyBpZ25vcmUgdGhlIExvY2FsaXphdGlvbiBjbGljayBidXMuIEFncmlQb3B1cCBvd25zIHZpZXcub24oXCJjbGlja1wiKVxuICAgIC8vIGV4Y2x1c2l2ZWx5IOKAlCBoYW5kbGluZyBib3RoIHJhY2VzIHR3byBmdWxsIG9uVmlld0NsaWNrIGNoYWluczogdGhlIGxvc2VyXG4gICAgLy8gb2Z0ZW4gY2xlYXJzIHNob3dQb3B1cCwgcmVzdG9yZXMgdGhlIHByZS1zZWxlY3Rpb24gZXh0ZW50LCBhbmQgZmxhc2hlc1xuICAgIC8vIG90aGVyLWRpc3RyaWN0IGZpZWxkcy4gTG9jYWxpemF0aW9uIG1heSBzdGlsbCBkaXNwYXRjaCBmb3Igb3RoZXIgbGlzdGVuZXJzLlxuICAgIGFncmlNYXBDbGlja0RlYnVnKFxuICAgICAgXCJBZ3JpUG9seWdvbiDihpAgc2hhcmVkIG1hcC1jbGljayBTS0lQIChkaXJlY3QgdmlldyBjbGljayBpcyBzb2xlIG93bmVyKVwiLFxuICAgICk7XG4gICAgcmV0dXJuO1xuICB9O1xuXG4gIHByaXZhdGUgZGV0YWNoTWFwQ2xpY2soKSB7XG4gICAgaWYgKHRoaXMuX2NsaWNrSGFuZGxlPy5yZW1vdmUpIHRoaXMuX2NsaWNrSGFuZGxlLnJlbW92ZSgpO1xuICAgIHRoaXMuX2NsaWNrSGFuZGxlID0gbnVsbDtcbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gQ2xpY2sg4oaSIGhpdFRlc3Qg4oaSIHF1ZXJ5IGZ1bGwgYXR0cnMgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgdG9DbGlja1F1ZXJ5R2VvbWV0cnkgPSAoXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICAgIHNjcmVlblBvaW50OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0sXG4gICAgbWFwUG9pbnQ/OiB7IHg/OiBudW1iZXI7IHk/OiBudW1iZXI7IHNwYXRpYWxSZWZlcmVuY2U/OiB7IHdraWQ/OiBudW1iZXIgfSB9LFxuICApOiBfX2VzcmkuUG9pbnQgfCBudWxsID0+IHtcbiAgICBpZiAodHlwZW9mIHZpZXcudG9NYXAgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZnJvbVZpZXcgPSB2aWV3LnRvTWFwKHNjcmVlblBvaW50KTtcbiAgICAgICAgaWYgKGZyb21WaWV3KSByZXR1cm4gZnJvbVZpZXcgYXMgX19lc3JpLlBvaW50O1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB4ID0gTnVtYmVyKG1hcFBvaW50Py54KTtcbiAgICBjb25zdCB5ID0gTnVtYmVyKG1hcFBvaW50Py55KTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCh7XG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHNwYXRpYWxSZWZlcmVuY2U6XG4gICAgICAgICAgbWFwUG9pbnQ/LnNwYXRpYWxSZWZlcmVuY2UgfHwgKHZpZXcgYXMgYW55KS5zcGF0aWFsUmVmZXJlbmNlLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBmaW5kSGl0R3JhcGhpYyA9IChcbiAgICBoaXQ6IF9fZXNyaS5IaXRUZXN0UmVzdWx0IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBsYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSxcbiAgKTogX19lc3JpLkdyYXBoaWMgfCBudWxsID0+IHtcbiAgICBjb25zdCBoaXRSZXN1bHQgPSBoaXQ/LnJlc3VsdHM/LmZpbmQoKHIpID0+IHtcbiAgICAgIGlmIChcImdyYXBoaWNcIiBpbiByICYmIHIuZ3JhcGhpYykge1xuICAgICAgICBjb25zdCBseXI6IGFueSA9IHIuZ3JhcGhpYy5sYXllcjtcbiAgICAgICAgaWYgKCFseXIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGxheWVycy5zb21lKChMKSA9PiB0aGlzLmxheWVyS2V5c01hdGNoKEwsIGx5cikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgIHJldHVybiBoaXRSZXN1bHQgJiYgXCJncmFwaGljXCIgaW4gaGl0UmVzdWx0ID8gaGl0UmVzdWx0LmdyYXBoaWMgOiBudWxsO1xuICB9O1xuXG4gIHByaXZhdGUgcGlja0NsaWNrR3JhcGhpYyA9IChcbiAgICBoaXQ6IF9fZXNyaS5IaXRUZXN0UmVzdWx0IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBwcmVmZXJyZWRMYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSxcbiAgKTogX19lc3JpLkdyYXBoaWMgfCBudWxsID0+IHtcbiAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldztcbiAgICBjb25zdCBtYXAgPSBhY3RpdmVWaWV3Py5tYXA7XG4gICAgY29uc3QgY2FuZGlkYXRlczogX19lc3JpLkdyYXBoaWNbXSA9IFtdO1xuICAgIGNvbnN0IHJlc3RyaWN0VG9QcmVmZXJyZWQgPSBwcmVmZXJyZWRMYXllcnMubGVuZ3RoID4gMDtcblxuICAgIGZvciAoY29uc3QgciBvZiBoaXQ/LnJlc3VsdHMgfHwgW10pIHtcbiAgICAgIGlmICghciB8fCB0eXBlb2YgciAhPT0gXCJvYmplY3RcIikgY29udGludWU7XG4gICAgICBjb25zdCBncmFwaGljID1cbiAgICAgICAgXCJncmFwaGljXCIgaW4gciAmJiAociBhcyBhbnkpLmdyYXBoaWNcbiAgICAgICAgICA/ICgociBhcyBhbnkpLmdyYXBoaWMgYXMgX19lc3JpLkdyYXBoaWMpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgaWYgKCFncmFwaGljKSBjb250aW51ZTtcblxuICAgICAgY29uc3QgcmF3TGF5ZXI6IGFueSA9IGdyYXBoaWMubGF5ZXI7XG4gICAgICBpZiAodGhpcy5pc0hpZ2hsaWdodExheWVyKHJhd0xheWVyKSkgY29udGludWU7XG5cbiAgICAgIGNvbnN0IGxheWVyID0gdGhpcy50b0xpdmVNYXBMYXllcihcbiAgICAgICAgZ2V0UXVlcnlhYmxlTGF5ZXIocmF3TGF5ZXIpIHx8IHJhd0xheWVyLFxuICAgICAgICBtYXAsXG4gICAgICApO1xuICAgICAgaWYgKCFsYXllciB8fCAhdGhpcy5pc0FncmljdWx0dXJhbEZpZWxkTGF5ZXIobGF5ZXIpKSBjb250aW51ZTtcbiAgICAgIGlmICghYWN0aXZlVmlldyB8fCAhdGhpcy5pc0xheWVyRWZmZWN0aXZlbHlWaXNpYmxlKGxheWVyLCBhY3RpdmVWaWV3KSkgY29udGludWU7XG4gICAgICBpZiAoIXRoaXMuaXNBZ3JpY3VsdHVyYWxGaWVsZEdyYXBoaWMoZ3JhcGhpYywgbGF5ZXIpKSBjb250aW51ZTtcbiAgICAgIGlmIChcbiAgICAgICAgcmVzdHJpY3RUb1ByZWZlcnJlZCAmJlxuICAgICAgICAhcHJlZmVycmVkTGF5ZXJzLnNvbWUoKEwpID0+IHRoaXMubGF5ZXJLZXlzTWF0Y2goTCwgbGF5ZXIpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnZW9tVHlwZSA9IFN0cmluZyhncmFwaGljLmdlb21ldHJ5Py50eXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBpc1BvbHlnb25MaWtlID1cbiAgICAgICAgIWdlb21UeXBlIHx8IGdlb21UeXBlID09PSBcInBvbHlnb25cIiB8fCBnZW9tVHlwZSA9PT0gXCJtdWx0aXBvbHlnb25cIjtcbiAgICAgIGNvbnN0IGhhc0F0dHJpYnV0ZXMgPVxuICAgICAgICAhIWdyYXBoaWMuYXR0cmlidXRlcyAmJiBPYmplY3Qua2V5cyhncmFwaGljLmF0dHJpYnV0ZXMpLmxlbmd0aCA+IDA7XG5cbiAgICAgIGlmIChnZW9tVHlwZSAmJiAhaXNQb2x5Z29uTGlrZSkgY29udGludWU7XG4gICAgICBpZiAoIWhhc0F0dHJpYnV0ZXMgJiYgIWdyYXBoaWMuZ2VvbWV0cnkpIGNvbnRpbnVlO1xuXG4gICAgICBjYW5kaWRhdGVzLnB1c2goZ3JhcGhpYyk7XG4gICAgfVxuXG4gICAgaWYgKCFjYW5kaWRhdGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAocmVzdHJpY3RUb1ByZWZlcnJlZCkge1xuICAgICAgZm9yIChjb25zdCBncmFwaGljIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLnRvTGl2ZU1hcExheWVyKFxuICAgICAgICAgIGdldFF1ZXJ5YWJsZUxheWVyKGdyYXBoaWMubGF5ZXIpIHx8IGdyYXBoaWMubGF5ZXIsXG4gICAgICAgICAgbWFwLFxuICAgICAgICApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbGF5ZXIgJiZcbiAgICAgICAgICBwcmVmZXJyZWRMYXllcnMuc29tZSgoTCkgPT4gdGhpcy5sYXllcktleXNNYXRjaChMLCBsYXllcikpICYmXG4gICAgICAgICAgKGxheWVyIGFzIGFueSkudmlzaWJsZSAhPT0gZmFsc2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIGdyYXBoaWM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZ3JhcGhpYyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICBjb25zdCBsYXllcjogYW55ID0gZ3JhcGhpYy5sYXllcjtcbiAgICAgIGlmIChsYXllcj8udmlzaWJsZSAhPT0gZmFsc2UpIHJldHVybiBncmFwaGljO1xuICAgIH1cblxuICAgIHJldHVybiBjYW5kaWRhdGVzWzBdO1xuICB9O1xuXG4gIHByaXZhdGUgaXNIaWdobGlnaHRMYXllcihsYXllcjogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWQgPSBTdHJpbmcobGF5ZXI/LmlkIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgdGl0bGUgPSBTdHJpbmcobGF5ZXI/LnRpdGxlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGlkID09PSBcImFncmktcG9seWdvbi1oaWdobGlnaHRcIiB8fFxuICAgICAgdGl0bGUuaW5jbHVkZXMoXCJzZWxlY3RlZCBwb2x5Z29uIGhpZ2hsaWdodFwiKSB8fFxuICAgICAgdGl0bGUuaW5jbHVkZXMoXCJza2V0Y2hcIikgfHxcbiAgICAgIC8vIFZpbG95YXQvdHVtYW4gb3V0bGluZSArIGxhYmVsIGxheWVycyBzaXQgb24gdG9wIG9mIHRoZSBmaWVsZHM7IGFcbiAgICAgIC8vIGhpdFRlc3QgcmV0dXJucyB0aGVpciBwb2x5Z29uIGZpcnN0IGFuZCBpdCBoYXMgbm8gdW5pcXVlaWQuXG4gICAgICBpc0FncmlBZG1pbkJvdW5kYXJ5TGF5ZXIobGF5ZXIpO1xuICB9XG5cbiAgLyoqIEEgc3VibGF5ZXIgaXMgY2xpY2thYmxlIG9ubHkgd2hlbiBpdCBhbmQgZXZlcnkgcGFyZW50IGFyZSB2aXNpYmxlLiAqL1xuICBwcml2YXRlIGlzTGF5ZXJFZmZlY3RpdmVseVZpc2libGUoXG4gICAgbGF5ZXI6IGFueSxcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmICghbGF5ZXIgfHwgdGhpcy5pc0hpZ2hsaWdodExheWVyKGxheWVyKSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PGFueT4oKTtcbiAgICBsZXQgY3VycmVudDogYW55ID0gbGF5ZXI7XG4gICAgd2hpbGUgKGN1cnJlbnQgJiYgIXNlZW4uaGFzKGN1cnJlbnQpKSB7XG4gICAgICBzZWVuLmFkZChjdXJyZW50KTtcbiAgICAgIGlmIChjdXJyZW50LnZpc2libGUgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQgfHwgY3VycmVudC5sYXllciB8fCBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzY2FsZSA9IE51bWJlcigodmlldyBhcyBhbnkpPy5zY2FsZSB8fCAwKTtcbiAgICBjb25zdCBtaW5TY2FsZSA9IE51bWJlcihsYXllci5taW5TY2FsZSB8fCAwKTtcbiAgICBjb25zdCBtYXhTY2FsZSA9IE51bWJlcihsYXllci5tYXhTY2FsZSB8fCAwKTtcbiAgICBpZiAoc2NhbGUgPiAwICYmIG1pblNjYWxlID4gMCAmJiBzY2FsZSA+IG1pblNjYWxlKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHNjYWxlID4gMCAmJiBtYXhTY2FsZSA+IDAgJiYgc2NhbGUgPCBtYXhTY2FsZSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBTdHJpbmcobGF5ZXIuZGVmaW5pdGlvbkV4cHJlc3Npb24gfHwgXCIxPTFcIikudHJpbSgpICE9PSBcIjE9MFwiO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0FncmljdWx0dXJhbEZpZWxkTGF5ZXIobGF5ZXI6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmICghbGF5ZXIpIHJldHVybiBmYWxzZTtcbiAgICAvLyBHcm91cCBMYXllciBmb2xkZXJzIGFyZSBub3QgZmllbGQgcG9seWdvbnMg4oCUIG5ldmVyIGFjY2VwdCB0aGVtIGZvciBjbGljay5cbiAgICBpZiAoaXNNYXBJbWFnZUdyb3VwU3VibGF5ZXIobGF5ZXIpKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gXCJBZ3JpIGRpc3RyaWN0IGJvcmRlcnNcIiAvIFR1bWFuX2NoZWdhcmEgb3V0bGluZXMgbWF0Y2ggdGhlIFxcYmFncmlcXGJcbiAgICAvLyBoZXVyaXN0aWMgYmVsb3cgYnV0IGFyZSBhZG1pbmlzdHJhdGl2ZSBwb2x5Z29ucywgbm90IGZpZWxkcy5cbiAgICBpZiAoaXNBZ3JpQWRtaW5Cb3VuZGFyeUxheWVyKGxheWVyKSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIFByZWZlciBxdWVyeWFibGUgbGF5ZXJzLCBidXQgdGl0bGUvdXJsIGlkZW50aXR5IGlzIGVub3VnaCB0byBhY2NlcHQgYVxuICAgIC8vIGxpdmUgTWFwSW1hZ2UgbGVhZiB0aGF0IGlzIHN0aWxsIGh5ZHJhdGluZyBpdHMgcXVlcnkgbWV0aG9kcy5cbiAgICBjb25zdCBpZGVudGl0eSA9IGAke2xheWVyLnRpdGxlIHx8IFwiXCJ9ICR7bGF5ZXIudXJsIHx8IFwiXCJ9ICR7bGF5ZXIucGFyZW50Py50aXRsZSB8fCBcIlwifWAudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBsb29rc0FncmkgPSAvXFxiYWdyaVxcYnxhZ3JpY3VsdHVyZXxxaXNobG9xLy50ZXN0KGlkZW50aXR5KTtcbiAgICBpZiAoIWlzUXVlcnlhYmxlRmllbGRMYXllcihsYXllcikgJiYgIWxvb2tzQWdyaSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGdlb21ldHJ5VHlwZSA9IFN0cmluZyhsYXllci5nZW9tZXRyeVR5cGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoZ2VvbWV0cnlUeXBlICYmIGdlb21ldHJ5VHlwZSAhPT0gXCJwb2x5Z29uXCIpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBmaWVsZHM6IGFueVtdID0gQXJyYXkuaXNBcnJheShsYXllci5maWVsZHMpID8gbGF5ZXIuZmllbGRzIDogW107XG4gICAgY29uc3QgbmFtZXMgPSBuZXcgU2V0KGZpZWxkcy5tYXAoKGZpZWxkKSA9PiBTdHJpbmcoZmllbGQ/Lm5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKSkpO1xuICAgIGlmIChuYW1lcy5oYXMoXCJ1bmlxdWVpZFwiKSB8fCBuYW1lcy5oYXMoXCJjcm9wX2lkXCIpIHx8IG5hbWVzLmhhcyhcInR1cmlcIikpIHJldHVybiB0cnVlO1xuICAgIC8vIGxvb2tzQWdyaSBhbG9uZSBpcyBPSyBmb3IgYSBoeWRyYXRpbmcgbGVhZjsgZ3JvdXBzIGFscmVhZHkgcmVqZWN0ZWQgYWJvdmUuXG4gICAgcmV0dXJuIGxvb2tzQWdyaTtcbiAgfVxuXG4gIHByaXZhdGUgaXNBZ3JpY3VsdHVyYWxGaWVsZEdyYXBoaWMoZ3JhcGhpYzogX19lc3JpLkdyYXBoaWMsIGxheWVyOiBhbnkpOiBib29sZWFuIHtcbiAgICBjb25zdCBnZW9tZXRyeVR5cGUgPSBTdHJpbmcoZ3JhcGhpYz8uZ2VvbWV0cnk/LnR5cGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoZ2VvbWV0cnlUeXBlICYmIGdlb21ldHJ5VHlwZSAhPT0gXCJwb2x5Z29uXCIgJiYgZ2VvbWV0cnlUeXBlICE9PSBcIm11bHRpcG9seWdvblwiKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgYXR0cnMgPSBncmFwaGljPy5hdHRyaWJ1dGVzIHx8IHt9O1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKGF0dHJzKS5tYXAoKGtleSkgPT4ga2V5LnRvTG93ZXJDYXNlKCkpKTtcbiAgICByZXR1cm4ga2V5cy5oYXMoXCJ1bmlxdWVpZFwiKSB8fCBrZXlzLmhhcyhcImNyb3BfaWRcIikgfHwga2V5cy5oYXMoXCJ0dXJpXCIpIHx8XG4gICAgICB0aGlzLmlzQWdyaWN1bHR1cmFsRmllbGRMYXllcihsYXllcik7XG4gIH1cbiAgcHJpdmF0ZSBnZXRDbGlja1RhcmdldExheWVycyhcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICk6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSB7XG4gICAgY29uc3QgeyBmZWF0dXJlTGF5ZXJzLCBsYXllcktleVRvRHNJZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBkc0tleXMgPSBPYmplY3Qua2V5cyhsYXllcktleVRvRHNJZCB8fCB7fSk7XG4gICAgY29uc3QgbWFwID0gdmlldy5tYXA7XG4gICAgY29uc3QgY29uZmlndXJlZExheWVycyA9IGZlYXR1cmVMYXllcnMgfHwgW107XG4gICAgY29uc3QgbGl2ZVJvb3RzID1cbiAgICAgICgobWFwIGFzIGFueSk/LmFsbExheWVycz8udG9BcnJheT8uKCkgYXMgYW55W10pIHx8IFtdO1xuICAgIC8vIE1hcEltYWdlIHBhcmVudHMgYXJlIG5vdCBxdWVyeWFibGUg4oCUIGV4cGFuZCB0byBhZ3JpL2ZlYXR1cmUgc3VibGF5ZXJzLlxuICAgIGNvbnN0IGxpdmVNYXBMYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBwdXNoTGl2ZSA9IChsYXllcjogYW55KSA9PiB7XG4gICAgICBpZiAoIWxheWVyIHx8ICFpc1F1ZXJ5YWJsZUZpZWxkTGF5ZXIobGF5ZXIpKSByZXR1cm47XG4gICAgICBjb25zdCBrZXkgPVxuICAgICAgICBnZXRBZ3JpTGF5ZXJNYXBLZXkobGF5ZXIpIHx8XG4gICAgICAgIFN0cmluZyhsYXllci51cmwgfHwgbGF5ZXIuaWQgfHwgXCJcIik7XG4gICAgICBpZiAoIWtleSB8fCBzZWVuLmhhcyhrZXkpKSByZXR1cm47XG4gICAgICBzZWVuLmFkZChrZXkpO1xuICAgICAgbGl2ZU1hcExheWVycy5wdXNoKGxheWVyIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXIpO1xuICAgIH07XG4gICAgZm9yIChjb25zdCByb290IG9mIGxpdmVSb290cykge1xuICAgICAgLy8gV2FsayBncm91cHMgZnVsbHkg4oCUIG5ldmVyIHB1c2ggdGhlIEdyb3VwIExheWVyIG5vZGUgaXRzZWxmXG4gICAgICAvLyAoRmVhdHVyZUxheWVyI2xvYWQgZmFpbHMgd2l0aCB1bnN1cHBvcnRlZC10eXBlIFwiR3JvdXAgTGF5ZXJcIikuXG4gICAgICBmb3IgKGNvbnN0IGxlYWYgb2YgY29sbGVjdFF1ZXJ5YWJsZUZpZWxkTGF5ZXJzKHJvb3QpKSB7XG4gICAgICAgIHB1c2hMaXZlKGxlYWYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBBcnJheS5mcm9tKFxuICAgICAgbmV3IFNldDxfX2VzcmkuRmVhdHVyZUxheWVyPihbXG4gICAgICAgIC4uLmNvbmZpZ3VyZWRMYXllcnMsXG4gICAgICAgIC4uLmxpdmVNYXBMYXllcnMsXG4gICAgICBdKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcbiAgICAgIC5tYXAoKGxheWVyKSA9PiB0aGlzLnRvTGl2ZU1hcExheWVyKGxheWVyLCBtYXApIHx8IGxheWVyKVxuICAgICAgLmZpbHRlcigobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNMYXllckVmZmVjdGl2ZWx5VmlzaWJsZShsYXllciwgdmlldykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCF0aGlzLmlzQWdyaWN1bHR1cmFsRmllbGRMYXllcihsYXllcikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3Qga2V5ID1cbiAgICAgICAgICBnZXRBZ3JpTGF5ZXJNYXBLZXkobGF5ZXIpIHx8XG4gICAgICAgICAgU3RyaW5nKGxheWVyLnVybCB8fCBsYXllci5pZCB8fCBcIlwiKTtcbiAgICAgICAgaWYgKHRoaXMuaXNEYXNoYm9hcmRFbWJlZGRlZCgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCFkc0tleXMubGVuZ3RoKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuICEhbGF5ZXJLZXlUb0RzSWRba2V5XTtcbiAgICAgIH0pIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXJbXTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVzb2x2ZUNsaWNrTGF5ZXJzKFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgICBqbXY6IEppbXVNYXBWaWV3LFxuICApOiBQcm9taXNlPF9fZXNyaS5GZWF0dXJlTGF5ZXJbXT4ge1xuICAgIGxldCBsYXllcnMgPSB0aGlzLmdldENsaWNrVGFyZ2V0TGF5ZXJzKHZpZXcpO1xuICAgIGlmIChsYXllcnMubGVuZ3RoKSByZXR1cm4gbGF5ZXJzO1xuXG4gICAgYXdhaXQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbihqbXYpO1xuICAgIGxheWVycyA9IHRoaXMuZ2V0Q2xpY2tUYXJnZXRMYXllcnModmlldyk7XG4gICAgaWYgKGxheWVycy5sZW5ndGgpIHJldHVybiBsYXllcnM7XG5cbiAgICAvLyBMYXN0IHJlc29ydDogc2NhbiBtYXAgYWdhaW4gYWZ0ZXIgbGF5ZXJzIG1heSBoYXZlIGZpbmlzaGVkIGxvYWRpbmdcbiAgICAvLyAocG9ydGFsIC8gTWFwSW1hZ2Ugc3VibGF5ZXJzIG9mdGVuIGFyZW4ndCBxdWVyeWFibGUgYXQgZmlyc3QgY29ubmVjdCkuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcExheWVycyA9IGdldEFsbEZlYXR1cmVMYXllcnNGcm9tTWFwKHZpZXcubWFwKTtcbiAgICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbWFwTGF5ZXJzKSB7XG4gICAgICAgIGF3YWl0IHNhZmVMb2FkTWFwTGF5ZXIobGF5ZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldENsaWNrVGFyZ2V0TGF5ZXJzKHZpZXcpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlQ2xpY2tGZWF0dXJlQXQgPSBhc3luYyAoXG4gICAgZXY6IF9fZXNyaS5WaWV3Q2xpY2tFdmVudCxcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICAgbGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW10sXG4gICk6IFByb21pc2U8e1xuICAgIGdyYXBoaWM6IF9fZXNyaS5HcmFwaGljO1xuICAgIHF1ZXJ5SGl0TGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBudWxsO1xuICB9IHwgbnVsbD4gPT4ge1xuICAgIGNvbnN0IGNsaWNrU2NyZWVuUG9pbnQgPSB7IHg6IGV2LngsIHk6IGV2LnkgfTtcbiAgICBjb25zdCBxdWVyeUdlb21ldHJ5ID0gdGhpcy50b0NsaWNrUXVlcnlHZW9tZXRyeShcbiAgICAgIHZpZXcsXG4gICAgICBjbGlja1NjcmVlblBvaW50LFxuICAgICAgZXYubWFwUG9pbnQsXG4gICAgKTtcblxuICAgIGNvbnN0IHF1ZXJ5TGF5ZXJzID1cbiAgICAgIGxheWVycy5sZW5ndGggPiAwXG4gICAgICAgID8gbGF5ZXJzXG4gICAgICAgIDogKHRoaXMuZ2V0Q2xpY2tUYXJnZXRMYXllcnModmlldykgYXMgX19lc3JpLkZlYXR1cmVMYXllcltdKTtcblxuICAgIC8vIGhpdFRlc3QgLyBpZGVudGlmeSBjYW4gcmVoeWRyYXRlIE1hcEltYWdlIHN1YmxheWVycyBhbmQgY2xlYXIgdGhlaXJcbiAgICAvLyBydW50aW1lIGRlZmluaXRpb25FeHByZXNzaW9uIChkaXN0cmljdCBmaWx0ZXIpIOKAlCBzbmFwc2hvdCBldmVyeSBjbGlja1xuICAgIC8vIGNhbmRpZGF0ZSBub3cgYW5kIHJlc3RvcmUgYW55IGRyaWZ0IHN5bmNocm9ub3VzbHkgYWZ0ZXJ3YXJkcywgYmVmb3JlXG4gICAgLy8gYW4gdW5maWx0ZXJlZCBleHBvcnQgZ2V0cyBwYWludGVkIChvdGhlci1kaXN0cmljdCBmaWVsZHMgZmxhc2gpLlxuICAgIGNvbnN0IGRlZmluaXRpb25TbmFwc2hvdCA9IHRoaXMuc25hcHNob3REZWZpbml0aW9uRXhwcmVzc2lvbnMoW1xuICAgICAgLi4ubGF5ZXJzLFxuICAgICAgLi4ucXVlcnlMYXllcnMsXG4gICAgXSk7XG5cbiAgICAvLyBBbHdheXMgaGl0LXRlc3QgdGhlIHJlbmRlcmVkIG1hcCB3aXRob3V0IGFuIGluY2x1ZGUgcmVzdHJpY3Rpb24uIE1hcC1pbWFnZVxuICAgIC8vIHN1YmxheWVycyBmcmVxdWVudGx5IGhhdmUgcnVudGltZSBpZHMvVVJMcyB0aGF0IGRpZmZlciBmcm9tIGNvbmZpZ3VyZWQgRFNcbiAgICAvLyB3cmFwcGVyczsgcmVzdHJpY3RpbmcgaW5jbHVkZS9wcmVmZXJyZWQgbGF5ZXJzIG1ha2VzIHZpc2libGUgZmllbGRzIHVuY2xpY2thYmxlLlxuICAgIGNvbnN0IGhpdCA9IGF3YWl0IHZpZXcuaGl0VGVzdChldik7XG4gICAgdGhpcy5yZXN0b3JlRHJpZnRlZERlZmluaXRpb25FeHByZXNzaW9ucyhkZWZpbml0aW9uU25hcHNob3QpO1xuICAgIC8vIE9ubHkgYWNjZXB0IGdyYXBoaWNzIGJlbG9uZ2luZyB0byB0aGUgY29uZmlndXJlZCBhZ3JpY3VsdHVyYWwgbGF5ZXJzLlxuICAgIC8vIFdlYk1hcCBza2V0Y2gvbWFwLW5vdGVzIGdyYXBoaWNzIGNhbiBjb250YWluIHBhZ2Utc2l6ZWQgcG9seWdvbnM7IHRyZWF0aW5nXG4gICAgLy8gb25lIGFzIGEgZmllbGQgbWFrZXMgZ29UbyB6b29tIG91dCB0byBhIHdvcmxkIGV4dGVudC5cbiAgICAvLyBFbXB0eSBgbGF5ZXJzYCBzdGlsbCBhbGxvd3MgYWdyaWN1bHR1cmFsIGhpdHMgKG5vIHByZWZlcnJlZCByZXN0cmljdGlvbikuXG4gICAgbGV0IGcgPSB0aGlzLnBpY2tDbGlja0dyYXBoaWMoaGl0LCBsYXllcnMpO1xuICAgIGxldCBxdWVyeUhpdExheWVyOiBfX2VzcmkuRmVhdHVyZUxheWVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBpZiAoIWcgJiYgcXVlcnlHZW9tZXRyeSAmJiBxdWVyeUxheWVycy5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgcXVlcnlMYXllcnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTGF5ZXJFZmZlY3RpdmVseVZpc2libGUobGF5ZXIsIHZpZXcpKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCF0aGlzLmlzQWdyaWN1bHR1cmFsRmllbGRMYXllcihsYXllcikpIGNvbnRpbnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIE5FVkVSIHF1ZXJ5IHRoZSBsaXZlIGxheWVyIGhlcmU6IG9uIGEgTWFwSW1hZ2Ugc3VibGF5ZXIgdGhhdFxuICAgICAgICAgIC8vIHJlaHlkcmF0ZXMgaXQgYW5kIGNsZWFycyB0aGUgdHVtYW4gZGVmaW5pdGlvbkV4cHJlc3Npb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG1hcCBicmllZmx5IGV4cG9ydHMvcGFpbnRzIGV2ZXJ5IGRpc3RyaWN0J3MgZmllbGRzIHdoaWxlIHRoZVxuICAgICAgICAgIC8vIHBvcHVwIHpvb20gcnVucy4gVXNlIHRoZSBkZXRhY2hlZCBvZmYtbWFwIGNsaWVudCBpbnN0ZWFkIGFuZFxuICAgICAgICAgIC8vIG1pcnJvciB0aGUgbGl2ZSBmaWx0ZXIgb250byB0aGUgcXVlcnkgV0hFUkUuXG4gICAgICAgICAgY29uc3QgbGl2ZVdoZXJlID0gU3RyaW5nKFxuICAgICAgICAgICAgKGxheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gfHwgXCJcIixcbiAgICAgICAgICApLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCBkZXRhY2hlZCA9IGF3YWl0IHRoaXMuZ2V0RGV0YWNoZWRRdWVyeUxheWVyKGxheWVyKTtcbiAgICAgICAgICBjb25zdCBxdWVyeVRhcmdldCA9IGRldGFjaGVkIHx8IGxheWVyO1xuICAgICAgICAgIGNvbnN0IHEgPSBxdWVyeVRhcmdldC5jcmVhdGVRdWVyeSgpO1xuICAgICAgICAgIHEuZ2VvbWV0cnkgPSBxdWVyeUdlb21ldHJ5O1xuICAgICAgICAgIHEuc3BhdGlhbFJlbGF0aW9uc2hpcCA9IFwiaW50ZXJzZWN0c1wiO1xuICAgICAgICAgIHEub3V0RmllbGRzID0gW1wiKlwiXTtcbiAgICAgICAgICBxLnJldHVybkdlb21ldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICBxLm51bSA9IDE7XG4gICAgICAgICAgaWYgKGxpdmVXaGVyZSAmJiBsaXZlV2hlcmUgIT09IFwiMT0xXCIpIHEud2hlcmUgPSBsaXZlV2hlcmU7XG4gICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgcXVlcnlUYXJnZXQucXVlcnlGZWF0dXJlcyhxKTtcbiAgICAgICAgICBpZiAoIWRldGFjaGVkKSB7XG4gICAgICAgICAgICAvLyBMaXZlLWxheWVyIGZhbGxiYWNrIChubyBVUkwpIOKAlCByZXBhaXIgYW55IGRyaWZ0IGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlRHJpZnRlZERlZmluaXRpb25FeHByZXNzaW9ucyhkZWZpbml0aW9uU25hcHNob3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzLmZlYXR1cmVzPy5bMF0pIHtcbiAgICAgICAgICAgIGcgPSByZXMuZmVhdHVyZXNbMF07XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBMSVZFIGxheWVyIGFzIHRoZSBoaXQgbGF5ZXIg4oCUIGRvd25zdHJlYW0gbGF5ZXIta2V5IC9cbiAgICAgICAgICAgIC8vIGRzSWQgLyBhbGlhcyByZXNvbHV0aW9uIG11c3QgbWFwIGJhY2sgdG8gdGhlIG1hcCdzIG93biBsYXllci5cbiAgICAgICAgICAgIHF1ZXJ5SGl0TGF5ZXIgPSBsYXllcjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLyogdHJ5IG5leHQgbGF5ZXIgKi9cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZykgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHsgZ3JhcGhpYzogZywgcXVlcnlIaXRMYXllciB9O1xuICB9O1xuXG4gIC8qKiBDYXNlLWluc2Vuc2l0aXZlIGF0dHJpYnV0ZSBsb29rdXAg4oCUIHRoZSBwb2x5Z29uIGxheWVyJ3Mgam9pbiBmaWVsZCBjYXNpbmcgaXMgbm90IGd1YXJhbnRlZWQuICovXG4gIHByaXZhdGUgZmluZEF0dHJpYnV0ZVZhbHVlQ2FzZUluc2Vuc2l0aXZlKFxuICAgIGF0dHJpYnV0ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGZpZWxkTmFtZTogc3RyaW5nLFxuICApOiBhbnkge1xuICAgIHJldHVybiBmaW5kQXR0cmlidXRlVmFsdWVDYXNlSW5zZW5zaXRpdmVTaGFyZWQoYXR0cmlidXRlcywgZmllbGROYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZWxscyBBZ3JpR3JhZmYxMCAodmlhIEFncmlMb2NhbGl6YXRpb24sIHRoZSBjZW50cmFsIGZpbHRlciBodWIpIHdoaWNoXG4gICAqIHBvbHlnb24gaXMgY3VycmVudGx5IGluc3BlY3RlZCBzbyBpdHMgY2hhcnQgY2FuIHN3aXRjaCB0byBzaG93aW5nIHRoYXRcbiAgICogc2luZ2xlIHBvbHlnb24ncyB2ZWdldGF0aW9uLWluZGV4IHNlcmllcyBpbnN0ZWFkIG9mIHRoZSByZWdpb24td2lkZVxuICAgKiB0aW1lc2VyaWVzLiBNaXJyb3JzIHRoZSB3aWRnZXRTZWxlY3Rpb25DaGFuZ2VkIHNoYXBlIEFncmlHcmFmZldpZGdldFxuICAgKiBpdHNlbGYgYWxyZWFkeSBkaXNwYXRjaGVzIG9uIGl0cyBvd24gcm93LWNsaWNrIHNlbGVjdGlvbi5cbiAgICovXG4gIHByaXZhdGUgbm90aWZ5R3JhZmZQb2x5Z29uU2VsZWN0aW9uID0gKFxuICAgIHVuaXF1ZWlkOiBzdHJpbmcsXG4gICAgcG9seWdvbk1vZGU6IGJvb2xlYW4sXG4gICAgY2xpY2tlZEF0PzogbnVtYmVyLFxuICApOiB2b2lkID0+IHtcbiAgICB0cnkge1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwid2lkZ2V0U2VsZWN0aW9uQ2hhbmdlZFwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBzb3VyY2U6IFwiQWdyaVBvcHVwXCIsXG4gICAgICAgICAgICBwb2x5Z29uTW9kZSxcbiAgICAgICAgICAgIHVuaXF1ZWlkOiBwb2x5Z29uTW9kZSA/IHVuaXF1ZWlkIDogXCJcIixcbiAgICAgICAgICAgIC8vIFRpbWVzdGFtcCBvZiB0aGUgT1JJR0lOQUwgbWFwIGNsaWNrIChjYXB0dXJlZCBiZWZvcmUgdGhpc1xuICAgICAgICAgICAgLy8gd2lkZ2V0J3Mgb3duIGFzeW5jIGF0dHJpYnV0ZS1yZXNvbHV0aW9uIGNoYWluKSwgbm90IG9mIHRoaXNcbiAgICAgICAgICAgIC8vIGRpc3BhdGNoIOKAlCBsZXRzIGRvd25zdHJlYW0gbGlzdGVuZXJzIChBZ3JpR3JhZmYxMCkgZGV0ZWN0IGFuZFxuICAgICAgICAgICAgLy8gaWdub3JlIGEgc3RhbGUgbm90aWZpY2F0aW9uIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgYSBuZXdlciBjbGlja1xuICAgICAgICAgICAgLy8gd2FzIGFscmVhZHkgYXBwbGllZCAoc2VlIEFncmlHcmFmZjEwJ3MgX2xhc3RBcHBsaWVkUG9seWdvbkNsaWNrZWRBdCkuXG4gICAgICAgICAgICBjbGlja2VkQXQ6IGNsaWNrZWRBdCA/PyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgYnJvYWRjYXN0UG9wdXBWaXNpYmlsaXR5ID0gKG9wZW46IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICBjb25zdCBwaW5uZWQgPSAhIXRoaXMuc3RhdGUucGluVG9Db3JuZXI7XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmlNYXBQb3B1cFZpc2liaWxpdHlcIiwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgb3BlbjogISFvcGVuLFxuICAgICAgICAgICAgcGlubmVkLFxuICAgICAgICAgICAgc291cmNlOiBcIkFncmlQb3B1cFwiLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICAgIGlmIChvcGVuKSB7XG4gICAgICAvLyBSZS1ub3RpZnkgYWZ0ZXIgcGFpbnQgc28gTkRWSSBjYW4gbWVhc3VyZSB0aGUgcmVhbCBwb3B1cCBib3guXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJhZ3JpTWFwUG9wdXBWaXNpYmlsaXR5XCIsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwaW5uZWQsXG4gICAgICAgICAgICAgICAgbGF5b3V0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogXCJBZ3JpUG9wdXBcIixcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvKiBpZ25vcmUgKi9cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFZFR19JTkRFWF9GSUVMRFMgPSBbLi4uR1JBRkZfSU5ERVhfT1JERVJdO1xuXG4gIC8qKlxuICAgKiBMYXRlc3QtZGF5IHZlZ2V0YXRpb24gaW5kZXggdmFsdWVzIGZvciB0aGUgc2VsZWN0ZWQgcG9seWdvbiwgc2hvd24gaW5cbiAgICogdGhlIHBvcHVwLiBSZXVzZXMgcXVlcnlWZWdldGF0aW9uU2VyaWVzRm9yVW5pcXVlSWQgKHF1ZXJpZXMgdGhlXG4gICAqIGFncmlfdmVnZXRhdGlvbl9pbmRpY2VzIEFyY0dJUyB0YWJsZSBkaXJlY3RseSwgc2FtZSBzb3VyY2UgQWdyaUdyYWZmMTAnc1xuICAgKiBjaGFydCB1c2VzKSByYXRoZXIgdGhhbiB0aGUgYXBpLWFncmkgZXhwb3J0LWltYWdlL2F2YWlsYWJsZS1kYXRlcyBSRVNUXG4gICAqIGVuZHBvaW50cyDigJQgdGhvc2UgYXJlIGZvciBmZXRjaGluZyBhIHJlbmRlcmVkIHJhc3RlciBmb3IgYSBzcGVjaWZpY1xuICAgKiBjaG9zZW4gZGF0ZSwgd2hpY2ggaXMgdW5uZWNlc3NhcnkgaGVyZTsgd2Ugb25seSBuZWVkIHRoZSBzY2FsYXIgaW5kZXhcbiAgICogdmFsdWVzIGZvciB3aGljaGV2ZXIgZGF0ZSBpcyBtb3N0IHJlY2VudCwgYW5kIHRoZSB0YWJsZSBhbHJlYWR5IGhhc1xuICAgKiBuZHZpL3NhdmkvcnZpL2NpL2V2aS9uZHdpIGFzIHBsYWluIGZpZWxkcyBwZXIgKHVuaXF1ZWlkLCByYXN0ZXJfZGF0ZSkuXG4gICAqL1xuICBwcml2YXRlIGZldGNoTGF0ZXN0VmVnZXRhdGlvbkluZGljZXMgPSBhc3luYyAoXG4gICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgaWQgPSBTdHJpbmcodW5pcXVlSWQgfHwgXCJcIikudHJpbSgpO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nTGF0ZXN0SW5kaWNlczogZmFsc2UsXG4gICAgICAgIGxhdGVzdEluZGV4RGF0ZTogbnVsbCxcbiAgICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IG51bGwsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMuX2xhdGVzdEluZGljZXNSZXF1ZXN0SWQ7XG4gICAgYWdyaU1hcENsaWNrRGVidWcoXCJ2ZWdldGF0aW9uOnJlcXVlc3RcIiwge1xuICAgICAgdW5pcXVlaWQ6IGlkLFxuICAgICAgc291cmNlOiBcImFncmlfdmVnZXRhdGlvbl9pbmRpY2VzL0ZlYXR1cmVTZXJ2ZXIvMVwiLFxuICAgICAgcmVxdWVzdElkLFxuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9hZGluZ0xhdGVzdEluZGljZXM6IHRydWUsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgcm93cyA9IGF3YWl0IHF1ZXJ5VmVnZXRhdGlvblNlcmllc0ZvclVuaXF1ZUlkKGlkKTtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8IHJlcXVlc3RJZCAhPT0gdGhpcy5fbGF0ZXN0SW5kaWNlc1JlcXVlc3RJZCkgcmV0dXJuO1xuXG4gICAgICBpZiAoIXJvd3MubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiBmYWxzZSxcbiAgICAgICAgICBsYXRlc3RJbmRleERhdGU6IG51bGwsXG4gICAgICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFJvd3MgY29tZSBiYWNrIG9yZGVyZWQgYnkgcmFzdGVyX2RhdGUgQVNDIOKAlCB0aGUgbGFzdCBvbmUgaXMgdGhlXG4gICAgICAvLyBtb3N0IHJlY2VudCBwcm9jZXNzZWQgZGF0ZSBmb3IgdGhpcyBwb2x5Z29uLlxuICAgICAgY29uc3QgbGF0ZXN0ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdIGFzIFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgICBjb25zdCBkYXRlID0gZm9ybWF0QXJjZ2lzRGF0ZVRvWW1kKGxhdGVzdC5yYXN0ZXJfZGF0ZSk7XG4gICAgICBjb25zdCB2YWx1ZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgQWdyaVBvbHlnb24uVkVHX0lOREVYX0ZJRUxEUykge1xuICAgICAgICBjb25zdCB2ID0gTnVtYmVyKGxhdGVzdFtmaWVsZF0pO1xuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHYpKSB2YWx1ZXNbZmllbGRdID0gdjtcbiAgICAgIH1cbiAgICAgIGFncmlNYXBDbGlja0RlYnVnKFwidmVnZXRhdGlvbjpyZXNwb25zZVwiLCB7XG4gICAgICAgIHVuaXF1ZWlkOiBpZCxcbiAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICByb3dDb3VudDogcm93cy5sZW5ndGgsXG4gICAgICAgIGxhdGVzdERhdGU6IGRhdGUsXG4gICAgICAgIHZhbHVlcyxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZ0xhdGVzdEluZGljZXM6IGZhbHNlLFxuICAgICAgICBsYXRlc3RJbmRleERhdGU6IGRhdGUsXG4gICAgICAgIGxhdGVzdEluZGV4VmFsdWVzOiBPYmplY3Qua2V5cyh2YWx1ZXMpLmxlbmd0aCA/IHZhbHVlcyA6IG51bGwsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8IHJlcXVlc3RJZCAhPT0gdGhpcy5fbGF0ZXN0SW5kaWNlc1JlcXVlc3RJZCkgcmV0dXJuO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiBmYWxzZSxcbiAgICAgICAgbGF0ZXN0SW5kZXhEYXRlOiBudWxsLFxuICAgICAgICBsYXRlc3RJbmRleFZhbHVlczogbnVsbCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQWdyaV90YWJsZV9kYXRhIGlzIGFuIGV4dGVybmFsIFRhYmxlIChubyBnZW9tZXRyeSkg4oCUIHRoZSBtYXAgY2xpY2sgc3RpbGxcbiAgICogcmVzb2x2ZXMgdGhlIHBvbHlnb24gZmVhdHVyZSBmb3IgaGlnaGxpZ2h0L3pvb20sIGJ1dCB0aGUgZGlzcGxheWVkXG4gICAqIGF0dHJpYnV0ZXMgY29tZSBmcm9tIEFncmlfdGFibGVfZGF0YSwgam9pbmVkIGJ5IHVuaXF1ZWlkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyByZXNvbHZlRGlzcGxheUF0dHJzKFxuICAgIHBvbHlnb25BdHRyaWJ1dGVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG4gICAgY29uc3Qgam9pblZhbHVlID0gdGhpcy5maW5kQXR0cmlidXRlVmFsdWVDYXNlSW5zZW5zaXRpdmUoXG4gICAgICBwb2x5Z29uQXR0cmlidXRlcyxcbiAgICAgIEFHUklfVEFCTEVfSk9JTl9GSUVMRCxcbiAgICApO1xuICAgIGlmIChqb2luVmFsdWUgPT0gbnVsbCB8fCBTdHJpbmcoam9pblZhbHVlKS50cmltKCkgPT09IFwiXCIpIHtcbiAgICAgIGFncmlNYXBDbGlja1dhcm4oXCJhZ3JpLXRhYmxlLWpvaW46U0tJUC1uby11bmlxdWVpZFwiLCB7XG4gICAgICAgIHBvbHlnb25BdHRyaWJ1dGVLZXlzOiBPYmplY3Qua2V5cyhwb2x5Z29uQXR0cmlidXRlcyB8fCB7fSksXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwb2x5Z29uQXR0cmlidXRlcyB8fCB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGFncmlNYXBDbGlja0RlYnVnKFwiYWdyaS10YWJsZS1qb2luOnJlcXVlc3RcIiwge1xuICAgICAgICB1bmlxdWVpZDogU3RyaW5nKGpvaW5WYWx1ZSksXG4gICAgICAgIHNvdXJjZTogXCJBZ3JpX3RhYmxlX2RhdGEvRmVhdHVyZVNlcnZlci8yXCIsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGFncmlSZWNvcmQgPSBhd2FpdCBxdWVyeUFncmlSZWNvcmRCeVVuaXF1ZUlkKFN0cmluZyhqb2luVmFsdWUpKTtcbiAgICAgIGFncmlNYXBDbGlja0RlYnVnKFwiYWdyaS10YWJsZS1qb2luOnJlc3BvbnNlXCIsIHtcbiAgICAgICAgdW5pcXVlaWQ6IFN0cmluZyhqb2luVmFsdWUpLFxuICAgICAgICBmb3VuZDogQm9vbGVhbihhZ3JpUmVjb3JkKSxcbiAgICAgICAgYXR0cmlidXRlS2V5czogT2JqZWN0LmtleXMoYWdyaVJlY29yZCB8fCB7fSksXG4gICAgICB9KTtcbiAgICAgIGlmIChhZ3JpUmVjb3JkKSB7XG4gICAgICAgIC8vIEtlZXAgcG9seWdvbi1vbmx5IHZhbHVlcyAoZm9yIGV4YW1wbGUgc3RfYXJlYShzaGFwZSkpIHdoaWxlIGFsbG93aW5nXG4gICAgICAgIC8vIHRoZSBqb2luZWQgQWdyaSB0YWJsZSB0byBwcm92aWRlL292ZXJyaWRlIHRoZSBwb3B1cCdzIGJ1c2luZXNzIGRhdGEuXG4gICAgICAgIHJldHVybiB7IC4uLihwb2x5Z29uQXR0cmlidXRlcyB8fCB7fSksIC4uLmFncmlSZWNvcmQgfTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBhZ3JpTWFwQ2xpY2tXYXJuKFwiQWdyaV90YWJsZV9kYXRhIGxvb2t1cCBmYWlsZWRcIiwge1xuICAgICAgICB1bmlxdWVJZDogam9pblZhbHVlLFxuICAgICAgICBlcnJvcjogKGUgYXMgYW55KT8ubWVzc2FnZSB8fCBTdHJpbmcoZSksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBvbHlnb25BdHRyaWJ1dGVzIHx8IHt9O1xuICB9XG5cbiAgcHJpdmF0ZSBvblZpZXdDbGljayA9IGFzeW5jIChldjogX19lc3JpLlZpZXdDbGlja0V2ZW50KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmlQb2x5Z29uTWFwQ2xpY2tQaGFzZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHBoYXNlOiBcImNsaWNrLXN0YXJ0XCIsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9LFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBiZXN0LWVmZm9ydCBmaWx0ZXIgZ3VhcmQgKi9cbiAgICB9XG4gICAgLy8gQ2FwdHVyZWQgQkVGT1JFIGFueSBhd2FpdHMgYmVsb3cg4oCUIHRoaXMgd2lkZ2V0J3MgYXR0cmlidXRlLXJlc29sdXRpb25cbiAgICAvLyBjaGFpbiAocmVzb2x2ZUNsaWNrTGF5ZXJzL3Jlc29sdmVDbGlja0ZlYXR1cmVBdC9xdWVyeS9yZXNvbHZlRGlzcGxheUF0dHJzKVxuICAgIC8vIGNhbiB0YWtlIG5vdGljZWFibHkgbG9uZ2VyIHRoYW4gQWdyaUdyYWZmMTAncyBvd24sIG1vcmUgZGlyZWN0IG1hcC1jbGlja1xuICAgIC8vIGhhbmRsaW5nIG9mIHRoZSBzYW1lIGNsaWNrLiBJZiB0aGUgdXNlciBjbGlja3MgYSBzZWNvbmQgcG9seWdvbiBiZWZvcmVcbiAgICAvLyB0aGlzIGNoYWluIGZpbmlzaGVzLCB0aGUgc3RhbGUgcmVzdWx0IG11c3Qgbm90IHdpbiDigJQgY2xpY2tlZEF0IGxldHNcbiAgICAvLyBBZ3JpR3JhZmYxMCBkZXRlY3QgYW5kIGRyb3AgaXQuXG4gICAgY29uc3QgY2xpY2tTdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGNsaWNrR2VuZXJhdGlvbiA9ICsrdGhpcy5fY2xpY2tHZW5lcmF0aW9uO1xuICAgIGFncmlNYXBDbGlja0RlYnVnKFwiY2xpY2s6cmVjZWl2ZWRcIiwge1xuICAgICAgY2xpY2tHZW5lcmF0aW9uLFxuICAgICAgeDogZXYueCxcbiAgICAgIHk6IGV2LnksXG4gICAgICBtYXBQb2ludDogZXYubWFwUG9pbnRcbiAgICAgICAgPyB7XG4gICAgICAgICAgICB4OiBldi5tYXBQb2ludC54LFxuICAgICAgICAgICAgeTogZXYubWFwUG9pbnQueSxcbiAgICAgICAgICAgIHdraWQ6IGV2Lm1hcFBvaW50LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgbnVsbCxcbiAgICAgICAgICB9XG4gICAgICAgIDogbnVsbCxcbiAgICB9KTtcbiAgICBjb25zdCBpc1N0YWxlID0gKCkgPT5cbiAgICAgICF0aGlzLl9pc01vdW50ZWQgfHwgY2xpY2tHZW5lcmF0aW9uICE9PSB0aGlzLl9jbGlja0dlbmVyYXRpb247XG4gICAgbGV0IHBvcHVwT3BlbmVkRm9yVGhpc0NsaWNrID0gZmFsc2U7XG4gICAgY29uc3Qgam12ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldztcbiAgICBjb25zdCB2aWV3ID0gam12Py52aWV3O1xuICAgIGlmICghdmlldyB8fCAham12KSB7XG4gICAgICBhZ3JpTWFwQ2xpY2tXYXJuKFwib25WaWV3Q2xpY2sgU0tJUDogbm8gdmlldy9qbXZcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGF5ZXJzID0gYXdhaXQgdGhpcy5yZXNvbHZlQ2xpY2tMYXllcnModmlldywgam12KTtcbiAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG4gICAgYWdyaU1hcENsaWNrRGVidWcoXCJvblZpZXdDbGljayBzdGFydFwiLCB7XG4gICAgICBzY3JlZW46IHsgeDogZXYueCwgeTogZXYueSB9LFxuICAgICAgbGF5ZXJDb3VudDogbGF5ZXJzLmxlbmd0aCxcbiAgICAgIGxheWVyczogbGF5ZXJzLm1hcCgobCkgPT4gKHtcbiAgICAgICAgaWQ6IGwuaWQsXG4gICAgICAgIHRpdGxlOiBsLnRpdGxlLFxuICAgICAgICB1cmw6IGwudXJsLFxuICAgICAgfSkpLFxuICAgIH0pO1xuXG5cbiAgICBjb25zdCBjbGlja1NjcmVlblBvaW50ID0geyB4OiBldi54LCB5OiBldi55IH07XG4gICAgY29uc3QgaGl0UmVzdWx0ID0gYXdhaXQgdGhpcy5yZXNvbHZlQ2xpY2tGZWF0dXJlQXQoZXYsIHZpZXcsIGxheWVycyk7XG4gICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmlQb2x5Z29uTWFwQ2xpY2tQaGFzZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHBoYXNlOiBcImFmdGVyLWhpdC10ZXN0XCIsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9LFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBiZXN0LWVmZm9ydCBmaWx0ZXIgZ3VhcmQgKi9cbiAgICB9XG5cbiAgICBpZiAoIWhpdFJlc3VsdCkge1xuICAgICAgLy8gRW1wdHkgbWFwIGNsaWNrIHdoaWxlIGEgZmllbGQgcG9wdXAgaXMgb3BlbiA9IGRlc2VsZWN0IGFuZCByZXR1cm4gdG9cbiAgICAgIC8vIHRoZSBkaXN0cmljdC9yZWdpb24gZXh0ZW50IHNhdmVkIGJlZm9yZSB0aGUgZmllbGQgem9vbS5cbiAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCB0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJvblZpZXdDbGljazogY2xpY2sgb3V0c2lkZSDigJQgY2xvc2UgcG9wdXAgKyByZXN0b3JlIGV4dGVudFwiKTtcbiAgICAgICAgdGhpcy5jbG9zZVBvcHVwKHsgcmVzdG9yZUV4dGVudDogdHJ1ZSwgbm90aWZ5RGVzZWxlY3Q6IHRydWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcIm9uVmlld0NsaWNrOiBjbGljayBvdXRzaWRlIGZpZWxkIHBvbHlnb25zIOKAlCBpZ25vcmVkXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgZ3JhcGhpYzogZywgcXVlcnlIaXRMYXllciB9ID0gaGl0UmVzdWx0O1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgY2xpY2tTY3JlZW5Qb2ludCxcbiAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiB0cnVlLFxuICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IHRydWUsXG4gICAgICB9KTtcblxuICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJmaWVsZCBwb2x5Z29uIGhpdFwiLCB7XG4gICAgICAgIGxheWVySWQ6IChnIGFzIGFueSkubGF5ZXI/LmlkLFxuICAgICAgICBnZW9tZXRyeTogZy5nZW9tZXRyeT8udHlwZSB8fCBudWxsLFxuICAgICAgICBhdHRyS2V5czogZy5hdHRyaWJ1dGVzXG4gICAgICAgICAgPyBPYmplY3Qua2V5cyhnLmF0dHJpYnV0ZXMpLnNsaWNlKDAsIDgpXG4gICAgICAgICAgOiBbXSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBxdWVyeUZlYXR1cmVzIHJlc3VsdHMgaGF2ZSBubyBncmFwaGljLmxheWVyIOKAlCB1c2UgdGhlIGxheWVyIHdlIHF1ZXJpZWRcbiAgICAgIGNvbnN0IGNsaWNrZWRMYXllciA9IChcbiAgICAgICAgcXVlcnlIaXRMYXllclxuICAgICAgICAgID8gdGhpcy50b0xpdmVNYXBMYXllcihxdWVyeUhpdExheWVyLCB2aWV3Lm1hcCkgfHwgcXVlcnlIaXRMYXllclxuICAgICAgICAgIDogdGhpcy50b0xpdmVNYXBMYXllcihcbiAgICAgICAgICAgICAgZ2V0UXVlcnlhYmxlTGF5ZXIoKGcgYXMgYW55KS5sYXllcikgfHwgKGcgYXMgYW55KS5sYXllcixcbiAgICAgICAgICAgICAgdmlldy5tYXAsXG4gICAgICAgICAgICApXG4gICAgICApIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gICAgICBpZiAoIWNsaWNrZWRMYXllcikge1xuICAgICAgICBhZ3JpTWFwQ2xpY2tXYXJuKFwibm8gbGl2ZSBsYXllciBmb3IgaGl0IGdyYXBoaWNcIik7XG4gICAgICAgIGlmICghaXNTdGFsZSgpKSB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UsIHNob3dQb3B1cDogZmFsc2UgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxheWVyS2V5ID1cbiAgICAgICAgZ2V0QWdyaUxheWVyTWFwS2V5KGNsaWNrZWRMYXllcikgfHxcbiAgICAgICAgU3RyaW5nKGNsaWNrZWRMYXllcj8udXJsIHx8IGNsaWNrZWRMYXllcj8uaWQgfHwgXCJcIik7XG4gICAgICBjb25zdCBkc0lkID0gdGhpcy5zdGF0ZS5sYXllcktleVRvRHNJZD8uW2xheWVyS2V5XSB8fCBudWxsO1xuICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJsYXllcjpyZXNvbHZlZFwiLCB7XG4gICAgICAgIHRpdGxlOiBjbGlja2VkTGF5ZXIudGl0bGUsXG4gICAgICAgIGlkOiBjbGlja2VkTGF5ZXIuaWQsXG4gICAgICAgIHVybDogY2xpY2tlZExheWVyLnVybCB8fCBudWxsLFxuICAgICAgICBsYXllcktleSxcbiAgICAgICAgZGF0YVNvdXJjZUlkOiBkc0lkLFxuICAgICAgICBkZWZpbml0aW9uRXhwcmVzc2lvbjogKGNsaWNrZWRMYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uIHx8IG51bGwsXG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgb2lkRmllbGQgPVxuICAgICAgICBjbGlja2VkTGF5ZXIub2JqZWN0SWRGaWVsZCB8fFxuICAgICAgICBjbGlja2VkTGF5ZXIuZmllbGRzPy5maW5kKChmOiBhbnkpID0+IGYudHlwZSA9PT0gXCJvaWRcIik/Lm5hbWUgfHxcbiAgICAgICAgbnVsbDtcblxuICAgICAgaWYgKCFvaWRGaWVsZCkge1xuICAgICAgICBpZiAoIWlzU3RhbGUoKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogdGhpcy50cihcImVycm9yLm9iamVjdElkRmllbGRNaXNzaW5nXCIpLFxuICAgICAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb2lkID0gKGcgYXMgYW55KS5hdHRyaWJ1dGVzPy5bb2lkRmllbGRdO1xuICAgICAgaWYgKG9pZCA9PSBudWxsKSB7XG4gICAgICAgIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiB0aGlzLnRyKFwiZXJyb3Iub2JqZWN0SWRNaXNzaW5nXCIsIHsgZmllbGQ6IG9pZEZpZWxkIH0pLFxuICAgICAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0RmllbGRzID0gdGhpcy5nZXRPdXRGaWVsZHMoY2xpY2tlZExheWVyIGFzIGFueSwgb2lkRmllbGQpO1xuXG4gICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5xdWVyeUZlYXR1cmVCeU9iamVjdElkQ2FjaGVkKFxuICAgICAgICBjbGlja2VkTGF5ZXIsXG4gICAgICAgIG9pZEZpZWxkLFxuICAgICAgICBvaWQsXG4gICAgICAgIG91dEZpZWxkcyxcbiAgICAgICk7XG4gICAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG4gICAgICBpZiAoIWYpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IHRoaXMudHIoXCJlcnJvci5mZWF0dXJlQnlPYmplY3RJZE1pc3NpbmdcIiksXG4gICAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xlYXJIaWdobGlnaHQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZi5nZW9tZXRyeSkgdGhpcy5oaWdobGlnaHRQb2x5Z29uKGYuZ2VvbWV0cnkpO1xuXG4gICAgICBjb25zdCBlYXJseVVuaXF1ZUlkID1cbiAgICAgICAgdGhpcy5maW5kQXR0cmlidXRlVmFsdWVDYXNlSW5zZW5zaXRpdmUoXG4gICAgICAgICAgZi5hdHRyaWJ1dGVzIGFzIFJlY29yZDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgQUdSSV9UQUJMRV9KT0lOX0ZJRUxELFxuICAgICAgICApID8/IG51bGw7XG4gICAgICBjb25zdCBlYXJseUNsZWFuS2V5ID0gU3RyaW5nKGVhcmx5VW5pcXVlSWQgfHwgXCJcIilcbiAgICAgICAgLnJlcGxhY2UoL1t7fV0vZywgXCJcIilcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IGFjdGl2ZUtleSA9IFN0cmluZyh0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCB8fCBcIlwiKVxuICAgICAgICAucmVwbGFjZSgvW3t9XS9nLCBcIlwiKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgLypcbiAgICAgICAqIFNhbWUgYWxyZWFkeS1hY3RpdmUgZmllbGQgKGluY2wuIHRhYmxlIHNlbGVjdGlvbikgY2xpY2tlZCBvbiBtYXAg4oaSXG4gICAgICAgKiBkZWFjdGl2YXRlIHdpdGhvdXQgem9vbWluZyBpbiBhZ2Fpbi4gR3JhZmYgcmVzdG9yZXMgdGhlIHByZS1zZWxlY3QgZXh0ZW50LlxuICAgICAgICogSWYgdGhlIHBhbmVsIHdhcyBvbmx5IG1pbmltaXplZCwgZXhwYW5kIGl0IGluc3RlYWQgb2YgZGVzZWxlY3RpbmcuXG4gICAgICAgKi9cbiAgICAgIGlmIChhY3RpdmVLZXkgJiYgZWFybHlDbGVhbktleSAmJiBhY3RpdmVLZXkgPT09IGVhcmx5Q2xlYW5LZXkpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQpIHtcbiAgICAgICAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcInNlbGVjdGlvbjpleHBhbmQtbWluaW1pemVkLXNhbWUtZmllbGRcIiwge1xuICAgICAgICAgICAgdW5pcXVlaWQ6IGVhcmx5Q2xlYW5LZXksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5leHBhbmRQb3B1cCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcInNlbGVjdGlvbjp0b2dnbGUtb2ZmLXNhbWUtZmllbGRcIiwge1xuICAgICAgICAgIHVuaXF1ZWlkOiBlYXJseUNsZWFuS2V5LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuICAgICAgICB0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCA9IG51bGw7XG4gICAgICAgIHRoaXMuY2xvc2VQb3B1cCh7IHJlc3RvcmVFeHRlbnQ6IHRydWUsIG5vdGlmeURlc2VsZWN0OiB0cnVlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEtpY2sgR3JhZmYgb3ZlcmxheSArIHpvb20gQkVGT1JFIEFncmlfdGFibGUgam9pbiDigJQgdGhhdCBqb2luIHVzZWQgdG9cbiAgICAgIC8vIHNpdCBvbiB0aGUgY3JpdGljYWwgcGF0aCAofnNlY29uZHMpIHdoaWxlIHRoZSBpbmRleCBUSUZGIHdhaXRlZC5cbiAgICAgIGlmIChlYXJseVVuaXF1ZUlkICE9IG51bGwgJiYgU3RyaW5nKGVhcmx5VW5pcXVlSWQpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICBjb25zdCBlYXJseU5vdGlmeUlkID0gU3RyaW5nKGVhcmx5VW5pcXVlSWQpLnRyaW0oKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgPSBlYXJseUNsZWFuS2V5O1xuICAgICAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcInNlbGVjdGlvbjpicm9hZGNhc3QtZWFybHlcIiwge1xuICAgICAgICAgIHVuaXF1ZWlkOiBlYXJseU5vdGlmeUlkLFxuICAgICAgICAgIHNvdXJjZTogXCJBZ3JpUG9wdXBcIixcbiAgICAgICAgICBwb2x5Z29uTW9kZTogdHJ1ZSxcbiAgICAgICAgICBkZXN0aW5hdGlvbnM6IFtcIkFncmlMb2NhbGl6YXRpb25cIiwgXCJBZ3JpR3JhZmYxMFwiXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubm90aWZ5R3JhZmZQb2x5Z29uU2VsZWN0aW9uKGVhcmx5Tm90aWZ5SWQsIHRydWUsIGNsaWNrU3RhcnRlZEF0KTtcbiAgICAgICAgLy8gV2FybSBUSUZGIGNhY2hlIGltbWVkaWF0ZWx5IChzYW1lIHRpY2sgYXMgY2xpY2spIOKAlCB1c2VzIGxhc3RcbiAgICAgICAgLy8gcmVnaW9uL3llYXIvZGF0ZSBwdWJsaXNoZWQgYnkgR3JhZmYsIG9yIGF2YWlsYWJsZS1kYXRlcyBpZiBuZWVkZWQuXG4gICAgICAgIC8vIFBhc3MgdGhlIGNyb3Agc28gdGhlIGRhdGUgd2FsayBzdGFydHMgaW5zaWRlIGl0cyBpbmRleCBzZWFzb25cbiAgICAgICAgLy8gKHdoZWF0ID0gTWFyL0FwcikgaW5zdGVhZCBvZiBwcm9iaW5nIFNlcHRlbWJlciBhbmQgZWF0aW5nIDQwMHMuXG4gICAgICAgIHByZWZldGNoVmVnZXRhdGlvbk92ZXJsYXlGb3JVbmlxdWVpZChlYXJseU5vdGlmeUlkLCB7XG4gICAgICAgICAgY3JvcElkOiByZXNvbHZlQ3JvcElkRnJvbUF0dHJpYnV0ZXMoXG4gICAgICAgICAgICBmLmF0dHJpYnV0ZXMgYXMgUmVjb3JkPHN0cmluZywgYW55PixcbiAgICAgICAgICApLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gRGVmZXIgRmVhdHVyZVNlcnZlciBzZXJpZXMgc28gZXhwb3J0LWltYWdlIGdldHMgYmFuZHdpZHRoIGZpcnN0LlxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICBjb25zdCBhY3RpdmUgPSBTdHJpbmcodGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgfHwgXCJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9be31dL2csIFwiXCIpXG4gICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgIGlmIChhY3RpdmUgIT09IGVhcmx5Q2xlYW5LZXkpIHJldHVybjtcbiAgICAgICAgICB2b2lkIHRoaXMuZmV0Y2hMYXRlc3RWZWdldGF0aW9uSW5kaWNlcyhlYXJseU5vdGlmeUlkKTtcbiAgICAgICAgfSwgNjUwKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgem9vbVRvRWFybHkgPSB0aGlzLnByb3BzLmNvbmZpZz8uc2V0dGluZ3M/Lnpvb21Ub1NlbGVjdGlvbiAhPT0gZmFsc2U7XG4gICAgICBpZiAoem9vbVRvRWFybHkgJiYgZi5nZW9tZXRyeSAmJiAhaXNTdGFsZSgpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gJiYgdmlldy5leHRlbnQ/LmNsb25lKSB7XG4gICAgICAgICAgICB0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gPSB2aWV3LmV4dGVudC5jbG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB0YXJnZXQgPVxuICAgICAgICAgICAgKGYuZ2VvbWV0cnkgYXMgYW55KS5leHRlbnQ/LmV4cGFuZD8uKDEuMDgpIHx8IGYuZ2VvbWV0cnk7XG4gICAgICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJ6b29tOnN0YXJ0LWVhcmx5XCIsIHtcbiAgICAgICAgICAgIHVuaXF1ZWlkOiBlYXJseUNsZWFuS2V5IHx8IG51bGwsXG4gICAgICAgICAgICBnZW9tZXRyeVR5cGU6IGYuZ2VvbWV0cnkudHlwZSxcbiAgICAgICAgICAgIGR1cmF0aW9uTXM6IDY1MCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB2b2lkIHZpZXdcbiAgICAgICAgICAgIC5nb1RvKHsgdGFyZ2V0IH0sIHsgZHVyYXRpb246IDY1MCwgZWFzaW5nOiBcImVhc2UtaW4tb3V0XCIgYXMgYW55IH0pXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgKCkgPT5cbiAgICAgICAgICAgICAgICBhZ3JpTWFwQ2xpY2tEZWJ1ZyhcInpvb206Y29tcGxldGVcIiwge1xuICAgICAgICAgICAgICAgICAgdW5pcXVlaWQ6IGVhcmx5Q2xlYW5LZXkgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgIHNjYWxlOiAodmlldyBhcyBhbnkpLnNjYWxlLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAoZXJyb3I6IGFueSkgPT5cbiAgICAgICAgICAgICAgICBhZ3JpTWFwQ2xpY2tXYXJuKFwiem9vbTpmYWlsZWRcIiwge1xuICAgICAgICAgICAgICAgICAgdW5pcXVlaWQ6IGVhcmx5Q2xlYW5LZXkgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcj8ubWVzc2FnZSB8fCBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLyogaWdub3JlICovXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9hZFN0YXR1cyA9IFN0cmluZygoY2xpY2tlZExheWVyIGFzIGFueSkubG9hZFN0YXR1cyB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBpc0xvYWRlZCA9IEJvb2xlYW4oKGNsaWNrZWRMYXllciBhcyBhbnkpLmxvYWRlZCkgfHwgbG9hZFN0YXR1cyA9PT0gXCJsb2FkZWRcIjtcbiAgICAgICAgLy8gTG9hZGluZyBhIGxpdmUgTWFwSW1hZ2Utb3duZWQgc3VibGF5ZXIgcmVoeWRyYXRlcyBpdCBhbmQgY2FuIGNsZWFyXG4gICAgICAgIC8vIHRoZSBydW50aW1lIHR1bWFuIGRlZmluaXRpb25FeHByZXNzaW9uIChvdGhlci1kaXN0cmljdCBmbGFzaCkuIFRoZVxuICAgICAgICAvLyBkZXRhY2hlZCBjbGllbnQgZnJvbSBxdWVyeUZlYXR1cmVCeU9iamVjdElkQ2FjaGVkIGlzIGFscmVhZHkgbG9hZGVkXG4gICAgICAgIC8vIGFuZCBwcm92aWRlcyB0aGUgc2FtZSBmaWVsZCBtZXRhZGF0YS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICFpc0xvYWRlZCAmJlxuICAgICAgICAgICFpc01hcEltYWdlT3duZWRMYXllcihjbGlja2VkTGF5ZXIpICYmXG4gICAgICAgICAgIWlzTWFwSW1hZ2VHcm91cFN1YmxheWVyKGNsaWNrZWRMYXllcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJsYXllcjpsb2FkLXJlcXVpcmVkXCIsIHtcbiAgICAgICAgICAgIHRpdGxlOiBjbGlja2VkTGF5ZXIudGl0bGUsXG4gICAgICAgICAgICBsb2FkU3RhdHVzOiBsb2FkU3RhdHVzIHx8IG51bGwsXG4gICAgICAgICAgICBkZWZpbml0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgICAgICAgKGNsaWNrZWRMYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uIHx8IG51bGwsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgc2FmZUxvYWRNYXBMYXllcihjbGlja2VkTGF5ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFncmlNYXBDbGlja0RlYnVnKFwibGF5ZXI6bG9hZC1za2lwLWFscmVhZHktbG9hZGVkXCIsIHtcbiAgICAgICAgICAgIHRpdGxlOiBjbGlja2VkTGF5ZXIudGl0bGUsXG4gICAgICAgICAgICBsb2FkU3RhdHVzOiBsb2FkU3RhdHVzIHx8IFwibG9hZGVkXCIsXG4gICAgICAgICAgICBkZWZpbml0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgICAgICAgKGNsaWNrZWRMYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uIHx8IG51bGwsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvKiBmcmVzaCBmaWVsZCBhbGlhc2VzIGZyb20gbGl2ZSBsYXllciAqL1xuICAgICAgfVxuICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBzaG91bGRQaW4gPSB0aGlzLnN0YXRlLnBpblRvQ29ybmVyO1xuICAgICAgY29uc3QgcG9wdXBQb3NpdGlvbiA9IHNob3VsZFBpblxuICAgICAgICA/IHRoaXMuY2FsY3VsYXRlUGlubmVkUG9zaXRpb24odmlldylcbiAgICAgICAgOiB0aGlzLmNhbGN1bGF0ZVBvcHVwUG9zaXRpb24oY2xpY2tTY3JlZW5Qb2ludCwgdmlldyk7XG5cbiAgICAgIC8vIEFncmlfdGFibGVfZGF0YSBoYXMgbm8gZ2VvbWV0cnkg4oCUIHRoZSBwb2x5Z29uIGxheWVyIG9ubHkgZHJpdmVzXG4gICAgICAvLyBtYXAtY2xpY2svaGlnaGxpZ2h0L3pvb207IHRoZSBmaWVsZHMgdGhlIHBvcHVwIHNob3dzIGNvbWUgZnJvbSB0aGVcbiAgICAgIC8vIGV4dGVybmFsIHRhYmxlLCBqb2luZWQgYnkgdW5pcXVlaWQuXG4gICAgICBjb25zdCBkaXNwbGF5QXR0cnMgPSBhd2FpdCB0aGlzLnJlc29sdmVEaXNwbGF5QXR0cnMoZi5hdHRyaWJ1dGVzKTtcbiAgICAgIGlmIChpc1N0YWxlKCkpIHJldHVybjtcblxuICAgICAgY29uc3QgY29uZmlndXJlZEZpZWxkcyA9IHRoaXMucHJvcHMuY29uZmlnPy5maWVsZHNUb1Nob3cgfHwgW107XG4gICAgICBjb25zdCBhY3R1YWxGaWVsZHMgPSBPYmplY3Qua2V5cyhkaXNwbGF5QXR0cnMpO1xuICAgICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IGNvbmZpZ3VyZWRGaWVsZHMuZmlsdGVyKFxuICAgICAgICAoZmllbGQpID0+ICFhY3R1YWxGaWVsZHMuaW5jbHVkZXMoZmllbGQpLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGZpZWxkc1dpdGhEYXRhID0gY29uZmlndXJlZEZpZWxkcy5maWx0ZXIoXG4gICAgICAgIChuYW1lKSA9PlxuICAgICAgICAgIGRpc3BsYXlBdHRycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJlxuICAgICAgICAgIGRpc3BsYXlBdHRyc1tuYW1lXSAhPSBudWxsICYmXG4gICAgICAgICAgZGlzcGxheUF0dHJzW25hbWVdICE9PSBcIlwiLFxuICAgICAgKTtcblxuICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJwb3B1cCBPUEVOXCIsIHtcbiAgICAgICAgb2lkLFxuICAgICAgICBvaWRGaWVsZCxcbiAgICAgICAgbGF5ZXJLZXksXG4gICAgICAgIGF0dHJpYnV0ZUtleXM6IGFjdHVhbEZpZWxkcy5zbGljZSgwLCAxMiksXG4gICAgICAgIHBvcHVwUG9zaXRpb24sXG4gICAgICB9KTtcblxuICAgICAgLy8gT3BlbiB0aGUgcG9wdXAgQkVGT1JFIGdvVG8g4oCUIGF3YWl0aW5nIHpvb20gZmlyc3QgbGVmdCBhIGxvbmcgd2luZG93XG4gICAgICAvLyB3aGVyZSBhIHR3aW4vc2hhcmVkIGNsaWNrIHBhdGggY291bGQgZmFpbCBhbmQgd2lwZSBzaG93UG9wdXAuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZzogZmFsc2UsXG5cbiAgICAgICAgLy8g4pyFIHN0b3JlIHdoaWNoIGxheWVyL2RzIHdhcyBjbGlja2VkIChmb3IgYWxpYXMgcmVzb2x2aW5nKVxuICAgICAgICBsYXN0Q2xpY2tlZERzSWQ6IGRzSWQsXG4gICAgICAgIGxhc3RDbGlja2VkTGF5ZXJLZXk6IGxheWVyS2V5LFxuXG4gICAgICAgIHNlbGVjdGVkQXR0cnM6IGRpc3BsYXlBdHRycyxcbiAgICAgICAgc2VsZWN0ZWRPSUQ6IE51bWJlcihvaWQpLFxuICAgICAgICBvYmplY3RJZEZpZWxkOiBvaWRGaWVsZCxcblxuICAgICAgICBzaG93UG9wdXA6IHRydWUsXG4gICAgICAgIHBvcHVwTWluaW1pemVkOiBmYWxzZSxcbiAgICAgICAgY2hhcnRFeHBhbmRlZDogc2hvdWxkUGluLFxuICAgICAgICBjaGFydEhvdmVySW5kZXg6IG51bGwsXG4gICAgICAgIHBvcHVwUG9zaXRpb24sXG4gICAgICAgIGVycm9yOlxuICAgICAgICAgIG1pc3NpbmdGaWVsZHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyB0aGlzLnRyKFwiZXJyb3IuY29uZmlndXJlZEZpZWxkTWlzc2luZ1wiLCB7XG4gICAgICAgICAgICAgICAgZmllbGRzOiBtaXNzaW5nRmllbGRzLmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogZmllbGRzV2l0aERhdGEubGVuZ3RoID09PSAwICYmIGNvbmZpZ3VyZWRGaWVsZHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICA/IHRoaXMudHIoXCJlcnJvci5ub0RhdGFGb3JDb25maWd1cmVkRmllbGRzXCIpXG4gICAgICAgICAgICAgIDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgcG9wdXBPcGVuZWRGb3JUaGlzQ2xpY2sgPSB0cnVlO1xuXG4gICAgICBjb25zdCBjbGlja2VkVW5pcXVlSWQgPVxuICAgICAgICB0aGlzLmZpbmRBdHRyaWJ1dGVWYWx1ZUNhc2VJbnNlbnNpdGl2ZShcbiAgICAgICAgICBkaXNwbGF5QXR0cnMsXG4gICAgICAgICAgQUdSSV9UQUJMRV9KT0lOX0ZJRUxELFxuICAgICAgICApID8/XG4gICAgICAgIHRoaXMuZmluZEF0dHJpYnV0ZVZhbHVlQ2FzZUluc2Vuc2l0aXZlKFxuICAgICAgICAgIGYuYXR0cmlidXRlcyBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICAgICAgICAgIEFHUklfVEFCTEVfSk9JTl9GSUVMRCxcbiAgICAgICAgKTtcbiAgICAgIGlmIChjbGlja2VkVW5pcXVlSWQgIT0gbnVsbCAmJiBTdHJpbmcoY2xpY2tlZFVuaXF1ZUlkKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgY29uc3QgY2xlYW5VbmlxdWVJZCA9IFN0cmluZyhjbGlja2VkVW5pcXVlSWQpLnRyaW0oKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgPSBjbGVhblVuaXF1ZUlkLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudHJpbSgpO1xuICAgICAgICAvLyBFYXJseSBicm9hZGNhc3QgYWxyZWFkeSByYW4gd2hlbiBwb2x5Z29uIGF0dHJzIGhhZCB1bmlxdWVpZDsgb25seVxuICAgICAgICAvLyBub3RpZnkgYWdhaW4gaWYgdGhlIHRhYmxlIGpvaW4gaXMgdGhlIGZpcnN0IHBsYWNlIHdlIHNhdyBpdC5cbiAgICAgICAgaWYgKCFlYXJseUNsZWFuS2V5IHx8IGVhcmx5Q2xlYW5LZXkgIT09IHRoaXMuX2FjdGl2ZUluc3BlY3RlZFVuaXF1ZWlkKSB7XG4gICAgICAgICAgYWdyaU1hcENsaWNrRGVidWcoXCJzZWxlY3Rpb246YnJvYWRjYXN0XCIsIHtcbiAgICAgICAgICAgIHVuaXF1ZWlkOiBjbGVhblVuaXF1ZUlkLFxuICAgICAgICAgICAgc291cmNlOiBcIkFncmlQb3B1cFwiLFxuICAgICAgICAgICAgcG9seWdvbk1vZGU6IHRydWUsXG4gICAgICAgICAgICBkZXN0aW5hdGlvbnM6IFtcIkFncmlMb2NhbGl6YXRpb25cIiwgXCJBZ3JpR3JhZmYxMFwiXSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLm5vdGlmeUdyYWZmUG9seWdvblNlbGVjdGlvbihjbGVhblVuaXF1ZUlkLCB0cnVlLCBjbGlja1N0YXJ0ZWRBdCk7XG4gICAgICAgICAgdm9pZCB0aGlzLmZldGNoTGF0ZXN0VmVnZXRhdGlvbkluZGljZXMoY2xlYW5VbmlxdWVJZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiBmYWxzZSxcbiAgICAgICAgICBsYXRlc3RJbmRleERhdGU6IG51bGwsXG4gICAgICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBab29tIGFscmVhZHkgc3RhcnRlZCBlYXJseSAoYmVmb3JlIEFncmlfdGFibGUgam9pbikgd2hlbiBnZW9tZXRyeSBleGlzdHMuXG5cbiAgICAgIC8vIEF0dGFjaG1lbnRzIGFyZSBiZXN0LWVmZm9ydCDigJQgbmV2ZXIgbGV0IGEgbWVkaWEgZmV0Y2ggd2lwZSBhbiBvcGVuIHBvcHVwXG4gICAgICAvLyAodGhhdCB3YXMgdGhlIFwidmVnZXRhdGlvbiB1cGRhdGVzIGJ1dCBwb3B1cCBvbmx5IHN0aWNrcyBvbiAybmQvM3JkIGNsaWNrXCJcbiAgICAgIC8vIGZhaWx1cmU6IG5vdGlmeUdyYWZmIHJhbiwgdGhlbiBsb2FkQXR0YWNobWVudHMgdGhyZXcg4oaSIGNhdGNoIGNsb3NlZCBVSVxuICAgICAgLy8gYW5kIHJlc3RvcmVFeHRlbnRCZWZvcmVTZWxlY3Rpb24gbWFkZSB0aGUgbWFwIGxvb2sgbGlrZSBvdGhlciBmaWVsZHMpLlxuICAgICAgaWYgKHRoaXMucHJvcHMuY29uZmlnPy5zZXR0aW5ncz8uc2hvd0F0dGFjaG1lbnRzICE9PSBmYWxzZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFF1ZXJ5IGF0dGFjaG1lbnRzIG9uIHRoZSBkZXRhY2hlZCBjbGllbnQgdG9vIOKAlCBxdWVyeUF0dGFjaG1lbnRzXG4gICAgICAgICAgLy8gb24gYSBsaXZlIE1hcEltYWdlIHN1YmxheWVyIGNhbiByZWh5ZHJhdGUgaXQgKHNhbWUgREUtY2xlYXJpbmdcbiAgICAgICAgICAvLyBwYXRoIGFzIHF1ZXJ5RmVhdHVyZXMpIGFuZCBpdCBvZnRlbiBsYWNrcyB0aGUgQVBJIGFueXdheS5cbiAgICAgICAgICBjb25zdCBjbGlja2VkVXJsID0gU3RyaW5nKChjbGlja2VkTGF5ZXIgYXMgYW55KS51cmwgfHwgXCJcIikudHJpbSgpO1xuICAgICAgICAgIGNvbnN0IGF0dGFjaG1lbnRMYXllciA9XG4gICAgICAgICAgICAoY2xpY2tlZFVybCAmJiB0aGlzLl9xdWVyeU9ubHlMYXllcnMuZ2V0KGNsaWNrZWRVcmwpKSB8fFxuICAgICAgICAgICAgY2xpY2tlZExheWVyO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9hZEF0dGFjaG1lbnRzRm9yT2lkKGF0dGFjaG1lbnRMYXllciBhcyBhbnksIE51bWJlcihvaWQpKTtcbiAgICAgICAgfSBjYXRjaCAoYXR0YWNoRXJyOiBhbnkpIHtcbiAgICAgICAgICBhZ3JpTWFwQ2xpY2tXYXJuKFwiYXR0YWNobWVudHMgZmFpbGVkIChwb3B1cCBrZXB0IG9wZW4pXCIsIHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGF0dGFjaEVycj8ubWVzc2FnZSB8fCBTdHJpbmcoYXR0YWNoRXJyKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWlzU3RhbGUoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsIGF0dGFjaG1lbnRzOiBbXSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWlzU3RhbGUoKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSwgYXR0YWNobWVudHM6IFtdIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgICBpZiAodGhpcy5zdGF0ZS5waW5Ub0Nvcm5lcikge1xuICAgICAgICB0aGlzLnNjaGVkdWxlUG9wdXBMYXlvdXRBZnRlckNvbnRlbnQoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0Rhc2hib2FyZEVtYmVkZGVkKCkpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0QWZ0ZXJDb250ZW50KCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAvLyBOZXZlciBsZXQgYSBzdXBlcnNlZGVkIHR3aW4vc2hhcmVkIGNsaWNrIGNsZWFyIGEgbmV3ZXIgcG9wdXAuXG4gICAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG4gICAgICAvLyBJZiB3ZSBhbHJlYWR5IG9wZW5lZCB0aGUgcG9wdXAgZm9yIFRISVMgY2xpY2ssIGtlZXAgaXQg4oCUIHN1cmZhY2UgZXJyb3Igb25seS5cbiAgICAgIGlmIChwb3B1cE9wZW5lZEZvclRoaXNDbGljaykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogdGhpcy50cihcImVycm9yLnVuZXhwZWN0ZWRcIiwge1xuICAgICAgICAgICAgbWVzc2FnZTogZT8ubWVzc2FnZSB8fCBcIlVua25vd24gZXJyb3JcIixcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBlcnJvcjogdGhpcy50cihcImVycm9yLnVuZXhwZWN0ZWRcIiwge1xuICAgICAgICAgIG1lc3NhZ2U6IGU/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCIsXG4gICAgICAgIH0pLFxuICAgICAgICBzaG93UG9wdXA6IGZhbHNlLFxuICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2xlYXJIaWdobGlnaHQoKTtcbiAgICAgIHRoaXMubm90aWZ5R3JhZmZQb2x5Z29uU2VsZWN0aW9uKFwiXCIsIGZhbHNlKTtcbiAgICAgIHRoaXMucmVzdG9yZUV4dGVudEJlZm9yZVNlbGVjdGlvbigpO1xuICAgIH1cbiAgfTtcblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tIEF0dGFjaG1lbnRzIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgYXN5bmMgZmV0Y2hBdHRhY2htZW50UHJldmlldyh1cmw6IHN0cmluZyk6IFByb21pc2U8QmxvYj4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBlc3JpUmVxdWVzdCh1cmwsIHtcbiAgICAgIHJlc3BvbnNlVHlwZTogXCJibG9iXCIsXG4gICAgICBxdWVyeToge30sXG4gICAgfSBhcyBhbnkpO1xuICAgIHJldHVybiByZXNwPy5kYXRhIGluc3RhbmNlb2YgQmxvYiA/IHJlc3AuZGF0YSA6IChyZXNwIGFzIHVua25vd24gYXMgQmxvYik7XG4gIH1cblxuICBwcml2YXRlIHJldm9rZUFsbEF0dGFjaG1lbnRVcmxzKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBhdHRzID0gdGhpcy5zdGF0ZS5hdHRhY2htZW50cyB8fCBbXTtcbiAgICAgIGF0dHMuZm9yRWFjaCgoYSkgPT4ge1xuICAgICAgICBpZiAoYS5wcmV2aWV3T2JqZWN0VXJsKSBVUkwucmV2b2tlT2JqZWN0VVJMKGEucHJldmlld09iamVjdFVybCk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHt9XG4gIH1cblxuICBwcml2YXRlIGlzSW1hZ2VDb250ZW50VHlwZShjdD86IHN0cmluZykge1xuICAgIGlmICghY3QpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gL15pbWFnZVxcLy9pLnRlc3QoY3QpO1xuICB9XG5cbiAgcHJpdmF0ZSBieXRlc1RvU2l6ZShuPzogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBpZiAoIW4gJiYgbiAhPT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKG4gPT09IDApIHJldHVybiBcIjAgQlwiO1xuICAgIGNvbnN0IGsgPSAxMDI0LFxuICAgICAgc2l6ZXMgPSBbXCJCXCIsIFwiS0JcIiwgXCJNQlwiLCBcIkdCXCIsIFwiVEJcIl07XG4gICAgY29uc3QgaSA9IE1hdGguZmxvb3IoTWF0aC5sb2cobikgLyBNYXRoLmxvZyhrKSk7XG4gICAgcmV0dXJuIGAkeyhuIC8gTWF0aC5wb3coaywgaSkpLnRvRml4ZWQoMil9ICR7c2l6ZXNbaV19YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbG9hZEF0dGFjaG1lbnRzRm9yT2lkKGxheWVyOiBGZWF0dXJlTGF5ZXIsIG9pZDogbnVtYmVyKSB7XG4gICAgLy8g4pyFIElmIGxheWVyIGRvZXNu4oCZdCBzdXBwb3J0IGF0dGFjaG1lbnRzIC0+IHNpbGVudGx5IHNob3cgbm9uZSAoTk8gd2FybmluZylcbiAgICBpZiAoIXRoaXMubGF5ZXJTdXBwb3J0c0F0dGFjaG1lbnRzKGxheWVyKSkge1xuICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICAgIHRoaXMucmV2b2tlQWxsQXR0YWNobWVudFVybHMoKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgIGF0dGFjaG1lbnRzRXJyb3I6IG51bGwsXG4gICAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IHRydWUsIC8vIGtlZXAgYXJlYSB2aXNpYmxlIGlmIHlvdSB3YW50IFwiTm8gYXR0YWNobWVudHNcIlxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucmV2b2tlQWxsQXR0YWNobWVudFVybHMoKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IHRydWUsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgYXR0YWNobWVudHNFcnJvcjogbnVsbCxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsYXllci5xdWVyeUF0dGFjaG1lbnRzKHsgb2JqZWN0SWRzOiBbb2lkXSB9KTtcbiAgICAgIGNvbnN0IGxpc3QgPSAocmVzdWx0Py5bb2lkXSB8fCBbXSkgYXMgYW55W107XG5cbiAgICAgIGNvbnN0IGl0ZW1zOiBBdHRhY2htZW50SXRlbVtdID0gbGlzdC5tYXAoKGF0dCkgPT4gKHtcbiAgICAgICAgaWQ6IGF0dC5pZCxcbiAgICAgICAgbmFtZTogYXR0Lm5hbWUsXG4gICAgICAgIHNpemU6IGF0dC5zaXplLFxuICAgICAgICBjb250ZW50VHlwZTogYXR0LmNvbnRlbnRUeXBlLFxuICAgICAgICB1cmw6IGF0dC51cmwsXG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IHdpdGhQcmV2aWV3czogQXR0YWNobWVudEl0ZW1bXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBpdCBvZiBpdGVtcykge1xuICAgICAgICBpZiAoaXQudXJsICYmIHRoaXMuaXNJbWFnZUNvbnRlbnRUeXBlKGl0LmNvbnRlbnRUeXBlKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgdGhpcy5mZXRjaEF0dGFjaG1lbnRQcmV2aWV3KGl0LnVybCk7XG4gICAgICAgICAgICBpdC5wcmV2aWV3T2JqZWN0VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSBwcmV2aWV3IGZhaWx1cmVzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdpdGhQcmV2aWV3cy5wdXNoKGl0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhdHRhY2htZW50czogd2l0aFByZXZpZXdzLFxuICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICBhdHRhY2htZW50c0Vycm9yOiBudWxsLFxuICAgICAgICBhdHRhY2htZW50c0V4cGFuZGVkOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIC8vIOKchSBJZiBzZXJ2ZXIgc2F5cyBhdHRhY2htZW50cyBub3Qgc3VwcG9ydGVkL2VuYWJsZWQgLT4gU0lMRU5UIChubyByZWQgd2FybmluZylcbiAgICAgIGNvbnN0IG1zZyA9IFN0cmluZyhlcnI/Lm1lc3NhZ2UgfHwgZXJyIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBpc05vdFN1cHBvcnRlZCA9XG4gICAgICAgIG1zZy5pbmNsdWRlcyhcImRvZXNuJ3Qgc3VwcG9ydCBhdHRhY2htZW50c1wiKSB8fFxuICAgICAgICBtc2cuaW5jbHVkZXMoXCJkb2VzIG5vdCBzdXBwb3J0IGF0dGFjaG1lbnRzXCIpIHx8XG4gICAgICAgIG1zZy5pbmNsdWRlcyhcImF0dGFjaG1lbnRzIGFyZSBub3QgZW5hYmxlZFwiKSB8fFxuICAgICAgICBtc2cuaW5jbHVkZXMoXCJhdHRhY2htZW50cyBkaXNhYmxlZFwiKSB8fFxuICAgICAgICAobXNnLmluY2x1ZGVzKFwibm90IHN1cHBvcnRlZFwiKSAmJiBtc2cuaW5jbHVkZXMoXCJhdHRhY2htZW50XCIpKTtcblxuICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcblxuICAgICAgaWYgKGlzTm90U3VwcG9ydGVkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgYXR0YWNobWVudHM6IFtdLFxuICAgICAgICAgIGF0dGFjaG1lbnRzRXJyb3I6IG51bGwsXG4gICAgICAgICAgYXR0YWNobWVudHNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgYXR0YWNobWVudHNFcnJvcjogU3RyaW5nKGVycj8ubWVzc2FnZSB8fCBlcnIgfHwgXCJBdHRhY2htZW50cyBmYWlsZWRcIiksXG4gICAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tIEZpZWxkIGFsaWFzICsgZm9ybWF0dGluZyAtLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgcHJpdmF0ZSBpc0RhdGVGaWVsZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBVc2UgdGhlIGNsaWNrZWQgbGF5ZXIgaWYgcG9zc2libGVcbiAgICBjb25zdCBjbGlja2VkTGF5ZXIgPSB0aGlzLmdldENsaWNrZWRMYXllcigpO1xuICAgIGNvbnN0IGZsZCA9IGNsaWNrZWRMYXllcj8uZmllbGRzPy5maW5kKChmZjogYW55KSA9PiBmZi5uYW1lID09PSBuYW1lKTtcbiAgICByZXR1cm4gaXNFc3JpRGF0ZUZpZWxkVHlwZSgoZmxkIGFzIGFueSk/LnR5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDbGlja2VkTGF5ZXIoKTogX19lc3JpLkZlYXR1cmVMYXllciB8IG51bGwge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuc3RhdGUubGFzdENsaWNrZWRMYXllcktleTtcbiAgICBpZiAoIWtleSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycy5maW5kKFxuICAgICAgICAoTCkgPT5cbiAgICAgICAgICBnZXRBZ3JpTGF5ZXJNYXBLZXkoTCkgPT09IGtleSB8fFxuICAgICAgICAgIFN0cmluZyhMLnVybCB8fCBMLmlkIHx8IFwiXCIpID09PSBrZXksXG4gICAgICApIHx8IG51bGxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlRmllbGROYW1lID0gKGtleTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgLy8gUHJlZmVyIERTIHNjaGVtYSBmb3IgdGhlIExBU1QgY2xpY2tlZCBkcyAoYmVzdCBmb3IgYWxpYXMvamltdU5hbWUpXG4gICAgY29uc3QgZHNJZCA9IHRoaXMuc3RhdGUubGFzdENsaWNrZWREc0lkO1xuICAgIGNvbnN0IGRzOiBhbnkgPVxuICAgICAgZHNJZCAmJiB0aGlzLnN0YXRlLmRhdGFTb3VyY2VzQnlJZD8uW2RzSWRdXG4gICAgICAgID8gdGhpcy5zdGF0ZS5kYXRhU291cmNlc0J5SWRbZHNJZF1cbiAgICAgICAgOiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IGRzPy5nZXRTY2hlbWE/LigpO1xuICAgICAgY29uc3QgZmllbGRzT2JqID0gc2NoZW1hPy5maWVsZHMgfHwge307XG4gICAgICBpZiAoZmllbGRzT2JqW2tleV0/Lm5hbWUpIHJldHVybiBmaWVsZHNPYmpba2V5XS5uYW1lO1xuICAgICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGZpZWxkc09iaikpIHtcbiAgICAgICAgY29uc3QgZiA9IChmaWVsZHNPYmogYXMgYW55KVtrXTtcbiAgICAgICAgaWYgKGY/Lm5hbWUgPT09IGtleSB8fCBmPy5qaW11TmFtZSA9PT0ga2V5IHx8IGsgPT09IGtleSlcbiAgICAgICAgICByZXR1cm4gZj8ubmFtZSB8fCBrZXk7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgLy8gZmFsbGJhY2sgdG8gY2xpY2tlZCBsYXllciBmaWVsZHNcbiAgICBjb25zdCBjbGlja2VkTGF5ZXIgPSB0aGlzLmdldENsaWNrZWRMYXllcigpO1xuICAgIGNvbnN0IGxmID0gY2xpY2tlZExheWVyPy5maWVsZHM/LmZpbmQoXG4gICAgICAoZmY6IGFueSkgPT4gZmYubmFtZSA9PT0ga2V5IHx8IGZmLmFsaWFzID09PSBrZXksXG4gICAgKTtcbiAgICByZXR1cm4gbGY/Lm5hbWUgfHwgbnVsbDtcbiAgfTtcblxuICBwcml2YXRlIG5vcm1hbGl6ZUZpZWxkQWxpYXMoZmllbGQ6IGFueSwgZmFsbGJhY2tOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVGaWVsZEFsaWFzU2hhcmVkKGZpZWxkLCBmYWxsYmFja05hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kRmllbGRNZXRhT25MYXllcihcbiAgICBsYXllcjogYW55LFxuICAgIGZpZWxkTmFtZTogc3RyaW5nLFxuICApOiBfX2VzcmkuRmllbGQgfCBudWxsIHtcbiAgICBjb25zdCB0YXJnZXQgPSBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBmaWVsZHMgPSBBcnJheS5pc0FycmF5KGxheWVyPy5maWVsZHMpID8gbGF5ZXIuZmllbGRzIDogW107XG4gICAgcmV0dXJuIChcbiAgICAgIChmaWVsZHMuZmluZChcbiAgICAgICAgKGY6IGFueSkgPT4gU3RyaW5nKGY/Lm5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKSA9PT0gdGFyZ2V0LFxuICAgICAgKSBhcyBfX2VzcmkuRmllbGQgfCB1bmRlZmluZWQpIHx8IG51bGxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlQWxpYXNGcm9tTGl2ZUxheWVycyhmaWVsZE5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGxheWVyczogX19lc3JpLkZlYXR1cmVMYXllcltdID0gW107XG4gICAgY29uc3QgY2xpY2tlZCA9IHRoaXMuZ2V0Q2xpY2tlZExheWVyKCk7XG4gICAgaWYgKGNsaWNrZWQpIGxheWVycy5wdXNoKGNsaWNrZWQpO1xuICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgdGhpcy5zdGF0ZS5mZWF0dXJlTGF5ZXJzIHx8IFtdKSB7XG4gICAgICBpZiAobGF5ZXIgJiYgIWxheWVycy5pbmNsdWRlcyhsYXllcikpIGxheWVycy5wdXNoKGxheWVyKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgY29uc3QgZmxkID0gdGhpcy5maW5kRmllbGRNZXRhT25MYXllcihsYXllciwgZmllbGROYW1lKTtcbiAgICAgIGlmICghZmxkKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5ub3JtYWxpemVGaWVsZEFsaWFzKGZsZCwgZmllbGROYW1lKTtcbiAgICAgIGlmIChhbGlhcyAmJiBhbGlhcy50b0xvd2VyQ2FzZSgpICE9PSBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICByZXR1cm4gYWxpYXM7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlQWxpYXNGcm9tRGF0YVNvdXJjZVNjaGVtYShcbiAgICBmaWVsZE5hbWU6IHN0cmluZyxcbiAgICBkczogYW55LFxuICApOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIWRzKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmllbGRzT2JqID0gZHM/LmdldFNjaGVtYT8uKCk/LmZpZWxkcyB8fCB7fTtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpZWxkTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZmllbGRzT2JqKSkge1xuICAgICAgICBjb25zdCBmID0gZmllbGRzT2JqW2tleV07XG4gICAgICAgIGNvbnN0IGZuYW1lID0gU3RyaW5nKGY/Lm5hbWUgfHwgZj8uamltdU5hbWUgfHwga2V5IHx8IFwiXCIpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZm5hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGFyZ2V0ICYmXG4gICAgICAgICAga2V5LnRvTG93ZXJDYXNlKCkgIT09IHRhcmdldCAmJlxuICAgICAgICAgIFN0cmluZyhmPy5qaW11TmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpICE9PSB0YXJnZXRcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWxpYXMgPSB0aGlzLm5vcm1hbGl6ZUZpZWxkQWxpYXMoZiwgZmllbGROYW1lKTtcbiAgICAgICAgaWYgKGFsaWFzICYmIGFsaWFzLnRvTG93ZXJDYXNlKCkgIT09IGZpZWxkTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBpZ25vcmUgKi9cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldEZpZWxkQWxpYXMobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBjdXN0b20gPSB0aGlzLnByb3BzLmNvbmZpZz8ubGFiZWxzPy5bbmFtZV07XG4gICAgaWYgKGN1c3RvbSkgcmV0dXJuIGN1c3RvbTtcblxuICAgIGNvbnN0IHJlYWxOYW1lID0gdGhpcy5yZXNvbHZlRmllbGROYW1lKG5hbWUpIHx8IG5hbWU7XG5cbiAgICAvLyBMaXZlIG1hcCBsYXllciBmaXJzdCDigJQgcmVmbGVjdHMgbGF0ZXN0IEFyY0dJUyBmaWVsZCBkaXNwbGF5IG5hbWVzXG4gICAgY29uc3QgZnJvbUxheWVyID0gdGhpcy5yZXNvbHZlQWxpYXNGcm9tTGl2ZUxheWVycyhyZWFsTmFtZSk7XG4gICAgaWYgKGZyb21MYXllcikgcmV0dXJuIGZyb21MYXllcjtcblxuICAgIGNvbnN0IGRzSWQgPSB0aGlzLnN0YXRlLmxhc3RDbGlja2VkRHNJZDtcbiAgICBjb25zdCBkczogYW55ID1cbiAgICAgIGRzSWQgJiYgdGhpcy5zdGF0ZS5kYXRhU291cmNlc0J5SWQ/Lltkc0lkXVxuICAgICAgICA/IHRoaXMuc3RhdGUuZGF0YVNvdXJjZXNCeUlkW2RzSWRdXG4gICAgICAgIDogbnVsbDtcbiAgICBjb25zdCBmcm9tRHMgPSB0aGlzLnJlc29sdmVBbGlhc0Zyb21EYXRhU291cmNlU2NoZW1hKHJlYWxOYW1lLCBkcyk7XG4gICAgaWYgKGZyb21EcykgcmV0dXJuIGZyb21EcztcblxuICAgIGZvciAoY29uc3QgbGF5ZXJEcyBvZiBPYmplY3QudmFsdWVzKHRoaXMuc3RhdGUuZGF0YVNvdXJjZXNCeUlkIHx8IHt9KSkge1xuICAgICAgY29uc3QgYWxpYXMgPSB0aGlzLnJlc29sdmVBbGlhc0Zyb21EYXRhU291cmNlU2NoZW1hKHJlYWxOYW1lLCBsYXllckRzKTtcbiAgICAgIGlmIChhbGlhcykgcmV0dXJuIGFsaWFzO1xuICAgIH1cblxuICAgIGNvbnN0IGNsaWNrZWRMYXllciA9IHRoaXMuZ2V0Q2xpY2tlZExheWVyKCk7XG4gICAgY29uc3QgbGF5ZXJGbGQgPSBjbGlja2VkTGF5ZXJcbiAgICAgID8gdGhpcy5maW5kRmllbGRNZXRhT25MYXllcihjbGlja2VkTGF5ZXIsIHJlYWxOYW1lKVxuICAgICAgOiBudWxsO1xuICAgIGlmIChsYXllckZsZD8uYWxpYXMpIHJldHVybiBTdHJpbmcobGF5ZXJGbGQuYWxpYXMpO1xuXG4gICAgcmV0dXJuIHJlYWxOYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXREYXRlU21hcnQocmF3OiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBmb3JtYXREYXRlU21hcnRTaGFyZWQocmF3KTtcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0VmFsdWUobmFtZTogc3RyaW5nLCByYXc6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZvcm1hdFBvcHVwQXR0cmlidXRlVmFsdWUocmF3LCB7XG4gICAgICBpc0RhdGVGaWVsZDogdGhpcy5pc0RhdGVGaWVsZChuYW1lKSxcbiAgICAgIGZvcm1hdERhdGU6ICh2YWx1ZSkgPT4gdGhpcy5mb3JtYXREYXRlU21hcnQodmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPdXRGaWVsZHMobGF5ZXI6IEZlYXR1cmVMYXllciwgb2lkRmllbGQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAvLyBrZWVwIHlvdXIgZGVidWdnaW5nIGJlaGF2aW9yXG4gICAgcmV0dXJuIFtcIipcIl07XG4gIH1cblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tIFBvcHVwIHBvc2l0aW9uaW5nIC0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBwcml2YXRlIGNhbGN1bGF0ZVBvcHVwUG9zaXRpb24gPSAoXG4gICAgY2xpY2tQb2ludDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9LFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3LmNvbnRhaW5lciBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCByZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgY29uc3QgbWFyZ2luID0gdGhpcy5QT1BVUF9NQVJHSU47XG4gICAgY29uc3QgcG9wdXBXID0gdGhpcy5nZXRQb3B1cFdpZHRoKHZpZXcpO1xuICAgIGNvbnN0IHBvcHVwSCA9IHBvcHVwVztcblxuICAgIC8vIOKchSBFQiBidWlsZHMgZGlmZmVyOlxuICAgIC8vIC0gc29tZSBnaXZlIGV2LngvZXYueSByZWxhdGl2ZSB0byBjb250YWluZXIgKDAuLnJlY3Qud2lkdGgpXG4gICAgLy8gLSBvdGhlcnMgZ2l2ZSB2aWV3cG9ydCBjb29yZHMgKHNhbWUgc3BhY2UgYXMgcmVjdC5sZWZ0L3RvcClcbiAgICBjb25zdCBsb29rc0NvbnRhaW5lclJlbGF0aXZlID1cbiAgICAgIGNsaWNrUG9pbnQueCA+PSAwICYmXG4gICAgICBjbGlja1BvaW50LnkgPj0gMCAmJlxuICAgICAgY2xpY2tQb2ludC54IDw9IHJlY3Qud2lkdGggKyAyICYmXG4gICAgICBjbGlja1BvaW50LnkgPD0gcmVjdC5oZWlnaHQgKyAyO1xuXG4gICAgLy8gQ29udmVydCBjbGljayB0byBWSUVXUE9SVCBjb29yZHMgKGJlY2F1c2UgcG9wdXAgaXMgcG9zaXRpb246IGZpeGVkKVxuICAgIGNvbnN0IHZpZXdwb3J0Q2xpY2tYID0gbG9va3NDb250YWluZXJSZWxhdGl2ZVxuICAgICAgPyByZWN0LmxlZnQgKyBjbGlja1BvaW50LnhcbiAgICAgIDogY2xpY2tQb2ludC54O1xuICAgIGNvbnN0IHZpZXdwb3J0Q2xpY2tZID0gbG9va3NDb250YWluZXJSZWxhdGl2ZVxuICAgICAgPyByZWN0LnRvcCArIGNsaWNrUG9pbnQueVxuICAgICAgOiBjbGlja1BvaW50Lnk7XG5cbiAgICAvLyBNYXAgY29udGFpbmVyIGJvdW5kYXJpZXMgaW4gdmlld3BvcnQgY29vcmRzXG4gICAgY29uc3QgbWFwTGVmdCA9IHJlY3QubGVmdDtcbiAgICBjb25zdCBtYXBUb3AgPSByZWN0LnRvcDtcbiAgICBjb25zdCBtYXBSaWdodCA9IHJlY3QucmlnaHQ7XG4gICAgY29uc3QgbWFwQm90dG9tID0gdGhpcy5nZXRFZmZlY3RpdmVNYXBCb3R0b20odmlldywgbWFyZ2luKTtcblxuICAgIC8vIFByZWZlciBib3R0b20tcmlnaHQgb2YgY2xpY2tcbiAgICBsZXQgeCA9IHZpZXdwb3J0Q2xpY2tYICsgbWFyZ2luO1xuICAgIGxldCB5ID0gdmlld3BvcnRDbGlja1kgKyBtYXJnaW47XG5cbiAgICAvLyBGbGlwIGxlZnQgaWYgb3ZlcmZsb3dpbmcgcmlnaHQgZWRnZSAoQ1JJVElDQUwhKVxuICAgIC8vIENoZWNrIGlmIHBvcHVwIHdvdWxkIGdvIG91dHNpZGUgbWFwJ3MgcmlnaHQgYm91bmRhcnlcbiAgICBpZiAoeCArIHBvcHVwVyA+IG1hcFJpZ2h0IC0gbWFyZ2luKSB7XG4gICAgICB4ID0gdmlld3BvcnRDbGlja1ggLSBwb3B1cFcgLSBtYXJnaW47XG4gICAgfVxuXG4gICAgLy8gRmxpcCB1cCBpZiBvdmVyZmxvd2luZyBib3R0b20gZWRnZVxuICAgIGlmICh5ICsgcG9wdXBIID4gbWFwQm90dG9tIC0gbWFyZ2luKSB7XG4gICAgICB5ID0gdmlld3BvcnRDbGlja1kgLSBwb3B1cEggLSBtYXJnaW47XG4gICAgfVxuXG4gICAgLy8gRmluYWwgaGFyZCBjbGFtcCB0byBtYXAgY29udGFpbmVyIGJvdW5kc1xuICAgIC8vIFRoaXMgaXMgdGhlIGNyaXRpY2FsIHBhcnQgLSBlbnN1cmUgcG9wdXAgTkVWRVIgZXhjZWVkcyBtYXAgYm91bmRzXG4gICAgY29uc3QgbWluWCA9IG1hcExlZnQgKyBtYXJnaW47XG4gICAgY29uc3QgbWF4WCA9IG1hcFJpZ2h0IC0gcG9wdXBXIC0gbWFyZ2luO1xuICAgIGNvbnN0IG1pblkgPSBtYXBUb3AgKyBtYXJnaW47XG4gICAgY29uc3QgbWF4WSA9IG1hcEJvdHRvbSAtIHBvcHVwSCAtIG1hcmdpbjtcblxuICAgIHggPSBNYXRoLm1heChtaW5YLCBNYXRoLm1pbih4LCBtYXhYKSk7XG4gICAgeSA9IE1hdGgubWF4KG1pblksIE1hdGgubWluKHksIG1heFkpKTtcblxuICAgIC8vIEZJTkFMIFNBRkVUWSBORVQ6IEVuc3VyZSB4IG5ldmVyIGV4Y2VlZHMgcmlnaHQgYm91bmRhcnlcbiAgICBpZiAoeCArIHBvcHVwVyA+IG1hcFJpZ2h0IC0gbWFyZ2luKSB7XG4gICAgICB4ID0gbWFwUmlnaHQgLSBwb3B1cFcgLSBtYXJnaW47XG4gICAgfVxuICAgIC8vIEFsc28gZW5zdXJlIHggPj0gbGVmdCBib3VuZGFyeVxuICAgIGlmICh4IDwgbWFwTGVmdCArIG1hcmdpbikge1xuICAgICAgeCA9IG1hcExlZnQgKyBtYXJnaW47XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9O1xuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShcbiAgICBwcmV2UHJvcHM6IFJlYWRvbmx5PEFsbFdpZGdldFByb3BzPENvbmZpZz4+LFxuICAgIHByZXZTdGF0ZTogUmVhZG9ubHk8U3RhdGU+LFxuICApIHtcbiAgICBjb25zdCBwcmV2RHMgPSBnZXRTZWxlY3RlZERzSWRzKHByZXZQcm9wcy51c2VEYXRhU291cmNlcykuam9pbihcInxcIik7XG4gICAgY29uc3QgbmV4dERzID0gZ2V0U2VsZWN0ZWREc0lkcyh0aGlzLnByb3BzLnVzZURhdGFTb3VyY2VzKS5qb2luKFwifFwiKTtcbiAgICBjb25zdCBkc0NoYW5nZWQgPSBwcmV2RHMgIT09IG5leHREcztcbiAgICBjb25zdCBwcmV2TWFwID0gU3RyaW5nKFxuICAgICAgKHByZXZQcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uWzBdIHx8XG4gICAgICAgIChwcmV2UHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LmdldD8uKDApIHx8XG4gICAgICAgIFwiXCIsXG4gICAgKTtcbiAgICBjb25zdCBuZXh0TWFwID0gU3RyaW5nKFxuICAgICAgKHRoaXMucHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LlswXSB8fFxuICAgICAgICAodGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uZ2V0Py4oMCkgfHxcbiAgICAgICAgXCJcIixcbiAgICApO1xuICAgIGNvbnN0IG1hcENoYW5nZWQgPSBwcmV2TWFwICE9PSBuZXh0TWFwO1xuICAgIGlmICgoZHNDaGFuZ2VkIHx8IG1hcENoYW5nZWQpICYmIHRoaXMuc3RhdGUuamltdU1hcFZpZXcpIHtcbiAgICAgIHZvaWQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbih0aGlzLnN0YXRlLmppbXVNYXBWaWV3KTtcbiAgICB9IGVsc2UgaWYgKG1hcENoYW5nZWQpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVNYXBWaWV3RmFsbGJhY2soKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBwcmV2U3RhdGUuc2hvd1BvcHVwICE9PSB0aGlzLnN0YXRlLnNob3dQb3B1cCB8fFxuICAgICAgcHJldlN0YXRlLnBvcHVwTWluaW1pemVkICE9PSB0aGlzLnN0YXRlLnBvcHVwTWluaW1pemVkXG4gICAgKSB7XG4gICAgICB0aGlzLmJyb2FkY2FzdFBvcHVwVmlzaWJpbGl0eShcbiAgICAgICAgdGhpcy5zdGF0ZS5zaG93UG9wdXAgJiYgIXRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQsXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0aGlzLnN0YXRlLnNob3dQb3B1cCAmJlxuICAgICAgIXRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQgJiZcbiAgICAgIHByZXZTdGF0ZS5waW5Ub0Nvcm5lciAhPT0gdGhpcy5zdGF0ZS5waW5Ub0Nvcm5lclxuICAgICkge1xuICAgICAgdGhpcy5icm9hZGNhc3RQb3B1cFZpc2liaWxpdHkodHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCB0aGlzLnN0YXRlLnBvcHVwTWluaW1pemVkKSByZXR1cm47XG5cbiAgICBjb25zdCBvcGVuZWROb3cgPVxuICAgICAgKHRoaXMuc3RhdGUuc2hvd1BvcHVwICYmICFwcmV2U3RhdGUuc2hvd1BvcHVwKSB8fFxuICAgICAgKHByZXZTdGF0ZS5wb3B1cE1pbmltaXplZCAmJiAhdGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCk7XG4gICAgY29uc3QgYXR0YWNobWVudHNDaGFuZ2VkID1cbiAgICAgIHRoaXMuc3RhdGUubG9hZGluZ0F0dGFjaG1lbnRzICE9PSBwcmV2U3RhdGUubG9hZGluZ0F0dGFjaG1lbnRzIHx8XG4gICAgICAodGhpcy5zdGF0ZS5hdHRhY2htZW50cz8ubGVuZ3RoIHx8IDApICE9PVxuICAgICAgICAocHJldlN0YXRlLmF0dGFjaG1lbnRzPy5sZW5ndGggfHwgMCk7XG4gICAgY29uc3QgbG9hZGluZ0NoYW5nZWQgPSB0aGlzLnN0YXRlLmxvYWRpbmcgIT09IHByZXZTdGF0ZS5sb2FkaW5nO1xuICAgIGNvbnN0IGF0dHJzQ2hhbmdlZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRBdHRycyAhPT0gcHJldlN0YXRlLnNlbGVjdGVkQXR0cnM7XG5cbiAgICBpZiAoXG4gICAgICAhb3BlbmVkTm93ICYmXG4gICAgICAhYXR0YWNobWVudHNDaGFuZ2VkICYmXG4gICAgICAhbG9hZGluZ0NoYW5nZWQgJiZcbiAgICAgICFhdHRyc0NoYW5nZWRcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNjaGVkdWxlUG9wdXBMYXlvdXRBZnRlckNvbnRlbnQoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2VQb3B1cCA9IChvcHRzPzoge1xuICAgIHJlc3RvcmVFeHRlbnQ/OiBib29sZWFuO1xuICAgIG5vdGlmeURlc2VsZWN0PzogYm9vbGVhbjtcbiAgfSkgPT4ge1xuICAgIC8vIENsb3NpbmcgdGhlIHBhbmVsIGFsb25lIG11c3Qga2VlcCB0aGUgcG9seWdvbiBoaWdobGlnaHQgKyBtYXAgZXh0ZW50LlxuICAgIC8vIEV4cGxpY2l0IGNhbGxlcnMgKGVtcHR5IG1hcCBjbGljayAvIGdlbyByZXNldCkgb3B0IGludG8gcmVzdG9yZS9kZXNlbGVjdC5cbiAgICBjb25zdCByZXN0b3JlRXh0ZW50ID0gb3B0cz8ucmVzdG9yZUV4dGVudCA9PT0gdHJ1ZTtcbiAgICBjb25zdCBub3RpZnlEZXNlbGVjdCA9IG9wdHM/Lm5vdGlmeURlc2VsZWN0ID09PSB0cnVlO1xuXG4gICAgLy8gSW52YWxpZGF0ZSBldmVyeSBwZW5kaW5nIGhpdFRlc3QvcXVlcnkvYXR0YWNobWVudCByZXF1ZXN0LiBPdGhlcndpc2UgYVxuICAgIC8vIGZpZWxkIGNsaWNrIHRoYXQgd2FzIHN0aWxsIGxvYWRpbmcgY291bGQgcmVvcGVuIGl0cyBzdGFsZSBwb3B1cCBhZnRlclxuICAgIC8vIHRoZSB1c2VyIGhhZCBhbHJlYWR5IG1vdmVkIHRvIGFub3RoZXIgZGlzdHJpY3Qgb3IgcmVnaW9uLlxuICAgIHRoaXMuX2NsaWNrR2VuZXJhdGlvbiArPSAxO1xuICAgIHRoaXMuX2xhdGVzdEluZGljZXNSZXF1ZXN0SWQgKz0gMTtcblxuICAgIGlmICghdGhpcy5zdGF0ZS5zaG93UG9wdXApIHtcbiAgICAgIGlmIChub3RpZnlEZXNlbGVjdCkge1xuICAgICAgICB0aGlzLmNsZWFySGlnaGxpZ2h0KCk7XG4gICAgICAgIHRoaXMubm90aWZ5R3JhZmZQb2x5Z29uU2VsZWN0aW9uKFwiXCIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGlmICghcmVzdG9yZUV4dGVudCkgdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uID0gbnVsbDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIHNlbGVjdGVkQXR0cnM6IG51bGwsXG4gICAgICAgIHNlbGVjdGVkT0lEOiBudWxsLFxuICAgICAgICBvYmplY3RJZEZpZWxkOiBudWxsLFxuICAgICAgICBsYXN0Q2xpY2tlZERzSWQ6IG51bGwsXG4gICAgICAgIGxhc3RDbGlja2VkTGF5ZXJLZXk6IG51bGwsXG4gICAgICAgIHBvcHVwUG9zaXRpb246IG51bGwsXG4gICAgICAgIGNsaWNrU2NyZWVuUG9pbnQ6IG51bGwsXG4gICAgICAgIHBvcHVwTWluaW1pemVkOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChub3RpZnlEZXNlbGVjdCkge1xuICAgICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuICAgICAgdGhpcy5ub3RpZnlHcmFmZlBvbHlnb25TZWxlY3Rpb24oXCJcIiwgZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLnJldm9rZUFsbEF0dGFjaG1lbnRVcmxzKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzaG93UG9wdXA6IGZhbHNlLFxuICAgICAgcG9wdXBNaW5pbWl6ZWQ6IGZhbHNlLFxuICAgICAgcG9wdXBQb3NpdGlvbjogbnVsbCxcbiAgICAgIGNsaWNrU2NyZWVuUG9pbnQ6IG51bGwsXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgc2VsZWN0ZWRBdHRyczogbnVsbCxcbiAgICAgIHNlbGVjdGVkT0lEOiBudWxsLFxuICAgICAgb2JqZWN0SWRGaWVsZDogbnVsbCxcbiAgICAgIGxhc3RDbGlja2VkRHNJZDogbnVsbCxcbiAgICAgIGxhc3RDbGlja2VkTGF5ZXJLZXk6IG51bGwsXG4gICAgICBhdHRhY2htZW50czogW10sXG4gICAgICBhdHRhY2htZW50c0V4cGFuZGVkOiBmYWxzZSxcbiAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICBjaGFydEV4cGFuZGVkOiBmYWxzZSxcbiAgICAgIGNoYXJ0SG92ZXJJbmRleDogbnVsbCxcbiAgICAgIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiBmYWxzZSxcbiAgICAgIGxhdGVzdEluZGV4RGF0ZTogbnVsbCxcbiAgICAgIGxhdGVzdEluZGV4VmFsdWVzOiBudWxsLFxuICAgIH0pO1xuICAgIGlmIChyZXN0b3JlRXh0ZW50KSB7XG4gICAgICB0aGlzLnJlc3RvcmVFeHRlbnRCZWZvcmVTZWxlY3Rpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLyoqIEhlYWRlciBYIOKAlCBjb2xsYXBzZSB0aGUgcGFuZWw7IGtlZXAgcG9seWdvbiBzZWxlY3Rpb24gKyBsb2FkZWQgYXR0cnMuICovXG4gIHByaXZhdGUgbWluaW1pemVQb3B1cCA9ICgpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCB8fCAhdGhpcy5zdGF0ZS5zaG93UG9wdXAgfHwgdGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHsgcG9wdXBNaW5pbWl6ZWQ6IHRydWUgfSk7XG4gIH07XG5cbiAgLyoqIEV4cGFuZCBhIHByZXZpb3VzbHkgbWluaW1pemVkIGF0dHJpYnV0ZSBwYW5lbC4gKi9cbiAgcHJpdmF0ZSBleHBhbmRQb3B1cCA9ICgpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCB8fCAhdGhpcy5zdGF0ZS5zaG93UG9wdXAgfHwgIXRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBvcHVwTWluaW1pemVkOiBmYWxzZSB9KTtcbiAgfTtcblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tIERTIGhvb2sgKGluc3RhbnRpYXRlcyBEUykgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIG9uRGF0YVNvdXJjZUNyZWF0ZWQgPSAoZHM6IFF1ZXJpYWJsZURhdGFTb3VyY2UpID0+IHtcbiAgICBpZiAoIWRzPy5pZCkgcmV0dXJuO1xuICAgIHRoaXMuZGF0YVNvdXJjZUVuZ2luZS5vbkRzQ3JlYXRlZChcbiAgICAgIGRzLFxuICAgICAgZ2V0U2VsZWN0ZWREc0lkcyh0aGlzLnByb3BzLnVzZURhdGFTb3VyY2VzKSxcbiAgICApO1xuICAgIHRoaXMuc2V0U3RhdGUoKHByZXYpID0+ICh7XG4gICAgICBkYXRhU291cmNlc0J5SWQ6IHsgLi4uKHByZXYuZGF0YVNvdXJjZXNCeUlkIHx8IHt9KSwgW2RzLmlkXTogZHMgfSxcbiAgICB9KSk7XG4gICAgaWYgKHRoaXMuc3RhdGUuamltdU1hcFZpZXcpIHtcbiAgICAgIHZvaWQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbih0aGlzLnN0YXRlLmppbXVNYXBWaWV3KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zY2hlZHVsZU1hcFZpZXdGYWxsYmFjaygpO1xuICAgIH1cbiAgfTtcblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tIENoYXJ0IHJlbmRlcmluZyAtLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgcHJpdmF0ZSB0b2dnbGVDaGFydEV4cGFuZGVkID0gKCk6IHZvaWQgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoKHByZXYpID0+ICh7IGNoYXJ0RXhwYW5kZWQ6ICFwcmV2LmNoYXJ0RXhwYW5kZWQgfSkpO1xuICB9O1xuXG4gIHByaXZhdGUgcmVuZGVyQ2hhcnRJY29uID0gKHR5cGU6IFwiYmFyXCIgfCBcImxpbmVcIiA9IFwiYmFyXCIpOiBKU1guRWxlbWVudCA9PlxuICAgIHR5cGUgPT09IFwibGluZVwiID8gKFxuICAgICAgPExpbmVDaGFydCBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC1pY29uXCIgc3Ryb2tlV2lkdGg9ezJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgKSA6IChcbiAgICAgIDxCYXJDaGFydDMgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtaWNvblwiIHN0cm9rZVdpZHRoPXsyfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICk7XG5cbiAgcHJpdmF0ZSBjbGVhckNoYXJ0SG92ZXIgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY2hhcnRIb3ZlckluZGV4ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBjaGFydEhvdmVySW5kZXg6IG51bGwgfSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgc2V0Q2hhcnRIb3ZlciA9IChpbmRleDogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY2hhcnRIb3ZlckluZGV4ICE9PSBpbmRleCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNoYXJ0SG92ZXJJbmRleDogaW5kZXggfSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgbmljZUNoYXJ0TWF4KHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBuaWNlQ2hhcnRNYXhTaGFyZWQodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRDaGFydFRpY2sodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZvcm1hdENoYXJ0VGlja1NoYXJlZCh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIGZvcm1hdENoYXJ0VG9vbHRpcFZhbHVlKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBmb3JtYXRDaGFydFRvb2x0aXBWYWx1ZVNoYXJlZCh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkU21vb3RoTGluZVBhdGgoXG4gICAgcG9pbnRzOiBBcnJheTx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0+LFxuICApOiBzdHJpbmcge1xuICAgIGlmICghcG9pbnRzLmxlbmd0aCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBgTSAke3BvaW50c1swXS54fSAke3BvaW50c1swXS55fWA7XG4gICAgfVxuXG4gICAgbGV0IHBhdGggPSBgTSAke3BvaW50c1swXS54fSAke3BvaW50c1swXS55fWA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBjb25zdCBwMCA9IHBvaW50c1tpIC0gMV0gfHwgcG9pbnRzW2ldO1xuICAgICAgY29uc3QgcDEgPSBwb2ludHNbaV07XG4gICAgICBjb25zdCBwMiA9IHBvaW50c1tpICsgMV07XG4gICAgICBjb25zdCBwMyA9IHBvaW50c1tpICsgMl0gfHwgcDI7XG4gICAgICBjb25zdCBjcDF4ID0gcDEueCArIChwMi54IC0gcDAueCkgLyA2O1xuICAgICAgY29uc3QgY3AxeSA9IHAxLnkgKyAocDIueSAtIHAwLnkpIC8gNjtcbiAgICAgIGNvbnN0IGNwMnggPSBwMi54IC0gKHAzLnggLSBwMS54KSAvIDY7XG4gICAgICBjb25zdCBjcDJ5ID0gcDIueSAtIChwMy55IC0gcDEueSkgLyA2O1xuICAgICAgcGF0aCArPSBgIEMgJHtjcDF4fSAke2NwMXl9LCAke2NwMnh9ICR7Y3AyeX0sICR7cDIueH0gJHtwMi55fWA7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZFJvdW5kZWRCYXJQYXRoKFxuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXIsXG4gICAgd2lkdGg6IG51bWJlcixcbiAgICBoZWlnaHQ6IG51bWJlcixcbiAgICByYWRpdXM6IG51bWJlcixcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCByID0gTWF0aC5taW4ocmFkaXVzLCB3aWR0aCAvIDIsIGhlaWdodCk7XG4gICAgY29uc3QgYm90dG9tID0geSArIGhlaWdodDtcbiAgICByZXR1cm4gW1xuICAgICAgYE0gJHt4fSAke2JvdHRvbX1gLFxuICAgICAgYEwgJHt4fSAke3kgKyByfWAsXG4gICAgICBgUSAke3h9ICR7eX0gJHt4ICsgcn0gJHt5fWAsXG4gICAgICBgTCAke3ggKyB3aWR0aCAtIHJ9ICR7eX1gLFxuICAgICAgYFEgJHt4ICsgd2lkdGh9ICR7eX0gJHt4ICsgd2lkdGh9ICR7eSArIHJ9YCxcbiAgICAgIGBMICR7eCArIHdpZHRofSAke2JvdHRvbX1gLFxuICAgICAgXCJaXCIsXG4gICAgXS5qb2luKFwiIFwiKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyTGF0ZXN0SW5kaWNlcyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGxvYWRpbmdMYXRlc3RJbmRpY2VzLCBsYXRlc3RJbmRleERhdGUsIGxhdGVzdEluZGV4VmFsdWVzIH0gPVxuICAgICAgdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IGhhc1ZhbHVlcyA9ICEhbGF0ZXN0SW5kZXhWYWx1ZXM7XG4gICAgY29uc3Qgc2hvd0Jsb2NraW5nTG9hZGVyID0gbG9hZGluZ0xhdGVzdEluZGljZXMgJiYgIWhhc1ZhbHVlcztcbiAgICBjb25zdCBzaG93UmVmcmVzaExvYWRlciA9IGxvYWRpbmdMYXRlc3RJbmRpY2VzICYmIGhhc1ZhbHVlcztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLWxpc3QgYWdyaTMtaW5kaWNlcy1saXN0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtZmllbGQtcm93IGFncmkzLWluZGljZXMtaGVhZGVyLXJvd1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLWxhYmVsIGFncmkzLWluZGljZXMtdGl0bGVcIj5cbiAgICAgICAgICAgIDxTcHJvdXQgc2l6ZT17MTR9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICB7dGhpcy50cihcImluZGljZXMudGl0bGVcIil9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHtsYXRlc3RJbmRleERhdGUgJiYgIWxvYWRpbmdMYXRlc3RJbmRpY2VzICYmIChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLXZhbHVlIGFncmkzLWluZGljZXMtZGF0ZVwiPlxuICAgICAgICAgICAgICA8Q2FsZW5kYXJEYXlzIHNpemU9ezEzfSBzdHJva2VXaWR0aD17Mn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAge2xhdGVzdEluZGV4RGF0ZX1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3Nob3dCbG9ja2luZ0xvYWRlciA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWluZGljZXMtbG9hZGluZy1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxBZ3JpQ2hhcnRMb2FkZXIgbGFiZWw9e3RoaXMudHIoXCJpbmRpY2VzLmxvYWRpbmdcIil9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBoYXNWYWx1ZXMgPyAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaTMtaW5kaWNlcy1ib2R5JHtcbiAgICAgICAgICAgICAgc2hvd1JlZnJlc2hMb2FkZXIgPyBcIiBhZ3JpMy1pbmRpY2VzLWJvZHktLWxvYWRpbmdcIiA6IFwiXCJcbiAgICAgICAgICAgIH1gfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtzaG93UmVmcmVzaExvYWRlciA/IChcbiAgICAgICAgICAgICAgPEFncmlDaGFydExvYWRlciBsYWJlbD17dGhpcy50cihcImluZGljZXMubG9hZGluZ1wiKX0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAge0FncmlQb2x5Z29uLlZFR19JTkRFWF9GSUVMRFMuZmlsdGVyKFxuICAgICAgICAgICAgICAoZikgPT4gbGF0ZXN0SW5kZXhWYWx1ZXNbZl0gIT0gbnVsbCxcbiAgICAgICAgICAgICkubWFwKChmKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BhZ3JpMy1maWVsZC1yb3cgYWdyaTMtaW5kZXgtcm93IGFncmkzLWluZGV4LXJvdy0tJHtmfWB9XG4gICAgICAgICAgICAgICAga2V5PXtmfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGFncmkzLWZpZWxkLWxhYmVsIGFncmkzLWluZGV4LWxhYmVsIGFncmkzLWluZGV4LWxhYmVsLS0ke2Z9YH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1pbmRleC1kb3RcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAge2YudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtZmllbGQtdmFsdWVcIj5cbiAgICAgICAgICAgICAgICAgIHtsYXRlc3RJbmRleFZhbHVlc1tmXS50b0ZpeGVkKDQpfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLXN0YXR1cy1pbmRpY2F0b3IgYWdyaTMtc3RhdHVzLXdhaXRpbmdcIj5cbiAgICAgICAgICAgIDxJbmJveCBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaWNvblwiIHNpemU9ezE2fSBzdHJva2VXaWR0aD17Mi4yfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAge3RoaXMudHIoXCJpbmRpY2VzLm5vbmVcIil9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIHByaXZhdGUgcmVuZGVyQ2hhcnQgPSAoKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgaWYgKCFjb25maWc/LmNoYXJ0RW5hYmxlZCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBjaGFydEZpZWxkcyA9IGNvbmZpZy5jaGFydEZpZWxkcyB8fCBbXTtcbiAgICBjb25zdCBjaGFydFR5cGUgPSBjb25maWcuY2hhcnRUeXBlIHx8IFwiYmFyXCI7XG4gICAgY29uc3QgY2hhcnRUaXRsZSA9IGNvbmZpZy5jaGFydFRpdGxlIHx8IFwiXCI7XG4gICAgY29uc3QgY2hhcnRDb2xvciA9IGNvbmZpZy5jaGFydENvbG9yIHx8IFwiIzAwYThlOFwiO1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEF0dHJzO1xuICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMuc3RhdGUucGluVG9Db3JuZXI7XG4gICAgY29uc3QgY2hhcnRFeHBhbmRlZCA9IHBpbm5lZCB8fCB0aGlzLnN0YXRlLmNoYXJ0RXhwYW5kZWQ7XG5cbiAgICBpZiAoIWF0dHJzIHx8IGNoYXJ0RmllbGRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBDb2xsZWN0IG51bWVyaWMgZGF0YSBmb3IgY2hhcnRcbiAgICBjb25zdCBkYXRhUG9pbnRzOiB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfVtdID0gW107XG4gICAgZm9yIChjb25zdCBmaWVsZE5hbWUgb2YgY2hhcnRGaWVsZHMpIHtcbiAgICAgIGNvbnN0IHJhdyA9IGF0dHJzW2ZpZWxkTmFtZV07XG4gICAgICBjb25zdCBudW1WYWwgPSB0eXBlb2YgcmF3ID09PSBcIm51bWJlclwiID8gcmF3IDogcGFyc2VGbG9hdChyYXcpO1xuICAgICAgaWYgKCFpc05hTihudW1WYWwpKSB7XG4gICAgICAgIGRhdGFQb2ludHMucHVzaCh7XG4gICAgICAgICAgbGFiZWw6IHRoaXMuZ2V0RmllbGRBbGlhcyhmaWVsZE5hbWUpLFxuICAgICAgICAgIHZhbHVlOiBudW1WYWwsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkYXRhUG9pbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBjaGFydExhYmVsID0gY2hhcnRUaXRsZSB8fCBkYXRhUG9pbnRzWzBdPy5sYWJlbCB8fCBcIkdyYWZpa1wiO1xuICAgIGNvbnN0IGhvdmVySW5kZXggPSB0aGlzLnN0YXRlLmNoYXJ0SG92ZXJJbmRleDtcblxuICAgIGNvbnN0IHN2Z1dpZHRoID0gMzQwO1xuICAgIGNvbnN0IHN2Z0hlaWdodCA9IDE2ODtcbiAgICBjb25zdCBwYWRkaW5nID0geyB0b3A6IDEyLCByaWdodDogMTIsIGJvdHRvbTogOCwgbGVmdDogNDAgfTtcbiAgICBjb25zdCBjaGFydFcgPSBzdmdXaWR0aCAtIHBhZGRpbmcubGVmdCAtIHBhZGRpbmcucmlnaHQ7XG4gICAgY29uc3QgY2hhcnRIID0gc3ZnSGVpZ2h0IC0gcGFkZGluZy50b3AgLSBwYWRkaW5nLmJvdHRvbTtcblxuICAgIGNvbnN0IG1heFZhbCA9IE1hdGgubWF4KC4uLmRhdGFQb2ludHMubWFwKChkKSA9PiBkLnZhbHVlKSwgMCk7XG4gICAgY29uc3QgeU1heCA9IHRoaXMubmljZUNoYXJ0TWF4KG1heFZhbCk7XG4gICAgY29uc3Qgc2NhbGVZID0gKHY6IG51bWJlcikgPT4gY2hhcnRIIC0gKHYgLyB5TWF4KSAqIGNoYXJ0SDtcblxuICAgIGNvbnN0IGlzRGFyayA9IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWU7XG4gICAgY29uc3QgYXhpc0NvbG9yID0gaXNEYXJrID8gXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNTUpXCIgOiBcIiM5NGEzYjhcIjtcbiAgICBjb25zdCBncmlkQ29sb3IgPSBpc0RhcmsgPyBcInJnYmEoMjU1LDI1NSwyNTUsMC4xNClcIiA6IFwiI2RiZWFmZVwiO1xuICAgIGNvbnN0IGNoYXJ0Qm9keUJnID0gaXNEYXJrID8gXCJ0cmFuc3BhcmVudFwiIDogXCIjZmZmZmZmXCI7XG4gICAgY29uc3QgaGlnaGxpZ2h0RmlsbCA9IGlzRGFya1xuICAgICAgPyBcInJnYmEoMCwgMTY4LCAyMzIsIDAuMTIpXCJcbiAgICAgIDogXCJyZ2JhKDAsIDE2OCwgMjMyLCAwLjEpXCI7XG5cbiAgICBjb25zdCBncmlkTGluZXMgPSA0O1xuICAgIGNvbnN0IGdyaWRTdGVwID0geU1heCAvIGdyaWRMaW5lcztcblxuICAgIGNvbnN0IGJhckxheW91dCA9XG4gICAgICBjaGFydFR5cGUgPT09IFwiYmFyXCJcbiAgICAgICAgPyAoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYmFyR2FwID0gTWF0aC5tYXgoNiwgTWF0aC5taW4oMTAsIGNoYXJ0VyAvIGRhdGFQb2ludHMubGVuZ3RoIC8gNCkpO1xuICAgICAgICAgICAgY29uc3QgYmFyVyA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICAoY2hhcnRXIC0gKGRhdGFQb2ludHMubGVuZ3RoIC0gMSkgKiBiYXJHYXApIC8gZGF0YVBvaW50cy5sZW5ndGgsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFQb2ludHMubWFwKChkLCBpKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHggPSBwYWRkaW5nLmxlZnQgKyBpICogKGJhclcgKyBiYXJHYXApO1xuICAgICAgICAgICAgICBjb25zdCBiYXJIID0gTWF0aC5tYXgoMiwgKGQudmFsdWUgLyB5TWF4KSAqIGNoYXJ0SCk7XG4gICAgICAgICAgICAgIGNvbnN0IHkgPSBwYWRkaW5nLnRvcCArIGNoYXJ0SCAtIGJhckg7XG4gICAgICAgICAgICAgIHJldHVybiB7IC4uLmQsIGksIHgsIHksIGJhclcsIGJhckgsIGNlbnRlclg6IHggKyBiYXJXIC8gMiB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkoKVxuICAgICAgICA6IFtdO1xuXG4gICAgY29uc3QgbGluZVBvaW50cyA9XG4gICAgICBjaGFydFR5cGUgPT09IFwibGluZVwiXG4gICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXBYID1cbiAgICAgICAgICAgICAgZGF0YVBvaW50cy5sZW5ndGggPiAxID8gY2hhcnRXIC8gKGRhdGFQb2ludHMubGVuZ3RoIC0gMSkgOiAwO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFQb2ludHMubWFwKChkLCBpKSA9PiAoe1xuICAgICAgICAgICAgICAuLi5kLFxuICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICB4OlxuICAgICAgICAgICAgICAgIHBhZGRpbmcubGVmdCArXG4gICAgICAgICAgICAgICAgKGRhdGFQb2ludHMubGVuZ3RoID4gMSA/IGkgKiBzdGVwWCA6IGNoYXJ0VyAvIDIpLFxuICAgICAgICAgICAgICB5OiBwYWRkaW5nLnRvcCArIHNjYWxlWShkLnZhbHVlKSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9KSgpXG4gICAgICAgIDogW107XG5cbiAgICBjb25zdCBob3ZlclBvaW50ID1cbiAgICAgIGhvdmVySW5kZXggIT0gbnVsbFxuICAgICAgICA/IGNoYXJ0VHlwZSA9PT0gXCJiYXJcIlxuICAgICAgICAgID8gYmFyTGF5b3V0W2hvdmVySW5kZXhdXG4gICAgICAgICAgOiBsaW5lUG9pbnRzW2hvdmVySW5kZXhdXG4gICAgICAgIDogbnVsbDtcblxuICAgIGNvbnN0IHRvb2x0aXBMZWZ0UGN0ID0gaG92ZXJQb2ludFxuICAgICAgPyBNYXRoLm1heCg4LCBNYXRoLm1pbig4MiwgKGhvdmVyUG9pbnQueCAvIHN2Z1dpZHRoKSAqIDEwMCkpXG4gICAgICA6IDA7XG4gICAgY29uc3QgdG9vbHRpcFRvcFBjdCA9IGhvdmVyUG9pbnRcbiAgICAgID8gTWF0aC5tYXgoNiwgTWF0aC5taW4oNTgsIChob3ZlclBvaW50LnkgLyBzdmdIZWlnaHQpICogMTAwIC0gMTgpKVxuICAgICAgOiAwO1xuXG4gICAgY29uc3QgY2hhcnRTdmcgPSAoXG4gICAgICA8c3ZnXG4gICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgIHZpZXdCb3g9e2AwIDAgJHtzdmdXaWR0aH0gJHtzdmdIZWlnaHR9YH1cbiAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtc3ZnXCJcbiAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogY2hhcnRCb2R5QmcgfX1cbiAgICAgID5cbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PXtwYWRkaW5nLmxlZnR9XG4gICAgICAgICAgeT17cGFkZGluZy50b3B9XG4gICAgICAgICAgd2lkdGg9e2NoYXJ0V31cbiAgICAgICAgICBoZWlnaHQ9e2NoYXJ0SH1cbiAgICAgICAgICBmaWxsPXtpc0RhcmsgPyBcInJnYmEoMjU1LDI1NSwyNTUsMC4wMilcIiA6IFwiI2ZmZmZmZlwifVxuICAgICAgICAgIHJ4PXs2fVxuICAgICAgICAvPlxuXG4gICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBncmlkTGluZXMgKyAxIH0pLm1hcCgoXywgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbCA9IGdyaWRTdGVwICogaTtcbiAgICAgICAgICBjb25zdCB5ID0gcGFkZGluZy50b3AgKyBzY2FsZVkodmFsKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcga2V5PXtgZ3JpZC0ke2l9YH0+XG4gICAgICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICAgICAgeDE9e3BhZGRpbmcubGVmdH1cbiAgICAgICAgICAgICAgICB5MT17eX1cbiAgICAgICAgICAgICAgICB4Mj17c3ZnV2lkdGggLSBwYWRkaW5nLnJpZ2h0fVxuICAgICAgICAgICAgICAgIHkyPXt5fVxuICAgICAgICAgICAgICAgIHN0cm9rZT17Z3JpZENvbG9yfVxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxfVxuICAgICAgICAgICAgICAgIHN0cm9rZURhc2hhcnJheT1cIjMgNVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgeD17cGFkZGluZy5sZWZ0IC0gOH1cbiAgICAgICAgICAgICAgICB5PXt5ICsgNH1cbiAgICAgICAgICAgICAgICBmaWxsPXtheGlzQ29sb3J9XG4gICAgICAgICAgICAgICAgZm9udFNpemU9ezEwfVxuICAgICAgICAgICAgICAgIHRleHRBbmNob3I9XCJlbmRcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3RoaXMuZm9ybWF0Q2hhcnRUaWNrKHZhbCl9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cblxuICAgICAgICB7Y2hhcnRUeXBlID09PSBcImJhclwiICYmXG4gICAgICAgICAgYmFyTGF5b3V0Lm1hcCgoYmFyKSA9PiAoXG4gICAgICAgICAgICA8ZyBrZXk9e2BiYXItJHtiYXIuaX1gfT5cbiAgICAgICAgICAgICAge2hvdmVySW5kZXggPT09IGJhci5pICYmIChcbiAgICAgICAgICAgICAgICA8cmVjdFxuICAgICAgICAgICAgICAgICAgeD17YmFyLnggLSAzfVxuICAgICAgICAgICAgICAgICAgeT17cGFkZGluZy50b3B9XG4gICAgICAgICAgICAgICAgICB3aWR0aD17YmFyLmJhclcgKyA2fVxuICAgICAgICAgICAgICAgICAgaGVpZ2h0PXtjaGFydEh9XG4gICAgICAgICAgICAgICAgICBmaWxsPXtoaWdobGlnaHRGaWxsfVxuICAgICAgICAgICAgICAgICAgcng9ezV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgICBkPXt0aGlzLmJ1aWxkUm91bmRlZEJhclBhdGgoYmFyLngsIGJhci55LCBiYXIuYmFyVywgYmFyLmJhckgsIDUpfVxuICAgICAgICAgICAgICAgIGZpbGw9e2NoYXJ0Q29sb3J9XG4gICAgICAgICAgICAgICAgb3BhY2l0eT17aG92ZXJJbmRleCA9PSBudWxsIHx8IGhvdmVySW5kZXggPT09IGJhci5pID8gMSA6IDAuNDV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtYmFyXCJcbiAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IHRoaXMuc2V0Q2hhcnRIb3ZlcihiYXIuaSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxyZWN0XG4gICAgICAgICAgICAgICAgeD17YmFyLnh9XG4gICAgICAgICAgICAgICAgeT17cGFkZGluZy50b3B9XG4gICAgICAgICAgICAgICAgd2lkdGg9e2Jhci5iYXJXfVxuICAgICAgICAgICAgICAgIGhlaWdodD17Y2hhcnRIfVxuICAgICAgICAgICAgICAgIGZpbGw9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiB0aGlzLnNldENoYXJ0SG92ZXIoYmFyLmkpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICkpfVxuXG4gICAgICAgIHtjaGFydFR5cGUgPT09IFwibGluZVwiICYmIChcbiAgICAgICAgICA8Zz5cbiAgICAgICAgICAgIHtob3ZlckluZGV4ICE9IG51bGwgJiYgbGluZVBvaW50c1tob3ZlckluZGV4XSAmJiAoXG4gICAgICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICAgICAgeDE9e2xpbmVQb2ludHNbaG92ZXJJbmRleF0ueH1cbiAgICAgICAgICAgICAgICB5MT17cGFkZGluZy50b3B9XG4gICAgICAgICAgICAgICAgeDI9e2xpbmVQb2ludHNbaG92ZXJJbmRleF0ueH1cbiAgICAgICAgICAgICAgICB5Mj17cGFkZGluZy50b3AgKyBjaGFydEh9XG4gICAgICAgICAgICAgICAgc3Ryb2tlPXtjaGFydENvbG9yfVxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAgICAgICAgICAgb3BhY2l0eT17MC4zNX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBkPXt0aGlzLmJ1aWxkU21vb3RoTGluZVBhdGgobGluZVBvaW50cyl9XG4gICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgc3Ryb2tlPXtjaGFydENvbG9yfVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17Mi41fVxuICAgICAgICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7bGluZVBvaW50cy5tYXAoKHApID0+IChcbiAgICAgICAgICAgICAgPGcga2V5PXtgcHQtJHtwLml9YH0+XG4gICAgICAgICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAgICAgICAgY3g9e3AueH1cbiAgICAgICAgICAgICAgICAgIGN5PXtwLnl9XG4gICAgICAgICAgICAgICAgICByPXtob3ZlckluZGV4ID09PSBwLmkgPyA1LjUgOiA0fVxuICAgICAgICAgICAgICAgICAgZmlsbD17aXNEYXJrID8gXCIjMGIxYTMwXCIgOiBcIiNmZmZmZmZcIn1cbiAgICAgICAgICAgICAgICAgIHN0cm9rZT17Y2hhcnRDb2xvcn1cbiAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtob3ZlckluZGV4ID09PSBwLmkgPyAyLjUgOiAyfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtcG9pbnRcIlxuICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiB0aGlzLnNldENoYXJ0SG92ZXIocC5pKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgICAgIGN4PXtwLnh9XG4gICAgICAgICAgICAgICAgICBjeT17cC55fVxuICAgICAgICAgICAgICAgICAgcj17MTJ9XG4gICAgICAgICAgICAgICAgICBmaWxsPVwidHJhbnNwYXJlbnRcIlxuICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiB0aGlzLnNldENoYXJ0SG92ZXIocC5pKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2c+XG4gICAgICAgICl9XG4gICAgICA8L3N2Zz5cbiAgICApO1xuXG4gICAgY29uc3QgY2hhcnRCb2R5ID0gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC1ib2R5XCJcbiAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLmNsZWFyQ2hhcnRIb3Zlcn1cbiAgICAgID5cbiAgICAgICAge2hvdmVyUG9pbnQgJiYgKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRvb2x0aXBcIlxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgbGVmdDogYCR7dG9vbHRpcExlZnRQY3R9JWAsXG4gICAgICAgICAgICAgIHRvcDogYCR7dG9vbHRpcFRvcFBjdH0lYCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10b29sdGlwLWxhYmVsXCI+e2hvdmVyUG9pbnQubGFiZWx9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRvb2x0aXAtdmFsdWVcIj5cbiAgICAgICAgICAgICAge3RoaXMuZm9ybWF0Q2hhcnRUb29sdGlwVmFsdWUoaG92ZXJQb2ludC52YWx1ZSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cbiAgICAgICAge2NoYXJ0U3ZnfVxuICAgICAgPC9kaXY+XG4gICAgKTtcblxuICAgIGlmICghY2hhcnRFeHBhbmRlZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRyaWdnZXJcIlxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQ2hhcnRFeHBhbmRlZH1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRyaWdnZXItaWNvblwiPnt0aGlzLnJlbmRlckNoYXJ0SWNvbihjaGFydFR5cGUpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWxhYmVsXCI+e2NoYXJ0TGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRyaWdnZXItY2hldnJvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAg4pa+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtcGFuZWxcIj5cbiAgICAgICAgeyFwaW5uZWQgPyAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC1wYW5lbC1oZWFkZXJcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVDaGFydEV4cGFuZGVkfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRyaWdnZXItaWNvblwiPnt0aGlzLnJlbmRlckNoYXJ0SWNvbihjaGFydFR5cGUpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXRyaWdnZXItbGFiZWxcIj57Y2hhcnRMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWNoZXZyb24gaXMtb3BlblwiXG4gICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIOKWtFxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtcGFuZWwtaGVhZGVyIGFncmkzLWNoYXJ0LXBhbmVsLWhlYWRlci0tc3RhdGljXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWljb25cIj57dGhpcy5yZW5kZXJDaGFydEljb24oY2hhcnRUeXBlKX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWxhYmVsXCI+e2NoYXJ0TGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LWNvbnRhaW5lclwiPntjaGFydEJvZHl9PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gUG9wdXAgVUkgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgcmVuZGVyUG9wdXAgPSAoKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgc2VsZWN0ZWRBdHRycyxcbiAgICAgIHNlbGVjdGVkT0lELFxuICAgICAgbG9hZGluZyxcbiAgICAgIGVycm9yLFxuICAgICAgc2hvd1BvcHVwLFxuICAgICAgcG9wdXBNaW5pbWl6ZWQsXG4gICAgICBwb3B1cFBvc2l0aW9uLFxuICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzLFxuICAgICAgYXR0YWNobWVudHMsXG4gICAgICBhdHRhY2htZW50c0Vycm9yLFxuICAgICAgcGluVG9Db3JuZXIsXG4gICAgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBpZiAoIXNob3dQb3B1cCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBmaWVsZHMgPSAodGhpcy5wcm9wcy5jb25maWc/LmZpZWxkc1RvU2hvdyB8fCBbXSlcbiAgICAgIC5tYXAoKG4pID0+IHRoaXMucmVzb2x2ZUZpZWxkTmFtZShuKSB8fCBuKVxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcblxuICAgIGNvbnN0IHRpdGxlID0gdGhpcy50cihcInRpdGxlLmF0dHJpYnV0ZXNcIik7XG5cbiAgICBjb25zdCB2aWV3ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldztcbiAgICBjb25zdCBsYXlvdXRQb3MgPSBwb3B1cFBvc2l0aW9uO1xuXG4gICAgaWYgKHBvcHVwTWluaW1pemVkKSB7XG4gICAgICBjb25zdCB2aWV3Rm9yQ2hpcCA9IHZpZXcgfHwgdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldyB8fCBudWxsO1xuICAgICAgY29uc3QgbWFwUmVjdCA9IHZpZXdGb3JDaGlwID8gdGhpcy5nZXRNYXBBcmVhUmVjdCh2aWV3Rm9yQ2hpcCkgOiBudWxsO1xuICAgICAgY29uc3QgY2hpcFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0gbWFwUmVjdFxuICAgICAgICA/IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICByaWdodDogTWF0aC5tYXgoXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmlubmVyV2lkdGggOiBtYXBSZWN0LnJpZ2h0KSAtXG4gICAgICAgICAgICAgICAgbWFwUmVjdC5yaWdodCArXG4gICAgICAgICAgICAgICAgdGhpcy5EQVNIQk9BUkRfUE9QVVBfVkVSVElDQUxfSU5TRVQsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdG9wOiBtYXBSZWN0LnRvcCArIHRoaXMuREFTSEJPQVJEX1BPUFVQX1ZFUlRJQ0FMX0lOU0VULFxuICAgICAgICAgICAgbGVmdDogXCJhdXRvXCIsXG4gICAgICAgICAgICBib3R0b206IFwiYXV0b1wiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBcIm5vbmVcIixcbiAgICAgICAgICB9XG4gICAgICAgIDoge1xuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLkRBU0hCT0FSRF9QT1BVUF9WRVJUSUNBTF9JTlNFVCxcbiAgICAgICAgICAgIHRvcDogdGhpcy5EQVNIQk9BUkRfUE9QVVBfVkVSVElDQUxfSU5TRVQsXG4gICAgICAgICAgICBsZWZ0OiBcImF1dG9cIixcbiAgICAgICAgICAgIGJvdHRvbTogXCJhdXRvXCIsXG4gICAgICAgICAgfTtcblxuICAgICAgY29uc3Qgc3RvcE1hcEhpdCA9IChlOiBSZWFjdC5TeW50aGV0aWNFdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaTMtcG9wdXAtbWluaW1pemVkICR7XG4gICAgICAgICAgICBwaW5Ub0Nvcm5lciA/IFwiaXMtcGlubmVkXCIgOiBcImlzLWZsb2F0aW5nXCJcbiAgICAgICAgICB9YH1cbiAgICAgICAgICBzdHlsZT17Y2hpcFN0eWxlfVxuICAgICAgICAgIHJlZj17dGhpcy5fcG9wdXBSZWZ9XG4gICAgICAgICAgb25Nb3VzZURvd249e3N0b3BNYXBIaXR9XG4gICAgICAgICAgb25Qb2ludGVyRG93bj17c3RvcE1hcEhpdH1cbiAgICAgICAgICBvbkNsaWNrPXtzdG9wTWFwSGl0fVxuICAgICAgICA+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC1taW5pbWl6ZWQtYnRuXCJcbiAgICAgICAgICAgIG9uTW91c2VEb3duPXtzdG9wTWFwSGl0fVxuICAgICAgICAgICAgb25Qb2ludGVyRG93bj17c3RvcE1hcEhpdH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgIHN0b3BNYXBIaXQoZSk7XG4gICAgICAgICAgICAgIHRoaXMuZXhwYW5kUG9wdXAoKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB0aXRsZT17dGhpcy50cihcImFjdGlvbi5leHBhbmRcIil9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnRyKFwiYWN0aW9uLmV4cGFuZFwiKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC1taW5pbWl6ZWQtYWNjZW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLXBvcHVwLW1pbmltaXplZC10aXRsZVwiPnt0aXRsZX08L3NwYW4+XG4gICAgICAgICAgICA8Q2hldnJvblVwXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLXBvcHVwLW1pbmltaXplZC1pY29uXCJcbiAgICAgICAgICAgICAgc2l6ZT17MTZ9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsyLjR9XG4gICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB3aWR0aDogcG9wdXBXaWR0aCwgaGVpZ2h0OiBwb3B1cEhlaWdodCB9ID0gdGhpcy5nZXRQb3B1cERpbWVuc2lvbnMoXG4gICAgICB2aWV3IHx8IG51bGwsXG4gICAgICBwaW5Ub0Nvcm5lcixcbiAgICAgIGxheW91dFBvcyxcbiAgICApO1xuXG4gICAgY29uc3QgZGltZW5zaW9uU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgICB3aWR0aDogYCR7cG9wdXBXaWR0aH1weGAsXG4gICAgICBtaW5XaWR0aDogYCR7cG9wdXBXaWR0aH1weGAsXG4gICAgICBtYXhXaWR0aDogYCR7cG9wdXBXaWR0aH1weGAsXG4gICAgICBoZWlnaHQ6IGAke3BvcHVwSGVpZ2h0fXB4YCxcbiAgICAgIG1heEhlaWdodDogYCR7cG9wdXBIZWlnaHR9cHhgLFxuICAgIH07XG5cbiAgICBjb25zdCBzdHlsZVBpbm5lZDogUmVhY3QuQ1NTUHJvcGVydGllcyA9IGxheW91dFBvc1xuICAgICAgPyB7XG4gICAgICAgICAgbGVmdDogbGF5b3V0UG9zLngsXG4gICAgICAgICAgdG9wOiBsYXlvdXRQb3MueSxcbiAgICAgICAgICB0cmFuc2Zvcm06IFwibm9uZVwiLFxuICAgICAgICAgIC4uLmRpbWVuc2lvblN0eWxlLFxuICAgICAgICB9XG4gICAgICA6IHsgLi4uZGltZW5zaW9uU3R5bGUgfTtcblxuICAgIGNvbnN0IHN0eWxlRnJlZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgICAgIGxlZnQ6IGxheW91dFBvcz8ueCB8fCBcIjUwJVwiLFxuICAgICAgdG9wOiBsYXlvdXRQb3M/LnkgfHwgXCI1MCVcIixcbiAgICAgIHRyYW5zZm9ybTogIWxheW91dFBvcyA/IFwidHJhbnNsYXRlKC01MCUsIC01MCUpXCIgOiBcIm5vbmVcIixcbiAgICAgIC4uLmRpbWVuc2lvblN0eWxlLFxuICAgIH07XG5cbiAgICBjb25zdCBwb3B1cFN0eWxlID0gcGluVG9Db3JuZXIgPyBzdHlsZVBpbm5lZCA6IHN0eWxlRnJlZTtcblxuICAgIGNvbnN0IHNob3dBdHRhY2htZW50cyA9XG4gICAgICB0aGlzLnByb3BzLmNvbmZpZz8uc2V0dGluZ3M/LnNob3dBdHRhY2htZW50cyAhPT0gZmFsc2U7XG4gICAgY29uc3QgaGFzQXR0YWNobWVudHMgPSAoYXR0YWNobWVudHM/Lmxlbmd0aCB8fCAwKSA+IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BhZ3JpMy1wb3B1cC1kaXJlY3QgJHtwaW5Ub0Nvcm5lciA/IFwiaXMtcGlubmVkXCIgOiBcImlzLWZsb2F0aW5nXCJ9YH1cbiAgICAgICAgc3R5bGU9e3BvcHVwU3R5bGV9XG4gICAgICAgIHJlZj17dGhpcy5fcG9wdXBSZWZ9XG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtcG9wdXAtaGVhZGVyXCIgb25Nb3VzZURvd249e3RoaXMub25Qb3B1cEhlYWRlck1vdXNlRG93bn0+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaTMtcG9wdXAtcGluJHtwaW5Ub0Nvcm5lciA/IFwiIGFjdGl2ZVwiIDogXCJcIn1gfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVQaW5Ub0Nvcm5lcn1cbiAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgcGluVG9Db3JuZXIgPyB0aGlzLnRyKFwiYWN0aW9uLnVucGluXCIpIDogdGhpcy50cihcImFjdGlvbi5waW5cIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cGluVG9Db3JuZXJ9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7cGluVG9Db3JuZXIgPyAoXG4gICAgICAgICAgICAgIDxQaW4gc2l6ZT17MTV9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8TWFwUGluIHNpemU9ezE1fSBzdHJva2VXaWR0aD17Mi4yfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC10aXRsZVwiPnt0aXRsZX08L2gyPlxuXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC1jbG9zZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm1pbmltaXplUG9wdXB9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnRyKFwiYWN0aW9uLm1pbmltaXplXCIpfVxuICAgICAgICAgICAgdGl0bGU9e3RoaXMudHIoXCJhY3Rpb24ubWluaW1pemVcIil9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFggc2l6ZT17MTZ9IHN0cm9rZVdpZHRoPXsyLjR9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtcG9wdXAtY29udGVudFwiPlxuICAgICAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWVycm9yLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICA8QWxlcnRUcmlhbmdsZSBjbGFzc05hbWU9XCJhZ3JpMy1lcnJvci1pY29uXCIgc2l6ZT17MjB9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtZXJyb3ItdGl0bGVcIj5cbiAgICAgICAgICAgICAgICB7dGhpcy50cihcInN0YXR1cy53YXJuaW5nXCIpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1lcnJvci1tZXNzYWdlXCI+e2Vycm9yfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHtsb2FkaW5nICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtbG9hZGluZy1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgPEFncmlDaGFydExvYWRlciBsYWJlbD17dGhpcy50cihcInN0YXR1cy5sb2FkaW5nRmVhdHVyZVwiKX0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7IWxvYWRpbmcgJiYgc2VsZWN0ZWRBdHRycyAmJiBmaWVsZHMubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLWxpc3RcIj5cbiAgICAgICAgICAgICAge2ZpZWxkc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGVjdGVkQXR0cnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsID0gc2VsZWN0ZWRBdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PSBudWxsIHx8IHZhbCA9PT0gXCJcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhdmFsLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtZmllbGQtcm93XCIga2V5PXtuYW1lfT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtZmllbGQtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5nZXRGaWVsZEFsaWFzKG5hbWUpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMuZm9ybWF0VmFsdWUobmFtZSwgc2VsZWN0ZWRBdHRyc1tuYW1lXSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpfVxuXG4gICAgICAgICAgICAgIHtmaWVsZHMuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChuYW1lKSA9PlxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBdHRycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJlxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBdHRyc1tuYW1lXSAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZEF0dHJzW25hbWVdICE9PSBcIlwiLFxuICAgICAgICAgICAgICApLmxlbmd0aCA9PT0gMCAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaW5kaWNhdG9yIGFncmkzLXN0YXR1cy13YWl0aW5nXCI+XG4gICAgICAgICAgICAgICAgICA8SW5ib3ggY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnRyKFwic3RhdHVzLm5vQ29uZmlndXJlZERhdGFcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuXG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNlbGVjdGVkQXR0cnMgJiYgZmllbGRzLmxlbmd0aCA9PT0gMCAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLXN0YXR1cy1pbmRpY2F0b3IgYWdyaTMtc3RhdHVzLXdhaXRpbmdcIj5cbiAgICAgICAgICAgICAgPFNldHRpbmdzMiBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaWNvblwiIHNpemU9ezE2fSBzdHJva2VXaWR0aD17Mi4yfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICB7dGhpcy50cihcInN0YXR1cy5ub0ZpZWxkc1wiKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7LyogTGF0ZXN0LWRheSB2ZWdldGF0aW9uIGluZGljZXMgKi99XG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNlbGVjdGVkQXR0cnMgJiYgdGhpcy5yZW5kZXJMYXRlc3RJbmRpY2VzKCl9XG5cbiAgICAgICAgICB7LyogQ2hhcnQgKi99XG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNlbGVjdGVkQXR0cnMgJiYgdGhpcy5yZW5kZXJDaGFydCgpfVxuXG4gICAgICAgICAge3Nob3dBdHRhY2htZW50cyAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnRzXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtYXR0YWNobWVudHMtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50cy10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgPEZvbGRlck9wZW4gc2l6ZT17MTV9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICB7dGhpcy50cihcImF0dGFjaG1lbnRzLnRpdGxlXCIpfXtcIiBcIn1cbiAgICAgICAgICAgICAgICAgIHtoYXNBdHRhY2htZW50cyA/IGAoJHthdHRhY2htZW50cy5sZW5ndGh9KWAgOiBcIlwifVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7bG9hZGluZ0F0dGFjaG1lbnRzICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1sb2FkaW5nLWNvbnRhaW5lciBhZ3JpMy1sb2FkaW5nLWNvbnRhaW5lci0tY29tcGFjdFwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW5Ub3A6IDggfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8QWdyaUNoYXJ0TG9hZGVyIGxhYmVsPXt0aGlzLnRyKFwic3RhdHVzLmxvYWRpbmdBdHRhY2htZW50c1wiKX0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICB7IWxvYWRpbmdBdHRhY2htZW50cyAmJiBhdHRhY2htZW50c0Vycm9yICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaW5kaWNhdG9yIGFncmkzLXN0YXR1cy13YWl0aW5nXCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1hcmdpblRvcDogNiB9fVxuICAgICAgICAgICAgICAgICAgdGl0bGU9e2F0dGFjaG1lbnRzRXJyb3J9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPEFsZXJ0VHJpYW5nbGUgY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnRyKFwic3RhdHVzLmF0dGFjaG1lbnRzRXJyb3JcIikgfHwgYXR0YWNobWVudHNFcnJvcn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICB7IWxvYWRpbmdBdHRhY2htZW50cyAmJiAhYXR0YWNobWVudHNFcnJvciAmJiAhaGFzQXR0YWNobWVudHMgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLXN0YXR1cy1pbmRpY2F0b3IgYWdyaTMtc3RhdHVzLXdhaXRpbmdcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luVG9wOiA2IH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPEZvbGRlck9wZW4gY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnRyKFwic3RhdHVzLm5vQXR0YWNobWVudHNcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgeyFsb2FkaW5nQXR0YWNobWVudHMgJiYgaGFzQXR0YWNobWVudHMgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtYXR0YWNobWVudHMtYm9keVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50cy1pbWFnZXMgYWdyaTMtZ3JpZFwiPlxuICAgICAgICAgICAgICAgICAgICB7YXR0YWNobWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChhKSA9PiBhLnByZXZpZXdPYmplY3RVcmwpXG4gICAgICAgICAgICAgICAgICAgICAgLm1hcCgoYSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtgaW1nLSR7YS5pZH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXthLnVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnQtdGh1bWIgYWdyaTMtY2FyZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthLm5hbWUgfHwgdGhpcy50cihcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxvYWQ9e2EubmFtZSB8fCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e2EucHJldmlld09iamVjdFVybCF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXthLm5hbWUgfHwgdGhpcy50cihcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLXRodW1iLWNhcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthLm5hbWUgfHwgXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthLm5hbWUgfHwgdGhpcy50cihcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50cy1maWxlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7YXR0YWNobWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChhKSA9PiAhYS5wcmV2aWV3T2JqZWN0VXJsKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGEpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtYXR0YWNobWVudC1maWxlIGFncmkzLWNhcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2BmaWxlLSR7YS5pZH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnQtZmlsZS10b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50LWZpbGUtbmFtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YS5uYW1lIHx8IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBhcGVyY2xpcCBzaXplPXsxNH0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthLm5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cihcImF0dGFjaG1lbnQuZmlsZUZhbGxiYWNrXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnQtZG93bmxvYWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17YS51cmx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZD17YS5uYW1lIHx8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RG93bmxvYWQgc2l6ZT17MTN9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy50cihcImF0dGFjaG1lbnQuZG93bmxvYWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50LWZpbGUtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoYS5jb250ZW50VHlwZSB8fCBcIlwiKS5zcGxpdChcIi9cIikucG9wKCkgfHwgXCJcIn17XCIgXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Euc2l6ZSA/IGDigKIgJHt0aGlzLmJ5dGVzVG9TaXplKGEuc2l6ZSl9YCA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7IWxvYWRpbmcgJiYgIXNlbGVjdGVkQXR0cnMgJiYgIWVycm9yICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWluZGljYXRvciBhZ3JpMy1zdGF0dXMtd2FpdGluZ1wiPlxuICAgICAgICAgICAgICA8TW91c2VQb2ludGVyQ2xpY2sgY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAge3RoaXMudHIoXCJzdGF0dXMuY2xpY2tQb2x5Z29uXCIpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHVzZU1hcFdpZGdldElkcywgdXNlRGF0YVNvdXJjZXMgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgdGhlbWVDbGFzcyA9IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWVcbiAgICAgID8gXCJhZ3JpMy10aGVtZS1kYXJrXCJcbiAgICAgIDogXCJhZ3JpMy10aGVtZS1saWdodFwiO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgYWdyaTMtYXR0ci1jYXJkICR7dGhlbWVDbGFzc31gfT5cbiAgICAgICAge3RoaXMucmVuZGVyUG9wdXAoKX1cblxuICAgICAgICA8QWdyaUhpZGRlbkNvbm5lY3RvcnNcbiAgICAgICAgICB1c2VEYXRhU291cmNlcz17dXNlRGF0YVNvdXJjZXN9XG4gICAgICAgICAgdXNlTWFwV2lkZ2V0SWRzPXt1c2VNYXBXaWRnZXRJZHN9XG4gICAgICAgICAgb25EYXRhU291cmNlQ3JlYXRlZD17dGhpcy5vbkRhdGFTb3VyY2VDcmVhdGVkfVxuICAgICAgICAgIG9uQWN0aXZlVmlld0NoYW5nZT17dGhpcy5vbkFjdGl2ZVZpZXdDaGFuZ2V9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgYm90dG9tOiBcIjhweFwiLFxuICAgICAgICAgICAgcmlnaHQ6IFwiOHB4XCIsXG4gICAgICAgICAgICB3aWR0aDogXCI4cHhcIixcbiAgICAgICAgICAgIGhlaWdodDogXCI4cHhcIixcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycz8ubGVuZ3RoXG4gICAgICAgICAgICAgID8gXCIjMTBiOTgxXCJcbiAgICAgICAgICAgICAgOiBcIiM5NGEzYjhcIixcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogXCI1MCVcIixcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuNixcbiAgICAgICAgICAgIHRyYW5zaXRpb246IFwiYWxsIDAuM3MgZWFzZVwiLFxuICAgICAgICAgICAgcG9pbnRlckV2ZW50czogXCJub25lXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgICB0aXRsZT17XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnM/Lmxlbmd0aFxuICAgICAgICAgICAgICA/IHRoaXMudHIoXCJzdGF0dXMucmVhZHlcIilcbiAgICAgICAgICAgICAgOiB0aGlzLnRyKFwic3RhdHVzLmxvYWRpbmdcIilcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbmludGVyZmFjZSBJSGFuZGxlTGlrZSB7XG4gIHJlbW92ZTogKCkgPT4gdm9pZDtcbn1cblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iLCIvKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7XG4gIERhdGFTb3VyY2VDb21wb25lbnQsXG4gIGpzeCxcbiAgdHlwZSBEYXRhU291cmNlLFxuICB0eXBlIFF1ZXJpYWJsZURhdGFTb3VyY2UsXG59IGZyb20gXCJqaW11LWNvcmVcIjtcbmltcG9ydCB7IEppbXVNYXBWaWV3Q29tcG9uZW50LCB0eXBlIEppbXVNYXBWaWV3IH0gZnJvbSBcImppbXUtYXJjZ2lzXCI7XG5pbXBvcnQgeyB0b1BsYWluQXJyYXkgfSBmcm9tIFwiLi9hZ3JpLWRhdGEtc291cmNlLWVuZ2luZVwiO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICB1c2VEYXRhU291cmNlcz86IGFueTtcbiAgdXNlTWFwV2lkZ2V0SWRzPzogYW55O1xuICBvbkRhdGFTb3VyY2VDcmVhdGVkPzogKGRzOiBRdWVyaWFibGVEYXRhU291cmNlKSA9PiB2b2lkO1xuICBvbkFjdGl2ZVZpZXdDaGFuZ2U/OiAoamltdU1hcFZpZXc6IEppbXVNYXBWaWV3KSA9PiB2b2lkO1xufVxuXG4vKiogSGlkZGVuIERhdGFTb3VyY2UgKyBNYXAgY29ubmVjdG9ycyAoc2FtZSBwYXR0ZXJuIGFzIEFncmlMb2NhbGl6YXRpb24pLlxuICogT25seSBjb25uZWN0IHRoZSBmaXJzdCB1c2VEYXRhU291cmNlIOKAlCBtb3VudGluZyBhbGwgfjMwKyByZWdpb24gRmVhdHVyZVNlcnZlcnNcbiAqIG9uIGV2ZXJ5IGNoaWxkIHJlbW91bnQgZmxvb2RzIE5ldHdvcmsgd2l0aCBGZWF0dXJlU2VydmVyP2Y9anNvbiBsb2FkcyBhbmRcbiAqIGRvZXMgbm90IGhlbHAgbWFwIGhpdC10ZXN0aW5nIChsaXZlIE1hcFZpZXcgbGF5ZXJzIGFyZSB1c2VkIGluc3RlYWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFncmlIaWRkZW5Db25uZWN0b3JzKHByb3BzOiBQcm9wcyk6IEpTWC5FbGVtZW50IHtcbiAgY29uc3Qgc2VsZWN0ZWRVc2VEYXRhU291cmNlcyA9IHRvUGxhaW5BcnJheTxhbnk+KHByb3BzLnVzZURhdGFTb3VyY2VzKTtcbiAgY29uc3QgbWFwV2lkZ2V0SWQgPSB0b1BsYWluQXJyYXk8c3RyaW5nPihwcm9wcy51c2VNYXBXaWRnZXRJZHMpWzBdO1xuICBjb25zdCBwcmltYXJ5RHMgPSBzZWxlY3RlZFVzZURhdGFTb3VyY2VzWzBdO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcIm5vbmVcIiB9fSBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwcmltYXJ5RHMgPyAoXG4gICAgICAgIDxEYXRhU291cmNlQ29tcG9uZW50XG4gICAgICAgICAga2V5PXtwcmltYXJ5RHM/LmRhdGFTb3VyY2VJZH1cbiAgICAgICAgICB1c2VEYXRhU291cmNlPXtwcmltYXJ5RHN9XG4gICAgICAgICAgb25EYXRhU291cmNlQ3JlYXRlZD17XG4gICAgICAgICAgICBwcm9wcy5vbkRhdGFTb3VyY2VDcmVhdGVkXG4gICAgICAgICAgICAgID8gKGRzOiBEYXRhU291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBwcm9wcy5vbkRhdGFTb3VyY2VDcmVhdGVkPy4oZHMgYXMgUXVlcmlhYmxlRGF0YVNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAge21hcFdpZGdldElkICYmIChcbiAgICAgICAgPEppbXVNYXBWaWV3Q29tcG9uZW50XG4gICAgICAgICAgdXNlTWFwV2lkZ2V0SWQ9e21hcFdpZGdldElkfVxuICAgICAgICAgIG9uQWN0aXZlVmlld0NoYW5nZT17cHJvcHMub25BY3RpdmVWaWV3Q2hhbmdlfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiIsImltcG9ydCB7IHR5cGUgUXVlcmlhYmxlRGF0YVNvdXJjZSB9IGZyb20gXCJqaW11LWNvcmVcIjtcbmltcG9ydCB7XG4gIGJ1aWxkQWdyaVdoZXJlLFxuICBjYW5vbmljYWxpemVSZWdpb25GaWx0ZXJWYWx1ZSxcbiAgZGlzYWJsZUxheWVyUGJmLFxuICBmbExvZyxcbiAgaGF5c3RhY2tNYXRjaGVzUmVnaW9uLFxuICBoYXlzdGFja01hdGNoZXNZZWFyLFxuICBnZXRRdWVyeWFibGVMYXllcixcbiAgcGlja1llYXJSZWdpb25MYXllclBvb2wsXG4gIHByZXBhcmVWYWx1ZUluZGV4LFxuICBxdWlja0xheWVyRmVhdHVyZUNvdW50LFxuICByZXNvbHZlRmVhdHVyZUxheWVyRm9yRmlsdGVycyxcbiAgc2FmZUxvYWRNYXBMYXllcixcbiAgc2NvcmVIYXlzdGFja0ZvckZpbHRlcnMsXG4gIHR5cGUgQWdyaUZpbHRlcnMsXG4gIHR5cGUgUmVzb2x2ZWRGZWF0dXJlTGF5ZXIsXG59IGZyb20gXCIuL2ZlYXR1cmUtbGF5ZXItZGF0YVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gdG9QbGFpbkFycmF5PFQgPSBhbnk+KHZhbDogYW55KTogVFtdIHtcbiAgaWYgKCF2YWwpIHJldHVybiBbXTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkgcmV0dXJuIHZhbCBhcyBUW107XG4gIGlmICh0eXBlb2YgdmFsLmFzTXV0YWJsZSA9PT0gXCJmdW5jdGlvblwiKVxuICAgIHJldHVybiB2YWwuYXNNdXRhYmxlKHsgZGVlcDogdHJ1ZSB9KSBhcyBUW107XG4gIGlmICh0eXBlb2YgdmFsLnRvQXJyYXkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHZhbC50b0FycmF5KCkgYXMgVFtdO1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWxlY3RlZERzSWRzKHVzZURhdGFTb3VyY2VzOiBhbnkpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHVkcyA9IHRvUGxhaW5BcnJheTxhbnk+KHVzZURhdGFTb3VyY2VzKTtcbiAgY29uc3QgaWRzID0gdWRzLm1hcCgodSkgPT4gdT8uZGF0YVNvdXJjZUlkKS5maWx0ZXIoQm9vbGVhbik7XG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoaWRzKSk7XG59XG5cbnR5cGUgU2NvcmVkRHMgPSB7XG4gIGRzOiBRdWVyaWFibGVEYXRhU291cmNlO1xuICBzY29yZTogbnVtYmVyO1xuICByZWdpb25NYXRjaDogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogUmVzb2x2ZXMgdGhlIGFjdGl2ZSBGZWF0dXJlTGF5ZXIgZm9yIGRhc2hib2FyZCB3aWRnZXRzLlxuICogUHJlZmVycyBFWEIgRGF0YVNvdXJjZXMgKHNhbWUgcGF0aCBhcyBBZ3JpTG9jYWxpemF0aW9uKSxcbiAqIGZhbGxzIGJhY2sgdG8gSmltdU1hcFZpZXcgbWFwIGxheWVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFncmlEYXRhU291cmNlRW5naW5lIHtcbiAgcHJpdmF0ZSBkc0J5SWQ6IFJlY29yZDxzdHJpbmcsIFF1ZXJpYWJsZURhdGFTb3VyY2U+ID0ge307XG4gIHByaXZhdGUgc2VsZWN0ZWRJZHM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgcmVzb2x2ZUNhY2hlID0gbmV3IE1hcDxcbiAgICBzdHJpbmcsXG4gICAgUHJvbWlzZTxSZXNvbHZlZEZlYXR1cmVMYXllciB8IG51bGw+XG4gID4oKTtcblxuICBvbkRzQ3JlYXRlZChkczogUXVlcmlhYmxlRGF0YVNvdXJjZSwgaWRzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGlmICghZHM/LmlkKSByZXR1cm47XG4gICAgdGhpcy5kc0J5SWRbZHMuaWRdID0gZHM7XG4gICAgdGhpcy5zZWxlY3RlZElkcyA9IFsuLi5pZHNdO1xuICAgIHRoaXMucmVzb2x2ZUNhY2hlLmNsZWFyKCk7XG4gIH1cblxuICBzeW5jU2VsZWN0aW9uKGlkczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkSWRzID0gWy4uLmlkc107XG4gICAgdGhpcy5yZXNvbHZlQ2FjaGUuY2xlYXIoKTtcbiAgfVxuXG4gIGNsZWFyUmVzb2x2ZUNhY2hlKCk6IHZvaWQge1xuICAgIHRoaXMucmVzb2x2ZUNhY2hlLmNsZWFyKCk7XG4gIH1cblxuICAvKiogVHJ1ZSB3aGlsZSBzZWxlY3RlZCBkYXRhIHNvdXJjZXMgYXJlIHN0aWxsIGNvbm5lY3RpbmcgKG5vIG1hcCBmYWxsYmFjayB5ZXQpLiAqL1xuICBpc1Jlc29sdmVQZW5kaW5nKGppbXVNYXBWaWV3OiBhbnkgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgaWYgKGppbXVNYXBWaWV3Py52aWV3Py5tYXApIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIXRoaXMuc2VsZWN0ZWRJZHMubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgY29ubmVjdGVkID0gdGhpcy5zZWxlY3RlZElkcy5maWx0ZXIoKGlkKSA9PiAhIXRoaXMuZHNCeUlkW2lkXSkubGVuZ3RoO1xuICAgIHJldHVybiBjb25uZWN0ZWQgPCB0aGlzLnNlbGVjdGVkSWRzLmxlbmd0aDtcbiAgfVxuXG4gIGhhc0Nvbm5lY3RlZFNvdXJjZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJZHMuc29tZSgoaWQpID0+ICEhdGhpcy5kc0J5SWRbaWRdKTtcbiAgfVxuXG4gIGdldExheWVyRnJvbURzKGRzOiBRdWVyaWFibGVEYXRhU291cmNlKTogYW55IHwgbnVsbCB7XG4gICAgY29uc3QgYW55RHMgPSBkcyBhcyBhbnk7XG4gICAgcmV0dXJuIGdldFF1ZXJ5YWJsZUxheWVyKGFueURzLmxheWVyIHx8IGFueURzLl9sYXllcik7XG4gIH1cblxuICBwcml2YXRlIGdldERzSGF5c3RhY2soZHM6IFF1ZXJpYWJsZURhdGFTb3VyY2UpOiBzdHJpbmcge1xuICAgIGNvbnN0IGFueURzID0gZHMgYXMgYW55O1xuICAgIGNvbnN0IGxheWVyID0gYW55RHMubGF5ZXIgfHwgYW55RHMuX2xheWVyO1xuICAgIGNvbnN0IHRpdGxlID0gU3RyaW5nKGxheWVyPy50aXRsZSB8fCBcIlwiKTtcbiAgICBjb25zdCB1cmwgPSBTdHJpbmcobGF5ZXI/LnVybCB8fCBhbnlEcy5nZXREYXRhU291cmNlSnNvbj8uKCk/LnVybCB8fCBcIlwiKTtcbiAgICBjb25zdCBsYWJlbCA9IFN0cmluZyhcbiAgICAgIGFueURzLmdldExhYmVsPy4oKSB8fFxuICAgICAgICBhbnlEcy5nZXREYXRhU291cmNlSnNvbj8uKCk/LmxhYmVsIHx8XG4gICAgICAgIGFueURzLmdldERhdGFTb3VyY2VKc29uPy4oKT8uc291cmNlTGFiZWwgfHxcbiAgICAgICAgXCJcIixcbiAgICApO1xuICAgIHJldHVybiBgJHt0aXRsZX0gJHt1cmx9ICR7bGFiZWx9YDtcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRSZWdpb25Qcm9iZVdoZXJlKFxuICAgIGZpbHRlcnM6IFBpY2s8QWdyaUZpbHRlcnMsIFwieWlsXCIgfCBcInZpbG95YXRcIj4sXG4gICAgbGF5ZXI6IGFueSxcbiAgICBmaWVsZHM6IHN0cmluZ1tdLFxuICAgIHJlZ2lvblNjb3BlZDogYm9vbGVhbixcbiAgICB5ZWFyU2NvcGVkOiBib29sZWFuLFxuICApOiBzdHJpbmcge1xuICAgIHJldHVybiBidWlsZEFncmlXaGVyZShcbiAgICAgIHtcbiAgICAgICAgeWlsOiBmaWx0ZXJzLnlpbCxcbiAgICAgICAgdmlsb3lhdDogZmlsdGVycy52aWxveWF0LFxuICAgICAgICBza2lwUmVnaW9uRmlsdGVyOiByZWdpb25TY29wZWQsXG4gICAgICAgIHNraXBZZWFyRmlsdGVyOiB5ZWFyU2NvcGVkLFxuICAgICAgfSxcbiAgICAgIGZpZWxkcyxcbiAgICAgIGxheWVyLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBpY2tCZXN0RHNCeUNvdW50KFxuICAgIHBvb2w6IFNjb3JlZERzW10sXG4gICAgZmlsdGVyczogUGljazxBZ3JpRmlsdGVycywgXCJ5aWxcIiB8IFwidmlsb3lhdFwiPixcbiAgICBwcmVmZXJyZWREczogUXVlcmlhYmxlRGF0YVNvdXJjZSB8IG51bGwsXG4gICk6IFByb21pc2U8U2NvcmVkRHMgfCBudWxsPiB7XG4gICAgaWYgKCFwb29sLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKCFTdHJpbmcoZmlsdGVycy52aWxveWF0ID8/IFwiXCIpLnRyaW0oKSB8fCBwb29sLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHBvb2xbMF07XG4gICAgfVxuXG4gICAgY29uc3Qgc2NvcmVkOiBBcnJheTx7IGl0ZW06IFNjb3JlZERzOyBjb3VudDogbnVtYmVyIH0+ID0gW107XG4gICAgY29uc3QgdHJ5SXRlbSA9IGFzeW5jIChpdGVtOiBTY29yZWREcyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyRnJvbURzKGl0ZW0uZHMpO1xuICAgICAgaWYgKCFsYXllcikgcmV0dXJuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2FmZUxvYWRNYXBMYXllcihsYXllcik7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLyogaWdub3JlICovXG4gICAgICB9XG4gICAgICBjb25zdCBmaWVsZHM6IHN0cmluZ1tdID0gKGxheWVyLmZpZWxkcyB8fCBbXSkubWFwKChmOiBhbnkpID0+IGYubmFtZSk7XG4gICAgICBjb25zdCB3aGVyZSA9IHRoaXMuYnVpbGRSZWdpb25Qcm9iZVdoZXJlKFxuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBsYXllcixcbiAgICAgICAgZmllbGRzLFxuICAgICAgICBpdGVtLnJlZ2lvbk1hdGNoLFxuICAgICAgICBoYXlzdGFja01hdGNoZXNZZWFyKHRoaXMuZ2V0RHNIYXlzdGFjayhpdGVtLmRzKSwgZmlsdGVycy55aWwpLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNvdW50ID0gYXdhaXQgcXVpY2tMYXllckZlYXR1cmVDb3VudChsYXllciwgd2hlcmUpO1xuICAgICAgc2NvcmVkLnB1c2goeyBpdGVtLCBjb3VudCB9KTtcbiAgICB9O1xuXG4gICAgaWYgKHByZWZlcnJlZERzKSB7XG4gICAgICBjb25zdCBwcmVmZXJyZWQgPSBwb29sLmZpbmQoKHApID0+IHAuZHMuaWQgPT09IHByZWZlcnJlZERzLmlkKTtcbiAgICAgIGlmIChwcmVmZXJyZWQpIHtcbiAgICAgICAgYXdhaXQgdHJ5SXRlbShwcmVmZXJyZWQpO1xuICAgICAgICBjb25zdCBwcmVmZXJyZWRDb3VudCA9IHNjb3JlZFswXT8uY291bnQgPz8gLTE7XG4gICAgICAgIGlmIChwcmVmZXJyZWRDb3VudCA+IDApIHJldHVybiBwcmVmZXJyZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVtYWluaW5nID0gcG9vbC5maWx0ZXIoXG4gICAgICAocCkgPT4gIXByZWZlcnJlZERzIHx8IHAuZHMuaWQgIT09IHByZWZlcnJlZERzLmlkLFxuICAgICk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVtYWluaW5nLm1hcCgoaXRlbSkgPT4gdHJ5SXRlbShpdGVtKSkpO1xuXG4gICAgY29uc3QgcG9zaXRpdmUgPSBzY29yZWRcbiAgICAgIC5maWx0ZXIoKHMpID0+IHMuY291bnQgPiAwKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY291bnQgLSBhLmNvdW50KTtcbiAgICBpZiAocG9zaXRpdmUubGVuZ3RoKSByZXR1cm4gcG9zaXRpdmVbMF0uaXRlbTtcblxuICAgIHJldHVybiAoXG4gICAgICBzY29yZWQuZmluZCgocykgPT4gcy5jb3VudCA+PSAwKT8uaXRlbSB8fFxuICAgICAgcG9vbC5maW5kKChwKSA9PiBwLmRzLmlkID09PSBwcmVmZXJyZWREcz8uaWQpIHx8XG4gICAgICBwb29sWzBdXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIHJlc29sdmVGcm9tRGF0YVNvdXJjZXMoXG4gICAgZmlsdGVyczogUGljazxBZ3JpRmlsdGVycywgXCJ5aWxcIiB8IFwidmlsb3lhdFwiPixcbiAgKTogUHJvbWlzZTxSZXNvbHZlZEZlYXR1cmVMYXllciB8IG51bGw+IHtcbiAgICBjb25zdCBub3JtYWxpemVkRmlsdGVycyA9IHtcbiAgICAgIHlpbDogZmlsdGVycy55aWwsXG4gICAgICB2aWxveWF0OiBjYW5vbmljYWxpemVSZWdpb25GaWx0ZXJWYWx1ZShTdHJpbmcoZmlsdGVycy52aWxveWF0ID8/IFwiXCIpLnRyaW0oKSksXG4gICAgfTtcbiAgICBjb25zdCB3YW50c1JlZ2lvbiA9ICEhbm9ybWFsaXplZEZpbHRlcnMudmlsb3lhdDtcbiAgICBjb25zdCBzY29yZWQ6IFNjb3JlZERzW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgaWQgb2YgdGhpcy5zZWxlY3RlZElkcykge1xuICAgICAgY29uc3QgZHMgPSB0aGlzLmRzQnlJZFtpZF07XG4gICAgICBpZiAoIWRzIHx8ICF0aGlzLmdldExheWVyRnJvbURzKGRzKSkgY29udGludWU7XG4gICAgICBjb25zdCBoYXlzdGFjayA9IHRoaXMuZ2V0RHNIYXlzdGFjayhkcyk7XG4gICAgICBzY29yZWQucHVzaCh7XG4gICAgICAgIGRzLFxuICAgICAgICBzY29yZTogc2NvcmVIYXlzdGFja0ZvckZpbHRlcnMoaGF5c3RhY2ssIG5vcm1hbGl6ZWRGaWx0ZXJzKSxcbiAgICAgICAgcmVnaW9uTWF0Y2g6IGhheXN0YWNrTWF0Y2hlc1JlZ2lvbihoYXlzdGFjaywgbm9ybWFsaXplZEZpbHRlcnMudmlsb3lhdCksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXNjb3JlZC5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgcG9vbCA9IHBpY2tZZWFyUmVnaW9uTGF5ZXJQb29sKFxuICAgICAgc2NvcmVkLFxuICAgICAgc2NvcmVkLmxlbmd0aCxcbiAgICAgIG5vcm1hbGl6ZWRGaWx0ZXJzLFxuICAgICAgKGl0ZW0pID0+IHRoaXMuZ2V0RHNIYXlzdGFjayhpdGVtLmRzKSxcbiAgICApO1xuICAgIGlmICghcG9vbC5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgbGV0IGJlc3RTY29yZSA9IC0xO1xuICAgIGxldCBzY29yZVdpbm5lcjogU2NvcmVkRHMgfCBudWxsID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcG9vbCkge1xuICAgICAgaWYgKGl0ZW0uc2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgYmVzdFNjb3JlID0gaXRlbS5zY29yZTtcbiAgICAgICAgc2NvcmVXaW5uZXIgPSBpdGVtO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByZWZlcnJlZERzID0gc2NvcmVXaW5uZXI/LmRzIHx8IG51bGw7XG4gICAgY29uc3QgYmVzdEl0ZW0gPVxuICAgICAgd2FudHNSZWdpb24gJiYgcG9vbC5sZW5ndGggPiAxXG4gICAgICAgID8gYXdhaXQgdGhpcy5waWNrQmVzdERzQnlDb3VudChwb29sLCBub3JtYWxpemVkRmlsdGVycywgcHJlZmVycmVkRHMpXG4gICAgICAgIDogc2NvcmVXaW5uZXI7XG5cbiAgICBjb25zdCBiZXN0RHMgPSBiZXN0SXRlbT8uZHMgfHwgcHJlZmVycmVkRHM7XG4gICAgaWYgKCFiZXN0RHMpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyRnJvbURzKGJlc3REcyk7XG4gICAgaWYgKCFsYXllcikgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgc2FmZUxvYWRNYXBMYXllcihsYXllcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBsYXllciBtYXkgYWxyZWFkeSBiZSBsb2FkZWQgKi9cbiAgICB9XG4gICAgZGlzYWJsZUxheWVyUGJmKGxheWVyKTtcblxuICAgIGNvbnN0IGZpZWxkczogc3RyaW5nW10gPSAobGF5ZXIuZmllbGRzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gZi5uYW1lKTtcbiAgICBjb25zdCByZWdpb25NYXRjaCA9IGJlc3RJdGVtPy5yZWdpb25NYXRjaCA/PyBmYWxzZTtcbiAgICBjb25zdCByZWdpb25TY29wZWQgPSByZWdpb25NYXRjaCB8fCAoYmVzdEl0ZW0/LnNjb3JlID8/IDApID49IDI1O1xuICAgIGNvbnN0IGhheXN0YWNrID0gdGhpcy5nZXREc0hheXN0YWNrKGJlc3REcyk7XG4gICAgY29uc3QgeWVhclNjb3BlZCA9IGhheXN0YWNrTWF0Y2hlc1llYXIoaGF5c3RhY2ssIG5vcm1hbGl6ZWRGaWx0ZXJzLnlpbCk7XG5cbiAgICBmbExvZyhcInJlc29sdmUgdmlhIERhdGFTb3VyY2VcIiwge1xuICAgICAgZmlsdGVyczogbm9ybWFsaXplZEZpbHRlcnMsXG4gICAgICBkc0lkOiBiZXN0RHMuaWQsXG4gICAgICBsYXllclRpdGxlOiBsYXllcj8udGl0bGUgfHwgbGF5ZXI/LnVybCB8fCBudWxsLFxuICAgICAgc2NvcmU6IGJlc3RJdGVtPy5zY29yZSA/PyBiZXN0U2NvcmUsXG4gICAgICByZWdpb25TY29wZWQsXG4gICAgICB5ZWFyU2NvcGVkLFxuICAgICAgZmllbGRDb3VudDogZmllbGRzLmxlbmd0aCxcbiAgICAgIGNvdW50QmFzZWQ6IHdhbnRzUmVnaW9uICYmIHBvb2wubGVuZ3RoID4gMSxcbiAgICB9KTtcbiAgICB2b2lkIHByZXBhcmVWYWx1ZUluZGV4KGxheWVyLCBmaWVsZHMpO1xuICAgIHJldHVybiB7XG4gICAgICBsYXllcixcbiAgICAgIGZpZWxkcyxcbiAgICAgIHJlZ2lvblNjb3BlZCxcbiAgICAgIHllYXJTY29wZWQsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHJlc29sdmUoXG4gICAgZmlsdGVyczogUGljazxBZ3JpRmlsdGVycywgXCJ5aWxcIiB8IFwidmlsb3lhdFwiPixcbiAgICBqaW11TWFwVmlldzogYW55IHwgbnVsbCxcbiAgKTogUHJvbWlzZTxSZXNvbHZlZEZlYXR1cmVMYXllciB8IG51bGw+IHtcbiAgICBjb25zdCBjYWNoZUtleSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHlpbDogZmlsdGVycy55aWwgfHwgXCJcIixcbiAgICAgIHZpbG95YXQ6IGNhbm9uaWNhbGl6ZVJlZ2lvbkZpbHRlclZhbHVlKFN0cmluZyhmaWx0ZXJzLnZpbG95YXQgPz8gXCJcIikudHJpbSgpKSxcbiAgICAgIGlkczogdGhpcy5zZWxlY3RlZElkcyxcbiAgICAgIG1hcFJlYWR5OiAhIWppbXVNYXBWaWV3LFxuICAgIH0pO1xuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnJlc29sdmVDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChwZW5kaW5nKSByZXR1cm4gcGVuZGluZztcblxuICAgIGNvbnN0IGpvYiA9IHRoaXMucmVzb2x2ZUludGVybmFsKGZpbHRlcnMsIGppbXVNYXBWaWV3KTtcbiAgICB0aGlzLnJlc29sdmVDYWNoZS5zZXQoY2FjaGVLZXksIGpvYik7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBqb2I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aGlzLnJlc29sdmVDYWNoZS5nZXQoY2FjaGVLZXkpID09PSBqb2IpIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlQ2FjaGUuZGVsZXRlKGNhY2hlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlc29sdmVJbnRlcm5hbChcbiAgICBmaWx0ZXJzOiBQaWNrPEFncmlGaWx0ZXJzLCBcInlpbFwiIHwgXCJ2aWxveWF0XCI+LFxuICAgIGppbXVNYXBWaWV3OiBhbnkgfCBudWxsLFxuICApOiBQcm9taXNlPFJlc29sdmVkRmVhdHVyZUxheWVyIHwgbnVsbD4ge1xuICAgIGNvbnN0IGZyb21EcyA9IGF3YWl0IHRoaXMucmVzb2x2ZUZyb21EYXRhU291cmNlcyhmaWx0ZXJzKTtcbiAgICBpZiAoZnJvbURzKSByZXR1cm4gZnJvbURzO1xuICAgIGlmICghamltdU1hcFZpZXcpIHtcbiAgICAgIGZsTG9nKFwicmVzb2x2ZSBGQUlMRUQgKG5vIERTIGxheWVyLCBubyBtYXAgdmlldylcIiwge1xuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBzZWxlY3RlZElkczogdGhpcy5zZWxlY3RlZElkcyxcbiAgICAgICAgY29ubmVjdGVkSWRzOiB0aGlzLnNlbGVjdGVkSWRzLmZpbHRlcigoaWQpID0+ICEhdGhpcy5kc0J5SWRbaWRdKSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGZyb21NYXAgPSBhd2FpdCByZXNvbHZlRmVhdHVyZUxheWVyRm9yRmlsdGVycyhqaW11TWFwVmlldywgZmlsdGVycyk7XG4gICAgZmxMb2coXCJyZXNvbHZlIHZpYSBNYXBcIiwge1xuICAgICAgZmlsdGVycyxcbiAgICAgIGxheWVyVGl0bGU6IGZyb21NYXA/LmxheWVyPy50aXRsZSB8fCBmcm9tTWFwPy5sYXllcj8udXJsIHx8IG51bGwsXG4gICAgICByZWdpb25TY29wZWQ6IGZyb21NYXA/LnJlZ2lvblNjb3BlZCA/PyBudWxsLFxuICAgICAgeWVhclNjb3BlZDogZnJvbU1hcD8ueWVhclNjb3BlZCA/PyBudWxsLFxuICAgICAgZm91bmQ6ICEhZnJvbU1hcCxcbiAgICB9KTtcbiAgICBpZiAoZnJvbU1hcD8ubGF5ZXIpIHtcbiAgICAgIHZvaWQgcHJlcGFyZVZhbHVlSW5kZXgoZnJvbU1hcC5sYXllciwgZnJvbU1hcC5maWVsZHMpO1xuICAgIH1cbiAgICByZXR1cm4gZnJvbU1hcDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQWdyaURhdGFTb3VyY2VFbmdpbmUgfSBmcm9tIFwiLi9hZ3JpLWRhdGEtc291cmNlLWVuZ2luZVwiO1xuXG5jb25zdCBEQVNIQk9BUkRfQ0hJTERfU1VGRklYRVMgPSBbXG4gIFwiLWxvY2FsaXphdGlvblwiLFxuICBcIi1pbmRpY2F0b3JcIixcbiAgXCItcmVnaW9uXCIsXG4gIFwiLXBpZVwiLFxuICBcIi1ncmFmZlwiLFxuICBcIi1iYXJcIixcbiAgXCItcG9wdXBcIixcbl0gYXMgY29uc3Q7XG5cbi8qKiBSb290IEFncm9XaWRnZXRWNSB3aWRnZXQgaWQgZnJvbSBhbnkgZW1iZWRkZWQgY2hpbGQgaWQuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWdyaURhc2hib2FyZFJvb3RJZCh3aWRnZXRJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaWQgPSBTdHJpbmcod2lkZ2V0SWQgfHwgXCJcIik7XG4gIGZvciAoY29uc3Qgc3VmZml4IG9mIERBU0hCT0FSRF9DSElMRF9TVUZGSVhFUykge1xuICAgIGlmIChpZC5lbmRzV2l0aChzdWZmaXgpKSByZXR1cm4gaWQuc2xpY2UoMCwgLXN1ZmZpeC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBpZDtcbn1cblxuY29uc3Qgc2hhcmVkRW5naW5lcyA9IG5ldyBNYXA8c3RyaW5nLCBBZ3JpRGF0YVNvdXJjZUVuZ2luZT4oKTtcblxuLyoqIE9uZSBEYXRhU291cmNlIGVuZ2luZSBwZXIgZGFzaGJvYXJkIGluc3RhbmNlIOKAlCBzaGFyZWQgYnkgYWxsIGVtYmVkZGVkIGNoaWxkcmVuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNoYXJlZEFncmlEYXRhU291cmNlRW5naW5lKFxuICB3aWRnZXRJZDogc3RyaW5nLFxuKTogQWdyaURhdGFTb3VyY2VFbmdpbmUge1xuICBjb25zdCByb290SWQgPSBnZXRBZ3JpRGFzaGJvYXJkUm9vdElkKHdpZGdldElkKTtcbiAgbGV0IGVuZ2luZSA9IHNoYXJlZEVuZ2luZXMuZ2V0KHJvb3RJZCk7XG4gIGlmICghZW5naW5lKSB7XG4gICAgZW5naW5lID0gbmV3IEFncmlEYXRhU291cmNlRW5naW5lKCk7XG4gICAgc2hhcmVkRW5naW5lcy5zZXQocm9vdElkLCBlbmdpbmUpO1xuICB9XG4gIHJldHVybiBlbmdpbmU7XG59XG4iLCJpbXBvcnQgeyBBcHBNb2RlLCBnZXRBcHBTdG9yZSB9IGZyb20gXCJqaW11LWNvcmVcIjtcbmltcG9ydCB7IHRvUGxhaW5BcnJheSB9IGZyb20gXCIuL2FncmktZGF0YS1zb3VyY2UtZW5naW5lXCI7XG5cbmV4cG9ydCB0eXBlIExpbmtlZE1hcExheW91dFNjb3BlID0gXCJkYXNoYm9hcmRcIiB8IFwicGxtXCI7XG5cbmNvbnN0IE1BTkFHRURfTUFQX0NMQVNTOiBSZWNvcmQ8TGlua2VkTWFwTGF5b3V0U2NvcGUsIHN0cmluZz4gPSB7XG4gIGRhc2hib2FyZDogXCJhZ3JpLWRhc2hib2FyZC1tYW5hZ2VkLW1hcFwiLFxuICBwbG06IFwicGxtLW1hbmFnZWQtbWFwXCIsXG59O1xuXG5jb25zdCBNQU5BR0VEX1JFTkRFUkVSX0NMQVNTOiBSZWNvcmQ8TGlua2VkTWFwTGF5b3V0U2NvcGUsIHN0cmluZz4gPSB7XG4gIGRhc2hib2FyZDogXCJhZ3JpLWRhc2hib2FyZC1tYW5hZ2VkLW1hcC1yZW5kZXJlclwiLFxuICBwbG06IFwicGxtLW1hbmFnZWQtbWFwLXJlbmRlcmVyXCIsXG59O1xuXG5jb25zdCBNQVBfUEFORUxfQk9SREVSX1JBRElVUyA9IFwiMjBweFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFncmlMaW5rZWRNYXBMYXlvdXRPcHRpb25zIHtcbiAgc2NvcGU6IExpbmtlZE1hcExheW91dFNjb3BlO1xuICBob3N0V2lkZ2V0SWQ6IHN0cmluZztcbiAgZ2V0U2xvdEVsZW1lbnQ6ICgpID0+IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgZ2V0VXNlTWFwV2lkZ2V0SWRzOiAoKSA9PiB1bmtub3duO1xuICBvbk1hcFdpZGdldExpbmtlZD86IChtYXBXaWRnZXRJZDogc3RyaW5nKSA9PiB2b2lkO1xuICAvKiogRmlyZWQgd2hlbiBhIG1hcCB3aWRnZXQgaWQgYmVjb21lcyBhdmFpbGFibGUgKGNvbmZpZyBsaW5rIG9yIGFwcCBkaXNjb3ZlcnkpLiAqL1xuICBvbk1hcFJlc29sdmVkPzogKG1hcFdpZGdldElkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIHJlc2l6ZU1hcFZpZXc/OiAoKSA9PiB2b2lkO1xufVxuXG5mdW5jdGlvbiBpc01hcFdpZGdldENvbmZpZyh3aWRnZXQ6IGFueSk6IGJvb2xlYW4ge1xuICBjb25zdCBtYW5pZmVzdE5hbWUgPSBTdHJpbmcod2lkZ2V0Py5tYW5pZmVzdD8ubmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCB1cmkgPSBTdHJpbmcod2lkZ2V0Py51cmkgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIG1hbmlmZXN0TmFtZSA9PT0gXCJtYXBcIiB8fCB1cmkuaW5jbHVkZXMoXCJhcmNnaXMtbWFwXCIpO1xufVxuXG5mdW5jdGlvbiBmaW5kV2lkZ2V0UmVuZGVyZXIod2lkZ2V0SWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICBgLndpZGdldC1yZW5kZXJlcltkYXRhLXdpZGdldGlkPVwiJHt3aWRnZXRJZH1cIl1gLFxuICAgIGBbZGF0YS13aWRnZXRpZD1cIiR7d2lkZ2V0SWR9XCJdLndpZGdldC1yZW5kZXJlcmAsXG4gICAgYFtkYXRhLXdpZGdldGlkPVwiJHt3aWRnZXRJZH1cIl1gLFxuICBdO1xuICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChlbCkgcmV0dXJuIGVsO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBmaW5kV2lkZ2V0TGF5b3V0SXRlbSh3aWRnZXRJZDogc3RyaW5nKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgY29uc3QgcmVuZGVyZXIgPSBmaW5kV2lkZ2V0UmVuZGVyZXIod2lkZ2V0SWQpO1xuICBpZiAoIXJlbmRlcmVyKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgIHJlbmRlcmVyLmNsb3Nlc3QoXCIubGF5b3V0LWl0ZW0uaXMtd2lkZ2V0XCIpLFxuICAgIHJlbmRlcmVyLmNsb3Nlc3QoXCIuYnVpbGRlci1sYXlvdXQtaXRlbVwiKSxcbiAgICByZW5kZXJlci5jbG9zZXN0KFwiLmxheW91dC1pdGVtXCIpLFxuICAgIHJlbmRlcmVyLmNsb3Nlc3QoXCIuc2VjdGlvbi1sYXlvdXQtaXRlbVwiKSxcbiAgICByZW5kZXJlci5jbG9zZXN0KCdbY2xhc3MqPVwibGF5b3V0LWl0ZW1cIl0nKSxcbiAgICByZW5kZXJlci5wYXJlbnRFbGVtZW50LFxuICBdO1xuXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgY2FuZGlkYXRlLmNvbnRhaW5zKHJlbmRlcmVyKSkge1xuICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVuZGVyZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0tub3duTWFwV2lkZ2V0SWQod2lkZ2V0SWQ/OiBzdHJpbmcgfCBudWxsKTogYm9vbGVhbiB7XG4gIGNvbnN0IGlkID0gU3RyaW5nKHdpZGdldElkIHx8IFwiXCIpLnRyaW0oKTtcbiAgaWYgKCFpZCkgcmV0dXJuIGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgY29uc3Qgd2lkZ2V0cyA9IChnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkgYXMgYW55KT8uYXBwQ29uZmlnPy53aWRnZXRzIHx8IHt9O1xuICAgIGNvbnN0IHdpZGdldCA9IHdpZGdldHNbaWRdO1xuICAgIGlmICh3aWRnZXQgJiYgaXNNYXBXaWRnZXRDb25maWcod2lkZ2V0KSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2gge1xuICAgIC8qIGFwcCBjb25maWcgbWF5IHN0aWxsIGJlIHdhcm1pbmcgdXAgKi9cbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZmluZFdpZGdldFJlbmRlcmVyKGlkKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTWFwT3ZlcmxhcHBpbmdTbG90KG1hcFdpZGdldElkOiBzdHJpbmcsIHNsb3Q6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgaXRlbSA9IGZpbmRXaWRnZXRMYXlvdXRJdGVtKG1hcFdpZGdldElkKTtcbiAgaWYgKCFpdGVtKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHJlY3QgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBjeCA9IHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyO1xuICBjb25zdCBjeSA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuICBpZiAoY3ggPj0gc2xvdC5sZWZ0ICYmIGN4IDw9IHNsb3QucmlnaHQgJiYgY3kgPj0gc2xvdC50b3AgJiYgY3kgPD0gc2xvdC5ib3R0b20pIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCBvdmVybGFwWCA9IE1hdGgubWF4KFxuICAgIDAsXG4gICAgTWF0aC5taW4ocmVjdC5yaWdodCwgc2xvdC5yaWdodCkgLSBNYXRoLm1heChyZWN0LmxlZnQsIHNsb3QubGVmdCksXG4gICk7XG4gIGNvbnN0IG92ZXJsYXBZID0gTWF0aC5tYXgoXG4gICAgMCxcbiAgICBNYXRoLm1pbihyZWN0LmJvdHRvbSwgc2xvdC5ib3R0b20pIC0gTWF0aC5tYXgocmVjdC50b3AsIHNsb3QudG9wKSxcbiAgKTtcbiAgY29uc3Qgb3ZlcmxhcEFyZWEgPSBvdmVybGFwWCAqIG92ZXJsYXBZO1xuICBjb25zdCBtYXBBcmVhID0gTWF0aC5tYXgoMSwgcmVjdC53aWR0aCAqIHJlY3QuaGVpZ2h0KTtcbiAgcmV0dXJuIG92ZXJsYXBBcmVhIC8gbWFwQXJlYSA+IDAuMztcbn1cblxuLyoqIEZpbmQgdGhlIHN0YW5kYXJkIE1hcCB3aWRnZXQgaWQgZnJvbSBhcHAgY29uZmlnIChwdWJsaXNoZWQgZXhwZXJpZW5jZSBzYWZlKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNjb3Zlck1hcFdpZGdldElkSW5BcHAob3B0aW9uczoge1xuICBob3N0V2lkZ2V0SWQ6IHN0cmluZztcbiAgZ2V0U2xvdEVsZW1lbnQ/OiAoKSA9PiBIVE1MRWxlbWVudCB8IG51bGw7XG59KTogc3RyaW5nIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdGUgPSBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkgYXMgYW55O1xuICAgIGNvbnN0IHdpZGdldHMgPSBzdGF0ZT8uYXBwQ29uZmlnPy53aWRnZXRzIHx8IHt9O1xuICAgIGNvbnN0IG93bklkID0gb3B0aW9ucy5ob3N0V2lkZ2V0SWQ7XG4gICAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgICBPYmplY3Qua2V5cyh3aWRnZXRzKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgaWYgKGlkID09PSBvd25JZCB8fCBpZC5zdGFydHNXaXRoKGAke293bklkfS1gKSkgcmV0dXJuO1xuICAgICAgaWYgKGlzTWFwV2lkZ2V0Q29uZmlnKHdpZGdldHNbaWRdKSkgY2FuZGlkYXRlcy5wdXNoKGlkKTtcbiAgICB9KTtcbiAgICBpZiAoIWNhbmRpZGF0ZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPT09IDEpIHJldHVybiBjYW5kaWRhdGVzWzBdO1xuXG4gICAgY29uc3Qgc2xvdCA9IG9wdGlvbnMuZ2V0U2xvdEVsZW1lbnQ/LigpPy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoIXNsb3QpIHJldHVybiBjYW5kaWRhdGVzWzBdO1xuXG4gICAgY29uc3QgaW5zaWRlU2xvdCA9IGNhbmRpZGF0ZXMuZmlsdGVyKChpZCkgPT5cbiAgICAgIGlzTWFwT3ZlcmxhcHBpbmdTbG90KGlkLCBzbG90KSxcbiAgICApO1xuICAgIGlmIChpbnNpZGVTbG90Lmxlbmd0aCA9PT0gMSkgcmV0dXJuIGluc2lkZVNsb3RbMF07XG4gICAgY29uc3QgcG9vbCA9IGluc2lkZVNsb3QubGVuZ3RoID8gaW5zaWRlU2xvdCA6IGNhbmRpZGF0ZXM7XG5cbiAgICBsZXQgYmVzdElkID0gcG9vbFswXTtcbiAgICBsZXQgYmVzdERpc3RhbmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHBvb2wuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBmaW5kV2lkZ2V0TGF5b3V0SXRlbShpZCk7XG4gICAgICBpZiAoIWl0ZW0pIHJldHVybjtcbiAgICAgIGNvbnN0IHJlY3QgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgZHggPSByZWN0LmxlZnQgKyByZWN0LndpZHRoIC8gMiAtIChzbG90LmxlZnQgKyBzbG90LndpZHRoIC8gMik7XG4gICAgICBjb25zdCBkeSA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyIC0gKHNsb3QudG9wICsgc2xvdC5oZWlnaHQgLyAyKTtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5oeXBvdChkeCwgZHkpO1xuICAgICAgaWYgKGRpc3RhbmNlIDwgYmVzdERpc3RhbmNlKSB7XG4gICAgICAgIGJlc3REaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICBiZXN0SWQgPSBpZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYmVzdElkO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWdyaUxpbmtlZE1hcExheW91dE1hbmFnZXIge1xuICBwcml2YXRlIG1hcExheW91dEl0ZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbWFwV2lkZ2V0UmVuZGVyZXI6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgYXV0b0xpbmtBdHRlbXB0ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBsYXlvdXRSYWYgPSAwO1xuICBwcml2YXRlIGxhc3ROb3RpZmllZE1hcElkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IG9wdGlvbnM6IEFncmlMaW5rZWRNYXBMYXlvdXRPcHRpb25zKSB7fVxuXG4gIHNjaGVkdWxlTGF5b3V0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmxheW91dFJhZikgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5sYXlvdXRSYWYpO1xuICAgIHRoaXMubGF5b3V0UmFmID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHRoaXMubGF5b3V0UmFmID0gMDtcbiAgICAgIHRoaXMuc3luYygpO1xuICAgIH0pO1xuICB9XG5cbiAgbGF5b3V0Tm93KCk6IHZvaWQge1xuICAgIHRoaXMuc3luYygpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5sYXlvdXRSYWYpIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMubGF5b3V0UmFmKTtcbiAgICB0aGlzLmxheW91dFJhZiA9IDA7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgZ2V0UmVzb2x2ZWRNYXBXaWRnZXRJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBsaW5rZWQgPSB0aGlzLmdldExpbmtlZE1hcFdpZGdldElkKCk7XG4gICAgaWYgKGxpbmtlZCAmJiBpc0tub3duTWFwV2lkZ2V0SWQobGlua2VkKSkgcmV0dXJuIGxpbmtlZDtcbiAgICByZXR1cm4gdGhpcy5kaXNjb3Zlck1hcFdpZGdldElkRnJvbUFwcCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMaW5rZWRNYXBXaWRnZXRJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBpZHMgPSB0b1BsYWluQXJyYXk8c3RyaW5nPih0aGlzLm9wdGlvbnMuZ2V0VXNlTWFwV2lkZ2V0SWRzKCkpO1xuICAgIHJldHVybiBpZHNbMF0gPyBTdHJpbmcoaWRzWzBdKSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGZpbmRTaGFyZWRMYXlvdXRTdXJmYWNlKHNsb3Q6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICBjb25zdCBob3N0SXRlbSA9IHNsb3QuY2xvc2VzdChcbiAgICAgIFwiLmxheW91dC1pdGVtLCAuYnVpbGRlci1sYXlvdXQtaXRlbVwiLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIHJldHVybiBob3N0SXRlbT8ucGFyZW50RWxlbWVudCB8fCBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNjb3Zlck1hcFdpZGdldElkRnJvbUFwcCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gZGlzY292ZXJNYXBXaWRnZXRJZEluQXBwKHtcbiAgICAgIGhvc3RXaWRnZXRJZDogdGhpcy5vcHRpb25zLmhvc3RXaWRnZXRJZCxcbiAgICAgIGdldFNsb3RFbGVtZW50OiB0aGlzLm9wdGlvbnMuZ2V0U2xvdEVsZW1lbnQsXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG5vdGlmeU1hcFJlc29sdmVkKG1hcFdpZGdldElkOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgaWYgKCFtYXBXaWRnZXRJZCB8fCBtYXBXaWRnZXRJZCA9PT0gdGhpcy5sYXN0Tm90aWZpZWRNYXBJZCkgcmV0dXJuO1xuICAgIHRoaXMubGFzdE5vdGlmaWVkTWFwSWQgPSBtYXBXaWRnZXRJZDtcbiAgICB0aGlzLm9wdGlvbnMub25NYXBSZXNvbHZlZD8uKG1hcFdpZGdldElkKTtcbiAgfVxuXG4gIHByaXZhdGUgdHJ5QXV0b0xpbmtNYXBXaWRnZXQobWFwV2lkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGxpbmtlZCA9IHRoaXMuZ2V0TGlua2VkTWFwV2lkZ2V0SWQoKTtcbiAgICBpZiAoIW1hcFdpZGdldElkIHx8IChsaW5rZWQgJiYgaXNLbm93bk1hcFdpZGdldElkKGxpbmtlZCkpIHx8IHRoaXMuYXV0b0xpbmtBdHRlbXB0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2xvdCA9IHRoaXMub3B0aW9ucy5nZXRTbG90RWxlbWVudCgpPy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoc2xvdCAmJiAhaXNNYXBPdmVybGFwcGluZ1Nsb3QobWFwV2lkZ2V0SWQsIHNsb3QpKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbW9kZSA9IGdldEFwcFN0b3JlKCkuZ2V0U3RhdGUoKS5hcHBSdW50aW1lSW5mbz8uYXBwTW9kZTtcbiAgICAgIGlmIChtb2RlICE9PSBBcHBNb2RlLkRlc2lnbikgcmV0dXJuO1xuICAgICAgLy8gUnVudGltZSBidW5kbGVzIG11c3Qgbm90IGRlcGVuZCBvbiB0aGUgYnVpbGRlci1vbmx5IHBhY2thZ2UuIEFzayB0aGVcbiAgICAgIC8vIHNldHRpbmcgcGFuZWwgdG8gZm9jdXMgdGhlIG1hcCBzZWxlY3RvcjsgdGhlIHVzZXIgY2FuIGNvbmZpcm0gbGlua2FnZVxuICAgICAgLy8gdGhlcmUgd2l0aG91dCBtYWtpbmcgcHVibGlzaGVkIGFwcHMgbG9hZCBgamltdS1mb3ItYnVpbGRlcmAuXG4gICAgICB0aGlzLmF1dG9MaW5rQXR0ZW1wdGVkID0gdHJ1ZTtcbiAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJhZ3JpLW1haW46bWFwLXNldHRpbmdzLXJlcXVlc3RcIiwge1xuICAgICAgICAgIGRldGFpbDogeyB3aWRnZXRJZDogdGhpcy5vcHRpb25zLmhvc3RXaWRnZXRJZCwgbWFwV2lkZ2V0SWQgfSxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogYnVpbGRlci1vbmx5IGhlbHBlciAqL1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlNYXBTbG90Qm91bmRzKGxheW91dEl0ZW06IEhUTUxFbGVtZW50LCBzbG90RWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgc2xvdFJlY3QgPSBzbG90RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgc3VyZmFjZSA9IHRoaXMuZmluZFNoYXJlZExheW91dFN1cmZhY2Uoc2xvdEVsKTtcblxuICAgIGxldCB0b3AgPSBzbG90UmVjdC50b3A7XG4gICAgbGV0IGxlZnQgPSBzbG90UmVjdC5sZWZ0O1xuICAgIGxldCBwb3NpdGlvbk1vZGU6IFwiZml4ZWRcIiB8IFwiYWJzb2x1dGVcIiA9IFwiZml4ZWRcIjtcblxuICAgIGlmIChzdXJmYWNlKSB7XG4gICAgICBjb25zdCBzdXJmYWNlUmVjdCA9IHN1cmZhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB0b3AgPSBzbG90UmVjdC50b3AgLSBzdXJmYWNlUmVjdC50b3AgKyBzdXJmYWNlLnNjcm9sbFRvcDtcbiAgICAgIGxlZnQgPSBzbG90UmVjdC5sZWZ0IC0gc3VyZmFjZVJlY3QubGVmdCArIHN1cmZhY2Uuc2Nyb2xsTGVmdDtcbiAgICAgIHBvc2l0aW9uTW9kZSA9IFwiYWJzb2x1dGVcIjtcblxuICAgICAgaWYgKGdldENvbXB1dGVkU3R5bGUoc3VyZmFjZSkucG9zaXRpb24gPT09IFwic3RhdGljXCIpIHtcbiAgICAgICAgc3VyZmFjZS5zdHlsZS5zZXRQcm9wZXJ0eShcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZW50cmllczogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXG4gICAgICBbXCJwb3NpdGlvblwiLCBwb3NpdGlvbk1vZGVdLFxuICAgICAgW1widG9wXCIsIGAke3RvcH1weGBdLFxuICAgICAgW1wibGVmdFwiLCBgJHtsZWZ0fXB4YF0sXG4gICAgICBbXCJ3aWR0aFwiLCBgJHtzbG90UmVjdC53aWR0aH1weGBdLFxuICAgICAgW1wiaGVpZ2h0XCIsIGAke3Nsb3RSZWN0LmhlaWdodH1weGBdLFxuICAgICAgW1wicmlnaHRcIiwgXCJhdXRvXCJdLFxuICAgICAgW1wiYm90dG9tXCIsIFwiYXV0b1wiXSxcbiAgICAgIFtcIm1hcmdpblwiLCBcIjBcIl0sXG4gICAgICBbXCJwYWRkaW5nXCIsIFwiMFwiXSxcbiAgICAgIFtcInRyYW5zZm9ybVwiLCBcIm5vbmVcIl0sXG4gICAgICBbXCJib3JkZXItcmFkaXVzXCIsIE1BUF9QQU5FTF9CT1JERVJfUkFESVVTXSxcbiAgICAgIFtcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCJdLFxuICAgICAgW1wiei1pbmRleFwiLCBcIjEyXCJdLFxuICAgICAgW1wiYm94LXNpemluZ1wiLCBcImJvcmRlci1ib3hcIl0sXG4gICAgICBbXCJwb2ludGVyLWV2ZW50c1wiLCBcImF1dG9cIl0sXG4gICAgXTtcblxuICAgIGVudHJpZXMuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBsYXlvdXRJdGVtLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IGxheW91dEl0ZW0uY2xvc2VzdChcIi5idWlsZGVyLWxheW91dC1pdGVtXCIpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAod3JhcHBlciAmJiB3cmFwcGVyICE9PSBsYXlvdXRJdGVtKSB7XG4gICAgICBbXG4gICAgICAgIFtcInBvc2l0aW9uXCIsIFwic3RhdGljXCJdLFxuICAgICAgICBbXCJ3aWR0aFwiLCBcIjBcIl0sXG4gICAgICAgIFtcImhlaWdodFwiLCBcIjBcIl0sXG4gICAgICAgIFtcIm1hcmdpblwiLCBcIjBcIl0sXG4gICAgICAgIFtcInBhZGRpbmdcIiwgXCIwXCJdLFxuICAgICAgICBbXCJvdmVyZmxvd1wiLCBcInZpc2libGVcIl0sXG4gICAgICAgIFtcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiXSxcbiAgICAgIF0uZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIHdyYXBwZXIuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgXCJpbXBvcnRhbnRcIik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbGxNYXBSZW5kZXJlcihyZW5kZXJlcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByYWRpdXMgPSBNQVBfUEFORUxfQk9SREVSX1JBRElVUztcbiAgICBbXG4gICAgICBbXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCJdLFxuICAgICAgW1wid2lkdGhcIiwgXCIxMDAlXCJdLFxuICAgICAgW1wiaGVpZ2h0XCIsIFwiMTAwJVwiXSxcbiAgICAgIFtcInRvcFwiLCBcIjBcIl0sXG4gICAgICBbXCJsZWZ0XCIsIFwiMFwiXSxcbiAgICAgIFtcIm1hcmdpblwiLCBcIjBcIl0sXG4gICAgICBbXCJwYWRkaW5nXCIsIFwiMFwiXSxcbiAgICAgIFtcInRyYW5zZm9ybVwiLCBcIm5vbmVcIl0sXG4gICAgICBbXCJib3JkZXItcmFkaXVzXCIsIHJhZGl1c10sXG4gICAgICBbXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiXSxcbiAgICAgIFtcImJveC1zaXppbmdcIiwgXCJib3JkZXItYm94XCJdLFxuICAgIF0uZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICByZW5kZXJlci5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBcImltcG9ydGFudFwiKTtcbiAgICB9KTtcblxuICAgIHJlbmRlcmVyXG4gICAgICAucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXG4gICAgICAgIFwiLmVzcmktdmlldywgLmVzcmktdmlldy1yb290LCAuZXNyaS12aWV3LXN1cmZhY2UsIC53aWRnZXQtbWFwXCIsXG4gICAgICApXG4gICAgICAuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KFwiYm9yZGVyLXJhZGl1c1wiLCByYWRpdXMsIFwiaW1wb3J0YW50XCIpO1xuICAgICAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIiwgXCJpbXBvcnRhbnRcIik7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJNYW5hZ2VkRWxlbWVudCh0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCk6IHZvaWQge1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm47XG4gICAgW1xuICAgICAgXCJwb3NpdGlvblwiLFxuICAgICAgXCJ0b3BcIixcbiAgICAgIFwibGVmdFwiLFxuICAgICAgXCJyaWdodFwiLFxuICAgICAgXCJib3R0b21cIixcbiAgICAgIFwid2lkdGhcIixcbiAgICAgIFwiaGVpZ2h0XCIsXG4gICAgICBcInotaW5kZXhcIixcbiAgICAgIFwibWFyZ2luXCIsXG4gICAgICBcInBhZGRpbmdcIixcbiAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICBcImJvcmRlci1yYWRpdXNcIixcbiAgICAgIFwib3ZlcmZsb3dcIixcbiAgICAgIFwiYm94LXNpemluZ1wiLFxuICAgICAgXCJwb2ludGVyLWV2ZW50c1wiLFxuICAgIF0uZm9yRWFjaCgoa2V5KSA9PiB0YXJnZXQuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KSk7XG4gICAgT2JqZWN0LnZhbHVlcyhNQU5BR0VEX01BUF9DTEFTUykuZm9yRWFjaCgoY2xzKSA9PiB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShjbHMpKTtcbiAgICBPYmplY3QudmFsdWVzKE1BTkFHRURfUkVOREVSRVJfQ0xBU1MpLmZvckVhY2goKGNscykgPT5cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKGNscyksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xlYXIoKTogdm9pZCB7XG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMubWFwTGF5b3V0SXRlbT8uY2xvc2VzdChcbiAgICAgIFwiLmJ1aWxkZXItbGF5b3V0LWl0ZW1cIixcbiAgICApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAod3JhcHBlciAmJiB3cmFwcGVyICE9PSB0aGlzLm1hcExheW91dEl0ZW0pIHtcbiAgICAgIFtcInBvc2l0aW9uXCIsIFwid2lkdGhcIiwgXCJoZWlnaHRcIiwgXCJtYXJnaW5cIiwgXCJwYWRkaW5nXCIsIFwib3ZlcmZsb3dcIiwgXCJwb2ludGVyLWV2ZW50c1wiXS5mb3JFYWNoKFxuICAgICAgICAoa2V5KSA9PiB3cmFwcGVyLnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSksXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLmNsZWFyTWFuYWdlZEVsZW1lbnQodGhpcy5tYXBMYXlvdXRJdGVtKTtcbiAgICB0aGlzLmNsZWFyTWFuYWdlZEVsZW1lbnQodGhpcy5tYXBXaWRnZXRSZW5kZXJlcik7XG4gICAgdGhpcy5tYXBMYXlvdXRJdGVtID0gbnVsbDtcbiAgICB0aGlzLm1hcFdpZGdldFJlbmRlcmVyID0gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgc3luYygpOiB2b2lkIHtcbiAgICBjb25zdCBzbG90ID0gdGhpcy5vcHRpb25zLmdldFNsb3RFbGVtZW50KCk7XG4gICAgaWYgKCFzbG90KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWFwV2lkZ2V0SWQgPSB0aGlzLmdldFJlc29sdmVkTWFwV2lkZ2V0SWQoKTtcbiAgICBpZiAoIW1hcFdpZGdldElkKSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5ub3RpZnlNYXBSZXNvbHZlZChtYXBXaWRnZXRJZCk7XG5cbiAgICBpZiAoIXRoaXMuZ2V0TGlua2VkTWFwV2lkZ2V0SWQoKSkge1xuICAgICAgdGhpcy50cnlBdXRvTGlua01hcFdpZGdldChtYXBXaWRnZXRJZCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGF5b3V0SXRlbSA9IGZpbmRXaWRnZXRMYXlvdXRJdGVtKG1hcFdpZGdldElkKTtcbiAgICBjb25zdCByZW5kZXJlciA9IGZpbmRXaWRnZXRSZW5kZXJlcihtYXBXaWRnZXRJZCk7XG4gICAgaWYgKCFsYXlvdXRJdGVtIHx8ICFyZW5kZXJlcikge1xuICAgICAgLy8gUHVibGlzaGVkIHBvcnRhbDogbWFwIHdpZGdldCBET00gb2Z0ZW4gbW91bnRzIGFmdGVyIHRoZSBkYXNoYm9hcmQg4oCUIGtlZXBcbiAgICAgIC8vIHRoZSBsYXN0IHBvc2l0aW9uZWQgbWFwIGluc3RlYWQgb2YgY2xlYXJpbmcgc3R5bGVzICh0aGF0IHN0cmFuZHMgdGhlIG1hcCkuXG4gICAgICBpZiAodGhpcy5tYXBMYXlvdXRJdGVtICYmIHRoaXMubWFwV2lkZ2V0UmVuZGVyZXIpIHtcbiAgICAgICAgdGhpcy5hcHBseU1hcFNsb3RCb3VuZHModGhpcy5tYXBMYXlvdXRJdGVtLCBzbG90KTtcbiAgICAgICAgdGhpcy5maWxsTWFwUmVuZGVyZXIodGhpcy5tYXBXaWRnZXRSZW5kZXJlcik7XG4gICAgICAgIHRoaXMub3B0aW9ucy5yZXNpemVNYXBWaWV3Py4oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1hcExheW91dEl0ZW0gPSBsYXlvdXRJdGVtO1xuICAgIHRoaXMubWFwV2lkZ2V0UmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICBsYXlvdXRJdGVtLmNsYXNzTGlzdC5hZGQoTUFOQUdFRF9NQVBfQ0xBU1NbdGhpcy5vcHRpb25zLnNjb3BlXSk7XG4gICAgcmVuZGVyZXIuY2xhc3NMaXN0LmFkZChNQU5BR0VEX1JFTkRFUkVSX0NMQVNTW3RoaXMub3B0aW9ucy5zY29wZV0pO1xuICAgIHRoaXMuYXBwbHlNYXBTbG90Qm91bmRzKGxheW91dEl0ZW0sIHNsb3QpO1xuICAgIHRoaXMuZmlsbE1hcFJlbmRlcmVyKHJlbmRlcmVyKTtcbiAgICB0aGlzLm9wdGlvbnMucmVzaXplTWFwVmlldz8uKCk7XG4gIH1cbn1cbiIsImV4cG9ydCB0eXBlIExhbmdDb2RlID0gXCJ1el9sYXRcIiB8IFwidXpfY3lyXCIgfCBcInJ1XCIgfCBcImVuXCI7XG5cbnR5cGUgRGljdCA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG50eXBlIEJ1bmRsZSA9IFJlY29yZDxMYW5nQ29kZSwgRGljdD47XG5cbmNvbnN0IE1FU1NBR0VTOiBCdW5kbGUgPSB7XG4gIHV6X2xhdDoge1xuICAgIFwidGl0bGUuZGVmYXVsdFwiOiBcIlBvbGlnb24gbWEnbHVtb3RpXCIsXG4gICAgXCJ0aXRsZS5hdHRyaWJ1dGVzXCI6IFwiQXRyaWJ1dCBtYSdsdW1vdGxhcmlcIixcbiAgICBcInRpdGxlLnJlY29yZFwiOiBcIk1hJ2x1bW90ICN7e2lkfX1cIixcbiAgICBcImFjdGlvbi5waW5cIjogXCJQb3B1cG5pIHl1cW9yaS1vJ25nZ2EgcWFkYXNoXCIsXG4gICAgXCJhY3Rpb24udW5waW5cIjogXCJQb3B1cG5pIHllY2hpc2hcIixcbiAgICBcImFjdGlvbi5taW5pbWl6ZVwiOiBcIlBvcHVwbmkgeWlnJ2lzaFwiLFxuICAgIFwiYWN0aW9uLmV4cGFuZFwiOiBcIlBvcHVwbmkgb2NoaXNoXCIsXG4gICAgXCJzdGF0dXMud2FybmluZ1wiOiBcIk9nb2hsYW50aXJpc2hcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nRmVhdHVyZVwiOiBcIk9ieWVrdCBtYSdsdW1vdGxhcmkgeXVrbGFubW9xZGEuLi5cIixcbiAgICBcInN0YXR1cy5ub0NvbmZpZ3VyZWREYXRhXCI6IFwiU296bGFuZ2FuIG1heWRvbmxhciB1Y2h1biBtYSdsdW1vdCB0b3BpbG1hZGlcIixcbiAgICBcInN0YXR1cy5ub0ZpZWxkc1wiOlxuICAgICAgXCJNYXlkb25sYXIgc296bGFubWFnYW4uIFZpZGpldCBzb3psYW1hbGFyaWRhIG1heWRvbmxhcm5pIHRhbmxhbmcuXCIsXG4gICAgXCJhdHRhY2htZW50cy50aXRsZVwiOiBcIlJhc21sYXIgdmEgZmF5bGxhclwiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdBdHRhY2htZW50c1wiOiBcIlFvJ3NoaW1jaGFsYXIgeXVrbGFubW9xZGEuLi5cIixcbiAgICBcInN0YXR1cy5ub0F0dGFjaG1lbnRzXCI6IFwiUW8nc2hpbWNoYWxhciB5bydxXCIsXG4gICAgXCJhdHRhY2htZW50LmltYWdlRmFsbGJhY2tcIjogXCJSYXNtXCIsXG4gICAgXCJhdHRhY2htZW50LmZpbGVGYWxsYmFja1wiOiBcImZheWwte3tpZH19XCIsXG4gICAgXCJhdHRhY2htZW50LmRvd25sb2FkXCI6IFwiWXVrbGFiIG9saXNoXCIsXG4gICAgXCJzdGF0dXMuY2xpY2tQb2x5Z29uXCI6XG4gICAgICBcIlRhZnNpbG90bGFybmkga28ncmlzaCB1Y2h1biB4YXJpdGFkYSBwb2xpZ29ubmkgYm9zaW5nXCIsXG4gICAgXCJzdGF0dXMucmVhZHlcIjogXCJQb2x5Z29uIEluc3BlY3RvciB0YXl5b3JcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nXCI6IFwiWXVrbGFubW9xZGEuLi5cIixcbiAgICBcImVycm9yLm5vTWFwVmlld1wiOiBcIlhhcml0YSBrbydyaW5pc2hpIHRvcGlsbWFkaVwiLFxuICAgIFwiZXJyb3Iubm9MYXllcnNTZWxlY3RlZFwiOlxuICAgICAgXCJRYXRsYW0gdGFubGFubWFnYW4uIFNvemxhbWFsYXJkYSBrYW1pZGEgYml0dGEgRmVhdHVyZSBMYXllciB0YW5sYW5nLlwiLFxuICAgIFwiZXJyb3Iuc2VsZWN0ZWRMYXllcnNNaXNzaW5nXCI6XG4gICAgICBcIlRhbmxhbmdhbiBxYXRsYW1sYXIgeGFyaXRhZGEgdG9waWxtYWRpLiBUYW5sYW5nYW4gTWFwIHZpZGpldCBpY2hpZGEgc2h1IHFhdGxhbWxhciBib3JsaWdpbmkgdGVrc2hpcmluZy5cIixcbiAgICBcImVycm9yLm9iamVjdElkRmllbGRNaXNzaW5nXCI6XG4gICAgICBcIkJvc2lsZ2FuIHFhdGxhbWRhIE9iamVjdElkIG1heWRvbmkgdG9waWxtYWRpLlwiLFxuICAgIFwiZXJyb3Iub2JqZWN0SWRNaXNzaW5nXCI6IFwiT2JqZWN0SWQgdG9waWxtYWRpLiBLdXRpbGdhbiBtYXlkb246IHt7ZmllbGR9fVwiLFxuICAgIFwiZXJyb3IuZmVhdHVyZUJ5T2JqZWN0SWRNaXNzaW5nXCI6IFwiT2JqZWN0SWQgYm8neWljaGEgb2J5ZWt0IHRvcGlsbWFkaS5cIixcbiAgICBcImVycm9yLmNvbmZpZ3VyZWRGaWVsZE1pc3NpbmdcIjpcbiAgICAgIFwiQmEnemkgc296bGFuZ2FuIG1heWRvbmxhciB0b3BpbG1hZGk6IHt7ZmllbGRzfX1cIixcbiAgICBcImVycm9yLm5vRGF0YUZvckNvbmZpZ3VyZWRGaWVsZHNcIjpcbiAgICAgIFwiU296bGFuZ2FuIG1heWRvbmxhciB1Y2h1biBtYSdsdW1vdCBtYXZqdWQgZW1hc1wiLFxuICAgIFwiZXJyb3IudW5leHBlY3RlZFwiOiBcIkt1dGlsbWFnYW4geGF0bzoge3ttZXNzYWdlfX1cIixcbiAgICBcImluZGljZXMudGl0bGVcIjogXCJWZWdldGF0c2l5YSBpbmRla3NsYXJpXCIsXG4gICAgXCJpbmRpY2VzLmxvYWRpbmdcIjogXCJJbmRla3NsYXIgeXVrbGFubW9xZGEuLi5cIixcbiAgICBcImluZGljZXMubm9uZVwiOiBcIkJ1IHBvbGlnb24gdWNodW4gaW5kZWtzIG1hJ2x1bW90aSB5bydxXCIsXG4gIH0sXG4gIHV6X2N5cjoge1xuICAgIFwidGl0bGUuYXR0cmlidXRlc1wiOiBcItCQ0YLRgNC40LHRg9GCINC80LDRitC70YPQvNC+0YLQu9Cw0YDQuFwiLFxuICAgIFwidGl0bGUuZGVmYXVsdFwiOiBcItCf0L7Qu9C40LPQvtC9INC80LDRitC70YPQvNC+0YLQuFwiLFxuICAgIFwidGl0bGUucmVjb3JkXCI6IFwi0JzQsNGK0LvRg9C80L7RgiAje3tpZH19XCIsXG4gICAgXCJhY3Rpb24ucGluXCI6IFwi0J/QvtC/0LDQv9C90Lgg0Y7Sm9C+0YDQuC3RntC90LPQs9CwINKb0LDQtNCw0YhcIixcbiAgICBcImFjdGlvbi51bnBpblwiOiBcItCf0L7Qv9Cw0L/QvdC4INC10YfQuNGIXCIsXG4gICAgXCJhY3Rpb24ubWluaW1pemVcIjogXCLQn9C+0L/QsNC/0L3QuCDQudC40pPQuNGIXCIsXG4gICAgXCJhY3Rpb24uZXhwYW5kXCI6IFwi0J/QvtC/0LDQv9C90Lgg0L7Rh9C40YhcIixcbiAgICBcInN0YXR1cy53YXJuaW5nXCI6IFwi0J7Qs9C+0rPQu9Cw0L3RgtC40YDQuNGIXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ0ZlYXR1cmVcIjogXCLQntCx0YrQtdC60YIg0LzQsNGK0LvRg9C80L7RgtC70LDRgNC4INGO0LrQu9Cw0L3QvNC+0pvQtNCwLi4uXCIsXG4gICAgXCJzdGF0dXMubm9Db25maWd1cmVkRGF0YVwiOiBcItCh0L7Qt9C70LDQvdCz0LDQvSDQvNCw0LnQtNC+0L3Qu9Cw0YAg0YPRh9GD0L0g0LzQsNGK0LvRg9C80L7RgiDRgtC+0L/QuNC70LzQsNC00LhcIixcbiAgICBcInN0YXR1cy5ub0ZpZWxkc1wiOlxuICAgICAgXCLQnNCw0LnQtNC+0L3Qu9Cw0YAg0YHQvtC30LvQsNC90LzQsNCz0LDQvS4g0JLQuNC00LbQtdGCINGB0L7Qt9C70LDQvNCw0LvQsNGA0LjQtNCwINC80LDQudC00L7QvdC70LDRgNC90Lgg0YLQsNC90LvQsNC90LMuXCIsXG4gICAgXCJhdHRhY2htZW50cy50aXRsZVwiOiBcItCg0LDRgdC80LvQsNGAINCy0LAg0YTQsNC50LvQu9Cw0YBcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nQXR0YWNobWVudHNcIjogXCLSmtGe0YjQuNC80YfQsNC70LDRgCDRjtC60LvQsNC90LzQvtKb0LTQsC4uLlwiLFxuICAgIFwic3RhdHVzLm5vQXR0YWNobWVudHNcIjogXCLSmtGe0YjQuNC80YfQsNC70LDRgCDQudGe0ptcIixcbiAgICBcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiOiBcItCg0LDRgdC8XCIsXG4gICAgXCJhdHRhY2htZW50LmZpbGVGYWxsYmFja1wiOiBcItGE0LDQudC7LXt7aWR9fVwiLFxuICAgIFwiYXR0YWNobWVudC5kb3dubG9hZFwiOiBcItCu0LrQu9Cw0LEg0L7Qu9C40YhcIixcbiAgICBcInN0YXR1cy5jbGlja1BvbHlnb25cIjogXCLQotCw0YTRgdC40LvQvtGC0LvQsNGA0L3QuCDQutGe0YDQuNGIINGD0YfRg9C9INGF0LDRgNC40YLQsNC00LAg0L/QvtC70LjQs9C+0L3QvdC4INCx0L7RgdC40L3Qs1wiLFxuICAgIFwic3RhdHVzLnJlYWR5XCI6IFwiUG9seWdvbiBJbnNwZWN0b3Ig0YLQsNC50ZHRgFwiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdcIjogXCLQrtC60LvQsNC90LzQvtKb0LTQsC4uLlwiLFxuICAgIFwiZXJyb3Iubm9NYXBWaWV3XCI6IFwi0KXQsNGA0LjRgtCwINC60Z7RgNC40L3QuNGI0Lgg0YLQvtC/0LjQu9C80LDQtNC4XCIsXG4gICAgXCJlcnJvci5ub0xheWVyc1NlbGVjdGVkXCI6XG4gICAgICBcItKa0LDRgtC70LDQvCDRgtCw0L3Qu9Cw0L3QvNCw0LPQsNC9LiDQodC+0LfQu9Cw0LzQsNC70LDRgNC00LAg0LrQsNC80LjQtNCwINCx0LjRgtGC0LAgRmVhdHVyZSBMYXllciDRgtCw0L3Qu9Cw0L3Qsy5cIixcbiAgICBcImVycm9yLnNlbGVjdGVkTGF5ZXJzTWlzc2luZ1wiOlxuICAgICAgXCLQotCw0L3Qu9Cw0L3Qs9Cw0L0g0pvQsNGC0LvQsNC80LvQsNGAINGF0LDRgNC40YLQsNC00LAg0YLQvtC/0LjQu9C80LDQtNC4LiDQotCw0L3Qu9Cw0L3Qs9Cw0L0gTWFwINCy0LjQtNC20LXRgiDQuNGH0LjQtNCwINGI0YMg0pvQsNGC0LvQsNC80LvQsNGAINCx0L7RgNC70LjQs9C40L3QuCDRgtC10LrRiNC40YDQuNC90LMuXCIsXG4gICAgXCJlcnJvci5vYmplY3RJZEZpZWxkTWlzc2luZ1wiOlxuICAgICAgXCLQkdC+0YHQuNC70LPQsNC9INKb0LDRgtC70LDQvNC00LAgT2JqZWN0SWQg0LzQsNC50LTQvtC90Lgg0YLQvtC/0LjQu9C80LDQtNC4LlwiLFxuICAgIFwiZXJyb3Iub2JqZWN0SWRNaXNzaW5nXCI6IFwiT2JqZWN0SWQg0YLQvtC/0LjQu9C80LDQtNC4LiDQmtGD0YLQuNC70LPQsNC9INC80LDQudC00L7QvToge3tmaWVsZH19XCIsXG4gICAgXCJlcnJvci5mZWF0dXJlQnlPYmplY3RJZE1pc3NpbmdcIjogXCJPYmplY3RJZCDQsdGe0LnQuNGH0LAg0L7QsdGK0LXQutGCINGC0L7Qv9C40LvQvNCw0LTQuC5cIixcbiAgICBcImVycm9yLmNvbmZpZ3VyZWRGaWVsZE1pc3NpbmdcIjpcbiAgICAgIFwi0JHQsNGK0LfQuCDRgdC+0LfQu9Cw0L3Qs9Cw0L0g0LzQsNC50LTQvtC90LvQsNGAINGC0L7Qv9C40LvQvNCw0LTQuDoge3tmaWVsZHN9fVwiLFxuICAgIFwiZXJyb3Iubm9EYXRhRm9yQ29uZmlndXJlZEZpZWxkc1wiOlxuICAgICAgXCLQodC+0LfQu9Cw0L3Qs9Cw0L0g0LzQsNC50LTQvtC90LvQsNGAINGD0YfRg9C9INC80LDRitC70YPQvNC+0YIg0LzQsNCy0LbRg9C0INGN0LzQsNGBXCIsXG4gICAgXCJlcnJvci51bmV4cGVjdGVkXCI6IFwi0JrRg9GC0LjQu9C80LDQs9Cw0L0g0YXQsNGC0L46IHt7bWVzc2FnZX19XCIsXG4gICAgXCJpbmRpY2VzLnRpdGxlXCI6IFwi0JLQtdCz0LXRgtCw0YbQuNGPINC40L3QtNC10LrRgdC70LDRgNC4XCIsXG4gICAgXCJpbmRpY2VzLmxvYWRpbmdcIjogXCLQmNC90LTQtdC60YHQu9Cw0YAg0Y7QutC70LDQvdC80L7Sm9C00LAuLi5cIixcbiAgICBcImluZGljZXMubm9uZVwiOiBcItCR0YMg0L/QvtC70LjQs9C+0L0g0YPRh9GD0L0g0LjQvdC00LXQutGBINC80LDRitC70YPQvNC+0YLQuCDQudGe0ptcIixcbiAgfSxcbiAgcnU6IHtcbiAgICBcInRpdGxlLmF0dHJpYnV0ZXNcIjogXCLQkNGC0YDQuNCx0YPRgtC40LLQvdGL0LUg0LTQsNC90L3Ri9C1XCIsXG4gICAgXCJ0aXRsZS5kZWZhdWx0XCI6IFwi0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0L/QvtC70LjQs9C+0L3QtVwiLFxuICAgIFwidGl0bGUucmVjb3JkXCI6IFwi0JfQsNC/0LjRgdGMICN7e2lkfX1cIixcbiAgICBcImFjdGlvbi5waW5cIjogXCLQl9Cw0LrRgNC10L/QuNGC0Ywg0L7QutC90L4g0YHQv9GA0LDQstCwINGB0LLQtdGA0YXRg1wiLFxuICAgIFwiYWN0aW9uLnVucGluXCI6IFwi0J7RgtC60YDQtdC/0LjRgtGMINC+0LrQvdC+XCIsXG4gICAgXCJhY3Rpb24ubWluaW1pemVcIjogXCLQodCy0LXRgNC90YPRgtGMINC+0LrQvdC+XCIsXG4gICAgXCJhY3Rpb24uZXhwYW5kXCI6IFwi0KDQsNC30LLQtdGA0L3Rg9GC0Ywg0L7QutC90L5cIixcbiAgICBcInN0YXR1cy53YXJuaW5nXCI6IFwi0J/RgNC10LTRg9C/0YDQtdC20LTQtdC90LjQtVwiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdGZWF0dXJlXCI6IFwi0JfQsNCz0YDRg9C30LrQsCDQtNCw0L3QvdGL0YUg0L7QsdGK0LXQutGC0LAuLi5cIixcbiAgICBcInN0YXR1cy5ub0NvbmZpZ3VyZWREYXRhXCI6IFwi0J3QtdGCINC00LDQvdC90YvRhSDQtNC70Y8g0L3QsNGB0YLRgNC+0LXQvdC90YvRhSDQv9C+0LvQtdC5XCIsXG4gICAgXCJzdGF0dXMubm9GaWVsZHNcIjogXCLQn9C+0LvRjyDQvdC1INC90LDRgdGC0YDQvtC10L3Riy4g0JLRi9Cx0LXRgNC40YLQtSDQv9C+0LvRjyDQsiDQvdCw0YHRgtGA0L7QudC60LDRhSDQstC40LTQttC10YLQsC5cIixcbiAgICBcImF0dGFjaG1lbnRzLnRpdGxlXCI6IFwi0JjQt9C+0LHRgNCw0LbQtdC90LjRjyDQuCDRhNCw0LnQu9GLXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ0F0dGFjaG1lbnRzXCI6IFwi0JfQsNCz0YDRg9C30LrQsCDQstC70L7QttC10L3QuNC5Li4uXCIsXG4gICAgXCJzdGF0dXMubm9BdHRhY2htZW50c1wiOiBcItCd0LXRgiDQstC70L7QttC10L3QuNC5XCIsXG4gICAgXCJhdHRhY2htZW50LmltYWdlRmFsbGJhY2tcIjogXCLQmNC30L7QsdGA0LDQttC10L3QuNC1XCIsXG4gICAgXCJhdHRhY2htZW50LmZpbGVGYWxsYmFja1wiOiBcItGE0LDQudC7LXt7aWR9fVwiLFxuICAgIFwiYXR0YWNobWVudC5kb3dubG9hZFwiOiBcItCh0LrQsNGH0LDRgtGMXCIsXG4gICAgXCJzdGF0dXMuY2xpY2tQb2x5Z29uXCI6IFwi0J3QsNC20LzQuNGC0LUg0L3QsCDQv9C+0LvQuNCz0L7QvSDQvdCwINC60LDRgNGC0LUsINGH0YLQvtCx0Ysg0YPQstC40LTQtdGC0Ywg0LTQtdGC0LDQu9C4XCIsXG4gICAgXCJzdGF0dXMucmVhZHlcIjogXCJQb2x5Z29uIEluc3BlY3RvciDQs9C+0YLQvtCyXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ1wiOiBcItCX0LDQs9GA0YPQt9C60LAuLi5cIixcbiAgICBcImVycm9yLm5vTWFwVmlld1wiOiBcItCS0LjQtCDQutCw0YDRgtGLINC90LUg0L3QsNC50LTQtdC9XCIsXG4gICAgXCJlcnJvci5ub0xheWVyc1NlbGVjdGVkXCI6XG4gICAgICBcItCh0LvQvtC4INC90LUg0LLRi9Cx0YDQsNC90YsuINCSINC90LDRgdGC0YDQvtC50LrQsNGFINCy0YvQsdC10YDQuNGC0LUg0LzQuNC90LjQvNGD0Lwg0L7QtNC40L0gRmVhdHVyZSBMYXllci5cIixcbiAgICBcImVycm9yLnNlbGVjdGVkTGF5ZXJzTWlzc2luZ1wiOlxuICAgICAgXCLQktGL0LHRgNCw0L3QvdGL0LUg0YHQu9C+0Lgg0L3QtSDQvdCw0LnQtNC10L3RiyDQvdCwINC60LDRgNGC0LUuINCf0YDQvtCy0LXRgNGM0YLQtSwg0YfRgtC+INC+0L3QuCDQtdGB0YLRjCDQsiDQstGL0LHRgNCw0L3QvdC+0LwgTWFwINCy0LjQtNC20LXRgtC1LlwiLFxuICAgIFwiZXJyb3Iub2JqZWN0SWRGaWVsZE1pc3NpbmdcIjogXCLQkiDQstGL0LHRgNCw0L3QvdC+0Lwg0YHQu9C+0LUg0L3QtSDQvdCw0LnQtNC10L3QviDQv9C+0LvQtSBPYmplY3RJZC5cIixcbiAgICBcImVycm9yLm9iamVjdElkTWlzc2luZ1wiOiBcIk9iamVjdElkINC90LUg0L3QsNC50LTQtdC9LiDQntC20LjQtNCw0LXQvNC+0LUg0L/QvtC70LU6IHt7ZmllbGR9fVwiLFxuICAgIFwiZXJyb3IuZmVhdHVyZUJ5T2JqZWN0SWRNaXNzaW5nXCI6IFwi0J7QsdGK0LXQutGCINC/0L4gT2JqZWN0SWQg0L3QtSDQvdCw0LnQtNC10L0uXCIsXG4gICAgXCJlcnJvci5jb25maWd1cmVkRmllbGRNaXNzaW5nXCI6XG4gICAgICBcItCd0LXQutC+0YLQvtGA0YvQtSDQvdCw0YHRgtGA0L7QtdC90L3Ri9C1INC/0L7Qu9GPINC90LUg0L3QsNC50LTQtdC90Ys6IHt7ZmllbGRzfX1cIixcbiAgICBcImVycm9yLm5vRGF0YUZvckNvbmZpZ3VyZWRGaWVsZHNcIjogXCLQndC10YIg0LTQsNC90L3Ri9GFINC00LvRjyDQvdCw0YHRgtGA0L7QtdC90L3Ri9GFINC/0L7Qu9C10LlcIixcbiAgICBcImVycm9yLnVuZXhwZWN0ZWRcIjogXCLQndC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsDoge3ttZXNzYWdlfX1cIixcbiAgICBcImluZGljZXMudGl0bGVcIjogXCLQmNC90LTQtdC60YHRiyDQstC10LPQtdGC0LDRhtC40LhcIixcbiAgICBcImluZGljZXMubG9hZGluZ1wiOiBcItCX0LDQs9GA0YPQt9C60LAg0LjQvdC00LXQutGB0L7Qsi4uLlwiLFxuICAgIFwiaW5kaWNlcy5ub25lXCI6IFwi0J3QtdGCINC00LDQvdC90YvRhSDQv9C+INC40L3QtNC10LrRgdCw0Lwg0LTQu9GPINGN0YLQvtCz0L4g0L/QvtC70LjQs9C+0L3QsFwiLFxuICB9LFxuICBlbjoge1xuICAgIFwidGl0bGUuYXR0cmlidXRlc1wiOiBcIkF0dHJpYnV0ZSBkYXRhXCIsXG4gICAgXCJ0aXRsZS5kZWZhdWx0XCI6IFwiUG9seWdvbiBpbmZvXCIsXG4gICAgXCJ0aXRsZS5yZWNvcmRcIjogXCJSZWNvcmQgI3t7aWR9fVwiLFxuICAgIFwiYWN0aW9uLnBpblwiOiBcIlBpbiBwb3B1cCB0byB0b3AtcmlnaHRcIixcbiAgICBcImFjdGlvbi51bnBpblwiOiBcIlVucGluIHBvcHVwXCIsXG4gICAgXCJhY3Rpb24ubWluaW1pemVcIjogXCJNaW5pbWl6ZSBwb3B1cFwiLFxuICAgIFwiYWN0aW9uLmV4cGFuZFwiOiBcIkV4cGFuZCBwb3B1cFwiLFxuICAgIFwic3RhdHVzLndhcm5pbmdcIjogXCJXYXJuaW5nXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ0ZlYXR1cmVcIjogXCJMb2FkaW5nIGZlYXR1cmUgZGF0YS4uLlwiLFxuICAgIFwic3RhdHVzLm5vQ29uZmlndXJlZERhdGFcIjogXCJObyBkYXRhIGF2YWlsYWJsZSBmb3IgY29uZmlndXJlZCBmaWVsZHNcIixcbiAgICBcInN0YXR1cy5ub0ZpZWxkc1wiOlxuICAgICAgXCJObyBmaWVsZHMgY29uZmlndXJlZC4gUGxlYXNlIGNvbmZpZ3VyZSBmaWVsZHMgaW4gd2lkZ2V0IHNldHRpbmdzLlwiLFxuICAgIFwiYXR0YWNobWVudHMudGl0bGVcIjogXCJJbWFnZXMgJiBGaWxlc1wiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdBdHRhY2htZW50c1wiOiBcIkxvYWRpbmcgYXR0YWNobWVudHMuLi5cIixcbiAgICBcInN0YXR1cy5ub0F0dGFjaG1lbnRzXCI6IFwiTm8gYXR0YWNobWVudHNcIixcbiAgICBcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiOiBcIkltYWdlXCIsXG4gICAgXCJhdHRhY2htZW50LmZpbGVGYWxsYmFja1wiOiBcImF0dGFjaG1lbnQte3tpZH19XCIsXG4gICAgXCJhdHRhY2htZW50LmRvd25sb2FkXCI6IFwiRG93bmxvYWRcIixcbiAgICBcInN0YXR1cy5jbGlja1BvbHlnb25cIjogXCJDbGljayBhIHBvbHlnb24gb24gdGhlIG1hcCB0byBzZWUgaXRzIGRldGFpbHNcIixcbiAgICBcInN0YXR1cy5yZWFkeVwiOiBcIlBvbHlnb24gSW5zcGVjdG9yIFJlYWR5XCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ1wiOiBcIkxvYWRpbmcuLi5cIixcbiAgICBcImVycm9yLm5vTWFwVmlld1wiOiBcIk5vIG1hcCB2aWV3IHByb3ZpZGVkXCIsXG4gICAgXCJlcnJvci5ub0xheWVyc1NlbGVjdGVkXCI6XG4gICAgICBcIk5vIGxheWVycyBzZWxlY3RlZC4gUGxlYXNlIHNlbGVjdCBvbmUgb3IgbW9yZSBGZWF0dXJlIExheWVycyBpbiBTZXR0aW5ncy5cIixcbiAgICBcImVycm9yLnNlbGVjdGVkTGF5ZXJzTWlzc2luZ1wiOlxuICAgICAgXCJOb25lIG9mIHRoZSBzZWxlY3RlZCBsYXllcnMgd2VyZSBmb3VuZCBvbiB0aGUgbWFwLiBFbnN1cmUgdGhlIGNob3NlbiBsYXllcnMgZXhpc3QgaW4gdGhlIHNlbGVjdGVkIE1hcCB3aWRnZXQuXCIsXG4gICAgXCJlcnJvci5vYmplY3RJZEZpZWxkTWlzc2luZ1wiOiBcIk9iamVjdElkIGZpZWxkIG5vdCBmb3VuZCBmb3IgY2xpY2tlZCBsYXllci5cIixcbiAgICBcImVycm9yLm9iamVjdElkTWlzc2luZ1wiOiBcIk9iamVjdElkIG5vdCBmb3VuZC4gRXhwZWN0ZWQgZmllbGQ6IHt7ZmllbGR9fVwiLFxuICAgIFwiZXJyb3IuZmVhdHVyZUJ5T2JqZWN0SWRNaXNzaW5nXCI6IFwiRmVhdHVyZSBub3QgZm91bmQgYnkgT2JqZWN0SWQuXCIsXG4gICAgXCJlcnJvci5jb25maWd1cmVkRmllbGRNaXNzaW5nXCI6XG4gICAgICBcIlNvbWUgY29uZmlndXJlZCBmaWVsZHMgbm90IGZvdW5kOiB7e2ZpZWxkc319XCIsXG4gICAgXCJlcnJvci5ub0RhdGFGb3JDb25maWd1cmVkRmllbGRzXCI6XG4gICAgICBcIk5vIGRhdGEgYXZhaWxhYmxlIGZvciBjb25maWd1cmVkIGZpZWxkc1wiLFxuICAgIFwiZXJyb3IudW5leHBlY3RlZFwiOiBcIlVuZXhwZWN0ZWQgZXJyb3I6IHt7bWVzc2FnZX19XCIsXG4gICAgXCJpbmRpY2VzLnRpdGxlXCI6IFwiVmVnZXRhdGlvbiBpbmRpY2VzXCIsXG4gICAgXCJpbmRpY2VzLmxvYWRpbmdcIjogXCJMb2FkaW5nIGluZGljZXMuLi5cIixcbiAgICBcImluZGljZXMubm9uZVwiOiBcIk5vIGluZGV4IGRhdGEgZm9yIHRoaXMgcG9seWdvblwiLFxuICB9LFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUxhbmcoaW5wdXQ6IGFueSk6IExhbmdDb2RlIHtcbiAgY29uc3QgcmF3ID0gU3RyaW5nKGlucHV0ID8/IFwiXCIpXG4gICAgLnRyaW0oKVxuICAgIC50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmIChyYXcgPT09IFwiZW5cIiB8fCByYXcgPT09IFwiZW5nXCIgfHwgcmF3ID09PSBcImVuZ2xpc2hcIikgcmV0dXJuIFwiZW5cIjtcbiAgaWYgKHJhdyA9PT0gXCJydVwiIHx8IHJhdyA9PT0gXCJydXNcIiB8fCByYXcgPT09IFwicnVzc2lhblwiKSByZXR1cm4gXCJydVwiO1xuXG4gIGlmIChcbiAgICByYXcgPT09IFwidXpfY3lyXCIgfHxcbiAgICByYXcgPT09IFwidXotY3lyXCIgfHxcbiAgICByYXcgPT09IFwidXpfY3lybFwiIHx8XG4gICAgcmF3ID09PSBcInV6LWN5cmxcIiB8fFxuICAgIHJhdyA9PT0gXCJ1emN5cmxcIiB8fFxuICAgIHJhdyA9PT0gXCJ1el9jeXJpbGxpY1wiIHx8XG4gICAgcmF3ID09PSBcInV6LWN5cmlsbGljXCIgfHxcbiAgICByYXcgPT09IFwiY3lyaWxsaWNcIlxuICApIHtcbiAgICByZXR1cm4gXCJ1el9jeXJcIjtcbiAgfVxuXG4gIGlmIChcbiAgICByYXcgPT09IFwidXpfbGF0XCIgfHxcbiAgICByYXcgPT09IFwidXotbGF0XCIgfHxcbiAgICByYXcgPT09IFwidXpsYXRpblwiIHx8XG4gICAgcmF3ID09PSBcInV6LWxhdGluXCIgfHxcbiAgICByYXcgPT09IFwidXpcIlxuICApIHtcbiAgICByZXR1cm4gXCJ1el9sYXRcIjtcbiAgfVxuXG4gIHJldHVybiBcInV6X2xhdFwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdGlhbExhbmcoKTogTGFuZ0NvZGUge1xuICByZXR1cm4gbm9ybWFsaXplTGFuZyhcbiAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImFncmlfYXBwX2xhbmdcIikgfHxcbiAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYXBwX2xhbmdcIikgfHxcbiAgICAgIFwidXpfbGF0XCIsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0aWFsVGhlbWUoKTogYm9vbGVhbiB7XG4gIGNvbnN0IHN0b3JlZFRoZW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJhZ3JpX3YxMV9hcHBfdGhlbWVcIik7XG4gIGlmIChzdG9yZWRUaGVtZSA9PT0gXCJkYXJrXCIpIHJldHVybiB0cnVlO1xuICBpZiAoc3RvcmVkVGhlbWUgPT09IFwibGlnaHRcIikgcmV0dXJuIGZhbHNlO1xuICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgY29uc3QgaXNMaWdodCA9XG4gICAgc3RvcmVkVGhlbWUgPT09IFwibGlnaHRcIiB8fFxuICAgIHJvb3QuY2xhc3NMaXN0LmNvbnRhaW5zKFwibGlnaHQtdGhlbWVcIikgfHxcbiAgICBib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImxpZ2h0LXRoZW1lXCIpIHx8XG4gICAgcm9vdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRoZW1lXCIpID09PSBcImxpZ2h0XCI7XG4gIHJldHVybiAhaXNMaWdodDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHQoXG4gIGxhbmc6IExhbmdDb2RlLFxuICBrZXk6IHN0cmluZyxcbiAgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPixcbik6IHN0cmluZyB7XG4gIGNvbnN0IGRpY3QgPSBNRVNTQUdFU1tsYW5nXSB8fCBNRVNTQUdFUy51el9sYXQ7XG4gIGNvbnN0IGZhbGxiYWNrID0gTUVTU0FHRVMuZW5ba2V5XSA/PyBrZXk7XG4gIGNvbnN0IHRlbXBsYXRlID0gZGljdFtrZXldID8/IGZhbGxiYWNrO1xuICBpZiAoIXBhcmFtcykgcmV0dXJuIHRlbXBsYXRlO1xuXG4gIHJldHVybiBPYmplY3Qua2V5cyhwYXJhbXMpLnJlZHVjZSgocmVzdWx0LCBwYXJhbUtleSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gU3RyaW5nKHBhcmFtc1twYXJhbUtleV0gPz8gXCJcIik7XG4gICAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKG5ldyBSZWdFeHAoYFxcXFx7XFxcXHske3BhcmFtS2V5fVxcXFx9XFxcXH1gLCBcImdcIiksIHZhbHVlKTtcbiAgfSwgdGVtcGxhdGUpO1xufVxuIiwiLyoqXHJcbiAqIFB1cmUgZmllbGQgaGVscGVycyBmb3IgUG9wdXBQYW5lbCAobm8gUmVhY3QgLyBtYXAgc2lkZSBlZmZlY3RzKS5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplRmllbGRBbGlhcyhmaWVsZDogYW55LCBmYWxsYmFja05hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgbmFtZSA9IFN0cmluZyhmaWVsZD8ubmFtZSB8fCBmYWxsYmFja05hbWUgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IGFsaWFzID0gU3RyaW5nKFxyXG4gICAgZmllbGQ/LmFsaWFzIHx8IGZpZWxkPy5kaXNwbGF5TmFtZSB8fCBmaWVsZD8ubGFiZWwgfHwgXCJcIixcclxuICApLnRyaW0oKTtcclxuICBpZiAoIWFsaWFzKSByZXR1cm4gbmFtZTtcclxuICByZXR1cm4gYWxpYXM7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFB1cmUgUG9wdXBQYW5lbCBmb3JtYXQgLyBhdHRyaWJ1dGUgaGVscGVycy5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZEF0dHJpYnV0ZVZhbHVlQ2FzZUluc2Vuc2l0aXZlKFxyXG4gIGF0dHJpYnV0ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gIGZpZWxkTmFtZTogc3RyaW5nLFxyXG4pOiBhbnkge1xyXG4gIGlmICghYXR0cmlidXRlcykgcmV0dXJuIG51bGw7XHJcbiAgY29uc3QgdGFyZ2V0ID0gZmllbGROYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3Qga2V5ID0gT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZmluZCgoaykgPT4gay50b0xvd2VyQ2FzZSgpID09PSB0YXJnZXQpO1xyXG4gIHJldHVybiBrZXkgPyBhdHRyaWJ1dGVzW2tleV0gOiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZVNtYXJ0KHJhdzogYW55KTogc3RyaW5nIHtcclxuICBpZiAocmF3IGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIHJhdy50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICBpZiAodHlwZW9mIHJhdyA9PT0gXCJudW1iZXJcIiAmJiBpc0Zpbml0ZShyYXcpKSB7XHJcbiAgICBjb25zdCBtcyA9IHJhdyA8IDFlMTIgPyByYXcgKiAxMDAwIDogcmF3O1xyXG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKG1zKTtcclxuICAgIHJldHVybiBpc05hTihkLmdldFRpbWUoKSlcclxuICAgICAgPyBTdHJpbmcocmF3KVxyXG4gICAgICA6IGQudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7XHJcbiAgICAgICAgICB5ZWFyOiBcIm51bWVyaWNcIixcclxuICAgICAgICAgIG1vbnRoOiBcIjItZGlnaXRcIixcclxuICAgICAgICAgIGRheTogXCIyLWRpZ2l0XCIsXHJcbiAgICAgICAgICBob3VyOiBcIjItZGlnaXRcIixcclxuICAgICAgICAgIG1pbnV0ZTogXCIyLWRpZ2l0XCIsXHJcbiAgICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHJhdyA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgY29uc3QgdHJpbW1lZCA9IHJhdy50cmltKCk7XHJcbiAgICBpZiAoL15cXGR7MTAsMTN9JC8udGVzdCh0cmltbWVkKSkgcmV0dXJuIGZvcm1hdERhdGVTbWFydChOdW1iZXIodHJpbW1lZCkpO1xyXG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRyaW1tZWQpO1xyXG4gICAgaWYgKCFpc05hTihkLmdldFRpbWUoKSkpIHtcclxuICAgICAgcmV0dXJuIGQudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7XHJcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsXHJcbiAgICAgICAgbW9udGg6IFwiMi1kaWdpdFwiLFxyXG4gICAgICAgIGRheTogXCIyLWRpZ2l0XCIsXHJcbiAgICAgICAgaG91cjogXCIyLWRpZ2l0XCIsXHJcbiAgICAgICAgbWludXRlOiBcIjItZGlnaXRcIixcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gU3RyaW5nKHJhdyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBuaWNlQ2hhcnRNYXgodmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpIHx8IHZhbHVlIDw9IDApIHJldHVybiAxO1xyXG4gIGNvbnN0IHBhZGRlZCA9IHZhbHVlICogMS4wODtcclxuICBjb25zdCBtYWduaXR1ZGUgPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcihNYXRoLmxvZzEwKHBhZGRlZCkpKTtcclxuICBjb25zdCBub3JtYWxpemVkID0gcGFkZGVkIC8gbWFnbml0dWRlO1xyXG4gIGxldCBuaWNlID0gMTA7XHJcbiAgaWYgKG5vcm1hbGl6ZWQgPD0gMSkgbmljZSA9IDE7XHJcbiAgZWxzZSBpZiAobm9ybWFsaXplZCA8PSAyKSBuaWNlID0gMjtcclxuICBlbHNlIGlmIChub3JtYWxpemVkIDw9IDUpIG5pY2UgPSA1O1xyXG4gIHJldHVybiBuaWNlICogbWFnbml0dWRlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Q2hhcnRUaWNrKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGlmICghTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIFwiXCI7XHJcbiAgaWYgKE1hdGguYWJzKHZhbHVlKSA+PSAxMDAwKSByZXR1cm4gYCR7TWF0aC5yb3VuZCh2YWx1ZSl9YDtcclxuICBpZiAoTWF0aC5hYnModmFsdWUpID49IDEwMCkgcmV0dXJuIGAke01hdGgucm91bmQodmFsdWUpfWA7XHJcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpKSByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICByZXR1cm4gdmFsdWUudG9GaXhlZCgxKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdENoYXJ0VG9vbHRpcFZhbHVlKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGlmICghTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIFwiXCI7XHJcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpKSB7XHJcbiAgICByZXR1cm4gdmFsdWUudG9Mb2NhbGVTdHJpbmcoXCJydS1SVVwiKS5yZXBsYWNlKC9bXFx1MDBhMFxcdTIwMmZdL2csIFwiIFwiKTtcclxuICB9XHJcbiAgcmV0dXJuIHZhbHVlXHJcbiAgICAudG9Mb2NhbGVTdHJpbmcoXCJydS1SVVwiLCB7XHJcbiAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMSxcclxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAxLFxyXG4gICAgfSlcclxuICAgIC5yZXBsYWNlKC9bXFx1MDBhMFxcdTIwMmZdL2csIFwiIFwiKVxyXG4gICAgLnJlcGxhY2UoLywvZywgXCIuXCIpO1xyXG59XHJcblxyXG4vKiogQXJjR0lTIGZpZWxkIHR5cGUgZ3VhcmQgZm9yIHBvcHVwIGRhdGUgZm9ybWF0dGluZy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRXNyaURhdGVGaWVsZFR5cGUodHlwZTogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IHQgPSBTdHJpbmcodHlwZSB8fCBcIlwiKTtcclxuICByZXR1cm4gKFxyXG4gICAgdCA9PT0gXCJkYXRlXCIgfHxcclxuICAgIHQgPT09IFwidGltZXN0YW1wLW9mZnNldFwiIHx8XHJcbiAgICB0ID09PSBcImRhdGUtb25seVwiIHx8XHJcbiAgICB0ID09PSBcInRpbWUtb25seVwiXHJcbiAgKTtcclxufVxyXG5cclxuLyoqIERpc3BsYXkgc3RyaW5nIGZvciBhIHBvcHVwIGF0dHJpYnV0ZSBjZWxsLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0UG9wdXBBdHRyaWJ1dGVWYWx1ZShcclxuICByYXc6IGFueSxcclxuICBvcHRzOiB7XHJcbiAgICBpc0RhdGVGaWVsZDogYm9vbGVhbjtcclxuICAgIGZvcm1hdERhdGU6ICh2YWx1ZTogYW55KSA9PiBzdHJpbmc7XHJcbiAgfSxcclxuKTogc3RyaW5nIHtcclxuICBpZiAocmF3ID09PSBudWxsIHx8IHJhdyA9PT0gdW5kZWZpbmVkIHx8IHJhdyA9PT0gXCJcIikgcmV0dXJuIFwi4oCUXCI7XHJcblxyXG4gIGlmIChvcHRzLmlzRGF0ZUZpZWxkKSByZXR1cm4gb3B0cy5mb3JtYXREYXRlKHJhdyk7XHJcbiAgaWYgKFxyXG4gICAgKHR5cGVvZiByYXcgPT09IFwibnVtYmVyXCIgJiYgcmF3ID4gMWU5ICYmIHJhdyA8IDFlMTQpIHx8XHJcbiAgICAodHlwZW9mIHJhdyA9PT0gXCJzdHJpbmdcIiAmJiAvXlxcZHsxMCwxM30kLy50ZXN0KHJhdykpXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gb3B0cy5mb3JtYXREYXRlKHJhdyk7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHJhdyA9PT0gXCJudW1iZXJcIiAmJiBpc0Zpbml0ZShyYXcpKSB7XHJcbiAgICByZXR1cm4gcmF3XHJcbiAgICAgIC50b0xvY2FsZVN0cmluZyhcInJ1LVJVXCIpXHJcbiAgICAgIC5yZXBsYWNlKC9bXFx1MDBhMFxcdTIwMmZdL2csIFwiIFwiKVxyXG4gICAgICAucmVwbGFjZSgvLC9nLCBcIi5cIik7XHJcbiAgfVxyXG4gIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcuam9pbihcIiwgXCIpO1xyXG4gIGlmICh0eXBlb2YgcmF3ID09PSBcIm9iamVjdFwiKSByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmF3KTtcclxuICByZXR1cm4gU3RyaW5nKHJhdyk7XHJcbn1cclxuIiwiLyoqXG4gKiBAbGljZW5zZSBsdWNpZGUtcmVhY3QgdjEuMjMuMCAtIElTQ1xuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIElTQyBsaWNlbnNlLlxuICogU2VlIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNyZWF0ZUx1Y2lkZUljb24gZnJvbSAnLi4vY3JlYXRlTHVjaWRlSWNvbi5tanMnO1xuXG5jb25zdCBfX2ljb25Ob2RlID0gW1xuICBbXCJwYXRoXCIsIHsgZDogXCJNOCAydjRcIiwga2V5OiBcIjFjbXB5bVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMTYgMnY0XCIsIGtleTogXCI0bTgxdmtcIiB9XSxcbiAgW1wicmVjdFwiLCB7IHdpZHRoOiBcIjE4XCIsIGhlaWdodDogXCIxOFwiLCB4OiBcIjNcIiwgeTogXCI0XCIsIHJ4OiBcIjJcIiwga2V5OiBcIjFob3BjeVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMyAxMGgxOFwiLCBrZXk6IFwiOHRvZW44XCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk04IDE0aC4wMVwiLCBrZXk6IFwiNjQyM2JoXCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xMiAxNGguMDFcIiwga2V5OiBcIjFldGlsaVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMTYgMTRoLjAxXCIsIGtleTogXCIxZ2JvZndcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTggMThoLjAxXCIsIGtleTogXCJscnAzNXRcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTEyIDE4aC4wMVwiLCBrZXk6IFwibWh5Z3Z1XCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xNiAxOGguMDFcIiwga2V5OiBcImt6c21pbVwiIH1dXG5dO1xuY29uc3QgQ2FsZW5kYXJEYXlzID0gY3JlYXRlTHVjaWRlSWNvbihcImNhbGVuZGFyLWRheXNcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIENhbGVuZGFyRGF5cyBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYWxlbmRhci1kYXlzLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTMgM3YxNmEyIDIgMCAwIDAgMiAyaDE2XCIsIGtleTogXCJjMjRpNDhcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTE4IDE3VjlcIiwga2V5OiBcIjJiejYwblwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMTMgMTdWNVwiLCBrZXk6IFwiMWZyZHQ4XCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk04IDE3di0zXCIsIGtleTogXCIxN3NrYTBcIiB9XVxuXTtcbmNvbnN0IENoYXJ0Q29sdW1uID0gY3JlYXRlTHVjaWRlSWNvbihcImNoYXJ0LWNvbHVtblwiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgQ2hhcnRDb2x1bW4gYXMgZGVmYXVsdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2hhcnQtY29sdW1uLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtbXCJwYXRoXCIsIHsgZDogXCJtMTggMTUtNi02LTYgNlwiLCBrZXk6IFwiMTUzdWR6XCIgfV1dO1xuY29uc3QgQ2hldnJvblVwID0gY3JlYXRlTHVjaWRlSWNvbihcImNoZXZyb24tdXBcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIENoZXZyb25VcCBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jaGV2cm9uLXVwLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTEyIDE1VjNcIiwga2V5OiBcIm05ZzF4MVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNFwiLCBrZXk6IFwiaWg3bjNoXCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIm03IDEwIDUgNSA1LTVcIiwga2V5OiBcImJyc243MFwiIH1dXG5dO1xuY29uc3QgRG93bmxvYWQgPSBjcmVhdGVMdWNpZGVJY29uKFwiZG93bmxvYWRcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIERvd25sb2FkIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvd25sb2FkLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwibTYgMTQgMS41LTIuOUEyIDIgMCAwIDEgOS4yNCAxMEgyMGEyIDIgMCAwIDEgMS45NCAyLjVsLTEuNTQgNmEyIDIgMCAwIDEtMS45NSAxLjVINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgzLjlhMiAyIDAgMCAxIDEuNjkuOWwuODEgMS4yYTIgMiAwIDAgMCAxLjY3LjlIMThhMiAyIDAgMCAxIDIgMnYyXCIsXG4gICAgICBrZXk6IFwidXNka2EwXCJcbiAgICB9XG4gIF1cbl07XG5jb25zdCBGb2xkZXJPcGVuID0gY3JlYXRlTHVjaWRlSWNvbihcImZvbGRlci1vcGVuXCIsIF9faWNvbk5vZGUpO1xuXG5leHBvcnQgeyBfX2ljb25Ob2RlLCBGb2xkZXJPcGVuIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvbGRlci1vcGVuLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicG9seWxpbmVcIiwgeyBwb2ludHM6IFwiMjIgMTIgMTYgMTIgMTQgMTUgMTAgMTUgOCAxMiAyIDEyXCIsIGtleTogXCJvOTd0OWRcIiB9XSxcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwiTTUuNDUgNS4xMSAyIDEydjZhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0ydi02bC0zLjQ1LTYuODlBMiAyIDAgMCAwIDE2Ljc2IDRINy4yNGEyIDIgMCAwIDAtMS43OSAxLjExelwiLFxuICAgICAga2V5OiBcIm9vdDZtclwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgSW5ib3ggPSBjcmVhdGVMdWNpZGVJY29uKFwiaW5ib3hcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIEluYm94IGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluYm94Lm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwiTTIwIDEwYzAgNC45OTMtNS41MzkgMTAuMTkzLTcuMzk5IDExLjc5OWExIDEgMCAwIDEtMS4yMDIgMEM5LjUzOSAyMC4xOTMgNCAxNC45OTMgNCAxMGE4IDggMCAwIDEgMTYgMFwiLFxuICAgICAga2V5OiBcIjFyMGYwelwiXG4gICAgfVxuICBdLFxuICBbXCJjaXJjbGVcIiwgeyBjeDogXCIxMlwiLCBjeTogXCIxMFwiLCByOiBcIjNcIiwga2V5OiBcImlscWhyN1wiIH1dXG5dO1xuY29uc3QgTWFwUGluID0gY3JlYXRlTHVjaWRlSWNvbihcIm1hcC1waW5cIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIE1hcFBpbiBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXAtcGluLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTE0IDQuMSAxMiA2XCIsIGtleTogXCJpdGE4aTRcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwibTUuMSA4LTIuOS0uOFwiLCBrZXk6IFwiMWdvM2tmXCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIm02IDEyLTEuOSAyXCIsIGtleTogXCJtbmh0OTdcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTcuMiAyLjIgOCA1LjFcIiwga2V5OiBcIjFjZmtvMVwiIH1dLFxuICBbXG4gICAgXCJwYXRoXCIsXG4gICAge1xuICAgICAgZDogXCJNOS4wMzcgOS42OWEuNDk4LjQ5OCAwIDAgMSAuNjUzLS42NTNsMTEgNC41YS41LjUgMCAwIDEtLjA3NC45NDlsLTQuMzQ5IDEuMDQxYTEgMSAwIDAgMC0uNzQuNzM5bC0xLjA0IDQuMzVhLjUuNSAwIDAgMS0uOTUuMDc0elwiLFxuICAgICAga2V5OiBcInMwaDN5elwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgTW91c2VQb2ludGVyQ2xpY2sgPSBjcmVhdGVMdWNpZGVJY29uKFwibW91c2UtcG9pbnRlci1jbGlja1wiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgTW91c2VQb2ludGVyQ2xpY2sgYXMgZGVmYXVsdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bW91c2UtcG9pbnRlci1jbGljay5tanMubWFwXG4iLCIvKipcbiAqIEBsaWNlbnNlIGx1Y2lkZS1yZWFjdCB2MS4yMy4wIC0gSVNDXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgSVNDIGxpY2Vuc2UuXG4gKiBTZWUgdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTHVjaWRlSWNvbiBmcm9tICcuLi9jcmVhdGVMdWNpZGVJY29uLm1qcyc7XG5cbmNvbnN0IF9faWNvbk5vZGUgPSBbXG4gIFtcbiAgICBcInBhdGhcIixcbiAgICB7XG4gICAgICBkOiBcIm0xNiA2LTguNDE0IDguNTg2YTIgMiAwIDAgMCAyLjgyOSAyLjgyOWw4LjQxNC04LjU4NmE0IDQgMCAxIDAtNS42NTctNS42NTdsLTguMzc5IDguNTUxYTYgNiAwIDEgMCA4LjQ4NSA4LjQ4NWw4LjM3OS04LjU1MVwiLFxuICAgICAga2V5OiBcIjFtaWVjdVwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgUGFwZXJjbGlwID0gY3JlYXRlTHVjaWRlSWNvbihcInBhcGVyY2xpcFwiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgUGFwZXJjbGlwIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcGVyY2xpcC5tanMubWFwXG4iLCIvKipcbiAqIEBsaWNlbnNlIGx1Y2lkZS1yZWFjdCB2MS4yMy4wIC0gSVNDXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgSVNDIGxpY2Vuc2UuXG4gKiBTZWUgdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTHVjaWRlSWNvbiBmcm9tICcuLi9jcmVhdGVMdWNpZGVJY29uLm1qcyc7XG5cbmNvbnN0IF9faWNvbk5vZGUgPSBbXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xMiAxN3Y1XCIsIGtleTogXCJiYjFkdTlcIiB9XSxcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwiTTkgMTAuNzZhMiAyIDAgMCAxLTEuMTEgMS43OWwtMS43OC45QTIgMiAwIDAgMCA1IDE1LjI0VjE2YTEgMSAwIDAgMCAxIDFoMTJhMSAxIDAgMCAwIDEtMXYtLjc2YTIgMiAwIDAgMC0xLjExLTEuNzlsLTEuNzgtLjlBMiAyIDAgMCAxIDE1IDEwLjc2VjdhMSAxIDAgMCAxIDEtMSAyIDIgMCAwIDAgMC00SDhhMiAyIDAgMCAwIDAgNCAxIDEgMCAwIDEgMSAxelwiLFxuICAgICAga2V5OiBcIjFua3o4YlwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgUGluID0gY3JlYXRlTHVjaWRlSWNvbihcInBpblwiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgUGluIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpbi5tanMubWFwXG4iLCIvKipcbiAqIEBsaWNlbnNlIGx1Y2lkZS1yZWFjdCB2MS4yMy4wIC0gSVNDXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgSVNDIGxpY2Vuc2UuXG4gKiBTZWUgdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTHVjaWRlSWNvbiBmcm9tICcuLi9jcmVhdGVMdWNpZGVJY29uLm1qcyc7XG5cbmNvbnN0IF9faWNvbk5vZGUgPSBbXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xNCAxN0g1XCIsIGtleTogXCJnZm4zbXhcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTE5IDdoLTlcIiwga2V5OiBcIjZpOXRnXCIgfV0sXG4gIFtcImNpcmNsZVwiLCB7IGN4OiBcIjE3XCIsIGN5OiBcIjE3XCIsIHI6IFwiM1wiLCBrZXk6IFwiMThiNDl5XCIgfV0sXG4gIFtcImNpcmNsZVwiLCB7IGN4OiBcIjdcIiwgY3k6IFwiN1wiLCByOiBcIjNcIiwga2V5OiBcImRmbXkweFwiIH1dXG5dO1xuY29uc3QgU2V0dGluZ3MyID0gY3JlYXRlTHVjaWRlSWNvbihcInNldHRpbmdzLTJcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIFNldHRpbmdzMiBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXR0aW5ncy0yLm1qcy5tYXBcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==