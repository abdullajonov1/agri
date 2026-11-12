/** @jsx jsx */
/** @jsxFrag React.Fragment */
import type { DashboardWidgetHost } from "../dashboard-host";
import { getAppStore, AppMode, ReactDOM, React, jsx } from "jimu-core";
import AgriMapIndicatorDrawer from "../AgriMapIndicatorDrawer";
import DateIndexPanel from "../../panels/DateIndexPanel/runtime/widget";
import PopupPanel from "../../panels/PopupPanel/runtime/widget";
import LocalizationPanel from "../../filter/LocalizationPanel";
import RegionPanel from "../../panels/RegionPanel";
import EmbeddedAgriMap from "../embedded-agri-map";
import AgriGraffReserveSwap from "../agri-graff-reserve-swap";
import AgriReserveLock from "../agri-reserve-lock";
import AgriChartLoader from "../../shared/AgriChartLoader";
import { TriangleAlert } from "lucide-react";
import { agriNoDataLabel } from "../../shared/agriNoDataLabel";
import PiePanel from "../../panels/PiePanel";
import GraffPanel from "../../panels/GraffPanel";
import BarPanel from "../../panels/BarPanel";
import { getConnectedWebMapId, toMutableUseDataSources } from "./dashboard-config";

/** Data source type from the app config ("WEB_MAP", …), undefined if unknown. */
function readAppDataSourceType(dataSourceId: string): string | undefined {
  const type = getAppStore().getState().appConfig?.dataSources?.[dataSourceId]?.type;
  return type ? String(type) : undefined;
}

/** Full-size message shown instead of the dashboard (design mode / no map). */
function renderDashboardNotice(title: string, message: string) {
  return (
    <div
      className="agri-dashboard-v3"
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        height: "100%",
        padding: 24,
        background: "#1d2031",
        color: "#e8edf7",
        textAlign: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, opacity: 0.78 }}>{message}</div>
      </div>
    </div>
  );
}

export function render(host: DashboardWidgetHost) {
  const baseConfig = host.toPlainConfig();
  const indicatorConfig = host.getIndicatorConfig(baseConfig);
  const popupConfig = host.getPopupConfig(baseConfig);
  const activeMapId = host.getActiveMapWidgetId();
  const allDataSources = toMutableUseDataSources(host.props.useDataSources);
  // The WebMap the settings connect: picked in "Select data" itself, or the
  // map whose layers were picked there. "" = nothing selected.
  const connectedWebMapId = getConnectedWebMapId(
    baseConfig,
    host.props.useDataSources,
    readAppDataSourceType,
  );
  const webMapDataSourceId = connectedWebMapId;
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
  const dashboardTitle = String(
    host.props.manifest?.label ||
      host.props.manifest?.name ||
      "Agro Space Monitoring",
  );
  if (isBuilderDesignPreview) {
    return renderDashboardNotice(
      dashboardTitle,
      connectedWebMapId
        ? "Xarita ulangan. Natijani Preview rejimida ko‘ring."
        : "Widget sozlamalarida Web Map yoki uning qatlamlarini (Select data) tanlang.",
    );
  }
  // Nothing loads until the settings connect a WebMap: the panels below are
  // what query the services, so none of them mounts without it (and the
  // embedded map never opens a basemap-only map).
  if (!connectedWebMapId) {
    return renderDashboardNotice(
      dashboardTitle,
      "Xarita ulanmagan. Widget sozlamalarida Web Map yoki uning qatlamlarini tanlang — ulanmaguncha ma’lumotlar yuklanmaydi.",
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
              onError={(mapError) => { host.setState({ mapError }); }}
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
            <AgriReserveLock>
              <PiePanel {...host.childProps("pie", baseConfig)} />
            </AgriReserveLock>
          </div>
          <div className="agri-dashboard-widget-slot">
            <AgriGraffReserveSwap>
              <GraffPanel {...host.childProps("graff", baseConfig)} />
            </AgriGraffReserveSwap>
          </div>
          <div className="agri-dashboard-widget-slot">
            <AgriReserveLock>
              <BarPanel {...host.childProps("bar", baseConfig)} />
            </AgriReserveLock>
          </div>
        </div>
      </div>

      {indicatorPortal}
      {dateIndexPortal}
      {popupPortal}
    </div>
  );
}
