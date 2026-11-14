import type { GraffWidgetHost } from "../graff-host";
import { React } from "jimu-core";
import type { RecordData } from "../widget";
import { JimuMapViewComponent } from "jimu-arcgis";
import { TriangleAlert, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";
import { pickLabel } from "../../../../shared/agri-i18n";
import { GRAFF_PANEL_MESSAGES } from "./render-panel-messages";

const UNIQUE_ID_HEADER = "UID";

type Language = Parameters<typeof pickLabel>[1];

export interface HeaderLabels {
  vh: string;
  tuman: string;
  viloyat: string;
  region: string;
  district: string;
  yil: string;
  turi: string;
  maydon: string;
  name: string;
  shapeLeng: string;
  globalId: string;
  fName: string;
  fInn: string;
  fCad: string;
  yld: string;
  numericId: string;
}

export function buildHeaderLabels(language: Language): HeaderLabels {
  const pick = (m: Parameters<typeof pickLabel>[0]): string => pickLabel(m, language);
  return {
    vh: pick(GRAFF_PANEL_MESSAGES.vhHeader),
    tuman: pick(GRAFF_PANEL_MESSAGES.tuman),
    viloyat: pick(GRAFF_PANEL_MESSAGES.viloyat),
    region: pick(GRAFF_PANEL_MESSAGES.region),
    district: pick(GRAFF_PANEL_MESSAGES.district),
    yil: pick(GRAFF_PANEL_MESSAGES.yil),
    turi: pick(GRAFF_PANEL_MESSAGES.turi),
    maydon: pick(GRAFF_PANEL_MESSAGES.maydon),
    name: pick(GRAFF_PANEL_MESSAGES.name),
    shapeLeng: pick(GRAFF_PANEL_MESSAGES.shapeLeng),
    globalId: pick(GRAFF_PANEL_MESSAGES.globalId),
    fName: pick(GRAFF_PANEL_MESSAGES.fName),
    fInn: pick(GRAFF_PANEL_MESSAGES.fInn),
    fCad: pick(GRAFF_PANEL_MESSAGES.fCad),
    yld: pick(GRAFF_PANEL_MESSAGES.yld),
    numericId: pick(GRAFF_PANEL_MESSAGES.numericId),
  };
}

export function isMaydonField(lower: string): boolean {
  return lower === "maydon" || lower.includes("maydon") || lower.includes("area");
}

export function resolveHeaderLabel(
  fieldName: string,
  labels: HeaderLabels,
  getFieldDisplayName: (field: string) => string,
): string {
  const lower = fieldName.toLowerCase();
  if (lower === "vh") return labels.vh;
  if (lower === "tuman") return labels.tuman;
  if (lower === "viloyat") return labels.viloyat;
  if (lower === "region") return labels.region;
  if (lower === "district") return labels.district;
  if (lower === "yil") return labels.yil;
  if (lower === "turi" || lower === "uzspace") return labels.turi;
  if (lower === "shape_leng" || lower === "shape_length") return labels.shapeLeng;
  if (lower.startsWith("globalid")) return labels.globalId;
  if (lower === "f_name") return labels.fName;
  if (lower === "f_inn") return labels.fInn;
  if (lower === "f_cad") return labels.fCad;
  if (lower === "yld") return labels.yld;
  if (lower === "numeric_id") return labels.numericId;
  if (lower === "uniqueid") return UNIQUE_ID_HEADER;
  if (isMaydonField(lower)) return labels.maydon;
  if (lower.includes("name") || lower.includes("nom")) return labels.name;
  return getFieldDisplayName(fieldName);
}

export function HiddenMounts({ host }: { host: GraffWidgetHost }) {
  return (
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
  );
}

export function LoadingState() {
  return (
    <div className="kadastr-status-loading-container">
      <AgriChartLoader />
    </div>
  );
}

export function NoDataState({ language }: { language: Language }) {
  return (
    <div className="kadastr-status-no-data">
      <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
      <h3>{agriNoDataLabel(language)}</h3>
    </div>
  );
}

export function FieldsRequiredState({ language }: { language: Language }) {
  return (
    <div className="kadastr-status-error">
      <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
      <h3>{pickLabel(GRAFF_PANEL_MESSAGES.fieldsRequiredTitle, language)}</h3>
      <p>{pickLabel(GRAFF_PANEL_MESSAGES.fieldsRequiredHint, language)}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  buttonLabel: string;
  onRetry: () => void;
}

export function ErrorState({ message, buttonLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="kadastr-status-error">
      <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
      <p>{message}</p>
      <button onClick={onRetry} className="kadastr-status-retry-button">
        {buttonLabel}
      </button>
    </div>
  );
}

interface TableHeadProps {
  host: GraffWidgetHost;
  displayFields: string[];
  labels: HeaderLabels;
}

export function TableHead({ host, displayFields, labels }: TableHeadProps) {
  return (
    <thead>
      <tr>
        {displayFields.map((fieldName) => {
          const label = resolveHeaderLabel(fieldName, labels, host.getFieldDisplayName);
          if (!isMaydonField(fieldName.toLowerCase())) {
            return <th key={fieldName}>{label}</th>;
          }
          const sort = host.state.tableSort;
          const isActive = sort?.column === "maydon";
          const isAsc = isActive && sort?.order === "asc";
          return (
            <th key={fieldName}>
              <button
                type="button"
                className={`kadastr-table-sort-btn${isActive ? " kadastr-table-sort-btn--active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  host.toggleMaydonSort();
                }}
                aria-label={`${label} sort`}
              >
                <span>{label}</span>
                <ChevronDown
                  className={`kadastr-table-sort-icon${isAsc ? " kadastr-table-sort-icon--asc" : ""}${
                    !isActive ? " kadastr-table-sort-icon--off" : ""
                  }`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

interface TableBodyProps {
  host: GraffWidgetHost;
  displayFields: string[];
  records: RecordData[];
  selecteduniqueid: string | null | undefined;
  regionalInteraction: boolean;
}

export function TableBody({ host, displayFields, records, selecteduniqueid, regionalInteraction }: TableBodyProps) {
  return (
    <tbody>
      {records.map((record, index) => {
        const recordId = record.uniqueid || record.objectid?.toString();
        const isSelected =
          selecteduniqueid && recordId && host.recordMatchesUniqueid(record, selecteduniqueid);
        return (
          <tr
            key={`${record.uniqueid || record.objectid}-${index}`}
            data-uniqueid={recordId || undefined}
            onClick={() => regionalInteraction && host.handleRowClick(record)}
            className={`kadastr-table-row${isSelected ? " selected-row" : ""}`}
            title={regionalInteraction ? "Харитада кўрсатиш ва график учун танлаш" : ""}
            style={{ cursor: regionalInteraction ? "pointer" : "default" }}
          >
            {displayFields.map((fieldName) => {
              const isVh = fieldName.toLowerCase() === "vh";
              const rawValue = isVh ? host.getStatusValueForRecord(record) : record[fieldName];
              return (
                <td key={fieldName} title={host.formatFieldValue(fieldName, rawValue)}>
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
  );
}

interface PaginationProps {
  host: GraffWidgetHost;
  language: Language;
  totalRecordCount: number;
  pageSize: number;
  safePage: number;
  totalPages: number;
  loading: boolean;
}

export function TablePagination(props: PaginationProps) {
  const { host, language, totalRecordCount, pageSize, safePage, totalPages, loading } = props;
  const totalLabel = pickLabel(GRAFF_PANEL_MESSAGES.paginationTotal, language);
  const pageLabel = pickLabel(GRAFF_PANEL_MESSAGES.paginationPage, language);
  const rowsLabel = pickLabel(GRAFF_PANEL_MESSAGES.paginationRows, language);
  return (
    <div className="contours-table__pagination" aria-label="Table pagination">
      <span className="contours-table__pagination-chip contours-table__pagination-range">
        <span className="contours-table__pagination-label">{totalLabel}</span>
        <span className="contours-table__pagination-value">{totalRecordCount}</span>
      </span>
      <div className="contours-table__pagination-actions">
        <button
          type="button"
          className="contours-table__pagination-btn"
          disabled={safePage <= 1 || loading}
          onClick={() => { host.goToTablePage(safePage - 1); }}
          aria-label="Previous page"
        >
          <ChevronLeft className="contours-table__pagination-btn-icon" strokeWidth={1.75} />
        </button>
        <span className="contours-table__pagination-chip contours-table__pagination-page">
          <span className="contours-table__pagination-label">{pageLabel}</span>
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
          <ChevronRight className="contours-table__pagination-btn-icon" strokeWidth={1.75} />
        </button>
      </div>
      <span className="contours-table__pagination-chip contours-table__pagination-size">
        <span className="contours-table__pagination-label">{rowsLabel}</span>
        <span className="contours-table__pagination-value">{pageSize}</span>
      </span>
    </div>
  );
}
