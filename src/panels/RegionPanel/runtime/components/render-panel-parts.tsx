import type { RegionWidgetHost } from "../region-host";
import type { AgriDisplayLanguage } from "../widget";
import { React, DataSourceComponent } from "jimu-core";

import { JimuMapViewComponent } from "jimu-arcgis";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { SortDescIcon, SortAscIcon } from "../SortIcons";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { Button } from "jimu-ui";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";
import { AgriRegionBarChart } from "../AgriRegionBarChart";

type PanelState = RegionWidgetHost["state"];
type BarChartProps = React.ComponentProps<typeof AgriRegionBarChart>;

export interface HeaderParts {
  showBackButton: boolean;
  backButtonText: string;
  breadcrumb: string;
  countFilterLabel: string;
  sortTitle: string;
  effectiveDisplayCount: number;
}

export interface BodyParts {
  mapErrorFallback: string;
  retryButtonText: string;
  chartData: BarChartProps["data"];
  chartAreaHeight: number;
  chartBarGap: number;
  chartTrackRightInset: number;
  labelColumnWidth: number;
  chartAxisMax: number;
  unitLabel: string;
  chartViewKey: string;
  currentDataLength: number;
}

export function renderHiddenSources(host: RegionWidgetHost): JSX.Element {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {host.props.useDataSources?.length > 0 && (
        <DataSourceComponent
          key={String(host.props.useDataSources[0]?.dataSourceId || "ds-0")}
          useDataSource={host.props.useDataSources[0]}
          onDataSourceCreated={host.onDataSourceCreated}
        />
      )}
      <JimuMapViewComponent
        useMapWidgetId={host.props.useMapWidgetIds?.[0]}
        onActiveViewChange={host.onActiveViewChange}
      />
    </div>
  );
}

function renderCountFilter(
  host: RegionWidgetHost,
  displayCountMenuOpen: boolean,
  parts: HeaderParts,
): JSX.Element {
  const { effectiveDisplayCount, countFilterLabel } = parts;
  return (
    <div
      ref={host._countFilterRef}
      className={`agri-v11-regional-stats-count-filter ${displayCountMenuOpen ? "is-open" : ""}`}
    >
      <div
        className="agri-v11-regional-stats-count-menu"
        role="listbox"
        aria-label={countFilterLabel}
        aria-expanded={displayCountMenuOpen}
      >
        {host.getDisplayCountOptions().reverse().map((count) => (
          <button
            key={count}
            type="button"
            role="option"
            aria-selected={effectiveDisplayCount === count}
            className={`agri-v11-regional-stats-count-pill ${effectiveDisplayCount === count ? "is-active" : ""} ${
              !displayCountMenuOpen && effectiveDisplayCount !== count
                ? "is-collapsed"
                : ""
            }`}
            onClick={() => { host.handleDisplayCountPillClick(count); }}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}

function renderSortButton(
  host: RegionWidgetHost,
  sortMode: PanelState["sortMode"],
  sortTitle: string,
): JSX.Element {
  return (
    <div className="agri-v11-regional-stats-sort-buttons">
      <button
        type="button"
        className="agri-v11-regional-stats-sort-button active"
        onClick={host.cycleSortMode}
        onMouseDown={(e) => { e.preventDefault(); }}
        title={sortTitle}
        aria-label={sortTitle}
      >
        {sortMode === "value_desc" ? (
          <SortDescIcon />
        ) : (
          <SortAscIcon />
        )}
      </button>
    </div>
  );
}

export function renderHeader(host: RegionWidgetHost, parts: HeaderParts): JSX.Element {
  const { displayCountMenuOpen, sortMode, currentView } = host.state;
  const { showBackButton, backButtonText, breadcrumb, sortTitle } = parts;
  return (
    <div className="agri-v11-regional-stats-header">
      <div className="agri-v11-regional-stats-header-left">
        <div className="agri-v11-regional-stats-navigation">
          {showBackButton && (
            <button
              className="agri-v11-regional-stats-back-button"
              onClick={host.navigateBack}
              title={backButtonText}
              aria-label={backButtonText}
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="agri-v11-regional-stats-header-title">{breadcrumb}</div>
      </div>
      <div className="agri-v11-regional-stats-header-controls">
        {currentView === "tuman" && renderCountFilter(host, displayCountMenuOpen, parts)}
        {renderSortButton(host, sortMode, sortTitle)}
      </div>
    </div>
  );
}

function renderLoader(): JSX.Element {
  return (
    <div className="agri-v11-regional-stats-loading-container">
      <AgriChartLoader />
    </div>
  );
}

function renderChart(host: RegionWidgetHost, parts: BodyParts): JSX.Element {
  return (
    <div
      className="agri-v11-regional-stats-chart-scroll"
      ref={host._chartContainerRef}
      onMouseMove={host.handleChartSurfaceMove}
    >
      <AgriRegionBarChart
        data={parts.chartData}
        chartAreaHeight={parts.chartAreaHeight}
        chartBarGap={parts.chartBarGap}
        chartTrackRightInset={parts.chartTrackRightInset}
        nameColumnWidth={parts.labelColumnWidth}
        chartAxisMax={parts.chartAxisMax}
        unitLabel={parts.unitLabel}
        selectedRegion={host.state.selectedRegion}
        viewKey={parts.chartViewKey}
        formatNumber={(value) => host.formatNumber(value)}
        onRowClick={host.handleBarRowClick}
        onRowPointerEnter={host.handleBarRowPointerEnter}
        onRowPointerMove={host.handleBarRowPointerMove}
      />
    </div>
  );
}

function renderBodyContent(host: RegionWidgetHost, parts: BodyParts): JSX.Element {
  const { regionalLoading, regionalError, connectionStatus, currentFilters, language } = host.state;
  if (connectionStatus === "connecting") return renderLoader();
  if (connectionStatus === "failed") {
    return (
      <div className="agri-v11-regional-stats-error">
        <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <p>{regionalError || parts.mapErrorFallback}</p>
      </div>
    );
  }
  if (!currentFilters.yil) return renderLoader();
  if (regionalLoading) return renderLoader();
  if (regionalError) {
    return (
      <div className="agri-v11-regional-stats-error">
        <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <p>{regionalError}</p>
        <Button onClick={host.fetchRegionalData} type="primary" size="sm">
          {parts.retryButtonText}
        </Button>
      </div>
    );
  }
  if (parts.currentDataLength === 0) {
    return (
      <div className="agri-v11-regional-stats-no-data">
        <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <h3>{agriNoDataLabel(language as AgriDisplayLanguage)}</h3>
      </div>
    );
  }
  return renderChart(host, parts);
}

export function renderBody(host: RegionWidgetHost, parts: BodyParts): JSX.Element {
  return (
    <div
      className="agri-v11-regional-stats-body"
      ref={host._chartAreaRef}
    >
      {renderBodyContent(host, parts)}
    </div>
  );
}

export function renderCursorTooltip(host: RegionWidgetHost): JSX.Element | null {
  const { cursorTooltip } = host.state;
  if (!cursorTooltip.visible || !cursorTooltip.data) return null;
  return (
    <div
      ref={host._cursorTooltipRef}
      className="agri-v11-regional-tooltip agri-v11-regional-tooltip-cursor-follow"
    >
      {host.renderCursorTooltipContent(cursorTooltip.data)}
    </div>
  );
}
