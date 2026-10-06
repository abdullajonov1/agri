"use strict";
(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agro_widgetV5_src_embedded_AgriPie10_runtime_widget_tsx"],{

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPie10/runtime/widget.tsx":
/*!***********************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriPie10/runtime/widget.tsx ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! echarts */ "./node_modules/echarts/index.js");
/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-arcgis */ "jimu-arcgis");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs");
/* harmony import */ var _shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared/AgriChartLoader */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/AgriChartLoader.tsx");
/* harmony import */ var _shared_agriNoDataLabel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../shared/agriNoDataLabel */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/agriNoDataLabel.ts");
/* harmony import */ var _data_agri_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../data/agri-bootstrap */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/data/agri-bootstrap.ts");
/* harmony import */ var _shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../shared/agri-table-data-source */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/agri-table-data-source.ts");
/* harmony import */ var _shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../shared/feature-layer-data */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/feature-layer-data.ts");
/* harmony import */ var _shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../shared/agri-chart-filter-order */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/shared/agri-chart-filter-order.ts");
/* harmony import */ var _data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../data/agri-filter-bus */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/data/agri-filter-bus.ts");
/* harmony import */ var _data_agri_stats_store__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../data/agri-stats-store */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/data/agri-stats-store.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};













const AGRI3_LANG_PREF_KEY_V3 = "agri3_lang_initialized_uz_lat_v3";
const ensureAgri3UzLatLanguageDefault = () => {
    try {
        if (localStorage.getItem(AGRI3_LANG_PREF_KEY_V3) === "1")
            return;
        localStorage.setItem("app_lang", "uz_lat");
        localStorage.setItem("evapo_app_lang", "uz_lat");
        localStorage.setItem("agro_lang", "uz_lat");
        localStorage.setItem(AGRI3_LANG_PREF_KEY_V3, "1");
    }
    catch (_a) {
        // ignore storage errors
    }
};
const console = {
    log: (..._args) => { },
    warn: (..._args) => { },
    error: (..._args) => { },
    info: (..._args) => { },
    debug: (..._args) => { },
};
/* ---------- Component ---------- */
class AgriPie extends jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.PureComponent {
    static adjustHexColor(hex, amount) {
        const normalized = hex.replace("#", "").trim();
        if (!normalized)
            return hex;
        const expand = normalized.length === 3
            ? normalized
                .split("")
                .map((ch) => ch + ch)
                .join("")
            : normalized;
        if (expand.length !== 6)
            return hex;
        const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
        const channels = [0, 2, 4].map((offset) => clamp(parseInt(expand.slice(offset, offset + 2), 16) + amount));
        return `#${channels
            .map((channel) => channel.toString(16).padStart(2, "0"))
            .join("")}`;
    }
    ;
    constructor(props) {
        super(props);
        this._isMounted = false;
        this._unbindMasterFilter = null;
        this.getSliceBorderColor = () => this.state.isDarkTheme ? "#1f2030" : "#ffffff";
        this.getSliceFillStyle = (baseColor) => {
            const color = (baseColor || "#3b82f6").toLowerCase();
            if (color === "#E8E1D1" || color === "#fff") {
                return {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [
                        { offset: 0, color: "#f8fafc" },
                        { offset: 0.55, color: "#dbe4ee" },
                        { offset: 1, color: "#94a3b8" },
                    ],
                };
            }
            return {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                    { offset: 0, color: AgriPie.adjustHexColor(baseColor, 34) },
                    { offset: 0.48, color: baseColor },
                    { offset: 1, color: AgriPie.adjustHexColor(baseColor, -30) },
                ],
            };
        };
        // Timing/connection
        this.MAX_CONNECTION_ATTEMPTS = 3;
        this.CONNECTION_TIMEOUT_MS = 15000;
        this.normalizeLanguage = (raw) => {
            const v = String(raw || "")
                .trim()
                .toLowerCase();
            if (v === "en" || v === "english")
                return "en";
            if (v === "ru" || v === "rus" || v === "russian")
                return "ru";
            if (v === "uz_cyr" ||
                v === "uz-cyr" ||
                v === "uz_cyrl" ||
                v === "uz-cyrl" ||
                v === "uz_cyrillic" ||
                v === "uz-cyrillic") {
                return "uz_cyr";
            }
            if (v === "uz_lat" ||
                v === "uz-lat" ||
                v === "uz_latin" ||
                v === "uz-latin" ||
                v === "uz") {
                return "uz_lat";
            }
            return "uz_lat";
        };
        this.resolveInitialLanguage = () => {
            try {
                ensureAgri3UzLatLanguageDefault();
                const fromUrl = typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search).get("lang")
                    : null;
                const fromStorage = typeof window !== "undefined"
                    ? localStorage.getItem("app_lang") ||
                        localStorage.getItem("evapo_app_lang") ||
                        localStorage.getItem("agro_lang")
                    : null;
                return this.normalizeLanguage(fromUrl || fromStorage);
            }
            catch (_a) {
                return "uz_lat";
            }
        };
        this._latestKey = "";
        this._didInitOnce = false;
        // Viloyat normalized key -> index into `state.featureLayers`
        this._viloyatKeyToLayerIndex = {};
        this._featureLayersInitPromise = null;
        // ✅ NEW: De-duplication for fetch
        this._fetchCounter = 0;
        this._lastFetchKey = "";
        this._fetchDebounceTimer = null;
        this._pieChartRef = jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createRef();
        this._pieChart = null;
        this._pieChartHostEl = null;
        /** After first paint, subsequent option updates morph like Agrobank. */
        this._pieHasRendered = false;
        /** Stable slice key order so region changes morph arcs in place. */
        this._pieStableKeys = [];
        this._pieStableRawKeys = {};
        /** True only after at least one category fetch finished (success or empty). */
        this._hasCompletedFetch = false;
        this.initializeTheme = () => {
            try {
                const savedTheme = localStorage.getItem("agri_v11_app_theme");
                const isDarkTheme = savedTheme !== null ? savedTheme === "dark" : true;
                this.setState({ isDarkTheme });
            }
            catch (_a) {
                this.setState({ isDarkTheme: true });
            }
        };
        this.handleThemeToggled = (event) => {
            const d = (event === null || event === void 0 ? void 0 : event.detail) || {};
            if (typeof d.isDarkTheme === "boolean") {
                this.setState({ isDarkTheme: d.isDarkTheme });
                return;
            }
            if (d.theme === "dark" || d.theme === "light") {
                this.setState({ isDarkTheme: d.theme === "dark" });
                return;
            }
            try {
                const savedTheme = localStorage.getItem("agri_v11_app_theme");
                const isDarkTheme = savedTheme !== null ? savedTheme === "dark" : true;
                this.setState({ isDarkTheme });
            }
            catch (_a) {
                this.setState({ isDarkTheme: true });
            }
        };
        this.handleLanguageChange = (event) => {
            var _a, _b;
            if (!this._isMounted)
                return;
            const d = (event === null || event === void 0 ? void 0 : event.detail) || {};
            const raw = (_b = (_a = d.lang) !== null && _a !== void 0 ? _a : d.language) !== null && _b !== void 0 ? _b : d.code;
            const next = this.normalizeLanguage(raw);
            if (next === this.state.language)
                return;
            this.setState({ language: next });
        };
        /* ---------- DS helpers ---------- */
        this.onDataSourceCreated = (ds) => {
            const queriableDs = ds;
            if (typeof queriableDs.setListenSelection === "function") {
                queriableDs.setListenSelection(false);
            }
            this.setState({ dataSource: queriableDs, error: null }, () => __awaiter(this, void 0, void 0, function* () {
                if (this.state.connectionStatus === "connected") {
                    yield this.fetchCategoryData();
                }
            }));
        };
        this.onDataSourceInfoChange = (info) => {
            if (!this._isMounted)
                return;
            if (this.state.connectionStatus !== "connected")
                return;
            if (!info)
                return;
            const sawRecords = Array.isArray(info.records);
            if (!sawRecords)
                return;
            this.fetchCategoryData();
        };
        this.isRepublicLayer = (layer) => {
            if (!layer)
                return false;
            const text = `${(layer === null || layer === void 0 ? void 0 : layer.title) || ""} ${(layer === null || layer === void 0 ? void 0 : layer.id) || ""} ${(layer === null || layer === void 0 ? void 0 : layer.url) || ""}`.toLowerCase();
            return /\brepublic\b|respublika/.test(text);
        };
        this.getDefaultFeatureLayer = (layersOverride) => {
            const layers = (layersOverride && layersOverride.length
                ? layersOverride
                : this.state.featureLayers) || [];
            if (!layers.length)
                return this.state.activeFeatureLayer;
            const republic = layers.find((l) => this.isRepublicLayer(l));
            if (republic)
                return republic;
            return layers[0] || this.state.activeFeatureLayer;
        };
        this.getFeatureLayerForViloyat = (viloyat) => {
            var _a;
            const layers = (_a = this.state.featureLayers) !== null && _a !== void 0 ? _a : [];
            if (!layers.length)
                return undefined;
            const key = this.makeViloyatKey(viloyat);
            if (!key)
                return undefined;
            const idx = this._viloyatKeyToLayerIndex[key];
            if (typeof idx === "number" && layers[idx])
                return layers[idx];
            return this.state.activeFeatureLayer || layers[0];
        };
        this.resolveFeatureLayersFromUseDataSources = () => __awaiter(this, void 0, void 0, function* () {
            // Agri_table_data is an external Table, not a builder-assigned Data
            // Source or a map layer — it is loaded directly by URL.
            try {
                const { layer } = yield (0,_shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_7__.getAgriTableDataLayer)();
                return [layer];
            }
            catch (e) {
                return [];
            }
        });
        // resolveFeatureLayersFromUseDataSources() always resolves exactly one
        // shared Agri_table_data layer, so every viloyat maps to index 0 anyway
        // (same as the layers[0] fallback in getFeatureLayerForViloyat) — no
        // distinct-viloyat scan is needed; use the already-shared/cached region
        // mapping only if multiple layers ever appear.
        this.buildViloyatKeyToLayerIndex = (layers) => __awaiter(this, void 0, void 0, function* () {
            this._viloyatKeyToLayerIndex = {};
            if (layers.length <= 1)
                return;
            try {
                const { regionDistrictRows } = yield (0,_data_agri_bootstrap__WEBPACK_IMPORTED_MODULE_6__.getAgriDashboardBootstrap)();
                for (const row of regionDistrictRows) {
                    const key = this.makeViloyatKey(row.viloyat);
                    if (key && this._viloyatKeyToLayerIndex[key] === undefined) {
                        this._viloyatKeyToLayerIndex[key] = 0;
                    }
                }
            }
            catch (e) { }
        });
        this.ensureFeatureLayersResolved = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // Already resolved: still need to re-route to the correct layer for current viloyat
            if (((_b = (_a = this.state.featureLayers) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
                const nextActive = this.state.viloyat
                    ? this.getFeatureLayerForViloyat(this.state.viloyat)
                    : this.getDefaultFeatureLayer(this.state.featureLayers);
                if (nextActive && ((_c = this.state.activeFeatureLayer) === null || _c === void 0 ? void 0 : _c.id) !== nextActive.id) {
                    this.setState({ activeFeatureLayer: nextActive });
                }
                return nextActive;
            }
            if (!this._featureLayersInitPromise) {
                this._featureLayersInitPromise = (() => __awaiter(this, void 0, void 0, function* () {
                    const layers = yield this.resolveFeatureLayersFromUseDataSources();
                    this.setState({ featureLayers: layers });
                    yield this.buildViloyatKeyToLayerIndex(layers);
                }))();
            }
            yield this._featureLayersInitPromise;
            const nextActive = this.state.viloyat
                ? this.getFeatureLayerForViloyat(this.state.viloyat)
                : this.getDefaultFeatureLayer(this.state.featureLayers);
            this.setState({ activeFeatureLayer: nextActive });
            return nextActive;
        });
        /* ---------- Map connection ---------- */
        this.waitForMapToLoad = (jimuMapView) => {
            return new Promise((resolve, reject) => {
                if (!jimuMapView || !jimuMapView.view) {
                    reject(new Error("Invalid map view provided"));
                    return;
                }
                if (jimuMapView.view.ready) {
                    resolve();
                    return;
                }
                const timeout = setTimeout(() => reject(new Error("Map load timeout")), this.CONNECTION_TIMEOUT_MS);
                const watchHandle = jimuMapView.view.watch("ready", (isReady) => {
                    if (isReady) {
                        clearTimeout(timeout);
                        watchHandle.remove();
                        resolve();
                    }
                });
            });
        };
        // Minimal connection: we just store the view and mark as connected
        this.connectToMap = (jimuMapView) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = jimuMapView === null || jimuMapView === void 0 ? void 0 : jimuMapView.view) === null || _a === void 0 ? void 0 : _a.map))
                throw new Error("Map view has no map property");
            return new Promise((resolve) => {
                this.setState({
                    activeMapView: jimuMapView,
                    connectionStatus: "connected",
                    error: null,
                    debugInfo: "Connected to map",
                }, resolve);
            });
        });
        this.initializeAfterConnection = () => {
            if (this._didInitOnce)
                return;
            this._didInitOnce = true;
            if (!this.state.activeMapView ||
                this.state.connectionStatus !== "connected")
                return;
            if (this.props.externalFilters) {
                const f = this.props.externalFilters;
                this.setState({
                    yil: f.yil || "",
                    viloyat: f.viloyat || "",
                    tuman: f.tuman || "",
                    turi: f.turi || "",
                    debugInfo: "External filters applied from props",
                }, () => this.fetchCategoryData());
            }
            else {
                this.fetchCategoryData();
            }
        };
        this.onActiveViewChange = (jimuMapView) => __awaiter(this, void 0, void 0, function* () {
            if (!jimuMapView) {
                // Treat as fallback: still allow data load (no map interaction needed)
                if (this.state.mapConnectionAttempts === 0) {
                    this.setState({
                        mapLoadingStatus: "failed",
                        mapConnectionAttempts: 1,
                        debugInfo: "No map view provided",
                    });
                }
                this.setState({ connectionStatus: "connected", debugInfo: "Proceeding without map" }, () => {
                    this.fetchCategoryData();
                });
                return;
            }
            this.setState({ mapLoadingStatus: "loading", error: null });
            try {
                const loadingTimeout = setTimeout(() => {
                    if (this._isMounted && this.state.mapLoadingStatus === "loading") {
                        this.setState({
                            connectionStatus: "connected",
                            mapLoadingStatus: "loaded",
                            debugInfo: "Timeout, proceeding",
                        }, () => {
                            this.fetchCategoryData();
                        });
                    }
                }, this.CONNECTION_TIMEOUT_MS);
                yield this.waitForMapToLoad(jimuMapView);
                clearTimeout(loadingTimeout);
                this.setState({
                    mapLoadingStatus: "loaded",
                    connectionStatus: "connecting",
                    debugInfo: "Map loaded, connecting",
                });
                yield this.connectToMap(jimuMapView);
                this.initializeAfterConnection();
            }
            catch (err) {
                this.setState({
                    error: `Map initialization issue: ${err.message}`,
                    mapLoadingStatus: err.message.includes("timeout")
                        ? "failed"
                        : this.state.mapLoadingStatus,
                    connectionStatus: "connected",
                    debugInfo: `Error: ${err.message}, continuing`,
                }, () => this.fetchCategoryData());
            }
        });
        /* ---------- Lifecycle ---------- */
        this.handleMasterFilterChange = (event) => {
            var _a, _b;
            const d = event.detail || {};
            if (!d.filters)
                return;
            const incoming = d.filters || {};
            const scopeLockedRaw = d.scope && Object.prototype.hasOwnProperty.call(d.scope, "lockedViloyat")
                ? d.scope.lockedViloyat
                : undefined;
            const nextLockedViloyat = scopeLockedRaw !== undefined
                ? scopeLockedRaw
                    ? this.normalizeName(String(scopeLockedRaw))
                    : ""
                : this.state.lockedViloyat;
            const hasField = (k) => Object.prototype.hasOwnProperty.call(incoming, k);
            // Keep current values when upstream event doesn't include that field.
            const nextYil = hasField("yil") ? incoming.yil || "" : this.state.yil;
            const nextViloyatRaw = hasField("viloyat")
                ? incoming.viloyat || ""
                : this.state.viloyat;
            const nextTumanRaw = hasField("tuman")
                ? incoming.tuman || ""
                : this.state.tuman;
            const incomingTurlar = hasField("turlar") && Array.isArray(incoming.turlar)
                ? incoming.turlar
                : hasField("turi")
                    ? incoming.turi
                        ? [incoming.turi]
                        : []
                    : this.state.turlar;
            const nextTurlar = Array.from(new Set(incomingTurlar
                .map((value) => this.normalizeName(String(value || "")))
                .filter(Boolean)));
            const nextTuri = nextTurlar.length === 1 ? nextTurlar[0] : "";
            const nextVh = hasField("vh")
                ? String(incoming.vh || "")
                : this.state.vh;
            const nextFilterPieByVh = hasField("filterPieByVh")
                ? Boolean(incoming.filterPieByVh)
                : this.state.filterPieByVh;
            const nextPieVhUniqueIdsSig = nextFilterPieByVh
                ? (0,_shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__.getPieVhFilterUniqueIdsSig)()
                : "";
            const nextBarField = hasField("barCategoryField")
                ? ((_a = incoming.barCategoryField) !== null && _a !== void 0 ? _a : null)
                : this.state.barCategoryField;
            let nextBarValue = hasField("barCategoryValue")
                ? ((_b = incoming.barCategoryValue) !== null && _b !== void 0 ? _b : null)
                : this.state.barCategoryValue;
            if (nextVh && !hasField("barCategoryValue"))
                nextBarValue = null;
            const nextLanguage = hasField("language")
                ? incoming.language || this.state.language || "ru"
                : this.state.language;
            const effectiveViloyat = this.normalizeName(nextViloyatRaw || "");
            const nextTuman = this.normalizeName(nextTumanRaw || "");
            const parentChanged = nextYil !== this.state.yil ||
                effectiveViloyat !== this.state.viloyat ||
                nextTuman !== this.state.tuman ||
                nextLockedViloyat !== this.state.lockedViloyat;
            const barSelectionChanged = nextBarField !== this.state.barCategoryField ||
                nextBarValue !== this.state.barCategoryValue ||
                nextVh !== this.state.vh ||
                nextFilterPieByVh !== this.state.filterPieByVh ||
                nextPieVhUniqueIdsSig !== this.state.pieVhUniqueIdsSig;
            const languageChanged = nextLanguage !== this.state.language;
            const cropSelectionChanged = JSON.stringify(nextTurlar) !== JSON.stringify(this.state.turlar);
            if (!parentChanged &&
                !barSelectionChanged &&
                !languageChanged &&
                !cropSelectionChanged) {
                return;
            }
            const nextSelectedCategories = parentChanged ? [] : nextTurlar;
            const nextActiveSlice = parentChanged
                ? null
                : this.state.categoryData.categories.findIndex((category) => nextSelectedCategories.some((selected) => this.normalizeName(category.key) === selected));
            this.setState({
                yil: String(nextYil || ""),
                viloyat: effectiveViloyat,
                lockedViloyat: nextLockedViloyat,
                tuman: nextTuman,
                turi: nextTuri,
                turlar: nextSelectedCategories,
                vh: nextVh,
                filterPieByVh: nextFilterPieByVh,
                pieVhUniqueIdsSig: nextPieVhUniqueIdsSig,
                barCategoryField: nextBarField,
                barCategoryValue: nextBarValue,
                selectedCategory: nextTuri || null,
                selectedCategories: nextSelectedCategories,
                activeSlice: nextActiveSlice !== null && nextActiveSlice >= 0 ? nextActiveSlice : null,
                language: nextLanguage,
                activeFeatureLayer: effectiveViloyat
                    ? this.getFeatureLayerForViloyat(effectiveViloyat)
                    : this.getDefaultFeatureLayer(this.state.featureLayers),
            }, () => {
                if (parentChanged || barSelectionChanged || languageChanged) {
                    this.fetchCategoryData();
                }
            });
        };
        this.updateFiltersFromProps = (filters) => {
            var _a, _b, _c, _d;
            const next = {
                yil: (_a = filters === null || filters === void 0 ? void 0 : filters.yil) !== null && _a !== void 0 ? _a : "",
                viloyat: (_b = filters === null || filters === void 0 ? void 0 : filters.viloyat) !== null && _b !== void 0 ? _b : "",
                tuman: (_c = filters === null || filters === void 0 ? void 0 : filters.tuman) !== null && _c !== void 0 ? _c : "",
                turi: (_d = filters === null || filters === void 0 ? void 0 : filters.turi) !== null && _d !== void 0 ? _d : "",
            };
            const changed = this.state.yil !== next.yil ||
                this.state.viloyat !== next.viloyat ||
                this.state.tuman !== next.tuman ||
                this.state.turi !== next.turi;
            if (!changed)
                return;
            this.setState(Object.assign(Object.assign({}, next), { isHandlingExternalEvent: true, error: null, activeFeatureLayer: next.viloyat
                    ? this.getFeatureLayerForViloyat(next.viloyat)
                    : this.state.activeFeatureLayer, debugInfo: `Filters from props: y=${next.yil}, v=${next.viloyat}, t=${next.tuman}, turi=${next.turi}` }), () => {
                this.fetchCategoryData();
                setTimeout(() => this._isMounted &&
                    this.setState({ isHandlingExternalEvent: false }), 300);
            });
        };
        this.handleYilChanged = (event) => {
            var _a, _b;
            if (!this._isMounted)
                return;
            const d = (event === null || event === void 0 ? void 0 : event.detail) || {};
            if (!d || d.source === "AgriPie")
                return;
            const raw = (_b = (_a = d.yil) !== null && _a !== void 0 ? _a : d.year) !== null && _b !== void 0 ? _b : d.constructionYear;
            if (raw == null)
                return;
            const yil = String(raw);
            if (yil === this.state.yil)
                return;
            this.setState({
                yil,
                error: null,
                debugInfo: `Yil changed to ${yil}`,
            }, () => this.fetchCategoryData());
        };
        /* ---------- External event handlers ---------- */
        this.handleExternalCategory = (event) => {
            if (!(event === null || event === void 0 ? void 0 : event.detail))
                return;
            const { source } = event.detail || {};
            if (source === "AgriPie")
                return;
            const nextTuri = this.normalizeName(event.detail.turi || event.detail.category || "");
            this.selectCategoryByName(nextTuri || null);
            this.setState({ turi: nextTuri, turlar: nextTuri ? [nextTuri] : [], selectedCategory: nextTuri || null, selectedCategories: nextTuri ? [nextTuri] : [] }, () => {
                this.fetchCategoryData();
            });
        };
        this.handleKadastrFilterChanged = (event) => {
            var _a;
            const d = (event === null || event === void 0 ? void 0 : event.detail) || {};
            if (d.source === "AgriPie")
                return;
            // ✅ Check what data is in the event
            const hasViloyat = d.viloyat || d.massivNom;
            const hasTuman = d.tuman || d.tumanNomi;
            const hasYear = d.yil != null || d.year != null;
            const hasTuri = d.turi || d.category;
            // Build next state - only update fields that are present in the event
            const nextState = {};
            if (hasViloyat || Object.prototype.hasOwnProperty.call(d, "viloyat")) {
                nextState.viloyat = this.normalizeName(String(d.viloyat || d.massivNom || ""));
            }
            if (hasTuman) {
                nextState.tuman = this.normalizeName(hasTuman);
            }
            if (hasYear) {
                nextState.yil = String((_a = d.yil) !== null && _a !== void 0 ? _a : d.year);
            }
            if (hasTuri) {
                nextState.turi = this.normalizeName(hasTuri);
            }
            // If nothing changed, skip
            if (Object.keys(nextState).length === 0) {
                return;
            }
            this.setState(nextState, () => this.fetchCategoryData());
        };
        this.handleConstructionYearChanged = (event) => {
            var _a;
            const d = (event === null || event === void 0 ? void 0 : event.detail) || {};
            if (!d || d.source === "AgriPie")
                return;
            // support BOTH shapes
            const raw = (_a = d.year) !== null && _a !== void 0 ? _a : d.yil;
            if (raw == null)
                return;
            const yil = String(raw);
            if (yil === this.state.yil)
                return;
            this.setState({
                yil,
                error: null,
                debugInfo: `Year changed to ${yil}`,
            }, () => this.fetchCategoryData());
        };
        this.handleRegionChange = (event) => {
            const d = (event === null || event === void 0 ? void 0 : event.detail) || {};
            if (!d || d.source === "AgriPie")
                return;
            const vil = this.normalizeName(d.viloyat || "");
            const tum = this.normalizeName(d.tuman || "");
            this.setState({
                viloyat: vil,
                tuman: tum,
                yil: this.state.yil,
                turi: "",
                turlar: [],
                selectedCategory: null,
                selectedCategories: [],
                activeSlice: null,
                error: null,
            }, () => {
                this.fetchCategoryData();
            });
        };
        /* ---------- Local UI helpers ---------- */
        this.selectCategoryByName = (name) => {
            if (!name) {
                this.setState({
                    turi: "",
                    turlar: [],
                    selectedCategory: null,
                    selectedCategories: [],
                    activeSlice: null,
                });
                return;
            }
            const idx = this.state.categoryData.categories.findIndex((c) => this.normalizeName(c.key) === this.normalizeName(name));
            this.setState({
                turi: name,
                turlar: [name],
                selectedCategory: name,
                selectedCategories: [name],
                activeSlice: idx >= 0 ? idx : null,
            });
        };
        this._lastIpadLayout = null;
        this.handleResize = () => {
            var _a;
            (_a = this._pieChart) === null || _a === void 0 ? void 0 : _a.resize();
            const isIpad = this.isIpadLayout();
            if (this._lastIpadLayout === isIpad)
                return;
            this._lastIpadLayout = isIpad;
            this.forceUpdate();
            window.requestAnimationFrame(() => {
                var _a;
                this.updatePieChart("selection");
                (_a = this._pieChart) === null || _a === void 0 ? void 0 : _a.resize();
            });
        };
        this.getChartDataForPie = () => {
            var _a;
            const { categoryData, language } = this.state;
            const sortedCategories = [...((_a = categoryData === null || categoryData === void 0 ? void 0 : categoryData.categories) !== null && _a !== void 0 ? _a : [])]
                .filter((category) => (Number(category.value) || 0) > 0)
                .sort((a, b) => b.value - a.value);
            // Only positive slices — zero placeholders from prior year/region leave
            // empty arcs when minAngle boosts them.
            this._pieStableKeys = sortedCategories
                .map((category) => this.normalizeName(category.key))
                .filter(Boolean);
            this._pieStableRawKeys = {};
            return sortedCategories.map((category) => {
                const norm = this.normalizeName(category.key);
                this._pieStableRawKeys[norm] = category.key;
                return {
                    name: this.getCategoryDisplayName(category.key, language),
                    rawKey: category.key,
                    value: category.value,
                    percentage: category.percentage,
                };
            });
        };
        this.ensurePieChart = () => {
            const host = this._pieChartRef.current;
            if (!host)
                return null;
            if (this._pieChart &&
                this._pieChartHostEl &&
                this._pieChartHostEl !== host) {
                this._pieChart.dispose();
                this._pieChart = null;
                this._pieChartHostEl = null;
                this._pieHasRendered = false;
                this._pieStableKeys = [];
                this._pieStableRawKeys = {};
            }
            if (!this._pieChart) {
                this._pieChart = echarts__WEBPACK_IMPORTED_MODULE_0__.init(host);
                this._pieChartHostEl = host;
                this._pieChart.on("click", (params) => {
                    if (typeof (params === null || params === void 0 ? void 0 : params.dataIndex) !== "number")
                        return;
                    this.handleSliceClick(params.data || {}, params.dataIndex);
                });
            }
            return this._pieChart;
        };
        this.formatCenterArea = (value) => {
            const { language } = this.state;
            const areaUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";
            const safe = Number.isFinite(value) ? value : 0;
            return `${safe.toLocaleString("ru-RU", {
                maximumFractionDigits: safe >= 100 ? 0 : 1,
            })}\u00A0${areaUnit}`;
        };
        this.formatCenterPercent = (value) => {
            if (!Number.isFinite(value))
                return "0%";
            const rounded = Math.round(value * 10) / 10;
            return Number.isInteger(rounded)
                ? `${rounded.toFixed(0)}%`
                : `${rounded.toFixed(1)}%`;
        };
        this.getCenterAllLabel = () => {
            const { language } = this.state;
            if (language === "en")
                return "All";
            if (language === "ru")
                return "Все";
            if (language === "uz_lat")
                return "Barchasi";
            return "Барчаси";
        };
        this.isIpadLayout = () => {
            // Hide legend / expand pie on iPad Pro (~1366) and every smaller viewport.
            if (typeof window === "undefined")
                return false;
            return window.innerWidth <= 1400;
        };
        this.getPieCenterContent = (chartData) => {
            const { selectedCategories, categoryData } = this.state;
            const totalValue = Number(categoryData === null || categoryData === void 0 ? void 0 : categoryData.totalValue) ||
                chartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
            if (selectedCategories.length > 0) {
                const selectedKeys = new Set(selectedCategories.map((selected) => this.normalizeName(selected)));
                const selectedItems = chartData.filter((item) => selectedKeys.has(this.normalizeName(item.rawKey || item.name || "")));
                if (selectedItems.length > 0) {
                    const area = selectedItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                    return {
                        showPercent: true,
                        percent: totalValue > 0 ? (area / totalValue) * 100 : 0,
                        area,
                        label: selectedItems.map((item) => item.name).join(", "),
                    };
                }
            }
            return {
                showPercent: true,
                percent: totalValue > 0 ? 100 : 0,
                area: totalValue,
                label: this.getCenterAllLabel(),
            };
        };
        this.updatePieChart = (reason = "data") => {
            const chart = this.ensurePieChart();
            if (!chart)
                return;
            const { selectedCategories, viloyat, lockedViloyat, } = this.state;
            const pieInteractive = !!(lockedViloyat || viloyat || "").trim();
            const chartData = this.getChartDataForPie();
            const normalizedSelections = selectedCategories.map((selected) => this.normalizeName(selected));
            const hasSelectedSlice = normalizedSelections.length > 0;
            const sliceBorder = this.getSliceBorderColor();
            const visibleSliceCount = chartData.filter((item) => (Number(item.value) || 0) > 0).length;
            const isDataUpdate = this._pieHasRendered && reason === "data";
            const isSelectionUpdate = reason === "selection" && this._pieHasRendered;
            const isSingleSlice = isDataUpdate || isSelectionUpdate ? false : visibleSliceCount === 1;
            const segmentBorderWidth = isSingleSlice ? 0 : visibleSliceCount > 8 ? 1 : 2;
            const segmentBorderRadius = isSingleSlice
                ? 0
                : visibleSliceCount > 10
                    ? 4
                    : visibleSliceCount > 6
                        ? 6
                        : 10;
            const isIpad = this.isIpadLayout();
            const option = Object.assign(Object.assign({ animation: !isSelectionUpdate }, (isSelectionUpdate
                ? {
                    animationDuration: 0,
                    animationDurationUpdate: 0,
                }
                : isDataUpdate
                    ? {
                        animationDurationUpdate: 280,
                        animationEasingUpdate: "cubicInOut",
                    }
                    : {
                        animationDuration: 500,
                        animationEasing: "cubicOut",
                    })), { color: AgriPie.FALLBACK_COLORS, tooltip: {
                    trigger: "item",
                    show: isIpad && pieInteractive,
                    triggerOn: "click",
                    confine: true,
                    appendToBody: true,
                    formatter: (params) => {
                        var _a;
                        const name = String((params === null || params === void 0 ? void 0 : params.name) || ((_a = params === null || params === void 0 ? void 0 : params.data) === null || _a === void 0 ? void 0 : _a.name) || "").trim();
                        return name || "";
                    },
                    backgroundColor: this.state.isDarkTheme ? "#1f2030" : "#ffffff",
                    borderColor: this.state.isDarkTheme
                        ? "rgba(126, 214, 255, 0.22)"
                        : "rgba(15, 23, 42, 0.12)",
                    borderWidth: 1,
                    padding: [8, 12],
                    textStyle: {
                        color: this.state.isDarkTheme ? "#e9f8ff" : "#0f172a",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "Geologica, ui-sans-serif, system-ui, sans-serif",
                    },
                    extraCssText: "border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,0.16);",
                }, legend: {
                    show: false,
                }, title: { show: false }, series: [
                    Object.assign(Object.assign({ id: "agri-pie-donut", name: "Access From", type: "pie", silent: !pieInteractive, selectedMode: false, selectedOffset: hasSelectedSlice ? 6 : 0, startAngle: 90, padAngle: 0, radius: ["56%", "88%"], center: ["50%", "50%"], avoidLabelOverlap: true, minAngle: 0, z: 2 }, (isSelectionUpdate
                        ? {
                            animationTypeUpdate: "transition",
                            animationDurationUpdate: 0,
                            animationDelayUpdate: 0,
                        }
                        : isDataUpdate
                            ? {
                                animationTypeUpdate: "transition",
                                animationDurationUpdate: 280,
                                animationEasingUpdate: "cubicInOut",
                                animationDelayUpdate: 0,
                            }
                            : {
                                animationType: "scale",
                                animationDuration: 500,
                                animationEasing: "cubicOut",
                                animationDelay: (index) => index * 40,
                            })), { cursor: pieInteractive ? "pointer" : "default", itemStyle: {
                            borderRadius: segmentBorderRadius,
                            borderColor: sliceBorder,
                            borderWidth: segmentBorderWidth,
                        }, label: {
                            show: false,
                        }, emphasis: {
                            scale: !hasSelectedSlice,
                            scaleSize: 2,
                            focus: "none",
                            itemStyle: {
                                borderColor: sliceBorder,
                                borderWidth: segmentBorderWidth,
                                shadowBlur: 0,
                                shadowOffsetY: 0,
                                shadowColor: "transparent",
                            },
                            label: {
                                show: false,
                            },
                        }, blur: {
                            itemStyle: {
                                opacity: 1,
                            },
                        }, labelLine: {
                            show: false,
                        }, data: chartData.map((item, index) => {
                            const baseColor = this.getCropColor(item.rawKey || item.name, index);
                            const itemKey = this.normalizeName(item.rawKey || item.name || "");
                            const isSelected = normalizedSelections.includes(itemKey);
                            const hasValue = (Number(item.value) || 0) > 0;
                            const isDimmed = hasSelectedSlice && !isSelected;
                            return {
                                id: `crop-${itemKey || index}`,
                                value: item.value,
                                name: item.name,
                                rawKey: item.rawKey,
                                percentage: item.percentage,
                                selected: isSelected && hasValue,
                                itemStyle: {
                                    color: baseColor,
                                    opacity: !hasValue ? 0 : isDimmed ? 0.28 : 1,
                                    borderColor: sliceBorder,
                                    borderWidth: hasValue ? segmentBorderWidth : 0,
                                    borderRadius: segmentBorderRadius,
                                },
                            };
                        }) }),
                ] });
            chart.setOption(option, isSelectionUpdate
                ? { notMerge: false, lazyUpdate: false }
                : isDataUpdate
                    ? { notMerge: false, replaceMerge: ["series"], lazyUpdate: false }
                    : { notMerge: true, lazyUpdate: false });
            if (chartData.some((item) => (Number(item.value) || 0) > 0)) {
                this._pieHasRendered = true;
            }
            if (!isDataUpdate && !isSelectionUpdate) {
                chart.resize();
            }
        };
        /* ---------- Interactions ---------- */
        this.handleSliceClick = (data, index) => {
            const canSlice = !!(this.state.lockedViloyat || this.state.viloyat || "").trim();
            if (!canSlice)
                return;
            const selectedCategoryName = String(data.rawKey || data.name || "").trim();
            if (!selectedCategoryName)
                return;
            const selectedKey = this.normalizeName(selectedCategoryName);
            const isSelected = this.state.selectedCategories.some((category) => this.normalizeName(category) === selectedKey);
            const nextSelections = isSelected
                ? this.state.selectedCategories.filter((category) => this.normalizeName(category) !== selectedKey)
                : [...this.state.selectedCategories, selectedCategoryName];
            const singleSelection = nextSelections.length === 1 ? nextSelections[0] : "";
            this.setState({
                activeSlice: isSelected ? null : index,
                selectedCategory: singleSelection || null,
                selectedCategories: nextSelections,
                turi: singleSelection,
                turlar: nextSelections,
            }, () => {
                document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
                    detail: {
                        turi: singleSelection,
                        turlar: nextSelections,
                        polygonMode: false,
                        source: "AgriPie",
                        timestamp: Date.now(),
                    },
                    bubbles: true,
                }));
                // iPad has no legend — keep the slice name visible via tooltip after click.
                if (this.isIpadLayout() && this._pieChart) {
                    window.requestAnimationFrame(() => {
                        var _a;
                        (_a = this._pieChart) === null || _a === void 0 ? void 0 : _a.dispatchAction({
                            type: "showTip",
                            seriesIndex: 0,
                            dataIndex: index,
                        });
                    });
                }
            });
        };
        this.applyCategoryFilter = () => __awaiter(this, void 0, void 0, function* () {
            const { selectedCategories, yil, viloyat, tuman } = this.state;
            document.dispatchEvent(new CustomEvent("categoryFilterChanged", {
                detail: {
                    yil,
                    viloyat,
                    tuman,
                    category: selectedCategories.length === 1 ? selectedCategories[0] : "",
                    turi: selectedCategories.length === 1 ? selectedCategories[0] : "",
                    turlar: selectedCategories,
                    source: "AgriPie",
                    timestamp: Date.now(),
                },
                bubbles: true,
            }));
        });
        // ✅ Debounced fetch with de-duplication
        this.fetchCategoryData = () => {
            // Clear any pending fetch
            if (this._fetchDebounceTimer) {
                clearTimeout(this._fetchDebounceTimer);
            }
            // Show loader immediately so UI never flashes "no data" during debounce.
            if (!this.state.loading) {
                this.setState({ loading: true, error: null });
            }
            // Short debounce so region changes feel immediate
            this._fetchDebounceTimer = setTimeout(() => {
                this._doFetchCategoryData();
            }, 16);
        };
        /* ---------- Chart ---------- */
        this.renderRadarPieChart = (_chartData, _containerWidth = 300, _containerHeight = 300) => {
            return (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { ref: this._pieChartRef, className: "land-category-echart" }));
        };
        const initialLanguage = this.resolveInitialLanguage();
        let initialIsDarkTheme = true;
        try {
            const savedTheme = localStorage.getItem("agri_v11_app_theme");
            initialIsDarkTheme =
                savedTheme !== null ? savedTheme === "dark" : true;
        }
        catch (_a) {
            initialIsDarkTheme = true;
        }
        this.state = {
            loading: false,
            error: null,
            categoryData: { categories: [], totalValue: 0 },
            yil: "",
            viloyat: "",
            lockedViloyat: "",
            tuman: "",
            turi: "",
            turlar: [],
            filterPieByVh: false,
            pieVhUniqueIdsSig: "",
            vh: "",
            barCategoryField: null,
            barCategoryValue: null,
            activeSlice: null,
            selectedCategory: null,
            selectedCategories: [],
            hoveredSlice: null,
            activeMapView: undefined,
            lastFilterEventTimestamp: 0,
            isHandlingExternalEvent: false,
            mapConnectionAttempts: 0,
            mapLoadingStatus: "idle",
            connectionStatus: "idle",
            dataSource: undefined,
            featureLayers: [],
            activeFeatureLayer: undefined,
            debugInfo: "Widget initializing",
            language: initialLanguage,
            isDarkTheme: initialIsDarkTheme,
        };
    }
    findFieldByPossibleNames(possibleNames) {
        const { dataSource } = this.state;
        if (!dataSource)
            return null;
        const schema = dataSource.getSchema();
        if (!schema || !schema.fields)
            return null;
        const fieldNames = Object.keys(schema.fields).map((f) => f.toLowerCase());
        for (const name of possibleNames) {
            const exact = fieldNames.findIndex((f) => f === name.toLowerCase());
            if (exact !== -1)
                return Object.keys(schema.fields)[exact];
        }
        for (const name of possibleNames) {
            const partial = fieldNames.findIndex((f) => f.includes(name.toLowerCase()));
            if (partial !== -1)
                return Object.keys(schema.fields)[partial];
        }
        return null;
    }
    findCategoryField(flOverride) {
        var _a;
        // Exact names only — partial "tur" used to match `tuman`.
        const possible = ["turi", "ekin_turi", "crop_type"];
        const fl = flOverride !== null && flOverride !== void 0 ? flOverride : this.state.activeFeatureLayer;
        const fields = (_a = fl === null || fl === void 0 ? void 0 : fl.fields) !== null && _a !== void 0 ? _a : [];
        if (fields.length) {
            const byLower = new Map(fields.map((f) => [String(f.name).toLowerCase(), f.name]));
            for (const p of possible) {
                const exact = byLower.get(p.toLowerCase());
                if (exact)
                    return exact;
            }
        }
        const fromDS = this.findFieldByPossibleNames(possible);
        if (fromDS)
            return fromDS;
        return "turi";
    }
    buildWhereClauseForDS(opts = {}) {
        var _a, _b;
        const includeCategory = opts.includeCategory !== false;
        const includeViloyat = opts.includeViloyat !== false;
        // Match Agro_widgetV1: scope by selected viloyat (not lockedViloyat)
        // when includeViloyat is on; layer routing handles region layers.
        const { yil, viloyat, tuman, turi, lockedViloyat } = this.state;
        const clauses = [];
        const scopeViloyat = String(viloyat || lockedViloyat || "").trim();
        if (includeViloyat && scopeViloyat)
            clauses.push(this.eqAposSmart("viloyat", scopeViloyat));
        // In default republic mode (no viloyat), ignore stale tuman filter.
        if (tuman && includeViloyat && scopeViloyat)
            clauses.push(this.eqAposSmart("tuman", tuman));
        if (yil) {
            const yDigits = (_b = (_a = String(yil).match(/\b(18|19|20)\d{2}\b/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : String(yil).replace(/[^\d]/g, "");
            clauses.push(yDigits
                ? `yil LIKE '${yDigits}%'`
                : `yil LIKE '%${(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_8__.escapeArcGIS)(String(yil))}%'`);
        }
        // ✅ FIX: always use "turi"
        if (includeCategory && turi) {
            clauses.push(this.eqAposSmart("turi", turi));
        }
        // VH uniqueids are applied as chunked queries in _doFetchCategoryData
        // (not inlined here — a single huge OR of IN(...) blows GET URL limits).
        return (0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_8__.withEvapoAccessWhere)(clauses.length ? clauses.join(" AND ") : "1=1");
    }
    /** WHERE fragments for VH→pie uniqueid filter (empty = no VH scope). */
    buildPieVhWhereChunks() {
        if (!this.state.filterPieByVh)
            return null;
        const ids = (0,_shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__.getPieVhFilterUniqueIds)();
        if (!ids)
            return null;
        if (!ids.length)
            return ["1=0"];
        const CHUNK = 800;
        const chunks = [];
        for (let i = 0; i < ids.length; i += CHUNK) {
            chunks.push((0,_shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_7__.buildSpatialJoinWhere)(ids.slice(i, i + CHUNK)));
        }
        return chunks;
    }
    /* ---------- Normalize / Escape ---------- */
    normalizeName(s) {
        if (!s)
            return "";
        return s
            .normalize("NFKC")
            .replace(/\u00A0/g, " ")
            .replace(/['''ʻʼ`]/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    }
    getCropColor(rawKey, index) {
        var _a;
        const k = this.normalizeName(rawKey).toLowerCase();
        const hit = AgriPie.CROP_COLOR_MAP[k];
        if (hit)
            return hit;
        return ((_a = AgriPie.FALLBACK_COLORS[index % AgriPie.FALLBACK_COLORS.length]) !== null && _a !== void 0 ? _a : "#1E7AE6");
    }
    getCategoryDisplayName(rawKey, language) {
        const key = this.normalizeName(rawKey).toLowerCase();
        const labels = {
            sholi: { uz_cyr: "Шоли", uz_lat: "Sholi", ru: "Рис", en: "Rice" },
            paxta: { uz_cyr: "Пахта", uz_lat: "Paxta", ru: "Хлопок", en: "Cotton" },
            makka: { uz_cyr: "Макка", uz_lat: "Makka", ru: "Кукуруза", en: "Corn" },
            "makkajo'xori": { uz_cyr: "Маккажўхори", uz_lat: "Makkajo'xori", ru: "Кукуруза", en: "Corn" },
            makkajoxori: { uz_cyr: "Маккажўхори", uz_lat: "Makkajo'xori", ru: "Кукуруза", en: "Corn" },
            "bug'doy": { uz_cyr: "Буғдой", uz_lat: "Bug'doy", ru: "Пшеница", en: "Wheat" },
            bugdoy: { uz_cyr: "Буғдой", uz_lat: "Bug'doy", ru: "Пшеница", en: "Wheat" },
            mosh: { uz_cyr: "Мош", uz_lat: "Mosh", ru: "Маш", en: "Mung bean" },
            beda: { uz_cyr: "Беда", uz_lat: "Beda", ru: "Люцерна", en: "Alfalfa" },
            ozuqa: { uz_cyr: "Озуқа", uz_lat: "Ozuqa", ru: "Кормовые", en: "Fodder" },
            loviya: { uz_cyr: "Ловия", uz_lat: "Loviya", ru: "Фасоль", en: "Beans" },
            poliz: { uz_cyr: "Полиз", uz_lat: "Poliz", ru: "Бахчевые", en: "Melons" },
            tariq: { uz_cyr: "Тариқ", uz_lat: "Tariq", ru: "Просо", en: "Millet" },
            "bog'": { uz_cyr: "Боғ", uz_lat: "Bog'", ru: "Сад", en: "Orchard" },
            bog: { uz_cyr: "Боғ", uz_lat: "Bog'", ru: "Сад", en: "Orchard" },
            bogi: { uz_cyr: "Боғ", uz_lat: "Bog'", ru: "Сад", en: "Orchard" },
            "bog'lar": { uz_cyr: "Боғлар", uz_lat: "Bog'lar", ru: "Сады", en: "Orchards" },
            "yeryong'oq": { uz_cyr: "Ерёнғоқ", uz_lat: "Yeryong'oq", ru: "Арахис", en: "Peanut" },
            yeryongoq: { uz_cyr: "Ерёнғоқ", uz_lat: "Yeryong'oq", ru: "Арахис", en: "Peanut" },
            "yer yong'oq": { uz_cyr: "Ерёнғоқ", uz_lat: "Yer yong'oq", ru: "Арахис", en: "Peanut" },
            sabzi: { uz_cyr: "Сабзи", uz_lat: "Sabzi", ru: "Морковь", en: "Carrot" },
            kungaboqar: { uz_cyr: "Кунгабоқар", uz_lat: "Kungaboqar", ru: "Подсолнечник", en: "Sunflower" },
            baliqxovuz: { uz_cyr: "Балиқҳовуз", uz_lat: "Baliqxovuz", ru: "Рыбный пруд", en: "Fish pond" },
            "baliq hovuz": { uz_cyr: "Балиқ ҳовуз", uz_lat: "Baliq hovuz", ru: "Рыбный пруд", en: "Fish pond" },
            boshqa: { uz_cyr: "Бошқа", uz_lat: "Boshqa", ru: "Другое", en: "Other" },
            issiqxona: { uz_cyr: "Иссиқхона", uz_lat: "Issiqxona", ru: "Теплица", en: "Greenhouse" },
        };
        const hit = labels[key];
        if (!hit)
            return rawKey;
        return hit[language] || rawKey;
    }
    makeAposVariants(s) {
        const base = this.normalizeName(s);
        if (!base)
            return [""];
        if (!base.includes("'"))
            return [base];
        const mask = base.replace(/'/g, "\uFFFF");
        const variants = AgriPie.APOSTROPHE_VARIANTS.map((ch) => mask.split("\uFFFF").join(ch));
        return Array.from(new Set(variants));
    }
    eqAposSmart(field, raw) {
        const variants = this.makeAposVariants(raw);
        const clauses = variants
            .filter((v) => v)
            .map((v) => `${field}='${(0,_shared_feature_layer_data__WEBPACK_IMPORTED_MODULE_8__.escapeArcGIS)(v)}'`);
        if (!clauses.length)
            return "";
        return clauses.length === 1 ? clauses[0] : `(${clauses.join(" OR ")})`;
    }
    makeViloyatKey(raw) {
        if (raw == null)
            return "";
        return this.normalizeName(String(raw))
            .replace(/['ʻʼ`´]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }
    retryMapConnection() {
        this.setState({
            connectionStatus: "idle",
            mapLoadingStatus: "idle",
            mapConnectionAttempts: 0,
            error: null,
            debugInfo: "Manual retry initiated",
        });
    }
    componentDidMount() {
        this._isMounted = true;
        this.initializeTheme();
        this.setState({
            mapLoadingStatus: "idle",
            connectionStatus: "idle",
            debugInfo: "Widget mounted",
        });
        this._unbindMasterFilter = (0,_data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_10__.bindMasterFilter)(this.handleMasterFilterChange);
        document.addEventListener("yilChanged", this.handleYilChanged);
        document.addEventListener("regionChanged", this.handleRegionChange);
        document.addEventListener("kadastrFilterChanged", this.handleKadastrFilterChanged);
        document.addEventListener("agriV11ThemeToggled", this.handleThemeToggled);
        document.addEventListener("languageChanged", this.handleLanguageChange);
        window.addEventListener("resize", this.handleResize);
        // Force proceed if connection stalls
        setTimeout(() => {
            if (this._isMounted &&
                (this.state.mapLoadingStatus === "loading" ||
                    this.state.connectionStatus === "connecting")) {
                this.setState({
                    connectionStatus: "connected",
                    mapLoadingStatus: "loaded",
                    debugInfo: "Timeout reached, proceeding",
                }, () => this.fetchCategoryData());
            }
        }, this.CONNECTION_TIMEOUT_MS);
        this.updatePieChart("data");
    }
    findAreaStatisticField(fl) {
        const fields = (fl === null || fl === void 0 ? void 0 : fl.fields) || [];
        const names = fields.map((f) => String((f === null || f === void 0 ? void 0 : f.name) || ""));
        const lower = names.map((n) => n.toLowerCase());
        const preferred = ["maydon", "area_ha", "area", "hectare", "hectares", "га"];
        for (const p of preferred) {
            const idx = lower.indexOf(p);
            if (idx !== -1)
                return names[idx];
        }
        for (const p of preferred) {
            const idx = lower.findIndex((n) => n.includes(p));
            if (idx !== -1)
                return names[idx];
        }
        return this.findFieldByPossibleNames(preferred);
    }
    queryCategoryStatsJSON(fl, where, categoryField) {
        return __awaiter(this, void 0, void 0, function* () {
            const areaField = this.findAreaStatisticField(fl);
            const oidField = (fl === null || fl === void 0 ? void 0 : fl.objectIdField) || "OBJECTID";
            return (0,_data_agri_stats_store__WEBPACK_IMPORTED_MODULE_11__.getPieCategoryStatsCached)({
                layer: fl,
                where: where || "1=1",
                categoryField,
                areaField,
                objectIdField: oidField,
            });
        });
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.externalFilters !== prevProps.externalFilters &&
            this.props.externalFilters) {
            this.updateFiltersFromProps(this.props.externalFilters);
        }
        if (prevState.connectionStatus !== "connected" &&
            this.state.connectionStatus === "connected") {
            setTimeout(() => this._isMounted && this.initializeAfterConnection(), 100);
        }
        const { mapLoadingStatus, mapConnectionAttempts } = this.state;
        const { useMapWidgetIds } = this.props;
        if ((mapLoadingStatus === "failed" || mapLoadingStatus === "idle") &&
            useMapWidgetIds &&
            useMapWidgetIds.length > 0 &&
            !this.state.activeMapView &&
            mapConnectionAttempts !== prevState.mapConnectionAttempts) {
            if (mapConnectionAttempts < this.MAX_CONNECTION_ATTEMPTS) {
                setTimeout(() => {
                    if (this._isMounted) {
                        this.setState((prev) => ({
                            mapConnectionAttempts: prev.mapConnectionAttempts + 1,
                            mapLoadingStatus: "idle",
                            debugInfo: `Retry attempt ${prev.mapConnectionAttempts + 1}`,
                        }));
                    }
                }, 2000);
            }
            else {
                this.setState({
                    mapLoadingStatus: "failed",
                    connectionStatus: "connected",
                    error: null,
                    debugInfo: "Proceeding after multiple failed attempts",
                }, () => this.fetchCategoryData());
            }
        }
        const shouldRefreshPieData = prevState.categoryData !== this.state.categoryData ||
            prevState.language !== this.state.language ||
            prevState.isDarkTheme !== this.state.isDarkTheme;
        const shouldRefreshPieSelection = !shouldRefreshPieData &&
            (prevState.activeSlice !== this.state.activeSlice ||
                prevState.selectedCategories !== this.state.selectedCategories);
        if (shouldRefreshPieData) {
            this.updatePieChart("data");
        }
        else if (shouldRefreshPieSelection) {
            this.updatePieChart("selection");
        }
    }
    componentWillUnmount() {
        var _a;
        this._isMounted = false;
        if (this._fetchDebounceTimer) {
            clearTimeout(this._fetchDebounceTimer);
        }
        document.removeEventListener("yilChanged", this.handleYilChanged); // ✅ FIX
        document.removeEventListener("regionChanged", this.handleRegionChange);
        document.removeEventListener("agriV11ThemeToggled", this.handleThemeToggled);
        document.removeEventListener("languageChanged", this.handleLanguageChange);
        (_a = this._unbindMasterFilter) === null || _a === void 0 ? void 0 : _a.call(this);
        this._unbindMasterFilter = null;
        // ✅ FIX: now it actually exists
        document.removeEventListener("kadastrFilterChanged", this.handleKadastrFilterChanged);
        // Optional legacy support
        document.removeEventListener("constructionYearChanged", this.handleConstructionYearChanged);
        window.removeEventListener("resize", this.handleResize);
        if (this._pieChart) {
            this._pieChart.dispose();
            this._pieChart = null;
            this._pieChartHostEl = null;
            this._pieHasRendered = false;
            this._pieStableKeys = [];
            this._pieStableRawKeys = {};
        }
    }
    /* ---------- Data fetch ---------- */
    makeQueryKey(yil, viloyat, tuman, vh, barField, barValue) {
        return [
            yil || "",
            viloyat || "",
            tuman || "",
            vh || "",
            barField !== null && barField !== void 0 ? barField : "",
            barValue !== null && barValue !== void 0 ? barValue : "",
        ].join("|");
    }
    _doFetchCategoryData() {
        return __awaiter(this, void 0, void 0, function* () {
            // Match Agro_widgetV1 query key / routing: selected viloyat only
            // (lockedViloyat stays in state for UI/access, not in the stats key).
            const selectedViloyat = (this.state.viloyat || "").trim();
            const key = this.makeQueryKey(this.state.yil, selectedViloyat, this.state.tuman, this.state.vh, this.state.barCategoryField, this.state.barCategoryValue);
            if (key === this._lastFetchKey) {
                if (this.state.loading) {
                    this.setState({ loading: false });
                }
                return;
            }
            // Requires at least yil; viloyat optional (empty = republic-wide)
            if (!this.state.yil) {
                this._lastFetchKey = key;
                this._hasCompletedFetch = false;
                this.setState({
                    categoryData: { categories: [], totalValue: 0 },
                    loading: false,
                    error: null,
                });
                return;
            }
            if (this.state.connectionStatus !== "connected") {
                return;
            }
            this._lastFetchKey = key;
            this._fetchCounter++;
            const fetchId = this._fetchCounter;
            try {
                if (!this.state.loading) {
                    this.setState({ loading: true, error: null });
                }
                else {
                    this.setState({ error: null });
                }
                const { layer: tableLayer } = yield (0,_shared_agri_table_data_source__WEBPACK_IMPORTED_MODULE_7__.getAgriTableDataLayer)();
                const categoryField = this.findCategoryField(tableLayer) || "turi";
                if (!categoryField) {
                    this._hasCompletedFetch = true;
                    this.setState({
                        loading: false,
                        error: "No category field found. Please check your layer fields.",
                    });
                    return;
                }
                // includeCategory: false — this widget always shows the full crop
                // breakdown (every slice), regardless of which crop is currently
                // selected. The selected crop is only ever a visual highlight
                // (selectedCategory/activeSlice), never a self-filter on this query.
                if (this.state.filterPieByVh && (0,_shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__.getPieVhFilterUniqueIds)() == null) {
                    // Localization publishes uniqueids after map resolve; retry briefly.
                    for (let i = 0; i < 20 && (0,_shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__.getPieVhFilterUniqueIds)() == null; i++) {
                        yield new Promise((r) => setTimeout(r, 100));
                        if (!this._isMounted || fetchId !== this._fetchCounter)
                            return;
                    }
                    if ((0,_shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__.getPieVhFilterUniqueIds)() == null) {
                        // Still missing — show empty rather than an unscoped pie.
                        if (fetchId === this._fetchCounter && this._isMounted) {
                            this._hasCompletedFetch = true;
                            this.setState({
                                categoryData: { categories: [], totalValue: 0 },
                                loading: false,
                                error: null,
                            });
                        }
                        return;
                    }
                    if (this._isMounted) {
                        this.setState({ pieVhUniqueIdsSig: (0,_shared_agri_chart_filter_order__WEBPACK_IMPORTED_MODULE_9__.getPieVhFilterUniqueIdsSig)() });
                    }
                }
                const scopeViloyat = String(this.state.viloyat || this.state.lockedViloyat || "").trim();
                const whereClause = this.buildWhereClauseForDS({
                    includeCategory: false,
                    // Republic (no viloyat) must not inherit a leftover region predicate.
                    includeViloyat: !!scopeViloyat,
                });
                const layersForQuery = [
                    tableLayer,
                ];
                const merged = new Map();
                const vhChunks = this.buildPieVhWhereChunks();
                const whereParts = vhChunks && vhChunks.length
                    ? vhChunks.map((chunk) => whereClause && whereClause !== "1=1"
                        ? `(${whereClause}) AND (${chunk})`
                        : chunk)
                    : [whereClause || "1=1"];
                for (const layer of layersForQuery) {
                    const layerCategoryField = this.findCategoryField(layer);
                    if (!layerCategoryField)
                        continue;
                    for (const partWhere of whereParts) {
                        const part = yield this.queryCategoryStatsJSON(layer, partWhere, layerCategoryField);
                        for (const r of part) {
                            const norm = this.normalizeName(r.key || "").toLowerCase();
                            if (!norm)
                                continue;
                            const prev = merged.get(norm);
                            if (prev) {
                                prev.value += Number(r.value || 0);
                            }
                            else {
                                merged.set(norm, {
                                    key: r.key,
                                    value: Number(r.value || 0),
                                });
                            }
                        }
                    }
                }
                const rows = Array.from(merged.values());
                if (!this._isMounted || fetchId !== this._fetchCounter)
                    return;
                const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
                const categories = rows
                    .sort((a, b) => b.value - a.value)
                    .map((r) => ({
                    key: r.key,
                    value: r.value,
                    percentage: totalValue ? (r.value / totalValue) * 100 : 0,
                }));
                const validSelectedCategories = this.state.selectedCategories.filter((selected) => categories.some((category) => this.normalizeName(category.key) === this.normalizeName(selected)));
                const newActiveSlice = categories.findIndex((category) => validSelectedCategories.some((selected) => this.normalizeName(category.key) === this.normalizeName(selected)));
                const singleSelection = validSelectedCategories.length === 1 ? validSelectedCategories[0] : "";
                this._hasCompletedFetch = true;
                this.setState({
                    categoryData: { categories, totalValue },
                    loading: false,
                    error: null,
                    activeSlice: newActiveSlice >= 0 ? newActiveSlice : null,
                    turi: singleSelection,
                    turlar: validSelectedCategories,
                    selectedCategory: singleSelection || null,
                    selectedCategories: validSelectedCategories,
                    debugInfo: `Loaded ${categories.length} categories (WHERE: ${whereClause})`,
                });
            }
            catch (error) {
                if (!this._isMounted || fetchId !== this._fetchCounter)
                    return;
                this._hasCompletedFetch = true;
                this.setState({
                    loading: false,
                    error: (error === null || error === void 0 ? void 0 : error.message) || "Failed to load data from layer.",
                });
            }
        });
    }
    /* ---------- Render ---------- */
    render() {
        var _a, _b;
        const { loading, error, categoryData, activeSlice, selectedCategories, mapLoadingStatus, connectionStatus, debugInfo, yil, viloyat, lockedViloyat, language, isDarkTheme, } = this.state;
        const { categories } = categoryData;
        const sortedCategories = [...categories].sort((a, b) => b.value - a.value);
        // Display every crop type returned by the grouped service query. The
        // legend is scrollable, so a long list does not overflow the widget.
        const visibleCategories = sortedCategories;
        const themeClass = isDarkTheme ? "dark-theme" : "light-theme";
        const areaUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";
        const titleText = language === "en"
            ? "Crop Type"
            : language === "ru"
                ? "Тип культуры"
                : language === "uz_lat"
                    ? "Ekin Turi"
                    : "Экин Тури";
        const chartData = visibleCategories.map((category) => ({
            name: this.getCategoryDisplayName(category.key, language),
            rawKey: category.key,
            value: category.value,
            percentage: category.percentage,
        }));
        let statusIndicator = "idle";
        if (mapLoadingStatus === "loading")
            statusIndicator = "loading";
        else if (mapLoadingStatus === "loaded" && connectionStatus === "connecting")
            statusIndicator = "connecting";
        else if (connectionStatus === "connected")
            statusIndicator = "connected";
        else if (mapLoadingStatus === "failed" || connectionStatus === "failed")
            statusIndicator = "failed";
        const showDebugInfo = false; // ✅ Disabled debug panel
        const formatAreaValue = (value) => {
            const safe = Number.isFinite(value) ? value : 0;
            const digits = safe >= 100 ? 0 : safe >= 10 ? 1 : 2;
            return safe.toLocaleString("ru-RU", {
                maximumFractionDigits: digits,
                minimumFractionDigits: 0,
            }).replace(/,/g, ".");
        };
        const sliceInteractive = !!(lockedViloyat || viloyat || "").trim();
        const isIpadLayout = this.isIpadLayout();
        const hasChartData = categories.length > 0;
        const awaitingFirstData = !this._hasCompletedFetch;
        // Loader until first fetch finishes — never flash "no data" during connect/refresh.
        const showBlockingLoader = !yil ||
            mapLoadingStatus === "loading" ||
            connectionStatus === "idle" ||
            connectionStatus === "connecting" ||
            (connectionStatus === "connected" &&
                !hasChartData &&
                (loading || awaitingFirstData));
        // Overlay loader on any subsequent data change (region, year, filters…).
        const showRefreshLoader = connectionStatus === "connected" && loading && hasChartData;
        // Empty state only after a real fetch returned zero categories.
        const showNoData = !!yil &&
            connectionStatus === "connected" &&
            !loading &&
            this._hasCompletedFetch &&
            !hasChartData;
        return (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: `land-category-card ${themeClass}${isIpadLayout ? " land-category-card--ipad" : ""}` },
            showDebugInfo && (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "debug-info", style: {
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    fontSize: "10px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    maxWidth: "200px",
                    zIndex: 1000,
                } },
                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", null,
                    "Status: ",
                    statusIndicator),
                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", null,
                    "Map: ",
                    mapLoadingStatus),
                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", null,
                    "Connection: ",
                    connectionStatus),
                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", null,
                    "Categories: ",
                    categories.length),
                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", null,
                    "Debug: ",
                    debugInfo))),
            jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                    opacity: 0,
                    pointerEvents: "none",
                } },
                ((_a = this.props.useDataSources) === null || _a === void 0 ? void 0 : _a.length) > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(jimu_core__WEBPACK_IMPORTED_MODULE_2__.DataSourceComponent, { useDataSource: this.props.useDataSources[0], onDataSourceCreated: this.onDataSourceCreated, onDataSourceInfoChange: this.onDataSourceInfoChange })),
                ((_b = this.props.useMapWidgetIds) === null || _b === void 0 ? void 0 : _b.length) > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__.JimuMapViewComponent, { useMapWidgetId: this.props.useMapWidgetIds[0], onActiveViewChange: this.onActiveViewChange }))),
            jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-content" },
                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-header" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-title-wrap" },
                        jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-title" }, titleText))),
                mapLoadingStatus === "failed" && connectionStatus !== "connected" ? (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-error" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_12__["default"], { className: "agri-empty-state-icon", strokeWidth: 1.7, "aria-hidden": "true" }),
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("p", null, error || "Харитага уланишда хатолик. Қайта уриниб кўринг."),
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(jimu_ui__WEBPACK_IMPORTED_MODULE_3__.Button, { onClick: this.retryMapConnection, type: "primary", size: "sm" }, "\u049A\u0430\u0439\u0442\u0430 \u0443\u043B\u0430\u043D\u0438\u0448"))) : error ? (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-error" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_12__["default"], { className: "agri-empty-state-icon", strokeWidth: 1.7, "aria-hidden": "true" }),
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("p", null, error),
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(jimu_ui__WEBPACK_IMPORTED_MODULE_3__.Button, { onClick: () => this.fetchCategoryData(), type: "primary", size: "sm" }, "\u049A\u0430\u0439\u0442\u0430 \u0443\u0440\u0438\u043D\u0438\u0448"))) : showBlockingLoader ? (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-loading-container" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_4__["default"], null))) : showNoData ? (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-no-data" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_12__["default"], { className: "agri-empty-state-icon", strokeWidth: 1.7, "aria-hidden": "true" }),
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("h3", null, (0,_shared_agriNoDataLabel__WEBPACK_IMPORTED_MODULE_5__.agriNoDataLabel)(language)))) : (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: `land-category-main-content${isIpadLayout ? " land-category-main-content--no-legend" : ""}` },
                    showRefreshLoader ? jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_4__["default"], null) : null,
                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: `land-category-chart-container${showRefreshLoader ? " land-category-chart-container--loading" : ""}` },
                        jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-echart-stage" },
                            this.renderRadarPieChart(chartData, 400, 400),
                            !showRefreshLoader ? ((() => {
                                const center = this.getPieCenterContent(chartData);
                                const isMultiLabel = selectedCategories.length > 1 &&
                                    center.label !== this.getCenterAllLabel();
                                return (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "land-category-pie-center", "aria-hidden": "true" },
                                    center.showPercent ? (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("p", { className: "land-category-pie-center-value" }, this.formatCenterPercent(center.percent))) : null,
                                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("p", { className: "land-category-pie-center-area" }, this.formatCenterArea(center.area)),
                                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("p", { key: center.label, title: center.label, className: `land-category-pie-center-label land-category-pie-center-label--muted land-category-pie-center-line--enter${isMultiLabel
                                            ? " land-category-pie-center-label--multi"
                                            : ""}` }, center.label)));
                            })()) : null)),
                    isIpadLayout ? null : (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "category-legend", style: {
                            // Always allow scroll; only clicks are gated by sliceInteractive.
                            pointerEvents: showRefreshLoader ? "none" : "auto",
                            opacity: showRefreshLoader ? 0.35 : 1,
                        }, "aria-disabled": showRefreshLoader },
                        jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "category-legend-inner" }, chartData.map((entry, index) => {
                            const accentColor = this.getCropColor(entry.rawKey || entry.name, index);
                            return (jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { key: entry.rawKey || entry.name, className: `legend-item ${selectedCategories.some((selected) => this.normalizeName(selected) === this.normalizeName(entry.rawKey || entry.name)) ? "legend-item-selected" : ""}`, onClick: () => sliceInteractive &&
                                    this.handleSliceClick(entry, index), style: {
                                    cursor: sliceInteractive ? "pointer" : "default",
                                    pointerEvents: sliceInteractive ? "auto" : "none",
                                    ["--legend-accent"]: accentColor,
                                } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("div", { className: "legend-color", style: { backgroundColor: accentColor } }),
                                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("span", { className: "legend-label", title: entry.name }, entry.name),
                                jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("span", { className: "legend-value" },
                                    jimu_core__WEBPACK_IMPORTED_MODULE_2__.React.createElement("span", { className: "legend-area-value" }, `${formatAreaValue(Number(entry.value) || 0)} ${areaUnit}`))));
                        })))))))));
    }
}
// Crop palette (matches AgriLocalization renderer)
AgriPie.CROP_COLOR_MAP = {
    "bug'doy": "#D9A300",
    bugdoy: "#D9A300",
    paxta: "#E8E1D1",
    makka: "#7CB342",
    sholi: "#26A69A",
    mosh: "#8E44AD",
    beda: "#43A047",
    ozuqa: "#8BC34A",
    loviya: "#6A5ACD",
    poliz: "#F26B38",
    tariq: "#C58F00",
    "bog'": "#1B5E20",
    bog: "#1B5E20",
    "yeryong'oq": "#8D6E63",
    yeryongoq: "#8D6E63",
    sabzi: "#E65100",
    kungaboqar: "#FDD835",
    baliqxovuz: "#0288D1",
    "baliq hovuz": "#0288D1",
    boshqa: "#78909C",
};
// Fallback palette (for unknown categories)
/** Thin grey edge so light/white slices (e.g. paxta) stay visible on light UI */
AgriPie.PIE_SLICE_EDGE = {
    borderColor: "rgba(100, 116, 139, 0.55)",
    borderWidth: 1,
};
AgriPie.FALLBACK_COLORS = [
    "#1E7AE6",
    "#202124",
    "#6C6FD5",
    "#56AEDA",
    "#F6A11A",
    "#FF4E46",
    "#8B95A7",
    "#7B61FF",
    "#2AA1FF",
    "#00C389",
    "#D97706",
    "#EF4444",
    "#0EA5E9",
    "#4F46E5",
    "#334155",
];
AgriPie.APOSTROPHE_VARIANTS = ["'", "'", "'", "ʻ", "ʼ", "`"];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AgriPie);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyb193aWRnZXRWNV9zcmNfZW1iZWRkZWRfQWdyaVBpZTEwX3J1bnRpbWVfd2lkZ2V0X3RzeC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBbUM7QUFDNkI7QUFRN0M7QUFDYztBQUNZO0FBQ2lCO0FBQ0k7QUFDTztBQUk1QjtBQUN3QztBQUl2QztBQUNtQjtBQUNVO0FBNkUzRSxNQUFNLHNCQUFzQixHQUFHLGtDQUFrQyxDQUFDO0FBQ2xFLE1BQU0sK0JBQStCLEdBQUcsR0FBUyxFQUFFO0lBQ2pELElBQUksQ0FBQztRQUNILElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEdBQUc7WUFBRSxPQUFPO1FBQ2pFLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLFlBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBQUMsV0FBTSxDQUFDO1FBQ1Asd0JBQXdCO0lBQzFCLENBQUM7QUFDSCxDQUFDLENBQUM7QUFFRixNQUFNLE9BQU8sR0FBRztJQUNkLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzVCLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzdCLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzlCLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFFLEVBQUUsR0FBRSxDQUFDO0lBQzdCLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBWSxFQUFF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RUFBRSxRQUFRLEVBQUU7WUFDdEUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRTtZQUNuRSxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFO1lBQ2hFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUU7WUFDakUsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRTtZQUM5RSxZQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFO1lBQ3JGLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUU7WUFDbEYsYUFBYSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUN2RixLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFO1lBQ3hFLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsY0FBYyxF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O0lBQ3ZDLFdBQVcsRUFBRSwyQkFBMkI7SUFDeEMsV0FBVyxFQUFFLENBQUM7Q0FDZixDQUFDO0FBRXNCLHVCQUFlLEdBQUc7SUFDeEMsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0NBQ1YsQ0FBQztBQW9Ic0IsMkJBQW1CLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lFQTFLMUQsT0FBTztBQThyRXBCLFNBQVMsMkJBQTJCLENBQUMsR0FBRyxJQUFJLHFCQUF1QixHQUFHLEdBQUcsRUFBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2VtYmVkZGVkL0FncmlQaWUxMC9ydW50aW1lL3dpZGdldC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWNoYXJ0cyBmcm9tIFwiZWNoYXJ0c1wiO1xuaW1wb3J0IHsgSmltdU1hcFZpZXcsIEppbXVNYXBWaWV3Q29tcG9uZW50IH0gZnJvbSBcImppbXUtYXJjZ2lzXCI7XG5pbXBvcnQge1xuICBBbGxXaWRnZXRQcm9wcyxcbiAgRGF0YVNvdXJjZSxcbiAgRGF0YVNvdXJjZUNvbXBvbmVudCxcbiAgSW1tdXRhYmxlQXJyYXksXG4gIFF1ZXJpYWJsZURhdGFTb3VyY2UsXG4gIFJlYWN0LFxufSBmcm9tIFwiamltdS1jb3JlXCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiamltdS11aVwiO1xuaW1wb3J0IHsgVHJpYW5nbGVBbGVydCB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCBBZ3JpQ2hhcnRMb2FkZXIgZnJvbSBcIi4uLy4uLy4uL3NoYXJlZC9BZ3JpQ2hhcnRMb2FkZXJcIjtcbmltcG9ydCB7IGFncmlOb0RhdGFMYWJlbCB9IGZyb20gXCIuLi8uLi8uLi9zaGFyZWQvYWdyaU5vRGF0YUxhYmVsXCI7XG5pbXBvcnQgeyBnZXRBZ3JpRGFzaGJvYXJkQm9vdHN0cmFwIH0gZnJvbSBcIi4uLy4uLy4uL2RhdGEvYWdyaS1ib290c3RyYXBcIjtcbmltcG9ydCB7XG4gIGJ1aWxkU3BhdGlhbEpvaW5XaGVyZSxcbiAgZ2V0QWdyaVRhYmxlRGF0YUxheWVyLFxufSBmcm9tIFwiLi4vLi4vc2hhcmVkL2FncmktdGFibGUtZGF0YS1zb3VyY2VcIjtcbmltcG9ydCB7IHdpdGhFdmFwb0FjY2Vzc1doZXJlLCBlc2NhcGVBcmNHSVMgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL2ZlYXR1cmUtbGF5ZXItZGF0YVwiO1xuaW1wb3J0IHtcbiAgZ2V0UGllVmhGaWx0ZXJVbmlxdWVJZHMsXG4gIGdldFBpZVZoRmlsdGVyVW5pcXVlSWRzU2lnLFxufSBmcm9tIFwiLi4vLi4vc2hhcmVkL2FncmktY2hhcnQtZmlsdGVyLW9yZGVyXCI7XG5pbXBvcnQgeyBiaW5kTWFzdGVyRmlsdGVyIH0gZnJvbSBcIi4uLy4uLy4uL2RhdGEvYWdyaS1maWx0ZXItYnVzXCI7XG5pbXBvcnQgeyBnZXRQaWVDYXRlZ29yeVN0YXRzQ2FjaGVkIH0gZnJvbSBcIi4uLy4uLy4uL2RhdGEvYWdyaS1zdGF0cy1zdG9yZVwiO1xuXG4vKiAtLS0tLS0tLS0tIFR5cGVzIC0tLS0tLS0tLS0gKi9cblxuaW50ZXJmYWNlIENhdGVnb3J5RGF0YSB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICBwZXJjZW50YWdlPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgQWdyaVBpZVByb3BzIGV4dGVuZHMgQWxsV2lkZ2V0UHJvcHM8YW55PiB7XG4gIGV4dGVybmFsRmlsdGVycz86IHtcbiAgICB2aWxveWF0Pzogc3RyaW5nO1xuICAgIHR1bWFuPzogc3RyaW5nO1xuICAgIHlpbD86IHN0cmluZztcbiAgICB0dXJpPzogc3RyaW5nO1xuICB9O1xuICB1c2VNYXBXaWRnZXRJZHM/OiBJbW11dGFibGVBcnJheTxzdHJpbmc+O1xufVxuXG5pbnRlcmZhY2UgQWdyaVBpZVN0YXRlIHtcbiAgbG9hZGluZzogYm9vbGVhbjtcbiAgZXJyb3I6IHN0cmluZyB8IG51bGw7XG5cbiAgY2F0ZWdvcnlEYXRhOiB7XG4gICAgY2F0ZWdvcmllczogQ2F0ZWdvcnlEYXRhW107XG4gICAgdG90YWxWYWx1ZTogbnVtYmVyO1xuICB9O1xuICB2aDogc3RyaW5nO1xuICAvKiogQmFyIGNoYXJ0J3MgY3VycmVudCBhdHRyaWJ1dGUgKGUuZy4gc3RhdHVzXzIwMjVfMDZfMTIpOyB1c2Ugd2l0aCBiYXJDYXRlZ29yeVZhbHVlIHRvIGZpbHRlciBsaWtlIEdyYWZmICovXG4gIGJhckNhdGVnb3J5RmllbGQ6IHN0cmluZyB8IG51bGw7XG4gIGJhckNhdGVnb3J5VmFsdWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gRmlsdGVyIGhpZXJhcmNoeSAoaW5jb21pbmcgZnJvbSBvdGhlciB3aWRnZXRzKVxuICB5aWw6IHN0cmluZztcbiAgdmlsb3lhdDogc3RyaW5nO1xuICAvKiogQWdyaUZpbHRlciBzY29wZTogdmlsb3lhdCBxdWxmbGFzaCAoZmlsdGVycy52aWxveWF0IGJv4oCYc2ggYm/igJhsaXNoaSBtdW1raW4pICovXG4gIGxvY2tlZFZpbG95YXQ6IHN0cmluZztcbiAgdHVtYW46IHN0cmluZztcbiAgdHVyaTogc3RyaW5nO1xuICB0dXJsYXI6IHN0cmluZ1tdO1xuICAvKiogV2hlbiB0cnVlLCBwaWUgaXMgc2NvcGVkIGJ5IFZIIHVuaXF1ZWlkcyAoVkggd2FzIHNlbGVjdGVkIGZpcnN0KS4gKi9cbiAgZmlsdGVyUGllQnlWaDogYm9vbGVhbjtcbiAgLyoqIFNpZ25hdHVyZSBvZiB0aGUgdW5pcXVlaWQgc2V0IHVzZWQgZm9yIFZI4oaScGllIGZpbHRlcmluZy4gKi9cbiAgcGllVmhVbmlxdWVJZHNTaWc6IHN0cmluZztcblxuICAvLyBVSSBzdGF0ZVxuICBhY3RpdmVTbGljZTogbnVtYmVyIHwgbnVsbDtcbiAgc2VsZWN0ZWRDYXRlZ29yeTogc3RyaW5nIHwgbnVsbDtcbiAgc2VsZWN0ZWRDYXRlZ29yaWVzOiBzdHJpbmdbXTtcbiAgaG92ZXJlZFNsaWNlOiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIE1hcC1yZWxhdGVkXG4gIGFjdGl2ZU1hcFZpZXc/OiBKaW11TWFwVmlldztcblxuICAvLyBFdmVudCB0cmFja2luZ1xuICBsYXN0RmlsdGVyRXZlbnRUaW1lc3RhbXA6IG51bWJlcjtcbiAgaXNIYW5kbGluZ0V4dGVybmFsRXZlbnQ6IGJvb2xlYW47XG5cbiAgLy8gQ29ubmVjdGlvbiBzdGF0dXNcbiAgbWFwQ29ubmVjdGlvbkF0dGVtcHRzOiBudW1iZXI7XG4gIG1hcExvYWRpbmdTdGF0dXM6IFwiaWRsZVwiIHwgXCJsb2FkaW5nXCIgfCBcImxvYWRlZFwiIHwgXCJmYWlsZWRcIjtcbiAgY29ubmVjdGlvblN0YXR1czogXCJpZGxlXCIgfCBcImNvbm5lY3RpbmdcIiB8IFwiY29ubmVjdGVkXCIgfCBcImZhaWxlZFwiO1xuXG4gIC8vIERhdGEgc291cmNlXG4gIGRhdGFTb3VyY2U/OiBRdWVyaWFibGVEYXRhU291cmNlO1xuXG4gIC8vIFJlc29sdmVkIEZlYXR1cmVMYXllcnMgZm9yIG11bHRpLURTIHJvdXRpbmcgYnkgdmlsb3lhdFxuICBmZWF0dXJlTGF5ZXJzPzogX19lc3JpLkZlYXR1cmVMYXllcltdO1xuICBhY3RpdmVGZWF0dXJlTGF5ZXI/OiBfX2VzcmkuRmVhdHVyZUxheWVyO1xuXG4gIC8vIERlYnVnXG4gIGRlYnVnSW5mbzogc3RyaW5nO1xuICBsYW5ndWFnZTogXCJ1el9jeXJcIiB8IFwidXpfbGF0XCIgfCBcInJ1XCIgfCBcImVuXCI7XG4gIGlzRGFya1RoZW1lOiBib29sZWFuO1xufVxuXG5jb25zdCBBR1JJM19MQU5HX1BSRUZfS0VZX1YzID0gXCJhZ3JpM19sYW5nX2luaXRpYWxpemVkX3V6X2xhdF92M1wiO1xuY29uc3QgZW5zdXJlQWdyaTNVekxhdExhbmd1YWdlRGVmYXVsdCA9ICgpOiB2b2lkID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oQUdSSTNfTEFOR19QUkVGX0tFWV9WMykgPT09IFwiMVwiKSByZXR1cm47XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJhcHBfbGFuZ1wiLCBcInV6X2xhdFwiKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImV2YXBvX2FwcF9sYW5nXCIsIFwidXpfbGF0XCIpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiYWdyb19sYW5nXCIsIFwidXpfbGF0XCIpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEFHUkkzX0xBTkdfUFJFRl9LRVlfVjMsIFwiMVwiKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gaWdub3JlIHN0b3JhZ2UgZXJyb3JzXG4gIH1cbn07XG5cbmNvbnN0IGNvbnNvbGUgPSB7XG4gIGxvZzogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG4gIHdhcm46ICguLi5fYXJnczogYW55W10pID0+IHt9LFxuICBlcnJvcjogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG4gIGluZm86ICguLi5fYXJnczogYW55W10pID0+IHt9LFxuICBkZWJ1ZzogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG59O1xuXG4vKiAtLS0tLS0tLS0tIENvbXBvbmVudCAtLS0tLS0tLS0tICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFncmlQaWUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PFxuICBBZ3JpUGllUHJvcHMsXG4gIEFncmlQaWVTdGF0ZVxuPiB7XG4gIF9pc01vdW50ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfdW5iaW5kTWFzdGVyRmlsdGVyOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcblxuICAvLyBDcm9wIHBhbGV0dGUgKG1hdGNoZXMgQWdyaUxvY2FsaXphdGlvbiByZW5kZXJlcilcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ1JPUF9DT0xPUl9NQVA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgXCJidWcnZG95XCI6IFwiI0Q5QTMwMFwiLFxuICAgIGJ1Z2RveTogXCIjRDlBMzAwXCIsXG4gICAgcGF4dGE6IFwiI0U4RTFEMVwiLFxuICAgIG1ha2thOiBcIiM3Q0IzNDJcIixcbiAgICBzaG9saTogXCIjMjZBNjlBXCIsXG4gICAgbW9zaDogXCIjOEU0NEFEXCIsXG4gICAgYmVkYTogXCIjNDNBMDQ3XCIsXG4gICAgb3p1cWE6IFwiIzhCQzM0QVwiLFxuICAgIGxvdml5YTogXCIjNkE1QUNEXCIsXG4gICAgcG9saXo6IFwiI0YyNkIzOFwiLFxuICAgIHRhcmlxOiBcIiNDNThGMDBcIixcbiAgICBcImJvZydcIjogXCIjMUI1RTIwXCIsXG4gICAgYm9nOiBcIiMxQjVFMjBcIixcbiAgICBcInllcnlvbmcnb3FcIjogXCIjOEQ2RTYzXCIsXG4gICAgeWVyeW9uZ29xOiBcIiM4RDZFNjNcIixcbiAgICBzYWJ6aTogXCIjRTY1MTAwXCIsXG4gICAga3VuZ2Fib3FhcjogXCIjRkREODM1XCIsXG4gICAgYmFsaXF4b3Z1ejogXCIjMDI4OEQxXCIsXG4gICAgXCJiYWxpcSBob3Z1elwiOiBcIiMwMjg4RDFcIixcbiAgICBib3NocWE6IFwiIzc4OTA5Q1wiLFxuICB9O1xuXG4gIC8vIEZhbGxiYWNrIHBhbGV0dGUgKGZvciB1bmtub3duIGNhdGVnb3JpZXMpXG4gIC8qKiBUaGluIGdyZXkgZWRnZSBzbyBsaWdodC93aGl0ZSBzbGljZXMgKGUuZy4gcGF4dGEpIHN0YXkgdmlzaWJsZSBvbiBsaWdodCBVSSAqL1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBQSUVfU0xJQ0VfRURHRSA9IHtcbiAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDEwMCwgMTE2LCAxMzksIDAuNTUpXCIsXG4gICAgYm9yZGVyV2lkdGg6IDEsXG4gIH07XG5cbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgRkFMTEJBQ0tfQ09MT1JTID0gW1xuICAgIFwiIzFFN0FFNlwiLFxuICAgIFwiIzIwMjEyNFwiLFxuICAgIFwiIzZDNkZENVwiLFxuICAgIFwiIzU2QUVEQVwiLFxuICAgIFwiI0Y2QTExQVwiLFxuICAgIFwiI0ZGNEU0NlwiLFxuICAgIFwiIzhCOTVBN1wiLFxuICAgIFwiIzdCNjFGRlwiLFxuICAgIFwiIzJBQTFGRlwiLFxuICAgIFwiIzAwQzM4OVwiLFxuICAgIFwiI0Q5NzcwNlwiLFxuICAgIFwiI0VGNDQ0NFwiLFxuICAgIFwiIzBFQTVFOVwiLFxuICAgIFwiIzRGNDZFNVwiLFxuICAgIFwiIzMzNDE1NVwiLFxuICBdO1xuXG4gIHByaXZhdGUgc3RhdGljIGFkanVzdEhleENvbG9yKGhleDogc3RyaW5nLCBhbW91bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGhleC5yZXBsYWNlKFwiI1wiLCBcIlwiKS50cmltKCk7XG4gICAgaWYgKCFub3JtYWxpemVkKSByZXR1cm4gaGV4O1xuXG4gICAgY29uc3QgZXhwYW5kID1cbiAgICAgIG5vcm1hbGl6ZWQubGVuZ3RoID09PSAzXG4gICAgICAgID8gbm9ybWFsaXplZFxuICAgICAgICAgICAgLnNwbGl0KFwiXCIpXG4gICAgICAgICAgICAubWFwKChjaCkgPT4gY2ggKyBjaClcbiAgICAgICAgICAgIC5qb2luKFwiXCIpXG4gICAgICAgIDogbm9ybWFsaXplZDtcblxuICAgIGlmIChleHBhbmQubGVuZ3RoICE9PSA2KSByZXR1cm4gaGV4O1xuXG4gICAgY29uc3QgY2xhbXAgPSAodmFsdWU6IG51bWJlcikgPT4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSkpO1xuICAgIGNvbnN0IGNoYW5uZWxzID0gWzAsIDIsIDRdLm1hcCgob2Zmc2V0KSA9PlxuICAgICAgY2xhbXAocGFyc2VJbnQoZXhwYW5kLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgMiksIDE2KSArIGFtb3VudCksXG4gICAgKTtcblxuICAgIHJldHVybiBgIyR7Y2hhbm5lbHNcbiAgICAgIC5tYXAoKGNoYW5uZWwpID0+IGNoYW5uZWwudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSlcbiAgICAgIC5qb2luKFwiXCIpfWA7XG4gIH07XG5cbiAgcHJpdmF0ZSBnZXRTbGljZUJvcmRlckNvbG9yID0gKCk6IHN0cmluZyA9PlxuICAgIHRoaXMuc3RhdGUuaXNEYXJrVGhlbWUgPyBcIiMxZjIwMzBcIiA6IFwiI2ZmZmZmZlwiO1xuXG4gIHByaXZhdGUgZ2V0U2xpY2VGaWxsU3R5bGUgPSAoXG4gICAgYmFzZUNvbG9yOiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IHsgdHlwZTogXCJsaW5lYXJcIjsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHgyOiBudW1iZXI7IHkyOiBudW1iZXI7IGNvbG9yU3RvcHM6IEFycmF5PHsgb2Zmc2V0OiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfT4gfSA9PiB7XG4gICAgY29uc3QgY29sb3IgPSAoYmFzZUNvbG9yIHx8IFwiIzNiODJmNlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChjb2xvciA9PT0gXCIjRThFMUQxXCIgfHwgY29sb3IgPT09IFwiI2ZmZlwiKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgICB4MjogMSxcbiAgICAgICAgeTI6IDEsXG4gICAgICAgIGNvbG9yU3RvcHM6IFtcbiAgICAgICAgICB7IG9mZnNldDogMCwgY29sb3I6IFwiI2Y4ZmFmY1wiIH0sXG4gICAgICAgICAgeyBvZmZzZXQ6IDAuNTUsIGNvbG9yOiBcIiNkYmU0ZWVcIiB9LFxuICAgICAgICAgIHsgb2Zmc2V0OiAxLCBjb2xvcjogXCIjOTRhM2I4XCIgfSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHgyOiAxLFxuICAgICAgeTI6IDEsXG4gICAgICBjb2xvclN0b3BzOiBbXG4gICAgICAgIHsgb2Zmc2V0OiAwLCBjb2xvcjogQWdyaVBpZS5hZGp1c3RIZXhDb2xvcihiYXNlQ29sb3IsIDM0KSB9LFxuICAgICAgICB7IG9mZnNldDogMC40OCwgY29sb3I6IGJhc2VDb2xvciB9LFxuICAgICAgICB7IG9mZnNldDogMSwgY29sb3I6IEFncmlQaWUuYWRqdXN0SGV4Q29sb3IoYmFzZUNvbG9yLCAtMzApIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH07XG5cbiAgLy8gVGltaW5nL2Nvbm5lY3Rpb25cbiAgTUFYX0NPTk5FQ1RJT05fQVRURU1QVFMgPSAzO1xuICBDT05ORUNUSU9OX1RJTUVPVVRfTVMgPSAxNTAwMDtcblxuICBwcml2YXRlIG5vcm1hbGl6ZUxhbmd1YWdlID0gKHJhdz86IHN0cmluZyB8IG51bGwpOiBBZ3JpUGllU3RhdGVbXCJsYW5ndWFnZVwiXSA9PiB7XG4gICAgY29uc3QgdiA9IFN0cmluZyhyYXcgfHwgXCJcIilcbiAgICAgIC50cmltKClcbiAgICAgIC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgaWYgKHYgPT09IFwiZW5cIiB8fCB2ID09PSBcImVuZ2xpc2hcIikgcmV0dXJuIFwiZW5cIjtcbiAgICBpZiAodiA9PT0gXCJydVwiIHx8IHYgPT09IFwicnVzXCIgfHwgdiA9PT0gXCJydXNzaWFuXCIpIHJldHVybiBcInJ1XCI7XG4gICAgaWYgKFxuICAgICAgdiA9PT0gXCJ1el9jeXJcIiB8fFxuICAgICAgdiA9PT0gXCJ1ei1jeXJcIiB8fFxuICAgICAgdiA9PT0gXCJ1el9jeXJsXCIgfHxcbiAgICAgIHYgPT09IFwidXotY3lybFwiIHx8XG4gICAgICB2ID09PSBcInV6X2N5cmlsbGljXCIgfHxcbiAgICAgIHYgPT09IFwidXotY3lyaWxsaWNcIlxuICAgICkge1xuICAgICAgcmV0dXJuIFwidXpfY3lyXCI7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHYgPT09IFwidXpfbGF0XCIgfHxcbiAgICAgIHYgPT09IFwidXotbGF0XCIgfHxcbiAgICAgIHYgPT09IFwidXpfbGF0aW5cIiB8fFxuICAgICAgdiA9PT0gXCJ1ei1sYXRpblwiIHx8XG4gICAgICB2ID09PSBcInV6XCJcbiAgICApIHtcbiAgICAgIHJldHVybiBcInV6X2xhdFwiO1xuICAgIH1cblxuICAgIHJldHVybiBcInV6X2xhdFwiO1xuICB9O1xuXG4gIHByaXZhdGUgcmVzb2x2ZUluaXRpYWxMYW5ndWFnZSA9ICgpOiBBZ3JpUGllU3RhdGVbXCJsYW5ndWFnZVwiXSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGVuc3VyZUFncmkzVXpMYXRMYW5ndWFnZURlZmF1bHQoKTtcbiAgICAgIGNvbnN0IGZyb21VcmwgPVxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgPyBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldChcImxhbmdcIilcbiAgICAgICAgICA6IG51bGw7XG4gICAgICBjb25zdCBmcm9tU3RvcmFnZSA9XG4gICAgICAgIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICAgICA/IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYXBwX2xhbmdcIikgfHxcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiZXZhcG9fYXBwX2xhbmdcIikgfHxcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYWdyb19sYW5nXCIpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVMYW5ndWFnZShmcm9tVXJsIHx8IGZyb21TdG9yYWdlKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBcInV6X2xhdFwiO1xuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBBUE9TVFJPUEhFX1ZBUklBTlRTID0gW1wiJ1wiLCBcIidcIiwgXCInXCIsIFwiyrtcIiwgXCLKvFwiLCBcImBcIl07XG4gIHByaXZhdGUgX2xhdGVzdEtleSA9IFwiXCI7XG4gIHByaXZhdGUgX2RpZEluaXRPbmNlID0gZmFsc2U7XG5cbiAgLy8gVmlsb3lhdCBub3JtYWxpemVkIGtleSAtPiBpbmRleCBpbnRvIGBzdGF0ZS5mZWF0dXJlTGF5ZXJzYFxuICBwcml2YXRlIF92aWxveWF0S2V5VG9MYXllckluZGV4OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gIHByaXZhdGUgX2ZlYXR1cmVMYXllcnNJbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuXG4gIC8vIOKchSBORVc6IERlLWR1cGxpY2F0aW9uIGZvciBmZXRjaFxuICBwcml2YXRlIF9mZXRjaENvdW50ZXIgPSAwO1xuICBwcml2YXRlIF9sYXN0RmV0Y2hLZXkgPSBcIlwiO1xuICBwcml2YXRlIF9mZXRjaERlYm91bmNlVGltZXI6IGFueSA9IG51bGw7XG4gIHByaXZhdGUgX3BpZUNoYXJ0UmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICBwcml2YXRlIF9waWVDaGFydDogZWNoYXJ0cy5FQ2hhcnRzIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3BpZUNoYXJ0SG9zdEVsOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAvKiogQWZ0ZXIgZmlyc3QgcGFpbnQsIHN1YnNlcXVlbnQgb3B0aW9uIHVwZGF0ZXMgbW9ycGggbGlrZSBBZ3JvYmFuay4gKi9cbiAgcHJpdmF0ZSBfcGllSGFzUmVuZGVyZWQgPSBmYWxzZTtcbiAgLyoqIFN0YWJsZSBzbGljZSBrZXkgb3JkZXIgc28gcmVnaW9uIGNoYW5nZXMgbW9ycGggYXJjcyBpbiBwbGFjZS4gKi9cbiAgcHJpdmF0ZSBfcGllU3RhYmxlS2V5czogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfcGllU3RhYmxlUmF3S2V5czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAvKiogVHJ1ZSBvbmx5IGFmdGVyIGF0IGxlYXN0IG9uZSBjYXRlZ29yeSBmZXRjaCBmaW5pc2hlZCAoc3VjY2VzcyBvciBlbXB0eSkuICovXG4gIHByaXZhdGUgX2hhc0NvbXBsZXRlZEZldGNoID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IEFncmlQaWVQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIGNvbnN0IGluaXRpYWxMYW5ndWFnZSA9IHRoaXMucmVzb2x2ZUluaXRpYWxMYW5ndWFnZSgpO1xuXG4gICAgbGV0IGluaXRpYWxJc0RhcmtUaGVtZSA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkVGhlbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImFncmlfdjExX2FwcF90aGVtZVwiKTtcbiAgICAgIGluaXRpYWxJc0RhcmtUaGVtZSA9XG4gICAgICAgIHNhdmVkVGhlbWUgIT09IG51bGwgPyBzYXZlZFRoZW1lID09PSBcImRhcmtcIiA6IHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICBpbml0aWFsSXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgY2F0ZWdvcnlEYXRhOiB7IGNhdGVnb3JpZXM6IFtdLCB0b3RhbFZhbHVlOiAwIH0sXG5cbiAgICAgIHlpbDogXCJcIixcbiAgICAgIHZpbG95YXQ6IFwiXCIsXG4gICAgICBsb2NrZWRWaWxveWF0OiBcIlwiLFxuICAgICAgdHVtYW46IFwiXCIsXG4gICAgICB0dXJpOiBcIlwiLFxuICAgICAgdHVybGFyOiBbXSxcbiAgICAgIGZpbHRlclBpZUJ5Vmg6IGZhbHNlLFxuICAgICAgcGllVmhVbmlxdWVJZHNTaWc6IFwiXCIsXG4gICAgICB2aDogXCJcIixcbiAgICAgIGJhckNhdGVnb3J5RmllbGQ6IG51bGwsXG4gICAgICBiYXJDYXRlZ29yeVZhbHVlOiBudWxsLFxuXG4gICAgICBhY3RpdmVTbGljZTogbnVsbCxcbiAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IG51bGwsXG4gICAgICBzZWxlY3RlZENhdGVnb3JpZXM6IFtdLFxuICAgICAgaG92ZXJlZFNsaWNlOiBudWxsLFxuXG4gICAgICBhY3RpdmVNYXBWaWV3OiB1bmRlZmluZWQsXG5cbiAgICAgIGxhc3RGaWx0ZXJFdmVudFRpbWVzdGFtcDogMCxcbiAgICAgIGlzSGFuZGxpbmdFeHRlcm5hbEV2ZW50OiBmYWxzZSxcblxuICAgICAgbWFwQ29ubmVjdGlvbkF0dGVtcHRzOiAwLFxuICAgICAgbWFwTG9hZGluZ1N0YXR1czogXCJpZGxlXCIsXG4gICAgICBjb25uZWN0aW9uU3RhdHVzOiBcImlkbGVcIixcblxuICAgICAgZGF0YVNvdXJjZTogdW5kZWZpbmVkLFxuXG4gICAgICBmZWF0dXJlTGF5ZXJzOiBbXSxcbiAgICAgIGFjdGl2ZUZlYXR1cmVMYXllcjogdW5kZWZpbmVkLFxuXG4gICAgICBkZWJ1Z0luZm86IFwiV2lkZ2V0IGluaXRpYWxpemluZ1wiLFxuICAgICAgbGFuZ3VhZ2U6IGluaXRpYWxMYW5ndWFnZSxcbiAgICAgIGlzRGFya1RoZW1lOiBpbml0aWFsSXNEYXJrVGhlbWUsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZVRoZW1lID0gKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZFRoZW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJhZ3JpX3YxMV9hcHBfdGhlbWVcIik7XG4gICAgICBjb25zdCBpc0RhcmtUaGVtZSA9XG4gICAgICAgIHNhdmVkVGhlbWUgIT09IG51bGwgPyBzYXZlZFRoZW1lID09PSBcImRhcmtcIiA6IHRydWU7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNEYXJrVGhlbWUgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNEYXJrVGhlbWU6IHRydWUgfSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlVGhlbWVUb2dnbGVkID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IGQ6IGFueSA9IChldmVudCBhcyBDdXN0b21FdmVudCk/LmRldGFpbCB8fCB7fTtcbiAgICBpZiAodHlwZW9mIGQuaXNEYXJrVGhlbWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNEYXJrVGhlbWU6IGQuaXNEYXJrVGhlbWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGQudGhlbWUgPT09IFwiZGFya1wiIHx8IGQudGhlbWUgPT09IFwibGlnaHRcIikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lOiBkLnRoZW1lID09PSBcImRhcmtcIiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYWdyaV92MTFfYXBwX3RoZW1lXCIpO1xuICAgICAgY29uc3QgaXNEYXJrVGhlbWUgPVxuICAgICAgICBzYXZlZFRoZW1lICE9PSBudWxsID8gc2F2ZWRUaGVtZSA9PT0gXCJkYXJrXCIgOiB0cnVlO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lOiB0cnVlIH0pO1xuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIGhhbmRsZUxhbmd1YWdlQ2hhbmdlID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgY29uc3QgZDogYW55ID0gKGV2ZW50IGFzIEN1c3RvbUV2ZW50KT8uZGV0YWlsIHx8IHt9O1xuICAgIGNvbnN0IHJhdyA9IGQubGFuZyA/PyBkLmxhbmd1YWdlID8/IGQuY29kZTtcbiAgICBjb25zdCBuZXh0ID0gdGhpcy5ub3JtYWxpemVMYW5ndWFnZShyYXcpO1xuICAgIGlmIChuZXh0ID09PSB0aGlzLnN0YXRlLmxhbmd1YWdlKSByZXR1cm47XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGxhbmd1YWdlOiBuZXh0IH0pO1xuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0gRFMgaGVscGVycyAtLS0tLS0tLS0tICovXG5cbiAgb25EYXRhU291cmNlQ3JlYXRlZCA9IChkczogRGF0YVNvdXJjZSkgPT4ge1xuICAgIGNvbnN0IHF1ZXJpYWJsZURzID0gZHMgYXMgUXVlcmlhYmxlRGF0YVNvdXJjZTtcblxuICAgIGlmICh0eXBlb2YgKHF1ZXJpYWJsZURzIGFzIGFueSkuc2V0TGlzdGVuU2VsZWN0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIChxdWVyaWFibGVEcyBhcyBhbnkpLnNldExpc3RlblNlbGVjdGlvbihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoeyBkYXRhU291cmNlOiBxdWVyaWFibGVEcywgZXJyb3I6IG51bGwgfSwgYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuY29ubmVjdGlvblN0YXR1cyA9PT0gXCJjb25uZWN0ZWRcIikge1xuICAgICAgICBhd2FpdCB0aGlzLmZldGNoQ2F0ZWdvcnlEYXRhKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgb25EYXRhU291cmNlSW5mb0NoYW5nZSA9IChpbmZvOiBhbnkpID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnN0YXRlLmNvbm5lY3Rpb25TdGF0dXMgIT09IFwiY29ubmVjdGVkXCIpIHJldHVybjtcbiAgICBpZiAoIWluZm8pIHJldHVybjtcblxuICAgIGNvbnN0IHNhd1JlY29yZHMgPSBBcnJheS5pc0FycmF5KGluZm8ucmVjb3Jkcyk7XG4gICAgaWYgKCFzYXdSZWNvcmRzKSByZXR1cm47XG5cbiAgICB0aGlzLmZldGNoQ2F0ZWdvcnlEYXRhKCk7XG4gIH07XG5cbiAgZmluZEZpZWxkQnlQb3NzaWJsZU5hbWVzKHBvc3NpYmxlTmFtZXM6IHN0cmluZ1tdKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgeyBkYXRhU291cmNlIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghZGF0YVNvdXJjZSkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBzY2hlbWEgPSBkYXRhU291cmNlLmdldFNjaGVtYSgpO1xuICAgIGlmICghc2NoZW1hIHx8ICFzY2hlbWEuZmllbGRzKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGZpZWxkTmFtZXMgPSBPYmplY3Qua2V5cyhzY2hlbWEuZmllbGRzKS5tYXAoKGYpID0+IGYudG9Mb3dlckNhc2UoKSk7XG5cbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgcG9zc2libGVOYW1lcykge1xuICAgICAgY29uc3QgZXhhY3QgPSBmaWVsZE5hbWVzLmZpbmRJbmRleCgoZikgPT4gZiA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmIChleGFjdCAhPT0gLTEpIHJldHVybiBPYmplY3Qua2V5cyhzY2hlbWEuZmllbGRzKVtleGFjdF07XG4gICAgfVxuICAgIGZvciAoY29uc3QgbmFtZSBvZiBwb3NzaWJsZU5hbWVzKSB7XG4gICAgICBjb25zdCBwYXJ0aWFsID0gZmllbGROYW1lcy5maW5kSW5kZXgoKGYpID0+XG4gICAgICAgIGYuaW5jbHVkZXMobmFtZS50b0xvd2VyQ2FzZSgpKSxcbiAgICAgICk7XG4gICAgICBpZiAocGFydGlhbCAhPT0gLTEpIHJldHVybiBPYmplY3Qua2V5cyhzY2hlbWEuZmllbGRzKVtwYXJ0aWFsXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmaW5kQ2F0ZWdvcnlGaWVsZChmbE92ZXJyaWRlPzogX19lc3JpLkZlYXR1cmVMYXllciB8IG51bGwpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAvLyBFeGFjdCBuYW1lcyBvbmx5IOKAlCBwYXJ0aWFsIFwidHVyXCIgdXNlZCB0byBtYXRjaCBgdHVtYW5gLlxuICAgIGNvbnN0IHBvc3NpYmxlID0gW1widHVyaVwiLCBcImVraW5fdHVyaVwiLCBcImNyb3BfdHlwZVwiXTtcblxuICAgIGNvbnN0IGZsID0gZmxPdmVycmlkZSA/PyB0aGlzLnN0YXRlLmFjdGl2ZUZlYXR1cmVMYXllcjtcbiAgICBjb25zdCBmaWVsZHMgPSBmbD8uZmllbGRzID8/IFtdO1xuICAgIGlmIChmaWVsZHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBieUxvd2VyID0gbmV3IE1hcChcbiAgICAgICAgZmllbGRzLm1hcCgoZjogYW55KSA9PiBbU3RyaW5nKGYubmFtZSkudG9Mb3dlckNhc2UoKSwgZi5uYW1lXSksXG4gICAgICApO1xuICAgICAgZm9yIChjb25zdCBwIG9mIHBvc3NpYmxlKSB7XG4gICAgICAgIGNvbnN0IGV4YWN0ID0gYnlMb3dlci5nZXQocC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgaWYgKGV4YWN0KSByZXR1cm4gZXhhY3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZnJvbURTID0gdGhpcy5maW5kRmllbGRCeVBvc3NpYmxlTmFtZXMocG9zc2libGUpO1xuICAgIGlmIChmcm9tRFMpIHJldHVybiBmcm9tRFM7XG5cbiAgICByZXR1cm4gXCJ0dXJpXCI7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkV2hlcmVDbGF1c2VGb3JEUyhcbiAgICBvcHRzOiB7IGluY2x1ZGVDYXRlZ29yeT86IGJvb2xlYW47IGluY2x1ZGVWaWxveWF0PzogYm9vbGVhbiB9ID0ge30sXG4gICk6IHN0cmluZyB7XG4gICAgY29uc3QgaW5jbHVkZUNhdGVnb3J5ID0gb3B0cy5pbmNsdWRlQ2F0ZWdvcnkgIT09IGZhbHNlO1xuICAgIGNvbnN0IGluY2x1ZGVWaWxveWF0ID0gb3B0cy5pbmNsdWRlVmlsb3lhdCAhPT0gZmFsc2U7XG4gICAgLy8gTWF0Y2ggQWdyb193aWRnZXRWMTogc2NvcGUgYnkgc2VsZWN0ZWQgdmlsb3lhdCAobm90IGxvY2tlZFZpbG95YXQpXG4gICAgLy8gd2hlbiBpbmNsdWRlVmlsb3lhdCBpcyBvbjsgbGF5ZXIgcm91dGluZyBoYW5kbGVzIHJlZ2lvbiBsYXllcnMuXG4gICAgY29uc3QgeyB5aWwsIHZpbG95YXQsIHR1bWFuLCB0dXJpLCBsb2NrZWRWaWxveWF0IH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGNsYXVzZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgc2NvcGVWaWxveWF0ID0gU3RyaW5nKHZpbG95YXQgfHwgbG9ja2VkVmlsb3lhdCB8fCBcIlwiKS50cmltKCk7XG5cbiAgICBpZiAoaW5jbHVkZVZpbG95YXQgJiYgc2NvcGVWaWxveWF0KVxuICAgICAgY2xhdXNlcy5wdXNoKHRoaXMuZXFBcG9zU21hcnQoXCJ2aWxveWF0XCIsIHNjb3BlVmlsb3lhdCkpO1xuICAgIC8vIEluIGRlZmF1bHQgcmVwdWJsaWMgbW9kZSAobm8gdmlsb3lhdCksIGlnbm9yZSBzdGFsZSB0dW1hbiBmaWx0ZXIuXG4gICAgaWYgKHR1bWFuICYmIGluY2x1ZGVWaWxveWF0ICYmIHNjb3BlVmlsb3lhdClcbiAgICAgIGNsYXVzZXMucHVzaCh0aGlzLmVxQXBvc1NtYXJ0KFwidHVtYW5cIiwgdHVtYW4pKTtcblxuICAgIGlmICh5aWwpIHtcbiAgICAgIGNvbnN0IHlEaWdpdHMgPVxuICAgICAgICBTdHJpbmcoeWlsKS5tYXRjaCgvXFxiKDE4fDE5fDIwKVxcZHsyfVxcYi8pPy5bMF0gPz9cbiAgICAgICAgU3RyaW5nKHlpbCkucmVwbGFjZSgvW15cXGRdL2csIFwiXCIpO1xuXG4gICAgICBjbGF1c2VzLnB1c2goXG4gICAgICAgIHlEaWdpdHNcbiAgICAgICAgICA/IGB5aWwgTElLRSAnJHt5RGlnaXRzfSUnYFxuICAgICAgICAgIDogYHlpbCBMSUtFICclJHtlc2NhcGVBcmNHSVMoU3RyaW5nKHlpbCkpfSUnYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8g4pyFIEZJWDogYWx3YXlzIHVzZSBcInR1cmlcIlxuICAgIGlmIChpbmNsdWRlQ2F0ZWdvcnkgJiYgdHVyaSkge1xuICAgICAgY2xhdXNlcy5wdXNoKHRoaXMuZXFBcG9zU21hcnQoXCJ0dXJpXCIsIHR1cmkpKTtcbiAgICB9XG5cbiAgICAvLyBWSCB1bmlxdWVpZHMgYXJlIGFwcGxpZWQgYXMgY2h1bmtlZCBxdWVyaWVzIGluIF9kb0ZldGNoQ2F0ZWdvcnlEYXRhXG4gICAgLy8gKG5vdCBpbmxpbmVkIGhlcmUg4oCUIGEgc2luZ2xlIGh1Z2UgT1Igb2YgSU4oLi4uKSBibG93cyBHRVQgVVJMIGxpbWl0cykuXG5cbiAgICByZXR1cm4gd2l0aEV2YXBvQWNjZXNzV2hlcmUoY2xhdXNlcy5sZW5ndGggPyBjbGF1c2VzLmpvaW4oXCIgQU5EIFwiKSA6IFwiMT0xXCIpO1xuICB9XG5cbiAgLyoqIFdIRVJFIGZyYWdtZW50cyBmb3IgVkjihpJwaWUgdW5pcXVlaWQgZmlsdGVyIChlbXB0eSA9IG5vIFZIIHNjb3BlKS4gKi9cbiAgcHJpdmF0ZSBidWlsZFBpZVZoV2hlcmVDaHVua3MoKTogc3RyaW5nW10gfCBudWxsIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZmlsdGVyUGllQnlWaCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgaWRzID0gZ2V0UGllVmhGaWx0ZXJVbmlxdWVJZHMoKTtcbiAgICBpZiAoIWlkcykgcmV0dXJuIG51bGw7XG4gICAgaWYgKCFpZHMubGVuZ3RoKSByZXR1cm4gW1wiMT0wXCJdO1xuICAgIGNvbnN0IENIVU5LID0gODAwO1xuICAgIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlkcy5sZW5ndGg7IGkgKz0gQ0hVTkspIHtcbiAgICAgIGNodW5rcy5wdXNoKGJ1aWxkU3BhdGlhbEpvaW5XaGVyZShpZHMuc2xpY2UoaSwgaSArIENIVU5LKSkpO1xuICAgIH1cbiAgICByZXR1cm4gY2h1bmtzO1xuICB9XG5cbiAgLyogLS0tLS0tLS0tLSBOb3JtYWxpemUgLyBFc2NhcGUgLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgbm9ybWFsaXplTmFtZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghcykgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIHNcbiAgICAgIC5ub3JtYWxpemUoXCJORktDXCIpXG4gICAgICAucmVwbGFjZSgvXFx1MDBBMC9nLCBcIiBcIilcbiAgICAgIC5yZXBsYWNlKC9bJycnyrvKvGBdL2csIFwiJ1wiKVxuICAgICAgLnJlcGxhY2UoL1xccysvZywgXCIgXCIpXG4gICAgICAudHJpbSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDcm9wQ29sb3IocmF3S2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IGsgPSB0aGlzLm5vcm1hbGl6ZU5hbWUocmF3S2V5KS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGhpdCA9IEFncmlQaWUuQ1JPUF9DT0xPUl9NQVBba107XG4gICAgaWYgKGhpdCkgcmV0dXJuIGhpdDtcbiAgICByZXR1cm4gKFxuICAgICAgQWdyaVBpZS5GQUxMQkFDS19DT0xPUlNbaW5kZXggJSBBZ3JpUGllLkZBTExCQUNLX0NPTE9SUy5sZW5ndGhdID8/XG4gICAgICBcIiMxRTdBRTZcIlxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdldENhdGVnb3J5RGlzcGxheU5hbWUoXG4gICAgcmF3S2V5OiBzdHJpbmcsXG4gICAgbGFuZ3VhZ2U6IFwidXpfY3lyXCIgfCBcInV6X2xhdFwiIHwgXCJydVwiIHwgXCJlblwiLFxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IGtleSA9IHRoaXMubm9ybWFsaXplTmFtZShyYXdLZXkpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBjb25zdCBsYWJlbHM6IFJlY29yZDxcbiAgICAgIHN0cmluZyxcbiAgICAgIHsgdXpfY3lyOiBzdHJpbmc7IHV6X2xhdDogc3RyaW5nOyBydTogc3RyaW5nOyBlbjogc3RyaW5nIH1cbiAgICA+ID0ge1xuICAgICAgc2hvbGk6IHsgdXpfY3lyOiBcItCo0L7Qu9C4XCIsIHV6X2xhdDogXCJTaG9saVwiLCBydTogXCLQoNC40YFcIiwgZW46IFwiUmljZVwiIH0sXG4gICAgICBwYXh0YTogeyB1el9jeXI6IFwi0J/QsNGF0YLQsFwiLCB1el9sYXQ6IFwiUGF4dGFcIiwgcnU6IFwi0KXQu9C+0L/QvtC6XCIsIGVuOiBcIkNvdHRvblwiIH0sXG4gICAgICBtYWtrYTogeyB1el9jeXI6IFwi0JzQsNC60LrQsFwiLCB1el9sYXQ6IFwiTWFra2FcIiwgcnU6IFwi0JrRg9C60YPRgNGD0LfQsFwiLCBlbjogXCJDb3JuXCIgfSxcbiAgICAgIFwibWFra2Fqbyd4b3JpXCI6IHsgdXpfY3lyOiBcItCc0LDQutC60LDQttGe0YXQvtGA0LhcIiwgdXpfbGF0OiBcIk1ha2tham8neG9yaVwiLCBydTogXCLQmtGD0LrRg9GA0YPQt9CwXCIsIGVuOiBcIkNvcm5cIiB9LFxuICAgICAgbWFra2Fqb3hvcmk6IHsgdXpfY3lyOiBcItCc0LDQutC60LDQttGe0YXQvtGA0LhcIiwgdXpfbGF0OiBcIk1ha2tham8neG9yaVwiLCBydTogXCLQmtGD0LrRg9GA0YPQt9CwXCIsIGVuOiBcIkNvcm5cIiB9LFxuICAgICAgXCJidWcnZG95XCI6IHsgdXpfY3lyOiBcItCR0YPSk9C00L7QuVwiLCB1el9sYXQ6IFwiQnVnJ2RveVwiLCBydTogXCLQn9GI0LXQvdC40YbQsFwiLCBlbjogXCJXaGVhdFwiIH0sXG4gICAgICBidWdkb3k6IHsgdXpfY3lyOiBcItCR0YPSk9C00L7QuVwiLCB1el9sYXQ6IFwiQnVnJ2RveVwiLCBydTogXCLQn9GI0LXQvdC40YbQsFwiLCBlbjogXCJXaGVhdFwiIH0sXG4gICAgICBtb3NoOiB7IHV6X2N5cjogXCLQnNC+0YhcIiwgdXpfbGF0OiBcIk1vc2hcIiwgcnU6IFwi0JzQsNGIXCIsIGVuOiBcIk11bmcgYmVhblwiIH0sXG4gICAgICBiZWRhOiB7IHV6X2N5cjogXCLQkdC10LTQsFwiLCB1el9sYXQ6IFwiQmVkYVwiLCBydTogXCLQm9GO0YbQtdGA0L3QsFwiLCBlbjogXCJBbGZhbGZhXCIgfSxcbiAgICAgIG96dXFhOiB7IHV6X2N5cjogXCLQntC30YPSm9CwXCIsIHV6X2xhdDogXCJPenVxYVwiLCBydTogXCLQmtC+0YDQvNC+0LLRi9C1XCIsIGVuOiBcIkZvZGRlclwiIH0sXG4gICAgICBsb3ZpeWE6IHsgdXpfY3lyOiBcItCb0L7QstC40Y9cIiwgdXpfbGF0OiBcIkxvdml5YVwiLCBydTogXCLQpNCw0YHQvtC70YxcIiwgZW46IFwiQmVhbnNcIiB9LFxuICAgICAgcG9saXo6IHsgdXpfY3lyOiBcItCf0L7Qu9C40LdcIiwgdXpfbGF0OiBcIlBvbGl6XCIsIHJ1OiBcItCR0LDRhdGH0LXQstGL0LVcIiwgZW46IFwiTWVsb25zXCIgfSxcbiAgICAgIHRhcmlxOiB7IHV6X2N5cjogXCLQotCw0YDQuNKbXCIsIHV6X2xhdDogXCJUYXJpcVwiLCBydTogXCLQn9GA0L7RgdC+XCIsIGVuOiBcIk1pbGxldFwiIH0sXG4gICAgICBcImJvZydcIjogeyB1el9jeXI6IFwi0JHQvtKTXCIsIHV6X2xhdDogXCJCb2cnXCIsIHJ1OiBcItCh0LDQtFwiLCBlbjogXCJPcmNoYXJkXCIgfSxcbiAgICAgIGJvZzogeyB1el9jeXI6IFwi0JHQvtKTXCIsIHV6X2xhdDogXCJCb2cnXCIsIHJ1OiBcItCh0LDQtFwiLCBlbjogXCJPcmNoYXJkXCIgfSxcbiAgICAgIGJvZ2k6IHsgdXpfY3lyOiBcItCR0L7Sk1wiLCB1el9sYXQ6IFwiQm9nJ1wiLCBydTogXCLQodCw0LRcIiwgZW46IFwiT3JjaGFyZFwiIH0sXG4gICAgICBcImJvZydsYXJcIjogeyB1el9jeXI6IFwi0JHQvtKT0LvQsNGAXCIsIHV6X2xhdDogXCJCb2cnbGFyXCIsIHJ1OiBcItCh0LDQtNGLXCIsIGVuOiBcIk9yY2hhcmRzXCIgfSxcbiAgICAgIFwieWVyeW9uZydvcVwiOiB7IHV6X2N5cjogXCLQldGA0ZHQvdKT0L7Sm1wiLCB1el9sYXQ6IFwiWWVyeW9uZydvcVwiLCBydTogXCLQkNGA0LDRhdC40YFcIiwgZW46IFwiUGVhbnV0XCIgfSxcbiAgICAgIHllcnlvbmdvcTogeyB1el9jeXI6IFwi0JXRgNGR0L3Sk9C+0ptcIiwgdXpfbGF0OiBcIlllcnlvbmcnb3FcIiwgcnU6IFwi0JDRgNCw0YXQuNGBXCIsIGVuOiBcIlBlYW51dFwiIH0sXG4gICAgICBcInllciB5b25nJ29xXCI6IHsgdXpfY3lyOiBcItCV0YDRkdC90pPQvtKbXCIsIHV6X2xhdDogXCJZZXIgeW9uZydvcVwiLCBydTogXCLQkNGA0LDRhdC40YFcIiwgZW46IFwiUGVhbnV0XCIgfSxcbiAgICAgIHNhYnppOiB7IHV6X2N5cjogXCLQodCw0LHQt9C4XCIsIHV6X2xhdDogXCJTYWJ6aVwiLCBydTogXCLQnNC+0YDQutC+0LLRjFwiLCBlbjogXCJDYXJyb3RcIiB9LFxuICAgICAga3VuZ2Fib3FhcjogeyB1el9jeXI6IFwi0JrRg9C90LPQsNCx0L7Sm9Cw0YBcIiwgdXpfbGF0OiBcIkt1bmdhYm9xYXJcIiwgcnU6IFwi0J/QvtC00YHQvtC70L3QtdGH0L3QuNC6XCIsIGVuOiBcIlN1bmZsb3dlclwiIH0sXG4gICAgICBiYWxpcXhvdnV6OiB7IHV6X2N5cjogXCLQkdCw0LvQuNKb0rPQvtCy0YPQt1wiLCB1el9sYXQ6IFwiQmFsaXF4b3Z1elwiLCBydTogXCLQoNGL0LHQvdGL0Lkg0L/RgNGD0LRcIiwgZW46IFwiRmlzaCBwb25kXCIgfSxcbiAgICAgIFwiYmFsaXEgaG92dXpcIjogeyB1el9jeXI6IFwi0JHQsNC70LjSmyDSs9C+0LLRg9C3XCIsIHV6X2xhdDogXCJCYWxpcSBob3Z1elwiLCBydTogXCLQoNGL0LHQvdGL0Lkg0L/RgNGD0LRcIiwgZW46IFwiRmlzaCBwb25kXCIgfSxcbiAgICAgIGJvc2hxYTogeyB1el9jeXI6IFwi0JHQvtGI0pvQsFwiLCB1el9sYXQ6IFwiQm9zaHFhXCIsIHJ1OiBcItCU0YDRg9Cz0L7QtVwiLCBlbjogXCJPdGhlclwiIH0sXG4gICAgICBpc3NpcXhvbmE6IHsgdXpfY3lyOiBcItCY0YHRgdC40pvRhdC+0L3QsFwiLCB1el9sYXQ6IFwiSXNzaXF4b25hXCIsIHJ1OiBcItCi0LXQv9C70LjRhtCwXCIsIGVuOiBcIkdyZWVuaG91c2VcIiB9LFxuICAgIH07XG5cbiAgICBjb25zdCBoaXQgPSBsYWJlbHNba2V5XTtcbiAgICBpZiAoIWhpdCkgcmV0dXJuIHJhd0tleTtcbiAgICByZXR1cm4gaGl0W2xhbmd1YWdlXSB8fCByYXdLZXk7XG4gIH1cblxuICBwcml2YXRlIG1ha2VBcG9zVmFyaWFudHMoczogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGJhc2UgPSB0aGlzLm5vcm1hbGl6ZU5hbWUocyk7XG4gICAgaWYgKCFiYXNlKSByZXR1cm4gW1wiXCJdO1xuICAgIGlmICghYmFzZS5pbmNsdWRlcyhcIidcIikpIHJldHVybiBbYmFzZV07XG5cbiAgICBjb25zdCBtYXNrID0gYmFzZS5yZXBsYWNlKC8nL2csIFwiXFx1RkZGRlwiKTtcbiAgICBjb25zdCB2YXJpYW50cyA9IEFncmlQaWUuQVBPU1RST1BIRV9WQVJJQU5UUy5tYXAoKGNoKSA9PlxuICAgICAgbWFzay5zcGxpdChcIlxcdUZGRkZcIikuam9pbihjaCksXG4gICAgKTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHZhcmlhbnRzKSk7XG4gIH1cblxuICBwcml2YXRlIGVxQXBvc1NtYXJ0KGZpZWxkOiBzdHJpbmcsIHJhdzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB2YXJpYW50cyA9IHRoaXMubWFrZUFwb3NWYXJpYW50cyhyYXcpO1xuICAgIGNvbnN0IGNsYXVzZXMgPSB2YXJpYW50c1xuICAgICAgLmZpbHRlcigodikgPT4gdilcbiAgICAgIC5tYXAoKHYpID0+IGAke2ZpZWxkfT0nJHtlc2NhcGVBcmNHSVModil9J2ApO1xuICAgIGlmICghY2xhdXNlcy5sZW5ndGgpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBjbGF1c2VzLmxlbmd0aCA9PT0gMSA/IGNsYXVzZXNbMF0gOiBgKCR7Y2xhdXNlcy5qb2luKFwiIE9SIFwiKX0pYDtcbiAgfVxuICBwcml2YXRlIG1ha2VWaWxveWF0S2V5KHJhdzogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gICAgaWYgKHJhdyA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVOYW1lKFN0cmluZyhyYXcpKVxuICAgICAgLnJlcGxhY2UoL1snyrvKvGDCtF0vZywgXCJcIilcbiAgICAgIC5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKVxuICAgICAgLnRyaW0oKVxuICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBwcml2YXRlIGlzUmVwdWJsaWNMYXllciA9IChsYXllcj86IF9fZXNyaS5GZWF0dXJlTGF5ZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIWxheWVyKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdGV4dCA9XG4gICAgICBgJHsobGF5ZXIgYXMgYW55KT8udGl0bGUgfHwgXCJcIn0gJHsobGF5ZXIgYXMgYW55KT8uaWQgfHwgXCJcIn0gJHsobGF5ZXIgYXMgYW55KT8udXJsIHx8IFwiXCJ9YC50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiAvXFxicmVwdWJsaWNcXGJ8cmVzcHVibGlrYS8udGVzdCh0ZXh0KTtcbiAgfTtcblxuICBwcml2YXRlIGdldERlZmF1bHRGZWF0dXJlTGF5ZXIgPSAoXG4gICAgbGF5ZXJzT3ZlcnJpZGU/OiBfX2VzcmkuRmVhdHVyZUxheWVyW10sXG4gICk6IF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCB1bmRlZmluZWQgPT4ge1xuICAgIGNvbnN0IGxheWVycyA9XG4gICAgICAobGF5ZXJzT3ZlcnJpZGUgJiYgbGF5ZXJzT3ZlcnJpZGUubGVuZ3RoXG4gICAgICAgID8gbGF5ZXJzT3ZlcnJpZGVcbiAgICAgICAgOiB0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnMpIHx8IFtdO1xuICAgIGlmICghbGF5ZXJzLmxlbmd0aCkgcmV0dXJuIHRoaXMuc3RhdGUuYWN0aXZlRmVhdHVyZUxheWVyO1xuXG4gICAgY29uc3QgcmVwdWJsaWMgPSBsYXllcnMuZmluZCgobCkgPT4gdGhpcy5pc1JlcHVibGljTGF5ZXIobCkpO1xuICAgIGlmIChyZXB1YmxpYykgcmV0dXJuIHJlcHVibGljO1xuXG4gICAgcmV0dXJuIGxheWVyc1swXSB8fCB0aGlzLnN0YXRlLmFjdGl2ZUZlYXR1cmVMYXllcjtcbiAgfTtcblxuICBwcml2YXRlIGdldEZlYXR1cmVMYXllckZvclZpbG95YXQgPSAoXG4gICAgdmlsb3lhdDogc3RyaW5nLFxuICApOiBfX2VzcmkuRmVhdHVyZUxheWVyIHwgdW5kZWZpbmVkID0+IHtcbiAgICBjb25zdCBsYXllcnMgPSB0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnMgPz8gW107XG4gICAgaWYgKCFsYXllcnMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGtleSA9IHRoaXMubWFrZVZpbG95YXRLZXkodmlsb3lhdCk7XG4gICAgaWYgKCFrZXkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5fdmlsb3lhdEtleVRvTGF5ZXJJbmRleFtrZXldO1xuICAgIGlmICh0eXBlb2YgaWR4ID09PSBcIm51bWJlclwiICYmIGxheWVyc1tpZHhdKSByZXR1cm4gbGF5ZXJzW2lkeF07XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuYWN0aXZlRmVhdHVyZUxheWVyIHx8IGxheWVyc1swXTtcbiAgfTtcblxuICBwcml2YXRlIHJlc29sdmVGZWF0dXJlTGF5ZXJzRnJvbVVzZURhdGFTb3VyY2VzID0gYXN5bmMgKCk6IFByb21pc2U8XG4gICAgX19lc3JpLkZlYXR1cmVMYXllcltdXG4gID4gPT4ge1xuICAgIC8vIEFncmlfdGFibGVfZGF0YSBpcyBhbiBleHRlcm5hbCBUYWJsZSwgbm90IGEgYnVpbGRlci1hc3NpZ25lZCBEYXRhXG4gICAgLy8gU291cmNlIG9yIGEgbWFwIGxheWVyIOKAlCBpdCBpcyBsb2FkZWQgZGlyZWN0bHkgYnkgVVJMLlxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGxheWVyIH0gPSBhd2FpdCBnZXRBZ3JpVGFibGVEYXRhTGF5ZXIoKTtcbiAgICAgIHJldHVybiBbbGF5ZXIgYXMgX19lc3JpLkZlYXR1cmVMYXllcl07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfTtcblxuICAvLyByZXNvbHZlRmVhdHVyZUxheWVyc0Zyb21Vc2VEYXRhU291cmNlcygpIGFsd2F5cyByZXNvbHZlcyBleGFjdGx5IG9uZVxuICAvLyBzaGFyZWQgQWdyaV90YWJsZV9kYXRhIGxheWVyLCBzbyBldmVyeSB2aWxveWF0IG1hcHMgdG8gaW5kZXggMCBhbnl3YXlcbiAgLy8gKHNhbWUgYXMgdGhlIGxheWVyc1swXSBmYWxsYmFjayBpbiBnZXRGZWF0dXJlTGF5ZXJGb3JWaWxveWF0KSDigJQgbm9cbiAgLy8gZGlzdGluY3Qtdmlsb3lhdCBzY2FuIGlzIG5lZWRlZDsgdXNlIHRoZSBhbHJlYWR5LXNoYXJlZC9jYWNoZWQgcmVnaW9uXG4gIC8vIG1hcHBpbmcgb25seSBpZiBtdWx0aXBsZSBsYXllcnMgZXZlciBhcHBlYXIuXG4gIHByaXZhdGUgYnVpbGRWaWxveWF0S2V5VG9MYXllckluZGV4ID0gYXN5bmMgKFxuICAgIGxheWVyczogX19lc3JpLkZlYXR1cmVMYXllcltdLFxuICApOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0aGlzLl92aWxveWF0S2V5VG9MYXllckluZGV4ID0ge307XG4gICAgaWYgKGxheWVycy5sZW5ndGggPD0gMSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVnaW9uRGlzdHJpY3RSb3dzIH0gPSBhd2FpdCBnZXRBZ3JpRGFzaGJvYXJkQm9vdHN0cmFwKCk7XG4gICAgICBmb3IgKGNvbnN0IHJvdyBvZiByZWdpb25EaXN0cmljdFJvd3MpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5tYWtlVmlsb3lhdEtleShyb3cudmlsb3lhdCk7XG4gICAgICAgIGlmIChrZXkgJiYgdGhpcy5fdmlsb3lhdEtleVRvTGF5ZXJJbmRleFtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl92aWxveWF0S2V5VG9MYXllckluZGV4W2tleV0gPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfTtcblxuICBwcml2YXRlIGVuc3VyZUZlYXR1cmVMYXllcnNSZXNvbHZlZCA9IGFzeW5jICgpOiBQcm9taXNlPFxuICAgIF9fZXNyaS5GZWF0dXJlTGF5ZXIgfCB1bmRlZmluZWRcbiAgPiA9PiB7XG4gICAgLy8gQWxyZWFkeSByZXNvbHZlZDogc3RpbGwgbmVlZCB0byByZS1yb3V0ZSB0byB0aGUgY29ycmVjdCBsYXllciBmb3IgY3VycmVudCB2aWxveWF0XG4gICAgaWYgKCh0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnM/Lmxlbmd0aCA/PyAwKSA+IDApIHtcbiAgICAgIGNvbnN0IG5leHRBY3RpdmUgPSB0aGlzLnN0YXRlLnZpbG95YXRcbiAgICAgICAgPyB0aGlzLmdldEZlYXR1cmVMYXllckZvclZpbG95YXQodGhpcy5zdGF0ZS52aWxveWF0KVxuICAgICAgICA6IHRoaXMuZ2V0RGVmYXVsdEZlYXR1cmVMYXllcih0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnMpO1xuXG4gICAgICBpZiAobmV4dEFjdGl2ZSAmJiB0aGlzLnN0YXRlLmFjdGl2ZUZlYXR1cmVMYXllcj8uaWQgIT09IG5leHRBY3RpdmUuaWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZUZlYXR1cmVMYXllcjogbmV4dEFjdGl2ZSB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5leHRBY3RpdmU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9mZWF0dXJlTGF5ZXJzSW5pdFByb21pc2UpIHtcbiAgICAgIHRoaXMuX2ZlYXR1cmVMYXllcnNJbml0UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxheWVycyA9IGF3YWl0IHRoaXMucmVzb2x2ZUZlYXR1cmVMYXllcnNGcm9tVXNlRGF0YVNvdXJjZXMoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZlYXR1cmVMYXllcnM6IGxheWVycyB9KTtcblxuICAgICAgICBhd2FpdCB0aGlzLmJ1aWxkVmlsb3lhdEtleVRvTGF5ZXJJbmRleChsYXllcnMpO1xuICAgICAgfSkoKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl9mZWF0dXJlTGF5ZXJzSW5pdFByb21pc2U7XG5cbiAgICBjb25zdCBuZXh0QWN0aXZlID0gdGhpcy5zdGF0ZS52aWxveWF0XG4gICAgICA/IHRoaXMuZ2V0RmVhdHVyZUxheWVyRm9yVmlsb3lhdCh0aGlzLnN0YXRlLnZpbG95YXQpXG4gICAgICA6IHRoaXMuZ2V0RGVmYXVsdEZlYXR1cmVMYXllcih0aGlzLnN0YXRlLmZlYXR1cmVMYXllcnMpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZUZlYXR1cmVMYXllcjogbmV4dEFjdGl2ZSB9KTtcbiAgICByZXR1cm4gbmV4dEFjdGl2ZTtcbiAgfTtcblxuICAvKiAtLS0tLS0tLS0tIE1hcCBjb25uZWN0aW9uIC0tLS0tLS0tLS0gKi9cblxuICB3YWl0Rm9yTWFwVG9Mb2FkID0gKGppbXVNYXBWaWV3OiBKaW11TWFwVmlldyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIWppbXVNYXBWaWV3IHx8ICFqaW11TWFwVmlldy52aWV3KSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJJbnZhbGlkIG1hcCB2aWV3IHByb3ZpZGVkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGppbXVNYXBWaWV3LnZpZXcucmVhZHkpIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KFxuICAgICAgICAoKSA9PiByZWplY3QobmV3IEVycm9yKFwiTWFwIGxvYWQgdGltZW91dFwiKSksXG4gICAgICAgIHRoaXMuQ09OTkVDVElPTl9USU1FT1VUX01TLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHdhdGNoSGFuZGxlID0gamltdU1hcFZpZXcudmlldy53YXRjaChcInJlYWR5XCIsIChpc1JlYWR5KSA9PiB7XG4gICAgICAgIGlmIChpc1JlYWR5KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHdhdGNoSGFuZGxlLnJlbW92ZSgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gTWluaW1hbCBjb25uZWN0aW9uOiB3ZSBqdXN0IHN0b3JlIHRoZSB2aWV3IGFuZCBtYXJrIGFzIGNvbm5lY3RlZFxuICBjb25uZWN0VG9NYXAgPSBhc3luYyAoamltdU1hcFZpZXc6IEppbXVNYXBWaWV3KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgaWYgKCFqaW11TWFwVmlldz8udmlldz8ubWFwKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWFwIHZpZXcgaGFzIG5vIG1hcCBwcm9wZXJ0eVwiKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpdmVNYXBWaWV3OiBqaW11TWFwVmlldyxcbiAgICAgICAgICBjb25uZWN0aW9uU3RhdHVzOiBcImNvbm5lY3RlZFwiLFxuICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgIGRlYnVnSW5mbzogXCJDb25uZWN0ZWQgdG8gbWFwXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmUsXG4gICAgICApO1xuICAgIH0pO1xuICB9O1xuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUFmdGVyQ29ubmVjdGlvbiA9ICgpOiB2b2lkID0+IHtcbiAgICBpZiAodGhpcy5fZGlkSW5pdE9uY2UpIHJldHVybjtcbiAgICB0aGlzLl9kaWRJbml0T25jZSA9IHRydWU7XG5cbiAgICBpZiAoXG4gICAgICAhdGhpcy5zdGF0ZS5hY3RpdmVNYXBWaWV3IHx8XG4gICAgICB0aGlzLnN0YXRlLmNvbm5lY3Rpb25TdGF0dXMgIT09IFwiY29ubmVjdGVkXCJcbiAgICApXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAodGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMpIHtcbiAgICAgIGNvbnN0IGYgPSB0aGlzLnByb3BzLmV4dGVybmFsRmlsdGVycztcbiAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgIHtcbiAgICAgICAgICB5aWw6IGYueWlsIHx8IFwiXCIsXG4gICAgICAgICAgdmlsb3lhdDogZi52aWxveWF0IHx8IFwiXCIsXG4gICAgICAgICAgdHVtYW46IGYudHVtYW4gfHwgXCJcIixcbiAgICAgICAgICB0dXJpOiBmLnR1cmkgfHwgXCJcIixcbiAgICAgICAgICBkZWJ1Z0luZm86IFwiRXh0ZXJuYWwgZmlsdGVycyBhcHBsaWVkIGZyb20gcHJvcHNcIixcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpO1xuICAgIH1cbiAgfTtcblxuICBvbkFjdGl2ZVZpZXdDaGFuZ2UgPSBhc3luYyAoamltdU1hcFZpZXc6IEppbXVNYXBWaWV3KSA9PiB7XG4gICAgaWYgKCFqaW11TWFwVmlldykge1xuICAgICAgLy8gVHJlYXQgYXMgZmFsbGJhY2s6IHN0aWxsIGFsbG93IGRhdGEgbG9hZCAobm8gbWFwIGludGVyYWN0aW9uIG5lZWRlZClcbiAgICAgIGlmICh0aGlzLnN0YXRlLm1hcENvbm5lY3Rpb25BdHRlbXB0cyA9PT0gMCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBtYXBMb2FkaW5nU3RhdHVzOiBcImZhaWxlZFwiLFxuICAgICAgICAgIG1hcENvbm5lY3Rpb25BdHRlbXB0czogMSxcbiAgICAgICAgICBkZWJ1Z0luZm86IFwiTm8gbWFwIHZpZXcgcHJvdmlkZWRcIixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKFxuICAgICAgICB7IGNvbm5lY3Rpb25TdGF0dXM6IFwiY29ubmVjdGVkXCIsIGRlYnVnSW5mbzogXCJQcm9jZWVkaW5nIHdpdGhvdXQgbWFwXCIgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZmV0Y2hDYXRlZ29yeURhdGEoKTtcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IG1hcExvYWRpbmdTdGF0dXM6IFwibG9hZGluZ1wiLCBlcnJvcjogbnVsbCB9KTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBsb2FkaW5nVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faXNNb3VudGVkICYmIHRoaXMuc3RhdGUubWFwTG9hZGluZ1N0YXR1cyA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb25uZWN0aW9uU3RhdHVzOiBcImNvbm5lY3RlZFwiLFxuICAgICAgICAgICAgICBtYXBMb2FkaW5nU3RhdHVzOiBcImxvYWRlZFwiLFxuICAgICAgICAgICAgICBkZWJ1Z0luZm86IFwiVGltZW91dCwgcHJvY2VlZGluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzLkNPTk5FQ1RJT05fVElNRU9VVF9NUyk7XG5cbiAgICAgIGF3YWl0IHRoaXMud2FpdEZvck1hcFRvTG9hZChqaW11TWFwVmlldyk7XG4gICAgICBjbGVhclRpbWVvdXQobG9hZGluZ1RpbWVvdXQpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbWFwTG9hZGluZ1N0YXR1czogXCJsb2FkZWRcIixcbiAgICAgICAgY29ubmVjdGlvblN0YXR1czogXCJjb25uZWN0aW5nXCIsXG4gICAgICAgIGRlYnVnSW5mbzogXCJNYXAgbG9hZGVkLCBjb25uZWN0aW5nXCIsXG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0VG9NYXAoamltdU1hcFZpZXcpO1xuICAgICAgdGhpcy5pbml0aWFsaXplQWZ0ZXJDb25uZWN0aW9uKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKFxuICAgICAgICB7XG4gICAgICAgICAgZXJyb3I6IGBNYXAgaW5pdGlhbGl6YXRpb24gaXNzdWU6ICR7KGVyciBhcyBFcnJvcikubWVzc2FnZX1gLFxuICAgICAgICAgIG1hcExvYWRpbmdTdGF0dXM6IChlcnIgYXMgRXJyb3IpLm1lc3NhZ2UuaW5jbHVkZXMoXCJ0aW1lb3V0XCIpXG4gICAgICAgICAgICA/IFwiZmFpbGVkXCJcbiAgICAgICAgICAgIDogdGhpcy5zdGF0ZS5tYXBMb2FkaW5nU3RhdHVzLFxuICAgICAgICAgIGNvbm5lY3Rpb25TdGF0dXM6IFwiY29ubmVjdGVkXCIsXG4gICAgICAgICAgZGVidWdJbmZvOiBgRXJyb3I6ICR7KGVyciBhcyBFcnJvcikubWVzc2FnZX0sIGNvbnRpbnVpbmdgLFxuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB0aGlzLmZldGNoQ2F0ZWdvcnlEYXRhKCksXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICByZXRyeU1hcENvbm5lY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb25uZWN0aW9uU3RhdHVzOiBcImlkbGVcIixcbiAgICAgIG1hcExvYWRpbmdTdGF0dXM6IFwiaWRsZVwiLFxuICAgICAgbWFwQ29ubmVjdGlvbkF0dGVtcHRzOiAwLFxuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBkZWJ1Z0luZm86IFwiTWFudWFsIHJldHJ5IGluaXRpYXRlZFwiLFxuICAgIH0pO1xuICB9XG5cbiAgLyogLS0tLS0tLS0tLSBMaWZlY3ljbGUgLS0tLS0tLS0tLSAqL1xuICBwcml2YXRlIGhhbmRsZU1hc3RlckZpbHRlckNoYW5nZSA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBjb25zdCBkOiBhbnkgPSAoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpLmRldGFpbCB8fCB7fTtcbiAgICBpZiAoIWQuZmlsdGVycykgcmV0dXJuO1xuXG4gICAgY29uc3QgaW5jb21pbmcgPSBkLmZpbHRlcnMgfHwge307XG4gICAgY29uc3Qgc2NvcGVMb2NrZWRSYXcgPVxuICAgICAgZC5zY29wZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZC5zY29wZSwgXCJsb2NrZWRWaWxveWF0XCIpXG4gICAgICAgID8gZC5zY29wZS5sb2NrZWRWaWxveWF0XG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5leHRMb2NrZWRWaWxveWF0ID1cbiAgICAgIHNjb3BlTG9ja2VkUmF3ICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBzY29wZUxvY2tlZFJhd1xuICAgICAgICAgID8gdGhpcy5ub3JtYWxpemVOYW1lKFN0cmluZyhzY29wZUxvY2tlZFJhdykpXG4gICAgICAgICAgOiBcIlwiXG4gICAgICAgIDogdGhpcy5zdGF0ZS5sb2NrZWRWaWxveWF0O1xuICAgIGNvbnN0IGhhc0ZpZWxkID0gKGs6IHN0cmluZykgPT5cbiAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChpbmNvbWluZywgayk7XG4gICAgLy8gS2VlcCBjdXJyZW50IHZhbHVlcyB3aGVuIHVwc3RyZWFtIGV2ZW50IGRvZXNuJ3QgaW5jbHVkZSB0aGF0IGZpZWxkLlxuICAgIGNvbnN0IG5leHRZaWwgPSBoYXNGaWVsZChcInlpbFwiKSA/IGluY29taW5nLnlpbCB8fCBcIlwiIDogdGhpcy5zdGF0ZS55aWw7XG4gICAgY29uc3QgbmV4dFZpbG95YXRSYXcgPSBoYXNGaWVsZChcInZpbG95YXRcIilcbiAgICAgID8gaW5jb21pbmcudmlsb3lhdCB8fCBcIlwiXG4gICAgICA6IHRoaXMuc3RhdGUudmlsb3lhdDtcbiAgICBjb25zdCBuZXh0VHVtYW5SYXcgPSBoYXNGaWVsZChcInR1bWFuXCIpXG4gICAgICA/IGluY29taW5nLnR1bWFuIHx8IFwiXCJcbiAgICAgIDogdGhpcy5zdGF0ZS50dW1hbjtcbiAgICBjb25zdCBpbmNvbWluZ1R1cmxhciA9IGhhc0ZpZWxkKFwidHVybGFyXCIpICYmIEFycmF5LmlzQXJyYXkoaW5jb21pbmcudHVybGFyKVxuICAgICAgPyBpbmNvbWluZy50dXJsYXJcbiAgICAgIDogaGFzRmllbGQoXCJ0dXJpXCIpXG4gICAgICAgID8gaW5jb21pbmcudHVyaVxuICAgICAgICAgID8gW2luY29taW5nLnR1cmldXG4gICAgICAgICAgOiBbXVxuICAgICAgICA6IHRoaXMuc3RhdGUudHVybGFyO1xuICAgIGNvbnN0IG5leHRUdXJsYXI6IHN0cmluZ1tdID0gQXJyYXkuZnJvbShcbiAgICAgIG5ldyBTZXQoXG4gICAgICAgIChpbmNvbWluZ1R1cmxhciBhcyB1bmtub3duW10pXG4gICAgICAgICAgLm1hcCgodmFsdWU6IHVua25vd24pID0+IHRoaXMubm9ybWFsaXplTmFtZShTdHJpbmcodmFsdWUgfHwgXCJcIikpKVxuICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbiksXG4gICAgICApLFxuICAgICk7XG4gICAgY29uc3QgbmV4dFR1cmk6IHN0cmluZyA9IG5leHRUdXJsYXIubGVuZ3RoID09PSAxID8gbmV4dFR1cmxhclswXSA6IFwiXCI7XG4gICAgY29uc3QgbmV4dFZoID0gaGFzRmllbGQoXCJ2aFwiKVxuICAgICAgPyBTdHJpbmcoaW5jb21pbmcudmggfHwgXCJcIilcbiAgICAgIDogdGhpcy5zdGF0ZS52aDtcbiAgICBjb25zdCBuZXh0RmlsdGVyUGllQnlWaCA9IGhhc0ZpZWxkKFwiZmlsdGVyUGllQnlWaFwiKVxuICAgICAgPyBCb29sZWFuKGluY29taW5nLmZpbHRlclBpZUJ5VmgpXG4gICAgICA6IHRoaXMuc3RhdGUuZmlsdGVyUGllQnlWaDtcbiAgICBjb25zdCBuZXh0UGllVmhVbmlxdWVJZHNTaWcgPSBuZXh0RmlsdGVyUGllQnlWaFxuICAgICAgPyBnZXRQaWVWaEZpbHRlclVuaXF1ZUlkc1NpZygpXG4gICAgICA6IFwiXCI7XG5cbiAgICBjb25zdCBuZXh0QmFyRmllbGQgPSBoYXNGaWVsZChcImJhckNhdGVnb3J5RmllbGRcIilcbiAgICAgID8gKGluY29taW5nLmJhckNhdGVnb3J5RmllbGQgPz8gbnVsbClcbiAgICAgIDogdGhpcy5zdGF0ZS5iYXJDYXRlZ29yeUZpZWxkO1xuICAgIGxldCBuZXh0QmFyVmFsdWUgPSBoYXNGaWVsZChcImJhckNhdGVnb3J5VmFsdWVcIilcbiAgICAgID8gKGluY29taW5nLmJhckNhdGVnb3J5VmFsdWUgPz8gbnVsbClcbiAgICAgIDogdGhpcy5zdGF0ZS5iYXJDYXRlZ29yeVZhbHVlO1xuXG4gICAgaWYgKG5leHRWaCAmJiAhaGFzRmllbGQoXCJiYXJDYXRlZ29yeVZhbHVlXCIpKSBuZXh0QmFyVmFsdWUgPSBudWxsO1xuXG4gICAgY29uc3QgbmV4dExhbmd1YWdlOiBcInV6X2N5clwiIHwgXCJ1el9sYXRcIiB8IFwicnVcIiB8IFwiZW5cIiA9IGhhc0ZpZWxkKFwibGFuZ3VhZ2VcIilcbiAgICAgID8gKGluY29taW5nLmxhbmd1YWdlIGFzIGFueSkgfHwgdGhpcy5zdGF0ZS5sYW5ndWFnZSB8fCBcInJ1XCJcbiAgICAgIDogdGhpcy5zdGF0ZS5sYW5ndWFnZTtcblxuICAgIGNvbnN0IGVmZmVjdGl2ZVZpbG95YXQgPSB0aGlzLm5vcm1hbGl6ZU5hbWUobmV4dFZpbG95YXRSYXcgfHwgXCJcIik7XG4gICAgY29uc3QgbmV4dFR1bWFuID0gdGhpcy5ub3JtYWxpemVOYW1lKG5leHRUdW1hblJhdyB8fCBcIlwiKTtcblxuICAgIGNvbnN0IHBhcmVudENoYW5nZWQgPVxuICAgICAgbmV4dFlpbCAhPT0gdGhpcy5zdGF0ZS55aWwgfHxcbiAgICAgIGVmZmVjdGl2ZVZpbG95YXQgIT09IHRoaXMuc3RhdGUudmlsb3lhdCB8fFxuICAgICAgbmV4dFR1bWFuICE9PSB0aGlzLnN0YXRlLnR1bWFuIHx8XG4gICAgICBuZXh0TG9ja2VkVmlsb3lhdCAhPT0gdGhpcy5zdGF0ZS5sb2NrZWRWaWxveWF0O1xuXG4gICAgY29uc3QgYmFyU2VsZWN0aW9uQ2hhbmdlZCA9XG4gICAgICBuZXh0QmFyRmllbGQgIT09IHRoaXMuc3RhdGUuYmFyQ2F0ZWdvcnlGaWVsZCB8fFxuICAgICAgbmV4dEJhclZhbHVlICE9PSB0aGlzLnN0YXRlLmJhckNhdGVnb3J5VmFsdWUgfHxcbiAgICAgIG5leHRWaCAhPT0gdGhpcy5zdGF0ZS52aCB8fFxuICAgICAgbmV4dEZpbHRlclBpZUJ5VmggIT09IHRoaXMuc3RhdGUuZmlsdGVyUGllQnlWaCB8fFxuICAgICAgbmV4dFBpZVZoVW5pcXVlSWRzU2lnICE9PSB0aGlzLnN0YXRlLnBpZVZoVW5pcXVlSWRzU2lnO1xuXG4gICAgY29uc3QgbGFuZ3VhZ2VDaGFuZ2VkID0gbmV4dExhbmd1YWdlICE9PSB0aGlzLnN0YXRlLmxhbmd1YWdlO1xuICAgIGNvbnN0IGNyb3BTZWxlY3Rpb25DaGFuZ2VkID1cbiAgICAgIEpTT04uc3RyaW5naWZ5KG5leHRUdXJsYXIpICE9PSBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLnR1cmxhcik7XG5cbiAgICBpZiAoXG4gICAgICAhcGFyZW50Q2hhbmdlZCAmJlxuICAgICAgIWJhclNlbGVjdGlvbkNoYW5nZWQgJiZcbiAgICAgICFsYW5ndWFnZUNoYW5nZWQgJiZcbiAgICAgICFjcm9wU2VsZWN0aW9uQ2hhbmdlZFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5leHRTZWxlY3RlZENhdGVnb3JpZXM6IHN0cmluZ1tdID0gcGFyZW50Q2hhbmdlZCA/IFtdIDogbmV4dFR1cmxhcjtcbiAgICBjb25zdCBuZXh0QWN0aXZlU2xpY2UgPSBwYXJlbnRDaGFuZ2VkXG4gICAgICA/IG51bGxcbiAgICAgIDogdGhpcy5zdGF0ZS5jYXRlZ29yeURhdGEuY2F0ZWdvcmllcy5maW5kSW5kZXgoKGNhdGVnb3J5KSA9PlxuICAgICAgICAgICAgbmV4dFNlbGVjdGVkQ2F0ZWdvcmllcy5zb21lKFxuICAgICAgICAgICAgICAoc2VsZWN0ZWQpID0+IHRoaXMubm9ybWFsaXplTmFtZShjYXRlZ29yeS5rZXkpID09PSBzZWxlY3RlZCxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHlpbDogU3RyaW5nKG5leHRZaWwgfHwgXCJcIiksXG4gICAgICAgIHZpbG95YXQ6IGVmZmVjdGl2ZVZpbG95YXQsXG4gICAgICAgIGxvY2tlZFZpbG95YXQ6IG5leHRMb2NrZWRWaWxveWF0LFxuICAgICAgICB0dW1hbjogbmV4dFR1bWFuLFxuICAgICAgICB0dXJpOiBuZXh0VHVyaSxcbiAgICAgICAgdHVybGFyOiBuZXh0U2VsZWN0ZWRDYXRlZ29yaWVzLFxuICAgICAgICB2aDogbmV4dFZoLFxuICAgICAgICBmaWx0ZXJQaWVCeVZoOiBuZXh0RmlsdGVyUGllQnlWaCxcbiAgICAgICAgcGllVmhVbmlxdWVJZHNTaWc6IG5leHRQaWVWaFVuaXF1ZUlkc1NpZyxcbiAgICAgICAgYmFyQ2F0ZWdvcnlGaWVsZDogbmV4dEJhckZpZWxkLFxuICAgICAgICBiYXJDYXRlZ29yeVZhbHVlOiBuZXh0QmFyVmFsdWUsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IG5leHRUdXJpIHx8IG51bGwsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllczogbmV4dFNlbGVjdGVkQ2F0ZWdvcmllcyxcbiAgICAgICAgYWN0aXZlU2xpY2U6IG5leHRBY3RpdmVTbGljZSAhPT0gbnVsbCAmJiBuZXh0QWN0aXZlU2xpY2UgPj0gMCA/IG5leHRBY3RpdmVTbGljZSA6IG51bGwsXG4gICAgICAgIGxhbmd1YWdlOiBuZXh0TGFuZ3VhZ2UsXG4gICAgICAgIGFjdGl2ZUZlYXR1cmVMYXllcjogZWZmZWN0aXZlVmlsb3lhdFxuICAgICAgICAgID8gdGhpcy5nZXRGZWF0dXJlTGF5ZXJGb3JWaWxveWF0KGVmZmVjdGl2ZVZpbG95YXQpXG4gICAgICAgICAgOiB0aGlzLmdldERlZmF1bHRGZWF0dXJlTGF5ZXIodGhpcy5zdGF0ZS5mZWF0dXJlTGF5ZXJzKSxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGlmIChwYXJlbnRDaGFuZ2VkIHx8IGJhclNlbGVjdGlvbkNoYW5nZWQgfHwgbGFuZ3VhZ2VDaGFuZ2VkKSB7XG4gICAgICAgICAgdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG4gIH07XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICB0aGlzLmluaXRpYWxpemVUaGVtZSgpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtYXBMb2FkaW5nU3RhdHVzOiBcImlkbGVcIixcbiAgICAgIGNvbm5lY3Rpb25TdGF0dXM6IFwiaWRsZVwiLFxuICAgICAgZGVidWdJbmZvOiBcIldpZGdldCBtb3VudGVkXCIsXG4gICAgfSk7XG5cbiAgICB0aGlzLl91bmJpbmRNYXN0ZXJGaWx0ZXIgPSBiaW5kTWFzdGVyRmlsdGVyKHRoaXMuaGFuZGxlTWFzdGVyRmlsdGVyQ2hhbmdlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ5aWxDaGFuZ2VkXCIsXG4gICAgICB0aGlzLmhhbmRsZVlpbENoYW5nZWQgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInJlZ2lvbkNoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlUmVnaW9uQ2hhbmdlIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJrYWRhc3RyRmlsdGVyQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVLYWRhc3RyRmlsdGVyQ2hhbmdlZCBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiYWdyaVYxMVRoZW1lVG9nZ2xlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVUaGVtZVRvZ2dsZWQgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImxhbmd1YWdlQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVMYW5ndWFnZUNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLmhhbmRsZVJlc2l6ZSk7XG5cbiAgICAvLyBGb3JjZSBwcm9jZWVkIGlmIGNvbm5lY3Rpb24gc3RhbGxzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCAmJlxuICAgICAgICAodGhpcy5zdGF0ZS5tYXBMb2FkaW5nU3RhdHVzID09PSBcImxvYWRpbmdcIiB8fFxuICAgICAgICAgIHRoaXMuc3RhdGUuY29ubmVjdGlvblN0YXR1cyA9PT0gXCJjb25uZWN0aW5nXCIpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb25uZWN0aW9uU3RhdHVzOiBcImNvbm5lY3RlZFwiLFxuICAgICAgICAgICAgbWFwTG9hZGluZ1N0YXR1czogXCJsb2FkZWRcIixcbiAgICAgICAgICAgIGRlYnVnSW5mbzogXCJUaW1lb3V0IHJlYWNoZWQsIHByb2NlZWRpbmdcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgICgpID0+IHRoaXMuZmV0Y2hDYXRlZ29yeURhdGEoKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLkNPTk5FQ1RJT05fVElNRU9VVF9NUyk7XG5cbiAgICB0aGlzLnVwZGF0ZVBpZUNoYXJ0KFwiZGF0YVwiKTtcbiAgfVxuXG4gIHVwZGF0ZUZpbHRlcnNGcm9tUHJvcHMgPSAoZmlsdGVyczoge1xuICAgIHlpbD86IHN0cmluZztcbiAgICB2aWxveWF0Pzogc3RyaW5nO1xuICAgIHR1bWFuPzogc3RyaW5nO1xuICAgIHR1cmk/OiBzdHJpbmc7XG4gIH0pOiB2b2lkID0+IHtcbiAgICBjb25zdCBuZXh0ID0ge1xuICAgICAgeWlsOiBmaWx0ZXJzPy55aWwgPz8gXCJcIixcbiAgICAgIHZpbG95YXQ6IGZpbHRlcnM/LnZpbG95YXQgPz8gXCJcIixcbiAgICAgIHR1bWFuOiBmaWx0ZXJzPy50dW1hbiA/PyBcIlwiLFxuICAgICAgdHVyaTogZmlsdGVycz8udHVyaSA/PyBcIlwiLFxuICAgIH07XG5cbiAgICBjb25zdCBjaGFuZ2VkID1cbiAgICAgIHRoaXMuc3RhdGUueWlsICE9PSBuZXh0LnlpbCB8fFxuICAgICAgdGhpcy5zdGF0ZS52aWxveWF0ICE9PSBuZXh0LnZpbG95YXQgfHxcbiAgICAgIHRoaXMuc3RhdGUudHVtYW4gIT09IG5leHQudHVtYW4gfHxcbiAgICAgIHRoaXMuc3RhdGUudHVyaSAhPT0gbmV4dC50dXJpO1xuXG4gICAgaWYgKCFjaGFuZ2VkKSByZXR1cm47XG5cbiAgICB0aGlzLnNldFN0YXRlKFxuICAgICAge1xuICAgICAgICAuLi5uZXh0LFxuICAgICAgICBpc0hhbmRsaW5nRXh0ZXJuYWxFdmVudDogdHJ1ZSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGFjdGl2ZUZlYXR1cmVMYXllcjogbmV4dC52aWxveWF0XG4gICAgICAgICAgPyB0aGlzLmdldEZlYXR1cmVMYXllckZvclZpbG95YXQobmV4dC52aWxveWF0KVxuICAgICAgICAgIDogdGhpcy5zdGF0ZS5hY3RpdmVGZWF0dXJlTGF5ZXIsXG4gICAgICAgIGRlYnVnSW5mbzogYEZpbHRlcnMgZnJvbSBwcm9wczogeT0ke25leHQueWlsfSwgdj0ke25leHQudmlsb3lhdH0sIHQ9JHtuZXh0LnR1bWFufSwgdHVyaT0ke25leHQudHVyaX1gLFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpO1xuICAgICAgICBzZXRUaW1lb3V0KFxuICAgICAgICAgICgpID0+XG4gICAgICAgICAgICB0aGlzLl9pc01vdW50ZWQgJiZcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0hhbmRsaW5nRXh0ZXJuYWxFdmVudDogZmFsc2UgfSksXG4gICAgICAgICAgMzAwLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICApO1xuICB9O1xuICBwcml2YXRlIGZpbmRBcmVhU3RhdGlzdGljRmllbGQoZmw6IF9fZXNyaS5GZWF0dXJlTGF5ZXIpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWVsZHM6IGFueVtdID0gKGZsIGFzIGFueSk/LmZpZWxkcyB8fCBbXTtcbiAgICBjb25zdCBuYW1lcyA9IGZpZWxkcy5tYXAoKGYpID0+IFN0cmluZyhmPy5uYW1lIHx8IFwiXCIpKTtcbiAgICBjb25zdCBsb3dlciA9IG5hbWVzLm1hcCgobikgPT4gbi50b0xvd2VyQ2FzZSgpKTtcbiAgICBjb25zdCBwcmVmZXJyZWQgPSBbXCJtYXlkb25cIiwgXCJhcmVhX2hhXCIsIFwiYXJlYVwiLCBcImhlY3RhcmVcIiwgXCJoZWN0YXJlc1wiLCBcItCz0LBcIl07XG4gICAgZm9yIChjb25zdCBwIG9mIHByZWZlcnJlZCkge1xuICAgICAgY29uc3QgaWR4ID0gbG93ZXIuaW5kZXhPZihwKTtcbiAgICAgIGlmIChpZHggIT09IC0xKSByZXR1cm4gbmFtZXNbaWR4XTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBwIG9mIHByZWZlcnJlZCkge1xuICAgICAgY29uc3QgaWR4ID0gbG93ZXIuZmluZEluZGV4KChuKSA9PiBuLmluY2x1ZGVzKHApKTtcbiAgICAgIGlmIChpZHggIT09IC0xKSByZXR1cm4gbmFtZXNbaWR4XTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluZEZpZWxkQnlQb3NzaWJsZU5hbWVzKHByZWZlcnJlZCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHF1ZXJ5Q2F0ZWdvcnlTdGF0c0pTT04oXG4gICAgZmw6IF9fZXNyaS5GZWF0dXJlTGF5ZXIsXG4gICAgd2hlcmU6IHN0cmluZyxcbiAgICBjYXRlZ29yeUZpZWxkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8eyBrZXk6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9Pj4ge1xuICAgIGNvbnN0IGFyZWFGaWVsZCA9IHRoaXMuZmluZEFyZWFTdGF0aXN0aWNGaWVsZChmbCk7XG4gICAgY29uc3Qgb2lkRmllbGQgPSAoZmwgYXMgYW55KT8ub2JqZWN0SWRGaWVsZCB8fCBcIk9CSkVDVElEXCI7XG4gICAgcmV0dXJuIGdldFBpZUNhdGVnb3J5U3RhdHNDYWNoZWQoe1xuICAgICAgbGF5ZXI6IGZsLFxuICAgICAgd2hlcmU6IHdoZXJlIHx8IFwiMT0xXCIsXG4gICAgICBjYXRlZ29yeUZpZWxkLFxuICAgICAgYXJlYUZpZWxkLFxuICAgICAgb2JqZWN0SWRGaWVsZDogb2lkRmllbGQsXG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBBZ3JpUGllUHJvcHMsIHByZXZTdGF0ZTogQWdyaVBpZVN0YXRlKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMgIT09IHByZXZQcm9wcy5leHRlcm5hbEZpbHRlcnMgJiZcbiAgICAgIHRoaXMucHJvcHMuZXh0ZXJuYWxGaWx0ZXJzXG4gICAgKSB7XG4gICAgICB0aGlzLnVwZGF0ZUZpbHRlcnNGcm9tUHJvcHModGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHByZXZTdGF0ZS5jb25uZWN0aW9uU3RhdHVzICE9PSBcImNvbm5lY3RlZFwiICYmXG4gICAgICB0aGlzLnN0YXRlLmNvbm5lY3Rpb25TdGF0dXMgPT09IFwiY29ubmVjdGVkXCJcbiAgICApIHtcbiAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICgpID0+IHRoaXMuX2lzTW91bnRlZCAmJiB0aGlzLmluaXRpYWxpemVBZnRlckNvbm5lY3Rpb24oKSxcbiAgICAgICAgMTAwLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1hcExvYWRpbmdTdGF0dXMsIG1hcENvbm5lY3Rpb25BdHRlbXB0cyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IHVzZU1hcFdpZGdldElkcyB9ID0gdGhpcy5wcm9wcztcblxuICAgIGlmIChcbiAgICAgIChtYXBMb2FkaW5nU3RhdHVzID09PSBcImZhaWxlZFwiIHx8IG1hcExvYWRpbmdTdGF0dXMgPT09IFwiaWRsZVwiKSAmJlxuICAgICAgdXNlTWFwV2lkZ2V0SWRzICYmXG4gICAgICB1c2VNYXBXaWRnZXRJZHMubGVuZ3RoID4gMCAmJlxuICAgICAgIXRoaXMuc3RhdGUuYWN0aXZlTWFwVmlldyAmJlxuICAgICAgbWFwQ29ubmVjdGlvbkF0dGVtcHRzICE9PSBwcmV2U3RhdGUubWFwQ29ubmVjdGlvbkF0dGVtcHRzXG4gICAgKSB7XG4gICAgICBpZiAobWFwQ29ubmVjdGlvbkF0dGVtcHRzIDwgdGhpcy5NQVhfQ09OTkVDVElPTl9BVFRFTVBUUykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKChwcmV2KSA9PiAoe1xuICAgICAgICAgICAgICBtYXBDb25uZWN0aW9uQXR0ZW1wdHM6IHByZXYubWFwQ29ubmVjdGlvbkF0dGVtcHRzICsgMSxcbiAgICAgICAgICAgICAgbWFwTG9hZGluZ1N0YXR1czogXCJpZGxlXCIsXG4gICAgICAgICAgICAgIGRlYnVnSW5mbzogYFJldHJ5IGF0dGVtcHQgJHtwcmV2Lm1hcENvbm5lY3Rpb25BdHRlbXB0cyArIDF9YCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtYXBMb2FkaW5nU3RhdHVzOiBcImZhaWxlZFwiLFxuICAgICAgICAgICAgY29ubmVjdGlvblN0YXR1czogXCJjb25uZWN0ZWRcIixcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgZGVidWdJbmZvOiBcIlByb2NlZWRpbmcgYWZ0ZXIgbXVsdGlwbGUgZmFpbGVkIGF0dGVtcHRzXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAoKSA9PiB0aGlzLmZldGNoQ2F0ZWdvcnlEYXRhKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2hvdWxkUmVmcmVzaFBpZURhdGEgPVxuICAgICAgcHJldlN0YXRlLmNhdGVnb3J5RGF0YSAhPT0gdGhpcy5zdGF0ZS5jYXRlZ29yeURhdGEgfHxcbiAgICAgIHByZXZTdGF0ZS5sYW5ndWFnZSAhPT0gdGhpcy5zdGF0ZS5sYW5ndWFnZSB8fFxuICAgICAgcHJldlN0YXRlLmlzRGFya1RoZW1lICE9PSB0aGlzLnN0YXRlLmlzRGFya1RoZW1lO1xuXG4gICAgY29uc3Qgc2hvdWxkUmVmcmVzaFBpZVNlbGVjdGlvbiA9XG4gICAgICAhc2hvdWxkUmVmcmVzaFBpZURhdGEgJiZcbiAgICAgIChwcmV2U3RhdGUuYWN0aXZlU2xpY2UgIT09IHRoaXMuc3RhdGUuYWN0aXZlU2xpY2UgfHxcbiAgICAgICAgcHJldlN0YXRlLnNlbGVjdGVkQ2F0ZWdvcmllcyAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZENhdGVnb3JpZXMpO1xuXG4gICAgaWYgKHNob3VsZFJlZnJlc2hQaWVEYXRhKSB7XG4gICAgICB0aGlzLnVwZGF0ZVBpZUNoYXJ0KFwiZGF0YVwiKTtcbiAgICB9IGVsc2UgaWYgKHNob3VsZFJlZnJlc2hQaWVTZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMudXBkYXRlUGllQ2hhcnQoXCJzZWxlY3Rpb25cIik7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgaGFuZGxlWWlsQ2hhbmdlZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgZDogYW55ID0gKGV2ZW50IGFzIEN1c3RvbUV2ZW50KT8uZGV0YWlsIHx8IHt9O1xuICAgIGlmICghZCB8fCBkLnNvdXJjZSA9PT0gXCJBZ3JpUGllXCIpIHJldHVybjtcblxuICAgIGNvbnN0IHJhdyA9IGQueWlsID8/IGQueWVhciA/PyBkLmNvbnN0cnVjdGlvblllYXI7XG4gICAgaWYgKHJhdyA9PSBudWxsKSByZXR1cm47XG5cbiAgICBjb25zdCB5aWwgPSBTdHJpbmcocmF3KTtcbiAgICBpZiAoeWlsID09PSB0aGlzLnN0YXRlLnlpbCkgcmV0dXJuO1xuXG4gICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgIHtcbiAgICAgICAgeWlsLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgZGVidWdJbmZvOiBgWWlsIGNoYW5nZWQgdG8gJHt5aWx9YCxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB0aGlzLmZldGNoQ2F0ZWdvcnlEYXRhKCksXG4gICAgKTtcbiAgfTtcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9mZXRjaERlYm91bmNlVGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9mZXRjaERlYm91bmNlVGltZXIpO1xuICAgIH1cblxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcInlpbENoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlWWlsQ2hhbmdlZCBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7IC8vIOKchSBGSVhcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJyZWdpb25DaGFuZ2VkXCIsXG4gICAgICB0aGlzLmhhbmRsZVJlZ2lvbkNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiYWdyaVYxMVRoZW1lVG9nZ2xlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVUaGVtZVRvZ2dsZWQgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcImxhbmd1YWdlQ2hhbmdlZFwiLFxuICAgICAgdGhpcy5oYW5kbGVMYW5ndWFnZUNoYW5nZSBhcyBFdmVudExpc3RlbmVyLFxuICAgICk7XG4gICAgdGhpcy5fdW5iaW5kTWFzdGVyRmlsdGVyPy4oKTtcbiAgICB0aGlzLl91bmJpbmRNYXN0ZXJGaWx0ZXIgPSBudWxsO1xuXG4gICAgLy8g4pyFIEZJWDogbm93IGl0IGFjdHVhbGx5IGV4aXN0c1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcImthZGFzdHJGaWx0ZXJDaGFuZ2VkXCIsXG4gICAgICB0aGlzLmhhbmRsZUthZGFzdHJGaWx0ZXJDaGFuZ2VkIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcblxuICAgIC8vIE9wdGlvbmFsIGxlZ2FjeSBzdXBwb3J0XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY29uc3RydWN0aW9uWWVhckNoYW5nZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlQ29uc3RydWN0aW9uWWVhckNoYW5nZWQgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5oYW5kbGVSZXNpemUpO1xuXG4gICAgaWYgKHRoaXMuX3BpZUNoYXJ0KSB7XG4gICAgICB0aGlzLl9waWVDaGFydC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9waWVDaGFydCA9IG51bGw7XG4gICAgICB0aGlzLl9waWVDaGFydEhvc3RFbCA9IG51bGw7XG4gICAgICB0aGlzLl9waWVIYXNSZW5kZXJlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fcGllU3RhYmxlS2V5cyA9IFtdO1xuICAgICAgdGhpcy5fcGllU3RhYmxlUmF3S2V5cyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0gRXh0ZXJuYWwgZXZlbnQgaGFuZGxlcnMgLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgaGFuZGxlRXh0ZXJuYWxDYXRlZ29yeSA9IChldmVudDogQ3VzdG9tRXZlbnQpID0+IHtcbiAgICBpZiAoIWV2ZW50Py5kZXRhaWwpIHJldHVybjtcbiAgICBjb25zdCB7IHNvdXJjZSB9ID0gZXZlbnQuZGV0YWlsIHx8IHt9O1xuICAgIGlmIChzb3VyY2UgPT09IFwiQWdyaVBpZVwiKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXh0VHVyaSA9IHRoaXMubm9ybWFsaXplTmFtZShcbiAgICAgIGV2ZW50LmRldGFpbC50dXJpIHx8IGV2ZW50LmRldGFpbC5jYXRlZ29yeSB8fCBcIlwiLFxuICAgICk7XG4gICAgdGhpcy5zZWxlY3RDYXRlZ29yeUJ5TmFtZShuZXh0VHVyaSB8fCBudWxsKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7IHR1cmk6IG5leHRUdXJpLCB0dXJsYXI6IG5leHRUdXJpID8gW25leHRUdXJpXSA6IFtdLCBzZWxlY3RlZENhdGVnb3J5OiBuZXh0VHVyaSB8fCBudWxsLCBzZWxlY3RlZENhdGVnb3JpZXM6IG5leHRUdXJpID8gW25leHRUdXJpXSA6IFtdIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuZmV0Y2hDYXRlZ29yeURhdGEoKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfTtcbiAgcHJpdmF0ZSBoYW5kbGVLYWRhc3RyRmlsdGVyQ2hhbmdlZCA9IChldmVudDogQ3VzdG9tRXZlbnQpID0+IHtcbiAgICBjb25zdCBkID0gZXZlbnQ/LmRldGFpbCB8fCB7fTtcbiAgICBpZiAoZC5zb3VyY2UgPT09IFwiQWdyaVBpZVwiKSByZXR1cm47XG5cbiAgICAvLyDinIUgQ2hlY2sgd2hhdCBkYXRhIGlzIGluIHRoZSBldmVudFxuICAgIGNvbnN0IGhhc1ZpbG95YXQgPSBkLnZpbG95YXQgfHwgZC5tYXNzaXZOb207XG4gICAgY29uc3QgaGFzVHVtYW4gPSBkLnR1bWFuIHx8IGQudHVtYW5Ob21pO1xuICAgIGNvbnN0IGhhc1llYXIgPSBkLnlpbCAhPSBudWxsIHx8IGQueWVhciAhPSBudWxsO1xuICAgIGNvbnN0IGhhc1R1cmkgPSBkLnR1cmkgfHwgZC5jYXRlZ29yeTtcblxuICAgIC8vIEJ1aWxkIG5leHQgc3RhdGUgLSBvbmx5IHVwZGF0ZSBmaWVsZHMgdGhhdCBhcmUgcHJlc2VudCBpbiB0aGUgZXZlbnRcbiAgICBjb25zdCBuZXh0U3RhdGU6IFBhcnRpYWw8QWdyaVBpZVN0YXRlPiA9IHt9O1xuXG4gICAgaWYgKGhhc1ZpbG95YXQgfHwgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGQsIFwidmlsb3lhdFwiKSkge1xuICAgICAgbmV4dFN0YXRlLnZpbG95YXQgPSB0aGlzLm5vcm1hbGl6ZU5hbWUoU3RyaW5nKGQudmlsb3lhdCB8fCBkLm1hc3Npdk5vbSB8fCBcIlwiKSk7XG4gICAgfVxuXG4gICAgaWYgKGhhc1R1bWFuKSB7XG4gICAgICBuZXh0U3RhdGUudHVtYW4gPSB0aGlzLm5vcm1hbGl6ZU5hbWUoaGFzVHVtYW4pO1xuICAgIH1cblxuICAgIGlmIChoYXNZZWFyKSB7XG4gICAgICBuZXh0U3RhdGUueWlsID0gU3RyaW5nKGQueWlsID8/IGQueWVhcik7XG4gICAgfVxuXG4gICAgaWYgKGhhc1R1cmkpIHtcbiAgICAgIG5leHRTdGF0ZS50dXJpID0gdGhpcy5ub3JtYWxpemVOYW1lKGhhc1R1cmkpO1xuICAgIH1cblxuICAgIC8vIElmIG5vdGhpbmcgY2hhbmdlZCwgc2tpcFxuICAgIGlmIChPYmplY3Qua2V5cyhuZXh0U3RhdGUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUobmV4dFN0YXRlIGFzIEFncmlQaWVTdGF0ZSwgKCkgPT4gdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpKTtcbiAgfTtcblxuICBwcml2YXRlIGhhbmRsZUNvbnN0cnVjdGlvblllYXJDaGFuZ2VkID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IGQ6IGFueSA9IChldmVudCBhcyBDdXN0b21FdmVudCk/LmRldGFpbCB8fCB7fTtcbiAgICBpZiAoIWQgfHwgZC5zb3VyY2UgPT09IFwiQWdyaVBpZVwiKSByZXR1cm47XG5cbiAgICAvLyBzdXBwb3J0IEJPVEggc2hhcGVzXG4gICAgY29uc3QgcmF3ID0gZC55ZWFyID8/IGQueWlsO1xuICAgIGlmIChyYXcgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgY29uc3QgeWlsID0gU3RyaW5nKHJhdyk7XG4gICAgaWYgKHlpbCA9PT0gdGhpcy5zdGF0ZS55aWwpIHJldHVybjtcblxuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHlpbCxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGRlYnVnSW5mbzogYFllYXIgY2hhbmdlZCB0byAke3lpbH1gLFxuICAgICAgfSxcbiAgICAgICgpID0+IHRoaXMuZmV0Y2hDYXRlZ29yeURhdGEoKSxcbiAgICApO1xuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlUmVnaW9uQ2hhbmdlID0gKGV2ZW50OiBDdXN0b21FdmVudCkgPT4ge1xuICAgIGNvbnN0IGQgPSBldmVudD8uZGV0YWlsIHx8IHt9O1xuICAgIGlmICghZCB8fCBkLnNvdXJjZSA9PT0gXCJBZ3JpUGllXCIpIHJldHVybjtcblxuICAgIGNvbnN0IHZpbCA9IHRoaXMubm9ybWFsaXplTmFtZShkLnZpbG95YXQgfHwgXCJcIik7XG4gICAgY29uc3QgdHVtID0gdGhpcy5ub3JtYWxpemVOYW1lKGQudHVtYW4gfHwgXCJcIik7XG5cbiAgICB0aGlzLnNldFN0YXRlKFxuICAgICAge1xuICAgICAgICB2aWxveWF0OiB2aWwsXG4gICAgICAgIHR1bWFuOiB0dW0sXG4gICAgICAgIHlpbDogdGhpcy5zdGF0ZS55aWwsXG4gICAgICAgIHR1cmk6IFwiXCIsXG4gICAgICAgIHR1cmxhcjogW10sXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IG51bGwsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllczogW10sXG4gICAgICAgIGFjdGl2ZVNsaWNlOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuZmV0Y2hDYXRlZ29yeURhdGEoKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfTtcblxuICAvKiAtLS0tLS0tLS0tIExvY2FsIFVJIGhlbHBlcnMgLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgc2VsZWN0Q2F0ZWdvcnlCeU5hbWUgPSAobmFtZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgIGlmICghbmFtZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHR1cmk6IFwiXCIsXG4gICAgICAgIHR1cmxhcjogW10sXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IG51bGwsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllczogW10sXG4gICAgICAgIGFjdGl2ZVNsaWNlOiBudWxsLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGlkeCA9IHRoaXMuc3RhdGUuY2F0ZWdvcnlEYXRhLmNhdGVnb3JpZXMuZmluZEluZGV4KFxuICAgICAgKGMpID0+IHRoaXMubm9ybWFsaXplTmFtZShjLmtleSkgPT09IHRoaXMubm9ybWFsaXplTmFtZShuYW1lKSxcbiAgICApO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdHVyaTogbmFtZSxcbiAgICAgIHR1cmxhcjogW25hbWVdLFxuICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogbmFtZSxcbiAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllczogW25hbWVdLFxuICAgICAgYWN0aXZlU2xpY2U6IGlkeCA+PSAwID8gaWR4IDogbnVsbCxcbiAgICB9KTtcbiAgfTtcblxuICBwcml2YXRlIF9sYXN0SXBhZExheW91dDogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgIHRoaXMuX3BpZUNoYXJ0Py5yZXNpemUoKTtcbiAgICBjb25zdCBpc0lwYWQgPSB0aGlzLmlzSXBhZExheW91dCgpO1xuICAgIGlmICh0aGlzLl9sYXN0SXBhZExheW91dCA9PT0gaXNJcGFkKSByZXR1cm47XG4gICAgdGhpcy5fbGFzdElwYWRMYXlvdXQgPSBpc0lwYWQ7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVQaWVDaGFydChcInNlbGVjdGlvblwiKTtcbiAgICAgIHRoaXMuX3BpZUNoYXJ0Py5yZXNpemUoKTtcbiAgICB9KTtcbiAgfTtcblxuICBwcml2YXRlIGdldENoYXJ0RGF0YUZvclBpZSA9ICgpID0+IHtcbiAgICBjb25zdCB7IGNhdGVnb3J5RGF0YSwgbGFuZ3VhZ2UgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qgc29ydGVkQ2F0ZWdvcmllcyA9IFsuLi4oY2F0ZWdvcnlEYXRhPy5jYXRlZ29yaWVzID8/IFtdKV1cbiAgICAgIC5maWx0ZXIoKGNhdGVnb3J5KSA9PiAoTnVtYmVyKGNhdGVnb3J5LnZhbHVlKSB8fCAwKSA+IDApXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi52YWx1ZSAtIGEudmFsdWUpO1xuXG4gICAgLy8gT25seSBwb3NpdGl2ZSBzbGljZXMg4oCUIHplcm8gcGxhY2Vob2xkZXJzIGZyb20gcHJpb3IgeWVhci9yZWdpb24gbGVhdmVcbiAgICAvLyBlbXB0eSBhcmNzIHdoZW4gbWluQW5nbGUgYm9vc3RzIHRoZW0uXG4gICAgdGhpcy5fcGllU3RhYmxlS2V5cyA9IHNvcnRlZENhdGVnb3JpZXNcbiAgICAgIC5tYXAoKGNhdGVnb3J5KSA9PiB0aGlzLm5vcm1hbGl6ZU5hbWUoY2F0ZWdvcnkua2V5KSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgdGhpcy5fcGllU3RhYmxlUmF3S2V5cyA9IHt9O1xuXG4gICAgcmV0dXJuIHNvcnRlZENhdGVnb3JpZXMubWFwKChjYXRlZ29yeSkgPT4ge1xuICAgICAgY29uc3Qgbm9ybSA9IHRoaXMubm9ybWFsaXplTmFtZShjYXRlZ29yeS5rZXkpO1xuICAgICAgdGhpcy5fcGllU3RhYmxlUmF3S2V5c1tub3JtXSA9IGNhdGVnb3J5LmtleTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHRoaXMuZ2V0Q2F0ZWdvcnlEaXNwbGF5TmFtZShjYXRlZ29yeS5rZXksIGxhbmd1YWdlKSxcbiAgICAgICAgcmF3S2V5OiBjYXRlZ29yeS5rZXksXG4gICAgICAgIHZhbHVlOiBjYXRlZ29yeS52YWx1ZSxcbiAgICAgICAgcGVyY2VudGFnZTogY2F0ZWdvcnkucGVyY2VudGFnZSxcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBlbnN1cmVQaWVDaGFydCA9ICgpID0+IHtcbiAgICBjb25zdCBob3N0ID0gdGhpcy5fcGllQ2hhcnRSZWYuY3VycmVudDtcbiAgICBpZiAoIWhvc3QpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5fcGllQ2hhcnQgJiZcbiAgICAgIHRoaXMuX3BpZUNoYXJ0SG9zdEVsICYmXG4gICAgICB0aGlzLl9waWVDaGFydEhvc3RFbCAhPT0gaG9zdFxuICAgICkge1xuICAgICAgdGhpcy5fcGllQ2hhcnQuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcGllQ2hhcnQgPSBudWxsO1xuICAgICAgdGhpcy5fcGllQ2hhcnRIb3N0RWwgPSBudWxsO1xuICAgICAgdGhpcy5fcGllSGFzUmVuZGVyZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX3BpZVN0YWJsZUtleXMgPSBbXTtcbiAgICAgIHRoaXMuX3BpZVN0YWJsZVJhd0tleXMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3BpZUNoYXJ0KSB7XG4gICAgICB0aGlzLl9waWVDaGFydCA9IGVjaGFydHMuaW5pdChob3N0KTtcbiAgICAgIHRoaXMuX3BpZUNoYXJ0SG9zdEVsID0gaG9zdDtcbiAgICAgIHRoaXMuX3BpZUNoYXJ0Lm9uKFwiY2xpY2tcIiwgKHBhcmFtczogYW55KSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1zPy5kYXRhSW5kZXggIT09IFwibnVtYmVyXCIpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYW5kbGVTbGljZUNsaWNrKHBhcmFtcy5kYXRhIHx8IHt9LCBwYXJhbXMuZGF0YUluZGV4KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9waWVDaGFydDtcbiAgfTtcblxuICBwcml2YXRlIGZvcm1hdENlbnRlckFyZWEgPSAodmFsdWU6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgeyBsYW5ndWFnZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBhcmVhVW5pdCA9IGxhbmd1YWdlID09PSBcImVuXCIgPyBcImhhXCIgOiBsYW5ndWFnZSA9PT0gXCJ1el9sYXRcIiA/IFwiZ2FcIiA6IFwi0LPQsFwiO1xuICAgIGNvbnN0IHNhZmUgPSBOdW1iZXIuaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiAwO1xuICAgIHJldHVybiBgJHtzYWZlLnRvTG9jYWxlU3RyaW5nKFwicnUtUlVcIiwge1xuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBzYWZlID49IDEwMCA/IDAgOiAxLFxuICAgIH0pfVxcdTAwQTAke2FyZWFVbml0fWA7XG4gIH07XG5cbiAgcHJpdmF0ZSBmb3JtYXRDZW50ZXJQZXJjZW50ID0gKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIFwiMCVcIjtcbiAgICBjb25zdCByb3VuZGVkID0gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwKSAvIDEwO1xuICAgIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKHJvdW5kZWQpXG4gICAgICA/IGAke3JvdW5kZWQudG9GaXhlZCgwKX0lYFxuICAgICAgOiBgJHtyb3VuZGVkLnRvRml4ZWQoMSl9JWA7XG4gIH07XG5cbiAgcHJpdmF0ZSBnZXRDZW50ZXJBbGxMYWJlbCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IHsgbGFuZ3VhZ2UgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGxhbmd1YWdlID09PSBcImVuXCIpIHJldHVybiBcIkFsbFwiO1xuICAgIGlmIChsYW5ndWFnZSA9PT0gXCJydVwiKSByZXR1cm4gXCLQktGB0LVcIjtcbiAgICBpZiAobGFuZ3VhZ2UgPT09IFwidXpfbGF0XCIpIHJldHVybiBcIkJhcmNoYXNpXCI7XG4gICAgcmV0dXJuIFwi0JHQsNGA0YfQsNGB0LhcIjtcbiAgfTtcblxuICBwcml2YXRlIGlzSXBhZExheW91dCA9ICgpOiBib29sZWFuID0+IHtcbiAgICAvLyBIaWRlIGxlZ2VuZCAvIGV4cGFuZCBwaWUgb24gaVBhZCBQcm8gKH4xMzY2KSBhbmQgZXZlcnkgc21hbGxlciB2aWV3cG9ydC5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aCA8PSAxNDAwO1xuICB9O1xuXG4gIHByaXZhdGUgZ2V0UGllQ2VudGVyQ29udGVudCA9IChcbiAgICBjaGFydERhdGE6IEFycmF5PHtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHJhd0tleT86IHN0cmluZztcbiAgICAgIHZhbHVlOiBudW1iZXI7XG4gICAgICBwZXJjZW50YWdlPzogbnVtYmVyO1xuICAgIH0+LFxuICApOiB7XG4gICAgc2hvd1BlcmNlbnQ6IGJvb2xlYW47XG4gICAgcGVyY2VudDogbnVtYmVyO1xuICAgIGFyZWE6IG51bWJlcjtcbiAgICBsYWJlbDogc3RyaW5nO1xuICB9ID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdGVkQ2F0ZWdvcmllcywgY2F0ZWdvcnlEYXRhIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHRvdGFsVmFsdWUgPVxuICAgICAgTnVtYmVyKGNhdGVnb3J5RGF0YT8udG90YWxWYWx1ZSkgfHxcbiAgICAgIGNoYXJ0RGF0YS5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4gc3VtICsgKE51bWJlcihpdGVtLnZhbHVlKSB8fCAwKSwgMCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkS2V5cyA9IG5ldyBTZXQoXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllcy5tYXAoKHNlbGVjdGVkKSA9PiB0aGlzLm5vcm1hbGl6ZU5hbWUoc2VsZWN0ZWQpKSxcbiAgICAgICk7XG4gICAgICBjb25zdCBzZWxlY3RlZEl0ZW1zID0gY2hhcnREYXRhLmZpbHRlcigoaXRlbSkgPT5cbiAgICAgICAgc2VsZWN0ZWRLZXlzLmhhcyh0aGlzLm5vcm1hbGl6ZU5hbWUoaXRlbS5yYXdLZXkgfHwgaXRlbS5uYW1lIHx8IFwiXCIpKSxcbiAgICAgICk7XG4gICAgICBpZiAoc2VsZWN0ZWRJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGFyZWEgPSBzZWxlY3RlZEl0ZW1zLnJlZHVjZShcbiAgICAgICAgICAoc3VtLCBpdGVtKSA9PiBzdW0gKyAoTnVtYmVyKGl0ZW0udmFsdWUpIHx8IDApLFxuICAgICAgICAgIDAsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc2hvd1BlcmNlbnQ6IHRydWUsXG4gICAgICAgICAgcGVyY2VudDogdG90YWxWYWx1ZSA+IDAgPyAoYXJlYSAvIHRvdGFsVmFsdWUpICogMTAwIDogMCxcbiAgICAgICAgICBhcmVhLFxuICAgICAgICAgIGxhYmVsOiBzZWxlY3RlZEl0ZW1zLm1hcCgoaXRlbSkgPT4gaXRlbS5uYW1lKS5qb2luKFwiLCBcIiksXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNob3dQZXJjZW50OiB0cnVlLFxuICAgICAgcGVyY2VudDogdG90YWxWYWx1ZSA+IDAgPyAxMDAgOiAwLFxuICAgICAgYXJlYTogdG90YWxWYWx1ZSxcbiAgICAgIGxhYmVsOiB0aGlzLmdldENlbnRlckFsbExhYmVsKCksXG4gICAgfTtcbiAgfTtcblxuICBwcml2YXRlIHVwZGF0ZVBpZUNoYXJ0ID0gKHJlYXNvbjogXCJkYXRhXCIgfCBcInNlbGVjdGlvblwiID0gXCJkYXRhXCIpID0+IHtcbiAgICBjb25zdCBjaGFydCA9IHRoaXMuZW5zdXJlUGllQ2hhcnQoKTtcbiAgICBpZiAoIWNoYXJ0KSByZXR1cm47XG5cbiAgICBjb25zdCB7XG4gICAgICBzZWxlY3RlZENhdGVnb3JpZXMsXG4gICAgICB2aWxveWF0LFxuICAgICAgbG9ja2VkVmlsb3lhdCxcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBwaWVJbnRlcmFjdGl2ZSA9ICEhKGxvY2tlZFZpbG95YXQgfHwgdmlsb3lhdCB8fCBcIlwiKS50cmltKCk7XG4gICAgY29uc3QgY2hhcnREYXRhID0gdGhpcy5nZXRDaGFydERhdGFGb3JQaWUoKTtcbiAgICBjb25zdCBub3JtYWxpemVkU2VsZWN0aW9ucyA9IHNlbGVjdGVkQ2F0ZWdvcmllcy5tYXAoKHNlbGVjdGVkKSA9PlxuICAgICAgdGhpcy5ub3JtYWxpemVOYW1lKHNlbGVjdGVkKSxcbiAgICApO1xuICAgIGNvbnN0IGhhc1NlbGVjdGVkU2xpY2UgPSBub3JtYWxpemVkU2VsZWN0aW9ucy5sZW5ndGggPiAwO1xuICAgIGNvbnN0IHNsaWNlQm9yZGVyID0gdGhpcy5nZXRTbGljZUJvcmRlckNvbG9yKCk7XG4gICAgY29uc3QgdmlzaWJsZVNsaWNlQ291bnQgPSBjaGFydERhdGEuZmlsdGVyKFxuICAgICAgKGl0ZW0pID0+IChOdW1iZXIoaXRlbS52YWx1ZSkgfHwgMCkgPiAwLFxuICAgICkubGVuZ3RoO1xuICAgIGNvbnN0IGlzRGF0YVVwZGF0ZSA9IHRoaXMuX3BpZUhhc1JlbmRlcmVkICYmIHJlYXNvbiA9PT0gXCJkYXRhXCI7XG4gICAgY29uc3QgaXNTZWxlY3Rpb25VcGRhdGUgPSByZWFzb24gPT09IFwic2VsZWN0aW9uXCIgJiYgdGhpcy5fcGllSGFzUmVuZGVyZWQ7XG4gICAgY29uc3QgaXNTaW5nbGVTbGljZSA9XG4gICAgICBpc0RhdGFVcGRhdGUgfHwgaXNTZWxlY3Rpb25VcGRhdGUgPyBmYWxzZSA6IHZpc2libGVTbGljZUNvdW50ID09PSAxO1xuICAgIGNvbnN0IHNlZ21lbnRCb3JkZXJXaWR0aCA9IGlzU2luZ2xlU2xpY2UgPyAwIDogdmlzaWJsZVNsaWNlQ291bnQgPiA4ID8gMSA6IDI7XG4gICAgY29uc3Qgc2VnbWVudEJvcmRlclJhZGl1cyA9IGlzU2luZ2xlU2xpY2VcbiAgICAgID8gMFxuICAgICAgOiB2aXNpYmxlU2xpY2VDb3VudCA+IDEwXG4gICAgICAgID8gNFxuICAgICAgICA6IHZpc2libGVTbGljZUNvdW50ID4gNlxuICAgICAgICAgID8gNlxuICAgICAgICAgIDogMTA7XG5cbiAgICBjb25zdCBpc0lwYWQgPSB0aGlzLmlzSXBhZExheW91dCgpO1xuICAgIGNvbnN0IG9wdGlvbjogZWNoYXJ0cy5FQ2hhcnRzT3B0aW9uID0ge1xuICAgICAgYW5pbWF0aW9uOiAhaXNTZWxlY3Rpb25VcGRhdGUsXG4gICAgICAuLi4oaXNTZWxlY3Rpb25VcGRhdGVcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogMCxcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uVXBkYXRlOiAwLFxuICAgICAgICAgIH1cbiAgICAgICAgOiBpc0RhdGFVcGRhdGVcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb25VcGRhdGU6IDI4MCxcbiAgICAgICAgICAgICAgYW5pbWF0aW9uRWFzaW5nVXBkYXRlOiBcImN1YmljSW5PdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgYW5pbWF0aW9uRWFzaW5nOiBcImN1YmljT3V0XCIsXG4gICAgICAgICAgICB9KSxcbiAgICAgIGNvbG9yOiBBZ3JpUGllLkZBTExCQUNLX0NPTE9SUyxcbiAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgdHJpZ2dlcjogXCJpdGVtXCIsXG4gICAgICAgIHNob3c6IGlzSXBhZCAmJiBwaWVJbnRlcmFjdGl2ZSxcbiAgICAgICAgdHJpZ2dlck9uOiBcImNsaWNrXCIsXG4gICAgICAgIGNvbmZpbmU6IHRydWUsXG4gICAgICAgIGFwcGVuZFRvQm9keTogdHJ1ZSxcbiAgICAgICAgZm9ybWF0dGVyOiAocGFyYW1zOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gU3RyaW5nKFxuICAgICAgICAgICAgcGFyYW1zPy5uYW1lIHx8IHBhcmFtcz8uZGF0YT8ubmFtZSB8fCBcIlwiLFxuICAgICAgICAgICkudHJpbSgpO1xuICAgICAgICAgIHJldHVybiBuYW1lIHx8IFwiXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5zdGF0ZS5pc0RhcmtUaGVtZSA/IFwiIzFmMjAzMFwiIDogXCIjZmZmZmZmXCIsXG4gICAgICAgIGJvcmRlckNvbG9yOiB0aGlzLnN0YXRlLmlzRGFya1RoZW1lXG4gICAgICAgICAgPyBcInJnYmEoMTI2LCAyMTQsIDI1NSwgMC4yMilcIlxuICAgICAgICAgIDogXCJyZ2JhKDE1LCAyMywgNDIsIDAuMTIpXCIsXG4gICAgICAgIGJvcmRlcldpZHRoOiAxLFxuICAgICAgICBwYWRkaW5nOiBbOCwgMTJdLFxuICAgICAgICB0ZXh0U3R5bGU6IHtcbiAgICAgICAgICBjb2xvcjogdGhpcy5zdGF0ZS5pc0RhcmtUaGVtZSA/IFwiI2U5ZjhmZlwiIDogXCIjMGYxNzJhXCIsXG4gICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgIGZvbnRXZWlnaHQ6IDcwMCxcbiAgICAgICAgICBmb250RmFtaWx5OiBcIkdlb2xvZ2ljYSwgdWktc2Fucy1zZXJpZiwgc3lzdGVtLXVpLCBzYW5zLXNlcmlmXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGV4dHJhQ3NzVGV4dDpcbiAgICAgICAgICBcImJvcmRlci1yYWRpdXM6MTJweDtib3gtc2hhZG93OjAgOHB4IDI0cHggcmdiYSgxNSwyMyw0MiwwLjE2KTtcIixcbiAgICAgIH0sXG4gICAgICBsZWdlbmQ6IHtcbiAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICB9LFxuICAgICAgdGl0bGU6IHsgc2hvdzogZmFsc2UgfSxcbiAgICAgIHNlcmllczogW1xuICAgICAgICB7XG4gICAgICAgICAgaWQ6IFwiYWdyaS1waWUtZG9udXRcIixcbiAgICAgICAgICBuYW1lOiBcIkFjY2VzcyBGcm9tXCIsXG4gICAgICAgICAgdHlwZTogXCJwaWVcIixcbiAgICAgICAgICBzaWxlbnQ6ICFwaWVJbnRlcmFjdGl2ZSxcbiAgICAgICAgICBzZWxlY3RlZE1vZGU6IGZhbHNlLFxuICAgICAgICAgIHNlbGVjdGVkT2Zmc2V0OiBoYXNTZWxlY3RlZFNsaWNlID8gNiA6IDAsXG4gICAgICAgICAgc3RhcnRBbmdsZTogOTAsXG4gICAgICAgICAgcGFkQW5nbGU6IDAsXG4gICAgICAgICAgcmFkaXVzOiBbXCI1NiVcIiwgXCI4OCVcIl0sXG4gICAgICAgICAgY2VudGVyOiBbXCI1MCVcIiwgXCI1MCVcIl0sXG4gICAgICAgICAgYXZvaWRMYWJlbE92ZXJsYXA6IHRydWUsXG4gICAgICAgICAgbWluQW5nbGU6IDAsXG4gICAgICAgICAgejogMixcbiAgICAgICAgICAuLi4oaXNTZWxlY3Rpb25VcGRhdGVcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvblR5cGVVcGRhdGU6IFwidHJhbnNpdGlvblwiLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uVXBkYXRlOiAwLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkRlbGF5VXBkYXRlOiAwLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGlzRGF0YVVwZGF0ZVxuICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgIGFuaW1hdGlvblR5cGVVcGRhdGU6IFwidHJhbnNpdGlvblwiLFxuICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb25VcGRhdGU6IDI4MCxcbiAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVhc2luZ1VwZGF0ZTogXCJjdWJpY0luT3V0XCIsXG4gICAgICAgICAgICAgICAgICBhbmltYXRpb25EZWxheVVwZGF0ZTogMCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uVHlwZTogXCJzY2FsZVwiLFxuICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVhc2luZzogXCJjdWJpY091dFwiLFxuICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRGVsYXk6IChpbmRleDogbnVtYmVyKSA9PiBpbmRleCAqIDQwLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgIGN1cnNvcjogcGllSW50ZXJhY3RpdmUgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgIGl0ZW1TdHlsZToge1xuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBzZWdtZW50Qm9yZGVyUmFkaXVzLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IHNsaWNlQm9yZGVyLFxuICAgICAgICAgICAgYm9yZGVyV2lkdGg6IHNlZ21lbnRCb3JkZXJXaWR0aCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBzaG93OiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVtcGhhc2lzOiB7XG4gICAgICAgICAgICBzY2FsZTogIWhhc1NlbGVjdGVkU2xpY2UsXG4gICAgICAgICAgICBzY2FsZVNpemU6IDIsXG4gICAgICAgICAgICBmb2N1czogXCJub25lXCIsXG4gICAgICAgICAgICBpdGVtU3R5bGU6IHtcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IHNsaWNlQm9yZGVyLFxuICAgICAgICAgICAgICBib3JkZXJXaWR0aDogc2VnbWVudEJvcmRlcldpZHRoLFxuICAgICAgICAgICAgICBzaGFkb3dCbHVyOiAwLFxuICAgICAgICAgICAgICBzaGFkb3dPZmZzZXRZOiAwLFxuICAgICAgICAgICAgICBzaGFkb3dDb2xvcjogXCJ0cmFuc3BhcmVudFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJsdXI6IHtcbiAgICAgICAgICAgIGl0ZW1TdHlsZToge1xuICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxhYmVsTGluZToge1xuICAgICAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkYXRhOiBjaGFydERhdGEubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYmFzZUNvbG9yID0gdGhpcy5nZXRDcm9wQ29sb3IoaXRlbS5yYXdLZXkgfHwgaXRlbS5uYW1lLCBpbmRleCk7XG4gICAgICAgICAgICBjb25zdCBpdGVtS2V5ID0gdGhpcy5ub3JtYWxpemVOYW1lKGl0ZW0ucmF3S2V5IHx8IGl0ZW0ubmFtZSB8fCBcIlwiKTtcbiAgICAgICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBub3JtYWxpemVkU2VsZWN0aW9ucy5pbmNsdWRlcyhpdGVtS2V5KTtcbiAgICAgICAgICAgIGNvbnN0IGhhc1ZhbHVlID0gKE51bWJlcihpdGVtLnZhbHVlKSB8fCAwKSA+IDA7XG4gICAgICAgICAgICBjb25zdCBpc0RpbW1lZCA9IGhhc1NlbGVjdGVkU2xpY2UgJiYgIWlzU2VsZWN0ZWQ7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogYGNyb3AtJHtpdGVtS2V5IHx8IGluZGV4fWAsXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLnZhbHVlLFxuICAgICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgIHJhd0tleTogaXRlbS5yYXdLZXksXG4gICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IGl0ZW0ucGVyY2VudGFnZSxcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGlzU2VsZWN0ZWQgJiYgaGFzVmFsdWUsXG4gICAgICAgICAgICAgIGl0ZW1TdHlsZToge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBiYXNlQ29sb3IsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogIWhhc1ZhbHVlID8gMCA6IGlzRGltbWVkID8gMC4yOCA6IDEsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IHNsaWNlQm9yZGVyLFxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiBoYXNWYWx1ZSA/IHNlZ21lbnRCb3JkZXJXaWR0aCA6IDAsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBzZWdtZW50Qm9yZGVyUmFkaXVzLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcblxuICAgIGNoYXJ0LnNldE9wdGlvbihcbiAgICAgIG9wdGlvbixcbiAgICAgIGlzU2VsZWN0aW9uVXBkYXRlXG4gICAgICAgID8geyBub3RNZXJnZTogZmFsc2UsIGxhenlVcGRhdGU6IGZhbHNlIH1cbiAgICAgICAgOiBpc0RhdGFVcGRhdGVcbiAgICAgICAgICA/IHsgbm90TWVyZ2U6IGZhbHNlLCByZXBsYWNlTWVyZ2U6IFtcInNlcmllc1wiXSwgbGF6eVVwZGF0ZTogZmFsc2UgfVxuICAgICAgICAgIDogeyBub3RNZXJnZTogdHJ1ZSwgbGF6eVVwZGF0ZTogZmFsc2UgfSxcbiAgICApO1xuICAgIGlmIChjaGFydERhdGEuc29tZSgoaXRlbSkgPT4gKE51bWJlcihpdGVtLnZhbHVlKSB8fCAwKSA+IDApKSB7XG4gICAgICB0aGlzLl9waWVIYXNSZW5kZXJlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmICghaXNEYXRhVXBkYXRlICYmICFpc1NlbGVjdGlvblVwZGF0ZSkge1xuICAgICAgY2hhcnQucmVzaXplKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0gSW50ZXJhY3Rpb25zIC0tLS0tLS0tLS0gKi9cblxuICBoYW5kbGVTbGljZUNsaWNrID0gKFxuICAgIGRhdGE6IHsgcmF3S2V5Pzogc3RyaW5nOyBuYW1lPzogc3RyaW5nIH0sXG4gICAgaW5kZXg6IG51bWJlcixcbiAgKTogdm9pZCA9PiB7XG4gICAgY29uc3QgY2FuU2xpY2UgPVxuICAgICAgISEodGhpcy5zdGF0ZS5sb2NrZWRWaWxveWF0IHx8IHRoaXMuc3RhdGUudmlsb3lhdCB8fCBcIlwiKS50cmltKCk7XG4gICAgaWYgKCFjYW5TbGljZSkgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0ZWRDYXRlZ29yeU5hbWUgPSBTdHJpbmcoZGF0YS5yYXdLZXkgfHwgZGF0YS5uYW1lIHx8IFwiXCIpLnRyaW0oKTtcbiAgICBpZiAoIXNlbGVjdGVkQ2F0ZWdvcnlOYW1lKSByZXR1cm47XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXkgPSB0aGlzLm5vcm1hbGl6ZU5hbWUoc2VsZWN0ZWRDYXRlZ29yeU5hbWUpO1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkQ2F0ZWdvcmllcy5zb21lKFxuICAgICAgKGNhdGVnb3J5KSA9PiB0aGlzLm5vcm1hbGl6ZU5hbWUoY2F0ZWdvcnkpID09PSBzZWxlY3RlZEtleSxcbiAgICApO1xuICAgIGNvbnN0IG5leHRTZWxlY3Rpb25zID0gaXNTZWxlY3RlZFxuICAgICAgPyB0aGlzLnN0YXRlLnNlbGVjdGVkQ2F0ZWdvcmllcy5maWx0ZXIoXG4gICAgICAgICAgKGNhdGVnb3J5KSA9PiB0aGlzLm5vcm1hbGl6ZU5hbWUoY2F0ZWdvcnkpICE9PSBzZWxlY3RlZEtleSxcbiAgICAgICAgKVxuICAgICAgOiBbLi4udGhpcy5zdGF0ZS5zZWxlY3RlZENhdGVnb3JpZXMsIHNlbGVjdGVkQ2F0ZWdvcnlOYW1lXTtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3Rpb24gPSBuZXh0U2VsZWN0aW9ucy5sZW5ndGggPT09IDEgPyBuZXh0U2VsZWN0aW9uc1swXSA6IFwiXCI7XG5cbiAgICB0aGlzLnNldFN0YXRlKFxuICAgICAge1xuICAgICAgICBhY3RpdmVTbGljZTogaXNTZWxlY3RlZCA/IG51bGwgOiBpbmRleCxcbiAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogc2luZ2xlU2VsZWN0aW9uIHx8IG51bGwsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllczogbmV4dFNlbGVjdGlvbnMsXG4gICAgICAgIHR1cmk6IHNpbmdsZVNlbGVjdGlvbixcbiAgICAgICAgdHVybGFyOiBuZXh0U2VsZWN0aW9ucyxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwid2lkZ2V0U2VsZWN0aW9uQ2hhbmdlZFwiLCB7XG4gICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgdHVyaTogc2luZ2xlU2VsZWN0aW9uLFxuICAgICAgICAgICAgICB0dXJsYXI6IG5leHRTZWxlY3Rpb25zLFxuICAgICAgICAgICAgICBwb2x5Z29uTW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgIHNvdXJjZTogXCJBZ3JpUGllXCIsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIGlQYWQgaGFzIG5vIGxlZ2VuZCDigJQga2VlcCB0aGUgc2xpY2UgbmFtZSB2aXNpYmxlIHZpYSB0b29sdGlwIGFmdGVyIGNsaWNrLlxuICAgICAgICBpZiAodGhpcy5pc0lwYWRMYXlvdXQoKSAmJiB0aGlzLl9waWVDaGFydCkge1xuICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcGllQ2hhcnQ/LmRpc3BhdGNoQWN0aW9uKHtcbiAgICAgICAgICAgICAgdHlwZTogXCJzaG93VGlwXCIsXG4gICAgICAgICAgICAgIHNlcmllc0luZGV4OiAwLFxuICAgICAgICAgICAgICBkYXRhSW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfTtcbiAgYXBwbHlDYXRlZ29yeUZpbHRlciA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdGVkQ2F0ZWdvcmllcywgeWlsLCB2aWxveWF0LCB0dW1hbiB9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJjYXRlZ29yeUZpbHRlckNoYW5nZWRcIiwge1xuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB5aWwsXG4gICAgICAgICAgdmlsb3lhdCxcbiAgICAgICAgICB0dW1hbixcbiAgICAgICAgICBjYXRlZ29yeTogc2VsZWN0ZWRDYXRlZ29yaWVzLmxlbmd0aCA9PT0gMSA/IHNlbGVjdGVkQ2F0ZWdvcmllc1swXSA6IFwiXCIsXG4gICAgICAgICAgdHVyaTogc2VsZWN0ZWRDYXRlZ29yaWVzLmxlbmd0aCA9PT0gMSA/IHNlbGVjdGVkQ2F0ZWdvcmllc1swXSA6IFwiXCIsXG4gICAgICAgICAgdHVybGFyOiBzZWxlY3RlZENhdGVnb3JpZXMsXG4gICAgICAgICAgc291cmNlOiBcIkFncmlQaWVcIixcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIH0sXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICB9KSxcbiAgICApO1xuICB9O1xuXG4gIC8qIC0tLS0tLS0tLS0gRGF0YSBmZXRjaCAtLS0tLS0tLS0tICovXG4gIHByaXZhdGUgbWFrZVF1ZXJ5S2V5KFxuICAgIHlpbDogc3RyaW5nLFxuICAgIHZpbG95YXQ6IHN0cmluZyxcbiAgICB0dW1hbjogc3RyaW5nLFxuICAgIHZoOiBzdHJpbmcsXG4gICAgYmFyRmllbGQ/OiBzdHJpbmcgfCBudWxsLFxuICAgIGJhclZhbHVlPzogc3RyaW5nIHwgbnVsbCxcbiAgKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHlpbCB8fCBcIlwiLFxuICAgICAgdmlsb3lhdCB8fCBcIlwiLFxuICAgICAgdHVtYW4gfHwgXCJcIixcbiAgICAgIHZoIHx8IFwiXCIsXG4gICAgICBiYXJGaWVsZCA/PyBcIlwiLFxuICAgICAgYmFyVmFsdWUgPz8gXCJcIixcbiAgICBdLmpvaW4oXCJ8XCIpO1xuICB9XG5cbiAgLy8g4pyFIERlYm91bmNlZCBmZXRjaCB3aXRoIGRlLWR1cGxpY2F0aW9uXG4gIHByaXZhdGUgZmV0Y2hDYXRlZ29yeURhdGEgPSAoKTogdm9pZCA9PiB7XG4gICAgLy8gQ2xlYXIgYW55IHBlbmRpbmcgZmV0Y2hcbiAgICBpZiAodGhpcy5fZmV0Y2hEZWJvdW5jZVRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fZmV0Y2hEZWJvdW5jZVRpbWVyKTtcbiAgICB9XG5cbiAgICAvLyBTaG93IGxvYWRlciBpbW1lZGlhdGVseSBzbyBVSSBuZXZlciBmbGFzaGVzIFwibm8gZGF0YVwiIGR1cmluZyBkZWJvdW5jZS5cbiAgICBpZiAoIXRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUsIGVycm9yOiBudWxsIH0pO1xuICAgIH1cblxuICAgIC8vIFNob3J0IGRlYm91bmNlIHNvIHJlZ2lvbiBjaGFuZ2VzIGZlZWwgaW1tZWRpYXRlXG4gICAgdGhpcy5fZmV0Y2hEZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9kb0ZldGNoQ2F0ZWdvcnlEYXRhKCk7XG4gICAgfSwgMTYpO1xuICB9O1xuICBwcml2YXRlIGFzeW5jIF9kb0ZldGNoQ2F0ZWdvcnlEYXRhKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIE1hdGNoIEFncm9fd2lkZ2V0VjEgcXVlcnkga2V5IC8gcm91dGluZzogc2VsZWN0ZWQgdmlsb3lhdCBvbmx5XG4gICAgLy8gKGxvY2tlZFZpbG95YXQgc3RheXMgaW4gc3RhdGUgZm9yIFVJL2FjY2Vzcywgbm90IGluIHRoZSBzdGF0cyBrZXkpLlxuICAgIGNvbnN0IHNlbGVjdGVkVmlsb3lhdCA9ICh0aGlzLnN0YXRlLnZpbG95YXQgfHwgXCJcIikudHJpbSgpO1xuICAgIGNvbnN0IGtleSA9IHRoaXMubWFrZVF1ZXJ5S2V5KFxuICAgICAgdGhpcy5zdGF0ZS55aWwsXG4gICAgICBzZWxlY3RlZFZpbG95YXQsXG4gICAgICB0aGlzLnN0YXRlLnR1bWFuLFxuICAgICAgdGhpcy5zdGF0ZS52aCxcbiAgICAgIHRoaXMuc3RhdGUuYmFyQ2F0ZWdvcnlGaWVsZCxcbiAgICAgIHRoaXMuc3RhdGUuYmFyQ2F0ZWdvcnlWYWx1ZSxcbiAgICApO1xuXG4gICAgaWYgKGtleSA9PT0gdGhpcy5fbGFzdEZldGNoS2V5KSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZXF1aXJlcyBhdCBsZWFzdCB5aWw7IHZpbG95YXQgb3B0aW9uYWwgKGVtcHR5ID0gcmVwdWJsaWMtd2lkZSlcbiAgICBpZiAoIXRoaXMuc3RhdGUueWlsKSB7XG4gICAgICB0aGlzLl9sYXN0RmV0Y2hLZXkgPSBrZXk7XG4gICAgICB0aGlzLl9oYXNDb21wbGV0ZWRGZXRjaCA9IGZhbHNlO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNhdGVnb3J5RGF0YTogeyBjYXRlZ29yaWVzOiBbXSwgdG90YWxWYWx1ZTogMCB9LFxuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5jb25uZWN0aW9uU3RhdHVzICE9PSBcImNvbm5lY3RlZFwiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbGFzdEZldGNoS2V5ID0ga2V5O1xuICAgIHRoaXMuX2ZldGNoQ291bnRlcisrO1xuICAgIGNvbnN0IGZldGNoSWQgPSB0aGlzLl9mZXRjaENvdW50ZXI7XG5cbiAgICB0cnkge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUsIGVycm9yOiBudWxsIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IGxheWVyOiB0YWJsZUxheWVyIH0gPSBhd2FpdCBnZXRBZ3JpVGFibGVEYXRhTGF5ZXIoKTtcbiAgICAgIGNvbnN0IGNhdGVnb3J5RmllbGQgPVxuICAgICAgICB0aGlzLmZpbmRDYXRlZ29yeUZpZWxkKHRhYmxlTGF5ZXIgYXMgX19lc3JpLkZlYXR1cmVMYXllcikgfHwgXCJ0dXJpXCI7XG4gICAgICBpZiAoIWNhdGVnb3J5RmllbGQpIHtcbiAgICAgICAgdGhpcy5faGFzQ29tcGxldGVkRmV0Y2ggPSB0cnVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogXCJObyBjYXRlZ29yeSBmaWVsZCBmb3VuZC4gUGxlYXNlIGNoZWNrIHlvdXIgbGF5ZXIgZmllbGRzLlwiLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBpbmNsdWRlQ2F0ZWdvcnk6IGZhbHNlIOKAlCB0aGlzIHdpZGdldCBhbHdheXMgc2hvd3MgdGhlIGZ1bGwgY3JvcFxuICAgICAgLy8gYnJlYWtkb3duIChldmVyeSBzbGljZSksIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY3JvcCBpcyBjdXJyZW50bHlcbiAgICAgIC8vIHNlbGVjdGVkLiBUaGUgc2VsZWN0ZWQgY3JvcCBpcyBvbmx5IGV2ZXIgYSB2aXN1YWwgaGlnaGxpZ2h0XG4gICAgICAvLyAoc2VsZWN0ZWRDYXRlZ29yeS9hY3RpdmVTbGljZSksIG5ldmVyIGEgc2VsZi1maWx0ZXIgb24gdGhpcyBxdWVyeS5cbiAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclBpZUJ5VmggJiYgZ2V0UGllVmhGaWx0ZXJVbmlxdWVJZHMoKSA9PSBudWxsKSB7XG4gICAgICAgIC8vIExvY2FsaXphdGlvbiBwdWJsaXNoZXMgdW5pcXVlaWRzIGFmdGVyIG1hcCByZXNvbHZlOyByZXRyeSBicmllZmx5LlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDIwICYmIGdldFBpZVZoRmlsdGVyVW5pcXVlSWRzKCkgPT0gbnVsbDsgaSsrKSB7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgMTAwKSk7XG4gICAgICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgZmV0Y2hJZCAhPT0gdGhpcy5fZmV0Y2hDb3VudGVyKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdldFBpZVZoRmlsdGVyVW5pcXVlSWRzKCkgPT0gbnVsbCkge1xuICAgICAgICAgIC8vIFN0aWxsIG1pc3Npbmcg4oCUIHNob3cgZW1wdHkgcmF0aGVyIHRoYW4gYW4gdW5zY29wZWQgcGllLlxuICAgICAgICAgIGlmIChmZXRjaElkID09PSB0aGlzLl9mZXRjaENvdW50ZXIgJiYgdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9oYXNDb21wbGV0ZWRGZXRjaCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgY2F0ZWdvcnlEYXRhOiB7IGNhdGVnb3JpZXM6IFtdLCB0b3RhbFZhbHVlOiAwIH0sXG4gICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaWVWaFVuaXF1ZUlkc1NpZzogZ2V0UGllVmhGaWx0ZXJVbmlxdWVJZHNTaWcoKSB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzY29wZVZpbG95YXQgPSBTdHJpbmcoXG4gICAgICAgIHRoaXMuc3RhdGUudmlsb3lhdCB8fCB0aGlzLnN0YXRlLmxvY2tlZFZpbG95YXQgfHwgXCJcIixcbiAgICAgICkudHJpbSgpO1xuICAgICAgY29uc3Qgd2hlcmVDbGF1c2UgPSB0aGlzLmJ1aWxkV2hlcmVDbGF1c2VGb3JEUyh7XG4gICAgICAgIGluY2x1ZGVDYXRlZ29yeTogZmFsc2UsXG4gICAgICAgIC8vIFJlcHVibGljIChubyB2aWxveWF0KSBtdXN0IG5vdCBpbmhlcml0IGEgbGVmdG92ZXIgcmVnaW9uIHByZWRpY2F0ZS5cbiAgICAgICAgaW5jbHVkZVZpbG95YXQ6ICEhc2NvcGVWaWxveWF0LFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGxheWVyc0ZvclF1ZXJ5OiBfX2VzcmkuRmVhdHVyZUxheWVyW10gPSBbXG4gICAgICAgIHRhYmxlTGF5ZXIgYXMgX19lc3JpLkZlYXR1cmVMYXllcixcbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXA8c3RyaW5nLCB7IGtleTogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH0+KCk7XG4gICAgICBjb25zdCB2aENodW5rcyA9IHRoaXMuYnVpbGRQaWVWaFdoZXJlQ2h1bmtzKCk7XG4gICAgICBjb25zdCB3aGVyZVBhcnRzID1cbiAgICAgICAgdmhDaHVua3MgJiYgdmhDaHVua3MubGVuZ3RoXG4gICAgICAgICAgPyB2aENodW5rcy5tYXAoKGNodW5rKSA9PlxuICAgICAgICAgICAgICB3aGVyZUNsYXVzZSAmJiB3aGVyZUNsYXVzZSAhPT0gXCIxPTFcIlxuICAgICAgICAgICAgICAgID8gYCgke3doZXJlQ2xhdXNlfSkgQU5EICgke2NodW5rfSlgXG4gICAgICAgICAgICAgICAgOiBjaHVuayxcbiAgICAgICAgICAgIClcbiAgICAgICAgICA6IFt3aGVyZUNsYXVzZSB8fCBcIjE9MVwiXTtcblxuICAgICAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnNGb3JRdWVyeSkge1xuICAgICAgICBjb25zdCBsYXllckNhdGVnb3J5RmllbGQgPSB0aGlzLmZpbmRDYXRlZ29yeUZpZWxkKGxheWVyKTtcbiAgICAgICAgaWYgKCFsYXllckNhdGVnb3J5RmllbGQpIGNvbnRpbnVlO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGFydFdoZXJlIG9mIHdoZXJlUGFydHMpIHtcbiAgICAgICAgICBjb25zdCBwYXJ0ID0gYXdhaXQgdGhpcy5xdWVyeUNhdGVnb3J5U3RhdHNKU09OKFxuICAgICAgICAgICAgbGF5ZXIsXG4gICAgICAgICAgICBwYXJ0V2hlcmUsXG4gICAgICAgICAgICBsYXllckNhdGVnb3J5RmllbGQsXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGZvciAoY29uc3QgciBvZiBwYXJ0KSB7XG4gICAgICAgICAgICBjb25zdCBub3JtID0gdGhpcy5ub3JtYWxpemVOYW1lKHIua2V5IHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAoIW5vcm0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IG1lcmdlZC5nZXQobm9ybSk7XG4gICAgICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgICBwcmV2LnZhbHVlICs9IE51bWJlcihyLnZhbHVlIHx8IDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVyZ2VkLnNldChub3JtLCB7XG4gICAgICAgICAgICAgICAga2V5OiByLmtleSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogTnVtYmVyKHIudmFsdWUgfHwgMCksXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShtZXJnZWQudmFsdWVzKCkpO1xuXG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCB8fCBmZXRjaElkICE9PSB0aGlzLl9mZXRjaENvdW50ZXIpIHJldHVybjtcblxuICAgICAgY29uc3QgdG90YWxWYWx1ZSA9IHJvd3MucmVkdWNlKChzdW0sIHIpID0+IHN1bSArIHIudmFsdWUsIDApO1xuICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IHJvd3NcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKVxuICAgICAgICAubWFwKChyKSA9PiAoe1xuICAgICAgICAgIGtleTogci5rZXksXG4gICAgICAgICAgdmFsdWU6IHIudmFsdWUsXG4gICAgICAgICAgcGVyY2VudGFnZTogdG90YWxWYWx1ZSA/IChyLnZhbHVlIC8gdG90YWxWYWx1ZSkgKiAxMDAgOiAwLFxuICAgICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IHZhbGlkU2VsZWN0ZWRDYXRlZ29yaWVzID0gdGhpcy5zdGF0ZS5zZWxlY3RlZENhdGVnb3JpZXMuZmlsdGVyKFxuICAgICAgICAoc2VsZWN0ZWQpID0+XG4gICAgICAgICAgY2F0ZWdvcmllcy5zb21lKFxuICAgICAgICAgICAgKGNhdGVnb3J5KSA9PlxuICAgICAgICAgICAgICB0aGlzLm5vcm1hbGl6ZU5hbWUoY2F0ZWdvcnkua2V5KSA9PT0gdGhpcy5ub3JtYWxpemVOYW1lKHNlbGVjdGVkKSxcbiAgICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG5ld0FjdGl2ZVNsaWNlID0gY2F0ZWdvcmllcy5maW5kSW5kZXgoKGNhdGVnb3J5KSA9PlxuICAgICAgICB2YWxpZFNlbGVjdGVkQ2F0ZWdvcmllcy5zb21lKFxuICAgICAgICAgIChzZWxlY3RlZCkgPT5cbiAgICAgICAgICAgIHRoaXMubm9ybWFsaXplTmFtZShjYXRlZ29yeS5rZXkpID09PSB0aGlzLm5vcm1hbGl6ZU5hbWUoc2VsZWN0ZWQpLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHNpbmdsZVNlbGVjdGlvbiA9XG4gICAgICAgIHZhbGlkU2VsZWN0ZWRDYXRlZ29yaWVzLmxlbmd0aCA9PT0gMSA/IHZhbGlkU2VsZWN0ZWRDYXRlZ29yaWVzWzBdIDogXCJcIjtcblxuICAgICAgdGhpcy5faGFzQ29tcGxldGVkRmV0Y2ggPSB0cnVlO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNhdGVnb3J5RGF0YTogeyBjYXRlZ29yaWVzLCB0b3RhbFZhbHVlIH0sXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgYWN0aXZlU2xpY2U6IG5ld0FjdGl2ZVNsaWNlID49IDAgPyBuZXdBY3RpdmVTbGljZSA6IG51bGwsXG4gICAgICAgIHR1cmk6IHNpbmdsZVNlbGVjdGlvbixcbiAgICAgICAgdHVybGFyOiB2YWxpZFNlbGVjdGVkQ2F0ZWdvcmllcyxcbiAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogc2luZ2xlU2VsZWN0aW9uIHx8IG51bGwsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllczogdmFsaWRTZWxlY3RlZENhdGVnb3JpZXMsXG4gICAgICAgIGRlYnVnSW5mbzogYExvYWRlZCAke2NhdGVnb3JpZXMubGVuZ3RofSBjYXRlZ29yaWVzIChXSEVSRTogJHt3aGVyZUNsYXVzZX0pYCxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8IGZldGNoSWQgIT09IHRoaXMuX2ZldGNoQ291bnRlcikgcmV0dXJuO1xuXG4gICAgICB0aGlzLl9oYXNDb21wbGV0ZWRGZXRjaCA9IHRydWU7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgIGVycm9yOiBlcnJvcj8ubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBsb2FkIGRhdGEgZnJvbSBsYXllci5cIixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0gQ2hhcnQgLS0tLS0tLS0tLSAqL1xuXG4gIHByaXZhdGUgcmVuZGVyUmFkYXJQaWVDaGFydCA9IChcbiAgICBfY2hhcnREYXRhOiBhbnlbXSxcbiAgICBfY29udGFpbmVyV2lkdGg6IG51bWJlciA9IDMwMCxcbiAgICBfY29udGFpbmVySGVpZ2h0OiBudW1iZXIgPSAzMDAsXG4gICk6IEpTWC5FbGVtZW50ID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICByZWY9e3RoaXMuX3BpZUNoYXJ0UmVmfVxuICAgICAgICBjbGFzc05hbWU9XCJsYW5kLWNhdGVnb3J5LWVjaGFydFwiXG4gICAgICAvPlxuICAgICk7XG4gIH07XG5cbiAgLyogLS0tLS0tLS0tLSBSZW5kZXIgLS0tLS0tLS0tLSAqL1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICBsb2FkaW5nLFxuICAgICAgZXJyb3IsXG4gICAgICBjYXRlZ29yeURhdGEsXG4gICAgICBhY3RpdmVTbGljZSxcbiAgICAgIHNlbGVjdGVkQ2F0ZWdvcmllcyxcbiAgICAgIG1hcExvYWRpbmdTdGF0dXMsXG4gICAgICBjb25uZWN0aW9uU3RhdHVzLFxuICAgICAgZGVidWdJbmZvLFxuICAgICAgeWlsLFxuICAgICAgdmlsb3lhdCxcbiAgICAgIGxvY2tlZFZpbG95YXQsXG4gICAgICBsYW5ndWFnZSxcbiAgICAgIGlzRGFya1RoZW1lLFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgeyBjYXRlZ29yaWVzIH0gPSBjYXRlZ29yeURhdGE7XG5cbiAgICBjb25zdCBzb3J0ZWRDYXRlZ29yaWVzID0gWy4uLmNhdGVnb3JpZXNdLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKTtcbiAgICAvLyBEaXNwbGF5IGV2ZXJ5IGNyb3AgdHlwZSByZXR1cm5lZCBieSB0aGUgZ3JvdXBlZCBzZXJ2aWNlIHF1ZXJ5LiBUaGVcbiAgICAvLyBsZWdlbmQgaXMgc2Nyb2xsYWJsZSwgc28gYSBsb25nIGxpc3QgZG9lcyBub3Qgb3ZlcmZsb3cgdGhlIHdpZGdldC5cbiAgICBjb25zdCB2aXNpYmxlQ2F0ZWdvcmllcyA9IHNvcnRlZENhdGVnb3JpZXM7XG5cbiAgICBjb25zdCB0aGVtZUNsYXNzID0gaXNEYXJrVGhlbWUgPyBcImRhcmstdGhlbWVcIiA6IFwibGlnaHQtdGhlbWVcIjtcbiAgICBjb25zdCBhcmVhVW5pdCA9IGxhbmd1YWdlID09PSBcImVuXCIgPyBcImhhXCIgOiBsYW5ndWFnZSA9PT0gXCJ1el9sYXRcIiA/IFwiZ2FcIiA6IFwi0LPQsFwiO1xuXG4gICAgY29uc3QgdGl0bGVUZXh0ID1cbiAgICAgIGxhbmd1YWdlID09PSBcImVuXCJcbiAgICAgICAgPyBcIkNyb3AgVHlwZVwiXG4gICAgICAgIDogbGFuZ3VhZ2UgPT09IFwicnVcIlxuICAgICAgICA/IFwi0KLQuNC/INC60YPQu9GM0YLRg9GA0YtcIlxuICAgICAgICA6IGxhbmd1YWdlID09PSBcInV6X2xhdFwiXG4gICAgICAgICAgPyBcIkVraW4gVHVyaVwiXG4gICAgICAgICAgOiBcItCt0LrQuNC9INCi0YPRgNC4XCI7XG5cbiAgICBjb25zdCBjaGFydERhdGEgPSB2aXNpYmxlQ2F0ZWdvcmllcy5tYXAoKGNhdGVnb3J5KSA9PiAoe1xuICAgICAgbmFtZTogdGhpcy5nZXRDYXRlZ29yeURpc3BsYXlOYW1lKGNhdGVnb3J5LmtleSwgbGFuZ3VhZ2UpLFxuICAgICAgcmF3S2V5OiBjYXRlZ29yeS5rZXksXG4gICAgICB2YWx1ZTogY2F0ZWdvcnkudmFsdWUsXG4gICAgICBwZXJjZW50YWdlOiBjYXRlZ29yeS5wZXJjZW50YWdlLFxuICAgIH0pKTtcblxuICAgIGxldCBzdGF0dXNJbmRpY2F0b3I6XG4gICAgICB8IFwiaWRsZVwiXG4gICAgICB8IFwibG9hZGluZ1wiXG4gICAgICB8IFwiY29ubmVjdGluZ1wiXG4gICAgICB8IFwiY29ubmVjdGVkXCJcbiAgICAgIHwgXCJmYWlsZWRcIiA9IFwiaWRsZVwiO1xuICAgIGlmIChtYXBMb2FkaW5nU3RhdHVzID09PSBcImxvYWRpbmdcIikgc3RhdHVzSW5kaWNhdG9yID0gXCJsb2FkaW5nXCI7XG4gICAgZWxzZSBpZiAobWFwTG9hZGluZ1N0YXR1cyA9PT0gXCJsb2FkZWRcIiAmJiBjb25uZWN0aW9uU3RhdHVzID09PSBcImNvbm5lY3RpbmdcIilcbiAgICAgIHN0YXR1c0luZGljYXRvciA9IFwiY29ubmVjdGluZ1wiO1xuICAgIGVsc2UgaWYgKGNvbm5lY3Rpb25TdGF0dXMgPT09IFwiY29ubmVjdGVkXCIpIHN0YXR1c0luZGljYXRvciA9IFwiY29ubmVjdGVkXCI7XG4gICAgZWxzZSBpZiAobWFwTG9hZGluZ1N0YXR1cyA9PT0gXCJmYWlsZWRcIiB8fCBjb25uZWN0aW9uU3RhdHVzID09PSBcImZhaWxlZFwiKVxuICAgICAgc3RhdHVzSW5kaWNhdG9yID0gXCJmYWlsZWRcIjtcblxuICAgIGNvbnN0IHNob3dEZWJ1Z0luZm8gPSBmYWxzZTsgLy8g4pyFIERpc2FibGVkIGRlYnVnIHBhbmVsXG5cbiAgICBjb25zdCBmb3JtYXRBcmVhVmFsdWUgPSAodmFsdWU6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgc2FmZSA9IE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IDA7XG4gICAgICBjb25zdCBkaWdpdHMgPSBzYWZlID49IDEwMCA/IDAgOiBzYWZlID49IDEwID8gMSA6IDI7XG4gICAgICByZXR1cm4gc2FmZS50b0xvY2FsZVN0cmluZyhcInJ1LVJVXCIsIHtcbiAgICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBkaWdpdHMsXG4gICAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMCxcbiAgICAgIH0pLnJlcGxhY2UoLywvZywgXCIuXCIpO1xuICAgIH07XG5cbiAgICBjb25zdCBzbGljZUludGVyYWN0aXZlID0gISEobG9ja2VkVmlsb3lhdCB8fCB2aWxveWF0IHx8IFwiXCIpLnRyaW0oKTtcbiAgICBjb25zdCBpc0lwYWRMYXlvdXQgPSB0aGlzLmlzSXBhZExheW91dCgpO1xuICAgIGNvbnN0IGhhc0NoYXJ0RGF0YSA9IGNhdGVnb3JpZXMubGVuZ3RoID4gMDtcbiAgICBjb25zdCBhd2FpdGluZ0ZpcnN0RGF0YSA9ICF0aGlzLl9oYXNDb21wbGV0ZWRGZXRjaDtcblxuICAgIC8vIExvYWRlciB1bnRpbCBmaXJzdCBmZXRjaCBmaW5pc2hlcyDigJQgbmV2ZXIgZmxhc2ggXCJubyBkYXRhXCIgZHVyaW5nIGNvbm5lY3QvcmVmcmVzaC5cbiAgICBjb25zdCBzaG93QmxvY2tpbmdMb2FkZXIgPVxuICAgICAgIXlpbCB8fFxuICAgICAgbWFwTG9hZGluZ1N0YXR1cyA9PT0gXCJsb2FkaW5nXCIgfHxcbiAgICAgIGNvbm5lY3Rpb25TdGF0dXMgPT09IFwiaWRsZVwiIHx8XG4gICAgICBjb25uZWN0aW9uU3RhdHVzID09PSBcImNvbm5lY3RpbmdcIiB8fFxuICAgICAgKGNvbm5lY3Rpb25TdGF0dXMgPT09IFwiY29ubmVjdGVkXCIgJiZcbiAgICAgICAgIWhhc0NoYXJ0RGF0YSAmJlxuICAgICAgICAobG9hZGluZyB8fCBhd2FpdGluZ0ZpcnN0RGF0YSkpO1xuXG4gICAgLy8gT3ZlcmxheSBsb2FkZXIgb24gYW55IHN1YnNlcXVlbnQgZGF0YSBjaGFuZ2UgKHJlZ2lvbiwgeWVhciwgZmlsdGVyc+KApikuXG4gICAgY29uc3Qgc2hvd1JlZnJlc2hMb2FkZXIgPVxuICAgICAgY29ubmVjdGlvblN0YXR1cyA9PT0gXCJjb25uZWN0ZWRcIiAmJiBsb2FkaW5nICYmIGhhc0NoYXJ0RGF0YTtcblxuICAgIC8vIEVtcHR5IHN0YXRlIG9ubHkgYWZ0ZXIgYSByZWFsIGZldGNoIHJldHVybmVkIHplcm8gY2F0ZWdvcmllcy5cbiAgICBjb25zdCBzaG93Tm9EYXRhID1cbiAgICAgICEheWlsICYmXG4gICAgICBjb25uZWN0aW9uU3RhdHVzID09PSBcImNvbm5lY3RlZFwiICYmXG4gICAgICAhbG9hZGluZyAmJlxuICAgICAgdGhpcy5faGFzQ29tcGxldGVkRmV0Y2ggJiZcbiAgICAgICFoYXNDaGFydERhdGE7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BsYW5kLWNhdGVnb3J5LWNhcmQgJHt0aGVtZUNsYXNzfSR7XG4gICAgICAgICAgaXNJcGFkTGF5b3V0ID8gXCIgbGFuZC1jYXRlZ29yeS1jYXJkLS1pcGFkXCIgOiBcIlwiXG4gICAgICAgIH1gfVxuICAgICAgPlxuICAgICAgICB7c2hvd0RlYnVnSW5mbyAmJiAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGVidWctaW5mb1wiXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICB0b3A6IFwiNXB4XCIsXG4gICAgICAgICAgICAgIHJpZ2h0OiBcIjVweFwiLFxuICAgICAgICAgICAgICBmb250U2l6ZTogXCIxMHB4XCIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsMCwwLDAuNylcIixcbiAgICAgICAgICAgICAgY29sb3I6IFwiI2ZmZlwiLFxuICAgICAgICAgICAgICBwYWRkaW5nOiBcIjJweCA1cHhcIixcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBcIjNweFwiLFxuICAgICAgICAgICAgICBtYXhXaWR0aDogXCIyMDBweFwiLFxuICAgICAgICAgICAgICB6SW5kZXg6IDEwMDAsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXY+U3RhdHVzOiB7c3RhdHVzSW5kaWNhdG9yfTwvZGl2PlxuICAgICAgICAgICAgPGRpdj5NYXA6IHttYXBMb2FkaW5nU3RhdHVzfTwvZGl2PlxuICAgICAgICAgICAgPGRpdj5Db25uZWN0aW9uOiB7Y29ubmVjdGlvblN0YXR1c308L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+Q2F0ZWdvcmllczoge2NhdGVnb3JpZXMubGVuZ3RofTwvZGl2PlxuICAgICAgICAgICAgPGRpdj5EZWJ1Zzoge2RlYnVnSW5mb308L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICA8ZGl2XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgICAgIHpJbmRleDogMCxcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICBwb2ludGVyRXZlbnRzOiBcIm5vbmVcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3RoaXMucHJvcHMudXNlRGF0YVNvdXJjZXM/Lmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgICAgPERhdGFTb3VyY2VDb21wb25lbnRcbiAgICAgICAgICAgICAgdXNlRGF0YVNvdXJjZT17dGhpcy5wcm9wcy51c2VEYXRhU291cmNlc1swXX1cbiAgICAgICAgICAgICAgb25EYXRhU291cmNlQ3JlYXRlZD17dGhpcy5vbkRhdGFTb3VyY2VDcmVhdGVkfVxuICAgICAgICAgICAgICBvbkRhdGFTb3VyY2VJbmZvQ2hhbmdlPXt0aGlzLm9uRGF0YVNvdXJjZUluZm9DaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgICAge3RoaXMucHJvcHMudXNlTWFwV2lkZ2V0SWRzPy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgIDxKaW11TWFwVmlld0NvbXBvbmVudFxuICAgICAgICAgICAgICB1c2VNYXBXaWRnZXRJZD17dGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHNbMF19XG4gICAgICAgICAgICAgIG9uQWN0aXZlVmlld0NoYW5nZT17dGhpcy5vbkFjdGl2ZVZpZXdDaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGFuZC1jYXRlZ29yeS1jb250ZW50XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYW5kLWNhdGVnb3J5LWhlYWRlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYW5kLWNhdGVnb3J5LXRpdGxlLXdyYXBcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYW5kLWNhdGVnb3J5LXRpdGxlXCI+e3RpdGxlVGV4dH08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAge21hcExvYWRpbmdTdGF0dXMgPT09IFwiZmFpbGVkXCIgJiYgY29ubmVjdGlvblN0YXR1cyAhPT0gXCJjb25uZWN0ZWRcIiA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGFuZC1jYXRlZ29yeS1lcnJvclwiPlxuICAgICAgICAgICAgICA8VHJpYW5nbGVBbGVydCBjbGFzc05hbWU9XCJhZ3JpLWVtcHR5LXN0YXRlLWljb25cIiBzdHJva2VXaWR0aD17MS43fSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB7ZXJyb3IgfHwgXCLQpdCw0YDQuNGC0LDQs9CwINGD0LvQsNC90LjRiNC00LAg0YXQsNGC0L7Qu9C40LouINKa0LDQudGC0LAg0YPRgNC40L3QuNCxINC60Z7RgNC40L3Qsy5cIn1cbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5yZXRyeU1hcENvbm5lY3Rpb259XG4gICAgICAgICAgICAgICAgdHlwZT1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICDSmtCw0LnRgtCwINGD0LvQsNC90LjRiFxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBlcnJvciA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGFuZC1jYXRlZ29yeS1lcnJvclwiPlxuICAgICAgICAgICAgICA8VHJpYW5nbGVBbGVydCBjbGFzc05hbWU9XCJhZ3JpLWVtcHR5LXN0YXRlLWljb25cIiBzdHJva2VXaWR0aD17MS43fSBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICA8cD57ZXJyb3J9PC9wPlxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5mZXRjaENhdGVnb3J5RGF0YSgpfVxuICAgICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAg0prQsNC50YLQsCDRg9GA0LjQvdC40YhcbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogc2hvd0Jsb2NraW5nTG9hZGVyID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYW5kLWNhdGVnb3J5LWxvYWRpbmctY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgIDxBZ3JpQ2hhcnRMb2FkZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBzaG93Tm9EYXRhID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYW5kLWNhdGVnb3J5LW5vLWRhdGFcIj5cbiAgICAgICAgICAgICAgPFRyaWFuZ2xlQWxlcnQgY2xhc3NOYW1lPVwiYWdyaS1lbXB0eS1zdGF0ZS1pY29uXCIgc3Ryb2tlV2lkdGg9ezEuN30gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgPGgzPnthZ3JpTm9EYXRhTGFiZWwobGFuZ3VhZ2UpfTwvaDM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2BsYW5kLWNhdGVnb3J5LW1haW4tY29udGVudCR7XG4gICAgICAgICAgICAgICAgaXNJcGFkTGF5b3V0ID8gXCIgbGFuZC1jYXRlZ29yeS1tYWluLWNvbnRlbnQtLW5vLWxlZ2VuZFwiIDogXCJcIlxuICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3Nob3dSZWZyZXNoTG9hZGVyID8gPEFncmlDaGFydExvYWRlciAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BsYW5kLWNhdGVnb3J5LWNoYXJ0LWNvbnRhaW5lciR7XG4gICAgICAgICAgICAgICAgICBzaG93UmVmcmVzaExvYWRlciA/IFwiIGxhbmQtY2F0ZWdvcnktY2hhcnQtY29udGFpbmVyLS1sb2FkaW5nXCIgOiBcIlwiXG4gICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxhbmQtY2F0ZWdvcnktZWNoYXJ0LXN0YWdlXCI+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVyUmFkYXJQaWVDaGFydChjaGFydERhdGEsIDQwMCwgNDAwKX1cbiAgICAgICAgICAgICAgICB7IXNob3dSZWZyZXNoTG9hZGVyID8gKFxuICAgICAgICAgICAgICAgICAgKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5nZXRQaWVDZW50ZXJDb250ZW50KGNoYXJ0RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzTXVsdGlMYWJlbCA9XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yaWVzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgICAgICAgICAgICBjZW50ZXIubGFiZWwgIT09IHRoaXMuZ2V0Q2VudGVyQWxsTGFiZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxhbmQtY2F0ZWdvcnktcGllLWNlbnRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NlbnRlci5zaG93UGVyY2VudCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwibGFuZC1jYXRlZ29yeS1waWUtY2VudGVyLXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuZm9ybWF0Q2VudGVyUGVyY2VudChjZW50ZXIucGVyY2VudCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwibGFuZC1jYXRlZ29yeS1waWUtY2VudGVyLWFyZWFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuZm9ybWF0Q2VudGVyQXJlYShjZW50ZXIuYXJlYSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cFxuICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NlbnRlci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NlbnRlci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgbGFuZC1jYXRlZ29yeS1waWUtY2VudGVyLWxhYmVsIGxhbmQtY2F0ZWdvcnktcGllLWNlbnRlci1sYWJlbC0tbXV0ZWQgbGFuZC1jYXRlZ29yeS1waWUtY2VudGVyLWxpbmUtLWVudGVyJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc011bHRpTGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCIgbGFuZC1jYXRlZ29yeS1waWUtY2VudGVyLWxhYmVsLS1tdWx0aVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtjZW50ZXIubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9KSgpXG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHtpc0lwYWRMYXlvdXQgPyBudWxsIDogKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY2F0ZWdvcnktbGVnZW5kXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgLy8gQWx3YXlzIGFsbG93IHNjcm9sbDsgb25seSBjbGlja3MgYXJlIGdhdGVkIGJ5IHNsaWNlSW50ZXJhY3RpdmUuXG4gICAgICAgICAgICAgICAgICBwb2ludGVyRXZlbnRzOiBzaG93UmVmcmVzaExvYWRlciA/IFwibm9uZVwiIDogXCJhdXRvXCIsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiBzaG93UmVmcmVzaExvYWRlciA/IDAuMzUgOiAxLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgYXJpYS1kaXNhYmxlZD17c2hvd1JlZnJlc2hMb2FkZXJ9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNhdGVnb3J5LWxlZ2VuZC1pbm5lclwiPlxuICAgICAgICAgICAgICAgIHtjaGFydERhdGEubWFwKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGFjY2VudENvbG9yID0gdGhpcy5nZXRDcm9wQ29sb3IoXG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnJhd0tleSB8fCBlbnRyeS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICBrZXk9e2VudHJ5LnJhd0tleSB8fCBlbnRyeS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGxlZ2VuZC1pdGVtICR7c2VsZWN0ZWRDYXRlZ29yaWVzLnNvbWUoKHNlbGVjdGVkKSA9PiB0aGlzLm5vcm1hbGl6ZU5hbWUoc2VsZWN0ZWQpID09PSB0aGlzLm5vcm1hbGl6ZU5hbWUoZW50cnkucmF3S2V5IHx8IGVudHJ5Lm5hbWUpKSA/IFwibGVnZW5kLWl0ZW0tc2VsZWN0ZWRcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpY2VJbnRlcmFjdGl2ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTbGljZUNsaWNrKGVudHJ5LCBpbmRleClcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IHNsaWNlSW50ZXJhY3RpdmUgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludGVyRXZlbnRzOiBzbGljZUludGVyYWN0aXZlID8gXCJhdXRvXCIgOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiLS1sZWdlbmQtYWNjZW50XCIgYXMgYW55XTogYWNjZW50Q29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGFzIGFueVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImxlZ2VuZC1jb2xvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IGFjY2VudENvbG9yIH19XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJsZWdlbmQtbGFiZWxcIiB0aXRsZT17ZW50cnkubmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZW50cnkubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibGVnZW5kLXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJsZWdlbmQtYXJlYS12YWx1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7YCR7Zm9ybWF0QXJlYVZhbHVlKE51bWJlcihlbnRyeS52YWx1ZSkgfHwgMCl9ICR7YXJlYVVuaXR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=