/** @jsx jsx */
/** @jsxFrag React.Fragment */
import type { DashboardWidgetHost } from "../dashboard-host";
import { getAppStore, AppMode, ReactDOM, React, jsx } from "jimu-core";
import { default as AgriMapIndicatorDrawer } from "../AgriMapIndicatorDrawer";
import { default as DateIndexPanel } from "../../panels/DateIndexPanel/runtime/widget";
import { default as PopupPanel } from "../../panels/PopupPanel/runtime/widget";
import { default as LocalizationPanel } from "../../filter/LocalizationPanel";
import { default as RegionPanel } from "../../panels/RegionPanel";
import { default as EmbeddedAgriMap } from "../embedded-agri-map";
import { default as AgriChartLoader } from "../../shared/AgriChartLoader";
import { TriangleAlert } from "lucide-react";
import { agriNoDataLabel } from "../../shared/agriNoDataLabel";
import { default as PiePanel } from "../../panels/PiePanel";
import { default as GraffPanel } from "../../panels/GraffPanel";
import { default as BarPanel } from "../../panels/BarPanel";
import { toMutableUseDataSources } from "./dashboard-config";

export function render(host: DashboardWidgetHost) {
  const baseConfig = host.toPlainConfig();
  const indicatorConfig = host.getIndicatorConfig(baseConfig);
  const popupConfig = host.getPopupConfig(baseConfig);
  const activeMapId = host.getActiveMapWidgetId();
  const webMapDataSourceId = String(baseConfig.webMapDataSourceId || "");
  const allDataSources = toMutableUseDataSources(host.props.useDataSources);
  const webMapUseDataSource = allDataSources.find(
    (source) => String(source?.dataSourceId || "") === webMapDataSourceId,
  );
  const featureUseDataSources = allDataSources.filter(
    (source) =>
      !!String(source?.dataSourceId || "") &&
      String(source.dataSourceId) !== webMapDataSourceId,
  );
  const isBuilderDesignPreview =
    getAppStore().getState().appRuntimeInfo?.appMode === AppMode.Design;

  // A newly dropped widget used to mount the map plus all ten embedded
  // widgets immediately, starting their ArcGIS/API queries while Builder
  // was still opening the settings panel. Keep that initial Builder state
  // lightweight throughout Design mode. Preview/published runtime mounts the
  // complete dashboard. This avoids resolving every configured map sublayer
  // while the settings panel is being opened or edited.
  if (isBuilderDesignPreview) {
    return (
      <div
        className="agri-dashboard-v3"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 240,
          padding: 24,
          background: "#1d2031",
          color: "#e8edf7",
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {host.props.manifest?.label ||
              host.props.manifest?.name ||
              "Agro Space Monitoring"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.78 }}>
            {webMapDataSourceId || allDataSources.length > 0
              ? "Data source ulangan. Natijani Preview rejimida ko‘ring."
              : "Widget sozlamalaridan Web Map yoki data source ulang."}
          </div>
        </div>
      </div>
    );
  }
  const showMapLoader =
    !!activeMapId &&
    (host.state.mapLoading || host.state.mapSurfaceLoading);
  const portalTarget =
    host.portalReady && host.portalHost
      ? host.portalHost
      : typeof document !== "undefined"
        ? document.body
        : null;
  // Keep map indicators in the map coordinate system during resize.
  // Once attached to the map slot, never fall back to body (avoids remount).
  if (host.mapSlotRef.current) {
    host.mapIndicatorHost = host.mapSlotRef.current;
  }
  const mapIndicatorTarget = host.mapIndicatorHost || portalTarget;

  const indicatorChildProps = host.getStableIndicatorChildProps(
    indicatorConfig,
    baseConfig,
  );

  const indicatorPortal = mapIndicatorTarget
    ? ReactDOM.createPortal(
        <AgriMapIndicatorDrawer
          overlayRef={host.indicatorOverlayRef}
          panelRef={host.indicatorPanelRef}
          phase={host.state.indicatorsAnimPhase}
          onToggle={host.toggleIndicatorsDrawer}
          indicatorProps={indicatorChildProps.indicator}
          yieldProps={indicatorChildProps.yield}
          unusedLandProps={indicatorChildProps.unused}
          reserveLandProps={indicatorChildProps.reserve}
        />,
        mapIndicatorTarget,
      )
    : null;

  const dateIndexPortal = mapIndicatorTarget
    ? ReactDOM.createPortal(
        <div
          ref={host.dateIndexOverlayRef}
          className="agri-dashboard-date-index-overlay agri-dashboard-indicator-overlay--compact"
          aria-label="Selected date and index indicator"
        >
          <DateIndexPanel
            {...host.childProps("date-index", baseConfig)}
          />
        </div>,
        mapIndicatorTarget,
      )
    : null;

  const popupPortal = portalTarget
    ? ReactDOM.createPortal(
        <div
          className="agri-dashboard-agri-host"
          aria-label="Polygon attribute popup"
        >
          <PopupPanel {...host.childProps("popup", popupConfig)} />
        </div>,
        portalTarget,
      )
    : null;

  const rowFr = host.getRowFrValues();

  return (
    <div
      ref={host.dashboardRootRef}
      className={`agri-dashboard-v3${host.state.mapPopupOpen ? " agri-popup-open" : ""}${host.state.mapPopupPinned ? " agri-popup-pinned" : ""}`}
      style={
        {
          "--agri-dashboard-left-width": host.getLeftPanelWidth(),
          "--agri-dashboard-top-fr": String(rowFr.top),
          "--agri-dashboard-bottom-fr": String(rowFr.bottom),
        } as React.CSSProperties
      }
    >
      <section className="agri-dashboard-header" aria-label="Localization">
        <LocalizationPanel {...host.childProps("localization", baseConfig)} />
      </section>

      <div
        className="agri-dashboard-body"
        style={{
          gridTemplateRows: `minmax(0, ${rowFr.top}fr) minmax(220px, ${rowFr.bottom}fr)`,
        }}
      >
        <div className="agri-dashboard-top-row">
          <aside
            className="agri-dashboard-left-panel"
            aria-label="Regional statistics"
          >
            <div className="agri-dashboard-widget-slot">
              <RegionPanel {...host.childProps("region", baseConfig)} />
            </div>
          </aside>

          <section
            ref={host.mapSlotRef}
            className={`agri-dashboard-map-slot ${activeMapId ? "has-map" : "is-empty"}${showMapLoader ? " is-loading" : ""}`}
            aria-label="Map area"
          >
            {false && (
              <div className="agri-dashboard-map-slot-placeholder">
                <span
                  className="agri-dashboard-map-slot-icon"
                  aria-hidden="true"
                >
                  🗺
                </span>
                <span className="agri-dashboard-map-slot-label">Xarita</span>
                <span className="agri-dashboard-map-slot-hint">
                  Sahifaga Map widget qo&apos;shing — u avtomatik shu joyni
                  egallaydi
                </span>
              </div>
            )}
            <EmbeddedAgriMap
              mapWidgetId={activeMapId}
              webMapDataSourceId={webMapDataSourceId}
              webMapUseDataSource={webMapUseDataSource}
              featureUseDataSources={featureUseDataSources}
              onViewReady={() => {
                host.embeddedMapReady = true;
                host.setMapLoading(false);
                host.setState({ mapError: "" });
                host.scheduleMapSlotLayout(true);
                host.forceUpdate();
              }}
              onLoadingChange={(mapLoading) => {
                if (!mapLoading) {
                  host.embeddedMapReady = true;
                }
                host.setMapLoading(mapLoading);
              }}
              onError={(mapError) => host.setState({ mapError })}
            />
            {!!host.state.mapError && (
              <div className="agri-dashboard-map-error" role="alert">
                {host.state.mapError}
              </div>
            )}
            {showMapLoader && (
              <div
                className="agri-dashboard-map-loading-overlay"
                aria-live="polite"
                aria-label="Map loading"
              >
                <AgriChartLoader />
              </div>
            )}
            {!showMapLoader && host.state.mapNoData && (
              <div
                className="agri-dashboard-map-no-data"
                role="status"
                aria-live="polite"
              >
                <div className="agri-dashboard-map-no-data-card">
                  <TriangleAlert
                    className="agri-empty-state-icon"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  <div className="agri-dashboard-map-no-data-title">
                    {agriNoDataLabel(host.getUiLanguage())}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="agri-dashboard-bottom-row" aria-label="Charts">
          <div className="agri-dashboard-widget-slot">
            <PiePanel {...host.childProps("pie", baseConfig)} />
          </div>
          <div className="agri-dashboard-widget-slot">
            <GraffPanel {...host.childProps("graff", baseConfig)} />
          </div>
          <div className="agri-dashboard-widget-slot">
            <BarPanel {...host.childProps("bar", baseConfig)} />
          </div>
        </div>
      </div>

      {indicatorPortal}
      {dateIndexPortal}
      {popupPortal}
    </div>
  );
}
