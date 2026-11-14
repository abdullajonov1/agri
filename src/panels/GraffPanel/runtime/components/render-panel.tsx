import type { GraffWidgetHost } from "../graff-host";
import { React } from "jimu-core";
import type { RecordData } from "../widget";
import { pickLabel } from "../../../../shared/agri-i18n";
import { GRAFF_PANEL_MESSAGES } from "./render-panel-messages";
import {
  buildHeaderLabels,
  ErrorState,
  FieldsRequiredState,
  HiddenMounts,
  LoadingState,
  NoDataState,
  TableBody,
  TableHead,
  TablePagination,
} from "./render-panel-parts";

type HostState = GraffWidgetHost["state"];

// Client-side refine only after a committed search selection.
function filterRecords(host: GraffWidgetHost): RecordData[] {
  const { records, isSearchActive = false, searchText = "" } = host.state;
  const farmerInn = String(host.state.farmerInn || "").trim().toLowerCase();
  if (farmerInn) {
    return records.filter(
      (record) => String(record.f_inn || "").trim().toLowerCase() === farmerInn,
    );
  }
  if (!isSearchActive) return records;
  const term = (searchText || "").trim().toLowerCase();
  if (!term) return records;

  return records.filter((record) => {
    const fname = String(record.f_name || "").toLowerCase();
    const finn = String(record.f_inn || "").toLowerCase();
    return fname.includes(term) || finn.includes(term);
  });
}

interface TableBodyStateProps {
  host: GraffWidgetHost;
  filteredRecords: RecordData[];
  isInitializing: boolean;
  needYear: boolean;
}

// Picks the state shown in place of the table (or the table itself).
function renderTableArea({ host, filteredRecords, isInitializing, needYear }: TableBodyStateProps) {
  const {
    loading, error, connectionStatus, selecteduniqueid, currentPage,
    totalRecordCount, configuredFields, language,
  } = host.state as HostState;

  if (configuredFields.length === 0 && !isInitializing) {
    return <FieldsRequiredState language={language} />;
  }
  if (isInitializing) return <LoadingState />;
  if (connectionStatus === "failed") {
    return (
      <ErrorState
        message={
          host.localizeRuntimeMessage(error) ||
          pickLabel(GRAFF_PANEL_MESSAGES.connectFailed, language)
        }
        buttonLabel={pickLabel(GRAFF_PANEL_MESSAGES.reconnect, language)}
        onRetry={host.retryMapConnection}
      />
    );
  }
  if (error) {
    return (
      <ErrorState
        message={host.localizeRuntimeMessage(error)}
        buttonLabel={pickLabel(GRAFF_PANEL_MESSAGES.retry, language)}
        onRetry={() => {
          void host.fetchData();
        }}
      />
    );
  }
  const isConnected = connectionStatus === "connected";
  if (
    needYear ||
    (isConnected &&
      filteredRecords.length === 0 &&
      (loading || !host._hasCompletedTableFetch))
  ) {
    return <LoadingState />;
  }
  if (isConnected && loading) return <LoadingState />;
  if (isConnected && host._hasCompletedTableFetch && filteredRecords.length === 0) {
    return <NoDataState language={language} />;
  }

  const pageSize = host.RECORDS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil((totalRecordCount || 0) / pageSize) || 1);
  const safePage = Math.min(Math.max(1, currentPage || 1), totalPages);
  const displayFields = host.getDisplayFields();

  return (
    <div className="kadastr-table-frame">
      <div className="kadastr-status-table-container" ref={host.tableContainerRef}>
        <table className="kadastr-status-table">
          <TableHead
            host={host}
            displayFields={displayFields}
            labels={buildHeaderLabels(language)}
          />
          <TableBody
            host={host}
            displayFields={displayFields}
            records={filteredRecords}
            selecteduniqueid={selecteduniqueid}
            regionalInteraction={host.isRegionalInteractionEnabled()}
          />
        </table>
        {totalRecordCount > pageSize ? (
          <TablePagination
            host={host}
            language={language}
            totalRecordCount={totalRecordCount}
            pageSize={pageSize}
            safePage={safePage}
            totalPages={totalPages}
            loading={loading}
          />
        ) : null}
      </div>
    </div>
  );
}

function renderTableView(host: GraffWidgetHost) {
  const { connectionStatus, regionalFilters, language, searchText = "", searchError = null, isSearchActive = false } =
    host.state;
  const isInitializing = connectionStatus === "connecting" || connectionStatus === "idle";
  const hasActiveSearch = isSearchActive && Boolean(searchText.trim());
  const needYear = connectionStatus === "connected" && !regionalFilters?.yil && !hasActiveSearch;

  return (
    <>
      <div className="kadastr-table-topbar">
        <div className="kadastr-table-top-label">
          {pickLabel(GRAFF_PANEL_MESSAGES.tableTitle, language)}
        </div>
        {host.renderViewModeToggle("table")}
      </div>

      {searchError && (
        <div className="kadastr-status-error" style={{ padding: 8 }}>
          <p>{host.localizeRuntimeMessage(searchError)}</p>
        </div>
      )}

      {renderTableArea({
        host,
        filteredRecords: filterRecords(host),
        isInitializing,
        needYear,
      })}
    </>
  );
}

export function render(host: GraffWidgetHost) {
  const themeClass = host.state.isDarkTheme ? "dark-theme" : "light-theme";

  return (
    <div className={`kadastr-status-card ${themeClass}`}>
      {/* Hidden mounts for DS/Map */}
      <HiddenMounts host={host} />

      <div className="kadastr-status-content">
        {host.state.viewMode === "table" ? renderTableView(host) : <>{host.renderGraph()}</>}
      </div>
    </div>
  );
}
