// Unused Land Indicator — standalone widget, independent of AgriIndicator10.
// Shows sum(maydon) from Agri_unused_land, scoped by the same master yil/viloyat/tuman filters.

import { AllWidgetProps, React } from "jimu-core";
import AgriDashboardSpinner from "../../../shared/AgriDashboardSpinner";
import AgriAnimatedCount from "../../../shared/AgriAnimatedCount";
import { getAgriUnusedLandLayer } from "../../../gis/agri-unused-land-data-source";
import { buildTumanEqualsSql, eqAposSmart, normalizeApos } from "../../../data/agri-sql";
import {
  buildYearLikeClause,
  joinAndClauses,
} from "../../../controller/agri-where-builder";
import { buildTurlarSqlClause } from "../../../shared/agri-crop-labels";
import { combineAccessWhereIfFieldsExist } from "../../../shared/agri-access-config";
import { bindMasterFilter } from "../../../data/agri-filter-bus";
import { queryIndicatorOutStatNullable } from "../../../data/agri-indicator-stats";
import { normalizeTurlarListSql } from "../../../data/agri-turlar";
import {
  detectIsDarkTheme,
  normalizeLanguage,
  resolveInitialLanguage,
  type AgriLanguage,
} from "../../../shared/agri-language";
import { isStaleMasterFilterEvent } from "../../../shared/agri-indicator-common";
import {
  finiteMetaNumber,
  panelEventDetail,
  type PanelFilterDetail,
} from "../../panel-filter-detail";
import "../../IndicatorPanel/runtime/KadastrIndicator.css";

/** Logger disabled — keep call sites without console noise. */
function agriLog(_phase: string, _detail?: Record<string, unknown>): void {
  /* no-op */
}

interface State {
  value: number | null;
  loading: boolean;
  error: string | null;

  yil: string;
  viloyat: string;
  tuman: string;
  turlar: string[];
  uniqueid: string;
  lockedViloyat: string | null;

  layer: __esri.FeatureLayer | null;
  connectionStatus: "idle" | "connecting" | "connected" | "failed";

  isDarkTheme: boolean;
  language: AgriLanguage;
}

export default class AgriIndicatorUnusedLand extends React.PureComponent<
  AllWidgetProps<Record<string, unknown>>,
  State
