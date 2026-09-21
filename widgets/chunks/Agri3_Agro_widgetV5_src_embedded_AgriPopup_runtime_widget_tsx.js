"use strict";
(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agro_widgetV5_src_embedded_AgriPopup_runtime_widget_tsx"],{

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPopup/runtime/widget.tsx":
/*!***********************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPopup/runtime/widget.tsx ***!
  \***********************************************************************************************/
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
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/chart-line.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/chart-column.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/sprout.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/calendar-days.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/inbox.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/chevron-up.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/pin.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/map-pin.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/x.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/settings-2.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/folder-open.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/paperclip.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/download.mjs");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.mjs");
/* harmony import */ var _shared_EvapoHiddenConnectors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../shared/EvapoHiddenConnectors */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/EvapoHiddenConnectors.tsx");
/* harmony import */ var _shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../shared/evapo-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-source-engine.ts");
/* harmony import */ var _shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../shared/evapo-data-layer-roles */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-layer-roles.ts");
/* harmony import */ var _shared_evapo_linked_map_layout__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../shared/evapo-linked-map-layout */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-linked-map-layout.ts");
/* harmony import */ var _shared_evapo_engine_registry__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../shared/evapo-engine-registry */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-engine-registry.ts");
/* harmony import */ var _shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../shared/evapo-map-click-debug */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-map-click-debug.ts");
/* harmony import */ var _shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../shared/feature-layer-data */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/feature-layer-data.ts");
/* harmony import */ var _shared_agri_vegetation_data_source__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../shared/agri-vegetation-data-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/agri-vegetation-data-source.ts");
/* harmony import */ var _shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../shared/agri-table-data-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/agri-table-data-source.ts");
/* harmony import */ var _data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../data/agri-filter-bus */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/data/agri-filter-bus.ts");
/* harmony import */ var _shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../shared/AgriChartLoader */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/AgriChartLoader.tsx");
/* harmony import */ var _messages__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./messages */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPopup/runtime/messages.ts");
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





















const console = {
    log: (..._args) => { },
    warn: (..._args) => { },
    error: (..._args) => { },
    info: (..._args) => { },
    debug: (..._args) => { },
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
            return (_a = (0,_messages__WEBPACK_IMPORTED_MODULE_19__.getInitialTheme)()) !== null && _a !== void 0 ? _a : !isLight;
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
            if (!layer || (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isMapImageGroupSublayer)(layer))
                return null;
            const detached = yield (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getDetachedQueryLayerFor)(layer);
            if (!detached)
                return null;
            const url = String((layer === null || layer === void 0 ? void 0 : layer.url) || "").trim().replace(/\/+$/, "");
            if (url)
                this._queryOnlyLayers.set(url, detached);
            return detached;
        });
        this.tr = (key, params) => {
            return (0,_messages__WEBPACK_IMPORTED_MODULE_19__.t)(this.state.currentLang, key, params);
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
            const normalized = (0,_messages__WEBPACK_IMPORTED_MODULE_19__.normalizeLang)(lang);
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
            const queryable = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(layer) || layer;
            if (!(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isQueryableFieldLayer)(queryable))
                return;
            const key = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(queryable) ||
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
                    const live = this.toLiveMapLayer((0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(dsLayer) || dsLayer, map);
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
            this.dataSourceEngine.syncSelection((0,_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources));
            const resolvedLayers = [];
            const layerKeyToDsId = {};
            const seen = new Set();
            const mapLayers = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getAllFeatureLayersFromMap)(view.map);
            // load() rehydrates MapImage sublayers and can drop their runtime
            // district definitionExpression — snapshot and repair synchronously so
            // a connect/retry that overlaps a field click never flashes other
            // districts' fields.
            const definitionSnapshot = this.snapshotDefinitionExpressions(mapLayers);
            for (const layer of mapLayers) {
                yield (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.safeLoadMapLayer)(layer);
                this.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, layer);
            }
            this.restoreDriftedDefinitionExpressions(definitionSnapshot);
            if (useList.length) {
                const fromDs = this.collectLayersFromDataSources(jmv, useList);
                for (const layer of fromDs.layers) {
                    const live = this.toLiveMapLayer(layer, view.map) || layer;
                    const key = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(live) || String(live.url || live.id || "");
                    const dsId = fromDs.layerKeyToDsId[key];
                    this.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, live, dsId);
                }
                for (const useDs of useList) {
                    const layer = yield this.resolveFeatureLayerForUseDataSource(jmv, useDs);
                    if (!layer)
                        continue;
                    yield (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.safeLoadMapLayer)(layer);
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
            (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("initializeMapConnection OK", {
                layerCount: resolvedLayers.length,
                layers: resolvedLayers.map((l) => l.title || l.url || l.id),
            });
            const prevKeys = (this.state.featureLayers || [])
                .map((l) => (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(l) || String(l.url || l.id || ""))
                .join("|");
            const nextKeys = resolvedLayers
                .map((l) => (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(l) || String(l.url || l.id || ""))
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
                const byUrl = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.findQueryableLayerOnMapByUrl)(map, url);
                if (byUrl)
                    return byUrl;
            }
            if (map && (layer === null || layer === void 0 ? void 0 : layer.id) != null) {
                const byId = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.findQueryableLayerOnMapById)(map, String(layer.id));
                if (byId)
                    return byId;
            }
            const queryable = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(layer);
            return (queryable || layer);
        };
        this.layerKeysMatch = (a, b) => {
            if (!a || !b)
                return false;
            const keyA = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(a);
            const keyB = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(b);
            if (keyA && keyB && keyA === keyB)
                return true;
            if (a.id != null && b.id != null && String(a.id) === String(b.id)) {
                return true;
            }
            const urlA = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.normalizeQueryableLayerUrl)(String(a.url || ""));
            const urlB = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.normalizeQueryableLayerUrl)(String(b.url || ""));
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
                const fromApi = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(jlvByApi === null || jlvByApi === void 0 ? void 0 : jlvByApi.layer);
                if (fromApi)
                    return this.toLiveMapLayer(fromApi, map);
                const jlvList = ((_d = jmv.getAllJimuLayerViews) === null || _d === void 0 ? void 0 : _d.call(jmv)) || [];
                const layerIdHint = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.extractMapLayerIdFromDsId)(dsId);
                for (const lv of jlvList) {
                    if ((lv === null || lv === void 0 ? void 0 : lv.layerDataSourceId) === dsId ||
                        (lv === null || lv === void 0 ? void 0 : lv.dataSourceId) === dsId) {
                        const resolved = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(lv === null || lv === void 0 ? void 0 : lv.layer);
                        if (resolved)
                            return this.toLiveMapLayer(resolved, map);
                    }
                }
                if (layerIdHint) {
                    const match = jlvList.find((lv) => { var _a; return String(((_a = lv === null || lv === void 0 ? void 0 : lv.layer) === null || _a === void 0 ? void 0 : _a.id) || "") === layerIdHint; });
                    const resolved = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(match === null || match === void 0 ? void 0 : match.layer);
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
                    const queryable = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(dsLayer);
                    if (queryable) {
                        const live = this.toLiveMapLayer(queryable, map);
                        if (live)
                            return live;
                    }
                    const dsUrl = String((ds === null || ds === void 0 ? void 0 : ds.url) || (queryable === null || queryable === void 0 ? void 0 : queryable.url) || (dsLayer === null || dsLayer === void 0 ? void 0 : dsLayer.url) || "");
                    if (dsUrl) {
                        const byUrl = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.findQueryableLayerOnMapByUrl)(map, dsUrl);
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
                        q.where = `${_shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__.AGRI_TABLE_JOIN_FIELD}='${escaped}'`;
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
                const layerKey = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(liveLayer) ||
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
            (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("AgriPolygon ← shared map-click SKIP (direct view click is sole owner)");
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
                const layer = this.toLiveMapLayer((0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(rawLayer) || rawLayer, map);
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
                    const layer = this.toLiveMapLayer((0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(graphic.layer) || graphic.layer, map);
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
            (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("vegetation:request", {
                uniqueid: id,
                source: "agri_vegetation_indices/FeatureServer/1",
                requestId,
            });
            this.setState({
                loadingLatestIndices: true,
            });
            try {
                const rows = yield (0,_shared_agri_vegetation_data_source__WEBPACK_IMPORTED_MODULE_15__.queryVegetationSeriesForUniqueId)(id);
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
                const date = (0,_shared_agri_vegetation_data_source__WEBPACK_IMPORTED_MODULE_15__.formatArcgisDateToYmd)(latest.raster_date);
                const values = {};
                for (const field of AgriPolygon.VEG_INDEX_FIELDS) {
                    const v = Number(latest[field]);
                    if (Number.isFinite(v))
                        values[field] = v;
                }
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("vegetation:response", {
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            try {
                document.dispatchEvent(new CustomEvent("agriPolygonMapClickPhase", {
                    detail: { phase: "click-start", timestamp: Date.now() },
                }));
            }
            catch (_u) {
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
            (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("click:received", {
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
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("onViewClick SKIP: no view/jmv");
                return;
            }
            const layers = yield this.resolveClickLayers(view, jmv);
            if (isStale())
                return;
            (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("onViewClick start", {
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
            catch (_v) {
                /* best-effort filter guard */
            }
            if (!hitResult) {
                // Empty map click while a field popup is open = deselect and return to
                // the district/region extent saved before the field zoom.
                if (this.state.showPopup || this.state.loading) {
                    (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("onViewClick: click outside — close popup + restore extent");
                    this.closePopup({ restoreExtent: true, notifyDeselect: true });
                }
                else {
                    (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("onViewClick: click outside field polygons — ignored");
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
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("field polygon hit", {
                    layerId: (_b = g.layer) === null || _b === void 0 ? void 0 : _b.id,
                    geometry: ((_c = g.geometry) === null || _c === void 0 ? void 0 : _c.type) || null,
                    attrKeys: g.attributes
                        ? Object.keys(g.attributes).slice(0, 8)
                        : [],
                });
                // queryFeatures results have no graphic.layer — use the layer we queried
                const clickedLayer = (queryHitLayer
                    ? this.toLiveMapLayer(queryHitLayer, view.map) || queryHitLayer
                    : this.toLiveMapLayer((0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getQueryableLayer)(g.layer) || g.layer, view.map));
                if (!clickedLayer) {
                    (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("no live layer for hit graphic");
                    if (!isStale())
                        this.setState({ loading: false, showPopup: false });
                    return;
                }
                const layerKey = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(clickedLayer) ||
                    String((clickedLayer === null || clickedLayer === void 0 ? void 0 : clickedLayer.url) || (clickedLayer === null || clickedLayer === void 0 ? void 0 : clickedLayer.id) || "");
                const dsId = ((_d = this.state.layerKeyToDsId) === null || _d === void 0 ? void 0 : _d[layerKey]) || null;
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("layer:resolved", {
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
                const earlyUniqueId = (_h = this.findAttributeValueCaseInsensitive(f.attributes, _shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__.AGRI_TABLE_JOIN_FIELD)) !== null && _h !== void 0 ? _h : null;
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
                        (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("selection:expand-minimized-same-field", {
                            uniqueid: earlyCleanKey,
                        });
                        this.expandPopup();
                        return;
                    }
                    (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("selection:toggle-off-same-field", {
                        uniqueid: earlyCleanKey,
                    });
                    this.clearHighlight();
                    this._activeInspectedUniqueid = null;
                    this.closePopup({ restoreExtent: true, notifyDeselect: true });
                    return;
                }
                try {
                    const loadStatus = String(clickedLayer.loadStatus || "").toLowerCase();
                    const isLoaded = Boolean(clickedLayer.loaded) || loadStatus === "loaded";
                    // Loading a live MapImage-owned sublayer rehydrates it and can clear
                    // the runtime tuman definitionExpression (other-district flash). The
                    // detached client from queryFeatureByObjectIdCached is already loaded
                    // and provides the same field metadata.
                    if (!isLoaded &&
                        !(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isMapImageOwnedLayer)(clickedLayer) &&
                        !(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isMapImageGroupSublayer)(clickedLayer)) {
                        (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("layer:load-required", {
                            title: clickedLayer.title,
                            loadStatus: loadStatus || null,
                            definitionExpression: clickedLayer.definitionExpression || null,
                        });
                        yield (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.safeLoadMapLayer)(clickedLayer);
                    }
                    else {
                        (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("layer:load-skip-already-loaded", {
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
                const configuredFields = ((_j = this.props.config) === null || _j === void 0 ? void 0 : _j.fieldsToShow) || [];
                const actualFields = Object.keys(displayAttrs);
                const missingFields = configuredFields.filter((field) => !actualFields.includes(field));
                const fieldsWithData = configuredFields.filter((name) => displayAttrs.hasOwnProperty(name) &&
                    displayAttrs[name] != null &&
                    displayAttrs[name] !== "");
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("popup OPEN", {
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
                const clickedUniqueId = (_k = this.findAttributeValueCaseInsensitive(displayAttrs, _shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__.AGRI_TABLE_JOIN_FIELD)) !== null && _k !== void 0 ? _k : this.findAttributeValueCaseInsensitive(f.attributes, _shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__.AGRI_TABLE_JOIN_FIELD);
                if (clickedUniqueId != null && String(clickedUniqueId).trim() !== "") {
                    const cleanUniqueId = String(clickedUniqueId).trim();
                    this._activeInspectedUniqueid = cleanUniqueId.replace(/[{}]/g, "").trim();
                    (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("selection:broadcast", {
                        uniqueid: cleanUniqueId,
                        source: "AgriPopup",
                        polygonMode: true,
                        destinations: ["AgriLocalization", "AgriGraff10"],
                    });
                    this.notifyGraffPolygonSelection(cleanUniqueId, true, clickStartedAt);
                    void this.fetchLatestVegetationIndices(cleanUniqueId);
                }
                else {
                    this.setState({
                        loadingLatestIndices: false,
                        latestIndexDate: null,
                        latestIndexValues: null,
                    });
                }
                const zoomTo = ((_m = (_l = this.props.config) === null || _l === void 0 ? void 0 : _l.settings) === null || _m === void 0 ? void 0 : _m.zoomToSelection) !== false;
                if (zoomTo && f.geometry && !isStale()) {
                    try {
                        // Keep the first pre-selection extent so closing restores the
                        // district/region view even if another field is clicked next.
                        if (!this._extentBeforeSelection && ((_o = view.extent) === null || _o === void 0 ? void 0 : _o.clone)) {
                            this._extentBeforeSelection = view.extent.clone();
                        }
                        // Keep the whole field visible with only a small margin.
                        const target = ((_q = (_p = f.geometry.extent) === null || _p === void 0 ? void 0 : _p.expand) === null || _q === void 0 ? void 0 : _q.call(_p, 1.08)) || f.geometry;
                        (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("zoom:start", {
                            uniqueid: clickedUniqueId == null ? null : String(clickedUniqueId),
                            geometryType: f.geometry.type,
                            durationMs: 650,
                            targetExtent: ((_r = target === null || target === void 0 ? void 0 : target.toJSON) === null || _r === void 0 ? void 0 : _r.call(target)) || null,
                        });
                        void view.goTo({ target }, { duration: 650, easing: "ease-in-out" }).then(() => (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("zoom:complete", {
                            uniqueid: clickedUniqueId == null ? null : String(clickedUniqueId),
                            scale: view.scale,
                        }), (error) => (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("zoom:failed", {
                            uniqueid: clickedUniqueId == null ? null : String(clickedUniqueId),
                            error: (error === null || error === void 0 ? void 0 : error.message) || String(error),
                        }));
                    }
                    catch (_x) {
                        /* ignore */
                    }
                }
                // Attachments are best-effort — never let a media fetch wipe an open popup
                // (that was the "vegetation updates but popup only sticks on 2nd/3rd click"
                // failure: notifyGraff ran, then loadAttachments threw → catch closed UI
                // and restoreExtentBeforeSelection made the map look like other fields).
                if (((_t = (_s = this.props.config) === null || _s === void 0 ? void 0 : _s.settings) === null || _t === void 0 ? void 0 : _t.showAttachments) !== false) {
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
                        (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("attachments failed (popup kept open)", {
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
            this.dataSourceEngine.onDsCreated(ds, (0,_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources));
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
        this.renderChartIcon = (type = "bar") => type === "line" ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_20__["default"], { className: "agri3-chart-icon", strokeWidth: 2, "aria-hidden": "true" })) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_21__["default"], { className: "agri3-chart-icon", strokeWidth: 2, "aria-hidden": "true" }));
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
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_22__["default"], { size: 14, strokeWidth: 2.2, "aria-hidden": "true" }),
                        this.tr("indices.title")),
                    latestIndexDate && !loadingLatestIndices && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-value agri3-indices-date" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_23__["default"], { size: 13, strokeWidth: 2, "aria-hidden": "true" }),
                        latestIndexDate))),
                showBlockingLoader ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-indices-loading-container" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_18__["default"], { label: this.tr("indices.loading") }))) : hasValues ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-indices-body${showRefreshLoader ? " agri3-indices-body--loading" : ""}` },
                    showRefreshLoader ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_18__["default"], { label: this.tr("indices.loading") })) : null,
                    AgriPolygon.VEG_INDEX_FIELDS.filter((f) => latestIndexValues[f] != null).map((f) => (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: `agri3-field-row agri3-index-row agri3-index-row--${f}`, key: f },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: `agri3-field-label agri3-index-label agri3-index-label--${f}` },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-index-dot", "aria-hidden": "true" }),
                            f.toUpperCase()),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("span", { className: "agri3-field-value" }, latestIndexValues[f].toFixed(4))))))) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_24__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
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
            const { selectedAttrs, selectedOID, loading, error, showPopup, popupMinimized, popupPosition, loadingAttachments, attachments, pinToCorner, } = this.state;
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
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_25__["default"], { className: "agri3-popup-minimized-icon", size: 16, strokeWidth: 2.4, "aria-hidden": "true" }))));
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
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { className: `agri3-popup-pin${pinToCorner ? " active" : ""}`, onClick: this.togglePinToCorner, title: pinToCorner ? this.tr("action.unpin") : this.tr("action.pin"), "aria-pressed": pinToCorner, type: "button" }, pinToCorner ? (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_26__["default"], { size: 15, strokeWidth: 2.2, "aria-hidden": "true" })) : (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_27__["default"], { size: 15, strokeWidth: 2.2, "aria-hidden": "true" }))),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("h2", { className: "agri3-popup-title" }, title),
                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("button", { type: "button", className: "agri3-popup-close", onClick: this.minimizePopup, "aria-label": this.tr("action.minimize"), title: this.tr("action.minimize") },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_28__["default"], { size: 16, strokeWidth: 2.4, "aria-hidden": "true" }))),
                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-popup-content" },
                    error && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-error-container" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_29__["default"], { className: "agri3-error-icon", size: 20, strokeWidth: 2.2, "aria-hidden": "true" }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-error-title" }, this.tr("status.warning")),
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-error-message" }, error))),
                    loading && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-loading-container" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_18__["default"], { label: this.tr("status.loadingFeature") }))),
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
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_24__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                            this.tr("status.noConfiguredData"))))),
                    !loading && selectedAttrs && fields.length === 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_30__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                        this.tr("status.noFields"))),
                    !loading && selectedAttrs && this.renderLatestIndices(),
                    !loading && selectedAttrs && this.renderChart(),
                    showAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-header" },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachments-title" },
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_31__["default"], { size: 15, strokeWidth: 2.2, "aria-hidden": "true" }),
                                this.tr("attachments.title"),
                                " ",
                                hasAttachments ? `(${attachments.length})` : "")),
                        loadingAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-loading-container agri3-loading-container--compact", style: { marginTop: 8 } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_18__["default"], { label: this.tr("status.loadingAttachments") }))),
                        !loadingAttachments && !hasAttachments && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting", style: { marginTop: 6 } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_31__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
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
                                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_32__["default"], { size: 14, strokeWidth: 2.2, "aria-hidden": "true" }),
                                        a.name ||
                                            this.tr("attachment.fileFallback", {
                                                id: a.id,
                                            })),
                                    jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("a", { className: "agri3-attachment-download", href: a.url, target: "_blank", rel: "noopener noreferrer", download: a.name || undefined },
                                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_33__["default"], { size: 13, strokeWidth: 2.2, "aria-hidden": "true" }),
                                        this.tr("attachment.download"))),
                                jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-attachment-file-meta" },
                                    (a.contentType || "").split("/").pop() || "",
                                    " ",
                                    a.size ? `• ${this.bytesToSize(a.size)}` : ""))))))))),
                    !loading && !selectedAttrs && !error && (jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement("div", { className: "agri3-status-indicator agri3-status-waiting" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_34__["default"], { className: "agri3-status-icon", size: 16, strokeWidth: 2.2, "aria-hidden": "true" }),
                        this.tr("status.clickPolygon"))))));
        };
        this.dataSourceEngine = (0,_shared_evapo_engine_registry__WEBPACK_IMPORTED_MODULE_12__.getSharedEvapoDataSourceEngine)(props.id);
        this.state = {
            currentLang: (0,_messages__WEBPACK_IMPORTED_MODULE_19__.getInitialLang)(),
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
        this._unbindMasterFilter = (0,_data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_17__.bindMasterFilter)(this.handleMasterFilterChanged);
        document.addEventListener("widgetSelectionChanged", this.handleWidgetSelectionChanged);
        window.addEventListener("resize", this.schedulePopupLayout);
        window.addEventListener(_shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.EVAPO_MAP_VIEW_READY_EVENT, this.handleMapViewReady);
        window.addEventListener(_shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.EVAPO_MAP_CLICK_EVENT, this.handleSharedMapClick);
        window.addEventListener(_shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.EVAPO_XY_PAGE_CLOSED_EVENT, this.handleXyPageClosed);
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
        (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("AgriPolygon mounted", {
            widgetId: this.props.id,
            embedded: this.isDashboardEmbedded(),
            mapWidgetId: this.getLinkedMapWidgetId(),
            useDataSourceIds: (0,_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources),
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
        window.removeEventListener(_shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.EVAPO_MAP_VIEW_READY_EVENT, this.handleMapViewReady);
        window.removeEventListener(_shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.EVAPO_MAP_CLICK_EVENT, this.handleSharedMapClick);
        window.removeEventListener(_shared_evapo_data_layer_roles__WEBPACK_IMPORTED_MODULE_10__.EVAPO_XY_PAGE_CLOSED_EVENT, this.handleXyPageClosed);
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
                    (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("definitionExpression drift restored", {
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
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("feature-query:cache-hit", {
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
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("feature-query:request", {
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
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("feature-query:response", {
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
        return (0,_shared_evapo_linked_map_layout__WEBPACK_IMPORTED_MODULE_11__.discoverMapWidgetIdInApp)({
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
            title.includes("sketch");
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
        if ((0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isMapImageGroupSublayer)(layer))
            return false;
        // Prefer queryable layers, but title/url identity is enough to accept a
        // live MapImage leaf that is still hydrating its query methods.
        const identity = `${layer.title || ""} ${layer.url || ""} ${((_a = layer.parent) === null || _a === void 0 ? void 0 : _a.title) || ""}`.toLowerCase();
        const looksAgri = /\bagri\b|agriculture|qishloq/.test(identity);
        if (!(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isQueryableFieldLayer)(layer) && !looksAgri)
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
            if (!layer || !(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.isQueryableFieldLayer)(layer))
                return;
            const key = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(layer) ||
                String(layer.url || layer.id || "");
            if (!key || seen.has(key))
                return;
            seen.add(key);
            liveMapLayers.push(layer);
        };
        for (const root of liveRoots) {
            // Walk groups fully — never push the Group Layer node itself
            // (FeatureLayer#load fails with unsupported-type "Group Layer").
            for (const leaf of (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.collectQueryableFieldLayers)(root)) {
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
            const key = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(layer) ||
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
                const mapLayers = (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getAllFeatureLayersFromMap)(view.map);
                for (const layer of mapLayers) {
                    yield (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.safeLoadMapLayer)(layer);
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
        if (!attributes)
            return null;
        const target = fieldName.toLowerCase();
        const key = Object.keys(attributes).find((k) => k.toLowerCase() === target);
        return key ? attributes[key] : null;
    }
    /**
     * Agri_table_data is an external Table (no geometry) — the map click still
     * resolves the polygon feature for highlight/zoom, but the displayed
     * attributes come from Agri_table_data, joined by uniqueid.
     */
    resolveDisplayAttrs(polygonAttributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const joinValue = this.findAttributeValueCaseInsensitive(polygonAttributes, _shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__.AGRI_TABLE_JOIN_FIELD);
            if (joinValue == null || String(joinValue).trim() === "") {
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("agri-table-join:SKIP-no-uniqueid", {
                    polygonAttributeKeys: Object.keys(polygonAttributes || {}),
                });
                return polygonAttributes || {};
            }
            try {
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("agri-table-join:request", {
                    uniqueid: String(joinValue),
                    source: "Agri_table_data/FeatureServer/2",
                });
                const agriRecord = yield (0,_shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_16__.queryAgriRecordByUniqueId)(String(joinValue));
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickDebug)("agri-table-join:response", {
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
                (0,_shared_evapo_map_click_debug__WEBPACK_IMPORTED_MODULE_13__.evapoMapClickWarn)("Agri_table_data lookup failed", {
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
                    attachmentsExpanded: true, // keep area visible if you want "No attachments"
                });
                return;
            }
            try {
                this.revokeAllAttachmentUrls();
                this.setState({ loadingAttachments: true, attachments: [] });
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
                        attachmentsExpanded: true,
                    });
                    return;
                }
                this.setState({
                    loadingAttachments: false,
                    attachments: [],
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
        const t = String((fld === null || fld === void 0 ? void 0 : fld.type) || "");
        return (t === "date" ||
            t === "timestamp-offset" ||
            t === "date-only" ||
            t === "time-only");
    }
    getClickedLayer() {
        const key = this.state.lastClickedLayerKey;
        if (!key)
            return null;
        return (this.state.featureLayers.find((L) => (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_14__.getEvapoLayerMapKey)(L) === key ||
            String(L.url || L.id || "") === key) || null);
    }
    normalizeFieldAlias(field, fallbackName) {
        const name = String((field === null || field === void 0 ? void 0 : field.name) || fallbackName || "").trim();
        const alias = String((field === null || field === void 0 ? void 0 : field.alias) || (field === null || field === void 0 ? void 0 : field.displayName) || (field === null || field === void 0 ? void 0 : field.label) || "").trim();
        if (!alias)
            return name;
        return alias;
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
                return this.formatDateSmart(Number(trimmed));
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
    formatValue(name, raw) {
        if (raw === null || raw === undefined || raw === "")
            return "—";
        if (this.isDateField(name))
            return this.formatDateSmart(raw);
        if ((typeof raw === "number" && raw > 1e9 && raw < 1e14) ||
            (typeof raw === "string" && /^\d{10,13}$/.test(raw))) {
            return this.formatDateSmart(raw);
        }
        if (typeof raw === "number" && isFinite(raw))
            return raw.toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ").replace(/,/g, ".");
        if (Array.isArray(raw))
            return raw.join(", ");
        if (typeof raw === "object")
            return JSON.stringify(raw);
        return String(raw);
    }
    getOutFields(layer, oidField) {
        // keep your debugging behavior
        return ["*"];
    }
    componentDidUpdate(prevProps, prevState) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const prevDs = (0,_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(prevProps.useDataSources).join("|");
        const nextDs = (0,_shared_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_9__.getSelectedDsIds)(this.props.useDataSources).join("|");
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
    formatChartTick(value) {
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
    formatChartTooltipValue(value) {
        if (!Number.isFinite(value))
            return "";
        if (Number.isInteger(value))
            return value.toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");
        return value.toLocaleString("ru-RU", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).replace(/[\u00a0\u202f]/g, " ").replace(/,/g, ".");
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
            jimu_core__WEBPACK_IMPORTED_MODULE_7__.React.createElement(_shared_EvapoHiddenConnectors__WEBPACK_IMPORTED_MODULE_8__.EvapoHiddenConnectors, { useDataSources: useDataSources, useMapWidgetIds: useMapWidgetIds, onDataSourceCreated: this.onDataSourceCreated, onActiveViewChange: this.onActiveViewChange }),
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
AgriPolygon.VEG_INDEX_FIELDS = [
    "ndvi",
    "savi",
    "rvi",
    "ci",
    "evi",
    "ndwi",
];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AgriPolygon);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPopup/runtime/messages.ts":
/*!************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPopup/runtime/messages.ts ***!
  \************************************************************************************************/
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
    return normalizeLang(localStorage.getItem("evapo_app_lang") ||
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

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/EvapoHiddenConnectors.tsx":
/*!***************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/EvapoHiddenConnectors.tsx ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EvapoHiddenConnectors: () => (/* binding */ EvapoHiddenConnectors)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-arcgis */ "jimu-arcgis");
/* harmony import */ var _evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./evapo-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-source-engine.ts");
/** @jsx jsx */



/** Hidden DataSource + Map connectors (same pattern as LocalizationWidgetV20).
 * Only connect the first useDataSource — mounting all ~30+ region FeatureServers
 * on every child remount floods Network with FeatureServer?f=json loads and
 * does not help map hit-testing (live MapView layers are used instead). */
function EvapoHiddenConnectors(props) {
    const selectedUseDataSources = (0,_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_2__.toPlainArray)(props.useDataSources);
    const mapWidgetId = (0,_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_2__.toPlainArray)(props.useMapWidgetIds)[0];
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

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-source-engine.ts":
/*!*****************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-source-engine.ts ***!
  \*****************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EvapoDataSourceEngine: () => (/* binding */ EvapoDataSourceEngine),
/* harmony export */   getSelectedDsIds: () => (/* binding */ getSelectedDsIds),
/* harmony export */   toPlainArray: () => (/* binding */ toPlainArray)
/* harmony export */ });
/* harmony import */ var _feature_layer_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./feature-layer-data */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/feature-layer-data.ts");
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
 * Prefers EXB DataSources (same path as LocalizationWidgetV20),
 * falls back to JimuMapView map layers.
 */
class EvapoDataSourceEngine {
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
        return (0,_feature_layer_data__WEBPACK_IMPORTED_MODULE_0__.buildEvapoWhere)({
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
            22;
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

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-engine-registry.ts":
/*!**************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-engine-registry.ts ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getEvapoDashboardRootId: () => (/* binding */ getEvapoDashboardRootId),
/* harmony export */   getSharedEvapoDataSourceEngine: () => (/* binding */ getSharedEvapoDataSourceEngine)
/* harmony export */ });
/* harmony import */ var _evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./evapo-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-source-engine.ts");

const DASHBOARD_CHILD_SUFFIXES = [
    "-localization",
    "-indicator",
    "-region",
    "-pie",
    "-graff",
    "-bar",
    "-popup",
];
/** Root EvapoDashboardV6 widget id from any embedded child id. */
function getEvapoDashboardRootId(widgetId) {
    const id = String(widgetId || "");
    for (const suffix of DASHBOARD_CHILD_SUFFIXES) {
        if (id.endsWith(suffix))
            return id.slice(0, -suffix.length);
    }
    return id;
}
const sharedEngines = new Map();
/** One DataSource engine per dashboard instance — shared by all embedded children. */
function getSharedEvapoDataSourceEngine(widgetId) {
    const rootId = getEvapoDashboardRootId(widgetId);
    let engine = sharedEngines.get(rootId);
    if (!engine) {
        engine = new _evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_0__.EvapoDataSourceEngine();
        sharedEngines.set(rootId, engine);
    }
    return engine;
}


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-linked-map-layout.ts":
/*!****************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-linked-map-layout.ts ***!
  \****************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EvapoLinkedMapLayoutManager: () => (/* binding */ EvapoLinkedMapLayoutManager),
/* harmony export */   discoverMapWidgetIdInApp: () => (/* binding */ discoverMapWidgetIdInApp),
/* harmony export */   isKnownMapWidgetId: () => (/* binding */ isKnownMapWidgetId)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./evapo-data-source-engine */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/evapo-data-source-engine.ts");


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
class EvapoLinkedMapLayoutManager {
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
        const ids = (0,_evapo_data_source_engine__WEBPACK_IMPORTED_MODULE_1__.toPlainArray)(this.options.getUseMapWidgetIds());
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

/***/ "./node_modules/lucide-react/dist/esm/icons/chart-line.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/chart-line.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyb193aWRnZXRWNV9zcmNfZW1iZWRkZWRfQWdyaVBvcHVwX3J1bnRpbWVfd2lkZ2V0X3RzeC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscURBQXFEO0FBQ3JELHVHQUF1Rzs7Ozs7Ozs7OztBQUVwRTtBQUVtQjtBQUNkO0FBQ0Q7QUFDc0I7QUFDQTtBQUNIO0FBTXZDO0FBaUJHO0FBQ3FEO0FBSTVCO0FBQytHO0FBQzlFO0FBQ0k7QUFLeEM7QUFlSDtBQUlTO0FBSUw7QUFDb0I7QUFDSDtBQU8xQztBQUVwQixNQUFNLE9BQU8sR0FBRztJQUNkLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzVCLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzdCLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzlCLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzdCLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0NBQy9CLENBQUM7QUFtRkYsTUFBcUIsV0FBWSxTQUFRLDRDQUFLLENBQUMsYUFHOUM7SUEyQ1MsYUFBYSxDQUNuQixJQUErQztRQUUvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ2pDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFakMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO1lBQy9CLE1BQU0sSUFBSSxHQUNQLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQXdCO2dCQUNwRSxRQUFRLENBQUMsZUFBZSxDQUFDO1lBQzNCLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztpQkFDL0IsZ0JBQWdCLENBQUMsOEJBQThCLENBQUM7aUJBQ2hELElBQUksRUFBRSxDQUFDO1lBQ1YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzdDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRU8sb0JBQW9CLENBQzFCLElBQXVDLEVBQ3ZDLElBQVk7UUFFWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQztZQUMvQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUM7WUFDeEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNqQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFTyxrQkFBa0IsQ0FDeEIsSUFBK0MsRUFDL0MsTUFBTSxHQUFHLEtBQUssRUFDZCxRQUEwQzs7UUFFMUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNuQixNQUFNLElBQUksR0FDUixjQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsQ0FBQyxtQ0FBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVELFlBQVksS0FBNkI7UUFDdkMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBbkdQLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsd0JBQW1CLEdBQXdCLElBQUksQ0FBQztRQUNoRCxrQkFBYSxHQUE0QixJQUFJLENBQUM7UUFDOUMsaUJBQVksR0FBdUIsSUFBSSxDQUFDO1FBQ2hELDhFQUE4RTtRQUN0RSxxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDckIsY0FBUyxHQUFvQyw0Q0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQy9ELG9CQUFlLEdBQWdDLElBQUksQ0FBQztRQUNwRCxzQkFBaUIsR0FBMEIsSUFBSSxDQUFDO1FBQ2hELDBCQUFxQixHQUEwQixJQUFJLENBQUM7UUFDcEQsMkJBQXNCLEdBQXlCLElBQUksQ0FBQztRQUM1RCxnR0FBZ0c7UUFDeEYsNkJBQXdCLEdBQWtCLElBQUksQ0FBQztRQUN2RCxxRkFBcUY7UUFDN0Usc0JBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUN6QixxQkFBZ0IsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xDLHNCQUFpQixHQUF5QyxJQUFJLENBQUM7UUFDL0Qsb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFDcEIsMEJBQXFCLEdBQTBCLElBQUksQ0FBQztRQUMzQyw0QkFBdUIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNsRCx1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFHakMsQ0FBQztRQUNKLG9GQUFvRjtRQUM1RSxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUVuRCx5QkFBb0IsR0FBeUMsSUFBSSxDQUFDO1FBQ2xFLHNCQUFpQixHQUF5QyxJQUFJLENBQUM7UUFDL0QsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUNiLHNCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUNoQywyQkFBc0IsR0FBMEMsSUFBSSxDQUFDO1FBQzVELGdCQUFXLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLGlCQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ25DLDZFQUE2RTtRQUM1RCxxQ0FBZ0MsR0FBRyxFQUFFLENBQUM7UUFDdEMsbUNBQThCLEdBQUcsRUFBRSxDQUFDO1FBQ3JELDhGQUE4RjtRQUN0Riw0QkFBdUIsR0FBRyxDQUFDLENBQUM7UUF1RzVCLHFCQUFnQixHQUFHLEdBQVksRUFBRTs7WUFDdkMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBRTNCLElBQUksQ0FBQztnQkFDSCxNQUFNLFVBQVUsR0FDZCxZQUFZLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBRTdDLElBQUksVUFBVSxLQUFLLE9BQU87b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQ3pDLElBQUksVUFBVSxLQUFLLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDekMsQ0FBQztZQUFDLFdBQU0sQ0FBQztnQkFDUCwrQkFBK0I7WUFDakMsQ0FBQztZQUVELE1BQU0sT0FBTyxHQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxPQUFPO2dCQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUV6QyxPQUFPLGlFQUFlLEVBQUUsbUNBQUksQ0FBQyxPQUFPLENBQUM7UUFDdkMsQ0FBQyxDQUFDO1FBOEhGOzs7Ozs7Ozs7V0FTRztRQUNLLDBCQUFxQixHQUFHLENBQzlCLEtBQVUsRUFDMkIsRUFBRTtZQUN2QyxJQUFJLENBQUMsS0FBSyxJQUFJLG9GQUF1QixDQUFDLEtBQUssQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUMxRCxNQUFNLFFBQVEsR0FBRyxNQUFNLHFGQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsR0FBRyxLQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDaEUsSUFBSSxHQUFHO2dCQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sUUFBMEMsQ0FBQztRQUNwRCxDQUFDLEVBQUM7UUE4SE0sT0FBRSxHQUFHLENBQ1gsR0FBVyxFQUNYLE1BQXdDLEVBQ2hDLEVBQUU7WUFDVixPQUFPLDZDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQztRQUVNLHVCQUFrQixHQUFHLEdBQVMsRUFBRTtZQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzVDLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxXQUFXLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDOUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDL0IsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGVBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUM7YUFDekMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO2dCQUMvQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDO2FBQzNCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUVNLHNCQUFpQixHQUFHLENBQUMsQ0FBTSxFQUFRLEVBQUU7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU87WUFDN0IsTUFBTSxNQUFNLEdBQUcsRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLE1BQU0sS0FBSSxFQUFFLENBQUM7WUFDL0IsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFFMUMsSUFBSSxPQUFPLE1BQU0sQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzVDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ25DLENBQUM7aUJBQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQzVDLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE9BQU8sQ0FBQztZQUMvRCxDQUFDO1lBRUQsSUFBSSxXQUFXLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDakMsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVNLHlCQUFvQixHQUFHLENBQUMsQ0FBTSxFQUFRLEVBQUU7O1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFBRSxPQUFPO1lBQzdCLE1BQU0sSUFBSSxHQUFHLFFBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxNQUFNLDBDQUFFLElBQUksTUFBSSxPQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsTUFBTSwwQ0FBRSxRQUFRLE1BQUksT0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLE1BQU0sMENBQUUsSUFBSSxFQUFDO1lBQ3ZFLE1BQU0sVUFBVSxHQUFHLHlEQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLENBQUM7UUFDSCxDQUFDLENBQUM7UUFxR00sdUJBQWtCLEdBQUcsQ0FBQyxHQUE2QixFQUFRLEVBQUU7WUFDbkUsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDO2dCQUFFLE9BQU87WUFDcEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQztRQUVNLHdCQUFtQixHQUFHLEdBQVMsRUFBRTtZQUN2QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0I7Z0JBQUUsT0FBTztZQUNsQyxJQUFJLElBQUksQ0FBQyxpQkFBaUI7Z0JBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2dCQUM5QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNsQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUM7UUFFTSxvQ0FBK0IsR0FBRyxHQUFTLEVBQUU7WUFDbkQsSUFBSSxJQUFJLENBQUMsZUFBZTtnQkFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxlQUFlLEdBQUcscUJBQXFCLENBQUMsR0FBRyxFQUFFO29CQUNoRCxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztvQkFDekIsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFTSw0QkFBdUIsR0FBRyxDQUNoQyxJQUF1QyxFQUNiLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ2pDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO2dCQUMvQixPQUFPO29CQUNMLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0NBQWdDO29CQUNsRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsOEJBQThCO2lCQUNsRCxDQUFDO1lBQ0osQ0FBQztZQUVELE9BQU87Z0JBQ0wsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLE1BQU07Z0JBQ25DLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU07YUFDckIsQ0FBQztRQUNKLENBQUMsQ0FBQztRQUVNLDZCQUF3QixHQUFHLEdBQUcsRUFBRTs7WUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU87WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztnQkFBRSxPQUFPO1lBQ2xDLElBQUksSUFBSSxDQUFDLGdCQUFnQjtnQkFBRSxPQUFPO1lBQ2xDLE1BQU0sSUFBSSxHQUFHLFVBQUksQ0FBQyxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLENBQUM7WUFDMUMsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTztZQUVsQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDNUQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNyQixDQUFDO3FCQUFNLENBQUM7b0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO2dCQUNELE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtnQkFBRSxPQUFPO1lBQ3RDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQ3hCLElBQUksQ0FDTCxDQUFDO1lBQ0YsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQztRQUVNLHNCQUFpQixHQUFHLEdBQUcsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxDQUNYLENBQUMsSUFBSSxFQUFFLEVBQUU7O2dCQUNQLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDL0IsTUFBTSxJQUFJLEdBQUcsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLDBDQUFFLElBQUksQ0FBQztnQkFFMUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFFN0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDVCxJQUFJLElBQUk7d0JBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckQsQ0FBQztxQkFBTSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDekMsR0FBRyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7cUJBQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDaEIsTUFBTSxJQUFJLEdBQUksSUFBSSxDQUFDLFNBQXlCLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDckUsR0FBRyxHQUFHO3dCQUNKLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQzt3QkFDN0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO3FCQUM5QixDQUFDO2dCQUNKLENBQUM7Z0JBRUQsT0FBTztvQkFDTCxXQUFXLEVBQUUsSUFBSTtvQkFDakIsYUFBYSxFQUFFLEdBQUc7b0JBQ2xCLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWE7aUJBQ2hELENBQUM7WUFDSixDQUFDLEVBQ0QsR0FBRyxFQUFFO2dCQUNILElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3pCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztZQUNILENBQUMsQ0FDRixDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRU0sdUJBQWtCLEdBQUcsQ0FBQyxLQUFpQixFQUFFLEVBQUU7O1lBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFBRSxPQUFPO1lBQzdELHNFQUFzRTtZQUN0RSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYztnQkFBRSxPQUFPO1lBRXRDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFxQixDQUFDO1lBQzNDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFBRSxPQUFPO1lBRS9ELE1BQU0sWUFBWSxHQUFHLGdCQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSSwwQ0FBRSxTQUFTLENBQUM7WUFDN0QsSUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQUUsT0FBTztZQUUxRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sV0FBVyxHQUFHLFlBQUMsTUFBc0IsRUFBQyxPQUFPLG1EQUNqRCxrUUFBa1EsQ0FDblEsQ0FBQztnQkFDRixJQUFJLFdBQVc7b0JBQUUsT0FBTztZQUMxQixDQUFDO1lBRUQsbUVBQW1FO1lBQ25FLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUM7UUFFTSwyQkFBc0IsR0FBRyxDQUFDLENBQW1DLEVBQUUsRUFBRTtZQUN2RSxvREFBb0Q7WUFDcEQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQXFCLENBQUM7WUFDdkMsSUFBSSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsT0FBTyxDQUFDLG9DQUFvQyxDQUFDO2dCQUFFLE9BQU87WUFDbEUsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTztZQUUzQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPO1lBRXJCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHO2dCQUN0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDeEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUc7YUFDeEIsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDO1FBRU0sb0JBQWUsR0FBRyxDQUFDLENBQWEsRUFBRSxFQUFFOztZQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7Z0JBQUUsT0FBTztZQUN2RCxNQUFNLElBQUksR0FBRyxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSSxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU87WUFFbEIsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3RDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ3ZDLENBQUM7WUFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUM7UUFFTSxtQkFBYyxHQUFHLEdBQUcsRUFBRTtZQUM1QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQztRQTJCRiw0REFBNEQ7UUFFcEQsd0JBQW1CLEdBQUcsQ0FBQyxJQUF1QyxFQUFFLEVBQUU7WUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGlFQUFhLENBQUM7b0JBQ3ZDLEVBQUUsRUFBRSx3QkFBd0I7b0JBQzVCLEtBQUssRUFBRSw0QkFBNEI7aUJBQ3BDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVNLHFCQUFnQixHQUFHLENBQUMsUUFBeUIsRUFBRSxFQUFFOztZQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTztZQUMvQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFdEIsc0VBQXNFO1lBQ3RFLElBQUksQ0FBQztnQkFDSCw0QkFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLDBDQUFFLElBQUksMENBQUUsUUFBUSwwQ0FBRSxTQUFTLGtEQUFJLENBQUM7WUFDeEQsQ0FBQztZQUFDLFdBQU0sQ0FBQztnQkFDUCxZQUFZO1lBQ2QsQ0FBQztZQUVELHlFQUF5RTtZQUN6RSxzREFBc0Q7WUFDdEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxxRUFBZ0IsQ0FBQztnQkFDdEMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsSUFBSSxxRUFBZ0IsQ0FBQztvQkFDNUIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO29CQUMxQixLQUFLLEVBQUUsQ0FBQztvQkFDUixLQUFLLEVBQUUsT0FBTztpQkFDZixDQUFDO2FBQ0gsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxlQUFlLEdBQUcsSUFBSSxxRUFBZ0IsQ0FBQztnQkFDM0MsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsSUFBSSxxRUFBZ0IsQ0FBQztvQkFDNUIsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixLQUFLLEVBQUUsQ0FBQztvQkFDUixLQUFLLEVBQUUsT0FBTztpQkFDZixDQUFDO2FBQ0gsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksb0RBQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxvREFBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO2dCQUMzQixJQUFJLENBQUMscUJBQXFCO2dCQUMxQixJQUFJLENBQUMsaUJBQWlCO2FBQ3ZCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUVNLG1CQUFjLEdBQUcsR0FBRyxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZTtnQkFBRSxPQUFPO1lBQ2xDLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBQ3BDLENBQUM7WUFDRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUNoQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRU0saUNBQTRCLEdBQUcsR0FBRyxFQUFFOztZQUMxQyxNQUFNLElBQUksR0FBRyxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSSxDQUFDO1lBQzFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztZQUNoRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1lBQ25DLE1BQU0sTUFBTSxHQUFHLGlCQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sMENBQUUsUUFBUSwwQ0FBRSxlQUFlLE1BQUssS0FBSyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU87WUFDN0MsSUFBSSxDQUFDO2dCQUNILEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQLFlBQVk7WUFDZCxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRU0scUJBQWdCLEdBQUcsR0FBRyxFQUFFOztZQUM5QixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxJQUFJLEdBQUcsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLDBDQUFFLElBQUksQ0FBQztnQkFDMUMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7WUFDcEMsQ0FBQztZQUNELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBb0RNLHVCQUFrQixHQUFHLENBQUMsS0FBWSxFQUFRLEVBQUU7O1lBQ2xELE1BQU0sV0FBVyxHQUFHLE1BQUMsS0FBK0MsQ0FBQyxNQUFNLDBDQUN2RSxXQUFXLENBQUM7WUFDaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDM0MsSUFBSSxXQUFXLElBQUksTUFBTSxJQUFJLFdBQVcsS0FBSyxNQUFNO2dCQUFFLE9BQU87WUFDNUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBRU0sNEJBQXVCLEdBQUcsR0FBUyxFQUFFOztZQUMzQyxvRUFBb0U7WUFDcEUsMEVBQTBFO1lBQzFFLDBFQUEwRTtZQUMxRSxJQUFJLFVBQUksQ0FBQyxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFdBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSwwQ0FBRSxNQUFNLEdBQUUsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3BELENBQUM7Z0JBQ0QsT0FBTztZQUNULENBQUM7WUFDRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNoRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUQsSUFBSSxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDckMsT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPO1lBQ3pCLElBQUksSUFBSSxDQUFDLG9CQUFvQjtnQkFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7O2dCQUMxQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQUUsT0FBTztnQkFDN0IsSUFBSSxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSTtvQkFBRSxPQUFPO2dCQUN6QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3JELElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLElBQUk7b0JBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQztRQUVNLHlCQUFvQixHQUFHLENBQUMsR0FBZ0IsRUFBUSxFQUFFO1lBQ3hELElBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxpQkFBaUI7Z0JBQUUsT0FBTztZQUM3RCxJQUFJLElBQUksQ0FBQyxpQkFBaUI7Z0JBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFBRSxPQUFPO2dCQUM3QixLQUFLLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUM7UUEwQk0scUJBQWdCLEdBQUcsQ0FDekIsTUFBNkIsRUFDN0IsY0FBc0MsRUFDdEMsSUFBaUIsRUFDakIsS0FBVSxFQUNWLElBQWEsRUFDUCxFQUFFO1lBQ1IsTUFBTSxTQUFTLEdBQUcsOEVBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQ3BELElBQUksQ0FBQyxrRkFBcUIsQ0FBQyxTQUFTLENBQUM7Z0JBQUUsT0FBTztZQUM5QyxNQUFNLEdBQUcsR0FDUCxnRkFBbUIsQ0FBQyxTQUFTLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFBRSxPQUFPO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQWdDLENBQUMsQ0FBQztZQUM5QyxJQUFJLElBQUk7Z0JBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN2QyxDQUFDLENBQUM7UUFFTSxpQ0FBNEIsR0FBRyxDQUNyQyxHQUFnQixFQUNoQixPQUFjLEVBSWQsRUFBRTs7WUFDRixNQUFNLE1BQU0sR0FBMEIsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sY0FBYyxHQUEyQixFQUFFLENBQUM7WUFDbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUMvQixNQUFNLEdBQUcsR0FBRyxTQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsSUFBSSwwQ0FBRSxHQUFHLENBQUM7WUFFM0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxZQUFZLEtBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxJQUFJO29CQUFFLFNBQVM7Z0JBRXBCLE1BQU0sUUFBUSxHQUFHLFVBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSwwQ0FBRyxJQUFJLENBQVEsQ0FBQztnQkFDM0QsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDYixNQUFNLFdBQVcsR0FDZixRQUFRLENBQUMsS0FBSzt3QkFDZCxDQUFDLE9BQU8sUUFBUSxDQUFDLFFBQVEsS0FBSyxVQUFVOzRCQUN0QyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTs0QkFDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNuRCxJQUFJLElBQUk7d0JBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsQ0FBQztnQkFFRCxNQUFNLEtBQUssR0FBRyx3REFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDOUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQVEsQ0FBQztnQkFDNUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztvQkFDUCxNQUFNLE9BQU8sR0FDWCxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUMxRCxFQUFFLENBQUMsS0FBSyxDQUFDO29CQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQzlCLDhFQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sRUFDckMsR0FBRyxDQUNKLENBQUM7b0JBQ0YsSUFBSSxJQUFJO3dCQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQztRQUNwQyxDQUFDLENBQUM7UUFFRix1QkFBa0IsR0FBRyxDQUFDLFdBQXdCLEVBQUUsRUFBRTs7WUFDaEQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXhCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDakIsVUFBSSxDQUFDLHFCQUFxQiwwQ0FBRSxVQUFVLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDWixXQUFXLEVBQUUsSUFBSTtvQkFDakIsYUFBYSxFQUFFLEVBQUU7b0JBQ2pCLGFBQWEsRUFBRSxJQUFJO29CQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDakMsU0FBUyxrQ0FDSixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FDdkIsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FDdEM7aUJBQ0YsQ0FBQyxDQUFDO2dCQUNILE9BQU87WUFDVCxDQUFDO1lBRUQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztZQUNwQyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNmLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUNsQixXQUFtQixDQUFDLEVBQUUsSUFBSyxXQUFtQixDQUFDLFdBQVcsSUFBSSxFQUFFLENBQ2xFLENBQUM7WUFDRix3RUFBd0U7WUFDeEUsSUFBSSxNQUFNLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMzRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7b0JBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLFdBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSwwQ0FBRSxNQUFNLEdBQUUsQ0FBQztvQkFDdEMsS0FBSyxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBQ0QsT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDO1lBRWpDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxHQUFTLEVBQUU7Z0JBQ3hDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU87Z0JBRWxCLHlFQUF5RTtnQkFDekUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFakMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMvQixNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2xDLENBQUM7cUJBQU0sQ0FBQztvQkFDTixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFPLEtBQUssRUFBRSxFQUFFO3dCQUM1QyxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUNWLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs0QkFDWCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQy9CLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUNoRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzt3QkFDbEMsQ0FBQztvQkFDSCxDQUFDLEVBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0gsQ0FBQyxFQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFTSw0QkFBdUIsR0FBRyxDQUFPLEdBQWdCLEVBQUUsRUFBRTs7WUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU87WUFDN0IsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7Z0JBQUUsT0FBTztZQUUvQixNQUFNLE9BQU8sR0FBRyxDQUFDLGdCQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsMENBQUUsU0FBUyxrREFBYyxLQUFJLEVBQUUsQ0FBQztZQUMxRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekQsNkVBQTZFO1lBQzdFLHFFQUFxRTtZQUNyRSwwQ0FBMEM7WUFFMUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxrRkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFFakYsTUFBTSxjQUFjLEdBQTBCLEVBQUUsQ0FBQztZQUNqRCxNQUFNLGNBQWMsR0FBMkIsRUFBRSxDQUFDO1lBQ2xELE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFFL0IsTUFBTSxTQUFTLEdBQUcsdUZBQTBCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELGtFQUFrRTtZQUNsRSx1RUFBdUU7WUFDdkUsa0VBQWtFO1lBQ2xFLHFCQUFxQjtZQUNyQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RSxLQUFLLE1BQU0sS0FBSyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUM5QixNQUFNLDZFQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUNELElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRTdELElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNuQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMvRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztvQkFDM0QsTUFBTSxHQUFHLEdBQUcsZ0ZBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDM0UsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztnQkFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUM1QixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3pFLElBQUksQ0FBQyxLQUFLO3dCQUFFLFNBQVM7b0JBRXJCLE1BQU0sNkVBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRTlCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsWUFBWSxLQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUMvQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO29CQUMzRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMxRSxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFBRSxPQUFPO1lBRTdCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNCLG9FQUFvRTtnQkFDcEUsc0RBQXNEO2dCQUN0RCx3RUFBd0U7Z0JBQ3hFLHVFQUF1RTtnQkFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZO29CQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pELElBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQztvQkFDM0QsQ0FBQyxXQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsMENBQUUsTUFBTSxLQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDM0MsQ0FBQztvQkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDO3dCQUNaLGFBQWEsRUFBRSxFQUFFO3dCQUNqQixhQUFhLEVBQUUsSUFBSTt3QkFDbkIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNOzRCQUNuQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQzs0QkFDeEMsQ0FBQyxDQUFDLElBQUk7cUJBQ1QsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFDM0Isa0ZBQWtCLENBQUMsNEJBQTRCLEVBQUU7Z0JBQy9DLFVBQVUsRUFBRSxjQUFjLENBQUMsTUFBTTtnQkFDakMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQzVELENBQUMsQ0FBQztZQUVILE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDO2lCQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGdGQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQ2pFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNiLE1BQU0sUUFBUSxHQUFHLGNBQWM7aUJBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsZ0ZBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDakUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsT0FBTztZQUNULENBQUM7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUNYO2dCQUNFLGFBQWEsRUFBRSxjQUFjO2dCQUM3QixjQUFjO2dCQUNkLEtBQUssRUFBRSxJQUFJO2dCQUNYLFNBQVMsa0NBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQ3ZCLFNBQVMsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNwQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7d0JBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO3dCQUNkLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRzt3QkFDVixhQUFhLEVBQUUsQ0FBQyxDQUFDLGFBQWE7cUJBQy9CLENBQUMsQ0FBQyxHQUNKO2FBQ0YsRUFDRCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO29CQUFFLE9BQU87Z0JBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLEVBQUM7UUFFTSxtQkFBYyxHQUFHLENBQ3ZCLEtBQVUsRUFDVixHQUFrQyxFQUNOLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDeEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxHQUFHLEtBQUksRUFBRSxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ2YsTUFBTSxLQUFLLEdBQUcseUZBQTRCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLEtBQUs7b0JBQUUsT0FBTyxLQUE0QixDQUFDO1lBQ2pELENBQUM7WUFDRCxJQUFJLEdBQUcsSUFBSSxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsRUFBRSxLQUFJLElBQUksRUFBRSxDQUFDO2dCQUM3QixNQUFNLElBQUksR0FBRyx3RkFBMkIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLElBQUk7b0JBQUUsT0FBTyxJQUEyQixDQUFDO1lBQy9DLENBQUM7WUFDRCxNQUFNLFNBQVMsR0FBRyw4RUFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBd0IsQ0FBQztRQUNyRCxDQUFDLENBQUM7UUFFTSxtQkFBYyxHQUFHLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBVyxFQUFFO1lBQ25ELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQzNCLE1BQU0sSUFBSSxHQUFHLGdGQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLGdGQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUMvQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNsRSxPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyx1RkFBMEIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxHQUFHLHVGQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUM7UUFFRixtR0FBbUc7UUFDM0Ysd0NBQW1DLEdBQUcsQ0FDNUMsR0FBZ0IsRUFDaEIsS0FBVSxFQUMyQixFQUFFOztZQUN2QyxJQUFJLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLE1BQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxZQUFZO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUV0QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLEdBQUcsR0FBRyxTQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsSUFBSSwwQ0FBRSxHQUFHLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxHQUFHO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUV0QixNQUFNLFFBQVEsR0FBRyxZQUFDLEdBQVcsRUFBQyw4QkFBOEIsbURBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sT0FBTyxHQUFHLDhFQUFpQixDQUFDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxLQUFLLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxPQUFPO29CQUFFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXRELE1BQU0sT0FBTyxHQUFVLFVBQUcsQ0FBQyxvQkFBb0IsbURBQUksS0FBSSxFQUFFLENBQUM7Z0JBQzFELE1BQU0sV0FBVyxHQUFHLHNGQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwRCxLQUFLLE1BQU0sRUFBRSxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUN6QixJQUNFLEdBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxpQkFBaUIsTUFBSyxJQUFJO3dCQUM5QixHQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsWUFBWSxNQUFLLElBQUksRUFDekIsQ0FBQzt3QkFDRCxNQUFNLFFBQVEsR0FBRyw4RUFBaUIsQ0FBQyxFQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzlDLElBQUksUUFBUTs0QkFBRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUMxRCxDQUFDO2dCQUNILENBQUM7Z0JBRUQsSUFBSSxXQUFXLEVBQUUsQ0FBQztvQkFDaEIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxXQUFDLGFBQU0sQ0FBQyxTQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsS0FBSywwQ0FBRSxFQUFFLEtBQUksRUFBRSxDQUFDLEtBQUssV0FBVyxJQUNwRCxDQUFDO29CQUNGLE1BQU0sUUFBUSxHQUFHLDhFQUFpQixDQUFDLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxLQUFLLENBQUMsQ0FBQztvQkFDakQsSUFBSSxRQUFRO3dCQUFFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzFELENBQUM7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsd0RBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sRUFBRSxHQUFRLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFDLElBQUksRUFBRSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxDQUFDO3dCQUNILElBQUksT0FBTyxFQUFFLENBQUMsV0FBVyxLQUFLLFVBQVU7NEJBQUUsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25FLENBQUM7b0JBQUMsV0FBTSxDQUFDO3dCQUNQLHFCQUFxQjtvQkFDdkIsQ0FBQztvQkFFRCxNQUFNLE9BQU8sR0FDWCxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUMxRCxFQUFFLENBQUMsS0FBSzt3QkFDUixDQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JFLE1BQU0sU0FBUyxHQUFHLDhFQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3QyxJQUFJLFNBQVMsRUFBRSxDQUFDO3dCQUNkLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUNqRCxJQUFJLElBQUk7NEJBQUUsT0FBTyxJQUFJLENBQUM7b0JBQ3hCLENBQUM7b0JBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxHQUFHLE1BQUksU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLEdBQUcsTUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsR0FBRyxLQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0RSxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUNWLE1BQU0sS0FBSyxHQUFHLHlGQUE0QixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDdkQsSUFBSSxLQUFLOzRCQUFFLE9BQU8sS0FBNEIsQ0FBQztvQkFDakQsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztZQUFDLFdBQU0sQ0FBQztnQkFDUCxZQUFZO1lBQ2QsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxFQUFDO1FBQ00sNkJBQXdCLEdBQUcsQ0FDakMsR0FBNkIsRUFDN0IsSUFBdUMsRUFDdkMsRUFBRTtZQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUF3QixDQUFDO1lBQ2hELE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDdEMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FDL0QsSUFBSSxFQUNKLE1BQU0sRUFDTixHQUFHLENBQ0osQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFM0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDaEIsT0FBTyxHQUFHLE1BQU0sRUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQzVDLENBQUM7WUFFRixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFDO2dCQUMzQixDQUFDLEdBQUcsU0FBUyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDbEMsQ0FBQztZQUNELENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFakMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUM7UUFTTSwyQkFBc0IsR0FBRyxHQUFZLEVBQUU7O1lBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUNuQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNoRCxNQUFNLEdBQUcsR0FDUCxXQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSTtnQkFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztnQkFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsSUFBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLElBQUk7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFN0IsSUFBSSxDQUFDLFdBQUksQ0FBQyxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLEdBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFDRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzdCLENBQUMsQ0FBQztRQUVNLHVCQUFrQixHQUFHLEdBQVMsRUFBRTtZQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUFFLE9BQU87WUFDeEMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNuRSxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUY7Ozs7O1dBS0c7UUFDSyw4QkFBeUIsR0FBRyxDQUFDLEtBQVksRUFBUSxFQUFFO1lBQ3pELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFBRSxPQUFPO1lBQzdCLE1BQU0sTUFBTSxHQUFTLEtBQXFCLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUN4RCxNQUFNLENBQUMsR0FBUSxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUNwQyxNQUFNLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDNUYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUM7WUFFaEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sS0FBSyxNQUFNLENBQUM7WUFDMUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUM7WUFDL0MsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO2lCQUM1QyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztpQkFDcEIsSUFBSSxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBSSxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUM3QyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsY0FBYyxDQUFDO2dCQUMvQyw2RUFBNkU7Z0JBQzdFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUMxQixLQUFLLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLEVBQUU7d0JBQzdDLElBQUksRUFBRSxLQUFLO3dCQUNYLGVBQWUsRUFBRSxLQUFLO3FCQUN2QixDQUFDLENBQUM7Z0JBQ0wsQ0FBQztZQUNILENBQUM7aUJBQU0sSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztZQUN2QyxDQUFDO1lBRUQsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDZixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDakUsT0FBTztZQUNULENBQUM7WUFDRCxzRUFBc0U7WUFDdEUsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRix3RkFBd0Y7UUFDaEYsaUNBQTRCLEdBQUcsQ0FBQyxLQUFZLEVBQVEsRUFBRTtZQUM1RCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7Z0JBQUUsT0FBTztZQUM3QixNQUFNLENBQUMsR0FBUyxLQUFxQixDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7WUFDbkQsa0VBQWtFO1lBQ2xFLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxXQUFXO2dCQUFFLE9BQU87WUFDckMsSUFDRSxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVM7Z0JBQ25CLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUztnQkFDdkIsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQ3JCLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUMsV0FBVyxLQUFLLEtBQUssRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDaEUsT0FBTztZQUNULENBQUM7WUFDRCxJQUNFLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQztnQkFDOUQsQ0FBQyxDQUFDLFdBQVcsS0FBSyxJQUFJO2dCQUN0QixDQUFDLENBQUMsUUFBUSxFQUNWLENBQUM7Z0JBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7cUJBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO3FCQUNwQixJQUFJLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO2dCQUN0Qyw0REFBNEQ7Z0JBQzVELEtBQUssSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRTtvQkFDcEMsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsZUFBZSxFQUFFLEtBQUs7aUJBQ3ZCLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRjs7O1dBR0c7UUFDSyx5QkFBb0IsR0FBRyxDQUM3QixRQUFnQixFQUNoQixJQUFvRCxFQUNyQyxFQUFFOztZQUNqQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztpQkFDakMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7aUJBQ3BCLElBQUksRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU87WUFFdkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUM7aUJBQ3ZELE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2lCQUNwQixJQUFJLEVBQUUsQ0FBQztZQUNWLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksTUFBTSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN6RSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDckIsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxPQUFPO1lBQ1QsQ0FBQztZQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUc7Z0JBQUUsT0FBTztZQUUxQixNQUFNLGVBQWUsR0FBRyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUNoRCxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FDbkIsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLGVBQWUsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFFaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixPQUFPLEVBQUUsSUFBSTtnQkFDYixLQUFLLEVBQUUsSUFBSTtnQkFDWCxrQkFBa0IsRUFBRSxJQUFJO2dCQUN4QixXQUFXLEVBQUUsRUFBRTtnQkFDZixtQkFBbUIsRUFBRSxJQUFJO2FBQzFCLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3hELElBQUksT0FBTyxFQUFFO29CQUFFLE9BQU87Z0JBRXRCLElBQUksT0FBTyxHQUEwQixJQUFJLENBQUM7Z0JBQzFDLElBQUksWUFBWSxHQUErQixJQUFJLENBQUM7Z0JBRXBELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO3dCQUFFLFNBQVM7b0JBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzt3QkFBRSxTQUFTO29CQUMzRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekQsSUFBSSxPQUFPLEVBQUU7d0JBQUUsT0FBTztvQkFDdEIsTUFBTSxXQUFXLEdBQUcsUUFBUSxJQUFJLEtBQUssQ0FBQztvQkFDdEMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUN2QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDO3dCQUN6QixNQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3BDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDcEIsQ0FBQyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7d0JBQ3hCLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO3dCQUNWLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM5QyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsa0ZBQXFCLEtBQUssT0FBTyxHQUFHLENBQUM7d0JBQ2xELElBQUksQ0FBQzs0QkFDSCxNQUFNLEdBQUcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQy9DLElBQUksU0FBRyxDQUFDLFFBQVEsMENBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQ0FDdEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzFCLFlBQVksR0FBRyxLQUFLLENBQUM7Z0NBQ3JCLE1BQU07NEJBQ1IsQ0FBQzt3QkFDSCxDQUFDO3dCQUFDLFdBQU0sQ0FBQzs0QkFDUCw4QkFBOEI7d0JBQ2hDLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxJQUFJLE9BQU87d0JBQUUsTUFBTTtnQkFDckIsQ0FBQztnQkFFRCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBQzNDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO3dCQUNmLElBQUksQ0FBQyxRQUFRLENBQUM7NEJBQ1osT0FBTyxFQUFFLEtBQUs7NEJBQ2Qsa0JBQWtCLEVBQUUsS0FBSzs0QkFDekIsV0FBVyxFQUFFLEVBQUU7eUJBQ2hCLENBQUMsQ0FBQztvQkFDTCxDQUFDO29CQUNELE9BQU87Z0JBQ1QsQ0FBQztnQkFFRCxNQUFNLFNBQVMsR0FDYixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQzFDLFlBQVksQ0FBd0IsQ0FBQztnQkFDekMsTUFBTSxRQUFRLEdBQ1osZ0ZBQW1CLENBQUMsU0FBUyxDQUFDO29CQUM5QixNQUFNLENBQUMsVUFBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLEdBQUcsTUFBSSxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsRUFBRSxLQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLElBQUksR0FBRyxXQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsMENBQUcsUUFBUSxDQUFDLEtBQUksSUFBSSxDQUFDO2dCQUMzRCxNQUFNLFFBQVEsR0FDWixTQUFTLENBQUMsYUFBYTtxQkFDdkIscUJBQVMsQ0FBQyxNQUFNLDBDQUFFLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsMENBQUUsSUFBSTtvQkFDMUQsSUFBSSxDQUFDO2dCQUNQLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDZCxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzt3QkFDZixJQUFJLENBQUMsUUFBUSxDQUFDOzRCQUNaLE9BQU8sRUFBRSxLQUFLOzRCQUNkLGtCQUFrQixFQUFFLEtBQUs7NEJBQ3pCLFNBQVMsRUFBRSxLQUFLO3lCQUNqQixDQUFDLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxPQUFPO2dCQUNULENBQUM7Z0JBRUQsTUFBTSxHQUFHLEdBQUcsYUFBTyxDQUFDLFVBQVUsMENBQUcsUUFBUSxDQUFDLENBQUM7Z0JBQzNDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzt3QkFDZixJQUFJLENBQUMsUUFBUSxDQUFDOzRCQUNaLE9BQU8sRUFBRSxLQUFLOzRCQUNkLGtCQUFrQixFQUFFLEtBQUs7NEJBQ3pCLFNBQVMsRUFBRSxLQUFLO3lCQUNqQixDQUFDLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxPQUFPO2dCQUNULENBQUM7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLENBQUMsR0FDTCxDQUFDLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUN0QyxTQUFTLEVBQ1QsUUFBUSxFQUNSLEdBQUcsRUFDSCxTQUFTLENBQ1YsQ0FBQyxJQUFJLE9BQU8sQ0FBQztnQkFDaEIsSUFBSSxPQUFPLEVBQUU7b0JBQUUsT0FBTztnQkFFdEIsSUFBSSxDQUFDLENBQUMsUUFBUTtvQkFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVsRCxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xFLElBQUksT0FBTyxFQUFFO29CQUFFLE9BQU87Z0JBRXRCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2dCQUN6QyxNQUFNLGFBQWEsR0FBRyxTQUFTO29CQUM3QixDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFbkUsTUFBTSxnQkFBZ0IsR0FBRyxXQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sMENBQUUsWUFBWSxLQUFJLEVBQUUsQ0FBQztnQkFDL0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUMzQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUN6QyxDQUFDO2dCQUNGLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FDNUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNQLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO29CQUNqQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSTtvQkFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FDNUIsQ0FBQztnQkFFRixJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNaLE9BQU8sRUFBRSxLQUFLO29CQUNkLGVBQWUsRUFBRSxJQUFJO29CQUNyQixtQkFBbUIsRUFBRSxRQUFRO29CQUM3QixhQUFhLEVBQUUsWUFBWTtvQkFDM0IsV0FBVyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUM7b0JBQ3hCLGFBQWEsRUFBRSxRQUFRO29CQUN2QixTQUFTLEVBQUUsSUFBSTtvQkFDZixjQUFjLEVBQUUsS0FBSztvQkFDckIsYUFBYSxFQUFFLFNBQVM7b0JBQ3hCLGVBQWUsRUFBRSxJQUFJO29CQUNyQixhQUFhO29CQUNiLEtBQUssRUFDSCxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUM7d0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDhCQUE4QixFQUFFOzRCQUN0QyxNQUFNLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7eUJBQ2pDLENBQUM7d0JBQ0osQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDOzRCQUMxRCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQ0FBaUMsQ0FBQzs0QkFDNUMsQ0FBQyxDQUFDLElBQUk7aUJBQ2IsQ0FBQyxDQUFDO2dCQUVILElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLGVBQWUsRUFBRSxDQUFDO29CQUMxQixJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDNUQsQ0FBQztnQkFDRCxLQUFLLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFOUMsSUFBSSxLQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxNQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztvQkFDckQsSUFBSSxDQUFDO3dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEtBQUksVUFBSSxDQUFDLE1BQU0sMENBQUUsS0FBSyxHQUFFLENBQUM7NEJBQ3ZELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNwRCxDQUFDO3dCQUNELE1BQU0sTUFBTSxHQUNWLGFBQUMsQ0FBQyxDQUFDLFFBQWdCLENBQUMsTUFBTSwwQ0FBRSxNQUFNLG1EQUFHLElBQUksQ0FBQyxLQUFJLENBQUMsQ0FBQyxRQUFRLENBQUM7d0JBQzNELEtBQUssSUFBSSxDQUFDLElBQUksQ0FDWixFQUFFLE1BQU0sRUFBRSxFQUNWLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsYUFBb0IsRUFBRSxDQUNoRCxDQUFDO29CQUNKLENBQUM7b0JBQUMsV0FBTSxDQUFDO3dCQUNQLFlBQVk7b0JBQ2QsQ0FBQztnQkFDSCxDQUFDO2dCQUVELElBQUksaUJBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSwwQ0FBRSxRQUFRLDBDQUFFLGVBQWUsTUFBSyxLQUFLLEVBQUUsQ0FBQztvQkFDM0QsSUFBSSxDQUFDO3dCQUNILE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBRSxTQUFpQixDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDL0QsTUFBTSxlQUFlLEdBQ25CLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7d0JBQ3JFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQXNCLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBQUMsV0FBTSxDQUFDO3dCQUNQLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDOzRCQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ2hFLENBQUM7b0JBQ0gsQ0FBQztnQkFDSCxDQUFDO3FCQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRSxDQUFDO2dCQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO29CQUNmLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO2dCQUN6QyxDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO29CQUNmLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQ1osT0FBTyxFQUFFLEtBQUs7d0JBQ2Qsa0JBQWtCLEVBQUUsS0FBSzt3QkFDekIsS0FBSyxFQUFFLEVBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxPQUFPLEtBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztxQkFDL0IsQ0FBQyxDQUFDO2dCQUNMLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxFQUFDO1FBRU0seUJBQW9CLEdBQUcsQ0FBTyxLQUFZLEVBQWlCLEVBQUU7WUFDbkUsNEVBQTRFO1lBQzVFLDJFQUEyRTtZQUMzRSx5RUFBeUU7WUFDekUsOEVBQThFO1lBQzlFLGtGQUFrQixDQUNoQix1RUFBdUUsQ0FDeEUsQ0FBQztZQUNGLE9BQU87UUFDVCxDQUFDLEVBQUM7UUFPRiwwRUFBMEU7UUFFbEUseUJBQW9CLEdBQUcsQ0FDN0IsSUFBdUMsRUFDdkMsV0FBcUMsRUFDckMsUUFBMkUsRUFDdEQsRUFBRTtZQUN2QixJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDO29CQUNILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3pDLElBQUksUUFBUTt3QkFBRSxPQUFPLFFBQXdCLENBQUM7Z0JBQ2hELENBQUM7Z0JBQUMsV0FBTSxDQUFDO29CQUNQLFlBQVk7Z0JBQ2QsQ0FBQztZQUNILENBQUM7WUFDRCxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUM1RCxJQUFJLENBQUM7Z0JBQ0gsT0FBTyxJQUFJLDJEQUFLLENBQUM7b0JBQ2YsQ0FBQztvQkFDRCxDQUFDO29CQUNELGdCQUFnQixFQUNkLFNBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxnQkFBZ0IsS0FBSyxJQUFZLENBQUMsZ0JBQWdCO2lCQUMvRCxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVNLG1CQUFjLEdBQUcsQ0FDdkIsR0FBNEMsRUFDNUMsTUFBNkIsRUFDTixFQUFFOztZQUN6QixNQUFNLFNBQVMsR0FBRyxTQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsT0FBTywwQ0FBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDekMsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDaEMsTUFBTSxHQUFHLEdBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxHQUFHO3dCQUFFLE9BQU8sS0FBSyxDQUFDO29CQUN2QixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sU0FBUyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN4RSxDQUFDLENBQUM7UUFFTSxxQkFBZ0IsR0FBRyxDQUN6QixHQUE0QyxFQUM1QyxlQUFzQyxFQUNmLEVBQUU7O1lBQ3pCLE1BQU0sVUFBVSxHQUFHLFVBQUksQ0FBQyxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLENBQUM7WUFDaEQsTUFBTSxHQUFHLEdBQUcsVUFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLEdBQUcsQ0FBQztZQUM1QixNQUFNLFVBQVUsR0FBcUIsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFdkQsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsT0FBTyxLQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7b0JBQUUsU0FBUztnQkFDMUMsTUFBTSxPQUFPLEdBQ1gsU0FBUyxJQUFJLENBQUMsSUFBSyxDQUFTLENBQUMsT0FBTztvQkFDbEMsQ0FBQyxDQUFHLENBQVMsQ0FBQyxPQUEwQjtvQkFDeEMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDWCxJQUFJLENBQUMsT0FBTztvQkFBRSxTQUFTO2dCQUV2QixNQUFNLFFBQVEsR0FBUSxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUNwQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7b0JBQUUsU0FBUztnQkFFOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FDL0IsOEVBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxFQUN2QyxHQUFHLENBQ0osQ0FBQztnQkFDRixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQztvQkFBRSxTQUFTO2dCQUM5RCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7b0JBQUUsU0FBUztnQkFDaEYsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO29CQUFFLFNBQVM7Z0JBQy9ELElBQ0UsbUJBQW1CO29CQUNuQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQzNELENBQUM7b0JBQ0QsU0FBUztnQkFDWCxDQUFDO2dCQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFPLENBQUMsUUFBUSwwQ0FBRSxJQUFJLEtBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BFLE1BQU0sYUFBYSxHQUNqQixDQUFDLFFBQVEsSUFBSSxRQUFRLEtBQUssU0FBUyxJQUFJLFFBQVEsS0FBSyxjQUFjLENBQUM7Z0JBQ3JFLE1BQU0sYUFBYSxHQUNqQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUVyRSxJQUFJLFFBQVEsSUFBSSxDQUFDLGFBQWE7b0JBQUUsU0FBUztnQkFDekMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRO29CQUFFLFNBQVM7Z0JBRWxELFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUVwQyxJQUFJLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3hCLEtBQUssTUFBTSxPQUFPLElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQy9CLDhFQUFpQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUNqRCxHQUFHLENBQ0osQ0FBQztvQkFDRixJQUNFLEtBQUs7d0JBQ0wsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ3pELEtBQWEsQ0FBQyxPQUFPLEtBQUssS0FBSyxFQUNoQyxDQUFDO3dCQUNELE9BQU8sT0FBTyxDQUFDO29CQUNqQixDQUFDO2dCQUNILENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsS0FBSyxNQUFNLE9BQU8sSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxLQUFLLEdBQVEsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDakMsSUFBSSxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTyxNQUFLLEtBQUs7b0JBQUUsT0FBTyxPQUFPLENBQUM7WUFDL0MsQ0FBQztZQUVELE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQztRQW1JTSwwQkFBcUIsR0FBRyxDQUM5QixFQUF5QixFQUN6QixJQUF1QyxFQUN2QyxNQUE2QixFQUlyQixFQUFFOztZQUNWLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FDN0MsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixFQUFFLENBQUMsUUFBUSxDQUNaLENBQUM7WUFFRixNQUFNLFdBQVcsR0FDZixNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDLE1BQU07Z0JBQ1IsQ0FBQyxDQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQTJCLENBQUM7WUFFakUsc0VBQXNFO1lBQ3RFLHdFQUF3RTtZQUN4RSx1RUFBdUU7WUFDdkUsbUVBQW1FO1lBQ25FLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDO2dCQUM1RCxHQUFHLE1BQU07Z0JBQ1QsR0FBRyxXQUFXO2FBQ2YsQ0FBQyxDQUFDO1lBRUgsNkVBQTZFO1lBQzdFLDRFQUE0RTtZQUM1RSxtRkFBbUY7WUFDbkYsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzdELHdFQUF3RTtZQUN4RSw2RUFBNkU7WUFDN0Usd0RBQXdEO1lBQ3hELDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksYUFBYSxHQUErQixJQUFJLENBQUM7WUFFckQsSUFBSSxDQUFDLENBQUMsSUFBSSxhQUFhLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM5QyxLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsRUFBRSxDQUFDO29CQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7d0JBQUUsU0FBUztvQkFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7d0JBQUUsU0FBUztvQkFDcEQsSUFBSSxDQUFDO3dCQUNILCtEQUErRDt3QkFDL0Qsa0VBQWtFO3dCQUNsRSwrREFBK0Q7d0JBQy9ELCtEQUErRDt3QkFDL0QsK0NBQStDO3dCQUMvQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQ3JCLEtBQWEsQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQzFDLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ1QsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3pELE1BQU0sV0FBVyxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUM7d0JBQ3RDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7d0JBQzNCLENBQUMsQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUM7d0JBQ3JDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDcEIsQ0FBQyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7d0JBQ3hCLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO3dCQUNWLElBQUksU0FBUyxJQUFJLFNBQVMsS0FBSyxLQUFLOzRCQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO3dCQUMxRCxNQUFNLEdBQUcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQy9DLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDZCwrREFBK0Q7NEJBQy9ELElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUMvRCxDQUFDO3dCQUNELElBQUksU0FBRyxDQUFDLFFBQVEsMENBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs0QkFDdEIsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BCLGdFQUFnRTs0QkFDaEUsZ0VBQWdFOzRCQUNoRSxhQUFhLEdBQUcsS0FBSyxDQUFDOzRCQUN0QixNQUFNO3dCQUNSLENBQUM7b0JBQ0gsQ0FBQztvQkFBQyxXQUFNLENBQUM7d0JBQ1Asb0JBQW9CO29CQUN0QixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBSSxDQUFDLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDcEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUM7UUFDdkMsQ0FBQyxFQUFDO1FBZUY7Ozs7OztXQU1HO1FBQ0ssZ0NBQTJCLEdBQUcsQ0FDcEMsUUFBZ0IsRUFDaEIsV0FBb0IsRUFDcEIsU0FBa0IsRUFDWixFQUFFO1lBQ1IsSUFBSSxDQUFDO2dCQUNILFFBQVEsQ0FBQyxhQUFhLENBQ3BCLElBQUksV0FBVyxDQUFDLHdCQUF3QixFQUFFO29CQUN4QyxNQUFNLEVBQUU7d0JBQ04sTUFBTSxFQUFFLFdBQVc7d0JBQ25CLFdBQVc7d0JBQ1gsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNyQyw0REFBNEQ7d0JBQzVELDhEQUE4RDt3QkFDOUQsZ0VBQWdFO3dCQUNoRSxnRUFBZ0U7d0JBQ2hFLHdFQUF3RTt3QkFDeEUsU0FBUyxFQUFFLFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxHQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQ2xDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO3FCQUN0QjtvQkFDRCxPQUFPLEVBQUUsSUFBSTtpQkFDZCxDQUFDLENBQ0gsQ0FBQztZQUNKLENBQUM7WUFBQyxXQUFNLENBQUM7Z0JBQ1AsWUFBWTtZQUNkLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFTSw2QkFBd0IsR0FBRyxDQUFDLElBQWEsRUFBUSxFQUFFO1lBQ3pELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN4QyxJQUFJLENBQUM7Z0JBQ0gsUUFBUSxDQUFDLGFBQWEsQ0FDcEIsSUFBSSxXQUFXLENBQUMsd0JBQXdCLEVBQUU7b0JBQ3hDLE1BQU0sRUFBRTt3QkFDTixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7d0JBQ1osTUFBTTt3QkFDTixNQUFNLEVBQUUsV0FBVzt3QkFDbkIsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7cUJBQ3RCO29CQUNELE9BQU8sRUFBRSxJQUFJO2lCQUNkLENBQUMsQ0FDSCxDQUFDO1lBQ0osQ0FBQztZQUFDLFdBQU0sQ0FBQztnQkFDUCxZQUFZO1lBQ2QsQ0FBQztZQUNELElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsZ0VBQWdFO2dCQUNoRSxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7b0JBQ3pCLElBQUksQ0FBQzt3QkFDSCxRQUFRLENBQUMsYUFBYSxDQUNwQixJQUFJLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRTs0QkFDeEMsTUFBTSxFQUFFO2dDQUNOLElBQUksRUFBRSxJQUFJO2dDQUNWLE1BQU07Z0NBQ04sTUFBTSxFQUFFLElBQUk7Z0NBQ1osTUFBTSxFQUFFLFdBQVc7Z0NBQ25CLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFOzZCQUN0Qjs0QkFDRCxPQUFPLEVBQUUsSUFBSTt5QkFDZCxDQUFDLENBQ0gsQ0FBQztvQkFDSixDQUFDO29CQUFDLFdBQU0sQ0FBQzt3QkFDUCxZQUFZO29CQUNkLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBV0Y7Ozs7Ozs7OztXQVNHO1FBQ0ssaUNBQTRCLEdBQUcsQ0FDckMsUUFBZ0IsRUFDRCxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNSLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osb0JBQW9CLEVBQUUsS0FBSztvQkFDM0IsZUFBZSxFQUFFLElBQUk7b0JBQ3JCLGlCQUFpQixFQUFFLElBQUk7aUJBQ3hCLENBQUMsQ0FBQztnQkFDSCxPQUFPO1lBQ1QsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDO1lBQ2pELGtGQUFrQixDQUFDLG9CQUFvQixFQUFFO2dCQUN2QyxRQUFRLEVBQUUsRUFBRTtnQkFDWixNQUFNLEVBQUUseUNBQXlDO2dCQUNqRCxTQUFTO2FBQ1YsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixvQkFBb0IsRUFBRSxJQUFJO2FBQzNCLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBRyxNQUFNLHNHQUFnQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLHVCQUF1QjtvQkFBRSxPQUFPO2dCQUUzRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDO3dCQUNaLG9CQUFvQixFQUFFLEtBQUs7d0JBQzNCLGVBQWUsRUFBRSxJQUFJO3dCQUNyQixpQkFBaUIsRUFBRSxJQUFJO3FCQUN4QixDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDVCxDQUFDO2dCQUVELGtFQUFrRTtnQkFDbEUsK0NBQStDO2dCQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQXdCLENBQUM7Z0JBQzVELE1BQU0sSUFBSSxHQUFHLDJGQUFxQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztnQkFDMUMsS0FBSyxNQUFNLEtBQUssSUFBSSxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDakQsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLENBQUM7Z0JBQ0Qsa0ZBQWtCLENBQUMscUJBQXFCLEVBQUU7b0JBQ3hDLFFBQVEsRUFBRSxFQUFFO29CQUNaLFNBQVM7b0JBQ1QsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO29CQUNyQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsTUFBTTtpQkFDUCxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDWixvQkFBb0IsRUFBRSxLQUFLO29CQUMzQixlQUFlLEVBQUUsSUFBSTtvQkFDckIsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSTtpQkFDOUQsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLFdBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLHVCQUF1QjtvQkFBRSxPQUFPO2dCQUMzRSxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNaLG9CQUFvQixFQUFFLEtBQUs7b0JBQzNCLGVBQWUsRUFBRSxJQUFJO29CQUNyQixpQkFBaUIsRUFBRSxJQUFJO2lCQUN4QixDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQyxFQUFDO1FBNkNNLGdCQUFXLEdBQUcsQ0FBTyxFQUF5QixFQUFFLEVBQUU7O1lBQ3hELElBQUksQ0FBQztnQkFDSCxRQUFRLENBQUMsYUFBYSxDQUNwQixJQUFJLFdBQVcsQ0FBQywwQkFBMEIsRUFBRTtvQkFDMUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO2lCQUN4RCxDQUFDLENBQ0gsQ0FBQztZQUNKLENBQUM7WUFBQyxXQUFNLENBQUM7Z0JBQ1AsOEJBQThCO1lBQ2hDLENBQUM7WUFDRCx3RUFBd0U7WUFDeEUsNkVBQTZFO1lBQzdFLDJFQUEyRTtZQUMzRSx5RUFBeUU7WUFDekUsc0VBQXNFO1lBQ3RFLGtDQUFrQztZQUNsQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbEMsTUFBTSxlQUFlLEdBQUcsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDaEQsa0ZBQWtCLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ25DLGVBQWU7Z0JBQ2YsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNQLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDUCxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVE7b0JBQ25CLENBQUMsQ0FBQzt3QkFDRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNoQixDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNoQixJQUFJLEVBQUUsU0FBRSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsMENBQUUsSUFBSSxLQUFJLElBQUk7cUJBQ2pEO29CQUNILENBQUMsQ0FBQyxJQUFJO2FBQ1QsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQ25CLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxlQUFlLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDO1lBQ2hFLElBQUksdUJBQXVCLEdBQUcsS0FBSyxDQUFDO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNsQixpRkFBaUIsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUNuRCxPQUFPO1lBQ1QsQ0FBQztZQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4RCxJQUFJLE9BQU8sRUFBRTtnQkFBRSxPQUFPO1lBQ3RCLGtGQUFrQixDQUFDLG1CQUFtQixFQUFFO2dCQUN0QyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDNUIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dCQUN6QixNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDekIsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7aUJBQ1gsQ0FBQyxDQUFDO2FBQ0osQ0FBQyxDQUFDO1lBR0gsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRSxJQUFJLE9BQU8sRUFBRTtnQkFBRSxPQUFPO1lBRXRCLElBQUksQ0FBQztnQkFDSCxRQUFRLENBQUMsYUFBYSxDQUNwQixJQUFJLFdBQVcsQ0FBQywwQkFBMEIsRUFBRTtvQkFDMUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7aUJBQzNELENBQUMsQ0FDSCxDQUFDO1lBQ0osQ0FBQztZQUFDLFdBQU0sQ0FBQztnQkFDUCw4QkFBOEI7WUFDaEMsQ0FBQztZQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDZix1RUFBdUU7Z0JBQ3ZFLDBEQUEwRDtnQkFDMUQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUMvQyxrRkFBa0IsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO29CQUNoRixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDakUsQ0FBQztxQkFBTSxDQUFDO29CQUNOLGtGQUFrQixDQUFDLHFEQUFxRCxDQUFDLENBQUM7Z0JBQzVFLENBQUM7Z0JBQ0QsT0FBTztZQUNULENBQUM7WUFFRCxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsR0FBRyxTQUFTLENBQUM7WUFFaEQsSUFBSSxDQUFDO2dCQUNILElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osT0FBTyxFQUFFLElBQUk7b0JBQ2IsS0FBSyxFQUFFLElBQUk7b0JBQ1gsZ0JBQWdCO29CQUNoQixrQkFBa0IsRUFBRSxJQUFJO29CQUN4QixXQUFXLEVBQUUsRUFBRTtvQkFDZixtQkFBbUIsRUFBRSxJQUFJO2lCQUMxQixDQUFDLENBQUM7Z0JBRUgsa0ZBQWtCLENBQUMsbUJBQW1CLEVBQUU7b0JBQ3RDLE9BQU8sRUFBRSxNQUFDLENBQVMsQ0FBQyxLQUFLLDBDQUFFLEVBQUU7b0JBQzdCLFFBQVEsRUFBRSxRQUFDLENBQUMsUUFBUSwwQ0FBRSxJQUFJLEtBQUksSUFBSTtvQkFDbEMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVO3dCQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3ZDLENBQUMsQ0FBQyxFQUFFO2lCQUNQLENBQUMsQ0FBQztnQkFFSCx5RUFBeUU7Z0JBQ3pFLE1BQU0sWUFBWSxHQUFHLENBQ25CLGFBQWE7b0JBQ1gsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxhQUFhO29CQUMvRCxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FDakIsOEVBQWlCLENBQUUsQ0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFLLENBQVMsQ0FBQyxLQUFLLEVBQ3ZELElBQUksQ0FBQyxHQUFHLENBQ1QsQ0FDaUIsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNsQixpRkFBaUIsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO29CQUNuRCxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUNwRSxPQUFPO2dCQUNULENBQUM7Z0JBQ0QsTUFBTSxRQUFRLEdBQ1osZ0ZBQW1CLENBQUMsWUFBWSxDQUFDO29CQUNqQyxNQUFNLENBQUMsYUFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxDQUFFLEdBQUcsTUFBSSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsRUFBRSxLQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLElBQUksR0FBRyxXQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsMENBQUcsUUFBUSxDQUFDLEtBQUksSUFBSSxDQUFDO2dCQUMzRCxrRkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDbkMsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLO29CQUN6QixFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7b0JBQ25CLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FBRyxJQUFJLElBQUk7b0JBQzdCLFFBQVE7b0JBQ1IsWUFBWSxFQUFFLElBQUk7b0JBQ2xCLG9CQUFvQixFQUFHLFlBQW9CLENBQUMsb0JBQW9CLElBQUksSUFBSTtpQkFDekUsQ0FBQyxDQUFDO2dCQUVILE1BQU0sUUFBUSxHQUNaLFlBQVksQ0FBQyxhQUFhO3FCQUMxQix3QkFBWSxDQUFDLE1BQU0sMENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQywwQ0FBRSxJQUFJO29CQUM3RCxJQUFJLENBQUM7Z0JBRVAsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNkLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO3dCQUNmLElBQUksQ0FBQyxRQUFRLENBQUM7NEJBQ1osT0FBTyxFQUFFLEtBQUs7NEJBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsNEJBQTRCLENBQUM7NEJBQzVDLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixrQkFBa0IsRUFBRSxLQUFLOzRCQUN6QixXQUFXLEVBQUUsRUFBRTt5QkFDaEIsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDeEIsQ0FBQztvQkFDRCxPQUFPO2dCQUNULENBQUM7Z0JBRUQsTUFBTSxHQUFHLEdBQUcsTUFBQyxDQUFTLENBQUMsVUFBVSwwQ0FBRyxRQUFRLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO3dCQUNmLElBQUksQ0FBQyxRQUFRLENBQUM7NEJBQ1osT0FBTyxFQUFFLEtBQUs7NEJBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUM7NEJBQzVELFNBQVMsRUFBRSxLQUFLOzRCQUNoQixrQkFBa0IsRUFBRSxLQUFLOzRCQUN6QixXQUFXLEVBQUUsRUFBRTt5QkFDaEIsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDeEIsQ0FBQztvQkFDRCxPQUFPO2dCQUNULENBQUM7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUVuRSxNQUFNLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FDL0MsWUFBWSxFQUNaLFFBQVEsRUFDUixHQUFHLEVBQ0gsU0FBUyxDQUNWLENBQUM7Z0JBQ0YsSUFBSSxPQUFPLEVBQUU7b0JBQUUsT0FBTztnQkFDdEIsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNQLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQ1osT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsZ0NBQWdDLENBQUM7d0JBQ2hELFNBQVMsRUFBRSxLQUFLO3dCQUNoQixrQkFBa0IsRUFBRSxLQUFLO3dCQUN6QixXQUFXLEVBQUUsRUFBRTtxQkFDaEIsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdEIsT0FBTztnQkFDVCxDQUFDO2dCQUVELElBQUksQ0FBQyxDQUFDLFFBQVE7b0JBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbEQsTUFBTSxhQUFhLEdBQ2pCLFVBQUksQ0FBQyxpQ0FBaUMsQ0FDcEMsQ0FBQyxDQUFDLFVBQWlDLEVBQ25DLGtGQUFxQixDQUN0QixtQ0FBSSxJQUFJLENBQUM7Z0JBQ1osTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUM7cUJBQzlDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO3FCQUNwQixJQUFJLEVBQUUsQ0FBQztnQkFDVixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLEVBQUUsQ0FBQztxQkFDMUQsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7cUJBQ3BCLElBQUksRUFBRSxDQUFDO2dCQUNWOzs7O21CQUlHO2dCQUNILElBQUksU0FBUyxJQUFJLGFBQWEsSUFBSSxTQUFTLEtBQUssYUFBYSxFQUFFLENBQUM7b0JBQzlELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDOUIsa0ZBQWtCLENBQUMsdUNBQXVDLEVBQUU7NEJBQzFELFFBQVEsRUFBRSxhQUFhO3lCQUN4QixDQUFDLENBQUM7d0JBQ0gsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUNuQixPQUFPO29CQUNULENBQUM7b0JBQ0Qsa0ZBQWtCLENBQUMsaUNBQWlDLEVBQUU7d0JBQ3BELFFBQVEsRUFBRSxhQUFhO3FCQUN4QixDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO29CQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDL0QsT0FBTztnQkFDVCxDQUFDO2dCQUVELElBQUksQ0FBQztvQkFDSCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUUsWUFBb0IsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ2hGLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBRSxZQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsS0FBSyxRQUFRLENBQUM7b0JBQ2xGLHFFQUFxRTtvQkFDckUscUVBQXFFO29CQUNyRSxzRUFBc0U7b0JBQ3RFLHdDQUF3QztvQkFDeEMsSUFDRSxDQUFDLFFBQVE7d0JBQ1QsQ0FBQyxpRkFBb0IsQ0FBQyxZQUFZLENBQUM7d0JBQ25DLENBQUMsb0ZBQXVCLENBQUMsWUFBWSxDQUFDLEVBQ3RDLENBQUM7d0JBQ0Qsa0ZBQWtCLENBQUMscUJBQXFCLEVBQUU7NEJBQ3hDLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSzs0QkFDekIsVUFBVSxFQUFFLFVBQVUsSUFBSSxJQUFJOzRCQUM5QixvQkFBb0IsRUFDakIsWUFBb0IsQ0FBQyxvQkFBb0IsSUFBSSxJQUFJO3lCQUNyRCxDQUFDLENBQUM7d0JBQ0gsTUFBTSw2RUFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDdkMsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLGtGQUFrQixDQUFDLGdDQUFnQyxFQUFFOzRCQUNuRCxLQUFLLEVBQUUsWUFBWSxDQUFDLEtBQUs7NEJBQ3pCLFVBQVUsRUFBRSxVQUFVLElBQUksUUFBUTs0QkFDbEMsb0JBQW9CLEVBQ2pCLFlBQW9CLENBQUMsb0JBQW9CLElBQUksSUFBSTt5QkFDckQsQ0FBQyxDQUFDO29CQUNMLENBQUM7Z0JBQ0gsQ0FBQztnQkFBQyxXQUFNLENBQUM7b0JBQ1AseUNBQXlDO2dCQUMzQyxDQUFDO2dCQUNELElBQUksT0FBTyxFQUFFO29CQUFFLE9BQU87Z0JBRXRCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2dCQUN6QyxNQUFNLGFBQWEsR0FBRyxTQUFTO29CQUM3QixDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFeEQsa0VBQWtFO2dCQUNsRSxxRUFBcUU7Z0JBQ3JFLHNDQUFzQztnQkFDdEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLE9BQU8sRUFBRTtvQkFBRSxPQUFPO2dCQUV0QixNQUFNLGdCQUFnQixHQUFHLFdBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSwwQ0FBRSxZQUFZLEtBQUksRUFBRSxDQUFDO2dCQUMvRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQzNDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQ3pDLENBQUM7Z0JBQ0YsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUM1QyxDQUFDLElBQUksRUFBRSxFQUFFLENBQ1AsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7b0JBQ2pDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJO29CQUMxQixZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUM1QixDQUFDO2dCQUVGLGtGQUFrQixDQUFDLFlBQVksRUFBRTtvQkFDL0IsR0FBRztvQkFDSCxRQUFRO29CQUNSLFFBQVE7b0JBQ1IsYUFBYSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDeEMsYUFBYTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsc0VBQXNFO2dCQUN0RSxnRUFBZ0U7Z0JBQ2hFLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osT0FBTyxFQUFFLEtBQUs7b0JBRWQsMkRBQTJEO29CQUMzRCxlQUFlLEVBQUUsSUFBSTtvQkFDckIsbUJBQW1CLEVBQUUsUUFBUTtvQkFFN0IsYUFBYSxFQUFFLFlBQVk7b0JBQzNCLFdBQVcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO29CQUN4QixhQUFhLEVBQUUsUUFBUTtvQkFFdkIsU0FBUyxFQUFFLElBQUk7b0JBQ2YsY0FBYyxFQUFFLEtBQUs7b0JBQ3JCLGFBQWEsRUFBRSxTQUFTO29CQUN4QixlQUFlLEVBQUUsSUFBSTtvQkFDckIsYUFBYTtvQkFDYixLQUFLLEVBQ0gsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDO3dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRTs0QkFDdEMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3lCQUNqQyxDQUFDO3dCQUNKLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQzs0QkFDMUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsaUNBQWlDLENBQUM7NEJBQzVDLENBQUMsQ0FBQyxJQUFJO2lCQUNiLENBQUMsQ0FBQztnQkFDSCx1QkFBdUIsR0FBRyxJQUFJLENBQUM7Z0JBRS9CLE1BQU0sZUFBZSxHQUNuQixVQUFJLENBQUMsaUNBQWlDLENBQ3BDLFlBQVksRUFDWixrRkFBcUIsQ0FDdEIsbUNBQ0QsSUFBSSxDQUFDLGlDQUFpQyxDQUNwQyxDQUFDLENBQUMsVUFBaUMsRUFDbkMsa0ZBQXFCLENBQ3RCLENBQUM7Z0JBQ0osSUFBSSxlQUFlLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztvQkFDckUsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNyRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQzFFLGtGQUFrQixDQUFDLHFCQUFxQixFQUFFO3dCQUN4QyxRQUFRLEVBQUUsYUFBYTt3QkFDdkIsTUFBTSxFQUFFLFdBQVc7d0JBQ25CLFdBQVcsRUFBRSxJQUFJO3dCQUNqQixZQUFZLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLENBQUM7cUJBQ2xELENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsMkJBQTJCLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDdEUsS0FBSyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3hELENBQUM7cUJBQU0sQ0FBQztvQkFDTixJQUFJLENBQUMsUUFBUSxDQUFDO3dCQUNaLG9CQUFvQixFQUFFLEtBQUs7d0JBQzNCLGVBQWUsRUFBRSxJQUFJO3dCQUNyQixpQkFBaUIsRUFBRSxJQUFJO3FCQUN4QixDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLDBDQUFFLFFBQVEsMENBQUUsZUFBZSxNQUFLLEtBQUssQ0FBQztnQkFDdEUsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBQ3ZDLElBQUksQ0FBQzt3QkFDSCw4REFBOEQ7d0JBQzlELDhEQUE4RDt3QkFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSSxVQUFJLENBQUMsTUFBTSwwQ0FBRSxLQUFLLEdBQUUsQ0FBQzs0QkFDdkQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ3BELENBQUM7d0JBQ0QseURBQXlEO3dCQUN6RCxNQUFNLE1BQU0sR0FDVixhQUFDLENBQUMsQ0FBQyxRQUFnQixDQUFDLE1BQU0sMENBQUUsTUFBTSxtREFBRyxJQUFJLENBQUMsS0FBSSxDQUFDLENBQUMsUUFBUSxDQUFDO3dCQUMzRCxrRkFBa0IsQ0FBQyxZQUFZLEVBQUU7NEJBQy9CLFFBQVEsRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7NEJBQ2xFLFlBQVksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUk7NEJBQzdCLFVBQVUsRUFBRSxHQUFHOzRCQUNmLFlBQVksRUFBRSxPQUFDLE1BQWMsYUFBZCxNQUFNLHVCQUFOLE1BQU0sQ0FBVSxNQUFNLHNEQUFJLEtBQUksSUFBSTt5QkFDbEQsQ0FBQyxDQUFDO3dCQUNILEtBQUssSUFBSSxDQUFDLElBQUksQ0FDWixFQUFFLE1BQU0sRUFBRSxFQUNWLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsYUFBb0IsRUFBRSxDQUNoRCxDQUFDLElBQUksQ0FDSixHQUFHLEVBQUUsQ0FBQyxrRkFBa0IsQ0FBQyxlQUFlLEVBQUU7NEJBQ3hDLFFBQVEsRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7NEJBQ2xFLEtBQUssRUFBRyxJQUFZLENBQUMsS0FBSzt5QkFDM0IsQ0FBQyxFQUNGLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxpRkFBaUIsQ0FBQyxhQUFhLEVBQUU7NEJBQy9DLFFBQVEsRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7NEJBQ2xFLEtBQUssRUFBRSxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTyxLQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7eUJBQ3ZDLENBQUMsQ0FDSCxDQUFDO29CQUNKLENBQUM7b0JBQUMsV0FBTSxDQUFDO3dCQUNQLFlBQVk7b0JBQ2QsQ0FBQztnQkFDSCxDQUFDO2dCQUVELDJFQUEyRTtnQkFDM0UsNEVBQTRFO2dCQUM1RSx5RUFBeUU7Z0JBQ3pFLHlFQUF5RTtnQkFDekUsSUFBSSxpQkFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLDBDQUFFLFFBQVEsMENBQUUsZUFBZSxNQUFLLEtBQUssRUFBRSxDQUFDO29CQUMzRCxJQUFJLENBQUM7d0JBQ0gsa0VBQWtFO3dCQUNsRSxpRUFBaUU7d0JBQ2pFLDREQUE0RDt3QkFDNUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFFLFlBQW9CLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNsRSxNQUFNLGVBQWUsR0FDbkIsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFDckQsWUFBWSxDQUFDO3dCQUNmLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQXNCLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBQUMsT0FBTyxTQUFjLEVBQUUsQ0FBQzt3QkFDeEIsaUZBQWlCLENBQUMsc0NBQXNDLEVBQUU7NEJBQ3hELE9BQU8sRUFBRSxVQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsT0FBTyxLQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUM7eUJBQ2pELENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzs0QkFDZixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNoRSxDQUFDO29CQUNILENBQUM7Z0JBQ0gsQ0FBQztxQkFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDaEUsQ0FBQztnQkFDRCxJQUFJLE9BQU8sRUFBRTtvQkFBRSxPQUFPO2dCQUV0QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO2dCQUN6QyxDQUFDO3FCQUFNLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7Z0JBQ3pDLENBQUM7WUFDSCxDQUFDO1lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztnQkFDaEIsZ0VBQWdFO2dCQUNoRSxJQUFJLE9BQU8sRUFBRTtvQkFBRSxPQUFPO2dCQUN0QiwrRUFBK0U7Z0JBQy9FLElBQUksdUJBQXVCLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDWixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTs0QkFDakMsT0FBTyxFQUFFLEVBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxPQUFPLEtBQUksZUFBZTt5QkFDdkMsQ0FBQzt3QkFDRixrQkFBa0IsRUFBRSxLQUFLO3FCQUMxQixDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDVCxDQUFDO2dCQUNELElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUU7d0JBQ2pDLE9BQU8sRUFBRSxFQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsT0FBTyxLQUFJLGVBQWU7cUJBQ3ZDLENBQUM7b0JBQ0YsU0FBUyxFQUFFLEtBQUs7b0JBQ2hCLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLFdBQVcsRUFBRSxFQUFFO2lCQUNoQixDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztZQUN0QyxDQUFDO1FBQ0gsQ0FBQyxFQUFDO1FBMElNLHFCQUFnQixHQUFHLENBQUMsR0FBVyxFQUFpQixFQUFFOztZQUN4RCxxRUFBcUU7WUFDckUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7WUFDeEMsTUFBTSxFQUFFLEdBQ04sSUFBSSxLQUFJLFVBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSwwQ0FBRyxJQUFJLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFWCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsUUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFNBQVMsa0RBQUksQ0FBQztnQkFDakMsTUFBTSxTQUFTLEdBQUcsT0FBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLE1BQU0sS0FBSSxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksZUFBUyxDQUFDLEdBQUcsQ0FBQywwQ0FBRSxJQUFJO29CQUFFLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDckQsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFJLFNBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLElBQUksRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLElBQUksTUFBSyxHQUFHLElBQUksRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLFFBQVEsTUFBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUc7d0JBQ3JELE9BQU8sRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLElBQUksS0FBSSxHQUFHLENBQUM7Z0JBQzFCLENBQUM7WUFDSCxDQUFDO1lBQUMsV0FBTSxDQUFDLEVBQUM7WUFFVixtQ0FBbUM7WUFDbkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzVDLE1BQU0sRUFBRSxHQUFHLGtCQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsTUFBTSwwQ0FBRSxJQUFJLENBQ25DLENBQUMsRUFBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FDakQsQ0FBQztZQUNGLE9BQU8sR0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLElBQUksS0FBSSxJQUFJLENBQUM7UUFDMUIsQ0FBQyxDQUFDO1FBa0tGLHlEQUF5RDtRQUVqRCwyQkFBc0IsR0FBRyxDQUMvQixVQUFvQyxFQUNwQyxJQUF1QyxFQUNiLEVBQUU7WUFDNUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQXdCLENBQUM7WUFDaEQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUV0QixzQkFBc0I7WUFDdEIsOERBQThEO1lBQzlELDhEQUE4RDtZQUM5RCxNQUFNLHNCQUFzQixHQUMxQixVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDakIsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUM7Z0JBQzlCLFVBQVUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFbEMsc0VBQXNFO1lBQ3RFLE1BQU0sY0FBYyxHQUFHLHNCQUFzQjtnQkFDM0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sY0FBYyxHQUFHLHNCQUFzQjtnQkFDM0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRWpCLDhDQUE4QztZQUM5QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzFCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDeEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRTNELCtCQUErQjtZQUMvQixJQUFJLENBQUMsR0FBRyxjQUFjLEdBQUcsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxHQUFHLGNBQWMsR0FBRyxNQUFNLENBQUM7WUFFaEMsa0RBQWtEO1lBQ2xELHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDO2dCQUNuQyxDQUFDLEdBQUcsY0FBYyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDdkMsQ0FBQztZQUVELHFDQUFxQztZQUNyQyxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDO2dCQUNwQyxDQUFDLEdBQUcsY0FBYyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDdkMsQ0FBQztZQUVELDJDQUEyQztZQUMzQyxvRUFBb0U7WUFDcEUsTUFBTSxJQUFJLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUM5QixNQUFNLElBQUksR0FBRyxRQUFRLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxHQUFHLFNBQVMsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBRXpDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXRDLDBEQUEwRDtZQUMxRCxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDO2dCQUNuQyxDQUFDLEdBQUcsUUFBUSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDakMsQ0FBQztZQUNELGlDQUFpQztZQUNqQyxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7Z0JBQ3pCLENBQUMsR0FBRyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQztRQWlFTSxlQUFVLEdBQUcsQ0FBQyxJQUdyQixFQUFFLEVBQUU7WUFDSCx3RUFBd0U7WUFDeEUsNEVBQTRFO1lBQzVFLE1BQU0sYUFBYSxHQUFHLEtBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxhQUFhLE1BQUssSUFBSSxDQUFDO1lBQ25ELE1BQU0sY0FBYyxHQUFHLEtBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxjQUFjLE1BQUssSUFBSSxDQUFDO1lBRXJELHlFQUF5RTtZQUN6RSx3RUFBd0U7WUFDeEUsNERBQTREO1lBQzVELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUNELElBQUksQ0FBQyxhQUFhO29CQUFFLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLElBQUk7b0JBQ1gsYUFBYSxFQUFFLElBQUk7b0JBQ25CLFdBQVcsRUFBRSxJQUFJO29CQUNqQixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsZUFBZSxFQUFFLElBQUk7b0JBQ3JCLG1CQUFtQixFQUFFLElBQUk7b0JBQ3pCLGFBQWEsRUFBRSxJQUFJO29CQUNuQixnQkFBZ0IsRUFBRSxJQUFJO29CQUN0QixjQUFjLEVBQUUsS0FBSztpQkFDdEIsQ0FBQyxDQUFDO2dCQUNILE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlDLENBQUM7WUFDRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNaLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixjQUFjLEVBQUUsS0FBSztnQkFDckIsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSxJQUFJO2dCQUNYLGFBQWEsRUFBRSxJQUFJO2dCQUNuQixXQUFXLEVBQUUsSUFBSTtnQkFDakIsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLGVBQWUsRUFBRSxJQUFJO2dCQUNyQixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixXQUFXLEVBQUUsRUFBRTtnQkFDZixtQkFBbUIsRUFBRSxLQUFLO2dCQUMxQixrQkFBa0IsRUFBRSxLQUFLO2dCQUN6QixhQUFhLEVBQUUsS0FBSztnQkFDcEIsZUFBZSxFQUFFLElBQUk7Z0JBQ3JCLG9CQUFvQixFQUFFLEtBQUs7Z0JBQzNCLGVBQWUsRUFBRSxJQUFJO2dCQUNyQixpQkFBaUIsRUFBRSxJQUFJO2FBQ3hCLENBQUMsQ0FBQztZQUNILElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRiw0RUFBNEU7UUFDcEUsa0JBQWEsR0FBRyxHQUFTLEVBQUU7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzRSxPQUFPO1lBQ1QsQ0FBQztZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUM7UUFFRixxREFBcUQ7UUFDN0MsZ0JBQVcsR0FBRyxHQUFTLEVBQUU7WUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzVFLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQztRQUVGLGlFQUFpRTtRQUVqRSx3QkFBbUIsR0FBRyxDQUFDLEVBQXVCLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsR0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLEVBQUU7Z0JBQUUsT0FBTztZQUNwQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUMvQixFQUFFLEVBQ0Ysa0ZBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FDNUMsQ0FBQztZQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZCLGVBQWUsa0NBQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxLQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRTthQUNsRSxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0IsS0FBSyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM1RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDakMsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVGLHVEQUF1RDtRQUUvQyx3QkFBbUIsR0FBRyxHQUFTLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDO1FBRU0sb0JBQWUsR0FBRyxDQUFDLE9BQXVCLEtBQUssRUFBZSxFQUFFLENBQ3RFLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ2hCLDJEQUFDLHFEQUFTLElBQUMsU0FBUyxFQUFDLGtCQUFrQixFQUFDLFdBQVcsRUFBRSxDQUFDLGlCQUFjLE1BQU0sR0FBRyxDQUM5RSxDQUFDLENBQUMsQ0FBQyxDQUNGLDJEQUFDLHFEQUFTLElBQUMsU0FBUyxFQUFDLGtCQUFrQixFQUFDLFdBQVcsRUFBRSxDQUFDLGlCQUFjLE1BQU0sR0FBRyxDQUM5RSxDQUFDO1FBRUksb0JBQWUsR0FBRyxHQUFTLEVBQUU7WUFDbkMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFTSxrQkFBYSxHQUFHLENBQUMsS0FBYSxFQUFRLEVBQUU7WUFDOUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDLENBQUM7UUEwRU0sd0JBQW1CLEdBQUcsR0FBRyxFQUFFO1lBQ2pDLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsR0FDaEUsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUViLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztZQUN0QyxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzlELE1BQU0saUJBQWlCLEdBQUcsb0JBQW9CLElBQUksU0FBUyxDQUFDO1lBRTVELE9BQU8sQ0FDTCxvRUFBSyxTQUFTLEVBQUMscUNBQXFDO2dCQUNsRCxvRUFBSyxTQUFTLEVBQUMsMENBQTBDO29CQUN2RCxxRUFBTSxTQUFTLEVBQUMsdUNBQXVDO3dCQUNyRCwyREFBQyxxREFBTSxJQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsaUJBQWMsTUFBTSxHQUFHO3dCQUN4RCxJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUNwQjtvQkFDTixlQUFlLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxDQUMzQyxxRUFBTSxTQUFTLEVBQUMsc0NBQXNDO3dCQUNwRCwyREFBQyxxREFBWSxJQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsaUJBQWMsTUFBTSxHQUFHO3dCQUM1RCxlQUFlLENBQ1gsQ0FDUixDQUNHO2dCQUNMLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUNwQixvRUFBSyxTQUFTLEVBQUMsaUNBQWlDO29CQUM5QywyREFBQyxnRUFBZSxJQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEdBQUksQ0FDbEQsQ0FDUCxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQ2Qsb0VBQ0UsU0FBUyxFQUFFLHFCQUNULGlCQUFpQixDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsRUFDdkQsRUFBRTtvQkFFRCxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FDbkIsMkRBQUMsZ0VBQWUsSUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFJLENBQ3ZELENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ1AsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FDbEMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FDcEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ1gsb0VBQ0UsU0FBUyxFQUFFLG9EQUFvRCxDQUFDLEVBQUUsRUFDbEUsR0FBRyxFQUFFLENBQUM7d0JBRU4scUVBQ0UsU0FBUyxFQUFFLDBEQUEwRCxDQUFDLEVBQUU7NEJBRXhFLHFFQUFNLFNBQVMsRUFBQyxpQkFBaUIsaUJBQWEsTUFBTSxHQUFHOzRCQUN0RCxDQUFDLENBQUMsV0FBVyxFQUFFLENBQ1g7d0JBQ1AscUVBQU0sU0FBUyxFQUFDLG1CQUFtQixJQUNoQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQzNCLENBQ0gsQ0FDUCxDQUFDLENBQ0UsQ0FDUCxDQUFDLENBQUMsQ0FBQyxDQUNGLG9FQUFLLFNBQVMsRUFBQyw2Q0FBNkM7b0JBQzFELDJEQUFDLHFEQUFLLElBQUMsU0FBUyxFQUFDLG1CQUFtQixFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsaUJBQWMsTUFBTSxHQUFHO29CQUNyRixJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUNwQixDQUNQLENBQ0csQ0FDUCxDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRU0sZ0JBQVcsR0FBRyxHQUFHLEVBQUU7O1lBQ3pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsWUFBWTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUV2QyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUM3QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQztZQUM1QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztZQUMzQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQztZQUNsRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztZQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN0QyxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFFekQsSUFBSSxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFFcEQsaUNBQWlDO1lBQ2pDLE1BQU0sVUFBVSxHQUF1QyxFQUFFLENBQUM7WUFDMUQsS0FBSyxNQUFNLFNBQVMsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDcEMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ25CLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO3dCQUNwQyxLQUFLLEVBQUUsTUFBTTtxQkFDZCxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUV6QyxNQUFNLFVBQVUsR0FBRyxVQUFVLEtBQUksZ0JBQVUsQ0FBQyxDQUFDLENBQUMsMENBQUUsS0FBSyxLQUFJLFFBQVEsQ0FBQztZQUNsRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUU5QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7WUFDckIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQzVELE1BQU0sTUFBTSxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDdkQsTUFBTSxNQUFNLEdBQUcsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUV4RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7WUFFM0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDdEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ2hFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNoRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3ZELE1BQU0sYUFBYSxHQUFHLE1BQU07Z0JBQzFCLENBQUMsQ0FBQyx5QkFBeUI7Z0JBQzNCLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQztZQUU3QixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDcEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUVsQyxNQUFNLFNBQVMsR0FDYixTQUFTLEtBQUssS0FBSztnQkFDakIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO29CQUNKLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ25CLENBQUMsRUFDRCxDQUFDLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FDaEUsQ0FBQztvQkFDRixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzdCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDO3dCQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7d0JBQ3BELE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQzt3QkFDdEMsdUNBQVksQ0FBQyxLQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFHO29CQUM5RCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsRUFBRTtnQkFDTixDQUFDLENBQUMsRUFBRSxDQUFDO1lBRVQsTUFBTSxVQUFVLEdBQ2QsU0FBUyxLQUFLLE1BQU07Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtvQkFDSixNQUFNLEtBQUssR0FDVCxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQ0FDM0IsQ0FBQyxLQUNKLENBQUMsRUFDRCxDQUFDLEVBQ0MsT0FBTyxDQUFDLElBQUk7NEJBQ1osQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUNsRCxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUNoQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLEVBQUU7Z0JBQ04sQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVULE1BQU0sVUFBVSxHQUNkLFVBQVUsSUFBSSxJQUFJO2dCQUNoQixDQUFDLENBQUMsU0FBUyxLQUFLLEtBQUs7b0JBQ25CLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO29CQUN2QixDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVYLE1BQU0sY0FBYyxHQUFHLFVBQVU7Z0JBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzVELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDTixNQUFNLGFBQWEsR0FBRyxVQUFVO2dCQUM5QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVOLE1BQU0sUUFBUSxHQUFHLENBQ2Ysb0VBQ0UsS0FBSyxFQUFDLE1BQU0sRUFDWixPQUFPLEVBQUUsT0FBTyxRQUFRLElBQUksU0FBUyxFQUFFLEVBQ3ZDLFNBQVMsRUFBQyxpQkFBaUIsRUFDM0IsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRTtnQkFFbEMscUVBQ0UsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQ2YsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQ2QsS0FBSyxFQUFFLE1BQU0sRUFDYixNQUFNLEVBQUUsTUFBTSxFQUNkLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQ25ELEVBQUUsRUFBRSxDQUFDLEdBQ0w7Z0JBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xELE1BQU0sR0FBRyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7b0JBQ3pCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxPQUFPLENBQ0wsa0VBQUcsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUFFO3dCQUNqQixxRUFDRSxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDaEIsRUFBRSxFQUFFLENBQUMsRUFDTCxFQUFFLEVBQUUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQzVCLEVBQUUsRUFBRSxDQUFDLEVBQ0wsTUFBTSxFQUFFLFNBQVMsRUFDakIsV0FBVyxFQUFFLENBQUMsRUFDZCxlQUFlLEVBQUMsS0FBSyxHQUNyQjt3QkFDRixxRUFDRSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQ25CLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUNSLElBQUksRUFBRSxTQUFTLEVBQ2YsUUFBUSxFQUFFLEVBQUUsRUFDWixVQUFVLEVBQUMsS0FBSyxJQUVmLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQ3JCLENBQ0wsQ0FDTCxDQUFDO2dCQUNKLENBQUMsQ0FBQztnQkFFRCxTQUFTLEtBQUssS0FBSztvQkFDbEIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FDckIsa0VBQUcsR0FBRyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRTt3QkFDbkIsVUFBVSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FDdkIscUVBQ0UsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNaLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUNkLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFDbkIsTUFBTSxFQUFFLE1BQU0sRUFDZCxJQUFJLEVBQUUsYUFBYSxFQUNuQixFQUFFLEVBQUUsQ0FBQyxHQUNMLENBQ0g7d0JBQ0QscUVBQ0UsQ0FBQyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNoRSxJQUFJLEVBQUUsVUFBVSxFQUNoQixPQUFPLEVBQUUsVUFBVSxJQUFJLElBQUksSUFBSSxVQUFVLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQzlELFNBQVMsRUFBQyxpQkFBaUIsRUFDM0IsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUM3Qzt3QkFDRixxRUFDRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFDUixDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFDZCxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksRUFDZixNQUFNLEVBQUUsTUFBTSxFQUNkLElBQUksRUFBQyxhQUFhLEVBQ2xCLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FDN0MsQ0FDQSxDQUNMLENBQUM7Z0JBRUgsU0FBUyxLQUFLLE1BQU0sSUFBSSxDQUN2QjtvQkFDRyxVQUFVLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUMvQyxxRUFDRSxFQUFFLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFDNUIsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQ2YsRUFBRSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQzVCLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxHQUFHLE1BQU0sRUFDeEIsTUFBTSxFQUFFLFVBQVUsRUFDbEIsV0FBVyxFQUFFLEdBQUcsRUFDaEIsT0FBTyxFQUFFLElBQUksR0FDYixDQUNIO29CQUNELHFFQUNFLENBQUMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLEVBQ3ZDLElBQUksRUFBQyxNQUFNLEVBQ1gsTUFBTSxFQUFFLFVBQVUsRUFDbEIsV0FBVyxFQUFFLEdBQUcsRUFDaEIsY0FBYyxFQUFDLE9BQU8sRUFDdEIsYUFBYSxFQUFDLE9BQU8sR0FDckI7b0JBQ0QsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDckIsa0VBQUcsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDakIsdUVBQ0UsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ1AsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxFQUFFLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDL0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQ3BDLE1BQU0sRUFBRSxVQUFVLEVBQ2xCLFdBQVcsRUFBRSxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3pDLFNBQVMsRUFBQyxtQkFBbUIsRUFDN0IsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUMzQzt3QkFDRix1RUFDRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDUCxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLEVBQUUsRUFBRSxFQUNMLElBQUksRUFBQyxhQUFhLEVBQ2xCLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDM0MsQ0FDQSxDQUNMLENBQUMsQ0FDQSxDQUNMLENBQ0csQ0FDUCxDQUFDO1lBRUYsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsb0VBQ0UsU0FBUyxFQUFDLGtCQUFrQixFQUM1QixZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWU7Z0JBRWpDLFVBQVUsSUFBSSxDQUNiLG9FQUNFLFNBQVMsRUFBQyxxQkFBcUIsRUFDL0IsS0FBSyxFQUFFO3dCQUNMLElBQUksRUFBRSxHQUFHLGNBQWMsR0FBRzt3QkFDMUIsR0FBRyxFQUFFLEdBQUcsYUFBYSxHQUFHO3FCQUN6QjtvQkFFRCxvRUFBSyxTQUFTLEVBQUMsMkJBQTJCLElBQUUsVUFBVSxDQUFDLEtBQUssQ0FBTztvQkFDbkUsb0VBQUssU0FBUyxFQUFDLDJCQUEyQixJQUN2QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUMzQyxDQUNGLENBQ1A7Z0JBQ0EsUUFBUSxDQUNMLENBQ1AsQ0FBQztZQUVGLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxDQUNMLHVFQUNFLElBQUksRUFBQyxRQUFRLEVBQ2IsU0FBUyxFQUFDLHFCQUFxQixFQUMvQixPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQjtvQkFFakMscUVBQU0sU0FBUyxFQUFDLDBCQUEwQixJQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQVE7b0JBQ25GLHFFQUFNLFNBQVMsRUFBQywyQkFBMkIsSUFBRSxVQUFVLENBQVE7b0JBQy9ELHFFQUFNLFNBQVMsRUFBQyw2QkFBNkIsaUJBQWEsTUFBTSxhQUV6RCxDQUNBLENBQ1YsQ0FBQztZQUNKLENBQUM7WUFFRCxPQUFPLENBQ0wsb0VBQUssU0FBUyxFQUFDLG1CQUFtQjtnQkFDL0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ1QsdUVBQ0UsSUFBSSxFQUFDLFFBQVEsRUFDYixTQUFTLEVBQUMsMEJBQTBCLEVBQ3BDLE9BQU8sRUFBRSxJQUFJLENBQUMsbUJBQW1CO29CQUVqQyxxRUFBTSxTQUFTLEVBQUMsMEJBQTBCLElBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBUTtvQkFDbkYscUVBQU0sU0FBUyxFQUFDLDJCQUEyQixJQUFFLFVBQVUsQ0FBUTtvQkFDL0QscUVBQ0UsU0FBUyxFQUFDLHFDQUFxQyxpQkFDbkMsTUFBTSxhQUdiLENBQ0EsQ0FDVixDQUFDLENBQUMsQ0FBQyxDQUNGLG9FQUFLLFNBQVMsRUFBQywyREFBMkQ7b0JBQ3hFLHFFQUFNLFNBQVMsRUFBQywwQkFBMEIsSUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFRO29CQUNuRixxRUFBTSxTQUFTLEVBQUMsMkJBQTJCLElBQUUsVUFBVSxDQUFRLENBQzNELENBQ1A7Z0JBQ0Qsb0VBQUssU0FBUyxFQUFDLHVCQUF1QixJQUFFLFNBQVMsQ0FBTyxDQUNwRCxDQUNQLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRixnREFBZ0Q7UUFFeEMsZ0JBQVcsR0FBRyxHQUFHLEVBQUU7O1lBQ3pCLE1BQU0sRUFDSixhQUFhLEVBQ2IsV0FBVyxFQUNYLE9BQU8sRUFDUCxLQUFLLEVBQ0wsU0FBUyxFQUNULGNBQWMsRUFDZCxhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLFdBQVcsRUFDWCxXQUFXLEdBQ1osR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRWYsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFFNUIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxXQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sMENBQUUsWUFBWSxLQUFJLEVBQUUsQ0FBQztpQkFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6QyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRTFDLE1BQU0sSUFBSSxHQUFHLFVBQUksQ0FBQyxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLENBQUM7WUFDMUMsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDO1lBRWhDLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sV0FBVyxHQUFHLElBQUksS0FBSSxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSSxLQUFJLElBQUksQ0FBQztnQkFDakUsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RFLE1BQU0sU0FBUyxHQUF3QixPQUFPO29CQUM1QyxDQUFDLENBQUM7d0JBQ0UsUUFBUSxFQUFFLE9BQU87d0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUNiLENBQUMsRUFDRCxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzs0QkFDakUsT0FBTyxDQUFDLEtBQUs7NEJBQ2IsSUFBSSxDQUFDLDhCQUE4QixDQUN0Qzt3QkFDRCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsOEJBQThCO3dCQUN0RCxJQUFJLEVBQUUsTUFBTTt3QkFDWixNQUFNLEVBQUUsTUFBTTt3QkFDZCxTQUFTLEVBQUUsTUFBTTtxQkFDbEI7b0JBQ0gsQ0FBQyxDQUFDO3dCQUNFLFFBQVEsRUFBRSxPQUFPO3dCQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLDhCQUE4Qjt3QkFDMUMsR0FBRyxFQUFFLElBQUksQ0FBQyw4QkFBOEI7d0JBQ3hDLElBQUksRUFBRSxNQUFNO3dCQUNaLE1BQU0sRUFBRSxNQUFNO3FCQUNmLENBQUM7Z0JBRU4sTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUF1QixFQUFFLEVBQUU7b0JBQzdDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN0QixDQUFDLENBQUM7Z0JBRUYsT0FBTyxDQUNMLG9FQUNFLFNBQVMsRUFBRSx5QkFDVCxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFDOUIsRUFBRSxFQUNGLEtBQUssRUFBRSxTQUFTLEVBQ2hCLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUNuQixXQUFXLEVBQUUsVUFBVSxFQUN2QixhQUFhLEVBQUUsVUFBVSxFQUN6QixPQUFPLEVBQUUsVUFBVTtvQkFFbkIsdUVBQ0UsSUFBSSxFQUFDLFFBQVEsRUFDYixTQUFTLEVBQUMsMkJBQTJCLEVBQ3JDLFdBQVcsRUFBRSxVQUFVLEVBQ3ZCLGFBQWEsRUFBRSxVQUFVLEVBQ3pCLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFOzRCQUNiLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDZCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3JCLENBQUMsRUFDRCxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsZ0JBQ25CLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDO3dCQUVwQyxxRUFBTSxTQUFTLEVBQUMsOEJBQThCLGlCQUFhLE1BQU0sR0FBRzt3QkFDcEUscUVBQU0sU0FBUyxFQUFDLDZCQUE2QixJQUFFLEtBQUssQ0FBUTt3QkFDNUQsMkRBQUMscURBQVMsSUFDUixTQUFTLEVBQUMsNEJBQTRCLEVBQ3RDLElBQUksRUFBRSxFQUFFLEVBQ1IsV0FBVyxFQUFFLEdBQUcsaUJBQ0osTUFBTSxHQUNsQixDQUNLLENBQ0wsQ0FDUCxDQUFDO1lBQ0osQ0FBQztZQUVELE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQ3hFLElBQUksSUFBSSxJQUFJLEVBQ1osV0FBVyxFQUNYLFNBQVMsQ0FDVixDQUFDO1lBRUYsTUFBTSxjQUFjLEdBQXdCO2dCQUMxQyxLQUFLLEVBQUUsR0FBRyxVQUFVLElBQUk7Z0JBQ3hCLFFBQVEsRUFBRSxHQUFHLFVBQVUsSUFBSTtnQkFDM0IsUUFBUSxFQUFFLEdBQUcsVUFBVSxJQUFJO2dCQUMzQixNQUFNLEVBQUUsR0FBRyxXQUFXLElBQUk7Z0JBQzFCLFNBQVMsRUFBRSxHQUFHLFdBQVcsSUFBSTthQUM5QixDQUFDO1lBRUYsTUFBTSxXQUFXLEdBQXdCLFNBQVM7Z0JBQ2hELENBQUMsaUJBQ0csSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQ2pCLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUNoQixTQUFTLEVBQUUsTUFBTSxJQUNkLGNBQWMsRUFFckIsQ0FBQyxtQkFBTSxjQUFjLENBQUUsQ0FBQztZQUUxQixNQUFNLFNBQVMsbUJBQ2IsSUFBSSxFQUFFLFVBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxDQUFDLEtBQUksS0FBSyxFQUMzQixHQUFHLEVBQUUsVUFBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLENBQUMsS0FBSSxLQUFLLEVBQzFCLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFDckQsY0FBYyxDQUNsQixDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUV6RCxNQUFNLGVBQWUsR0FDbkIsaUJBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSwwQ0FBRSxRQUFRLDBDQUFFLGVBQWUsTUFBSyxLQUFLLENBQUM7WUFDekQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsTUFBTSxLQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV0RCxPQUFPLENBQ0wsb0VBQ0UsU0FBUyxFQUFFLHNCQUFzQixXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLEVBQzVFLEtBQUssRUFBRSxVQUFVLEVBQ2pCLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFFbkIsb0VBQUssU0FBUyxFQUFDLG9CQUFvQixFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsc0JBQXNCO29CQUMxRSx1RUFDRSxTQUFTLEVBQUUsa0JBQWtCLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFDM0QsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFDL0IsS0FBSyxFQUNILFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsa0JBRWpELFdBQVcsRUFDekIsSUFBSSxFQUFDLFFBQVEsSUFFWixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQ2IsMkRBQUMscURBQUcsSUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLGlCQUFjLE1BQU0sR0FBRyxDQUN2RCxDQUFDLENBQUMsQ0FBQyxDQUNGLDJEQUFDLHFEQUFNLElBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxpQkFBYyxNQUFNLEdBQUcsQ0FDMUQsQ0FDTTtvQkFFVCxtRUFBSSxTQUFTLEVBQUMsbUJBQW1CLElBQUUsS0FBSyxDQUFNO29CQUU5Qyx1RUFDRSxJQUFJLEVBQUMsUUFBUSxFQUNiLFNBQVMsRUFBQyxtQkFBbUIsRUFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLGdCQUNmLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUM7d0JBRWpDLDJEQUFDLHFEQUFDLElBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxpQkFBYyxNQUFNLEdBQUcsQ0FDN0MsQ0FDTDtnQkFFTixvRUFBSyxTQUFTLEVBQUMscUJBQXFCO29CQUNqQyxLQUFLLElBQUksQ0FDUixvRUFBSyxTQUFTLEVBQUMsdUJBQXVCO3dCQUNwQywyREFBQyxxREFBYSxJQUFDLFNBQVMsRUFBQyxrQkFBa0IsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLGlCQUFjLE1BQU0sR0FBRzt3QkFDN0Ysb0VBQUssU0FBUyxFQUFDLG1CQUFtQixJQUMvQixJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQ3RCO3dCQUNOLG9FQUFLLFNBQVMsRUFBQyxxQkFBcUIsSUFBRSxLQUFLLENBQU8sQ0FDOUMsQ0FDUDtvQkFFQSxPQUFPLElBQUksQ0FDVixvRUFBSyxTQUFTLEVBQUMseUJBQXlCO3dCQUN0QywyREFBQyxnRUFBZSxJQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEdBQUksQ0FDeEQsQ0FDUDtvQkFFQSxDQUFDLE9BQU8sSUFBSSxhQUFhLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FDakQsb0VBQUssU0FBUyxFQUFDLGtCQUFrQjt3QkFDOUIsTUFBTTs2QkFDSixNQUFNLENBQ0wsQ0FBQyxJQUFJLEVBQUUsRUFBRTs0QkFDUCxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7Z0NBQUUsT0FBTyxLQUFLLENBQUM7NEJBQ3RELE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDaEMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSyxFQUFFO2dDQUFFLE9BQU8sS0FBSyxDQUFDOzRCQUM1QyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0NBQUUsT0FBTyxLQUFLLENBQUM7NEJBQ3pELE9BQU8sSUFBSSxDQUFDO3dCQUNkLENBQUMsQ0FDRjs2QkFDQSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQ2Isb0VBQUssU0FBUyxFQUFDLGlCQUFpQixFQUFDLEdBQUcsRUFBRSxJQUFJOzRCQUN4QyxxRUFBTSxTQUFTLEVBQUMsbUJBQW1CLElBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQ3BCOzRCQUNQLHFFQUFNLFNBQVMsRUFBQyxtQkFBbUIsSUFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3ZDLENBQ0gsQ0FDUCxDQUFDO3dCQUVILE1BQU0sQ0FBQyxNQUFNLENBQ1osQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNQLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDOzRCQUNsQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSTs0QkFDM0IsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FDN0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQ2hCLG9FQUFLLFNBQVMsRUFBQyw2Q0FBNkM7NEJBQzFELDJEQUFDLHFEQUFLLElBQUMsU0FBUyxFQUFDLG1CQUFtQixFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsaUJBQWMsTUFBTSxHQUFHOzRCQUNyRixJQUFJLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLENBQy9CLENBQ1AsQ0FDRyxDQUNQO29CQUVBLENBQUMsT0FBTyxJQUFJLGFBQWEsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUNuRCxvRUFBSyxTQUFTLEVBQUMsNkNBQTZDO3dCQUMxRCwyREFBQyxxREFBUyxJQUFDLFNBQVMsRUFBQyxtQkFBbUIsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLGlCQUFjLE1BQU0sR0FBRzt3QkFDekYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUN2QixDQUNQO29CQUdBLENBQUMsT0FBTyxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7b0JBR3ZELENBQUMsT0FBTyxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUUvQyxlQUFlLElBQUksQ0FDbEIsb0VBQUssU0FBUyxFQUFDLG1CQUFtQjt3QkFDaEMsb0VBQUssU0FBUyxFQUFDLDBCQUEwQjs0QkFDdkMsb0VBQUssU0FBUyxFQUFDLHlCQUF5QjtnQ0FDdEMsMkRBQUMscURBQVUsSUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLGlCQUFjLE1BQU0sR0FBRztnQ0FDNUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztnQ0FBRSxHQUFHO2dDQUNqQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQzVDLENBQ0Y7d0JBRUwsa0JBQWtCLElBQUksQ0FDckIsb0VBQ0UsU0FBUyxFQUFDLDBEQUEwRCxFQUNwRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFOzRCQUV2QiwyREFBQyxnRUFBZSxJQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLDJCQUEyQixDQUFDLEdBQUksQ0FDNUQsQ0FDUDt3QkFFQSxDQUFDLGtCQUFrQixJQUFJLENBQUMsY0FBYyxJQUFJLENBQ3pDLG9FQUNFLFNBQVMsRUFBQyw2Q0FBNkMsRUFDdkQsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTs0QkFFdkIsMkRBQUMscURBQVUsSUFBQyxTQUFTLEVBQUMsbUJBQW1CLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxpQkFBYyxNQUFNLEdBQUc7NEJBQzFGLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FDNUIsQ0FDUDt3QkFFQSxDQUFDLGtCQUFrQixJQUFJLGNBQWMsSUFBSSxDQUN4QyxvRUFBSyxTQUFTLEVBQUMsd0JBQXdCOzRCQUNyQyxvRUFBSyxTQUFTLEVBQUMscUNBQXFDLElBQ2pELFdBQVc7aUNBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7aUNBQ2pDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDVixrRUFDRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQ2xCLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxFQUNYLE1BQU0sRUFBQyxRQUFRLEVBQ2YsR0FBRyxFQUFDLHFCQUFxQixFQUN6QixTQUFTLEVBQUMsbUNBQW1DLEVBQzdDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUMsRUFDcEQsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksU0FBUztnQ0FFN0Isb0VBQ0UsR0FBRyxFQUFFLENBQUMsQ0FBQyxnQkFBaUIsRUFDeEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxHQUNsRDtnQ0FDRixvRUFDRSxTQUFTLEVBQUMscUJBQXFCLEVBQy9CLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFFbEIsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDLENBQzFDLENBQ0osQ0FDTCxDQUFDLENBQ0E7NEJBRU4sb0VBQUssU0FBUyxFQUFDLHlCQUF5QixJQUNyQyxXQUFXO2lDQUNULE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7aUNBQ2xDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDVixvRUFDRSxTQUFTLEVBQUMsa0NBQWtDLEVBQzVDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0NBRW5CLG9FQUFLLFNBQVMsRUFBQywyQkFBMkI7b0NBQ3hDLG9FQUNFLFNBQVMsRUFBQyw0QkFBNEIsRUFDdEMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTt3Q0FFbkIsMkRBQUMscURBQVMsSUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLGlCQUFjLE1BQU0sR0FBRzt3Q0FDM0QsQ0FBQyxDQUFDLElBQUk7NENBQ0wsSUFBSSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRTtnREFDakMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFOzZDQUNULENBQUMsQ0FDQTtvQ0FDTixrRUFDRSxTQUFTLEVBQUMsMkJBQTJCLEVBQ3JDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxFQUNYLE1BQU0sRUFBQyxRQUFRLEVBQ2YsR0FBRyxFQUFDLHFCQUFxQixFQUN6QixRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxTQUFTO3dDQUU3QiwyREFBQyxxREFBUSxJQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsaUJBQWMsTUFBTSxHQUFHO3dDQUMxRCxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLENBQzdCLENBQ0E7Z0NBQ04sb0VBQUssU0FBUyxFQUFDLDRCQUE0QjtvQ0FDeEMsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO29DQUFFLEdBQUc7b0NBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUMxQyxDQUNGLENBQ1AsQ0FBQyxDQUNBLENBQ0YsQ0FDUCxDQUNHLENBQ1A7b0JBRUEsQ0FBQyxPQUFPLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxLQUFLLElBQUksQ0FDdkMsb0VBQUssU0FBUyxFQUFDLDZDQUE2Qzt3QkFDMUQsMkRBQUMscURBQWlCLElBQUMsU0FBUyxFQUFDLG1CQUFtQixFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsaUJBQWMsTUFBTSxHQUFHO3dCQUNqRyxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLENBQzNCLENBQ1AsQ0FDRyxDQUNGLENBQ1AsQ0FBQztRQUNKLENBQUMsQ0FBQztRQTEySEEsSUFBSSxDQUFDLGdCQUFnQixHQUFHLDhGQUE4QixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsV0FBVyxFQUFFLDBEQUFjLEVBQUU7WUFDN0IsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUVwQyxXQUFXLEVBQUUsSUFBSTtZQUVqQixhQUFhLEVBQUUsRUFBRTtZQUNqQixjQUFjLEVBQUUsRUFBRTtZQUNsQixlQUFlLEVBQUUsRUFBRTtZQUVuQixlQUFlLEVBQUUsSUFBSTtZQUNyQixtQkFBbUIsRUFBRSxJQUFJO1lBRXpCLFdBQVcsRUFBRSxJQUFJO1lBRWpCLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsV0FBVyxFQUFFLEVBQUU7WUFDZixtQkFBbUIsRUFBRSxLQUFLO1lBRTFCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsS0FBSyxFQUFFLElBQUk7WUFFWCxhQUFhLEVBQUUsSUFBSTtZQUNuQixXQUFXLEVBQUUsSUFBSTtZQUNqQixhQUFhLEVBQUUsSUFBSTtZQUVuQixTQUFTLEVBQUUsS0FBSztZQUNoQixjQUFjLEVBQUUsS0FBSztZQUNyQixhQUFhLEVBQUUsSUFBSTtZQUNuQixnQkFBZ0IsRUFBRSxJQUFJO1lBRXRCLFNBQVMsRUFBRSxFQUFFO1lBQ2IsYUFBYSxFQUFFLEtBQUs7WUFDcEIsZUFBZSxFQUFFLElBQUk7WUFFckIsb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsSUFBSTtZQUNyQixpQkFBaUIsRUFBRSxJQUFJO1NBQ3hCLENBQUM7SUFDSixDQUFDO0lBd0JELGlCQUFpQjtRQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzVDLElBQUksV0FBVyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FDdkIsY0FBYyxFQUNkLElBQUksQ0FBQyxpQkFBa0MsQ0FDeEMsQ0FBQztRQUNGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FDdkIsaUJBQWlCLEVBQ2pCLElBQUksQ0FBQyxvQkFBcUMsQ0FDM0MsQ0FBQztRQUNGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLHdFQUFnQixDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FDdkIsd0JBQXdCLEVBQ3hCLElBQUksQ0FBQyw0QkFBNkMsQ0FDbkQsQ0FBQztRQUNGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDNUQsTUFBTSxDQUFDLGdCQUFnQixDQUNyQix1RkFBMEIsRUFDMUIsSUFBSSxDQUFDLGtCQUFtQyxDQUN6QyxDQUFDO1FBQ0YsTUFBTSxDQUFDLGdCQUFnQixDQUNyQixrRkFBcUIsRUFDckIsSUFBSSxDQUFDLG9CQUFxQyxDQUMzQyxDQUFDO1FBQ0YsTUFBTSxDQUFDLGdCQUFnQixDQUNyQix1RkFBMEIsRUFDMUIsSUFBSSxDQUFDLGtCQUFtQyxDQUN6QyxDQUFDO1FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUM7WUFDaEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUNELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQzdDLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ2pFLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUNyQyxDQUFDO1FBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ1Qsa0ZBQWtCLENBQUMscUJBQXFCLEVBQUU7WUFDeEMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3BDLFdBQVcsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDeEMsZ0JBQWdCLEVBQUUsa0ZBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7U0FDOUQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG9CQUFvQjs7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsUUFBUSxDQUFDLG1CQUFtQixDQUMxQixjQUFjLEVBQ2QsSUFBSSxDQUFDLGlCQUFrQyxDQUN4QyxDQUFDO1FBQ0YsUUFBUSxDQUFDLG1CQUFtQixDQUMxQixpQkFBaUIsRUFDakIsSUFBSSxDQUFDLG9CQUFxQyxDQUMzQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbkUsVUFBSSxDQUFDLG1CQUFtQixvREFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFDaEMsUUFBUSxDQUFDLG1CQUFtQixDQUMxQix3QkFBd0IsRUFDeEIsSUFBSSxDQUFDLDRCQUE2QyxDQUNuRCxDQUFDO1FBQ0YsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUMvRCxNQUFNLENBQUMsbUJBQW1CLENBQ3hCLHVGQUEwQixFQUMxQixJQUFJLENBQUMsa0JBQW1DLENBQ3pDLENBQUM7UUFDRixNQUFNLENBQUMsbUJBQW1CLENBQ3hCLGtGQUFxQixFQUNyQixJQUFJLENBQUMsb0JBQXFDLENBQzNDLENBQUM7UUFDRixNQUFNLENBQUMsbUJBQW1CLENBQ3hCLHVGQUEwQixFQUMxQixJQUFJLENBQUMsa0JBQW1DLENBQ3pDLENBQUM7UUFDRixJQUFJLElBQUksQ0FBQyxvQkFBb0I7WUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdkUsSUFBSSxJQUFJLENBQUMsaUJBQWlCO1lBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pFLElBQUksSUFBSSxDQUFDLHNCQUFzQjtZQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUM1RSxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJLElBQUksQ0FBQyxpQkFBaUI7WUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakUsSUFBSSxJQUFJLENBQUMsZUFBZTtZQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyRSxVQUFJLENBQUMscUJBQXFCLDBDQUFFLFVBQVUsRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFDbEMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0QsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUM1QixDQUFDO1FBQ0QsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTyxzQkFBc0IsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUM3QyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDbkQsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEdBQUc7Z0JBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0gsQ0FBQztJQUVPLHVCQUF1QixDQUM3QixLQUEwQixFQUMxQixRQUFnQixFQUNoQixHQUFZLEVBQ1osU0FBbUI7UUFFbkIsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBYSxhQUFiLEtBQUssdUJBQUwsS0FBSyxDQUFVLEdBQUcsS0FBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25FLElBQUksRUFBRTthQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNiLE9BQU8sR0FBRyxRQUFRLElBQUksUUFBUSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBdUJELDBFQUEwRTtJQUNsRSw2QkFBNkIsQ0FDbkMsTUFBd0M7O1FBRXhDLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7UUFDeEMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUFFLFNBQVM7WUFDNUMsSUFBSSxDQUFDO2dCQUNILFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFDLEtBQWEsQ0FBQyxvQkFBb0IsbUNBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RSxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQLFlBQVk7WUFDZCxDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssbUNBQW1DLENBQ3pDLFFBQTBCO1FBRTFCLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUU7O1lBQ3JDLElBQUksQ0FBQztnQkFDSCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBQyxLQUFhLENBQUMsb0JBQW9CLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztvQkFDMUIsS0FBYSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsQ0FBQztvQkFDakQsaUZBQWlCLENBQUMscUNBQXFDLEVBQUU7d0JBQ3ZELEtBQUssRUFBRSxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsS0FBSyxNQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxHQUFHLE1BQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEVBQUU7d0JBQzlDLE9BQU8sRUFBRSxPQUFPLElBQUksU0FBUzt3QkFDN0IsUUFBUSxFQUFFLFVBQVUsSUFBSSxTQUFTO3FCQUNsQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztZQUNILENBQUM7WUFBQyxXQUFNLENBQUM7Z0JBQ1AsWUFBWTtZQUNkLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFYSw0QkFBNEIsQ0FDeEMsS0FBMEIsRUFDMUIsUUFBZ0IsRUFDaEIsR0FBWSxFQUNaLFNBQW1COzs7WUFFbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixrRkFBa0IsQ0FBQyx5QkFBeUIsRUFBRTtvQkFDNUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRTtvQkFDM0MsUUFBUTtvQkFDUixHQUFHO29CQUNILGFBQWEsRUFBRSxTQUFTLENBQUMsTUFBTTtpQkFDaEMsQ0FBQyxDQUFDO2dCQUNILE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQztZQUNuQixDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFTLEVBQUU7O2dCQUN0QixNQUFNLHdCQUF3QixHQUFHLE1BQU0sQ0FDcEMsS0FBYSxDQUFDLG9CQUFvQixJQUFJLEVBQUUsQ0FDMUMsQ0FBQztnQkFFRix1RUFBdUU7Z0JBQ3ZFLHVFQUF1RTtnQkFDdkUsc0VBQXNFO2dCQUN0RSw0REFBNEQ7Z0JBQzVELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sVUFBVSxHQUF3QixrQkFBa0IsSUFBSSxLQUFLLENBQUM7Z0JBRXBFLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLFFBQVEsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDekMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN4QixrRkFBa0IsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDMUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRTtvQkFDM0MsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSTtvQkFDdEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLFNBQVM7b0JBQ1QsY0FBYyxFQUFFLElBQUk7aUJBQ3JCLENBQUMsQ0FBQztnQkFDSCxNQUFNLEdBQUcsR0FBRyxNQUFNLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLHFFQUFxRTtnQkFDckUsZ0NBQWdDO2dCQUNoQyxJQUNFLFVBQVUsS0FBSyxLQUFLO29CQUNwQixNQUFNLENBQUUsS0FBYSxDQUFDLG9CQUFvQixJQUFJLEVBQUUsQ0FBQzt3QkFDL0Msd0JBQXdCLEVBQzFCLENBQUM7b0JBQ0EsS0FBYSxDQUFDLG9CQUFvQixHQUFHLHdCQUF3QixDQUFDO2dCQUNqRSxDQUFDO2dCQUNELGtGQUFrQixDQUFDLHdCQUF3QixFQUFFO29CQUMzQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFO29CQUMzQyxZQUFZLEVBQUUsVUFBRyxDQUFDLFFBQVEsMENBQUUsTUFBTSxLQUFJLENBQUM7b0JBQ3ZDLFdBQVcsRUFBRSxPQUFPLENBQUMsZUFBRyxDQUFDLFFBQVEsMENBQUcsQ0FBQyxDQUFDLDBDQUFFLFFBQVEsQ0FBQztvQkFDakQsYUFBYSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQUcsQ0FBQyxRQUFRLDBDQUFHLENBQUMsQ0FBQywwQ0FBRSxVQUFVLEtBQUksRUFBRSxDQUFDO29CQUMvRCxTQUFTLEVBQUUsVUFBVSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxVQUFVO29CQUM5RCx3QkFBd0IsRUFDckIsS0FBYSxDQUFDLG9CQUFvQixJQUFJLElBQUk7aUJBQzlDLENBQUMsQ0FBQztnQkFDSCxPQUFPLFVBQUcsQ0FBQyxRQUFRLDBDQUFHLENBQUMsQ0FBQyxLQUFJLElBQUksQ0FBQztZQUNuQyxDQUFDLEVBQUMsRUFBRSxDQUFDO1lBRUwsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQy9CLE9BQU8sRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLHVCQUF1QjtnQkFDM0MsS0FBSyxFQUFFLEdBQUc7YUFDWCxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxPQUFPLElBQUksV0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsMENBQUUsS0FBSyxNQUFLLEdBQUcsRUFBRSxDQUFDO29CQUNoRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2dCQUNELE9BQU8sT0FBTyxDQUFDO1lBQ2pCLENBQUM7WUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNiLElBQUksV0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsMENBQUUsS0FBSyxNQUFLLEdBQUcsRUFBRSxDQUFDO29CQUNwRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2dCQUNELE1BQU0sR0FBRyxDQUFDO1lBQ1osQ0FBQztRQUNILENBQUM7S0FBQTtJQXNERCxrQ0FBa0M7SUFDMUIsbUJBQW1CO1FBQ3pCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsK0RBQStEO0lBQ3ZELGlCQUFpQjtRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFN0MsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FDbkMsMERBQTBELENBQ3JDLENBQUM7UUFDeEIsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDakQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ2xCLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sY0FBYyxDQUNwQixJQUF1QztRQUV2QyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUM7WUFDL0IsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FDcEMsMEJBQTBCLENBQ0wsQ0FBQztZQUN4QixJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNaLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNqRCxJQUFJLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUM7b0JBQ2hELE9BQU8sUUFBUSxDQUFDO2dCQUNsQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFRLElBQUksQ0FBQyxTQUF5QixDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDakUsQ0FBQztJQUVPLG9CQUFvQixDQUMxQixJQUF1Qzs7UUFFdkMsVUFBSSxDQUFDLHFCQUFxQiwwQ0FBRSxVQUFVLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBRWxDLElBQUksT0FBTyxjQUFjLEtBQUssV0FBVztZQUFFLE9BQU87UUFFbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZDLENBQUMsQ0FBQyxDQUFFLFFBQVEsQ0FBQyxhQUFhLENBQ3RCLDBCQUEwQixDQUNKLElBQUssSUFBSSxDQUFDLFNBQWdDLENBQUM7WUFDckUsQ0FBQyxDQUFFLElBQUksQ0FBQyxTQUFnQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUVwQixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQUMsR0FBRyxFQUFFO1lBQ25ELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU8scUJBQXFCLENBQzNCLElBQXVDLEVBQ3ZDLEdBQUcsR0FBRyxDQUFDO1FBRVAsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QyxJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDeEUsT0FBTyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0lBQzNCLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxPQUFvQjtRQUM3QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUNsQyxxQkFBcUIsQ0FDQSxDQUFDO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQ25DLHNCQUFzQixDQUNELENBQUM7UUFDeEIsTUFBTSxPQUFPLEdBQUcsT0FBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFlBQVksS0FBSSxDQUFDLENBQUM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsUUFBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFlBQVksTUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsWUFBWSxLQUFJLENBQUMsQ0FBQztRQUNyRSxNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ25DLElBQUksT0FBTyxHQUFHLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFM0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0MsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFTyxtQkFBbUIsQ0FDekIsQ0FBOEMsRUFDOUMsQ0FBMkIsRUFDM0IsT0FBTyxHQUFHLENBQUM7UUFFWCxJQUFJLENBQUMsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3JCLE9BQU8sQ0FDTCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FDakUsQ0FBQztJQUNKLENBQUM7SUEwS0QsbUVBQW1FO0lBQzNELHdCQUF3QixDQUM5QixLQUE0RDs7UUFFNUQsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUV6QiwyREFBMkQ7UUFDM0QsTUFBTSxRQUFRLEdBQVEsS0FBWSxDQUFDO1FBRW5DLGlCQUFpQjtRQUNqQixJQUFJLE9BQU8sUUFBUSxDQUFDLG1CQUFtQixLQUFLLFNBQVM7WUFDbkQsT0FBTyxRQUFRLENBQUMsbUJBQW1CLENBQUM7UUFFdEMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztRQUNsQyxNQUFNLFNBQVMsR0FDYiwyQkFBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLElBQUksMENBQUUsbUJBQW1CLG1DQUM5QixTQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsSUFBSSwwQ0FBRSxrQkFBa0IsbUNBQzdCLFNBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxVQUFVLDBDQUFFLG1CQUFtQixtQ0FDcEMsU0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLFVBQVUsMENBQUUsa0JBQWtCLENBQUM7UUFFdEMsSUFBSSxPQUFPLFNBQVMsS0FBSyxTQUFTO1lBQUUsT0FBTyxTQUFTLENBQUM7UUFFckQsZ0RBQWdEO1FBQ2hELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQTBGRCxrREFBa0Q7SUFFMUMsb0JBQW9COztRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQXNCLENBQUM7UUFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLE1BQU07WUFDdEIsQ0FBQyxDQUFDLFVBQUcsQ0FBQyxTQUFTLG1EQUFJLE1BQUksU0FBRyxDQUFDLE9BQU8sbURBQUksS0FBSSxHQUFHO1lBQzdDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDUCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuRCxJQUFJLEtBQUs7WUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRSxPQUFPLDBGQUF3QixDQUFDO1lBQzlCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLGNBQWMsRUFBRSxHQUFHLEVBQUU7Z0JBQ25CLElBQUksTUFBTSxFQUFFLENBQUM7b0JBQ1gsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FDbkMsbUNBQW1DLE1BQU0sNkJBQTZCLENBQ3ZFLENBQUM7b0JBQ0YsSUFBSSxNQUFNLFlBQVksV0FBVzt3QkFBRSxPQUFPLE1BQU0sQ0FBQztnQkFDbkQsQ0FBQztnQkFDRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDLENBQUM7Z0JBQ3BFLE9BQU8sUUFBUSxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDM0QsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxxQkFBcUIsQ0FDM0IsV0FBMEI7O1FBRTFCLElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxHQUFHLHVEQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDMUIsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLE1BQU0sR0FBRyxXQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsb0JBQW9CLHFEQUFJLENBQUM7Z0JBQy9DLElBQUksTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLElBQUk7b0JBQUUsT0FBTyxNQUFNLENBQUM7Z0JBQ2hDLE1BQU0sVUFBVSxHQUFHLFlBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxrQkFBa0IscURBQUksS0FBSSxFQUFFLENBQUM7Z0JBQ3ZELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxXQUFXO29CQUFFLE9BQU8sV0FBVyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxNQUFNLEdBQUcsR0FBRyxjQUFPLENBQUMsa0JBQWtCLHVEQUFJLEtBQUksRUFBRSxDQUFDO1lBQ2pELE9BQU8sQ0FDTCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxLQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxLQUFJLEtBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxRQUFRLE1BQUssS0FBSyxDQUFDO2dCQUMvRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxDQUFDO2dCQUNuQyxJQUFJLENBQ0wsQ0FBQztRQUNKLENBQUM7UUFBQyxXQUFNLENBQUM7WUFDUCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0lBZ0RPLDBCQUEwQixDQUFDLE9BQWM7O1FBQy9DLE1BQU0sS0FBSyxHQUFHLHdEQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLE1BQU0sR0FBRyxHQUFVLEVBQUUsQ0FBQztRQUN0QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRS9CLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7WUFDMUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxZQUFZLEtBQUksRUFBRSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFBRSxTQUFTO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDYixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWQsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQVEsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxTQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsbUJBQW1CLGtEQUFJLEtBQUksRUFBRSxDQUFDO1lBQ25ELEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsRUFBRSxLQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO29CQUFFLFNBQVM7Z0JBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUQsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFvWE8sY0FBYyxDQUFDLEdBQWdCO1FBQ3JDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixNQUFNLElBQUksR0FBRyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsSUFBK0QsQ0FBQztRQUNsRixJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsS0FBSyxVQUFVO1lBQUUsT0FBTztRQUNuRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQVEsQ0FBQztJQUNoRSxDQUFDO0lBd1ZPLGNBQWM7O1FBQ3BCLElBQUksVUFBSSxDQUFDLFlBQVksMENBQUUsTUFBTTtZQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQXdITyxnQkFBZ0IsQ0FBQyxLQUFVO1FBQ2pDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsRUFBRSxLQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsS0FBSyxLQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZELE9BQU8sRUFBRSxLQUFLLHdCQUF3QjtZQUNwQyxLQUFLLENBQUMsUUFBUSxDQUFDLDRCQUE0QixDQUFDO1lBQzVDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELHlFQUF5RTtJQUNqRSx5QkFBeUIsQ0FDL0IsS0FBVSxFQUNWLElBQXVDO1FBRXZDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3pELE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUFPLENBQUM7UUFDNUIsSUFBSSxPQUFPLEdBQVEsS0FBSyxDQUFDO1FBQ3pCLE9BQU8sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEIsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUs7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDNUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7UUFDcEQsQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQVksYUFBWixJQUFJLHVCQUFKLElBQUksQ0FBVSxLQUFLLEtBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLFFBQVE7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNoRSxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsUUFBUTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ2hFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUM7SUFDdEUsQ0FBQztJQUVPLHdCQUF3QixDQUFDLEtBQVU7O1FBQ3pDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDekIsNEVBQTRFO1FBQzVFLElBQUksb0ZBQXVCLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDakQsd0VBQXdFO1FBQ3hFLGdFQUFnRTtRQUNoRSxNQUFNLFFBQVEsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLFlBQUssQ0FBQyxNQUFNLDBDQUFFLEtBQUssS0FBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0RyxNQUFNLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLGtGQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzlELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BFLElBQUksWUFBWSxJQUFJLFlBQVksS0FBSyxTQUFTO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDN0QsTUFBTSxNQUFNLEdBQVUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0RSxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLElBQUksS0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdEYsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNwRiw2RUFBNkU7UUFDN0UsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVPLDBCQUEwQixDQUFDLE9BQXVCLEVBQUUsS0FBVTs7UUFDcEUsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGNBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLDBDQUFFLElBQUksS0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6RSxJQUFJLFlBQVksSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLFlBQVksS0FBSyxjQUFjO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDaEcsTUFBTSxLQUFLLEdBQUcsUUFBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFVBQVUsS0FBSSxFQUFFLENBQUM7UUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDcEUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDTyxvQkFBb0IsQ0FDMUIsSUFBdUM7O1FBRXZDLE1BQU0sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNyRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxJQUFJLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FDYixDQUFDLFlBQUMsR0FBVyxhQUFYLEdBQUcsdUJBQUgsR0FBRyxDQUFVLFNBQVMsMENBQUUsT0FBTyxrREFBYyxLQUFJLEVBQUUsQ0FBQztRQUN4RCx5RUFBeUU7UUFDekUsTUFBTSxhQUFhLEdBQTBCLEVBQUUsQ0FBQztRQUNoRCxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLGtGQUFxQixDQUFDLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBQ3BELE1BQU0sR0FBRyxHQUNQLGdGQUFtQixDQUFDLEtBQUssQ0FBQztnQkFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUFFLE9BQU87WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBNEIsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQztRQUNGLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFLENBQUM7WUFDN0IsNkRBQTZEO1lBQzdELGlFQUFpRTtZQUNqRSxLQUFLLE1BQU0sSUFBSSxJQUFJLHdGQUEyQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3JELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQzNCLElBQUksR0FBRyxDQUFzQjtZQUMzQixHQUFHLGdCQUFnQjtZQUNuQixHQUFHLGFBQWE7U0FDakIsQ0FBQyxDQUNILENBQUM7UUFFRixPQUFPLFVBQVU7YUFDZCxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQzthQUN4RCxNQUFNLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDeEQsTUFBTSxHQUFHLEdBQ1AsZ0ZBQW1CLENBQUMsS0FBSyxDQUFDO2dCQUMxQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNoQyxPQUFPLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUEwQixDQUFDO0lBQ2hDLENBQUM7SUFFYSxrQkFBa0IsQ0FDOUIsSUFBdUMsRUFDdkMsR0FBZ0I7O1lBRWhCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLE1BQU0sQ0FBQyxNQUFNO2dCQUFFLE9BQU8sTUFBTSxDQUFDO1lBRWpDLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsSUFBSSxNQUFNLENBQUMsTUFBTTtnQkFBRSxPQUFPLE1BQU0sQ0FBQztZQUVqQyxxRUFBcUU7WUFDckUseUVBQXlFO1lBQ3pFLElBQUksQ0FBQztnQkFDSCxNQUFNLFNBQVMsR0FBRyx1RkFBMEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssTUFBTSxLQUFLLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQzlCLE1BQU0sNkVBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7WUFDSCxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQLFlBQVk7WUFDZCxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBdUZELG1HQUFtRztJQUMzRixpQ0FBaUMsQ0FDdkMsVUFBa0QsRUFDbEQsU0FBaUI7UUFFakIsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUM3QixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQ3RDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUNsQyxDQUFDO1FBQ0YsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3RDLENBQUM7SUFvS0Q7Ozs7T0FJRztJQUNXLG1CQUFtQixDQUMvQixpQkFBeUQ7O1lBRXpELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQ0FBaUMsQ0FDdEQsaUJBQWlCLEVBQ2pCLGtGQUFxQixDQUN0QixDQUFDO1lBQ0YsSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDekQsaUZBQWlCLENBQUMsa0NBQWtDLEVBQUU7b0JBQ3BELG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksRUFBRSxDQUFDO2lCQUMzRCxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxpQkFBaUIsSUFBSSxFQUFFLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUksQ0FBQztnQkFDSCxrRkFBa0IsQ0FBQyx5QkFBeUIsRUFBRTtvQkFDNUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUM7b0JBQzNCLE1BQU0sRUFBRSxpQ0FBaUM7aUJBQzFDLENBQUMsQ0FBQztnQkFDSCxNQUFNLFVBQVUsR0FBRyxNQUFNLDBGQUF5QixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxrRkFBa0IsQ0FBQywwQkFBMEIsRUFBRTtvQkFDN0MsUUFBUSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUM7b0JBQzNCLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDO29CQUMxQixhQUFhLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO2lCQUM3QyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDZix1RUFBdUU7b0JBQ3ZFLHVFQUF1RTtvQkFDdkUsdUNBQVksQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUMsR0FBSyxVQUFVLEVBQUc7Z0JBQ3pELENBQUM7WUFDSCxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWCxpRkFBaUIsQ0FBQywrQkFBK0IsRUFBRTtvQkFDakQsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLEtBQUssRUFBRSxDQUFDLENBQVMsYUFBVCxDQUFDLHVCQUFELENBQUMsQ0FBVSxPQUFPLEtBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDeEMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8saUJBQWlCLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7S0FBQTtJQWtiRCwyREFBMkQ7SUFFN0Msc0JBQXNCLENBQUMsR0FBVzs7WUFDOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSx3REFBVyxDQUFDLEdBQUcsRUFBRTtnQkFDbEMsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLEtBQUssRUFBRSxFQUFFO2FBQ0gsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxLQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxhQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsSUFBd0IsQ0FBQztRQUM1RSxDQUFDO0tBQUE7SUFFTyx1QkFBdUI7UUFDN0IsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDakIsSUFBSSxDQUFDLENBQUMsZ0JBQWdCO29CQUFFLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsV0FBTSxDQUFDLEVBQUM7SUFDWixDQUFDO0lBRU8sa0JBQWtCLENBQUMsRUFBVztRQUNwQyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3RCLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU8sV0FBVyxDQUFDLENBQVU7UUFDNUIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMxQixNQUFNLENBQUMsR0FBRyxJQUFJLEVBQ1osS0FBSyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEQsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFYSxxQkFBcUIsQ0FBQyxLQUFtQixFQUFFLEdBQVc7O1lBQ2xFLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFBRSxPQUFPO2dCQUM3QixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDWixrQkFBa0IsRUFBRSxLQUFLO29CQUN6QixXQUFXLEVBQUUsRUFBRTtvQkFDZixtQkFBbUIsRUFBRSxJQUFJLEVBQUUsaURBQWlEO2lCQUM3RSxDQUFDLENBQUM7Z0JBQ0gsT0FBTztZQUNULENBQUM7WUFFRCxJQUFJLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRTdELE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRyxHQUFHLENBQUMsS0FBSSxFQUFFLENBQVUsQ0FBQztnQkFFNUMsTUFBTSxLQUFLLEdBQXFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2pELEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7b0JBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO29CQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO2lCQUNiLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0sWUFBWSxHQUFxQixFQUFFLENBQUM7Z0JBQzFDLEtBQUssTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3ZCLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7d0JBQ3RELElBQUksQ0FBQzs0QkFDSCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ3ZELEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsRCxDQUFDO3dCQUFDLFdBQU0sQ0FBQzs0QkFDUCwwQkFBMEI7d0JBQzVCLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixDQUFDO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFBRSxPQUFPO2dCQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNaLFdBQVcsRUFBRSxZQUFZO29CQUN6QixrQkFBa0IsRUFBRSxLQUFLO29CQUN6QixtQkFBbUIsRUFBRSxJQUFJO2lCQUMxQixDQUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztnQkFDbEIsZ0ZBQWdGO2dCQUNoRixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLE9BQU8sS0FBSSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sY0FBYyxHQUNsQixHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixDQUFDO29CQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixDQUFDO29CQUM1QyxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixDQUFDO29CQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDO29CQUNwQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUVoRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQUUsT0FBTztnQkFFN0IsSUFBSSxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDWixrQkFBa0IsRUFBRSxLQUFLO3dCQUN6QixXQUFXLEVBQUUsRUFBRTt3QkFDZixtQkFBbUIsRUFBRSxJQUFJO3FCQUMxQixDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDVCxDQUFDO2dCQUVELElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osa0JBQWtCLEVBQUUsS0FBSztvQkFDekIsV0FBVyxFQUFFLEVBQUU7b0JBQ2YsbUJBQW1CLEVBQUUsSUFBSTtpQkFDMUIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7S0FBQTtJQUVELGdFQUFnRTtJQUV4RCxXQUFXLENBQUMsSUFBWTs7UUFDOUIsb0NBQW9DO1FBQ3BDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEdBQUcsR0FBRyxrQkFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxDQUFFLE1BQU0sMENBQUUsSUFBSSxDQUFDLENBQUMsRUFBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQVcsYUFBWCxHQUFHLHVCQUFILEdBQUcsQ0FBVSxJQUFJLEtBQUksRUFBRSxDQUFDLENBQUM7UUFDM0MsT0FBTyxDQUNMLENBQUMsS0FBSyxNQUFNO1lBQ1osQ0FBQyxLQUFLLGtCQUFrQjtZQUN4QixDQUFDLEtBQUssV0FBVztZQUNqQixDQUFDLEtBQUssV0FBVyxDQUNsQixDQUFDO0lBQ0osQ0FBQztJQUVPLGVBQWU7UUFDckIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztRQUMzQyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3RCLE9BQU8sQ0FDTCxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQzNCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDSixnRkFBbUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssR0FBRyxDQUN0QyxJQUFJLElBQUksQ0FDVixDQUFDO0lBQ0osQ0FBQztJQTZCTyxtQkFBbUIsQ0FBQyxLQUFVLEVBQUUsWUFBb0I7UUFDMUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxJQUFJLEtBQUksWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FDbEIsTUFBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEtBQUssTUFBSSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsV0FBVyxNQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxLQUFLLEtBQUksRUFBRSxDQUN6RCxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1QsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLElBQUksQ0FBQztRQUN4QixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxvQkFBb0IsQ0FDMUIsS0FBVSxFQUNWLFNBQWlCO1FBRWpCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hFLE9BQU8sQ0FDSixNQUFNLENBQUMsSUFBSSxDQUNWLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLElBQUksS0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQzlCLElBQUksSUFBSSxDQUN2QyxDQUFDO0lBQ0osQ0FBQztJQUVPLDBCQUEwQixDQUFDLFNBQWlCO1FBQ2xELE1BQU0sTUFBTSxHQUEwQixFQUFFLENBQUM7UUFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZDLElBQUksT0FBTztZQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNuRCxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7WUFDM0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsR0FBRztnQkFBRSxTQUFTO1lBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdkQsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO2dCQUM3RCxPQUFPLEtBQUssQ0FBQztZQUNmLENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sZ0NBQWdDLENBQ3RDLFNBQWlCLEVBQ2pCLEVBQU87O1FBRVAsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUM7WUFDSCxNQUFNLFNBQVMsR0FBRyxlQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsU0FBUyxrREFBSSwwQ0FBRSxNQUFNLEtBQUksRUFBRSxDQUFDO1lBQ2xELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLElBQUksTUFBSSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsUUFBUSxLQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDMUQsSUFDRSxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTTtvQkFDOUIsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU07b0JBQzVCLE1BQU0sQ0FBQyxFQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsUUFBUSxLQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sRUFDbEQsQ0FBQztvQkFDRCxTQUFTO2dCQUNYLENBQUM7Z0JBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDckQsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO29CQUM3RCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFBQyxXQUFNLENBQUM7WUFDUCxZQUFZO1FBQ2QsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFZOztRQUNoQyxNQUFNLE1BQU0sR0FBRyxnQkFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLDBDQUFFLE1BQU0sMENBQUcsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxNQUFNO1lBQUUsT0FBTyxNQUFNLENBQUM7UUFFMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztRQUVyRCxvRUFBb0U7UUFDcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELElBQUksU0FBUztZQUFFLE9BQU8sU0FBUyxDQUFDO1FBRWhDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUNOLElBQUksS0FBSSxVQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsMENBQUcsSUFBSSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7WUFDbEMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNYLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkUsSUFBSSxNQUFNO1lBQUUsT0FBTyxNQUFNLENBQUM7UUFFMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2RSxJQUFJLEtBQUs7Z0JBQUUsT0FBTyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QyxNQUFNLFFBQVEsR0FBRyxZQUFZO1lBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQztZQUNuRCxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ1QsSUFBSSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsS0FBSztZQUFFLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVuRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU8sZUFBZSxDQUFDLEdBQVE7UUFDOUIsSUFBSSxHQUFHLFlBQVksSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUN6QyxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtvQkFDMUIsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLEdBQUcsRUFBRSxTQUFTO29CQUNkLElBQUksRUFBRSxTQUFTO29CQUNmLE1BQU0sRUFBRSxTQUFTO2lCQUNsQixDQUFDLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM1QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0IsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtvQkFDakMsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLEdBQUcsRUFBRSxTQUFTO29CQUNkLElBQUksRUFBRSxTQUFTO29CQUNmLE1BQU0sRUFBRSxTQUFTO2lCQUNsQixDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFTyxXQUFXLENBQUMsSUFBWSxFQUFFLEdBQVE7UUFDeEMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLEVBQUU7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUVoRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdELElBQ0UsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ3BELENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDcEQsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRU8sWUFBWSxDQUFDLEtBQW1CLEVBQUUsUUFBZ0I7UUFDeEQsK0JBQStCO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUEyRUQsa0JBQWtCLENBQ2hCLFNBQTJDLEVBQzNDLFNBQTBCOztRQUUxQixNQUFNLE1BQU0sR0FBRyxrRkFBZ0IsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sTUFBTSxHQUFHLGtGQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxNQUFNLENBQUM7UUFDcEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUNwQixPQUFDLFNBQVMsQ0FBQyxlQUF1QiwwQ0FBRyxDQUFDLENBQUM7YUFDckMsWUFBQyxTQUFTLENBQUMsZUFBdUIsMENBQUUsR0FBRyxtREFBRyxDQUFDLENBQUM7WUFDNUMsRUFBRSxDQUNMLENBQUM7UUFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQ3BCLE9BQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUF1QiwwQ0FBRyxDQUFDLENBQUM7YUFDdEMsWUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQXVCLDBDQUFFLEdBQUcsbURBQUcsQ0FBQyxDQUFDO1lBQzdDLEVBQUUsQ0FDTCxDQUFDO1FBQ0YsTUFBTSxVQUFVLEdBQUcsT0FBTyxLQUFLLE9BQU8sQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxJQUFJLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDeEQsS0FBSyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RCxDQUFDO2FBQU0sSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRUQsSUFDRSxTQUFTLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztZQUM1QyxTQUFTLENBQUMsY0FBYyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUN0RCxDQUFDO1lBQ0QsSUFBSSxDQUFDLHdCQUF3QixDQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUNuRCxDQUFDO1FBQ0osQ0FBQzthQUFNLElBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO1lBQ3BCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjO1lBQzFCLFNBQVMsQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQ2hELENBQUM7WUFDRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWM7WUFBRSxPQUFPO1FBRS9ELE1BQU0sU0FBUyxHQUNiLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQzlDLENBQUMsU0FBUyxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0QsTUFBTSxrQkFBa0IsR0FDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLENBQUMsa0JBQWtCO1lBQzlELENBQUMsV0FBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLDBDQUFFLE1BQU0sS0FBSSxDQUFDLENBQUM7Z0JBQ25DLENBQUMsZ0JBQVMsQ0FBQyxXQUFXLDBDQUFFLE1BQU0sS0FBSSxDQUFDLENBQUMsQ0FBQztRQUN6QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsT0FBTyxDQUFDO1FBQ2hFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFFMUUsSUFDRSxDQUFDLFNBQVM7WUFDVixDQUFDLGtCQUFrQjtZQUNuQixDQUFDLGNBQWM7WUFDZixDQUFDLFlBQVksRUFDYixDQUFDO1lBQ0QsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBa0lPLFlBQVksQ0FBQyxLQUFhO1FBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDdEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxVQUFVLElBQUksQ0FBQztZQUFFLElBQUksR0FBRyxDQUFDLENBQUM7YUFDekIsSUFBSSxVQUFVLElBQUksQ0FBQztZQUFFLElBQUksR0FBRyxDQUFDLENBQUM7YUFDOUIsSUFBSSxVQUFVLElBQUksQ0FBQztZQUFFLElBQUksR0FBRyxDQUFDLENBQUM7UUFDbkMsT0FBTyxJQUFJLEdBQUcsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFTyxlQUFlLENBQUMsS0FBYTtRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN2QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSTtZQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDM0QsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUc7WUFBRSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzFELElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVPLHVCQUF1QixDQUFDLEtBQWE7UUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEcsT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRTtZQUNuQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3hCLHFCQUFxQixFQUFFLENBQUM7U0FDekIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTyxtQkFBbUIsQ0FDekIsTUFBdUM7UUFFdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFDOUIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRUQsSUFBSSxJQUFJLEdBQUcsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM3QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNqRSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sbUJBQW1CLENBQ3pCLENBQVMsRUFDVCxDQUFTLEVBQ1QsS0FBYSxFQUNiLE1BQWMsRUFDZCxNQUFjO1FBRWQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzFCLE9BQU87WUFDTCxLQUFLLENBQUMsSUFBSSxNQUFNLEVBQUU7WUFDbEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0IsS0FBSyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekIsS0FBSyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDM0MsS0FBSyxDQUFDLEdBQUcsS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUMxQixHQUFHO1NBQ0osQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZCxDQUFDO0lBeXJCRCxNQUFNOztRQUNKLE1BQU0sRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVc7WUFDdkMsQ0FBQyxDQUFDLGtCQUFrQjtZQUNwQixDQUFDLENBQUMsbUJBQW1CLENBQUM7UUFFeEIsT0FBTyxDQUNMLG9FQUFLLFNBQVMsRUFBRSxtQkFBbUIsVUFBVSxFQUFFO1lBQzVDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFFbkIsMkRBQUMsZ0ZBQXFCLElBQ3BCLGNBQWMsRUFBRSxjQUFjLEVBQzlCLGVBQWUsRUFBRSxlQUFlLEVBQ2hDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFDN0Msa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixHQUMzQztZQUVGLG9FQUNFLEtBQUssRUFBRTtvQkFDTCxRQUFRLEVBQUUsVUFBVTtvQkFDcEIsTUFBTSxFQUFFLEtBQUs7b0JBQ2IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osS0FBSyxFQUFFLEtBQUs7b0JBQ1osTUFBTSxFQUFFLEtBQUs7b0JBQ2IsVUFBVSxFQUFFLFdBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSwwQ0FBRSxNQUFNO3dCQUMxQyxDQUFDLENBQUMsU0FBUzt3QkFDWCxDQUFDLENBQUMsU0FBUztvQkFDYixZQUFZLEVBQUUsS0FBSztvQkFDbkIsT0FBTyxFQUFFLEdBQUc7b0JBQ1osVUFBVSxFQUFFLGVBQWU7b0JBQzNCLGFBQWEsRUFBRSxNQUFNO2lCQUN0QixFQUNELEtBQUssRUFDSCxXQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsMENBQUUsTUFBTTtvQkFDOUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDO29CQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUUvQixDQUNFLENBQ1AsQ0FBQztJQUNKLENBQUM7O0FBcDZEdUIsNEJBQWdCLEdBQUc7SUFDekMsTUFBTTtJQUNOLE1BQU07SUFDTixLQUFLO0lBQ0wsSUFBSTtJQUNKLEtBQUs7SUFDTCxNQUFNO0NBQ1AsQ0FBQztpRUEvbEVpQixXQUFXO0FBbWdJeEIsU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZxSW5GLE1BQU0sUUFBUSxHQUFXO0lBQ3ZCLE1BQU0sRUFBRTtRQUNOLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsa0JBQWtCLEVBQUUsc0JBQXNCO1FBQzFDLGNBQWMsRUFBRSxrQkFBa0I7UUFDbEMsWUFBWSxFQUFFLDhCQUE4QjtRQUM1QyxjQUFjLEVBQUUsaUJBQWlCO1FBQ2pDLGlCQUFpQixFQUFFLGlCQUFpQjtRQUNwQyxlQUFlLEVBQUUsZ0JBQWdCO1FBQ2pDLGdCQUFnQixFQUFFLGVBQWU7UUFDakMsdUJBQXVCLEVBQUUsb0NBQW9DO1FBQzdELHlCQUF5QixFQUFFLDhDQUE4QztRQUN6RSxpQkFBaUIsRUFDZixrRUFBa0U7UUFDcEUsbUJBQW1CLEVBQUUsb0JBQW9CO1FBQ3pDLDJCQUEyQixFQUFFLDhCQUE4QjtRQUMzRCxzQkFBc0IsRUFBRSxvQkFBb0I7UUFDNUMsMEJBQTBCLEVBQUUsTUFBTTtRQUNsQyx5QkFBeUIsRUFBRSxhQUFhO1FBQ3hDLHFCQUFxQixFQUFFLGNBQWM7UUFDckMscUJBQXFCLEVBQ25CLHVEQUF1RDtRQUN6RCxjQUFjLEVBQUUsMEJBQTBCO1FBQzFDLGdCQUFnQixFQUFFLGdCQUFnQjtRQUNsQyxpQkFBaUIsRUFBRSw2QkFBNkI7UUFDaEQsd0JBQXdCLEVBQ3RCLHNFQUFzRTtRQUN4RSw2QkFBNkIsRUFDM0IseUdBQXlHO1FBQzNHLDRCQUE0QixFQUMxQiwrQ0FBK0M7UUFDakQsdUJBQXVCLEVBQUUsZ0RBQWdEO1FBQ3pFLGdDQUFnQyxFQUFFLHFDQUFxQztRQUN2RSw4QkFBOEIsRUFDNUIsaURBQWlEO1FBQ25ELGlDQUFpQyxFQUMvQixnREFBZ0Q7UUFDbEQsa0JBQWtCLEVBQUUsOEJBQThCO1FBQ2xELGVBQWUsRUFBRSx3QkFBd0I7UUFDekMsaUJBQWlCLEVBQUUsMEJBQTBCO1FBQzdDLGNBQWMsRUFBRSx3Q0FBd0M7S0FDekQ7SUFDRCxNQUFNLEVBQUU7UUFDTixrQkFBa0IsRUFBRSxzQkFBc0I7UUFDMUMsZUFBZSxFQUFFLG1CQUFtQjtRQUNwQyxjQUFjLEVBQUUsa0JBQWtCO1FBQ2xDLFlBQVksRUFBRSwyQkFBMkI7UUFDekMsY0FBYyxFQUFFLGNBQWM7UUFDOUIsaUJBQWlCLEVBQUUsZUFBZTtRQUNsQyxlQUFlLEVBQUUsY0FBYztRQUMvQixnQkFBZ0IsRUFBRSxjQUFjO1FBQ2hDLHVCQUF1QixFQUFFLG1DQUFtQztRQUM1RCx5QkFBeUIsRUFBRSw2Q0FBNkM7UUFDeEUsaUJBQWlCLEVBQ2Ysa0VBQWtFO1FBQ3BFLG1CQUFtQixFQUFFLG9CQUFvQjtRQUN6QywyQkFBMkIsRUFBRSwwQkFBMEI7UUFDdkQsc0JBQXNCLEVBQUUsZ0JBQWdCO1FBQ3hDLDBCQUEwQixFQUFFLE1BQU07UUFDbEMseUJBQXlCLEVBQUUsYUFBYTtRQUN4QyxxQkFBcUIsRUFBRSxZQUFZO1FBQ25DLHFCQUFxQixFQUFFLG9EQUFvRDtRQUMzRSxjQUFjLEVBQUUseUJBQXlCO1FBQ3pDLGdCQUFnQixFQUFFLGVBQWU7UUFDakMsaUJBQWlCLEVBQUUsMkJBQTJCO1FBQzlDLHdCQUF3QixFQUN0QixzRUFBc0U7UUFDeEUsNkJBQTZCLEVBQzNCLHNHQUFzRztRQUN4Ryw0QkFBNEIsRUFDMUIsK0NBQStDO1FBQ2pELHVCQUF1QixFQUFFLGdEQUFnRDtRQUN6RSxnQ0FBZ0MsRUFBRSxtQ0FBbUM7UUFDckUsOEJBQThCLEVBQzVCLGlEQUFpRDtRQUNuRCxpQ0FBaUMsRUFDL0IsK0NBQStDO1FBQ2pELGtCQUFrQixFQUFFLDhCQUE4QjtRQUNsRCxlQUFlLEVBQUUsc0JBQXNCO1FBQ3ZDLGlCQUFpQixFQUFFLHlCQUF5QjtRQUM1QyxjQUFjLEVBQUUsc0NBQXNDO0tBQ3ZEO0lBQ0QsRUFBRSxFQUFFO1FBQ0Ysa0JBQWtCLEVBQUUscUJBQXFCO1FBQ3pDLGVBQWUsRUFBRSx1QkFBdUI7UUFDeEMsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxZQUFZLEVBQUUsOEJBQThCO1FBQzVDLGNBQWMsRUFBRSxnQkFBZ0I7UUFDaEMsaUJBQWlCLEVBQUUsZUFBZTtRQUNsQyxlQUFlLEVBQUUsaUJBQWlCO1FBQ2xDLGdCQUFnQixFQUFFLGdCQUFnQjtRQUNsQyx1QkFBdUIsRUFBRSw0QkFBNEI7UUFDckQseUJBQXlCLEVBQUUsa0NBQWtDO1FBQzdELGlCQUFpQixFQUFFLHdEQUF3RDtRQUMzRSxtQkFBbUIsRUFBRSxxQkFBcUI7UUFDMUMsMkJBQTJCLEVBQUUsc0JBQXNCO1FBQ25ELHNCQUFzQixFQUFFLGNBQWM7UUFDdEMsMEJBQTBCLEVBQUUsYUFBYTtRQUN6Qyx5QkFBeUIsRUFBRSxhQUFhO1FBQ3hDLHFCQUFxQixFQUFFLFNBQVM7UUFDaEMscUJBQXFCLEVBQUUsbURBQW1EO1FBQzFFLGNBQWMsRUFBRSx5QkFBeUI7UUFDekMsZ0JBQWdCLEVBQUUsYUFBYTtRQUMvQixpQkFBaUIsRUFBRSxxQkFBcUI7UUFDeEMsd0JBQXdCLEVBQ3RCLG9FQUFvRTtRQUN0RSw2QkFBNkIsRUFDM0Isc0ZBQXNGO1FBQ3hGLDRCQUE0QixFQUFFLDRDQUE0QztRQUMxRSx1QkFBdUIsRUFBRSwrQ0FBK0M7UUFDeEUsZ0NBQWdDLEVBQUUsK0JBQStCO1FBQ2pFLDhCQUE4QixFQUM1QixtREFBbUQ7UUFDckQsaUNBQWlDLEVBQUUsa0NBQWtDO1FBQ3JFLGtCQUFrQixFQUFFLG9DQUFvQztRQUN4RCxlQUFlLEVBQUUsbUJBQW1CO1FBQ3BDLGlCQUFpQixFQUFFLHNCQUFzQjtRQUN6QyxjQUFjLEVBQUUsMkNBQTJDO0tBQzVEO0lBQ0QsRUFBRSxFQUFFO1FBQ0Ysa0JBQWtCLEVBQUUsZ0JBQWdCO1FBQ3BDLGVBQWUsRUFBRSxjQUFjO1FBQy9CLGNBQWMsRUFBRSxnQkFBZ0I7UUFDaEMsWUFBWSxFQUFFLHdCQUF3QjtRQUN0QyxjQUFjLEVBQUUsYUFBYTtRQUM3QixpQkFBaUIsRUFBRSxnQkFBZ0I7UUFDbkMsZUFBZSxFQUFFLGNBQWM7UUFDL0IsZ0JBQWdCLEVBQUUsU0FBUztRQUMzQix1QkFBdUIsRUFBRSx5QkFBeUI7UUFDbEQseUJBQXlCLEVBQUUseUNBQXlDO1FBQ3BFLGlCQUFpQixFQUNmLG1FQUFtRTtRQUNyRSxtQkFBbUIsRUFBRSxnQkFBZ0I7UUFDckMsMkJBQTJCLEVBQUUsd0JBQXdCO1FBQ3JELHNCQUFzQixFQUFFLGdCQUFnQjtRQUN4QywwQkFBMEIsRUFBRSxPQUFPO1FBQ25DLHlCQUF5QixFQUFFLG1CQUFtQjtRQUM5QyxxQkFBcUIsRUFBRSxVQUFVO1FBQ2pDLHFCQUFxQixFQUFFLCtDQUErQztRQUN0RSxjQUFjLEVBQUUseUJBQXlCO1FBQ3pDLGdCQUFnQixFQUFFLFlBQVk7UUFDOUIsaUJBQWlCLEVBQUUsc0JBQXNCO1FBQ3pDLHdCQUF3QixFQUN0QiwyRUFBMkU7UUFDN0UsNkJBQTZCLEVBQzNCLCtHQUErRztRQUNqSCw0QkFBNEIsRUFBRSw2Q0FBNkM7UUFDM0UsdUJBQXVCLEVBQUUsK0NBQStDO1FBQ3hFLGdDQUFnQyxFQUFFLGdDQUFnQztRQUNsRSw4QkFBOEIsRUFDNUIsOENBQThDO1FBQ2hELGlDQUFpQyxFQUMvQix5Q0FBeUM7UUFDM0Msa0JBQWtCLEVBQUUsK0JBQStCO1FBQ25ELGVBQWUsRUFBRSxvQkFBb0I7UUFDckMsaUJBQWlCLEVBQUUsb0JBQW9CO1FBQ3ZDLGNBQWMsRUFBRSxnQ0FBZ0M7S0FDakQ7Q0FDRixDQUFDO0FBRUssU0FBUyxhQUFhLENBQUMsS0FBVTtJQUN0QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLEdBQUksRUFBRSxDQUFDO1NBQzVCLElBQUksRUFBRTtTQUNOLFdBQVcsRUFBRSxDQUFDO0lBRWpCLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxTQUFTO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDcEUsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxLQUFLLElBQUksR0FBRyxLQUFLLFNBQVM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUVwRSxJQUNFLEdBQUcsS0FBSyxRQUFRO1FBQ2hCLEdBQUcsS0FBSyxRQUFRO1FBQ2hCLEdBQUcsS0FBSyxTQUFTO1FBQ2pCLEdBQUcsS0FBSyxTQUFTO1FBQ2pCLEdBQUcsS0FBSyxRQUFRO1FBQ2hCLEdBQUcsS0FBSyxhQUFhO1FBQ3JCLEdBQUcsS0FBSyxhQUFhO1FBQ3JCLEdBQUcsS0FBSyxVQUFVLEVBQ2xCLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsSUFDRSxHQUFHLEtBQUssUUFBUTtRQUNoQixHQUFHLEtBQUssUUFBUTtRQUNoQixHQUFHLEtBQUssU0FBUztRQUNqQixHQUFHLEtBQUssVUFBVTtRQUNsQixHQUFHLEtBQUssSUFBSSxFQUNaLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVNLFNBQVMsY0FBYztJQUM1QixPQUFPLGFBQWEsQ0FDbEIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNwQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUNoQyxRQUFRLENBQ1gsQ0FBQztBQUNKLENBQUM7QUFFTSxTQUFTLGVBQWU7SUFDN0IsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQy9ELElBQUksV0FBVyxLQUFLLE1BQU07UUFBRSxPQUFPLElBQUksQ0FBQztJQUN4QyxJQUFJLFdBQVcsS0FBSyxPQUFPO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDMUMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztJQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQzNCLE1BQU0sT0FBTyxHQUNYLFdBQVcsS0FBSyxPQUFPO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxPQUFPLENBQUM7SUFDOUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUNsQixDQUFDO0FBRU0sU0FBUyxDQUFDLENBQ2YsSUFBYyxFQUNkLEdBQVcsRUFDWCxNQUF3Qzs7SUFFeEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDL0MsTUFBTSxRQUFRLEdBQUcsY0FBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUNBQUksR0FBRyxDQUFDO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLFVBQUksQ0FBQyxHQUFHLENBQUMsbUNBQUksUUFBUSxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxNQUFNO1FBQUUsT0FBTyxRQUFRLENBQUM7SUFFN0IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRTs7UUFDckQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFlBQU0sQ0FBQyxRQUFRLENBQUMsbUNBQUksRUFBRSxDQUFDLENBQUM7UUFDN0MsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsUUFBUSxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0UsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM09ELGVBQWU7QUFNSTtBQUNrRDtBQUNYO0FBUzFEOzs7MkVBRzJFO0FBQ3BFLFNBQVMscUJBQXFCLENBQUMsS0FBWTtJQUNoRCxNQUFNLHNCQUFzQixHQUFHLHVFQUFZLENBQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sV0FBVyxHQUFHLHVFQUFZLENBQVMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25FLE1BQU0sU0FBUyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVDLE9BQU8sQ0FDTCx3REFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLGlCQUFjLE1BQU07UUFDaEQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUNYLCtDQUFDLDBEQUFtQixJQUNsQixHQUFHLEVBQUUsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLFlBQVksRUFDNUIsYUFBYSxFQUFFLFNBQVMsRUFDeEIsbUJBQW1CLEVBQ2pCLEtBQUssQ0FBQyxtQkFBbUI7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFDLEVBQWMsRUFBRSxFQUFFOztvQkFDakIsV0FBSyxDQUFDLG1CQUFtQixzREFBRyxFQUF5QixDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLFNBQVMsR0FFZixDQUNILENBQUMsQ0FBQyxDQUFDLElBQUk7UUFDUCxXQUFXLElBQUksQ0FDZCwrQ0FBQyw2REFBb0IsSUFDbkIsY0FBYyxFQUFFLFdBQVcsRUFDM0Isa0JBQWtCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixHQUM1QyxDQUNILENBQ0csQ0FDUCxDQUFDO0FBQ0osQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaEM2QjtBQUV2QixTQUFTLFlBQVksQ0FBVSxHQUFRO0lBQzVDLElBQUksQ0FBQyxHQUFHO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDcEIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUFFLE9BQU8sR0FBVSxDQUFDO0lBQzFDLElBQUksT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFVBQVU7UUFDckMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFRLENBQUM7SUFDOUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLEtBQUssVUFBVTtRQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sRUFBUyxDQUFDO0lBQ25FLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsY0FBbUI7SUFDbEQsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFNLGNBQWMsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQVFEOzs7O0dBSUc7QUFDSSxNQUFNLHFCQUFxQjtJQUFsQztRQUNVLFdBQU0sR0FBd0MsRUFBRSxDQUFDO1FBQ2pELGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBQzNCLGlCQUFZLEdBQUcsSUFBSSxHQUFHLEVBRzNCLENBQUM7SUFtUU4sQ0FBQztJQWpRQyxXQUFXLENBQUMsRUFBdUIsRUFBRSxHQUFhO1FBQ2hELElBQUksQ0FBQyxHQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRTtZQUFFLE9BQU87UUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFhO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELGlCQUFpQjtRQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELG1GQUFtRjtJQUNuRixnQkFBZ0IsQ0FBQyxXQUF1Qjs7UUFDdEMsSUFBSSxpQkFBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLElBQUksMENBQUUsR0FBRztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU07WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDNUUsT0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7SUFDN0MsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxjQUFjLENBQUMsRUFBdUI7UUFDcEMsTUFBTSxLQUFLLEdBQUcsRUFBUyxDQUFDO1FBQ3hCLE9BQU8sc0VBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVPLGFBQWEsQ0FBQyxFQUF1Qjs7UUFDM0MsTUFBTSxLQUFLLEdBQUcsRUFBUyxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMxQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEtBQUssS0FBSSxFQUFFLENBQUMsQ0FBQztRQUN6QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEdBQUcsTUFBSSxpQkFBSyxDQUFDLGlCQUFpQixxREFBSSwwQ0FBRSxHQUFHLEtBQUksRUFBRSxDQUFDLENBQUM7UUFDekUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUNsQixZQUFLLENBQUMsUUFBUSxxREFBSTthQUNoQixpQkFBSyxDQUFDLGlCQUFpQixxREFBSSwwQ0FBRSxLQUFLO2FBQ2xDLGlCQUFLLENBQUMsaUJBQWlCLHFEQUFJLDBDQUFFLFdBQVc7WUFDeEMsRUFBRSxDQUNMLENBQUM7UUFDRixPQUFPLEdBQUcsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRU8scUJBQXFCLENBQzNCLE9BQThDLEVBQzlDLEtBQVUsRUFDVixNQUFnQixFQUNoQixZQUFxQixFQUNyQixVQUFtQjtRQUVuQixPQUFPLG9FQUFlLENBQ3BCO1lBQ0UsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixnQkFBZ0IsRUFBRSxZQUFZO1lBQzlCLGNBQWMsRUFBRSxVQUFVO1NBQzNCLEVBQ0QsTUFBTSxFQUNOLEtBQUssQ0FDTixDQUFDO0lBQ0osQ0FBQztJQUVhLGlCQUFpQixDQUM3QixJQUFnQixFQUNoQixPQUE4QyxFQUM5QyxXQUF1Qzs7O1lBRXZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQU8sQ0FBQyxPQUFPLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQy9ELE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBNkMsRUFBRSxDQUFDO1lBQzVELE1BQU0sT0FBTyxHQUFHLENBQU8sSUFBYyxFQUFpQixFQUFFO2dCQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLEtBQUs7b0JBQUUsT0FBTztnQkFDbkIsSUFBSSxDQUFDO29CQUNILE1BQU0scUVBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQUMsV0FBTSxDQUFDO29CQUNQLFlBQVk7Z0JBQ2QsQ0FBQztnQkFDRCxNQUFNLE1BQU0sR0FBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FDdEMsT0FBTyxFQUNQLEtBQUssRUFDTCxNQUFNLEVBQ04sSUFBSSxDQUFDLFdBQVcsRUFDaEIsd0VBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUM5RCxDQUFDO2dCQUNGLE1BQU0sS0FBSyxHQUFHLE1BQU0sMkVBQXNCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDL0IsQ0FBQyxFQUFDO1lBRUYsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNkLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN6QixNQUFNLGNBQWMsR0FBRyxrQkFBTSxDQUFDLENBQUMsQ0FBQywwQ0FBRSxLQUFLLG1DQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLGNBQWMsR0FBRyxDQUFDO3dCQUFFLE9BQU8sU0FBUyxDQUFDO2dCQUMzQyxDQUFDO1lBQ0gsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQzNCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUNsRCxDQUFDO1lBQ0YsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUQsTUFBTSxRQUFRLEdBQUcsTUFBTTtpQkFDcEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztpQkFDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsSUFBSSxRQUFRLENBQUMsTUFBTTtnQkFBRSxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFN0MsT0FBTyxDQUNMLGFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLDBDQUFFLElBQUk7Z0JBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFLLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxFQUFFLEVBQUM7Z0JBQzdDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDUixDQUFDO1FBQ0osQ0FBQztLQUFBO0lBRUssc0JBQXNCLENBQzFCLE9BQThDOzs7WUFFOUMsTUFBTSxpQkFBaUIsR0FBRztnQkFDeEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO2dCQUNoQixPQUFPLEVBQUUsa0ZBQTZCLENBQUMsTUFBTSxDQUFDLGFBQU8sQ0FBQyxPQUFPLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQzdFLENBQUM7WUFDRixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDO1lBQ2hELE1BQU0sTUFBTSxHQUFlLEVBQUUsQ0FBQztZQUU5QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO29CQUFFLFNBQVM7Z0JBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1YsRUFBRTtvQkFDRixLQUFLLEVBQUUsNEVBQXVCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDO29CQUMzRCxXQUFXLEVBQUUsMEVBQXFCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztpQkFDeEUsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUVoQyxNQUFNLElBQUksR0FBRyw0RUFBdUIsQ0FDbEMsTUFBTSxFQUNOLE1BQU0sQ0FBQyxNQUFNLEVBQ2IsaUJBQWlCLEVBQ2pCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FDdEMsQ0FBQztZQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUU5QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLFdBQVcsR0FBb0IsSUFBSSxDQUFDO1lBQ3hDLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLEVBQUUsQ0FBQztvQkFDM0IsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ3ZCLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLENBQUM7WUFDSCxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsWUFBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLEVBQUUsS0FBSSxJQUFJLENBQUM7WUFDNUMsTUFBTSxRQUFRLEdBQ1osV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxXQUFXLENBQUM7Z0JBQ3BFLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFFbEIsTUFBTSxNQUFNLEdBQUcsU0FBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLEVBQUUsS0FBSSxXQUFXLENBQUM7WUFDM0MsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFFekIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUV4QixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxxRUFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQLGlDQUFpQztZQUNuQyxDQUFDO1lBQ0Qsb0VBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV2QixNQUFNLE1BQU0sR0FBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEUsTUFBTSxXQUFXLEdBQUcsY0FBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLFdBQVcsbUNBQUksS0FBSyxDQUFDO1lBQ25ELE1BQU0sWUFBWSxHQUFHLFdBQVcsSUFBSSxDQUFDLGNBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxLQUFLLG1DQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLE1BQU0sVUFBVSxHQUFHLHdFQUFtQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV4RSwwREFBSyxDQUFDLHdCQUF3QixFQUFFO2dCQUM5QixPQUFPLEVBQUUsaUJBQWlCO2dCQUMxQixJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ2YsVUFBVSxFQUFFLE1BQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxLQUFLLE1BQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEdBQUcsS0FBSSxJQUFJO2dCQUM5QyxLQUFLLEVBQUUsY0FBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLEtBQUssbUNBQUksU0FBUztnQkFDbkMsWUFBWTtnQkFDWixVQUFVO2dCQUNWLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTTtnQkFDekIsVUFBVSxFQUFFLFdBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUM7YUFDM0MsQ0FBQyxDQUFDO1lBQUEsRUFBRTtZQUNMLEtBQUssc0VBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLE9BQU87Z0JBQ0wsS0FBSztnQkFDTCxNQUFNO2dCQUNOLFlBQVk7Z0JBQ1osVUFBVTthQUNYLENBQUM7UUFDSixDQUFDO0tBQUE7SUFFSyxPQUFPLENBQ1gsT0FBOEMsRUFDOUMsV0FBdUI7OztZQUV2QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUM5QixHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFFO2dCQUN0QixPQUFPLEVBQUUsa0ZBQTZCLENBQUMsTUFBTSxDQUFDLGFBQU8sQ0FBQyxPQUFPLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM1RSxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDdEIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsSUFBSSxPQUFPO2dCQUFFLE9BQU8sT0FBTyxDQUFDO1lBRTVCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUM7Z0JBQ0gsT0FBTyxNQUFNLEdBQUcsQ0FBQztZQUNuQixDQUFDO29CQUFTLENBQUM7Z0JBQ1QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRWEsZUFBZSxDQUMzQixPQUE4QyxFQUM5QyxXQUF1Qjs7O1lBRXZCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFELElBQUksTUFBTTtnQkFBRSxPQUFPLE1BQU0sQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2pCLDBEQUFLLENBQUMsMkNBQTJDLEVBQUU7b0JBQ2pELE9BQU87b0JBQ1AsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO29CQUM3QixZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNqRSxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxrRkFBNkIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUUsMERBQUssQ0FBQyxpQkFBaUIsRUFBRTtnQkFDdkIsT0FBTztnQkFDUCxVQUFVLEVBQUUsY0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEtBQUssMENBQUUsS0FBSyxNQUFJLGFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxLQUFLLDBDQUFFLEdBQUcsS0FBSSxJQUFJO2dCQUNoRSxZQUFZLEVBQUUsYUFBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFlBQVksbUNBQUksSUFBSTtnQkFDM0MsVUFBVSxFQUFFLGFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxVQUFVLG1DQUFJLElBQUk7Z0JBQ3ZDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTzthQUNqQixDQUFDLENBQUM7WUFDSCxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FBQztnQkFDbkIsS0FBSyxzRUFBaUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4RCxDQUFDO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztLQUFBO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdFRrRTtBQUVuRSxNQUFNLHdCQUF3QixHQUFHO0lBQy9CLGVBQWU7SUFDZixZQUFZO0lBQ1osU0FBUztJQUNULE1BQU07SUFDTixRQUFRO0lBQ1IsTUFBTTtJQUNOLFFBQVE7Q0FDQSxDQUFDO0FBRVgsa0VBQWtFO0FBQzNELFNBQVMsdUJBQXVCLENBQUMsUUFBZ0I7SUFDdEQsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNsQyxLQUFLLE1BQU0sTUFBTSxJQUFJLHdCQUF3QixFQUFFLENBQUM7UUFDOUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUFFLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO0FBRS9ELHNGQUFzRjtBQUMvRSxTQUFTLDhCQUE4QixDQUM1QyxRQUFnQjtJQUVoQixNQUFNLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqRCxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNaLE1BQU0sR0FBRyxJQUFJLDRFQUFxQixFQUFFLENBQUM7UUFDckMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsQ2dEO0FBQ1M7QUFJMUQsTUFBTSxpQkFBaUIsR0FBeUM7SUFDOUQsU0FBUyxFQUFFLDRCQUE0QjtJQUN2QyxHQUFHLEVBQUUsaUJBQWlCO0NBQ3ZCLENBQUM7QUFFRixNQUFNLHNCQUFzQixHQUF5QztJQUNuRSxTQUFTLEVBQUUscUNBQXFDO0lBQ2hELEdBQUcsRUFBRSwwQkFBMEI7Q0FDaEMsQ0FBQztBQUVGLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0FBYXZDLFNBQVMsaUJBQWlCLENBQUMsTUFBVzs7SUFDcEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGFBQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxRQUFRLDBDQUFFLElBQUksS0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN4RSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLEdBQUcsS0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNwRCxPQUFPLFlBQVksS0FBSyxLQUFLLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxRQUFnQjtJQUMxQyxNQUFNLFNBQVMsR0FBRztRQUNoQixtQ0FBbUMsUUFBUSxJQUFJO1FBQy9DLG1CQUFtQixRQUFRLG9CQUFvQjtRQUMvQyxtQkFBbUIsUUFBUSxJQUFJO0tBQ2hDLENBQUM7SUFDRixLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUF1QixDQUFDO1FBQ2xFLElBQUksRUFBRTtZQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFFBQWdCO0lBQzVDLE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxRQUFRO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFM0IsTUFBTSxVQUFVLEdBQUc7UUFDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztRQUMxQyxRQUFRLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDO1FBQ3hDLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO1FBQ2hDLFFBQVEsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7UUFDeEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztRQUMxQyxRQUFRLENBQUMsYUFBYTtLQUN2QixDQUFDO0lBRUYsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNuQyxJQUFJLFNBQVMsWUFBWSxXQUFXLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3JFLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVNLFNBQVMsa0JBQWtCLENBQUMsUUFBd0I7O0lBQ3pELE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekMsSUFBSSxDQUFDLEVBQUU7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUV0QixJQUFJLENBQUM7UUFDSCxNQUFNLE9BQU8sR0FBRyxhQUFDLHNEQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQVUsMENBQUUsU0FBUywwQ0FBRSxPQUFPLEtBQUksRUFBRSxDQUFDO1FBQzVFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixJQUFJLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztJQUN2RCxDQUFDO0lBQUMsV0FBTSxDQUFDO1FBQ1Asd0NBQXdDO0lBQzFDLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQUMsV0FBTSxDQUFDO1FBQ1AsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsV0FBbUIsRUFBRSxJQUFhO0lBQzlELE1BQU0sSUFBSSxHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDMUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMvRSxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN2QixDQUFDLEVBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNsRSxDQUFDO0lBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDdkIsQ0FBQyxFQUNELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FDbEUsQ0FBQztJQUNGLE1BQU0sV0FBVyxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEQsT0FBTyxXQUFXLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUNyQyxDQUFDO0FBRUQsbUZBQW1GO0FBQzVFLFNBQVMsd0JBQXdCLENBQUMsT0FHeEM7O0lBQ0MsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsc0RBQVcsRUFBRSxDQUFDLFFBQVEsRUFBUyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLFlBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLDBDQUFFLE9BQU8sS0FBSSxFQUFFLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUNuQyxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNsQyxJQUFJLEVBQUUsS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDO2dCQUFFLE9BQU87WUFDdkQsSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3BDLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEQsTUFBTSxJQUFJLEdBQUcsbUJBQU8sQ0FBQyxjQUFjLHVEQUFJLDBDQUFFLHFCQUFxQixFQUFFLENBQUM7UUFDakUsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FDMUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUMvQixDQUFDO1FBQ0YsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUV6RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNsQixNQUFNLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPO1lBQ2xCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwQyxJQUFJLFFBQVEsR0FBRyxZQUFZLEVBQUUsQ0FBQztnQkFDNUIsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDeEIsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFBQyxXQUFNLENBQUM7UUFDUCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDO0FBRU0sTUFBTSwyQkFBMkI7SUFPdEMsWUFBNkIsT0FBb0M7UUFBcEMsWUFBTyxHQUFQLE9BQU8sQ0FBNkI7UUFOekQsa0JBQWEsR0FBdUIsSUFBSSxDQUFDO1FBQ3pDLHNCQUFpQixHQUF1QixJQUFJLENBQUM7UUFDN0Msc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzFCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxzQkFBaUIsR0FBa0IsSUFBSSxDQUFDO0lBRW9CLENBQUM7SUFFckUsY0FBYztRQUNaLElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7WUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsU0FBUztRQUNQLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUztZQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsc0JBQXNCO1FBQ3BCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzNDLElBQUksTUFBTSxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztZQUFFLE9BQU8sTUFBTSxDQUFDO1FBQ3hELE9BQU8sSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixNQUFNLEdBQUcsR0FBRyx1RUFBWSxDQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN4QyxDQUFDO0lBRU8sdUJBQXVCLENBQUMsSUFBaUI7UUFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FDM0Isb0NBQW9DLENBQ2YsQ0FBQztRQUN4QixPQUFPLFNBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxhQUFhLEtBQUksSUFBSSxDQUFDO0lBQ3pDLENBQUM7SUFFTywwQkFBMEI7UUFDaEMsT0FBTyx3QkFBd0IsQ0FBQztZQUM5QixZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZO1lBQ3ZDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWM7U0FDNUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQixDQUFDLFdBQTBCOztRQUNsRCxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsaUJBQWlCO1lBQUUsT0FBTztRQUNuRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsV0FBVyxDQUFDO1FBQ3JDLGdCQUFJLENBQUMsT0FBTyxFQUFDLGFBQWEsbURBQUcsV0FBVyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFdBQW1COztRQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDckYsT0FBTztRQUNULENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxVQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSwwQ0FBRSxxQkFBcUIsRUFBRSxDQUFDO1FBQ3BFLElBQUksSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztZQUFFLE9BQU87UUFFN0QsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLEdBQUcsNERBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsMENBQUUsT0FBTyxDQUFDO1lBQzlELElBQUksSUFBSSxLQUFLLDhDQUFPLENBQUMsTUFBTTtnQkFBRSxPQUFPO1lBQ3BDLHVFQUF1RTtZQUN2RSx3RUFBd0U7WUFDeEUsK0RBQStEO1lBQy9ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsTUFBTSxDQUFDLGFBQWEsQ0FDbEIsSUFBSSxXQUFXLENBQUMsZ0NBQWdDLEVBQUU7Z0JBQ2hELE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUU7YUFDN0QsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDO1FBQUMsV0FBTSxDQUFDO1lBQ1AseUJBQXlCO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsVUFBdUIsRUFBRSxNQUFtQjtRQUNyRSxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNoRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFckQsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN2QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLElBQUksWUFBWSxHQUF5QixPQUFPLENBQUM7UUFFakQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3BELEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUN6RCxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDN0QsWUFBWSxHQUFHLFVBQVUsQ0FBQztZQUUxQixJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDcEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQTRCO1lBQ3ZDLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztZQUMxQixDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ25CLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUM7WUFDckIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUM7WUFDaEMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7WUFDbEMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO1lBQ2pCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUNsQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7WUFDZixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7WUFDaEIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO1lBQ3JCLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDO1lBQzFDLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQztZQUN0QixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7WUFDakIsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO1lBQzVCLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDO1NBQzNCLENBQUM7UUFFRixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtZQUMvQixVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBdUIsQ0FBQztRQUNqRixJQUFJLE9BQU8sSUFBSSxPQUFPLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDdEM7Z0JBQ0UsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO2dCQUN0QixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO2dCQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztnQkFDZixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7Z0JBQ2hCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQztnQkFDdkIsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUM7YUFDM0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO2dCQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFTyxlQUFlLENBQUMsUUFBcUI7UUFDM0MsTUFBTSxNQUFNLEdBQUcsdUJBQXVCLENBQUM7UUFDdkM7WUFDRSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7WUFDeEIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO1lBQ2pCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUNsQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDWixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7WUFDYixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7WUFDZixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7WUFDaEIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO1lBQ3JCLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQztZQUN6QixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDdEIsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO1NBQzdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtZQUN6QixRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUTthQUNMLGdCQUFnQixDQUNmLDhEQUE4RCxDQUMvRDthQUNBLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxNQUEwQjtRQUNwRCxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDcEI7WUFDRSxVQUFVO1lBQ1YsS0FBSztZQUNMLE1BQU07WUFDTixPQUFPO1lBQ1AsUUFBUTtZQUNSLE9BQU87WUFDUCxRQUFRO1lBQ1IsU0FBUztZQUNULFFBQVE7WUFDUixTQUFTO1lBQ1QsV0FBVztZQUNYLGVBQWU7WUFDZixVQUFVO1lBQ1YsWUFBWTtZQUNaLGdCQUFnQjtTQUNqQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDN0IsQ0FBQztJQUNKLENBQUM7SUFFTyxLQUFLOztRQUNYLE1BQU0sT0FBTyxHQUFHLFVBQUksQ0FBQyxhQUFhLDBDQUFFLE9BQU8sQ0FDekMsc0JBQXNCLENBQ0QsQ0FBQztRQUN4QixJQUFJLE9BQU8sSUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzlDLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLENBQ3hGLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FDM0MsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFFTyxJQUFJOztRQUNWLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0IsMkVBQTJFO1lBQzNFLDZFQUE2RTtZQUM3RSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM3QyxnQkFBSSxDQUFDLE9BQU8sRUFBQyxhQUFhLGtEQUFJLENBQUM7WUFDakMsQ0FBQztZQUNELE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUM7UUFDaEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztRQUNsQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixnQkFBSSxDQUFDLE9BQU8sRUFBQyxhQUFhLGtEQUFJLENBQUM7SUFDakMsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3BaRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXVEOztBQUV2RDtBQUNBLGFBQWEsNEJBQTRCO0FBQ3pDLGFBQWEsNkJBQTZCO0FBQzFDLGFBQWEsbUVBQW1FO0FBQ2hGLGFBQWEsOEJBQThCO0FBQzNDLGFBQWEsK0JBQStCO0FBQzVDLGFBQWEsZ0NBQWdDO0FBQzdDLGFBQWEsZ0NBQWdDO0FBQzdDLGFBQWEsK0JBQStCO0FBQzVDLGFBQWEsZ0NBQWdDO0FBQzdDLGFBQWEsZ0NBQWdDO0FBQzdDO0FBQ0EscUJBQXFCLGlFQUFnQjs7QUFFVTtBQUMvQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUV1RDs7QUFFdkQ7QUFDQSxhQUFhLDhDQUE4QztBQUMzRCxhQUFhLDhCQUE4QjtBQUMzQyxhQUFhLDhCQUE4QjtBQUMzQyxhQUFhLDhCQUE4QjtBQUMzQztBQUNBLG9CQUFvQixpRUFBZ0I7O0FBRVU7QUFDOUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFdUQ7O0FBRXZEO0FBQ0EsYUFBYSw4Q0FBOEM7QUFDM0QsYUFBYSx1Q0FBdUM7QUFDcEQ7QUFDQSxrQkFBa0IsaUVBQWdCOztBQUVVO0FBQzVDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXVEOztBQUV2RCwrQkFBK0Isb0NBQW9DO0FBQ25FLGtCQUFrQixpRUFBZ0I7O0FBRVU7QUFDNUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUV1RDs7QUFFdkQ7QUFDQSxhQUFhLDhCQUE4QjtBQUMzQyxhQUFhLCtEQUErRDtBQUM1RSxhQUFhLG1DQUFtQztBQUNoRDtBQUNBLGlCQUFpQixpRUFBZ0I7O0FBRVU7QUFDM0M7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFdUQ7O0FBRXZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpRUFBZ0I7O0FBRVU7QUFDN0M7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFdUQ7O0FBRXZEO0FBQ0EsaUJBQWlCLDREQUE0RDtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxpRUFBZ0I7O0FBRVU7QUFDeEM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFdUQ7O0FBRXZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLDJDQUEyQztBQUMxRDtBQUNBLGVBQWUsaUVBQWdCOztBQUVVO0FBQ3pDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXVEOztBQUV2RDtBQUNBLGFBQWEsa0NBQWtDO0FBQy9DLGFBQWEsbUNBQW1DO0FBQ2hELGFBQWEsaUNBQWlDO0FBQzlDLGFBQWEsb0NBQW9DO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsaUVBQWdCOztBQUVVO0FBQ3BEOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXVEOztBQUV2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsaUVBQWdCOztBQUVVO0FBQzVDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXVEOztBQUV2RDtBQUNBLGFBQWEsOEJBQThCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGlFQUFnQjs7QUFFVTtBQUN0Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUV1RDs7QUFFdkQ7QUFDQSxhQUFhLDhCQUE4QjtBQUMzQyxhQUFhLDZCQUE2QjtBQUMxQyxlQUFlLDJDQUEyQztBQUMxRCxlQUFlLHlDQUF5QztBQUN4RDtBQUNBLGtCQUFrQixpRUFBZ0I7O0FBRVU7QUFDNUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvZW1iZWRkZWQvQWdyaVBvcHVwL3J1bnRpbWUvd2lkZ2V0LnRzeCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvQWdyaTMvQWdyb193aWRnZXRWNS9zcmMvZW1iZWRkZWQvQWdyaVBvcHVwL3J1bnRpbWUvbWVzc2FnZXMudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2VtYmVkZGVkL3NoYXJlZC9FdmFwb0hpZGRlbkNvbm5lY3RvcnMudHN4Iiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9lbWJlZGRlZC9zaGFyZWQvZXZhcG8tZGF0YS1zb3VyY2UtZW5naW5lLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9lbWJlZGRlZC9zaGFyZWQvZXZhcG8tZW5naW5lLXJlZ2lzdHJ5LnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9BZ3JpMy9BZ3JvX3dpZGdldFY1L3NyYy9lbWJlZGRlZC9zaGFyZWQvZXZhcG8tbGlua2VkLW1hcC1sYXlvdXQudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvY2FsZW5kYXItZGF5cy5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvY2hhcnQtY29sdW1uLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9jaGFydC1saW5lLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9jaGV2cm9uLXVwLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9kb3dubG9hZC5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvZm9sZGVyLW9wZW4ubWpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L2Rpc3QvZXNtL2ljb25zL2luYm94Lm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9tYXAtcGluLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9tb3VzZS1wb2ludGVyLWNsaWNrLm1qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdC9kaXN0L2VzbS9pY29ucy9wYXBlcmNsaXAubWpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L2Rpc3QvZXNtL2ljb25zL3Bpbi5tanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QvZGlzdC9lc20vaWNvbnMvc2V0dGluZ3MtMi5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9seWdvbiBBdHRyaWJ1dGUgSW5zcGVjdG9yIChBZ3JpUG9seWdvbiByZWZhY3Rvcilcbi8vIOKchSBVUERBVEVEOiBzdXBwb3J0cyBNVUxUSVBMRSBzZWxlY3RlZCBGZWF0dXJlIExheWVycyAoZS5nLiB5ZWFybHkgbGF5ZXJzIGZpbHRlcmVkIGJ5IGFub3RoZXIgd2lkZ2V0KVxuXG5pbXBvcnQgR3JhcGhpYyBmcm9tIFwiZXNyaS9HcmFwaGljXCI7XG5pbXBvcnQgRmVhdHVyZUxheWVyIGZyb20gXCJlc3JpL2xheWVycy9GZWF0dXJlTGF5ZXJcIjtcbmltcG9ydCBHcmFwaGljc0xheWVyIGZyb20gXCJlc3JpL2xheWVycy9HcmFwaGljc0xheWVyXCI7XG5pbXBvcnQgUG9pbnQgZnJvbSBcImVzcmkvZ2VvbWV0cnkvUG9pbnRcIjtcbmltcG9ydCBlc3JpUmVxdWVzdCBmcm9tIFwiZXNyaS9yZXF1ZXN0XCI7XG5pbXBvcnQgU2ltcGxlRmlsbFN5bWJvbCBmcm9tIFwiZXNyaS9zeW1ib2xzL1NpbXBsZUZpbGxTeW1ib2xcIjtcbmltcG9ydCBTaW1wbGVMaW5lU3ltYm9sIGZyb20gXCJlc3JpL3N5bWJvbHMvU2ltcGxlTGluZVN5bWJvbFwiO1xuaW1wb3J0IHsgSmltdU1hcFZpZXcsIE1hcFZpZXdNYW5hZ2VyIH0gZnJvbSBcImppbXUtYXJjZ2lzXCI7XG5pbXBvcnQge1xuICBBbGxXaWRnZXRQcm9wcyxcbiAgRGF0YVNvdXJjZU1hbmFnZXIsXG4gIFF1ZXJpYWJsZURhdGFTb3VyY2UsXG4gIFJlYWN0LFxufSBmcm9tIFwiamltdS1jb3JlXCI7XG5pbXBvcnQge1xuICBBbGVydFRyaWFuZ2xlLFxuICBCYXJDaGFydDMsXG4gIENhbGVuZGFyRGF5cyxcbiAgRG93bmxvYWQsXG4gIEZvbGRlck9wZW4sXG4gIEluYm94LFxuICBMaW5lQ2hhcnQsXG4gIE1hcFBpbixcbiAgTW91c2VQb2ludGVyQ2xpY2ssXG4gIFBhcGVyY2xpcCxcbiAgUGluLFxuICBTZXR0aW5nczIsXG4gIFNwcm91dCxcbiAgQ2hldnJvblVwLFxuICBYLFxufSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyBFdmFwb0hpZGRlbkNvbm5lY3RvcnMgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL0V2YXBvSGlkZGVuQ29ubmVjdG9yc1wiO1xuaW1wb3J0IHtcbiAgZ2V0U2VsZWN0ZWREc0lkcyxcbiAgdHlwZSBFdmFwb0RhdGFTb3VyY2VFbmdpbmUsXG59IGZyb20gXCIuLi8uLi9zaGFyZWQvZXZhcG8tZGF0YS1zb3VyY2UtZW5naW5lXCI7XG5pbXBvcnQgeyBFVkFQT19NQVBfVklFV19SRUFEWV9FVkVOVCwgRVZBUE9fTUFQX0NMSUNLX0VWRU5ULCBFVkFQT19YWV9QQUdFX0NMT1NFRF9FVkVOVCwgdHlwZSBFdmFwb01hcENsaWNrRGV0YWlsIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC9ldmFwby1kYXRhLWxheWVyLXJvbGVzXCI7XG5pbXBvcnQgeyBkaXNjb3Zlck1hcFdpZGdldElkSW5BcHAgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL2V2YXBvLWxpbmtlZC1tYXAtbGF5b3V0XCI7XG5pbXBvcnQgeyBnZXRTaGFyZWRFdmFwb0RhdGFTb3VyY2VFbmdpbmUgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL2V2YXBvLWVuZ2luZS1yZWdpc3RyeVwiO1xuaW1wb3J0IHtcbiAgZXZhcG9NYXBDbGlja0RlYnVnLFxuICBldmFwb01hcENsaWNrV2FybixcbiAgbG9nUG9pbnRlclN0YWNrLFxufSBmcm9tIFwiLi4vLi4vc2hhcmVkL2V2YXBvLW1hcC1jbGljay1kZWJ1Z1wiO1xuaW1wb3J0IHtcbiAgY29sbGVjdFF1ZXJ5YWJsZUZpZWxkTGF5ZXJzLFxuICBleHRyYWN0TWFwTGF5ZXJJZEZyb21Ec0lkLFxuICBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5VXJsLFxuICBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5SWQsXG4gIGdldEFsbEZlYXR1cmVMYXllcnNGcm9tTWFwLFxuICBnZXREZXRhY2hlZFF1ZXJ5TGF5ZXJGb3IsXG4gIGdldEV2YXBvTGF5ZXJNYXBLZXksXG4gIGdldFF1ZXJ5YWJsZUxheWVyLFxuICBpc01hcEltYWdlR3JvdXBTdWJsYXllcixcbiAgaXNNYXBJbWFnZU93bmVkTGF5ZXIsXG4gIGlzUXVlcnlhYmxlRmllbGRMYXllcixcbiAgbm9ybWFsaXplUXVlcnlhYmxlTGF5ZXJVcmwsXG4gIHNhZmVMb2FkTWFwTGF5ZXIsXG59IGZyb20gXCIuLi8uLi9zaGFyZWQvZmVhdHVyZS1sYXllci1kYXRhXCI7XG5pbXBvcnQge1xuICBmb3JtYXRBcmNnaXNEYXRlVG9ZbWQsXG4gIHF1ZXJ5VmVnZXRhdGlvblNlcmllc0ZvclVuaXF1ZUlkLFxufSBmcm9tIFwiLi4vLi4vc2hhcmVkL2FncmktdmVnZXRhdGlvbi1kYXRhLXNvdXJjZVwiO1xuaW1wb3J0IHtcbiAgQUdSSV9UQUJMRV9KT0lOX0ZJRUxELFxuICBxdWVyeUFncmlSZWNvcmRCeVVuaXF1ZUlkLFxufSBmcm9tIFwiLi4vLi4vc2hhcmVkL2FncmktdGFibGUtZGF0YS1zb3VyY2VcIjtcbmltcG9ydCB7IGJpbmRNYXN0ZXJGaWx0ZXIgfSBmcm9tIFwiLi4vLi4vLi4vZGF0YS9hZ3JpLWZpbHRlci1idXNcIjtcbmltcG9ydCBBZ3JpQ2hhcnRMb2FkZXIgZnJvbSBcIi4uLy4uLy4uL3NoYXJlZC9BZ3JpQ2hhcnRMb2FkZXJcIjtcbmltcG9ydCB7XG4gIGdldEluaXRpYWxMYW5nLFxuICBnZXRJbml0aWFsVGhlbWUsXG4gIG5vcm1hbGl6ZUxhbmcsXG4gIHQsXG4gIHR5cGUgTGFuZ0NvZGUsXG59IGZyb20gXCIuL21lc3NhZ2VzXCI7XG5cbmNvbnN0IGNvbnNvbGUgPSB7XG4gIGxvZzogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG4gIHdhcm46ICguLi5fYXJnczogYW55W10pID0+IHt9LFxuICBlcnJvcjogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG4gIGluZm86ICguLi5fYXJnczogYW55W10pID0+IHt9LFxuICBkZWJ1ZzogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG59O1xuXG50eXBlIENvbmZpZyA9IHtcbiAgZmllbGRzVG9TaG93Pzogc3RyaW5nW107XG4gIHRpdGxlRmllbGQ/OiBzdHJpbmc7XG4gIGxhYmVscz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHNldHRpbmdzPzoge1xuICAgIHpvb21Ub1NlbGVjdGlvbj86IGJvb2xlYW47IC8vIGRlZmF1bHQgdHJ1ZVxuICAgIHNob3dNYXBQb3B1cD86IGJvb2xlYW47IC8vIGRlZmF1bHQgZmFsc2VcbiAgICBzaG93QXR0YWNobWVudHM/OiBib29sZWFuOyAvLyBkZWZhdWx0IHRydWUgKHdoZW4gdW5kZWZpbmVkKVxuICB9O1xuICBjaGFydEVuYWJsZWQ/OiBib29sZWFuO1xuICBjaGFydFR5cGU/OiBcImJhclwiIHwgXCJsaW5lXCI7XG4gIGNoYXJ0VGl0bGU/OiBzdHJpbmc7XG4gIGNoYXJ0RmllbGRzPzogc3RyaW5nW107XG4gIGNoYXJ0Q29sb3I/OiBzdHJpbmc7XG59O1xuXG50eXBlIEF0dGFjaG1lbnRJdGVtID0ge1xuICBpZDogbnVtYmVyO1xuICBuYW1lPzogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xuICBjb250ZW50VHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nOyAvLyBkaXJlY3QgZG93bmxvYWQgVVJMXG4gIHByZXZpZXdPYmplY3RVcmw/OiBzdHJpbmc7IC8vIGNyZWF0ZWQgdmlhIFVSTC5jcmVhdGVPYmplY3RVUkwgZm9yIDxpbWc+IHByZXZpZXdzXG59O1xuXG5pbnRlcmZhY2UgU3RhdGUge1xuICBjdXJyZW50TGFuZzogTGFuZ0NvZGU7XG4gIGlzRGFya1RoZW1lOiBib29sZWFuO1xuXG4gIGppbXVNYXBWaWV3PzogSmltdU1hcFZpZXcgfCBudWxsO1xuXG4gIC8qKiDinIUgTVVMVEk6IGFsbCByZXNvbHZlZCBsYXllcnMgZnJvbSBzZXR0aW5ncyAqL1xuICBmZWF0dXJlTGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW107XG4gIC8qKiDinIUgTVVMVEk6IG1hcCBjbGlja2VkIGxheWVyID0+IGRzSWQgKGJlc3QtZWZmb3J0KSAqL1xuICBsYXllcktleVRvRHNJZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAvKiog4pyFIE1VTFRJOiBzdG9yZSBEUyBzY2hlbWFzIHBlciBEUyBpZCAqL1xuICBkYXRhU291cmNlc0J5SWQ6IFJlY29yZDxzdHJpbmcsIFF1ZXJpYWJsZURhdGFTb3VyY2U+O1xuXG4gIC8qKiB3aGljaCBsYXllciB3YXMgbGFzdCBjbGlja2VkIChmb3IgYWxpYXNlcy9maWVsZCByZXNvbHZpbmcpICovXG4gIGxhc3RDbGlja2VkRHNJZDogc3RyaW5nIHwgbnVsbDtcbiAgbGFzdENsaWNrZWRMYXllcktleTogc3RyaW5nIHwgbnVsbDtcblxuICBwaW5Ub0Nvcm5lcjogYm9vbGVhbjtcblxuICAvLyBhdHRhY2htZW50cyBVSVxuICBsb2FkaW5nQXR0YWNobWVudHM6IGJvb2xlYW47XG4gIGF0dGFjaG1lbnRzOiBBdHRhY2htZW50SXRlbVtdO1xuICBhdHRhY2htZW50c0V4cGFuZGVkOiBib29sZWFuO1xuXG4gIGxvYWRpbmc6IGJvb2xlYW47XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsO1xuXG4gIHNlbGVjdGVkQXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsO1xuICBzZWxlY3RlZE9JRDogbnVtYmVyIHwgbnVsbDtcbiAgb2JqZWN0SWRGaWVsZDogc3RyaW5nIHwgbnVsbDtcblxuICBzaG93UG9wdXA6IGJvb2xlYW47XG4gIC8qKiBYIGNvbGxhcHNlcyB0aGUgcGFuZWw7IHNlbGVjdGlvbiArIGRhdGEgc3RheSB1bnRpbCByZWFsIGRlc2VsZWN0LiAqL1xuICBwb3B1cE1pbmltaXplZDogYm9vbGVhbjtcbiAgcG9wdXBQb3NpdGlvbjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbDtcbiAgY2xpY2tTY3JlZW5Qb2ludDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbDtcblxuICBkZWJ1Z0luZm86IHtcbiAgICBsYXllckluZm8/OiBhbnk7XG4gICAgaGl0VGVzdFJlc3VsdHM/OiBhbnk7XG4gICAgcXVlcnlSZXN1bHRzPzogYW55O1xuICAgIGZpZWxkTWFwcGluZz86IGFueTtcbiAgICBhdmFpbGFibGVMYXllcnM/OiBhbnk7XG4gIH07XG5cbiAgY2hhcnRFeHBhbmRlZDogYm9vbGVhbjtcbiAgY2hhcnRIb3ZlckluZGV4OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIExhdGVzdC1kYXkgdmVnZXRhdGlvbiBpbmRleCB2YWx1ZXMgKE5EVkkvU0FWSS9SVkkvQ0kvRVZJL05EV0kpIGZvciB0aGVcbiAgLy8gY3VycmVudGx5IHNlbGVjdGVkIHBvbHlnb24sIGZyb20gYWdyaV92ZWdldGF0aW9uX2luZGljZXMuXG4gIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiBib29sZWFuO1xuICBsYXRlc3RJbmRleERhdGU6IHN0cmluZyB8IG51bGw7XG4gIGxhdGVzdEluZGV4VmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IHwgbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWdyaVBvbHlnb24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PFxuICBBbGxXaWRnZXRQcm9wczxDb25maWc+LFxuICBTdGF0ZVxuPiB7XG4gIHByaXZhdGUgX2lzTW91bnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF91bmJpbmRNYXN0ZXJGaWx0ZXI6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRoZW1lT2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2xpY2tIYW5kbGU6IElIYW5kbGVMaWtlIHwgbnVsbCA9IG51bGw7XG4gIC8qKiBNb25vdG9uaWMgaWQgc28gYSBzbG93L2R1cGxpY2F0ZSBjbGljayBwYXRoIGNhbm5vdCBjbG9zZSBhIG5ld2VyIHBvcHVwLiAqL1xuICBwcml2YXRlIF9jbGlja0dlbmVyYXRpb24gPSAwO1xuICBwcml2YXRlIF9wb3B1cFJlZjogUmVhY3QuUmVmT2JqZWN0PEhUTUxEaXZFbGVtZW50PiA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICBwcml2YXRlIF9oaWdobGlnaHRMYXllcjogX19lc3JpLkdyYXBoaWNzTGF5ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfaGlnaGxpZ2h0R3JhcGhpYzogX19lc3JpLkdyYXBoaWMgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfaGlnaGxpZ2h0SGFsb0dyYXBoaWM6IF9fZXNyaS5HcmFwaGljIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2V4dGVudEJlZm9yZVNlbGVjdGlvbjogX19lc3JpLkV4dGVudCB8IG51bGwgPSBudWxsO1xuICAvKiogQ3VycmVudGx5IGluc3BlY3RlZCBmaWVsZCB1bmlxdWVpZCAobWFwIG9yIHRhYmxlIHZpYSBodWIpLiBTYW1lLWlkIG1hcCBjbGljayB0b2dnbGVzIG9mZi4gKi9cbiAgcHJpdmF0ZSBfYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAvKiogTGFzdCB5aWx8dmlsb3lhdHx0dW1hbiBmcm9tIG1hc3RlckZpbHRlckNoYW5nZWQg4oCUIGdlb2dyYXBoeSBtb3ZlIGNsb3NlcyBwb3B1cC4gKi9cbiAgcHJpdmF0ZSBfbGFzdE1hc3Rlckdlb0tleSA9IFwiXCI7XG4gIHByaXZhdGUgX2lzRHJhZ2dpbmdQb3B1cCA9IGZhbHNlO1xuICBwcml2YXRlIF9wb3B1cERyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbiAgcHJpdmF0ZSBfcG9wdXBMYXlvdXRUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcG9wdXBMYXlvdXRSYWYgPSAwO1xuICBwcml2YXRlIG1hcEFyZWFSZXNpemVPYnNlcnZlcjogUmVzaXplT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBfZmVhdHVyZVF1ZXJ5Q2FjaGVUdGxNcyA9IDYwICogNjAgKiAxMDAwO1xuICBwcml2YXRlIF9mZWF0dXJlUXVlcnlDYWNoZSA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIHsgZXhwaXJlczogbnVtYmVyOyB2YWx1ZTogUHJvbWlzZTxfX2VzcmkuR3JhcGhpYyB8IG51bGw+IH1cbiAgPigpO1xuICAvKiogRGV0YWNoZWQgcXVlcnkgY2xpZW50cyBrZXllZCBieSBzZXJ2aWNlIFVSTDsgbmV2ZXIgbXV0YXRlIGxpdmUgbWFwIHN1YmxheWVycy4gKi9cbiAgcHJpdmF0ZSBfcXVlcnlPbmx5TGF5ZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZlYXR1cmVMYXllcj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBkYXRhU291cmNlRW5naW5lOiBFdmFwb0RhdGFTb3VyY2VFbmdpbmU7XG4gIHByaXZhdGUgbWFwVmlld0ZhbGxiYWNrVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbWFwSW5pdFJldHJ5VGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY29ubmVjdGVkTWFwVmlld0lkID0gXCJcIjtcbiAgcHJpdmF0ZSBtYXBJbml0UmV0cnlDb3VudCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWF4TWFwSW5pdFJldHJpZXMgPSAxMjtcbiAgcHJpdmF0ZSBtYXBDbGlja0Jvb3RzdHJhcFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBQT1BVUF9XSURUSCA9IDM0MDtcbiAgcHJpdmF0ZSByZWFkb25seSBQT1BVUF9NQVJHSU4gPSAxMjtcbiAgLyoqIE1hdGNoIGRhc2hib2FyZCBtYXAgb3ZlcmxheXM6IDE2cHggaG9yaXpvbnRhbCBhbmQgMTJweCB2ZXJ0aWNhbCBpbnNldC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBEQVNIQk9BUkRfUE9QVVBfSE9SSVpPTlRBTF9JTlNFVCA9IDE2O1xuICBwcml2YXRlIHJlYWRvbmx5IERBU0hCT0FSRF9QT1BVUF9WRVJUSUNBTF9JTlNFVCA9IDEyO1xuICAvKiogR3VhcmRzIGFnYWluc3QgYSBzdGFsZSBsYXRlc3QtaW5kaWNlcyByZXNwb25zZSBsYW5kaW5nIGFmdGVyIGEgbmV3ZXIgcG9seWdvbiBzZWxlY3Rpb24uICovXG4gIHByaXZhdGUgX2xhdGVzdEluZGljZXNSZXF1ZXN0SWQgPSAwO1xuXG4gIHByaXZhdGUgZ2V0UG9wdXBXaWR0aChcbiAgICB2aWV3PzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3IHwgbnVsbCxcbiAgKTogbnVtYmVyIHtcbiAgICBjb25zdCBtYXJnaW4gPSB0aGlzLlBPUFVQX01BUkdJTjtcbiAgICBsZXQgcHJlZmVycmVkID0gdGhpcy5QT1BVUF9XSURUSDtcblxuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgY29uc3Qgcm9vdCA9XG4gICAgICAgIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFncmktZGFzaGJvYXJkLXYzXCIpIGFzIEhUTUxFbGVtZW50IHwgbnVsbCkgfHxcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgY29uc3QgcmF3ID0gZ2V0Q29tcHV0ZWRTdHlsZShyb290KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZShcIi0tYWdyaS1kYXNoYm9hcmQtcG9wdXAtd2lkdGhcIilcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlci5wYXJzZUZsb2F0KHJhdyk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgJiYgcGFyc2VkID4gMCkge1xuICAgICAgICBwcmVmZXJyZWQgPSBwYXJzZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZpZXcpIHtcbiAgICAgIGNvbnN0IG1hcFcgPSB0aGlzLmdldE1hcEFyZWFSZWN0KHZpZXcpLndpZHRoO1xuICAgICAgcmV0dXJuIE1hdGgubWF4KDIyMCwgTWF0aC5taW4ocHJlZmVycmVkLCBtYXBXIC0gbWFyZ2luICogMikpO1xuICAgIH1cbiAgICByZXR1cm4gcHJlZmVycmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQaW5uZWRQb3B1cEhlaWdodChcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICAgdG9wWTogbnVtYmVyLFxuICApOiBudW1iZXIge1xuICAgIGNvbnN0IHJlY3QgPSB0aGlzLmdldE1hcEFyZWFSZWN0KHZpZXcpO1xuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgY29uc3QgYm90dG9tSW5zZXQgPSB0aGlzLkRBU0hCT0FSRF9QT1BVUF9WRVJUSUNBTF9JTlNFVDtcbiAgICAgIHJldHVybiBNYXRoLm1heCgxNjAsIHJlY3QuYm90dG9tIC0gYm90dG9tSW5zZXQgLSB0b3BZKTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXJnaW4gPSB0aGlzLlBPUFVQX01BUkdJTjtcbiAgICBjb25zdCBtYXBCb3R0b20gPSB0aGlzLmdldEVmZmVjdGl2ZU1hcEJvdHRvbSh2aWV3LCBtYXJnaW4pO1xuICAgIHJldHVybiBNYXRoLm1heCgxNjAsIG1hcEJvdHRvbSAtIHRvcFkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQb3B1cERpbWVuc2lvbnMoXG4gICAgdmlldz86IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyB8IG51bGwsXG4gICAgcGlubmVkID0gZmFsc2UsXG4gICAgcG9zaXRpb24/OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsLFxuICApOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0ge1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5nZXRQb3B1cFdpZHRoKHZpZXcpO1xuICAgIGlmIChwaW5uZWQgJiYgdmlldykge1xuICAgICAgY29uc3QgdG9wWSA9XG4gICAgICAgIHBvc2l0aW9uPy55ID8/IHRoaXMuY2FsY3VsYXRlUGlubmVkUG9zaXRpb24odmlldykueTtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZ2V0UGlubmVkUG9wdXBIZWlnaHQodmlldywgdG9wWSk7XG4gICAgICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH07XG4gICAgfVxuICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQ6IHdpZHRoIH07XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wczogQWxsV2lkZ2V0UHJvcHM8Q29uZmlnPikge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLmRhdGFTb3VyY2VFbmdpbmUgPSBnZXRTaGFyZWRFdmFwb0RhdGFTb3VyY2VFbmdpbmUocHJvcHMuaWQpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGN1cnJlbnRMYW5nOiBnZXRJbml0aWFsTGFuZygpLFxuICAgICAgaXNEYXJrVGhlbWU6IHRoaXMuZ2V0UmVzb2x2ZWRUaGVtZSgpLFxuXG4gICAgICBqaW11TWFwVmlldzogbnVsbCxcblxuICAgICAgZmVhdHVyZUxheWVyczogW10sXG4gICAgICBsYXllcktleVRvRHNJZDoge30sXG4gICAgICBkYXRhU291cmNlc0J5SWQ6IHt9LFxuXG4gICAgICBsYXN0Q2xpY2tlZERzSWQ6IG51bGwsXG4gICAgICBsYXN0Q2xpY2tlZExheWVyS2V5OiBudWxsLFxuXG4gICAgICBwaW5Ub0Nvcm5lcjogdHJ1ZSxcblxuICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IGZhbHNlLFxuXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGVycm9yOiBudWxsLFxuXG4gICAgICBzZWxlY3RlZEF0dHJzOiBudWxsLFxuICAgICAgc2VsZWN0ZWRPSUQ6IG51bGwsXG4gICAgICBvYmplY3RJZEZpZWxkOiBudWxsLFxuXG4gICAgICBzaG93UG9wdXA6IGZhbHNlLFxuICAgICAgcG9wdXBNaW5pbWl6ZWQ6IGZhbHNlLFxuICAgICAgcG9wdXBQb3NpdGlvbjogbnVsbCxcbiAgICAgIGNsaWNrU2NyZWVuUG9pbnQ6IG51bGwsXG5cbiAgICAgIGRlYnVnSW5mbzoge30sXG4gICAgICBjaGFydEV4cGFuZGVkOiBmYWxzZSxcbiAgICAgIGNoYXJ0SG92ZXJJbmRleDogbnVsbCxcblxuICAgICAgbG9hZGluZ0xhdGVzdEluZGljZXM6IGZhbHNlLFxuICAgICAgbGF0ZXN0SW5kZXhEYXRlOiBudWxsLFxuICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVzb2x2ZWRUaGVtZSA9ICgpOiBib29sZWFuID0+IHtcbiAgICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkVGhlbWUgPVxuICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImFncmlfdjExX2FwcF90aGVtZVwiKTtcblxuICAgICAgaWYgKHNhdmVkVGhlbWUgPT09IFwibGlnaHRcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHNhdmVkVGhlbWUgPT09IFwiZGFya1wiKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZSBzdG9yYWdlIGFjY2VzcyBpc3N1ZXNcbiAgICB9XG5cbiAgICBjb25zdCBpc0xpZ2h0ID1cbiAgICAgIHJvb3QuY2xhc3NMaXN0LmNvbnRhaW5zKFwibGlnaHQtdGhlbWVcIikgfHxcbiAgICAgIHJvb3QuZ2V0QXR0cmlidXRlKFwiZGF0YS10aGVtZVwiKSA9PT0gXCJsaWdodFwiIHx8XG4gICAgICBib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImxpZ2h0LXRoZW1lXCIpO1xuXG4gICAgcmV0dXJuIGdldEluaXRpYWxUaGVtZSgpID8/ICFpc0xpZ2h0O1xuICB9O1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgdGhpcy5zZXR1cFRoZW1lT2JzZXJ2ZXIoKTtcbiAgICBjb25zdCBpc0RhcmtUaGVtZSA9IHRoaXMuZ2V0UmVzb2x2ZWRUaGVtZSgpO1xuICAgIGlmIChpc0RhcmtUaGVtZSAhPT0gdGhpcy5zdGF0ZS5pc0RhcmtUaGVtZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lIH0pO1xuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0aGVtZUNoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlVGhlbWVDaGFuZ2UgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImxhbmd1YWdlQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVMYW5ndWFnZUNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLmhhbmRsZU91dHNpZGVDbGljayk7XG4gICAgdGhpcy5fdW5iaW5kTWFzdGVyRmlsdGVyID0gYmluZE1hc3RlckZpbHRlcih0aGlzLmhhbmRsZU1hc3RlckZpbHRlckNoYW5nZWQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcIndpZGdldFNlbGVjdGlvbkNoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlV2lkZ2V0U2VsZWN0aW9uQ2hhbmdlZCBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIEVWQVBPX01BUF9WSUVXX1JFQURZX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVNYXBWaWV3UmVhZHkgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgRVZBUE9fTUFQX0NMSUNLX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVTaGFyZWRNYXBDbGljayBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBFVkFQT19YWV9QQUdFX0NMT1NFRF9FVkVOVCxcbiAgICAgIHRoaXMuaGFuZGxlWHlQYWdlQ2xvc2VkIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICBpZiAoIXRoaXMuaXNEYXNoYm9hcmRFbWJlZGRlZCgpKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnNjaGVkdWxlUG9wdXBMYXlvdXQsIHRydWUpO1xuICAgIH1cbiAgICB0aGlzLnNjaGVkdWxlTWFwVmlld0ZhbGxiYWNrKCk7XG4gICAgdGhpcy5tYXBDbGlja0Jvb3RzdHJhcFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZW5zdXJlTWFwQ2xpY2tBdHRhY2hlZCgpICYmIHRoaXMubWFwQ2xpY2tCb290c3RyYXBUaW1lcikge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMubWFwQ2xpY2tCb290c3RyYXBUaW1lcik7XG4gICAgICAgIHRoaXMubWFwQ2xpY2tCb290c3RyYXBUaW1lciA9IG51bGw7XG4gICAgICB9XG4gICAgfSwgMjUwMCk7XG4gICAgZXZhcG9NYXBDbGlja0RlYnVnKFwiQWdyaVBvbHlnb24gbW91bnRlZFwiLCB7XG4gICAgICB3aWRnZXRJZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgIGVtYmVkZGVkOiB0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSxcbiAgICAgIG1hcFdpZGdldElkOiB0aGlzLmdldExpbmtlZE1hcFdpZGdldElkKCksXG4gICAgICB1c2VEYXRhU291cmNlSWRzOiBnZXRTZWxlY3RlZERzSWRzKHRoaXMucHJvcHMudXNlRGF0YVNvdXJjZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2hvd1BvcHVwKSB7XG4gICAgICB0aGlzLmJyb2FkY2FzdFBvcHVwVmlzaWJpbGl0eShmYWxzZSk7XG4gICAgfVxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcInRoZW1lQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVUaGVtZUNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwibGFuZ3VhZ2VDaGFuZ2VkXCIsXG4gICAgICB0aGlzLmhhbmRsZUxhbmd1YWdlQ2hhbmdlIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICB0aGlzLmRldGFjaE1hcENsaWNrKCk7XG4gICAgdGhpcy5jbGVhbnVwSGlnaGxpZ2h0KCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLmhhbmRsZU91dHNpZGVDbGljayk7XG4gICAgdGhpcy5fdW5iaW5kTWFzdGVyRmlsdGVyPy4oKTtcbiAgICB0aGlzLl91bmJpbmRNYXN0ZXJGaWx0ZXIgPSBudWxsO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcIndpZGdldFNlbGVjdGlvbkNoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlV2lkZ2V0U2VsZWN0aW9uQ2hhbmdlZCBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0KTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIEVWQVBPX01BUF9WSUVXX1JFQURZX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVNYXBWaWV3UmVhZHkgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgRVZBUE9fTUFQX0NMSUNLX0VWRU5ULFxuICAgICAgdGhpcy5oYW5kbGVTaGFyZWRNYXBDbGljayBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBFVkFQT19YWV9QQUdFX0NMT1NFRF9FVkVOVCxcbiAgICAgIHRoaXMuaGFuZGxlWHlQYWdlQ2xvc2VkIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICBpZiAodGhpcy5tYXBWaWV3RmFsbGJhY2tUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMubWFwVmlld0ZhbGxiYWNrVGltZXIpO1xuICAgIGlmICh0aGlzLm1hcEluaXRSZXRyeVRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5tYXBJbml0UmV0cnlUaW1lcik7XG4gICAgaWYgKHRoaXMubWFwQ2xpY2tCb290c3RyYXBUaW1lcikgY2xlYXJJbnRlcnZhbCh0aGlzLm1hcENsaWNrQm9vdHN0cmFwVGltZXIpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dCwgdHJ1ZSk7XG4gICAgaWYgKHRoaXMuX3BvcHVwTGF5b3V0VGltZXIpIGNsZWFyVGltZW91dCh0aGlzLl9wb3B1cExheW91dFRpbWVyKTtcbiAgICBpZiAodGhpcy5fcG9wdXBMYXlvdXRSYWYpIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3BvcHVwTGF5b3V0UmFmKTtcbiAgICB0aGlzLm1hcEFyZWFSZXNpemVPYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMubWFwQXJlYVJlc2l6ZU9ic2VydmVyID0gbnVsbDtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uUG9wdXBEcmFnTW92ZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMub25Qb3B1cERyYWdFbmQpO1xuICAgIGlmICh0aGlzLnRoZW1lT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMudGhlbWVPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICB0aGlzLnRoZW1lT2JzZXJ2ZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnJldm9rZUFsbEF0dGFjaG1lbnRVcmxzKCk7XG4gICAgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUuY2xlYXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgcHJ1bmVGZWF0dXJlUXVlcnlDYWNoZShub3cgPSBEYXRlLm5vdygpKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUpIHtcbiAgICAgIGlmIChlbnRyeS5leHBpcmVzIDw9IG5vdykgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUuZGVsZXRlKGtleSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZWF0dXJlUXVlcnlDYWNoZUtleShcbiAgICBsYXllcjogX19lc3JpLkZlYXR1cmVMYXllcixcbiAgICBvaWRGaWVsZDogc3RyaW5nLFxuICAgIG9pZDogdW5rbm93bixcbiAgICBvdXRGaWVsZHM6IHN0cmluZ1tdLFxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IGxheWVyS2V5ID0gU3RyaW5nKChsYXllciBhcyBhbnkpPy51cmwgfHwgbGF5ZXIuaWQgfHwgbGF5ZXIudGl0bGUgfHwgXCJcIik7XG4gICAgY29uc3QgZmllbGRzS2V5ID0gQXJyYXkuZnJvbShuZXcgU2V0KG91dEZpZWxkcy5tYXAoKGYpID0+IFN0cmluZyhmKSkpKVxuICAgICAgLnNvcnQoKVxuICAgICAgLmpvaW4oXCIsXCIpO1xuICAgIHJldHVybiBgJHtsYXllcktleX18JHtvaWRGaWVsZH18JHtTdHJpbmcob2lkKX18JHtmaWVsZHNLZXl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBPZmYtbWFwIEZlYXR1cmVMYXllciBjbGllbnQgZm9yIGEgbGl2ZSBtYXAgbGF5ZXIncyBVUkwuIEV2ZXJ5IHF1ZXJ5IGluXG4gICAqIHRoZSBjbGljayBjaGFpbiBtdXN0IHJ1biBhZ2FpbnN0IHRoZXNlIGRldGFjaGVkIGNsaWVudHM6IGNyZWF0ZVF1ZXJ5IC9cbiAgICogcXVlcnlGZWF0dXJlcyBvbiBhIGxpdmUgTWFwSW1hZ2UgU3VibGF5ZXIgcmVoeWRyYXRlcyBpdCBhbmQgY2FuIGNsZWFyIGl0c1xuICAgKiBydW50aW1lIGRlZmluaXRpb25FeHByZXNzaW9uLCB3aGljaCBtYWtlcyB0aGUgbWFwIGV4cG9ydCAoYW5kIGJyaWVmbHlcbiAgICogcGFpbnQpIGV2ZXJ5IGRpc3RyaWN0J3MgZmllbGRzIHVudGlsIHRoZSBmaWx0ZXIgZ3VhcmQgcmVzdG9yZXMgaXQuXG4gICAqXG4gICAqIFNoYXJlZCBoZWxwZXIgYWxzbyBza2lwcyBNYXBTZXJ2ZXIgcm9vdHMgYW5kIEdyb3VwIExheWVyIGZvbGRlcnNcbiAgICogKFwiQWdyaSAyMDI2IHJlcHVibGljIGRhdGFcIikgdGhhdCBGZWF0dXJlTGF5ZXIgY2Fubm90IGxvYWQuXG4gICAqL1xuICBwcml2YXRlIGdldERldGFjaGVkUXVlcnlMYXllciA9IGFzeW5jIChcbiAgICBsYXllcjogYW55LFxuICApOiBQcm9taXNlPF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBudWxsPiA9PiB7XG4gICAgaWYgKCFsYXllciB8fCBpc01hcEltYWdlR3JvdXBTdWJsYXllcihsYXllcikpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGRldGFjaGVkID0gYXdhaXQgZ2V0RGV0YWNoZWRRdWVyeUxheWVyRm9yKGxheWVyKTtcbiAgICBpZiAoIWRldGFjaGVkKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB1cmwgPSBTdHJpbmcobGF5ZXI/LnVybCB8fCBcIlwiKS50cmltKCkucmVwbGFjZSgvXFwvKyQvLCBcIlwiKTtcbiAgICBpZiAodXJsKSB0aGlzLl9xdWVyeU9ubHlMYXllcnMuc2V0KHVybCwgZGV0YWNoZWQpO1xuICAgIHJldHVybiBkZXRhY2hlZCBhcyB1bmtub3duIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gIH07XG5cbiAgLyoqIFNuYXBzaG90IHRoZSBsaXZlIGRlZmluaXRpb25FeHByZXNzaW9uIG9mIGVhY2ggbGF5ZXIgKHByZS1oaXRUZXN0KS4gKi9cbiAgcHJpdmF0ZSBzbmFwc2hvdERlZmluaXRpb25FeHByZXNzaW9ucyhcbiAgICBsYXllcnM6IEFycmF5PF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBhbnk+LFxuICApOiBNYXA8YW55LCBzdHJpbmc+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgIGlmICghbGF5ZXIgfHwgc25hcHNob3QuaGFzKGxheWVyKSkgY29udGludWU7XG4gICAgICB0cnkge1xuICAgICAgICBzbmFwc2hvdC5zZXQobGF5ZXIsIFN0cmluZygobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiA/PyBcIlwiKSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLyogaWdub3JlICovXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzbmFwc2hvdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIGFueSBkZWZpbml0aW9uRXhwcmVzc2lvbiB0aGF0IGRyaWZ0ZWQgKHdhcyBjbGVhcmVkIGJ5IGhpdFRlc3QgL1xuICAgKiBpZGVudGlmeSAvIGxvYWQgcmVoeWRyYXRpb24pIHN5bmNocm9ub3VzbHksIGJlZm9yZSB0aGUgdW5maWx0ZXJlZFxuICAgKiBNYXBJbWFnZSBleHBvcnQgY2FuIGJlIHBhaW50ZWQuXG4gICAqL1xuICBwcml2YXRlIHJlc3RvcmVEcmlmdGVkRGVmaW5pdGlvbkV4cHJlc3Npb25zKFxuICAgIHNuYXBzaG90OiBNYXA8YW55LCBzdHJpbmc+LFxuICApOiB2b2lkIHtcbiAgICBzbmFwc2hvdC5mb3JFYWNoKChleHByZXNzaW9uLCBsYXllcikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IFN0cmluZygobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiA/PyBcIlwiKTtcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IGV4cHJlc3Npb24pIHtcbiAgICAgICAgICAobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG4gICAgICAgICAgZXZhcG9NYXBDbGlja1dhcm4oXCJkZWZpbml0aW9uRXhwcmVzc2lvbiBkcmlmdCByZXN0b3JlZFwiLCB7XG4gICAgICAgICAgICBsYXllcjogbGF5ZXI/LnRpdGxlIHx8IGxheWVyPy51cmwgfHwgbGF5ZXI/LmlkLFxuICAgICAgICAgICAgZHJpZnRlZDogY3VycmVudCB8fCBcIjxlbXB0eT5cIixcbiAgICAgICAgICAgIHJlc3RvcmVkOiBleHByZXNzaW9uIHx8IFwiPGVtcHR5PlwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLyogaWdub3JlICovXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHF1ZXJ5RmVhdHVyZUJ5T2JqZWN0SWRDYWNoZWQoXG4gICAgbGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIsXG4gICAgb2lkRmllbGQ6IHN0cmluZyxcbiAgICBvaWQ6IHVua25vd24sXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSxcbiAgKTogUHJvbWlzZTxfX2VzcmkuR3JhcGhpYyB8IG51bGw+IHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMucHJ1bmVGZWF0dXJlUXVlcnlDYWNoZShub3cpO1xuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0RmVhdHVyZVF1ZXJ5Q2FjaGVLZXkobGF5ZXIsIG9pZEZpZWxkLCBvaWQsIG91dEZpZWxkcyk7XG4gICAgY29uc3QgaGl0ID0gdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKGhpdCAmJiBoaXQuZXhwaXJlcyA+IG5vdykge1xuICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwiZmVhdHVyZS1xdWVyeTpjYWNoZS1oaXRcIiwge1xuICAgICAgICBsYXllcjogbGF5ZXIudGl0bGUgfHwgbGF5ZXIudXJsIHx8IGxheWVyLmlkLFxuICAgICAgICBvaWRGaWVsZCxcbiAgICAgICAgb2lkLFxuICAgICAgICBvdXRGaWVsZENvdW50OiBvdXRGaWVsZHMubGVuZ3RoLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gaGl0LnZhbHVlO1xuICAgIH1cblxuICAgIGNvbnN0IGpvYiA9IChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBsaXZlRGVmaW5pdGlvbkV4cHJlc3Npb24gPSBTdHJpbmcoXG4gICAgICAgIChsYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uIHx8IFwiXCIsXG4gICAgICApO1xuXG4gICAgICAvLyBDYWxsaW5nIHF1ZXJ5RmVhdHVyZXMgb24gYSBsaXZlIE1hcEltYWdlIHN1YmxheWVyIGNhbiByZWh5ZHJhdGUgdGhhdFxuICAgICAgLy8gc3VibGF5ZXIgYW5kIHRlbXBvcmFyaWx5IGNsZWFyIGl0cyBydW50aW1lIGRlZmluaXRpb25FeHByZXNzaW9uLiBUaGVcbiAgICAgIC8vIG1hcCB0aGVuIHJlbmRlcnMgZXZlcnkgZGlzdHJpY3QgdW50aWwgTG9jYWxpemF0aW9uJ3MgZ3VhcmQgcmVzdG9yZXNcbiAgICAgIC8vIHRoZSBmaWx0ZXIuIFF1ZXJ5IGFuIG9mZi1tYXAgRmVhdHVyZUxheWVyIGNsaWVudCBpbnN0ZWFkLlxuICAgICAgY29uc3QgZGV0YWNoZWRRdWVyeUxheWVyID0gYXdhaXQgdGhpcy5nZXREZXRhY2hlZFF1ZXJ5TGF5ZXIobGF5ZXIpO1xuICAgICAgY29uc3QgcXVlcnlMYXllcjogX19lc3JpLkZlYXR1cmVMYXllciA9IGRldGFjaGVkUXVlcnlMYXllciB8fCBsYXllcjtcblxuICAgICAgY29uc3QgcSA9IHF1ZXJ5TGF5ZXIuY3JlYXRlUXVlcnkoKTtcbiAgICAgIHEud2hlcmUgPSBgJHtvaWRGaWVsZH0gPSAke051bWJlcihvaWQpfWA7XG4gICAgICBxLm91dEZpZWxkcyA9IG91dEZpZWxkcztcbiAgICAgIHEucmV0dXJuR2VvbWV0cnkgPSB0cnVlO1xuICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwiZmVhdHVyZS1xdWVyeTpyZXF1ZXN0XCIsIHtcbiAgICAgICAgbGF5ZXI6IGxheWVyLnRpdGxlIHx8IGxheWVyLnVybCB8fCBsYXllci5pZCxcbiAgICAgICAgdXJsOiBsYXllci51cmwgfHwgbnVsbCxcbiAgICAgICAgd2hlcmU6IHEud2hlcmUsXG4gICAgICAgIG91dEZpZWxkcyxcbiAgICAgICAgcmV0dXJuR2VvbWV0cnk6IHRydWUsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHF1ZXJ5TGF5ZXIucXVlcnlGZWF0dXJlcyhxKTtcbiAgICAgIC8vIERlZmVuc2l2ZSByZXN0b3JlIGZvciB0aGUgbm8tVVJMIGZhbGxiYWNrLiBUaGUgZGV0YWNoZWQgcGF0aCBhYm92ZVxuICAgICAgLy8gbmV2ZXIgdG91Y2hlcyB0aGUgbGl2ZSBsYXllci5cbiAgICAgIGlmIChcbiAgICAgICAgcXVlcnlMYXllciA9PT0gbGF5ZXIgJiZcbiAgICAgICAgU3RyaW5nKChsYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uIHx8IFwiXCIpICE9PVxuICAgICAgICAgIGxpdmVEZWZpbml0aW9uRXhwcmVzc2lvblxuICAgICAgKSB7XG4gICAgICAgIChsYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uID0gbGl2ZURlZmluaXRpb25FeHByZXNzaW9uO1xuICAgICAgfVxuICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwiZmVhdHVyZS1xdWVyeTpyZXNwb25zZVwiLCB7XG4gICAgICAgIGxheWVyOiBsYXllci50aXRsZSB8fCBsYXllci51cmwgfHwgbGF5ZXIuaWQsXG4gICAgICAgIGZlYXR1cmVDb3VudDogcmVzLmZlYXR1cmVzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgaGFzR2VvbWV0cnk6IEJvb2xlYW4ocmVzLmZlYXR1cmVzPy5bMF0/Lmdlb21ldHJ5KSxcbiAgICAgICAgYXR0cmlidXRlS2V5czogT2JqZWN0LmtleXMocmVzLmZlYXR1cmVzPy5bMF0/LmF0dHJpYnV0ZXMgfHwge30pLFxuICAgICAgICBxdWVyeU1vZGU6IHF1ZXJ5TGF5ZXIgPT09IGxheWVyID8gXCJsaXZlLWZhbGxiYWNrXCIgOiBcImRldGFjaGVkXCIsXG4gICAgICAgIGxpdmVEZWZpbml0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgICAobGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiB8fCBudWxsLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzLmZlYXR1cmVzPy5bMF0gfHwgbnVsbDtcbiAgICB9KSgpO1xuXG4gICAgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGUuc2V0KGtleSwge1xuICAgICAgZXhwaXJlczogbm93ICsgdGhpcy5fZmVhdHVyZVF1ZXJ5Q2FjaGVUdGxNcyxcbiAgICAgIHZhbHVlOiBqb2IsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmVhdHVyZSA9IGF3YWl0IGpvYjtcbiAgICAgIGlmICghZmVhdHVyZSAmJiB0aGlzLl9mZWF0dXJlUXVlcnlDYWNoZS5nZXQoa2V5KT8udmFsdWUgPT09IGpvYikge1xuICAgICAgICB0aGlzLl9mZWF0dXJlUXVlcnlDYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmZWF0dXJlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlLmdldChrZXkpPy52YWx1ZSA9PT0gam9iKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVRdWVyeUNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIHRyID0gKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlcj4sXG4gICk6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIHQodGhpcy5zdGF0ZS5jdXJyZW50TGFuZywga2V5LCBwYXJhbXMpO1xuICB9O1xuXG4gIHByaXZhdGUgc2V0dXBUaGVtZU9ic2VydmVyID0gKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdGhpcy50aGVtZU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgY29uc3QgaXNEYXJrVGhlbWUgPSB0aGlzLmdldFJlc29sdmVkVGhlbWUoKTtcbiAgICAgIGlmICh0aGlzLl9pc01vdW50ZWQgJiYgaXNEYXJrVGhlbWUgIT09IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy50aGVtZU9ic2VydmVyLm9ic2VydmUocm9vdCwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wiY2xhc3NcIiwgXCJkYXRhLXRoZW1lXCJdLFxuICAgIH0pO1xuXG4gICAgdGhpcy50aGVtZU9ic2VydmVyLm9ic2VydmUoYm9keSwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wiY2xhc3NcIl0sXG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVUaGVtZUNoYW5nZSA9IChlOiBhbnkpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IGRldGFpbCA9IGU/LmRldGFpbCB8fCB7fTtcbiAgICBsZXQgaXNEYXJrVGhlbWUgPSB0aGlzLmdldFJlc29sdmVkVGhlbWUoKTtcblxuICAgIGlmICh0eXBlb2YgZGV0YWlsLmlzRGFya1RoZW1lID09PSBcImJvb2xlYW5cIikge1xuICAgICAgaXNEYXJrVGhlbWUgPSBkZXRhaWwuaXNEYXJrVGhlbWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGV0YWlsLnRoZW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpc0RhcmtUaGVtZSA9IFN0cmluZyhkZXRhaWwudGhlbWUpLnRvTG93ZXJDYXNlKCkgIT09IFwibGlnaHRcIjtcbiAgICB9XG5cbiAgICBpZiAoaXNEYXJrVGhlbWUgIT09IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0RhcmtUaGVtZSB9KTtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVMYW5ndWFnZUNoYW5nZSA9IChlOiBhbnkpOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IGxhbmcgPSBlPy5kZXRhaWw/LmxhbmcgfHwgZT8uZGV0YWlsPy5sYW5ndWFnZSB8fCBlPy5kZXRhaWw/LmNvZGU7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUxhbmcobGFuZyk7XG4gICAgaWYgKG5vcm1hbGl6ZWQgIT09IHRoaXMuc3RhdGUuY3VycmVudExhbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXJyZW50TGFuZzogbm9ybWFsaXplZCB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyogLS0tIHBpbm5lZCBwb3B1cCBoZWxwZXJzIC0tLSAqL1xuICBwcml2YXRlIGlzRGFzaGJvYXJkRW1iZWRkZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLnByb3BzLmlkIHx8IFwiXCIpLmVuZHNXaXRoKFwiLXBvcHVwXCIpO1xuICB9XG5cbiAgLyoqIENyb3Agb3ZlcmxheSB0b3AgaW4gdmlld3BvcnQgY29vcmRzOyBudWxsIHdoZW4gbm90IHVzZWQuICovXG4gIHByaXZhdGUgZ2V0Q3JvcE92ZXJsYXlUb3AoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBjcm9wRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIuYWdyaS1kYXNoYm9hcmQtY3JvcC1vdmVybGF5LmFncmktZGFzaGJvYXJkLW1hbmFnZWQtY3JvcFwiLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChjcm9wRWwpIHtcbiAgICAgIGNvbnN0IHJlY3QgPSBjcm9wRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAocmVjdC5oZWlnaHQgPiAwICYmIE51bWJlci5pc0Zpbml0ZShyZWN0LnRvcCkpIHtcbiAgICAgICAgcmV0dXJuIHJlY3QudG9wO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNYXBBcmVhUmVjdChcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICk6IERPTVJlY3Qge1xuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgY29uc3QgbWFwU2xvdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIFwiLmFncmktZGFzaGJvYXJkLW1hcC1zbG90XCIsXG4gICAgICApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgIGlmIChtYXBTbG90KSB7XG4gICAgICAgIGNvbnN0IHNsb3RSZWN0ID0gbWFwU2xvdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKHNsb3RSZWN0LndpZHRoID4gNDAgJiYgc2xvdFJlY3QuaGVpZ2h0ID4gNDApIHtcbiAgICAgICAgICByZXR1cm4gc2xvdFJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICh2aWV3LmNvbnRhaW5lciBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICBwcml2YXRlIG9ic2VydmVNYXBBcmVhUmVzaXplKFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLm1hcEFyZWFSZXNpemVPYnNlcnZlciA9IG51bGw7XG5cbiAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKVxuICAgICAgPyAoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgXCIuYWdyaS1kYXNoYm9hcmQtbWFwLXNsb3RcIixcbiAgICAgICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGwpIHx8ICh2aWV3LmNvbnRhaW5lciBhcyBIVE1MRWxlbWVudCB8IG51bGwpKVxuICAgICAgOiAodmlldy5jb250YWluZXIgYXMgSFRNTEVsZW1lbnQgfCBudWxsKTtcbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuO1xuXG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0KCk7XG4gICAgfSk7XG4gICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFZmZlY3RpdmVNYXBCb3R0b20oXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICAgIGdhcCA9IDQsXG4gICk6IG51bWJlciB7XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuZ2V0TWFwQXJlYVJlY3Qodmlldyk7XG4gICAgY29uc3QgY3JvcFRvcCA9IHRoaXMuZ2V0Q3JvcE92ZXJsYXlUb3AoKTtcbiAgICBpZiAoY3JvcFRvcCAhPSBudWxsICYmIGNyb3BUb3AgPiByZWN0LnRvcCAmJiBjcm9wVG9wIDw9IHJlY3QuYm90dG9tICsgMikge1xuICAgICAgcmV0dXJuIGNyb3BUb3AgLSBnYXA7XG4gICAgfVxuICAgIHJldHVybiByZWN0LmJvdHRvbSAtIGdhcDtcbiAgfVxuXG4gIHByaXZhdGUgbWVhc3VyZVBvcHVwSGVpZ2h0KHBvcHVwRWw6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICBjb25zdCBoZWFkZXIgPSBwb3B1cEVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5hZ3JpMy1wb3B1cC1oZWFkZXJcIixcbiAgICApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBjb25zdCBjb250ZW50ID0gcG9wdXBFbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIuYWdyaTMtcG9wdXAtY29udGVudFwiLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGNvbnN0IGhlYWRlckggPSBoZWFkZXI/Lm9mZnNldEhlaWdodCB8fCAwO1xuICAgIGNvbnN0IGNvbnRlbnRIID0gY29udGVudD8uc2Nyb2xsSGVpZ2h0IHx8IGNvbnRlbnQ/Lm9mZnNldEhlaWdodCB8fCAwO1xuICAgIGNvbnN0IG5hdHVyYWwgPSBoZWFkZXJIICsgY29udGVudEg7XG4gICAgaWYgKG5hdHVyYWwgPiAwKSByZXR1cm4gTWF0aC5jZWlsKG5hdHVyYWwpO1xuXG4gICAgY29uc3QgcmVjdCA9IHBvcHVwRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHJlY3QuaGVpZ2h0ID4gMCA/IE1hdGguY2VpbChyZWN0LmhlaWdodCkgOiBNYXRoLmNlaWwocG9wdXBFbC5zY3JvbGxIZWlnaHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBwb3B1cFBvc2l0aW9uc0VxdWFsKFxuICAgIGE6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgYjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9LFxuICAgIGVwc2lsb24gPSAxLFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoIWEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gKFxuICAgICAgTWF0aC5hYnMoYS54IC0gYi54KSA8PSBlcHNpbG9uICYmIE1hdGguYWJzKGEueSAtIGIueSkgPD0gZXBzaWxvblxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFwcGx5UG9wdXBQb3NpdGlvbiA9IChwb3M6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSk6IHZvaWQgPT4ge1xuICAgIGlmICh0aGlzLnBvcHVwUG9zaXRpb25zRXF1YWwodGhpcy5zdGF0ZS5wb3B1cFBvc2l0aW9uLCBwb3MpKSByZXR1cm47XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBvcHVwUG9zaXRpb246IHBvcyB9KTtcbiAgfTtcblxuICBwcml2YXRlIHNjaGVkdWxlUG9wdXBMYXlvdXQgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuX2lzRHJhZ2dpbmdQb3B1cCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLl9wb3B1cExheW91dFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5fcG9wdXBMYXlvdXRUaW1lcik7XG4gICAgdGhpcy5fcG9wdXBMYXlvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fcG9wdXBMYXlvdXRUaW1lciA9IG51bGw7XG4gICAgICB0aGlzLnJlcG9zaXRpb25QaW5uZWRJZk5lZWRlZCgpO1xuICAgIH0sIDQ4KTtcbiAgfTtcblxuICBwcml2YXRlIHNjaGVkdWxlUG9wdXBMYXlvdXRBZnRlckNvbnRlbnQgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuX3BvcHVwTGF5b3V0UmFmKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9wb3B1cExheW91dFJhZik7XG4gICAgdGhpcy5fcG9wdXBMYXlvdXRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy5fcG9wdXBMYXlvdXRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9wb3B1cExheW91dFJhZiA9IDA7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvblBpbm5lZElmTmVlZGVkKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBwcml2YXRlIGNhbGN1bGF0ZVBpbm5lZFBvc2l0aW9uID0gKFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0+IHtcbiAgICBjb25zdCByZWN0ID0gdGhpcy5nZXRNYXBBcmVhUmVjdCh2aWV3KTtcbiAgICBjb25zdCBtYXJnaW4gPSB0aGlzLlBPUFVQX01BUkdJTjtcbiAgICBjb25zdCBwb3B1cFdpZHRoID0gdGhpcy5nZXRQb3B1cFdpZHRoKHZpZXcpO1xuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogcmVjdC5yaWdodCAtIHBvcHVwV2lkdGggLSB0aGlzLkRBU0hCT0FSRF9QT1BVUF9IT1JJWk9OVEFMX0lOU0VULFxuICAgICAgICB5OiByZWN0LnRvcCArIHRoaXMuREFTSEJPQVJEX1BPUFVQX1ZFUlRJQ0FMX0lOU0VULFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogcmVjdC5yaWdodCAtIHBvcHVwV2lkdGggLSBtYXJnaW4sXG4gICAgICB5OiByZWN0LnRvcCArIG1hcmdpbixcbiAgICB9O1xuICB9O1xuXG4gIHByaXZhdGUgcmVwb3NpdGlvblBpbm5lZElmTmVlZGVkID0gKCkgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLl9pc0RyYWdnaW5nUG9wdXApIHJldHVybjtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldztcbiAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgIGlmICh0aGlzLnN0YXRlLnBpblRvQ29ybmVyKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbGN1bGF0ZVBpbm5lZFBvc2l0aW9uKHZpZXcpO1xuICAgICAgaWYgKHRoaXMucG9wdXBQb3NpdGlvbnNFcXVhbCh0aGlzLnN0YXRlLnBvcHVwUG9zaXRpb24sIHBvcykpIHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBvcHVwUG9zaXRpb246IHBvcyB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUucG9wdXBQb3NpdGlvbikgcmV0dXJuO1xuICAgIGNvbnN0IGNsYW1wZWQgPSB0aGlzLmNsYW1wUG9wdXBUb01hcENvbnRhaW5lcihcbiAgICAgIHRoaXMuc3RhdGUucG9wdXBQb3NpdGlvbixcbiAgICAgIHZpZXcsXG4gICAgKTtcbiAgICB0aGlzLmFwcGx5UG9wdXBQb3NpdGlvbihjbGFtcGVkKTtcbiAgfTtcblxuICBwcml2YXRlIHRvZ2dsZVBpblRvQ29ybmVyID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAocHJldikgPT4ge1xuICAgICAgICBjb25zdCBuZXh0ID0gIXByZXYucGluVG9Db3JuZXI7XG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuXG4gICAgICAgIGxldCBwb3MgPSBwcmV2LnBvcHVwUG9zaXRpb247XG5cbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICBpZiAodmlldykgcG9zID0gdGhpcy5jYWxjdWxhdGVQaW5uZWRQb3NpdGlvbih2aWV3KTtcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3ICYmIHByZXYuY2xpY2tTY3JlZW5Qb2ludCkge1xuICAgICAgICAgIHBvcyA9IHRoaXMuY2FsY3VsYXRlUG9wdXBQb3NpdGlvbihwcmV2LmNsaWNrU2NyZWVuUG9pbnQsIHZpZXcpO1xuICAgICAgICB9IGVsc2UgaWYgKHZpZXcpIHtcbiAgICAgICAgICBjb25zdCByZWN0ID0gKHZpZXcuY29udGFpbmVyIGFzIEhUTUxFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICB4OiByZWN0LmxlZnQgKyByZWN0LndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHBpblRvQ29ybmVyOiBuZXh0LFxuICAgICAgICAgIHBvcHVwUG9zaXRpb246IHBvcyxcbiAgICAgICAgICBjaGFydEV4cGFuZGVkOiBuZXh0ID8gdHJ1ZSA6IHByZXYuY2hhcnRFeHBhbmRlZCxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dEFmdGVyQ29udGVudCgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93UG9wdXApIHtcbiAgICAgICAgICB0aGlzLmJyb2FkY2FzdFBvcHVwVmlzaWJpbGl0eSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlT3V0c2lkZUNsaWNrID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCAhdGhpcy5fcG9wdXBSZWYuY3VycmVudCkgcmV0dXJuO1xuICAgIC8vIENvbGxhcHNlZCBjaGlwIHN0YXlzIHVudGlsIGFuIGVtcHR5LW1hcCBkZXNlbGVjdCAvIGdlb2dyYXBoeSByZXNldC5cbiAgICBpZiAodGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIE5vZGUgfCBudWxsO1xuICAgIGlmICghdGFyZ2V0IHx8IHRoaXMuX3BvcHVwUmVmLmN1cnJlbnQuY29udGFpbnModGFyZ2V0KSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbWFwQ29udGFpbmVyID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldz8uY29udGFpbmVyO1xuICAgIGlmIChtYXBDb250YWluZXIgJiYgbWFwQ29udGFpbmVyLmNvbnRhaW5zKHRhcmdldCkpIHJldHVybjtcblxuICAgIGlmICh0aGlzLmlzRGFzaGJvYXJkRW1iZWRkZWQoKSkge1xuICAgICAgY29uc3QgZGFzaGJvYXJkVWkgPSAodGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0Py4oXG4gICAgICAgIFwiLmFncmktZGFzaGJvYXJkLXYzLCAuYWdyaS1kYXNoYm9hcmQtY3JvcC1vdmVybGF5LCAuYWdyaS1kYXNoYm9hcmQtaGVhZGVyLCAuYWdyaS1kYXNoYm9hcmQtbGVmdC1wYW5lbCwgLmFncmktZGFzaGJvYXJkLWJvdHRvbS1yb3csIC5hZ3JpLWRhc2hib2FyZC13aWRnZXQtc2xvdCwgLmFncmktZGFzaGJvYXJkLWluZGljYXRvci1vdmVybGF5LCAuYWdyaS1kYXNoYm9hcmQtZGF0ZS1pbmRleC1vdmVybGF5LCAuYWdyaS12MjAtZmxvYXRpbmctb3ZlcmxheVwiLFxuICAgICAgKTtcbiAgICAgIGlmIChkYXNoYm9hcmRVaSkgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE91dHNpZGUgZGFzaGJvYXJkIGNocm9tZSDihpIgY29sbGFwc2UgaW5zdGVhZCBvZiB3aXBpbmcgc2VsZWN0aW9uLlxuICAgIHRoaXMubWluaW1pemVQb3B1cCgpO1xuICB9O1xuXG4gIHByaXZhdGUgb25Qb3B1cEhlYWRlck1vdXNlRG93biA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PikgPT4ge1xuICAgIC8vIEFsbG93IG5vcm1hbCBiZWhhdmlvciBmb3IgY29udHJvbHMgaW5zaWRlIGhlYWRlci5cbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBpZiAodGFyZ2V0Py5jbG9zZXN0KFwiYnV0dG9uLCBhLCBpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdFwiKSkgcmV0dXJuO1xuICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9wdXBFbCA9IHRoaXMuX3BvcHVwUmVmLmN1cnJlbnQ7XG4gICAgaWYgKCFwb3B1cEVsKSByZXR1cm47XG5cbiAgICBjb25zdCByZWN0ID0gcG9wdXBFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0aGlzLl9pc0RyYWdnaW5nUG9wdXAgPSB0cnVlO1xuICAgIHRoaXMuX3BvcHVwRHJhZ09mZnNldCA9IHtcbiAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5waW5Ub0Nvcm5lcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBpblRvQ29ybmVyOiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uUG9wdXBEcmFnTW92ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMub25Qb3B1cERyYWdFbmQpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfTtcblxuICBwcml2YXRlIG9uUG9wdXBEcmFnTW92ZSA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLl9pc0RyYWdnaW5nUG9wdXAgfHwgIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuICAgIGlmICghdmlldykgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV4dFBvcyA9IHtcbiAgICAgIHg6IGUuY2xpZW50WCAtIHRoaXMuX3BvcHVwRHJhZ09mZnNldC54LFxuICAgICAgeTogZS5jbGllbnRZIC0gdGhpcy5fcG9wdXBEcmFnT2Zmc2V0LnksXG4gICAgfTtcbiAgICBjb25zdCBjbGFtcGVkID0gdGhpcy5jbGFtcFBvcHVwVG9NYXBDb250YWluZXIobmV4dFBvcywgdmlldyk7XG4gICAgdGhpcy5hcHBseVBvcHVwUG9zaXRpb24oY2xhbXBlZCk7XG4gIH07XG5cbiAgcHJpdmF0ZSBvblBvcHVwRHJhZ0VuZCA9ICgpID0+IHtcbiAgICB0aGlzLl9pc0RyYWdnaW5nUG9wdXAgPSBmYWxzZTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uUG9wdXBEcmFnTW92ZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMub25Qb3B1cERyYWdFbmQpO1xuICB9O1xuICAvKiog4pyFIE5FVzogc2FmZWx5IGRldGVjdCB3aGV0aGVyIHRoaXMgbGF5ZXIgc3VwcG9ydHMgYXR0YWNobWVudHMgKi9cbiAgcHJpdmF0ZSBsYXllclN1cHBvcnRzQXR0YWNobWVudHMoXG4gICAgbGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBGZWF0dXJlTGF5ZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoIWxheWVyKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEaWZmZXJlbnQgSlNBUEkvRUIgYnVpbGRzIGV4cG9zZSBpdCBzbGlnaHRseSBkaWZmZXJlbnRseVxuICAgIGNvbnN0IGFueUxheWVyOiBhbnkgPSBsYXllciBhcyBhbnk7XG5cbiAgICAvLyBDb21tb24gc2lnbmFsc1xuICAgIGlmICh0eXBlb2YgYW55TGF5ZXIuc3VwcG9ydHNBdHRhY2htZW50cyA9PT0gXCJib29sZWFuXCIpXG4gICAgICByZXR1cm4gYW55TGF5ZXIuc3VwcG9ydHNBdHRhY2htZW50cztcblxuICAgIGNvbnN0IGNhcCA9IGFueUxheWVyLmNhcGFiaWxpdGllcztcbiAgICBjb25zdCBzdXBwb3J0ZWQgPVxuICAgICAgY2FwPy5kYXRhPy5zdXBwb3J0c0F0dGFjaG1lbnRzID8/XG4gICAgICBjYXA/LmRhdGE/LnN1cHBvcnRzQXR0YWNobWVudCA/P1xuICAgICAgY2FwPy5vcGVyYXRpb25zPy5zdXBwb3J0c0F0dGFjaG1lbnRzID8/XG4gICAgICBjYXA/Lm9wZXJhdGlvbnM/LnN1cHBvcnRzQXR0YWNobWVudDtcblxuICAgIGlmICh0eXBlb2Ygc3VwcG9ydGVkID09PSBcImJvb2xlYW5cIikgcmV0dXJuIHN1cHBvcnRlZDtcblxuICAgIC8vIFVua25vd24gPT4gYXNzdW1lIGZhbHNlIHRvIGF2b2lkIHVnbHkgd2FybmluZ1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gSGlnaGxpZ2h0IG1hbmFnZW1lbnQgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgc2V0dXBIaWdobGlnaHRMYXllciA9ICh2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcpID0+IHtcbiAgICBpZiAoIXRoaXMuX2hpZ2hsaWdodExheWVyKSB7XG4gICAgICB0aGlzLl9oaWdobGlnaHRMYXllciA9IG5ldyBHcmFwaGljc0xheWVyKHtcbiAgICAgICAgaWQ6IFwiYWdyaS1wb2x5Z29uLWhpZ2hsaWdodFwiLFxuICAgICAgICB0aXRsZTogXCJTZWxlY3RlZCBQb2x5Z29uIEhpZ2hsaWdodFwiLFxuICAgICAgfSk7XG4gICAgICB2aWV3Lm1hcC5hZGQodGhpcy5faGlnaGxpZ2h0TGF5ZXIpO1xuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIGhpZ2hsaWdodFBvbHlnb24gPSAoZ2VvbWV0cnk6IF9fZXNyaS5HZW9tZXRyeSkgPT4ge1xuICAgIGlmICghdGhpcy5faGlnaGxpZ2h0TGF5ZXIgfHwgIWdlb21ldHJ5KSByZXR1cm47XG4gICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuXG4gICAgLy8gRHJvcCBHcmFmZi90YWJsZSBzZWxlY3Rpb24gZ3JhcGhpY3Mgc28gb25seSBvbmUgb3V0bGluZSBpcyB2aXNpYmxlLlxuICAgIHRyeSB7XG4gICAgICB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3Py5ncmFwaGljcz8ucmVtb3ZlQWxsPy4oKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGlnbm9yZSAqL1xuICAgIH1cblxuICAgIC8vIFdpZGUgdHJhbnNsdWNlbnQgaGFsbyBwbHVzIGEgYnJpZ2h0IGN5YW4gY29yZSBrZWVwcyB0aGUgc2VsZWN0ZWQgZmllbGRcbiAgICAvLyB2aXNpYmxlIG92ZXIgYm90aCBsaWdodCBhbmQgZGFyayBzYXRlbGxpdGUgaW1hZ2VyeS5cbiAgICBjb25zdCBoYWxvU3ltYm9sID0gbmV3IFNpbXBsZUZpbGxTeW1ib2woe1xuICAgICAgY29sb3I6IFswLCAwLCAwLCAwXSxcbiAgICAgIG91dGxpbmU6IG5ldyBTaW1wbGVMaW5lU3ltYm9sKHtcbiAgICAgICAgY29sb3I6IFswLCAyMjksIDI1NSwgMC4zMl0sXG4gICAgICAgIHdpZHRoOiA5LFxuICAgICAgICBzdHlsZTogXCJzb2xpZFwiLFxuICAgICAgfSksXG4gICAgfSk7XG4gICAgY29uc3QgaGlnaGxpZ2h0U3ltYm9sID0gbmV3IFNpbXBsZUZpbGxTeW1ib2woe1xuICAgICAgY29sb3I6IFswLCAwLCAwLCAwXSxcbiAgICAgIG91dGxpbmU6IG5ldyBTaW1wbGVMaW5lU3ltYm9sKHtcbiAgICAgICAgY29sb3I6IFsxMjgsIDI0NSwgMjU1LCAxXSxcbiAgICAgICAgd2lkdGg6IDMsXG4gICAgICAgIHN0eWxlOiBcInNvbGlkXCIsXG4gICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuX2hpZ2hsaWdodEhhbG9HcmFwaGljID0gbmV3IEdyYXBoaWMoeyBnZW9tZXRyeSwgc3ltYm9sOiBoYWxvU3ltYm9sIH0pO1xuICAgIHRoaXMuX2hpZ2hsaWdodEdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7IGdlb21ldHJ5LCBzeW1ib2w6IGhpZ2hsaWdodFN5bWJvbCB9KTtcbiAgICB0aGlzLl9oaWdobGlnaHRMYXllci5hZGRNYW55KFtcbiAgICAgIHRoaXMuX2hpZ2hsaWdodEhhbG9HcmFwaGljLFxuICAgICAgdGhpcy5faGlnaGxpZ2h0R3JhcGhpYyxcbiAgICBdKTtcbiAgfTtcblxuICBwcml2YXRlIGNsZWFySGlnaGxpZ2h0ID0gKCkgPT4ge1xuICAgIGlmICghdGhpcy5faGlnaGxpZ2h0TGF5ZXIpIHJldHVybjtcbiAgICBpZiAodGhpcy5faGlnaGxpZ2h0SGFsb0dyYXBoaWMpIHtcbiAgICAgIHRoaXMuX2hpZ2hsaWdodExheWVyLnJlbW92ZSh0aGlzLl9oaWdobGlnaHRIYWxvR3JhcGhpYyk7XG4gICAgICB0aGlzLl9oaWdobGlnaHRIYWxvR3JhcGhpYyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9oaWdobGlnaHRHcmFwaGljKSB7XG4gICAgICB0aGlzLl9oaWdobGlnaHRMYXllci5yZW1vdmUodGhpcy5faGlnaGxpZ2h0R3JhcGhpYyk7XG4gICAgICB0aGlzLl9oaWdobGlnaHRHcmFwaGljID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSByZXN0b3JlRXh0ZW50QmVmb3JlU2VsZWN0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuICAgIGNvbnN0IHNhdmVkRXh0ZW50ID0gdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uO1xuICAgIHRoaXMuX2V4dGVudEJlZm9yZVNlbGVjdGlvbiA9IG51bGw7XG4gICAgY29uc3Qgem9vbVRvID0gdGhpcy5wcm9wcy5jb25maWc/LnNldHRpbmdzPy56b29tVG9TZWxlY3Rpb24gIT09IGZhbHNlO1xuICAgIGlmICghem9vbVRvIHx8ICFzYXZlZEV4dGVudCB8fCAhdmlldykgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICB2b2lkIHZpZXcuZ29UbyhzYXZlZEV4dGVudCwgeyBkdXJhdGlvbjogNDAwIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgY2xlYW51cEhpZ2hsaWdodCA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5faGlnaGxpZ2h0TGF5ZXIpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3O1xuICAgICAgaWYgKHZpZXcgJiYgdmlldy5tYXApIHtcbiAgICAgICAgdmlldy5tYXAucmVtb3ZlKHRoaXMuX2hpZ2hsaWdodExheWVyKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2hpZ2hsaWdodExheWVyID0gbnVsbDtcbiAgICAgIHRoaXMuX2hpZ2hsaWdodEdyYXBoaWMgPSBudWxsO1xuICAgICAgdGhpcy5faGlnaGxpZ2h0SGFsb0dyYXBoaWMgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gPSBudWxsO1xuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gTWFwIHdpcmluZyAtLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgcHJpdmF0ZSBnZXRMaW5rZWRNYXBXaWRnZXRJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBpZHMgPSB0aGlzLnByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnk7XG4gICAgY29uc3QgbGlzdCA9IGlkcz8ubGVuZ3RoXG4gICAgICA/IGlkcy5hc011dGFibGU/LigpIHx8IGlkcy50b0FycmF5Py4oKSB8fCBpZHNcbiAgICAgIDogW107XG4gICAgY29uc3QgZmlyc3QgPSBBcnJheS5pc0FycmF5KGxpc3QpID8gbGlzdFswXSA6IG51bGw7XG4gICAgaWYgKGZpcnN0KSByZXR1cm4gU3RyaW5nKGZpcnN0KTtcbiAgICBjb25zdCBob3N0SWQgPSBTdHJpbmcodGhpcy5wcm9wcy5pZCB8fCBcIlwiKS5yZXBsYWNlKC8tcG9wdXAkLywgXCJcIik7XG4gICAgcmV0dXJuIGRpc2NvdmVyTWFwV2lkZ2V0SWRJbkFwcCh7XG4gICAgICBob3N0V2lkZ2V0SWQ6IGhvc3RJZCxcbiAgICAgIGdldFNsb3RFbGVtZW50OiAoKSA9PiB7XG4gICAgICAgIGlmIChob3N0SWQpIHtcbiAgICAgICAgICBjb25zdCBzY29wZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgYC53aWRnZXQtcmVuZGVyZXJbZGF0YS13aWRnZXRpZD1cIiR7aG9zdElkfVwiXSAuYWdyaS1kYXNoYm9hcmQtbWFwLXNsb3RgLFxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKHNjb3BlZCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSByZXR1cm4gc2NvcGVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hZ3JpLWRhc2hib2FyZC1tYXAtc2xvdFwiKTtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgPyBmYWxsYmFjayA6IG51bGw7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNYXBWaWV3RnJvbU1hbmFnZXIoXG4gICAgbWFwV2lkZ2V0SWQ6IHN0cmluZyB8IG51bGwsXG4gICk6IEppbXVNYXBWaWV3IHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hbmFnZXIgPSBNYXBWaWV3TWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgICAgaWYgKCFtYW5hZ2VyKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmIChtYXBXaWRnZXRJZCkge1xuICAgICAgICBjb25zdCBncm91cCA9IG1hbmFnZXIuZ2V0SmltdU1hcFZpZXdHcm91cChtYXBXaWRnZXRJZCk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdyb3VwPy5nZXRBY3RpdmVKaW11TWFwVmlldz8uKCk7XG4gICAgICAgIGlmIChhY3RpdmU/LnZpZXcpIHJldHVybiBhY3RpdmU7XG4gICAgICAgIGNvbnN0IGdyb3VwVmlld3MgPSBncm91cD8uZ2V0QWxsSmltdU1hcFZpZXdzPy4oKSB8fCBbXTtcbiAgICAgICAgY29uc3QgZmlyc3RMb2FkZWQgPSBncm91cFZpZXdzLmZpbmQoKHZpZXc6IGFueSkgPT4gdmlldz8udmlldyk7XG4gICAgICAgIGlmIChmaXJzdExvYWRlZCkgcmV0dXJuIGZpcnN0TG9hZGVkO1xuICAgICAgfVxuICAgICAgY29uc3QgYWxsID0gbWFuYWdlci5nZXRBbGxKaW11TWFwVmlld3M/LigpIHx8IFtdO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgYWxsLmZpbmQoKHZpZXc6IGFueSkgPT4gdmlldz8udmlldyAmJiB2aWV3Py5pc0FjdGl2ZSAhPT0gZmFsc2UpIHx8XG4gICAgICAgIGFsbC5maW5kKCh2aWV3OiBhbnkpID0+IHZpZXc/LnZpZXcpIHx8XG4gICAgICAgIG51bGxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZU1hcFZpZXdSZWFkeSA9IChldmVudDogRXZlbnQpOiB2b2lkID0+IHtcbiAgICBjb25zdCBtYXBXaWRnZXRJZCA9IChldmVudCBhcyBDdXN0b21FdmVudDx7IG1hcFdpZGdldElkPzogc3RyaW5nIH0+KS5kZXRhaWxcbiAgICAgID8ubWFwV2lkZ2V0SWQ7XG4gICAgY29uc3QgbGlua2VkID0gdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpO1xuICAgIGlmIChtYXBXaWRnZXRJZCAmJiBsaW5rZWQgJiYgbWFwV2lkZ2V0SWQgIT09IGxpbmtlZCkgcmV0dXJuO1xuICAgIHRoaXMuc2NoZWR1bGVNYXBWaWV3RmFsbGJhY2soKTtcbiAgfTtcblxuICBwcml2YXRlIHNjaGVkdWxlTWFwVmlld0ZhbGxiYWNrID0gKCk6IHZvaWQgPT4ge1xuICAgIC8vIEFscmVhZHkgaGF2ZSBhIGxpdmUgbWFwIHZpZXcg4oCUIGRvIE5PVCByZS1lbnRlciBvbkFjdGl2ZVZpZXdDaGFuZ2VcbiAgICAvLyAodGhhdCBwYXRoIHNldFN0YXRlIOKGkiBpbml0aWFsaXplTWFwQ29ubmVjdGlvbiDihpIgc2NoZWR1bGVNYXBWaWV3RmFsbGJhY2tcbiAgICAvLyBhbmQgZnJlZXplcyB0aGUgYnVpbGRlciB3aXRoIFJlYWN0ICMxODUgd2hlbiBmZWF0dXJlTGF5ZXJzIHN0YXkgZW1wdHkpLlxuICAgIGlmICh0aGlzLnN0YXRlLmppbXVNYXBWaWV3Py52aWV3KSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuZmVhdHVyZUxheWVycz8ubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVNYXBJbml0UmV0cnkodGhpcy5zdGF0ZS5qaW11TWFwVmlldyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1hcFdpZGdldElkID0gdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpO1xuICAgIGNvbnN0IGZyb21NYW5hZ2VyID0gdGhpcy5nZXRNYXBWaWV3RnJvbU1hbmFnZXIobWFwV2lkZ2V0SWQpO1xuICAgIGlmIChmcm9tTWFuYWdlcj8udmlldykge1xuICAgICAgdGhpcy5vbkFjdGl2ZVZpZXdDaGFuZ2UoZnJvbU1hbmFnZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIW1hcFdpZGdldElkKSByZXR1cm47XG4gICAgaWYgKHRoaXMubWFwVmlld0ZhbGxiYWNrVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyKTtcbiAgICB0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1hcFZpZXdGYWxsYmFja1RpbWVyID0gbnVsbDtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgICBpZiAodGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldykgcmV0dXJuO1xuICAgICAgY29uc3QgbGF0ZSA9IHRoaXMuZ2V0TWFwVmlld0Zyb21NYW5hZ2VyKG1hcFdpZGdldElkKTtcbiAgICAgIGlmIChsYXRlPy52aWV3KSB0aGlzLm9uQWN0aXZlVmlld0NoYW5nZShsYXRlKTtcbiAgICB9LCA2MDApO1xuICB9O1xuXG4gIHByaXZhdGUgc2NoZWR1bGVNYXBJbml0UmV0cnkgPSAoam12OiBKaW11TWFwVmlldyk6IHZvaWQgPT4ge1xuICAgIGlmICh0aGlzLm1hcEluaXRSZXRyeUNvdW50ID49IHRoaXMubWF4TWFwSW5pdFJldHJpZXMpIHJldHVybjtcbiAgICBpZiAodGhpcy5tYXBJbml0UmV0cnlUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMubWFwSW5pdFJldHJ5VGltZXIpO1xuICAgIHRoaXMubWFwSW5pdFJldHJ5Q291bnQgKz0gMTtcbiAgICB0aGlzLm1hcEluaXRSZXRyeVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1hcEluaXRSZXRyeVRpbWVyID0gbnVsbDtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgICB2b2lkIHRoaXMuaW5pdGlhbGl6ZU1hcENvbm5lY3Rpb24oam12KTtcbiAgICB9LCA4MDApO1xuICB9O1xuXG4gIHByaXZhdGUgZXhwYW5kVXNlRGF0YVNvdXJjZUVudHJpZXModXNlTGlzdDogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgZHNNZ3IgPSBEYXRhU291cmNlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IG91dDogYW55W10gPSBbXTtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICBmb3IgKGNvbnN0IHVkcyBvZiB1c2VMaXN0KSB7XG4gICAgICBjb25zdCBpZCA9IFN0cmluZyh1ZHM/LmRhdGFTb3VyY2VJZCB8fCBcIlwiKTtcbiAgICAgIGlmICghaWQgfHwgc2Vlbi5oYXMoaWQpKSBjb250aW51ZTtcbiAgICAgIHNlZW4uYWRkKGlkKTtcbiAgICAgIG91dC5wdXNoKHVkcyk7XG5cbiAgICAgIGNvbnN0IGRzID0gZHNNZ3IuZ2V0RGF0YVNvdXJjZShpZCkgYXMgYW55O1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBkcz8uZ2V0Q2hpbGREYXRhU291cmNlcz8uKCkgfHwgW107XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkSWQgPSBTdHJpbmcoY2hpbGQ/LmlkIHx8IFwiXCIpO1xuICAgICAgICBpZiAoIWNoaWxkSWQgfHwgc2Vlbi5oYXMoY2hpbGRJZCkpIGNvbnRpbnVlO1xuICAgICAgICBzZWVuLmFkZChjaGlsZElkKTtcbiAgICAgICAgb3V0LnB1c2goeyBkYXRhU291cmNlSWQ6IGNoaWxkSWQsIG1haW5EYXRhU291cmNlSWQ6IGlkIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBwcml2YXRlIGFkZFJlc29sdmVkTGF5ZXIgPSAoXG4gICAgdGFyZ2V0OiBfX2VzcmkuRmVhdHVyZUxheWVyW10sXG4gICAgbGF5ZXJLZXlUb0RzSWQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gICAgc2VlbjogU2V0PHN0cmluZz4sXG4gICAgbGF5ZXI6IGFueSxcbiAgICBkc0lkPzogc3RyaW5nLFxuICApOiB2b2lkID0+IHtcbiAgICBjb25zdCBxdWVyeWFibGUgPSBnZXRRdWVyeWFibGVMYXllcihsYXllcikgfHwgbGF5ZXI7XG4gICAgaWYgKCFpc1F1ZXJ5YWJsZUZpZWxkTGF5ZXIocXVlcnlhYmxlKSkgcmV0dXJuO1xuICAgIGNvbnN0IGtleSA9XG4gICAgICBnZXRFdmFwb0xheWVyTWFwS2V5KHF1ZXJ5YWJsZSkgfHxcbiAgICAgIFN0cmluZyhxdWVyeWFibGUudXJsIHx8IHF1ZXJ5YWJsZS5pZCB8fCBcIlwiKTtcbiAgICBpZiAoIWtleSB8fCBzZWVuLmhhcyhrZXkpKSByZXR1cm47XG4gICAgc2Vlbi5hZGQoa2V5KTtcbiAgICB0YXJnZXQucHVzaChxdWVyeWFibGUgYXMgX19lc3JpLkZlYXR1cmVMYXllcik7XG4gICAgaWYgKGRzSWQpIGxheWVyS2V5VG9Ec0lkW2tleV0gPSBkc0lkO1xuICB9O1xuXG4gIHByaXZhdGUgY29sbGVjdExheWVyc0Zyb21EYXRhU291cmNlcyA9IChcbiAgICBqbXY6IEppbXVNYXBWaWV3LFxuICAgIHVzZUxpc3Q6IGFueVtdLFxuICApOiB7XG4gICAgbGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW107XG4gICAgbGF5ZXJLZXlUb0RzSWQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIH0gPT4ge1xuICAgIGNvbnN0IGxheWVyczogX19lc3JpLkZlYXR1cmVMYXllcltdID0gW107XG4gICAgY29uc3QgbGF5ZXJLZXlUb0RzSWQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgbWFwID0gam12Py52aWV3Py5tYXA7XG5cbiAgICBmb3IgKGNvbnN0IHVkcyBvZiB1c2VMaXN0KSB7XG4gICAgICBjb25zdCBkc0lkID0gU3RyaW5nKHVkcz8uZGF0YVNvdXJjZUlkIHx8IFwiXCIpO1xuICAgICAgaWYgKCFkc0lkKSBjb250aW51ZTtcblxuICAgICAgY29uc3QgY2FjaGVkRHMgPSB0aGlzLnN0YXRlLmRhdGFTb3VyY2VzQnlJZD8uW2RzSWRdIGFzIGFueTtcbiAgICAgIGlmIChjYWNoZWREcykge1xuICAgICAgICBjb25zdCBjYWNoZWRMYXllciA9XG4gICAgICAgICAgY2FjaGVkRHMubGF5ZXIgfHxcbiAgICAgICAgICAodHlwZW9mIGNhY2hlZERzLmdldExheWVyID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gY2FjaGVkRHMuZ2V0TGF5ZXIoKVxuICAgICAgICAgICAgOiBudWxsKTtcbiAgICAgICAgY29uc3QgbGl2ZSA9IHRoaXMudG9MaXZlTWFwTGF5ZXIoY2FjaGVkTGF5ZXIsIG1hcCk7XG4gICAgICAgIGlmIChsaXZlKSB0aGlzLmFkZFJlc29sdmVkTGF5ZXIobGF5ZXJzLCBsYXllcktleVRvRHNJZCwgc2VlbiwgbGl2ZSwgZHNJZCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRzTWdyID0gRGF0YVNvdXJjZU1hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICAgIGNvbnN0IGRzID0gZHNNZ3IuZ2V0RGF0YVNvdXJjZShkc0lkKSBhcyBhbnk7XG4gICAgICBpZiAoZHMpIHtcbiAgICAgICAgY29uc3QgZHNMYXllciA9XG4gICAgICAgICAgKHR5cGVvZiBkcy5nZXRMYXllciA9PT0gXCJmdW5jdGlvblwiID8gZHMuZ2V0TGF5ZXIoKSA6IG51bGwpIHx8XG4gICAgICAgICAgZHMubGF5ZXI7XG4gICAgICAgIGNvbnN0IGxpdmUgPSB0aGlzLnRvTGl2ZU1hcExheWVyKFxuICAgICAgICAgIGdldFF1ZXJ5YWJsZUxheWVyKGRzTGF5ZXIpIHx8IGRzTGF5ZXIsXG4gICAgICAgICAgbWFwLFxuICAgICAgICApO1xuICAgICAgICBpZiAobGl2ZSkgdGhpcy5hZGRSZXNvbHZlZExheWVyKGxheWVycywgbGF5ZXJLZXlUb0RzSWQsIHNlZW4sIGxpdmUsIGRzSWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGxheWVycywgbGF5ZXJLZXlUb0RzSWQgfTtcbiAgfTtcblxuICBvbkFjdGl2ZVZpZXdDaGFuZ2UgPSAoamltdU1hcFZpZXc6IEppbXVNYXBWaWV3KSA9PiB7XG4gICAgdGhpcy5kZXRhY2hNYXBDbGljaygpO1xuICAgIHRoaXMuY2xlYW51cEhpZ2hsaWdodCgpO1xuXG4gICAgaWYgKCFqaW11TWFwVmlldykge1xuICAgICAgdGhpcy5tYXBBcmVhUmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMubWFwQXJlYVJlc2l6ZU9ic2VydmVyID0gbnVsbDtcbiAgICAgIHRoaXMuY29ubmVjdGVkTWFwVmlld0lkID0gXCJcIjtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBqaW11TWFwVmlldzogbnVsbCxcbiAgICAgICAgZmVhdHVyZUxheWVyczogW10sXG4gICAgICAgIG9iamVjdElkRmllbGQ6IG51bGwsXG4gICAgICAgIGVycm9yOiB0aGlzLnRyKFwiZXJyb3Iubm9NYXBWaWV3XCIpLFxuICAgICAgICBkZWJ1Z0luZm86IHtcbiAgICAgICAgICAuLi50aGlzLnN0YXRlLmRlYnVnSW5mbyxcbiAgICAgICAgICBsYXllckluZm86IHRoaXMudHIoXCJlcnJvci5ub01hcFZpZXdcIiksXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVWaWV3ID0gamltdU1hcFZpZXcudmlldztcbiAgICBpZiAoYWN0aXZlVmlldykge1xuICAgICAgdGhpcy5vYnNlcnZlTWFwQXJlYVJlc2l6ZShhY3RpdmVWaWV3KTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3SWQgPSBTdHJpbmcoXG4gICAgICAoamltdU1hcFZpZXcgYXMgYW55KS5pZCB8fCAoamltdU1hcFZpZXcgYXMgYW55KS5tYXBXaWRnZXRJZCB8fCBcIlwiLFxuICAgICk7XG4gICAgLy8gU2FtZSBtYXAgYWxyZWFkeSB3aXJlZCDigJQgZG8gbm90IHNldFN0YXRlIGFnYWluIChjYXVzZXMgZnJlZXplIGxvb3BzKS5cbiAgICBpZiAodmlld0lkICYmIHZpZXdJZCA9PT0gdGhpcy5jb25uZWN0ZWRNYXBWaWV3SWQgJiYgdGhpcy5zdGF0ZS5qaW11TWFwVmlldykge1xuICAgICAgaWYgKCF0aGlzLl9jbGlja0hhbmRsZSkgdGhpcy5hdHRhY2hNYXBDbGljayhqaW11TWFwVmlldyk7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuZmVhdHVyZUxheWVycz8ubGVuZ3RoKSB7XG4gICAgICAgIHZvaWQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbihqaW11TWFwVmlldyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY29ubmVjdGVkTWFwVmlld0lkID0gdmlld0lkO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGppbXVNYXBWaWV3IH0sIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlldy52aWV3O1xuICAgICAgaWYgKCF2aWV3KSByZXR1cm47XG5cbiAgICAgIC8vIEF0dGFjaCBpbW1lZGlhdGVseSBzbyB0aGUgZmlyc3QgZmllbGQgY2xpY2sgbmV2ZXIgcmFjZXMgbGF5ZXIgcmVzb2x2ZS5cbiAgICAgIHRoaXMuYXR0YWNoTWFwQ2xpY2soamltdU1hcFZpZXcpO1xuXG4gICAgICBpZiAodmlldy5yZWFkeSkge1xuICAgICAgICB0aGlzLnNldHVwSGlnaGxpZ2h0TGF5ZXIodmlldyk7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdGlhbGl6ZU1hcENvbm5lY3Rpb24oamltdU1hcFZpZXcpO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb25QaW5uZWRJZk5lZWRlZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaCA9IHZpZXcud2F0Y2goXCJyZWFkeVwiLCBhc3luYyAocmVhZHkpID0+IHtcbiAgICAgICAgICBpZiAocmVhZHkpIHtcbiAgICAgICAgICAgIGgucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaE1hcENsaWNrKGppbXVNYXBWaWV3KTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBIaWdobGlnaHRMYXllcih2aWV3KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaW5pdGlhbGl6ZU1hcENvbm5lY3Rpb24oamltdU1hcFZpZXcpO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uUGlubmVkSWZOZWVkZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU1hcENvbm5lY3Rpb24gPSBhc3luYyAoam12OiBKaW11TWFwVmlldykgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgY29uc3QgdmlldyA9IGptdj8udmlldztcbiAgICBpZiAoIXZpZXcgfHwgIXZpZXcubWFwKSByZXR1cm47XG5cbiAgICBjb25zdCByYXdMaXN0ID0gKHRoaXMucHJvcHMudXNlRGF0YVNvdXJjZXM/LmFzTXV0YWJsZT8uKCkgYXMgYW55W10pIHx8IFtdO1xuICAgIGNvbnN0IHVzZUxpc3QgPSB0aGlzLmV4cGFuZFVzZURhdGFTb3VyY2VFbnRyaWVzKHJhd0xpc3QpO1xuICAgIC8vIEVtcHR5IHVzZURhdGFTb3VyY2VzIGlzIG5vcm1hbCByaWdodCBhZnRlciBkcm9wIOKAlCByZXNvbHZlIG1hcCBsYXllcnMgb25seS5cbiAgICAvLyBOZXZlciBib3VuY2UgdGhyb3VnaCBzY2hlZHVsZU1hcFZpZXdGYWxsYmFjayBoZXJlICh0aGF0IHJlLWVudGVyZWRcbiAgICAvLyBvbkFjdGl2ZVZpZXdDaGFuZ2UgYW5kIGZyb3plIHRoZSBwYWdlKS5cblxuICAgIHRoaXMuZGF0YVNvdXJjZUVuZ2luZS5zeW5jU2VsZWN0aW9uKGdldFNlbGVjdGVkRHNJZHModGhpcy5wcm9wcy51c2VEYXRhU291cmNlcykpO1xuXG4gICAgY29uc3QgcmVzb2x2ZWRMYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGxheWVyS2V5VG9Ec0lkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gICAgY29uc3QgbWFwTGF5ZXJzID0gZ2V0QWxsRmVhdHVyZUxheWVyc0Zyb21NYXAodmlldy5tYXApO1xuICAgIC8vIGxvYWQoKSByZWh5ZHJhdGVzIE1hcEltYWdlIHN1YmxheWVycyBhbmQgY2FuIGRyb3AgdGhlaXIgcnVudGltZVxuICAgIC8vIGRpc3RyaWN0IGRlZmluaXRpb25FeHByZXNzaW9uIOKAlCBzbmFwc2hvdCBhbmQgcmVwYWlyIHN5bmNocm9ub3VzbHkgc29cbiAgICAvLyBhIGNvbm5lY3QvcmV0cnkgdGhhdCBvdmVybGFwcyBhIGZpZWxkIGNsaWNrIG5ldmVyIGZsYXNoZXMgb3RoZXJcbiAgICAvLyBkaXN0cmljdHMnIGZpZWxkcy5cbiAgICBjb25zdCBkZWZpbml0aW9uU25hcHNob3QgPSB0aGlzLnNuYXBzaG90RGVmaW5pdGlvbkV4cHJlc3Npb25zKG1hcExheWVycyk7XG4gICAgZm9yIChjb25zdCBsYXllciBvZiBtYXBMYXllcnMpIHtcbiAgICAgIGF3YWl0IHNhZmVMb2FkTWFwTGF5ZXIobGF5ZXIpO1xuICAgICAgdGhpcy5hZGRSZXNvbHZlZExheWVyKHJlc29sdmVkTGF5ZXJzLCBsYXllcktleVRvRHNJZCwgc2VlbiwgbGF5ZXIpO1xuICAgIH1cbiAgICB0aGlzLnJlc3RvcmVEcmlmdGVkRGVmaW5pdGlvbkV4cHJlc3Npb25zKGRlZmluaXRpb25TbmFwc2hvdCk7XG5cbiAgICBpZiAodXNlTGlzdC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGZyb21EcyA9IHRoaXMuY29sbGVjdExheWVyc0Zyb21EYXRhU291cmNlcyhqbXYsIHVzZUxpc3QpO1xuICAgICAgZm9yIChjb25zdCBsYXllciBvZiBmcm9tRHMubGF5ZXJzKSB7XG4gICAgICAgIGNvbnN0IGxpdmUgPSB0aGlzLnRvTGl2ZU1hcExheWVyKGxheWVyLCB2aWV3Lm1hcCkgfHwgbGF5ZXI7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldEV2YXBvTGF5ZXJNYXBLZXkobGl2ZSkgfHwgU3RyaW5nKGxpdmUudXJsIHx8IGxpdmUuaWQgfHwgXCJcIik7XG4gICAgICAgIGNvbnN0IGRzSWQgPSBmcm9tRHMubGF5ZXJLZXlUb0RzSWRba2V5XTtcbiAgICAgICAgdGhpcy5hZGRSZXNvbHZlZExheWVyKHJlc29sdmVkTGF5ZXJzLCBsYXllcktleVRvRHNJZCwgc2VlbiwgbGl2ZSwgZHNJZCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgdXNlRHMgb2YgdXNlTGlzdCkge1xuICAgICAgICBjb25zdCBsYXllciA9IGF3YWl0IHRoaXMucmVzb2x2ZUZlYXR1cmVMYXllckZvclVzZURhdGFTb3VyY2Uoam12LCB1c2VEcyk7XG4gICAgICAgIGlmICghbGF5ZXIpIGNvbnRpbnVlO1xuXG4gICAgICAgIGF3YWl0IHNhZmVMb2FkTWFwTGF5ZXIobGF5ZXIpO1xuXG4gICAgICAgIGNvbnN0IGRzSWQgPSBTdHJpbmcodXNlRHM/LmRhdGFTb3VyY2VJZCB8fCBcIlwiKTtcbiAgICAgICAgY29uc3QgbGl2ZSA9IHRoaXMudG9MaXZlTWFwTGF5ZXIobGF5ZXIsIHZpZXcubWFwKSB8fCBsYXllcjtcbiAgICAgICAgdGhpcy5hZGRSZXNvbHZlZExheWVyKHJlc29sdmVkTGF5ZXJzLCBsYXllcktleVRvRHNJZCwgc2VlbiwgbGl2ZSwgZHNJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcblxuICAgIGlmICghcmVzb2x2ZWRMYXllcnMubGVuZ3RoKSB7XG4gICAgICAvLyBTb2Z0IGZhaWwg4oCUIG1hcCBtYXkgc3RpbGwgYmUgbG9hZGluZyByZWdpb24teWVhciBzdWJsYXllcnMuIFJldHJ5XG4gICAgICAvLyBhIGZldyB0aW1lcyB3aXRob3V0IHJlLWVudGVyaW5nIG9uQWN0aXZlVmlld0NoYW5nZS5cbiAgICAgIC8vIFN0aWxsIGF0dGFjaCB0aGUgY2xpY2sgaGFuZGxlciBzbyB0aGUgZmlyc3QgZmllbGQgY2xpY2sgd29ya3MgYXMgc29vblxuICAgICAgLy8gYXMgbGl2ZSBNYXBJbWFnZSBzdWJsYXllcnMgYmVjb21lIGhpdHRhYmxlIHZpYSBnZXRDbGlja1RhcmdldExheWVycy5cbiAgICAgIGlmICghdGhpcy5fY2xpY2tIYW5kbGUpIHRoaXMuYXR0YWNoTWFwQ2xpY2soam12KTtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5zdGF0ZS5lcnJvciAhPT0gdGhpcy50cihcImVycm9yLnNlbGVjdGVkTGF5ZXJzTWlzc2luZ1wiKSB8fFxuICAgICAgICAodGhpcy5zdGF0ZS5mZWF0dXJlTGF5ZXJzPy5sZW5ndGggfHwgMCkgPiAwXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgZmVhdHVyZUxheWVyczogW10sXG4gICAgICAgICAgb2JqZWN0SWRGaWVsZDogbnVsbCxcbiAgICAgICAgICBlcnJvcjogdXNlTGlzdC5sZW5ndGhcbiAgICAgICAgICAgID8gdGhpcy50cihcImVycm9yLnNlbGVjdGVkTGF5ZXJzTWlzc2luZ1wiKVxuICAgICAgICAgICAgOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2NoZWR1bGVNYXBJbml0UmV0cnkoam12KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1hcEluaXRSZXRyeUNvdW50ID0gMDtcbiAgICBldmFwb01hcENsaWNrRGVidWcoXCJpbml0aWFsaXplTWFwQ29ubmVjdGlvbiBPS1wiLCB7XG4gICAgICBsYXllckNvdW50OiByZXNvbHZlZExheWVycy5sZW5ndGgsXG4gICAgICBsYXllcnM6IHJlc29sdmVkTGF5ZXJzLm1hcCgobCkgPT4gbC50aXRsZSB8fCBsLnVybCB8fCBsLmlkKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHByZXZLZXlzID0gKHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycyB8fCBbXSlcbiAgICAgIC5tYXAoKGwpID0+IGdldEV2YXBvTGF5ZXJNYXBLZXkobCkgfHwgU3RyaW5nKGwudXJsIHx8IGwuaWQgfHwgXCJcIikpXG4gICAgICAuam9pbihcInxcIik7XG4gICAgY29uc3QgbmV4dEtleXMgPSByZXNvbHZlZExheWVyc1xuICAgICAgLm1hcCgobCkgPT4gZ2V0RXZhcG9MYXllck1hcEtleShsKSB8fCBTdHJpbmcobC51cmwgfHwgbC5pZCB8fCBcIlwiKSlcbiAgICAgIC5qb2luKFwifFwiKTtcbiAgICBpZiAocHJldktleXMgPT09IG5leHRLZXlzICYmIHRoaXMuX2NsaWNrSGFuZGxlKSB7XG4gICAgICB0aGlzLmF0dGFjaE1hcENsaWNrKGptdik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgIHtcbiAgICAgICAgZmVhdHVyZUxheWVyczogcmVzb2x2ZWRMYXllcnMsXG4gICAgICAgIGxheWVyS2V5VG9Ec0lkLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgZGVidWdJbmZvOiB7XG4gICAgICAgICAgLi4udGhpcy5zdGF0ZS5kZWJ1Z0luZm8sXG4gICAgICAgICAgbGF5ZXJJbmZvOiByZXNvbHZlZExheWVycy5tYXAoKGwpID0+ICh7XG4gICAgICAgICAgICBpZDogbC5pZCxcbiAgICAgICAgICAgIHRpdGxlOiBsLnRpdGxlLFxuICAgICAgICAgICAgdXJsOiBsLnVybCxcbiAgICAgICAgICAgIG9iamVjdElkRmllbGQ6IGwub2JqZWN0SWRGaWVsZCxcbiAgICAgICAgICB9KSksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmF0dGFjaE1hcENsaWNrKGptdik7XG4gICAgICB9LFxuICAgICk7XG4gIH07XG5cbiAgcHJpdmF0ZSB0b0xpdmVNYXBMYXllciA9IChcbiAgICBsYXllcjogYW55LFxuICAgIG1hcDogX19lc3JpLk1hcCB8IG51bGwgfCB1bmRlZmluZWQsXG4gICk6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBudWxsID0+IHtcbiAgICBpZiAoIWxheWVyKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB1cmwgPSBTdHJpbmcobGF5ZXI/LnVybCB8fCBcIlwiKTtcbiAgICBpZiAobWFwICYmIHVybCkge1xuICAgICAgY29uc3QgYnlVcmwgPSBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5VXJsKG1hcCwgdXJsKTtcbiAgICAgIGlmIChieVVybCkgcmV0dXJuIGJ5VXJsIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gICAgfVxuICAgIGlmIChtYXAgJiYgbGF5ZXI/LmlkICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGJ5SWQgPSBmaW5kUXVlcnlhYmxlTGF5ZXJPbk1hcEJ5SWQobWFwLCBTdHJpbmcobGF5ZXIuaWQpKTtcbiAgICAgIGlmIChieUlkKSByZXR1cm4gYnlJZCBhcyBfX2VzcmkuRmVhdHVyZUxheWVyO1xuICAgIH1cbiAgICBjb25zdCBxdWVyeWFibGUgPSBnZXRRdWVyeWFibGVMYXllcihsYXllcik7XG4gICAgcmV0dXJuIChxdWVyeWFibGUgfHwgbGF5ZXIpIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gIH07XG5cbiAgcHJpdmF0ZSBsYXllcktleXNNYXRjaCA9IChhOiBhbnksIGI6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGtleUEgPSBnZXRFdmFwb0xheWVyTWFwS2V5KGEpO1xuICAgIGNvbnN0IGtleUIgPSBnZXRFdmFwb0xheWVyTWFwS2V5KGIpO1xuICAgIGlmIChrZXlBICYmIGtleUIgJiYga2V5QSA9PT0ga2V5QikgcmV0dXJuIHRydWU7XG4gICAgaWYgKGEuaWQgIT0gbnVsbCAmJiBiLmlkICE9IG51bGwgJiYgU3RyaW5nKGEuaWQpID09PSBTdHJpbmcoYi5pZCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCB1cmxBID0gbm9ybWFsaXplUXVlcnlhYmxlTGF5ZXJVcmwoU3RyaW5nKGEudXJsIHx8IFwiXCIpKTtcbiAgICBjb25zdCB1cmxCID0gbm9ybWFsaXplUXVlcnlhYmxlTGF5ZXJVcmwoU3RyaW5nKGIudXJsIHx8IFwiXCIpKTtcbiAgICByZXR1cm4gISEodXJsQSAmJiB1cmxCICYmIHVybEEgPT09IHVybEIpO1xuICB9O1xuXG4gIC8qKiBSZXNvbHZlIHRoZSBsaXZlIG1hcCBsYXllciBmb3IgYSBzZWxlY3RlZCB1c2VEYXRhU291cmNlIChGZWF0dXJlTGF5ZXIgb3IgTWFwSW1hZ2Ugc3VibGF5ZXIpLiAqL1xuICBwcml2YXRlIHJlc29sdmVGZWF0dXJlTGF5ZXJGb3JVc2VEYXRhU291cmNlID0gYXN5bmMgKFxuICAgIGptdjogSmltdU1hcFZpZXcsXG4gICAgdXNlRHM6IGFueSxcbiAgKTogUHJvbWlzZTxfX2VzcmkuRmVhdHVyZUxheWVyIHwgbnVsbD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXVzZURzPy5kYXRhU291cmNlSWQpIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBkc0lkID0gU3RyaW5nKHVzZURzLmRhdGFTb3VyY2VJZCk7XG4gICAgICBjb25zdCBtYXAgPSBqbXY/LnZpZXc/Lm1hcDtcbiAgICAgIGlmICghbWFwKSByZXR1cm4gbnVsbDtcblxuICAgICAgY29uc3Qgamx2QnlBcGkgPSAoam12IGFzIGFueSkuZ2V0SmltdUxheWVyVmlld0J5RGF0YVNvdXJjZUlkPy4oZHNJZCk7XG4gICAgICBjb25zdCBmcm9tQXBpID0gZ2V0UXVlcnlhYmxlTGF5ZXIoamx2QnlBcGk/LmxheWVyKTtcbiAgICAgIGlmIChmcm9tQXBpKSByZXR1cm4gdGhpcy50b0xpdmVNYXBMYXllcihmcm9tQXBpLCBtYXApO1xuXG4gICAgICBjb25zdCBqbHZMaXN0OiBhbnlbXSA9IGptdi5nZXRBbGxKaW11TGF5ZXJWaWV3cz8uKCkgfHwgW107XG4gICAgICBjb25zdCBsYXllcklkSGludCA9IGV4dHJhY3RNYXBMYXllcklkRnJvbURzSWQoZHNJZCk7XG5cbiAgICAgIGZvciAoY29uc3QgbHYgb2Ygamx2TGlzdCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbHY/LmxheWVyRGF0YVNvdXJjZUlkID09PSBkc0lkIHx8XG4gICAgICAgICAgbHY/LmRhdGFTb3VyY2VJZCA9PT0gZHNJZFxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IGdldFF1ZXJ5YWJsZUxheWVyKGx2Py5sYXllcik7XG4gICAgICAgICAgaWYgKHJlc29sdmVkKSByZXR1cm4gdGhpcy50b0xpdmVNYXBMYXllcihyZXNvbHZlZCwgbWFwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobGF5ZXJJZEhpbnQpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBqbHZMaXN0LmZpbmQoXG4gICAgICAgICAgKGx2KSA9PiBTdHJpbmcobHY/LmxheWVyPy5pZCB8fCBcIlwiKSA9PT0gbGF5ZXJJZEhpbnQsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gZ2V0UXVlcnlhYmxlTGF5ZXIobWF0Y2g/LmxheWVyKTtcbiAgICAgICAgaWYgKHJlc29sdmVkKSByZXR1cm4gdGhpcy50b0xpdmVNYXBMYXllcihyZXNvbHZlZCwgbWFwKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHNNZ3IgPSBEYXRhU291cmNlTWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuICAgICAgY29uc3QgZHM6IGFueSA9IGRzTWdyLmdldERhdGFTb3VyY2UoZHNJZCk7XG4gICAgICBpZiAoZHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGRzLmZldGNoU2NoZW1hID09PSBcImZ1bmN0aW9uXCIpIGF3YWl0IGRzLmZldGNoU2NoZW1hKCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8qIHNjaGVtYSBvcHRpb25hbCAqL1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHNMYXllciA9XG4gICAgICAgICAgKHR5cGVvZiBkcy5nZXRMYXllciA9PT0gXCJmdW5jdGlvblwiID8gZHMuZ2V0TGF5ZXIoKSA6IG51bGwpIHx8XG4gICAgICAgICAgZHMubGF5ZXIgfHxcbiAgICAgICAgICAodHlwZW9mIGRzLmdldEppbXVMYXllciA9PT0gXCJmdW5jdGlvblwiID8gZHMuZ2V0SmltdUxheWVyKCkgOiBudWxsKTtcbiAgICAgICAgY29uc3QgcXVlcnlhYmxlID0gZ2V0UXVlcnlhYmxlTGF5ZXIoZHNMYXllcik7XG4gICAgICAgIGlmIChxdWVyeWFibGUpIHtcbiAgICAgICAgICBjb25zdCBsaXZlID0gdGhpcy50b0xpdmVNYXBMYXllcihxdWVyeWFibGUsIG1hcCk7XG4gICAgICAgICAgaWYgKGxpdmUpIHJldHVybiBsaXZlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHNVcmwgPSBTdHJpbmcoZHM/LnVybCB8fCBxdWVyeWFibGU/LnVybCB8fCBkc0xheWVyPy51cmwgfHwgXCJcIik7XG4gICAgICAgIGlmIChkc1VybCkge1xuICAgICAgICAgIGNvbnN0IGJ5VXJsID0gZmluZFF1ZXJ5YWJsZUxheWVyT25NYXBCeVVybChtYXAsIGRzVXJsKTtcbiAgICAgICAgICBpZiAoYnlVcmwpIHJldHVybiBieVVybCBhcyBfX2VzcmkuRmVhdHVyZUxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBpZ25vcmUgKi9cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIHByaXZhdGUgY2xhbXBQb3B1cFRvTWFwQ29udGFpbmVyID0gKFxuICAgIHBvczogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9LFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlldy5jb250YWluZXIgYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29uc3QgcmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBtYXJnaW4gPSB0aGlzLlBPUFVQX01BUkdJTjtcbiAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnN0YXRlLnBpblRvQ29ybmVyO1xuICAgIGNvbnN0IHsgd2lkdGg6IHBvcHVwVywgaGVpZ2h0OiBwb3B1cEggfSA9IHRoaXMuZ2V0UG9wdXBEaW1lbnNpb25zKFxuICAgICAgdmlldyxcbiAgICAgIHBpbm5lZCxcbiAgICAgIHBvcyxcbiAgICApO1xuXG4gICAgY29uc3QgbWFwTGVmdCA9IHJlY3QubGVmdDtcbiAgICBjb25zdCBtYXBUb3AgPSByZWN0LnRvcDtcbiAgICBjb25zdCBtYXBSaWdodCA9IHJlY3QucmlnaHQ7XG4gICAgY29uc3QgbWFwQm90dG9tID0gdGhpcy5nZXRFZmZlY3RpdmVNYXBCb3R0b20odmlldywgbWFyZ2luKTtcblxuICAgIGNvbnN0IHggPSBNYXRoLm1heChcbiAgICAgIG1hcExlZnQgKyBtYXJnaW4sXG4gICAgICBNYXRoLm1pbihwb3MueCwgbWFwUmlnaHQgLSBwb3B1cFcgLSBtYXJnaW4pLFxuICAgICk7XG5cbiAgICBsZXQgeSA9IHBvcy55O1xuICAgIGlmICh5ICsgcG9wdXBIID4gbWFwQm90dG9tKSB7XG4gICAgICB5ID0gbWFwQm90dG9tIC0gcG9wdXBIIC0gbWFyZ2luO1xuICAgIH1cbiAgICB5ID0gTWF0aC5tYXgobWFwVG9wICsgbWFyZ2luLCB5KTtcblxuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfTtcblxuICBwcml2YXRlIGF0dGFjaE1hcENsaWNrKGptdjogSmltdU1hcFZpZXcpIHtcbiAgICB0aGlzLmRldGFjaE1hcENsaWNrKCk7XG4gICAgY29uc3QgdmlldyA9IGptdj8udmlldyBhcyB7IG9uPzogKGV2ZW50OiBzdHJpbmcsIGNiOiB1bmtub3duKSA9PiB1bmtub3duIH0gfCBudWxsO1xuICAgIGlmICghdmlldyB8fCB0eXBlb2Ygdmlldy5vbiAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm47XG4gICAgdGhpcy5fY2xpY2tIYW5kbGUgPSB2aWV3Lm9uKFwiY2xpY2tcIiwgdGhpcy5vblZpZXdDbGljaykgYXMgYW55O1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVNYXBDbGlja0F0dGFjaGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgbWFwV2lkZ2V0SWQgPSB0aGlzLmdldExpbmtlZE1hcFdpZGdldElkKCk7XG4gICAgY29uc3Qgam12ID1cbiAgICAgIHRoaXMuc3RhdGUuamltdU1hcFZpZXc/LnZpZXdcbiAgICAgICAgPyB0aGlzLnN0YXRlLmppbXVNYXBWaWV3XG4gICAgICAgIDogdGhpcy5nZXRNYXBWaWV3RnJvbU1hbmFnZXIobWFwV2lkZ2V0SWQpO1xuICAgIGlmICgham12Py52aWV3KSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuamltdU1hcFZpZXc/LnZpZXcpIHtcbiAgICAgIHRoaXMub25BY3RpdmVWaWV3Q2hhbmdlKGptdik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2NsaWNrSGFuZGxlKSB7XG4gICAgICB0aGlzLmF0dGFjaE1hcENsaWNrKGptdik7XG4gICAgfVxuICAgIHJldHVybiAhIXRoaXMuX2NsaWNrSGFuZGxlO1xuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlWHlQYWdlQ2xvc2VkID0gKCk6IHZvaWQgPT4ge1xuICAgIGlmICghdGhpcy5pc0Rhc2hib2FyZEVtYmVkZGVkKCkpIHJldHVybjtcbiAgICBpZiAodGhpcy5zdGF0ZS5zaG93UG9wdXApIHtcbiAgICAgIHRoaXMuY2xvc2VQb3B1cCh7IHJlc3RvcmVFeHRlbnQ6IGZhbHNlLCBub3RpZnlEZXNlbGVjdDogZmFsc2UgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgZmllbGQgcG9wdXAgd2hlbiB0aGUgaHViIGdlb2dyYXBoeSBtb3ZlcyAob3RoZXIgdHVtYW4gL1xuICAgKiB2aWxveWF0IC8geWVhcikgb3Igd2hlbiBwb2x5Z29uIGZvY3VzIGlzIGNsZWFyZWQuIERvIG5vdCByZXN0b3JlIHRoZVxuICAgKiBwcmUtZmllbGQgZXh0ZW50IG9uIGdlb2dyYXBoeSBjaGFuZ2Ug4oCUIExvY2FsaXphdGlvbiBpcyBhbHJlYWR5IHpvb21pbmdcbiAgICogdG8gdGhlIG5ldyBkaXN0cmljdC9yZWdpb24uXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1hc3RlckZpbHRlckNoYW5nZWQgPSAoZXZlbnQ6IEV2ZW50KTogdm9pZCA9PiB7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQpIHJldHVybjtcbiAgICBjb25zdCBkZXRhaWw6IGFueSA9IChldmVudCBhcyBDdXN0b21FdmVudCkuZGV0YWlsIHx8IHt9O1xuICAgIGNvbnN0IGY6IGFueSA9IGRldGFpbC5maWx0ZXJzIHx8IHt9O1xuICAgIGNvbnN0IGdlb0tleSA9IGAke1N0cmluZyhmLnlpbCB8fCBcIlwiKX18JHtTdHJpbmcoZi52aWxveWF0IHx8IFwiXCIpfXwke1N0cmluZyhmLnR1bWFuIHx8IFwiXCIpfWA7XG4gICAgY29uc3QgcHJldkdlbyA9IHRoaXMuX2xhc3RNYXN0ZXJHZW9LZXk7XG4gICAgdGhpcy5fbGFzdE1hc3Rlckdlb0tleSA9IGdlb0tleTtcblxuICAgIGNvbnN0IGdlb0NoYW5nZWQgPSBCb29sZWFuKHByZXZHZW8pICYmIHByZXZHZW8gIT09IGdlb0tleTtcbiAgICBjb25zdCBwb2x5Z29uQ2xlYXJlZCA9IGYucG9seWdvbk1vZGUgPT09IGZhbHNlO1xuICAgIGNvbnN0IGluY29taW5nVW5pcXVlID0gU3RyaW5nKGYudW5pcXVlaWQgfHwgXCJcIilcbiAgICAgIC5yZXBsYWNlKC9be31dL2csIFwiXCIpXG4gICAgICAudHJpbSgpO1xuICAgIGlmIChmLnBvbHlnb25Nb2RlID09PSB0cnVlICYmIGluY29taW5nVW5pcXVlKSB7XG4gICAgICB0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCA9IGluY29taW5nVW5pcXVlO1xuICAgICAgLy8gRmFsbGJhY2s6IGlmIHNlbGVjdGlvbiBhcnJpdmVkIHZpYSBodWIgYnV0IHBvcHVwIGlzIHN0aWxsIGNsb3NlZCwgb3BlbiBpdC5cbiAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93UG9wdXApIHtcbiAgICAgICAgdm9pZCB0aGlzLm9wZW5Qb3B1cEZvclVuaXF1ZWlkKGluY29taW5nVW5pcXVlLCB7XG4gICAgICAgICAgem9vbTogZmFsc2UsXG4gICAgICAgICAgbm90aWZ5U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwb2x5Z29uQ2xlYXJlZCkge1xuICAgICAgdGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChnZW9DaGFuZ2VkKSB7XG4gICAgICB0aGlzLmNsb3NlUG9wdXAoeyByZXN0b3JlRXh0ZW50OiBmYWxzZSwgbm90aWZ5RGVzZWxlY3Q6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBTYW1lIGdlb2dyYXBoeSBidXQgaHViIGNsZWFyZWQgcG9seWdvbiBmb2N1cyAoZS5nLiBHcmFmZiBkZXNlbGVjdCkuXG4gICAgaWYgKHBvbHlnb25DbGVhcmVkICYmICh0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCB0aGlzLnN0YXRlLmxvYWRpbmcpKSB7XG4gICAgICB0aGlzLmNsb3NlUG9wdXAoeyByZXN0b3JlRXh0ZW50OiB0cnVlLCBub3RpZnlEZXNlbGVjdDogZmFsc2UgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKiBJbW1lZGlhdGUgY2xvc2Ugd2hlbiBSZWdpb24vUGllL3llYXIgY2hhbmdlIGdlb2dyYXBoeSAoYmVmb3JlIG1hcCBzeW5jIGZpbmlzaGVzKS4gKi9cbiAgcHJpdmF0ZSBoYW5kbGVXaWRnZXRTZWxlY3Rpb25DaGFuZ2VkID0gKGV2ZW50OiBFdmVudCk6IHZvaWQgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgY29uc3QgZDogYW55ID0gKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwgfHwge307XG4gICAgLy8gT3VyIG93biBwb2x5Z29uIG5vdGlmeSBtdXN0IG5vdCBjbG9zZSB0aGUgcG9wdXAgd2UganVzdCBvcGVuZWQuXG4gICAgaWYgKGQuc291cmNlID09PSBcIkFncmlQb3B1cFwiKSByZXR1cm47XG4gICAgaWYgKFxuICAgICAgZC55aWwgIT09IHVuZGVmaW5lZCB8fFxuICAgICAgZC52aWxveWF0ICE9PSB1bmRlZmluZWQgfHxcbiAgICAgIGQudHVtYW4gIT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgdGhpcy5jbG9zZVBvcHVwKHsgcmVzdG9yZUV4dGVudDogZmFsc2UsIG5vdGlmeURlc2VsZWN0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGQucG9seWdvbk1vZGUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCA9IG51bGw7XG4gICAgICB0aGlzLmNsb3NlUG9wdXAoeyByZXN0b3JlRXh0ZW50OiB0cnVlLCBub3RpZnlEZXNlbGVjdDogZmFsc2UgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIChkLnNvdXJjZSA9PT0gXCJBZ3JpR3JhZmZXaWRnZXRcIiB8fCBkLnNvdXJjZSA9PT0gXCJBZ3JpR3JhZmYxMFwiKSAmJlxuICAgICAgZC5wb2x5Z29uTW9kZSA9PT0gdHJ1ZSAmJlxuICAgICAgZC51bmlxdWVpZFxuICAgICkge1xuICAgICAgY29uc3QgY2xlYW4gPSBTdHJpbmcoZC51bmlxdWVpZClcbiAgICAgICAgLnJlcGxhY2UoL1t7fV0vZywgXCJcIilcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIHRoaXMuX2FjdGl2ZUluc3BlY3RlZFVuaXF1ZWlkID0gY2xlYW47XG4gICAgICAvLyBUYWJsZSAvIEdyYWZmIHNlbGVjdGlvbiBtdXN0IGFsd2F5cyBvcGVuIHRoZSBmaWVsZCBwb3B1cC5cbiAgICAgIHZvaWQgdGhpcy5vcGVuUG9wdXBGb3JVbmlxdWVpZChjbGVhbiwge1xuICAgICAgICB6b29tOiBmYWxzZSxcbiAgICAgICAgbm90aWZ5U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogT3BlbiAob3IgcmVmcmVzaCkgdGhlIGZpZWxkIHBvcHVwIGZvciBhIHBvbHlnb24gdW5pcXVlaWQg4oCUIHVzZWQgd2hlblxuICAgKiBzZWxlY3Rpb24gY29tZXMgZnJvbSB0aGUgdGFibGUvR3JhZmYgcGF0aCAobWFwIGNsaWNrIGFscmVhZHkgb3BlbnMgaXRzZWxmKS5cbiAgICovXG4gIHByaXZhdGUgb3BlblBvcHVwRm9yVW5pcXVlaWQgPSBhc3luYyAoXG4gICAgdW5pcXVlaWQ6IHN0cmluZyxcbiAgICBvcHRzPzogeyB6b29tPzogYm9vbGVhbjsgbm90aWZ5U2VsZWN0aW9uPzogYm9vbGVhbiB9LFxuICApOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBjbGVhbiA9IFN0cmluZyh1bmlxdWVpZCB8fCBcIlwiKVxuICAgICAgLnJlcGxhY2UoL1t7fV0vZywgXCJcIilcbiAgICAgIC50cmltKCk7XG4gICAgaWYgKCFjbGVhbiB8fCAhdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG5cbiAgICBjb25zdCBhY3RpdmUgPSBTdHJpbmcodGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgfHwgXCJcIilcbiAgICAgIC5yZXBsYWNlKC9be31dL2csIFwiXCIpXG4gICAgICAudHJpbSgpO1xuICAgIGlmICh0aGlzLnN0YXRlLnNob3dQb3B1cCAmJiBhY3RpdmUgPT09IGNsZWFuICYmIHRoaXMuc3RhdGUuc2VsZWN0ZWRBdHRycykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQpIHtcbiAgICAgICAgdGhpcy5leHBhbmRQb3B1cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5icm9hZGNhc3RQb3B1cFZpc2liaWxpdHkodHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgam12ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldztcbiAgICBjb25zdCB2aWV3ID0gam12Py52aWV3O1xuICAgIGlmICghdmlldyB8fCAham12KSByZXR1cm47XG5cbiAgICBjb25zdCBjbGlja0dlbmVyYXRpb24gPSArK3RoaXMuX2NsaWNrR2VuZXJhdGlvbjtcbiAgICBjb25zdCBpc1N0YWxlID0gKCkgPT5cbiAgICAgICF0aGlzLl9pc01vdW50ZWQgfHwgY2xpY2tHZW5lcmF0aW9uICE9PSB0aGlzLl9jbGlja0dlbmVyYXRpb247XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIGxvYWRpbmdBdHRhY2htZW50czogdHJ1ZSxcbiAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbGF5ZXJzID0gYXdhaXQgdGhpcy5yZXNvbHZlQ2xpY2tMYXllcnModmlldywgam12KTtcbiAgICAgIGlmIChpc1N0YWxlKCkpIHJldHVybjtcblxuICAgICAgbGV0IGZlYXR1cmU6IF9fZXNyaS5HcmFwaGljIHwgbnVsbCA9IG51bGw7XG4gICAgICBsZXQgY2xpY2tlZExheWVyOiBfX2VzcmkuRmVhdHVyZUxheWVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FncmljdWx0dXJhbEZpZWxkTGF5ZXIobGF5ZXIpKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCF0aGlzLmlzTGF5ZXJFZmZlY3RpdmVseVZpc2libGUobGF5ZXIsIHZpZXcpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZGV0YWNoZWQgPSBhd2FpdCB0aGlzLmdldERldGFjaGVkUXVlcnlMYXllcihsYXllcik7XG4gICAgICAgIGlmIChpc1N0YWxlKCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgcXVlcnlUYXJnZXQgPSBkZXRhY2hlZCB8fCBsYXllcjtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBbY2xlYW4sIGB7JHtjbGVhbn19YF07XG4gICAgICAgIGZvciAoY29uc3QgdiBvZiB2YXJpYW50cykge1xuICAgICAgICAgIGNvbnN0IHEgPSBxdWVyeVRhcmdldC5jcmVhdGVRdWVyeSgpO1xuICAgICAgICAgIHEub3V0RmllbGRzID0gW1wiKlwiXTtcbiAgICAgICAgICBxLnJldHVybkdlb21ldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICBxLm51bSA9IDE7XG4gICAgICAgICAgY29uc3QgZXNjYXBlZCA9IFN0cmluZyh2KS5yZXBsYWNlKC8nL2csIFwiJydcIik7XG4gICAgICAgICAgcS53aGVyZSA9IGAke0FHUklfVEFCTEVfSk9JTl9GSUVMRH09JyR7ZXNjYXBlZH0nYDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgcXVlcnlUYXJnZXQucXVlcnlGZWF0dXJlcyhxKTtcbiAgICAgICAgICAgIGlmIChyZXMuZmVhdHVyZXM/LlswXSkge1xuICAgICAgICAgICAgICBmZWF0dXJlID0gcmVzLmZlYXR1cmVzWzBdO1xuICAgICAgICAgICAgICBjbGlja2VkTGF5ZXIgPSBsYXllcjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvKiB0cnkgbmV4dCB2YXJpYW50IC8gbGF5ZXIgKi9cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZlYXR1cmUpIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWZlYXR1cmUgfHwgIWNsaWNrZWRMYXllciB8fCBpc1N0YWxlKCkpIHtcbiAgICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxpdmVMYXllciA9XG4gICAgICAgICh0aGlzLnRvTGl2ZU1hcExheWVyKGNsaWNrZWRMYXllciwgdmlldy5tYXApIHx8XG4gICAgICAgICAgY2xpY2tlZExheWVyKSBhcyBfX2VzcmkuRmVhdHVyZUxheWVyO1xuICAgICAgY29uc3QgbGF5ZXJLZXkgPVxuICAgICAgICBnZXRFdmFwb0xheWVyTWFwS2V5KGxpdmVMYXllcikgfHxcbiAgICAgICAgU3RyaW5nKGxpdmVMYXllcj8udXJsIHx8IGxpdmVMYXllcj8uaWQgfHwgXCJcIik7XG4gICAgICBjb25zdCBkc0lkID0gdGhpcy5zdGF0ZS5sYXllcktleVRvRHNJZD8uW2xheWVyS2V5XSB8fCBudWxsO1xuICAgICAgY29uc3Qgb2lkRmllbGQgPVxuICAgICAgICBsaXZlTGF5ZXIub2JqZWN0SWRGaWVsZCB8fFxuICAgICAgICBsaXZlTGF5ZXIuZmllbGRzPy5maW5kKChmOiBhbnkpID0+IGYudHlwZSA9PT0gXCJvaWRcIik/Lm5hbWUgfHxcbiAgICAgICAgbnVsbDtcbiAgICAgIGlmICghb2lkRmllbGQpIHtcbiAgICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dQb3B1cDogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvaWQgPSBmZWF0dXJlLmF0dHJpYnV0ZXM/LltvaWRGaWVsZF07XG4gICAgICBpZiAob2lkID09IG51bGwpIHtcbiAgICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dQb3B1cDogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvdXRGaWVsZHMgPSB0aGlzLmdldE91dEZpZWxkcyhsaXZlTGF5ZXIgYXMgYW55LCBvaWRGaWVsZCk7XG4gICAgICBjb25zdCBmID1cbiAgICAgICAgKGF3YWl0IHRoaXMucXVlcnlGZWF0dXJlQnlPYmplY3RJZENhY2hlZChcbiAgICAgICAgICBsaXZlTGF5ZXIsXG4gICAgICAgICAgb2lkRmllbGQsXG4gICAgICAgICAgb2lkLFxuICAgICAgICAgIG91dEZpZWxkcyxcbiAgICAgICAgKSkgfHwgZmVhdHVyZTtcbiAgICAgIGlmIChpc1N0YWxlKCkpIHJldHVybjtcblxuICAgICAgaWYgKGYuZ2VvbWV0cnkpIHRoaXMuaGlnaGxpZ2h0UG9seWdvbihmLmdlb21ldHJ5KTtcblxuICAgICAgY29uc3QgZGlzcGxheUF0dHJzID0gYXdhaXQgdGhpcy5yZXNvbHZlRGlzcGxheUF0dHJzKGYuYXR0cmlidXRlcyk7XG4gICAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHNob3VsZFBpbiA9IHRoaXMuc3RhdGUucGluVG9Db3JuZXI7XG4gICAgICBjb25zdCBwb3B1cFBvc2l0aW9uID0gc2hvdWxkUGluXG4gICAgICAgID8gdGhpcy5jYWxjdWxhdGVQaW5uZWRQb3NpdGlvbih2aWV3KVxuICAgICAgICA6IHRoaXMuc3RhdGUucG9wdXBQb3NpdGlvbiB8fCB0aGlzLmNhbGN1bGF0ZVBpbm5lZFBvc2l0aW9uKHZpZXcpO1xuXG4gICAgICBjb25zdCBjb25maWd1cmVkRmllbGRzID0gdGhpcy5wcm9wcy5jb25maWc/LmZpZWxkc1RvU2hvdyB8fCBbXTtcbiAgICAgIGNvbnN0IGFjdHVhbEZpZWxkcyA9IE9iamVjdC5rZXlzKGRpc3BsYXlBdHRycyk7XG4gICAgICBjb25zdCBtaXNzaW5nRmllbGRzID0gY29uZmlndXJlZEZpZWxkcy5maWx0ZXIoXG4gICAgICAgIChmaWVsZCkgPT4gIWFjdHVhbEZpZWxkcy5pbmNsdWRlcyhmaWVsZCksXG4gICAgICApO1xuICAgICAgY29uc3QgZmllbGRzV2l0aERhdGEgPSBjb25maWd1cmVkRmllbGRzLmZpbHRlcihcbiAgICAgICAgKG5hbWUpID0+XG4gICAgICAgICAgZGlzcGxheUF0dHJzLmhhc093blByb3BlcnR5KG5hbWUpICYmXG4gICAgICAgICAgZGlzcGxheUF0dHJzW25hbWVdICE9IG51bGwgJiZcbiAgICAgICAgICBkaXNwbGF5QXR0cnNbbmFtZV0gIT09IFwiXCIsXG4gICAgICApO1xuXG4gICAgICB0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCA9IGNsZWFuO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBsYXN0Q2xpY2tlZERzSWQ6IGRzSWQsXG4gICAgICAgIGxhc3RDbGlja2VkTGF5ZXJLZXk6IGxheWVyS2V5LFxuICAgICAgICBzZWxlY3RlZEF0dHJzOiBkaXNwbGF5QXR0cnMsXG4gICAgICAgIHNlbGVjdGVkT0lEOiBOdW1iZXIob2lkKSxcbiAgICAgICAgb2JqZWN0SWRGaWVsZDogb2lkRmllbGQsXG4gICAgICAgIHNob3dQb3B1cDogdHJ1ZSxcbiAgICAgICAgcG9wdXBNaW5pbWl6ZWQ6IGZhbHNlLFxuICAgICAgICBjaGFydEV4cGFuZGVkOiBzaG91bGRQaW4sXG4gICAgICAgIGNoYXJ0SG92ZXJJbmRleDogbnVsbCxcbiAgICAgICAgcG9wdXBQb3NpdGlvbixcbiAgICAgICAgZXJyb3I6XG4gICAgICAgICAgbWlzc2luZ0ZpZWxkcy5sZW5ndGggPiAwXG4gICAgICAgICAgICA/IHRoaXMudHIoXCJlcnJvci5jb25maWd1cmVkRmllbGRNaXNzaW5nXCIsIHtcbiAgICAgICAgICAgICAgICBmaWVsZHM6IG1pc3NpbmdGaWVsZHMuam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgOiBmaWVsZHNXaXRoRGF0YS5sZW5ndGggPT09IDAgJiYgY29uZmlndXJlZEZpZWxkcy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gdGhpcy50cihcImVycm9yLm5vRGF0YUZvckNvbmZpZ3VyZWRGaWVsZHNcIilcbiAgICAgICAgICAgICAgOiBudWxsLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChvcHRzPy5ub3RpZnlTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5ub3RpZnlHcmFmZlBvbHlnb25TZWxlY3Rpb24oY2xlYW4sIHRydWUsIERhdGUubm93KCkpO1xuICAgICAgfVxuICAgICAgdm9pZCB0aGlzLmZldGNoTGF0ZXN0VmVnZXRhdGlvbkluZGljZXMoY2xlYW4pO1xuXG4gICAgICBpZiAob3B0cz8uem9vbSAhPT0gZmFsc2UgJiYgZi5nZW9tZXRyeSAmJiAhaXNTdGFsZSgpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gJiYgdmlldy5leHRlbnQ/LmNsb25lKSB7XG4gICAgICAgICAgICB0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gPSB2aWV3LmV4dGVudC5jbG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB0YXJnZXQgPVxuICAgICAgICAgICAgKGYuZ2VvbWV0cnkgYXMgYW55KS5leHRlbnQ/LmV4cGFuZD8uKDEuMDgpIHx8IGYuZ2VvbWV0cnk7XG4gICAgICAgICAgdm9pZCB2aWV3LmdvVG8oXG4gICAgICAgICAgICB7IHRhcmdldCB9LFxuICAgICAgICAgICAgeyBkdXJhdGlvbjogNjUwLCBlYXNpbmc6IFwiZWFzZS1pbi1vdXRcIiBhcyBhbnkgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvKiBpZ25vcmUgKi9cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wcm9wcy5jb25maWc/LnNldHRpbmdzPy5zaG93QXR0YWNobWVudHMgIT09IGZhbHNlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY2xpY2tlZFVybCA9IFN0cmluZygobGl2ZUxheWVyIGFzIGFueSkudXJsIHx8IFwiXCIpLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCBhdHRhY2htZW50TGF5ZXIgPVxuICAgICAgICAgICAgKGNsaWNrZWRVcmwgJiYgdGhpcy5fcXVlcnlPbmx5TGF5ZXJzLmdldChjbGlja2VkVXJsKSkgfHwgbGl2ZUxheWVyO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9hZEF0dGFjaG1lbnRzRm9yT2lkKGF0dGFjaG1lbnRMYXllciBhcyBhbnksIE51bWJlcihvaWQpKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLCBhdHRhY2htZW50czogW10gfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsIGF0dGFjaG1lbnRzOiBbXSB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0QWZ0ZXJDb250ZW50KCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBpZiAoIWlzU3RhbGUoKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiBlPy5tZXNzYWdlIHx8IFN0cmluZyhlKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlU2hhcmVkTWFwQ2xpY2sgPSBhc3luYyAoZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgLy8gQWx3YXlzIGlnbm9yZSB0aGUgTG9jYWxpemF0aW9uIGNsaWNrIGJ1cy4gQWdyaVBvcHVwIG93bnMgdmlldy5vbihcImNsaWNrXCIpXG4gICAgLy8gZXhjbHVzaXZlbHkg4oCUIGhhbmRsaW5nIGJvdGggcmFjZXMgdHdvIGZ1bGwgb25WaWV3Q2xpY2sgY2hhaW5zOiB0aGUgbG9zZXJcbiAgICAvLyBvZnRlbiBjbGVhcnMgc2hvd1BvcHVwLCByZXN0b3JlcyB0aGUgcHJlLXNlbGVjdGlvbiBleHRlbnQsIGFuZCBmbGFzaGVzXG4gICAgLy8gb3RoZXItZGlzdHJpY3QgZmllbGRzLiBMb2NhbGl6YXRpb24gbWF5IHN0aWxsIGRpc3BhdGNoIGZvciBvdGhlciBsaXN0ZW5lcnMuXG4gICAgZXZhcG9NYXBDbGlja0RlYnVnKFxuICAgICAgXCJBZ3JpUG9seWdvbiDihpAgc2hhcmVkIG1hcC1jbGljayBTS0lQIChkaXJlY3QgdmlldyBjbGljayBpcyBzb2xlIG93bmVyKVwiLFxuICAgICk7XG4gICAgcmV0dXJuO1xuICB9O1xuXG4gIHByaXZhdGUgZGV0YWNoTWFwQ2xpY2soKSB7XG4gICAgaWYgKHRoaXMuX2NsaWNrSGFuZGxlPy5yZW1vdmUpIHRoaXMuX2NsaWNrSGFuZGxlLnJlbW92ZSgpO1xuICAgIHRoaXMuX2NsaWNrSGFuZGxlID0gbnVsbDtcbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gQ2xpY2sg4oaSIGhpdFRlc3Qg4oaSIHF1ZXJ5IGZ1bGwgYXR0cnMgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgdG9DbGlja1F1ZXJ5R2VvbWV0cnkgPSAoXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICAgIHNjcmVlblBvaW50OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0sXG4gICAgbWFwUG9pbnQ/OiB7IHg/OiBudW1iZXI7IHk/OiBudW1iZXI7IHNwYXRpYWxSZWZlcmVuY2U/OiB7IHdraWQ/OiBudW1iZXIgfSB9LFxuICApOiBfX2VzcmkuUG9pbnQgfCBudWxsID0+IHtcbiAgICBpZiAodHlwZW9mIHZpZXcudG9NYXAgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZnJvbVZpZXcgPSB2aWV3LnRvTWFwKHNjcmVlblBvaW50KTtcbiAgICAgICAgaWYgKGZyb21WaWV3KSByZXR1cm4gZnJvbVZpZXcgYXMgX19lc3JpLlBvaW50O1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB4ID0gTnVtYmVyKG1hcFBvaW50Py54KTtcbiAgICBjb25zdCB5ID0gTnVtYmVyKG1hcFBvaW50Py55KTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCh7XG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHNwYXRpYWxSZWZlcmVuY2U6XG4gICAgICAgICAgbWFwUG9pbnQ/LnNwYXRpYWxSZWZlcmVuY2UgfHwgKHZpZXcgYXMgYW55KS5zcGF0aWFsUmVmZXJlbmNlLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBmaW5kSGl0R3JhcGhpYyA9IChcbiAgICBoaXQ6IF9fZXNyaS5IaXRUZXN0UmVzdWx0IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBsYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSxcbiAgKTogX19lc3JpLkdyYXBoaWMgfCBudWxsID0+IHtcbiAgICBjb25zdCBoaXRSZXN1bHQgPSBoaXQ/LnJlc3VsdHM/LmZpbmQoKHIpID0+IHtcbiAgICAgIGlmIChcImdyYXBoaWNcIiBpbiByICYmIHIuZ3JhcGhpYykge1xuICAgICAgICBjb25zdCBseXI6IGFueSA9IHIuZ3JhcGhpYy5sYXllcjtcbiAgICAgICAgaWYgKCFseXIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGxheWVycy5zb21lKChMKSA9PiB0aGlzLmxheWVyS2V5c01hdGNoKEwsIGx5cikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgIHJldHVybiBoaXRSZXN1bHQgJiYgXCJncmFwaGljXCIgaW4gaGl0UmVzdWx0ID8gaGl0UmVzdWx0LmdyYXBoaWMgOiBudWxsO1xuICB9O1xuXG4gIHByaXZhdGUgcGlja0NsaWNrR3JhcGhpYyA9IChcbiAgICBoaXQ6IF9fZXNyaS5IaXRUZXN0UmVzdWx0IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBwcmVmZXJyZWRMYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSxcbiAgKTogX19lc3JpLkdyYXBoaWMgfCBudWxsID0+IHtcbiAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldztcbiAgICBjb25zdCBtYXAgPSBhY3RpdmVWaWV3Py5tYXA7XG4gICAgY29uc3QgY2FuZGlkYXRlczogX19lc3JpLkdyYXBoaWNbXSA9IFtdO1xuICAgIGNvbnN0IHJlc3RyaWN0VG9QcmVmZXJyZWQgPSBwcmVmZXJyZWRMYXllcnMubGVuZ3RoID4gMDtcblxuICAgIGZvciAoY29uc3QgciBvZiBoaXQ/LnJlc3VsdHMgfHwgW10pIHtcbiAgICAgIGlmICghciB8fCB0eXBlb2YgciAhPT0gXCJvYmplY3RcIikgY29udGludWU7XG4gICAgICBjb25zdCBncmFwaGljID1cbiAgICAgICAgXCJncmFwaGljXCIgaW4gciAmJiAociBhcyBhbnkpLmdyYXBoaWNcbiAgICAgICAgICA/ICgociBhcyBhbnkpLmdyYXBoaWMgYXMgX19lc3JpLkdyYXBoaWMpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgaWYgKCFncmFwaGljKSBjb250aW51ZTtcblxuICAgICAgY29uc3QgcmF3TGF5ZXI6IGFueSA9IGdyYXBoaWMubGF5ZXI7XG4gICAgICBpZiAodGhpcy5pc0hpZ2hsaWdodExheWVyKHJhd0xheWVyKSkgY29udGludWU7XG5cbiAgICAgIGNvbnN0IGxheWVyID0gdGhpcy50b0xpdmVNYXBMYXllcihcbiAgICAgICAgZ2V0UXVlcnlhYmxlTGF5ZXIocmF3TGF5ZXIpIHx8IHJhd0xheWVyLFxuICAgICAgICBtYXAsXG4gICAgICApO1xuICAgICAgaWYgKCFsYXllciB8fCAhdGhpcy5pc0FncmljdWx0dXJhbEZpZWxkTGF5ZXIobGF5ZXIpKSBjb250aW51ZTtcbiAgICAgIGlmICghYWN0aXZlVmlldyB8fCAhdGhpcy5pc0xheWVyRWZmZWN0aXZlbHlWaXNpYmxlKGxheWVyLCBhY3RpdmVWaWV3KSkgY29udGludWU7XG4gICAgICBpZiAoIXRoaXMuaXNBZ3JpY3VsdHVyYWxGaWVsZEdyYXBoaWMoZ3JhcGhpYywgbGF5ZXIpKSBjb250aW51ZTtcbiAgICAgIGlmIChcbiAgICAgICAgcmVzdHJpY3RUb1ByZWZlcnJlZCAmJlxuICAgICAgICAhcHJlZmVycmVkTGF5ZXJzLnNvbWUoKEwpID0+IHRoaXMubGF5ZXJLZXlzTWF0Y2goTCwgbGF5ZXIpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnZW9tVHlwZSA9IFN0cmluZyhncmFwaGljLmdlb21ldHJ5Py50eXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBpc1BvbHlnb25MaWtlID1cbiAgICAgICAgIWdlb21UeXBlIHx8IGdlb21UeXBlID09PSBcInBvbHlnb25cIiB8fCBnZW9tVHlwZSA9PT0gXCJtdWx0aXBvbHlnb25cIjtcbiAgICAgIGNvbnN0IGhhc0F0dHJpYnV0ZXMgPVxuICAgICAgICAhIWdyYXBoaWMuYXR0cmlidXRlcyAmJiBPYmplY3Qua2V5cyhncmFwaGljLmF0dHJpYnV0ZXMpLmxlbmd0aCA+IDA7XG5cbiAgICAgIGlmIChnZW9tVHlwZSAmJiAhaXNQb2x5Z29uTGlrZSkgY29udGludWU7XG4gICAgICBpZiAoIWhhc0F0dHJpYnV0ZXMgJiYgIWdyYXBoaWMuZ2VvbWV0cnkpIGNvbnRpbnVlO1xuXG4gICAgICBjYW5kaWRhdGVzLnB1c2goZ3JhcGhpYyk7XG4gICAgfVxuXG4gICAgaWYgKCFjYW5kaWRhdGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAocmVzdHJpY3RUb1ByZWZlcnJlZCkge1xuICAgICAgZm9yIChjb25zdCBncmFwaGljIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLnRvTGl2ZU1hcExheWVyKFxuICAgICAgICAgIGdldFF1ZXJ5YWJsZUxheWVyKGdyYXBoaWMubGF5ZXIpIHx8IGdyYXBoaWMubGF5ZXIsXG4gICAgICAgICAgbWFwLFxuICAgICAgICApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbGF5ZXIgJiZcbiAgICAgICAgICBwcmVmZXJyZWRMYXllcnMuc29tZSgoTCkgPT4gdGhpcy5sYXllcktleXNNYXRjaChMLCBsYXllcikpICYmXG4gICAgICAgICAgKGxheWVyIGFzIGFueSkudmlzaWJsZSAhPT0gZmFsc2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIGdyYXBoaWM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZ3JhcGhpYyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICBjb25zdCBsYXllcjogYW55ID0gZ3JhcGhpYy5sYXllcjtcbiAgICAgIGlmIChsYXllcj8udmlzaWJsZSAhPT0gZmFsc2UpIHJldHVybiBncmFwaGljO1xuICAgIH1cblxuICAgIHJldHVybiBjYW5kaWRhdGVzWzBdO1xuICB9O1xuXG4gIHByaXZhdGUgaXNIaWdobGlnaHRMYXllcihsYXllcjogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWQgPSBTdHJpbmcobGF5ZXI/LmlkIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgdGl0bGUgPSBTdHJpbmcobGF5ZXI/LnRpdGxlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGlkID09PSBcImFncmktcG9seWdvbi1oaWdobGlnaHRcIiB8fFxuICAgICAgdGl0bGUuaW5jbHVkZXMoXCJzZWxlY3RlZCBwb2x5Z29uIGhpZ2hsaWdodFwiKSB8fFxuICAgICAgdGl0bGUuaW5jbHVkZXMoXCJza2V0Y2hcIik7XG4gIH1cblxuICAvKiogQSBzdWJsYXllciBpcyBjbGlja2FibGUgb25seSB3aGVuIGl0IGFuZCBldmVyeSBwYXJlbnQgYXJlIHZpc2libGUuICovXG4gIHByaXZhdGUgaXNMYXllckVmZmVjdGl2ZWx5VmlzaWJsZShcbiAgICBsYXllcjogYW55LFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgKTogYm9vbGVhbiB7XG4gICAgaWYgKCFsYXllciB8fCB0aGlzLmlzSGlnaGxpZ2h0TGF5ZXIobGF5ZXIpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGxldCBjdXJyZW50OiBhbnkgPSBsYXllcjtcbiAgICB3aGlsZSAoY3VycmVudCAmJiAhc2Vlbi5oYXMoY3VycmVudCkpIHtcbiAgICAgIHNlZW4uYWRkKGN1cnJlbnQpO1xuICAgICAgaWYgKGN1cnJlbnQudmlzaWJsZSA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudCB8fCBjdXJyZW50LmxheWVyIHx8IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNjYWxlID0gTnVtYmVyKCh2aWV3IGFzIGFueSk/LnNjYWxlIHx8IDApO1xuICAgIGNvbnN0IG1pblNjYWxlID0gTnVtYmVyKGxheWVyLm1pblNjYWxlIHx8IDApO1xuICAgIGNvbnN0IG1heFNjYWxlID0gTnVtYmVyKGxheWVyLm1heFNjYWxlIHx8IDApO1xuICAgIGlmIChzY2FsZSA+IDAgJiYgbWluU2NhbGUgPiAwICYmIHNjYWxlID4gbWluU2NhbGUpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoc2NhbGUgPiAwICYmIG1heFNjYWxlID4gMCAmJiBzY2FsZSA8IG1heFNjYWxlKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIFN0cmluZyhsYXllci5kZWZpbml0aW9uRXhwcmVzc2lvbiB8fCBcIjE9MVwiKS50cmltKCkgIT09IFwiMT0wXCI7XG4gIH1cblxuICBwcml2YXRlIGlzQWdyaWN1bHR1cmFsRmllbGRMYXllcihsYXllcjogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKCFsYXllcikgcmV0dXJuIGZhbHNlO1xuICAgIC8vIEdyb3VwIExheWVyIGZvbGRlcnMgYXJlIG5vdCBmaWVsZCBwb2x5Z29ucyDigJQgbmV2ZXIgYWNjZXB0IHRoZW0gZm9yIGNsaWNrLlxuICAgIGlmIChpc01hcEltYWdlR3JvdXBTdWJsYXllcihsYXllcikpIHJldHVybiBmYWxzZTtcbiAgICAvLyBQcmVmZXIgcXVlcnlhYmxlIGxheWVycywgYnV0IHRpdGxlL3VybCBpZGVudGl0eSBpcyBlbm91Z2ggdG8gYWNjZXB0IGFcbiAgICAvLyBsaXZlIE1hcEltYWdlIGxlYWYgdGhhdCBpcyBzdGlsbCBoeWRyYXRpbmcgaXRzIHF1ZXJ5IG1ldGhvZHMuXG4gICAgY29uc3QgaWRlbnRpdHkgPSBgJHtsYXllci50aXRsZSB8fCBcIlwifSAke2xheWVyLnVybCB8fCBcIlwifSAke2xheWVyLnBhcmVudD8udGl0bGUgfHwgXCJcIn1gLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgbG9va3NBZ3JpID0gL1xcYmFncmlcXGJ8YWdyaWN1bHR1cmV8cWlzaGxvcS8udGVzdChpZGVudGl0eSk7XG4gICAgaWYgKCFpc1F1ZXJ5YWJsZUZpZWxkTGF5ZXIobGF5ZXIpICYmICFsb29rc0FncmkpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBnZW9tZXRyeVR5cGUgPSBTdHJpbmcobGF5ZXIuZ2VvbWV0cnlUeXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGdlb21ldHJ5VHlwZSAmJiBnZW9tZXRyeVR5cGUgIT09IFwicG9seWdvblwiKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgZmllbGRzOiBhbnlbXSA9IEFycmF5LmlzQXJyYXkobGF5ZXIuZmllbGRzKSA/IGxheWVyLmZpZWxkcyA6IFtdO1xuICAgIGNvbnN0IG5hbWVzID0gbmV3IFNldChmaWVsZHMubWFwKChmaWVsZCkgPT4gU3RyaW5nKGZpZWxkPy5uYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkpKTtcbiAgICBpZiAobmFtZXMuaGFzKFwidW5pcXVlaWRcIikgfHwgbmFtZXMuaGFzKFwiY3JvcF9pZFwiKSB8fCBuYW1lcy5oYXMoXCJ0dXJpXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBsb29rc0FncmkgYWxvbmUgaXMgT0sgZm9yIGEgaHlkcmF0aW5nIGxlYWY7IGdyb3VwcyBhbHJlYWR5IHJlamVjdGVkIGFib3ZlLlxuICAgIHJldHVybiBsb29rc0Fncmk7XG4gIH1cblxuICBwcml2YXRlIGlzQWdyaWN1bHR1cmFsRmllbGRHcmFwaGljKGdyYXBoaWM6IF9fZXNyaS5HcmFwaGljLCBsYXllcjogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgZ2VvbWV0cnlUeXBlID0gU3RyaW5nKGdyYXBoaWM/Lmdlb21ldHJ5Py50eXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGdlb21ldHJ5VHlwZSAmJiBnZW9tZXRyeVR5cGUgIT09IFwicG9seWdvblwiICYmIGdlb21ldHJ5VHlwZSAhPT0gXCJtdWx0aXBvbHlnb25cIikgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGF0dHJzID0gZ3JhcGhpYz8uYXR0cmlidXRlcyB8fCB7fTtcbiAgICBjb25zdCBrZXlzID0gbmV3IFNldChPYmplY3Qua2V5cyhhdHRycykubWFwKChrZXkpID0+IGtleS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgcmV0dXJuIGtleXMuaGFzKFwidW5pcXVlaWRcIikgfHwga2V5cy5oYXMoXCJjcm9wX2lkXCIpIHx8IGtleXMuaGFzKFwidHVyaVwiKSB8fFxuICAgICAgdGhpcy5pc0FncmljdWx0dXJhbEZpZWxkTGF5ZXIobGF5ZXIpO1xuICB9XG4gIHByaXZhdGUgZ2V0Q2xpY2tUYXJnZXRMYXllcnMoXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICApOiBfX2VzcmkuRmVhdHVyZUxheWVyW10ge1xuICAgIGNvbnN0IHsgZmVhdHVyZUxheWVycywgbGF5ZXJLZXlUb0RzSWQgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgZHNLZXlzID0gT2JqZWN0LmtleXMobGF5ZXJLZXlUb0RzSWQgfHwge30pO1xuICAgIGNvbnN0IG1hcCA9IHZpZXcubWFwO1xuICAgIGNvbnN0IGNvbmZpZ3VyZWRMYXllcnMgPSBmZWF0dXJlTGF5ZXJzIHx8IFtdO1xuICAgIGNvbnN0IGxpdmVSb290cyA9XG4gICAgICAoKG1hcCBhcyBhbnkpPy5hbGxMYXllcnM/LnRvQXJyYXk/LigpIGFzIGFueVtdKSB8fCBbXTtcbiAgICAvLyBNYXBJbWFnZSBwYXJlbnRzIGFyZSBub3QgcXVlcnlhYmxlIOKAlCBleHBhbmQgdG8gYWdyaS9mZWF0dXJlIHN1YmxheWVycy5cbiAgICBjb25zdCBsaXZlTWFwTGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW10gPSBbXTtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgcHVzaExpdmUgPSAobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgaWYgKCFsYXllciB8fCAhaXNRdWVyeWFibGVGaWVsZExheWVyKGxheWVyKSkgcmV0dXJuO1xuICAgICAgY29uc3Qga2V5ID1cbiAgICAgICAgZ2V0RXZhcG9MYXllck1hcEtleShsYXllcikgfHxcbiAgICAgICAgU3RyaW5nKGxheWVyLnVybCB8fCBsYXllci5pZCB8fCBcIlwiKTtcbiAgICAgIGlmICgha2V5IHx8IHNlZW4uaGFzKGtleSkpIHJldHVybjtcbiAgICAgIHNlZW4uYWRkKGtleSk7XG4gICAgICBsaXZlTWFwTGF5ZXJzLnB1c2gobGF5ZXIgYXMgX19lc3JpLkZlYXR1cmVMYXllcik7XG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IHJvb3Qgb2YgbGl2ZVJvb3RzKSB7XG4gICAgICAvLyBXYWxrIGdyb3VwcyBmdWxseSDigJQgbmV2ZXIgcHVzaCB0aGUgR3JvdXAgTGF5ZXIgbm9kZSBpdHNlbGZcbiAgICAgIC8vIChGZWF0dXJlTGF5ZXIjbG9hZCBmYWlscyB3aXRoIHVuc3VwcG9ydGVkLXR5cGUgXCJHcm91cCBMYXllclwiKS5cbiAgICAgIGZvciAoY29uc3QgbGVhZiBvZiBjb2xsZWN0UXVlcnlhYmxlRmllbGRMYXllcnMocm9vdCkpIHtcbiAgICAgICAgcHVzaExpdmUobGVhZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY2FuZGlkYXRlcyA9IEFycmF5LmZyb20oXG4gICAgICBuZXcgU2V0PF9fZXNyaS5GZWF0dXJlTGF5ZXI+KFtcbiAgICAgICAgLi4uY29uZmlndXJlZExheWVycyxcbiAgICAgICAgLi4ubGl2ZU1hcExheWVycyxcbiAgICAgIF0pLFxuICAgICk7XG5cbiAgICByZXR1cm4gY2FuZGlkYXRlc1xuICAgICAgLm1hcCgobGF5ZXIpID0+IHRoaXMudG9MaXZlTWFwTGF5ZXIobGF5ZXIsIG1hcCkgfHwgbGF5ZXIpXG4gICAgICAuZmlsdGVyKChsYXllcjogYW55KSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5pc0xheWVyRWZmZWN0aXZlbHlWaXNpYmxlKGxheWVyLCB2aWV3KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIXRoaXMuaXNBZ3JpY3VsdHVyYWxGaWVsZExheWVyKGxheWVyKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBrZXkgPVxuICAgICAgICAgIGdldEV2YXBvTGF5ZXJNYXBLZXkobGF5ZXIpIHx8XG4gICAgICAgICAgU3RyaW5nKGxheWVyLnVybCB8fCBsYXllci5pZCB8fCBcIlwiKTtcbiAgICAgICAgaWYgKHRoaXMuaXNEYXNoYm9hcmRFbWJlZGRlZCgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCFkc0tleXMubGVuZ3RoKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuICEhbGF5ZXJLZXlUb0RzSWRba2V5XTtcbiAgICAgIH0pIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXJbXTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVzb2x2ZUNsaWNrTGF5ZXJzKFxuICAgIHZpZXc6IF9fZXNyaS5NYXBWaWV3IHwgX19lc3JpLlNjZW5lVmlldyxcbiAgICBqbXY6IEppbXVNYXBWaWV3LFxuICApOiBQcm9taXNlPF9fZXNyaS5GZWF0dXJlTGF5ZXJbXT4ge1xuICAgIGxldCBsYXllcnMgPSB0aGlzLmdldENsaWNrVGFyZ2V0TGF5ZXJzKHZpZXcpO1xuICAgIGlmIChsYXllcnMubGVuZ3RoKSByZXR1cm4gbGF5ZXJzO1xuXG4gICAgYXdhaXQgdGhpcy5pbml0aWFsaXplTWFwQ29ubmVjdGlvbihqbXYpO1xuICAgIGxheWVycyA9IHRoaXMuZ2V0Q2xpY2tUYXJnZXRMYXllcnModmlldyk7XG4gICAgaWYgKGxheWVycy5sZW5ndGgpIHJldHVybiBsYXllcnM7XG5cbiAgICAvLyBMYXN0IHJlc29ydDogc2NhbiBtYXAgYWdhaW4gYWZ0ZXIgbGF5ZXJzIG1heSBoYXZlIGZpbmlzaGVkIGxvYWRpbmdcbiAgICAvLyAocG9ydGFsIC8gTWFwSW1hZ2Ugc3VibGF5ZXJzIG9mdGVuIGFyZW4ndCBxdWVyeWFibGUgYXQgZmlyc3QgY29ubmVjdCkuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcExheWVycyA9IGdldEFsbEZlYXR1cmVMYXllcnNGcm9tTWFwKHZpZXcubWFwKTtcbiAgICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbWFwTGF5ZXJzKSB7XG4gICAgICAgIGF3YWl0IHNhZmVMb2FkTWFwTGF5ZXIobGF5ZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldENsaWNrVGFyZ2V0TGF5ZXJzKHZpZXcpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlQ2xpY2tGZWF0dXJlQXQgPSBhc3luYyAoXG4gICAgZXY6IF9fZXNyaS5WaWV3Q2xpY2tFdmVudCxcbiAgICB2aWV3OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXcsXG4gICAgbGF5ZXJzOiBfX2VzcmkuRmVhdHVyZUxheWVyW10sXG4gICk6IFByb21pc2U8e1xuICAgIGdyYXBoaWM6IF9fZXNyaS5HcmFwaGljO1xuICAgIHF1ZXJ5SGl0TGF5ZXI6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCBudWxsO1xuICB9IHwgbnVsbD4gPT4ge1xuICAgIGNvbnN0IGNsaWNrU2NyZWVuUG9pbnQgPSB7IHg6IGV2LngsIHk6IGV2LnkgfTtcbiAgICBjb25zdCBxdWVyeUdlb21ldHJ5ID0gdGhpcy50b0NsaWNrUXVlcnlHZW9tZXRyeShcbiAgICAgIHZpZXcsXG4gICAgICBjbGlja1NjcmVlblBvaW50LFxuICAgICAgZXYubWFwUG9pbnQsXG4gICAgKTtcblxuICAgIGNvbnN0IHF1ZXJ5TGF5ZXJzID1cbiAgICAgIGxheWVycy5sZW5ndGggPiAwXG4gICAgICAgID8gbGF5ZXJzXG4gICAgICAgIDogKHRoaXMuZ2V0Q2xpY2tUYXJnZXRMYXllcnModmlldykgYXMgX19lc3JpLkZlYXR1cmVMYXllcltdKTtcblxuICAgIC8vIGhpdFRlc3QgLyBpZGVudGlmeSBjYW4gcmVoeWRyYXRlIE1hcEltYWdlIHN1YmxheWVycyBhbmQgY2xlYXIgdGhlaXJcbiAgICAvLyBydW50aW1lIGRlZmluaXRpb25FeHByZXNzaW9uIChkaXN0cmljdCBmaWx0ZXIpIOKAlCBzbmFwc2hvdCBldmVyeSBjbGlja1xuICAgIC8vIGNhbmRpZGF0ZSBub3cgYW5kIHJlc3RvcmUgYW55IGRyaWZ0IHN5bmNocm9ub3VzbHkgYWZ0ZXJ3YXJkcywgYmVmb3JlXG4gICAgLy8gYW4gdW5maWx0ZXJlZCBleHBvcnQgZ2V0cyBwYWludGVkIChvdGhlci1kaXN0cmljdCBmaWVsZHMgZmxhc2gpLlxuICAgIGNvbnN0IGRlZmluaXRpb25TbmFwc2hvdCA9IHRoaXMuc25hcHNob3REZWZpbml0aW9uRXhwcmVzc2lvbnMoW1xuICAgICAgLi4ubGF5ZXJzLFxuICAgICAgLi4ucXVlcnlMYXllcnMsXG4gICAgXSk7XG5cbiAgICAvLyBBbHdheXMgaGl0LXRlc3QgdGhlIHJlbmRlcmVkIG1hcCB3aXRob3V0IGFuIGluY2x1ZGUgcmVzdHJpY3Rpb24uIE1hcC1pbWFnZVxuICAgIC8vIHN1YmxheWVycyBmcmVxdWVudGx5IGhhdmUgcnVudGltZSBpZHMvVVJMcyB0aGF0IGRpZmZlciBmcm9tIGNvbmZpZ3VyZWQgRFNcbiAgICAvLyB3cmFwcGVyczsgcmVzdHJpY3RpbmcgaW5jbHVkZS9wcmVmZXJyZWQgbGF5ZXJzIG1ha2VzIHZpc2libGUgZmllbGRzIHVuY2xpY2thYmxlLlxuICAgIGNvbnN0IGhpdCA9IGF3YWl0IHZpZXcuaGl0VGVzdChldik7XG4gICAgdGhpcy5yZXN0b3JlRHJpZnRlZERlZmluaXRpb25FeHByZXNzaW9ucyhkZWZpbml0aW9uU25hcHNob3QpO1xuICAgIC8vIE9ubHkgYWNjZXB0IGdyYXBoaWNzIGJlbG9uZ2luZyB0byB0aGUgY29uZmlndXJlZCBhZ3JpY3VsdHVyYWwgbGF5ZXJzLlxuICAgIC8vIFdlYk1hcCBza2V0Y2gvbWFwLW5vdGVzIGdyYXBoaWNzIGNhbiBjb250YWluIHBhZ2Utc2l6ZWQgcG9seWdvbnM7IHRyZWF0aW5nXG4gICAgLy8gb25lIGFzIGEgZmllbGQgbWFrZXMgZ29UbyB6b29tIG91dCB0byBhIHdvcmxkIGV4dGVudC5cbiAgICAvLyBFbXB0eSBgbGF5ZXJzYCBzdGlsbCBhbGxvd3MgYWdyaWN1bHR1cmFsIGhpdHMgKG5vIHByZWZlcnJlZCByZXN0cmljdGlvbikuXG4gICAgbGV0IGcgPSB0aGlzLnBpY2tDbGlja0dyYXBoaWMoaGl0LCBsYXllcnMpO1xuICAgIGxldCBxdWVyeUhpdExheWVyOiBfX2VzcmkuRmVhdHVyZUxheWVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBpZiAoIWcgJiYgcXVlcnlHZW9tZXRyeSAmJiBxdWVyeUxheWVycy5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgcXVlcnlMYXllcnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTGF5ZXJFZmZlY3RpdmVseVZpc2libGUobGF5ZXIsIHZpZXcpKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCF0aGlzLmlzQWdyaWN1bHR1cmFsRmllbGRMYXllcihsYXllcikpIGNvbnRpbnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIE5FVkVSIHF1ZXJ5IHRoZSBsaXZlIGxheWVyIGhlcmU6IG9uIGEgTWFwSW1hZ2Ugc3VibGF5ZXIgdGhhdFxuICAgICAgICAgIC8vIHJlaHlkcmF0ZXMgaXQgYW5kIGNsZWFycyB0aGUgdHVtYW4gZGVmaW5pdGlvbkV4cHJlc3Npb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG1hcCBicmllZmx5IGV4cG9ydHMvcGFpbnRzIGV2ZXJ5IGRpc3RyaWN0J3MgZmllbGRzIHdoaWxlIHRoZVxuICAgICAgICAgIC8vIHBvcHVwIHpvb20gcnVucy4gVXNlIHRoZSBkZXRhY2hlZCBvZmYtbWFwIGNsaWVudCBpbnN0ZWFkIGFuZFxuICAgICAgICAgIC8vIG1pcnJvciB0aGUgbGl2ZSBmaWx0ZXIgb250byB0aGUgcXVlcnkgV0hFUkUuXG4gICAgICAgICAgY29uc3QgbGl2ZVdoZXJlID0gU3RyaW5nKFxuICAgICAgICAgICAgKGxheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gfHwgXCJcIixcbiAgICAgICAgICApLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCBkZXRhY2hlZCA9IGF3YWl0IHRoaXMuZ2V0RGV0YWNoZWRRdWVyeUxheWVyKGxheWVyKTtcbiAgICAgICAgICBjb25zdCBxdWVyeVRhcmdldCA9IGRldGFjaGVkIHx8IGxheWVyO1xuICAgICAgICAgIGNvbnN0IHEgPSBxdWVyeVRhcmdldC5jcmVhdGVRdWVyeSgpO1xuICAgICAgICAgIHEuZ2VvbWV0cnkgPSBxdWVyeUdlb21ldHJ5O1xuICAgICAgICAgIHEuc3BhdGlhbFJlbGF0aW9uc2hpcCA9IFwiaW50ZXJzZWN0c1wiO1xuICAgICAgICAgIHEub3V0RmllbGRzID0gW1wiKlwiXTtcbiAgICAgICAgICBxLnJldHVybkdlb21ldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICBxLm51bSA9IDE7XG4gICAgICAgICAgaWYgKGxpdmVXaGVyZSAmJiBsaXZlV2hlcmUgIT09IFwiMT0xXCIpIHEud2hlcmUgPSBsaXZlV2hlcmU7XG4gICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgcXVlcnlUYXJnZXQucXVlcnlGZWF0dXJlcyhxKTtcbiAgICAgICAgICBpZiAoIWRldGFjaGVkKSB7XG4gICAgICAgICAgICAvLyBMaXZlLWxheWVyIGZhbGxiYWNrIChubyBVUkwpIOKAlCByZXBhaXIgYW55IGRyaWZ0IGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlRHJpZnRlZERlZmluaXRpb25FeHByZXNzaW9ucyhkZWZpbml0aW9uU25hcHNob3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzLmZlYXR1cmVzPy5bMF0pIHtcbiAgICAgICAgICAgIGcgPSByZXMuZmVhdHVyZXNbMF07XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBMSVZFIGxheWVyIGFzIHRoZSBoaXQgbGF5ZXIg4oCUIGRvd25zdHJlYW0gbGF5ZXIta2V5IC9cbiAgICAgICAgICAgIC8vIGRzSWQgLyBhbGlhcyByZXNvbHV0aW9uIG11c3QgbWFwIGJhY2sgdG8gdGhlIG1hcCdzIG93biBsYXllci5cbiAgICAgICAgICAgIHF1ZXJ5SGl0TGF5ZXIgPSBsYXllcjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLyogdHJ5IG5leHQgbGF5ZXIgKi9cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZykgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHsgZ3JhcGhpYzogZywgcXVlcnlIaXRMYXllciB9O1xuICB9O1xuXG4gIC8qKiBDYXNlLWluc2Vuc2l0aXZlIGF0dHJpYnV0ZSBsb29rdXAg4oCUIHRoZSBwb2x5Z29uIGxheWVyJ3Mgam9pbiBmaWVsZCBjYXNpbmcgaXMgbm90IGd1YXJhbnRlZWQuICovXG4gIHByaXZhdGUgZmluZEF0dHJpYnV0ZVZhbHVlQ2FzZUluc2Vuc2l0aXZlKFxuICAgIGF0dHJpYnV0ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGZpZWxkTmFtZTogc3RyaW5nLFxuICApOiBhbnkge1xuICAgIGlmICghYXR0cmlidXRlcykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdGFyZ2V0ID0gZmllbGROYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3Qga2V5ID0gT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZmluZChcbiAgICAgIChrKSA9PiBrLnRvTG93ZXJDYXNlKCkgPT09IHRhcmdldCxcbiAgICApO1xuICAgIHJldHVybiBrZXkgPyBhdHRyaWJ1dGVzW2tleV0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlbGxzIEFncmlHcmFmZjEwICh2aWEgQWdyaUxvY2FsaXphdGlvbiwgdGhlIGNlbnRyYWwgZmlsdGVyIGh1Yikgd2hpY2hcbiAgICogcG9seWdvbiBpcyBjdXJyZW50bHkgaW5zcGVjdGVkIHNvIGl0cyBjaGFydCBjYW4gc3dpdGNoIHRvIHNob3dpbmcgdGhhdFxuICAgKiBzaW5nbGUgcG9seWdvbidzIHZlZ2V0YXRpb24taW5kZXggc2VyaWVzIGluc3RlYWQgb2YgdGhlIHJlZ2lvbi13aWRlXG4gICAqIHRpbWVzZXJpZXMuIE1pcnJvcnMgdGhlIHdpZGdldFNlbGVjdGlvbkNoYW5nZWQgc2hhcGUgQWdyaUdyYWZmV2lkZ2V0XG4gICAqIGl0c2VsZiBhbHJlYWR5IGRpc3BhdGNoZXMgb24gaXRzIG93biByb3ctY2xpY2sgc2VsZWN0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBub3RpZnlHcmFmZlBvbHlnb25TZWxlY3Rpb24gPSAoXG4gICAgdW5pcXVlaWQ6IHN0cmluZyxcbiAgICBwb2x5Z29uTW9kZTogYm9vbGVhbixcbiAgICBjbGlja2VkQXQ/OiBudW1iZXIsXG4gICk6IHZvaWQgPT4ge1xuICAgIHRyeSB7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ3aWRnZXRTZWxlY3Rpb25DaGFuZ2VkXCIsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIHNvdXJjZTogXCJBZ3JpUG9wdXBcIixcbiAgICAgICAgICAgIHBvbHlnb25Nb2RlLFxuICAgICAgICAgICAgdW5pcXVlaWQ6IHBvbHlnb25Nb2RlID8gdW5pcXVlaWQgOiBcIlwiLFxuICAgICAgICAgICAgLy8gVGltZXN0YW1wIG9mIHRoZSBPUklHSU5BTCBtYXAgY2xpY2sgKGNhcHR1cmVkIGJlZm9yZSB0aGlzXG4gICAgICAgICAgICAvLyB3aWRnZXQncyBvd24gYXN5bmMgYXR0cmlidXRlLXJlc29sdXRpb24gY2hhaW4pLCBub3Qgb2YgdGhpc1xuICAgICAgICAgICAgLy8gZGlzcGF0Y2gg4oCUIGxldHMgZG93bnN0cmVhbSBsaXN0ZW5lcnMgKEFncmlHcmFmZjEwKSBkZXRlY3QgYW5kXG4gICAgICAgICAgICAvLyBpZ25vcmUgYSBzdGFsZSBub3RpZmljYXRpb24gdGhhdCByZXNvbHZlcyBhZnRlciBhIG5ld2VyIGNsaWNrXG4gICAgICAgICAgICAvLyB3YXMgYWxyZWFkeSBhcHBsaWVkIChzZWUgQWdyaUdyYWZmMTAncyBfbGFzdEFwcGxpZWRQb2x5Z29uQ2xpY2tlZEF0KS5cbiAgICAgICAgICAgIGNsaWNrZWRBdDogY2xpY2tlZEF0ID8/IERhdGUubm93KCksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBpZ25vcmUgKi9cbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBicm9hZGNhc3RQb3B1cFZpc2liaWxpdHkgPSAob3BlbjogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHBpbm5lZCA9ICEhdGhpcy5zdGF0ZS5waW5Ub0Nvcm5lcjtcbiAgICB0cnkge1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiYWdyaU1hcFBvcHVwVmlzaWJpbGl0eVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBvcGVuOiAhIW9wZW4sXG4gICAgICAgICAgICBwaW5uZWQsXG4gICAgICAgICAgICBzb3VyY2U6IFwiQWdyaVBvcHVwXCIsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBpZ25vcmUgKi9cbiAgICB9XG4gICAgaWYgKG9wZW4pIHtcbiAgICAgIC8vIFJlLW5vdGlmeSBhZnRlciBwYWludCBzbyBORFZJIGNhbiBtZWFzdXJlIHRoZSByZWFsIHBvcHVwIGJveC5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmlNYXBQb3B1cFZpc2liaWxpdHlcIiwge1xuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBpbm5lZCxcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlOiBcIkFncmlQb3B1cFwiLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVkVHX0lOREVYX0ZJRUxEUyA9IFtcbiAgICBcIm5kdmlcIixcbiAgICBcInNhdmlcIixcbiAgICBcInJ2aVwiLFxuICAgIFwiY2lcIixcbiAgICBcImV2aVwiLFxuICAgIFwibmR3aVwiLFxuICBdO1xuXG4gIC8qKlxuICAgKiBMYXRlc3QtZGF5IHZlZ2V0YXRpb24gaW5kZXggdmFsdWVzIGZvciB0aGUgc2VsZWN0ZWQgcG9seWdvbiwgc2hvd24gaW5cbiAgICogdGhlIHBvcHVwLiBSZXVzZXMgcXVlcnlWZWdldGF0aW9uU2VyaWVzRm9yVW5pcXVlSWQgKHF1ZXJpZXMgdGhlXG4gICAqIGFncmlfdmVnZXRhdGlvbl9pbmRpY2VzIEFyY0dJUyB0YWJsZSBkaXJlY3RseSwgc2FtZSBzb3VyY2UgQWdyaUdyYWZmMTAnc1xuICAgKiBjaGFydCB1c2VzKSByYXRoZXIgdGhhbiB0aGUgYXBpLWFncmkgZXhwb3J0LWltYWdlL2F2YWlsYWJsZS1kYXRlcyBSRVNUXG4gICAqIGVuZHBvaW50cyDigJQgdGhvc2UgYXJlIGZvciBmZXRjaGluZyBhIHJlbmRlcmVkIHJhc3RlciBmb3IgYSBzcGVjaWZpY1xuICAgKiBjaG9zZW4gZGF0ZSwgd2hpY2ggaXMgdW5uZWNlc3NhcnkgaGVyZTsgd2Ugb25seSBuZWVkIHRoZSBzY2FsYXIgaW5kZXhcbiAgICogdmFsdWVzIGZvciB3aGljaGV2ZXIgZGF0ZSBpcyBtb3N0IHJlY2VudCwgYW5kIHRoZSB0YWJsZSBhbHJlYWR5IGhhc1xuICAgKiBuZHZpL3NhdmkvcnZpL2NpL2V2aS9uZHdpIGFzIHBsYWluIGZpZWxkcyBwZXIgKHVuaXF1ZWlkLCByYXN0ZXJfZGF0ZSkuXG4gICAqL1xuICBwcml2YXRlIGZldGNoTGF0ZXN0VmVnZXRhdGlvbkluZGljZXMgPSBhc3luYyAoXG4gICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgaWQgPSBTdHJpbmcodW5pcXVlSWQgfHwgXCJcIikudHJpbSgpO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nTGF0ZXN0SW5kaWNlczogZmFsc2UsXG4gICAgICAgIGxhdGVzdEluZGV4RGF0ZTogbnVsbCxcbiAgICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IG51bGwsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMuX2xhdGVzdEluZGljZXNSZXF1ZXN0SWQ7XG4gICAgZXZhcG9NYXBDbGlja0RlYnVnKFwidmVnZXRhdGlvbjpyZXF1ZXN0XCIsIHtcbiAgICAgIHVuaXF1ZWlkOiBpZCxcbiAgICAgIHNvdXJjZTogXCJhZ3JpX3ZlZ2V0YXRpb25faW5kaWNlcy9GZWF0dXJlU2VydmVyLzFcIixcbiAgICAgIHJlcXVlc3RJZCxcbiAgICB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvYWRpbmdMYXRlc3RJbmRpY2VzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJvd3MgPSBhd2FpdCBxdWVyeVZlZ2V0YXRpb25TZXJpZXNGb3JVbmlxdWVJZChpZCk7XG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCB8fCByZXF1ZXN0SWQgIT09IHRoaXMuX2xhdGVzdEluZGljZXNSZXF1ZXN0SWQpIHJldHVybjtcblxuICAgICAgaWYgKCFyb3dzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkaW5nTGF0ZXN0SW5kaWNlczogZmFsc2UsXG4gICAgICAgICAgbGF0ZXN0SW5kZXhEYXRlOiBudWxsLFxuICAgICAgICAgIGxhdGVzdEluZGV4VmFsdWVzOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBSb3dzIGNvbWUgYmFjayBvcmRlcmVkIGJ5IHJhc3Rlcl9kYXRlIEFTQyDigJQgdGhlIGxhc3Qgb25lIGlzIHRoZVxuICAgICAgLy8gbW9zdCByZWNlbnQgcHJvY2Vzc2VkIGRhdGUgZm9yIHRoaXMgcG9seWdvbi5cbiAgICAgIGNvbnN0IGxhdGVzdCA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXSBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgICAgY29uc3QgZGF0ZSA9IGZvcm1hdEFyY2dpc0RhdGVUb1ltZChsYXRlc3QucmFzdGVyX2RhdGUpO1xuICAgICAgY29uc3QgdmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIEFncmlQb2x5Z29uLlZFR19JTkRFWF9GSUVMRFMpIHtcbiAgICAgICAgY29uc3QgdiA9IE51bWJlcihsYXRlc3RbZmllbGRdKTtcbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2KSkgdmFsdWVzW2ZpZWxkXSA9IHY7XG4gICAgICB9XG4gICAgICBldmFwb01hcENsaWNrRGVidWcoXCJ2ZWdldGF0aW9uOnJlc3BvbnNlXCIsIHtcbiAgICAgICAgdW5pcXVlaWQ6IGlkLFxuICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgIHJvd0NvdW50OiByb3dzLmxlbmd0aCxcbiAgICAgICAgbGF0ZXN0RGF0ZTogZGF0ZSxcbiAgICAgICAgdmFsdWVzLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nTGF0ZXN0SW5kaWNlczogZmFsc2UsXG4gICAgICAgIGxhdGVzdEluZGV4RGF0ZTogZGF0ZSxcbiAgICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IE9iamVjdC5rZXlzKHZhbHVlcykubGVuZ3RoID8gdmFsdWVzIDogbnVsbCxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgcmVxdWVzdElkICE9PSB0aGlzLl9sYXRlc3RJbmRpY2VzUmVxdWVzdElkKSByZXR1cm47XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZ0xhdGVzdEluZGljZXM6IGZhbHNlLFxuICAgICAgICBsYXRlc3RJbmRleERhdGU6IG51bGwsXG4gICAgICAgIGxhdGVzdEluZGV4VmFsdWVzOiBudWxsLFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBBZ3JpX3RhYmxlX2RhdGEgaXMgYW4gZXh0ZXJuYWwgVGFibGUgKG5vIGdlb21ldHJ5KSDigJQgdGhlIG1hcCBjbGljayBzdGlsbFxuICAgKiByZXNvbHZlcyB0aGUgcG9seWdvbiBmZWF0dXJlIGZvciBoaWdobGlnaHQvem9vbSwgYnV0IHRoZSBkaXNwbGF5ZWRcbiAgICogYXR0cmlidXRlcyBjb21lIGZyb20gQWdyaV90YWJsZV9kYXRhLCBqb2luZWQgYnkgdW5pcXVlaWQuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHJlc29sdmVEaXNwbGF5QXR0cnMoXG4gICAgcG9seWdvbkF0dHJpYnV0ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsIHwgdW5kZWZpbmVkLFxuICApOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBjb25zdCBqb2luVmFsdWUgPSB0aGlzLmZpbmRBdHRyaWJ1dGVWYWx1ZUNhc2VJbnNlbnNpdGl2ZShcbiAgICAgIHBvbHlnb25BdHRyaWJ1dGVzLFxuICAgICAgQUdSSV9UQUJMRV9KT0lOX0ZJRUxELFxuICAgICk7XG4gICAgaWYgKGpvaW5WYWx1ZSA9PSBudWxsIHx8IFN0cmluZyhqb2luVmFsdWUpLnRyaW0oKSA9PT0gXCJcIikge1xuICAgICAgZXZhcG9NYXBDbGlja1dhcm4oXCJhZ3JpLXRhYmxlLWpvaW46U0tJUC1uby11bmlxdWVpZFwiLCB7XG4gICAgICAgIHBvbHlnb25BdHRyaWJ1dGVLZXlzOiBPYmplY3Qua2V5cyhwb2x5Z29uQXR0cmlidXRlcyB8fCB7fSksXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwb2x5Z29uQXR0cmlidXRlcyB8fCB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGV2YXBvTWFwQ2xpY2tEZWJ1ZyhcImFncmktdGFibGUtam9pbjpyZXF1ZXN0XCIsIHtcbiAgICAgICAgdW5pcXVlaWQ6IFN0cmluZyhqb2luVmFsdWUpLFxuICAgICAgICBzb3VyY2U6IFwiQWdyaV90YWJsZV9kYXRhL0ZlYXR1cmVTZXJ2ZXIvMlwiLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBhZ3JpUmVjb3JkID0gYXdhaXQgcXVlcnlBZ3JpUmVjb3JkQnlVbmlxdWVJZChTdHJpbmcoam9pblZhbHVlKSk7XG4gICAgICBldmFwb01hcENsaWNrRGVidWcoXCJhZ3JpLXRhYmxlLWpvaW46cmVzcG9uc2VcIiwge1xuICAgICAgICB1bmlxdWVpZDogU3RyaW5nKGpvaW5WYWx1ZSksXG4gICAgICAgIGZvdW5kOiBCb29sZWFuKGFncmlSZWNvcmQpLFxuICAgICAgICBhdHRyaWJ1dGVLZXlzOiBPYmplY3Qua2V5cyhhZ3JpUmVjb3JkIHx8IHt9KSxcbiAgICAgIH0pO1xuICAgICAgaWYgKGFncmlSZWNvcmQpIHtcbiAgICAgICAgLy8gS2VlcCBwb2x5Z29uLW9ubHkgdmFsdWVzIChmb3IgZXhhbXBsZSBzdF9hcmVhKHNoYXBlKSkgd2hpbGUgYWxsb3dpbmdcbiAgICAgICAgLy8gdGhlIGpvaW5lZCBBZ3JpIHRhYmxlIHRvIHByb3ZpZGUvb3ZlcnJpZGUgdGhlIHBvcHVwJ3MgYnVzaW5lc3MgZGF0YS5cbiAgICAgICAgcmV0dXJuIHsgLi4uKHBvbHlnb25BdHRyaWJ1dGVzIHx8IHt9KSwgLi4uYWdyaVJlY29yZCB9O1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGV2YXBvTWFwQ2xpY2tXYXJuKFwiQWdyaV90YWJsZV9kYXRhIGxvb2t1cCBmYWlsZWRcIiwge1xuICAgICAgICB1bmlxdWVJZDogam9pblZhbHVlLFxuICAgICAgICBlcnJvcjogKGUgYXMgYW55KT8ubWVzc2FnZSB8fCBTdHJpbmcoZSksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBvbHlnb25BdHRyaWJ1dGVzIHx8IHt9O1xuICB9XG5cbiAgcHJpdmF0ZSBvblZpZXdDbGljayA9IGFzeW5jIChldjogX19lc3JpLlZpZXdDbGlja0V2ZW50KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmlQb2x5Z29uTWFwQ2xpY2tQaGFzZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHBoYXNlOiBcImNsaWNrLXN0YXJ0XCIsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9LFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBiZXN0LWVmZm9ydCBmaWx0ZXIgZ3VhcmQgKi9cbiAgICB9XG4gICAgLy8gQ2FwdHVyZWQgQkVGT1JFIGFueSBhd2FpdHMgYmVsb3cg4oCUIHRoaXMgd2lkZ2V0J3MgYXR0cmlidXRlLXJlc29sdXRpb25cbiAgICAvLyBjaGFpbiAocmVzb2x2ZUNsaWNrTGF5ZXJzL3Jlc29sdmVDbGlja0ZlYXR1cmVBdC9xdWVyeS9yZXNvbHZlRGlzcGxheUF0dHJzKVxuICAgIC8vIGNhbiB0YWtlIG5vdGljZWFibHkgbG9uZ2VyIHRoYW4gQWdyaUdyYWZmMTAncyBvd24sIG1vcmUgZGlyZWN0IG1hcC1jbGlja1xuICAgIC8vIGhhbmRsaW5nIG9mIHRoZSBzYW1lIGNsaWNrLiBJZiB0aGUgdXNlciBjbGlja3MgYSBzZWNvbmQgcG9seWdvbiBiZWZvcmVcbiAgICAvLyB0aGlzIGNoYWluIGZpbmlzaGVzLCB0aGUgc3RhbGUgcmVzdWx0IG11c3Qgbm90IHdpbiDigJQgY2xpY2tlZEF0IGxldHNcbiAgICAvLyBBZ3JpR3JhZmYxMCBkZXRlY3QgYW5kIGRyb3AgaXQuXG4gICAgY29uc3QgY2xpY2tTdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGNsaWNrR2VuZXJhdGlvbiA9ICsrdGhpcy5fY2xpY2tHZW5lcmF0aW9uO1xuICAgIGV2YXBvTWFwQ2xpY2tEZWJ1ZyhcImNsaWNrOnJlY2VpdmVkXCIsIHtcbiAgICAgIGNsaWNrR2VuZXJhdGlvbixcbiAgICAgIHg6IGV2LngsXG4gICAgICB5OiBldi55LFxuICAgICAgbWFwUG9pbnQ6IGV2Lm1hcFBvaW50XG4gICAgICAgID8ge1xuICAgICAgICAgICAgeDogZXYubWFwUG9pbnQueCxcbiAgICAgICAgICAgIHk6IGV2Lm1hcFBvaW50LnksXG4gICAgICAgICAgICB3a2lkOiBldi5tYXBQb2ludC5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IG51bGwsXG4gICAgICAgICAgfVxuICAgICAgICA6IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3QgaXNTdGFsZSA9ICgpID0+XG4gICAgICAhdGhpcy5faXNNb3VudGVkIHx8IGNsaWNrR2VuZXJhdGlvbiAhPT0gdGhpcy5fY2xpY2tHZW5lcmF0aW9uO1xuICAgIGxldCBwb3B1cE9wZW5lZEZvclRoaXNDbGljayA9IGZhbHNlO1xuICAgIGNvbnN0IGptdiA9IHRoaXMuc3RhdGUuamltdU1hcFZpZXc7XG4gICAgY29uc3QgdmlldyA9IGptdj8udmlldztcbiAgICBpZiAoIXZpZXcgfHwgIWptdikge1xuICAgICAgZXZhcG9NYXBDbGlja1dhcm4oXCJvblZpZXdDbGljayBTS0lQOiBubyB2aWV3L2ptdlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXllcnMgPSBhd2FpdCB0aGlzLnJlc29sdmVDbGlja0xheWVycyh2aWV3LCBqbXYpO1xuICAgIGlmIChpc1N0YWxlKCkpIHJldHVybjtcbiAgICBldmFwb01hcENsaWNrRGVidWcoXCJvblZpZXdDbGljayBzdGFydFwiLCB7XG4gICAgICBzY3JlZW46IHsgeDogZXYueCwgeTogZXYueSB9LFxuICAgICAgbGF5ZXJDb3VudDogbGF5ZXJzLmxlbmd0aCxcbiAgICAgIGxheWVyczogbGF5ZXJzLm1hcCgobCkgPT4gKHtcbiAgICAgICAgaWQ6IGwuaWQsXG4gICAgICAgIHRpdGxlOiBsLnRpdGxlLFxuICAgICAgICB1cmw6IGwudXJsLFxuICAgICAgfSkpLFxuICAgIH0pO1xuXG5cbiAgICBjb25zdCBjbGlja1NjcmVlblBvaW50ID0geyB4OiBldi54LCB5OiBldi55IH07XG4gICAgY29uc3QgaGl0UmVzdWx0ID0gYXdhaXQgdGhpcy5yZXNvbHZlQ2xpY2tGZWF0dXJlQXQoZXYsIHZpZXcsIGxheWVycyk7XG4gICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmlQb2x5Z29uTWFwQ2xpY2tQaGFzZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHBoYXNlOiBcImFmdGVyLWhpdC10ZXN0XCIsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9LFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBiZXN0LWVmZm9ydCBmaWx0ZXIgZ3VhcmQgKi9cbiAgICB9XG5cbiAgICBpZiAoIWhpdFJlc3VsdCkge1xuICAgICAgLy8gRW1wdHkgbWFwIGNsaWNrIHdoaWxlIGEgZmllbGQgcG9wdXAgaXMgb3BlbiA9IGRlc2VsZWN0IGFuZCByZXR1cm4gdG9cbiAgICAgIC8vIHRoZSBkaXN0cmljdC9yZWdpb24gZXh0ZW50IHNhdmVkIGJlZm9yZSB0aGUgZmllbGQgem9vbS5cbiAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCB0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwib25WaWV3Q2xpY2s6IGNsaWNrIG91dHNpZGUg4oCUIGNsb3NlIHBvcHVwICsgcmVzdG9yZSBleHRlbnRcIik7XG4gICAgICAgIHRoaXMuY2xvc2VQb3B1cCh7IHJlc3RvcmVFeHRlbnQ6IHRydWUsIG5vdGlmeURlc2VsZWN0OiB0cnVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwib25WaWV3Q2xpY2s6IGNsaWNrIG91dHNpZGUgZmllbGQgcG9seWdvbnMg4oCUIGlnbm9yZWRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBncmFwaGljOiBnLCBxdWVyeUhpdExheWVyIH0gPSBoaXRSZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBjbGlja1NjcmVlblBvaW50LFxuICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IHRydWUsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgYXR0YWNobWVudHNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBldmFwb01hcENsaWNrRGVidWcoXCJmaWVsZCBwb2x5Z29uIGhpdFwiLCB7XG4gICAgICAgIGxheWVySWQ6IChnIGFzIGFueSkubGF5ZXI/LmlkLFxuICAgICAgICBnZW9tZXRyeTogZy5nZW9tZXRyeT8udHlwZSB8fCBudWxsLFxuICAgICAgICBhdHRyS2V5czogZy5hdHRyaWJ1dGVzXG4gICAgICAgICAgPyBPYmplY3Qua2V5cyhnLmF0dHJpYnV0ZXMpLnNsaWNlKDAsIDgpXG4gICAgICAgICAgOiBbXSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBxdWVyeUZlYXR1cmVzIHJlc3VsdHMgaGF2ZSBubyBncmFwaGljLmxheWVyIOKAlCB1c2UgdGhlIGxheWVyIHdlIHF1ZXJpZWRcbiAgICAgIGNvbnN0IGNsaWNrZWRMYXllciA9IChcbiAgICAgICAgcXVlcnlIaXRMYXllclxuICAgICAgICAgID8gdGhpcy50b0xpdmVNYXBMYXllcihxdWVyeUhpdExheWVyLCB2aWV3Lm1hcCkgfHwgcXVlcnlIaXRMYXllclxuICAgICAgICAgIDogdGhpcy50b0xpdmVNYXBMYXllcihcbiAgICAgICAgICAgICAgZ2V0UXVlcnlhYmxlTGF5ZXIoKGcgYXMgYW55KS5sYXllcikgfHwgKGcgYXMgYW55KS5sYXllcixcbiAgICAgICAgICAgICAgdmlldy5tYXAsXG4gICAgICAgICAgICApXG4gICAgICApIGFzIF9fZXNyaS5GZWF0dXJlTGF5ZXI7XG4gICAgICBpZiAoIWNsaWNrZWRMYXllcikge1xuICAgICAgICBldmFwb01hcENsaWNrV2FybihcIm5vIGxpdmUgbGF5ZXIgZm9yIGhpdCBncmFwaGljXCIpO1xuICAgICAgICBpZiAoIWlzU3RhbGUoKSkgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlLCBzaG93UG9wdXA6IGZhbHNlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsYXllcktleSA9XG4gICAgICAgIGdldEV2YXBvTGF5ZXJNYXBLZXkoY2xpY2tlZExheWVyKSB8fFxuICAgICAgICBTdHJpbmcoY2xpY2tlZExheWVyPy51cmwgfHwgY2xpY2tlZExheWVyPy5pZCB8fCBcIlwiKTtcbiAgICAgIGNvbnN0IGRzSWQgPSB0aGlzLnN0YXRlLmxheWVyS2V5VG9Ec0lkPy5bbGF5ZXJLZXldIHx8IG51bGw7XG4gICAgICBldmFwb01hcENsaWNrRGVidWcoXCJsYXllcjpyZXNvbHZlZFwiLCB7XG4gICAgICAgIHRpdGxlOiBjbGlja2VkTGF5ZXIudGl0bGUsXG4gICAgICAgIGlkOiBjbGlja2VkTGF5ZXIuaWQsXG4gICAgICAgIHVybDogY2xpY2tlZExheWVyLnVybCB8fCBudWxsLFxuICAgICAgICBsYXllcktleSxcbiAgICAgICAgZGF0YVNvdXJjZUlkOiBkc0lkLFxuICAgICAgICBkZWZpbml0aW9uRXhwcmVzc2lvbjogKGNsaWNrZWRMYXllciBhcyBhbnkpLmRlZmluaXRpb25FeHByZXNzaW9uIHx8IG51bGwsXG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgb2lkRmllbGQgPVxuICAgICAgICBjbGlja2VkTGF5ZXIub2JqZWN0SWRGaWVsZCB8fFxuICAgICAgICBjbGlja2VkTGF5ZXIuZmllbGRzPy5maW5kKChmOiBhbnkpID0+IGYudHlwZSA9PT0gXCJvaWRcIik/Lm5hbWUgfHxcbiAgICAgICAgbnVsbDtcblxuICAgICAgaWYgKCFvaWRGaWVsZCkge1xuICAgICAgICBpZiAoIWlzU3RhbGUoKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogdGhpcy50cihcImVycm9yLm9iamVjdElkRmllbGRNaXNzaW5nXCIpLFxuICAgICAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb2lkID0gKGcgYXMgYW55KS5hdHRyaWJ1dGVzPy5bb2lkRmllbGRdO1xuICAgICAgaWYgKG9pZCA9PSBudWxsKSB7XG4gICAgICAgIGlmICghaXNTdGFsZSgpKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiB0aGlzLnRyKFwiZXJyb3Iub2JqZWN0SWRNaXNzaW5nXCIsIHsgZmllbGQ6IG9pZEZpZWxkIH0pLFxuICAgICAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5jbGVhckhpZ2hsaWdodCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0RmllbGRzID0gdGhpcy5nZXRPdXRGaWVsZHMoY2xpY2tlZExheWVyIGFzIGFueSwgb2lkRmllbGQpO1xuXG4gICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5xdWVyeUZlYXR1cmVCeU9iamVjdElkQ2FjaGVkKFxuICAgICAgICBjbGlja2VkTGF5ZXIsXG4gICAgICAgIG9pZEZpZWxkLFxuICAgICAgICBvaWQsXG4gICAgICAgIG91dEZpZWxkcyxcbiAgICAgICk7XG4gICAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG4gICAgICBpZiAoIWYpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IHRoaXMudHIoXCJlcnJvci5mZWF0dXJlQnlPYmplY3RJZE1pc3NpbmdcIiksXG4gICAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgICBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLFxuICAgICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xlYXJIaWdobGlnaHQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZi5nZW9tZXRyeSkgdGhpcy5oaWdobGlnaHRQb2x5Z29uKGYuZ2VvbWV0cnkpO1xuXG4gICAgICBjb25zdCBlYXJseVVuaXF1ZUlkID1cbiAgICAgICAgdGhpcy5maW5kQXR0cmlidXRlVmFsdWVDYXNlSW5zZW5zaXRpdmUoXG4gICAgICAgICAgZi5hdHRyaWJ1dGVzIGFzIFJlY29yZDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgQUdSSV9UQUJMRV9KT0lOX0ZJRUxELFxuICAgICAgICApID8/IG51bGw7XG4gICAgICBjb25zdCBlYXJseUNsZWFuS2V5ID0gU3RyaW5nKGVhcmx5VW5pcXVlSWQgfHwgXCJcIilcbiAgICAgICAgLnJlcGxhY2UoL1t7fV0vZywgXCJcIilcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IGFjdGl2ZUtleSA9IFN0cmluZyh0aGlzLl9hY3RpdmVJbnNwZWN0ZWRVbmlxdWVpZCB8fCBcIlwiKVxuICAgICAgICAucmVwbGFjZSgvW3t9XS9nLCBcIlwiKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgLypcbiAgICAgICAqIFNhbWUgYWxyZWFkeS1hY3RpdmUgZmllbGQgKGluY2wuIHRhYmxlIHNlbGVjdGlvbikgY2xpY2tlZCBvbiBtYXAg4oaSXG4gICAgICAgKiBkZWFjdGl2YXRlIHdpdGhvdXQgem9vbWluZyBpbiBhZ2Fpbi4gR3JhZmYgcmVzdG9yZXMgdGhlIHByZS1zZWxlY3QgZXh0ZW50LlxuICAgICAgICogSWYgdGhlIHBhbmVsIHdhcyBvbmx5IG1pbmltaXplZCwgZXhwYW5kIGl0IGluc3RlYWQgb2YgZGVzZWxlY3RpbmcuXG4gICAgICAgKi9cbiAgICAgIGlmIChhY3RpdmVLZXkgJiYgZWFybHlDbGVhbktleSAmJiBhY3RpdmVLZXkgPT09IGVhcmx5Q2xlYW5LZXkpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQpIHtcbiAgICAgICAgICBldmFwb01hcENsaWNrRGVidWcoXCJzZWxlY3Rpb246ZXhwYW5kLW1pbmltaXplZC1zYW1lLWZpZWxkXCIsIHtcbiAgICAgICAgICAgIHVuaXF1ZWlkOiBlYXJseUNsZWFuS2V5LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuZXhwYW5kUG9wdXAoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwic2VsZWN0aW9uOnRvZ2dsZS1vZmYtc2FtZS1maWVsZFwiLCB7XG4gICAgICAgICAgdW5pcXVlaWQ6IGVhcmx5Q2xlYW5LZXksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsZWFySGlnaGxpZ2h0KCk7XG4gICAgICAgIHRoaXMuX2FjdGl2ZUluc3BlY3RlZFVuaXF1ZWlkID0gbnVsbDtcbiAgICAgICAgdGhpcy5jbG9zZVBvcHVwKHsgcmVzdG9yZUV4dGVudDogdHJ1ZSwgbm90aWZ5RGVzZWxlY3Q6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9hZFN0YXR1cyA9IFN0cmluZygoY2xpY2tlZExheWVyIGFzIGFueSkubG9hZFN0YXR1cyB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBpc0xvYWRlZCA9IEJvb2xlYW4oKGNsaWNrZWRMYXllciBhcyBhbnkpLmxvYWRlZCkgfHwgbG9hZFN0YXR1cyA9PT0gXCJsb2FkZWRcIjtcbiAgICAgICAgLy8gTG9hZGluZyBhIGxpdmUgTWFwSW1hZ2Utb3duZWQgc3VibGF5ZXIgcmVoeWRyYXRlcyBpdCBhbmQgY2FuIGNsZWFyXG4gICAgICAgIC8vIHRoZSBydW50aW1lIHR1bWFuIGRlZmluaXRpb25FeHByZXNzaW9uIChvdGhlci1kaXN0cmljdCBmbGFzaCkuIFRoZVxuICAgICAgICAvLyBkZXRhY2hlZCBjbGllbnQgZnJvbSBxdWVyeUZlYXR1cmVCeU9iamVjdElkQ2FjaGVkIGlzIGFscmVhZHkgbG9hZGVkXG4gICAgICAgIC8vIGFuZCBwcm92aWRlcyB0aGUgc2FtZSBmaWVsZCBtZXRhZGF0YS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICFpc0xvYWRlZCAmJlxuICAgICAgICAgICFpc01hcEltYWdlT3duZWRMYXllcihjbGlja2VkTGF5ZXIpICYmXG4gICAgICAgICAgIWlzTWFwSW1hZ2VHcm91cFN1YmxheWVyKGNsaWNrZWRMYXllcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZhcG9NYXBDbGlja0RlYnVnKFwibGF5ZXI6bG9hZC1yZXF1aXJlZFwiLCB7XG4gICAgICAgICAgICB0aXRsZTogY2xpY2tlZExheWVyLnRpdGxlLFxuICAgICAgICAgICAgbG9hZFN0YXR1czogbG9hZFN0YXR1cyB8fCBudWxsLFxuICAgICAgICAgICAgZGVmaW5pdGlvbkV4cHJlc3Npb246XG4gICAgICAgICAgICAgIChjbGlja2VkTGF5ZXIgYXMgYW55KS5kZWZpbml0aW9uRXhwcmVzc2lvbiB8fCBudWxsLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IHNhZmVMb2FkTWFwTGF5ZXIoY2xpY2tlZExheWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmFwb01hcENsaWNrRGVidWcoXCJsYXllcjpsb2FkLXNraXAtYWxyZWFkeS1sb2FkZWRcIiwge1xuICAgICAgICAgICAgdGl0bGU6IGNsaWNrZWRMYXllci50aXRsZSxcbiAgICAgICAgICAgIGxvYWRTdGF0dXM6IGxvYWRTdGF0dXMgfHwgXCJsb2FkZWRcIixcbiAgICAgICAgICAgIGRlZmluaXRpb25FeHByZXNzaW9uOlxuICAgICAgICAgICAgICAoY2xpY2tlZExheWVyIGFzIGFueSkuZGVmaW5pdGlvbkV4cHJlc3Npb24gfHwgbnVsbCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qIGZyZXNoIGZpZWxkIGFsaWFzZXMgZnJvbSBsaXZlIGxheWVyICovXG4gICAgICB9XG4gICAgICBpZiAoaXNTdGFsZSgpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHNob3VsZFBpbiA9IHRoaXMuc3RhdGUucGluVG9Db3JuZXI7XG4gICAgICBjb25zdCBwb3B1cFBvc2l0aW9uID0gc2hvdWxkUGluXG4gICAgICAgID8gdGhpcy5jYWxjdWxhdGVQaW5uZWRQb3NpdGlvbih2aWV3KVxuICAgICAgICA6IHRoaXMuY2FsY3VsYXRlUG9wdXBQb3NpdGlvbihjbGlja1NjcmVlblBvaW50LCB2aWV3KTtcblxuICAgICAgLy8gQWdyaV90YWJsZV9kYXRhIGhhcyBubyBnZW9tZXRyeSDigJQgdGhlIHBvbHlnb24gbGF5ZXIgb25seSBkcml2ZXNcbiAgICAgIC8vIG1hcC1jbGljay9oaWdobGlnaHQvem9vbTsgdGhlIGZpZWxkcyB0aGUgcG9wdXAgc2hvd3MgY29tZSBmcm9tIHRoZVxuICAgICAgLy8gZXh0ZXJuYWwgdGFibGUsIGpvaW5lZCBieSB1bmlxdWVpZC5cbiAgICAgIGNvbnN0IGRpc3BsYXlBdHRycyA9IGF3YWl0IHRoaXMucmVzb2x2ZURpc3BsYXlBdHRycyhmLmF0dHJpYnV0ZXMpO1xuICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBjb25maWd1cmVkRmllbGRzID0gdGhpcy5wcm9wcy5jb25maWc/LmZpZWxkc1RvU2hvdyB8fCBbXTtcbiAgICAgIGNvbnN0IGFjdHVhbEZpZWxkcyA9IE9iamVjdC5rZXlzKGRpc3BsYXlBdHRycyk7XG4gICAgICBjb25zdCBtaXNzaW5nRmllbGRzID0gY29uZmlndXJlZEZpZWxkcy5maWx0ZXIoXG4gICAgICAgIChmaWVsZCkgPT4gIWFjdHVhbEZpZWxkcy5pbmNsdWRlcyhmaWVsZCksXG4gICAgICApO1xuICAgICAgY29uc3QgZmllbGRzV2l0aERhdGEgPSBjb25maWd1cmVkRmllbGRzLmZpbHRlcihcbiAgICAgICAgKG5hbWUpID0+XG4gICAgICAgICAgZGlzcGxheUF0dHJzLmhhc093blByb3BlcnR5KG5hbWUpICYmXG4gICAgICAgICAgZGlzcGxheUF0dHJzW25hbWVdICE9IG51bGwgJiZcbiAgICAgICAgICBkaXNwbGF5QXR0cnNbbmFtZV0gIT09IFwiXCIsXG4gICAgICApO1xuXG4gICAgICBldmFwb01hcENsaWNrRGVidWcoXCJwb3B1cCBPUEVOXCIsIHtcbiAgICAgICAgb2lkLFxuICAgICAgICBvaWRGaWVsZCxcbiAgICAgICAgbGF5ZXJLZXksXG4gICAgICAgIGF0dHJpYnV0ZUtleXM6IGFjdHVhbEZpZWxkcy5zbGljZSgwLCAxMiksXG4gICAgICAgIHBvcHVwUG9zaXRpb24sXG4gICAgICB9KTtcblxuICAgICAgLy8gT3BlbiB0aGUgcG9wdXAgQkVGT1JFIGdvVG8g4oCUIGF3YWl0aW5nIHpvb20gZmlyc3QgbGVmdCBhIGxvbmcgd2luZG93XG4gICAgICAvLyB3aGVyZSBhIHR3aW4vc2hhcmVkIGNsaWNrIHBhdGggY291bGQgZmFpbCBhbmQgd2lwZSBzaG93UG9wdXAuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZzogZmFsc2UsXG5cbiAgICAgICAgLy8g4pyFIHN0b3JlIHdoaWNoIGxheWVyL2RzIHdhcyBjbGlja2VkIChmb3IgYWxpYXMgcmVzb2x2aW5nKVxuICAgICAgICBsYXN0Q2xpY2tlZERzSWQ6IGRzSWQsXG4gICAgICAgIGxhc3RDbGlja2VkTGF5ZXJLZXk6IGxheWVyS2V5LFxuXG4gICAgICAgIHNlbGVjdGVkQXR0cnM6IGRpc3BsYXlBdHRycyxcbiAgICAgICAgc2VsZWN0ZWRPSUQ6IE51bWJlcihvaWQpLFxuICAgICAgICBvYmplY3RJZEZpZWxkOiBvaWRGaWVsZCxcblxuICAgICAgICBzaG93UG9wdXA6IHRydWUsXG4gICAgICAgIHBvcHVwTWluaW1pemVkOiBmYWxzZSxcbiAgICAgICAgY2hhcnRFeHBhbmRlZDogc2hvdWxkUGluLFxuICAgICAgICBjaGFydEhvdmVySW5kZXg6IG51bGwsXG4gICAgICAgIHBvcHVwUG9zaXRpb24sXG4gICAgICAgIGVycm9yOlxuICAgICAgICAgIG1pc3NpbmdGaWVsZHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyB0aGlzLnRyKFwiZXJyb3IuY29uZmlndXJlZEZpZWxkTWlzc2luZ1wiLCB7XG4gICAgICAgICAgICAgICAgZmllbGRzOiBtaXNzaW5nRmllbGRzLmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogZmllbGRzV2l0aERhdGEubGVuZ3RoID09PSAwICYmIGNvbmZpZ3VyZWRGaWVsZHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICA/IHRoaXMudHIoXCJlcnJvci5ub0RhdGFGb3JDb25maWd1cmVkRmllbGRzXCIpXG4gICAgICAgICAgICAgIDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgcG9wdXBPcGVuZWRGb3JUaGlzQ2xpY2sgPSB0cnVlO1xuXG4gICAgICBjb25zdCBjbGlja2VkVW5pcXVlSWQgPVxuICAgICAgICB0aGlzLmZpbmRBdHRyaWJ1dGVWYWx1ZUNhc2VJbnNlbnNpdGl2ZShcbiAgICAgICAgICBkaXNwbGF5QXR0cnMsXG4gICAgICAgICAgQUdSSV9UQUJMRV9KT0lOX0ZJRUxELFxuICAgICAgICApID8/XG4gICAgICAgIHRoaXMuZmluZEF0dHJpYnV0ZVZhbHVlQ2FzZUluc2Vuc2l0aXZlKFxuICAgICAgICAgIGYuYXR0cmlidXRlcyBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICAgICAgICAgIEFHUklfVEFCTEVfSk9JTl9GSUVMRCxcbiAgICAgICAgKTtcbiAgICAgIGlmIChjbGlja2VkVW5pcXVlSWQgIT0gbnVsbCAmJiBTdHJpbmcoY2xpY2tlZFVuaXF1ZUlkKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgY29uc3QgY2xlYW5VbmlxdWVJZCA9IFN0cmluZyhjbGlja2VkVW5pcXVlSWQpLnRyaW0oKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlSW5zcGVjdGVkVW5pcXVlaWQgPSBjbGVhblVuaXF1ZUlkLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudHJpbSgpO1xuICAgICAgICBldmFwb01hcENsaWNrRGVidWcoXCJzZWxlY3Rpb246YnJvYWRjYXN0XCIsIHtcbiAgICAgICAgICB1bmlxdWVpZDogY2xlYW5VbmlxdWVJZCxcbiAgICAgICAgICBzb3VyY2U6IFwiQWdyaVBvcHVwXCIsXG4gICAgICAgICAgcG9seWdvbk1vZGU6IHRydWUsXG4gICAgICAgICAgZGVzdGluYXRpb25zOiBbXCJBZ3JpTG9jYWxpemF0aW9uXCIsIFwiQWdyaUdyYWZmMTBcIl0sXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5vdGlmeUdyYWZmUG9seWdvblNlbGVjdGlvbihjbGVhblVuaXF1ZUlkLCB0cnVlLCBjbGlja1N0YXJ0ZWRBdCk7XG4gICAgICAgIHZvaWQgdGhpcy5mZXRjaExhdGVzdFZlZ2V0YXRpb25JbmRpY2VzKGNsZWFuVW5pcXVlSWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGluZ0xhdGVzdEluZGljZXM6IGZhbHNlLFxuICAgICAgICAgIGxhdGVzdEluZGV4RGF0ZTogbnVsbCxcbiAgICAgICAgICBsYXRlc3RJbmRleFZhbHVlczogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHpvb21UbyA9IHRoaXMucHJvcHMuY29uZmlnPy5zZXR0aW5ncz8uem9vbVRvU2VsZWN0aW9uICE9PSBmYWxzZTtcbiAgICAgIGlmICh6b29tVG8gJiYgZi5nZW9tZXRyeSAmJiAhaXNTdGFsZSgpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gS2VlcCB0aGUgZmlyc3QgcHJlLXNlbGVjdGlvbiBleHRlbnQgc28gY2xvc2luZyByZXN0b3JlcyB0aGVcbiAgICAgICAgICAvLyBkaXN0cmljdC9yZWdpb24gdmlldyBldmVuIGlmIGFub3RoZXIgZmllbGQgaXMgY2xpY2tlZCBuZXh0LlxuICAgICAgICAgIGlmICghdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uICYmIHZpZXcuZXh0ZW50Py5jbG9uZSkge1xuICAgICAgICAgICAgdGhpcy5fZXh0ZW50QmVmb3JlU2VsZWN0aW9uID0gdmlldy5leHRlbnQuY2xvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gS2VlcCB0aGUgd2hvbGUgZmllbGQgdmlzaWJsZSB3aXRoIG9ubHkgYSBzbWFsbCBtYXJnaW4uXG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID1cbiAgICAgICAgICAgIChmLmdlb21ldHJ5IGFzIGFueSkuZXh0ZW50Py5leHBhbmQ/LigxLjA4KSB8fCBmLmdlb21ldHJ5O1xuICAgICAgICAgIGV2YXBvTWFwQ2xpY2tEZWJ1ZyhcInpvb206c3RhcnRcIiwge1xuICAgICAgICAgICAgdW5pcXVlaWQ6IGNsaWNrZWRVbmlxdWVJZCA9PSBudWxsID8gbnVsbCA6IFN0cmluZyhjbGlja2VkVW5pcXVlSWQpLFxuICAgICAgICAgICAgZ2VvbWV0cnlUeXBlOiBmLmdlb21ldHJ5LnR5cGUsXG4gICAgICAgICAgICBkdXJhdGlvbk1zOiA2NTAsXG4gICAgICAgICAgICB0YXJnZXRFeHRlbnQ6ICh0YXJnZXQgYXMgYW55KT8udG9KU09OPy4oKSB8fCBudWxsLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHZvaWQgdmlldy5nb1RvKFxuICAgICAgICAgICAgeyB0YXJnZXQgfSxcbiAgICAgICAgICAgIHsgZHVyYXRpb246IDY1MCwgZWFzaW5nOiBcImVhc2UtaW4tb3V0XCIgYXMgYW55IH0sXG4gICAgICAgICAgKS50aGVuKFxuICAgICAgICAgICAgKCkgPT4gZXZhcG9NYXBDbGlja0RlYnVnKFwiem9vbTpjb21wbGV0ZVwiLCB7XG4gICAgICAgICAgICAgIHVuaXF1ZWlkOiBjbGlja2VkVW5pcXVlSWQgPT0gbnVsbCA/IG51bGwgOiBTdHJpbmcoY2xpY2tlZFVuaXF1ZUlkKSxcbiAgICAgICAgICAgICAgc2NhbGU6ICh2aWV3IGFzIGFueSkuc2NhbGUsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIChlcnJvcjogYW55KSA9PiBldmFwb01hcENsaWNrV2FybihcInpvb206ZmFpbGVkXCIsIHtcbiAgICAgICAgICAgICAgdW5pcXVlaWQ6IGNsaWNrZWRVbmlxdWVJZCA9PSBudWxsID8gbnVsbCA6IFN0cmluZyhjbGlja2VkVW5pcXVlSWQpLFxuICAgICAgICAgICAgICBlcnJvcjogZXJyb3I/Lm1lc3NhZ2UgfHwgU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEF0dGFjaG1lbnRzIGFyZSBiZXN0LWVmZm9ydCDigJQgbmV2ZXIgbGV0IGEgbWVkaWEgZmV0Y2ggd2lwZSBhbiBvcGVuIHBvcHVwXG4gICAgICAvLyAodGhhdCB3YXMgdGhlIFwidmVnZXRhdGlvbiB1cGRhdGVzIGJ1dCBwb3B1cCBvbmx5IHN0aWNrcyBvbiAybmQvM3JkIGNsaWNrXCJcbiAgICAgIC8vIGZhaWx1cmU6IG5vdGlmeUdyYWZmIHJhbiwgdGhlbiBsb2FkQXR0YWNobWVudHMgdGhyZXcg4oaSIGNhdGNoIGNsb3NlZCBVSVxuICAgICAgLy8gYW5kIHJlc3RvcmVFeHRlbnRCZWZvcmVTZWxlY3Rpb24gbWFkZSB0aGUgbWFwIGxvb2sgbGlrZSBvdGhlciBmaWVsZHMpLlxuICAgICAgaWYgKHRoaXMucHJvcHMuY29uZmlnPy5zZXR0aW5ncz8uc2hvd0F0dGFjaG1lbnRzICE9PSBmYWxzZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFF1ZXJ5IGF0dGFjaG1lbnRzIG9uIHRoZSBkZXRhY2hlZCBjbGllbnQgdG9vIOKAlCBxdWVyeUF0dGFjaG1lbnRzXG4gICAgICAgICAgLy8gb24gYSBsaXZlIE1hcEltYWdlIHN1YmxheWVyIGNhbiByZWh5ZHJhdGUgaXQgKHNhbWUgREUtY2xlYXJpbmdcbiAgICAgICAgICAvLyBwYXRoIGFzIHF1ZXJ5RmVhdHVyZXMpIGFuZCBpdCBvZnRlbiBsYWNrcyB0aGUgQVBJIGFueXdheS5cbiAgICAgICAgICBjb25zdCBjbGlja2VkVXJsID0gU3RyaW5nKChjbGlja2VkTGF5ZXIgYXMgYW55KS51cmwgfHwgXCJcIikudHJpbSgpO1xuICAgICAgICAgIGNvbnN0IGF0dGFjaG1lbnRMYXllciA9XG4gICAgICAgICAgICAoY2xpY2tlZFVybCAmJiB0aGlzLl9xdWVyeU9ubHlMYXllcnMuZ2V0KGNsaWNrZWRVcmwpKSB8fFxuICAgICAgICAgICAgY2xpY2tlZExheWVyO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9hZEF0dGFjaG1lbnRzRm9yT2lkKGF0dGFjaG1lbnRMYXllciBhcyBhbnksIE51bWJlcihvaWQpKTtcbiAgICAgICAgfSBjYXRjaCAoYXR0YWNoRXJyOiBhbnkpIHtcbiAgICAgICAgICBldmFwb01hcENsaWNrV2FybihcImF0dGFjaG1lbnRzIGZhaWxlZCAocG9wdXAga2VwdCBvcGVuKVwiLCB7XG4gICAgICAgICAgICBtZXNzYWdlOiBhdHRhY2hFcnI/Lm1lc3NhZ2UgfHwgU3RyaW5nKGF0dGFjaEVyciksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nQXR0YWNobWVudHM6IGZhbHNlLCBhdHRhY2htZW50czogW10gfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFpc1N0YWxlKCkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsIGF0dGFjaG1lbnRzOiBbXSB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1N0YWxlKCkpIHJldHVybjtcblxuICAgICAgaWYgKHRoaXMuc3RhdGUucGluVG9Db3JuZXIpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVBvcHVwTGF5b3V0QWZ0ZXJDb250ZW50KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNEYXNoYm9hcmRFbWJlZGRlZCgpKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dEFmdGVyQ29udGVudCgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgLy8gTmV2ZXIgbGV0IGEgc3VwZXJzZWRlZCB0d2luL3NoYXJlZCBjbGljayBjbGVhciBhIG5ld2VyIHBvcHVwLlxuICAgICAgaWYgKGlzU3RhbGUoKSkgcmV0dXJuO1xuICAgICAgLy8gSWYgd2UgYWxyZWFkeSBvcGVuZWQgdGhlIHBvcHVwIGZvciBUSElTIGNsaWNrLCBrZWVwIGl0IOKAlCBzdXJmYWNlIGVycm9yIG9ubHkuXG4gICAgICBpZiAocG9wdXBPcGVuZWRGb3JUaGlzQ2xpY2spIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IHRoaXMudHIoXCJlcnJvci51bmV4cGVjdGVkXCIsIHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGU/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCIsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IHRoaXMudHIoXCJlcnJvci51bmV4cGVjdGVkXCIsIHtcbiAgICAgICAgICBtZXNzYWdlOiBlPy5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwiLFxuICAgICAgICB9KSxcbiAgICAgICAgc2hvd1BvcHVwOiBmYWxzZSxcbiAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgYXR0YWNobWVudHM6IFtdLFxuICAgICAgfSk7XG4gICAgICB0aGlzLmNsZWFySGlnaGxpZ2h0KCk7XG4gICAgICB0aGlzLm5vdGlmeUdyYWZmUG9seWdvblNlbGVjdGlvbihcIlwiLCBmYWxzZSk7XG4gICAgICB0aGlzLnJlc3RvcmVFeHRlbnRCZWZvcmVTZWxlY3Rpb24oKTtcbiAgICB9XG4gIH07XG5cbiAgLyogLS0tLS0tLS0tLS0tLS0tLSBBdHRhY2htZW50cyBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBwcml2YXRlIGFzeW5jIGZldGNoQXR0YWNobWVudFByZXZpZXcodXJsOiBzdHJpbmcpOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZXNyaVJlcXVlc3QodXJsLCB7XG4gICAgICByZXNwb25zZVR5cGU6IFwiYmxvYlwiLFxuICAgICAgcXVlcnk6IHt9LFxuICAgIH0gYXMgYW55KTtcbiAgICByZXR1cm4gcmVzcD8uZGF0YSBpbnN0YW5jZW9mIEJsb2IgPyByZXNwLmRhdGEgOiAocmVzcCBhcyB1bmtub3duIGFzIEJsb2IpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXZva2VBbGxBdHRhY2htZW50VXJscygpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXR0cyA9IHRoaXMuc3RhdGUuYXR0YWNobWVudHMgfHwgW107XG4gICAgICBhdHRzLmZvckVhY2goKGEpID0+IHtcbiAgICAgICAgaWYgKGEucHJldmlld09iamVjdFVybCkgVVJMLnJldm9rZU9iamVjdFVSTChhLnByZXZpZXdPYmplY3RVcmwpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICB9XG5cbiAgcHJpdmF0ZSBpc0ltYWdlQ29udGVudFR5cGUoY3Q/OiBzdHJpbmcpIHtcbiAgICBpZiAoIWN0KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIC9eaW1hZ2VcXC8vaS50ZXN0KGN0KTtcbiAgfVxuXG4gIHByaXZhdGUgYnl0ZXNUb1NpemUobj86IG51bWJlcik6IHN0cmluZyB7XG4gICAgaWYgKCFuICYmIG4gIT09IDApIHJldHVybiBcIlwiO1xuICAgIGlmIChuID09PSAwKSByZXR1cm4gXCIwIEJcIjtcbiAgICBjb25zdCBrID0gMTAyNCxcbiAgICAgIHNpemVzID0gW1wiQlwiLCBcIktCXCIsIFwiTUJcIiwgXCJHQlwiLCBcIlRCXCJdO1xuICAgIGNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGgubG9nKG4pIC8gTWF0aC5sb2coaykpO1xuICAgIHJldHVybiBgJHsobiAvIE1hdGgucG93KGssIGkpKS50b0ZpeGVkKDIpfSAke3NpemVzW2ldfWA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGxvYWRBdHRhY2htZW50c0Zvck9pZChsYXllcjogRmVhdHVyZUxheWVyLCBvaWQ6IG51bWJlcikge1xuICAgIC8vIOKchSBJZiBsYXllciBkb2VzbuKAmXQgc3VwcG9ydCBhdHRhY2htZW50cyAtPiBzaWxlbnRseSBzaG93IG5vbmUgKE5PIHdhcm5pbmcpXG4gICAgaWYgKCF0aGlzLmxheWVyU3VwcG9ydHNBdHRhY2htZW50cyhsYXllcikpIHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgICB0aGlzLnJldm9rZUFsbEF0dGFjaG1lbnRVcmxzKCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgYXR0YWNobWVudHM6IFtdLFxuICAgICAgICBhdHRhY2htZW50c0V4cGFuZGVkOiB0cnVlLCAvLyBrZWVwIGFyZWEgdmlzaWJsZSBpZiB5b3Ugd2FudCBcIk5vIGF0dGFjaG1lbnRzXCJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB0aGlzLnJldm9rZUFsbEF0dGFjaG1lbnRVcmxzKCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZ0F0dGFjaG1lbnRzOiB0cnVlLCBhdHRhY2htZW50czogW10gfSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGxheWVyLnF1ZXJ5QXR0YWNobWVudHMoeyBvYmplY3RJZHM6IFtvaWRdIH0pO1xuICAgICAgY29uc3QgbGlzdCA9IChyZXN1bHQ/LltvaWRdIHx8IFtdKSBhcyBhbnlbXTtcblxuICAgICAgY29uc3QgaXRlbXM6IEF0dGFjaG1lbnRJdGVtW10gPSBsaXN0Lm1hcCgoYXR0KSA9PiAoe1xuICAgICAgICBpZDogYXR0LmlkLFxuICAgICAgICBuYW1lOiBhdHQubmFtZSxcbiAgICAgICAgc2l6ZTogYXR0LnNpemUsXG4gICAgICAgIGNvbnRlbnRUeXBlOiBhdHQuY29udGVudFR5cGUsXG4gICAgICAgIHVybDogYXR0LnVybCxcbiAgICAgIH0pKTtcblxuICAgICAgY29uc3Qgd2l0aFByZXZpZXdzOiBBdHRhY2htZW50SXRlbVtdID0gW107XG4gICAgICBmb3IgKGNvbnN0IGl0IG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChpdC51cmwgJiYgdGhpcy5pc0ltYWdlQ29udGVudFR5cGUoaXQuY29udGVudFR5cGUpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLmZldGNoQXR0YWNobWVudFByZXZpZXcoaXQudXJsKTtcbiAgICAgICAgICAgIGl0LnByZXZpZXdPYmplY3RVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gaWdub3JlIHByZXZpZXcgZmFpbHVyZXNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd2l0aFByZXZpZXdzLnB1c2goaXQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGF0dGFjaG1lbnRzOiB3aXRoUHJldmlld3MsXG4gICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IHRydWUsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgLy8g4pyFIElmIHNlcnZlciBzYXlzIGF0dGFjaG1lbnRzIG5vdCBzdXBwb3J0ZWQvZW5hYmxlZCAtPiBTSUxFTlQgKG5vIHJlZCB3YXJuaW5nKVxuICAgICAgY29uc3QgbXNnID0gU3RyaW5nKGVycj8ubWVzc2FnZSB8fCBlcnIgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IGlzTm90U3VwcG9ydGVkID1cbiAgICAgICAgbXNnLmluY2x1ZGVzKFwiZG9lc24ndCBzdXBwb3J0IGF0dGFjaG1lbnRzXCIpIHx8XG4gICAgICAgIG1zZy5pbmNsdWRlcyhcImRvZXMgbm90IHN1cHBvcnQgYXR0YWNobWVudHNcIikgfHxcbiAgICAgICAgbXNnLmluY2x1ZGVzKFwiYXR0YWNobWVudHMgYXJlIG5vdCBlbmFibGVkXCIpIHx8XG4gICAgICAgIG1zZy5pbmNsdWRlcyhcImF0dGFjaG1lbnRzIGRpc2FibGVkXCIpIHx8XG4gICAgICAgIChtc2cuaW5jbHVkZXMoXCJub3Qgc3VwcG9ydGVkXCIpICYmIG1zZy5pbmNsdWRlcyhcImF0dGFjaG1lbnRcIikpO1xuXG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICBpZiAoaXNOb3RTdXBwb3J0ZWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgICAgICBhdHRhY2htZW50czogW10sXG4gICAgICAgICAgYXR0YWNobWVudHNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmdBdHRhY2htZW50czogZmFsc2UsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgICAgYXR0YWNobWVudHNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gRmllbGQgYWxpYXMgKyBmb3JtYXR0aW5nIC0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBwcml2YXRlIGlzRGF0ZUZpZWxkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIFVzZSB0aGUgY2xpY2tlZCBsYXllciBpZiBwb3NzaWJsZVxuICAgIGNvbnN0IGNsaWNrZWRMYXllciA9IHRoaXMuZ2V0Q2xpY2tlZExheWVyKCk7XG4gICAgY29uc3QgZmxkID0gY2xpY2tlZExheWVyPy5maWVsZHM/LmZpbmQoKGZmOiBhbnkpID0+IGZmLm5hbWUgPT09IG5hbWUpO1xuICAgIGNvbnN0IHQgPSBTdHJpbmcoKGZsZCBhcyBhbnkpPy50eXBlIHx8IFwiXCIpO1xuICAgIHJldHVybiAoXG4gICAgICB0ID09PSBcImRhdGVcIiB8fFxuICAgICAgdCA9PT0gXCJ0aW1lc3RhbXAtb2Zmc2V0XCIgfHxcbiAgICAgIHQgPT09IFwiZGF0ZS1vbmx5XCIgfHxcbiAgICAgIHQgPT09IFwidGltZS1vbmx5XCJcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDbGlja2VkTGF5ZXIoKTogX19lc3JpLkZlYXR1cmVMYXllciB8IG51bGwge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuc3RhdGUubGFzdENsaWNrZWRMYXllcktleTtcbiAgICBpZiAoIWtleSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycy5maW5kKFxuICAgICAgICAoTCkgPT5cbiAgICAgICAgICBnZXRFdmFwb0xheWVyTWFwS2V5KEwpID09PSBrZXkgfHxcbiAgICAgICAgICBTdHJpbmcoTC51cmwgfHwgTC5pZCB8fCBcIlwiKSA9PT0ga2V5LFxuICAgICAgKSB8fCBudWxsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZUZpZWxkTmFtZSA9IChrZXk6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgIC8vIFByZWZlciBEUyBzY2hlbWEgZm9yIHRoZSBMQVNUIGNsaWNrZWQgZHMgKGJlc3QgZm9yIGFsaWFzL2ppbXVOYW1lKVxuICAgIGNvbnN0IGRzSWQgPSB0aGlzLnN0YXRlLmxhc3RDbGlja2VkRHNJZDtcbiAgICBjb25zdCBkczogYW55ID1cbiAgICAgIGRzSWQgJiYgdGhpcy5zdGF0ZS5kYXRhU291cmNlc0J5SWQ/Lltkc0lkXVxuICAgICAgICA/IHRoaXMuc3RhdGUuZGF0YVNvdXJjZXNCeUlkW2RzSWRdXG4gICAgICAgIDogbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBkcz8uZ2V0U2NoZW1hPy4oKTtcbiAgICAgIGNvbnN0IGZpZWxkc09iaiA9IHNjaGVtYT8uZmllbGRzIHx8IHt9O1xuICAgICAgaWYgKGZpZWxkc09ialtrZXldPy5uYW1lKSByZXR1cm4gZmllbGRzT2JqW2tleV0ubmFtZTtcbiAgICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhmaWVsZHNPYmopKSB7XG4gICAgICAgIGNvbnN0IGYgPSAoZmllbGRzT2JqIGFzIGFueSlba107XG4gICAgICAgIGlmIChmPy5uYW1lID09PSBrZXkgfHwgZj8uamltdU5hbWUgPT09IGtleSB8fCBrID09PSBrZXkpXG4gICAgICAgICAgcmV0dXJuIGY/Lm5hbWUgfHwga2V5O1xuICAgICAgfVxuICAgIH0gY2F0Y2gge31cblxuICAgIC8vIGZhbGxiYWNrIHRvIGNsaWNrZWQgbGF5ZXIgZmllbGRzXG4gICAgY29uc3QgY2xpY2tlZExheWVyID0gdGhpcy5nZXRDbGlja2VkTGF5ZXIoKTtcbiAgICBjb25zdCBsZiA9IGNsaWNrZWRMYXllcj8uZmllbGRzPy5maW5kKFxuICAgICAgKGZmOiBhbnkpID0+IGZmLm5hbWUgPT09IGtleSB8fCBmZi5hbGlhcyA9PT0ga2V5LFxuICAgICk7XG4gICAgcmV0dXJuIGxmPy5uYW1lIHx8IG51bGw7XG4gIH07XG5cbiAgcHJpdmF0ZSBub3JtYWxpemVGaWVsZEFsaWFzKGZpZWxkOiBhbnksIGZhbGxiYWNrTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBuYW1lID0gU3RyaW5nKGZpZWxkPy5uYW1lIHx8IGZhbGxiYWNrTmFtZSB8fCBcIlwiKS50cmltKCk7XG4gICAgY29uc3QgYWxpYXMgPSBTdHJpbmcoXG4gICAgICBmaWVsZD8uYWxpYXMgfHwgZmllbGQ/LmRpc3BsYXlOYW1lIHx8IGZpZWxkPy5sYWJlbCB8fCBcIlwiLFxuICAgICkudHJpbSgpO1xuICAgIGlmICghYWxpYXMpIHJldHVybiBuYW1lO1xuICAgIHJldHVybiBhbGlhcztcbiAgfVxuXG4gIHByaXZhdGUgZmluZEZpZWxkTWV0YU9uTGF5ZXIoXG4gICAgbGF5ZXI6IGFueSxcbiAgICBmaWVsZE5hbWU6IHN0cmluZyxcbiAgKTogX19lc3JpLkZpZWxkIHwgbnVsbCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZmllbGROYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgZmllbGRzID0gQXJyYXkuaXNBcnJheShsYXllcj8uZmllbGRzKSA/IGxheWVyLmZpZWxkcyA6IFtdO1xuICAgIHJldHVybiAoXG4gICAgICAoZmllbGRzLmZpbmQoXG4gICAgICAgIChmOiBhbnkpID0+IFN0cmluZyhmPy5uYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IHRhcmdldCxcbiAgICAgICkgYXMgX19lc3JpLkZpZWxkIHwgdW5kZWZpbmVkKSB8fCBudWxsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZUFsaWFzRnJvbUxpdmVMYXllcnMoZmllbGROYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBsYXllcnM6IF9fZXNyaS5GZWF0dXJlTGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGNsaWNrZWQgPSB0aGlzLmdldENsaWNrZWRMYXllcigpO1xuICAgIGlmIChjbGlja2VkKSBsYXllcnMucHVzaChjbGlja2VkKTtcbiAgICBmb3IgKGNvbnN0IGxheWVyIG9mIHRoaXMuc3RhdGUuZmVhdHVyZUxheWVycyB8fCBbXSkge1xuICAgICAgaWYgKGxheWVyICYmICFsYXllcnMuaW5jbHVkZXMobGF5ZXIpKSBsYXllcnMucHVzaChsYXllcik7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgIGNvbnN0IGZsZCA9IHRoaXMuZmluZEZpZWxkTWV0YU9uTGF5ZXIobGF5ZXIsIGZpZWxkTmFtZSk7XG4gICAgICBpZiAoIWZsZCkgY29udGludWU7XG4gICAgICBjb25zdCBhbGlhcyA9IHRoaXMubm9ybWFsaXplRmllbGRBbGlhcyhmbGQsIGZpZWxkTmFtZSk7XG4gICAgICBpZiAoYWxpYXMgJiYgYWxpYXMudG9Mb3dlckNhc2UoKSAhPT0gZmllbGROYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZUFsaWFzRnJvbURhdGFTb3VyY2VTY2hlbWEoXG4gICAgZmllbGROYW1lOiBzdHJpbmcsXG4gICAgZHM6IGFueSxcbiAgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCFkcykgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpZWxkc09iaiA9IGRzPy5nZXRTY2hlbWE/LigpPy5maWVsZHMgfHwge307XG4gICAgICBjb25zdCB0YXJnZXQgPSBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGZpZWxkc09iaikpIHtcbiAgICAgICAgY29uc3QgZiA9IGZpZWxkc09ialtrZXldO1xuICAgICAgICBjb25zdCBmbmFtZSA9IFN0cmluZyhmPy5uYW1lIHx8IGY/LmppbXVOYW1lIHx8IGtleSB8fCBcIlwiKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGZuYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRhcmdldCAmJlxuICAgICAgICAgIGtleS50b0xvd2VyQ2FzZSgpICE9PSB0YXJnZXQgJiZcbiAgICAgICAgICBTdHJpbmcoZj8uamltdU5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKSAhPT0gdGFyZ2V0XG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5ub3JtYWxpemVGaWVsZEFsaWFzKGYsIGZpZWxkTmFtZSk7XG4gICAgICAgIGlmIChhbGlhcyAmJiBhbGlhcy50b0xvd2VyQ2FzZSgpICE9PSBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIHJldHVybiBhbGlhcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGaWVsZEFsaWFzKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY3VzdG9tID0gdGhpcy5wcm9wcy5jb25maWc/LmxhYmVscz8uW25hbWVdO1xuICAgIGlmIChjdXN0b20pIHJldHVybiBjdXN0b207XG5cbiAgICBjb25zdCByZWFsTmFtZSA9IHRoaXMucmVzb2x2ZUZpZWxkTmFtZShuYW1lKSB8fCBuYW1lO1xuXG4gICAgLy8gTGl2ZSBtYXAgbGF5ZXIgZmlyc3Qg4oCUIHJlZmxlY3RzIGxhdGVzdCBBcmNHSVMgZmllbGQgZGlzcGxheSBuYW1lc1xuICAgIGNvbnN0IGZyb21MYXllciA9IHRoaXMucmVzb2x2ZUFsaWFzRnJvbUxpdmVMYXllcnMocmVhbE5hbWUpO1xuICAgIGlmIChmcm9tTGF5ZXIpIHJldHVybiBmcm9tTGF5ZXI7XG5cbiAgICBjb25zdCBkc0lkID0gdGhpcy5zdGF0ZS5sYXN0Q2xpY2tlZERzSWQ7XG4gICAgY29uc3QgZHM6IGFueSA9XG4gICAgICBkc0lkICYmIHRoaXMuc3RhdGUuZGF0YVNvdXJjZXNCeUlkPy5bZHNJZF1cbiAgICAgICAgPyB0aGlzLnN0YXRlLmRhdGFTb3VyY2VzQnlJZFtkc0lkXVxuICAgICAgICA6IG51bGw7XG4gICAgY29uc3QgZnJvbURzID0gdGhpcy5yZXNvbHZlQWxpYXNGcm9tRGF0YVNvdXJjZVNjaGVtYShyZWFsTmFtZSwgZHMpO1xuICAgIGlmIChmcm9tRHMpIHJldHVybiBmcm9tRHM7XG5cbiAgICBmb3IgKGNvbnN0IGxheWVyRHMgb2YgT2JqZWN0LnZhbHVlcyh0aGlzLnN0YXRlLmRhdGFTb3VyY2VzQnlJZCB8fCB7fSkpIHtcbiAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5yZXNvbHZlQWxpYXNGcm9tRGF0YVNvdXJjZVNjaGVtYShyZWFsTmFtZSwgbGF5ZXJEcyk7XG4gICAgICBpZiAoYWxpYXMpIHJldHVybiBhbGlhcztcbiAgICB9XG5cbiAgICBjb25zdCBjbGlja2VkTGF5ZXIgPSB0aGlzLmdldENsaWNrZWRMYXllcigpO1xuICAgIGNvbnN0IGxheWVyRmxkID0gY2xpY2tlZExheWVyXG4gICAgICA/IHRoaXMuZmluZEZpZWxkTWV0YU9uTGF5ZXIoY2xpY2tlZExheWVyLCByZWFsTmFtZSlcbiAgICAgIDogbnVsbDtcbiAgICBpZiAobGF5ZXJGbGQ/LmFsaWFzKSByZXR1cm4gU3RyaW5nKGxheWVyRmxkLmFsaWFzKTtcblxuICAgIHJldHVybiByZWFsTmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0RGF0ZVNtYXJ0KHJhdzogYW55KTogc3RyaW5nIHtcbiAgICBpZiAocmF3IGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIHJhdy50b0xvY2FsZVN0cmluZygpO1xuXG4gICAgaWYgKHR5cGVvZiByYXcgPT09IFwibnVtYmVyXCIgJiYgaXNGaW5pdGUocmF3KSkge1xuICAgICAgY29uc3QgbXMgPSByYXcgPCAxZTEyID8gcmF3ICogMTAwMCA6IHJhdztcbiAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZShtcyk7XG4gICAgICByZXR1cm4gaXNOYU4oZC5nZXRUaW1lKCkpXG4gICAgICAgID8gU3RyaW5nKHJhdylcbiAgICAgICAgOiBkLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgeWVhcjogXCJudW1lcmljXCIsXG4gICAgICAgICAgICBtb250aDogXCIyLWRpZ2l0XCIsXG4gICAgICAgICAgICBkYXk6IFwiMi1kaWdpdFwiLFxuICAgICAgICAgICAgaG91cjogXCIyLWRpZ2l0XCIsXG4gICAgICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcmF3ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBjb25zdCB0cmltbWVkID0gcmF3LnRyaW0oKTtcbiAgICAgIGlmICgvXlxcZHsxMCwxM30kLy50ZXN0KHRyaW1tZWQpKVxuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXREYXRlU21hcnQoTnVtYmVyKHRyaW1tZWQpKTtcbiAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0cmltbWVkKTtcbiAgICAgIGlmICghaXNOYU4oZC5nZXRUaW1lKCkpKSB7XG4gICAgICAgIHJldHVybiBkLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwge1xuICAgICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICAgIG1vbnRoOiBcIjItZGlnaXRcIixcbiAgICAgICAgICBkYXk6IFwiMi1kaWdpdFwiLFxuICAgICAgICAgIGhvdXI6IFwiMi1kaWdpdFwiLFxuICAgICAgICAgIG1pbnV0ZTogXCIyLWRpZ2l0XCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBTdHJpbmcocmF3KTtcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0VmFsdWUobmFtZTogc3RyaW5nLCByYXc6IGFueSk6IHN0cmluZyB7XG4gICAgaWYgKHJhdyA9PT0gbnVsbCB8fCByYXcgPT09IHVuZGVmaW5lZCB8fCByYXcgPT09IFwiXCIpIHJldHVybiBcIuKAlFwiO1xuXG4gICAgaWYgKHRoaXMuaXNEYXRlRmllbGQobmFtZSkpIHJldHVybiB0aGlzLmZvcm1hdERhdGVTbWFydChyYXcpO1xuICAgIGlmIChcbiAgICAgICh0eXBlb2YgcmF3ID09PSBcIm51bWJlclwiICYmIHJhdyA+IDFlOSAmJiByYXcgPCAxZTE0KSB8fFxuICAgICAgKHR5cGVvZiByYXcgPT09IFwic3RyaW5nXCIgJiYgL15cXGR7MTAsMTN9JC8udGVzdChyYXcpKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0RGF0ZVNtYXJ0KHJhdyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByYXcgPT09IFwibnVtYmVyXCIgJiYgaXNGaW5pdGUocmF3KSkgcmV0dXJuIHJhdy50b0xvY2FsZVN0cmluZyhcInJ1LVJVXCIpLnJlcGxhY2UoL1tcXHUwMGEwXFx1MjAyZl0vZywgXCIgXCIpLnJlcGxhY2UoLywvZywgXCIuXCIpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcuam9pbihcIiwgXCIpO1xuICAgIGlmICh0eXBlb2YgcmF3ID09PSBcIm9iamVjdFwiKSByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmF3KTtcbiAgICByZXR1cm4gU3RyaW5nKHJhdyk7XG4gIH1cblxuICBwcml2YXRlIGdldE91dEZpZWxkcyhsYXllcjogRmVhdHVyZUxheWVyLCBvaWRGaWVsZDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIC8vIGtlZXAgeW91ciBkZWJ1Z2dpbmcgYmVoYXZpb3JcbiAgICByZXR1cm4gW1wiKlwiXTtcbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gUG9wdXAgcG9zaXRpb25pbmcgLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgY2FsY3VsYXRlUG9wdXBQb3NpdGlvbiA9IChcbiAgICBjbGlja1BvaW50OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0sXG4gICAgdmlldzogX19lc3JpLk1hcFZpZXcgfCBfX2VzcmkuU2NlbmVWaWV3LFxuICApOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXcuY29udGFpbmVyIGFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IHJlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICBjb25zdCBtYXJnaW4gPSB0aGlzLlBPUFVQX01BUkdJTjtcbiAgICBjb25zdCBwb3B1cFcgPSB0aGlzLmdldFBvcHVwV2lkdGgodmlldyk7XG4gICAgY29uc3QgcG9wdXBIID0gcG9wdXBXO1xuXG4gICAgLy8g4pyFIEVCIGJ1aWxkcyBkaWZmZXI6XG4gICAgLy8gLSBzb21lIGdpdmUgZXYueC9ldi55IHJlbGF0aXZlIHRvIGNvbnRhaW5lciAoMC4ucmVjdC53aWR0aClcbiAgICAvLyAtIG90aGVycyBnaXZlIHZpZXdwb3J0IGNvb3JkcyAoc2FtZSBzcGFjZSBhcyByZWN0LmxlZnQvdG9wKVxuICAgIGNvbnN0IGxvb2tzQ29udGFpbmVyUmVsYXRpdmUgPVxuICAgICAgY2xpY2tQb2ludC54ID49IDAgJiZcbiAgICAgIGNsaWNrUG9pbnQueSA+PSAwICYmXG4gICAgICBjbGlja1BvaW50LnggPD0gcmVjdC53aWR0aCArIDIgJiZcbiAgICAgIGNsaWNrUG9pbnQueSA8PSByZWN0LmhlaWdodCArIDI7XG5cbiAgICAvLyBDb252ZXJ0IGNsaWNrIHRvIFZJRVdQT1JUIGNvb3JkcyAoYmVjYXVzZSBwb3B1cCBpcyBwb3NpdGlvbjogZml4ZWQpXG4gICAgY29uc3Qgdmlld3BvcnRDbGlja1ggPSBsb29rc0NvbnRhaW5lclJlbGF0aXZlXG4gICAgICA/IHJlY3QubGVmdCArIGNsaWNrUG9pbnQueFxuICAgICAgOiBjbGlja1BvaW50Lng7XG4gICAgY29uc3Qgdmlld3BvcnRDbGlja1kgPSBsb29rc0NvbnRhaW5lclJlbGF0aXZlXG4gICAgICA/IHJlY3QudG9wICsgY2xpY2tQb2ludC55XG4gICAgICA6IGNsaWNrUG9pbnQueTtcblxuICAgIC8vIE1hcCBjb250YWluZXIgYm91bmRhcmllcyBpbiB2aWV3cG9ydCBjb29yZHNcbiAgICBjb25zdCBtYXBMZWZ0ID0gcmVjdC5sZWZ0O1xuICAgIGNvbnN0IG1hcFRvcCA9IHJlY3QudG9wO1xuICAgIGNvbnN0IG1hcFJpZ2h0ID0gcmVjdC5yaWdodDtcbiAgICBjb25zdCBtYXBCb3R0b20gPSB0aGlzLmdldEVmZmVjdGl2ZU1hcEJvdHRvbSh2aWV3LCBtYXJnaW4pO1xuXG4gICAgLy8gUHJlZmVyIGJvdHRvbS1yaWdodCBvZiBjbGlja1xuICAgIGxldCB4ID0gdmlld3BvcnRDbGlja1ggKyBtYXJnaW47XG4gICAgbGV0IHkgPSB2aWV3cG9ydENsaWNrWSArIG1hcmdpbjtcblxuICAgIC8vIEZsaXAgbGVmdCBpZiBvdmVyZmxvd2luZyByaWdodCBlZGdlIChDUklUSUNBTCEpXG4gICAgLy8gQ2hlY2sgaWYgcG9wdXAgd291bGQgZ28gb3V0c2lkZSBtYXAncyByaWdodCBib3VuZGFyeVxuICAgIGlmICh4ICsgcG9wdXBXID4gbWFwUmlnaHQgLSBtYXJnaW4pIHtcbiAgICAgIHggPSB2aWV3cG9ydENsaWNrWCAtIHBvcHVwVyAtIG1hcmdpbjtcbiAgICB9XG5cbiAgICAvLyBGbGlwIHVwIGlmIG92ZXJmbG93aW5nIGJvdHRvbSBlZGdlXG4gICAgaWYgKHkgKyBwb3B1cEggPiBtYXBCb3R0b20gLSBtYXJnaW4pIHtcbiAgICAgIHkgPSB2aWV3cG9ydENsaWNrWSAtIHBvcHVwSCAtIG1hcmdpbjtcbiAgICB9XG5cbiAgICAvLyBGaW5hbCBoYXJkIGNsYW1wIHRvIG1hcCBjb250YWluZXIgYm91bmRzXG4gICAgLy8gVGhpcyBpcyB0aGUgY3JpdGljYWwgcGFydCAtIGVuc3VyZSBwb3B1cCBORVZFUiBleGNlZWRzIG1hcCBib3VuZHNcbiAgICBjb25zdCBtaW5YID0gbWFwTGVmdCArIG1hcmdpbjtcbiAgICBjb25zdCBtYXhYID0gbWFwUmlnaHQgLSBwb3B1cFcgLSBtYXJnaW47XG4gICAgY29uc3QgbWluWSA9IG1hcFRvcCArIG1hcmdpbjtcbiAgICBjb25zdCBtYXhZID0gbWFwQm90dG9tIC0gcG9wdXBIIC0gbWFyZ2luO1xuXG4gICAgeCA9IE1hdGgubWF4KG1pblgsIE1hdGgubWluKHgsIG1heFgpKTtcbiAgICB5ID0gTWF0aC5tYXgobWluWSwgTWF0aC5taW4oeSwgbWF4WSkpO1xuXG4gICAgLy8gRklOQUwgU0FGRVRZIE5FVDogRW5zdXJlIHggbmV2ZXIgZXhjZWVkcyByaWdodCBib3VuZGFyeVxuICAgIGlmICh4ICsgcG9wdXBXID4gbWFwUmlnaHQgLSBtYXJnaW4pIHtcbiAgICAgIHggPSBtYXBSaWdodCAtIHBvcHVwVyAtIG1hcmdpbjtcbiAgICB9XG4gICAgLy8gQWxzbyBlbnN1cmUgeCA+PSBsZWZ0IGJvdW5kYXJ5XG4gICAgaWYgKHggPCBtYXBMZWZ0ICsgbWFyZ2luKSB7XG4gICAgICB4ID0gbWFwTGVmdCArIG1hcmdpbjtcbiAgICB9XG5cbiAgICByZXR1cm4geyB4LCB5IH07XG4gIH07XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKFxuICAgIHByZXZQcm9wczogUmVhZG9ubHk8QWxsV2lkZ2V0UHJvcHM8Q29uZmlnPj4sXG4gICAgcHJldlN0YXRlOiBSZWFkb25seTxTdGF0ZT4sXG4gICkge1xuICAgIGNvbnN0IHByZXZEcyA9IGdldFNlbGVjdGVkRHNJZHMocHJldlByb3BzLnVzZURhdGFTb3VyY2VzKS5qb2luKFwifFwiKTtcbiAgICBjb25zdCBuZXh0RHMgPSBnZXRTZWxlY3RlZERzSWRzKHRoaXMucHJvcHMudXNlRGF0YVNvdXJjZXMpLmpvaW4oXCJ8XCIpO1xuICAgIGNvbnN0IGRzQ2hhbmdlZCA9IHByZXZEcyAhPT0gbmV4dERzO1xuICAgIGNvbnN0IHByZXZNYXAgPSBTdHJpbmcoXG4gICAgICAocHJldlByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5bMF0gfHxcbiAgICAgICAgKHByZXZQcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uZ2V0Py4oMCkgfHxcbiAgICAgICAgXCJcIixcbiAgICApO1xuICAgIGNvbnN0IG5leHRNYXAgPSBTdHJpbmcoXG4gICAgICAodGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uWzBdIHx8XG4gICAgICAgICh0aGlzLnByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5nZXQ/LigwKSB8fFxuICAgICAgICBcIlwiLFxuICAgICk7XG4gICAgY29uc3QgbWFwQ2hhbmdlZCA9IHByZXZNYXAgIT09IG5leHRNYXA7XG4gICAgaWYgKChkc0NoYW5nZWQgfHwgbWFwQ2hhbmdlZCkgJiYgdGhpcy5zdGF0ZS5qaW11TWFwVmlldykge1xuICAgICAgdm9pZCB0aGlzLmluaXRpYWxpemVNYXBDb25uZWN0aW9uKHRoaXMuc3RhdGUuamltdU1hcFZpZXcpO1xuICAgIH0gZWxzZSBpZiAobWFwQ2hhbmdlZCkge1xuICAgICAgdGhpcy5zY2hlZHVsZU1hcFZpZXdGYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHByZXZTdGF0ZS5zaG93UG9wdXAgIT09IHRoaXMuc3RhdGUuc2hvd1BvcHVwIHx8XG4gICAgICBwcmV2U3RhdGUucG9wdXBNaW5pbWl6ZWQgIT09IHRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWRcbiAgICApIHtcbiAgICAgIHRoaXMuYnJvYWRjYXN0UG9wdXBWaXNpYmlsaXR5KFxuICAgICAgICB0aGlzLnN0YXRlLnNob3dQb3B1cCAmJiAhdGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMuc3RhdGUuc2hvd1BvcHVwICYmXG4gICAgICAhdGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCAmJlxuICAgICAgcHJldlN0YXRlLnBpblRvQ29ybmVyICE9PSB0aGlzLnN0YXRlLnBpblRvQ29ybmVyXG4gICAgKSB7XG4gICAgICB0aGlzLmJyb2FkY2FzdFBvcHVwVmlzaWJpbGl0eSh0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd1BvcHVwIHx8IHRoaXMuc3RhdGUucG9wdXBNaW5pbWl6ZWQpIHJldHVybjtcblxuICAgIGNvbnN0IG9wZW5lZE5vdyA9XG4gICAgICAodGhpcy5zdGF0ZS5zaG93UG9wdXAgJiYgIXByZXZTdGF0ZS5zaG93UG9wdXApIHx8XG4gICAgICAocHJldlN0YXRlLnBvcHVwTWluaW1pemVkICYmICF0aGlzLnN0YXRlLnBvcHVwTWluaW1pemVkKTtcbiAgICBjb25zdCBhdHRhY2htZW50c0NoYW5nZWQgPVxuICAgICAgdGhpcy5zdGF0ZS5sb2FkaW5nQXR0YWNobWVudHMgIT09IHByZXZTdGF0ZS5sb2FkaW5nQXR0YWNobWVudHMgfHxcbiAgICAgICh0aGlzLnN0YXRlLmF0dGFjaG1lbnRzPy5sZW5ndGggfHwgMCkgIT09XG4gICAgICAgIChwcmV2U3RhdGUuYXR0YWNobWVudHM/Lmxlbmd0aCB8fCAwKTtcbiAgICBjb25zdCBsb2FkaW5nQ2hhbmdlZCA9IHRoaXMuc3RhdGUubG9hZGluZyAhPT0gcHJldlN0YXRlLmxvYWRpbmc7XG4gICAgY29uc3QgYXR0cnNDaGFuZ2VkID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEF0dHJzICE9PSBwcmV2U3RhdGUuc2VsZWN0ZWRBdHRycztcblxuICAgIGlmIChcbiAgICAgICFvcGVuZWROb3cgJiZcbiAgICAgICFhdHRhY2htZW50c0NoYW5nZWQgJiZcbiAgICAgICFsb2FkaW5nQ2hhbmdlZCAmJlxuICAgICAgIWF0dHJzQ2hhbmdlZFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2NoZWR1bGVQb3B1cExheW91dEFmdGVyQ29udGVudCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZVBvcHVwID0gKG9wdHM/OiB7XG4gICAgcmVzdG9yZUV4dGVudD86IGJvb2xlYW47XG4gICAgbm90aWZ5RGVzZWxlY3Q/OiBib29sZWFuO1xuICB9KSA9PiB7XG4gICAgLy8gQ2xvc2luZyB0aGUgcGFuZWwgYWxvbmUgbXVzdCBrZWVwIHRoZSBwb2x5Z29uIGhpZ2hsaWdodCArIG1hcCBleHRlbnQuXG4gICAgLy8gRXhwbGljaXQgY2FsbGVycyAoZW1wdHkgbWFwIGNsaWNrIC8gZ2VvIHJlc2V0KSBvcHQgaW50byByZXN0b3JlL2Rlc2VsZWN0LlxuICAgIGNvbnN0IHJlc3RvcmVFeHRlbnQgPSBvcHRzPy5yZXN0b3JlRXh0ZW50ID09PSB0cnVlO1xuICAgIGNvbnN0IG5vdGlmeURlc2VsZWN0ID0gb3B0cz8ubm90aWZ5RGVzZWxlY3QgPT09IHRydWU7XG5cbiAgICAvLyBJbnZhbGlkYXRlIGV2ZXJ5IHBlbmRpbmcgaGl0VGVzdC9xdWVyeS9hdHRhY2htZW50IHJlcXVlc3QuIE90aGVyd2lzZSBhXG4gICAgLy8gZmllbGQgY2xpY2sgdGhhdCB3YXMgc3RpbGwgbG9hZGluZyBjb3VsZCByZW9wZW4gaXRzIHN0YWxlIHBvcHVwIGFmdGVyXG4gICAgLy8gdGhlIHVzZXIgaGFkIGFscmVhZHkgbW92ZWQgdG8gYW5vdGhlciBkaXN0cmljdCBvciByZWdpb24uXG4gICAgdGhpcy5fY2xpY2tHZW5lcmF0aW9uICs9IDE7XG4gICAgdGhpcy5fbGF0ZXN0SW5kaWNlc1JlcXVlc3RJZCArPSAxO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dQb3B1cCkge1xuICAgICAgaWYgKG5vdGlmeURlc2VsZWN0KSB7XG4gICAgICAgIHRoaXMuY2xlYXJIaWdobGlnaHQoKTtcbiAgICAgICAgdGhpcy5ub3RpZnlHcmFmZlBvbHlnb25TZWxlY3Rpb24oXCJcIiwgZmFsc2UpO1xuICAgICAgfVxuICAgICAgaWYgKCFyZXN0b3JlRXh0ZW50KSB0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gPSBudWxsO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgc2VsZWN0ZWRBdHRyczogbnVsbCxcbiAgICAgICAgc2VsZWN0ZWRPSUQ6IG51bGwsXG4gICAgICAgIG9iamVjdElkRmllbGQ6IG51bGwsXG4gICAgICAgIGxhc3RDbGlja2VkRHNJZDogbnVsbCxcbiAgICAgICAgbGFzdENsaWNrZWRMYXllcktleTogbnVsbCxcbiAgICAgICAgcG9wdXBQb3NpdGlvbjogbnVsbCxcbiAgICAgICAgY2xpY2tTY3JlZW5Qb2ludDogbnVsbCxcbiAgICAgICAgcG9wdXBNaW5pbWl6ZWQ6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5vdGlmeURlc2VsZWN0KSB7XG4gICAgICB0aGlzLmNsZWFySGlnaGxpZ2h0KCk7XG4gICAgICB0aGlzLm5vdGlmeUdyYWZmUG9seWdvblNlbGVjdGlvbihcIlwiLCBmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMucmV2b2tlQWxsQXR0YWNobWVudFVybHMoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNob3dQb3B1cDogZmFsc2UsXG4gICAgICBwb3B1cE1pbmltaXplZDogZmFsc2UsXG4gICAgICBwb3B1cFBvc2l0aW9uOiBudWxsLFxuICAgICAgY2xpY2tTY3JlZW5Qb2ludDogbnVsbCxcbiAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBzZWxlY3RlZEF0dHJzOiBudWxsLFxuICAgICAgc2VsZWN0ZWRPSUQ6IG51bGwsXG4gICAgICBvYmplY3RJZEZpZWxkOiBudWxsLFxuICAgICAgbGFzdENsaWNrZWREc0lkOiBudWxsLFxuICAgICAgbGFzdENsaWNrZWRMYXllcktleTogbnVsbCxcbiAgICAgIGF0dGFjaG1lbnRzOiBbXSxcbiAgICAgIGF0dGFjaG1lbnRzRXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgbG9hZGluZ0F0dGFjaG1lbnRzOiBmYWxzZSxcbiAgICAgIGNoYXJ0RXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgY2hhcnRIb3ZlckluZGV4OiBudWxsLFxuICAgICAgbG9hZGluZ0xhdGVzdEluZGljZXM6IGZhbHNlLFxuICAgICAgbGF0ZXN0SW5kZXhEYXRlOiBudWxsLFxuICAgICAgbGF0ZXN0SW5kZXhWYWx1ZXM6IG51bGwsXG4gICAgfSk7XG4gICAgaWYgKHJlc3RvcmVFeHRlbnQpIHtcbiAgICAgIHRoaXMucmVzdG9yZUV4dGVudEJlZm9yZVNlbGVjdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9leHRlbnRCZWZvcmVTZWxlY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvKiogSGVhZGVyIFgg4oCUIGNvbGxhcHNlIHRoZSBwYW5lbDsga2VlcCBwb2x5Z29uIHNlbGVjdGlvbiArIGxvYWRlZCBhdHRycy4gKi9cbiAgcHJpdmF0ZSBtaW5pbWl6ZVBvcHVwID0gKCk6IHZvaWQgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8ICF0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCB0aGlzLnN0YXRlLnBvcHVwTWluaW1pemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoeyBwb3B1cE1pbmltaXplZDogdHJ1ZSB9KTtcbiAgfTtcblxuICAvKiogRXhwYW5kIGEgcHJldmlvdXNseSBtaW5pbWl6ZWQgYXR0cmlidXRlIHBhbmVsLiAqL1xuICBwcml2YXRlIGV4cGFuZFBvcHVwID0gKCk6IHZvaWQgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8ICF0aGlzLnN0YXRlLnNob3dQb3B1cCB8fCAhdGhpcy5zdGF0ZS5wb3B1cE1pbmltaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHsgcG9wdXBNaW5pbWl6ZWQ6IGZhbHNlIH0pO1xuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gRFMgaG9vayAoaW5zdGFudGlhdGVzIERTKSAtLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgb25EYXRhU291cmNlQ3JlYXRlZCA9IChkczogUXVlcmlhYmxlRGF0YVNvdXJjZSkgPT4ge1xuICAgIGlmICghZHM/LmlkKSByZXR1cm47XG4gICAgdGhpcy5kYXRhU291cmNlRW5naW5lLm9uRHNDcmVhdGVkKFxuICAgICAgZHMsXG4gICAgICBnZXRTZWxlY3RlZERzSWRzKHRoaXMucHJvcHMudXNlRGF0YVNvdXJjZXMpLFxuICAgICk7XG4gICAgdGhpcy5zZXRTdGF0ZSgocHJldikgPT4gKHtcbiAgICAgIGRhdGFTb3VyY2VzQnlJZDogeyAuLi4ocHJldi5kYXRhU291cmNlc0J5SWQgfHwge30pLCBbZHMuaWRdOiBkcyB9LFxuICAgIH0pKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5qaW11TWFwVmlldykge1xuICAgICAgdm9pZCB0aGlzLmluaXRpYWxpemVNYXBDb25uZWN0aW9uKHRoaXMuc3RhdGUuamltdU1hcFZpZXcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjaGVkdWxlTWFwVmlld0ZhbGxiYWNrKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0gQ2hhcnQgcmVuZGVyaW5nIC0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBwcml2YXRlIHRvZ2dsZUNoYXJ0RXhwYW5kZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSgocHJldikgPT4gKHsgY2hhcnRFeHBhbmRlZDogIXByZXYuY2hhcnRFeHBhbmRlZCB9KSk7XG4gIH07XG5cbiAgcHJpdmF0ZSByZW5kZXJDaGFydEljb24gPSAodHlwZTogXCJiYXJcIiB8IFwibGluZVwiID0gXCJiYXJcIik6IEpTWC5FbGVtZW50ID0+XG4gICAgdHlwZSA9PT0gXCJsaW5lXCIgPyAoXG4gICAgICA8TGluZUNoYXJ0IGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LWljb25cIiBzdHJva2VXaWR0aD17Mn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICApIDogKFxuICAgICAgPEJhckNoYXJ0MyBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC1pY29uXCIgc3Ryb2tlV2lkdGg9ezJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgKTtcblxuICBwcml2YXRlIGNsZWFyQ2hhcnRIb3ZlciA9ICgpOiB2b2lkID0+IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jaGFydEhvdmVySW5kZXggIT0gbnVsbCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNoYXJ0SG92ZXJJbmRleDogbnVsbCB9KTtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBzZXRDaGFydEhvdmVyID0gKGluZGV4OiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jaGFydEhvdmVySW5kZXggIT09IGluZGV4KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgY2hhcnRIb3ZlckluZGV4OiBpbmRleCB9KTtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBuaWNlQ2hhcnRNYXgodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpIHx8IHZhbHVlIDw9IDApIHJldHVybiAxO1xuICAgIGNvbnN0IHBhZGRlZCA9IHZhbHVlICogMS4wODtcbiAgICBjb25zdCBtYWduaXR1ZGUgPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcihNYXRoLmxvZzEwKHBhZGRlZCkpKTtcbiAgICBjb25zdCBub3JtYWxpemVkID0gcGFkZGVkIC8gbWFnbml0dWRlO1xuICAgIGxldCBuaWNlID0gMTA7XG4gICAgaWYgKG5vcm1hbGl6ZWQgPD0gMSkgbmljZSA9IDE7XG4gICAgZWxzZSBpZiAobm9ybWFsaXplZCA8PSAyKSBuaWNlID0gMjtcbiAgICBlbHNlIGlmIChub3JtYWxpemVkIDw9IDUpIG5pY2UgPSA1O1xuICAgIHJldHVybiBuaWNlICogbWFnbml0dWRlO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRDaGFydFRpY2sodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoTWF0aC5hYnModmFsdWUpID49IDEwMDApIHJldHVybiBgJHtNYXRoLnJvdW5kKHZhbHVlKX1gO1xuICAgIGlmIChNYXRoLmFicyh2YWx1ZSkgPj0gMTAwKSByZXR1cm4gYCR7TWF0aC5yb3VuZCh2YWx1ZSl9YDtcbiAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkpIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZS50b0ZpeGVkKDEpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRDaGFydFRvb2x0aXBWYWx1ZSh2YWx1ZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiBcIlwiO1xuICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSkgcmV0dXJuIHZhbHVlLnRvTG9jYWxlU3RyaW5nKFwicnUtUlVcIikucmVwbGFjZSgvW1xcdTAwYTBcXHUyMDJmXS9nLCBcIiBcIik7XG4gICAgcmV0dXJuIHZhbHVlLnRvTG9jYWxlU3RyaW5nKFwicnUtUlVcIiwge1xuICAgICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAxLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAxLFxuICAgIH0pLnJlcGxhY2UoL1tcXHUwMGEwXFx1MjAyZl0vZywgXCIgXCIpLnJlcGxhY2UoLywvZywgXCIuXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZFNtb290aExpbmVQYXRoKFxuICAgIHBvaW50czogQXJyYXk8eyB4OiBudW1iZXI7IHk6IG51bWJlciB9PixcbiAgKTogc3RyaW5nIHtcbiAgICBpZiAoIXBvaW50cy5sZW5ndGgpIHJldHVybiBcIlwiO1xuICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gYE0gJHtwb2ludHNbMF0ueH0gJHtwb2ludHNbMF0ueX1gO1xuICAgIH1cblxuICAgIGxldCBwYXRoID0gYE0gJHtwb2ludHNbMF0ueH0gJHtwb2ludHNbMF0ueX1gO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgY29uc3QgcDAgPSBwb2ludHNbaSAtIDFdIHx8IHBvaW50c1tpXTtcbiAgICAgIGNvbnN0IHAxID0gcG9pbnRzW2ldO1xuICAgICAgY29uc3QgcDIgPSBwb2ludHNbaSArIDFdO1xuICAgICAgY29uc3QgcDMgPSBwb2ludHNbaSArIDJdIHx8IHAyO1xuICAgICAgY29uc3QgY3AxeCA9IHAxLnggKyAocDIueCAtIHAwLngpIC8gNjtcbiAgICAgIGNvbnN0IGNwMXkgPSBwMS55ICsgKHAyLnkgLSBwMC55KSAvIDY7XG4gICAgICBjb25zdCBjcDJ4ID0gcDIueCAtIChwMy54IC0gcDEueCkgLyA2O1xuICAgICAgY29uc3QgY3AyeSA9IHAyLnkgLSAocDMueSAtIHAxLnkpIC8gNjtcbiAgICAgIHBhdGggKz0gYCBDICR7Y3AxeH0gJHtjcDF5fSwgJHtjcDJ4fSAke2NwMnl9LCAke3AyLnh9ICR7cDIueX1gO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRSb3VuZGVkQmFyUGF0aChcbiAgICB4OiBudW1iZXIsXG4gICAgeTogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgcmFkaXVzOiBudW1iZXIsXG4gICk6IHN0cmluZyB7XG4gICAgY29uc3QgciA9IE1hdGgubWluKHJhZGl1cywgd2lkdGggLyAyLCBoZWlnaHQpO1xuICAgIGNvbnN0IGJvdHRvbSA9IHkgKyBoZWlnaHQ7XG4gICAgcmV0dXJuIFtcbiAgICAgIGBNICR7eH0gJHtib3R0b219YCxcbiAgICAgIGBMICR7eH0gJHt5ICsgcn1gLFxuICAgICAgYFEgJHt4fSAke3l9ICR7eCArIHJ9ICR7eX1gLFxuICAgICAgYEwgJHt4ICsgd2lkdGggLSByfSAke3l9YCxcbiAgICAgIGBRICR7eCArIHdpZHRofSAke3l9ICR7eCArIHdpZHRofSAke3kgKyByfWAsXG4gICAgICBgTCAke3ggKyB3aWR0aH0gJHtib3R0b219YCxcbiAgICAgIFwiWlwiLFxuICAgIF0uam9pbihcIiBcIik7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckxhdGVzdEluZGljZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBsb2FkaW5nTGF0ZXN0SW5kaWNlcywgbGF0ZXN0SW5kZXhEYXRlLCBsYXRlc3RJbmRleFZhbHVlcyB9ID1cbiAgICAgIHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBoYXNWYWx1ZXMgPSAhIWxhdGVzdEluZGV4VmFsdWVzO1xuICAgIGNvbnN0IHNob3dCbG9ja2luZ0xvYWRlciA9IGxvYWRpbmdMYXRlc3RJbmRpY2VzICYmICFoYXNWYWx1ZXM7XG4gICAgY29uc3Qgc2hvd1JlZnJlc2hMb2FkZXIgPSBsb2FkaW5nTGF0ZXN0SW5kaWNlcyAmJiBoYXNWYWx1ZXM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1maWVsZC1saXN0IGFncmkzLWluZGljZXMtbGlzdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLXJvdyBhZ3JpMy1pbmRpY2VzLWhlYWRlci1yb3dcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1maWVsZC1sYWJlbCBhZ3JpMy1pbmRpY2VzLXRpdGxlXCI+XG4gICAgICAgICAgICA8U3Byb3V0IHNpemU9ezE0fSBzdHJva2VXaWR0aD17Mi4yfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAge3RoaXMudHIoXCJpbmRpY2VzLnRpdGxlXCIpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICB7bGF0ZXN0SW5kZXhEYXRlICYmICFsb2FkaW5nTGF0ZXN0SW5kaWNlcyAmJiAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1maWVsZC12YWx1ZSBhZ3JpMy1pbmRpY2VzLWRhdGVcIj5cbiAgICAgICAgICAgICAgPENhbGVuZGFyRGF5cyBzaXplPXsxM30gc3Ryb2tlV2lkdGg9ezJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgIHtsYXRlc3RJbmRleERhdGV9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtzaG93QmxvY2tpbmdMb2FkZXIgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1pbmRpY2VzLWxvYWRpbmctY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8QWdyaUNoYXJ0TG9hZGVyIGxhYmVsPXt0aGlzLnRyKFwiaW5kaWNlcy5sb2FkaW5nXCIpfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogaGFzVmFsdWVzID8gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YGFncmkzLWluZGljZXMtYm9keSR7XG4gICAgICAgICAgICAgIHNob3dSZWZyZXNoTG9hZGVyID8gXCIgYWdyaTMtaW5kaWNlcy1ib2R5LS1sb2FkaW5nXCIgOiBcIlwiXG4gICAgICAgICAgICB9YH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7c2hvd1JlZnJlc2hMb2FkZXIgPyAoXG4gICAgICAgICAgICAgIDxBZ3JpQ2hhcnRMb2FkZXIgbGFiZWw9e3RoaXMudHIoXCJpbmRpY2VzLmxvYWRpbmdcIil9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIHtBZ3JpUG9seWdvbi5WRUdfSU5ERVhfRklFTERTLmZpbHRlcihcbiAgICAgICAgICAgICAgKGYpID0+IGxhdGVzdEluZGV4VmFsdWVzW2ZdICE9IG51bGwsXG4gICAgICAgICAgICApLm1hcCgoZikgPT4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaTMtZmllbGQtcm93IGFncmkzLWluZGV4LXJvdyBhZ3JpMy1pbmRleC1yb3ctLSR7Zn1gfVxuICAgICAgICAgICAgICAgIGtleT17Zn1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BhZ3JpMy1maWVsZC1sYWJlbCBhZ3JpMy1pbmRleC1sYWJlbCBhZ3JpMy1pbmRleC1sYWJlbC0tJHtmfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtaW5kZXgtZG90XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgIHtmLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICB7bGF0ZXN0SW5kZXhWYWx1ZXNbZl0udG9GaXhlZCg0KX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaW5kaWNhdG9yIGFncmkzLXN0YXR1cy13YWl0aW5nXCI+XG4gICAgICAgICAgICA8SW5ib3ggY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIHt0aGlzLnRyKFwiaW5kaWNlcy5ub25lXCIpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfTtcblxuICBwcml2YXRlIHJlbmRlckNoYXJ0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIGlmICghY29uZmlnPy5jaGFydEVuYWJsZWQpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgY2hhcnRGaWVsZHMgPSBjb25maWcuY2hhcnRGaWVsZHMgfHwgW107XG4gICAgY29uc3QgY2hhcnRUeXBlID0gY29uZmlnLmNoYXJ0VHlwZSB8fCBcImJhclwiO1xuICAgIGNvbnN0IGNoYXJ0VGl0bGUgPSBjb25maWcuY2hhcnRUaXRsZSB8fCBcIlwiO1xuICAgIGNvbnN0IGNoYXJ0Q29sb3IgPSBjb25maWcuY2hhcnRDb2xvciB8fCBcIiMwMGE4ZThcIjtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRBdHRycztcbiAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnN0YXRlLnBpblRvQ29ybmVyO1xuICAgIGNvbnN0IGNoYXJ0RXhwYW5kZWQgPSBwaW5uZWQgfHwgdGhpcy5zdGF0ZS5jaGFydEV4cGFuZGVkO1xuXG4gICAgaWYgKCFhdHRycyB8fCBjaGFydEZpZWxkcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgLy8gQ29sbGVjdCBudW1lcmljIGRhdGEgZm9yIGNoYXJ0XG4gICAgY29uc3QgZGF0YVBvaW50czogeyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH1bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmllbGROYW1lIG9mIGNoYXJ0RmllbGRzKSB7XG4gICAgICBjb25zdCByYXcgPSBhdHRyc1tmaWVsZE5hbWVdO1xuICAgICAgY29uc3QgbnVtVmFsID0gdHlwZW9mIHJhdyA9PT0gXCJudW1iZXJcIiA/IHJhdyA6IHBhcnNlRmxvYXQocmF3KTtcbiAgICAgIGlmICghaXNOYU4obnVtVmFsKSkge1xuICAgICAgICBkYXRhUG9pbnRzLnB1c2goe1xuICAgICAgICAgIGxhYmVsOiB0aGlzLmdldEZpZWxkQWxpYXMoZmllbGROYW1lKSxcbiAgICAgICAgICB2YWx1ZTogbnVtVmFsLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGF0YVBvaW50cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgY2hhcnRMYWJlbCA9IGNoYXJ0VGl0bGUgfHwgZGF0YVBvaW50c1swXT8ubGFiZWwgfHwgXCJHcmFmaWtcIjtcbiAgICBjb25zdCBob3ZlckluZGV4ID0gdGhpcy5zdGF0ZS5jaGFydEhvdmVySW5kZXg7XG5cbiAgICBjb25zdCBzdmdXaWR0aCA9IDM0MDtcbiAgICBjb25zdCBzdmdIZWlnaHQgPSAxNjg7XG4gICAgY29uc3QgcGFkZGluZyA9IHsgdG9wOiAxMiwgcmlnaHQ6IDEyLCBib3R0b206IDgsIGxlZnQ6IDQwIH07XG4gICAgY29uc3QgY2hhcnRXID0gc3ZnV2lkdGggLSBwYWRkaW5nLmxlZnQgLSBwYWRkaW5nLnJpZ2h0O1xuICAgIGNvbnN0IGNoYXJ0SCA9IHN2Z0hlaWdodCAtIHBhZGRpbmcudG9wIC0gcGFkZGluZy5ib3R0b207XG5cbiAgICBjb25zdCBtYXhWYWwgPSBNYXRoLm1heCguLi5kYXRhUG9pbnRzLm1hcCgoZCkgPT4gZC52YWx1ZSksIDApO1xuICAgIGNvbnN0IHlNYXggPSB0aGlzLm5pY2VDaGFydE1heChtYXhWYWwpO1xuICAgIGNvbnN0IHNjYWxlWSA9ICh2OiBudW1iZXIpID0+IGNoYXJ0SCAtICh2IC8geU1heCkgKiBjaGFydEg7XG5cbiAgICBjb25zdCBpc0RhcmsgPSB0aGlzLnN0YXRlLmlzRGFya1RoZW1lO1xuICAgIGNvbnN0IGF4aXNDb2xvciA9IGlzRGFyayA/IFwicmdiYSgyNTUsMjU1LDI1NSwwLjU1KVwiIDogXCIjOTRhM2I4XCI7XG4gICAgY29uc3QgZ3JpZENvbG9yID0gaXNEYXJrID8gXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMTQpXCIgOiBcIiNkYmVhZmVcIjtcbiAgICBjb25zdCBjaGFydEJvZHlCZyA9IGlzRGFyayA/IFwidHJhbnNwYXJlbnRcIiA6IFwiI2ZmZmZmZlwiO1xuICAgIGNvbnN0IGhpZ2hsaWdodEZpbGwgPSBpc0RhcmtcbiAgICAgID8gXCJyZ2JhKDAsIDE2OCwgMjMyLCAwLjEyKVwiXG4gICAgICA6IFwicmdiYSgwLCAxNjgsIDIzMiwgMC4xKVwiO1xuXG4gICAgY29uc3QgZ3JpZExpbmVzID0gNDtcbiAgICBjb25zdCBncmlkU3RlcCA9IHlNYXggLyBncmlkTGluZXM7XG5cbiAgICBjb25zdCBiYXJMYXlvdXQgPVxuICAgICAgY2hhcnRUeXBlID09PSBcImJhclwiXG4gICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhckdhcCA9IE1hdGgubWF4KDYsIE1hdGgubWluKDEwLCBjaGFydFcgLyBkYXRhUG9pbnRzLmxlbmd0aCAvIDQpKTtcbiAgICAgICAgICAgIGNvbnN0IGJhclcgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgKGNoYXJ0VyAtIChkYXRhUG9pbnRzLmxlbmd0aCAtIDEpICogYmFyR2FwKSAvIGRhdGFQb2ludHMubGVuZ3RoLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhUG9pbnRzLm1hcCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB4ID0gcGFkZGluZy5sZWZ0ICsgaSAqIChiYXJXICsgYmFyR2FwKTtcbiAgICAgICAgICAgICAgY29uc3QgYmFySCA9IE1hdGgubWF4KDIsIChkLnZhbHVlIC8geU1heCkgKiBjaGFydEgpO1xuICAgICAgICAgICAgICBjb25zdCB5ID0gcGFkZGluZy50b3AgKyBjaGFydEggLSBiYXJIO1xuICAgICAgICAgICAgICByZXR1cm4geyAuLi5kLCBpLCB4LCB5LCBiYXJXLCBiYXJILCBjZW50ZXJYOiB4ICsgYmFyVyAvIDIgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pKClcbiAgICAgICAgOiBbXTtcblxuICAgIGNvbnN0IGxpbmVQb2ludHMgPVxuICAgICAgY2hhcnRUeXBlID09PSBcImxpbmVcIlxuICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGVwWCA9XG4gICAgICAgICAgICAgIGRhdGFQb2ludHMubGVuZ3RoID4gMSA/IGNoYXJ0VyAvIChkYXRhUG9pbnRzLmxlbmd0aCAtIDEpIDogMDtcbiAgICAgICAgICAgIHJldHVybiBkYXRhUG9pbnRzLm1hcCgoZCwgaSkgPT4gKHtcbiAgICAgICAgICAgICAgLi4uZCxcbiAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgeDpcbiAgICAgICAgICAgICAgICBwYWRkaW5nLmxlZnQgK1xuICAgICAgICAgICAgICAgIChkYXRhUG9pbnRzLmxlbmd0aCA+IDEgPyBpICogc3RlcFggOiBjaGFydFcgLyAyKSxcbiAgICAgICAgICAgICAgeTogcGFkZGluZy50b3AgKyBzY2FsZVkoZC52YWx1ZSksXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSkoKVxuICAgICAgICA6IFtdO1xuXG4gICAgY29uc3QgaG92ZXJQb2ludCA9XG4gICAgICBob3ZlckluZGV4ICE9IG51bGxcbiAgICAgICAgPyBjaGFydFR5cGUgPT09IFwiYmFyXCJcbiAgICAgICAgICA/IGJhckxheW91dFtob3ZlckluZGV4XVxuICAgICAgICAgIDogbGluZVBvaW50c1tob3ZlckluZGV4XVxuICAgICAgICA6IG51bGw7XG5cbiAgICBjb25zdCB0b29sdGlwTGVmdFBjdCA9IGhvdmVyUG9pbnRcbiAgICAgID8gTWF0aC5tYXgoOCwgTWF0aC5taW4oODIsIChob3ZlclBvaW50LnggLyBzdmdXaWR0aCkgKiAxMDApKVxuICAgICAgOiAwO1xuICAgIGNvbnN0IHRvb2x0aXBUb3BQY3QgPSBob3ZlclBvaW50XG4gICAgICA/IE1hdGgubWF4KDYsIE1hdGgubWluKDU4LCAoaG92ZXJQb2ludC55IC8gc3ZnSGVpZ2h0KSAqIDEwMCAtIDE4KSlcbiAgICAgIDogMDtcblxuICAgIGNvbnN0IGNoYXJ0U3ZnID0gKFxuICAgICAgPHN2Z1xuICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICB2aWV3Qm94PXtgMCAwICR7c3ZnV2lkdGh9ICR7c3ZnSGVpZ2h0fWB9XG4gICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXN2Z1wiXG4gICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmQ6IGNoYXJ0Qm9keUJnIH19XG4gICAgICA+XG4gICAgICAgIDxyZWN0XG4gICAgICAgICAgeD17cGFkZGluZy5sZWZ0fVxuICAgICAgICAgIHk9e3BhZGRpbmcudG9wfVxuICAgICAgICAgIHdpZHRoPXtjaGFydFd9XG4gICAgICAgICAgaGVpZ2h0PXtjaGFydEh9XG4gICAgICAgICAgZmlsbD17aXNEYXJrID8gXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpXCIgOiBcIiNmZmZmZmZcIn1cbiAgICAgICAgICByeD17Nn1cbiAgICAgICAgLz5cblxuICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogZ3JpZExpbmVzICsgMSB9KS5tYXAoKF8sIGkpID0+IHtcbiAgICAgICAgICBjb25zdCB2YWwgPSBncmlkU3RlcCAqIGk7XG4gICAgICAgICAgY29uc3QgeSA9IHBhZGRpbmcudG9wICsgc2NhbGVZKHZhbCk7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGtleT17YGdyaWQtJHtpfWB9PlxuICAgICAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgICAgIHgxPXtwYWRkaW5nLmxlZnR9XG4gICAgICAgICAgICAgICAgeTE9e3l9XG4gICAgICAgICAgICAgICAgeDI9e3N2Z1dpZHRoIC0gcGFkZGluZy5yaWdodH1cbiAgICAgICAgICAgICAgICB5Mj17eX1cbiAgICAgICAgICAgICAgICBzdHJva2U9e2dyaWRDb2xvcn1cbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICAgICAgICBzdHJva2VEYXNoYXJyYXk9XCIzIDVcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHg9e3BhZGRpbmcubGVmdCAtIDh9XG4gICAgICAgICAgICAgICAgeT17eSArIDR9XG4gICAgICAgICAgICAgICAgZmlsbD17YXhpc0NvbG9yfVxuICAgICAgICAgICAgICAgIGZvbnRTaXplPXsxMH1cbiAgICAgICAgICAgICAgICB0ZXh0QW5jaG9yPVwiZW5kXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0aGlzLmZvcm1hdENoYXJ0VGljayh2YWwpfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG5cbiAgICAgICAge2NoYXJ0VHlwZSA9PT0gXCJiYXJcIiAmJlxuICAgICAgICAgIGJhckxheW91dC5tYXAoKGJhcikgPT4gKFxuICAgICAgICAgICAgPGcga2V5PXtgYmFyLSR7YmFyLml9YH0+XG4gICAgICAgICAgICAgIHtob3ZlckluZGV4ID09PSBiYXIuaSAmJiAoXG4gICAgICAgICAgICAgICAgPHJlY3RcbiAgICAgICAgICAgICAgICAgIHg9e2Jhci54IC0gM31cbiAgICAgICAgICAgICAgICAgIHk9e3BhZGRpbmcudG9wfVxuICAgICAgICAgICAgICAgICAgd2lkdGg9e2Jhci5iYXJXICsgNn1cbiAgICAgICAgICAgICAgICAgIGhlaWdodD17Y2hhcnRIfVxuICAgICAgICAgICAgICAgICAgZmlsbD17aGlnaGxpZ2h0RmlsbH1cbiAgICAgICAgICAgICAgICAgIHJ4PXs1fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgICAgZD17dGhpcy5idWlsZFJvdW5kZWRCYXJQYXRoKGJhci54LCBiYXIueSwgYmFyLmJhclcsIGJhci5iYXJILCA1KX1cbiAgICAgICAgICAgICAgICBmaWxsPXtjaGFydENvbG9yfVxuICAgICAgICAgICAgICAgIG9wYWNpdHk9e2hvdmVySW5kZXggPT0gbnVsbCB8fCBob3ZlckluZGV4ID09PSBiYXIuaSA/IDEgOiAwLjQ1fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LWJhclwiXG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiB0aGlzLnNldENoYXJ0SG92ZXIoYmFyLmkpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8cmVjdFxuICAgICAgICAgICAgICAgIHg9e2Jhci54fVxuICAgICAgICAgICAgICAgIHk9e3BhZGRpbmcudG9wfVxuICAgICAgICAgICAgICAgIHdpZHRoPXtiYXIuYmFyV31cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e2NoYXJ0SH1cbiAgICAgICAgICAgICAgICBmaWxsPVwidHJhbnNwYXJlbnRcIlxuICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gdGhpcy5zZXRDaGFydEhvdmVyKGJhci5pKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICApKX1cblxuICAgICAgICB7Y2hhcnRUeXBlID09PSBcImxpbmVcIiAmJiAoXG4gICAgICAgICAgPGc+XG4gICAgICAgICAgICB7aG92ZXJJbmRleCAhPSBudWxsICYmIGxpbmVQb2ludHNbaG92ZXJJbmRleF0gJiYgKFxuICAgICAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgICAgIHgxPXtsaW5lUG9pbnRzW2hvdmVySW5kZXhdLnh9XG4gICAgICAgICAgICAgICAgeTE9e3BhZGRpbmcudG9wfVxuICAgICAgICAgICAgICAgIHgyPXtsaW5lUG9pbnRzW2hvdmVySW5kZXhdLnh9XG4gICAgICAgICAgICAgICAgeTI9e3BhZGRpbmcudG9wICsgY2hhcnRIfVxuICAgICAgICAgICAgICAgIHN0cm9rZT17Y2hhcnRDb2xvcn1cbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17MS41fVxuICAgICAgICAgICAgICAgIG9wYWNpdHk9ezAuMzV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZD17dGhpcy5idWlsZFNtb290aExpbmVQYXRoKGxpbmVQb2ludHMpfVxuICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgIHN0cm9rZT17Y2hhcnRDb2xvcn1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezIuNX1cbiAgICAgICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2xpbmVQb2ludHMubWFwKChwKSA9PiAoXG4gICAgICAgICAgICAgIDxnIGtleT17YHB0LSR7cC5pfWB9PlxuICAgICAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgICAgIGN4PXtwLnh9XG4gICAgICAgICAgICAgICAgICBjeT17cC55fVxuICAgICAgICAgICAgICAgICAgcj17aG92ZXJJbmRleCA9PT0gcC5pID8gNS41IDogNH1cbiAgICAgICAgICAgICAgICAgIGZpbGw9e2lzRGFyayA/IFwiIzBiMWEzMFwiIDogXCIjZmZmZmZmXCJ9XG4gICAgICAgICAgICAgICAgICBzdHJva2U9e2NoYXJ0Q29sb3J9XG4gICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17aG92ZXJJbmRleCA9PT0gcC5pID8gMi41IDogMn1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXBvaW50XCJcbiAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gdGhpcy5zZXRDaGFydEhvdmVyKHAuaSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICAgICAgICBjeD17cC54fVxuICAgICAgICAgICAgICAgICAgY3k9e3AueX1cbiAgICAgICAgICAgICAgICAgIHI9ezEyfVxuICAgICAgICAgICAgICAgICAgZmlsbD1cInRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gdGhpcy5zZXRDaGFydEhvdmVyKHAuaSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9nPlxuICAgICAgICApfVxuICAgICAgPC9zdmc+XG4gICAgKTtcblxuICAgIGNvbnN0IGNoYXJ0Qm9keSA9IChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtYm9keVwiXG4gICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5jbGVhckNoYXJ0SG92ZXJ9XG4gICAgICA+XG4gICAgICAgIHtob3ZlclBvaW50ICYmIChcbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10b29sdGlwXCJcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGxlZnQ6IGAke3Rvb2x0aXBMZWZ0UGN0fSVgLFxuICAgICAgICAgICAgICB0b3A6IGAke3Rvb2x0aXBUb3BQY3R9JWAsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtdG9vbHRpcC1sYWJlbFwiPntob3ZlclBvaW50LmxhYmVsfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10b29sdGlwLXZhbHVlXCI+XG4gICAgICAgICAgICAgIHt0aGlzLmZvcm1hdENoYXJ0VG9vbHRpcFZhbHVlKGhvdmVyUG9pbnQudmFsdWUpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG4gICAgICAgIHtjaGFydFN2Z31cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICBpZiAoIWNoYXJ0RXhwYW5kZWQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyXCJcbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLnRvZ2dsZUNoYXJ0RXhwYW5kZWR9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWljb25cIj57dGhpcy5yZW5kZXJDaGFydEljb24oY2hhcnRUeXBlKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtdHJpZ2dlci1sYWJlbFwiPntjaGFydExhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWNoZXZyb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgIOKWvlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXBhbmVsXCI+XG4gICAgICAgIHshcGlubmVkID8gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtcGFuZWwtaGVhZGVyXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQ2hhcnRFeHBhbmRlZH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWljb25cIj57dGhpcy5yZW5kZXJDaGFydEljb24oY2hhcnRUeXBlKX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC10cmlnZ2VyLWxhYmVsXCI+e2NoYXJ0TGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtdHJpZ2dlci1jaGV2cm9uIGlzLW9wZW5cIlxuICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICDilrRcbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWNoYXJ0LXBhbmVsLWhlYWRlciBhZ3JpMy1jaGFydC1wYW5lbC1oZWFkZXItLXN0YXRpY1wiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtdHJpZ2dlci1pY29uXCI+e3RoaXMucmVuZGVyQ2hhcnRJY29uKGNoYXJ0VHlwZSl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtY2hhcnQtdHJpZ2dlci1sYWJlbFwiPntjaGFydExhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1jaGFydC1jb250YWluZXJcIj57Y2hhcnRCb2R5fTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfTtcblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tIFBvcHVwIFVJIC0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBwcml2YXRlIHJlbmRlclBvcHVwID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHNlbGVjdGVkQXR0cnMsXG4gICAgICBzZWxlY3RlZE9JRCxcbiAgICAgIGxvYWRpbmcsXG4gICAgICBlcnJvcixcbiAgICAgIHNob3dQb3B1cCxcbiAgICAgIHBvcHVwTWluaW1pemVkLFxuICAgICAgcG9wdXBQb3NpdGlvbixcbiAgICAgIGxvYWRpbmdBdHRhY2htZW50cyxcbiAgICAgIGF0dGFjaG1lbnRzLFxuICAgICAgcGluVG9Db3JuZXIsXG4gICAgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBpZiAoIXNob3dQb3B1cCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBmaWVsZHMgPSAodGhpcy5wcm9wcy5jb25maWc/LmZpZWxkc1RvU2hvdyB8fCBbXSlcbiAgICAgIC5tYXAoKG4pID0+IHRoaXMucmVzb2x2ZUZpZWxkTmFtZShuKSB8fCBuKVxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcblxuICAgIGNvbnN0IHRpdGxlID0gdGhpcy50cihcInRpdGxlLmF0dHJpYnV0ZXNcIik7XG5cbiAgICBjb25zdCB2aWV3ID0gdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldztcbiAgICBjb25zdCBsYXlvdXRQb3MgPSBwb3B1cFBvc2l0aW9uO1xuXG4gICAgaWYgKHBvcHVwTWluaW1pemVkKSB7XG4gICAgICBjb25zdCB2aWV3Rm9yQ2hpcCA9IHZpZXcgfHwgdGhpcy5zdGF0ZS5qaW11TWFwVmlldz8udmlldyB8fCBudWxsO1xuICAgICAgY29uc3QgbWFwUmVjdCA9IHZpZXdGb3JDaGlwID8gdGhpcy5nZXRNYXBBcmVhUmVjdCh2aWV3Rm9yQ2hpcCkgOiBudWxsO1xuICAgICAgY29uc3QgY2hpcFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0gbWFwUmVjdFxuICAgICAgICA/IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICByaWdodDogTWF0aC5tYXgoXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmlubmVyV2lkdGggOiBtYXBSZWN0LnJpZ2h0KSAtXG4gICAgICAgICAgICAgICAgbWFwUmVjdC5yaWdodCArXG4gICAgICAgICAgICAgICAgdGhpcy5EQVNIQk9BUkRfUE9QVVBfVkVSVElDQUxfSU5TRVQsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdG9wOiBtYXBSZWN0LnRvcCArIHRoaXMuREFTSEJPQVJEX1BPUFVQX1ZFUlRJQ0FMX0lOU0VULFxuICAgICAgICAgICAgbGVmdDogXCJhdXRvXCIsXG4gICAgICAgICAgICBib3R0b206IFwiYXV0b1wiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBcIm5vbmVcIixcbiAgICAgICAgICB9XG4gICAgICAgIDoge1xuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLkRBU0hCT0FSRF9QT1BVUF9WRVJUSUNBTF9JTlNFVCxcbiAgICAgICAgICAgIHRvcDogdGhpcy5EQVNIQk9BUkRfUE9QVVBfVkVSVElDQUxfSU5TRVQsXG4gICAgICAgICAgICBsZWZ0OiBcImF1dG9cIixcbiAgICAgICAgICAgIGJvdHRvbTogXCJhdXRvXCIsXG4gICAgICAgICAgfTtcblxuICAgICAgY29uc3Qgc3RvcE1hcEhpdCA9IChlOiBSZWFjdC5TeW50aGV0aWNFdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaTMtcG9wdXAtbWluaW1pemVkICR7XG4gICAgICAgICAgICBwaW5Ub0Nvcm5lciA/IFwiaXMtcGlubmVkXCIgOiBcImlzLWZsb2F0aW5nXCJcbiAgICAgICAgICB9YH1cbiAgICAgICAgICBzdHlsZT17Y2hpcFN0eWxlfVxuICAgICAgICAgIHJlZj17dGhpcy5fcG9wdXBSZWZ9XG4gICAgICAgICAgb25Nb3VzZURvd249e3N0b3BNYXBIaXR9XG4gICAgICAgICAgb25Qb2ludGVyRG93bj17c3RvcE1hcEhpdH1cbiAgICAgICAgICBvbkNsaWNrPXtzdG9wTWFwSGl0fVxuICAgICAgICA+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC1taW5pbWl6ZWQtYnRuXCJcbiAgICAgICAgICAgIG9uTW91c2VEb3duPXtzdG9wTWFwSGl0fVxuICAgICAgICAgICAgb25Qb2ludGVyRG93bj17c3RvcE1hcEhpdH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgIHN0b3BNYXBIaXQoZSk7XG4gICAgICAgICAgICAgIHRoaXMuZXhwYW5kUG9wdXAoKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB0aXRsZT17dGhpcy50cihcImFjdGlvbi5leHBhbmRcIil9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnRyKFwiYWN0aW9uLmV4cGFuZFwiKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC1taW5pbWl6ZWQtYWNjZW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLXBvcHVwLW1pbmltaXplZC10aXRsZVwiPnt0aXRsZX08L3NwYW4+XG4gICAgICAgICAgICA8Q2hldnJvblVwXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLXBvcHVwLW1pbmltaXplZC1pY29uXCJcbiAgICAgICAgICAgICAgc2l6ZT17MTZ9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsyLjR9XG4gICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB3aWR0aDogcG9wdXBXaWR0aCwgaGVpZ2h0OiBwb3B1cEhlaWdodCB9ID0gdGhpcy5nZXRQb3B1cERpbWVuc2lvbnMoXG4gICAgICB2aWV3IHx8IG51bGwsXG4gICAgICBwaW5Ub0Nvcm5lcixcbiAgICAgIGxheW91dFBvcyxcbiAgICApO1xuXG4gICAgY29uc3QgZGltZW5zaW9uU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgICB3aWR0aDogYCR7cG9wdXBXaWR0aH1weGAsXG4gICAgICBtaW5XaWR0aDogYCR7cG9wdXBXaWR0aH1weGAsXG4gICAgICBtYXhXaWR0aDogYCR7cG9wdXBXaWR0aH1weGAsXG4gICAgICBoZWlnaHQ6IGAke3BvcHVwSGVpZ2h0fXB4YCxcbiAgICAgIG1heEhlaWdodDogYCR7cG9wdXBIZWlnaHR9cHhgLFxuICAgIH07XG5cbiAgICBjb25zdCBzdHlsZVBpbm5lZDogUmVhY3QuQ1NTUHJvcGVydGllcyA9IGxheW91dFBvc1xuICAgICAgPyB7XG4gICAgICAgICAgbGVmdDogbGF5b3V0UG9zLngsXG4gICAgICAgICAgdG9wOiBsYXlvdXRQb3MueSxcbiAgICAgICAgICB0cmFuc2Zvcm06IFwibm9uZVwiLFxuICAgICAgICAgIC4uLmRpbWVuc2lvblN0eWxlLFxuICAgICAgICB9XG4gICAgICA6IHsgLi4uZGltZW5zaW9uU3R5bGUgfTtcblxuICAgIGNvbnN0IHN0eWxlRnJlZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgICAgIGxlZnQ6IGxheW91dFBvcz8ueCB8fCBcIjUwJVwiLFxuICAgICAgdG9wOiBsYXlvdXRQb3M/LnkgfHwgXCI1MCVcIixcbiAgICAgIHRyYW5zZm9ybTogIWxheW91dFBvcyA/IFwidHJhbnNsYXRlKC01MCUsIC01MCUpXCIgOiBcIm5vbmVcIixcbiAgICAgIC4uLmRpbWVuc2lvblN0eWxlLFxuICAgIH07XG5cbiAgICBjb25zdCBwb3B1cFN0eWxlID0gcGluVG9Db3JuZXIgPyBzdHlsZVBpbm5lZCA6IHN0eWxlRnJlZTtcblxuICAgIGNvbnN0IHNob3dBdHRhY2htZW50cyA9XG4gICAgICB0aGlzLnByb3BzLmNvbmZpZz8uc2V0dGluZ3M/LnNob3dBdHRhY2htZW50cyAhPT0gZmFsc2U7XG4gICAgY29uc3QgaGFzQXR0YWNobWVudHMgPSAoYXR0YWNobWVudHM/Lmxlbmd0aCB8fCAwKSA+IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BhZ3JpMy1wb3B1cC1kaXJlY3QgJHtwaW5Ub0Nvcm5lciA/IFwiaXMtcGlubmVkXCIgOiBcImlzLWZsb2F0aW5nXCJ9YH1cbiAgICAgICAgc3R5bGU9e3BvcHVwU3R5bGV9XG4gICAgICAgIHJlZj17dGhpcy5fcG9wdXBSZWZ9XG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtcG9wdXAtaGVhZGVyXCIgb25Nb3VzZURvd249e3RoaXMub25Qb3B1cEhlYWRlck1vdXNlRG93bn0+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaTMtcG9wdXAtcGluJHtwaW5Ub0Nvcm5lciA/IFwiIGFjdGl2ZVwiIDogXCJcIn1gfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVQaW5Ub0Nvcm5lcn1cbiAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgcGluVG9Db3JuZXIgPyB0aGlzLnRyKFwiYWN0aW9uLnVucGluXCIpIDogdGhpcy50cihcImFjdGlvbi5waW5cIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cGluVG9Db3JuZXJ9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7cGluVG9Db3JuZXIgPyAoXG4gICAgICAgICAgICAgIDxQaW4gc2l6ZT17MTV9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8TWFwUGluIHNpemU9ezE1fSBzdHJva2VXaWR0aD17Mi4yfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC10aXRsZVwiPnt0aXRsZX08L2gyPlxuXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1wb3B1cC1jbG9zZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm1pbmltaXplUG9wdXB9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnRyKFwiYWN0aW9uLm1pbmltaXplXCIpfVxuICAgICAgICAgICAgdGl0bGU9e3RoaXMudHIoXCJhY3Rpb24ubWluaW1pemVcIil9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFggc2l6ZT17MTZ9IHN0cm9rZVdpZHRoPXsyLjR9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtcG9wdXAtY29udGVudFwiPlxuICAgICAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWVycm9yLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICA8QWxlcnRUcmlhbmdsZSBjbGFzc05hbWU9XCJhZ3JpMy1lcnJvci1pY29uXCIgc2l6ZT17MjB9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtZXJyb3ItdGl0bGVcIj5cbiAgICAgICAgICAgICAgICB7dGhpcy50cihcInN0YXR1cy53YXJuaW5nXCIpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1lcnJvci1tZXNzYWdlXCI+e2Vycm9yfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHtsb2FkaW5nICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtbG9hZGluZy1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgPEFncmlDaGFydExvYWRlciBsYWJlbD17dGhpcy50cihcInN0YXR1cy5sb2FkaW5nRmVhdHVyZVwiKX0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7IWxvYWRpbmcgJiYgc2VsZWN0ZWRBdHRycyAmJiBmaWVsZHMubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLWxpc3RcIj5cbiAgICAgICAgICAgICAge2ZpZWxkc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGVjdGVkQXR0cnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsID0gc2VsZWN0ZWRBdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PSBudWxsIHx8IHZhbCA9PT0gXCJcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhdmFsLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtZmllbGQtcm93XCIga2V5PXtuYW1lfT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaTMtZmllbGQtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5nZXRGaWVsZEFsaWFzKG5hbWUpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFncmkzLWZpZWxkLXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMuZm9ybWF0VmFsdWUobmFtZSwgc2VsZWN0ZWRBdHRyc1tuYW1lXSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpfVxuXG4gICAgICAgICAgICAgIHtmaWVsZHMuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChuYW1lKSA9PlxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBdHRycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJlxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBdHRyc1tuYW1lXSAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZEF0dHJzW25hbWVdICE9PSBcIlwiLFxuICAgICAgICAgICAgICApLmxlbmd0aCA9PT0gMCAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaW5kaWNhdG9yIGFncmkzLXN0YXR1cy13YWl0aW5nXCI+XG4gICAgICAgICAgICAgICAgICA8SW5ib3ggY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnRyKFwic3RhdHVzLm5vQ29uZmlndXJlZERhdGFcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuXG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNlbGVjdGVkQXR0cnMgJiYgZmllbGRzLmxlbmd0aCA9PT0gMCAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLXN0YXR1cy1pbmRpY2F0b3IgYWdyaTMtc3RhdHVzLXdhaXRpbmdcIj5cbiAgICAgICAgICAgICAgPFNldHRpbmdzMiBjbGFzc05hbWU9XCJhZ3JpMy1zdGF0dXMtaWNvblwiIHNpemU9ezE2fSBzdHJva2VXaWR0aD17Mi4yfSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICB7dGhpcy50cihcInN0YXR1cy5ub0ZpZWxkc1wiKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7LyogTGF0ZXN0LWRheSB2ZWdldGF0aW9uIGluZGljZXMgKi99XG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNlbGVjdGVkQXR0cnMgJiYgdGhpcy5yZW5kZXJMYXRlc3RJbmRpY2VzKCl9XG5cbiAgICAgICAgICB7LyogQ2hhcnQgKi99XG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNlbGVjdGVkQXR0cnMgJiYgdGhpcy5yZW5kZXJDaGFydCgpfVxuXG4gICAgICAgICAge3Nob3dBdHRhY2htZW50cyAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnRzXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtYXR0YWNobWVudHMtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50cy10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgPEZvbGRlck9wZW4gc2l6ZT17MTV9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICB7dGhpcy50cihcImF0dGFjaG1lbnRzLnRpdGxlXCIpfXtcIiBcIn1cbiAgICAgICAgICAgICAgICAgIHtoYXNBdHRhY2htZW50cyA/IGAoJHthdHRhY2htZW50cy5sZW5ndGh9KWAgOiBcIlwifVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7bG9hZGluZ0F0dGFjaG1lbnRzICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1sb2FkaW5nLWNvbnRhaW5lciBhZ3JpMy1sb2FkaW5nLWNvbnRhaW5lci0tY29tcGFjdFwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW5Ub3A6IDggfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8QWdyaUNoYXJ0TG9hZGVyIGxhYmVsPXt0aGlzLnRyKFwic3RhdHVzLmxvYWRpbmdBdHRhY2htZW50c1wiKX0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICB7IWxvYWRpbmdBdHRhY2htZW50cyAmJiAhaGFzQXR0YWNobWVudHMgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLXN0YXR1cy1pbmRpY2F0b3IgYWdyaTMtc3RhdHVzLXdhaXRpbmdcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luVG9wOiA2IH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPEZvbGRlck9wZW4gY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnRyKFwic3RhdHVzLm5vQXR0YWNobWVudHNcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgeyFsb2FkaW5nQXR0YWNobWVudHMgJiYgaGFzQXR0YWNobWVudHMgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtYXR0YWNobWVudHMtYm9keVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50cy1pbWFnZXMgYWdyaTMtZ3JpZFwiPlxuICAgICAgICAgICAgICAgICAgICB7YXR0YWNobWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChhKSA9PiBhLnByZXZpZXdPYmplY3RVcmwpXG4gICAgICAgICAgICAgICAgICAgICAgLm1hcCgoYSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtgaW1nLSR7YS5pZH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXthLnVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnQtdGh1bWIgYWdyaTMtY2FyZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthLm5hbWUgfHwgdGhpcy50cihcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxvYWQ9e2EubmFtZSB8fCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e2EucHJldmlld09iamVjdFVybCF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXthLm5hbWUgfHwgdGhpcy50cihcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLXRodW1iLWNhcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthLm5hbWUgfHwgXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthLm5hbWUgfHwgdGhpcy50cihcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50cy1maWxlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7YXR0YWNobWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChhKSA9PiAhYS5wcmV2aWV3T2JqZWN0VXJsKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGEpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaTMtYXR0YWNobWVudC1maWxlIGFncmkzLWNhcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2BmaWxlLSR7YS5pZH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnQtZmlsZS10b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50LWZpbGUtbmFtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YS5uYW1lIHx8IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBhcGVyY2xpcCBzaXplPXsxNH0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthLm5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cihcImF0dGFjaG1lbnQuZmlsZUZhbGxiYWNrXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmkzLWF0dGFjaG1lbnQtZG93bmxvYWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17YS51cmx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZD17YS5uYW1lIHx8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RG93bmxvYWQgc2l6ZT17MTN9IHN0cm9rZVdpZHRoPXsyLjJ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy50cihcImF0dGFjaG1lbnQuZG93bmxvYWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhZ3JpMy1hdHRhY2htZW50LWZpbGUtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoYS5jb250ZW50VHlwZSB8fCBcIlwiKS5zcGxpdChcIi9cIikucG9wKCkgfHwgXCJcIn17XCIgXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Euc2l6ZSA/IGDigKIgJHt0aGlzLmJ5dGVzVG9TaXplKGEuc2l6ZSl9YCA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7IWxvYWRpbmcgJiYgIXNlbGVjdGVkQXR0cnMgJiYgIWVycm9yICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWluZGljYXRvciBhZ3JpMy1zdGF0dXMtd2FpdGluZ1wiPlxuICAgICAgICAgICAgICA8TW91c2VQb2ludGVyQ2xpY2sgY2xhc3NOYW1lPVwiYWdyaTMtc3RhdHVzLWljb25cIiBzaXplPXsxNn0gc3Ryb2tlV2lkdGg9ezIuMn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAge3RoaXMudHIoXCJzdGF0dXMuY2xpY2tQb2x5Z29uXCIpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHVzZU1hcFdpZGdldElkcywgdXNlRGF0YVNvdXJjZXMgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgdGhlbWVDbGFzcyA9IHRoaXMuc3RhdGUuaXNEYXJrVGhlbWVcbiAgICAgID8gXCJhZ3JpMy10aGVtZS1kYXJrXCJcbiAgICAgIDogXCJhZ3JpMy10aGVtZS1saWdodFwiO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgYWdyaTMtYXR0ci1jYXJkICR7dGhlbWVDbGFzc31gfT5cbiAgICAgICAge3RoaXMucmVuZGVyUG9wdXAoKX1cblxuICAgICAgICA8RXZhcG9IaWRkZW5Db25uZWN0b3JzXG4gICAgICAgICAgdXNlRGF0YVNvdXJjZXM9e3VzZURhdGFTb3VyY2VzfVxuICAgICAgICAgIHVzZU1hcFdpZGdldElkcz17dXNlTWFwV2lkZ2V0SWRzfVxuICAgICAgICAgIG9uRGF0YVNvdXJjZUNyZWF0ZWQ9e3RoaXMub25EYXRhU291cmNlQ3JlYXRlZH1cbiAgICAgICAgICBvbkFjdGl2ZVZpZXdDaGFuZ2U9e3RoaXMub25BY3RpdmVWaWV3Q2hhbmdlfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGJvdHRvbTogXCI4cHhcIixcbiAgICAgICAgICAgIHJpZ2h0OiBcIjhweFwiLFxuICAgICAgICAgICAgd2lkdGg6IFwiOHB4XCIsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiOHB4XCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiB0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnM/Lmxlbmd0aFxuICAgICAgICAgICAgICA/IFwiIzEwYjk4MVwiXG4gICAgICAgICAgICAgIDogXCIjOTRhM2I4XCIsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IFwiNTAlXCIsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLjYsXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBcImFsbCAwLjNzIGVhc2VcIixcbiAgICAgICAgICAgIHBvaW50ZXJFdmVudHM6IFwibm9uZVwiLFxuICAgICAgICAgIH19XG4gICAgICAgICAgdGl0bGU9e1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5mZWF0dXJlTGF5ZXJzPy5sZW5ndGhcbiAgICAgICAgICAgICAgPyB0aGlzLnRyKFwic3RhdHVzLnJlYWR5XCIpXG4gICAgICAgICAgICAgIDogdGhpcy50cihcInN0YXR1cy5sb2FkaW5nXCIpXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgSUhhbmRsZUxpa2Uge1xuICByZW1vdmU6ICgpID0+IHZvaWQ7XG59XG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9IiwiZXhwb3J0IHR5cGUgTGFuZ0NvZGUgPSBcInV6X2xhdFwiIHwgXCJ1el9jeXJcIiB8IFwicnVcIiB8IFwiZW5cIjtcblxudHlwZSBEaWN0ID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbnR5cGUgQnVuZGxlID0gUmVjb3JkPExhbmdDb2RlLCBEaWN0PjtcblxuY29uc3QgTUVTU0FHRVM6IEJ1bmRsZSA9IHtcbiAgdXpfbGF0OiB7XG4gICAgXCJ0aXRsZS5kZWZhdWx0XCI6IFwiUG9saWdvbiBtYSdsdW1vdGlcIixcbiAgICBcInRpdGxlLmF0dHJpYnV0ZXNcIjogXCJBdHJpYnV0IG1hJ2x1bW90bGFyaVwiLFxuICAgIFwidGl0bGUucmVjb3JkXCI6IFwiTWEnbHVtb3QgI3t7aWR9fVwiLFxuICAgIFwiYWN0aW9uLnBpblwiOiBcIlBvcHVwbmkgeXVxb3JpLW8nbmdnYSBxYWRhc2hcIixcbiAgICBcImFjdGlvbi51bnBpblwiOiBcIlBvcHVwbmkgeWVjaGlzaFwiLFxuICAgIFwiYWN0aW9uLm1pbmltaXplXCI6IFwiUG9wdXBuaSB5aWcnaXNoXCIsXG4gICAgXCJhY3Rpb24uZXhwYW5kXCI6IFwiUG9wdXBuaSBvY2hpc2hcIixcbiAgICBcInN0YXR1cy53YXJuaW5nXCI6IFwiT2dvaGxhbnRpcmlzaFwiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdGZWF0dXJlXCI6IFwiT2J5ZWt0IG1hJ2x1bW90bGFyaSB5dWtsYW5tb3FkYS4uLlwiLFxuICAgIFwic3RhdHVzLm5vQ29uZmlndXJlZERhdGFcIjogXCJTb3psYW5nYW4gbWF5ZG9ubGFyIHVjaHVuIG1hJ2x1bW90IHRvcGlsbWFkaVwiLFxuICAgIFwic3RhdHVzLm5vRmllbGRzXCI6XG4gICAgICBcIk1heWRvbmxhciBzb3psYW5tYWdhbi4gVmlkamV0IHNvemxhbWFsYXJpZGEgbWF5ZG9ubGFybmkgdGFubGFuZy5cIixcbiAgICBcImF0dGFjaG1lbnRzLnRpdGxlXCI6IFwiUmFzbWxhciB2YSBmYXlsbGFyXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ0F0dGFjaG1lbnRzXCI6IFwiUW8nc2hpbWNoYWxhciB5dWtsYW5tb3FkYS4uLlwiLFxuICAgIFwic3RhdHVzLm5vQXR0YWNobWVudHNcIjogXCJRbydzaGltY2hhbGFyIHlvJ3FcIixcbiAgICBcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiOiBcIlJhc21cIixcbiAgICBcImF0dGFjaG1lbnQuZmlsZUZhbGxiYWNrXCI6IFwiZmF5bC17e2lkfX1cIixcbiAgICBcImF0dGFjaG1lbnQuZG93bmxvYWRcIjogXCJZdWtsYWIgb2xpc2hcIixcbiAgICBcInN0YXR1cy5jbGlja1BvbHlnb25cIjpcbiAgICAgIFwiVGFmc2lsb3RsYXJuaSBrbydyaXNoIHVjaHVuIHhhcml0YWRhIHBvbGlnb25uaSBib3NpbmdcIixcbiAgICBcInN0YXR1cy5yZWFkeVwiOiBcIlBvbHlnb24gSW5zcGVjdG9yIHRheXlvclwiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdcIjogXCJZdWtsYW5tb3FkYS4uLlwiLFxuICAgIFwiZXJyb3Iubm9NYXBWaWV3XCI6IFwiWGFyaXRhIGtvJ3JpbmlzaGkgdG9waWxtYWRpXCIsXG4gICAgXCJlcnJvci5ub0xheWVyc1NlbGVjdGVkXCI6XG4gICAgICBcIlFhdGxhbSB0YW5sYW5tYWdhbi4gU296bGFtYWxhcmRhIGthbWlkYSBiaXR0YSBGZWF0dXJlIExheWVyIHRhbmxhbmcuXCIsXG4gICAgXCJlcnJvci5zZWxlY3RlZExheWVyc01pc3NpbmdcIjpcbiAgICAgIFwiVGFubGFuZ2FuIHFhdGxhbWxhciB4YXJpdGFkYSB0b3BpbG1hZGkuIFRhbmxhbmdhbiBNYXAgdmlkamV0IGljaGlkYSBzaHUgcWF0bGFtbGFyIGJvcmxpZ2luaSB0ZWtzaGlyaW5nLlwiLFxuICAgIFwiZXJyb3Iub2JqZWN0SWRGaWVsZE1pc3NpbmdcIjpcbiAgICAgIFwiQm9zaWxnYW4gcWF0bGFtZGEgT2JqZWN0SWQgbWF5ZG9uaSB0b3BpbG1hZGkuXCIsXG4gICAgXCJlcnJvci5vYmplY3RJZE1pc3NpbmdcIjogXCJPYmplY3RJZCB0b3BpbG1hZGkuIEt1dGlsZ2FuIG1heWRvbjoge3tmaWVsZH19XCIsXG4gICAgXCJlcnJvci5mZWF0dXJlQnlPYmplY3RJZE1pc3NpbmdcIjogXCJPYmplY3RJZCBibyd5aWNoYSBvYnlla3QgdG9waWxtYWRpLlwiLFxuICAgIFwiZXJyb3IuY29uZmlndXJlZEZpZWxkTWlzc2luZ1wiOlxuICAgICAgXCJCYSd6aSBzb3psYW5nYW4gbWF5ZG9ubGFyIHRvcGlsbWFkaToge3tmaWVsZHN9fVwiLFxuICAgIFwiZXJyb3Iubm9EYXRhRm9yQ29uZmlndXJlZEZpZWxkc1wiOlxuICAgICAgXCJTb3psYW5nYW4gbWF5ZG9ubGFyIHVjaHVuIG1hJ2x1bW90IG1hdmp1ZCBlbWFzXCIsXG4gICAgXCJlcnJvci51bmV4cGVjdGVkXCI6IFwiS3V0aWxtYWdhbiB4YXRvOiB7e21lc3NhZ2V9fVwiLFxuICAgIFwiaW5kaWNlcy50aXRsZVwiOiBcIlZlZ2V0YXRzaXlhIGluZGVrc2xhcmlcIixcbiAgICBcImluZGljZXMubG9hZGluZ1wiOiBcIkluZGVrc2xhciB5dWtsYW5tb3FkYS4uLlwiLFxuICAgIFwiaW5kaWNlcy5ub25lXCI6IFwiQnUgcG9saWdvbiB1Y2h1biBpbmRla3MgbWEnbHVtb3RpIHlvJ3FcIixcbiAgfSxcbiAgdXpfY3lyOiB7XG4gICAgXCJ0aXRsZS5hdHRyaWJ1dGVzXCI6IFwi0JDRgtGA0LjQsdGD0YIg0LzQsNGK0LvRg9C80L7RgtC70LDRgNC4XCIsXG4gICAgXCJ0aXRsZS5kZWZhdWx0XCI6IFwi0J/QvtC70LjQs9C+0L0g0LzQsNGK0LvRg9C80L7RgtC4XCIsXG4gICAgXCJ0aXRsZS5yZWNvcmRcIjogXCLQnNCw0YrQu9GD0LzQvtGCICN7e2lkfX1cIixcbiAgICBcImFjdGlvbi5waW5cIjogXCLQn9C+0L/QsNC/0L3QuCDRjtKb0L7RgNC4LdGe0L3Qs9Cz0LAg0pvQsNC00LDRiFwiLFxuICAgIFwiYWN0aW9uLnVucGluXCI6IFwi0J/QvtC/0LDQv9C90Lgg0LXRh9C40YhcIixcbiAgICBcImFjdGlvbi5taW5pbWl6ZVwiOiBcItCf0L7Qv9Cw0L/QvdC4INC50LjSk9C40YhcIixcbiAgICBcImFjdGlvbi5leHBhbmRcIjogXCLQn9C+0L/QsNC/0L3QuCDQvtGH0LjRiFwiLFxuICAgIFwic3RhdHVzLndhcm5pbmdcIjogXCLQntCz0L7Ss9C70LDQvdGC0LjRgNC40YhcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nRmVhdHVyZVwiOiBcItCe0LHRitC10LrRgiDQvNCw0YrQu9GD0LzQvtGC0LvQsNGA0Lgg0Y7QutC70LDQvdC80L7Sm9C00LAuLi5cIixcbiAgICBcInN0YXR1cy5ub0NvbmZpZ3VyZWREYXRhXCI6IFwi0KHQvtC30LvQsNC90LPQsNC9INC80LDQudC00L7QvdC70LDRgCDRg9GH0YPQvSDQvNCw0YrQu9GD0LzQvtGCINGC0L7Qv9C40LvQvNCw0LTQuFwiLFxuICAgIFwic3RhdHVzLm5vRmllbGRzXCI6XG4gICAgICBcItCc0LDQudC00L7QvdC70LDRgCDRgdC+0LfQu9Cw0L3QvNCw0LPQsNC9LiDQktC40LTQttC10YIg0YHQvtC30LvQsNC80LDQu9Cw0YDQuNC00LAg0LzQsNC50LTQvtC90LvQsNGA0L3QuCDRgtCw0L3Qu9Cw0L3Qsy5cIixcbiAgICBcImF0dGFjaG1lbnRzLnRpdGxlXCI6IFwi0KDQsNGB0LzQu9Cw0YAg0LLQsCDRhNCw0LnQu9C70LDRgFwiLFxuICAgIFwic3RhdHVzLmxvYWRpbmdBdHRhY2htZW50c1wiOiBcItKa0Z7RiNC40LzRh9Cw0LvQsNGAINGO0LrQu9Cw0L3QvNC+0pvQtNCwLi4uXCIsXG4gICAgXCJzdGF0dXMubm9BdHRhY2htZW50c1wiOiBcItKa0Z7RiNC40LzRh9Cw0LvQsNGAINC50Z7Sm1wiLFxuICAgIFwiYXR0YWNobWVudC5pbWFnZUZhbGxiYWNrXCI6IFwi0KDQsNGB0LxcIixcbiAgICBcImF0dGFjaG1lbnQuZmlsZUZhbGxiYWNrXCI6IFwi0YTQsNC50Lste3tpZH19XCIsXG4gICAgXCJhdHRhY2htZW50LmRvd25sb2FkXCI6IFwi0K7QutC70LDQsSDQvtC70LjRiFwiLFxuICAgIFwic3RhdHVzLmNsaWNrUG9seWdvblwiOiBcItCi0LDRhNGB0LjQu9C+0YLQu9Cw0YDQvdC4INC60Z7RgNC40Ygg0YPRh9GD0L0g0YXQsNGA0LjRgtCw0LTQsCDQv9C+0LvQuNCz0L7QvdC90Lgg0LHQvtGB0LjQvdCzXCIsXG4gICAgXCJzdGF0dXMucmVhZHlcIjogXCJQb2x5Z29uIEluc3BlY3RvciDRgtCw0LnRkdGAXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ1wiOiBcItCu0LrQu9Cw0L3QvNC+0pvQtNCwLi4uXCIsXG4gICAgXCJlcnJvci5ub01hcFZpZXdcIjogXCLQpdCw0YDQuNGC0LAg0LrRntGA0LjQvdC40YjQuCDRgtC+0L/QuNC70LzQsNC00LhcIixcbiAgICBcImVycm9yLm5vTGF5ZXJzU2VsZWN0ZWRcIjpcbiAgICAgIFwi0prQsNGC0LvQsNC8INGC0LDQvdC70LDQvdC80LDQs9Cw0L0uINCh0L7Qt9C70LDQvNCw0LvQsNGA0LTQsCDQutCw0LzQuNC00LAg0LHQuNGC0YLQsCBGZWF0dXJlIExheWVyINGC0LDQvdC70LDQvdCzLlwiLFxuICAgIFwiZXJyb3Iuc2VsZWN0ZWRMYXllcnNNaXNzaW5nXCI6XG4gICAgICBcItCi0LDQvdC70LDQvdCz0LDQvSDSm9Cw0YLQu9Cw0LzQu9Cw0YAg0YXQsNGA0LjRgtCw0LTQsCDRgtC+0L/QuNC70LzQsNC00LguINCi0LDQvdC70LDQvdCz0LDQvSBNYXAg0LLQuNC00LbQtdGCINC40YfQuNC00LAg0YjRgyDSm9Cw0YLQu9Cw0LzQu9Cw0YAg0LHQvtGA0LvQuNCz0LjQvdC4INGC0LXQutGI0LjRgNC40L3Qsy5cIixcbiAgICBcImVycm9yLm9iamVjdElkRmllbGRNaXNzaW5nXCI6XG4gICAgICBcItCR0L7RgdC40LvQs9Cw0L0g0pvQsNGC0LvQsNC80LTQsCBPYmplY3RJZCDQvNCw0LnQtNC+0L3QuCDRgtC+0L/QuNC70LzQsNC00LguXCIsXG4gICAgXCJlcnJvci5vYmplY3RJZE1pc3NpbmdcIjogXCJPYmplY3RJZCDRgtC+0L/QuNC70LzQsNC00LguINCa0YPRgtC40LvQs9Cw0L0g0LzQsNC50LTQvtC9OiB7e2ZpZWxkfX1cIixcbiAgICBcImVycm9yLmZlYXR1cmVCeU9iamVjdElkTWlzc2luZ1wiOiBcIk9iamVjdElkINCx0Z7QudC40YfQsCDQvtCx0YrQtdC60YIg0YLQvtC/0LjQu9C80LDQtNC4LlwiLFxuICAgIFwiZXJyb3IuY29uZmlndXJlZEZpZWxkTWlzc2luZ1wiOlxuICAgICAgXCLQkdCw0YrQt9C4INGB0L7Qt9C70LDQvdCz0LDQvSDQvNCw0LnQtNC+0L3Qu9Cw0YAg0YLQvtC/0LjQu9C80LDQtNC4OiB7e2ZpZWxkc319XCIsXG4gICAgXCJlcnJvci5ub0RhdGFGb3JDb25maWd1cmVkRmllbGRzXCI6XG4gICAgICBcItCh0L7Qt9C70LDQvdCz0LDQvSDQvNCw0LnQtNC+0L3Qu9Cw0YAg0YPRh9GD0L0g0LzQsNGK0LvRg9C80L7RgiDQvNCw0LLQttGD0LQg0Y3QvNCw0YFcIixcbiAgICBcImVycm9yLnVuZXhwZWN0ZWRcIjogXCLQmtGD0YLQuNC70LzQsNCz0LDQvSDRhdCw0YLQvjoge3ttZXNzYWdlfX1cIixcbiAgICBcImluZGljZXMudGl0bGVcIjogXCLQktC10LPQtdGC0LDRhtC40Y8g0LjQvdC00LXQutGB0LvQsNGA0LhcIixcbiAgICBcImluZGljZXMubG9hZGluZ1wiOiBcItCY0L3QtNC10LrRgdC70LDRgCDRjtC60LvQsNC90LzQvtKb0LTQsC4uLlwiLFxuICAgIFwiaW5kaWNlcy5ub25lXCI6IFwi0JHRgyDQv9C+0LvQuNCz0L7QvSDRg9GH0YPQvSDQuNC90LTQtdC60YEg0LzQsNGK0LvRg9C80L7RgtC4INC50Z7Sm1wiLFxuICB9LFxuICBydToge1xuICAgIFwidGl0bGUuYXR0cmlidXRlc1wiOiBcItCQ0YLRgNC40LHRg9GC0LjQstC90YvQtSDQtNCw0L3QvdGL0LVcIixcbiAgICBcInRpdGxlLmRlZmF1bHRcIjogXCLQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQv9C+0LvQuNCz0L7QvdC1XCIsXG4gICAgXCJ0aXRsZS5yZWNvcmRcIjogXCLQl9Cw0L/QuNGB0YwgI3t7aWR9fVwiLFxuICAgIFwiYWN0aW9uLnBpblwiOiBcItCX0LDQutGA0LXQv9C40YLRjCDQvtC60L3QviDRgdC/0YDQsNCy0LAg0YHQstC10YDRhdGDXCIsXG4gICAgXCJhY3Rpb24udW5waW5cIjogXCLQntGC0LrRgNC10L/QuNGC0Ywg0L7QutC90L5cIixcbiAgICBcImFjdGlvbi5taW5pbWl6ZVwiOiBcItCh0LLQtdGA0L3Rg9GC0Ywg0L7QutC90L5cIixcbiAgICBcImFjdGlvbi5leHBhbmRcIjogXCLQoNCw0LfQstC10YDQvdGD0YLRjCDQvtC60L3QvlwiLFxuICAgIFwic3RhdHVzLndhcm5pbmdcIjogXCLQn9GA0LXQtNGD0L/RgNC10LbQtNC10L3QuNC1XCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ0ZlYXR1cmVcIjogXCLQl9Cw0LPRgNGD0LfQutCwINC00LDQvdC90YvRhSDQvtCx0YrQtdC60YLQsC4uLlwiLFxuICAgIFwic3RhdHVzLm5vQ29uZmlndXJlZERhdGFcIjogXCLQndC10YIg0LTQsNC90L3Ri9GFINC00LvRjyDQvdCw0YHRgtGA0L7QtdC90L3Ri9GFINC/0L7Qu9C10LlcIixcbiAgICBcInN0YXR1cy5ub0ZpZWxkc1wiOiBcItCf0L7Qu9GPINC90LUg0L3QsNGB0YLRgNC+0LXQvdGLLiDQktGL0LHQtdGA0LjRgtC1INC/0L7Qu9GPINCyINC90LDRgdGC0YDQvtC50LrQsNGFINCy0LjQtNC20LXRgtCwLlwiLFxuICAgIFwiYXR0YWNobWVudHMudGl0bGVcIjogXCLQmNC30L7QsdGA0LDQttC10L3QuNGPINC4INGE0LDQudC70YtcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nQXR0YWNobWVudHNcIjogXCLQl9Cw0LPRgNGD0LfQutCwINCy0LvQvtC20LXQvdC40LkuLi5cIixcbiAgICBcInN0YXR1cy5ub0F0dGFjaG1lbnRzXCI6IFwi0J3QtdGCINCy0LvQvtC20LXQvdC40LlcIixcbiAgICBcImF0dGFjaG1lbnQuaW1hZ2VGYWxsYmFja1wiOiBcItCY0LfQvtCx0YDQsNC20LXQvdC40LVcIixcbiAgICBcImF0dGFjaG1lbnQuZmlsZUZhbGxiYWNrXCI6IFwi0YTQsNC50Lste3tpZH19XCIsXG4gICAgXCJhdHRhY2htZW50LmRvd25sb2FkXCI6IFwi0KHQutCw0YfQsNGC0YxcIixcbiAgICBcInN0YXR1cy5jbGlja1BvbHlnb25cIjogXCLQndCw0LbQvNC40YLQtSDQvdCwINC/0L7Qu9C40LPQvtC9INC90LAg0LrQsNGA0YLQtSwg0YfRgtC+0LHRiyDRg9Cy0LjQtNC10YLRjCDQtNC10YLQsNC70LhcIixcbiAgICBcInN0YXR1cy5yZWFkeVwiOiBcIlBvbHlnb24gSW5zcGVjdG9yINCz0L7RgtC+0LJcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nXCI6IFwi0JfQsNCz0YDRg9C30LrQsC4uLlwiLFxuICAgIFwiZXJyb3Iubm9NYXBWaWV3XCI6IFwi0JLQuNC0INC60LDRgNGC0Ysg0L3QtSDQvdCw0LnQtNC10L1cIixcbiAgICBcImVycm9yLm5vTGF5ZXJzU2VsZWN0ZWRcIjpcbiAgICAgIFwi0KHQu9C+0Lgg0L3QtSDQstGL0LHRgNCw0L3Riy4g0JIg0L3QsNGB0YLRgNC+0LnQutCw0YUg0LLRi9Cx0LXRgNC40YLQtSDQvNC40L3QuNC80YPQvCDQvtC00LjQvSBGZWF0dXJlIExheWVyLlwiLFxuICAgIFwiZXJyb3Iuc2VsZWN0ZWRMYXllcnNNaXNzaW5nXCI6XG4gICAgICBcItCS0YvQsdGA0LDQvdC90YvQtSDRgdC70L7QuCDQvdC1INC90LDQudC00LXQvdGLINC90LAg0LrQsNGA0YLQtS4g0J/RgNC+0LLQtdGA0YzRgtC1LCDRh9GC0L4g0L7QvdC4INC10YHRgtGMINCyINCy0YvQsdGA0LDQvdC90L7QvCBNYXAg0LLQuNC00LbQtdGC0LUuXCIsXG4gICAgXCJlcnJvci5vYmplY3RJZEZpZWxkTWlzc2luZ1wiOiBcItCSINCy0YvQsdGA0LDQvdC90L7QvCDRgdC70L7QtSDQvdC1INC90LDQudC00LXQvdC+INC/0L7Qu9C1IE9iamVjdElkLlwiLFxuICAgIFwiZXJyb3Iub2JqZWN0SWRNaXNzaW5nXCI6IFwiT2JqZWN0SWQg0L3QtSDQvdCw0LnQtNC10L0uINCe0LbQuNC00LDQtdC80L7QtSDQv9C+0LvQtToge3tmaWVsZH19XCIsXG4gICAgXCJlcnJvci5mZWF0dXJlQnlPYmplY3RJZE1pc3NpbmdcIjogXCLQntCx0YrQtdC60YIg0L/QviBPYmplY3RJZCDQvdC1INC90LDQudC00LXQvS5cIixcbiAgICBcImVycm9yLmNvbmZpZ3VyZWRGaWVsZE1pc3NpbmdcIjpcbiAgICAgIFwi0J3QtdC60L7RgtC+0YDRi9C1INC90LDRgdGC0YDQvtC10L3QvdGL0LUg0L/QvtC70Y8g0L3QtSDQvdCw0LnQtNC10L3Rizoge3tmaWVsZHN9fVwiLFxuICAgIFwiZXJyb3Iubm9EYXRhRm9yQ29uZmlndXJlZEZpZWxkc1wiOiBcItCd0LXRgiDQtNCw0L3QvdGL0YUg0LTQu9GPINC90LDRgdGC0YDQvtC10L3QvdGL0YUg0L/QvtC70LXQuVwiLFxuICAgIFwiZXJyb3IudW5leHBlY3RlZFwiOiBcItCd0LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwOiB7e21lc3NhZ2V9fVwiLFxuICAgIFwiaW5kaWNlcy50aXRsZVwiOiBcItCY0L3QtNC10LrRgdGLINCy0LXQs9C10YLQsNGG0LjQuFwiLFxuICAgIFwiaW5kaWNlcy5sb2FkaW5nXCI6IFwi0JfQsNCz0YDRg9C30LrQsCDQuNC90LTQtdC60YHQvtCyLi4uXCIsXG4gICAgXCJpbmRpY2VzLm5vbmVcIjogXCLQndC10YIg0LTQsNC90L3Ri9GFINC/0L4g0LjQvdC00LXQutGB0LDQvCDQtNC70Y8g0Y3RgtC+0LPQviDQv9C+0LvQuNCz0L7QvdCwXCIsXG4gIH0sXG4gIGVuOiB7XG4gICAgXCJ0aXRsZS5hdHRyaWJ1dGVzXCI6IFwiQXR0cmlidXRlIGRhdGFcIixcbiAgICBcInRpdGxlLmRlZmF1bHRcIjogXCJQb2x5Z29uIGluZm9cIixcbiAgICBcInRpdGxlLnJlY29yZFwiOiBcIlJlY29yZCAje3tpZH19XCIsXG4gICAgXCJhY3Rpb24ucGluXCI6IFwiUGluIHBvcHVwIHRvIHRvcC1yaWdodFwiLFxuICAgIFwiYWN0aW9uLnVucGluXCI6IFwiVW5waW4gcG9wdXBcIixcbiAgICBcImFjdGlvbi5taW5pbWl6ZVwiOiBcIk1pbmltaXplIHBvcHVwXCIsXG4gICAgXCJhY3Rpb24uZXhwYW5kXCI6IFwiRXhwYW5kIHBvcHVwXCIsXG4gICAgXCJzdGF0dXMud2FybmluZ1wiOiBcIldhcm5pbmdcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nRmVhdHVyZVwiOiBcIkxvYWRpbmcgZmVhdHVyZSBkYXRhLi4uXCIsXG4gICAgXCJzdGF0dXMubm9Db25maWd1cmVkRGF0YVwiOiBcIk5vIGRhdGEgYXZhaWxhYmxlIGZvciBjb25maWd1cmVkIGZpZWxkc1wiLFxuICAgIFwic3RhdHVzLm5vRmllbGRzXCI6XG4gICAgICBcIk5vIGZpZWxkcyBjb25maWd1cmVkLiBQbGVhc2UgY29uZmlndXJlIGZpZWxkcyBpbiB3aWRnZXQgc2V0dGluZ3MuXCIsXG4gICAgXCJhdHRhY2htZW50cy50aXRsZVwiOiBcIkltYWdlcyAmIEZpbGVzXCIsXG4gICAgXCJzdGF0dXMubG9hZGluZ0F0dGFjaG1lbnRzXCI6IFwiTG9hZGluZyBhdHRhY2htZW50cy4uLlwiLFxuICAgIFwic3RhdHVzLm5vQXR0YWNobWVudHNcIjogXCJObyBhdHRhY2htZW50c1wiLFxuICAgIFwiYXR0YWNobWVudC5pbWFnZUZhbGxiYWNrXCI6IFwiSW1hZ2VcIixcbiAgICBcImF0dGFjaG1lbnQuZmlsZUZhbGxiYWNrXCI6IFwiYXR0YWNobWVudC17e2lkfX1cIixcbiAgICBcImF0dGFjaG1lbnQuZG93bmxvYWRcIjogXCJEb3dubG9hZFwiLFxuICAgIFwic3RhdHVzLmNsaWNrUG9seWdvblwiOiBcIkNsaWNrIGEgcG9seWdvbiBvbiB0aGUgbWFwIHRvIHNlZSBpdHMgZGV0YWlsc1wiLFxuICAgIFwic3RhdHVzLnJlYWR5XCI6IFwiUG9seWdvbiBJbnNwZWN0b3IgUmVhZHlcIixcbiAgICBcInN0YXR1cy5sb2FkaW5nXCI6IFwiTG9hZGluZy4uLlwiLFxuICAgIFwiZXJyb3Iubm9NYXBWaWV3XCI6IFwiTm8gbWFwIHZpZXcgcHJvdmlkZWRcIixcbiAgICBcImVycm9yLm5vTGF5ZXJzU2VsZWN0ZWRcIjpcbiAgICAgIFwiTm8gbGF5ZXJzIHNlbGVjdGVkLiBQbGVhc2Ugc2VsZWN0IG9uZSBvciBtb3JlIEZlYXR1cmUgTGF5ZXJzIGluIFNldHRpbmdzLlwiLFxuICAgIFwiZXJyb3Iuc2VsZWN0ZWRMYXllcnNNaXNzaW5nXCI6XG4gICAgICBcIk5vbmUgb2YgdGhlIHNlbGVjdGVkIGxheWVycyB3ZXJlIGZvdW5kIG9uIHRoZSBtYXAuIEVuc3VyZSB0aGUgY2hvc2VuIGxheWVycyBleGlzdCBpbiB0aGUgc2VsZWN0ZWQgTWFwIHdpZGdldC5cIixcbiAgICBcImVycm9yLm9iamVjdElkRmllbGRNaXNzaW5nXCI6IFwiT2JqZWN0SWQgZmllbGQgbm90IGZvdW5kIGZvciBjbGlja2VkIGxheWVyLlwiLFxuICAgIFwiZXJyb3Iub2JqZWN0SWRNaXNzaW5nXCI6IFwiT2JqZWN0SWQgbm90IGZvdW5kLiBFeHBlY3RlZCBmaWVsZDoge3tmaWVsZH19XCIsXG4gICAgXCJlcnJvci5mZWF0dXJlQnlPYmplY3RJZE1pc3NpbmdcIjogXCJGZWF0dXJlIG5vdCBmb3VuZCBieSBPYmplY3RJZC5cIixcbiAgICBcImVycm9yLmNvbmZpZ3VyZWRGaWVsZE1pc3NpbmdcIjpcbiAgICAgIFwiU29tZSBjb25maWd1cmVkIGZpZWxkcyBub3QgZm91bmQ6IHt7ZmllbGRzfX1cIixcbiAgICBcImVycm9yLm5vRGF0YUZvckNvbmZpZ3VyZWRGaWVsZHNcIjpcbiAgICAgIFwiTm8gZGF0YSBhdmFpbGFibGUgZm9yIGNvbmZpZ3VyZWQgZmllbGRzXCIsXG4gICAgXCJlcnJvci51bmV4cGVjdGVkXCI6IFwiVW5leHBlY3RlZCBlcnJvcjoge3ttZXNzYWdlfX1cIixcbiAgICBcImluZGljZXMudGl0bGVcIjogXCJWZWdldGF0aW9uIGluZGljZXNcIixcbiAgICBcImluZGljZXMubG9hZGluZ1wiOiBcIkxvYWRpbmcgaW5kaWNlcy4uLlwiLFxuICAgIFwiaW5kaWNlcy5ub25lXCI6IFwiTm8gaW5kZXggZGF0YSBmb3IgdGhpcyBwb2x5Z29uXCIsXG4gIH0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTGFuZyhpbnB1dDogYW55KTogTGFuZ0NvZGUge1xuICBjb25zdCByYXcgPSBTdHJpbmcoaW5wdXQgPz8gXCJcIilcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKHJhdyA9PT0gXCJlblwiIHx8IHJhdyA9PT0gXCJlbmdcIiB8fCByYXcgPT09IFwiZW5nbGlzaFwiKSByZXR1cm4gXCJlblwiO1xuICBpZiAocmF3ID09PSBcInJ1XCIgfHwgcmF3ID09PSBcInJ1c1wiIHx8IHJhdyA9PT0gXCJydXNzaWFuXCIpIHJldHVybiBcInJ1XCI7XG5cbiAgaWYgKFxuICAgIHJhdyA9PT0gXCJ1el9jeXJcIiB8fFxuICAgIHJhdyA9PT0gXCJ1ei1jeXJcIiB8fFxuICAgIHJhdyA9PT0gXCJ1el9jeXJsXCIgfHxcbiAgICByYXcgPT09IFwidXotY3lybFwiIHx8XG4gICAgcmF3ID09PSBcInV6Y3lybFwiIHx8XG4gICAgcmF3ID09PSBcInV6X2N5cmlsbGljXCIgfHxcbiAgICByYXcgPT09IFwidXotY3lyaWxsaWNcIiB8fFxuICAgIHJhdyA9PT0gXCJjeXJpbGxpY1wiXG4gICkge1xuICAgIHJldHVybiBcInV6X2N5clwiO1xuICB9XG5cbiAgaWYgKFxuICAgIHJhdyA9PT0gXCJ1el9sYXRcIiB8fFxuICAgIHJhdyA9PT0gXCJ1ei1sYXRcIiB8fFxuICAgIHJhdyA9PT0gXCJ1emxhdGluXCIgfHxcbiAgICByYXcgPT09IFwidXotbGF0aW5cIiB8fFxuICAgIHJhdyA9PT0gXCJ1elwiXG4gICkge1xuICAgIHJldHVybiBcInV6X2xhdFwiO1xuICB9XG5cbiAgcmV0dXJuIFwidXpfbGF0XCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0aWFsTGFuZygpOiBMYW5nQ29kZSB7XG4gIHJldHVybiBub3JtYWxpemVMYW5nKFxuICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiZXZhcG9fYXBwX2xhbmdcIikgfHxcbiAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYXBwX2xhbmdcIikgfHxcbiAgICAgIFwidXpfbGF0XCIsXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0aWFsVGhlbWUoKTogYm9vbGVhbiB7XG4gIGNvbnN0IHN0b3JlZFRoZW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJhZ3JpX3YxMV9hcHBfdGhlbWVcIik7XG4gIGlmIChzdG9yZWRUaGVtZSA9PT0gXCJkYXJrXCIpIHJldHVybiB0cnVlO1xuICBpZiAoc3RvcmVkVGhlbWUgPT09IFwibGlnaHRcIikgcmV0dXJuIGZhbHNlO1xuICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgY29uc3QgaXNMaWdodCA9XG4gICAgc3RvcmVkVGhlbWUgPT09IFwibGlnaHRcIiB8fFxuICAgIHJvb3QuY2xhc3NMaXN0LmNvbnRhaW5zKFwibGlnaHQtdGhlbWVcIikgfHxcbiAgICBib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImxpZ2h0LXRoZW1lXCIpIHx8XG4gICAgcm9vdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRoZW1lXCIpID09PSBcImxpZ2h0XCI7XG4gIHJldHVybiAhaXNMaWdodDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHQoXG4gIGxhbmc6IExhbmdDb2RlLFxuICBrZXk6IHN0cmluZyxcbiAgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPixcbik6IHN0cmluZyB7XG4gIGNvbnN0IGRpY3QgPSBNRVNTQUdFU1tsYW5nXSB8fCBNRVNTQUdFUy51el9sYXQ7XG4gIGNvbnN0IGZhbGxiYWNrID0gTUVTU0FHRVMuZW5ba2V5XSA/PyBrZXk7XG4gIGNvbnN0IHRlbXBsYXRlID0gZGljdFtrZXldID8/IGZhbGxiYWNrO1xuICBpZiAoIXBhcmFtcykgcmV0dXJuIHRlbXBsYXRlO1xuXG4gIHJldHVybiBPYmplY3Qua2V5cyhwYXJhbXMpLnJlZHVjZSgocmVzdWx0LCBwYXJhbUtleSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gU3RyaW5nKHBhcmFtc1twYXJhbUtleV0gPz8gXCJcIik7XG4gICAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKG5ldyBSZWdFeHAoYFxcXFx7XFxcXHske3BhcmFtS2V5fVxcXFx9XFxcXH1gLCBcImdcIiksIHZhbHVlKTtcbiAgfSwgdGVtcGxhdGUpO1xufVxuIiwiLyoqIEBqc3gganN4ICovXG5pbXBvcnQge1xuICBEYXRhU291cmNlQ29tcG9uZW50LFxuICBqc3gsXG4gIHR5cGUgRGF0YVNvdXJjZSxcbiAgdHlwZSBRdWVyaWFibGVEYXRhU291cmNlLFxufSBmcm9tIFwiamltdS1jb3JlXCI7XG5pbXBvcnQgeyBKaW11TWFwVmlld0NvbXBvbmVudCwgdHlwZSBKaW11TWFwVmlldyB9IGZyb20gXCJqaW11LWFyY2dpc1wiO1xuaW1wb3J0IHsgdG9QbGFpbkFycmF5IH0gZnJvbSBcIi4vZXZhcG8tZGF0YS1zb3VyY2UtZW5naW5lXCI7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gIHVzZURhdGFTb3VyY2VzPzogYW55O1xuICB1c2VNYXBXaWRnZXRJZHM/OiBhbnk7XG4gIG9uRGF0YVNvdXJjZUNyZWF0ZWQ/OiAoZHM6IFF1ZXJpYWJsZURhdGFTb3VyY2UpID0+IHZvaWQ7XG4gIG9uQWN0aXZlVmlld0NoYW5nZT86IChqaW11TWFwVmlldzogSmltdU1hcFZpZXcpID0+IHZvaWQ7XG59XG5cbi8qKiBIaWRkZW4gRGF0YVNvdXJjZSArIE1hcCBjb25uZWN0b3JzIChzYW1lIHBhdHRlcm4gYXMgTG9jYWxpemF0aW9uV2lkZ2V0VjIwKS5cbiAqIE9ubHkgY29ubmVjdCB0aGUgZmlyc3QgdXNlRGF0YVNvdXJjZSDigJQgbW91bnRpbmcgYWxsIH4zMCsgcmVnaW9uIEZlYXR1cmVTZXJ2ZXJzXG4gKiBvbiBldmVyeSBjaGlsZCByZW1vdW50IGZsb29kcyBOZXR3b3JrIHdpdGggRmVhdHVyZVNlcnZlcj9mPWpzb24gbG9hZHMgYW5kXG4gKiBkb2VzIG5vdCBoZWxwIG1hcCBoaXQtdGVzdGluZyAobGl2ZSBNYXBWaWV3IGxheWVycyBhcmUgdXNlZCBpbnN0ZWFkKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFdmFwb0hpZGRlbkNvbm5lY3RvcnMocHJvcHM6IFByb3BzKTogSlNYLkVsZW1lbnQge1xuICBjb25zdCBzZWxlY3RlZFVzZURhdGFTb3VyY2VzID0gdG9QbGFpbkFycmF5PGFueT4ocHJvcHMudXNlRGF0YVNvdXJjZXMpO1xuICBjb25zdCBtYXBXaWRnZXRJZCA9IHRvUGxhaW5BcnJheTxzdHJpbmc+KHByb3BzLnVzZU1hcFdpZGdldElkcylbMF07XG4gIGNvbnN0IHByaW1hcnlEcyA9IHNlbGVjdGVkVXNlRGF0YVNvdXJjZXNbMF07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwibm9uZVwiIH19IGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge3ByaW1hcnlEcyA/IChcbiAgICAgICAgPERhdGFTb3VyY2VDb21wb25lbnRcbiAgICAgICAgICBrZXk9e3ByaW1hcnlEcz8uZGF0YVNvdXJjZUlkfVxuICAgICAgICAgIHVzZURhdGFTb3VyY2U9e3ByaW1hcnlEc31cbiAgICAgICAgICBvbkRhdGFTb3VyY2VDcmVhdGVkPXtcbiAgICAgICAgICAgIHByb3BzLm9uRGF0YVNvdXJjZUNyZWF0ZWRcbiAgICAgICAgICAgICAgPyAoZHM6IERhdGFTb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgIHByb3BzLm9uRGF0YVNvdXJjZUNyZWF0ZWQ/LihkcyBhcyBRdWVyaWFibGVEYXRhU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7bWFwV2lkZ2V0SWQgJiYgKFxuICAgICAgICA8SmltdU1hcFZpZXdDb21wb25lbnRcbiAgICAgICAgICB1c2VNYXBXaWRnZXRJZD17bWFwV2lkZ2V0SWR9XG4gICAgICAgICAgb25BY3RpdmVWaWV3Q2hhbmdlPXtwcm9wcy5vbkFjdGl2ZVZpZXdDaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufVxuIiwiaW1wb3J0IHsgdHlwZSBRdWVyaWFibGVEYXRhU291cmNlIH0gZnJvbSBcImppbXUtY29yZVwiO1xuaW1wb3J0IHtcbiAgYnVpbGRFdmFwb1doZXJlLFxuICBjYW5vbmljYWxpemVSZWdpb25GaWx0ZXJWYWx1ZSxcbiAgZGlzYWJsZUxheWVyUGJmLFxuICBmbExvZyxcbiAgaGF5c3RhY2tNYXRjaGVzUmVnaW9uLFxuICBoYXlzdGFja01hdGNoZXNZZWFyLFxuICBnZXRRdWVyeWFibGVMYXllcixcbiAgcGlja1llYXJSZWdpb25MYXllclBvb2wsXG4gIHByZXBhcmVWYWx1ZUluZGV4LFxuICBxdWlja0xheWVyRmVhdHVyZUNvdW50LFxuICByZXNvbHZlRmVhdHVyZUxheWVyRm9yRmlsdGVycyxcbiAgc2FmZUxvYWRNYXBMYXllcixcbiAgc2NvcmVIYXlzdGFja0ZvckZpbHRlcnMsXG4gIHR5cGUgRXZhcG9GaWx0ZXJzLFxuICB0eXBlIFJlc29sdmVkRmVhdHVyZUxheWVyLFxufSBmcm9tIFwiLi9mZWF0dXJlLWxheWVyLWRhdGFcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHRvUGxhaW5BcnJheTxUID0gYW55Pih2YWw6IGFueSk6IFRbXSB7XG4gIGlmICghdmFsKSByZXR1cm4gW107XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHJldHVybiB2YWwgYXMgVFtdO1xuICBpZiAodHlwZW9mIHZhbC5hc011dGFibGUgPT09IFwiZnVuY3Rpb25cIilcbiAgICByZXR1cm4gdmFsLmFzTXV0YWJsZSh7IGRlZXA6IHRydWUgfSkgYXMgVFtdO1xuICBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB2YWwudG9BcnJheSgpIGFzIFRbXTtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0ZWREc0lkcyh1c2VEYXRhU291cmNlczogYW55KTogc3RyaW5nW10ge1xuICBjb25zdCB1ZHMgPSB0b1BsYWluQXJyYXk8YW55Pih1c2VEYXRhU291cmNlcyk7XG4gIGNvbnN0IGlkcyA9IHVkcy5tYXAoKHUpID0+IHU/LmRhdGFTb3VyY2VJZCkuZmlsdGVyKEJvb2xlYW4pO1xuICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGlkcykpO1xufVxuXG50eXBlIFNjb3JlZERzID0ge1xuICBkczogUXVlcmlhYmxlRGF0YVNvdXJjZTtcbiAgc2NvcmU6IG51bWJlcjtcbiAgcmVnaW9uTWF0Y2g6IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFJlc29sdmVzIHRoZSBhY3RpdmUgRmVhdHVyZUxheWVyIGZvciBkYXNoYm9hcmQgd2lkZ2V0cy5cbiAqIFByZWZlcnMgRVhCIERhdGFTb3VyY2VzIChzYW1lIHBhdGggYXMgTG9jYWxpemF0aW9uV2lkZ2V0VjIwKSxcbiAqIGZhbGxzIGJhY2sgdG8gSmltdU1hcFZpZXcgbWFwIGxheWVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2YXBvRGF0YVNvdXJjZUVuZ2luZSB7XG4gIHByaXZhdGUgZHNCeUlkOiBSZWNvcmQ8c3RyaW5nLCBRdWVyaWFibGVEYXRhU291cmNlPiA9IHt9O1xuICBwcml2YXRlIHNlbGVjdGVkSWRzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIHJlc29sdmVDYWNoZSA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIFByb21pc2U8UmVzb2x2ZWRGZWF0dXJlTGF5ZXIgfCBudWxsPlxuICA+KCk7XG5cbiAgb25Ec0NyZWF0ZWQoZHM6IFF1ZXJpYWJsZURhdGFTb3VyY2UsIGlkczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBpZiAoIWRzPy5pZCkgcmV0dXJuO1xuICAgIHRoaXMuZHNCeUlkW2RzLmlkXSA9IGRzO1xuICAgIHRoaXMuc2VsZWN0ZWRJZHMgPSBbLi4uaWRzXTtcbiAgICB0aGlzLnJlc29sdmVDYWNoZS5jbGVhcigpO1xuICB9XG5cbiAgc3luY1NlbGVjdGlvbihpZHM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZElkcyA9IFsuLi5pZHNdO1xuICAgIHRoaXMucmVzb2x2ZUNhY2hlLmNsZWFyKCk7XG4gIH1cblxuICBjbGVhclJlc29sdmVDYWNoZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc29sdmVDYWNoZS5jbGVhcigpO1xuICB9XG5cbiAgLyoqIFRydWUgd2hpbGUgc2VsZWN0ZWQgZGF0YSBzb3VyY2VzIGFyZSBzdGlsbCBjb25uZWN0aW5nIChubyBtYXAgZmFsbGJhY2sgeWV0KS4gKi9cbiAgaXNSZXNvbHZlUGVuZGluZyhqaW11TWFwVmlldzogYW55IHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmIChqaW11TWFwVmlldz8udmlldz8ubWFwKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCF0aGlzLnNlbGVjdGVkSWRzLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGNvbm5lY3RlZCA9IHRoaXMuc2VsZWN0ZWRJZHMuZmlsdGVyKChpZCkgPT4gISF0aGlzLmRzQnlJZFtpZF0pLmxlbmd0aDtcbiAgICByZXR1cm4gY29ubmVjdGVkIDwgdGhpcy5zZWxlY3RlZElkcy5sZW5ndGg7XG4gIH1cblxuICBoYXNDb25uZWN0ZWRTb3VyY2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSWRzLnNvbWUoKGlkKSA9PiAhIXRoaXMuZHNCeUlkW2lkXSk7XG4gIH1cblxuICBnZXRMYXllckZyb21EcyhkczogUXVlcmlhYmxlRGF0YVNvdXJjZSk6IGFueSB8IG51bGwge1xuICAgIGNvbnN0IGFueURzID0gZHMgYXMgYW55O1xuICAgIHJldHVybiBnZXRRdWVyeWFibGVMYXllcihhbnlEcy5sYXllciB8fCBhbnlEcy5fbGF5ZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREc0hheXN0YWNrKGRzOiBRdWVyaWFibGVEYXRhU291cmNlKTogc3RyaW5nIHtcbiAgICBjb25zdCBhbnlEcyA9IGRzIGFzIGFueTtcbiAgICBjb25zdCBsYXllciA9IGFueURzLmxheWVyIHx8IGFueURzLl9sYXllcjtcbiAgICBjb25zdCB0aXRsZSA9IFN0cmluZyhsYXllcj8udGl0bGUgfHwgXCJcIik7XG4gICAgY29uc3QgdXJsID0gU3RyaW5nKGxheWVyPy51cmwgfHwgYW55RHMuZ2V0RGF0YVNvdXJjZUpzb24/LigpPy51cmwgfHwgXCJcIik7XG4gICAgY29uc3QgbGFiZWwgPSBTdHJpbmcoXG4gICAgICBhbnlEcy5nZXRMYWJlbD8uKCkgfHxcbiAgICAgICAgYW55RHMuZ2V0RGF0YVNvdXJjZUpzb24/LigpPy5sYWJlbCB8fFxuICAgICAgICBhbnlEcy5nZXREYXRhU291cmNlSnNvbj8uKCk/LnNvdXJjZUxhYmVsIHx8XG4gICAgICAgIFwiXCIsXG4gICAgKTtcbiAgICByZXR1cm4gYCR7dGl0bGV9ICR7dXJsfSAke2xhYmVsfWA7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkUmVnaW9uUHJvYmVXaGVyZShcbiAgICBmaWx0ZXJzOiBQaWNrPEV2YXBvRmlsdGVycywgXCJ5aWxcIiB8IFwidmlsb3lhdFwiPixcbiAgICBsYXllcjogYW55LFxuICAgIGZpZWxkczogc3RyaW5nW10sXG4gICAgcmVnaW9uU2NvcGVkOiBib29sZWFuLFxuICAgIHllYXJTY29wZWQ6IGJvb2xlYW4sXG4gICk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJ1aWxkRXZhcG9XaGVyZShcbiAgICAgIHtcbiAgICAgICAgeWlsOiBmaWx0ZXJzLnlpbCxcbiAgICAgICAgdmlsb3lhdDogZmlsdGVycy52aWxveWF0LFxuICAgICAgICBza2lwUmVnaW9uRmlsdGVyOiByZWdpb25TY29wZWQsXG4gICAgICAgIHNraXBZZWFyRmlsdGVyOiB5ZWFyU2NvcGVkLFxuICAgICAgfSxcbiAgICAgIGZpZWxkcyxcbiAgICAgIGxheWVyLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBpY2tCZXN0RHNCeUNvdW50KFxuICAgIHBvb2w6IFNjb3JlZERzW10sXG4gICAgZmlsdGVyczogUGljazxFdmFwb0ZpbHRlcnMsIFwieWlsXCIgfCBcInZpbG95YXRcIj4sXG4gICAgcHJlZmVycmVkRHM6IFF1ZXJpYWJsZURhdGFTb3VyY2UgfCBudWxsLFxuICApOiBQcm9taXNlPFNjb3JlZERzIHwgbnVsbD4ge1xuICAgIGlmICghcG9vbC5sZW5ndGgpIHJldHVybiBudWxsO1xuICAgIGlmICghU3RyaW5nKGZpbHRlcnMudmlsb3lhdCA/PyBcIlwiKS50cmltKCkgfHwgcG9vbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBwb29sWzBdO1xuICAgIH1cblxuICAgIGNvbnN0IHNjb3JlZDogQXJyYXk8eyBpdGVtOiBTY29yZWREczsgY291bnQ6IG51bWJlciB9PiA9IFtdO1xuICAgIGNvbnN0IHRyeUl0ZW0gPSBhc3luYyAoaXRlbTogU2NvcmVkRHMpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckZyb21EcyhpdGVtLmRzKTtcbiAgICAgIGlmICghbGF5ZXIpIHJldHVybjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNhZmVMb2FkTWFwTGF5ZXIobGF5ZXIpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgfVxuICAgICAgY29uc3QgZmllbGRzOiBzdHJpbmdbXSA9IChsYXllci5maWVsZHMgfHwgW10pLm1hcCgoZjogYW55KSA9PiBmLm5hbWUpO1xuICAgICAgY29uc3Qgd2hlcmUgPSB0aGlzLmJ1aWxkUmVnaW9uUHJvYmVXaGVyZShcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgbGF5ZXIsXG4gICAgICAgIGZpZWxkcyxcbiAgICAgICAgaXRlbS5yZWdpb25NYXRjaCxcbiAgICAgICAgaGF5c3RhY2tNYXRjaGVzWWVhcih0aGlzLmdldERzSGF5c3RhY2soaXRlbS5kcyksIGZpbHRlcnMueWlsKSxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb3VudCA9IGF3YWl0IHF1aWNrTGF5ZXJGZWF0dXJlQ291bnQobGF5ZXIsIHdoZXJlKTtcbiAgICAgIHNjb3JlZC5wdXNoKHsgaXRlbSwgY291bnQgfSk7XG4gICAgfTtcblxuICAgIGlmIChwcmVmZXJyZWREcykge1xuICAgICAgY29uc3QgcHJlZmVycmVkID0gcG9vbC5maW5kKChwKSA9PiBwLmRzLmlkID09PSBwcmVmZXJyZWREcy5pZCk7XG4gICAgICBpZiAocHJlZmVycmVkKSB7XG4gICAgICAgIGF3YWl0IHRyeUl0ZW0ocHJlZmVycmVkKTtcbiAgICAgICAgY29uc3QgcHJlZmVycmVkQ291bnQgPSBzY29yZWRbMF0/LmNvdW50ID8/IC0xO1xuICAgICAgICBpZiAocHJlZmVycmVkQ291bnQgPiAwKSByZXR1cm4gcHJlZmVycmVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJlbWFpbmluZyA9IHBvb2wuZmlsdGVyKFxuICAgICAgKHApID0+ICFwcmVmZXJyZWREcyB8fCBwLmRzLmlkICE9PSBwcmVmZXJyZWREcy5pZCxcbiAgICApO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlbWFpbmluZy5tYXAoKGl0ZW0pID0+IHRyeUl0ZW0oaXRlbSkpKTtcblxuICAgIGNvbnN0IHBvc2l0aXZlID0gc2NvcmVkXG4gICAgICAuZmlsdGVyKChzKSA9PiBzLmNvdW50ID4gMClcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmNvdW50IC0gYS5jb3VudCk7XG4gICAgaWYgKHBvc2l0aXZlLmxlbmd0aCkgcmV0dXJuIHBvc2l0aXZlWzBdLml0ZW07XG5cbiAgICByZXR1cm4gKFxuICAgICAgc2NvcmVkLmZpbmQoKHMpID0+IHMuY291bnQgPj0gMCk/Lml0ZW0gfHxcbiAgICAgIHBvb2wuZmluZCgocCkgPT4gcC5kcy5pZCA9PT0gcHJlZmVycmVkRHM/LmlkKSB8fFxuICAgICAgcG9vbFswXVxuICAgICk7XG4gIH1cblxuICBhc3luYyByZXNvbHZlRnJvbURhdGFTb3VyY2VzKFxuICAgIGZpbHRlcnM6IFBpY2s8RXZhcG9GaWx0ZXJzLCBcInlpbFwiIHwgXCJ2aWxveWF0XCI+LFxuICApOiBQcm9taXNlPFJlc29sdmVkRmVhdHVyZUxheWVyIHwgbnVsbD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRGaWx0ZXJzID0ge1xuICAgICAgeWlsOiBmaWx0ZXJzLnlpbCxcbiAgICAgIHZpbG95YXQ6IGNhbm9uaWNhbGl6ZVJlZ2lvbkZpbHRlclZhbHVlKFN0cmluZyhmaWx0ZXJzLnZpbG95YXQgPz8gXCJcIikudHJpbSgpKSxcbiAgICB9O1xuICAgIGNvbnN0IHdhbnRzUmVnaW9uID0gISFub3JtYWxpemVkRmlsdGVycy52aWxveWF0O1xuICAgIGNvbnN0IHNjb3JlZDogU2NvcmVkRHNbXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBpZCBvZiB0aGlzLnNlbGVjdGVkSWRzKSB7XG4gICAgICBjb25zdCBkcyA9IHRoaXMuZHNCeUlkW2lkXTtcbiAgICAgIGlmICghZHMgfHwgIXRoaXMuZ2V0TGF5ZXJGcm9tRHMoZHMpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGhheXN0YWNrID0gdGhpcy5nZXREc0hheXN0YWNrKGRzKTtcbiAgICAgIHNjb3JlZC5wdXNoKHtcbiAgICAgICAgZHMsXG4gICAgICAgIHNjb3JlOiBzY29yZUhheXN0YWNrRm9yRmlsdGVycyhoYXlzdGFjaywgbm9ybWFsaXplZEZpbHRlcnMpLFxuICAgICAgICByZWdpb25NYXRjaDogaGF5c3RhY2tNYXRjaGVzUmVnaW9uKGhheXN0YWNrLCBub3JtYWxpemVkRmlsdGVycy52aWxveWF0KSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghc2NvcmVkLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBwb29sID0gcGlja1llYXJSZWdpb25MYXllclBvb2woXG4gICAgICBzY29yZWQsXG4gICAgICBzY29yZWQubGVuZ3RoLFxuICAgICAgbm9ybWFsaXplZEZpbHRlcnMsXG4gICAgICAoaXRlbSkgPT4gdGhpcy5nZXREc0hheXN0YWNrKGl0ZW0uZHMpLFxuICAgICk7XG4gICAgaWYgKCFwb29sLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgYmVzdFNjb3JlID0gLTE7XG4gICAgbGV0IHNjb3JlV2lubmVyOiBTY29yZWREcyB8IG51bGwgPSBudWxsO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBwb29sKSB7XG4gICAgICBpZiAoaXRlbS5zY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICBiZXN0U2NvcmUgPSBpdGVtLnNjb3JlO1xuICAgICAgICBzY29yZVdpbm5lciA9IGl0ZW07XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJlZmVycmVkRHMgPSBzY29yZVdpbm5lcj8uZHMgfHwgbnVsbDtcbiAgICBjb25zdCBiZXN0SXRlbSA9XG4gICAgICB3YW50c1JlZ2lvbiAmJiBwb29sLmxlbmd0aCA+IDFcbiAgICAgICAgPyBhd2FpdCB0aGlzLnBpY2tCZXN0RHNCeUNvdW50KHBvb2wsIG5vcm1hbGl6ZWRGaWx0ZXJzLCBwcmVmZXJyZWREcylcbiAgICAgICAgOiBzY29yZVdpbm5lcjtcblxuICAgIGNvbnN0IGJlc3REcyA9IGJlc3RJdGVtPy5kcyB8fCBwcmVmZXJyZWREcztcbiAgICBpZiAoIWJlc3REcykgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBsYXllciA9IHRoaXMuZ2V0TGF5ZXJGcm9tRHMoYmVzdERzKTtcbiAgICBpZiAoIWxheWVyKSByZXR1cm4gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzYWZlTG9hZE1hcExheWVyKGxheWVyKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGxheWVyIG1heSBhbHJlYWR5IGJlIGxvYWRlZCAqL1xuICAgIH1cbiAgICBkaXNhYmxlTGF5ZXJQYmYobGF5ZXIpO1xuXG4gICAgY29uc3QgZmllbGRzOiBzdHJpbmdbXSA9IChsYXllci5maWVsZHMgfHwgW10pLm1hcCgoZjogYW55KSA9PiBmLm5hbWUpO1xuICAgIGNvbnN0IHJlZ2lvbk1hdGNoID0gYmVzdEl0ZW0/LnJlZ2lvbk1hdGNoID8/IGZhbHNlO1xuICAgIGNvbnN0IHJlZ2lvblNjb3BlZCA9IHJlZ2lvbk1hdGNoIHx8IChiZXN0SXRlbT8uc2NvcmUgPz8gMCkgPj0gMjU7XG4gICAgY29uc3QgaGF5c3RhY2sgPSB0aGlzLmdldERzSGF5c3RhY2soYmVzdERzKTtcbiAgICBjb25zdCB5ZWFyU2NvcGVkID0gaGF5c3RhY2tNYXRjaGVzWWVhcihoYXlzdGFjaywgbm9ybWFsaXplZEZpbHRlcnMueWlsKTtcblxuICAgIGZsTG9nKFwicmVzb2x2ZSB2aWEgRGF0YVNvdXJjZVwiLCB7XG4gICAgICBmaWx0ZXJzOiBub3JtYWxpemVkRmlsdGVycyxcbiAgICAgIGRzSWQ6IGJlc3REcy5pZCxcbiAgICAgIGxheWVyVGl0bGU6IGxheWVyPy50aXRsZSB8fCBsYXllcj8udXJsIHx8IG51bGwsXG4gICAgICBzY29yZTogYmVzdEl0ZW0/LnNjb3JlID8/IGJlc3RTY29yZSxcbiAgICAgIHJlZ2lvblNjb3BlZCxcbiAgICAgIHllYXJTY29wZWQsXG4gICAgICBmaWVsZENvdW50OiBmaWVsZHMubGVuZ3RoLFxuICAgICAgY291bnRCYXNlZDogd2FudHNSZWdpb24gJiYgcG9vbC5sZW5ndGggPiAxLFxuICAgIH0pOzIyXG4gICAgdm9pZCBwcmVwYXJlVmFsdWVJbmRleChsYXllciwgZmllbGRzKTtcbiAgICByZXR1cm4ge1xuICAgICAgbGF5ZXIsXG4gICAgICBmaWVsZHMsXG4gICAgICByZWdpb25TY29wZWQsXG4gICAgICB5ZWFyU2NvcGVkLFxuICAgIH07XG4gIH1cblxuICBhc3luYyByZXNvbHZlKFxuICAgIGZpbHRlcnM6IFBpY2s8RXZhcG9GaWx0ZXJzLCBcInlpbFwiIHwgXCJ2aWxveWF0XCI+LFxuICAgIGppbXVNYXBWaWV3OiBhbnkgfCBudWxsLFxuICApOiBQcm9taXNlPFJlc29sdmVkRmVhdHVyZUxheWVyIHwgbnVsbD4ge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgeWlsOiBmaWx0ZXJzLnlpbCB8fCBcIlwiLFxuICAgICAgdmlsb3lhdDogY2Fub25pY2FsaXplUmVnaW9uRmlsdGVyVmFsdWUoU3RyaW5nKGZpbHRlcnMudmlsb3lhdCA/PyBcIlwiKS50cmltKCkpLFxuICAgICAgaWRzOiB0aGlzLnNlbGVjdGVkSWRzLFxuICAgIH0pO1xuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnJlc29sdmVDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChwZW5kaW5nKSByZXR1cm4gcGVuZGluZztcblxuICAgIGNvbnN0IGpvYiA9IHRoaXMucmVzb2x2ZUludGVybmFsKGZpbHRlcnMsIGppbXVNYXBWaWV3KTtcbiAgICB0aGlzLnJlc29sdmVDYWNoZS5zZXQoY2FjaGVLZXksIGpvYik7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBqb2I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aGlzLnJlc29sdmVDYWNoZS5nZXQoY2FjaGVLZXkpID09PSBqb2IpIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlQ2FjaGUuZGVsZXRlKGNhY2hlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlc29sdmVJbnRlcm5hbChcbiAgICBmaWx0ZXJzOiBQaWNrPEV2YXBvRmlsdGVycywgXCJ5aWxcIiB8IFwidmlsb3lhdFwiPixcbiAgICBqaW11TWFwVmlldzogYW55IHwgbnVsbCxcbiAgKTogUHJvbWlzZTxSZXNvbHZlZEZlYXR1cmVMYXllciB8IG51bGw+IHtcbiAgICBjb25zdCBmcm9tRHMgPSBhd2FpdCB0aGlzLnJlc29sdmVGcm9tRGF0YVNvdXJjZXMoZmlsdGVycyk7XG4gICAgaWYgKGZyb21EcykgcmV0dXJuIGZyb21EcztcbiAgICBpZiAoIWppbXVNYXBWaWV3KSB7XG4gICAgICBmbExvZyhcInJlc29sdmUgRkFJTEVEIChubyBEUyBsYXllciwgbm8gbWFwIHZpZXcpXCIsIHtcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgc2VsZWN0ZWRJZHM6IHRoaXMuc2VsZWN0ZWRJZHMsXG4gICAgICAgIGNvbm5lY3RlZElkczogdGhpcy5zZWxlY3RlZElkcy5maWx0ZXIoKGlkKSA9PiAhIXRoaXMuZHNCeUlkW2lkXSksXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBmcm9tTWFwID0gYXdhaXQgcmVzb2x2ZUZlYXR1cmVMYXllckZvckZpbHRlcnMoamltdU1hcFZpZXcsIGZpbHRlcnMpO1xuICAgIGZsTG9nKFwicmVzb2x2ZSB2aWEgTWFwXCIsIHtcbiAgICAgIGZpbHRlcnMsXG4gICAgICBsYXllclRpdGxlOiBmcm9tTWFwPy5sYXllcj8udGl0bGUgfHwgZnJvbU1hcD8ubGF5ZXI/LnVybCB8fCBudWxsLFxuICAgICAgcmVnaW9uU2NvcGVkOiBmcm9tTWFwPy5yZWdpb25TY29wZWQgPz8gbnVsbCxcbiAgICAgIHllYXJTY29wZWQ6IGZyb21NYXA/LnllYXJTY29wZWQgPz8gbnVsbCxcbiAgICAgIGZvdW5kOiAhIWZyb21NYXAsXG4gICAgfSk7XG4gICAgaWYgKGZyb21NYXA/LmxheWVyKSB7XG4gICAgICB2b2lkIHByZXBhcmVWYWx1ZUluZGV4KGZyb21NYXAubGF5ZXIsIGZyb21NYXAuZmllbGRzKTtcbiAgICB9XG4gICAgcmV0dXJuIGZyb21NYXA7XG4gIH1cbn1cbiIsImltcG9ydCB7IEV2YXBvRGF0YVNvdXJjZUVuZ2luZSB9IGZyb20gXCIuL2V2YXBvLWRhdGEtc291cmNlLWVuZ2luZVwiO1xuXG5jb25zdCBEQVNIQk9BUkRfQ0hJTERfU1VGRklYRVMgPSBbXG4gIFwiLWxvY2FsaXphdGlvblwiLFxuICBcIi1pbmRpY2F0b3JcIixcbiAgXCItcmVnaW9uXCIsXG4gIFwiLXBpZVwiLFxuICBcIi1ncmFmZlwiLFxuICBcIi1iYXJcIixcbiAgXCItcG9wdXBcIixcbl0gYXMgY29uc3Q7XG5cbi8qKiBSb290IEV2YXBvRGFzaGJvYXJkVjYgd2lkZ2V0IGlkIGZyb20gYW55IGVtYmVkZGVkIGNoaWxkIGlkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV2YXBvRGFzaGJvYXJkUm9vdElkKHdpZGdldElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBpZCA9IFN0cmluZyh3aWRnZXRJZCB8fCBcIlwiKTtcbiAgZm9yIChjb25zdCBzdWZmaXggb2YgREFTSEJPQVJEX0NISUxEX1NVRkZJWEVTKSB7XG4gICAgaWYgKGlkLmVuZHNXaXRoKHN1ZmZpeCkpIHJldHVybiBpZC5zbGljZSgwLCAtc3VmZml4Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGlkO1xufVxuXG5jb25zdCBzaGFyZWRFbmdpbmVzID0gbmV3IE1hcDxzdHJpbmcsIEV2YXBvRGF0YVNvdXJjZUVuZ2luZT4oKTtcblxuLyoqIE9uZSBEYXRhU291cmNlIGVuZ2luZSBwZXIgZGFzaGJvYXJkIGluc3RhbmNlIOKAlCBzaGFyZWQgYnkgYWxsIGVtYmVkZGVkIGNoaWxkcmVuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNoYXJlZEV2YXBvRGF0YVNvdXJjZUVuZ2luZShcbiAgd2lkZ2V0SWQ6IHN0cmluZyxcbik6IEV2YXBvRGF0YVNvdXJjZUVuZ2luZSB7XG4gIGNvbnN0IHJvb3RJZCA9IGdldEV2YXBvRGFzaGJvYXJkUm9vdElkKHdpZGdldElkKTtcbiAgbGV0IGVuZ2luZSA9IHNoYXJlZEVuZ2luZXMuZ2V0KHJvb3RJZCk7XG4gIGlmICghZW5naW5lKSB7XG4gICAgZW5naW5lID0gbmV3IEV2YXBvRGF0YVNvdXJjZUVuZ2luZSgpO1xuICAgIHNoYXJlZEVuZ2luZXMuc2V0KHJvb3RJZCwgZW5naW5lKTtcbiAgfVxuICByZXR1cm4gZW5naW5lO1xufVxuIiwiaW1wb3J0IHsgQXBwTW9kZSwgZ2V0QXBwU3RvcmUgfSBmcm9tIFwiamltdS1jb3JlXCI7XG5pbXBvcnQgeyB0b1BsYWluQXJyYXkgfSBmcm9tIFwiLi9ldmFwby1kYXRhLXNvdXJjZS1lbmdpbmVcIjtcblxuZXhwb3J0IHR5cGUgTGlua2VkTWFwTGF5b3V0U2NvcGUgPSBcImRhc2hib2FyZFwiIHwgXCJwbG1cIjtcblxuY29uc3QgTUFOQUdFRF9NQVBfQ0xBU1M6IFJlY29yZDxMaW5rZWRNYXBMYXlvdXRTY29wZSwgc3RyaW5nPiA9IHtcbiAgZGFzaGJvYXJkOiBcImFncmktZGFzaGJvYXJkLW1hbmFnZWQtbWFwXCIsXG4gIHBsbTogXCJwbG0tbWFuYWdlZC1tYXBcIixcbn07XG5cbmNvbnN0IE1BTkFHRURfUkVOREVSRVJfQ0xBU1M6IFJlY29yZDxMaW5rZWRNYXBMYXlvdXRTY29wZSwgc3RyaW5nPiA9IHtcbiAgZGFzaGJvYXJkOiBcImFncmktZGFzaGJvYXJkLW1hbmFnZWQtbWFwLXJlbmRlcmVyXCIsXG4gIHBsbTogXCJwbG0tbWFuYWdlZC1tYXAtcmVuZGVyZXJcIixcbn07XG5cbmNvbnN0IE1BUF9QQU5FTF9CT1JERVJfUkFESVVTID0gXCIyMHB4XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXZhcG9MaW5rZWRNYXBMYXlvdXRPcHRpb25zIHtcbiAgc2NvcGU6IExpbmtlZE1hcExheW91dFNjb3BlO1xuICBob3N0V2lkZ2V0SWQ6IHN0cmluZztcbiAgZ2V0U2xvdEVsZW1lbnQ6ICgpID0+IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgZ2V0VXNlTWFwV2lkZ2V0SWRzOiAoKSA9PiB1bmtub3duO1xuICBvbk1hcFdpZGdldExpbmtlZD86IChtYXBXaWRnZXRJZDogc3RyaW5nKSA9PiB2b2lkO1xuICAvKiogRmlyZWQgd2hlbiBhIG1hcCB3aWRnZXQgaWQgYmVjb21lcyBhdmFpbGFibGUgKGNvbmZpZyBsaW5rIG9yIGFwcCBkaXNjb3ZlcnkpLiAqL1xuICBvbk1hcFJlc29sdmVkPzogKG1hcFdpZGdldElkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIHJlc2l6ZU1hcFZpZXc/OiAoKSA9PiB2b2lkO1xufVxuXG5mdW5jdGlvbiBpc01hcFdpZGdldENvbmZpZyh3aWRnZXQ6IGFueSk6IGJvb2xlYW4ge1xuICBjb25zdCBtYW5pZmVzdE5hbWUgPSBTdHJpbmcod2lkZ2V0Py5tYW5pZmVzdD8ubmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCB1cmkgPSBTdHJpbmcod2lkZ2V0Py51cmkgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIG1hbmlmZXN0TmFtZSA9PT0gXCJtYXBcIiB8fCB1cmkuaW5jbHVkZXMoXCJhcmNnaXMtbWFwXCIpO1xufVxuXG5mdW5jdGlvbiBmaW5kV2lkZ2V0UmVuZGVyZXIod2lkZ2V0SWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICBgLndpZGdldC1yZW5kZXJlcltkYXRhLXdpZGdldGlkPVwiJHt3aWRnZXRJZH1cIl1gLFxuICAgIGBbZGF0YS13aWRnZXRpZD1cIiR7d2lkZ2V0SWR9XCJdLndpZGdldC1yZW5kZXJlcmAsXG4gICAgYFtkYXRhLXdpZGdldGlkPVwiJHt3aWRnZXRJZH1cIl1gLFxuICBdO1xuICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChlbCkgcmV0dXJuIGVsO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBmaW5kV2lkZ2V0TGF5b3V0SXRlbSh3aWRnZXRJZDogc3RyaW5nKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgY29uc3QgcmVuZGVyZXIgPSBmaW5kV2lkZ2V0UmVuZGVyZXIod2lkZ2V0SWQpO1xuICBpZiAoIXJlbmRlcmVyKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgIHJlbmRlcmVyLmNsb3Nlc3QoXCIubGF5b3V0LWl0ZW0uaXMtd2lkZ2V0XCIpLFxuICAgIHJlbmRlcmVyLmNsb3Nlc3QoXCIuYnVpbGRlci1sYXlvdXQtaXRlbVwiKSxcbiAgICByZW5kZXJlci5jbG9zZXN0KFwiLmxheW91dC1pdGVtXCIpLFxuICAgIHJlbmRlcmVyLmNsb3Nlc3QoXCIuc2VjdGlvbi1sYXlvdXQtaXRlbVwiKSxcbiAgICByZW5kZXJlci5jbG9zZXN0KCdbY2xhc3MqPVwibGF5b3V0LWl0ZW1cIl0nKSxcbiAgICByZW5kZXJlci5wYXJlbnRFbGVtZW50LFxuICBdO1xuXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgY2FuZGlkYXRlLmNvbnRhaW5zKHJlbmRlcmVyKSkge1xuICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVuZGVyZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0tub3duTWFwV2lkZ2V0SWQod2lkZ2V0SWQ/OiBzdHJpbmcgfCBudWxsKTogYm9vbGVhbiB7XG4gIGNvbnN0IGlkID0gU3RyaW5nKHdpZGdldElkIHx8IFwiXCIpLnRyaW0oKTtcbiAgaWYgKCFpZCkgcmV0dXJuIGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgY29uc3Qgd2lkZ2V0cyA9IChnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkgYXMgYW55KT8uYXBwQ29uZmlnPy53aWRnZXRzIHx8IHt9O1xuICAgIGNvbnN0IHdpZGdldCA9IHdpZGdldHNbaWRdO1xuICAgIGlmICh3aWRnZXQgJiYgaXNNYXBXaWRnZXRDb25maWcod2lkZ2V0KSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2gge1xuICAgIC8qIGFwcCBjb25maWcgbWF5IHN0aWxsIGJlIHdhcm1pbmcgdXAgKi9cbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZmluZFdpZGdldFJlbmRlcmVyKGlkKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTWFwT3ZlcmxhcHBpbmdTbG90KG1hcFdpZGdldElkOiBzdHJpbmcsIHNsb3Q6IERPTVJlY3QpOiBib29sZWFuIHtcbiAgY29uc3QgaXRlbSA9IGZpbmRXaWRnZXRMYXlvdXRJdGVtKG1hcFdpZGdldElkKTtcbiAgaWYgKCFpdGVtKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHJlY3QgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBjeCA9IHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyO1xuICBjb25zdCBjeSA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuICBpZiAoY3ggPj0gc2xvdC5sZWZ0ICYmIGN4IDw9IHNsb3QucmlnaHQgJiYgY3kgPj0gc2xvdC50b3AgJiYgY3kgPD0gc2xvdC5ib3R0b20pIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCBvdmVybGFwWCA9IE1hdGgubWF4KFxuICAgIDAsXG4gICAgTWF0aC5taW4ocmVjdC5yaWdodCwgc2xvdC5yaWdodCkgLSBNYXRoLm1heChyZWN0LmxlZnQsIHNsb3QubGVmdCksXG4gICk7XG4gIGNvbnN0IG92ZXJsYXBZID0gTWF0aC5tYXgoXG4gICAgMCxcbiAgICBNYXRoLm1pbihyZWN0LmJvdHRvbSwgc2xvdC5ib3R0b20pIC0gTWF0aC5tYXgocmVjdC50b3AsIHNsb3QudG9wKSxcbiAgKTtcbiAgY29uc3Qgb3ZlcmxhcEFyZWEgPSBvdmVybGFwWCAqIG92ZXJsYXBZO1xuICBjb25zdCBtYXBBcmVhID0gTWF0aC5tYXgoMSwgcmVjdC53aWR0aCAqIHJlY3QuaGVpZ2h0KTtcbiAgcmV0dXJuIG92ZXJsYXBBcmVhIC8gbWFwQXJlYSA+IDAuMztcbn1cblxuLyoqIEZpbmQgdGhlIHN0YW5kYXJkIE1hcCB3aWRnZXQgaWQgZnJvbSBhcHAgY29uZmlnIChwdWJsaXNoZWQgZXhwZXJpZW5jZSBzYWZlKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNjb3Zlck1hcFdpZGdldElkSW5BcHAob3B0aW9uczoge1xuICBob3N0V2lkZ2V0SWQ6IHN0cmluZztcbiAgZ2V0U2xvdEVsZW1lbnQ/OiAoKSA9PiBIVE1MRWxlbWVudCB8IG51bGw7XG59KTogc3RyaW5nIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdGUgPSBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkgYXMgYW55O1xuICAgIGNvbnN0IHdpZGdldHMgPSBzdGF0ZT8uYXBwQ29uZmlnPy53aWRnZXRzIHx8IHt9O1xuICAgIGNvbnN0IG93bklkID0gb3B0aW9ucy5ob3N0V2lkZ2V0SWQ7XG4gICAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgICBPYmplY3Qua2V5cyh3aWRnZXRzKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgaWYgKGlkID09PSBvd25JZCB8fCBpZC5zdGFydHNXaXRoKGAke293bklkfS1gKSkgcmV0dXJuO1xuICAgICAgaWYgKGlzTWFwV2lkZ2V0Q29uZmlnKHdpZGdldHNbaWRdKSkgY2FuZGlkYXRlcy5wdXNoKGlkKTtcbiAgICB9KTtcbiAgICBpZiAoIWNhbmRpZGF0ZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPT09IDEpIHJldHVybiBjYW5kaWRhdGVzWzBdO1xuXG4gICAgY29uc3Qgc2xvdCA9IG9wdGlvbnMuZ2V0U2xvdEVsZW1lbnQ/LigpPy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoIXNsb3QpIHJldHVybiBjYW5kaWRhdGVzWzBdO1xuXG4gICAgY29uc3QgaW5zaWRlU2xvdCA9IGNhbmRpZGF0ZXMuZmlsdGVyKChpZCkgPT5cbiAgICAgIGlzTWFwT3ZlcmxhcHBpbmdTbG90KGlkLCBzbG90KSxcbiAgICApO1xuICAgIGlmIChpbnNpZGVTbG90Lmxlbmd0aCA9PT0gMSkgcmV0dXJuIGluc2lkZVNsb3RbMF07XG4gICAgY29uc3QgcG9vbCA9IGluc2lkZVNsb3QubGVuZ3RoID8gaW5zaWRlU2xvdCA6IGNhbmRpZGF0ZXM7XG5cbiAgICBsZXQgYmVzdElkID0gcG9vbFswXTtcbiAgICBsZXQgYmVzdERpc3RhbmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHBvb2wuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBmaW5kV2lkZ2V0TGF5b3V0SXRlbShpZCk7XG4gICAgICBpZiAoIWl0ZW0pIHJldHVybjtcbiAgICAgIGNvbnN0IHJlY3QgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgZHggPSByZWN0LmxlZnQgKyByZWN0LndpZHRoIC8gMiAtIChzbG90LmxlZnQgKyBzbG90LndpZHRoIC8gMik7XG4gICAgICBjb25zdCBkeSA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyIC0gKHNsb3QudG9wICsgc2xvdC5oZWlnaHQgLyAyKTtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5oeXBvdChkeCwgZHkpO1xuICAgICAgaWYgKGRpc3RhbmNlIDwgYmVzdERpc3RhbmNlKSB7XG4gICAgICAgIGJlc3REaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICBiZXN0SWQgPSBpZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYmVzdElkO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXZhcG9MaW5rZWRNYXBMYXlvdXRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBtYXBMYXlvdXRJdGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1hcFdpZGdldFJlbmRlcmVyOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGF1dG9MaW5rQXR0ZW1wdGVkID0gZmFsc2U7XG4gIHByaXZhdGUgbGF5b3V0UmFmID0gMDtcbiAgcHJpdmF0ZSBsYXN0Tm90aWZpZWRNYXBJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBFdmFwb0xpbmtlZE1hcExheW91dE9wdGlvbnMpIHt9XG5cbiAgc2NoZWR1bGVMYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubGF5b3V0UmFmKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmxheW91dFJhZik7XG4gICAgdGhpcy5sYXlvdXRSYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy5sYXlvdXRSYWYgPSAwO1xuICAgICAgdGhpcy5zeW5jKCk7XG4gICAgfSk7XG4gIH1cblxuICBsYXlvdXROb3coKTogdm9pZCB7XG4gICAgdGhpcy5zeW5jKCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmxheW91dFJhZikgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5sYXlvdXRSYWYpO1xuICAgIHRoaXMubGF5b3V0UmFmID0gMDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cblxuICBnZXRSZXNvbHZlZE1hcFdpZGdldElkKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGxpbmtlZCA9IHRoaXMuZ2V0TGlua2VkTWFwV2lkZ2V0SWQoKTtcbiAgICBpZiAobGlua2VkICYmIGlzS25vd25NYXBXaWRnZXRJZChsaW5rZWQpKSByZXR1cm4gbGlua2VkO1xuICAgIHJldHVybiB0aGlzLmRpc2NvdmVyTWFwV2lkZ2V0SWRGcm9tQXBwKCk7XG4gIH1cblxuICBwcml2YXRlIGdldExpbmtlZE1hcFdpZGdldElkKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGlkcyA9IHRvUGxhaW5BcnJheTxzdHJpbmc+KHRoaXMub3B0aW9ucy5nZXRVc2VNYXBXaWRnZXRJZHMoKSk7XG4gICAgcmV0dXJuIGlkc1swXSA/IFN0cmluZyhpZHNbMF0pIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZmluZFNoYXJlZExheW91dFN1cmZhY2Uoc2xvdDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgIGNvbnN0IGhvc3RJdGVtID0gc2xvdC5jbG9zZXN0KFxuICAgICAgXCIubGF5b3V0LWl0ZW0sIC5idWlsZGVyLWxheW91dC1pdGVtXCIsXG4gICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgcmV0dXJuIGhvc3RJdGVtPy5wYXJlbnRFbGVtZW50IHx8IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGRpc2NvdmVyTWFwV2lkZ2V0SWRGcm9tQXBwKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiBkaXNjb3Zlck1hcFdpZGdldElkSW5BcHAoe1xuICAgICAgaG9zdFdpZGdldElkOiB0aGlzLm9wdGlvbnMuaG9zdFdpZGdldElkLFxuICAgICAgZ2V0U2xvdEVsZW1lbnQ6IHRoaXMub3B0aW9ucy5nZXRTbG90RWxlbWVudCxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgbm90aWZ5TWFwUmVzb2x2ZWQobWFwV2lkZ2V0SWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICBpZiAoIW1hcFdpZGdldElkIHx8IG1hcFdpZGdldElkID09PSB0aGlzLmxhc3ROb3RpZmllZE1hcElkKSByZXR1cm47XG4gICAgdGhpcy5sYXN0Tm90aWZpZWRNYXBJZCA9IG1hcFdpZGdldElkO1xuICAgIHRoaXMub3B0aW9ucy5vbk1hcFJlc29sdmVkPy4obWFwV2lkZ2V0SWQpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cnlBdXRvTGlua01hcFdpZGdldChtYXBXaWRnZXRJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGlua2VkID0gdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpO1xuICAgIGlmICghbWFwV2lkZ2V0SWQgfHwgKGxpbmtlZCAmJiBpc0tub3duTWFwV2lkZ2V0SWQobGlua2VkKSkgfHwgdGhpcy5hdXRvTGlua0F0dGVtcHRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzbG90ID0gdGhpcy5vcHRpb25zLmdldFNsb3RFbGVtZW50KCk/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChzbG90ICYmICFpc01hcE92ZXJsYXBwaW5nU2xvdChtYXBXaWRnZXRJZCwgc2xvdCkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb2RlID0gZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpLmFwcFJ1bnRpbWVJbmZvPy5hcHBNb2RlO1xuICAgICAgaWYgKG1vZGUgIT09IEFwcE1vZGUuRGVzaWduKSByZXR1cm47XG4gICAgICAvLyBSdW50aW1lIGJ1bmRsZXMgbXVzdCBub3QgZGVwZW5kIG9uIHRoZSBidWlsZGVyLW9ubHkgcGFja2FnZS4gQXNrIHRoZVxuICAgICAgLy8gc2V0dGluZyBwYW5lbCB0byBmb2N1cyB0aGUgbWFwIHNlbGVjdG9yOyB0aGUgdXNlciBjYW4gY29uZmlybSBsaW5rYWdlXG4gICAgICAvLyB0aGVyZSB3aXRob3V0IG1ha2luZyBwdWJsaXNoZWQgYXBwcyBsb2FkIGBqaW11LWZvci1idWlsZGVyYC5cbiAgICAgIHRoaXMuYXV0b0xpbmtBdHRlbXB0ZWQgPSB0cnVlO1xuICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudChcImFncmktbWFpbjptYXAtc2V0dGluZ3MtcmVxdWVzdFwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHdpZGdldElkOiB0aGlzLm9wdGlvbnMuaG9zdFdpZGdldElkLCBtYXBXaWRnZXRJZCB9LFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBidWlsZGVyLW9ubHkgaGVscGVyICovXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhcHBseU1hcFNsb3RCb3VuZHMobGF5b3V0SXRlbTogSFRNTEVsZW1lbnQsIHNsb3RFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBzbG90UmVjdCA9IHNsb3RFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBzdXJmYWNlID0gdGhpcy5maW5kU2hhcmVkTGF5b3V0U3VyZmFjZShzbG90RWwpO1xuXG4gICAgbGV0IHRvcCA9IHNsb3RSZWN0LnRvcDtcbiAgICBsZXQgbGVmdCA9IHNsb3RSZWN0LmxlZnQ7XG4gICAgbGV0IHBvc2l0aW9uTW9kZTogXCJmaXhlZFwiIHwgXCJhYnNvbHV0ZVwiID0gXCJmaXhlZFwiO1xuXG4gICAgaWYgKHN1cmZhY2UpIHtcbiAgICAgIGNvbnN0IHN1cmZhY2VSZWN0ID0gc3VyZmFjZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHRvcCA9IHNsb3RSZWN0LnRvcCAtIHN1cmZhY2VSZWN0LnRvcCArIHN1cmZhY2Uuc2Nyb2xsVG9wO1xuICAgICAgbGVmdCA9IHNsb3RSZWN0LmxlZnQgLSBzdXJmYWNlUmVjdC5sZWZ0ICsgc3VyZmFjZS5zY3JvbGxMZWZ0O1xuICAgICAgcG9zaXRpb25Nb2RlID0gXCJhYnNvbHV0ZVwiO1xuXG4gICAgICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZShzdXJmYWNlKS5wb3NpdGlvbiA9PT0gXCJzdGF0aWNcIikge1xuICAgICAgICBzdXJmYWNlLnN0eWxlLnNldFByb3BlcnR5KFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlbnRyaWVzOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPiA9IFtcbiAgICAgIFtcInBvc2l0aW9uXCIsIHBvc2l0aW9uTW9kZV0sXG4gICAgICBbXCJ0b3BcIiwgYCR7dG9wfXB4YF0sXG4gICAgICBbXCJsZWZ0XCIsIGAke2xlZnR9cHhgXSxcbiAgICAgIFtcIndpZHRoXCIsIGAke3Nsb3RSZWN0LndpZHRofXB4YF0sXG4gICAgICBbXCJoZWlnaHRcIiwgYCR7c2xvdFJlY3QuaGVpZ2h0fXB4YF0sXG4gICAgICBbXCJyaWdodFwiLCBcImF1dG9cIl0sXG4gICAgICBbXCJib3R0b21cIiwgXCJhdXRvXCJdLFxuICAgICAgW1wibWFyZ2luXCIsIFwiMFwiXSxcbiAgICAgIFtcInBhZGRpbmdcIiwgXCIwXCJdLFxuICAgICAgW1widHJhbnNmb3JtXCIsIFwibm9uZVwiXSxcbiAgICAgIFtcImJvcmRlci1yYWRpdXNcIiwgTUFQX1BBTkVMX0JPUkRFUl9SQURJVVNdLFxuICAgICAgW1wib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIl0sXG4gICAgICBbXCJ6LWluZGV4XCIsIFwiMTJcIl0sXG4gICAgICBbXCJib3gtc2l6aW5nXCIsIFwiYm9yZGVyLWJveFwiXSxcbiAgICAgIFtcInBvaW50ZXItZXZlbnRzXCIsIFwiYXV0b1wiXSxcbiAgICBdO1xuXG4gICAgZW50cmllcy5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIGxheW91dEl0ZW0uc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgXCJpbXBvcnRhbnRcIik7XG4gICAgfSk7XG5cbiAgICBjb25zdCB3cmFwcGVyID0gbGF5b3V0SXRlbS5jbG9zZXN0KFwiLmJ1aWxkZXItbGF5b3V0LWl0ZW1cIikgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmICh3cmFwcGVyICYmIHdyYXBwZXIgIT09IGxheW91dEl0ZW0pIHtcbiAgICAgIFtcbiAgICAgICAgW1wicG9zaXRpb25cIiwgXCJzdGF0aWNcIl0sXG4gICAgICAgIFtcIndpZHRoXCIsIFwiMFwiXSxcbiAgICAgICAgW1wiaGVpZ2h0XCIsIFwiMFwiXSxcbiAgICAgICAgW1wibWFyZ2luXCIsIFwiMFwiXSxcbiAgICAgICAgW1wicGFkZGluZ1wiLCBcIjBcIl0sXG4gICAgICAgIFtcIm92ZXJmbG93XCIsIFwidmlzaWJsZVwiXSxcbiAgICAgICAgW1wicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCJdLFxuICAgICAgXS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgd3JhcHBlci5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBcImltcG9ydGFudFwiKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmlsbE1hcFJlbmRlcmVyKHJlbmRlcmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHJhZGl1cyA9IE1BUF9QQU5FTF9CT1JERVJfUkFESVVTO1xuICAgIFtcbiAgICAgIFtcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIl0sXG4gICAgICBbXCJ3aWR0aFwiLCBcIjEwMCVcIl0sXG4gICAgICBbXCJoZWlnaHRcIiwgXCIxMDAlXCJdLFxuICAgICAgW1widG9wXCIsIFwiMFwiXSxcbiAgICAgIFtcImxlZnRcIiwgXCIwXCJdLFxuICAgICAgW1wibWFyZ2luXCIsIFwiMFwiXSxcbiAgICAgIFtcInBhZGRpbmdcIiwgXCIwXCJdLFxuICAgICAgW1widHJhbnNmb3JtXCIsIFwibm9uZVwiXSxcbiAgICAgIFtcImJvcmRlci1yYWRpdXNcIiwgcmFkaXVzXSxcbiAgICAgIFtcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCJdLFxuICAgICAgW1wiYm94LXNpemluZ1wiLCBcImJvcmRlci1ib3hcIl0sXG4gICAgXS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIHJlbmRlcmVyLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICAgIH0pO1xuXG4gICAgcmVuZGVyZXJcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcbiAgICAgICAgXCIuZXNyaS12aWV3LCAuZXNyaS12aWV3LXJvb3QsIC5lc3JpLXZpZXctc3VyZmFjZSwgLndpZGdldC1tYXBcIixcbiAgICAgIClcbiAgICAgIC5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoXCJib3JkZXItcmFkaXVzXCIsIHJhZGl1cywgXCJpbXBvcnRhbnRcIik7XG4gICAgICAgIG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiLCBcImltcG9ydGFudFwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhck1hbmFnZWRFbGVtZW50KHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsKTogdm9pZCB7XG4gICAgaWYgKCF0YXJnZXQpIHJldHVybjtcbiAgICBbXG4gICAgICBcInBvc2l0aW9uXCIsXG4gICAgICBcInRvcFwiLFxuICAgICAgXCJsZWZ0XCIsXG4gICAgICBcInJpZ2h0XCIsXG4gICAgICBcImJvdHRvbVwiLFxuICAgICAgXCJ3aWR0aFwiLFxuICAgICAgXCJoZWlnaHRcIixcbiAgICAgIFwiei1pbmRleFwiLFxuICAgICAgXCJtYXJnaW5cIixcbiAgICAgIFwicGFkZGluZ1wiLFxuICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgIFwiYm9yZGVyLXJhZGl1c1wiLFxuICAgICAgXCJvdmVyZmxvd1wiLFxuICAgICAgXCJib3gtc2l6aW5nXCIsXG4gICAgICBcInBvaW50ZXItZXZlbnRzXCIsXG4gICAgXS5mb3JFYWNoKChrZXkpID0+IHRhcmdldC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpKTtcbiAgICBPYmplY3QudmFsdWVzKE1BTkFHRURfTUFQX0NMQVNTKS5mb3JFYWNoKChjbHMpID0+IHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKGNscykpO1xuICAgIE9iamVjdC52YWx1ZXMoTUFOQUdFRF9SRU5ERVJFUl9DTEFTUykuZm9yRWFjaCgoY2xzKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoY2xzKSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhcigpOiB2b2lkIHtcbiAgICBjb25zdCB3cmFwcGVyID0gdGhpcy5tYXBMYXlvdXRJdGVtPy5jbG9zZXN0KFxuICAgICAgXCIuYnVpbGRlci1sYXlvdXQtaXRlbVwiLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmICh3cmFwcGVyICYmIHdyYXBwZXIgIT09IHRoaXMubWFwTGF5b3V0SXRlbSkge1xuICAgICAgW1wicG9zaXRpb25cIiwgXCJ3aWR0aFwiLCBcImhlaWdodFwiLCBcIm1hcmdpblwiLCBcInBhZGRpbmdcIiwgXCJvdmVyZmxvd1wiLCBcInBvaW50ZXItZXZlbnRzXCJdLmZvckVhY2goXG4gICAgICAgIChrZXkpID0+IHdyYXBwZXIuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KSxcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuY2xlYXJNYW5hZ2VkRWxlbWVudCh0aGlzLm1hcExheW91dEl0ZW0pO1xuICAgIHRoaXMuY2xlYXJNYW5hZ2VkRWxlbWVudCh0aGlzLm1hcFdpZGdldFJlbmRlcmVyKTtcbiAgICB0aGlzLm1hcExheW91dEl0ZW0gPSBudWxsO1xuICAgIHRoaXMubWFwV2lkZ2V0UmVuZGVyZXIgPSBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBzeW5jKCk6IHZvaWQge1xuICAgIGNvbnN0IHNsb3QgPSB0aGlzLm9wdGlvbnMuZ2V0U2xvdEVsZW1lbnQoKTtcbiAgICBpZiAoIXNsb3QpIHtcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYXBXaWRnZXRJZCA9IHRoaXMuZ2V0UmVzb2x2ZWRNYXBXaWRnZXRJZCgpO1xuICAgIGlmICghbWFwV2lkZ2V0SWQpIHtcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm5vdGlmeU1hcFJlc29sdmVkKG1hcFdpZGdldElkKTtcblxuICAgIGlmICghdGhpcy5nZXRMaW5rZWRNYXBXaWRnZXRJZCgpKSB7XG4gICAgICB0aGlzLnRyeUF1dG9MaW5rTWFwV2lkZ2V0KG1hcFdpZGdldElkKTtcbiAgICB9XG5cbiAgICBjb25zdCBsYXlvdXRJdGVtID0gZmluZFdpZGdldExheW91dEl0ZW0obWFwV2lkZ2V0SWQpO1xuICAgIGNvbnN0IHJlbmRlcmVyID0gZmluZFdpZGdldFJlbmRlcmVyKG1hcFdpZGdldElkKTtcbiAgICBpZiAoIWxheW91dEl0ZW0gfHwgIXJlbmRlcmVyKSB7XG4gICAgICAvLyBQdWJsaXNoZWQgcG9ydGFsOiBtYXAgd2lkZ2V0IERPTSBvZnRlbiBtb3VudHMgYWZ0ZXIgdGhlIGRhc2hib2FyZCDigJQga2VlcFxuICAgICAgLy8gdGhlIGxhc3QgcG9zaXRpb25lZCBtYXAgaW5zdGVhZCBvZiBjbGVhcmluZyBzdHlsZXMgKHRoYXQgc3RyYW5kcyB0aGUgbWFwKS5cbiAgICAgIGlmICh0aGlzLm1hcExheW91dEl0ZW0gJiYgdGhpcy5tYXBXaWRnZXRSZW5kZXJlcikge1xuICAgICAgICB0aGlzLmFwcGx5TWFwU2xvdEJvdW5kcyh0aGlzLm1hcExheW91dEl0ZW0sIHNsb3QpO1xuICAgICAgICB0aGlzLmZpbGxNYXBSZW5kZXJlcih0aGlzLm1hcFdpZGdldFJlbmRlcmVyKTtcbiAgICAgICAgdGhpcy5vcHRpb25zLnJlc2l6ZU1hcFZpZXc/LigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubWFwTGF5b3V0SXRlbSA9IGxheW91dEl0ZW07XG4gICAgdGhpcy5tYXBXaWRnZXRSZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIGxheW91dEl0ZW0uY2xhc3NMaXN0LmFkZChNQU5BR0VEX01BUF9DTEFTU1t0aGlzLm9wdGlvbnMuc2NvcGVdKTtcbiAgICByZW5kZXJlci5jbGFzc0xpc3QuYWRkKE1BTkFHRURfUkVOREVSRVJfQ0xBU1NbdGhpcy5vcHRpb25zLnNjb3BlXSk7XG4gICAgdGhpcy5hcHBseU1hcFNsb3RCb3VuZHMobGF5b3V0SXRlbSwgc2xvdCk7XG4gICAgdGhpcy5maWxsTWFwUmVuZGVyZXIocmVuZGVyZXIpO1xuICAgIHRoaXMub3B0aW9ucy5yZXNpemVNYXBWaWV3Py4oKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBAbGljZW5zZSBsdWNpZGUtcmVhY3QgdjEuMjMuMCAtIElTQ1xuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIElTQyBsaWNlbnNlLlxuICogU2VlIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNyZWF0ZUx1Y2lkZUljb24gZnJvbSAnLi4vY3JlYXRlTHVjaWRlSWNvbi5tanMnO1xuXG5jb25zdCBfX2ljb25Ob2RlID0gW1xuICBbXCJwYXRoXCIsIHsgZDogXCJNOCAydjRcIiwga2V5OiBcIjFjbXB5bVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMTYgMnY0XCIsIGtleTogXCI0bTgxdmtcIiB9XSxcbiAgW1wicmVjdFwiLCB7IHdpZHRoOiBcIjE4XCIsIGhlaWdodDogXCIxOFwiLCB4OiBcIjNcIiwgeTogXCI0XCIsIHJ4OiBcIjJcIiwga2V5OiBcIjFob3BjeVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMyAxMGgxOFwiLCBrZXk6IFwiOHRvZW44XCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk04IDE0aC4wMVwiLCBrZXk6IFwiNjQyM2JoXCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xMiAxNGguMDFcIiwga2V5OiBcIjFldGlsaVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMTYgMTRoLjAxXCIsIGtleTogXCIxZ2JvZndcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTggMThoLjAxXCIsIGtleTogXCJscnAzNXRcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTEyIDE4aC4wMVwiLCBrZXk6IFwibWh5Z3Z1XCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xNiAxOGguMDFcIiwga2V5OiBcImt6c21pbVwiIH1dXG5dO1xuY29uc3QgQ2FsZW5kYXJEYXlzID0gY3JlYXRlTHVjaWRlSWNvbihcImNhbGVuZGFyLWRheXNcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIENhbGVuZGFyRGF5cyBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYWxlbmRhci1kYXlzLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTMgM3YxNmEyIDIgMCAwIDAgMiAyaDE2XCIsIGtleTogXCJjMjRpNDhcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTE4IDE3VjlcIiwga2V5OiBcIjJiejYwblwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMTMgMTdWNVwiLCBrZXk6IFwiMWZyZHQ4XCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIk04IDE3di0zXCIsIGtleTogXCIxN3NrYTBcIiB9XVxuXTtcbmNvbnN0IENoYXJ0Q29sdW1uID0gY3JlYXRlTHVjaWRlSWNvbihcImNoYXJ0LWNvbHVtblwiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgQ2hhcnRDb2x1bW4gYXMgZGVmYXVsdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2hhcnQtY29sdW1uLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTMgM3YxNmEyIDIgMCAwIDAgMiAyaDE2XCIsIGtleTogXCJjMjRpNDhcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwibTE5IDktNSA1LTQtNC0zIDNcIiwga2V5OiBcIjJvc2g5aVwiIH1dXG5dO1xuY29uc3QgQ2hhcnRMaW5lID0gY3JlYXRlTHVjaWRlSWNvbihcImNoYXJ0LWxpbmVcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIENoYXJ0TGluZSBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jaGFydC1saW5lLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtbXCJwYXRoXCIsIHsgZDogXCJtMTggMTUtNi02LTYgNlwiLCBrZXk6IFwiMTUzdWR6XCIgfV1dO1xuY29uc3QgQ2hldnJvblVwID0gY3JlYXRlTHVjaWRlSWNvbihcImNoZXZyb24tdXBcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIENoZXZyb25VcCBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jaGV2cm9uLXVwLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTEyIDE1VjNcIiwga2V5OiBcIm05ZzF4MVwiIH1dLFxuICBbXCJwYXRoXCIsIHsgZDogXCJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNFwiLCBrZXk6IFwiaWg3bjNoXCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIm03IDEwIDUgNSA1LTVcIiwga2V5OiBcImJyc243MFwiIH1dXG5dO1xuY29uc3QgRG93bmxvYWQgPSBjcmVhdGVMdWNpZGVJY29uKFwiZG93bmxvYWRcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIERvd25sb2FkIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvd25sb2FkLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwibTYgMTQgMS41LTIuOUEyIDIgMCAwIDEgOS4yNCAxMEgyMGEyIDIgMCAwIDEgMS45NCAyLjVsLTEuNTQgNmEyIDIgMCAwIDEtMS45NSAxLjVINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgzLjlhMiAyIDAgMCAxIDEuNjkuOWwuODEgMS4yYTIgMiAwIDAgMCAxLjY3LjlIMThhMiAyIDAgMCAxIDIgMnYyXCIsXG4gICAgICBrZXk6IFwidXNka2EwXCJcbiAgICB9XG4gIF1cbl07XG5jb25zdCBGb2xkZXJPcGVuID0gY3JlYXRlTHVjaWRlSWNvbihcImZvbGRlci1vcGVuXCIsIF9faWNvbk5vZGUpO1xuXG5leHBvcnQgeyBfX2ljb25Ob2RlLCBGb2xkZXJPcGVuIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvbGRlci1vcGVuLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicG9seWxpbmVcIiwgeyBwb2ludHM6IFwiMjIgMTIgMTYgMTIgMTQgMTUgMTAgMTUgOCAxMiAyIDEyXCIsIGtleTogXCJvOTd0OWRcIiB9XSxcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwiTTUuNDUgNS4xMSAyIDEydjZhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0ydi02bC0zLjQ1LTYuODlBMiAyIDAgMCAwIDE2Ljc2IDRINy4yNGEyIDIgMCAwIDAtMS43OSAxLjExelwiLFxuICAgICAga2V5OiBcIm9vdDZtclwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgSW5ib3ggPSBjcmVhdGVMdWNpZGVJY29uKFwiaW5ib3hcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIEluYm94IGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluYm94Lm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwiTTIwIDEwYzAgNC45OTMtNS41MzkgMTAuMTkzLTcuMzk5IDExLjc5OWExIDEgMCAwIDEtMS4yMDIgMEM5LjUzOSAyMC4xOTMgNCAxNC45OTMgNCAxMGE4IDggMCAwIDEgMTYgMFwiLFxuICAgICAga2V5OiBcIjFyMGYwelwiXG4gICAgfVxuICBdLFxuICBbXCJjaXJjbGVcIiwgeyBjeDogXCIxMlwiLCBjeTogXCIxMFwiLCByOiBcIjNcIiwga2V5OiBcImlscWhyN1wiIH1dXG5dO1xuY29uc3QgTWFwUGluID0gY3JlYXRlTHVjaWRlSWNvbihcIm1hcC1waW5cIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIE1hcFBpbiBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXAtcGluLm1qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgbHVjaWRlLXJlYWN0IHYxLjIzLjAgLSBJU0NcbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBJU0MgbGljZW5zZS5cbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVMdWNpZGVJY29uIGZyb20gJy4uL2NyZWF0ZUx1Y2lkZUljb24ubWpzJztcblxuY29uc3QgX19pY29uTm9kZSA9IFtcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTE0IDQuMSAxMiA2XCIsIGtleTogXCJpdGE4aTRcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwibTUuMSA4LTIuOS0uOFwiLCBrZXk6IFwiMWdvM2tmXCIgfV0sXG4gIFtcInBhdGhcIiwgeyBkOiBcIm02IDEyLTEuOSAyXCIsIGtleTogXCJtbmh0OTdcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTcuMiAyLjIgOCA1LjFcIiwga2V5OiBcIjFjZmtvMVwiIH1dLFxuICBbXG4gICAgXCJwYXRoXCIsXG4gICAge1xuICAgICAgZDogXCJNOS4wMzcgOS42OWEuNDk4LjQ5OCAwIDAgMSAuNjUzLS42NTNsMTEgNC41YS41LjUgMCAwIDEtLjA3NC45NDlsLTQuMzQ5IDEuMDQxYTEgMSAwIDAgMC0uNzQuNzM5bC0xLjA0IDQuMzVhLjUuNSAwIDAgMS0uOTUuMDc0elwiLFxuICAgICAga2V5OiBcInMwaDN5elwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgTW91c2VQb2ludGVyQ2xpY2sgPSBjcmVhdGVMdWNpZGVJY29uKFwibW91c2UtcG9pbnRlci1jbGlja1wiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgTW91c2VQb2ludGVyQ2xpY2sgYXMgZGVmYXVsdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bW91c2UtcG9pbnRlci1jbGljay5tanMubWFwXG4iLCIvKipcbiAqIEBsaWNlbnNlIGx1Y2lkZS1yZWFjdCB2MS4yMy4wIC0gSVNDXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgSVNDIGxpY2Vuc2UuXG4gKiBTZWUgdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTHVjaWRlSWNvbiBmcm9tICcuLi9jcmVhdGVMdWNpZGVJY29uLm1qcyc7XG5cbmNvbnN0IF9faWNvbk5vZGUgPSBbXG4gIFtcbiAgICBcInBhdGhcIixcbiAgICB7XG4gICAgICBkOiBcIm0xNiA2LTguNDE0IDguNTg2YTIgMiAwIDAgMCAyLjgyOSAyLjgyOWw4LjQxNC04LjU4NmE0IDQgMCAxIDAtNS42NTctNS42NTdsLTguMzc5IDguNTUxYTYgNiAwIDEgMCA4LjQ4NSA4LjQ4NWw4LjM3OS04LjU1MVwiLFxuICAgICAga2V5OiBcIjFtaWVjdVwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgUGFwZXJjbGlwID0gY3JlYXRlTHVjaWRlSWNvbihcInBhcGVyY2xpcFwiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgUGFwZXJjbGlwIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcGVyY2xpcC5tanMubWFwXG4iLCIvKipcbiAqIEBsaWNlbnNlIGx1Y2lkZS1yZWFjdCB2MS4yMy4wIC0gSVNDXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgSVNDIGxpY2Vuc2UuXG4gKiBTZWUgdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTHVjaWRlSWNvbiBmcm9tICcuLi9jcmVhdGVMdWNpZGVJY29uLm1qcyc7XG5cbmNvbnN0IF9faWNvbk5vZGUgPSBbXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xMiAxN3Y1XCIsIGtleTogXCJiYjFkdTlcIiB9XSxcbiAgW1xuICAgIFwicGF0aFwiLFxuICAgIHtcbiAgICAgIGQ6IFwiTTkgMTAuNzZhMiAyIDAgMCAxLTEuMTEgMS43OWwtMS43OC45QTIgMiAwIDAgMCA1IDE1LjI0VjE2YTEgMSAwIDAgMCAxIDFoMTJhMSAxIDAgMCAwIDEtMXYtLjc2YTIgMiAwIDAgMC0xLjExLTEuNzlsLTEuNzgtLjlBMiAyIDAgMCAxIDE1IDEwLjc2VjdhMSAxIDAgMCAxIDEtMSAyIDIgMCAwIDAgMC00SDhhMiAyIDAgMCAwIDAgNCAxIDEgMCAwIDEgMSAxelwiLFxuICAgICAga2V5OiBcIjFua3o4YlwiXG4gICAgfVxuICBdXG5dO1xuY29uc3QgUGluID0gY3JlYXRlTHVjaWRlSWNvbihcInBpblwiLCBfX2ljb25Ob2RlKTtcblxuZXhwb3J0IHsgX19pY29uTm9kZSwgUGluIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpbi5tanMubWFwXG4iLCIvKipcbiAqIEBsaWNlbnNlIGx1Y2lkZS1yZWFjdCB2MS4yMy4wIC0gSVNDXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgSVNDIGxpY2Vuc2UuXG4gKiBTZWUgdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTHVjaWRlSWNvbiBmcm9tICcuLi9jcmVhdGVMdWNpZGVJY29uLm1qcyc7XG5cbmNvbnN0IF9faWNvbk5vZGUgPSBbXG4gIFtcInBhdGhcIiwgeyBkOiBcIk0xNCAxN0g1XCIsIGtleTogXCJnZm4zbXhcIiB9XSxcbiAgW1wicGF0aFwiLCB7IGQ6IFwiTTE5IDdoLTlcIiwga2V5OiBcIjZpOXRnXCIgfV0sXG4gIFtcImNpcmNsZVwiLCB7IGN4OiBcIjE3XCIsIGN5OiBcIjE3XCIsIHI6IFwiM1wiLCBrZXk6IFwiMThiNDl5XCIgfV0sXG4gIFtcImNpcmNsZVwiLCB7IGN4OiBcIjdcIiwgY3k6IFwiN1wiLCByOiBcIjNcIiwga2V5OiBcImRmbXkweFwiIH1dXG5dO1xuY29uc3QgU2V0dGluZ3MyID0gY3JlYXRlTHVjaWRlSWNvbihcInNldHRpbmdzLTJcIiwgX19pY29uTm9kZSk7XG5cbmV4cG9ydCB7IF9faWNvbk5vZGUsIFNldHRpbmdzMiBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXR0aW5ncy0yLm1qcy5tYXBcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==