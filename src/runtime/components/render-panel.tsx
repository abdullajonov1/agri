/** @jsx jsx */
/** @jsxFrag React.Fragment */
import type { DashboardWidgetHost } from "../dashboard-host";
import { getAppStore, AppMode, React, jsx } from "jimu-core";
import LocalizationPanel from "../../filter/LocalizationPanel";
import RegionPanel from "../../panels/RegionPanel";
import { getConnectedWebMapId, toMutableUseDataSources } from "./dashboard-config";
import {
  renderChartsRow,
  renderDashboardNotice,
  renderDateIndexPortal,
  renderIndicatorPortal,
  renderMapSlot,
  renderPopupPortal,
} from "./render-panel-parts";

/** Data source type from the app config ("WEB_MAP", …), undefined if unknown. */
function readAppDataSourceType(dataSourceId: string): string | undefined {
  const type = getAppStore().getState().appConfig?.dataSources?.[dataSourceId]?.type;
  return type ? String(type) : undefined;
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

  const indicatorPortal = renderIndicatorPortal(
    host,
    mapIndicatorTarget,
    indicatorChildProps,
  );
  const dateIndexPortal = renderDateIndexPortal(
    host,
    mapIndicatorTarget,
    baseConfig,
  );
  const popupPortal = renderPopupPortal(host, portalTarget, popupConfig);

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

          {renderMapSlot({
            host,
            activeMapId,
            showMapLoader,
            webMapDataSourceId,
            webMapUseDataSource,
            featureUseDataSources,
          })}
        </div>

        {renderChartsRow(host, baseConfig)}
      </div>

      {indicatorPortal}
      {dateIndexPortal}
      {popupPortal}
    </div>
  );
}