> {
  private _isMounted = false;
  private _unbindMasterFilter: (() => void) | null = null;
  private _requestId = 0;
  private _lastMasterFilterTs = 0;
  private _lastMasterFilterBroadcastGeneration = 0;

  constructor(props: AllWidgetProps<Record<string, unknown>>) {
    super(props);
    this.state = {
      value: null,
      loading: true,
      error: null,

      yil: "",
      viloyat: "",
      tuman: "",
      turlar: [],
      uniqueid: "",
      lockedViloyat: null,

      layer: null,
      connectionStatus: "idle",

      isDarkTheme: detectIsDarkTheme(),
      language: resolveInitialLanguage(),
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
    this._unbindMasterFilter = bindMasterFilter(this.handleMasterFilterChanged);
    document.addEventListener(
      "agriV11ThemeToggled",
      this.handleThemeChange as EventListener,
    );
    document.addEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );

    this.setState({ connectionStatus: "connecting" });
    getAgriUnusedLandLayer()
      .then(({ layer }) => {
        if (!this._isMounted) return;
        this.setState({ layer: layer as __esri.FeatureLayer, connectionStatus: "connected" }, () =>
          this.fetchValue(),
        );
      })
      .catch((err) => {
        if (!this._isMounted) return;
        this.setState({
          connectionStatus: "failed",
          loading: false,
          error: String(err?.message || err),
        });
      });
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    this._unbindMasterFilter?.();
    this._unbindMasterFilter = null;
    document.removeEventListener(
      "agriV11ThemeToggled",
      this.handleThemeChange as EventListener,
    );
    document.removeEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
  }

  private handleThemeChange = (event: Event): void => {
    const detail = (event as CustomEvent<PanelFilterDetail | null>)?.detail;
    if (detail?.theme) {
      this.setState({ isDarkTheme: detail.theme === "dark" });
    } else {
      this.setState({ isDarkTheme: detectIsDarkTheme() });
    }
  };

  private handleLanguageChange = (event: Event): void => {
    if (!this._isMounted) return;
    const d = panelEventDetail(event);
    const next = normalizeLanguage(d.lang ?? d.language ?? d.code);
    if (next !== this.state.language) this.setState({ language: next });
  };

  private normalizeTurlar = (raw: unknown, fallback = ""): string[] =>
    normalizeTurlarListSql(raw, fallback);

  private handleMasterFilterChanged = (event: Event): void => {
    if (!this._isMounted) return;
    const d = panelEventDetail(event);
    if (!d?.filters) return;

    const eventTs = finiteMetaNumber(d?.meta, "timestamp");
    const eventGen = finiteMetaNumber(d?.meta, "broadcastGeneration");
    if (
      isStaleMasterFilterEvent(eventTs, eventGen, {
        lastMasterFilterTs: this._lastMasterFilterTs,
        lastMasterFilterBroadcastGeneration:
          this._lastMasterFilterBroadcastGeneration,
      })
    ) {
      return;
    }
    if (eventGen > 0) this._lastMasterFilterBroadcastGeneration = eventGen;
    if (eventTs > 0) this._lastMasterFilterTs = eventTs;

    const f = d.filters;
    const nextYil = (f.yil ?? "").toString();
    const nextViloyat = normalizeApos(f.viloyat || "");
    const nextTuman = normalizeApos(f.tuman || "");
    const nextTurlar = this.normalizeTurlar(
      f.turlar,
      f.turi || f.tur || "",
    );
    const nextUniqueid = f.polygonMode
      ? String(f.uniqueid || "").trim()
      : "";
    const nextLocked = d?.scope?.lockedViloyat
      ? normalizeApos(String(d.scope.lockedViloyat))
      : null;

    const changed =
      nextYil !== this.state.yil ||
      nextViloyat !== this.state.viloyat ||
      nextTuman !== this.state.tuman ||
      JSON.stringify(nextTurlar) !== JSON.stringify(this.state.turlar) ||
      nextUniqueid !== this.state.uniqueid ||
      nextLocked !== this.state.lockedViloyat;

    if (!changed) return;

    this.setState(
      {
        yil: nextYil,
        viloyat: nextViloyat,
        tuman: nextTuman,
        turlar: nextTurlar,
        uniqueid: nextUniqueid,
        lockedViloyat: nextLocked,
      },
      () => this.fetchValue(),
    );
  };

  /** Exact schema field, matched case-insensitively. Null when the column is absent. */
  private layerField(name: string): { name: string; type: string } | null {
    const wanted = String(name || "").trim().toLowerCase();
    if (!wanted) return null;
    const fields: __esri.Field[] = Array.isArray(this.state.layer?.fields)
      ? this.state.layer.fields
      : [];
    for (const field of fields) {
      const fieldName = String(field?.name || "");
      if (fieldName.toLowerCase() === wanted) {
        return { name: fieldName, type: String(field?.type || "") };
      }
    }
    return null;
  }

  private yearStatField(): { name: string; type: string } | null {
    return this.layerField("yil") || this.layerField("year");
  }

  /**
   * No statistics request unless both the year column and maydon are on the
   * layer. Applies to every selected year (2026, 2027, …): the check is the
   * field name, not the year value.
   */
  private schemaBlocksStats(): boolean {
    if (this.state.connectionStatus !== "connected" || !this.state.layer) {
      return false;
    }
    return !this.yearStatField() || !this.layerField("maydon");
  }

  private yearClause(yearField: { name: string; type: string }, yil: string): string {
    const type = yearField.type.toLowerCase();
    const numeric =
      type === "small-integer" ||
      type === "integer" ||
      type === "single" ||
      type === "double" ||
      type === "long" ||
      type === "oid";
    const digits = String(yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
    if (numeric && digits) return `${yearField.name} = ${Number(digits)}`;
    return buildYearLikeClause(yil, { field: yearField.name });
  }

  private buildWhere(yearField: { name: string; type: string }): string | null {
    const { yil, viloyat, tuman, turlar, uniqueid, lockedViloyat } = this.state;
    const clauses: string[] = [];
    const yearSql = this.yearClause(yearField, yil);
    if (!yearSql) return null;
    clauses.push(yearSql);

    const viloyatField = this.layerField("viloyat");
    const effectiveViloyat = lockedViloyat || viloyat;
    if (effectiveViloyat && viloyatField) {
      const vilClause = eqAposSmart(viloyatField.name, effectiveViloyat);
      if (vilClause) clauses.push(vilClause);
    }

    const tumanRaw = String(tuman || "").trim();
    if (tumanRaw && /^\d+$/.test(normalizeApos(tumanRaw))) {
      const districtField = this.layerField("district");
      if (districtField) {
        clauses.push(
          `${districtField.name} = '${Number(normalizeApos(tumanRaw))}'`,
        );
      }
    } else if (tumanRaw) {
      const tumanField = this.layerField("tuman");
      if (tumanField) {
        const tumanClause = buildTumanEqualsSql(tumanField.name, tumanRaw);
        if (tumanClause && !/\bdistrict\b/i.test(tumanClause)) {
          clauses.push(tumanClause);
        }
      }
    }

    const turiField = this.layerField("turi");
    if (turiField && turlar.length) {
      const cropClause = buildTurlarSqlClause(turiField.name, turlar);
      if (cropClause) clauses.push(cropClause);
    }

    const uniqueField = this.layerField("uniqueid");
    if (uniqueid && uniqueField) {
      const idClause = eqAposSmart(uniqueField.name, uniqueid);
      if (idClause) clauses.push(idClause);
    }

    const fieldNames = (
      Array.isArray(this.state.layer?.fields)
        ? this.state.layer.fields
        : []
    ).map((field: __esri.Field) => String(field?.name || ""));
    return combineAccessWhereIfFieldsExist(joinAndClauses(clauses, "1=1"), fieldNames);
  }

  private fetchValue = async (): Promise<void> => {
    const { layer, connectionStatus, yil } = this.state;
    if (!layer || connectionStatus !== "connected") return;

    const yearField = this.yearStatField();
    const areaField = this.layerField("maydon");
    if (!yearField || !areaField) {
      this._requestId += 1;
      this.setState({ value: null, loading: false, error: null });
      return;
    }

    if (!yil) {
      this.setState({ value: null, loading: true, error: null });
      return;
    }

    const requestId = ++this._requestId;
    this.setState({ error: null });
    if (this.state.value == null) {
      this.setState({ loading: true });
    }

    try {
      const where = this.buildWhere(yearField);
      if (!where) {
        this.setState({ value: null, loading: false, error: null });
        return;
      }

      agriLog("query:request", {
        url: layer?.url,
        where,
        outStatistics: [
          {
            onStatisticField: areaField.name,
            statisticType: "sum",
            outStatisticFieldName: "agg",
          },
        ],
      });

      const raw = await queryIndicatorOutStatNullable({
        layer,
        where,
        statisticType: "sum",
        onStatisticField: areaField.name,
      });
      if (!this._isMounted || requestId !== this._requestId) return;

      // null aggregate means no matching data; keep it distinct from a real zero.
      agriLog("query:response", {
        where,
        rawAgg: raw,
        sumMaydon: raw,
        matchedZeroRows: raw == null,
      });
      this.setState({
        value: raw != null && Number.isFinite(raw) ? raw : null,
        loading: false,
        error: null,
      });
    } catch {
      if (!this._isMounted || requestId !== this._requestId) return;
      this.setState({ loading: false, value: null, error: null });
    }
  };

  render() {
    const { value, loading, error, isDarkTheme, language } = this.state;

    const label =
      language === "en"
        ? "Unused land"
        : language === "ru"
        ? "Неиспользуемые земли"
        : language === "uz_lat"
          ? "Foydalanilmagan yer"
          : "Фойдаланилмаган ер";

    const unit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";

    const themeClass = isDarkTheme ? "dark-theme" : "light-theme";
    const showBlockingLoader =
      !this.schemaBlocksStats() &&
      !error &&
      value == null &&
      (loading || !(this.state.yil || "").trim());
    const connectionFailed =
      this.state.connectionStatus === "failed" && !!error && value == null;

    return (
      <div
        className={`vegetation-stats-widget ${themeClass} map-overlay-mode`}
        data-ind-size="sm"
      >
        {showBlockingLoader ? (
          <div className="loading-indicator">
            <AgriDashboardSpinner compact size={40} />
          </div>
        ) : (
          <div className="widget-content">
            <div className="stat-main">
              <div className="stat-label">{label}</div>
              <div className="stat-value">
                {connectionFailed ? (
                  <span title={String(error || "")}>-</span>
                ) : (
                  <AgriAnimatedCount value={value} emptyFallback="-" />
                )}
                <span className="unit">{unit}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
