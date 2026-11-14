/** @jsx jsx */
/** @jsxFrag React.Fragment */
import type { DashboardWidgetHost } from "../dashboard-host";
import type { UseDataSource } from "jimu-core";
import { ReactDOM, React, jsx } from "jimu-core";
import AgriMapIndicatorDrawer from "../AgriMapIndicatorDrawer";
import DateIndexPanel from "../../panels/DateIndexPanel/runtime/widget";
import PopupPanel from "../../panels/PopupPanel/runtime/widget";
import EmbeddedAgriMap from "../embedded-agri-map";
import AgriGraffReserveSwap from "../agri-graff-reserve-swap";
import AgriReserveLock from "../agri-reserve-lock";
import AgriChartLoader from "../../shared/AgriChartLoader";
import { TriangleAlert } from "lucide-react";
import { agriNoDataLabel } from "../../shared/agriNoDataLabel";
import PiePanel from "../../panels/PiePanel";
import GraffPanel from "../../panels/GraffPanel";
import BarPanel from "../../panels/BarPanel";

type BaseConfig = ReturnType<DashboardWidgetHost["toPlainConfig"]>;
type IndicatorChildProps = ReturnType<
  DashboardWidgetHost["getStableIndicatorChildProps"]
>;

/** Full-size message shown instead of the dashboard (design mode / no map). */
export function renderDashboardNotice(title: string, message: string) {
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

export function renderIndicatorPortal(
  host: DashboardWidgetHost,
  target: HTMLElement | null,
  childProps: IndicatorChildProps,
) {
  return target
    ? ReactDOM.createPortal(
        <AgriMapIndicatorDrawer
          overlayRef={host.indicatorOverlayRef}
          panelRef={host.indicatorPanelRef}
          phase={host.state.indicatorsAnimPhase}
          onToggle={host.toggleIndicatorsDrawer}
          indicatorProps={childProps.indicator}
          yieldProps={childProps.yield}
          unusedLandProps={childProps.unused}
          reserveLandProps={childProps.reserve}
        />,
        target,
      )
    : null;
}

export function renderDateIndexPortal(
  host: DashboardWidgetHost,
  target: HTMLElement | null,
  baseConfig: BaseConfig,
) {
  return target
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
        target,
      )
    : null;
}

export function renderPopupPortal(
  host: DashboardWidgetHost,
  target: HTMLElement | null,
  popupConfig: BaseConfig,
) {
  return target
    ? ReactDOM.createPortal(
        <div
          className="agri-dashboard-agri-host"
          aria-label="Polygon attribute popup"
        >
          <PopupPanel {...host.childProps("popup", popupConfig)} />
        </div>,
        target,
      )
    : null;
}

export interface MapSlotArgs {
  host: DashboardWidgetHost;
  activeMapId: string;
  showMapLoader: boolean;
  webMapDataSourceId: string;
  webMapUseDataSource: UseDataSource | undefined;
  featureUseDataSources: UseDataSource[];
}

function renderMapNoData(host: DashboardWidgetHost) {
  return (
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
  );
}

export function renderMapSlot(args: MapSlotArgs) {
  const {
    host,
    activeMapId,
    showMapLoader,
    webMapDataSourceId,
    webMapUseDataSource,
    featureUseDataSources,
  } = args;
  return (
    <section
      ref={host.mapSlotRef}
      className={`agri-dashboard-map-slot ${activeMapId ? "has-map" : "is-empty"}${showMapLoader ? " is-loading" : ""}`}
      aria-label="Map area"
    >
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
      {!showMapLoader && host.state.mapNoData && renderMapNoData(host)}
    </section>
  );
}

export function renderChartsRow(
  host: DashboardWidgetHost,
  baseConfig: BaseConfig,
) {
  return (
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
  );
}
