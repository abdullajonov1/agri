"use strict";
(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_Agri3_Agro_widgetV5_src_embedded_AgriBar10_runtime_widget_tsx"],{

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriBar10/runtime/widget.tsx":
/*!***********************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriBar10/runtime/widget.tsx ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (/* binding */ AgriBar)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var recharts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! recharts */ "./node_modules/recharts/es6/component/ResponsiveContainer.js");
/* harmony import */ var recharts__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! recharts */ "./node_modules/recharts/es6/chart/BarChart.js");
/* harmony import */ var recharts__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! recharts */ "./node_modules/recharts/es6/cartesian/XAxis.js");
/* harmony import */ var recharts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! recharts */ "./node_modules/recharts/es6/cartesian/YAxis.js");
/* harmony import */ var recharts__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! recharts */ "./node_modules/recharts/es6/cartesian/Bar.js");
/* harmony import */ var _shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/AgriChartLoader */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/AgriChartLoader.tsx");
/* harmony import */ var _shared_agriNoDataLabel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/agriNoDataLabel */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/shared/agriNoDataLabel.ts");
/* harmony import */ var _statusBarShape__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./statusBarShape */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriBar10/runtime/statusBarShape.tsx");
/* harmony import */ var _data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../data/agri-filter-bus */ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/data/agri-filter-bus.ts");
// VH Categories Widget - Display only. Filter state from AgriFilter via shared filter store.








// VH category definitions with colors
const VH_CATEGORIES = [
    { value: "1-Juda yaxshi", label: "Жуда яхши", order: 1, color: "#16a34a" },
    { value: "2-Yaxshi", label: "Яхши", order: 2, color: "#4ade80" },
    { value: "3-O'rta", label: "Ўрта", order: 3, color: "#f97316" },
    { value: "4-Past", label: "Паст", order: 4, color: "#ef4444" },
];
const BAR_ANIM_MS = 680;
const BAR_STAGGER_MS = 70;
const StatusBarChart = (props) => {
    const { fill, color, chartKey, animate, animIndex, selected, dimmed, theme } = props;
    const data = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => [{ fill }], [fill]);
    const barShape = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => (p) => (0,_statusBarShape__WEBPACK_IMPORTED_MODULE_4__.renderStatusBarShape)(p, color, selected, dimmed, theme), [color, selected, dimmed, theme]);
    const toneClass = selected
        ? "agri-status-chart--selected"
        : dimmed
            ? "agri-status-chart--dimmed"
            : "";
    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(recharts__WEBPACK_IMPORTED_MODULE_6__.ResponsiveContainer, { width: "100%", height: "100%", minWidth: 0, className: `agri-status-chart ${toneClass}`.trim() },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(recharts__WEBPACK_IMPORTED_MODULE_7__.BarChart, { key: chartKey, data: data, margin: { top: 0, right: 0, left: 0, bottom: 0 }, barCategoryGap: 0 },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(recharts__WEBPACK_IMPORTED_MODULE_8__.XAxis, { hide: true }),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(recharts__WEBPACK_IMPORTED_MODULE_9__.YAxis, { domain: [0, 1], hide: true }),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(recharts__WEBPACK_IMPORTED_MODULE_10__.Bar, { dataKey: "fill", shape: barShape, isAnimationActive: animate, animationDuration: BAR_ANIM_MS, animationBegin: animIndex * BAR_STAGGER_MS, animationEasing: "ease-in-out" }))));
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
class AgriBar extends jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.PureComponent {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this._unbindMasterFilter = null;
        this._containerRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createRef();
        this._resizeObserver = null;
        /** True only after at least one VH bar payload finished (success or empty). */
        this._hasCompletedFetch = false;
        this.normalizeLanguage = (raw) => {
            const v = String(raw || "")
                .trim()
                .toLowerCase();
            if (v === "en" || v === "english")
                return "en";
            if (v === "ru" || v === "russian")
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
            catch (_e) {
                return "uz_lat";
            }
        };
        this.initializeTheme = () => {
            const savedTheme = localStorage.getItem("agri_v11_app_theme");
            const isDarkTheme = savedTheme === "dark";
            this.setState({ isDarkTheme });
        };
        this.getLocalizedCategoryLabel = (category, language) => {
            const base = category.trim();
            if (base === "1-Juda yaxshi") {
                if (language === "en")
                    return "Excellent";
                if (language === "ru")
                    return "Очень хороший";
                if (language === "uz_lat")
                    return "A'lo";
                return "Жуда яхши";
            }
            if (base === "2-Yaxshi") {
                if (language === "en")
                    return "Good";
                if (language === "ru")
                    return "Хороший";
                if (language === "uz_lat")
                    return "Yaxshi";
                return "Яхши";
            }
            if (base === "3-O'rta") {
                if (language === "en")
                    return "Moderate";
                if (language === "ru")
                    return "Средний";
                if (language === "uz_lat")
                    return "O'rta";
                return "Ўрта";
            }
            if (base === "4-Past") {
                if (language === "en")
                    return "Poor";
                if (language === "ru")
                    return "Низкий";
                if (language === "uz_lat")
                    return "Past";
                return "Паст";
            }
            return category;
        };
        this.handleMasterFilterChange = (event) => {
            var _a, _b, _c;
            const d = event.detail || {};
            if (!d.filters)
                return;
            const nextYear = d.filters.yil || "";
            const nextLockedVil = ((_a = d === null || d === void 0 ? void 0 : d.scope) === null || _a === void 0 ? void 0 : _a.lockedViloyat)
                ? String(d.scope.lockedViloyat)
                : null;
            const nextVil = nextLockedVil || d.filters.viloyat || "";
            const nextTum = d.filters.tuman || "";
            const nextTurlar = Array.isArray(d.filters.turlar)
                ? d.filters.turlar.map((value) => String(value || "")).filter(Boolean)
                : d.filters.turi
                    ? [String(d.filters.turi)]
                    : [];
            const nextTur = nextTurlar.length === 1 ? nextTurlar[0] : "";
            const nextVh = d.filters.vh || "";
            const nextLanguage = d.filters.language || this.state.language || "ru";
            const vhBarDataPending = d.vhBarDataPending === true;
            if (vhBarDataPending) {
                // Geography/filter changed — show loader immediately even if old bars
                // are still on screen, so crop/VH updates feel instant.
                this.setState({
                    selectedYear: nextYear,
                    selectedViloyat: nextVil,
                    selectedTuman: nextTum,
                    selectedtur: nextTur,
                    selectedturlar: nextTurlar,
                    selectedVHCategory: nextVh ? nextVh : null,
                    loading: true,
                    error: null,
                    language: nextLanguage,
                    lockedViloyat: nextLockedVil,
                });
                return;
            }
            const vhBarData = (_b = d.vhBarData) !== null && _b !== void 0 ? _b : null;
            const nextVhData = {
                categories: ((vhBarData === null || vhBarData === void 0 ? void 0 : vhBarData.categories) || []).map((c) => (Object.assign(Object.assign({}, c), { label: this.getLocalizedCategoryLabel(c.category || c.label, nextLanguage) }))),
                totalCount: (_c = vhBarData === null || vhBarData === void 0 ? void 0 : vhBarData.totalCount) !== null && _c !== void 0 ? _c : 0,
            };
            this._hasCompletedFetch = true;
            this.setState({
                selectedYear: nextYear,
                selectedViloyat: nextVil,
                selectedTuman: nextTum,
                selectedtur: nextTur,
                selectedturlar: nextTurlar,
                // Keep VH selection in sync with master filter; clear when filter sends empty.
                selectedVHCategory: nextVh ? nextVh : null,
                vhData: nextVhData,
                loading: false,
                error: null,
                language: nextLanguage,
                lockedViloyat: nextLockedVil,
            });
        };
        this._onReset = () => {
            if (!this._isMounted)
                return;
            this._hasCompletedFetch = false;
            this.setState({
                selectedYear: "",
                selectedViloyat: "",
                selectedTuman: "",
                selectedtur: "",
                selectedturlar: [],
                selectedVHCategory: null,
                vhData: { categories: [], totalCount: 0 },
                loading: false,
                error: null,
                lockedViloyat: null,
            });
        };
        /** Debounce rapid bar clicks so Localization only resolves the last VH. */
        this._vhDispatchTimer = null;
        this.handleVHSelectionClick = (arg) => {
            var _a, _b, _c;
            const effectiveVil = (this.state.lockedViloyat ||
                this.state.selectedViloyat ||
                "").trim();
            // Map filter needs a selected viloyat (region-year MapImage layers).
            if (!effectiveVil)
                return;
            const vhValue = (_c = (_a = arg === null || arg === void 0 ? void 0 : arg.category) !== null && _a !== void 0 ? _a : (_b = arg === null || arg === void 0 ? void 0 : arg.payload) === null || _b === void 0 ? void 0 : _b.category) !== null && _c !== void 0 ? _c : null;
            if (vhValue == null)
                return;
            const newSelection = vhValue === this.state.selectedVHCategory ? null : vhValue;
            // Keep previous chart visible — category counts do not change on VH toggle.
            this.setState({ selectedVHCategory: newSelection, error: null });
            // Only send vh — do not re-broadcast geography (that can look like a
            // region/tuman change and wipe the VH selection in Localization).
            const detail = {
                source: "AgriBar",
                vh: newSelection || "",
                language: this.state.language,
            };
            if (this._vhDispatchTimer)
                clearTimeout(this._vhDispatchTimer);
            this._vhDispatchTimer = setTimeout(() => {
                this._vhDispatchTimer = null;
                if (!this._isMounted)
                    return;
                document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
                    detail,
                    bubbles: true,
                }));
            }, 40);
        };
        /** Display-only: VH data comes from AgriFilter via masterFilterChanged.vhBarData */
        this.formatNumber = (value, decimals = 0) => {
            if (value === null || value === undefined)
                return "-";
            return Number(value).toFixed(decimals);
        };
        this.formatCount = (value) => {
            return new Intl.NumberFormat("ru-RU").format(Math.ceil(Number(value) || 0));
        };
        this._isMounted = false;
        const initialLanguage = this.resolveInitialLanguage();
        this.state = {
            loading: false,
            error: null,
            vhData: { categories: [], totalCount: 0 },
            selectedViloyat: "",
            selectedYear: "",
            selectedtur: "",
            selectedturlar: [],
            selectedTuman: "",
            selectedVHCategory: null,
            displayCount: -1,
            sortOrder: "desc",
            isDarkTheme: false,
            language: initialLanguage,
            lockedViloyat: null,
            widgetSize: "lg",
            compactHeight: false,
        };
        this.handleVHSelectionClick = this.handleVHSelectionClick.bind(this);
        this.handleDisplayCountChange = this.handleDisplayCountChange.bind(this);
        this.toggleSortOrder = this.toggleSortOrder.bind(this);
        this.handleThemeChange = this.handleThemeChange.bind(this);
        this.formatNumber = this.formatNumber.bind(this);
    }
    componentDidMount() {
        this._isMounted = true;
        this.initializeTheme();
        this._unbindMasterFilter = (0,_data_agri_filter_bus__WEBPACK_IMPORTED_MODULE_5__.bindMasterFilter)(this.handleMasterFilterChange);
        document.addEventListener("agriV11ThemeToggled", this.handleThemeChange);
        document.addEventListener("resetAllFilters", this._onReset);
        // responsive sizing (deferred to ensure DOM is ready)
        setTimeout(() => {
            if (this._isMounted &&
                this._containerRef.current &&
                typeof ResizeObserver !== "undefined") {
                this._resizeObserver = new ResizeObserver((entries) => {
                    var _a, _b, _c, _d, _f, _g;
                    const w = (_c = (_b = (_a = entries[0]) === null || _a === void 0 ? void 0 : _a.contentRect) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : 0;
                    const h = (_g = (_f = (_d = entries[0]) === null || _d === void 0 ? void 0 : _d.contentRect) === null || _f === void 0 ? void 0 : _f.height) !== null && _g !== void 0 ? _g : 0;
                    const next = w < 220 ? "xs" : w < 340 ? "sm" : w < 500 ? "md" : "lg";
                    const compactHeight = h > 0 && h < 260;
                    if (next !== this.state.widgetSize ||
                        compactHeight !== this.state.compactHeight) {
                        this.setState({ widgetSize: next, compactHeight });
                    }
                });
                this._resizeObserver.observe(this._containerRef.current);
            }
        }, 0);
        if (this.props.externalFilters) {
            this.setState({
                selectedViloyat: this.props.externalFilters.viloyat || "",
                selectedTuman: this.props.externalFilters.tuman || "",
                selectedYear: this.props.externalFilters.yil || "",
                selectedtur: this.props.externalFilters.tur || "",
                lockedViloyat: null,
            });
        }
    }
    componentWillUnmount() {
        var _a;
        this._isMounted = false;
        if (this._vhDispatchTimer) {
            clearTimeout(this._vhDispatchTimer);
            this._vhDispatchTimer = null;
        }
        (_a = this._unbindMasterFilter) === null || _a === void 0 ? void 0 : _a.call(this);
        this._unbindMasterFilter = null;
        document.removeEventListener("agriV11ThemeToggled", this.handleThemeChange);
        document.removeEventListener("resetAllFilters", this._onReset);
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.externalFilters !== prevProps.externalFilters &&
            this.props.externalFilters) {
            this.updateFiltersFromProps(this.props.externalFilters);
        }
    }
    handleThemeChange(event) {
        const detail = event === null || event === void 0 ? void 0 : event.detail;
        if (detail && typeof detail.isDarkTheme === "boolean") {
            const { isDarkTheme } = detail;
            this.setState({ isDarkTheme });
        }
    }
    updateFiltersFromProps(filters) {
        try {
            this.setState({
                selectedViloyat: (filters.viloyat || "").trim(),
                selectedTuman: (filters.tuman || "").trim(),
                selectedYear: filters.yil ? String(filters.yil) : "",
                selectedtur: (filters.tur || "").trim(),
                error: null,
                lockedViloyat: null,
            });
        }
        catch (_) { }
    }
    handleDisplayCountChange(count) {
        this.setState({ displayCount: isNaN(count) ? -1 : count });
    }
    toggleSortOrder() {
        const newOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
        this.setState({ sortOrder: newOrder });
    }
    render() {
        const { loading, error, vhData, selectedVHCategory, displayCount, isDarkTheme, selectedYear, selectedViloyat, lockedViloyat, language, } = this.state;
        const effectiveViloyat = (lockedViloyat || selectedViloyat || "").trim();
        const chartInteractive = !!effectiveViloyat;
        const areaUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";
        const theme = isDarkTheme ? "dark" : "light";
        const titleText = language === "en"
            ? "Vegetation Status"
            : language === "ru"
                ? "Состояние вегетации"
                : language === "uz_lat"
                    ? "Vegetatsiya Holati"
                    : "Вегетация Ҳолати";
        const selectRegionTitle = language === "en"
            ? "Select a region"
            : language === "ru"
                ? "Выберите регион"
                : language === "uz_lat"
                    ? "Viloyatni tanlang"
                    : "Вилоятни танланг";
        const selectRegionBody = language === "en"
            ? "Select a region first to view vegetation status"
            : language === "ru"
                ? "Чтобы увидеть состояние вегетации, сначала выберите регион"
                : language === "uz_lat"
                    ? "Vegetatsiya holatini ko‘rish uchun avval viloyatni tanlang"
                    : "Вегетация ҳолатини кўриш учун аввал вилоятни танланг";
        const sortedCategories = [...vhData.categories].sort((a, b) => a.order - b.order);
        const limitedCategories = displayCount === -1
            ? sortedCategories
            : sortedCategories.slice(0, displayCount);
        const denom = vhData.totalCount > 0 ? vhData.totalCount : 1;
        const chartData = limitedCategories.map((catItem) => {
            const color = catItem.color || "#94a3b8";
            return Object.assign(Object.assign({}, catItem), { color, fill: Math.max(0, Math.min(1, (catItem.count || 0) / denom)) });
        });
        const hasSelection = !!selectedVHCategory;
        const themeClass = isDarkTheme ? "dark-theme" : "light-theme";
        const hasChartData = vhData.categories.length > 0 && vhData.totalCount > 0;
        const awaitingFirstData = !this._hasCompletedFetch;
        // Loader until first fetch finishes — never flash "no data" during connect/refresh.
        const showBlockingLoader = !selectedYear ||
            (!hasChartData && (loading || awaitingFirstData));
        // Overlay loader on any subsequent data change while previous bars remain.
        const showRefreshLoader = loading && hasChartData;
        // Empty state only after a real fetch returned zero categories.
        const showNoData = !!selectedYear &&
            !loading &&
            this._hasCompletedFetch &&
            !hasChartData;
        return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { ref: this._containerRef, className: `construction-years-card ${themeClass}`, "data-bar-size": this.state.widgetSize, "data-compact-height": this.state.compactHeight ? "true" : "false" },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "construction-years-content" },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "construction-years-header" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "construction-years-header-title" }, titleText)),
                error ? (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "construction-years-error" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], { className: "agri-empty-state-icon", strokeWidth: 1.7, "aria-hidden": "true" }),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", null, error))) : showBlockingLoader ? (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "construction-years-loading-container" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_2__["default"], null))) : showNoData ? (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "construction-years-no-data" },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], { className: "agri-empty-state-icon", strokeWidth: 1.7, "aria-hidden": "true" }),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("h3", null, (0,_shared_agriNoDataLabel__WEBPACK_IMPORTED_MODULE_3__.agriNoDataLabel)(language)))) : (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: `agri-status-root${selectedVHCategory ? " has-selection" : ""}${showRefreshLoader ? " agri-status-root--loading" : ""}${!chartInteractive ? " agri-status-root--no-region" : ""}`, style: {
                        pointerEvents: "auto",
                        opacity: chartInteractive ? 1 : 0.92,
                    }, "aria-disabled": !chartInteractive, title: !chartInteractive
                        ? `${selectRegionTitle}. ${selectRegionBody}`
                        : undefined },
                    showRefreshLoader ? jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(_shared_AgriChartLoader__WEBPACK_IMPORTED_MODULE_2__["default"], null) : null,
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "agri-status-grid", role: "list", "aria-label": titleText }, chartData.map((item, index) => {
                        const selected = selectedVHCategory === item.category;
                        const dimmed = hasSelection && !selected;
                        return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { key: item.category, type: "button", role: "listitem", "aria-pressed": selected, disabled: !chartInteractive || showRefreshLoader, className: [
                                "agri-status-col",
                                "agri-status-col-button",
                                selected ? "agri-status-col--selected" : "",
                                dimmed ? "agri-status-col--dimmed" : "",
                            ]
                                .filter(Boolean)
                                .join(" "), style: { ["--accent"]: item.color }, onClick: () => chartInteractive &&
                                !showRefreshLoader &&
                                this.handleVHSelectionClick(item), onKeyDown: (e) => {
                                if (!chartInteractive || showRefreshLoader)
                                    return;
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    this.handleVHSelectionClick(item);
                                }
                            } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "agri-status-text" },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "agri-status-value-wrap" },
                                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "agri-status-value" },
                                        this.formatCount(item.count),
                                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { className: "agri-status-unit" },
                                            "\u00A0",
                                            areaUnit))),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "agri-status-label" }, item.label)),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "agri-status-bar-area", "aria-hidden": "true" },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(StatusBarChart, { fill: item.fill, color: item.color, chartKey: `${item.category}-${item.count}`, animate: true, animIndex: index, selected: selected, dimmed: dimmed, theme: theme }))));
                    })))))));
    }
}
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }


/***/ }),

/***/ "./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriBar10/runtime/statusBarShape.tsx":
/*!*******************************************************************************************************!*\
  !*** ./your-extensions/widgets/Agri3/Agro_widgetV5/src/embedded/AgriBar10/runtime/statusBarShape.tsx ***!
  \*******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderStatusBarShape: () => (/* binding */ renderStatusBarShape)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");

const MIN_BAR_PX = 8;
/** Diagonal cut depth on the top edge (left high → right low). */
const TOP_SLANT_RATIO = 0.14;
const TOP_SLANT_MAX = 18;
/** Tailwind *-50 equivalents for VH bar fills. */
const VH_STATUS_TRACK_50 = {
    "#16a34a": "#f0fdf4", // green-50
    "#4ade80": "#f0fdf4", // green-50
    "#f97316": "#fff7ed", // orange-50
    "#ef4444": "#fef2f2", // red-50
};
function statusTrackColor(barColor, theme) {
    const key = String(barColor || "").trim().toLowerCase();
    const light50 = VH_STATUS_TRACK_50[key] ||
        VH_STATUS_TRACK_50[key.toUpperCase()] ||
        `color-mix(in srgb, ${barColor} 14%, #ffffff)`;
    if (theme === "light")
        return light50;
    // Dark theme: soft tint of the same bar color
    return `color-mix(in srgb, ${barColor} 22%, transparent)`;
}
/**
 * Vertical bar with slanted top + border-radius on top and bottom corners.
 */
