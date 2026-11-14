// Shared logic for the standalone stat indicators (Yield, Unused land, Reserve land).
// Variants supply only their config: layer loader, label/unit, and the fetch itself.

import { AGRI_EVENTS } from "../../shared/agri-events";
import { type AllWidgetProps, React } from "jimu-core";
import AgriDashboardSpinner from "../../shared/AgriDashboardSpinner";
import AgriAnimatedCount from "../../shared/AgriAnimatedCount";
import { normalizeApos } from "../../data/agri-sql";
import { bindMasterFilter } from "../../data/agri-filter-bus";
import {
  detectIsDarkTheme,
  normalizeLanguage,
  resolveInitialLanguage,
  type AgriLanguage,
} from "../../shared/agri-language";
import { isStaleMasterFilterEvent } from "../../shared/agri-indicator-common";
import { pickLabel, type AgriLabel } from "../../shared/agri-i18n";
import {
  finiteMetaNumber,
  panelEventDetail,
  type PanelFilterDetail,
} from "../panel-filter-detail";
import "../IndicatorPanel/runtime/KadastrIndicator.css";

export type IndicatorStatProps = AllWidgetProps<Record<string, unknown>>;

export interface IndicatorStatState {
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

export abstract class IndicatorStatBase extends React.PureComponent<
  IndicatorStatProps,
  IndicatorStatState
> {
  protected _isMounted = false;
  protected _requestId = 0;
  /** Set once the master filter has been received (variants may require it before querying). */
  protected _hasMasterFilter = false;
  private _unbindMasterFilter: (() => void) | null = null;
  private _lastMasterFilterTs = 0;
  private _lastMasterFilterBroadcastGeneration = 0;

  /** Variant config. */
  protected abstract readonly label: AgriLabel;
  protected readonly unit: AgriLabel | null = null;
  protected readonly requiresMasterFilter: boolean = false;

  protected abstract loadLayer(): Promise<{ layer: unknown }>;
  protected abstract fetchValue(): Promise<void>;
  protected abstract normalizeTurlar(raw: unknown, fallback?: string): string[];

  constructor(props: IndicatorStatProps) {
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
      AGRI_EVENTS.languageChanged,
      this.handleLanguageChange as EventListener,
    );

    this.setState({ connectionStatus: "connecting" });
    this.loadLayer()
      .then(({ layer }) => {
        if (!this._isMounted) return;
        this.setState(
          { layer: layer as __esri.FeatureLayer, connectionStatus: "connected" },
          () => {
            if (!this.requiresMasterFilter || this._hasMasterFilter) {
              void this.fetchValue();
            }
          },
        );
      })
      .catch((err: unknown) => {
        if (!this._isMounted) return;
        const e = err as { message?: unknown } | null;
        this.setState({
          connectionStatus: "failed",
          loading: false,
          error: String(e?.message || err),
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
      AGRI_EVENTS.languageChanged,
      this.handleLanguageChange as EventListener,
    );
  }

  private readonly handleThemeChange = (event: Event): void => {
    const detail = (event as CustomEvent<PanelFilterDetail | null>)?.detail;
    if (detail?.theme) {
      this.setState({ isDarkTheme: detail.theme === "dark" });
    } else {
      this.setState({ isDarkTheme: detectIsDarkTheme() });
    }
  };

  private readonly handleLanguageChange = (event: Event): void => {
    if (!this._isMounted) return;
    const d = panelEventDetail(event);
    const next = normalizeLanguage(d.lang ?? d.language ?? d.code);
    if (next !== this.state.language) this.setState({ language: next });
  };

  private readonly handleMasterFilterChanged = (event: Event): void => {
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

    const firstFilter = !this._hasMasterFilter;
    this._hasMasterFilter = true;

    const f = d.filters;
    const nextYil = (f.yil ?? "").toString();
    const nextViloyat = normalizeApos(f.viloyat || "");
    const nextTuman = normalizeApos(f.tuman || "");
    const nextTurlar = this.normalizeTurlar(f.turlar, f.turi || f.tur || "");
    const nextUniqueid = f.polygonMode ? String(f.uniqueid || "").trim() : "";
    const nextLocked = d?.scope?.lockedViloyat
      ? normalizeApos(String(d.scope.lockedViloyat))
      : null;

    const changed =
      (this.requiresMasterFilter && firstFilter) ||
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
      () => {
        void this.fetchValue();
      },
    );
  };

  /** True once a usable year is selected. */
  protected isYearKnown(): boolean {
    return (this.state.yil || "").trim() !== "";
  }

  /** Extra condition that suppresses the blocking loader (e.g. schema lacks columns). */
  protected isLoaderSuppressed(): boolean {
    return false;
  }

  render(): React.ReactNode {
    const { value, loading, error, isDarkTheme, language } = this.state;

    const themeClass = isDarkTheme ? "dark-theme" : "light-theme";
    const showBlockingLoader =
      !this.isLoaderSuppressed() &&
      !error &&
      value == null &&
      (loading || !this.isYearKnown());
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
              <div className="stat-label">{pickLabel(this.label, language)}</div>
              <div className="stat-value">
                {connectionFailed ? (
                  <span title={String(error || "")}>-</span>
                ) : (
                  <AgriAnimatedCount value={value} emptyFallback="-" />
                )}
                {this.unit ? (
                  <span className="unit">{pickLabel(this.unit, language)}</span>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
