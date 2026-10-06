import type { LocalizationHost } from "../host";
import logoImage from "../../../assets/uzcosmos logo white.svg";
import { GraffSearchDropdown } from "../GraffSearch/GraffSearchDropdown";
import { GraffSearchInput } from "../GraffSearch/GraffSearchInput";
import { IndexInfoMenu } from "../Toolbar/IndexInfoMenu";
import { LanguageMenu } from "../Toolbar/LanguageMenu";
import { NotificationsMenu } from "../Toolbar/NotificationsMenu";
import { ToolbarGroup } from "../Toolbar/ToolbarGroup";
import { YilMenu } from "../Toolbar/YilMenu";
import { JimuMapViewComponent } from "jimu-arcgis";
import { DataSourceComponent, React, type IMUseDataSource } from "jimu-core";

export function render(host: LocalizationHost) {
  const {
    loading,
    error,
    yilOptions,
    yil,
    viloyat,
    lockedViloyat,
    connectionStatus,
    ndviDate,
    ndviDateOptions,
    isDarkTheme,
    graffSearchText,
    openToolbarMenu,
  } = host.state;

  const { language } = host.state;


  return (
    <div
      className={`agri-region-card agri-v20-root ${isDarkTheme ? "dark-theme" : "light-theme"}`}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {!host.props.useMapWidgetIds?.length &&
          host.getEffectiveUseDataSources().length > 0 &&
          host.getEffectiveUseDataSources()
            .slice(0, 1)
            .map((uds: IMUseDataSource & { id?: string }) => (
              <DataSourceComponent
                key={uds?.dataSourceId ?? uds?.id ?? Math.random()}
                useDataSource={uds}
                onDataSourceCreated={host.onDataSourceCreated}
                onDataSourceInfoChange={host.onDataSourceInfoChange}
              />
            ))}
        {host.props.useMapWidgetIds?.length > 0 && (
          <JimuMapViewComponent
            useMapWidgetId={host.props.useMapWidgetIds[0]}
            onActiveViewChange={host.onActiveViewChange}
          />
        )}
      </div>

      <div className="agri-region-content">
        {connectionStatus === "connecting" && (
          <div
            className="agri-region-loading-container"
            style={{ minHeight: 80 }}
          />
        )}

        {connectionStatus === "failed" && (
          <div className="agri-region-error">
            <p>{error || "Failed to connect. Please retry."}</p>
            <button
              onClick={host.retryMapConnection}
              className="agri-region-retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {connectionStatus === "connected" && (
          <>
            {error && !loading && (
              <div
                className="agri-region-error"
                style={{ height: "auto", padding: 0, marginBottom: 6 }}
              >
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <div className="agri-v20-main-layout">
              <div className="agri-v20-header-row">
                <div className="agri-v20-brand">
                  <img
                    src={logoImage}
                    alt="UZCOSMOS"
                    className="agri-v20-brand-logo"
                  />
                  <div className="agri-v20-brand-text">
                    <h1 className="agri-v20-brand-title">Space Agro Monitoring</h1>
                  </div>
                </div>

                <GraffSearchInput
                  graffSearchText={graffSearchText}
                  language={language}
                  _graffSearchWrapRef={host._graffSearchWrapRef}
                  handleGraffSearchInputChange={host.handleGraffSearchInputChange}
                  handleGraffSearchFocus={host.handleGraffSearchFocus}
                  handleGraffSearchClear={host.handleGraffSearchClear}
                />

                <ToolbarGroup
                  openToolbarMenu={openToolbarMenu}
                  language={language}
                  isDarkTheme={isDarkTheme}
                  connectionStatus={connectionStatus}
                  showProfileMenu={host.state.showProfileMenu}
                  _notificationsToolbarItemRef={host._notificationsToolbarItemRef}
                  _indexInfoToolbarItemRef={host._indexInfoToolbarItemRef}
                  _yilToolbarItemRef={host._yilToolbarItemRef}
                  _languageToolbarItemRef={host._languageToolbarItemRef}
                  toggleToolbarMenu={host.toggleToolbarMenu}
                  applyThemeByValue={host.applyThemeByValue}
                  toggleProfileMenu={host.toggleProfileMenu}
                  closeProfileMenu={host.closeProfileMenu}
                  handleLogout={host.handleLogout}
                />
              </div>

              {/* Footer: Display current yil and viloyat selection */}
              {/* <div className="agri-v20-footer">
                <div className="agri-v20-footer-content">
                  <span className="agri-v20-footer-item">
                    <span className="agri-v20-footer-label">yil:</span>
                    <span className="agri-v20-footer-value">{yil}</span>
                  </span>
                  <span className="agri-v20-footer-separator">•</span>
                  <span className="agri-v20-footer-item">
                    <span className="agri-v20-footer-label">vil:</span>
                    <span className="agri-v20-footer-value">
                      {lockedViloyat || viloyat}
                    </span>
                  </span>
                </div>
              </div> */}
            </div>

            <GraffSearchDropdown
              graffSearchShowSuggestions={host.state.graffSearchShowSuggestions}
              graffSearchSuggestions={host.state.graffSearchSuggestions}
              graffSearchLoading={host.state.graffSearchLoading}
              graffSearchText={graffSearchText}
              language={language}
              _graffSearchWrapRef={host._graffSearchWrapRef}
              getEffectiveViloyat={host.getEffectiveViloyat}
              handleGraffSearchRowClick={host.handleGraffSearchRowClick}
            />
            <YilMenu
              openToolbarMenu={openToolbarMenu}
              _yilToolbarItemRef={host._yilToolbarItemRef}
              yilOptions={yilOptions}
              yil={yil}
              language={language}
              applyYil={host.applyYil}
            />
            <LanguageMenu
              openToolbarMenu={openToolbarMenu}
              _languageToolbarItemRef={host._languageToolbarItemRef}
              language={language}
              applyLanguage={host.applyLanguage}
            />
            <IndexInfoMenu
              openToolbarMenu={openToolbarMenu}
              selectedIndexInfoKey={host.state.selectedIndexInfoKey}
              language={language}
              _indexInfoToolbarItemRef={host._indexInfoToolbarItemRef}
              openIndexInfoDetail={host.openIndexInfoDetail}
              closeIndexInfoMenu={host.closeIndexInfoMenu}
            />
            <NotificationsMenu
              openToolbarMenu={openToolbarMenu}
              language={language}
              notificationDays={host.state.notificationDays}
              notificationLoading={host.state.notificationLoading}
              notificationError={host.state.notificationError}
              notificationCanScrollDown={host.state.notificationCanScrollDown}
              _notificationsToolbarItemRef={host._notificationsToolbarItemRef}
              _notificationBodyRef={host._notificationBodyRef}
              onNotificationBodyScroll={host.onNotificationBodyScroll}
              formatNotificationDate={host.formatNotificationDate}
              formatFieldCount={host.formatFieldCount}
              resolveRegionNotificationName={host.resolveRegionNotificationName}
              onClose={host.closeIndexInfoMenu}
            />
          </>
        )}
      </div>
    </div>
  );
}
