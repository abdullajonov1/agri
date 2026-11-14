import type { GraffWidgetHost } from "../graff-host";
import { React } from "jimu-core";
import type { RecordData } from "../widget";
import { JimuMapViewComponent } from "jimu-arcgis";
import { TriangleAlert, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";
import { pickLabel } from "../../../../shared/agri-i18n";
import { GRAFF_PANEL_MESSAGES } from "./render-panel-messages";

export function render(host: GraffWidgetHost) {
  const {
    loading,
    error,
    records,
    isDarkTheme,
    connectionStatus,
    selecteduniqueid,
    currentPage,
    totalRecordCount,
    configuredFields,
    regionalFilters,
    language,
    searchText = "",
    searchError = null,
    isSearchActive = false,
    viewMode,
  } = host.state;

  const uniqueIdHeader = "UID";
  const vhHeaderLabel = pickLabel(GRAFF_PANEL_MESSAGES.vhHeader, language);
  const viloyatLabel = pickLabel(GRAFF_PANEL_MESSAGES.viloyat, language);
  const tumanLabel = pickLabel(GRAFF_PANEL_MESSAGES.tuman, language);
  const regionLabel = pickLabel(GRAFF_PANEL_MESSAGES.region, language);
  const districtLabel = pickLabel(GRAFF_PANEL_MESSAGES.district, language);
  const yilLabel = pickLabel(GRAFF_PANEL_MESSAGES.yil, language);
  const turiLabel = pickLabel(GRAFF_PANEL_MESSAGES.turi, language);
  const maydonLabel = pickLabel(GRAFF_PANEL_MESSAGES.maydon, language);
  const nameLabel = pickLabel(GRAFF_PANEL_MESSAGES.name, language);
  const shapeLengLabel = pickLabel(GRAFF_PANEL_MESSAGES.shapeLeng, language);
  const globalIdLabel = pickLabel(GRAFF_PANEL_MESSAGES.globalId, language);
  const fNameLabel = pickLabel(GRAFF_PANEL_MESSAGES.fName, language);
  const fInnLabel = pickLabel(GRAFF_PANEL_MESSAGES.fInn, language);
  const fCadLabel = pickLabel(GRAFF_PANEL_MESSAGES.fCad, language);
  const yldLabel = pickLabel(GRAFF_PANEL_MESSAGES.yld, language);
  const numericIdLabel = pickLabel(GRAFF_PANEL_MESSAGES.numericId, language);
  const tableTitle = pickLabel(GRAFF_PANEL_MESSAGES.tableTitle, language);

  const themeClass = isDarkTheme ? "dark-theme" : "light-theme";
  const regionalInteraction = host.isRegionalInteractionEnabled();
  const isInitializing =
    connectionStatus === "connecting" || connectionStatus === "idle";

  // 🔎 Client-side refine only after a committed search selection.
  const getFilteredRecords = (): RecordData[] => {
    const farmerInn = String(host.state.farmerInn || "").trim().toLowerCase();
    if (farmerInn) {
      return records.filter(
        (record) =>
          String(record.f_inn || "").trim().toLowerCase() === farmerInn,
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
  };

  const filteredRecords = getFilteredRecords();
  const pageSize = host.RECORDS_PER_PAGE;
  const totalPages = Math.max(
    1,
    Math.ceil((totalRecordCount || 0) / pageSize) || 1,
  );
  const safePage = Math.min(Math.max(1, currentPage || 1), totalPages);
  const paginationTotalLabel = pickLabel(GRAFF_PANEL_MESSAGES.paginationTotal, language);
  const paginationPageLabel = pickLabel(GRAFF_PANEL_MESSAGES.paginationPage, language);
  const paginationRowsLabel = pickLabel(GRAFF_PANEL_MESSAGES.paginationRows, language);

  const hasActiveSearch = isSearchActive && Boolean(searchText.trim());
  const needYear =
    connectionStatus === "connected" &&
    !regionalFilters?.yil &&
    !hasActiveSearch;
  const displayFields = host.getDisplayFields();

  return (
    <div className={`kadastr-status-card ${themeClass}`}>
      {/* Hidden mounts for DS/Map */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {host.props.useMapWidgetIds?.length > 0 && (
          <JimuMapViewComponent
            useMapWidgetId={host.props.useMapWidgetIds[0]}
            onActiveViewChange={host.onActiveViewChange}
          />
        )}
      </div>

      <div className="kadastr-status-content">
        {/* Conditional Rendering based on viewMode */}
        {viewMode === "table" ? (
          <>
            <div className="kadastr-table-topbar">
              <div className="kadastr-table-top-label">{tableTitle}</div>
              {host.renderViewModeToggle("table")}
            </div>

            {/* Search actions removed by request */}

            {searchError && (
              <div className="kadastr-status-error" style={{ padding: 8 }}>
                <p>{host.localizeRuntimeMessage(searchError)}</p>
              </div>
            )}

            {/* ===================== MAIN STATE RENDER ===================== */}
            {configuredFields.length === 0 && !isInitializing ? (
              <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
                <h3>{pickLabel(GRAFF_PANEL_MESSAGES.fieldsRequiredTitle, language)}</h3>
                <p>{pickLabel(GRAFF_PANEL_MESSAGES.fieldsRequiredHint, language)}</p>
              </div>
            ) : isInitializing ? (
              <div className="kadastr-status-loading-container">
                <AgriChartLoader />
              </div>
            ) : connectionStatus === "failed" ? (
              <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
                <p>
                  {host.localizeRuntimeMessage(error) || pickLabel(GRAFF_PANEL_MESSAGES.connectFailed, language)}
                </p>
                <button
                  onClick={host.retryMapConnection}
                  className="kadastr-status-retry-button"
                >
                  {pickLabel(GRAFF_PANEL_MESSAGES.reconnect, language)}
                </button>
              </div>
            ) : error ? (
              <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
                <p>{host.localizeRuntimeMessage(error)}</p>
                <button
                  onClick={() => {
                    void host.fetchData();
                  }}
                  className="kadastr-status-retry-button"
                >
                  {pickLabel(GRAFF_PANEL_MESSAGES.retry, language)}
                </button>
              </div>
            ) : needYear ||
              (connectionStatus === "connected" &&
                filteredRecords.length === 0 &&
                (loading || !host._hasCompletedTableFetch)) ? (
              <div className="kadastr-status-loading-container">
                <AgriChartLoader />
              </div>
            ) : connectionStatus === "connected" && loading ? (
              <div className="kadastr-status-loading-container">
                <AgriChartLoader />
              </div>
            ) : connectionStatus === "connected" &&
              !loading &&
              host._hasCompletedTableFetch &&
              filteredRecords.length === 0 ? (
              <div className="kadastr-status-no-data">
                <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
                <h3>{agriNoDataLabel(language)}</h3>
              </div>
            ) : (
              <div className="kadastr-table-frame">
                <div
                  className="kadastr-status-table-container"
                  ref={host.tableContainerRef}
                >
                <table className="kadastr-status-table">
                  <thead>
                    <tr>
                      {displayFields.map((fieldName) => {
                        const isVh = fieldName.toLowerCase() === "vh";
                        const lower = fieldName.toLowerCase();
                        let label: string;
                        if (isVh) label = vhHeaderLabel;
                        else if (lower === "tuman") label = tumanLabel;
                        else if (lower === "viloyat") label = viloyatLabel;
                        else if (lower === "region") label = regionLabel;
                        else if (lower === "district") label = districtLabel;
                        else if (lower === "yil") label = yilLabel;
                        else if (lower === "turi" || lower === "uzspace")
                          { label = turiLabel; }
                        else if (
                          lower === "shape_leng" ||
                          lower === "shape_length"
                        )
                          { label = shapeLengLabel; }
                        else if (
                          lower === "globalid_1" ||
                          lower === "globalid" ||
                          lower.startsWith("globalid")
                        )
                          { label = globalIdLabel; }
                        else if (lower === "f_name") label = fNameLabel;
                        else if (lower === "f_inn") label = fInnLabel;
                        else if (lower === "f_cad") label = fCadLabel;
                        else if (lower === "yld") label = yldLabel;
                        else if (lower === "numeric_id")
                          { label = numericIdLabel; }
                        else if (lower === "uniqueid") label = uniqueIdHeader;
                        else if (lower === "maydon") label = maydonLabel;
                        else if (
                          lower.includes("maydon") ||
                          lower.includes("area")
                        )
                          { label = maydonLabel; }
                        else if (
                          lower.includes("name") ||
                          lower.includes("nom")
                        )
                          { label = nameLabel; }
                        else label = host.getFieldDisplayName(fieldName);

                        const isMaydonSortable =
                          lower === "maydon" ||
                          lower.includes("maydon") ||
                          lower.includes("area");
                        if (isMaydonSortable) {
                          const sort = host.state.tableSort;
                          const isActive = sort?.column === "maydon";
                          const isAsc = isActive && sort?.order === "asc";
                          return (
                            <th key={fieldName}>
                              <button
                                type="button"
                                className={`kadastr-table-sort-btn${
                                  isActive
                                    ? " kadastr-table-sort-btn--active"
                                    : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  host.toggleMaydonSort();
                                }}
                                aria-label={`${label} sort`}
                              >
                                <span>{label}</span>
                                <ChevronDown
                                  className={`kadastr-table-sort-icon${
                                    isAsc
                                      ? " kadastr-table-sort-icon--asc"
                                      : ""
                                  }${
                                    !isActive
                                      ? " kadastr-table-sort-icon--off"
                                      : ""
                                  }`}
                                  strokeWidth={1.75}
                                  aria-hidden="true"
                                />
                              </button>
                            </th>
                          );
                        }

                        return <th key={fieldName}>{label}</th>;
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const recordId =
                        record.uniqueid || record.objectid?.toString();
                      const isSelected =
                        selecteduniqueid &&
                        recordId &&
                        host.recordMatchesUniqueid(record, selecteduniqueid);

                      return (
                        <tr
                          key={`${record.uniqueid || record.objectid}-${index}`}
                          data-uniqueid={recordId || undefined}
                          onClick={() =>
                            regionalInteraction &&
                            host.handleRowClick(record)
                          }
                          className={`kadastr-table-row${
                            isSelected ? " selected-row" : ""
                          }`}
                          title={
                            regionalInteraction
                              ? "Харитада кўрсатиш ва график учун танлаш"
                              : ""
                          }
                          style={{
                            cursor: regionalInteraction
                              ? "pointer"
                              : "default",
                          }}
                        >
                          {displayFields.map((fieldName) => {
                            const isVh = fieldName.toLowerCase() === "vh";
                            const rawValue = isVh
                              ? host.getStatusValueForRecord(record)
                              : record[fieldName];
                            return (
                              <td
                                key={fieldName}
                                title={host.formatFieldValue(
                                  fieldName,
                                  rawValue,
                                )}
                              >
                                <span className="kadastr-table-cell-text">
                                  {host.formatFieldValue(fieldName, rawValue)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {totalRecordCount > pageSize ? (
                  <div
                    className="contours-table__pagination"
                    aria-label="Table pagination"
                  >
                    <span className="contours-table__pagination-chip contours-table__pagination-range">
                      <span className="contours-table__pagination-label">
                        {paginationTotalLabel}
                      </span>
                      <span className="contours-table__pagination-value">
                        {totalRecordCount}
                      </span>
                    </span>
                    <div className="contours-table__pagination-actions">
                      <button
                        type="button"
                        className="contours-table__pagination-btn"
                        disabled={safePage <= 1 || loading}
                        onClick={() => { host.goToTablePage(safePage - 1); }}
                        aria-label="Previous page"
                      >
                        <ChevronLeft
                          className="contours-table__pagination-btn-icon"
                          strokeWidth={1.75}
                        />
                      </button>
                      <span className="contours-table__pagination-chip contours-table__pagination-page">
                        <span className="contours-table__pagination-label">
                          {paginationPageLabel}
                        </span>
                        <span className="contours-table__pagination-value">
                          {safePage} / {totalPages}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="contours-table__pagination-btn"
                        disabled={safePage >= totalPages || loading}
                        onClick={() => { host.goToTablePage(safePage + 1); }}
                        aria-label="Next page"
                      >
                        <ChevronRight
                          className="contours-table__pagination-btn-icon"
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>
                    <span className="contours-table__pagination-chip contours-table__pagination-size">
                      <span className="contours-table__pagination-label">
                        {paginationRowsLabel}
                      </span>
                      <span className="contours-table__pagination-value">
                        {pageSize}
                      </span>
                    </span>
                  </div>
                ) : null}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Graph View */
          <>
            {host.renderGraph()}
          </>
        )}
      </div>
    </div>
  );
}
