import { React } from "jimu-core";
import ReactDOM from "react-dom";

import type { GeoWidgetState, GraffSearchRecord } from "../../widget";

export type GraffSearchDropdownProps = Pick<
  GeoWidgetState,
  | "graffSearchShowSuggestions"
  | "graffSearchSuggestions"
  | "graffSearchLoading"
  | "graffSearchText"
  | "language"
> & {
  _graffSearchWrapRef: React.RefObject<HTMLDivElement>;
  getEffectiveViloyat: () => string;
  handleGraffSearchRowClick: (record: GraffSearchRecord) => void;
};

export const GraffSearchDropdown = (props: GraffSearchDropdownProps) => {
  const {
    graffSearchShowSuggestions,
    graffSearchSuggestions,
    graffSearchLoading,
    graffSearchText,
    language,
  } = props;

  if (!graffSearchShowSuggestions || !String(graffSearchText || "").trim()) {
    return null;
  }

  const anchor = props._graffSearchWrapRef.current;
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const noDataLabel =
    language === "en"
      ? "No data found"
      : language === "ru"
      ? "Данные не найдены"
      : language === "uz_lat"
        ? "Ma'lumot topilmadi"
        : "Маълумот топилмади";
  const loadingLabel =
    language === "en"
      ? "Searching..."
      : language === "ru"
      ? "Поиск..."
      : language === "uz_lat"
        ? "Qidirilmoqda..."
        : "Қидирилмоқда...";

  // Never wider than the search field itself.
  const dropW = Math.max(0, Math.round(rect.width));
  const left = Math.max(
    8,
    Math.min(rect.left, window.innerWidth - dropW - 8),
  );

  return ReactDOM.createPortal(
    <ul
      className="agri-v20-graff-search-dropdown agri-v20-graff-search-dropdown-floating agri-v20-floating-overlay agri-v20-graff-search-suggestions"
      role="listbox"
      style={{
        position: "fixed",
        top: rect.bottom + 8,
        left,
        width: dropW,
        maxWidth: dropW,
        zIndex: 2147483000,
      }}
    >
      {graffSearchLoading ? (
        <li
          className="agri-v20-graff-search-suggestion agri-v20-graff-search-suggestion--status"
          role="presentation"
        >
          {loadingLabel}
        </li>
      ) : graffSearchSuggestions.length === 0 ? (
        <li
          className="agri-v20-graff-search-suggestion agri-v20-graff-search-suggestion--status"
          role="presentation"
        >
          {noDataLabel}
        </li>
      ) : (
        graffSearchSuggestions.map((record, idx) => {
          const inn = String(record.f_inn || "").trim();
          const name = String(record.f_name || "").trim();
          const primaryLabel = inn || name || "—";
          const regionParts = [
            String(record.viloyat || record.region || "").trim() ||
              String(props.getEffectiveViloyat() || "").trim(),
            String(record.tuman || record.district || "").trim(),
          ].filter(Boolean);
          const geoLabel = regionParts.join(" · ");
          const rowKey = [
            String(record.f_inn || "").trim(),
            String(record.viloyat || "").trim(),
            String(record.tuman || "").trim(),
            String(idx),
          ].join("|");
          const selectLabel =
            language === "en"
              ? "Select row"
              : language === "ru"
              ? "Выбрать строку"
              : language === "uz_lat"
                ? "Qatorni tanlash"
                : "Қаторни танлаш";

          return (
            <li key={rowKey} role="presentation">
              <button
                type="button"
                role="option"
                className="agri-v20-graff-search-suggestion"
                title={selectLabel}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => props.handleGraffSearchRowClick(record)}
              >
                <span className="agri-v20-graff-search-suggestion-main">
                  <span className="agri-v20-graff-search-suggestion-inn">
                    {primaryLabel}
                  </span>
                </span>
                {geoLabel ? (
                  <span className="agri-v20-graff-search-suggestion-region">
                    {geoLabel}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })
      )}
    </ul>,
    document.body,
  );
};