function slantedBarPath(x, y, w, h, radius) {
    if (w <= 0 || h <= 0)
        return "";
    const slant = Math.min(TOP_SLANT_MAX, Math.max(6, w * TOP_SLANT_RATIO));
    const r = Math.min(radius, w / 2, h / 2);
    const bottomY = y + h;
    // Too short for full rounded + slant geometry — keep a soft slanted tip.
    if (h < r * 2 + slant * 0.5) {
        const tinySlant = Math.min(slant, Math.max(2, h * 0.4));
        const tinyR = Math.min(r, h / 3, w / 3);
        return [
            `M ${x + tinyR} ${y}`,
            `L ${x + w - tinyR} ${y + tinySlant}`,
            `Q ${x + w} ${y + tinySlant} ${x + w} ${y + tinySlant + tinyR}`,
            `L ${x + w} ${bottomY - tinyR}`,
            `Q ${x + w} ${bottomY} ${x + w - tinyR} ${bottomY}`,
            `L ${x + tinyR} ${bottomY}`,
            `Q ${x} ${bottomY} ${x} ${bottomY - tinyR}`,
            `L ${x} ${y + tinyR}`,
            `Q ${x} ${y} ${x + tinyR} ${y}`,
            "Z",
        ].join(" ");
    }
    const topRightStartY = y + slant;
    const rightAfterRound = topRightStartY + r;
    return [
        // Top-left rounded corner
        `M ${x} ${y + r}`,
        `Q ${x} ${y} ${x + r} ${y}`,
        // Slanted top edge
        `L ${x + w - r} ${topRightStartY}`,
        // Top-right rounded corner into the right wall
        `Q ${x + w} ${topRightStartY} ${x + w} ${rightAfterRound}`,
        // Right side down to bottom-right round
        `L ${x + w} ${bottomY - r}`,
        `Q ${x + w} ${bottomY} ${x + w - r} ${bottomY}`,
        // Bottom edge
        `L ${x + r} ${bottomY}`,
        `Q ${x} ${bottomY} ${x} ${bottomY - r}`,
        // Left side back up
        "Z",
    ].join(" ");
}
function renderStatusBarShape(props, color, selected, dimmed, theme) {
    var _a, _b, _c, _d;
    const x = (_a = props.x) !== null && _a !== void 0 ? _a : 0;
    const rawH = (_b = props.height) !== null && _b !== void 0 ? _b : 0;
    const w = (_c = props.width) !== null && _c !== void 0 ? _c : 0;
    const plotBottom = ((_d = props.y) !== null && _d !== void 0 ? _d : 0) + rawH;
    const fillRatio = props.payload &&
        typeof props.payload === "object" &&
        "fill" in props.payload
        ? Math.max(0, Math.min(1, Number(props.payload.fill)))
        : 0;
    const fullH = fillRatio > 0 ? rawH / fillRatio : Math.max(rawH, MIN_BAR_PX);
    const h = Math.max(rawH, MIN_BAR_PX);
    const y = plotBottom - h;
    const radius = Math.min(10, w / 2);
    const trackY = plotBottom - fullH;
    const trackColor = statusTrackColor(color, theme);
    const opacity = dimmed ? 0.68 : 1;
    const barPath = slantedBarPath(x, y, w, h, radius);
    const trackPath = slantedBarPath(x, trackY, w, fullH, radius);
    const glowId = `vh-bar-glow-${String(color || "c").replace(/[^a-zA-Z0-9]/g, "")}`;
    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("g", { className: "agri-status-bar-shape", style: { opacity } },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("defs", null,
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("filter", { id: glowId, x: "-60%", y: "-40%", width: "220%", height: "180%", filterUnits: "objectBoundingBox", colorInterpolationFilters: "sRGB" },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "3.2", result: "blur" }),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("feColorMatrix", { in: "blur", type: "matrix", values: "1 0 0 0 0\n                    0 1 0 0 0\n                    0 0 1 0 0\n                    0 0 0 0.55 0", result: "soft" }),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("feMerge", null,
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("feMergeNode", { in: "soft" })))),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("path", { d: trackPath, fill: trackColor }),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("path", { d: barPath, fill: color, filter: `url(#${glowId})`, style: { pointerEvents: "none" } }),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("path", { d: barPath, fill: color }),
        selected ? (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("path", { d: barPath, fill: "none", stroke: color, strokeWidth: 2.25, style: { pointerEvents: "none" } })) : null));
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvQWdyaTNfQWdyb193aWRnZXRWNV9zcmNfZW1iZWRkZWRfQWdyaUJhcjEwX3J1bnRpbWVfd2lkZ2V0X3RzeC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZGQUE2RjtBQUUzQztBQUNMO0FBQ2I7QUFPZDtBQUM0QztBQUNJO0FBQ1Y7QUFDUztBQUVqRSxzQ0FBc0M7QUFDdEMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO0lBQzFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtJQUNoRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7SUFDL0QsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO0NBQy9ELENBQUM7QUFFRixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDeEIsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBSTFCLE1BQU0sY0FBYyxHQUFHLENBQUMsS0FTdkIsRUFBRSxFQUFFO0lBQ0gsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FDMUUsS0FBSyxDQUFDO0lBQ1IsTUFBTSxJQUFJLEdBQUcsOENBQU8sQ0FBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLElB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QyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQ1YscUVBQ0UsQ0FBQyxFQUFFLE9BQU8sRUFDVixJQUFJLEVBQUMsTUFBTSxFQUNYLE1BQU0sRUFBRSxLQUFLLEVBQ2IsV0FBVyxFQUFFLElBQUksRUFDakIsS0FBSyxFQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUNoQyxDQUNILENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDTixDQUNMLENBQUM7QUFDSixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2VtYmVkZGVkL0FncmlCYXIxMC9ydW50aW1lL3dpZGdldC50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0FncmkzL0Fncm9fd2lkZ2V0VjUvc3JjL2VtYmVkZGVkL0FncmlCYXIxMC9ydW50aW1lL3N0YXR1c0JhclNoYXBlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBWSCBDYXRlZ29yaWVzIFdpZGdldCAtIERpc3BsYXkgb25seS4gRmlsdGVyIHN0YXRlIGZyb20gQWdyaUZpbHRlciB2aWEgc2hhcmVkIGZpbHRlciBzdG9yZS5cblxuaW1wb3J0IHsgQWxsV2lkZ2V0UHJvcHMsIFJlYWN0IH0gZnJvbSBcImppbXUtY29yZVwiO1xuaW1wb3J0IHsgVHJpYW5nbGVBbGVydCB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIEJhcixcbiAgQmFyQ2hhcnQsXG4gIFJlc3BvbnNpdmVDb250YWluZXIsXG4gIFhBeGlzLFxuICBZQXhpcyxcbn0gZnJvbSBcInJlY2hhcnRzXCI7XG5pbXBvcnQgQWdyaUNoYXJ0TG9hZGVyIGZyb20gXCIuLi8uLi8uLi9zaGFyZWQvQWdyaUNoYXJ0TG9hZGVyXCI7XG5pbXBvcnQgeyBhZ3JpTm9EYXRhTGFiZWwgfSBmcm9tIFwiLi4vLi4vLi4vc2hhcmVkL2FncmlOb0RhdGFMYWJlbFwiO1xuaW1wb3J0IHsgcmVuZGVyU3RhdHVzQmFyU2hhcGUgfSBmcm9tIFwiLi9zdGF0dXNCYXJTaGFwZVwiO1xuaW1wb3J0IHsgYmluZE1hc3RlckZpbHRlciB9IGZyb20gXCIuLi8uLi8uLi9kYXRhL2FncmktZmlsdGVyLWJ1c1wiO1xuXG4vLyBWSCBjYXRlZ29yeSBkZWZpbml0aW9ucyB3aXRoIGNvbG9yc1xuY29uc3QgVkhfQ0FURUdPUklFUyA9IFtcbiAgeyB2YWx1ZTogXCIxLUp1ZGEgeWF4c2hpXCIsIGxhYmVsOiBcItCW0YPQtNCwINGP0YXRiNC4XCIsIG9yZGVyOiAxLCBjb2xvcjogXCIjMTZhMzRhXCIgfSxcbiAgeyB2YWx1ZTogXCIyLVlheHNoaVwiLCBsYWJlbDogXCLQr9GF0YjQuFwiLCBvcmRlcjogMiwgY29sb3I6IFwiIzRhZGU4MFwiIH0sXG4gIHsgdmFsdWU6IFwiMy1PJ3J0YVwiLCBsYWJlbDogXCLQjtGA0YLQsFwiLCBvcmRlcjogMywgY29sb3I6IFwiI2Y5NzMxNlwiIH0sXG4gIHsgdmFsdWU6IFwiNC1QYXN0XCIsIGxhYmVsOiBcItCf0LDRgdGCXCIsIG9yZGVyOiA0LCBjb2xvcjogXCIjZWY0NDQ0XCIgfSxcbl07XG5cbmNvbnN0IEJBUl9BTklNX01TID0gNjgwO1xuY29uc3QgQkFSX1NUQUdHRVJfTVMgPSA3MDtcblxudHlwZSBDaGFydERhdHVtID0geyBmaWxsOiBudW1iZXIgfTtcblxuY29uc3QgU3RhdHVzQmFyQ2hhcnQgPSAocHJvcHM6IHtcbiAgZmlsbDogbnVtYmVyO1xuICBjb2xvcjogc3RyaW5nO1xuICBjaGFydEtleTogc3RyaW5nO1xuICBhbmltYXRlOiBib29sZWFuO1xuICBhbmltSW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIGRpbW1lZDogYm9vbGVhbjtcbiAgdGhlbWU6IFwibGlnaHRcIiB8IFwiZGFya1wiO1xufSkgPT4ge1xuICBjb25zdCB7IGZpbGwsIGNvbG9yLCBjaGFydEtleSwgYW5pbWF0ZSwgYW5pbUluZGV4LCBzZWxlY3RlZCwgZGltbWVkLCB0aGVtZSB9ID1cbiAgICBwcm9wcztcbiAgY29uc3QgZGF0YSA9IHVzZU1lbW88Q2hhcnREYXR1bVtdPigoKSA9PiBbeyBmaWxsIH1dLCBbZmlsbF0pO1xuICBjb25zdCBiYXJTaGFwZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHA6IGFueSkgPT5cbiAgICAgIHJlbmRlclN0YXR1c0JhclNoYXBlKHAsIGNvbG9yLCBzZWxlY3RlZCwgZGltbWVkLCB0aGVtZSksXG4gICAgW2NvbG9yLCBzZWxlY3RlZCwgZGltbWVkLCB0aGVtZV0sXG4gICk7XG4gIGNvbnN0IHRvbmVDbGFzcyA9IHNlbGVjdGVkXG4gICAgPyBcImFncmktc3RhdHVzLWNoYXJ0LS1zZWxlY3RlZFwiXG4gICAgOiBkaW1tZWRcbiAgICAgID8gXCJhZ3JpLXN0YXR1cy1jaGFydC0tZGltbWVkXCJcbiAgICAgIDogXCJcIjtcblxuICByZXR1cm4gKFxuICAgIDxSZXNwb25zaXZlQ29udGFpbmVyXG4gICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgaGVpZ2h0PVwiMTAwJVwiXG4gICAgICBtaW5XaWR0aD17MH1cbiAgICAgIGNsYXNzTmFtZT17YGFncmktc3RhdHVzLWNoYXJ0ICR7dG9uZUNsYXNzfWAudHJpbSgpfVxuICAgID5cbiAgICAgIDxCYXJDaGFydFxuICAgICAgICBrZXk9e2NoYXJ0S2V5fVxuICAgICAgICBkYXRhPXtkYXRhfVxuICAgICAgICBtYXJnaW49e3sgdG9wOiAwLCByaWdodDogMCwgbGVmdDogMCwgYm90dG9tOiAwIH19XG4gICAgICAgIGJhckNhdGVnb3J5R2FwPXswfVxuICAgICAgPlxuICAgICAgICA8WEF4aXMgaGlkZSAvPlxuICAgICAgICA8WUF4aXMgZG9tYWluPXtbMCwgMV19IGhpZGUgLz5cbiAgICAgICAgPEJhclxuICAgICAgICAgIGRhdGFLZXk9XCJmaWxsXCJcbiAgICAgICAgICBzaGFwZT17YmFyU2hhcGV9XG4gICAgICAgICAgaXNBbmltYXRpb25BY3RpdmU9e2FuaW1hdGV9XG4gICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb249e0JBUl9BTklNX01TfVxuICAgICAgICAgIGFuaW1hdGlvbkJlZ2luPXthbmltSW5kZXggKiBCQVJfU1RBR0dFUl9NU31cbiAgICAgICAgICBhbmltYXRpb25FYXNpbmc9XCJlYXNlLWluLW91dFwiXG4gICAgICAgIC8+XG4gICAgICA8L0JhckNoYXJ0PlxuICAgIDwvUmVzcG9uc2l2ZUNvbnRhaW5lcj5cbiAgKTtcbn07XG5cbmludGVyZmFjZSBWSERhdGFJdGVtIHtcbiAgY2F0ZWdvcnk6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgY291bnQ6IG51bWJlcjtcbiAgZmllbGRDb3VudDogbnVtYmVyO1xuICBwZXJjZW50YWdlOiBudW1iZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIG9yZGVyOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBBZ3JpQmFyUHJvcHMgZXh0ZW5kcyBBbGxXaWRnZXRQcm9wczxhbnk+IHtcbiAgZXh0ZXJuYWxGaWx0ZXJzPzoge1xuICAgIHR1bWFuPzogc3RyaW5nO1xuICAgIHZpbG95YXQ/OiBzdHJpbmc7XG4gICAgeWlsPzogc3RyaW5nO1xuICAgIHR1cj86IHN0cmluZztcbiAgfTtcbn1cblxuaW50ZXJmYWNlIEFncmlCYXJTdGF0ZSB7XG4gIGxvYWRpbmc6IGJvb2xlYW47XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsO1xuICB2aERhdGE6IHtcbiAgICBjYXRlZ29yaWVzOiBWSERhdGFJdGVtW107XG4gICAgdG90YWxDb3VudDogbnVtYmVyO1xuICB9O1xuICBzZWxlY3RlZFZpbG95YXQ6IHN0cmluZztcbiAgc2VsZWN0ZWRZZWFyOiBzdHJpbmc7XG4gIHNlbGVjdGVkdHVyOiBzdHJpbmc7XG4gIHNlbGVjdGVkdHVybGFyOiBzdHJpbmdbXTtcbiAgc2VsZWN0ZWRUdW1hbjogc3RyaW5nO1xuICBzZWxlY3RlZFZIQ2F0ZWdvcnk6IHN0cmluZyB8IG51bGw7XG4gIGRpc3BsYXlDb3VudDogbnVtYmVyO1xuICBzb3J0T3JkZXI6IFwiYXNjXCIgfCBcImRlc2NcIjtcbiAgaXNEYXJrVGhlbWU6IGJvb2xlYW47XG4gIGxhbmd1YWdlOiBcInV6X2N5clwiIHwgXCJ1el9sYXRcIiB8IFwicnVcIiB8IFwiZW5cIjtcbiAgbG9ja2VkVmlsb3lhdDogc3RyaW5nIHwgbnVsbDtcbiAgd2lkZ2V0U2l6ZTogXCJ4c1wiIHwgXCJzbVwiIHwgXCJtZFwiIHwgXCJsZ1wiO1xuICBjb21wYWN0SGVpZ2h0OiBib29sZWFuO1xufVxuXG5jb25zdCBBR1JJM19MQU5HX1BSRUZfS0VZX1YzID0gXCJhZ3JpM19sYW5nX2luaXRpYWxpemVkX3V6X2xhdF92M1wiO1xuY29uc3QgZW5zdXJlQWdyaTNVekxhdExhbmd1YWdlRGVmYXVsdCA9ICgpOiB2b2lkID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oQUdSSTNfTEFOR19QUkVGX0tFWV9WMykgPT09IFwiMVwiKSByZXR1cm47XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJhcHBfbGFuZ1wiLCBcInV6X2xhdFwiKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImV2YXBvX2FwcF9sYW5nXCIsIFwidXpfbGF0XCIpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiYWdyb19sYW5nXCIsIFwidXpfbGF0XCIpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEFHUkkzX0xBTkdfUFJFRl9LRVlfVjMsIFwiMVwiKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gaWdub3JlIHN0b3JhZ2UgZXJyb3JzXG4gIH1cbn07XG5cbmNvbnN0IGNvbnNvbGUgPSB7XG4gIGxvZzogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG4gIHdhcm46ICguLi5fYXJnczogYW55W10pID0+IHt9LFxuICBlcnJvcjogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG4gIGluZm86ICguLi5fYXJnczogYW55W10pID0+IHt9LFxuICBkZWJ1ZzogKC4uLl9hcmdzOiBhbnlbXSkgPT4ge30sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZ3JpQmFyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxcbiAgQWdyaUJhclByb3BzLFxuICBBZ3JpQmFyU3RhdGVcbj4ge1xuICBfaXNNb3VudGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3VuYmluZE1hc3RlckZpbHRlcjogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2NvbnRhaW5lclJlZiA9IFJlYWN0LmNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgcHJpdmF0ZSBfcmVzaXplT2JzZXJ2ZXI6IFJlc2l6ZU9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIC8qKiBUcnVlIG9ubHkgYWZ0ZXIgYXQgbGVhc3Qgb25lIFZIIGJhciBwYXlsb2FkIGZpbmlzaGVkIChzdWNjZXNzIG9yIGVtcHR5KS4gKi9cbiAgcHJpdmF0ZSBfaGFzQ29tcGxldGVkRmV0Y2ggPSBmYWxzZTtcblxuICBwcml2YXRlIG5vcm1hbGl6ZUxhbmd1YWdlID0gKHJhdz86IHN0cmluZyB8IG51bGwpOiBcInV6X2N5clwiIHwgXCJ1el9sYXRcIiB8IFwicnVcIiB8IFwiZW5cIiA9PiB7XG4gICAgY29uc3QgdiA9IFN0cmluZyhyYXcgfHwgXCJcIilcbiAgICAgIC50cmltKClcbiAgICAgIC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgaWYgKHYgPT09IFwiZW5cIiB8fCB2ID09PSBcImVuZ2xpc2hcIikgcmV0dXJuIFwiZW5cIjtcbiAgICBpZiAodiA9PT0gXCJydVwiIHx8IHYgPT09IFwicnVzc2lhblwiKSByZXR1cm4gXCJydVwiO1xuICAgIGlmIChcbiAgICAgIHYgPT09IFwidXpfY3lyXCIgfHxcbiAgICAgIHYgPT09IFwidXotY3lyXCIgfHxcbiAgICAgIHYgPT09IFwidXpfY3lybFwiIHx8XG4gICAgICB2ID09PSBcInV6LWN5cmxcIiB8fFxuICAgICAgdiA9PT0gXCJ1el9jeXJpbGxpY1wiIHx8XG4gICAgICB2ID09PSBcInV6LWN5cmlsbGljXCJcbiAgICApIHtcbiAgICAgIHJldHVybiBcInV6X2N5clwiO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICB2ID09PSBcInV6X2xhdFwiIHx8XG4gICAgICB2ID09PSBcInV6LWxhdFwiIHx8XG4gICAgICB2ID09PSBcInV6X2xhdGluXCIgfHxcbiAgICAgIHYgPT09IFwidXotbGF0aW5cIiB8fFxuICAgICAgdiA9PT0gXCJ1elwiXG4gICAgKSB7XG4gICAgICByZXR1cm4gXCJ1el9sYXRcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gXCJ1el9sYXRcIjtcbiAgfTtcblxuICBwcml2YXRlIHJlc29sdmVJbml0aWFsTGFuZ3VhZ2UgPSAoKTogXCJ1el9jeXJcIiB8IFwidXpfbGF0XCIgfCBcInJ1XCIgfCBcImVuXCIgPT4ge1xuICAgIHRyeSB7XG4gICAgICBlbnN1cmVBZ3JpM1V6TGF0TGFuZ3VhZ2VEZWZhdWx0KCk7XG4gICAgICBjb25zdCBmcm9tVXJsID1cbiAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICAgID8gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoXCJsYW5nXCIpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgZnJvbVN0b3JhZ2UgPVxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgPyBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImFwcF9sYW5nXCIpIHx8XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImV2YXBvX2FwcF9sYW5nXCIpIHx8XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImFncm9fbGFuZ1wiKVxuICAgICAgICAgIDogbnVsbDtcblxuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplTGFuZ3VhZ2UoZnJvbVVybCB8fCBmcm9tU3RvcmFnZSk7XG4gICAgfSBjYXRjaCAoX2UpIHtcbiAgICAgIHJldHVybiBcInV6X2xhdFwiO1xuICAgIH1cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogQWdyaUJhclByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGluaXRpYWxMYW5ndWFnZSA9IHRoaXMucmVzb2x2ZUluaXRpYWxMYW5ndWFnZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgdmhEYXRhOiB7IGNhdGVnb3JpZXM6IFtdLCB0b3RhbENvdW50OiAwIH0sXG4gICAgICBzZWxlY3RlZFZpbG95YXQ6IFwiXCIsXG4gICAgICBzZWxlY3RlZFllYXI6IFwiXCIsXG4gICAgICBzZWxlY3RlZHR1cjogXCJcIixcbiAgICAgIHNlbGVjdGVkdHVybGFyOiBbXSxcbiAgICAgIHNlbGVjdGVkVHVtYW46IFwiXCIsXG4gICAgICBzZWxlY3RlZFZIQ2F0ZWdvcnk6IG51bGwsXG4gICAgICBkaXNwbGF5Q291bnQ6IC0xLFxuICAgICAgc29ydE9yZGVyOiBcImRlc2NcIixcbiAgICAgIGlzRGFya1RoZW1lOiBmYWxzZSxcbiAgICAgIGxhbmd1YWdlOiBpbml0aWFsTGFuZ3VhZ2UsXG4gICAgICBsb2NrZWRWaWxveWF0OiBudWxsLFxuICAgICAgd2lkZ2V0U2l6ZTogXCJsZ1wiLFxuICAgICAgY29tcGFjdEhlaWdodDogZmFsc2UsXG4gICAgfTtcbiAgICB0aGlzLmhhbmRsZVZIU2VsZWN0aW9uQ2xpY2sgPSB0aGlzLmhhbmRsZVZIU2VsZWN0aW9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLmhhbmRsZURpc3BsYXlDb3VudENoYW5nZSA9IHRoaXMuaGFuZGxlRGlzcGxheUNvdW50Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy50b2dnbGVTb3J0T3JkZXIgPSB0aGlzLnRvZ2dsZVNvcnRPcmRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaGFuZGxlVGhlbWVDaGFuZ2UgPSB0aGlzLmhhbmRsZVRoZW1lQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5mb3JtYXROdW1iZXIgPSB0aGlzLmZvcm1hdE51bWJlci5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplVGhlbWUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYWdyaV92MTFfYXBwX3RoZW1lXCIpO1xuICAgIGNvbnN0IGlzRGFya1RoZW1lID0gc2F2ZWRUaGVtZSA9PT0gXCJkYXJrXCI7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzRGFya1RoZW1lIH0pO1xuICB9O1xuXG4gIHByaXZhdGUgZ2V0TG9jYWxpemVkQ2F0ZWdvcnlMYWJlbCA9IChcbiAgICBjYXRlZ29yeTogc3RyaW5nLFxuICAgIGxhbmd1YWdlOiBcInV6X2N5clwiIHwgXCJ1el9sYXRcIiB8IFwicnVcIiB8IFwiZW5cIixcbiAgKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBiYXNlID0gY2F0ZWdvcnkudHJpbSgpO1xuICAgIGlmIChiYXNlID09PSBcIjEtSnVkYSB5YXhzaGlcIikge1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcImVuXCIpIHJldHVybiBcIkV4Y2VsbGVudFwiO1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcInJ1XCIpIHJldHVybiBcItCe0YfQtdC90Ywg0YXQvtGA0L7RiNC40LlcIjtcbiAgICAgIGlmIChsYW5ndWFnZSA9PT0gXCJ1el9sYXRcIikgcmV0dXJuIFwiQSdsb1wiO1xuICAgICAgcmV0dXJuIFwi0JbRg9C00LAg0Y/RhdGI0LhcIjtcbiAgICB9XG4gICAgaWYgKGJhc2UgPT09IFwiMi1ZYXhzaGlcIikge1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcImVuXCIpIHJldHVybiBcIkdvb2RcIjtcbiAgICAgIGlmIChsYW5ndWFnZSA9PT0gXCJydVwiKSByZXR1cm4gXCLQpdC+0YDQvtGI0LjQuVwiO1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcInV6X2xhdFwiKSByZXR1cm4gXCJZYXhzaGlcIjtcbiAgICAgIHJldHVybiBcItCv0YXRiNC4XCI7XG4gICAgfVxuICAgIGlmIChiYXNlID09PSBcIjMtTydydGFcIikge1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcImVuXCIpIHJldHVybiBcIk1vZGVyYXRlXCI7XG4gICAgICBpZiAobGFuZ3VhZ2UgPT09IFwicnVcIikgcmV0dXJuIFwi0KHRgNC10LTQvdC40LlcIjtcbiAgICAgIGlmIChsYW5ndWFnZSA9PT0gXCJ1el9sYXRcIikgcmV0dXJuIFwiTydydGFcIjtcbiAgICAgIHJldHVybiBcItCO0YDRgtCwXCI7XG4gICAgfVxuICAgIGlmIChiYXNlID09PSBcIjQtUGFzdFwiKSB7XG4gICAgICBpZiAobGFuZ3VhZ2UgPT09IFwiZW5cIikgcmV0dXJuIFwiUG9vclwiO1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcInJ1XCIpIHJldHVybiBcItCd0LjQt9C60LjQuVwiO1xuICAgICAgaWYgKGxhbmd1YWdlID09PSBcInV6X2xhdFwiKSByZXR1cm4gXCJQYXN0XCI7XG4gICAgICByZXR1cm4gXCLQn9Cw0YHRglwiO1xuICAgIH1cbiAgICByZXR1cm4gY2F0ZWdvcnk7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVNYXN0ZXJGaWx0ZXJDaGFuZ2UgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgZDogYW55ID0gKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwgfHwge307XG4gICAgaWYgKCFkLmZpbHRlcnMpIHJldHVybjtcblxuICAgIGNvbnN0IG5leHRZZWFyID0gZC5maWx0ZXJzLnlpbCB8fCBcIlwiO1xuICAgIGNvbnN0IG5leHRMb2NrZWRWaWwgPSBkPy5zY29wZT8ubG9ja2VkVmlsb3lhdFxuICAgICAgPyBTdHJpbmcoZC5zY29wZS5sb2NrZWRWaWxveWF0KVxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IG5leHRWaWwgPSBuZXh0TG9ja2VkVmlsIHx8IGQuZmlsdGVycy52aWxveWF0IHx8IFwiXCI7XG4gICAgY29uc3QgbmV4dFR1bSA9IGQuZmlsdGVycy50dW1hbiB8fCBcIlwiO1xuICAgIGNvbnN0IG5leHRUdXJsYXIgPSBBcnJheS5pc0FycmF5KGQuZmlsdGVycy50dXJsYXIpXG4gICAgICA/IGQuZmlsdGVycy50dXJsYXIubWFwKCh2YWx1ZTogdW5rbm93bikgPT4gU3RyaW5nKHZhbHVlIHx8IFwiXCIpKS5maWx0ZXIoQm9vbGVhbilcbiAgICAgIDogZC5maWx0ZXJzLnR1cmlcbiAgICAgICAgPyBbU3RyaW5nKGQuZmlsdGVycy50dXJpKV1cbiAgICAgICAgOiBbXTtcbiAgICBjb25zdCBuZXh0VHVyID0gbmV4dFR1cmxhci5sZW5ndGggPT09IDEgPyBuZXh0VHVybGFyWzBdIDogXCJcIjtcbiAgICBjb25zdCBuZXh0VmggPSBkLmZpbHRlcnMudmggfHwgXCJcIjtcbiAgICBjb25zdCBuZXh0TGFuZ3VhZ2U6IFwidXpfY3lyXCIgfCBcInV6X2xhdFwiIHwgXCJydVwiIHwgXCJlblwiID1cbiAgICAgIChkLmZpbHRlcnMubGFuZ3VhZ2UgYXMgYW55KSB8fCB0aGlzLnN0YXRlLmxhbmd1YWdlIHx8IFwicnVcIjtcblxuICAgIGNvbnN0IHZoQmFyRGF0YVBlbmRpbmcgPSBkLnZoQmFyRGF0YVBlbmRpbmcgPT09IHRydWU7XG4gICAgaWYgKHZoQmFyRGF0YVBlbmRpbmcpIHtcbiAgICAgIC8vIEdlb2dyYXBoeS9maWx0ZXIgY2hhbmdlZCDigJQgc2hvdyBsb2FkZXIgaW1tZWRpYXRlbHkgZXZlbiBpZiBvbGQgYmFyc1xuICAgICAgLy8gYXJlIHN0aWxsIG9uIHNjcmVlbiwgc28gY3JvcC9WSCB1cGRhdGVzIGZlZWwgaW5zdGFudC5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzZWxlY3RlZFllYXI6IG5leHRZZWFyLFxuICAgICAgICBzZWxlY3RlZFZpbG95YXQ6IG5leHRWaWwsXG4gICAgICAgIHNlbGVjdGVkVHVtYW46IG5leHRUdW0sXG4gICAgICAgIHNlbGVjdGVkdHVyOiBuZXh0VHVyLFxuICAgICAgICBzZWxlY3RlZHR1cmxhcjogbmV4dFR1cmxhcixcbiAgICAgICAgc2VsZWN0ZWRWSENhdGVnb3J5OiBuZXh0VmggPyBuZXh0VmggOiBudWxsLFxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgbGFuZ3VhZ2U6IG5leHRMYW5ndWFnZSxcbiAgICAgICAgbG9ja2VkVmlsb3lhdDogbmV4dExvY2tlZFZpbCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZoQmFyRGF0YSA9IGQudmhCYXJEYXRhID8/IG51bGw7XG4gICAgY29uc3QgbmV4dFZoRGF0YSA9IHtcbiAgICAgIGNhdGVnb3JpZXM6ICh2aEJhckRhdGE/LmNhdGVnb3JpZXMgfHwgW10pLm1hcChcbiAgICAgICAgKGM6IFZIRGF0YUl0ZW0gJiB7IGxhYmVsPzogc3RyaW5nIH0pID0+ICh7XG4gICAgICAgIC4uLmMsXG4gICAgICAgIGxhYmVsOiB0aGlzLmdldExvY2FsaXplZENhdGVnb3J5TGFiZWwoXG4gICAgICAgICAgYy5jYXRlZ29yeSB8fCBjLmxhYmVsLFxuICAgICAgICAgIG5leHRMYW5ndWFnZSxcbiAgICAgICAgKSxcbiAgICAgIH0pLFxuICAgICAgKSxcbiAgICAgIHRvdGFsQ291bnQ6IHZoQmFyRGF0YT8udG90YWxDb3VudCA/PyAwLFxuICAgIH07XG5cbiAgICB0aGlzLl9oYXNDb21wbGV0ZWRGZXRjaCA9IHRydWU7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFllYXI6IG5leHRZZWFyLFxuICAgICAgc2VsZWN0ZWRWaWxveWF0OiBuZXh0VmlsLFxuICAgICAgc2VsZWN0ZWRUdW1hbjogbmV4dFR1bSxcbiAgICAgIHNlbGVjdGVkdHVyOiBuZXh0VHVyLFxuICAgICAgc2VsZWN0ZWR0dXJsYXI6IG5leHRUdXJsYXIsXG4gICAgICAvLyBLZWVwIFZIIHNlbGVjdGlvbiBpbiBzeW5jIHdpdGggbWFzdGVyIGZpbHRlcjsgY2xlYXIgd2hlbiBmaWx0ZXIgc2VuZHMgZW1wdHkuXG4gICAgICBzZWxlY3RlZFZIQ2F0ZWdvcnk6IG5leHRWaCA/IG5leHRWaCA6IG51bGwsXG4gICAgICB2aERhdGE6IG5leHRWaERhdGEsXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgbGFuZ3VhZ2U6IG5leHRMYW5ndWFnZSxcbiAgICAgIGxvY2tlZFZpbG95YXQ6IG5leHRMb2NrZWRWaWwsXG4gICAgfSk7XG4gIH07XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICB0aGlzLmluaXRpYWxpemVUaGVtZSgpO1xuICAgIHRoaXMuX3VuYmluZE1hc3RlckZpbHRlciA9IGJpbmRNYXN0ZXJGaWx0ZXIodGhpcy5oYW5kbGVNYXN0ZXJGaWx0ZXJDaGFuZ2UpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImFncmlWMTFUaGVtZVRvZ2dsZWRcIixcbiAgICAgIHRoaXMuaGFuZGxlVGhlbWVDaGFuZ2UgYXMgRXZlbnRMaXN0ZW5lcixcbiAgICApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNldEFsbEZpbHRlcnNcIiwgdGhpcy5fb25SZXNldCBhcyBhbnkpO1xuXG4gICAgLy8gcmVzcG9uc2l2ZSBzaXppbmcgKGRlZmVycmVkIHRvIGVuc3VyZSBET00gaXMgcmVhZHkpXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCAmJlxuICAgICAgICB0aGlzLl9jb250YWluZXJSZWYuY3VycmVudCAmJlxuICAgICAgICB0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9yZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoZW50cmllcykgPT4ge1xuICAgICAgICAgIGNvbnN0IHcgPSBlbnRyaWVzWzBdPy5jb250ZW50UmVjdD8ud2lkdGggPz8gMDtcbiAgICAgICAgICBjb25zdCBoID0gZW50cmllc1swXT8uY29udGVudFJlY3Q/LmhlaWdodCA/PyAwO1xuICAgICAgICAgIGNvbnN0IG5leHQ6IFwieHNcIiB8IFwic21cIiB8IFwibWRcIiB8IFwibGdcIiA9XG4gICAgICAgICAgICB3IDwgMjIwID8gXCJ4c1wiIDogdyA8IDM0MCA/IFwic21cIiA6IHcgPCA1MDAgPyBcIm1kXCIgOiBcImxnXCI7XG4gICAgICAgICAgY29uc3QgY29tcGFjdEhlaWdodCA9IGggPiAwICYmIGggPCAyNjA7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbmV4dCAhPT0gdGhpcy5zdGF0ZS53aWRnZXRTaXplIHx8XG4gICAgICAgICAgICBjb21wYWN0SGVpZ2h0ICE9PSB0aGlzLnN0YXRlLmNvbXBhY3RIZWlnaHRcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB3aWRnZXRTaXplOiBuZXh0LCBjb21wYWN0SGVpZ2h0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy5fY29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgICAgfVxuICAgIH0sIDApO1xuICAgIGlmICh0aGlzLnByb3BzLmV4dGVybmFsRmlsdGVycykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkVmlsb3lhdDogdGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMudmlsb3lhdCB8fCBcIlwiLFxuICAgICAgICBzZWxlY3RlZFR1bWFuOiB0aGlzLnByb3BzLmV4dGVybmFsRmlsdGVycy50dW1hbiB8fCBcIlwiLFxuICAgICAgICBzZWxlY3RlZFllYXI6IHRoaXMucHJvcHMuZXh0ZXJuYWxGaWx0ZXJzLnlpbCB8fCBcIlwiLFxuICAgICAgICBzZWxlY3RlZHR1cjogdGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMudHVyIHx8IFwiXCIsXG4gICAgICAgIGxvY2tlZFZpbG95YXQ6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fdmhEaXNwYXRjaFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdmhEaXNwYXRjaFRpbWVyKTtcbiAgICAgIHRoaXMuX3ZoRGlzcGF0Y2hUaW1lciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3VuYmluZE1hc3RlckZpbHRlcj8uKCk7XG4gICAgdGhpcy5fdW5iaW5kTWFzdGVyRmlsdGVyID0gbnVsbDtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJhZ3JpVjExVGhlbWVUb2dnbGVkXCIsXG4gICAgICB0aGlzLmhhbmRsZVRoZW1lQ2hhbmdlIGFzIEV2ZW50TGlzdGVuZXIsXG4gICAgKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzZXRBbGxGaWx0ZXJzXCIsIHRoaXMuX29uUmVzZXQgYXMgYW55KTtcbiAgICBpZiAodGhpcy5fcmVzaXplT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX3Jlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMuX3Jlc2l6ZU9ic2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9vblJlc2V0ID0gKCk6IHZvaWQgPT4ge1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSByZXR1cm47XG4gICAgdGhpcy5faGFzQ29tcGxldGVkRmV0Y2ggPSBmYWxzZTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkWWVhcjogXCJcIixcbiAgICAgIHNlbGVjdGVkVmlsb3lhdDogXCJcIixcbiAgICAgIHNlbGVjdGVkVHVtYW46IFwiXCIsXG4gICAgICBzZWxlY3RlZHR1cjogXCJcIixcbiAgICAgIHNlbGVjdGVkdHVybGFyOiBbXSxcbiAgICAgIHNlbGVjdGVkVkhDYXRlZ29yeTogbnVsbCxcbiAgICAgIHZoRGF0YTogeyBjYXRlZ29yaWVzOiBbXSwgdG90YWxDb3VudDogMCB9LFxuICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIGxvY2tlZFZpbG95YXQ6IG51bGwsXG4gICAgfSk7XG4gIH07XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogQWdyaUJhclByb3BzKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMgIT09IHByZXZQcm9wcy5leHRlcm5hbEZpbHRlcnMgJiZcbiAgICAgIHRoaXMucHJvcHMuZXh0ZXJuYWxGaWx0ZXJzXG4gICAgKSB7XG4gICAgICB0aGlzLnVwZGF0ZUZpbHRlcnNGcm9tUHJvcHModGhpcy5wcm9wcy5leHRlcm5hbEZpbHRlcnMpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVRoZW1lQ2hhbmdlKGV2ZW50OiBDdXN0b21FdmVudDx7IGlzRGFya1RoZW1lPzogYm9vbGVhbiB9PiB8IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZGV0YWlsID0gKGV2ZW50IGFzIEN1c3RvbUV2ZW50PHsgaXNEYXJrVGhlbWU/OiBib29sZWFuIH0+KT8uZGV0YWlsO1xuICAgIGlmIChkZXRhaWwgJiYgdHlwZW9mIGRldGFpbC5pc0RhcmtUaGVtZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgIGNvbnN0IHsgaXNEYXJrVGhlbWUgfSA9IGRldGFpbDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0RhcmtUaGVtZSB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUZpbHRlcnNGcm9tUHJvcHMoZmlsdGVyczogYW55KTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzZWxlY3RlZFZpbG95YXQ6IChmaWx0ZXJzLnZpbG95YXQgfHwgXCJcIikudHJpbSgpLFxuICAgICAgICBzZWxlY3RlZFR1bWFuOiAoZmlsdGVycy50dW1hbiB8fCBcIlwiKS50cmltKCksXG4gICAgICAgIHNlbGVjdGVkWWVhcjogZmlsdGVycy55aWwgPyBTdHJpbmcoZmlsdGVycy55aWwpIDogXCJcIixcbiAgICAgICAgc2VsZWN0ZWR0dXI6IChmaWx0ZXJzLnR1ciB8fCBcIlwiKS50cmltKCksXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBsb2NrZWRWaWxveWF0OiBudWxsLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoXykge31cbiAgfVxuXG4gIGhhbmRsZURpc3BsYXlDb3VudENoYW5nZShjb3VudDogbnVtYmVyKSB7XG5cbiAgICB0aGlzLnNldFN0YXRlKHsgZGlzcGxheUNvdW50OiBpc05hTihjb3VudCkgPyAtMSA6IGNvdW50IH0pO1xuICB9XG5cbiAgdG9nZ2xlU29ydE9yZGVyKCkge1xuICAgIGNvbnN0IG5ld09yZGVyID0gdGhpcy5zdGF0ZS5zb3J0T3JkZXIgPT09IFwiYXNjXCIgPyBcImRlc2NcIiA6IFwiYXNjXCI7XG5cbiAgICB0aGlzLnNldFN0YXRlKHsgc29ydE9yZGVyOiBuZXdPcmRlciB9KTtcbiAgfVxuXG4gIC8qKiBEZWJvdW5jZSByYXBpZCBiYXIgY2xpY2tzIHNvIExvY2FsaXphdGlvbiBvbmx5IHJlc29sdmVzIHRoZSBsYXN0IFZILiAqL1xuICBwcml2YXRlIF92aERpc3BhdGNoVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgaGFuZGxlVkhTZWxlY3Rpb25DbGljayA9IChhcmc6IGFueSkgPT4ge1xuICAgIGNvbnN0IGVmZmVjdGl2ZVZpbCA9IChcbiAgICAgIHRoaXMuc3RhdGUubG9ja2VkVmlsb3lhdCB8fFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFZpbG95YXQgfHxcbiAgICAgIFwiXCJcbiAgICApLnRyaW0oKTtcbiAgICAvLyBNYXAgZmlsdGVyIG5lZWRzIGEgc2VsZWN0ZWQgdmlsb3lhdCAocmVnaW9uLXllYXIgTWFwSW1hZ2UgbGF5ZXJzKS5cbiAgICBpZiAoIWVmZmVjdGl2ZVZpbCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdmhWYWx1ZSA9IGFyZz8uY2F0ZWdvcnkgPz8gYXJnPy5wYXlsb2FkPy5jYXRlZ29yeSA/PyBudWxsO1xuICAgIGlmICh2aFZhbHVlID09IG51bGwpIHJldHVybjtcblxuICAgIGNvbnN0IG5ld1NlbGVjdGlvbiA9XG4gICAgICB2aFZhbHVlID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkVkhDYXRlZ29yeSA/IG51bGwgOiB2aFZhbHVlO1xuXG4gICAgLy8gS2VlcCBwcmV2aW91cyBjaGFydCB2aXNpYmxlIOKAlCBjYXRlZ29yeSBjb3VudHMgZG8gbm90IGNoYW5nZSBvbiBWSCB0b2dnbGUuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkVkhDYXRlZ29yeTogbmV3U2VsZWN0aW9uLCBlcnJvcjogbnVsbCB9KTtcblxuICAgIC8vIE9ubHkgc2VuZCB2aCDigJQgZG8gbm90IHJlLWJyb2FkY2FzdCBnZW9ncmFwaHkgKHRoYXQgY2FuIGxvb2sgbGlrZSBhXG4gICAgLy8gcmVnaW9uL3R1bWFuIGNoYW5nZSBhbmQgd2lwZSB0aGUgVkggc2VsZWN0aW9uIGluIExvY2FsaXphdGlvbikuXG4gICAgY29uc3QgZGV0YWlsID0ge1xuICAgICAgc291cmNlOiBcIkFncmlCYXJcIixcbiAgICAgIHZoOiBuZXdTZWxlY3Rpb24gfHwgXCJcIixcbiAgICAgIGxhbmd1YWdlOiB0aGlzLnN0YXRlLmxhbmd1YWdlLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5fdmhEaXNwYXRjaFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5fdmhEaXNwYXRjaFRpbWVyKTtcbiAgICB0aGlzLl92aERpc3BhdGNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3ZoRGlzcGF0Y2hUaW1lciA9IG51bGw7XG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkgcmV0dXJuO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwid2lkZ2V0U2VsZWN0aW9uQ2hhbmdlZFwiLCB7XG4gICAgICAgICAgZGV0YWlsLFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9LCA0MCk7XG4gIH07XG5cbiAgLyoqIERpc3BsYXktb25seTogVkggZGF0YSBjb21lcyBmcm9tIEFncmlGaWx0ZXIgdmlhIG1hc3RlckZpbHRlckNoYW5nZWQudmhCYXJEYXRhICovXG5cbiAgZm9ybWF0TnVtYmVyID0gKHZhbHVlOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLCBkZWNpbWFscyA9IDApID0+IHtcbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFwiLVwiO1xuICAgIHJldHVybiBOdW1iZXIodmFsdWUpLnRvRml4ZWQoZGVjaW1hbHMpO1xuICB9O1xuXG4gIHByaXZhdGUgZm9ybWF0Q291bnQgPSAodmFsdWU6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdChcInJ1LVJVXCIpLmZvcm1hdChNYXRoLmNlaWwoTnVtYmVyKHZhbHVlKSB8fCAwKSk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGxvYWRpbmcsXG4gICAgICBlcnJvcixcbiAgICAgIHZoRGF0YSxcbiAgICAgIHNlbGVjdGVkVkhDYXRlZ29yeSxcbiAgICAgIGRpc3BsYXlDb3VudCxcbiAgICAgIGlzRGFya1RoZW1lLFxuICAgICAgc2VsZWN0ZWRZZWFyLFxuICAgICAgc2VsZWN0ZWRWaWxveWF0LFxuICAgICAgbG9ja2VkVmlsb3lhdCxcbiAgICAgIGxhbmd1YWdlLFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGVmZmVjdGl2ZVZpbG95YXQgPSAobG9ja2VkVmlsb3lhdCB8fCBzZWxlY3RlZFZpbG95YXQgfHwgXCJcIikudHJpbSgpO1xuICAgIGNvbnN0IGNoYXJ0SW50ZXJhY3RpdmUgPSAhIWVmZmVjdGl2ZVZpbG95YXQ7XG4gICAgY29uc3QgYXJlYVVuaXQgPVxuICAgICAgbGFuZ3VhZ2UgPT09IFwiZW5cIiA/IFwiaGFcIiA6IGxhbmd1YWdlID09PSBcInV6X2xhdFwiID8gXCJnYVwiIDogXCLQs9CwXCI7XG4gICAgY29uc3QgdGhlbWU6IFwibGlnaHRcIiB8IFwiZGFya1wiID0gaXNEYXJrVGhlbWUgPyBcImRhcmtcIiA6IFwibGlnaHRcIjtcblxuICAgIGNvbnN0IHRpdGxlVGV4dCA9XG4gICAgICBsYW5ndWFnZSA9PT0gXCJlblwiXG4gICAgICAgID8gXCJWZWdldGF0aW9uIFN0YXR1c1wiXG4gICAgICAgIDogbGFuZ3VhZ2UgPT09IFwicnVcIlxuICAgICAgICAgID8gXCLQodC+0YHRgtC+0Y/QvdC40LUg0LLQtdCz0LXRgtCw0YbQuNC4XCJcbiAgICAgICAgICA6IGxhbmd1YWdlID09PSBcInV6X2xhdFwiXG4gICAgICAgICAgICA/IFwiVmVnZXRhdHNpeWEgSG9sYXRpXCJcbiAgICAgICAgICAgIDogXCLQktC10LPQtdGC0LDRhtC40Y8g0rLQvtC70LDRgtC4XCI7XG5cbiAgICBjb25zdCBzZWxlY3RSZWdpb25UaXRsZSA9XG4gICAgICBsYW5ndWFnZSA9PT0gXCJlblwiXG4gICAgICAgID8gXCJTZWxlY3QgYSByZWdpb25cIlxuICAgICAgICA6IGxhbmd1YWdlID09PSBcInJ1XCJcbiAgICAgICAgICA/IFwi0JLRi9Cx0LXRgNC40YLQtSDRgNC10LPQuNC+0L1cIlxuICAgICAgICAgIDogbGFuZ3VhZ2UgPT09IFwidXpfbGF0XCJcbiAgICAgICAgICAgID8gXCJWaWxveWF0bmkgdGFubGFuZ1wiXG4gICAgICAgICAgICA6IFwi0JLQuNC70L7Rj9GC0L3QuCDRgtCw0L3Qu9Cw0L3Qs1wiO1xuXG4gICAgY29uc3Qgc2VsZWN0UmVnaW9uQm9keSA9XG4gICAgICBsYW5ndWFnZSA9PT0gXCJlblwiXG4gICAgICAgID8gXCJTZWxlY3QgYSByZWdpb24gZmlyc3QgdG8gdmlldyB2ZWdldGF0aW9uIHN0YXR1c1wiXG4gICAgICAgIDogbGFuZ3VhZ2UgPT09IFwicnVcIlxuICAgICAgICAgID8gXCLQp9GC0L7QsdGLINGD0LLQuNC00LXRgtGMINGB0L7RgdGC0L7Rj9C90LjQtSDQstC10LPQtdGC0LDRhtC40LgsINGB0L3QsNGH0LDQu9CwINCy0YvQsdC10YDQuNGC0LUg0YDQtdCz0LjQvtC9XCJcbiAgICAgICAgICA6IGxhbmd1YWdlID09PSBcInV6X2xhdFwiXG4gICAgICAgICAgICA/IFwiVmVnZXRhdHNpeWEgaG9sYXRpbmkga2/igJhyaXNoIHVjaHVuIGF2dmFsIHZpbG95YXRuaSB0YW5sYW5nXCJcbiAgICAgICAgICAgIDogXCLQktC10LPQtdGC0LDRhtC40Y8g0rPQvtC70LDRgtC40L3QuCDQutGe0YDQuNGIINGD0YfRg9C9INCw0LLQstCw0Lsg0LLQuNC70L7Rj9GC0L3QuCDRgtCw0L3Qu9Cw0L3Qs1wiO1xuXG4gICAgY29uc3Qgc29ydGVkQ2F0ZWdvcmllcyA9IFsuLi52aERhdGEuY2F0ZWdvcmllc10uc29ydChcbiAgICAgIChhLCBiKSA9PiBhLm9yZGVyIC0gYi5vcmRlcixcbiAgICApO1xuICAgIGNvbnN0IGxpbWl0ZWRDYXRlZ29yaWVzID1cbiAgICAgIGRpc3BsYXlDb3VudCA9PT0gLTFcbiAgICAgICAgPyBzb3J0ZWRDYXRlZ29yaWVzXG4gICAgICAgIDogc29ydGVkQ2F0ZWdvcmllcy5zbGljZSgwLCBkaXNwbGF5Q291bnQpO1xuICAgIGNvbnN0IGRlbm9tID0gdmhEYXRhLnRvdGFsQ291bnQgPiAwID8gdmhEYXRhLnRvdGFsQ291bnQgOiAxO1xuICAgIGNvbnN0IGNoYXJ0RGF0YSA9IGxpbWl0ZWRDYXRlZ29yaWVzLm1hcCgoY2F0SXRlbSkgPT4ge1xuICAgICAgY29uc3QgY29sb3IgPSBjYXRJdGVtLmNvbG9yIHx8IFwiIzk0YTNiOFwiO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY2F0SXRlbSxcbiAgICAgICAgY29sb3IsXG4gICAgICAgIGZpbGw6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChjYXRJdGVtLmNvdW50IHx8IDApIC8gZGVub20pKSxcbiAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3QgaGFzU2VsZWN0aW9uID0gISFzZWxlY3RlZFZIQ2F0ZWdvcnk7XG4gICAgY29uc3QgdGhlbWVDbGFzcyA9IGlzRGFya1RoZW1lID8gXCJkYXJrLXRoZW1lXCIgOiBcImxpZ2h0LXRoZW1lXCI7XG5cbiAgICBjb25zdCBoYXNDaGFydERhdGEgPVxuICAgICAgdmhEYXRhLmNhdGVnb3JpZXMubGVuZ3RoID4gMCAmJiB2aERhdGEudG90YWxDb3VudCA+IDA7XG4gICAgY29uc3QgYXdhaXRpbmdGaXJzdERhdGEgPSAhdGhpcy5faGFzQ29tcGxldGVkRmV0Y2g7XG5cbiAgICAvLyBMb2FkZXIgdW50aWwgZmlyc3QgZmV0Y2ggZmluaXNoZXMg4oCUIG5ldmVyIGZsYXNoIFwibm8gZGF0YVwiIGR1cmluZyBjb25uZWN0L3JlZnJlc2guXG4gICAgY29uc3Qgc2hvd0Jsb2NraW5nTG9hZGVyID1cbiAgICAgICFzZWxlY3RlZFllYXIgfHxcbiAgICAgICghaGFzQ2hhcnREYXRhICYmIChsb2FkaW5nIHx8IGF3YWl0aW5nRmlyc3REYXRhKSk7XG5cbiAgICAvLyBPdmVybGF5IGxvYWRlciBvbiBhbnkgc3Vic2VxdWVudCBkYXRhIGNoYW5nZSB3aGlsZSBwcmV2aW91cyBiYXJzIHJlbWFpbi5cbiAgICBjb25zdCBzaG93UmVmcmVzaExvYWRlciA9IGxvYWRpbmcgJiYgaGFzQ2hhcnREYXRhO1xuXG4gICAgLy8gRW1wdHkgc3RhdGUgb25seSBhZnRlciBhIHJlYWwgZmV0Y2ggcmV0dXJuZWQgemVybyBjYXRlZ29yaWVzLlxuICAgIGNvbnN0IHNob3dOb0RhdGEgPVxuICAgICAgISFzZWxlY3RlZFllYXIgJiZcbiAgICAgICFsb2FkaW5nICYmXG4gICAgICB0aGlzLl9oYXNDb21wbGV0ZWRGZXRjaCAmJlxuICAgICAgIWhhc0NoYXJ0RGF0YTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dGhpcy5fY29udGFpbmVyUmVmfVxuICAgICAgICBjbGFzc05hbWU9e2Bjb25zdHJ1Y3Rpb24teWVhcnMtY2FyZCAke3RoZW1lQ2xhc3N9YH1cbiAgICAgICAgZGF0YS1iYXItc2l6ZT17dGhpcy5zdGF0ZS53aWRnZXRTaXplfVxuICAgICAgICBkYXRhLWNvbXBhY3QtaGVpZ2h0PXt0aGlzLnN0YXRlLmNvbXBhY3RIZWlnaHQgPyBcInRydWVcIiA6IFwiZmFsc2VcIn1cbiAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25zdHJ1Y3Rpb24teWVhcnMtY29udGVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29uc3RydWN0aW9uLXllYXJzLWhlYWRlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25zdHJ1Y3Rpb24teWVhcnMtaGVhZGVyLXRpdGxlXCI+e3RpdGxlVGV4dH08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHtlcnJvciA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29uc3RydWN0aW9uLXllYXJzLWVycm9yXCI+XG4gICAgICAgICAgICAgIDxUcmlhbmdsZUFsZXJ0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaS1lbXB0eS1zdGF0ZS1pY29uXCJcbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17MS43fVxuICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxwPntlcnJvcn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogc2hvd0Jsb2NraW5nTG9hZGVyID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25zdHJ1Y3Rpb24teWVhcnMtbG9hZGluZy1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgPEFncmlDaGFydExvYWRlciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IHNob3dOb0RhdGEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnN0cnVjdGlvbi15ZWFycy1uby1kYXRhXCI+XG4gICAgICAgICAgICAgIDxUcmlhbmdsZUFsZXJ0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWdyaS1lbXB0eS1zdGF0ZS1pY29uXCJcbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17MS43fVxuICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxoMz57YWdyaU5vRGF0YUxhYmVsKGxhbmd1YWdlKX08L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWdyaS1zdGF0dXMtcm9vdCR7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWSENhdGVnb3J5ID8gXCIgaGFzLXNlbGVjdGlvblwiIDogXCJcIlxuICAgICAgICAgICAgICB9JHtzaG93UmVmcmVzaExvYWRlciA/IFwiIGFncmktc3RhdHVzLXJvb3QtLWxvYWRpbmdcIiA6IFwiXCJ9JHtcbiAgICAgICAgICAgICAgICAhY2hhcnRJbnRlcmFjdGl2ZSA/IFwiIGFncmktc3RhdHVzLXJvb3QtLW5vLXJlZ2lvblwiIDogXCJcIlxuICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwb2ludGVyRXZlbnRzOiBcImF1dG9cIixcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBjaGFydEludGVyYWN0aXZlID8gMSA6IDAuOTIsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGFyaWEtZGlzYWJsZWQ9eyFjaGFydEludGVyYWN0aXZlfVxuICAgICAgICAgICAgICB0aXRsZT17XG4gICAgICAgICAgICAgICAgIWNoYXJ0SW50ZXJhY3RpdmVcbiAgICAgICAgICAgICAgICAgID8gYCR7c2VsZWN0UmVnaW9uVGl0bGV9LiAke3NlbGVjdFJlZ2lvbkJvZHl9YFxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7c2hvd1JlZnJlc2hMb2FkZXIgPyA8QWdyaUNoYXJ0TG9hZGVyIC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFncmktc3RhdHVzLWdyaWRcIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJsaXN0XCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aXRsZVRleHR9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Y2hhcnREYXRhLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0ZWRWSENhdGVnb3J5ID09PSBpdGVtLmNhdGVnb3J5O1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGltbWVkID0gaGFzU2VsZWN0aW9uICYmICFzZWxlY3RlZDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBrZXk9e2l0ZW0uY2F0ZWdvcnl9XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgcm9sZT1cImxpc3RpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3NlbGVjdGVkfVxuICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshY2hhcnRJbnRlcmFjdGl2ZSB8fCBzaG93UmVmcmVzaExvYWRlcn1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e1tcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYWdyaS1zdGF0dXMtY29sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFncmktc3RhdHVzLWNvbC1idXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID8gXCJhZ3JpLXN0YXR1cy1jb2wtLXNlbGVjdGVkXCIgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGltbWVkID8gXCJhZ3JpLXN0YXR1cy1jb2wtLWRpbW1lZFwiIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAuam9pbihcIiBcIil9XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgW1wiLS1hY2NlbnRcIiBhcyBhbnldOiBpdGVtLmNvbG9yIH19XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0SW50ZXJhY3RpdmUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFzaG93UmVmcmVzaExvYWRlciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVWSFNlbGVjdGlvbkNsaWNrKGl0ZW0pXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2hhcnRJbnRlcmFjdGl2ZSB8fCBzaG93UmVmcmVzaExvYWRlcikgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgfHwgZS5rZXkgPT09IFwiIFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVWSFNlbGVjdGlvbkNsaWNrKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmktc3RhdHVzLXRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaS1zdGF0dXMtdmFsdWUtd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmktc3RhdHVzLXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuZm9ybWF0Q291bnQoaXRlbS5jb3VudCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWdyaS1zdGF0dXMtdW5pdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1wiXFx1MDBBMFwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2FyZWFVbml0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWdyaS1zdGF0dXMtbGFiZWxcIj57aXRlbS5sYWJlbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFncmktc3RhdHVzLWJhci1hcmVhXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3RhdHVzQmFyQ2hhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbD17aXRlbS5maWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcj17aXRlbS5jb2xvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRLZXk9e2Ake2l0ZW0uY2F0ZWdvcnl9LSR7aXRlbS5jb3VudH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1JbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGltbWVkPXtkaW1tZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lPXt0aGVtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iLCJpbXBvcnQgeyBSZWFjdCB9IGZyb20gXCJqaW11LWNvcmVcIjtcblxuY29uc3QgTUlOX0JBUl9QWCA9IDg7XG4vKiogRGlhZ29uYWwgY3V0IGRlcHRoIG9uIHRoZSB0b3AgZWRnZSAobGVmdCBoaWdoIOKGkiByaWdodCBsb3cpLiAqL1xuY29uc3QgVE9QX1NMQU5UX1JBVElPID0gMC4xNDtcbmNvbnN0IFRPUF9TTEFOVF9NQVggPSAxODtcblxuLyoqIFRhaWx3aW5kICotNTAgZXF1aXZhbGVudHMgZm9yIFZIIGJhciBmaWxscy4gKi9cbmNvbnN0IFZIX1NUQVRVU19UUkFDS181MDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgXCIjMTZhMzRhXCI6IFwiI2YwZmRmNFwiLCAvLyBncmVlbi01MFxuICBcIiM0YWRlODBcIjogXCIjZjBmZGY0XCIsIC8vIGdyZWVuLTUwXG4gIFwiI2Y5NzMxNlwiOiBcIiNmZmY3ZWRcIiwgLy8gb3JhbmdlLTUwXG4gIFwiI2VmNDQ0NFwiOiBcIiNmZWYyZjJcIiwgLy8gcmVkLTUwXG59O1xuXG5mdW5jdGlvbiBzdGF0dXNUcmFja0NvbG9yKGJhckNvbG9yOiBzdHJpbmcsIHRoZW1lOiBcImxpZ2h0XCIgfCBcImRhcmtcIik6IHN0cmluZyB7XG4gIGNvbnN0IGtleSA9IFN0cmluZyhiYXJDb2xvciB8fCBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgbGlnaHQ1MCA9XG4gICAgVkhfU1RBVFVTX1RSQUNLXzUwW2tleV0gfHxcbiAgICBWSF9TVEFUVVNfVFJBQ0tfNTBba2V5LnRvVXBwZXJDYXNlKCldIHx8XG4gICAgYGNvbG9yLW1peChpbiBzcmdiLCAke2JhckNvbG9yfSAxNCUsICNmZmZmZmYpYDtcblxuICBpZiAodGhlbWUgPT09IFwibGlnaHRcIikgcmV0dXJuIGxpZ2h0NTA7XG4gIC8vIERhcmsgdGhlbWU6IHNvZnQgdGludCBvZiB0aGUgc2FtZSBiYXIgY29sb3JcbiAgcmV0dXJuIGBjb2xvci1taXgoaW4gc3JnYiwgJHtiYXJDb2xvcn0gMjIlLCB0cmFuc3BhcmVudClgO1xufVxuXG4vKipcbiAqIFZlcnRpY2FsIGJhciB3aXRoIHNsYW50ZWQgdG9wICsgYm9yZGVyLXJhZGl1cyBvbiB0b3AgYW5kIGJvdHRvbSBjb3JuZXJzLlxuICovXG5mdW5jdGlvbiBzbGFudGVkQmFyUGF0aChcbiAgeDogbnVtYmVyLFxuICB5OiBudW1iZXIsXG4gIHc6IG51bWJlcixcbiAgaDogbnVtYmVyLFxuICByYWRpdXM6IG51bWJlcixcbik6IHN0cmluZyB7XG4gIGlmICh3IDw9IDAgfHwgaCA8PSAwKSByZXR1cm4gXCJcIjtcblxuICBjb25zdCBzbGFudCA9IE1hdGgubWluKFRPUF9TTEFOVF9NQVgsIE1hdGgubWF4KDYsIHcgKiBUT1BfU0xBTlRfUkFUSU8pKTtcbiAgY29uc3QgciA9IE1hdGgubWluKHJhZGl1cywgdyAvIDIsIGggLyAyKTtcbiAgY29uc3QgYm90dG9tWSA9IHkgKyBoO1xuXG4gIC8vIFRvbyBzaG9ydCBmb3IgZnVsbCByb3VuZGVkICsgc2xhbnQgZ2VvbWV0cnkg4oCUIGtlZXAgYSBzb2Z0IHNsYW50ZWQgdGlwLlxuICBpZiAoaCA8IHIgKiAyICsgc2xhbnQgKiAwLjUpIHtcbiAgICBjb25zdCB0aW55U2xhbnQgPSBNYXRoLm1pbihzbGFudCwgTWF0aC5tYXgoMiwgaCAqIDAuNCkpO1xuICAgIGNvbnN0IHRpbnlSID0gTWF0aC5taW4ociwgaCAvIDMsIHcgLyAzKTtcbiAgICByZXR1cm4gW1xuICAgICAgYE0gJHt4ICsgdGlueVJ9ICR7eX1gLFxuICAgICAgYEwgJHt4ICsgdyAtIHRpbnlSfSAke3kgKyB0aW55U2xhbnR9YCxcbiAgICAgIGBRICR7eCArIHd9ICR7eSArIHRpbnlTbGFudH0gJHt4ICsgd30gJHt5ICsgdGlueVNsYW50ICsgdGlueVJ9YCxcbiAgICAgIGBMICR7eCArIHd9ICR7Ym90dG9tWSAtIHRpbnlSfWAsXG4gICAgICBgUSAke3ggKyB3fSAke2JvdHRvbVl9ICR7eCArIHcgLSB0aW55Un0gJHtib3R0b21ZfWAsXG4gICAgICBgTCAke3ggKyB0aW55Un0gJHtib3R0b21ZfWAsXG4gICAgICBgUSAke3h9ICR7Ym90dG9tWX0gJHt4fSAke2JvdHRvbVkgLSB0aW55Un1gLFxuICAgICAgYEwgJHt4fSAke3kgKyB0aW55Un1gLFxuICAgICAgYFEgJHt4fSAke3l9ICR7eCArIHRpbnlSfSAke3l9YCxcbiAgICAgIFwiWlwiLFxuICAgIF0uam9pbihcIiBcIik7XG4gIH1cblxuICBjb25zdCB0b3BSaWdodFN0YXJ0WSA9IHkgKyBzbGFudDtcbiAgY29uc3QgcmlnaHRBZnRlclJvdW5kID0gdG9wUmlnaHRTdGFydFkgKyByO1xuXG4gIHJldHVybiBbXG4gICAgLy8gVG9wLWxlZnQgcm91bmRlZCBjb3JuZXJcbiAgICBgTSAke3h9ICR7eSArIHJ9YCxcbiAgICBgUSAke3h9ICR7eX0gJHt4ICsgcn0gJHt5fWAsXG4gICAgLy8gU2xhbnRlZCB0b3AgZWRnZVxuICAgIGBMICR7eCArIHcgLSByfSAke3RvcFJpZ2h0U3RhcnRZfWAsXG4gICAgLy8gVG9wLXJpZ2h0IHJvdW5kZWQgY29ybmVyIGludG8gdGhlIHJpZ2h0IHdhbGxcbiAgICBgUSAke3ggKyB3fSAke3RvcFJpZ2h0U3RhcnRZfSAke3ggKyB3fSAke3JpZ2h0QWZ0ZXJSb3VuZH1gLFxuICAgIC8vIFJpZ2h0IHNpZGUgZG93biB0byBib3R0b20tcmlnaHQgcm91bmRcbiAgICBgTCAke3ggKyB3fSAke2JvdHRvbVkgLSByfWAsXG4gICAgYFEgJHt4ICsgd30gJHtib3R0b21ZfSAke3ggKyB3IC0gcn0gJHtib3R0b21ZfWAsXG4gICAgLy8gQm90dG9tIGVkZ2VcbiAgICBgTCAke3ggKyByfSAke2JvdHRvbVl9YCxcbiAgICBgUSAke3h9ICR7Ym90dG9tWX0gJHt4fSAke2JvdHRvbVkgLSByfWAsXG4gICAgLy8gTGVmdCBzaWRlIGJhY2sgdXBcbiAgICBcIlpcIixcbiAgXS5qb2luKFwiIFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN0YXR1c0JhclNoYXBlKFxuICBwcm9wczogYW55LFxuICBjb2xvcjogc3RyaW5nLFxuICBzZWxlY3RlZDogYm9vbGVhbixcbiAgZGltbWVkOiBib29sZWFuLFxuICB0aGVtZTogXCJsaWdodFwiIHwgXCJkYXJrXCIsXG4pIHtcbiAgY29uc3QgeCA9IHByb3BzLnggPz8gMDtcbiAgY29uc3QgcmF3SCA9IHByb3BzLmhlaWdodCA/PyAwO1xuICBjb25zdCB3ID0gcHJvcHMud2lkdGggPz8gMDtcbiAgY29uc3QgcGxvdEJvdHRvbSA9IChwcm9wcy55ID8/IDApICsgcmF3SDtcbiAgY29uc3QgZmlsbFJhdGlvID1cbiAgICBwcm9wcy5wYXlsb2FkICYmXG4gICAgdHlwZW9mIHByb3BzLnBheWxvYWQgPT09IFwib2JqZWN0XCIgJiZcbiAgICBcImZpbGxcIiBpbiBwcm9wcy5wYXlsb2FkXG4gICAgICA/IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIE51bWJlcihwcm9wcy5wYXlsb2FkLmZpbGwpKSlcbiAgICAgIDogMDtcbiAgY29uc3QgZnVsbEggPSBmaWxsUmF0aW8gPiAwID8gcmF3SCAvIGZpbGxSYXRpbyA6IE1hdGgubWF4KHJhd0gsIE1JTl9CQVJfUFgpO1xuICBjb25zdCBoID0gTWF0aC5tYXgocmF3SCwgTUlOX0JBUl9QWCk7XG4gIGNvbnN0IHkgPSBwbG90Qm90dG9tIC0gaDtcbiAgY29uc3QgcmFkaXVzID0gTWF0aC5taW4oMTAsIHcgLyAyKTtcbiAgY29uc3QgdHJhY2tZID0gcGxvdEJvdHRvbSAtIGZ1bGxIO1xuICBjb25zdCB0cmFja0NvbG9yID0gc3RhdHVzVHJhY2tDb2xvcihjb2xvciwgdGhlbWUpO1xuICBjb25zdCBvcGFjaXR5ID0gZGltbWVkID8gMC42OCA6IDE7XG4gIGNvbnN0IGJhclBhdGggPSBzbGFudGVkQmFyUGF0aCh4LCB5LCB3LCBoLCByYWRpdXMpO1xuICBjb25zdCB0cmFja1BhdGggPSBzbGFudGVkQmFyUGF0aCh4LCB0cmFja1ksIHcsIGZ1bGxILCByYWRpdXMpO1xuICBjb25zdCBnbG93SWQgPSBgdmgtYmFyLWdsb3ctJHtTdHJpbmcoY29sb3IgfHwgXCJjXCIpLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCBcIlwiKX1gO1xuXG4gIHJldHVybiAoXG4gICAgPGcgY2xhc3NOYW1lPVwiYWdyaS1zdGF0dXMtYmFyLXNoYXBlXCIgc3R5bGU9e3sgb3BhY2l0eSB9fT5cbiAgICAgIDxkZWZzPlxuICAgICAgICA8ZmlsdGVyXG4gICAgICAgICAgaWQ9e2dsb3dJZH1cbiAgICAgICAgICB4PVwiLTYwJVwiXG4gICAgICAgICAgeT1cIi00MCVcIlxuICAgICAgICAgIHdpZHRoPVwiMjIwJVwiXG4gICAgICAgICAgaGVpZ2h0PVwiMTgwJVwiXG4gICAgICAgICAgZmlsdGVyVW5pdHM9XCJvYmplY3RCb3VuZGluZ0JveFwiXG4gICAgICAgICAgY29sb3JJbnRlcnBvbGF0aW9uRmlsdGVycz1cInNSR0JcIlxuICAgICAgICA+XG4gICAgICAgICAgPGZlR2F1c3NpYW5CbHVyXG4gICAgICAgICAgICBpbj1cIlNvdXJjZUdyYXBoaWNcIlxuICAgICAgICAgICAgc3RkRGV2aWF0aW9uPVwiMy4yXCJcbiAgICAgICAgICAgIHJlc3VsdD1cImJsdXJcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGZlQ29sb3JNYXRyaXhcbiAgICAgICAgICAgIGluPVwiYmx1clwiXG4gICAgICAgICAgICB0eXBlPVwibWF0cml4XCJcbiAgICAgICAgICAgIHZhbHVlcz1cIjEgMCAwIDAgMFxuICAgICAgICAgICAgICAgICAgICAwIDEgMCAwIDBcbiAgICAgICAgICAgICAgICAgICAgMCAwIDEgMCAwXG4gICAgICAgICAgICAgICAgICAgIDAgMCAwIDAuNTUgMFwiXG4gICAgICAgICAgICByZXN1bHQ9XCJzb2Z0XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxmZU1lcmdlPlxuICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPVwic29mdFwiIC8+XG4gICAgICAgICAgPC9mZU1lcmdlPlxuICAgICAgICA8L2ZpbHRlcj5cbiAgICAgIDwvZGVmcz5cbiAgICAgIDxwYXRoIGQ9e3RyYWNrUGF0aH0gZmlsbD17dHJhY2tDb2xvcn0gLz5cbiAgICAgIHsvKiBTb2Z0IGJsb29tIGJlaGluZCB0aGUgZmlsbGVkIGJhciAoc2FtZSBhcHByb2FjaCBhcyBsaW5lIGNoYXJ0KS4gKi99XG4gICAgICA8cGF0aFxuICAgICAgICBkPXtiYXJQYXRofVxuICAgICAgICBmaWxsPXtjb2xvcn1cbiAgICAgICAgZmlsdGVyPXtgdXJsKCMke2dsb3dJZH0pYH1cbiAgICAgICAgc3R5bGU9e3sgcG9pbnRlckV2ZW50czogXCJub25lXCIgfX1cbiAgICAgIC8+XG4gICAgICA8cGF0aCBkPXtiYXJQYXRofSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPXtiYXJQYXRofVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXsyLjI1fVxuICAgICAgICAgIHN0eWxlPXt7IHBvaW50ZXJFdmVudHM6IFwibm9uZVwiIH19XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2c+XG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=