import type { GraffWidgetHost } from "../graff-host";
import { React } from "jimu-core";
import type { RecordData } from "../widget";
import { JimuMapViewComponent } from "jimu-arcgis";
import { TriangleAlert, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { default as AgriChartLoader } from "../../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";

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
  const vhHeaderLabel =
    language === "en" ? "Status" : language === "ru"
      ? "Состояние"
      : language === "uz_lat"
        ? "Holat"
        : "Ҳолат";

  const activeFiltersLabel =
    language === "en" ? "Active filters" : language === "ru"
      ? "Активные фильтры"
      : language === "uz_lat"
        ? "Faol filtrlar"
        : "Фаол фильтрлар";

  const viloyatLabel =
    language === "en" ? "Region" : language === "ru"
      ? "Область"
      : language === "uz_lat"
        ? "Viloyat"
        : "Вилоят";
  const tumanLabel =
    language === "en" ? "District" : language === "ru" ? "Район" : language === "uz_lat" ? "Tuman" : "Туман";
  const regionLabel =
    language === "en" ? "Region" : language === "ru"
      ? "Регион"
      : language === "uz_lat"
        ? "Region"
        : "Регион";
  const districtLabel =
    language === "en" ? "District" : language === "ru" ? "Район" : language === "uz_lat" ? "Tuman" : "Туман";
  const yilLabel =
    language === "en" ? "Year" : language === "ru" ? "Год" : language === "uz_lat" ? "Yil" : "Йил";
  const turiLabel =
    language === "en" ? "Crop type" : language === "ru"
      ? "Тип посева"
      : language === "uz_lat"
        ? "Ekin turi"
        : "Экин тури";
  const vhLabel = language === "en" ? "VS" : language === "uz_lat" ? "VH" : "ВХ";
  const maydonLabel =
    language === "en" ? "Area" : language === "ru"
      ? "Площадь"
      : language === "uz_lat"
        ? "Maydon"
        : "Майдон";
  const nameLabel =
    language === "en" ? "Name" : language === "ru" ? "Имя" : language === "uz_lat" ? "Nom" : "Ном";
  const shapeLengLabel =
    language === "en" ? "Boundary length" : language === "ru"
      ? "Длина границы"
      : language === "uz_lat"
        ? "Chegara uzunligi"
        : "Чегара узунлиғи";
  const globalIdLabel =
    language === "en" ? "Global ID" : language === "ru"
      ? "Глобальный ID"
      : language === "uz_lat"
        ? "Global ID"
        : "Глобал ID";
  const fNameLabel =
    language === "en" ? "Farmer name" : language === "ru"
      ? "Название фермера"
      : language === "uz_lat"
        ? "Fermer nomi"
        : "Фермер номи";
  const fInnLabel =
    language === "en"
      ? "TIN"
      : language === "ru"
        ? "ИНН"
        : language === "uz_lat"
          ? "STIR"
          : "СТИР";
  const fCadLabel =
    language === "en" ? "Cadastral number" : language === "ru"
      ? "Кадастровый номер"
      : language === "uz_lat"
        ? "Kadastr raqami"
        : "Кадастр рақами";
  const yldLabel =
    language === "en" ? "Yield" : language === "ru"
      ? "Урожайность"
      : language === "uz_lat"
        ? "Hosildorlik"
        : "Ҳосилдорлик";
  const numericIdLabel =
    language === "en" ? "Numeric ID" : language === "ru"
      ? "Числовой ID"
      : language === "uz_lat"
        ? "Raqamli ID"
        : "Рақамли ID";
  const tableTitle =
    language === "en"
      ? "TABLE"
      : language === "ru"
        ? "ТАБЛИЦА"
        : language === "uz_lat"
          ? "JADVAL"
          : "ЖАДВАЛ";

  const uiText = (en: string, ru: string, uzLat: string, uzCyr: string) =>
    language === "en" ? en : language === "ru" ? ru : language === "uz_lat" ? uzLat : uzCyr;
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
  const paginationTotalLabel = uiText("Total", "Всего", "Jami", "Жами");
  const paginationPageLabel = uiText("Page", "Страница", "Sahifa", "Саҳифа");
  const paginationRowsLabel = uiText("Rows", "Строк", "Qator", "Қатор");

  const hasActiveSearch = isSearchActive && Boolean(searchText.trim());
  const needYear =
    connectionStatus === "connected" &&
    !regionalFilters?.yil &&
    !hasActiveSearch;
  const needViloyat = false; // republic-wide by default

  const activeFilterCount =
    Object.values(host.state.externalFilters || {}).filter(Boolean).length +
    Object.values(host.state.localFilters || {}).filter(Boolean).length +
    Object.values(regionalFilters || {}).filter(Boolean).length;

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
                <h3>{uiText("Widget fields are required", "Требуются поля виджета", "Widget maydonlari talab qilinadi", "Виджет майдонлари талаб қилинади")}</h3>
                <p>{uiText("Select widget fields in Settings.", "Выберите поля виджета в настройках.", "Widget maydonlarini sozlamalarda tanlang.", "Виджет майдонларини созламаларда танланг.")}</p>
              </div>
            ) : isInitializing ? (
              <div className="kadastr-status-loading-container">
                <AgriChartLoader />
              </div>
            ) : connectionStatus === "failed" ? (
              <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
                <p>
                  {host.localizeRuntimeMessage(error) || uiText("Could not connect to the map. Try again.", "Не удалось подключиться к карте. Попробуйте снова.", "Xaritaga ulana olmadi. Qayta urinib ko'ring.", "Харитага улана олмади. Қайта уриниб кўринг.")}
                </p>
                <button
                  onClick={host.retryMapConnection}
                  className="kadastr-status-retry-button"
                >
                  {uiText("Reconnect", "Подключиться снова", "Qayta ulanish", "Қайта уланиш")}
                </button>
              </div>
            ) : error ? (
              <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
                <p>{host.localizeRuntimeMessage(error)}</p>
                <button
                  onClick={() => void host.fetchData()}
                  className="kadastr-status-retry-button"
                >
                  {uiText("Retry", "Повторить", "Qayta urinish", "Қайта уриниш")}
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
                          label = turiLabel;
                        else if (
                          lower === "shape_leng" ||
                          lower === "shape_length"
                        )
                          label = shapeLengLabel;
                        else if (
                          lower === "globalid_1" ||
                          lower === "globalid" ||
                          lower.startsWith("globalid")
                        )
                          label = globalIdLabel;
                        else if (lower === "f_name") label = fNameLabel;
                        else if (lower === "f_inn") label = fInnLabel;
                        else if (lower === "f_cad") label = fCadLabel;
                        else if (lower === "yld") label = yldLabel;
                        else if (lower === "numeric_id")
                          label = numericIdLabel;
                        else if (lower === "uniqueid") label = uniqueIdHeader;
                        else if (lower === "maydon") label = maydonLabel;
                        else if (
                          lower.includes("maydon") ||
                          lower.includes("area")
                        )
                          label = maydonLabel;
                        else if (
                          lower.includes("name") ||
                          lower.includes("nom")
                        )
                          label = nameLabel;
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
                        onClick={() => host.goToTablePage(safePage - 1)}
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
                        onClick={() => host.goToTablePage(safePage + 1)}
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
